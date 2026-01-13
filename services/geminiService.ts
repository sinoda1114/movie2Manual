import { GoogleGenAI, Type } from "@google/genai";
import { FrameData, GeneratedManual } from '../types';

// Initialize Gemini
// NOTE: In a real production app, ensure this key is restricted or proxied if exposed client-side.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview'; // Updated to the latest Gemini 3.0 Flash model

export const generateManualFromFrames = async (frames: FrameData[]): Promise<GeneratedManual> => {
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
      
      入力: 動画から数秒ごとに切り出されたスクリーンショットのシーケンス。
      タスク:
      1. ソフトウェア操作における明確な論理的ステップを特定してください。
      2. 変化がないフレームや単なる遷移アニメーションのフレームは無視してください。
      3. 有効なステップごとに、簡潔な「タイトル」と明確な「説明文」を日本語で記述してください。
      4. 最も重要: そのステップの視覚的状態（クリック直前や操作中など）を最もよく表している画像の 'frameIndex' (整数) を選択してください。
      5. マニュアル全体のタイトルと概要（はじめに）を作成してください。
      
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

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
            { text: promptText },
            ...imageParts
        ]
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