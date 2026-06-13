import { useState } from 'react';
import { useTheme } from '../App';
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank, Target,
  BarChart3, Download, Tags, Menu, X, Sun, Moon,
  Wallet, ChevronRight
} from 'lucide-react';

// ===================================
// Navigasi Sidebar
// ===================================
const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Beranda',         icon: LayoutDashboard },
  { id: 'transactions', label: 'Transaksi',        icon: ArrowLeftRight },
  { id: 'budget',       label: 'Budget Bulanan',   icon: Wallet },
  { id: 'savings',      label: 'Target Nabung',    icon: Target },
  { id: 'reports',      label: 'Laporan',          icon: BarChart3 },
  { id: 'export',       label: 'Export & Backup',  icon: Download },
  { id: 'categories',   label: 'Kategori',         icon: Tags },
];

export default function Layout({ activePage, setActivePage, children }) {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDark = theme === 'dark';

  const navBase = isDark
    ? 'text-gray-400 hover:text-white hover:bg-white/8'
    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100';
  const navActive = isDark
    ? 'bg-violet-500/20 text-violet-300 border-r-2 border-violet-400'
    : 'bg-violet-50 text-violet-700 border-r-2 border-violet-500';
  const sidebarBg = isDark
    ? 'bg-gray-900 border-gray-800'
    : 'bg-white border-gray-200';

  const handleNav = (id) => {
    setActivePage(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Overlay Mobile ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50 border-r flex flex-col
        transition-transform duration-300 ease-out
        ${sidebarBg}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto
      `}>
        {/* Logo */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <PiggyBank size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">AturAja</h1>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Atur keuanganmu!
              </p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group text-left
                ${activePage === id ? navActive : navBase}
              `}
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {activePage === id && (
                <ChevronRight size={14} className="opacity-50" />
              )}
            </button>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <button
            onClick={toggleTheme}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200
              ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/8' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}
            `}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Mobile */}
        <header className={`
          md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3
          border-b backdrop-blur-md
          ${isDark ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80 border-gray-200'}
        `}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <PiggyBank size={14} className="text-white" />
            </div>
            <span className="font-bold text-base">AturAja</span>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
