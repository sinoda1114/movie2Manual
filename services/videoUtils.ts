import { FrameData } from '../types';

// Extract one frame every N seconds
const SAMPLE_INTERVAL_SECONDS = 2.5; 
// Max resolution for frames to save tokens and bandwidth (Gemini vision handles 720p/1080p well, but 512px height is often enough for UI buttons)
const MAX_HEIGHT = 720; 
const JPEG_QUALITY = 0.6;

/**
 * Extracts audio from a video file and converts it to base64-encoded audio format.
 * Uses MediaRecorder API to capture audio from video playback.
 * Returns null if audio extraction fails or video has no audio track.
 */
export const extractAudioFromVideo = async (videoFile: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(videoFile);

    video.src = url;
    video.muted = false;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    video.onloadedmetadata = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaElementSource(video);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        source.connect(audioContext.destination);

        // Check available MIME types for MediaRecorder
        const mimeTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4',
        ];
        
        let selectedMimeType = '';
        for (const mimeType of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            selectedMimeType = mimeType;
            break;
          }
        }

        if (!selectedMimeType) {
          URL.revokeObjectURL(url);
          resolve(null); // No supported audio format
          return;
        }

        const mediaRecorder = new MediaRecorder(destination.stream, {
          mimeType: selectedMimeType
        });

        const audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          try {
            const audioBlob = new Blob(audioChunks, { type: selectedMimeType });
            
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Audio = reader.result as string;
              URL.revokeObjectURL(url);
              audioContext.close();
              // Return base64 without data URI prefix, and include mime type info
              const base64Data = base64Audio.split(',')[1];
              resolve(base64Data);
            };
            reader.onerror = () => {
              URL.revokeObjectURL(url);
              audioContext.close();
              resolve(null);
            };
            reader.readAsDataURL(audioBlob);
          } catch (error) {
            URL.revokeObjectURL(url);
            resolve(null);
          }
        };

        mediaRecorder.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };

        // Start recording
        mediaRecorder.start();
        
        // Play video to capture audio (silently)
        video.volume = 0; // Silent playback
        video.play().then(() => {
          video.onended = () => {
            setTimeout(() => {
              mediaRecorder.stop();
            }, 100); // Small delay to ensure last chunk is captured
          };
        }).catch(() => {
          // If play fails, stop recording and return null
          mediaRecorder.stop();
        });

        // Safety timeout
        setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, (video.duration + 5) * 1000); // Video duration + 5 seconds buffer

      } catch (error) {
        URL.revokeObjectURL(url);
        resolve(null); // Return null if extraction fails
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    video.load();
  });
};


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