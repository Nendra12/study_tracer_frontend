import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, User, Lock } from 'lucide-react';
import { STORAGE_BASE_URL } from '../../api/axios';
import { alumniApi } from '../../api/alumni';

export default function NavbarAlumni({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const fetchUnreadCount = async () => {
    try {
      const response = await alumniApi.getNotificationUnreadCount();
      setUnreadCount(response.data.data.unread_count || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fotoUrl = user?.foto ? getImageUrl(user.foto) : null;

  const navLinks = [
    { name: 'Beranda', path: '/alumni', locked: false },
    { name: 'Alumni', path: '/alumni/daftar-alumni', locked: !canAccessAll },
    { name: 'Lowongan', path: '/alumni/lowongan', locked: !canAccessAll },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-70 transition-all duration-300 ease-in-out"
    >
      <div className={`max-w-7xl mx-auto pt-4 transition-all duration-500 ${
        scrolled ? 'px-8 sm:px-12 lg:px-25' : 'px-4 sm:px-6 lg:px-8'
      }`}>
        <div className={`rounded-3xl py-3 flex justify-between items-center transition-all duration-500 ${
          scrolled ? 'shadow-md bg-white/70 backdrop-blur-xl px-6' : 'bg-white/90 backdrop-blur-xl px-6'
        }`}>

        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/icon.png"
            alt="Alumni Tracer Logo"
            className="w-12 h-10 object-contain drop-shadow-sm"
          />
          <div className='flex flex-col transition-all duration-500 ease-in-out'>
            <span className="font-black text-primary text-lg">Alumni Tracer</span>
            { !scrolled && <span className='text-xs font-semibold text-[#526061]'>SMK Negeri 1 Gondang</span> }
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden xl:flex bg-[#f3f4f4]/80 p-1 rounded-2xl border border-white/60">
          {navLinks.map((item, i) => {
            const isActive = location.pathname === item.path;

            if (item.locked) {
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-slate-400 cursor-not-allowed opacity-50"
                >
                  <Lock size={14} />
                  {item.name}
                </div>
              );
            }

            return (
              <Link
                key={i}
                to={item.path}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
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
          {/* Desktop Actions - Profile & Notification */}
          <div className="hidden xl:flex items-center gap-2">
            {/* Notification Button */}
            <button
              onClick={() => navigate('/alumni/notifikasi')}
              className="cursor-pointer relative group p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 text-[#526061] hover:text-primary hover:bg-fourth  transition-all"
            >
              <Bell size={20} />
              {/* Notification Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}

              {/* Tooltip (Muncul saat Hover) */}
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
                className="cursor-pointer flex items-center gap-2 p-1 pr-3 rounded-xl border border-white/60 bg-white/80 backdrop-blur-sm hover:bg-fourth transition-all"
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
                  className={`text-[#526061] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden z-50"
                  >
                    {/* User Info Header */}
                    <div className="px-5 py-4 bg-[#f3f4f4]/50 border-b border-white/50">
                      <p className="text-[10px] font-black text-[#9ca3af] uppercase tracking-widest">
                        Masuk sebagai
                      </p>
                      <p className="text-sm font-bold text-primary truncate mt-1">
                        {user?.nama_alumni || 'Alumni'}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        to="/alumni/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="group flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#526061] hover:text-primary hover:bg-[#f3f4f4] rounded-xl transition-all"
                      >
                        <User size={18} className="text-[#9ca3af] group-hover:text-primary" />
                        Profil Anda
                      </Link>
                      <button
                        onClick={() => navigate('/logout')}
                        className="w-full group flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all"
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
            className="xl:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-[#f3f4f4] rounded-full"
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-primary block"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-5 h-0.5 bg-primary block"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-primary block"
            />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-4 p-4 bg-white/90 backdrop-blur-2xl border border-white/50 rounded-[2rem] shadow-2xl xl:hidden flex flex-col gap-2"
            >
              {/* Navigation Links */}
              {navLinks.map((item, i) => {
                const isActive = location.pathname === item.path;

                if (item.locked) {
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between px-6 py-4 rounded-2xl bg-[#f3f4f4]/50 text-slate-400 opacity-60"
                    >
                      <span className="font-bold">{item.name}</span>
                      <Lock size={16} />
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: i * 0.1 } }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-6 py-4 rounded-2xl font-bold transition-all ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-[#526061] hover:bg-[#f3f4f4] hover:text-primary'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}

              <hr className="border-[#f3f4f4] my-2" />

              {/* Mobile Profile Actions */}
              <div className="flex flex-col gap-2">
                {/* Notification Button Mobile */}
                <button
                  onClick={() => {
                    navigate('/alumni/notifikasi');
                    setIsOpen(false);
                  }}
                  className="relative flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-[#526061] bg-[#f3f4f4] hover:bg-white transition-all"
                >
                  <Bell size={18} />
                  Notifikasi
                  {unreadCount > 0 && (
                    <span className="ml-auto flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-red-500 text-white text-[11px] font-black rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile Button Mobile */}
                <button
                  onClick={() => {
                    navigate('/alumni/profile');
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-[#526061] bg-[#f3f4f4] hover:bg-white transition-all"
                >
                  <User size={18} />
                  Profil Anda
                </button>

                {/* Logout Button Mobile */}
                <button
                  onClick={() => navigate('/logout')}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all"
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
    </motion.nav>
  );
}
