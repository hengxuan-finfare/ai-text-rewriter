import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";
const SYSTEM_PROMPT = `You are a professional writing assistant. Your task is to rewrite the user's text to make it:
- Clear and concise
- Professional and polished
- Grammatically correct
- Well-structured
- Engaging and easy to read

Maintain the original meaning and tone unless a specific tone is requested. Do not add extra information or change the core message. Just return the rewritten text without any preamble or explanation.`;
export async function rewriteWithGemini(text, apiKey, tone) {
    if (!apiKey) {
        throw new Error('Gemini API key not configured');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp"
    });
    const toneInstruction = tone ? `\nTone requirement: ${tone}` : '';
    const fullPrompt = `${SYSTEM_PROMPT}${toneInstruction}\n\nText to rewrite:\n${text}\n\nRewritten text:`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text().trim();
    if (!responseText) {
        throw new Error('No response generated from Gemini');
    }
    return { responseText, fullPrompt };
}
