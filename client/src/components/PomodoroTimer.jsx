import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Eye, EyeOff, ShieldAlert, Award, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Web Audio API White Noise Synthesizer
let audioCtx = null;
let noiseSource = null;

const startBrownNoise = () => {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Generate pink/brownish filtered noise values
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Filter coefficient to make it sound like low-pitched rain/surf
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate volume loss
    }
    
    noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800; 
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.2; 
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noiseSource.start(0);
  } catch (err) {
    console.warn('Web Audio API not supported or user interaction blocked:', err);
  }
};

const stopBrownNoise = () => {
  if (noiseSource) {
    try { noiseSource.stop(); } catch(e){}
    noiseSource = null;
  }
  if (audioCtx) {
    try { audioCtx.close(); } catch(e){}
    audioCtx = null;
  }
};

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // work, shortBreak, longBreak
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const totalSecondsRef = useRef(25 * 60);
  const intervalRef = useRef(null);

  // Time durations mapping
  const modeDurations = {
    work: 25,
    shortBreak: 5,
    longBreak: 15
  };

  useEffect(() => {
    totalSecondsRef.current = modeDurations[mode] * 60;
    setMinutes(modeDurations[mode]);
    setSeconds(0);
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [mode]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Timer Finished!
            triggerAlarm();
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, minutes, seconds]);

  // Audio Noise management
  useEffect(() => {
    if (soundEnabled && isActive) {
      startBrownNoise();
    } else {
      stopBrownNoise();
    }
    return () => stopBrownNoise();
  }, [soundEnabled, isActive]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === 'work') {
      setSessionsCompleted(prev => prev + 1);
      setMode('shortBreak');
    } else {
      setMode('work');
    }
  };

  const triggerAlarm = () => {
    // Play a short synth beep sound
    try {
      const beepCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = beepCtx.createOscillator();
      const gain = beepCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 587.33; // D5 note
      gain.gain.setValueAtTime(0.3, beepCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, beepCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(beepCtx.destination);
      osc.start();
      osc.stop(beepCtx.currentTime + 1.5);
    } catch(e){}
    
    if (Notification.permission === 'granted') {
      new Notification('Pomodoro Alert! 🔔', {
        body: mode === 'work' ? 'Time for a well-deserved break!' : 'Let\'s get back to focus!',
      });
    }
  };

  const toggleTimer = () => {
    setIsActive(prev => !prev);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(modeDurations[mode]);
    setSeconds(0);
    totalSecondsRef.current = modeDurations[mode] * 60;
  };

  // SVG Progress calculation
  const currentSeconds = minutes * 60 + seconds;
  const totalSeconds = modeDurations[mode] * 60;
  const progressPercent = ((totalSeconds - currentSeconds) / totalSeconds) * 100;
  const strokeDash = 2 * Math.PI * 80; // Radius = 80
  const strokeOffset = strokeDash - (progressPercent / 100) * strokeDash;

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-slate-800/30 shadow-xl w-full flex flex-col items-center relative overflow-hidden">
      
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* Header */}
      <div className="w-full flex items-center justify-between mb-6">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
          <Clock className="w-4.5 h-4.5 text-indigo-500" />
          <span>Pomodoro Timer</span>
        </h4>
        <div className="flex items-center gap-2">
          {/* Noise Toggle */}
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled 
                ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-sm'
                : 'border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Disable white noise focus rain' : 'Enable white noise focus rain'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          {/* Focus Mode Overlay Trigger */}
          <button
            onClick={() => setFocusMode(prev => !prev)}
            className="p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            title="Toggle Fullscreen Focus Overlay"
          >
            {focusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Timer Presets */}
      <div className="flex bg-slate-100 dark:bg-slate-850/30 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/20 mb-6 max-w-max">
        {[
          { id: 'work', label: 'Focus' },
          { id: 'shortBreak', label: 'Short Break' },
          { id: 'longBreak', label: 'Long Break' }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setMode(btn.id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
              mode === btn.id
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Clock Display */}
      <div className="relative w-44 h-44 mb-6 flex items-center justify-center">
        {/* SVG Circle Progress */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="88"
            cy="88"
            r="80"
            className="stroke-slate-200/30 dark:stroke-slate-800/20 fill-none"
            strokeWidth="5"
          />
          <circle
            cx="88"
            cy="88"
            r="80"
            className="stroke-indigo-500 fill-none transition-all duration-300"
            strokeWidth="5"
            strokeDasharray={strokeDash}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Time Text */}
        <div className="absolute text-center select-none">
          <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-none">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5 block">
            {mode === 'work' ? 'Keep Focusing' : 'Rest Time'}
          </span>
        </div>
      </div>

      {/* Clock Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTimer}
          className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center"
        >
          {isActive ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
        </button>

        <button
          onClick={resetTimer}
          className="p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-250 bg-white/20 dark:bg-slate-900/10 transition-all cursor-pointer flex items-center justify-center"
        >
          <RotateCcw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Sessions completed indicator */}
      <div className="mt-5 flex items-center gap-1.5 text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
        <Award className="w-3.5 h-3.5 text-indigo-500" />
        <span>Focus Sessions Finished: {sessionsCompleted}</span>
      </div>

      {/* FOCUS MODE FULLSCREEN OVERLAY */}
      <AnimatePresence>
        {focusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#06080e]/95 backdrop-blur-md z-[9999] flex flex-col items-center justify-center px-4"
          >
            {/* Exit Focus Mode Header */}
            <button
              onClick={() => setFocusMode(false)}
              className="absolute top-8 right-8 px-4 py-2 rounded-xl border border-white/10 hover:border-white/25 text-white/60 hover:text-white transition-all text-xs font-bold bg-white/5 cursor-pointer"
            >
              Exit Focus Mode
            </button>

            {/* Float Blobs inside Focus Overlay */}
            <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="max-w-md w-full flex flex-col items-center space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-white/90">Deep Focus active</h2>
                <p className="text-xs text-slate-450 dark:text-slate-500 max-w-xs leading-relaxed mx-auto">
                  Distractions are silenced. Breathe and keep on track with your goals.
                </p>
              </div>

              {/* Duplicate circle display for overlay */}
              <div className="relative w-52 h-52 flex items-center justify-center bg-white/5 rounded-full p-2 border border-white/5 shadow-inner">
                <svg className="absolute w-full h-full transform -rotate-90 top-0 left-0">
                  <circle
                    cx="104"
                    cy="104"
                    r="94"
                    className="stroke-white/5 fill-none"
                    strokeWidth="4"
                  />
                  <circle
                    cx="104"
                    cy="104"
                    r="94"
                    className="stroke-indigo-500 fill-none transition-all duration-300"
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 94}
                    strokeDashoffset={2 * Math.PI * 94 - (progressPercent / 100) * (2 * Math.PI * 94)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center select-none z-10">
                  <div className="text-4xl font-extrabold tracking-tight text-white leading-none">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 block">
                    {mode === 'work' ? 'Time to grind' : 'Breathe out'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTimer}
                  className="p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {isActive ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-3.5 rounded-2xl border border-white/10 text-white/60 hover:text-white bg-white/5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Sound Controls */}
              <button
                onClick={() => setSoundEnabled(prev => !prev)}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  soundEnabled
                    ? 'bg-indigo-600 text-white border-transparent'
                    : 'border-white/10 text-white/50 bg-white/5 hover:border-white/20'
                }`}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4" /> Sound On (Filtered Rain)
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" /> Sound Off
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
