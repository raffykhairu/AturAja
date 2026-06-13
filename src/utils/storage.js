// ===================================
// AturAja - localStorage Utilities
// Semua data disimpan di localStorage
// ===================================

// Keys untuk localStorage
const KEYS = {
  TRANSACTIONS: 'aturaja_transactions',
  BUDGETS: 'aturaja_budgets',
  SAVINGS_GOALS: 'aturaja_savings_goals',
  CATEGORIES: 'aturaja_categories',
  THEME: 'aturaja_theme',
  LAST_BACKUP: 'aturaja_last_backup',
  ONBOARDING_DONE: 'aturaja_onboarding_done',
  SAVINGS_ALLOCATIONS: 'aturaja_savings_allocations',
};

// Kategori default bawaan
const DEFAULT_CATEGORIES = {
  expense: [
    { id: 'makan', name: 'Makan & Minum', icon: '🍜', color: '#f97316' },
    { id: 'transport', name: 'Transportasi', icon: '🚗', color: '#3b82f6' },
    { id: 'belanja', name: 'Belanja', icon: '🛍️', color: '#ec4899' },
    { id: 'hiburan', name: 'Hiburan', icon: '🎮', color: '#8b5cf6' },
    { id: 'pendidikan', name: 'Pendidikan', icon: '📚', color: '#10b981' },
    { id: 'kesehatan', name: 'Kesehatan', icon: '💊', color: '#ef4444' },
    { id: 'tagihan', name: 'Tagihan', icon: '📱', color: '#6b7280' },
    { id: 'lainnya_keluar', name: 'Lainnya', icon: '💸', color: '#94a3b8' },
  ],
  income: [
    { id: 'uang_saku', name: 'Uang Saku', icon: '💰', color: '#10b981' },
    { id: 'kerja_sampingan', name: 'Kerja Sampingan', icon: '💼', color: '#3b82f6' },
    { id: 'hadiah', name: 'Hadiah', icon: '🎁', color: '#f59e0b' },
    { id: 'lainnya_masuk', name: 'Lainnya', icon: '💵', color: '#94a3b8' },
  ],
};

// ===================================
// HELPER: Safely parse JSON
// ===================================
const safeJSON = (str, fallback = null) => {
  try {
    return JSON.parse(str) ?? fallback;
  } catch {
    return fallback;
  }
};

// ===================================
// TRANSAKSI
// ===================================
export const getTransactions = () => {
  return safeJSON(localStorage.getItem(KEYS.TRANSACTIONS), []);
};

