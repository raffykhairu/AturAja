import { useState, useEffect } from 'react';
import { useTheme } from '../../App';
import { getCategories } from '../../utils/storage';
import { X, Check, TrendingUp, TrendingDown } from 'lucide-react';

// ===================================
// Modal Tambah / Edit Transaksi
// ===================================
export default function TransactionModal({ transaction, onSave, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const categories = getCategories();
  const isEditing = !!transaction;

  const [form, setForm] = useState({
    type: transaction?.type || 'expense',
    amount: transaction?.amount || '',
    categoryId: transaction?.categoryId || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    note: transaction?.note || '',
  });
  const [error, setError] = useState('');

  // Kategori default akan di-set saat mengubah tipe transaksi

  const currentCats = categories[form.type] || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Jumlah uang harus lebih dari 0');
      return;
    }
    if (!form.categoryId) {
      setError('Pilih kategori dulu ya');
      return;
    }
    onSave({ ...form, amount: Number(form.amount) });
  };

  const formatAmountInput = (val) => {
    // Hanya angka
    return val.replace(/\D/g, '');
  };

  const displayAmount = form.amount
    ? Number(form.amount).toLocaleString('id-ID')
    : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`
        w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-slide-up
        ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Toggle Tipe */}
          <div className={`flex gap-2 p-1 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <TypeBtn
              active={form.type === 'income'}
              onClick={() => setForm(f => ({ ...f, type: 'income', categoryId: categories.income?.[0]?.id || '' }))}
              icon={<TrendingUp size={15} />}
              label="Uang Masuk"
              color="text-emerald-400"
              activeBg={isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}
              isDark={isDark}
            />
            <TypeBtn
              active={form.type === 'expense'}
              onClick={() => setForm(f => ({ ...f, type: 'expense', categoryId: categories.expense?.[0]?.id || '' }))}
              icon={<TrendingDown size={15} />}
              label="Uang Keluar"
              color="text-red-400"
              activeBg={isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'}
              isDark={isDark}
            />
          </div>

          {/* Jumlah */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Jumlah (Rp)
            </label>
            <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700 focus-within:border-violet-500' : 'bg-gray-50 border-gray-200 focus-within:border-violet-400'
            }`}>
              <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Rp</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={displayAmount}
                onChange={e => setForm(f => ({ ...f, amount: formatAmountInput(e.target.value.replace(/\./g, '')) }))}
                className={`flex-1 bg-transparent outline-none text-lg font-bold ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-300'}`}
              />
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Kategori
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {currentCats.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, categoryId: cat.id }))}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-150
                    ${form.categoryId === cat.id
                      ? isDark ? 'bg-violet-500/20 border-violet-500 text-violet-300' : 'bg-violet-50 border-violet-400 text-violet-700'
                      : isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tanggal */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Tanggal
            </label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className={`
                input border font-medium
                ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-violet-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400'}
              `}
            />
          </div>

          {/* Catatan */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Catatan (opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: beli es teh sama gorengan"
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              className={`
                input border
                ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:border-violet-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400'}
              `}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm font-medium">{error}</p>
          )}

          {/* Submit */}
          <button type="submit" className="w-full btn-primary py-3 text-base mt-2">
            <Check size={18} />
            {isEditing ? 'Simpan Perubahan' : 'Tambah Transaksi'}
          </button>
        </form>
      </div>
    </div>
  );
}

function TypeBtn({ active, onClick, icon, label, activeBg, isDark }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold
        transition-all duration-200
        ${active ? activeBg : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
