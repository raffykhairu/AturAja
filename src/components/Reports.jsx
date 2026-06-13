import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../App';
import {
  getTransactions, getCategories, getMonthlyChartData,
  calcExpenseByCategory, formatRupiah, calcTotals,
  getTransactionsByMonth, BULAN_ID
} from '../utils/storage';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Sector
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#6366f1', '#84cc16', '#f97316'];

export default function Reports() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const now = new Date();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    setTransactions(getTransactions());
    setCategories(getCategories());
  }, []);

  const monthlyData = useMemo(() => getMonthlyChartData(transactions), [transactions]);
  
  const thisMonthTx = useMemo(() =>
    getTransactionsByMonth(transactions, now.getFullYear(), now.getMonth()),
    [transactions]
  );
  const thisMonthTotals = useMemo(() => calcTotals(thisMonthTx), [thisMonthTx]);
  const expenseByCategory = useMemo(() =>
    calcExpenseByCategory(thisMonthTx, categories),
    [thisMonthTx, categories]
  );

  // Data tahunan
  const yearlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const txs = getTransactionsByMonth(transactions, selectedYear, i);
      const totals = calcTotals(txs);
      return {
        month: BULAN_ID[i].slice(0, 3),
        income: totals.income,
        expense: totals.expense,
        balance: totals.income - totals.expense,
      };
    });
  }, [transactions, selectedYear]);

  const yearlyTotals = useMemo(() => {
    return yearlyData.reduce((acc, d) => ({
      income: acc.income + d.income,
      expense: acc.expense + d.expense,
    }), { income: 0, expense: 0 });
  }, [yearlyData]);

  const pieData = expenseByCategory.map((cat, i) => ({
    name: `${cat.icon} ${cat.name}`,
    value: cat.total,
    color: cat.color || CHART_COLORS[i % CHART_COLORS.length],
  }));

  const chartTextColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#1f2937' : '#f3f4f6';
  const cardBg = isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Laporan & Analitik</h1>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Gambaran lengkap keuanganmu
        </p>
      </div>

      {/* ── Ringkasan Bulan Ini ── */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          label="Uang Masuk"
          amount={formatRupiah(thisMonthTotals.income)}
          icon={<TrendingUp size={16} />}
          color="text-emerald-400"
          bg={isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}
          isDark={isDark}
        />
        <SummaryCard
          label="Uang Keluar"
          amount={formatRupiah(thisMonthTotals.expense)}
          icon={<TrendingDown size={16} />}
          color="text-red-400"
          bg={isDark ? 'bg-red-500/10' : 'bg-red-50'}
          isDark={isDark}
        />
        <SummaryCard
          label="Selisih"
          amount={formatRupiah(thisMonthTotals.income - thisMonthTotals.expense)}
          icon={<Minus size={16} />}
          color={thisMonthTotals.income >= thisMonthTotals.expense ? 'text-violet-400' : 'text-red-400'}
          bg={isDark ? 'bg-violet-500/10' : 'bg-violet-50'}
          isDark={isDark}
        />
      </div>

      {/* ── Bar Chart: 6 Bulan Terakhir ── */}
      <div className={`p-5 rounded-2xl ${cardBg}`}>
        <h3 className="font-bold mb-4">6 Bulan Terakhir</h3>
        {transactions.length === 0 ? (
          <ChartEmpty isDark={isDark} />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: chartTextColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: chartTextColor, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : v}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#111827' : '#fff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={(v, name) => [formatRupiah(v), name]}
                labelStyle={{ color: isDark ? '#d1d5db' : '#374151', fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Bar dataKey="Uang Masuk" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Uang Keluar" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Pie Chart: Pengeluaran per Kategori ── */}
      <div className={`p-5 rounded-2xl ${cardBg}`}>
        <h3 className="font-bold mb-1">Pengeluaran per Kategori</h3>
        <p className={`text-xs mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Bulan {BULAN_ID[now.getMonth()]} {now.getFullYear()}
        </p>
        {pieData.length === 0 ? (
          <ChartEmpty isDark={isDark} label="Belum ada pengeluaran bulan ini" />
        ) : (
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  activeIndex={activeIndex}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#111827' : '#fff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(v) => [formatRupiah(v), 'Total']}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="w-full md:w-56 space-y-2 shrink-0">
              {pieData.map((entry, i) => {
                const pct = ((entry.value / thisMonthTotals.expense) * 100).toFixed(1);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className={`text-xs flex-1 truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{entry.name}</span>
                    <span className="text-xs font-bold shrink-0" style={{ color: entry.color }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Ringkasan Tahunan ── */}
      <div className={`p-5 rounded-2xl ${cardBg}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Ringkasan Tahunan</h3>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className={`text-sm px-3 py-1.5 rounded-xl border outline-none font-medium ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Yearly totals */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
            <p className={`text-xs font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Total Masuk {selectedYear}</p>
            <p className="font-bold mt-0.5 text-sm">{formatRupiah(yearlyTotals.income)}</p>
          </div>
          <div className={`p-3 rounded-xl ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
            <p className={`text-xs font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>Total Keluar {selectedYear}</p>
            <p className="font-bold mt-0.5 text-sm">{formatRupiah(yearlyTotals.expense)}</p>
          </div>
        </div>

        {/* Monthly table */}
        <div className="space-y-1">
          {yearlyData.map((d, i) => (
            <div key={i} className={`flex items-center gap-3 py-2 px-2 rounded-xl text-xs ${i % 2 === 0 ? isDark ? 'bg-white/3' : 'bg-gray-50' : ''}`}>
              <span className={`w-8 font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{d.month}</span>
              <div className="flex-1 grid grid-cols-3 gap-2">
                <span className="text-emerald-400 font-medium truncate">+{formatRupiah(d.income)}</span>
                <span className="text-red-400 font-medium truncate">-{formatRupiah(d.expense)}</span>
                <span className={`font-bold truncate ${d.balance >= 0 ? 'text-violet-400' : 'text-red-400'}`}>
                  {d.balance >= 0 ? '+' : ''}{formatRupiah(d.balance)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, amount, icon, color, bg, isDark }) {
  return (
    <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
      <div className={`w-8 h-8 rounded-xl ${bg} ${color} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
      <p className="font-bold text-sm leading-tight">{amount}</p>
    </div>
  );
}

function ChartEmpty({ isDark, label = 'Belum ada data transaksi' }) {
  return (
    <div className="h-40 flex flex-col items-center justify-center gap-2">
      <div className="text-3xl">📊</div>
      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
    </div>
  );
}
