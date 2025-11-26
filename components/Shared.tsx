
import React, { useState, useEffect } from 'react';
import { Activity, Sparkles, Send, ArrowLeft, Download } from 'lucide-react';
import { playSound } from '../services/soundService';

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disableSound?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', icon, className = '', disableSound = false, onClick, ...props 
}) => {
  const baseStyle = "rounded-full font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px]";
  
  const variants = {
    primary: "bg-sky-500 hover:bg-sky-400 text-white border-2 border-sky-600",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200",
    danger: "bg-red-500 hover:bg-red-400 text-white border-2 border-red-600",
    success: "bg-green-500 hover:bg-green-400 text-white border-2 border-green-600"
  };

  const sizes = {
    sm: "px-4 py-1 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-xl"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disableSound) {
      playSound(variant === 'danger' ? 'error' : 'click');
    }
    if (onClick) onClick(e);
  };

  return (
    <button 
      onClick={handleClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};

// --- INPUT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col w-full">
      {label && <label className="mb-2 text-gray-700 font-bold text-sm uppercase tracking-wider">{label}</label>}
      <input 
        className={`w-full px-4 py-3 rounded-xl border-4 border-sky-200 focus:border-sky-400 focus:outline-none bg-white text-gray-800 font-medium transition-colors ${className}`}
        {...props}
      />
    </div>
  );
};

// --- CARD ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white rounded-3xl shadow-xl p-6 border-b-8 border-gray-100 ${className}`}>
      {title && <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-100 pb-2">{title}</h3>}
      {children}
    </div>
  );
};

// --- LOADING OVERLAY ---
export const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm text-center border-4 border-sky-300">
        <div className="relative w-20 h-20 mb-4">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
          <Sparkles className="absolute inset-0 m-auto text-yellow-400 animate-pulse" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Creating Magic</h2>
        <p className="text-gray-600 font-medium">{message}{dots}</p>
      </div>
    </div>
  );
};

// --- IMAGE VIEWER ---
export const ImageViewer: React.FC<{ src: string | null; placeholder?: string }> = ({ src, placeholder }) => {
  if (!src) {
    return (
      <div className="w-full aspect-square rounded-2xl bg-gray-100 border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
        <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
           <Activity size={48} className="text-gray-300" />
        </div>
        <p className="font-medium">{placeholder || "Image will appear here"}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-lg group pop-in bg-gray-900">
      <img src={src} alt="AI Generated" className="w-full h-full object-cover" />
      <a 
        href={src} 
        download="ai-quest-image.jpg"
        className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        title="Download Image"
        onClick={() => playSound('pop')}
      >
        <Download size={20} />
      </a>
    </div>
  );
};

// --- SCORE BADGE ---
export const ScoreBadge: React.FC<{ score: number; label?: string }> = ({ score, label }) => {
  let color = "bg-gray-500";
  if (score >= 90) color = "bg-yellow-500";
  else if (score >= 70) color = "bg-green-500";
  else if (score >= 50) color = "bg-blue-500";

  return (
    <div className="flex flex-col items-center">
      <div className={`${color} text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black shadow-lg border-4 border-white ring-4 ring-gray-100/50 transform transition-all hover:scale-110`}>
        {score}
      </div>
      {label && <span className="mt-2 font-bold text-gray-600 text-sm uppercase tracking-wide">{label}</span>}
    </div>
  );
};

// --- CONFETTI EFFECT ---
export const Confetti: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-sm animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10%`,
            backgroundColor: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32'][Math.floor(Math.random() * 4)],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation-name: confetti;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};
