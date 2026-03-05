import React, { useState, useEffect } from 'react';
import {
  MapPin, Briefcase, Clock, Calendar, Building2,
  Share2, AlertCircle, Loader2, FileText, ArrowLeft,
  Tag, Timer, Bookmark, Lightbulb
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { alumniApi } from '../../api/alumni';
import { STORAGE_BASE_URL } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';

// Dummy Banner
const bannerDefault = 'https://placehold.co/800x400?text=Lowongan+Kerja';

export default function LowonganDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: authUser } = useAuth();
  
  const navUser = { 
    nama_alumni: authUser?.alumni?.nama_alumni || authUser?.nama || 'Alumni',
    foto: authUser?.alumni?.foto || authUser?.foto 
  };

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.judul,
        text: `Lihat lowongan kerja ${job?.judul} di ${job?.perusahaan?.nama}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan lowongan berhasil disalin!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
        <Navbar user={navUser} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-[#3C5759]" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
        <Navbar user={navUser} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AlertCircle size={56} className="text-[#3C5759]/30" />
          <h2 className="text-xl font-black text-[#3C5759]">Lowongan Tidak Tersedia</h2>
          <p className="text-sm font-medium text-slate-500">{error || 'Data lowongan mungkin telah dihapus.'}</p>
          <button onClick={() => navigate('/lowongan')} className="mt-4 px-6 py-2.5 bg-[#3C5759] text-white text-sm font-bold rounded-xl hover:bg-[#2A3E3F] transition-all">
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
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => navigate('/lowongan')}
          className="flex items-center gap-2 text-slate-500 hover:text-[#3C5759] text-sm font-bold mb-6 transition-colors cursor-pointer w-fit group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* --- KONTEN KIRI (Header & Deskripsi) --- */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Kartu Header Utama */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group relative">
              
              {/* Banner Area - Teks "Lowongan Kerja" DIHAPUS dari sini */}
              <div className="w-full h-[280px] bg-gradient-to-b from-slate-200 to-slate-400 flex items-center justify-center relative overflow-hidden">
                <img
                  src={fotoUrl}
                  alt={job.judul}
                  // Hapus 'mix-blend-overlay' agar gambar asli terlihat lebih jelas
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                  onError={(e) => { e.target.src = bannerDefault; }}
                />
              </div>

              {/* Info Pekerjaan Utama */}
              <div className="p-6 md:p-8 relative bg-white -mt-10 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                        <Building2 size={24} className="text-[#3C5759]" />
                      </div>
                      <div>
                        <h2 className="text-[#3C5759] font-black text-sm uppercase tracking-widest">{job.perusahaan?.nama || '-'}</h2>
                        <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                          <MapPin size={12} /> {job.perusahaan?.kota?.nama || job.lokasi || '-'}
                        </p>
                      </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                      {job.judul}
                    </h1>

                    {/* Tag Tipe & Expired */}
                    <div className="flex flex-wrap gap-2.5 items-center pt-1">
                      <span className="px-3.5 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                        {job.tipe_pekerjaan || 'Tipe Tidak Ditentukan'}
                      </span>
                      {job.lowongan_selesai && (
                        <span className="px-3.5 py-1.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 border border-red-100">
                          <Clock size={12} strokeWidth={2.5} />
                          Ditutup: {new Date(job.lowongan_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tombol Aksi (Kanan Atas) - LOADING ICONS DIGANTI DENGAN EFEK PULSE PADA BOOKMARK */}
                  <div className="flex items-center gap-3 md:flex-col lg:flex-row shrink-0 mt-2 md:mt-0">
                    <button 
                      onClick={handleToggleSave}
                      disabled={savingId === job.id}
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all cursor-pointer ${
                        job.is_saved 
                          ? 'bg-[#3C5759]/10 border-[#3C5759]/20 text-[#3C5759]' 
                          : 'bg-white border-slate-200 text-slate-400 hover:text-[#3C5759] hover:border-[#3C5759]/30 hover:bg-slate-50'
                      } ${savingId === job.id ? 'opacity-80 cursor-not-allowed' : ''}`}
                    >
                      {/* Loader2 DIHAPUS. Ikon Bookmark akan berdenyut saat loading */}
                      <Bookmark 
                        size={20} 
                        fill={job.is_saved ? 'currentColor' : 'none'} 
                        className={`transition-all ${savingId === job.id ? 'animate-pulse scale-110 text-[#3C5759]' : ''}`}
                      />
                    </button>
                    <button 
                      onClick={handleShare}
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-slate-200 text-slate-400 hover:text-[#3C5759] hover:border-[#3C5759]/30 hover:bg-slate-50 transition-all cursor-pointer"
                      title="Bagikan Lowongan"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Kartu Deskripsi */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                  <FileText size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Deskripsi Pekerjaan</h2>
              </div>
              <div className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                {job.deskripsi || 'Tidak ada deskripsi yang disediakan oleh perusahaan.'}
              </div>
            </div>

          </div>

          {/* --- KONTEN KANAN (Sidebar Ringkasan) --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-28 space-y-6">

              {/* Card Ringkasan Info */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px] border-b border-slate-100 pb-4">
                  Ringkasan Posisi
                </h3>

                <div className="space-y-6">
                  {[
                    { icon: Building2, label: "Perusahaan", value: job.perusahaan?.nama },
                    { icon: MapPin, label: "Lokasi", value: job.lokasi || job.perusahaan?.kota?.nama },
                    { icon: Briefcase, label: "Tipe", value: job.tipe_pekerjaan },
                    { icon: Calendar, label: "Batas Melamar", value: job.lowongan_selesai ? new Date(job.lowongan_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' },
                    { icon: Timer, label: "Jam Kerja", value: (job.jam_mulai && job.jam_berakhir) ? `${job.jam_mulai.substring(0,5)} - ${job.jam_berakhir.substring(0,5)} WIB` : '-' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 text-slate-600 group">
                      <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:bg-[#3C5759]/10 group-hover:text-[#3C5759] transition-colors border border-slate-100 shrink-0">
                        <item.icon size={16} />
                      </div>
                      <div className="pt-0.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{item.value || '-'}</p>
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
                        <span key={skill.id} className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold rounded-lg shadow-sm">
                          {skill.nama}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* TIPS MELAMAR */}
              <div className="bg-[#3C5759] rounded-[2rem] p-7 text-white shadow-xl shadow-[#3C5759]/20 relative overflow-hidden">
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
                      <span>Pastikan <strong>CV & Portofolio</strong> Anda diperbarui sesuai dengan kualifikasi yang dicari.</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-amber-300 mt-0.5 font-bold">•</span>
                      <span>Periksa kembali <strong>email & nomor HP</strong> agar recruiter mudah menghubungi Anda.</span>
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

      <Footer />
    </div>
  );
}