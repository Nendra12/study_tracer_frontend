import React, { useState, useEffect } from 'react';
import {
  MapPin, Briefcase, Clock, Calendar, Building2,
  AlertCircle, Loader2, FileText, ArrowLeft, Share2,
  Tag, Timer, Bookmark, Lightbulb, Eye, X
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { alumniApi } from '../../api/alumni';
import { STORAGE_BASE_URL } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { shareLowongan } from '../../utils/share';

import Navbar from '../../components/alumni/Navbar';
import { LowonganDetailSkeleton } from '../../components/alumni/skeleton';
import ShareToChatModal from '../../components/alumni/ShareToChatModal';
import ShareLowonganOptionsModal from '../../components/alumni/ShareLowonganOptionsModal';

// Dummy Banner
const bannerDefault = 'https://placehold.co/800x400?text=Lowongan+Kerja';

export default function LowonganDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: authUser } = useAuth();

  const navUser = {
    nama_alumni: authUser?.profile?.nama || authUser?.nama || 'Alumni',
    foto: authUser?.profile?.foto || authUser?.foto
  };

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [isShareOptionsOpen, setIsShareOptionsOpen] = useState(false);
  const [isShareChatOpen, setIsShareChatOpen] = useState(false);

  // State untuk Pratinjau Gambar
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/lowongan/${id}`);
        const jobData = res.data?.data || res.data;

        let isSaved = false;
        try {
          const savedRes = await alumniApi.getSavedLowongan({ per_page: 100 });
          const savedList = savedRes.data?.data?.data || savedRes.data?.data || [];
          isSaved = savedList.some(item => String(item.id_lowongan || item.lowongan?.id) === String(id));
        } catch (e) { /* Abaikan jika error fetch saved */ }

        setJob({ ...jobData, is_saved: isSaved });
      } catch (err) {
        setError('Lowongan tidak ditemukan atau telah dihapus.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJob();
  }, [id]);

  const handleToggleSave = async () => {
    try {
      setSavingId(job.id);
      await alumniApi.toggleSaveLowongan(job.id);
      setJob(prev => ({ ...prev, is_saved: !prev.is_saved }));
    } catch (err) {
      console.error('Toggle save failed:', err);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
        <LowonganDetailSkeleton />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AlertCircle size={56} className="text-primary/30" />
          <h2 className="text-xl font-black text-primary">Lowongan Tidak Tersedia</h2>
          <p className="text-sm font-medium text-slate-500">{error || 'Data lowongan mungkin telah dihapus.'}</p>
          <button onClick={() => navigate('/lowongan')} className="mt-4 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-md hover:bg-[#2c4042] transition-all cursor-pointer">
            Kembali ke Bursa Kerja
          </button>
        </div>
      </div>
    );
  }

  const fotoUrl = job.foto
    ? (job.foto.startsWith('http') ? job.foto : `${STORAGE_BASE_URL}/${job.foto}`)
    : bannerDefault;

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col selection:bg-primary/20">

      <main className="flex-1 w-full max-w-300 mx-auto px-4 sm:px-7 xl:px-0 pt-28 pb-20">

        {/* Tombol Kembali */}
        <button
          onClick={() => navigate('/alumni/lowongan')}
          className="flex items-center gap-2 text-slate-500 hover:text-primary text-sm font-bold mb-6 transition-colors cursor-pointer w-fit group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

          {/* --- KONTEN KIRI (Header & Deskripsi) --- */}
          <div className="lg:col-span-8 space-y-6">

            {/* AREA HEADER BARU */}
            <div className="bg-white rounded-md border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group">

              {/* --- BAGIAN POSTER HEADER (Bisa Diklik Untuk Pratinjau) --- */}
              <div
                onClick={() => setShowPreviewModal(true)}
                className="w-full h-55 md:h-70 bg-slate-50 flex items-center justify-center border-b border-slate-100 relative overflow-hidden cursor-pointer"
                title="Klik untuk lihat poster penuh"
              >
                <img
                  src={fotoUrl}
                  alt={job.judul}
                  // object-cover object-center akan membuat gambar memotong pas di tengah tanpa ada area kosong
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => { e.target.src = bannerDefault; }}
                />
                {/* Gradient overlay opsional agar perpindahan ke area putih di bawahnya lebih mulus */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              </div>

              {/* Box Info Utama */}
              <div className="p-6 md:p-8 relative bg-white">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-5">

                  {/* Perusahaan & Lokasi */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 shrink-0">
                      <Building2 size={24} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-primary font-black text-sm uppercase tracking-widest leading-none mb-1.5">
                        {job.perusahaan?.nama || '-'}
                      </h2>
                      <p className="text-[12px] text-slate-500 font-bold flex items-center gap-1.5">
                        <MapPin size={13} /> {job.perusahaan?.kota?.nama || job.lokasi || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Tombol Aksi: Share, Simpan & Pratinjau */}
                  <div className="flex items-center gap-3 sm:flex-col lg:flex-row shrink-0 mt-2 sm:mt-0">
                    <button
                      onClick={() => setIsShareOptionsOpen(true)}
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                      title="Bagikan Lowongan"
                    >
                      <Share2 size={20} />
                    </button>
                    <button
                      onClick={handleToggleSave}
                      disabled={savingId === job.id}
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all shrink-0 cursor-pointer ${job.is_saved
                          ? 'bg-primary/10 border-primary/20 text-primary'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-slate-50'
                        } ${savingId === job.id ? 'opacity-80 cursor-not-allowed' : ''}`}
                      title={job.is_saved ? "Hapus dari Tersimpan" : "Simpan Lowongan"}
                    >
                      <Bookmark
                        size={20}
                        fill={job.is_saved ? 'currentColor' : 'none'}
                        className={`transition-all ${savingId === job.id ? 'animate-pulse scale-110 text-primary' : ''}`}
                      />
                    </button>
                    <button
                      onClick={() => setShowPreviewModal(true)}
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-slate-50 transition-all cursor-pointer"
                      title="Pratinjau Poster Penuh"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-primary leading-tight tracking-tight mb-5">
                  {job.judul}
                </h1>

                {/* Tags Tipe & Deadline */}
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="px-4 py-2 bg-fourth text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-xl">
                    {job.tipe_pekerjaan || 'Tipe Tidak Ditentukan'}
                  </span>
                  {job.lowongan_selesai && (
                    <span className="px-4 py-2 bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 border border-red-100">
                      <Clock size={14} strokeWidth={2.5} />
                      Ditutup: {new Date(job.lowongan_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Kartu Deskripsi */}
            <div className="bg-white rounded-md p-6 md:p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2 bg-fourth rounded-xl text-primary">
                  <FileText size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black text-primary tracking-tight">Deskripsi Pekerjaan</h2>
              </div>
              <div className="prose prose-slate prose-sm sm:prose-base max-w-none text-primary/80 font-medium leading-relaxed whitespace-pre-line">
                {job.deskripsi || 'Tidak ada deskripsi yang disediakan oleh perusahaan.'}
              </div>
            </div>

          </div>

          {/* --- KONTEN KANAN (Sidebar Ringkasan) --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-28 space-y-6">

              {/* Card Ringkasan Info */}
              <div className="bg-white rounded-md p-6 md:p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
                <h3 className="font-black text-primary uppercase tracking-widest text-[11px] border-b border-slate-100 pb-4">
                  Ringkasan Posisi
                </h3>

                <div className="space-y-6">
                  {[
                    { icon: Building2, label: "Perusahaan", value: job.perusahaan?.nama },
                    { icon: MapPin, label: "Lokasi", value: job.lokasi || job.perusahaan?.kota?.nama },
                    { icon: Briefcase, label: "Tipe", value: job.tipe_pekerjaan },
                    { icon: Calendar, label: "Batas Melamar", value: job.lowongan_selesai ? new Date(job.lowongan_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' },
                    { icon: Timer, label: "Jam Kerja", value: (job.jam_mulai && job.jam_berakhir) ? `${job.jam_mulai.substring(0, 5)} - ${job.jam_berakhir.substring(0, 5)} WIB` : '-' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 text-slate-600 group">
                      <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors border border-slate-100 shrink-0">
                        <item.icon size={16} />
                      </div>
                      <div className="pt-0.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-sm font-bold text-primary leading-tight">{item.value || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                      <Tag size={14} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Keahlian Dicari</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span key={skill.id} className="px-3 py-1.5 bg-fourth border border-slate-100 text-primary/80 text-[11px] font-bold rounded-lg shadow-sm">
                          {skill.nama}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* TIPS MELAMAR */}
              <div className="bg-primary rounded-md p-7 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="relative z-10 space-y-4">

                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 text-amber-300 shadow-sm">
                      <Lightbulb size={20} />
                    </div>
                    <h3 className="font-black text-lg tracking-tight">Tips Melamar</h3>
                  </div>

                  <ul className="text-[13px] text-white/90 font-medium space-y-3 pt-2">
                    <li className="flex gap-2.5 items-start">
                      <span className="text-amber-300 mt-0.5 font-bold">•</span>
                      <span>Pastikan <strong>CV & Portofolio</strong> Anda diperbarui sesuai dengan kualifikasi.</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-amber-300 mt-0.5 font-bold">•</span>
                      <span>Periksa kembali <strong>email & nomor HP</strong> agar mudah dihubungi.</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-amber-300 mt-0.5 font-bold">•</span>
                      <span>Segera daftar sebelum <strong>batas waktu pendaftaran</strong> ditutup.</span>
                    </li>
                  </ul>

                </div>

                {/* Hiasan Lingkaran Background */}
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -left-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ================= MODAL PRATINJAU POSTER ================= */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreviewModal(false)}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()} // Mencegah modal tutup saat gambar diklik
              className="relative max-w-4xl w-auto max-h-[90vh] bg-white rounded-md overflow-hidden shadow-2xl p-2 flex flex-col items-center justify-center min-h-75"
            >
              {/* Tombol Tutup Modal */}
              <button
                onClick={() => setShowPreviewModal(false)}
                className="absolute top-4 right-4 z-10 bg-white/90 p-2.5 rounded-full shadow-lg text-primary hover:bg-white transition-all cursor-pointer backdrop-blur-md border border-slate-100"
              >
                <X size={20} />
              </button>

              {/* Gambar Poster Penuh (Tidak terpotong sama sekali) */}
              <div className="w-full h-full overflow-y-auto rounded-xl custom-scrollbar flex items-center justify-center bg-slate-50">
                <img
                  src={fotoUrl}
                  alt="Pratinjau Poster Penuh"
                  className="w-auto max-w-full h-auto max-h-full object-contain"
                  onError={(e) => { e.target.src = bannerDefault; }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareToChatModal
        isOpen={isShareChatOpen}
        onClose={() => setIsShareChatOpen(false)}
        lowongan={{
          id: job.id,
          judul: job.judul,
          perusahaan: job.perusahaan?.nama,
        }}
      />

      <ShareLowonganOptionsModal
        isOpen={isShareOptionsOpen}
        onClose={() => setIsShareOptionsOpen(false)}
        onShareChat={() => {
          setIsShareOptionsOpen(false);
          setIsShareChatOpen(true);
        }}
        onShareExternal={() => {
          shareLowongan({
            id: job.id,
            judul: job.judul,
            perusahaan: job.perusahaan?.nama,
          });
          setIsShareOptionsOpen(false);
        }}
      />

    </div>
  );
}