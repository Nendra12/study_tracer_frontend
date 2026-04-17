import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, User, Lock, AlertCircle, UserPen } from 'lucide-react';
import { STORAGE_BASE_URL } from '../../api/axios';
import { alumniApi } from '../../api/alumni';
import { useThemeSettings } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { alertConfirm } from '../../utilitis/alert';

import Icon from "../../assets/icon.png"

export default function NavbarAlumni({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useThemeSettings();
  const { logout } = useAuth();

  const canAccessAll = user?.can_access_all ?? false;

  function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${STORAGE_BASE_URL}/${path}`;
  }

  // Efek deteksi scroll untuk mengubah styling navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notification unread count
  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Realtime badge update from AuthContext Echo events
  useEffect(() => {
    const handleRealtimeNotification = () => {
      setUnreadCount((prev) => prev + 1);
    };

    window.addEventListener('reverb:notification.received', handleRealtimeNotification);
    return () => {
      window.removeEventListener('reverb:notification.received', handleRealtimeNotification);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await alumniApi.getNotificationUnreadCount();
      setUnreadCount(response.data.data.unread_count || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleLogoutClick = async () => {
    const result = await alertConfirm('Apakah Anda yakin ingin keluar dari aplikasi?');
    if (!result.isConfirmed) return;

    setIsDropdownOpen(false);
    setIsOpen(false);
    await logout();
    navigate('/');
  };

  const fotoUrl = user?.foto ? getImageUrl(user.foto) : null;

  const navLinks = [
    { name: 'Beranda', path: '/alumni', locked: false },
    { name: 'Pengumuman', path: '/alumni/pengumuman', locked: false },
    { name: 'Alumni', path: '/alumni/daftar-alumni', locked: !canAccessAll },
    { name: 'Lowongan', path: '/alumni/lowongan', locked: !canAccessAll },
  ];

  // --- LOGIKA WARNA DAN UKURAN DIPISAH ---

  // 1. Cek apakah user sedang berada di halaman khusus
  const isProfilePage = location.pathname.includes('/alumni/profile');
  const isKuesionerPage = location.pathname.includes('/alumni/kuesioner');
  const isPengumumanDetail = location.pathname.startsWith('/alumni/pengumuman/') && location.pathname !== '/alumni/pengumuman';
  const isLowonganDetail = location.pathname.startsWith('/alumni/lowongan/') && location.pathname !== '/alumni/lowongan';

  // 2. Logika Warna Teks & Ikon (Gunakan warna Primary/Gelap saat halaman di-scroll ATAU di halaman dengan background terang)
  const isSolidMode = scrolled || isProfilePage || isKuesionerPage || isPengumumanDetail || isLowonganDetail;

  // 3. Logika Background Navbar (Gunakan background putih hanya saat discroll atau di profil/kuesioner)
  // Untuk pengumuman detail, biarkan transparan (sesuai permintaan "hanya warna text nya saja")
  const hasSolidBg = scrolled;

  // 4. Mode Menciut (Ukuran mengecil): HANYA aktif saat benar-benar di-scroll
  const isShrunk = scrolled;

  const namaAlumni = user?.nama_alumni || 'Alumni';
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-70 transition-all duration-300 ease-in-out"
    >
      {/* Container utama Menciut HANYA berdasarkan state `isShrunk` (yaitu: scrolled) */}
      <div className={`max-w-7xl mx-auto pt-4 transition-all duration-500 ${isShrunk ? 'px-8 sm:px-12 lg:px-32' : 'px-4 sm:px-6 lg:px-8'}`}>

        {/* Background & Shadow menggunakan `hasSolidBg` (hanya beri background putih jika diperlukan) */}
        <div className={`relative rounded-3xl py-3 flex justify-between items-center transition-all duration-500 ${hasSolidBg ? 'shadow-md bg-white/90 backdrop-blur-xl px-6' : 'bg-transparent'}`}>

          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={theme?.logo || Icon}
              alt="Alumni Tracer Logo"
              className="w-12 h-10 object-contain drop-shadow-sm"
            />
            <div className='flex flex-col transition-all duration-500 ease-in-out'>
              <span className={`font-black text-lg ${isSolidMode ? 'text-primary' : 'text-white'}`}>
                Study Tracer
              </span>
              {!hasSolidBg && (
                <span className={`text-xs font-semibold ${isSolidMode ? 'text-primary/80' : 'text-white/80'}`}>
                  {theme?.namaSekolah || 'SMKN 2 Kraksaan'}
                </span>
              )}

            </div>
          </Link>

          {/* Desktop Menu */}
          <div className={`hidden xl:flex p-1 rounded-md ${isSolidMode ? 'bg-gray-100/80' : 'bg-fourth/80'}`}>
            {navLinks.map((item, i) => {
              const isActive = location.pathname === item.path || (item.path !== '/alumni' && location.pathname.startsWith(item.path));

              if (item.locked) {
                return (
                  <div
                    key={i}
                    className="group flex items-center gap-2 px-5 py-2 rounded-md text-sm font-semibold text-slate-400 cursor-not-allowed opacity-50"
                  >
                    <Lock size={14} />
                    {item.name}
                    <div className="hidden group-hover:block absolute top-full mt-2 w-64 bg-slate-800 text-white text-xs p-3 rounded-lg shadow-lg z-10">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <p>Membutuhkan verifikasi akun atau Isi kuesioner terlebih dahulu</p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={i}
                  to={item.path}
                  className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${isActive
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-third hover:text-primary'
                    }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Desktop Actions */}
            <div className="hidden xl:flex items-center gap-2">
              <button
                onClick={() => navigate('/alumni/notifikasi')}
                className={`cursor-pointer relative group p-2.5 rounded-md backdrop-blur-sm border transition-all ${isSolidMode ? 'bg-white border-gray-200 text-primary hover:bg-gray-50' : 'bg-white/80 border-white/60 text-primary/80 hover:text-primary hover:bg-fourth'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {unreadCount > 0 ? `${unreadCount} Notifikasi Baru` : 'Tidak Ada Notifikasi'}
                  </div>
                </div>
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`cursor-pointer flex items-center gap-2 p-1 pr-3 rounded-md border backdrop-blur-sm transition-all ${isSolidMode ? 'bg-white border-gray-200 hover:bg-gray-50' : 'bg-white/80 border-white/60 hover:bg-fourth'}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary overflow-hidden">
                    {fotoUrl ? (
                      <img src={fotoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-white text-xs p-2 uppercase font-black flex items-center justify-center h-full">
                        {user?.nama_alumni?.charAt(0) || 'A'}
                      </div>
                    )}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-primary/80 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                        <p className="text-[10px] font-black text-third uppercase tracking-widest">
                          Masuk sebagai
                        </p>
                        <p className="text-sm font-bold text-primary truncate mt-1">
                          {user?.nama_alumni || 'Alumni'}
                        </p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/alumni/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="group flex items-center gap-3 px-4 py-3 text-sm font-semibold text-primary/80 hover:text-primary hover:bg-gray-50 rounded-xl transition-all"
                        >
                          <User size={18} className="text-third group-hover:text-primary" />
                          Profil Anda
                        </Link>
                        <button
                          onClick={handleLogoutClick}
                          className="cursor-pointer w-full group flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <LogOut size={18} />
                          Keluar Aplikasi
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`xl:hidden cursor-pointer w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-full ${isSolidMode ? 'bg-gray-100' : 'bg-fourth'}`}
            >
              <motion.span animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} className="w-5 h-0.5 bg-primary block" />
              <motion.span animate={isOpen ? { opacity: 0 } : { opacity: 1 }} className="w-5 h-0.5 bg-primary block" />
              <motion.span animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} className="w-5 h-0.5 bg-primary block" />
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-4 p-4 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-3xl shadow-2xl xl:hidden flex flex-col gap-2"
              >
                {user && (
                  <div className="py-4 flex items-center justify-between gap-2">
                    <div className="flex items-center">
                      <img src={fotoUrl} alt="foto anda" className="w-13 h-13 rounded-md" />
                      <div className="px-5 bg-fourth/50 border-b border-white/50">
                        <p className="text-[10px] font-black text-third uppercase tracking-widest">
                          Masuk sebagai
                        </p>
                        <p className="text-sm font-bold text-primary truncate mt-1">
                          {namaAlumni || "Alumni"}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => { navigate('/alumni/profile'); setIsOpen(false); }} className="w-10 h-10 flex items-center justify-center cursor-pointer hover:text-primary rounded-md">
                      <UserPen size={24} />
                    </button>
                  </div>
                )}
                {navLinks.map((item, i) => {
                  const isActive = location.pathname === item.path || (item.path !== '/alumni' && location.pathname.startsWith(item.path));

                  if (item.locked) {
                    return (
                      <div key={i} className="flex items-center justify-between px-6 py-4 rounded-md bg-gray-50 text-slate-400 opacity-60">
                        <span className="font-bold">{item.name}</span>
                        <Lock size={16} />
                      </div>
                    );
                  }

                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.1 } }}>
                      <Link
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`block px-6 py-4 rounded-md font-bold transition-all ${isActive ? 'bg-primary text-white' : 'text-primary/80 hover:bg-gray-50 hover:text-primary'}`}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}

                <hr className="border-gray-100 my-2" />

                <div className="flex flex-col gap-2">
                  <button onClick={() => { navigate('/alumni/notifikasi'); setIsOpen(false); }} className="relative cursor-pointer flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-primary/80 bg-gray-50 hover:bg-gray-100 transition-all">
                    <Bell size={18} /> Notifikasi
                    {unreadCount > 0 && <span className="ml-auto flex items-center justify-center min-w-5.5 h-5.5 px-1.5 bg-red-500 text-white text-[11px] font-black rounded-full">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                  </button>
                  <button onClick={handleLogoutClick} className="relative cursor-pointer flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all">
                    <LogOut size={18} /> Keluar Aplikasi
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}