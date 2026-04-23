import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

// Gunakan variabel CSS yang disuntikkan oleh ThemeContext
const primaryColor = 'var(--color-primary, #3C5759)';

const blurActiveElement = () => {
  try {
    const active = document?.activeElement;
    if (active && typeof active.blur === 'function') active.blur();
  } catch {
    // no-op
  }
};

/* ==========================================
   1. ALERT ADMIN (MENGGUNAKAN SWEETALERT2)
   ========================================== */

export const alertSuccess = (message) => {
  blurActiveElement();
  Swal.fire({
    icon: 'success',
    title: 'Berhasil',
    text: message,
    confirmButtonColor: primaryColor,
  });
};

export const alertError = (message) => {
  blurActiveElement();
  Swal.fire({
    icon: 'error',
    title: 'Gagal',
    text: message,
    confirmButtonColor: primaryColor,
  });
};

export const alertWarning = (message) => {
  blurActiveElement();
  Swal.fire({
    icon: 'warning',
    title: 'Peringatan',
    text: message,
    confirmButtonColor: primaryColor,
  });
};

export const alertConfirm = async (message) => {
  blurActiveElement();
  return await Swal.fire({
    title: 'Apakah Anda yakin?',
    text: message,
    icon: 'question',
    scrollbarPadding: false,
    showCancelButton: true,
    confirmButtonColor: primaryColor,
    cancelButtonColor: '#d33', 
    confirmButtonText: 'Ya, Lanjutkan!',
    cancelButtonText: 'Batal'
  });
};


/* ==========================================
   2. ALERT ALUMNI (MENGGUNAKAN REACT HOT TOAST)
   ========================================== */

export const toastSuccess = (message) => {
  toast.success(message, {
    position: 'top-right',
    style: {
      borderRadius: '10px',
      background: '#333',
      color: '#fff',
    },
  });
};

export const toastError = (message) => {
  toast.error(message, {
    position: 'top-right',
    style: {
      borderRadius: '10px',
      background: '#fee2e2', 
      color: '#991b1b', 
    },
  });
};

export const toastWarning = (message) => {
  toast(message, {
    icon: '⚠️',
    position: 'top-center',
    style: {
      borderRadius: '10px',
      background: '#fef3c7', 
      color: '#92400e', 
    },
  });
};