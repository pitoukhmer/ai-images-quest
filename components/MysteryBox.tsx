
import React, { useState } from 'react';
import { Package, Star, Palette, User, Smile } from 'lucide-react';
import { Button, Confetti } from './Shared';
import { playSound } from '../services/soundService';
import { openMysteryBox } from '../services/gameEventsService';
import { MysteryReward, UserProfile } from '../types';

interface MysteryBoxProps {
  user: UserProfile;
  onClose: (reward: MysteryReward) => void;
}

export const MysteryBox: React.FC<MysteryBoxProps> = ({ user, onClose }) => {
  const [stage, setStage] = useState<'closed' | 'opening' | 'open'>('closed');
  const [reward, setReward] = useState<MysteryReward | null>(null);

  const handleOpen = () => {
    if (stage !== 'closed') return;
    playSound('click');
    setStage('opening');
    
    setTimeout(() => {
      const r = openMysteryBox(user); // Pass user to check what they already have
      setReward(r);
      setStage('open');
      playSound('success');
      playSound('pop');
    }, 1500);
  };

  const renderIcon = (type: string, value: any) => {
    if (type === 'XP') return <Star className="w-20 h-20 text-yellow-400 animate-spin-slow" />;
    if (type === 'THEME') return <Palette className="w-20 h-20 text-purple-500" />;
    if (type === 'AVATAR') return <User className="w-20 h-20 text-blue-500" />;
    if (type === 'STICKER') return <div className="text-8xl animate-bounce">{value}</div>;
    return <Star />;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center animate-in fade-in duration-300">
      {stage === 'open' && <Confetti />}
      
      <div className="text-center w-full max-w-md mx-4">
        
        <div 
          onClick={handleOpen}
          className={`relative w-48 h-48 mx-auto mb-8 transition-transform duration-300 select-none
            ${stage === 'closed' ? 'cursor-pointer hover:scale-110 hover:rotate-3 active:scale-95' : ''}
            ${stage === 'opening' ? 'animate-bounce' : ''}
          `}
        >
          {stage === 'open' ? (
             <div className="animate-in zoom-in duration-500 relative w-full h-full flex items-center justify-center">
               <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
               {reward && renderIcon(reward.type, reward.value)}
             </div>
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${stage === 'opening' ? 'animate-pulse' : ''}`}>
               <Package 
                 className="w-full h-full text-purple-400 drop-shadow-[0_10px_20px_rgba(168,85,247,0.4)] transition-colors duration-300" 
                 strokeWidth={1} 
                 fill="currentColor" 
               />
               {stage === 'closed' && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                    Tap Me!
                  </div>
               )}
            </div>
          )}
        </div>

        {stage === 'closed' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4">
            <h2 className="text-4xl font-black text-white tracking-wider drop-shadow-lg">Mystery Box!</h2>
            <p className="text-purple-200 text-lg font-medium">You earned a prize. Tap to open.</p>
          </div>
        )}

        {stage === 'opening' && (
          <p className="text-3xl font-bold text-white animate-pulse tracking-widest">UNBOXING...</p>
        )}

        {stage === 'open' && reward && (
           <div className="bg-white p-8 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 border-4 border-purple-400 relative transform rotate-1 overflow-hidden">
             <div className="absolute -top-12 -right-12 w-24 h-24 bg-yellow-300 rotate-45"></div>
             
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
               {reward.type} REWARD
             </div>
             
             <h2 className="text-3xl font-black text-gray-800 mb-2 mt-4">{reward.label}</h2>
             <p className="text-gray-500 mb-6 font-medium">{reward.description}</p>
             
             {reward.type === 'XP' && (
               <div className="bg-yellow-50 text-yellow-600 font-black text-4xl py-4 px-8 rounded-2xl inline-block mb-6 border-2 border-yellow-200 shadow-inner">
                 +{reward.value} XP
               </div>
             )}

             <Button onClick={() => onClose(reward)} className="w-full py-4 text-lg" variant="primary">
               Collect Reward
             </Button>
           </div>
        )}
      </div>
    </div>
  );
};
