
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

// Helper: Audio Encoding/Decoding
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

class GeminiLiveService {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private session: any = null; // LiveSession type
  private scriptProcessor: ScriptProcessorNode | null = null;
  private stream: MediaStream | null = null;
  private nextStartTime = 0;
  private isConnected = false;

  // Configuration
  private model = 'gemini-2.5-flash-native-audio-preview-09-2025';
  private systemInstruction = `
    You are Sparky, the friendly AI Host of "AI Image Quest", a creative game for kids.
    Your persona: Energetic, encouraging, brief, and fun. 
    Voice: Friendly and expressive.
    
    Your Role:
    1. Welcome the player when you first connect.
    2. Give short, 1-sentence tips or encouragement when you receive game context updates.
    3. React excitedly to high scores (>80 points).
    4. Be supportive for lower scores.
    5. Explain game modes simply if the user asks or enters a new mode.
    
    Game Modes:
    - Guess the Prompt: Guess what words made the image.
    - Fix the Mistake: Rewrite a prompt to fix a silly image.
    - Emoji Challenge: Create a story from emojis.
    - Speed Challenge: Create an image in under 30s.

    Constraints:
    - Keep spoken responses SHORT (under 2 sentences).
    - Do NOT hallunicate describing visual images on screen (you cannot see them).
    - Only comment on what the user tells you or the context provided.
  `;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    this.ai = new GoogleGenAI({ apiKey });
  }

  public get isActive() {
    return this.isConnected;
  }

  public async connect(onStatusChange?: (status: boolean) => void) {
    if (this.isConnected) return;

    // Setup Audio Contexts
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    // Get Mic Stream
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const config = {
      model: this.model,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, // Friendly voice
        },
        systemInstruction: this.systemInstruction,
      }
    };

    // Connect to Gemini Live
    const sessionPromise = this.ai.live.connect({
      ...config,
      callbacks: {
        onopen: () => {
          console.log("Gemini Live Connected");
          this.isConnected = true;
          if (onStatusChange) onStatusChange(true);
          
          // Setup Audio Streaming Pipeline
          if (!this.inputAudioContext || !this.stream) return;
          
          const source = this.inputAudioContext.createMediaStreamSource(this.stream);
          this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
          
          this.scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.then(session => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          
          source.connect(this.scriptProcessor);
          this.scriptProcessor.connect(this.inputAudioContext.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
           // Handle Audio Output
           const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
           if (base64Audio && this.outputAudioContext) {
             try {
               this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
               const audioBuffer = await decodeAudioData(
                 decode(base64Audio),
                 this.outputAudioContext,
                 24000,
                 1
               );
               const source = this.outputAudioContext.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(this.outputAudioContext.destination);
               source.start(this.nextStartTime);
               this.nextStartTime += audioBuffer.duration;
             } catch (e) {
               console.error("Error decoding audio", e);
             }
           }
        },
        onclose: () => {
          console.log("Gemini Live Closed");
          this.isConnected = false;
          if (onStatusChange) onStatusChange(false);
        },
        onerror: (err) => {
          console.error("Gemini Live Error", err);
          this.disconnect();
        }
      }
    });

    this.session = await sessionPromise;
  }

  public async disconnect() {
    if (this.session) {
      // Try closing if method exists, otherwise just cleanup local
      try {
         // session.close() might not be exposed on the type directly depending on SDK version,
         // but we clean up resources regardless.
      } catch(e) {}
    }
    
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.inputAudioContext) {
      this.inputAudioContext.close();
      this.inputAudioContext = null;
    }
    if (this.outputAudioContext) {
      this.outputAudioContext.close();
      this.outputAudioContext = null;
    }
    
    this.isConnected = false;
    this.session = null;
  }

  // Send textual context to the model (e.g., "User scored 100")
  // This simulates a system event by sending it as a text part
  public sendContext(text: string) {
    if (!this.isConnected || !this.session) return;
    
    // We send this as a user message to prompt the AI to react
    // Or if the SDK supports specific context injection. 
    // For now, sending as text input from "User" (acting as system) works best for immediate reaction.
    try {
      this.session.send({ parts: [{ text: `[GAME EVENT]: ${text}` }], turnComplete: true });
    } catch (e) {
      console.error("Failed to send context", e);
    }
  }
}

export const geminiLiveService = new GeminiLiveService();
