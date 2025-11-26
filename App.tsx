import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { GameContainer } from './components/GameContainer';
import { Card, Button } from './components/Shared';
import { TeacherDashboard } from './components/TeacherDashboard';
import { LiveVideoRoom } from './components/LiveVideoRoom';
import { GameMode, AppTheme, UserProfile, MysteryReward } from './types';
import { BrainCircuit, Eraser, Smile, Zap, Users, ArrowRight, Video, Calendar, Flame, User, Swords } from 'lucide-react';
import { playSound } from './services/soundService';
import { loadUserProfile, saveUserProfile, addXpToUser, checkDailyStreak, hasCompletedDailyChallenge, unlockReward } from './services/progressService';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(loadUserProfile());
  const [theme, setTheme] = useState<AppTheme>(AppTheme.SKY);
  const [currentMode, setCurrentMode] = useState<GameMode>(GameMode.MENU);
  const [showTeacherDashboard, setShowTeacherDashboard] = useState(false);
  const [showLiveRoom, setShowLiveRoom] = useState(false);
  const [dailyComplete, setDailyComplete] = useState(false);
  const [isMultiplayer, setIsMultiplayer] = useState(false);

  useEffect(() => {
    const { user: updatedUser, streakBonus } = checkDailyStreak(loadUserProfile());
    if (streakBonus) {
      playSound('success');
    }
    setUser(updatedUser);
    setDailyComplete(hasCompletedDailyChallenge());
    
    // Check if current theme is valid for user
    if (!updatedUser.inventory.themes.includes(theme)) {
        setTheme(AppTheme.SKY);
    }
  }, []);

  const handleModeSelect = (mode: GameMode) => {
    playSound('click');
    setCurrentMode(mode);
  };

  const handleExitGame = () => {
    setCurrentMode(GameMode.MENU);
    setDailyComplete(hasCompletedDailyChallenge()); 
    setUser(loadUserProfile());
  };

  const handleScoreUpdate = (points: number) => {
    const xpGained = Math.ceil(points / 2); 
    const { user: updatedUser, leveledUp } = addXpToUser(user, xpGained);
    if (leveledUp) {
      playSound('levelup');
    }
    setUser(updatedUser);
  };

  const handleRewardClaimed = (reward: MysteryReward) => {
    const updatedUser = unlockReward(user, reward);
    
    // If XP reward, add XP
    if (reward.type === 'XP') {
       const { user: xpUser, leveledUp } = addXpToUser(updatedUser, Number(reward.value));
       if (leveledUp) playSound('levelup');
       setUser(xpUser);
    } else {
       setUser(updatedUser);
    }
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    saveUserProfile(updatedUser);
  };

  const renderMenu = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Top Bar Actions */}
      <div className="flex justify-end gap-3">
         <button 
          onClick={() => { playSound('click'); setShowLiveRoom(!showLiveRoom); }}
          className={`flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-full transition-all border shadow-sm ${showLiveRoom ? 'bg-pink-500 text-white border-pink-600' : 'bg-white text-pink-500 border-pink-200 hover:border-pink-300'}`}
         >
           <div className={`rounded-full p-1 transition-colors ${showLiveRoom ? 'bg-white/20' : 'bg-pink-100'}`}>
             <Video size={14} className={showLiveRoom ? 'text-white' : 'text-pink-500'} />
           </div>
           {showLiveRoom ? 'Close Live Room' : 'Start Live Party'}
         </button>

         <button 
          onClick={() => { playSound('click'); setShowTeacherDashboard(true); }}
          className="flex items-center gap-2 text-sky-600/70 hover:text-sky-600 font-bold text-sm bg-sky-50 hover:bg-white px-4 py-2 rounded-full transition-all border border-sky-100 hover:border-sky-200 shadow-sm group"
         >
           <div className="bg-sky-200 rounded-full p-1 group-hover:bg-sky-300 transition-colors">
             <Users size={14} className="text-sky-700" />
           </div>
           Teacher Dashboard
         </button>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-6 pb-4">
        <h1 className="text-4xl md:text-6xl font-black text-gray-800 tracking-tight">
          Create. <span className="text-sky-500">Play.</span> Learn.
        </h1>

        {/* Mode Selector Toggle */}
        <div className="flex justify-center gap-4 mb-4">
           <div className="bg-white p-1 rounded-full shadow-md border border-gray-200 flex relative">
             <button
               onClick={() => { setIsMultiplayer(false); playSound('click'); }}
               className={`relative z-10 px-6 py-2 rounded-full text-sm font-black uppercase tracking-wide transition-all flex items-center gap-2 ${!isMultiplayer ? 'bg-sky-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
             >
               <User size={16} /> Solo Adventure
             </button>
             <button
               onClick={() => { setIsMultiplayer(true); playSound('click'); }}
               className={`relative z-10 px-6 py-2 rounded-full text-sm font-black uppercase tracking-wide transition-all flex items-center gap-2 ${isMultiplayer ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
             >
               <Swords size={16} /> Play vs Friend
             </button>
           </div>
        </div>

        {/* DAILY CHALLENGE BUTTON (Always Solo) */}
        {!isMultiplayer && (
          <button 
            onClick={() => handleModeSelect(GameMode.DAILY_CHALLENGE)}
            disabled={dailyComplete}
            className={`mx-auto group relative w-full max-w-md transition-all duration-300 hover:scale-105 ${dailyComplete ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
          >
            <div className={`absolute inset-0 rounded-3xl blur-md transition-opacity ${dailyComplete ? 'bg-gray-300 opacity-50' : 'bg-gradient-to-r from-orange-400 to-pink-500 opacity-70 group-hover:opacity-100'}`}></div>
            <div className={`relative bg-white rounded-3xl p-1 ${dailyComplete ? 'border-4 border-gray-200' : 'border-4 border-transparent bg-clip-padding'}`}>
                <div className={`rounded-[20px] p-4 flex items-center gap-4 ${dailyComplete ? 'bg-gray-50' : 'bg-gradient-to-r from-orange-50 to-pink-50'}`}>
                  <div className={`p-3 rounded-full shadow-sm ${dailyComplete ? 'bg-gray-200 text-gray-400' : 'bg-white text-orange-500'}`}>
                    <Calendar size={32} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className={`font-black text-lg uppercase tracking-wide flex items-center gap-2 ${dailyComplete ? 'text-gray-500' : 'text-gray-800'}`}>
                      {dailyComplete ? "Daily Complete!" : "Daily Challenge"}
                      {!dailyComplete && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">NEW</span>}
                    </h3>
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <span className={`flex items-center gap-1 ${user.streak.current > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                        <Flame size={14} className={user.streak.current > 0 ? 'fill-orange-500' : ''} /> 
                        Streak: {user.streak.current} Days
                      </span>
                      {user.streak.frozen && <span className="text-sky-400 text-xs bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">Frozen ❄️</span>}
                    </div>
                  </div>
                  {!dailyComplete && (
                    <div className="bg-white/50 p-2 rounded-full text-orange-500 group-hover:text-pink-500 transition-colors">
                      <ArrowRight />
                    </div>
                  )}
                </div>
            </div>
          </button>
        )}
      </div>

      {/* Game Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        <MenuCard 
          title="Guess the Prompt"
          description={isMultiplayer ? "Take turns guessing! Who has the sharpest eyes?" : "Can you guess what words made the picture?"}
          icon={<BrainCircuit size={40} className="text-purple-500" />}
          color="border-purple-400 hover:shadow-purple-200"
          onClick={() => handleModeSelect(GameMode.GUESS_PROMPT)}
          isMultiplayer={isMultiplayer}
        />
        <MenuCard 
          title="Fix the Mistake"
          description={isMultiplayer ? "Who can fix the AI's mistake better? Compete!" : "Help the AI fix silly pictures by writing better prompts."}
          icon={<Eraser size={40} className="text-red-500" />}
          color="border-red-400 hover:shadow-red-200"
          onClick={() => handleModeSelect(GameMode.FIX_MISTAKE)}
          isMultiplayer={isMultiplayer}
        />
        <MenuCard 
          title="Emoji Challenge"
          description={isMultiplayer ? "Same emojis, different stories. Who is more creative?" : "Turn a random set of emojis into a masterpiece."}
          icon={<Smile size={40} className="text-yellow-500" />}
          color="border-yellow-400 hover:shadow-yellow-200"
          onClick={() => handleModeSelect(GameMode.EMOJI_CHALLENGE)}
          isMultiplayer={isMultiplayer}
        />
        <MenuCard 
          title="Speed Challenge"
          description={isMultiplayer ? "Pass the device! Who can create faster and better?" : "30 Seconds on the clock! How fast can you create?"}
          icon={<Zap size={40} className="text-blue-500" />}
          color="border-blue-400 hover:shadow-blue-200"
          onClick={() => handleModeSelect(GameMode.FASTEST_CHALLENGE)}
          isMultiplayer={isMultiplayer}
        />
      </div>
    </div>
  );

  return (
    <Layout user={user} theme={theme} onThemeChange={setTheme} onUpdateUser={handleUpdateUser}>
      {showTeacherDashboard && (
        <TeacherDashboard onClose={() => setShowTeacherDashboard(false)} />
      )}

      {showLiveRoom && (
        <div className="fixed bottom-4 right-4 z-50 w-96 h-64 shadow-2xl rounded-3xl overflow-hidden animate-in slide-in-from-bottom-10 border-4 border-white bg-black">
           <LiveVideoRoom userName={user.name} onClose={() => setShowLiveRoom(false)} />
        </div>
      )}

      {currentMode === GameMode.MENU ? renderMenu() : (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <GameContainer 
            mode={currentMode} 
            user={user} 
            onExit={handleExitGame}
            onScoreUpdate={handleScoreUpdate}
            onRewardClaimed={handleRewardClaimed}
            isMultiplayer={isMultiplayer}
          />
        </div>
      )}
    </Layout>
  );
};

const MenuCard: React.FC<{ title: string; description: string; icon: React.ReactNode; color: string; onClick: () => void; isMultiplayer?: boolean }> = ({
  title, description, icon, color, onClick, isMultiplayer
}) => (
  <button 
    onClick={onClick}
    className={`group bg-white p-6 rounded-3xl border-4 ${color} shadow-xl text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex items-start gap-4 w-full`}
  >
    <div className="bg-gray-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-sky-600 transition-colors">
        {title} {isMultiplayer && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full ml-2 align-middle">VS</span>}
      </h3>
      <p className="text-gray-500 font-medium leading-relaxed">{description}</p>
      <div className="mt-4 inline-flex items-center text-sky-500 font-bold text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
        Play Now <ArrowRight size={16} className="ml-1" />
      </div>
    </div>
  </button>
);