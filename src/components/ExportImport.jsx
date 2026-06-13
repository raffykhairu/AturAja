import { useState, useRef } from 'react';
import { useTheme } from '../App';
import { exportData, importData, setLastBackupDate, getLastBackupDate } from '../utils/storage';
import { Download, Upload, FileJson, FileText, Shield, AlertTriangle, CheckCircle, Info, Cloud, CloudOff, CloudUpload, CloudDownload, Loader2 } from 'lucide-react';
import { requestGoogleDriveToken, findBackupFile, uploadBackup, downloadBackup } from '../utils/googleDrive';
import { getRawData } from '../utils/storage';

export default function ExportImport() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [importStatus, setImportStatus] = useState(null); // { success, message }
  const [importConfirm, setImportConfirm] = useState(null); // pending import data
  const [driveToken, setDriveToken] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [driveStatus, setDriveStatus] = useState(null);
  const fileRef = useRef(null);

  const lastBackup = getLastBackupDate();
  const lastBackupText = lastBackup
    ? new Date(lastBackup).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })
    : 'Belum pernah backup';

  const handleExportJSON = () => {
    exportData('json');
    setLastBackupDate();
  };

  const handleExportCSV = () => {
    exportData('csv');
    setLastBackupDate();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        setImportConfirm(data);
      } catch {
        setImportStatus({ success: false, message: 'File tidak valid. Pastikan file JSON dari AturAja.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportConfirm = () => {
    const result = importData(importConfirm);
    setImportStatus(result);
    setImportConfirm(null);
    if (result.success) {
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleConnectDrive = async () => {
    try {
      setIsSyncing(true);
      setDriveStatus(null);
      const token = await requestGoogleDriveToken();
      setDriveToken(token);
      setDriveStatus({ success: true, message: "Berhasil terhubung ke Google Drive!" });
    } catch (err) {
      setDriveStatus({ success: false, message: err.message || "Gagal menghubungkan ke Google Drive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBackupToDrive = async () => {
    if (!driveToken) return;
    try {
      setIsSyncing(true);
      setDriveStatus(null);
      const existingFile = await findBackupFile(driveToken);
      const data = getRawData();
      await uploadBackup(driveToken, data, existingFile ? existingFile.id : null);
      setDriveStatus({ success: true, message: "Berhasil mencadangkan data ke Google Drive!" });
      setLastBackupDate();
    } catch (err) {
      setDriveStatus({ success: false, message: "Gagal backup: " + err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreFromDrive = async () => {
    if (!driveToken) return;
    try {
      setIsSyncing(true);
      setDriveStatus(null);
      const existingFile = await findBackupFile(driveToken);
      if (!existingFile) {
        setDriveStatus({ success: false, message: "Tidak ada file backup ditemukan di Google Drive kamu." });
        return;
      }
      const data = await downloadBackup(driveToken, existingFile.id);
      setImportConfirm(data);
    } catch (err) {
      setDriveStatus({ success: false, message: "Gagal restore: " + err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const cardBg = isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm';

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Export & Backup</h1>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Lindungi datamu dengan rutin backup!
        </p>
      </div>

      {/* ── Peringatan Backup ── */}
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex gap-3">
          <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-500 mb-1">⚠️ Penting! Backup data kamu setiap hari</p>
            <p className={`text-sm ${isDark ? 'text-amber-200/70' : 'text-amber-700'}`}>
              Data AturAja disimpan di browser kamu, bukan di server. Jika kamu menghapus cache browser, data bisa hilang permanen. Pastikan rutin export data ke file JSON agar aman!
            </p>
            <p className={`text-xs mt-2 font-semibold ${isDark ? 'text-amber-300/60' : 'text-amber-600'}`}>
              Backup terakhir: {lastBackupText}
            </p>
          </div>
        </div>
      </div>

      {/* ── Google Drive Sync ── */}
      <div className={`p-5 rounded-2xl ${cardBg}`}>
        <div className="flex items-center gap-2 mb-1">
          <Cloud size={20} className="text-blue-500" />
          <h2 className="font-bold">Google Drive Sync</h2>
        </div>
        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Simpan dan pulihkan data kamu dengan aman di Google Drive.
        </p>

        {!driveToken ? (
          <button
            onClick={handleConnectDrive}
            disabled={isSyncing}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-500 text-white disabled:bg-gray-800 disabled:text-gray-500' 
                : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-200 disabled:text-gray-400'
            }`}
          >
            {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <Cloud size={18} />}
            {isSyncing ? 'Menghubungkan...' : 'Hubungkan dengan Google Drive'}
          </button>
        ) : (
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-500" />
                <span className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Terhubung</span>
              </div>
              <button onClick={() => setDriveToken(null)} className="text-xs font-bold text-gray-500 hover:text-red-500 underline">Putuskan</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleBackupToDrive}
                disabled={isSyncing}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all ${
                  isDark 
                    ? 'border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 text-gray-300 disabled:opacity-50' 
                    : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-600 disabled:opacity-50'
                }`}
              >
                {isSyncing ? <Loader2 size={24} className="animate-spin text-blue-500" /> : <CloudUpload size={24} className="text-blue-500" />}
                <span className="text-sm font-bold">Backup ke Cloud</span>
              </button>
              <button
                onClick={handleRestoreFromDrive}
                disabled={isSyncing}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all ${
                  isDark 
                    ? 'border-gray-700 hover:border-emerald-500 hover:bg-emerald-500/10 text-gray-300 disabled:opacity-50' 
                    : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-gray-600 disabled:opacity-50'
                }`}
              >
                {isSyncing ? <Loader2 size={24} className="animate-spin text-emerald-500" /> : <CloudDownload size={24} className="text-emerald-500" />}
                <span className="text-sm font-bold">Restore Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Status Google Drive */}
        {driveStatus && (
          <div className={`mt-3 flex gap-2 p-3 rounded-xl border text-sm animate-fade-in ${
            driveStatus.success
              ? isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : isDark ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {driveStatus.success ? <CheckCircle size={16} className="shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="shrink-0 mt-0.5" />}
            <p>{driveStatus.message}</p>
          </div>
        )}
      </div>

      {/* ── Export Options ── */}
      <div className={`p-5 rounded-2xl ${cardBg}`}>
        <h2 className="font-bold mb-1">Export Data</h2>
        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Pilih format untuk mengunduh data kamu
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* JSON Export */}
          <ExportCard
            icon={<FileJson size={24} className="text-violet-400" />}
            title="Export JSON"
            desc="Backup lengkap semua data. Bisa diimport kembali ke AturAja."
            badge="Direkomendasikan"
            badgeColor="bg-violet-500/15 text-violet-400"
            onClick={handleExportJSON}
            isDark={isDark}
          />

          {/* CSV Export */}
          <ExportCard
            icon={<FileText size={24} className="text-emerald-400" />}
            title="Export CSV"
            desc="Daftar transaksi dalam format spreadsheet (Excel/Google Sheets)."
            badge="Spreadsheet"
            badgeColor="bg-emerald-500/15 text-emerald-400"
            onClick={handleExportCSV}
            isDark={isDark}
          />
        </div>
      </div>

      {/* ── Import Data ── */}
      <div className={`p-5 rounded-2xl ${cardBg}`}>
        <h2 className="font-bold mb-1">Import Data</h2>
        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Restore backup dari file JSON AturAja
        </p>

        {/* Info */}
        <div className={`flex gap-2 p-3 rounded-xl mb-4 ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
          <Info size={15} className="text-blue-400 shrink-0 mt-0.5" />
          <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            Import akan <strong>mengganti</strong> semua data yang ada saat ini. Pastikan kamu sudah backup data terbaru sebelum melakukan import!
          </p>
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-dashed font-semibold text-sm transition-all
            ${isDark ? 'border-gray-700 text-gray-400 hover:border-violet-500/50 hover:text-violet-400 hover:bg-violet-500/5' : 'border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50'}`}
        >
          <Upload size={20} />
          Pilih File JSON untuk Import
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* ── Import Status ── */}
      {importStatus && (
        <div className={`flex gap-3 p-4 rounded-2xl border animate-slide-up ${
          importStatus.success
            ? isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
            : isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
        }`}>
          {importStatus.success
            ? <CheckCircle size={18} className="text-emerald-400 shrink-0" />
            : <AlertTriangle size={18} className="text-red-400 shrink-0" />
          }
          <p className={`text-sm font-medium ${importStatus.success ? 'text-emerald-400' : 'text-red-400'}`}>
            {importStatus.message}
            {importStatus.success && ' Halaman akan reload...'}
          </p>
        </div>
      )}

      {/* ── Tips ── */}
      <div className={`p-5 rounded-2xl ${cardBg}`}>
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <Shield size={16} className="text-violet-400" />
          Tips Aman Data AturAja
        </h2>
        <ul className="space-y-2">
          {[
            'Export JSON setiap hari atau minimal seminggu sekali',
            'Simpan file backup di Google Drive atau folder aman',
            'Jangan hapus cache browser tanpa backup dulu',
            'Gunakan perangkat yang sama untuk konsistensi data',
            'Simpan file backup dengan nama yang mudah dikenali',
          ].map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-violet-400 font-bold shrink-0">•</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Import Confirm Modal ── */}
      {importConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-4xl text-center mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-center mb-1">Konfirmasi Import</h3>
            <p className={`text-sm text-center mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              File backup ditemukan:
            </p>
            <div className={`p-3 rounded-xl mb-4 text-xs font-mono ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              <p>📦 {importConfirm.transactions?.length || 0} transaksi</p>
              <p>💰 {importConfirm.budgets?.length || 0} budget</p>
              <p>🎯 {importConfirm.savingsGoals?.length || 0} target nabung</p>
              <p>🗓️ Export: {importConfirm.exportedAt ? new Date(importConfirm.exportedAt).toLocaleDateString('id-ID') : '-'}</p>
            </div>
            <p className="text-sm text-center text-amber-400 mb-5">
              ⚠️ Data saat ini akan diganti!
            </p>
            <div className="flex gap-2">
              <button onClick={() => setImportConfirm(null)} className={`flex-1 btn border ${isDark ? 'border-gray-700 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                Batal
              </button>
              <button onClick={handleImportConfirm} className="flex-1 btn-primary">
                Import Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExportCard({ icon, title, desc, badge, badgeColor, onClick, isDark }) {
  return (
    <button
      onClick={onClick}
      className={`
        text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-95 group
        ${isDark ? 'bg-gray-800 border-gray-700 hover:border-violet-500/50' : 'bg-gray-50 border-gray-200 hover:border-violet-300 hover:bg-violet-50/30'}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        {icon}
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
      </div>
      <p className="font-bold text-sm mb-1">{title}</p>
      <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
      <div className={`mt-3 flex items-center gap-1 text-xs font-semibold text-violet-400 group-hover:gap-2 transition-all`}>
        <Download size={13} /> Download
      </div>
    </button>
  );
}
