
import React, { useState } from 'react';
import { AppTheme, UserProfile } from '../types';
import { User, Star, Trophy, Palette, Edit2, X, Check, RefreshCw, Sparkles, Lock } from 'lucide-react';
import { Button, Input } from './Shared';
import { playSound } from '../services/soundService';
import { generateGamerProfile } from '../services/geminiService';
import { AIHost } from './AIHost';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile;
  onThemeChange: (theme: AppTheme) => void;
  onUpdateUser: (user: UserProfile) => void;
  theme: AppTheme;
}

const AVATAR_STYLES = [
  { id: 'avataaars', name: 'People' },
  { id: 'bottts', name: 'Robots' },
  { id: 'fun-emoji', name: 'Emojis' },
  { id: 'lorelei', name: 'Cartoons' },
  { id: 'notionists', name: 'Sketches' },
];

export const Layout: React.FC<LayoutProps> = ({ children, user, theme, onThemeChange, onUpdateUser }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [tempStyle, setTempStyle] = useState(user.avatarStyle);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);

  const getThemeStyles = () => {
    switch (theme) {
      case AppTheme.MINT: return 'bg-emerald-50';
      case AppTheme.PURPLE: return 'bg-purple-50';
      case AppTheme.RAINBOW: return 'bg-gradient-to-br from-pink-100 via-yellow-100 to-sky-100';
      case AppTheme.GALAXY: return 'bg-slate-900 text-white';
      default: return 'bg-sky-50';
    }
  };

  const getHeaderColor = () => {
    switch (theme) {
      case AppTheme.MINT: return 'bg-emerald-500';
      case AppTheme.PURPLE: return 'bg-purple-500';
      case AppTheme.RAINBOW: return 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500';
      case AppTheme.GALAXY: return 'bg-slate-800 border-b border-slate-700';
      default: return 'bg-sky-500';
    }
  };

  const isDarkTheme = theme === AppTheme.GALAXY;

  const handleSaveProfile = () => {
    if (tempName.trim()) {
      onUpdateUser({ ...user, name: tempName, avatarStyle: tempStyle });
      setIsProfileOpen(false);
      playSound('success');
    }
  };

  const handleAIGenerate = async () => {
    setIsGeneratingProfile(true);
    playSound('click');
    try {
      const profile = await generateGamerProfile();
      setTempName(profile.name);
      // Only set style if unlocked
      if (user.inventory.avatars.includes(profile.style)) {
        setTempStyle(profile.style);
      }
      playSound('pop');
    } catch (e) {
      setTempName("Cosmo");
    } finally {
      setIsGeneratingProfile(false);
    }
  };

  return (
    <div className={`min-h-screen ${getThemeStyles()} transition-colors duration-500 flex flex-col`}>
      {/* HEADER */}
      <header className={`${getHeaderColor()} text-white shadow-lg sticky top-0 z-40 transition-all duration-500`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-white/20 p-2 rounded-xl">
              <Palette size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight hidden sm:block">AI Image Quest</h1>
              <p className={`text-xs opacity-90 font-medium hidden sm:block ${isDarkTheme ? 'text-slate-300' : ''}`}>Create. Guess. Learn.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:block">
               <AIHost />
             </div>

             {/* Theme Toggles - Only show unlocked */}
             <div className={`hidden md:flex ${isDarkTheme ? 'bg-white/10' : 'bg-black/10'} rounded-full p-1`}>
              {[
                { t: AppTheme.SKY, c: 'bg-sky-400' },
                { t: AppTheme.MINT, c: 'bg-emerald-400' },
                { t: AppTheme.PURPLE, c: 'bg-purple-400' },
                { t: AppTheme.RAINBOW, c: 'bg-gradient-to-br from-pink-400 to-yellow-400' },
                { t: AppTheme.GALAXY, c: 'bg-slate-800 border border-white/30' }
              ].map((item) => {
                const isUnlocked = user.inventory.themes.includes(item.t);
                if (!isUnlocked) return null;
                return (
                  <button
                    key={item.t}
                    onClick={() => { onThemeChange(item.t); playSound('click'); }}
                    className={`w-6 h-6 rounded-full ${item.c} m-1 border-2 ${theme === item.t ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70'} transition-all`}
                  />
                );
              })}
            </div>

            <div 
              className={`flex items-center gap-3 ${isDarkTheme ? 'bg-white/10 border-white/20' : 'bg-black/10 border-white/10'} pl-4 pr-2 py-1.5 rounded-full cursor-pointer hover:bg-opacity-30 transition-colors border`}
              onClick={() => { setIsProfileOpen(true); playSound('click'); }}
            >
              <div className="flex items-center gap-1 mr-2">
                 <Trophy size={18} className="text-yellow-300" />
                 <span className="font-bold">{user.totalScore}</span>
              </div>
              <div className="w-px h-4 bg-white/30 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="font-bold hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                <div className="w-8 h-8 bg-white rounded-full overflow-hidden border-2 border-white relative group">
                   <img src={`https://api.dicebear.com/9.x/${user.avatarStyle}/svg?seed=${user.name}`} alt="avatar" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Edit2 size={12} className="text-white" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow px-4 py-8 relative z-0">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* FOOTER */}
      <footer className={`${isDarkTheme ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-gray-200 text-gray-500'} border-t py-6 mt-8`}>
        <div className="max-w-6xl mx-auto px-4 text-center text-sm font-medium">
          <p>© {new Date().getFullYear()} AI Image Quest.</p>
          <p className="mt-1 text-xs opacity-70">Safe for Kids • Powered by Google Gemini</p>
        </div>
      </footer>

      {/* PROFILE EDITOR */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Customize Profile</h3>
              <button onClick={() => setIsProfileOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-100 rounded-full border-4 border-sky-100 shadow-inner mb-4 overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/9.x/${tempStyle}/svg?seed=${tempName}`} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={handleAIGenerate} 
                  disabled={isGeneratingProfile}
                  icon={<Sparkles size={14} className={isGeneratingProfile ? "animate-spin" : "text-purple-500"} />}
                >
                  {isGeneratingProfile ? "Generating..." : "AI Generate Identity"}
                </Button>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Your Name</label>
                <Input 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={15}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Avatar Style</label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATAR_STYLES.map((style) => {
                    const isUnlocked = user.inventory.avatars.includes(style.id);
                    return (
                      <button
                        key={style.id}
                        onClick={() => { if(isUnlocked) { setTempStyle(style.id); playSound('pop'); } }}
                        disabled={!isUnlocked}
                        className={`relative rounded-xl p-1 border-2 transition-all aspect-square flex flex-col items-center justify-center overflow-hidden ${tempStyle === style.id ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200' : 'border-gray-200'} ${!isUnlocked ? 'opacity-50 grayscale cursor-not-allowed bg-gray-100' : 'hover:scale-105 hover:border-gray-300 cursor-pointer'}`}
                        title={style.name}
                      >
                        <img src={`https://api.dicebear.com/9.x/${style.id}/svg?seed=${tempName}`} className="w-full h-full" alt={style.name} />
                        {!isUnlocked && <div className="absolute inset-0 flex items-center justify-center bg-black/10"><Lock size={16} className="text-gray-600"/></div>}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">Unlock more styles via Mystery Boxes!</p>
              </div>

              <Button onClick={handleSaveProfile} className="w-full" icon={<Check />}>
                Save Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
