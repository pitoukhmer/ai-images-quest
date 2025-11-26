
export enum GameMode {
  MENU = 'MENU',
  GUESS_PROMPT = 'GUESS_PROMPT',
  FIX_MISTAKE = 'FIX_MISTAKE',
  EMOJI_CHALLENGE = 'EMOJI_CHALLENGE',
  FASTEST_CHALLENGE = 'FASTEST_CHALLENGE',
  DAILY_CHALLENGE = 'DAILY_CHALLENGE',
}

export enum AppTheme {
  SKY = 'SKY',
  MINT = 'MINT',
  PURPLE = 'PURPLE',
  RAINBOW = 'RAINBOW', // New Unlockable
  GALAXY = 'GALAXY',   // New Unlockable
}

export interface UserProfile {
  name: string;
  avatarStyle: string;
  totalScore: number;
  xp: number;
  level: number;
  streak: {
    current: number;
    lastLoginDate: string;
    frozen: boolean;
  };
  inventory: {
    themes: AppTheme[];
    avatars: string[]; // list of unlocked dicebear styles
    stickers: string[]; // list of emojis collected
  };
}

export interface GameState {
  currentMode: GameMode;
  score: number;
  round: number;
  isLoading: boolean;
  loadingMessage: string;
  currentImage: string | null;
  currentPrompt: string | null;
  targetPrompt: string | null;
  feedback: string | null;
  history: HistoryItem[];
}

export interface HistoryItem {
  id: string;
  mode: GameMode;
  imageUrl: string;
  prompt: string;
  score: number;
  timestamp: number;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  creativity?: number;
  accuracy?: number;
}

export interface GeneratedImageResult {
  imageUrl: string;
  prompt: string;
}

export interface PeerStream {
  id: string;
  stream: MediaStream;
  isSelf: boolean;
}

export interface MysteryReward {
  type: 'XP' | 'THEME' | 'AVATAR' | 'STICKER';
  value: string | number;
  label: string;
  description: string;
}
