
import { GoogleGenAI, Type } from "@google/genai";

export const handler = async (event: any) => {
  // 仅允许 POST 请求
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt, voxelCount, language } = JSON.parse(event.body);

    // 在服务端初始化 AI，这里使用的 process.env.API_KEY 存储在 Netlify 后台
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = language === 'zh' 
        ? `你是一个3D体素艺术家。请根据提示语 "${prompt}" 生成一个3D模型。我有正好 ${voxelCount} 个橘子。请仅返回包含 {x, y, z} 坐标的 JSON 数组。`
        : `You are a 3D voxel artist. Generate a model for: "${prompt}". I have exactly ${voxelCount} oranges. Return ONLY a JSON array of {x, y, z} coordinates.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: systemInstruction,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        x: { type: Type.INTEGER },
                        y: { type: Type.INTEGER },
                        z: { type: Type.INTEGER }
                    },
                    required: ["x", "y", "z"]
                }
            }
        }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: response.text || "[]",
    };
  } catch (error: any) {
    console.error("API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
