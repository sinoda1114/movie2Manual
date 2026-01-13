import { FrameData } from '../types';

// Extract one frame every N seconds
const SAMPLE_INTERVAL_SECONDS = 2.5; 
// Max resolution for frames to save tokens and bandwidth (Gemini vision handles 720p/1080p well, but 512px height is often enough for UI buttons)
const MAX_HEIGHT = 720; 
const JPEG_QUALITY = 0.6;

/**
 * Extracts frames from a video file completely client-side.
 * This avoids uploading heavy video files to a server, relying instead on sending
 * a sequence of images to the multimodal LLM.
 */
export const extractFramesFromVideo = async (
  videoFile: File,
  onProgress: (percent: number) => void
): Promise<FrameData[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: FrameData[] = [];
    const url = URL.createObjectURL(videoFile);

    if (!ctx) {
      reject(new Error('Canvasコンテキストを作成できませんでした'));
      return;
    }

    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    // Helper to snap a photo
    const captureFrame = (time: number, index: number) => {
      // maintain aspect ratio
      const scale = Math.min(1, MAX_HEIGHT / video.videoHeight);
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    };

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      let currentTime = 0;
      let frameIndex = 0;

      // We will seek through the video
      const processNextFrame = () => {
        if (currentTime > duration) {
          // Done
          URL.revokeObjectURL(url);
          resolve(frames);
          return;
        }

        // Update progress
        const percent = Math.min(100, Math.round((currentTime / duration) * 100));
        onProgress(percent);

        video.currentTime = currentTime;
      };

      video.onseeked = () => {
        const dataUrl = captureFrame(currentTime, frameIndex);
        // Only keep frames that might be useful? 
        // For now, we keep all sampled frames to let AI decide context.
        frames.push({
          time: currentTime,
          dataUrl,
          index: frameIndex
        });

        currentTime += SAMPLE_INTERVAL_SECONDS;
        frameIndex++;
        processNextFrame();
      };

      video.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(new Error('動画ファイルの処理中にエラーが発生しました'));
      };

      // Start the loop
      processNextFrame();
    };

    video.load();
  });
};