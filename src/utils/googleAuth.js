// Helper untuk men-decode JWT token standar
export const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * Menginisialisasi tombol Sign In With Google.
 * Berbeda dengan implicit flow Google Drive, ini khusus untuk autentikasi profil.
 */
export const initGoogleSignIn = (clientId, buttonRef, onCredentialResponse) => {
  if (!clientId || clientId === 'masukkan_client_id_anda_disini') {
    console.error("Google Client ID belum dikonfigurasi.");
    return;
  }

  if (!window.google) {
    console.error("Script Google Identity Services belum dimuat.");
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: onCredentialResponse,
  });

  if (buttonRef && buttonRef.current) {
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: 250
    });
  }
};
