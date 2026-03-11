
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInheritanceAdvice = async (current: string, target: string, factors: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User is playing Uma Musume Pretty Derby. 
      Their horse aptitude is currently ${current} and they want to upgrade it to ${target}. 
      They need ${factors} factors. 
      Give 3-4 short, professional bullet points in Chinese on how to achieve this effectively using 9-star factors, 
      the importance of red factors (inheritance), and tips for selecting parents/grandparents.`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "无法获取AI建议，请检查网络连接。";
  }
};
