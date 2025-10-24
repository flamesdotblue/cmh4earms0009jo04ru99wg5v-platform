import { User, Flame, Star } from 'lucide-react';

function nextThreshold(level) {
  const map = {
    1: 100,
    2: 300,
    3: 600,
    4: 1000,
    5: 1500,
  };
  return map[level] ?? 1500;
}

export default function ProfileStats({ exp, coins, level, levelName, progress, sessionsToday, focusMinutesToday }) {
  const pct = Math.min(100, Math.round(progress * 100));
  const next = nextThreshold(level);

  return (
    <aside className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-5 sticky top-24">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500/40 to-cyan-500/40 flex items-center justify-center border border-white/10">
          <User className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-white/60">Level {level}</div>
          <div className="text-lg font-semibold">{levelName}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-fuchsia-400 to-cyan-400" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-white/70">
          <span>{exp} EXP</span>
          <span>Next at {next} EXP</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-white/60">Coins</div>
          <div className="text-lg font-semibold text-amber-300">{coins}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-center gap-1 text-xs text-white/60"><Flame className="w-4 h-4 text-orange-400" /> Sessions</div>
          <div className="text-lg font-semibold">{sessionsToday}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-center gap-1 text-xs text-white/60"><Star className="w-4 h-4 text-cyan-300" /> Focus</div>
          <div className="text-lg font-semibold">{focusMinutesToday}m</div>
        </div>
      </div>

      <div className="mt-6 text-sm text-white/70">
        Keep your streaks alive by completing at least one Pomodoro session daily and finishing tasks. Your avatar evolves every few levels.
      </div>
    </aside>
  );
}
