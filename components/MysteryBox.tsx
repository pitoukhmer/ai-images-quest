
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
    
    // Animation Sequence: 2 seconds of suspense/shaking
    setTimeout(() => {
      const r = openMysteryBox(user);
      setReward(r);
      setStage('open');
      playSound('success');
      playSound('pop');
    }, 2000); 
  };

  const renderIcon = (type: string, value: any) => {
    if (type === 'XP') return <Star className="w-24 h-24 text-yellow-400 animate-spin-slow drop-shadow-lg" />;
    if (type === 'THEME') return <Palette className="w-24 h-24 text-purple-500 drop-shadow-lg" />;
    if (type === 'AVATAR') return <User className="w-24 h-24 text-blue-500 drop-shadow-lg" />;
    if (type === 'STICKER') return <div className="text-9xl animate-bounce drop-shadow-xl">{value}</div>;
    return <Star />;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center animate-in fade-in duration-300">
      {stage === 'open' && <Confetti />}
      
      <div className="text-center w-full max-w-md mx-4">
        
        {/* The Box Container */}
        <div 
          onClick={handleOpen}
          className={`relative w-56 h-56 mx-auto mb-8 transition-all duration-300 select-none
            ${stage === 'closed' ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
          `}
        >
          {stage === 'open' ? (
             // REVEAL STATE
             <div className="animate-in zoom-in duration-500 relative w-full h-full flex items-center justify-center">
               <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
               <div className="relative z-10 transform hover:scale-110 transition-transform duration-500">
                 {reward && renderIcon(reward.type, reward.value)}
               </div>
             </div>
          ) : (
            // CLOSED / SHAKING STATE
            <div className={`w-full h-full flex items-center justify-center ${stage === 'opening' ? 'animate-shake' : 'animate-bounce-slight'}`}>
               <Package 
                 className={`w-full h-full drop-shadow-[0_20px_30px_rgba(168,85,247,0.6)] transition-colors duration-300 ${stage === 'opening' ? 'text-yellow-400' : 'text-purple-400'}`} 
                 strokeWidth={1} 
                 fill="currentColor" 
               />
               {stage === 'closed' && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-black px-3 py-1 rounded-full animate-bounce shadow-md border-2 border-white">
                    OPEN ME!
                  </div>
               )}
            </div>
          )}
        </div>

        {/* Text Content */}
        {stage === 'closed' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4">
            <h2 className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">MYSTERY BOX</h2>
            <p className="text-purple-200 text-xl font-bold">You found a secret reward!</p>
          </div>
        )}

        {stage === 'opening' && (
          <p className="text-4xl font-black text-yellow-400 animate-pulse tracking-widest uppercase">Opening...</p>
        )}

        {/* Reward Card */}
        {stage === 'open' && reward && (
           <div className="bg-white p-8 rounded-[32px] shadow-2xl animate-in slide-in-from-bottom-10 border-[6px] border-yellow-400 relative transform rotate-1 overflow-hidden max-w-sm mx-auto">
             {/* Background Decor */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300 rounded-full opacity-50"></div>
             <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-300 rounded-full opacity-50"></div>
             
             <div className="relative z-10">
                <div className="inline-block bg-purple-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg mb-4">
                  {reward.type} Unlocked
                </div>
                
                <h2 className="text-3xl font-black text-gray-800 mb-2 leading-tight">{reward.label}</h2>
                <p className="text-gray-500 mb-6 font-bold text-sm">{reward.description}</p>
                
                {reward.type === 'XP' && (
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-600 font-black text-5xl py-4 px-6 rounded-2xl inline-block mb-6 border-2 border-orange-200 shadow-inner">
                    +{reward.value}
                  </div>
                )}

                <Button onClick={() => onClose(reward)} className="w-full py-4 text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1" variant="success">
                  Awesome!
                </Button>
             </div>
           </div>
        )}
      </div>
      
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake {
          animation: shake 0.5s infinite;
        }
        .animate-bounce-slight {
          animation: bounce-slight 2s infinite;
        }
        @keyframes bounce-slight {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
