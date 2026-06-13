import { useState, useEffect } from 'react';
import { useTheme } from '../App';
import {
  getSavingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
  allocateToGoal, formatRupiah
} from '../utils/storage';
import { Plus, X, Check, Trash2, Target, Plus as PlusIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SavingsGoals() {
  const { theme } = useTheme();
  const { requireAuth } = useAuth();
  const isDark = theme === 'dark';
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [allocateModal, setAllocateModal] = useState(null); // goal id
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    emoji: '🎯',
    color: '#8b5cf6',
  });
  const [allocateAmount, setAllocateAmount] = useState('');
  const [allocateNote, setAllocateNote] = useState('');

  const EMOJIS = ['🎯', '🏠', '📱', '✈️', '🎮', '💻', '👟', '🎓', '🚗', '💍', '🎸', '📸'];
  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#6366f1'];

  const reload = () => setGoals(getSavingsGoals());
  useEffect(() => { reload(); }, []);

  const handleAdd = () => {
    if (!form.name || !form.targetAmount || Number(form.targetAmount) <= 0) return;
    addSavingsGoal({
      name: form.name,
      targetAmount: Number(form.targetAmount),
      deadline: form.deadline,
      emoji: form.emoji,
      color: form.color,
    });
    setForm({ name: '', targetAmount: '', deadline: '', emoji: '🎯', color: '#8b5cf6' });
    setShowForm(false);
    reload();
  };

  const handleAllocate = () => {
    if (!allocateAmount || Number(allocateAmount) <= 0) return;
    allocateToGoal(allocateModal, Number(allocateAmount), allocateNote);
    setAllocateModal(null);
    setAllocateAmount('');
    setAllocateNote('');
    reload();
  };

  const handleDelete = (id) => {
    deleteSavingsGoal(id);
    setDeleteConfirm(null);
    reload();
  };

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + (g.currentAmount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Target Nabung</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Wujudkan impianmu satu per satu ✨
          </p>
        </div>
        <button onClick={() => requireAuth(() => setShowForm(true))} className="btn-primary">
          <Plus size={16} /> Buat Target
        </button>
      </div>

      {/* ── Overall Progress ── */}
      {goals.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-600 p-5 shadow-xl shadow-violet-500/20">
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 blur-xl" />
          <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider">Total Terkumpul</p>
          <p className="text-3xl font-bold text-white mt-1">{formatRupiah(totalSaved)}</p>
          <p className="text-violet-200 text-xs mt-0.5">dari {formatRupiah(totalTarget)} target</p>
          <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Add Goal Form ── */}
      {showForm && (
        <div className={`p-5 rounded-2xl border space-y-4 animate-slide-up ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Buat Target Baru</h3>
            <button onClick={() => setShowForm(false)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
              <X size={16} />
            </button>
          </div>

          {/* Emoji Picker */}
          <div>
            <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pilih Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setForm(f => ({ ...f, emoji: e }))}
                  className={`w-10 h-10 rounded-xl text-xl transition-all ${form.emoji === e
                    ? 'bg-violet-500/20 ring-2 ring-violet-500 scale-110'
                    : isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Warna</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-white scale-110' : ''}`}
                  style={{ backgroundColor: c, ringOffsetColor: isDark ? '#111827' : '#f9fafb' }}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nama Target</label>
            <input
              type="text"
              placeholder="Contoh: Beli HP baru"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={`input border ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:border-violet-500' : 'bg-gray-50 border-gray-200 focus:border-violet-400'}`}
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Jumlah Target (Rp)</label>
            <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Rp</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={form.targetAmount ? Number(form.targetAmount).toLocaleString('id-ID') : ''}
                onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value.replace(/\D/g, '').replace(/\./g, '') }))}
                className={`flex-1 bg-transparent outline-none font-bold text-lg ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900'}`}
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Deadline (opsional)</label>
            <input
              type="date"
              value={form.deadline}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              className={`input border font-medium ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-violet-500' : 'bg-gray-50 border-gray-200 focus:border-violet-400'}`}
            />
          </div>

          <button onClick={handleAdd} className="w-full btn-primary py-3">
            <Check size={16} /> Buat Target
          </button>
        </div>
      )}

      {/* ── Goals List ── */}
      {goals.length === 0 && !showForm ? (
        <EmptyGoals isDark={isDark} onAdd={() => requireAuth(() => setShowForm(true))} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map(goal => {
            const pct = Math.min(((goal.currentAmount || 0) / goal.targetAmount) * 100, 100);
            const remaining = goal.targetAmount - (goal.currentAmount || 0);
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
              : null;
            const isDone = pct >= 100;

            return (
              <div key={goal.id} className={`p-5 rounded-2xl border transition-all group ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                {/* Top Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                      style={{ backgroundColor: goal.color + '22', border: `2px solid ${goal.color}44` }}
                    >
                      {goal.emoji}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{goal.name}</p>
                      {daysLeft !== null && (
                        <p className={`text-xs ${daysLeft < 0 ? 'text-red-400' : daysLeft < 30 ? 'text-amber-400' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)} hari lalu` : daysLeft === 0 ? 'Hari ini!' : `${daysLeft} hari lagi`}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => requireAuth(() => setDeleteConfirm(goal.id))}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Amount */}
                <div className="mb-3">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="font-bold text-base">{formatRupiah(goal.currentAmount || 0)}</span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      dari {formatRupiah(goal.targetAmount)}
                    </span>
                  </div>
                  <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: isDone ? '#10b981' : goal.color }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs font-bold" style={{ color: isDone ? '#10b981' : goal.color }}>
                      {isDone ? '🎉 Tercapai!' : `${pct.toFixed(0)}%`}
                    </span>
                    {!isDone && (
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Kurang {formatRupiah(remaining)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Allocate Button */}
                {!isDone && (
                  <button
                    onClick={() => requireAuth(() => setAllocateModal(goal.id))}
                    className={`w-full py-2 rounded-xl text-sm font-semibold border transition-all
                      ${isDark ? 'border-gray-700 hover:border-violet-500/50 hover:text-violet-400 text-gray-400' : 'border-gray-200 hover:border-violet-300 hover:text-violet-600 text-gray-500'}`}
                  >
                    + Tambah Dana
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Allocate Modal ── */}
      {allocateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold">Tambah Dana</h3>
              <button onClick={() => setAllocateModal(null)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Jumlah (Rp)</label>
                <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    placeholder="0"
                    value={allocateAmount ? Number(allocateAmount).toLocaleString('id-ID') : ''}
                    onChange={e => setAllocateAmount(e.target.value.replace(/\D/g, '').replace(/\./g, ''))}
                    className={`flex-1 bg-transparent outline-none font-bold text-lg ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Catatan (opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: dari bonus bulan ini"
                  value={allocateNote}
                  onChange={e => setAllocateNote(e.target.value)}
                  className={`input border ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:border-violet-500' : 'bg-gray-50 border-gray-200 focus:border-violet-400'}`}
                />
              </div>
              <button onClick={handleAllocate} className="w-full btn-primary py-3">
                <Check size={16} /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-4xl text-center mb-3">🗑️</div>
            <h3 className="text-lg font-bold text-center mb-1">Hapus target nabung?</h3>
            <p className={`text-sm text-center mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Semua progress dan dana yang sudah dikumpulkan akan hilang.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className={`flex-1 btn border ${isDark ? 'border-gray-700 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}>Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 btn-danger">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyGoals({ isDark, onAdd }) {
  return (
    <div className={`py-16 text-center rounded-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
      <div className="text-5xl mb-3">🎯</div>
      <p className="font-semibold mb-1">Belum ada target nabung</p>
      <p className={`text-sm mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Yuk bikin target biar makin semangat nabung!
      </p>
      <button onClick={onAdd} className="btn-primary mx-auto">
        <Plus size={16} /> Buat Target Nabung
      </button>
    </div>
  );
}
