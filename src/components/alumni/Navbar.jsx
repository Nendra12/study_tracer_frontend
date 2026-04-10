  import React, { useState, useEffect, useRef } from "react";
  import {
    User,
    LogOut,
    Lock,
    ChevronDown,
    Menu,
    X,
  Sparkles,
  Bell,
  Megaphone
  } from "lucide-react";
  import { Link, useLocation, useNavigate } from "react-router-dom";
  import { motion, AnimatePresence } from "framer-motion";
  import { STORAGE_BASE_URL } from "../../api/axios";
  import { alumniApi } from "../../api/alumni";
  import { useThemeSettings } from "../../context/ThemeContext";
  import { useAuth } from "../../context/AuthContext";
  import { alertConfirm } from "../../utilitis/alert";

  function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${STORAGE_BASE_URL}/${path}`;
  }

  export default function Navbar({ user }) {
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const dropdownRef = useRef(null);
    const canAccessAll = user?.can_access_all ?? true;

    const navItems = [
      { label: "Beranda", path: "/alumni", locked: false },
      { label: "Pengumuman", path: "/alumni/pengumuman", locked: false },
      { label: "Alumni", path: "/alumni/daftar-alumni", locked: !canAccessAll },
      { label: "Lowongan", path: "/alumni/lowongan", locked: !canAccessAll },
    ];

    const navigate = useNavigate();
    const { theme } = useThemeSettings();
    const { logout } = useAuth();

    useEffect(() => {
      const handleScroll = () => setIsScrolled(window.scrollY > 20);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
      function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsDropdownOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
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

    const handleLogoutClick = async () => {
      const result = await alertConfirm('Apakah Anda yakin ingin keluar dari aplikasi?');
      if (!result.isConfirmed) return;

      await logout();
      navigate('/');
    };

    const fotoThumbUrl = user?.foto_thumbnail ? getImageUrl(user.foto_thumbnail) : null;
    const fotoOriginalUrl = user?.foto ? getImageUrl(user.foto) : null;
    const fotoUrl = fotoThumbUrl || fotoOriginalUrl;

    return (
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
          isScrolled
            ? "py-3 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
            : "py-4 bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <Link to="/alumni" className="flex items-center gap-2.5 group">
            <img
              src={theme?.logo || "/icon.png"}
              alt="Alumni Tracer Logo"
              className="w-10 h-10 object-contain drop-shadow-sm"
            />
            <span className="font-black text-primary text-lg">Alumni Tracer</span>
          </Link>

          {/* DESKTOP MENU - PILL DESIGN */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              if (item.locked) {
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 px-4 py-2 text-[14px] font-bold text-slate-400 cursor-not-allowed opacity-50"
                  >
                    <Lock size={12} /> {item.label}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="group relative px-4 py-2 text-[14px] font-bold transition-colors duration-300"
                >
                  <span
                    className={`relative z-10 transition-colors duration-300 ${
                      isActive
                        ? "text-primary"
                        : "text-slate-500 group-hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* EFEK GARIS BAWAH (UNDERLINE) */}
                  {isActive ? (
                    <motion.div
                      layoutId="underline"
                      className="absolute bottom-1 left-0 right-0 h-0.5 bg-primary mx-4"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  ) : (
                    // Garis bawah saat HOVER (Muncul dari tengah)
                    <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out mx-4 origin-center" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/alumni/notifikasi")} className="relative group cursor-pointer">
              <div className="p-2 rounded-xl bg-slate-10 border border-slate-100  text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                <Bell size={20} />
              </div>
              {unreadCount > 0 && (
                <>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              )}

              {/* Tooltip Opsional (Muncul saat Hover) */}
              <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  {unreadCount > 0 ? `${unreadCount} Notifikasi Baru` : 'Tidak Ada Notifikasi'}
                </div>
              </div>
            </button>
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-xl border border-slate-100  cursor-pointer transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white overflow-hidden shadow-inner">
                  {fotoUrl ? (
                    <img src={fotoUrl} className="w-full h-full object-cover" onError={(e) => { if (fotoOriginalUrl && e.target.src !== fotoOriginalUrl) e.target.src = fotoOriginalUrl; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-white text-xs font-black">
                      {user?.nama_alumni?.charAt(0) || "A"}
                    </div>
                  )}
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-500 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </motion.button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Masuk sebagai :
                      </p>
                      <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
                        {user?.nama_alumni || "Anonymous"}
                      </p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/alumni/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="group flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                      >
                        <User
                          size={18}
                          className="text-slate-400 group-hover:text-primary"
                        />{" "}
                        Profil Anda
                      </Link>
                      <button onClick={handleLogoutClick} className="cursor-pointer w-full group flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <LogOut size={18} /> Keluar Aplikasi
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MOBILE TOGGLE */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 bg-white cursor-pointer transition-all "
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>

        {/* MOBILE MENU ENHANCED */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden bg-transparent overflow-hidden`}
            >
              <div className="px-8 py-8 flex flex-col gap-6">
                {navItems.map((item, idx) => (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={item.label}
                  >
                    {item.locked ? (
                      <div className="flex items-center gap-3 text-secondary font-bold text-md cursor-not-allowed">
                        <Lock size={15} /> {item.label}
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-xl font-black text-slate-800 hover:text-primary transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    );
  }
