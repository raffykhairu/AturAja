import { useState, useEffect } from 'react';
import { useTheme } from '../App';
import { getCategories, addCategory, deleteCategory } from '../utils/storage';
import { Plus, X, Trash2, Tags } from 'lucide-react';

const DEFAULT_ICONS = ['🍜', '🚗', '🛍️', '🎮', '📚', '💊', '📱', '✈️', '🏠', '💰', '🎁', '💼', '☕', '🎵', '🏋️', '🐶', '🎂', '⚽', '📷', '🌸', '🔧', '💡', '🎯', '🌮'];
const DEFAULT_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#6366f1', '#84cc16', '#f97316', '#14b8a6', '#a855f7'];

export default function Categories() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [activeTab, setActiveTab] = useState('expense');
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '🏷️', color: '#8b5cf6' });

  const reload = () => setCategories(getCategories());
  useEffect(() => { reload(); }, []);

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addCategory(activeTab, { name: form.name.trim(), icon: form.icon, color: form.color });
    setForm({ name: '', icon: '🏷️', color: '#8b5cf6' });
    setShowForm(false);
    reload();
  };

  const handleDelete = (type, id) => {
    deleteCategory(type, id);
    setDeleteConfirm(null);
    reload();
  };

  // Pisahkan default vs custom
  const currentCats = categories[activeTab] || [];
  const DEFAULT_IDS = {
    expense: ['makan', 'transport', 'belanja', 'hiburan', 'pendidikan', 'kesehatan', 'tagihan', 'lainnya_keluar'],
    income: ['uang_saku', 'kerja_sampingan', 'hadiah', 'lainnya_masuk'],
  };
  const defaultCats = currentCats.filter(c => DEFAULT_IDS[activeTab]?.includes(c.id));
  const customCats = currentCats.filter(c => !DEFAULT_IDS[activeTab]?.includes(c.id));

  const cardBg = isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm';

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Kelola Kategori</h1>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Tambah kategori custom sesuai kebutuhanmu
        </p>
      </div>

      {/* ── Tab ── */}
      <div className={`flex gap-2 p-1 rounded-xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-gray-100'}`}>
        {[
          { id: 'expense', label: '❤️ Uang Keluar' },
          { id: 'income',  label: '💚 Uang Masuk' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowForm(false); }}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200
              ${activeTab === tab.id
                ? isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-white text-violet-700 shadow-sm'
                : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Kategori Default ── */}
      <div className={`p-5 rounded-2xl ${cardBg}`}>
        <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
            Default
          </span>
          Tidak bisa dihapus
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {defaultCats.map(cat => (
            <div
              key={cat.id}
              className={`flex items-center gap-2.5 p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: cat.color + '22' }}
              >
                {cat.icon}
              </div>
              <span className="text-sm font-medium truncate">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Kategori Custom ── */}
      <div className={`p-5 rounded-2xl ${cardBg}`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs bg-violet-500/15 text-violet-400`}>
              Custom
            </span>
            {customCats.length} kategori
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary py-1.5 px-3 text-xs"
          >
            <Plus size={13} /> Tambah
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className={`p-4 rounded-xl border mb-3 space-y-3 animate-slide-up ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            {/* Icon Picker */}
            <div>
              <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Icon</label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {DEFAULT_ICONS.map(e => (
                  <button
                    key={e}
                    onClick={() => setForm(f => ({ ...f, icon: e }))}
                    className={`w-9 h-9 rounded-lg text-lg transition-all ${form.icon === e
                      ? 'bg-violet-500/20 ring-2 ring-violet-500 scale-110'
                      : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 border border-gray-200'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Warna</label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-1 scale-110' : ''}`}
                    style={{ backgroundColor: c, '--tw-ring-color': c, '--tw-ring-offset-color': isDark ? '#1f2937' : '#f9fafb' }}
                  />
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nama Kategori</label>
              <input
                type="text"
                placeholder="Nama kategori baru..."
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                className={`input border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-violet-500' : 'bg-white border-gray-200 focus:border-violet-400'}`}
              />
            </div>

            {/* Preview & Save */}
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: form.color + '22' }}
              >
                {form.icon}
              </div>
              <span className="flex-1 text-sm font-medium">{form.name || 'Nama kategori...'}</span>
              <button onClick={handleAdd} className="btn-primary py-2 px-4 text-xs">Simpan</button>
              <button onClick={() => setShowForm(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-400'}`}>
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {customCats.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-3xl mb-2">🏷️</div>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Belum ada kategori custom
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {customCats.map(cat => (
              <div
                key={cat.id}
                className={`flex items-center gap-2.5 p-3 rounded-xl group ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: cat.color + '22' }}
                >
                  {cat.icon}
                </div>
                <span className="text-sm font-medium flex-1 truncate">{cat.name}</span>
                <button
                  onClick={() => setDeleteConfirm({ type: activeTab, id: cat.id, name: cat.name })}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-4xl text-center mb-3">🗑️</div>
            <h3 className="text-lg font-bold text-center mb-1">Hapus "{deleteConfirm.name}"?</h3>
            <p className={`text-sm text-center mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Kategori ini akan dihapus. Transaksi yang sudah pakai kategori ini tidak terpengaruh.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className={`flex-1 btn border ${isDark ? 'border-gray-700 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                Batal
              </button>
              <button onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.id)} className="flex-1 btn-danger">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
