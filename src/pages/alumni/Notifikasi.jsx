import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Briefcase, 
  ShieldCheck, 
  Info, 
  CheckCircle2,
  Check,
  Trash2,
  XCircle,
  Ban,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/alumni/Navbar';
import { alumniApi } from '../../api/alumni';

// Helper untuk icon dan warna berdasarkan type
const getNotificationStyle = (type) => {
  switch (type) {
    case 'verification':
      return { icon: ShieldCheck, bg: 'bg-emerald-50', text: 'text-emerald-600' };
    case 'lowongan':
      return { icon: Briefcase, bg: 'bg-blue-50', text: 'text-blue-600' };
    case 'career_status':
      return { icon: CheckCircle2, bg: 'bg-purple-50', text: 'text-purple-600' };
    case 'kuesioner':
      return { icon: FileText, bg: 'bg-amber-50', text: 'text-amber-600' };
    case 'rejected':
      return { icon: XCircle, bg: 'bg-red-50', text: 'text-red-600' };
    case 'banned':
      return { icon: Ban, bg: 'bg-slate-100', text: 'text-slate-600' };
    case 'system':
    default:
      return { icon: Info, bg: 'bg-slate-100', text: 'text-slate-600' };
  }
};

// Helper untuk format waktu relatif
const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const notifDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now - notifDate) / 1000);

  if (diffInSeconds < 60) return 'Baru saja';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} minggu yang lalu`;
  return `${Math.floor(diffInSeconds / 2592000)} bulan yang lalu`;
};

export default function Notifikasi() {
  const { user: authUser } = useAuth();
  
  const navUser = {
    nama_alumni: authUser?.alumni?.nama_alumni || authUser?.nama || 'Alumni',
    foto: authUser?.alumni?.foto || authUser?.foto
  };

  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('semua');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, [activeFilter, currentPage]);

  // Fetch unread count setiap 30 detik
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { 
        page: currentPage,
        per_page: 15
      };
      
      if (activeFilter === 'belum_dibaca') {
        params.unread_only = 'true';
      }
      
      const response = await alumniApi.getNotifications(params);
      setNotifications(response.data.data.data || []);
      setTotalPages(response.data.data.last_page || 1);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Gagal memuat notifikasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await alumniApi.getNotificationUnreadCount();
      setUnreadCount(response.data.data.unread_count || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await alumniApi.markNotificationAsRead(id);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await alumniApi.markAllNotificationsAsRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('Gagal menandai semua notifikasi sebagai dibaca.');
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm('Yakin ingin menghapus semua notifikasi?')) return;
    
    try {
      await alumniApi.deleteAllNotifications();
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error clearing notifications:', err);
      setError('Gagal menghapus notifikasi.');
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation(); // Prevent marking as read when deleting
    
    try {
      await alumniApi.deleteNotification(id);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

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
                  disabled={unreadCount === 0 || loading}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={14} strokeWidth={3} /> Tandai semua dibaca
                </button>
                <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>
                <button 
                  onClick={clearAllNotifications}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} /> Bersihkan
                </button>
              </div>
            )}
          </div>

          {/* LIST NOTIFIKASI */}
          <div className="flex-1 p-3 md:p-5 overflow-y-auto">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full min-h-75 text-center py-10">
                <Loader2 size={40} className="text-primary animate-spin mb-4" />
                <p className="text-slate-500 text-sm">Memuat notifikasi...</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {notifications.length > 0 ? (
                  <div className="space-y-2">
                    {notifications.map((notif) => {
                      const style = getNotificationStyle(notif.type);
                      const Icon = style.icon;

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          key={notif.id_notification}
                          onClick={() => !notif.is_read && markAsRead(notif.id_notification)}
                          className={`group relative flex items-start gap-4 p-4 md:p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                            !notif.is_read
                              ? 'bg-blue-50/30 border-blue-100 hover:bg-blue-50/60' 
                              : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'
                          }`}
                        >
                          {/* Dot Unread Indicator */}
                          {!notif.is_read && (
                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                          )}

                          {/* Icon Background */}
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${style.bg} ${style.text}`}>
                            <Icon size={22} strokeWidth={2.5} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h3 className={`text-sm font-bold ${!notif.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                                {notif.title}
                              </h3>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap mt-0.5">
                                  {formatRelativeTime(notif.created_at)}
                                </span>
                                {/* Delete Button */}
                                <button
                                  onClick={(e) => deleteNotification(notif.id_notification, e)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-lg"
                                  title="Hapus notifikasi"
                                >
                                  <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
                                </button>
                              </div>
                            </div>
                            <p className={`text-sm leading-relaxed ${!notif.is_read ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
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
            )}
          </div>

          {/* PAGINATION */}
          {!loading && notifications.length > 0 && totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-slate-600 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} /> Sebelumnya
              </button>
              
              <span className="text-sm font-bold text-slate-600">
                Halaman {currentPage} dari {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-slate-600 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya <ChevronRight size={16} />
              </button>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}