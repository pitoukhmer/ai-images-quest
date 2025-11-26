
import { MysteryReward, AppTheme, UserProfile } from "../types";

// Helper to check if user already has everything
const hasAllThemes = (user: UserProfile) => user.inventory.themes.length >= 5;
const hasAllAvatars = (user: UserProfile) => user.inventory.avatars.length >= 5;

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

  // 25% Chance for Sticker
  if (rand > 0.50) {
    const stickers = ['🦄', '🚀', '🦖', '🍕', '👾', '💎', '🌈', '🏆'];
    const sticker = stickers[Math.floor(Math.random() * stickers.length)];
    return {
      type: 'STICKER',
      value: sticker,
      label: 'New Sticker!',
      description: 'Added to your sticker collection.'
    };
  }

  // Fallback: XP Packs
  if (rand > 0.3) {
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
