import Swal from 'sweetalert2';

export const alertSuccess = (message) => {
  Swal.fire({
    icon: 'success',
    title: 'Berhasil',
    text: message,
    confirmButtonColor: '#3C5759',
  });
};

export const alertError = (message) => {
  Swal.fire({
    icon: 'error',
    title: 'Gagal',
    text: message,
    confirmButtonColor: '#3C5759',
  });
};

// TAMBAHKAN INI:
export const alertWarning = (message) => {
  Swal.fire({
    icon: 'warning',
    title: 'Peringatan',
    text: message,
    confirmButtonColor: '#3C5759',
  });
};

export const alertConfirm = async (message) => {
  return await Swal.fire({
    title: 'Apakah Anda yakin?',
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3C5759',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya, Lanjutkan!',
    cancelButtonText: 'Batal'
  });
};