import { setOnboardingDone } from '../../utils/storage';
import { Shield, RefreshCcw, AlertTriangle, X, Download, CheckCircle } from 'lucide-react';
import { useTheme } from '../../App';

export default function OnboardingModal({ onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleClose = () => {
    setOnboardingDone();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`
        relative w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scale-in
        ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}
      `}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <span className="text-3xl">👋</span>
          </div>
          <h2 className="text-2xl font-bold">Halo, selamat datang!</h2>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Sebelum mulai, ada beberapa hal penting nih
          </p>
        </div>

        {/* Info Cards */}
        <div className="space-y-3 mb-6">
          <InfoCard
            icon={<Shield size={18} className="text-blue-400" />}
            title="Data tersimpan di browser kamu"
            desc="Semua catatan keuanganmu disimpan di localStorage browser ini — bukan di server atau cloud manapun."
            isDark={isDark}
          />
          <InfoCard
            icon={<AlertTriangle size={18} className="text-amber-400" />}
            title="Bisa hilang kalau cache dihapus"
            desc="Jika kamu menghapus cache browser, data akan hilang permanen. Pastikan rutin backup ya!"
            isDark={isDark}
            highlight
          />
          <InfoCard
            icon={<Download size={18} className="text-emerald-400" />}
            title="Backup itu wajib!"
            desc="Kami akan mengingatkan kamu setiap hari untuk export data ke file JSON sebagai backup."
            isDark={isDark}
          />
        </div>

        {/* CTA Button */}
        <button
          onClick={handleClose}
          className="w-full btn-primary py-3 text-base"
        >
          <CheckCircle size={18} />
          Siap, aku ngerti! Mulai pakai AturAja
        </button>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc, isDark, highlight }) {
  return (
    <div className={`
      flex gap-3 p-3.5 rounded-xl border
      ${highlight
        ? isDark
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-amber-50 border-amber-200'
        : isDark
          ? 'bg-white/5 border-white/10'
          : 'bg-gray-50 border-gray-200'
      }
    `}>
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
      </div>
    </div>
  );
}
