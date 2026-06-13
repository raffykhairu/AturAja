import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../App';
import { X, User, Mail, ChevronRight, AlertTriangle } from 'lucide-react';
import { initGoogleSignIn, decodeJwt } from '../../utils/googleAuth';

export default function LoginModal({ onClose, onLogin }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  const googleButtonRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    initGoogleSignIn(clientId, googleButtonRef, (response) => {
      const payload = decodeJwt(response.credential);
      if (payload) {
        onLogin({
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
          method: 'google'
        });
      } else {
        setError('Gagal membaca data dari Google.');
      }
    });
  }, [onLogin]);

  const handleManualLogin = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama tidak boleh kosong');
      return;
    }
    onLogin({
      name: name.trim(),
      email: email.trim(),
      method: 'local'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Kenalan dulu yuk!</h2>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
            <X size={20} />
          </button>
        </div>
        
        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Silakan masuk terlebih dahulu sebelum menyimpan atau mengubah data agar data kamu aman.
        </p>

        {/* Form Manual */}
        <form onSubmit={handleManualLogin} className="space-y-4 mb-5">
          <div>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border focus-within:border-violet-500 transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Nama Panggilan"
                value={name}
                onChange={e => setName(e.target.value)}
                className={`flex-1 bg-transparent outline-none text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
              />
            </div>
          </div>
          <div>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border focus-within:border-violet-500 transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                placeholder="Email (opsional)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`flex-1 bg-transparent outline-none text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-semibold flex items-center gap-1">
              <AlertTriangle size={12} /> {error}
            </p>
          )}

          <button type="submit" className="w-full btn-primary py-3 flex justify-between items-center">
            <span>Lanjutkan</span>
            <ChevronRight size={18} />
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>ATAU</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Google Sign In Container */}
        <div className="flex justify-center">
          <div ref={googleButtonRef}></div>
        </div>

      </div>
    </div>
  );
}
