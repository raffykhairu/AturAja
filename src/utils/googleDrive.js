// ===================================
// AturAja - Google Drive Sync Utilities
// ===================================

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

/**
 * Meminta token akses Google Drive
 * Menggunakan Implicit Flow dari Google Identity Services
 */
export const requestGoogleDriveToken = () => {
  return new Promise((resolve, reject) => {
    if (!CLIENT_ID || CLIENT_ID === 'masukkan_client_id_anda_disini') {
      return reject(new Error("Google Client ID belum dikonfigurasi di file .env"));
    }

    if (!window.google) {
      return reject(new Error("Script Google Identity Services gagal dimuat"));
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          resolve(tokenResponse.access_token);
        } else {
          reject(new Error("Gagal mendapatkan akses token"));
        }
      },
      error_callback: (error) => {
        reject(error);
      }
    });

    client.requestAccessToken();
  });
};

/**
 * Mencari file backup di AppDataFolder Google Drive
 * @param {string} token - Access token dari requestGoogleDriveToken
 */
export const findBackupFile = async (token) => {
  try {
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name="aturaja-backup.json"',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Gagal mencari file backup");

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      return data.files[0]; // Kembalikan file pertama yang ditemukan
    }
    return null;
  } catch (error) {
    console.error("Error finding backup:", error);
    throw error;
  }
};

/**
 * Membuat file backup baru atau menimpa yang sudah ada di AppDataFolder
 * @param {string} token - Access token
 * @param {object} fileData - Data JSON yang akan diupload
 * @param {string} existingFileId - (Opsional) ID file jika ingin menimpa (update)
 */
export const uploadBackup = async (token, fileData, existingFileId = null) => {
  try {
    const fileContent = JSON.stringify(fileData);
    const file = new Blob([fileContent], { type: 'application/json' });
    const metadata = {
      name: 'aturaja-backup.json',
      parents: ['appDataFolder']
    };

    const form = new FormData();
    // Kalau upload baru, kirim metadata dan file
    // Kalau update, kirim file saja (karena metadata gak berubah, atau bisa di-patch)
    if (!existingFileId) {
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    }
    form.append('file', file);

    const url = existingFileId 
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const method = existingFileId ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form
    });

    if (!response.ok) throw new Error("Gagal mengupload backup");

    return await response.json();
  } catch (error) {
    console.error("Error uploading backup:", error);
    throw error;
  }
};

/**
 * Mengunduh isi file backup dari Google Drive
 * @param {string} token - Access token
 * @param {string} fileId - ID file backup
 */
export const downloadBackup = async (token, fileId) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Gagal mengunduh backup");

    return await response.json();
  } catch (error) {
    console.error("Error downloading backup:", error);
    throw error;
  }
};
