import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Briefcase, 
  ShieldCheck, 
  Info, 
  CheckCircle2,
  Check,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/alumni/Navbar';

// --- DUMMY DATA NOTIFIKASI ---
const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    type: 'verification',
    title: 'Akun Terverifikasi',
    message: 'Selamat! Akun alumni Anda telah berhasil diverifikasi oleh admin. Sekarang Anda dapat mengakses semua fitur bursa kerja dan jejaring alumni.',
    time: '2 jam yang lalu',
    isUnread: true,
  },
  {
    id: 2,
    type: 'job',
    title: 'Status Lamaran Diperbarui',
    message: 'Lamaran Anda untuk posisi "Senior Product Designer" di PT. Maju Mundur telah berstatus: Menunggu Review.',
    time: '1 hari yang lalu',
    isUnread: true,
  },
  {
    id: 3,
    type: 'system',
    title: 'Kuesioner Tracer Study',
    message: 'Mohon luangkan waktu Anda untuk mengisi kuesioner tracer study periode tahun ini demi kemajuan almamater kita.',
    time: '3 hari yang lalu',
    isUnread: false,
  },
  {
    id: 4,
    type: 'job_success',
    title: 'Lamaran Diterima!',
    message: 'Selamat, perusahaan telah menyetujui lamaran Anda untuk tahap selanjutnya. Silakan periksa email Anda untuk jadwal wawancara.',
    time: '1 minggu yang lalu',
    isUnread: false,
  },
];

// Helper untuk icon dan warna
const getNotificationStyle = (type) => {
  switch (type) {
    case 'verification':
      return { icon: ShieldCheck, bg: 'bg-blue-50', text: 'text-blue-600' };
    case 'job':
      return { icon: Briefcase, bg: 'bg-amber-50', text: 'text-amber-600' };
    case 'job_success':
      return { icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600' };
    case 'system':
    default:
      return { icon: Info, bg: 'bg-slate-100', text: 'text-slate-600' };
  }
};

export default function Notifikasi() {
  const { user: authUser } = useAuth();
  
  const navUser = {
    nama_alumni: authUser?.alumni?.nama_alumni || authUser?.nama || 'Alumni',
    foto: authUser?.alumni?.foto || authUser?.foto
  };

  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('semua');

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isUnread: false })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isUnread: false } : notif
    ));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(notif => 
    activeFilter === 'belum_dibaca' ? notif.isUnread : true
  );

  const unreadCount = notifications.filter(n => n.isUnread).length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col selection:bg-primary/20">
      <Navbar user={navUser} />

      {/* --- HEADER SECTION --- */}
      <div className="relative pt-24 pb-8 w-full z-10 shrink-0">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-primary md:bg-linear-to-r md:from-primary md:via-[#4A6B6D] md:to-[#2A3E3F]"></div>
          <div className="absolute inset-0 opacity-10 bg-[url('/pattern.png')] bg-repeat mix-blend-overlay"></div>
          <svg className="absolute bottom-0 left-0 w-full h-16 md:h-20 translate-y-px" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path fill="#f8f9fa" d="M0,60L120,55C240,50,480,40,720,42C960,44,1200,58,1320,65L1440,72L1440,100L0,100Z" />
          </svg>
        </div>

        {/* max-w-5xl digunakan agar lebarnya melebar seperti garis merah di gambar Anda */}
        <div className="relative z-10 mt-5 max-w-5xl mx-auto px-6">
          <div className="mb-10 text-center text-white">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 uppercase flex items-center justify-center gap-3">
              <Bell size={32} strokeWidth={2.5} /> Notifikasi
            </h1>
            <p className="text-white/80 text-sm md:text-base font-medium max-w-xl mx-auto">
              Pantau pemberitahuan terbaru terkait akun, lamaran kerja, dan aktivitas almamater Anda.
            </p>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT (FULL SCREEN FLEX) --- */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 relative z-20 -mt-12 pb-6 md:pb-10 flex flex-col">
        
        <div className="flex-1 bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col min-h-125">
          
          {/* TOOLBAR FILTER & AKSI */}
          <div className="p-5 md:px-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 shrink-0">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-200/50 rounded-xl w-max">
              <button
                onClick={() => setActiveFilter('semua')}
                className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${
                  activeFilter === 'semua' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-500 hover:text-primary'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setActiveFilter('belum_dibaca')}
                className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center gap-1.5 ${
                  activeFilter === 'belum_dibaca' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-500 hover:text-primary'
                }`}
              >
                Belum Dibaca
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-5 text-center leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Aksi Kanan */}
            {notifications.length > 0 && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={14} strokeWidth={3} /> Tandai semua dibaca
                </button>
                <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>
                <button 
                  onClick={clearNotifications}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} /> Bersihkan
                </button>
              </div>
            )}
          </div>

          {/* LIST NOTIFIKASI */}
          <div className="flex-1 p-3 md:p-5 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-2">
                  {filteredNotifications.map((notif) => {
                    const style = getNotificationStyle(notif.type);
                    const Icon = style.icon;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`group relative flex items-start gap-4 p-4 md:p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                          notif.isUnread 
                            ? 'bg-blue-50/30 border-blue-100 hover:bg-blue-50/60' 
                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'
                        }`}
                      >
                        {/* Dot Unread Indicator */}
                        {notif.isUnread && (
                          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        )}

                        {/* Icon Background */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${style.bg} ${style.text}`}>
                          <Icon size={22} strokeWidth={2.5} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className={`text-sm font-bold truncate ${notif.isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                              {notif.title}
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                              {notif.time}
                            </span>
                          </div>
                          <p className={`text-sm leading-relaxed line-clamp-2 md:line-clamp-none ${notif.isUnread ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                            {notif.message}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* EMPTY STATE */
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex flex-col items-center justify-center h-full min-h-75 text-center py-10"
                >
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Bell size={40} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-black text-slate-700 mb-1">Tidak Ada Notifikasi</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    {activeFilter === 'belum_dibaca' 
                      ? 'Hebat! Anda telah membaca semua notifikasi terbaru.' 
                      : 'Belum ada aktivitas atau pemberitahuan baru untuk akun Anda saat ini.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>

    </div>
  );
}