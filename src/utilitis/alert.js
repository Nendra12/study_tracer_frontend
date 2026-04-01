import Swal from 'sweetalert2';

// Gunakan variabel CSS yang disuntikkan oleh ThemeContext
// Kita berikan fallback '#3C5759' untuk berjaga-jaga jika variabel belum termuat
const primaryColor = 'var(--color-primary, #3C5759)';

export const alertSuccess = (message) => {
  Swal.fire({
    icon: 'success',
    title: 'Berhasil',
    text: message,
    confirmButtonColor: primaryColor,
  });
};

export const alertError = (message) => {
  Swal.fire({
    icon: 'error',
    title: 'Gagal',
    text: message,
    confirmButtonColor: primaryColor,
  });
};

export const alertWarning = (message) => {
  Swal.fire({
    icon: 'warning',
    title: 'Peringatan',
    text: message,
    confirmButtonColor: primaryColor,
  });
};

export const alertConfirm = async (message) => {
  return await Swal.fire({
    title: 'Apakah Anda yakin?',
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: primaryColor,
    cancelButtonColor: '#d33', // Warna merah untuk tombol batal biarkan tetap statis
    confirmButtonText: 'Ya, Lanjutkan!',
    cancelButtonText: 'Batal'
  });
};