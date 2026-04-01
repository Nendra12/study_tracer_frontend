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
import { alertConfirm } from '../../utilitis/alert';

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
    nama_alumni: authUser?.profile?.nama || authUser?.nama || 'Alumni',
    foto: authUser?.profile?.foto || authUser?.foto
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
    const confirm = await alertConfirm("Apakah anda yakin ingin menghapus semua notifikasi?")
    if (!confirm.isConfirmed) return;
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
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col selection:bg-[#425A5C]/20 overflow-x-hidden">

      {/* --- HEADER SECTION (GAYA BARU KONSISTEN) --- */}
      <section className="relative pt-28 pb-24 w-full z-30 bg-[#425A5C] rounded-b-[2.5rem]">
        {/* max-w-5xl digunakan untuk notifikasi agar nyaman dibaca, tapi padding disejajarkan dengan class w-full */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 capitalize">
              Notifikasi
            </h1>
            <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed">
              Pantau pemberitahuan terbaru terkait akun, lamaran kerja, dan aktivitas almamater Anda.
            </p>
          </div>

          <div className="hidden lg:flex items-center justify-center opacity-80">
            <Bell size={120} className="text-white/10" />
          </div>

        </div>
      </section>

      {/* --- MAIN CONTENT (FLOATING CARD AREA) --- */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 lg:px-12 relative z-40 -mt-10 pb-12 flex flex-col">

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">

          {/* TOOLBAR FILTER & AKSI */}
          <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shrink-0">
            {/* Tabs (Gaya Baru) */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveFilter('semua')}
                className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${activeFilter === 'semua'
                    ? 'bg-[#425A5C] text-white shadow-md'
                    : 'bg-slate-50 text-slate-500 hover:text-[#425A5C] hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                Semua
              </button>
              <button
                onClick={() => setActiveFilter('belum_dibaca')}
                className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-2 ${activeFilter === 'belum_dibaca'
                    ? 'bg-[#425A5C] text-white shadow-md'
                    : 'bg-slate-50 text-slate-500 hover:text-[#425A5C] hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                Belum Dibaca
                {unreadCount > 0 && (
                  <span className={`${activeFilter === 'belum_dibaca' ? 'bg-white text-[#425A5C]' : 'bg-red-500 text-white'
                    } text-[10px] px-1.5 py-0.5 rounded-full min-w-5 text-center leading-none shadow-sm`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Aksi Kanan */}
            {notifications.length > 0 && (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0 || loading}
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-slate-500 hover:text-[#425A5C] hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={14} strokeWidth={3} /> <span className="hidden sm:inline">Tandai semua dibaca</span>
                </button>
                <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                <button
                  onClick={clearAllNotifications}
                  disabled={loading}
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} /> <span className="hidden sm:inline">Bersihkan</span>
                </button>
              </div>
            )}
          </div>

          {/* LIST NOTIFIKASI */}
          <div className="flex-1 p-3 md:p-6 overflow-y-auto bg-slate-50/30">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center py-10">
                <Loader2 size={40} className="text-[#425A5C] animate-spin mb-4" />
                <p className="text-slate-500 text-sm">Memuat notifikasi...</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {notifications.length > 0 ? (
                  <div className="space-y-3">
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
                          className={`group relative flex items-start gap-4 p-4 md:p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${!notif.is_read
                              ? 'bg-blue-50/40 border-blue-100 hover:bg-blue-50/70 shadow-sm'
                              : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200 shadow-sm'
                            }`}
                        >
                          {/* Dot Unread Indicator */}
                          {!notif.is_read && (
                            <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                          )}

                          {/* Icon Background */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${style.bg} ${style.text}`}>
                            <Icon size={22} strokeWidth={2.5} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h3 className={`text-sm font-bold ${!notif.is_read ? 'text-[#425A5C]' : 'text-slate-700'}`}>
                                {notif.title}
                              </h3>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap mt-0.5">
                                  {formatRelativeTime(notif.created_at)}
                                </span>
    
                                <button
                                  onClick={(e) => deleteNotification(notif.id_notification, e)}
                                  className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-100 rounded-lg"
                                  title="Hapus notifikasi"
                                >
                                  <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
                                </button>
                              </div>
                            </div>
                            <p className={`text-sm leading-relaxed pr-6 ${!notif.is_read ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
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
                    className="flex flex-col items-center justify-center h-full min-h-[300px] text-center py-10"
                  >
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-5">
                      <Bell size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-black text-[#425A5C] mb-2">Tidak Ada Notifikasi</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                      {activeFilter === 'belum_dibaca'
                        ? 'Hebat! Anda telah membaca semua notifikasi terbaru. Tidak ada hal mendesak saat ini.'
                        : 'Belum ada aktivitas atau pemberitahuan baru untuk akun Anda saat ini.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* PAGINATION */}
          {!loading && notifications.length > 0 && totalPages > 1 && (
            <div className="p-4 md:px-6 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-[#425A5C] hover:bg-slate-50 border border-transparent hover:border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} /> Sebelumnya
              </button>

              <span className="text-sm font-bold text-slate-500">
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-[#425A5C] hover:bg-slate-50 border border-transparent hover:border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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