export const saveTransactions = (transactions) => {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const addTransaction = (transaction) => {
  const transactions = getTransactions();
  const newTransaction = {
    ...transaction,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  transactions.unshift(newTransaction); // Terbaru di atas
  saveTransactions(transactions);
  return newTransaction;
};

export const updateTransaction = (id, updates) => {
  const transactions = getTransactions();
  const index = transactions.findIndex((t) => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates, updatedAt: new Date().toISOString() };
    saveTransactions(transactions);
    return transactions[index];
  }
  return null;
};

export const deleteTransaction = (id) => {
  const transactions = getTransactions().filter((t) => t.id !== id);
  saveTransactions(transactions);
};

// ===================================
// BUDGET
// ===================================
export const getBudgets = () => {
  return safeJSON(localStorage.getItem(KEYS.BUDGETS), []);
};

export const saveBudgets = (budgets) => {
  localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
};

export const upsertBudget = (budget) => {
  const budgets = getBudgets();
  const key = `${budget.categoryId}_${budget.month}`; // e.g. "makan_2025-01"
  const index = budgets.findIndex((b) => `${b.categoryId}_${b.month}` === key);
  if (index !== -1) {
    budgets[index] = { ...budgets[index], ...budget };
  } else {
    budgets.push({ ...budget, id: crypto.randomUUID() });
  }
  saveBudgets(budgets);
};

export const deleteBudget = (id) => {
  const budgets = getBudgets().filter((b) => b.id !== id);
  saveBudgets(budgets);
};

// ===================================
// TARGET NABUNG
// ===================================
export const getSavingsGoals = () => {
  return safeJSON(localStorage.getItem(KEYS.SAVINGS_GOALS), []);
};

export const saveSavingsGoals = (goals) => {
  localStorage.setItem(KEYS.SAVINGS_GOALS, JSON.stringify(goals));
};

export const addSavingsGoal = (goal) => {
  const goals = getSavingsGoals();
  const newGoal = {
    ...goal,
    id: crypto.randomUUID(),
    currentAmount: 0,
    createdAt: new Date().toISOString(),
  };
  goals.push(newGoal);
  saveSavingsGoals(goals);
  return newGoal;
};

export const updateSavingsGoal = (id, updates) => {
  const goals = getSavingsGoals();
  const index = goals.findIndex((g) => g.id === id);
  if (index !== -1) {
    goals[index] = { ...goals[index], ...updates };
    saveSavingsGoals(goals);
    return goals[index];
  }
  return null;
};

export const deleteSavingsGoal = (id) => {
  const goals = getSavingsGoals().filter((g) => g.id !== id);
  saveSavingsGoals(goals);
  // Hapus juga alokasi untuk goal ini
  const allocations = getSavingsAllocations().filter((a) => a.goalId !== id);
  saveSavingsAllocations(allocations);
};

export const allocateToGoal = (goalId, amount, note = '') => {
  const goals = getSavingsGoals();
  const index = goals.findIndex((g) => g.id === goalId);
  if (index !== -1) {
    goals[index].currentAmount = (goals[index].currentAmount || 0) + amount;
    saveSavingsGoals(goals);
    
    // Simpan log alokasi
    const allocations = getSavingsAllocations();
    allocations.unshift({
      id: crypto.randomUUID(),
      goalId,
      amount,
      note,
      date: new Date().toISOString(),
    });
    saveSavingsAllocations(allocations);
    
    return goals[index];
  }
  return null;
};

// ===================================
// ALOKASI NABUNG
// ===================================
export const getSavingsAllocations = () => {
  return safeJSON(localStorage.getItem(KEYS.SAVINGS_ALLOCATIONS), []);
};

export const saveSavingsAllocations = (allocations) => {
  localStorage.setItem(KEYS.SAVINGS_ALLOCATIONS, JSON.stringify(allocations));
};

// ===================================
// KATEGORI
// ===================================
export const getCategories = () => {
  const stored = safeJSON(localStorage.getItem(KEYS.CATEGORIES), null);
  if (!stored) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  return stored;
};

export const saveCategories = (categories) => {
  localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
};

export const addCategory = (type, category) => {
  const categories = getCategories();
  const newCat = { ...category, id: `custom_${Date.now()}` };
  categories[type].push(newCat);
  saveCategories(categories);
  return newCat;
};

export const deleteCategory = (type, id) => {
  const categories = getCategories();
  categories[type] = categories[type].filter((c) => c.id !== id);
  saveCategories(categories);
};

// ===================================
// TEMA
// ===================================
export const getTheme = () => {
  return localStorage.getItem(KEYS.THEME) || 'dark';
};

export const saveTheme = (theme) => {
  localStorage.setItem(KEYS.THEME, theme);
};

// ===================================
// ONBOARDING
// ===================================
export const isOnboardingDone = () => {
  return localStorage.getItem(KEYS.ONBOARDING_DONE) === 'true';
};

export const setOnboardingDone = () => {
  localStorage.setItem(KEYS.ONBOARDING_DONE, 'true');
};

// ===================================
// BACKUP TRACKING
// ===================================
export const getLastBackupDate = () => {
  return localStorage.getItem(KEYS.LAST_BACKUP) || null;
};

export const setLastBackupDate = () => {
  localStorage.setItem(KEYS.LAST_BACKUP, new Date().toISOString());
};

export const isBackupNeededToday = () => {
  const lastBackup = getLastBackupDate();
  if (!lastBackup) return true;
  const lastDate = new Date(lastBackup).toDateString();
  const today = new Date().toDateString();
  return lastDate !== today;
};

// ===================================
// EXPORT & IMPORT
// ===================================
export const getRawData = () => {
  return {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    transactions: getTransactions(),
    budgets: getBudgets(),
    savingsGoals: getSavingsGoals(),
    savingsAllocations: getSavingsAllocations(),
    categories: getCategories(),
  };
};

export const exportData = (format = 'json') => {
  const data = getRawData();

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `aturaja-backup-${formatDateForFile()}.json`);
  } else if (format === 'csv') {
    const csvContent = transactionsToCSV(data.transactions, getCategories());
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `aturaja-transaksi-${formatDateForFile()}.csv`);
  }

  setLastBackupDate();
};

const transactionsToCSV = (transactions, categories) => {
  const allCats = [...categories.expense, ...categories.income];
  const getCatName = (id) => allCats.find((c) => c.id === id)?.name || id;
  
  const headers = ['Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'Catatan'];
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString('id-ID'),
    t.type === 'income' ? 'Uang Masuk' : 'Uang Keluar',
    getCatName(t.categoryId),
    t.amount,
    t.note || '',
  ]);
  
  return [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
};

const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const formatDateForFile = () => {
  return new Date().toISOString().split('T')[0];
};

export const importData = (jsonData) => {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    if (data.transactions) saveTransactions(data.transactions);
    if (data.budgets) saveBudgets(data.budgets);
    if (data.savingsGoals) saveSavingsGoals(data.savingsGoals);
    if (data.savingsAllocations) saveSavingsAllocations(data.savingsAllocations);
    if (data.categories) saveCategories(data.categories);
    return { success: true, message: 'Data berhasil diimport!' };
  } catch (err) {
    return { success: false, message: 'Format file tidak valid. Pastikan file JSON dari AturAja.' };
  }
};

// ===================================
// ANALYTICS HELPERS
// ===================================

// Format angka ke Rupiah
export const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Ambil transaksi bulan tertentu
export const getTransactionsByMonth = (transactions, year, month) => {
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
};

// Hitung total income/expense
export const calcTotals = (transactions) => {
  return transactions.reduce(
    (acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );
};

// Hitung pengeluaran per kategori
export const calcExpenseByCategory = (transactions, categories) => {
  const expenseCats = categories.expense || [];
  const result = {};
  
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      result[t.categoryId] = (result[t.categoryId] || 0) + t.amount;
    });
  
  return expenseCats
    .map((cat) => ({
      ...cat,
      total: result[cat.id] || 0,
    }))
    .filter((c) => c.total > 0);
};

// Ambil data per bulan untuk grafik bar (12 bulan terakhir)
export const getMonthlyChartData = (transactions) => {
  const months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthTransactions = getTransactionsByMonth(transactions, d.getFullYear(), d.getMonth());
    const totals = calcTotals(monthTransactions);
    months.push({
      name: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      'Uang Masuk': totals.income,
      'Uang Keluar': totals.expense,
    });
  }
  
  return months;
};

// Hitung saldo berjalan
export const calcBalance = (transactions) => {
  const { income, expense } = calcTotals(transactions);
  return income - expense;
};

// Nama bulan Indonesia
export const BULAN_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
