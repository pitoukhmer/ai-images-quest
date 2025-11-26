
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Radio } from 'lucide-react';
import { geminiLiveService } from '../services/geminiLiveService';
import { playSound } from '../services/soundService';

export const AIHost: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTalking, setIsTalking] = useState(false); // Simulated for visual

  const toggleHost = async () => {
    playSound('click');
    if (isActive) {
      setIsActive(false);
      await geminiLiveService.disconnect();
    } else {
      setIsConnecting(true);
      try {
        await geminiLiveService.connect((status) => {
            setIsActive(status);
            if (!status) setIsConnecting(false);
        });
        setIsConnecting(false);
      } catch (e) {
        console.error(e);
        setIsConnecting(false);
        playSound('error');
      }
    }
  };

  // Visual effect loop when active
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive) {
      interval = setInterval(() => {
        // Randomly toggle "talking" state to make the avatar look alive
        setIsTalking(prev => !prev && Math.random() > 0.7);
      }, 500);
    } else {
      setIsTalking(false);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 shadow-inner">
      {/* Avatar */}
      <div className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-gradient-to-br from-pink-400 to-purple-500 scale-110 shadow-[0_0_15px_rgba(236,72,153,0.6)]' : 'bg-gray-400'}`}>
        <div className={`absolute inset-0 rounded-full border-2 border-white transition-transform duration-200 ${isTalking ? 'scale-110 opacity-50' : 'scale-100 opacity-0'}`}></div>
        <Sparkles size={16} className="text-white animate-pulse" />
        {isActive && (
           <span className="absolute -top-1 -right-1 flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
           </span>
        )}
      </div>

      {/* Text & Toggle */}
      <div className="flex items-center gap-2">
        <div className="hidden md:block text-left leading-none">
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">AI Host</p>
          <p className={`text-xs font-bold ${isActive ? 'text-white' : 'text-white/50'}`}>
             {isConnecting ? 'Connecting...' : isActive ? 'Sparky is Live' : 'Off'}
          </p>
        </div>

        <button 
          onClick={toggleHost}
          disabled={isConnecting}
          className={`p-2 rounded-full transition-colors ml-1 ${isActive ? 'bg-white text-purple-600 hover:bg-gray-100' : 'bg-black/20 text-white hover:bg-black/30'}`}
          title={isActive ? "Turn Off AI Host" : "Turn On AI Host"}
        >
          {isActive ? <Mic size={16} /> : <MicOff size={16} />}
        </button>
      </div>
    </div>
  );
};
