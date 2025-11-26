import { GoogleGenAI, Type } from "@google/genai";
import { EvaluationResult, GeneratedImageResult } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

// Generate an image using Imagen 3/4
export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
  const ai = getAI();
  try {
    // Using imagen-4.0-generate-001 as requested for high quality
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) throw new Error("No image generated");
    
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Image generation failed", error);
    throw new Error("Oops! The AI had trouble drawing that. Try a different prompt!");
  }
};

// Generate a random safe prompt for the "Guess the Prompt" game
export const generateRandomPrompt = async (): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a creative, kid-friendly, visual description for an image generation prompt. It should be distinct and describe a scene, object, or character. Keep it under 20 words. Example: 'A robot baking a giant chocolate cake in space.'",
      config: {
        systemInstruction: "You are a playful game master for kids. Safe content only.",
      }
    });
    return response.text?.trim() || "A happy puppy playing with a red ball";
  } catch (e) {
    return "A magical castle on a cloud";
  }
};

// Generate a "broken" prompt concept for "Fix the Mistake"
export const generateMistakeScenario = async (): Promise<{ scenario: string, brokenPrompt: string }> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Create a funny scenario where an image prompt might go wrong or describe something impossible/silly. Return JSON.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario: { type: Type.STRING, description: "Instructions for the kid, e.g., 'I wanted a car, but it has square wheels!'" },
            brokenPrompt: { type: Type.STRING, description: "The prompt that generates the silly image, e.g., 'A racecar with square wheels made of cheese'" }
          },
          required: ["scenario", "brokenPrompt"]
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { 
      scenario: "I asked for a cat, but it's green!", 
      brokenPrompt: "A bright green cat eating a salad" 
    };
  }
};

// Evaluate the user's guess or submission
export const evaluateSubmission = async (
  mode: string, 
  target: string, 
  userInput: string
): Promise<EvaluationResult> => {
  const ai = getAI();
  
  let prompt = "";
  
  if (mode === 'GUESS_PROMPT') {
    prompt = `
      Game: Guess the Prompt.
      Original Prompt: "${target}"
      User Guess: "${userInput}"
      
      Task: Rate how close the user's guess is to the original prompt's meaning.
      Score from 0 to 100.
      Provide short, encouraging feedback for a child.
    `;
  } else if (mode === 'FIX_MISTAKE') {
    prompt = `
      Game: Fix the AI Mistake.
      Broken Concept: "${target}"
      User Fix: "${userInput}"
      
      Task: Did the user fix the logical error? Is it a better image prompt?
      Score from 0 to 100.
      Provide short feedback.
    `;
  } else if (mode === 'EMOJI') {
     prompt = `
      Game: Emoji Challenge.
      Emojis provided: "${target}"
      User Story/Prompt: "${userInput}"
      
      Task: Did the user incorporate the emojis creatively into a prompt?
      Score from 0 to 100 based on creativity and relevance.
      Provide short feedback.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
          },
          required: ["score", "feedback"]
        }
      }
    });
    return JSON.parse(response.text || '{"score": 0, "feedback": "Try again!"}');
  } catch (e) {
    console.error("Evaluation error", e);
    return { score: 50, feedback: "Good effort! The AI is having trouble scoring right now." };
  }
};

// Generate a creative username and avatar style
export const generateGamerProfile = async (): Promise<{ name: string, style: string }> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a creative, fun, kid-friendly gamer username (max 12 chars) and pick one avatar style from this list: ['avataaars', 'bottts', 'fun-emoji', 'lorelei', 'notionists']. Return JSON.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            username: { type: Type.STRING },
            style: { type: Type.STRING, enum: ['avataaars', 'bottts', 'fun-emoji', 'lorelei', 'notionists'] }
          },
          required: ["username", "style"]
        }
      }
    });
    const data = JSON.parse(response.text || "{}");
    return { 
      name: data.username || "Explorer", 
      style: data.style || "avataaars" 
    };
  } catch (e) {
    const randomNames = ['Sparky', 'Pixel', 'Glitch', 'Nova', 'Cosmo'];
    return { 
      name: randomNames[Math.floor(Math.random() * randomNames.length)], 
      style: "avataaars" 
    };
  }
};

export const generateEmojis = (): string[] => {
  const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🦄', '🚀', '🌈', '🍕', '🍦', '🎨', '🎸', '🏝️', '🏰', '🐲', '🤠', '👽', '🤖'];
  const shuffled = emojis.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};