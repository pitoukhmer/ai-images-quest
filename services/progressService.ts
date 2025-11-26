
import { UserProfile, AppTheme, MysteryReward } from '../types';

const STORAGE_KEY = 'ai_quest_user_v3';

const DEFAULT_USER: UserProfile = {
  name: "Explorer",
  avatarStyle: "avataaars",
  totalScore: 0,
  xp: 0,
  level: 1,
  streak: {
    current: 0,
    lastLoginDate: '',
    frozen: false
  },
  inventory: {
    themes: [AppTheme.SKY, AppTheme.MINT, AppTheme.PURPLE],
    avatars: ['avataaars'],
    stickers: []
  }
};

export const getXpForLevel = (level: number) => {
  return level * 100 + (level * level * 10);
};

export const loadUserProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with default to ensure new inventory fields exist
      return { 
        ...DEFAULT_USER, 
        ...parsed, 
        inventory: { ...DEFAULT_USER.inventory, ...(parsed.inventory || {}) } 
      }; 
    }
  } catch (e) {
    console.error("Failed to load user", e);
  }
  return DEFAULT_USER;
};

export const saveUserProfile = (user: UserProfile) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save user", e);
  }
};

export const addXpToUser = (user: UserProfile, amount: number): { user: UserProfile, leveledUp: boolean } => {
  let newXp = user.xp + amount;
  let newLevel = user.level;
  let leveledUp = false;

  while (newLevel < 50 && newXp >= getXpForLevel(newLevel)) {
    newXp -= getXpForLevel(newLevel);
    newLevel++;
    leveledUp = true;
  }

  const updatedUser = { ...user, xp: newXp, level: newLevel, totalScore: user.totalScore + amount };
  saveUserProfile(updatedUser);
  return { user: updatedUser, leveledUp };
};

export const checkDailyStreak = (user: UserProfile): { user: UserProfile, streakBonus: boolean } => {
  const today = new Date().toISOString().split('T')[0];
  
  if (user.streak.lastLoginDate === today) return { user, streakBonus: false };

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];
  
  let newStreak = user.streak.current;
  let usedFreeze = false;
  
  if (user.streak.lastLoginDate === yesterday) {
    newStreak++;
  } else if (user.streak.lastLoginDate !== '') {
    if (user.streak.frozen) {
      usedFreeze = true;
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const updatedUser = {
    ...user,
    streak: {
      current: newStreak,
      lastLoginDate: today,
      frozen: usedFreeze ? false : user.streak.frozen
    }
  };
  
  saveUserProfile(updatedUser);
  return { user: updatedUser, streakBonus: true };
};

export const unlockReward = (user: UserProfile, reward: MysteryReward): UserProfile => {
  let updatedUser = { ...user };

  if (reward.type === 'XP') {
    // XP is handled by addXpToUser, but we return the user structure here for consistency if needed
    // Usually the caller will handle XP separate, but inventory items happen here
  } else if (reward.type === 'THEME') {
    const theme = reward.value as AppTheme;
    if (!user.inventory.themes.includes(theme)) {
      updatedUser.inventory = {
        ...user.inventory,
        themes: [...user.inventory.themes, theme]
      };
    }
  } else if (reward.type === 'AVATAR') {
    const style = reward.value as string;
    if (!user.inventory.avatars.includes(style)) {
      updatedUser.inventory = {
        ...user.inventory,
        avatars: [...user.inventory.avatars, style]
      };
    }
  } else if (reward.type === 'STICKER') {
    const sticker = reward.value as string;
    if (!user.inventory.stickers.includes(sticker)) {
      updatedUser.inventory = {
        ...user.inventory,
        stickers: [...user.inventory.stickers, sticker]
      };
    }
  }

  saveUserProfile(updatedUser);
  return updatedUser;
};

export const getDailyChallengePrompt = (): string => {
  const prompts = [
    "A futuristic city made of candy canes and chocolate rivers",
    "A dragon reading a book in a cozy library",
    "A robot gardener watering metal flowers with oil",
    "A cat astronaut floating near Mars chasing a laser pointer",
    "A giant castle built on top of a fluffy white cloud",
    "A penguin wearing a tuxedo at a fancy dinner party",
    "A bicycle with square wheels riding on a rainbow road",
  ];
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return prompts[day % prompts.length];
};

export const hasCompletedDailyChallenge = (): boolean => {
   const lastPlay = localStorage.getItem('ai_quest_daily_played');
   const today = new Date().toISOString().split('T')[0];
   return lastPlay === today;
};

export const markDailyChallengeComplete = () => {
   const today = new Date().toISOString().split('T')[0];
   localStorage.setItem('ai_quest_daily_played', today);
};
