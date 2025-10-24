import { useEffect, useMemo, useRef, useState } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

const defaultSettings = () => {
  const saved = localStorage.getItem('levelup_pomodoro_settings');
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  return { focus: 25, break: 5, autoStartBreak: true };
};

export default function Pomodoro({ onComplete }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [secondsLeft, setSecondsLeft] = useState(settings.focus * 60);
  const [running, setRunning] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('levelup_pomodoro_settings', JSON.stringify(settings));
  }, [settings]);

  // If settings change and match current mode, update remaining immediately
  useEffect(() => {
    setSecondsLeft((prev) => {
      const total = (mode === 'focus' ? settings.focus : settings.break) * 60;
      // If the user updates the slider, reflect immediately if not running
      if (!running) return total;
      // If running, keep remaining ratio consistent relative to new total
      const oldTotal = mode === 'focus' ? (settings.focus * 60) : (settings.break * 60);
      if (!oldTotal) return total;
      const ratio = Math.max(0, Math.min(prev / oldTotal, 1));
      return Math.round(total * ratio);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.focus, settings.break]);

  const formatted = useMemo(() => {
    const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const s = (secondsLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [secondsLeft]);

  const start = () => {
    if (running) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          handleCompleteCycle();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    const total = (mode === 'focus' ? settings.focus : settings.break) * 60;
    setSecondsLeft(total);
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    const total = (nextMode === 'focus' ? settings.focus : settings.break) * 60;
    setSecondsLeft(total);
  };

  const handleCompleteCycle = () => {
    if (mode === 'focus') {
      // Notify completion with focus minutes
      onComplete?.(settings.focus);
      // Auto switch to break
      switchMode('break');
      if (settings.autoStartBreak) {
        setTimeout(() => start(), 500);
      }
    } else {
      // Break complete -> go back to focus but don't auto-start
      switchMode('focus');
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold">Pomodoro</h2>
          <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${mode === 'focus' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-emerald-500/20 text-emerald-300'}`}>{mode === 'focus' ? 'Focus' : 'Break'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span>Auto-break</span>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.autoStartBreak}
              onChange={(e) => setSettings((s) => ({ ...s, autoStartBreak: e.target.checked }))}
            />
            <div className="w-9 h-5 bg-white/10 peer-checked:bg-cyan-500/60 rounded-full relative">
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
            </div>
          </label>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-6xl font-semibold tracking-tight">
            {formatted}
          </div>
          <div className="mt-4 flex items-center gap-3">
            {!running ? (
              <button onClick={start} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:opacity-90 transition">
                <Play className="w-4 h-4" /> Start
              </button>
            ) : (
              <button onClick={pause} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 transition">
                <Pause className="w-4 h-4" /> Pause
              </button>
            )}
            <button onClick={reset} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 transition">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-white/70">Focus (minutes)</label>
              <span className="text-sm font-medium">{settings.focus}</span>
            </div>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={settings.focus}
              onChange={(e) => setSettings((s) => ({ ...s, focus: Number(e.target.value) }))}
              className="w-full accent-fuchsia-400"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-white/70">Break (minutes)</label>
              <span className="text-sm font-medium">{settings.break}</span>
            </div>
            <input
              type="range"
              min={3}
              max={30}
              step={1}
              value={settings.break}
              onChange={(e) => setSettings((s) => ({ ...s, break: Number(e.target.value) }))}
              className="w-full accent-cyan-400"
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-3 text-xs text-white/60">
            <span>Instantly saved • Adjust sliders anytime, the timer syncs without page reload.</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
        <span>Tip:</span>
        <span>Complete a focus session to earn EXP and coins automatically.</span>
      </div>
    </div>
  );
}
