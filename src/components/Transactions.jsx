import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../App';
import {
  getTransactions, getCategories, addTransaction, updateTransaction,
  deleteTransaction, formatRupiah, BULAN_ID
} from '../utils/storage';
import TransactionModal from './modals/TransactionModal';
import { Plus, Search, Trash2, Pencil, X } from 'lucide-react';

export default function Transactions() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [transactions, setTransactions] = useState(getTransactions);
  const [categories, setCategories] = useState(getCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [filterMonth, setFilterMonth] = useState('');

  const reload = () => {
    setTransactions(getTransactions());
    setCategories(getCategories());
  };

  const allCats = useMemo(() => [
    ...(categories.income || []),
    ...(categories.expense || []),
  ], [categories]);

  const getCat = (id) => allCats.find(c => c.id === id);

  // Filter transaksi
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (filterCat !== 'all' && tx.categoryId !== filterCat) return false;
      if (filterMonth) {
        const txDate = new Date(tx.date);
        const [y, m] = filterMonth.split('-').map(Number);
        if (txDate.getFullYear() !== y || txDate.getMonth() + 1 !== m) return false;
      }
      if (search) {
        const cat = getCat(tx.categoryId);
        const haystack = [cat?.name, tx.note, formatRupiah(tx.amount)].join(' ').toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterCat, filterMonth, search]);

  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(tx => {
      const key = new Date(tx.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });
    return Object.entries(groups);
  }, [filtered]);

  const handleSave = (formData) => {
    if (editingTx) {
      updateTransaction(editingTx.id, formData);
    } else {
      addTransaction(formData);
    }
    setEditingTx(null);
    setShowModal(false);
    reload();
  };

  const handleDelete = (id) => {
    deleteTransaction(id);
    setDeleteConfirm(null);
    reload();
  };

  const hasActiveFilter = filterType !== 'all' || filterCat !== 'all' || filterMonth || search;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaksi</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {filtered.length} transaksi
          </p>
        </div>
        <button onClick={() => { setEditingTx(null); setShowModal(true); }} className="btn-primary">
          <Plus size={16} /> Tambah
        </button>
      </div>

      {/* ── Filters ── */}
      <div className={`p-4 rounded-2xl space-y-3 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
        {/* Search */}
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <Search size={16} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'placeholder-gray-600' : 'placeholder-gray-400'}`}
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={14} className="text-gray-400" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Type Filter */}
          <FilterSelect
            value={filterType}
            onChange={setFilterType}
            isDark={isDark}
            options={[
              { value: 'all', label: 'Semua Tipe' },
              { value: 'income', label: '💚 Uang Masuk' },
              { value: 'expense', label: '❤️ Uang Keluar' },
            ]}
          />

          {/* Category Filter */}
          <FilterSelect
            value={filterCat}
            onChange={setFilterCat}
            isDark={isDark}
            options={[
              { value: 'all', label: 'Semua Kategori' },
              ...allCats.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` })),
            ]}
          />

          {/* Month Filter */}
          <input
            type="month"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className={`text-sm px-3 py-2 rounded-xl border outline-none font-medium cursor-pointer
              ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
          />

          {/* Reset */}
          {hasActiveFilter && (
            <button
              onClick={() => { setSearch(''); setFilterType('all'); setFilterCat('all'); setFilterMonth(''); }}
              className={`flex items-center gap-1 text-sm px-3 py-2 rounded-xl font-medium transition-colors
                ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}
            >
              <X size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Transaction List ── */}
      {grouped.length === 0 ? (
        <EmptyTx isDark={isDark} onAdd={() => setShowModal(true)} hasFilter={hasActiveFilter} />
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, txs]) => {
            const dayTotal = txs.reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0);
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{date}</p>
                  <p className={`text-xs font-bold ${dayTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {dayTotal >= 0 ? '+' : ''}{formatRupiah(dayTotal)}
                  </p>
                </div>
                <div className={`rounded-2xl overflow-hidden divide-y ${isDark ? 'bg-gray-900 border border-gray-800 divide-gray-800' : 'bg-white border border-gray-200 divide-gray-100 shadow-sm'}`}>
                  {txs.map(tx => {
                    const cat = getCat(tx.categoryId);
                    return (
                      <TxRow
                        key={tx.id}
                        tx={tx}
                        cat={cat}
                        isDark={isDark}
                        onEdit={() => { setEditingTx(tx); setShowModal(true); }}
                        onDelete={() => setDeleteConfirm(tx.id)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modals ── */}
      {showModal && (
        <TransactionModal
          transaction={editingTx}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingTx(null); }}
        />
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-4xl text-center mb-3">🗑️</div>
            <h3 className="text-lg font-bold text-center mb-1">Hapus transaksi?</h3>
            <p className={`text-sm text-center mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Transaksi ini akan dihapus permanen. Yakin?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className={`flex-1 btn border ${isDark ? 'border-gray-700 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                Batal
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 btn-danger">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ value, onChange, options, isDark }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`text-sm px-3 py-2 rounded-xl border outline-none font-medium cursor-pointer
        ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function TxRow({ tx, cat, isDark, onEdit, onDelete }) {
  const isIncome = tx.type === 'income';
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 group transition-colors ${isDark ? 'hover:bg-white/3' : 'hover:bg-gray-50'}`}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: (cat?.color || '#8b5cf6') + '22' }}
      >
        {cat?.icon || '💸'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{cat?.name || tx.categoryId}</p>
        {tx.note && <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{tx.note}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className={`text-sm font-bold ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
            {isIncome ? '+' : '-'}{formatRupiah(tx.amount)}
          </p>
        </div>
        {/* Action buttons - visible on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyTx({ isDark, onAdd, hasFilter }) {
  return (
    <div className={`py-16 text-center rounded-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
      <div className="text-5xl mb-3">{hasFilter ? '🔍' : '📭'}</div>
      <p className="font-semibold mb-1">{hasFilter ? 'Tidak ada yang cocok' : 'Belum ada transaksi'}</p>
      <p className={`text-sm mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        {hasFilter ? 'Coba ubah filter pencarianmu' : 'Catat transaksi pertamamu sekarang!'}
      </p>
      {!hasFilter && (
        <button onClick={onAdd} className="btn-primary mx-auto">
          <Plus size={16} /> Tambah Transaksi
        </button>
      )}
    </div>
  );
}
