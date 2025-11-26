
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playSound = (type: 'click' | 'success' | 'pop' | 'error' | 'correct' | 'levelup') => {
  try {
    const ctx = initAudio();
    // Check if context was created successfully
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        // Soft "Woodblock" click / bubble tap
        const oscClick = ctx.createOscillator();
        const gainClick = ctx.createGain();
        oscClick.connect(gainClick);
        gainClick.connect(ctx.destination);

        oscClick.type = 'sine';
        oscClick.frequency.setValueAtTime(800, now);
        oscClick.frequency.exponentialRampToValueAtTime(400, now + 0.08);
        gainClick.gain.setValueAtTime(0.2, now);
        gainClick.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        oscClick.start(now);
        oscClick.stop(now + 0.1);
        break;

      case 'correct':
        // Bright, cheerful major arpeggio (C Major 9)
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'sine'; 
          const startTime = now + (i * 0.08); // Staggered entry
          
          osc.frequency.setValueAtTime(freq, startTime);
          
          // Envelope
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
          
          osc.start(startTime);
          osc.stop(startTime + 0.7);
        });
        break;

      case 'levelup':
        // Distinct "Level Up" Fanfare (Rapid rising scale + chord hit)
        // Scale run
        const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]; // C Major Scale
        scale.forEach((freq, i) => {
           const osc = ctx.createOscillator();
           const gain = ctx.createGain();
           osc.connect(gain);
           gain.connect(ctx.destination);
           
           osc.type = 'triangle';
           const startTime = now + (i * 0.05);
           osc.frequency.setValueAtTime(freq, startTime);
           
           gain.gain.setValueAtTime(0, startTime);
           gain.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
           gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
           
           osc.start(startTime);
           osc.stop(startTime + 0.15);
        });
        
        // Final Chord Hit (C Major)
        const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const chordStart = now + (scale.length * 0.05);
        chord.forEach((freq) => {
           const osc = ctx.createOscillator();
           const gain = ctx.createGain();
           osc.connect(gain);
           gain.connect(ctx.destination);
           
           osc.type = 'sine';
           osc.frequency.setValueAtTime(freq, chordStart);
           
           gain.gain.setValueAtTime(0, chordStart);
           gain.gain.linearRampToValueAtTime(0.2, chordStart + 0.05); // Louder punch
           gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 1.5); // Long tail
           
           osc.start(chordStart);
           osc.stop(chordStart + 1.5);
        });
        break;

      case 'success':
        // Simpler 2-part harmony for regular success
        const oscS1 = ctx.createOscillator();
        const gainS1 = ctx.createGain();
        oscS1.connect(gainS1);
        gainS1.connect(ctx.destination);

        oscS1.type = 'triangle';
        oscS1.frequency.setValueAtTime(523.25, now); // C5
        oscS1.frequency.setValueAtTime(659.25, now + 0.1); // E5
        gainS1.gain.setValueAtTime(0, now);
        gainS1.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gainS1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        oscS1.start(now);
        oscS1.stop(now + 0.5);

        const oscS2 = ctx.createOscillator();
        const gainS2 = ctx.createGain();
        oscS2.connect(gainS2);
        gainS2.connect(ctx.destination);
        oscS2.type = 'sine';
        oscS2.frequency.setValueAtTime(783.99, now + 0.15); // G5
        oscS2.frequency.linearRampToValueAtTime(1046.50, now + 0.25); // C6
        gainS2.gain.setValueAtTime(0, now);
        gainS2.gain.linearRampToValueAtTime(0.1, now + 0.2);
        gainS2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        oscS2.start(now);
        oscS2.stop(now + 0.7);
        break;

      case 'pop':
        // Quick high frequency slide up
        const oscPop = ctx.createOscillator();
        const gainPop = ctx.createGain();
        oscPop.connect(gainPop);
        gainPop.connect(ctx.destination);

        oscPop.type = 'sine';
        oscPop.frequency.setValueAtTime(400, now);
        oscPop.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gainPop.gain.setValueAtTime(0.1, now);
        gainPop.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscPop.start(now);
        oscPop.stop(now + 0.2);
        break;

      case 'error':
        // Soft low thud
        const oscErr = ctx.createOscillator();
        const gainErr = ctx.createGain();
        oscErr.connect(gainErr);
        gainErr.connect(ctx.destination);

        oscErr.type = 'triangle';
        oscErr.frequency.setValueAtTime(150, now);
        oscErr.frequency.linearRampToValueAtTime(100, now + 0.1);
        gainErr.gain.setValueAtTime(0.2, now);
        gainErr.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscErr.start(now);
        oscErr.stop(now + 0.3);
        break;
    }
  } catch (e) {
    console.warn("Audio playback failed", e);
  }
};