
import { MysteryReward, AppTheme, UserProfile, GameMode } from "../types";

// Helper to check if user already has everything
const hasAllThemes = (user: UserProfile) => user.inventory.themes.length >= 5;
const hasAllAvatars = (user: UserProfile) => user.inventory.avatars.length >= 5;

export const getRandomTip = (mode: GameMode): string => {
  const commonTips = [
    "Tip: Use specific colors like 'neon blue' or 'pastel pink'.",
    "Tip: Mention the lighting! Try 'sunset lighting' or 'cinematic light'.",
    "Tip: Add a style! Try 'pixel art', 'oil painting', or '3D render'.",
    "Tip: Describe the background. Is it a forest, space, or a city?",
    "Tip: Use adjectives! 'Fluffy cat' is better than just 'cat'.",
  ];
  
  const modeTips: Record<string, string[]> = {
    [GameMode.GUESS_PROMPT]: [
      "Tip: Look at the background details!",
      "Tip: Identify the main character first.",
      "Tip: Are there any unique objects in the scene?",
      "Tip: What art style is being used?",
    ],
    [GameMode.DAILY_CHALLENGE]: [
      "Tip: Look at the background details!",
      "Tip: Identify the main character first.",
    ],
    [GameMode.FIX_MISTAKE]: [
      "Tip: Tell the AI exactly what to remove.",
      "Tip: Be very specific about the fix.",
      "Tip: If the color is wrong, specify the correct color.",
      "Tip: Focus on the part that looks weird.",
    ],
    [GameMode.EMOJI_CHALLENGE]: [
      "Tip: Connect the emojis into a single scene.",
      "Tip: Be creative! How do these emojis interact?",
      "Tip: Create a short story using the emojis.",
    ],
    [GameMode.FASTEST_CHALLENGE]: [
      "Tip: Short sentences work best for speed!",
      "Tip: Don't worry about perfection, just go fast!",
      "Tip: Use simple subjects and actions.",
    ]
  };

  // Default to common tips if mode undefined
  const specificTips = modeTips[mode] || [];
  const pool = [...commonTips, ...specificTips];
  return pool[Math.floor(Math.random() * pool.length)];
};

export const openMysteryBox = (user: UserProfile): MysteryReward => {
  const rand = Math.random();
  
  // 10% Chance for Theme (if not unlocked)
  if (rand > 0.90 && !hasAllThemes(user)) {
    // Pick a theme they don't have
    const allThemes = [AppTheme.RAINBOW, AppTheme.GALAXY];
    const missing = allThemes.filter(t => !user.inventory.themes.includes(t));
    
    if (missing.length > 0) {
      const newTheme = missing[0];
      return {
        type: 'THEME',
        value: newTheme,
        label: newTheme === AppTheme.RAINBOW ? 'Rainbow Theme!' : 'Galaxy Theme!',
        description: 'A brand new colorful look for the app.'
      };
    }
  }

  // 15% Chance for Avatar Skin (if not unlocked)
  if (rand > 0.75 && !hasAllAvatars(user)) {
     const allAvatars = ['bottts', 'fun-emoji', 'lorelei', 'notionists'];
     const missing = allAvatars.filter(a => !user.inventory.avatars.includes(a));
     
     if (missing.length > 0) {
       const newAvatar = missing[Math.floor(Math.random() * missing.length)];
       return {
         type: 'AVATAR',
         value: newAvatar,
         label: 'New Avatar Style!',
         description: `Unlocked the ${newAvatar} character pack.`
       };
     }
  }

  // 30% Chance for Sticker (Expanded Pool)
  if (rand > 0.45) {
    const stickers = [
      '🦄', '🚀', '🦖', '🍕', '👾', '💎', '🌈', '🏆', 
      '🎮', '🤖', '🎨', '🍭', '🐉', '🌟', '⚡', '🎁',
      '🐱', '🐶', '🐵', '🦊', '🦁', '🐯', '🐮', '🐷'
    ];
    const sticker = stickers[Math.floor(Math.random() * stickers.length)];
    return {
      type: 'STICKER',
      value: sticker,
      label: 'New Sticker!',
      description: 'Added to your sticker collection.'
    };
  }

  // Fallback: XP Packs
  if (rand > 0.2) {
    return { 
      type: 'XP', 
      value: 200, 
      label: 'Big Brain Pack', 
      description: 'A shiny bundle of 200 XP.' 
    };
  }

  return { 
    type: 'XP', 
    value: 50, 
    label: 'Bonus Stars', 
    description: 'A nice little 50 XP boost.' 
  };
};
