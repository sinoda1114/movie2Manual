import { GoogleGenAI, Type } from "@google/genai";
import { FrameData, GeneratedManual } from '../types';

// Initialize Gemini
// NOTE: In a real production app, ensure this key is restricted or proxied if exposed client-side.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview'; // Updated to the latest Gemini 3.0 Flash model

export const generateManualFromFrames = async (
  frames: FrameData[], 
  audioBase64?: string | null
): Promise<GeneratedManual> => {
  try {
    // 1. Prepare parts. We can't send UNLIMITED frames.
    // Gemini 1.5/2.5/3.0 has a huge context window (1M+ tokens), so sending 20-50 images is generally fine.
    // However, strictly for performance, let's ensure we don't send duplicates if the screen hasn't changed?
    // For this MVP, we send the sampled frames directly. 
    
    // Convert base64 data URLs to inlineData parts
    const imageParts = frames.map(frame => {
      // data:image/jpeg;base64,......
      const base64Data = frame.dataUrl.split(',')[1];
      return {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      };
    });

    const promptText = `
      あなたは画面収録動画から「操作マニュアル」を作成する熟練したテクニカルライターです。
      
      入力: 動画から数秒ごとに切り出されたスクリーンショットのシーケンス${audioBase64 ? 'と、動画の音声トラック' : ''}。
      
      重要な方針: このマニュアルは初心者でも完璧に再現できるよう、すべての操作を詳細に記録する必要があります。
      
      タスク:
      1. 画面の変化やユーザー操作を注意深く観察し、すべての操作ステップを詳細に抽出してください。${audioBase64 ? '音声の説明やナレーションも参考にして、操作の意図や目的をより正確に理解してください。' : ''}
      2. 各ユーザー操作（クリック、入力、選択、ナビゲーション、ボタン押下など）を個別のステップとして記録してください。小さな操作でも統合せず、それぞれを独立したステップにしてください。
      3. 画面が完全に静止しているフレーム（数秒間変化がない場合）のみを無視してください。遷移アニメーション中や操作中のフレームは必ず含めてください。
      4. 各ステップについて、以下の情報を提供してください:
         - 簡潔で明確な「タイトル」（例：「ログインボタンをクリック」「ユーザー名を入力」）
         - 詳細な「説明文」（何を、どこで、どのように操作するかを具体的に記述。${audioBase64 ? '音声の説明がある場合は、それも参考にしてください。' : ''}）
         - そのステップを最もよく表す画像の 'frameIndex'（クリック直前、入力中、結果表示など、操作の状態が明確に分かるフレームを選択）
      5. マニュアル全体のタイトルと概要（はじめに）を作成してください。${audioBase64 ? '音声の説明を参考にして、より正確で詳細な概要を作成してください。' : ''}
      
      注意: ステップ数を減らすために操作を統合しないでください。ユーザーが行うすべての操作を個別のステップとして記録することが重要です。
      
      有効なJSONのみを返してください。
    `;

    // Define the schema for structured output
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "マニュアル全体のタイトル" },
        overview: { type: Type.STRING, description: "プロセスの概要や目的（はじめに）" },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "操作のタイトル（例：「設定をクリック」）" },
              description: { type: Type.STRING, description: "詳細な指示（例：「右上の歯車アイコンを探してクリックします。」）" },
              frameIndex: { type: Type.INTEGER, description: "このステップを最もよく表す入力画像のインデックス" }
            },
            required: ["title", "description", "frameIndex"]
          }
        }
      },
      required: ["title", "overview", "steps"]
    };

    // Prepare parts array with text, images, and optionally audio
    const parts: any[] = [
      { text: promptText },
      ...imageParts
    ];

    // Add audio if available
    if (audioBase64) {
      // Determine MIME type (default to webm, but could be detected from file)
      // For now, we'll use audio/webm as that's what MediaRecorder typically produces
      parts.push({
        inlineData: {
          mimeType: 'audio/webm', // MediaRecorder typically produces webm
          data: audioBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "あなたはプロフェッショナルなドキュメント作成アシスタントです。清潔で分かりやすく、役に立つ日本語のテキストを出力してください。",
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as GeneratedManual;
      return data;
    } else {
      throw new Error("Geminiからテキストが返されませんでした");
    }

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};