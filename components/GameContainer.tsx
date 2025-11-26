
import React, { useState, useEffect } from 'react';
import { GameMode, GameState, EvaluationResult, MysteryReward, UserProfile } from '../types';
import { Button, Card, Input, ImageViewer, LoadingOverlay, ScoreBadge, Confetti } from './Shared';
import { 
  generateImageFromPrompt, 
  generateRandomPrompt, 
  evaluateSubmission,
  generateMistakeScenario,
  generateEmojis
} from '../services/geminiService';
import { getDailyChallengePrompt, markDailyChallengeComplete } from '../services/progressService';
import { ArrowRight, RefreshCw, Home, Clock, Lightbulb, Repeat, Calendar, Swords } from 'lucide-react';
import { playSound } from '../services/soundService';
import { geminiLiveService } from '../services/geminiLiveService';
import { MysteryBox } from './MysteryBox';

interface GameContainerProps {
  mode: GameMode;
  user: UserProfile; // Added user prop
  onExit: () => void;
  onScoreUpdate: (points: number) => void;
  onRewardClaimed: (reward: MysteryReward) => void; // New Handler
  isMultiplayer?: boolean;
}

export const GameContainer: React.FC<GameContainerProps> = ({ mode, user, onExit, onScoreUpdate, onRewardClaimed, isMultiplayer = false }) => {
  const [state, setState] = useState<GameState>({
    currentMode: mode,
    score: 0,
    round: 1,
    isLoading: false,
    loadingMessage: "",
    currentImage: null,
    currentPrompt: null,
    targetPrompt: null,
    feedback: null,
    history: []
  });
  
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [multiplayerScores, setMultiplayerScores] = useState({ 1: 0, 2: 0 });

  const [userInput, setUserInput] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showMysteryBox, setShowMysteryBox] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    initializeRound();
    if (isMultiplayer) {
      geminiLiveService.sendContext(`Two players started a battle in ${mode}.`);
    } else {
      geminiLiveService.sendContext(`User started playing ${mode}.`);
    }
  }, [mode]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && isTimerActive) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const initializeRound = async () => {
    setState(prev => ({ ...prev, isLoading: true, loadingMessage: "Setting up...", currentImage: null, feedback: null }));
    setEvaluation(null);
    setUserInput("");
    setTimer(30);
    setIsTimerActive(false);
    setShowConfetti(false);

    try {
      if (mode === GameMode.GUESS_PROMPT) {
        const hiddenPrompt = await generateRandomPrompt();
        setState(prev => ({ ...prev, loadingMessage: "Painting the picture...", targetPrompt: hiddenPrompt }));
        const imageUrl = await generateImageFromPrompt(hiddenPrompt);
        setState(prev => ({ ...prev, isLoading: false, currentImage: imageUrl }));
      } 
      else if (mode === GameMode.DAILY_CHALLENGE) {
        const dailyPrompt = getDailyChallengePrompt();
        setState(prev => ({ ...prev, loadingMessage: "Generating Daily Challenge...", targetPrompt: dailyPrompt }));
        const imageUrl = await generateImageFromPrompt(dailyPrompt);
        setState(prev => ({ ...prev, isLoading: false, currentImage: imageUrl }));
      }
      else if (mode === GameMode.FIX_MISTAKE) {
        setState(prev => ({ ...prev, loadingMessage: "Finding a mistake..." }));
        const { brokenPrompt } = await generateMistakeScenario();
        setState(prev => ({ ...prev, loadingMessage: "Drawing the mistake...", targetPrompt: brokenPrompt }));
        const imageUrl = await generateImageFromPrompt(brokenPrompt);
        setState(prev => ({ ...prev, isLoading: false, currentImage: imageUrl }));
      }
      else if (mode === GameMode.EMOJI_CHALLENGE) {
        const emojis = generateEmojis();
        const emojiString = emojis.join(" ");
        setState(prev => ({ ...prev, isLoading: false, targetPrompt: emojiString }));
      }
      else if (mode === GameMode.FASTEST_CHALLENGE) {
         setState(prev => ({ ...prev, isLoading: false }));
         setIsTimerActive(true);
      }

    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isLoading: false, feedback: "Something went wrong." }));
    }
  };

  const handleRetryGeneration = async () => {
    if (!userInput) return;
    playSound('click');
    setState(prev => ({ ...prev, isLoading: true, loadingMessage: "Redrawing..." }));
    try {
      const newImage = await generateImageFromPrompt(userInput);
      setState(prev => ({ ...prev, isLoading: false, currentImage: newImage }));
      playSound('pop');
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, feedback: "Could not regenerate." }));
    }
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) return;
    playSound('click');
    setIsTimerActive(false);
    
    setState(prev => ({ ...prev, isLoading: true, loadingMessage: "The AI is judging..." }));

    try {
      let result: EvaluationResult;
      let finalImage = state.currentImage;

      if (mode === GameMode.GUESS_PROMPT || mode === GameMode.DAILY_CHALLENGE) {
        result = await evaluateSubmission('GUESS_PROMPT', state.targetPrompt!, userInput);
      } 
      else if (mode === GameMode.FIX_MISTAKE) {
        setState(prev => ({ ...prev, loadingMessage: "Fixing the picture..." }));
        finalImage = await generateImageFromPrompt(userInput);
        result = await evaluateSubmission('FIX_MISTAKE', state.targetPrompt!, userInput);
      }
      else if (mode === GameMode.EMOJI_CHALLENGE) {
        setState(prev => ({ ...prev, loadingMessage: "Bringing story to life..." }));
        finalImage = await generateImageFromPrompt(userInput);
        result = await evaluateSubmission('EMOJI', state.targetPrompt!, userInput);
      }
      else if (mode === GameMode.FASTEST_CHALLENGE) {
        setState(prev => ({ ...prev, loadingMessage: "Rushing..." }));
        finalImage = await generateImageFromPrompt(userInput);
        const timeBonus = timer * 2;
        const complexityScore = Math.min(userInput.split(' ').length * 5, 40);
        result = { score: Math.min(timeBonus + complexityScore, 100), feedback: `Time left: ${timer}s!` };
      } else {
          result = { score: 0, feedback: "Error" };
      }

      if (result.score > 80) {
        playSound('correct');
        setShowConfetti(true);
      } else if (result.score > 60) {
        playSound('success');
      } else {
        playSound('pop');
      }

      if (isMultiplayer) {
        setMultiplayerScores(prev => ({
          ...prev,
          [activePlayer]: prev[activePlayer] + result.score
        }));
      } else {
        geminiLiveService.sendContext(`User scored ${result.score}.`);
        // Mystery Box Trigger for Good Scores (or Daily Challenge)
        if ((mode === GameMode.DAILY_CHALLENGE && result.score > 60) || (result.score > 75)) {
          if (mode === GameMode.DAILY_CHALLENGE) markDailyChallengeComplete();
          setTimeout(() => setShowMysteryBox(true), 1000);
        }
      }

      setEvaluation(result);
      setState(prev => ({ ...prev, isLoading: false, currentImage: finalImage }));
      onScoreUpdate(result.score);

    } catch (error) {
      console.error(error);
      playSound('error');
      setState(prev => ({ ...prev, isLoading: false, feedback: "Evaluation failed." }));
    }
  };

  const handlePassTurn = () => {
    playSound('click');
    if (activePlayer === 1) {
      setActivePlayer(2);
      initializeRound();
    } else {
      setActivePlayer(1);
      initializeRound();
    }
  };

  const handleMysteryBoxClose = (reward: MysteryReward) => {
    setShowMysteryBox(false);
    onRewardClaimed(reward); // Pass reward up to App to handle unlocking
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      {state.isLoading && <LoadingOverlay message={state.loadingMessage} />}
      {showConfetti && <Confetti />}
      {showMysteryBox && <MysteryBox user={user} onClose={handleMysteryBoxClose} />}

      <div className="mb-6 text-center">
        {isMultiplayer && (
          <div className="bg-white rounded-2xl p-2 mb-4 shadow-sm inline-flex items-center gap-2 border border-gray-200">
            <div className={`px-4 py-2 rounded-xl transition-all ${activePlayer === 1 ? 'bg-sky-100 text-sky-700 font-bold shadow-inner' : 'text-gray-400'}`}>
              Player 1: {multiplayerScores[1]} pts
            </div>
            <div className="text-gray-300 font-black">VS</div>
            <div className={`px-4 py-2 rounded-xl transition-all ${activePlayer === 2 ? 'bg-orange-100 text-orange-700 font-bold shadow-inner' : 'text-gray-400'}`}>
               Player 2: {multiplayerScores[2]} pts
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
           <Button variant="secondary" size="sm" onClick={onExit} icon={<Home size={16}/>}>Exit</Button>
           
           {isMultiplayer && (
              <span className={`px-4 py-1 rounded-full font-bold uppercase text-xs tracking-wider shadow-sm animate-pulse ${activePlayer === 1 ? 'bg-sky-500 text-white' : 'bg-orange-500 text-white'}`}>
                 Player {activePlayer}'s Turn
              </span>
           )}

           {mode === GameMode.DAILY_CHALLENGE && !isMultiplayer && (
             <div className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full font-bold uppercase text-xs tracking-wider flex items-center gap-2">
               <Calendar size={14} /> Daily Event
             </div>
           )}
           {mode === GameMode.FASTEST_CHALLENGE && (
             <div className={`font-mono text-2xl font-bold ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
               <Clock className="inline mr-2" />{timer}s
             </div>
           )}
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-2">
           {mode === GameMode.DAILY_CHALLENGE ? "Daily Challenge" : mode.replace('_', ' ')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Image */}
        <div className="flex flex-col gap-4">
          <ImageViewer 
            src={state.currentImage} 
            placeholder={isMultiplayer ? `Waiting for Player ${activePlayer}...` : "Your creation will appear here..."}
          />
          {mode === GameMode.FIX_MISTAKE && !evaluation && state.currentImage && (
             <div className="text-center text-sm text-gray-500 italic">"Hmm, this doesn't look right..."</div>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex flex-col justify-center h-full">
           {!evaluation ? (
             <div className="space-y-6">
               {mode === GameMode.EMOJI_CHALLENGE && (
                 <div className="text-6xl text-center tracking-widest py-8">{state.targetPrompt}</div>
               )}
               
               <Card className="bg-sky-50/50 border-none">
                 <div className="flex items-start gap-3">
                   <Lightbulb className="text-yellow-500 mt-1 flex-shrink-0" />
                   <div>
                     <h4 className="font-bold text-gray-700">Tip:</h4>
                     <p className="text-sm text-gray-600">
                       {(mode === GameMode.GUESS_PROMPT || mode === GameMode.DAILY_CHALLENGE) && "Focus on colors, main objects, and the setting."}
                       {mode === GameMode.FIX_MISTAKE && "Be specific! Tell the AI exactly what to change."}
                       {mode === GameMode.EMOJI_CHALLENGE && "Try to weave a story that connects all the emojis."}
                       {mode === GameMode.FASTEST_CHALLENGE && "Don't overthink it, just type fast!"}
                     </p>
                   </div>
                 </div>
               </Card>

               <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-100 mt-6 flex gap-2 items-end">
                  <Input 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={(mode === GameMode.GUESS_PROMPT || mode === GameMode.DAILY_CHALLENGE) ? "I see a..." : "Type prompt..."}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                  />
                  <Button onClick={handleSubmit} disabled={!userInput.trim()} icon={<ArrowRight />}>Go!</Button>
               </div>
             </div>
           ) : (
             <div className="mt-6 animate-in slide-in-from-bottom-10 duration-500">
                <Card className={`border-2 ${activePlayer === 1 ? 'border-sky-200 bg-sky-50' : 'border-orange-200 bg-orange-50'}`}>
                  <div className="flex flex-col items-center text-center gap-4">
                    <ScoreBadge score={evaluation.score} label="Points" />
                    <h3 className="text-2xl font-bold text-gray-800">
                      {evaluation.score > 80 ? "Amazing Job!" : "Good Effort!"}
                    </h3>
                    <p className="text-gray-600">{evaluation.feedback}</p>
                    
                    {(mode === GameMode.GUESS_PROMPT || mode === GameMode.DAILY_CHALLENGE) && (
                      <div className="text-sm bg-yellow-100 text-yellow-800 p-2 rounded-lg inline-block mt-2">
                        <strong>Real Prompt:</strong> {state.targetPrompt}
                      </div>
                    )}

                    <div className="flex gap-3 mt-4 w-full justify-center">
                       {mode !== GameMode.GUESS_PROMPT && mode !== GameMode.DAILY_CHALLENGE && !isMultiplayer && (
                         <Button onClick={handleRetryGeneration} variant="secondary" icon={<Repeat size={18} />}>Retry</Button>
                       )}

                       {isMultiplayer ? (
                          <Button onClick={handlePassTurn} variant="primary" className="w-full" icon={<Swords size={18} />}>
                             {activePlayer === 1 ? "Pass to Player 2" : "Next Round (Player 1)"}
                          </Button>
                       ) : (
                          mode === GameMode.DAILY_CHALLENGE ? (
                            <Button onClick={onExit} variant="success" icon={<Home size={18} />}>Done</Button>
                          ) : (
                            <Button onClick={initializeRound} icon={<RefreshCw size={18} />} variant="primary">Next</Button>
                          )
                       )}
                    </div>
                  </div>
                </Card>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
