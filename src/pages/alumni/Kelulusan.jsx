import React, { useState, useEffect } from 'react';
import { alumniApi } from '../../api/alumni';
import { Loader2, X, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TutwuriHandayani from '../../assets/TutwuriLogo.svg';
import { useThemeSettings } from '../../context/ThemeContext';

export default function Kelulusan() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kelulusanData, setKelulusanData] = useState(null);
  const [status, setStatus] = useState('belum_tersedia');
  const { theme } = useThemeSettings();

  useEffect(() => {
    const fetchKelulusan = async () => {
      try {
        setLoading(true);
        const res = await alumniApi.cekKelulusan();
        const result = res.data?.data;

        setStatus(result?.status || 'belum_tersedia');
        setKelulusanData(result);
      } catch (err) {
        console.error('Gagal mengecek kelulusan:', err);
        setError(err.response?.data?.message || 'Terjadi kesalahan saat memeriksa data.');
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchKelulusan();
  }, []);

  const handleCetak = () => {
    window.print();
  };

  // Data helpers untuk tampilan hasil
  const namaLengkap = kelulusanData?.alumni_nama || kelulusanData?.data?.nama || '-';
  const nisn = kelulusanData?.alumni_nisn || kelulusanData?.data?.nisn || '-';
  const jurusan = kelulusanData?.alumni_jurusan || kelulusanData?.data?.jurusan || '-';
  const tahun = kelulusanData?.data?.tahun_lulus || kelulusanData?.data?.tahunLulus || new Date().getFullYear();
  // Dinamis nama sekolah jika dari backend ada, default jika kosong
  const namaSekolah = kelulusanData?.data?.nama_sekolah || kelulusanData?.sekolah || 'SMA NEGERI 1 REJANG LEBONG';

  // Tema untuk status kelulusan pada kotak pengumuman
  const themes = {
    lulus: {
      bgBox: 'bg-[#E8F5E9]',
      borderBox: 'border-[#C8E6C9]',
      textTitle: 'text-[#2E7D32]',
      textStatus: 'text-[#1B5E20]',
      label: 'LULUS'
    },
    tidak_lulus: {
      bgBox: 'bg-[#FFEBEE]',
      borderBox: 'border-[#FFCDD2]',
      textTitle: 'text-[#C62828]',
      textStatus: 'text-[#B71C1C]',
      label: 'TIDAK LULUS'
    },
    belum_tersedia: {
      bgBox: 'bg-slate-100',
      borderBox: 'border-slate-200',
      textTitle: 'text-slate-600',
      textStatus: 'text-slate-800',
      label: 'BELUM TERSEDIA'
    }
  };

  const currentTheme = themes[status] || themes.belum_tersedia;
  const handleBack = () => {
    navigate("/alumni");
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] w-full bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#C62828] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Memeriksa Data...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] w-full bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/alumni')}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-slate-50 flex flex-col items-center justify-center p-4 md:py-6 md:px-8 font-sans overflow-hidden">

      <div className="w-full max-w-2xl flex flex-col gap-4 md:gap-5 animate-in fade-in duration-500">

        {/* ===== HEADER LOGO & JUDUL ===== */}
        <div className="w-full text-center">
          <div className="flex justify-center items-center gap-3 md:gap-4 mb-2 md:mb-3">
            <img
              src="/logo-provinsi.png"
              alt="Logo Provinsi"
              className="w-12 h-12 md:w-16 md:h-16 object-contain"
              onError={(e) => e.target.style.display = 'none'}
            />
            <img
              src={TutwuriHandayani}
              alt="Tut Wuri Handayani"
              className="w-12 h-12 md:w-16 md:h-16 object-contain"
              onError={(e) => e.target.style.display = 'none'}
            />
            <img
              src="/icon.png"
              alt="Logo Sekolah"
              className="w-12 h-12 md:w-16 md:h-16 object-contain"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>

          <h2 className="text-[#B91C1C] text-sm md:text-lg font-normal leading-tight uppercase">
            PENGUMUMAN KELULUSAN SISWA<br />
            {theme?.nama_sekolah || 'SMKN 2 Kraksaan'}<br />
          </h2>
        </div>

        <div className="w-full border-t border-gray-300"></div>

        {/* Kotak Status Pengumuman */}
        <div className={`w-full ${currentTheme.bgBox} border ${currentTheme.borderBox} rounded py-3 md:py-4 px-4 text-center`}>
          <p className={`${currentTheme.textStatus} text-xl md:text-3xl font-extrabold tracking-wide uppercase`}>
            {currentTheme.label}
          </p>

          {/* Ucapan Kelulusan */}
          {status === 'lulus' && (
            <div className="mt-2 pt-2 border-t border-[#C8E6C9] max-w-lg mx-auto">
              <p className="text-[#1B5E20] text-xs md:text-sm font-medium">
                Selamat! Kamu telah dinyatakan LULUS. Semoga kesuksesan selalu menyertai langkahmu selanjutnya dalam meraih cita-cita.
              </p>
            </div>
          )}

          {status === 'tidak_lulus' && (
            <div className="mt-2 pt-2 border-t border-[#FFCDD2] max-w-lg mx-auto">
              <p className="text-[#B71C1C] text-xs md:text-sm font-medium">
                Tetap semangat! Jangan berkecil hati dan silakan hubungi pihak sekolah untuk informasi lebih lanjut.
              </p>
            </div>
          )}
        </div>

        {/* Data Diri Singkat (hanya tampil jika data tersedia) */}
        {status !== 'belum_tersedia' && (
          <div className="w-full bg-white border border-gray-200 rounded-lg p-4 md:p-5 text-left shadow-sm">
            <h3 className="text-sm md:text-base font-bold text-gray-800 border-b border-gray-200 pb-2 mb-2 md:mb-3">Data Siswa</h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs md:text-sm">
              <div>
                <p className="text-gray-500 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-0.5">NISN</p>
                <p className="font-bold text-gray-900 truncate">{nisn}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-0.5">Nama Lengkap</p>
                <p className="font-bold text-gray-900 truncate" title={namaLengkap}>{namaLengkap}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-0.5">Jurusan</p>
                <p className="font-bold text-gray-900 truncate" title={jurusan}>{jurusan}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-0.5">Tahun Lulus</p>
                <p className="font-bold text-gray-900">{tahun}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tombol Cetak - disembunyikan saat mode print */}
        <div className="flex justify-center w-full gap-3">
          <button
            onClick={handleBack}
            className="cursor-pointer print:hidden  bg-slate-900 text-white font-bold py-2 md:py-3 px-6 md:px-8 rounded shadow flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
          >
            Kembali ke Beranda
          </button>
          <button
            onClick={handleCetak}
            disabled={status === 'belum_tersedia'}
            className={`cursor-pointer ${status === 'belum_tersedia' ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#C62828] hover:bg-[#B71C1C]'} print:hidden text-white font-bold py-2 md:py-3 px-6 md:px-8 rounded shadow flex items-center justify-center gap-2 transition-colors w-full sm:w-auto`}
          >
            <Printer className="w-4 h-4 md:w-5 md:h-5" />
            CETAK SURAT KELULUSAN
          </button>
        </div>

        {/* Himbauan Footer */}
        <div className="w-full text-left text-gray-500 text-xs space-y-1.5 border-t border-gray-300 pt-3">
          <p>
            Dicetak secara otomatis melalui Sistem Informasi Alumni pada {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}.
          </p>
          <p className="uppercase font-medium">
            Himbauan kepada seluruh siswa agar tidak melakukan konvoi dan mencoret-coret baju.
          </p>
        </div>

      </div>
    </div>
  );
}