import { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile, saveUserProfile, removeUserProfile } from '../utils/storage';
import LoginModal from '../components/modals/LoginModal';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    // Load profil dari localStorage saat pertama kali
    setUserProfile(getUserProfile());
  }, []);

  const login = (profile) => {
    saveUserProfile(profile);
    setUserProfile(profile);
    setShowLoginModal(false);

    // Jalankan aksi yang sempat tertunda karena harus login
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const logout = () => {
    removeUserProfile();
    setUserProfile(null);
  };

  /**
   * Fungsi ini membungkus aksi (seperti save transaksi).
   * Jika user belum login, aksi akan ditahan dan Modal Login akan muncul.
   */
  const requireAuth = (action) => {
    if (userProfile) {
      action();
    } else {
      setPendingAction(() => action); // Simpan aksi untuk dijalankan nanti
      setShowLoginModal(true);
    }
  };

  return (
    <AuthContext.Provider value={{ userProfile, login, logout, requireAuth }}>
      {children}
      {showLoginModal && (
        <LoginModal 
          onClose={() => {
            setShowLoginModal(false);
            setPendingAction(null);
          }} 
          onLogin={login} 
        />
      )}
    </AuthContext.Provider>
  );
}
