import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, MoveUpRight, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import { STORAGE_BASE_URL } from '../api/axios';
import { useThemeSettings } from '../context/ThemeContext';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

const fallbackJobs = [
  {
    role: "Frontend Developer (React)",
    type: "Full-time",
    loc: "Jakarta Selatan",
    comp: "TechAsia Inc.",
    desc: "Membangun antarmuka modern untuk platform edukasi digital.",
    banner: "https://i.pinimg.com/736x/13/40/11/1340118d98bb8e13d0fc55fa303a13ab.jpg"
  },
  {
    role: "Network Administrator",
    type: "Contract",
    loc: "Surabaya",
    comp: "Telkomsel",
    desc: "Maintenance infrastruktur jaringan dan keamanan server.",
    banner: "https://i.pinimg.com/736x/51/a4/86/51a4862d1dbfb9f45315d381c1526f21.jpg"
  },
  {
    role: "Graphic Designer",
    type: "Remote",
    loc: "Global",
    comp: "Kreativ Studio",
    desc: "Menciptakan aset visual kreatif untuk brand internasional.",
    banner: "https://i.pinimg.com/736x/ee/e8/ca/eee8cae4c277e4868e8c7d617b6ac545.jpg"
  },
  {
    role: "Finance Staff",
    type: "Full-time",
    loc: "Semarang",
    comp: "Indofood",
    desc: "Mengelola laporan keuangan dan administrasi pajak.",
    banner: "https://i.pinimg.com/736x/a1/d5/ab/a1d5aba26b169b4d13b621a2c9a01d3a.jpg"
  }
];

export default function CareerSection({ jobList }) {
  const { theme } = useThemeSettings();
  const navigate = useNavigate(); // <-- Inisialisasi
  const { user } = useAuth();     // <-- Inisialisasi
  
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage]);

  const jobs = (jobList && jobList.length > 0)
    ? jobList.slice(0, 4).map(j => ({
      role: j.judul_lowongan || j.judul || j.title || '-',
      type: j.tipe_pekerjaan || j.type || 'Full-time',
      loc: j.perusahaan?.kota?.nama_kota || j.lokasi || j.location || '-',
      comp: j.perusahaan?.nama_perusahaan || j.company || '-',
      desc: j.deskripsi || j.description || '-',
      banner: (j.foto_lowongan || j.foto || j.banner) ? getImageUrl(j.foto_lowongan || j.foto || j.banner) : 'https://i.pinimg.com/736x/13/40/11/1340118d98bb8e13d0fc55fa303a13ab.jpg',
    }))
    : fallbackJobs;

  return (
    <section id="karir" className="py-10 px-4 sm:px-6 sm:py-15 lg:px-8 max-w-7xl mx-auto">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* --- HEADER DIPERBARUI: Judul di kiri, Tombol di Kanan --- */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-black text-primary tracking-tight mb-4">
              Lowongan <span className="text-third">Pekerjaan</span>
            </h2>
            <p className="text-primary/80 font-medium text-lg">
              Informasi lowongan terbaru hasil kurasi jaringan alumni dan mitra strategis {theme?.namaSekolah || 'SMKN 2 Kraksaan'}.
            </p>
          </motion.div>

          {/* Tombol dipindah ke sini agar sejajar */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onClick={() => user ? navigate("/alumni/lowongan") : navigate("/login")}
            className="group flex shrink-0 items-center gap-2.5 px-6 py-3 bg-transparent text-primary rounded-xl text-sm font-bold hover:bg-primary/10 transition-all duration-300 cursor-pointer w-fit"
          >
            Lihat Semua Lowongan
            <ArrowRight size={18} className="text-primary/70 group-hover:text-primary group-hover:translate-x-1.5 transition-all duration-300" />
          </motion.button>
        </div>
        {/* -------------------------------------------------------- */}

        {/* Job Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {jobs.map((job, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white rounded-md overflow-hidden border border-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(60,87,89,0.1)] transition-all duration-500 flex flex-col"
            >
              {/* Job Banner - Dibuat bisa diklik */}
              <div 
                className="h-60 w-full overflow-hidden relative cursor-pointer"
                onClick={() => setSelectedImage(job.banner)}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
                <img
                  src={job.banner}
                  alt={job.role}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-primary uppercase">
                    {job.type}
                  </span>
                </div>
              </div>

              {/* Job Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-primary leading-tight mb-1 group-hover:text-amber-600 transition-colors cursor-pointer">
                    {job.role}
                  </h3>
                  <p className="text-xs font-bold text-third uppercase tracking-wider">
                    {job.comp}
                  </p>
                </div>

                <p className="text-sm text-primary/80 leading-relaxed mb-6 line-clamp-2">
                  {job.desc}
                </p>

                {/* Footer Card */}
                <div className="mt-auto pt-4 border-t border-fourth flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-third">
                    <MapPin size={16} />
                    <span className="text-xs font-bold">{job.loc}</span>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-fourth text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all cursor-pointer">
                    <MoveUpRight size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* MODAL PREVIEW GAMBAR */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full bg-white rounded-4xl overflow-hidden shadow-2xl z-10 flex flex-col"
            >
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all cursor-pointer text-slate-700"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
              <div className="bg-slate-100 flex items-center justify-center p-4 min-h-[50vh]">
                <img
                  src={selectedImage}
                  alt="Pratinjau Lowongan"
                  className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-sm"
                />
              </div>
              <div className="p-5 text-center border-t border-slate-100 bg-white">
                <h3 className="font-bold text-primary text-sm">Pratinjau Banner Lowongan</h3>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}