import { useState, useEffect } from 'react';
import { useTheme } from '../App';
import {
  getTransactions, getCategories, addTransaction, updateTransaction,
  deleteTransaction, formatRupiah, calcBalance, calcTotals,
  getTransactionsByMonth, isBackupNeededToday, BULAN_ID
} from '../utils/storage';
import TransactionModal from './modals/TransactionModal';
import {
  Plus, TrendingUp, TrendingDown, Wallet, ArrowRight,
  Download, Bell, Sparkles
} from 'lucide-react';

// ===================================
// Dashboard Page
// ===================================
export default function Dashboard({ setActivePage }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [showModal, setShowModal] = useState(false);
  const needsBackup = isBackupNeededToday();

  const now = new Date();

  useEffect(() => {
    setTransactions(getTransactions());
    setCategories(getCategories());
  }, [showModal]);

  const allCats = [...(categories.income || []), ...(categories.expense || [])];
  const getCat = (id) => allCats.find(c => c.id === id);

  const balance = calcBalance(transactions);
  const monthTx = getTransactionsByMonth(transactions, now.getFullYear(), now.getMonth());
  const { income: monthIncome, expense: monthExpense } = calcTotals(monthTx);
  const recentTx = transactions.slice(0, 5);

  const handleSave = (formData) => {
    addTransaction(formData);
    setTransactions(getTransactions());
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Backup Reminder ── */}
      {needsBackup && (
        <div className={`
          flex items-center gap-3 p-4 rounded-2xl border animate-slide-up
          ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}
        `}>
          <Bell size={18} className="text-amber-500 shrink-0 animate-pulse-soft" />
          <p className="text-sm font-medium flex-1">
            <span className="font-bold">Psst!</span> Kamu belum backup data hari ini. Jangan sampai hilang ya!
          </p>
          <button
            onClick={() => setActivePage('export')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition-colors
              ${isDark ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
          >
            Backup Sekarang
          </button>
        </div>
      )}

      {/* ── Hero Saldo ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-600 p-6 md:p-8 shadow-2xl shadow-violet-500/20">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-4 right-4 opacity-20">
          <Sparkles size={64} className="text-white" />
        </div>

        <div className="relative">
          <p className="text-violet-200 text-sm font-semibold tracking-wider uppercase">Saldo Kamu</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-2 tracking-tight">
            {formatRupiah(balance)}
          </h2>
          <p className="text-violet-200 text-sm mt-2">
            Bulan {BULAN_ID[now.getMonth()]} {now.getFullYear()}
          </p>

          <div className="flex gap-4 mt-6">
            <MiniStat
              icon={<TrendingUp size={14} />}
              label="Masuk"
              amount={formatRupiah(monthIncome)}
              color="text-emerald-300"
            />
            <div className="w-px bg-white/20" />
            <MiniStat
              icon={<TrendingDown size={14} />}
              label="Keluar"
              amount={formatRupiah(monthExpense)}
              color="text-red-300"
            />
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction
          icon={<Plus size={20} />}
          label="Catat Transaksi"
          onClick={() => setShowModal(true)}
          primary
          isDark={isDark}
        />
        <QuickAction
          icon={<Wallet size={20} />}
          label="Cek Budget"
          onClick={() => setActivePage('budget')}
          isDark={isDark}
        />
        <QuickAction
          icon={<TrendingUp size={20} />}
          label="Target Nabung"
          onClick={() => setActivePage('savings')}
          isDark={isDark}
        />
        <QuickAction
          icon={<Download size={20} />}
          label="Backup Data"
          onClick={() => setActivePage('export')}
          isDark={isDark}
        />
      </div>

      {/* ── Transaksi Terbaru ── */}
      <div className={`rounded-2xl p-5 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base">Transaksi Terbaru</h3>
          <button
            onClick={() => setActivePage('transactions')}
            className={`flex items-center gap-1 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors`}
          >
            Lihat semua <ArrowRight size={14} />
          </button>
        </div>

        {recentTx.length === 0 ? (
          <EmptyState isDark={isDark} onAdd={() => setShowModal(true)} />
        ) : (
          <div className="space-y-3">
            {recentTx.map(tx => {
              const cat = getCat(tx.categoryId);
              return (
                <TransactionItem key={tx.id} tx={tx} cat={cat} isDark={isDark} />
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add Transaction Modal ── */}
      {showModal && (
        <TransactionModal
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// ── Sub Components ──

function MiniStat({ icon, label, amount, color }) {
  return (
    <div>
      <div className={`flex items-center gap-1 ${color} text-xs font-semibold mb-0.5`}>
        {icon} {label}
      </div>
      <p className="text-white font-bold text-sm">{amount}</p>
    </div>
  );
}

function QuickAction({ icon, label, onClick, primary, isDark }) {
  if (primary) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-95"
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">{icon}</div>
        <span className="text-xs font-bold text-center leading-tight">{label}</span>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200
        hover:scale-[1.02] active:scale-95
        ${isDark ? 'bg-gray-900 border-gray-800 hover:border-violet-500/50' : 'bg-white border-gray-200 hover:border-violet-300 shadow-sm'}
      `}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/8 text-violet-400' : 'bg-violet-50 text-violet-600'}`}>
        {icon}
      </div>
      <span className="text-xs font-bold text-center leading-tight">{label}</span>
    </button>
  );
}

function TransactionItem({ tx, cat, isDark }) {
  const isIncome = tx.type === 'income';
  const date = new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-xl transition-colors
      ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}
    `}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: (cat?.color || '#8b5cf6') + '20' }}>
        {cat?.icon || '💸'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{cat?.name || tx.categoryId}</p>
        <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {tx.note || date}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
          {isIncome ? '+' : '-'}{formatRupiah(tx.amount)}
        </p>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{date}</p>
      </div>
    </div>
  );
}

function EmptyState({ isDark, onAdd }) {
  return (
    <div className="py-10 text-center">
      <div className="text-5xl mb-3">💸</div>
      <p className="font-semibold mb-1">Belum ada transaksi nih</p>
      <p className={`text-sm mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Yuk mulai catat keuanganmu!
      </p>
      <button onClick={onAdd} className="btn-primary mx-auto">
        <Plus size={16} /> Catat Sekarang
      </button>
    </div>
  );
}
