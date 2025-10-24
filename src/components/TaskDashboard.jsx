import { useMemo, useState } from 'react';
import { CheckCircle2, PlusCircle } from 'lucide-react';

function heuristicClassify({ title, description }) {
  const text = `${title} ${description}`.toLowerCase();
  let category = 'Skill';
  if (/(workout|run|gym|pushup|yoga|walk|cycle|exercise)/.test(text)) category = 'Strength';
  else if (/(study|read|learn|course|math|science|research)/.test(text)) category = 'Intelligence';
  else if (/(meditate|fast|habit|quit|discipline|journal)/.test(text)) category = 'Will Power';
  else if (/(code|design|practice|build|prototype|write)/.test(text)) category = 'Skill';
  else if (/(network|social|call|meeting|present|speak)/.test(text)) category = 'Charisma';

  let difficulty = 'Medium';
  if (text.length < 30) difficulty = 'Easy';
  if (/(hard|long|complex|deadline|exam|marathon)/.test(text)) difficulty = 'Hard';

  const expValue = difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 20 : 30;
  return { category, difficulty, expValue };
}

export default function TaskDashboard({ tasks, onAddTask, onToggleTaskComplete }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pendingTasks = useMemo(() => tasks.filter((t) => t.status !== 'done'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'done'), [tasks]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const ai = heuristicClassify({ title, description });
      onAddTask?.({ title: title.trim(), description: description.trim(), ...ai });
      setTitle('');
      setDescription('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <span className="text-sm text-white/60">{pendingTasks.length} pending • {completedTasks.length} done</span>
      </div>
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task title"
          className="md:col-span-2 rounded-md bg-white/10 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-fuchsia-500"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          className="md:col-span-2 rounded-md bg-white/10 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button
          disabled={submitting}
          className="md:col-span-1 inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:opacity-90 disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4" /> Add Task
        </button>
      </form>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {pendingTasks.map((t) => (
          <div key={t.id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{t.title}</div>
              {t.description ? <div className="text-sm text-white/70 mt-1">{t.description}</div> : null}
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80">{t.category}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80">{t.difficulty}</span>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 text-white/90">+{t.expValue} EXP</span>
              </div>
            </div>
            <button onClick={() => onToggleTaskComplete?.(t.id)} className="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-white/10 hover:bg-white/15">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mark Done
            </button>
          </div>
        ))}
        {pendingTasks.length === 0 && (
          <div className="text-center text-white/60 text-sm py-6 border border-dashed border-white/10 rounded-xl">
            No pending tasks. Add one above to start leveling up.
          </div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="mt-6">
          <div className="text-sm text-white/60 mb-2">Completed</div>
          <div className="grid grid-cols-1 gap-2">
            {completedTasks.map((t) => (
              <div key={t.id} className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between opacity-80">
                <div>
                  <div className="font-medium line-through text-white/70">{t.title}</div>
                  <div className="text-xs text-white/50 mt-1">{t.category} • {t.difficulty} • +{t.expValue} EXP</div>
                </div>
                <button onClick={() => onToggleTaskComplete?.(t.id)} className="text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/15">Undo</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
