import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../App';
import {
  getTransactions, getCategories, getBudgets, upsertBudget, deleteBudget,
  formatRupiah, getTransactionsByMonth, BULAN_ID
} from '../utils/storage';
import { Plus, X, Wallet, ChevronDown, Check, Trash2 } from 'lucide-react';

export default function Budget() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [budgets, setBudgets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ categoryId: '', amount: '' });

  const reload = () => {
    setTransactions(getTransactions());
    setCategories(getCategories());
    setBudgets(getBudgets());
  };

  useEffect(() => { reload(); }, []);

  // Hitung pengeluaran bulan ini per kategori
  const monthSpending = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const monthTx = getTransactionsByMonth(transactions, y, m - 1).filter(t => t.type === 'expense');
    const spending = {};
    monthTx.forEach(tx => {
      spending[tx.categoryId] = (spending[tx.categoryId] || 0) + tx.amount;
    });
    return spending;
  }, [transactions, selectedMonth]);

  // Budget bulan terpilih
  const monthBudgets = useMemo(() => {
    return budgets.filter(b => b.month === selectedMonth);
  }, [budgets, selectedMonth]);

  // Kategori expense yang belum punya budget bulan ini
  const availableCats = useMemo(() => {
    const usedIds = monthBudgets.map(b => b.categoryId);
    return (categories.expense || []).filter(c => !usedIds.includes(c.id));
  }, [categories, monthBudgets]);

  const handleAddBudget = () => {
    if (!form.categoryId || !form.amount || Number(form.amount) <= 0) return;
    upsertBudget({
      categoryId: form.categoryId,
      month: selectedMonth,
      amount: Number(form.amount),
    });
    setForm({ categoryId: '', amount: '' });
    setShowForm(false);
    reload();
  };

  const handleDelete = (id) => {
    deleteBudget(id);
    reload();
  };

  const getCat = (id) => (categories.expense || []).find(c => c.id === id);

  const [y, m] = selectedMonth.split('-').map(Number);
  const monthLabel = `${BULAN_ID[m - 1]} ${y}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Budget Bulanan</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Pantau pengeluaranmu agar tidak kebablasan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className={`text-sm px-3 py-2 rounded-xl border outline-none font-medium cursor-pointer
              ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}
          />
        </div>
      </div>

      {/* ── Budget Summary ── */}
      {monthBudgets.length > 0 && (
        <BudgetSummary budgets={monthBudgets} spending={monthSpending} isDark={isDark} />
      )}

      {/* ── Add Budget Form ── */}
      {showForm ? (
        <div className={`p-5 rounded-2xl border space-y-4 animate-slide-up ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Tambah Budget</h3>
            <button onClick={() => setShowForm(false)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
              <X size={16} />
            </button>
          </div>

          {availableCats.length === 0 ? (
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Semua kategori sudah punya budget bulan ini! 🎉
            </p>
          ) : (
            <>
              {/* Category Picker */}
              <div>
                <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Kategori</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableCats.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setForm(f => ({ ...f, categoryId: cat.id }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all
                        ${form.categoryId === cat.id
                          ? isDark ? 'bg-violet-500/20 border-violet-500 text-violet-300' : 'bg-violet-50 border-violet-400 text-violet-700'
                          : isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Limit Budget (Rp)</label>
                <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={form.amount ? Number(form.amount).toLocaleString('id-ID') : ''}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value.replace(/\D/g, '').replace(/\./g, '') }))}
                    className={`flex-1 bg-transparent outline-none font-bold text-lg ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-300'}`}
                  />
                </div>
              </div>

              <button onClick={handleAddBudget} className="w-full btn-primary py-3">
                <Check size={16} /> Simpan Budget
              </button>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed font-semibold text-sm transition-colors
            ${isDark ? 'border-gray-700 text-gray-500 hover:border-violet-500/50 hover:text-violet-400' : 'border-gray-200 text-gray-400 hover:border-violet-300 hover:text-violet-500'}`}
        >
          <Plus size={16} /> Tambah Budget Kategori
        </button>
      )}

      {/* ── Budget List ── */}
      {monthBudgets.length === 0 ? (
        <EmptyBudget isDark={isDark} onAdd={() => setShowForm(true)} monthLabel={monthLabel} />
      ) : (
        <div className="space-y-3">
          <h2 className="font-bold text-base px-1">Budget {monthLabel}</h2>
          {monthBudgets.map(budget => {
            const cat = getCat(budget.categoryId);
            const spent = monthSpending[budget.categoryId] || 0;
            const pct = Math.min((spent / budget.amount) * 100, 100);
            const remaining = budget.amount - spent;
            const status = pct >= 100 ? 'over' : pct >= 80 ? 'warning' : 'ok';

            return (
              <BudgetCard
                key={budget.id}
                cat={cat}
                budget={budget}
                spent={spent}
                remaining={remaining}
                pct={pct}
                status={status}
                isDark={isDark}
                onDelete={() => handleDelete(budget.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function BudgetSummary({ budgets, spending, isDark }) {
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (spending[b.categoryId] || 0), 0);
  const pct = Math.min((totalSpent / totalBudget) * 100, 100);

  return (
    <div className={`p-5 rounded-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Pengeluaran vs Budget</p>
          <p className="text-2xl font-bold mt-1">{formatRupiah(totalSpent)}</p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>dari {formatRupiah(totalBudget)}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-xl text-sm font-bold
          ${pct >= 100 ? 'bg-red-500/15 text-red-400' : pct >= 80 ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
          {pct.toFixed(0)}%
        </div>
      </div>
      <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function BudgetCard({ cat, budget, spent, remaining, pct, status, isDark, onDelete }) {
  const barColor = status === 'over' ? 'bg-red-500' : status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';
  const textColor = status === 'over' ? 'text-red-400' : status === 'warning' ? 'text-amber-400' : 'text-emerald-400';
  const bgColor = status === 'over' ? 'bg-red-500/10' : status === 'warning' ? 'bg-amber-500/10' : 'bg-emerald-500/10';

  return (
    <div className={`p-4 rounded-2xl border group transition-all ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: (cat?.color || '#8b5cf6') + '22' }}>
          {cat?.icon || '💸'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">{cat?.name || budget.categoryId}</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bgColor} ${textColor}`}>
                {status === 'over' ? '⚠️ Lewat!' : status === 'warning' ? '⚡ Hampir habis' : '✅ Aman'}
              </span>
              <button
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {formatRupiah(spent)} / {formatRupiah(budget.amount)}
          </p>
        </div>
      </div>

      <div className={`h-2 rounded-full overflow-hidden mb-1.5 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>

      <div className="flex justify-between">
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {pct.toFixed(0)}% terpakai
        </p>
        <p className={`text-xs font-semibold ${remaining < 0 ? 'text-red-400' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {remaining < 0 ? `Lewat ${formatRupiah(Math.abs(remaining))}` : `Sisa ${formatRupiah(remaining)}`}
        </p>
      </div>
    </div>
  );
}

function EmptyBudget({ isDark, onAdd, monthLabel }) {
  return (
    <div className={`py-16 text-center rounded-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
      <div className="text-5xl mb-3">💡</div>
      <p className="font-semibold mb-1">Belum ada budget untuk {monthLabel}</p>
      <p className={`text-sm mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Set budget biar pengeluaranmu lebih terkontrol!
      </p>
      <button onClick={onAdd} className="btn-primary mx-auto">
        <Plus size={16} /> Tambah Budget
      </button>
    </div>
  );
}
