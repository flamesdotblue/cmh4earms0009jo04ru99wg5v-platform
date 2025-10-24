import { useCallback, useEffect, useMemo, useState } from 'react';
import HeroCover from './components/HeroCover';
import Pomodoro from './components/Pomodoro';
import TaskDashboard from './components/TaskDashboard';
import ProfileStats from './components/ProfileStats';
import { Rocket, Settings } from 'lucide-react';

const levelThresholds = [
  { level: 1, name: 'Novice', min: 0, max: 99 },
  { level: 2, name: 'Learner', min: 100, max: 299 },
  { level: 3, name: 'Explorer', min: 300, max: 599 },
  { level: 4, name: 'Achiever', min: 600, max: 999 },
  { level: 5, name: 'Pro', min: 1000, max: 1499 },
  { level: 6, name: 'Hero', min: 1500, max: Infinity },
];

function getLevelInfo(exp) {
  return levelThresholds.find((t) => exp >= t.min && exp <= t.max) || levelThresholds[levelThresholds.length - 1];
}

export default function App() {
  const [exp, setExp] = useState(() => Number(localStorage.getItem('levelup_exp') || 0));
  const [coins, setCoins] = useState(() => Number(localStorage.getItem('levelup_coins') || 0));
  const [sessionsToday, setSessionsToday] = useState(() => Number(localStorage.getItem('levelup_sessions_today') || 0));
  const [focusMinutesToday, setFocusMinutesToday] = useState(() => Number(localStorage.getItem('levelup_focus_minutes_today') || 0));
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('levelup_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => localStorage.setItem('levelup_exp', String(exp)), [exp]);
  useEffect(() => localStorage.setItem('levelup_coins', String(coins)), [coins]);
  useEffect(() => localStorage.setItem('levelup_sessions_today', String(sessionsToday)), [sessionsToday]);
  useEffect(() => localStorage.setItem('levelup_focus_minutes_today', String(focusMinutesToday)), [focusMinutesToday]);
  useEffect(() => localStorage.setItem('levelup_tasks', JSON.stringify(tasks)), [tasks]);

  const levelInfo = useMemo(() => getLevelInfo(exp), [exp]);

  const addExpAndCoins = useCallback((amountExp, amountCoins = 0) => {
    setExp((e) => e + amountExp);
    if (amountCoins) setCoins((c) => c + amountCoins);
  }, []);

  const onPomodoroComplete = useCallback((focusMinutes) => {
    // Reward: +20 EXP per completed Pomodoro, +5 coins; plus focus minutes added
    addExpAndCoins(20, 5);
    setSessionsToday((s) => s + 1);
    setFocusMinutesToday((m) => m + focusMinutes);
  }, [addExpAndCoins]);

  const onAddTask = useCallback((task) => {
    setTasks((prev) => [{ ...task, id: crypto.randomUUID(), status: 'pending', created_at: new Date().toISOString() }, ...prev]);
  }, []);

  const onToggleTaskComplete = useCallback((id) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== id) return t;
        const newStatus = t.status === 'done' ? 'pending' : 'done';
        return { ...t, status: newStatus, completed_at: newStatus === 'done' ? new Date().toISOString() : null };
      });

      const justCompleted = updated.find((t) => t.id === id && t.status === 'done');
      if (justCompleted) {
        // EXP by difficulty: Easy 10, Medium 20, Hard 30
        const expByDiff = { Easy: 10, Medium: 20, Hard: 30 };
        const rewardExp = expByDiff[justCompleted.difficulty] ?? 10;
        const rewardCoins = Math.ceil(rewardExp / 5);
        addExpAndCoins(rewardExp, rewardCoins);
      }
      return updated;
    });
  }, [addExpAndCoins]);

  const levelProgress = useMemo(() => {
    const { min, max } = levelInfo;
    const range = max - min;
    const within = Math.max(0, Math.min(exp - min, range));
    return range === Infinity ? 1 : within / range;
  }, [levelInfo, exp]);

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white">
      <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10 bg-black/40">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-fuchsia-400" />
            <span className="font-semibold tracking-tight">LevelUp Life</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-white/70">Level</span>
              <span className="font-medium">{levelInfo.level}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/80">{levelInfo.name}</span>
            </div>
            <div className="w-40 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-fuchsia-400 to-cyan-400" style={{ width: `${Math.min(100, Math.round(levelProgress * 100))}%` }} />
            </div>
            <div className="flex items-center gap-1 text-white/80">
              <span className="text-white/60">EXP</span>
              <span className="font-medium">{exp}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-300">
              <span>Coins</span>
              <span className="font-medium">{coins}</span>
            </div>
            <button className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 bg-white/10 hover:bg-white/15 transition">
              <Settings className="w-4 h-4" />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </div>
      </header>

      <section className="relative h-[60vh] w-full">
        <HeroCover />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-black/20 to-black/80" />
        <div className="absolute inset-x-0 bottom-6 mx-auto max-w-5xl px-4 pointer-events-none">
          <div className="backdrop-blur rounded-2xl border border-white/10 bg-black/30 p-4 flex items-center justify-between">
            <div className="pointer-events-auto">
              <p className="text-sm text-white/70">Today</p>
              <p className="text-white text-lg">{focusMinutesToday} minutes focused • {sessionsToday} Pomodoro sessions</p>
            </div>
            <div className="hidden md:flex items-center gap-3 pointer-events-auto">
              <div className="text-sm text-white/70">Current: {levelInfo.name}</div>
              <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-fuchsia-400 to-cyan-400" style={{ width: `${Math.min(100, Math.round(levelProgress * 100))}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Pomodoro onComplete={onPomodoroComplete} />
          <TaskDashboard tasks={tasks} onAddTask={onAddTask} onToggleTaskComplete={onToggleTaskComplete} />
        </div>
        <div className="lg:col-span-1">
          <ProfileStats
            exp={exp}
            coins={coins}
            level={levelInfo.level}
            levelName={levelInfo.name}
            progress={levelProgress}
            sessionsToday={sessionsToday}
            focusMinutesToday={focusMinutesToday}
          />
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-white/50 text-sm">
        Built with love • Gemini-ready • Supabase-ready • Vercel optimized
      </footer>
    </div>
  );
}
