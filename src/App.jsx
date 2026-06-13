import { useState, useEffect, createContext, useContext } from 'react';
import { getTheme, saveTheme, isOnboardingDone } from './utils/storage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budget from './components/Budget';
import SavingsGoals from './components/SavingsGoals';
import Reports from './components/Reports';
import ExportImport from './components/ExportImport';
import Categories from './components/Categories';
import OnboardingModal from './components/modals/OnboardingModal';
import { AuthProvider } from './contexts/AuthContext';

// ===================================
// Theme Context
// ===================================
export const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

// ===================================
// App Component
// ===================================
export default function App() {
  const [theme, setTheme] = useState(() => getTheme());
  const [activePage, setActivePage] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Terapkan tema ke <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Cek onboarding saat pertama buka
  useEffect(() => {
    if (!isOnboardingDone()) {
      setShowOnboarding(true);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Render halaman sesuai navigasi
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <Dashboard setActivePage={setActivePage} />;
      case 'transactions': return <Transactions />;
      case 'budget':       return <Budget />;
      case 'savings':      return <SavingsGoals />;
      case 'reports':      return <Reports />;
      case 'export':       return <ExportImport />;
      case 'categories':   return <Categories />;
      default:             return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthProvider>
        <div className={theme === 'dark'
          ? 'min-h-screen bg-gray-950 text-gray-100'
          : 'min-h-screen bg-gray-50 text-gray-900'
        }>
          <Layout activePage={activePage} setActivePage={setActivePage}>
            {renderPage()}
          </Layout>

          {showOnboarding && (
            <OnboardingModal onClose={() => setShowOnboarding(false)} />
          )}
        </div>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}
