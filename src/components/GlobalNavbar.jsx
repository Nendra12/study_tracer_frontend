import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, User, Lock, AlertCircle, UserPen, MessageSquareMore } from 'lucide-react';
import { STORAGE_BASE_URL } from '../api/axios';
import { alumniApi } from '../api/alumni';
import { useThemeSettings } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { alertConfirm } from '../utilitis/alert';
import { useConnections } from '../hooks/useConnections';
import Icon from "../assets/icon.png"

export default function GlobalNavbar({ variant = 'landing', activeSection, setActiveSection }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useThemeSettings();
  const { pendingCount, refreshPendingCount } = useConnections();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const dropdownRef = useRef(null);

  const canAccessAll = user?.can_access_all ?? false;
  const profile = user?.profile ?? null;
  const namaAlumni = user?.nama_alumni || profile?.nama || 'Alumni';
  const avatarInitial = namaAlumni?.charAt(0)?.toUpperCase() || 'A';

  function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${STORAGE_BASE_URL}/${path}`;
  }
  const fotoUrl = user?.foto || profile?.foto ? getImageUrl(user?.foto || profile?.foto) : null;

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Landing page scroll spy
  useEffect(() => {
    if (variant !== 'landing' || !setActiveSection) return;
    const handleScrollSpy = () => {
      const sections = ["beranda", "petunjuk", "fitur", "alumni", "karir"];
      const scrollPosition = window.scrollY + 120;
      let currentSection = "beranda";
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section);
        if (element && scrollPosition >= element.offsetTop - 100) {
          currentSection = section;
          break;
        }
      }
      setActiveSection(currentSection);
    };
    window.addEventListener("scroll", handleScrollSpy);
    handleScrollSpy();
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [variant, setActiveSection]);

  // Handle Resize and Location Change
  useEffect(() => {
    const handleResize = () => { setIsOpen(false); setIsDropdownOpen(false); };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Handle outside click dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notifications & Messages fetching for Alumni
  const fetchUnreadCount = async () => {
    try {
      const response = await alumniApi.getNotificationUnreadCount();
      setUnreadCount(response.data.data.unread_count || 0);
    } catch (err) { console.error('Error fetching unread count:', err); }
  };
  const fetchUnreadMessageCount = async () => {
    try {
      const response = await alumniApi.getMessageUnreadCount();
      setUnreadMessageCount(response.data.data.unread_count || 0);
    } catch (err) { console.error('Error fetching unread message count:', err); }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchUnreadMessageCount();
      refreshPendingCount();
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchUnreadMessageCount();
        refreshPendingCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, refreshPendingCount]);

  // Realtime events
  useEffect(() => {
    if (!user) return;
    const handleRealtimeNotification = () => {
      setUnreadCount((prev) => prev + 1);
      refreshPendingCount();
    };
    const handleRealtimeMessage = (e) => {
      const msg = e.detail?.message;
      if (msg && msg.sender_id !== (user?.id_users || user?.id)) fetchUnreadMessageCount();
    };
    const handleMessageRead = () => fetchUnreadMessageCount();

    window.addEventListener('reverb:notification.received', handleRealtimeNotification);
    window.addEventListener('reverb:message.sent', handleRealtimeMessage);
    window.addEventListener('local:message.read_cleared', handleMessageRead);
    return () => {
      window.removeEventListener('reverb:notification.received', handleRealtimeNotification);
      window.removeEventListener('reverb:message.sent', handleRealtimeMessage);
      window.removeEventListener('local:message.read_cleared', handleMessageRead);
    };
  }, [user, refreshPendingCount]);

  const handleLogoutClick = async () => {
    const result = await alertConfirm('Apakah Anda yakin ingin keluar dari aplikasi?');
    if (!result.isConfirmed) return;
    setIsDropdownOpen(false);
    setIsOpen(false);
    await logout();
    navigate('/');
  };

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    if (setActiveSection) setActiveSection(targetId.replace("#", ""));
    const element = document.getElementById(targetId.replace("#", ""));
    if (element) {
      const navbarHeight = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const landingNavLinks = [
    { name: "Beranda", href: "#beranda" },
    { name: "Petunjuk", href: "#petunjuk" },
    { name: "Fitur", href: "#fitur" },
    { name: "Alumni", href: "#alumni" },
    { name: "Karir", href: "#karir" },
  ];

  const alumniNavLinks = [
    { name: 'Beranda', path: '/alumni', locked: false },
    { name: 'Postingan', path: '/alumni/postingan', locked: !canAccessAll },
    { name: 'Pengumuman', path: '/alumni/pengumuman', locked: false },
    { name: 'Alumni', path: '/alumni/daftar-alumni', locked: !canAccessAll },
    { name: 'Connections', path: '/alumni/connections', locked: !canAccessAll, badge: pendingCount },
    { name: 'Lowongan', path: '/alumni/lowongan', locked: !canAccessAll },
  ];

  const chatIsLocked = !canAccessAll;

  // Visual modes logic
  const isProfilePage = location.pathname.includes('/alumni/profile');
  const isKuesionerPage = location.pathname.includes('/alumni/kuesioner');
  const isPengumumanDetail = location.pathname.startsWith('/alumni/pengumuman/') && location.pathname !== '/alumni/pengumuman';
  const isLowonganDetail = location.pathname.startsWith('/alumni/lowongan/') && location.pathname !== '/alumni/lowongan';
  const isPesan = location.pathname.includes('/alumni/pesan');

  const isSolidMode = scrolled || isProfilePage || isKuesionerPage || isPengumumanDetail || isLowonganDetail || isPesan;
  const hasSolidBg = true;
  
  // Standard Fleet inspired styling (Always solid white)
  const bgNavbar = 'bg-white shadow-sm border-b border-gray-100';
  const textLogo = 'text-slate-900';
  const textSubLogo = 'text-slate-500';
  const textLinkDefault = 'text-slate-500 hover:text-slate-900';
  const textLinkActive = 'text-slate-900';
  const iconAction = 'text-slate-500 hover:text-slate-900 hover:bg-slate-100';
  
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-300 ease-in-out ${bgNavbar}`}
    >
      <div className="max-w-[95%] xl:max-w-7xl mx-auto transition-all duration-500">
        <div className="relative py-4 flex justify-between items-center transition-all duration-500">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img src={theme?.logo || Icon} alt="Study Tracer Logo" className="w-8 h-8 object-contain shrink-0" />
            <div className="flex flex-col transition-all duration-500 ease-in-out justify-center">
              <span className={`font-semibold text-xl leading-none tracking-tight whitespace-nowrap ${textLogo}`}>
                {variant === 'landing' ? 'StudyTracer' : 'AlumniTracer'}
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden xl:flex items-center gap-8">
            {variant === 'landing' ? (
              landingNavLinks.map((item, i) => {
                const isActive = activeSection === item.href.replace("#", "");
                return (
                  <a
                    key={i}
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                    className={`relative text-sm font-medium transition-colors no-underline whitespace-nowrap ${isActive ? textLinkActive : textLinkDefault}`}
                  >
                    {item.name}
                  </a>
                );
              })
            ) : (
              alumniNavLinks.map((item, i) => {
                const isActive = location.pathname === item.path || (item.path !== '/alumni' && location.pathname.startsWith(item.path));
                if (item.locked) {
                  return (
                    <div key={i} className="group relative flex items-center gap-1.5 text-sm font-medium text-slate-400 cursor-not-allowed whitespace-nowrap">
                       {item.name} <Lock size={12} className="opacity-60" />
                      <div className="hidden group-hover:block absolute top-full mt-2 w-64 bg-slate-800 text-white text-xs p-3 rounded-lg shadow-lg z-10 whitespace-normal">
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
                    className={`relative text-sm font-medium transition-colors no-underline whitespace-nowrap ${isActive ? textLinkActive : textLinkDefault}`}
                  >
                    {item.name}
                    {item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-3 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-slate-900 text-white text-[9px] font-bold">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <div className="hidden xl:flex items-center gap-2">
                {/* Chat Action */}
                {variant === 'landing' ? (
                  <></>
                ) : (
                  <>
                    {chatIsLocked ? (
                      <div className={`relative group p-2 rounded-lg transition-all cursor-not-allowed opacity-50 ${iconAction}`}>
                        <MessageSquareMore size={20} strokeWidth={1.5} />
                        <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                          <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg w-48 text-left whitespace-normal">
                            Membutuhkan verifikasi akun atau Isi kuesioner terlebih dahulu
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => navigate('/alumni/pesan')} className={`cursor-pointer relative group p-2 rounded-lg transition-colors ${iconAction}`}>
                        <MessageSquareMore size={20} strokeWidth={1.5} />
                        {unreadMessageCount > 0 && (
                          <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white">
                            {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                          </span>
                        )}
                      </button>
                    )}

                    {/* Notifications Action */}
                    <button onClick={() => navigate('/alumni/notifikasi')} className={`cursor-pointer relative group p-2 rounded-lg transition-colors ${iconAction}`}>
                      <Bell size={20} strokeWidth={1.5} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </> 
                )}

                {/* Profile Dropdown */}
                <div className="relative ml-2" ref={dropdownRef}>
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="cursor-pointer flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all">
                    <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden shrink-0">
                      {fotoUrl ? (
                        <img src={fotoUrl} alt="Profile" className="w-full h-full object-cover shrink-0" />
                      ) : (
                        <div className="text-slate-600 text-[11px] uppercase font-bold flex items-center justify-center h-full">
                          {avatarInitial}
                        </div>
                      )}
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50">
                        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Akun</p>
                          <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{namaAlumni}</p>
                        </div>
                        <div className="p-1.5">
                          <Link to="/alumni/profile" onClick={() => setIsDropdownOpen(false)} className="group flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                            <User size={16} className="text-slate-400 group-hover:text-slate-700" /> Profil Anda
                          </Link>
                          {variant === 'landing' && (
                            <Link to="/alumni" onClick={() => setIsDropdownOpen(false)} className="group flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                                <LogOut size={16} className="text-slate-400 group-hover:text-slate-700" /> Dashboard Alumni
                            </Link>
                          )}
                          <div className="h-px bg-gray-100 my-1 mx-2" />
                          <button onClick={handleLogoutClick} className="cursor-pointer w-full group flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <LogOut size={16} /> Keluar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="hidden xl:flex items-center gap-3">
                <Link to="/login" className="px-5 py-2 rounded-md text-[11px] font-bold tracking-widest uppercase transition-colors bg-primary/10 text-primary hover:bg-primary/20">
                  Log In
                </Link>
                <Link to="/register" className="px-5 py-2 rounded-md text-[11px] font-bold tracking-widest uppercase transition-colors bg-primary text-white hover:bg-primary/80">
                  Daftar
                </Link>
              </div>
            )}

            {/* Hamburger Menu */}
            <button onClick={() => setIsOpen(!isOpen)} className={`xl:hidden relative z-60 cursor-pointer w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-full shrink-0 ${iconAction}`}>
              <motion.span animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} className="w-5 h-0.5 bg-current block" />
              <motion.span animate={isOpen ? { opacity: 0 } : { opacity: 1 }} className="w-5 h-0.5 bg-current block" />
              <motion.span animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} className="w-5 h-0.5 bg-current block" />
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <>
                <motion.button type="button" onClick={() => setIsOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 xl:hidden bg-black/40 backdrop-blur-sm cursor-default" />
                <motion.div initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }} className="absolute z-50 top-full left-0 right-0 mt-2 p-2 bg-white rounded-2xl shadow-2xl xl:hidden flex flex-col gap-1 border border-gray-100">
                  {user && (
                    <div className="mb-2 p-3 rounded-xl bg-slate-50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {fotoUrl ? (
                            <img src={fotoUrl} alt="foto anda" className="w-full h-full object-cover shrink-0" />
                          ) : (
                            <div className="text-slate-600 text-xs font-bold">{avatarInitial}</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Akun</p>
                          <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{namaAlumni}</p>
                        </div>
                      </div>
                      <button onClick={() => { navigate('/alumni/profile'); setIsOpen(false); }} className="w-9 h-9 shrink-0 flex items-center justify-center cursor-pointer rounded-full bg-white text-slate-500 shadow-sm hover:text-slate-900 transition-colors">
                        <UserPen size={16} />
                      </button>
                    </div>
                  )}

                  <div className="px-2 py-1 space-y-1">
                    {variant === 'landing' ? (
                      landingNavLinks.map((item, i) => {
                        const isActive = activeSection === item.href.replace("#", "");
                        return (
                          <motion.a key={i} href={item.href} onClick={(e) => { handleSmoothScroll(e, item.href); setIsOpen(false); }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }} className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                            {item.name}
                          </motion.a>
                        );
                      })
                    ) : (
                      alumniNavLinks.map((item, i) => {
                        const isActive = location.pathname === item.path || (item.path !== '/alumni' && location.pathname.startsWith(item.path));
                        if (item.locked) {
                          return (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-lg text-slate-400 opacity-60 text-sm font-medium">
                              {item.name}<Lock size={14} />
                            </div>
                          );
                        }
                        return (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}>
                            <Link to={item.path} onClick={() => setIsOpen(false)} className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                              {item.name}
                              {item.badge > 0 && (
                                <span className="min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-bold">
                                  {item.badge > 99 ? '99+' : item.badge}
                                </span>
                              )}
                            </Link>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  {user ? (
                    <>
                      <div className="h-px bg-gray-100 my-1 mx-4" />
                      <div className="px-2 py-1 space-y-1">
                        {chatIsLocked ? (
                          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 opacity-60 cursor-not-allowed">
                            Chat <Lock size={14} />
                          </motion.div>
                        ) : (
                          <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={() => { navigate('/alumni/pesan'); setIsOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                            Chat {unreadMessageCount > 0 && <span className="min-w-5 h-5 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">{unreadMessageCount > 99 ? '99+' : unreadMessageCount}</span>}
                          </motion.button>
                        )}
                        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={() => { navigate('/alumni/notifikasi'); setIsOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                          Notifikasi {unreadCount > 0 && <span className="min-w-5 h-5 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                        </motion.button>
                        {variant === 'landing' && (
                          <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={() => { navigate('/alumni'); setIsOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                            Dashboard Alumni
                          </motion.button>
                        )}
                        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                          Keluar
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-px bg-gray-100 my-2 mx-4" />
                      <div className="px-4 pb-2 flex gap-2">
                        <Link to="/login" className="flex-1 py-2.5 text-center rounded-lg text-xs font-bold tracking-widest uppercase transition-colors bg-primary/10 text-primary hover:bg-primary/20">
                          Log In
                        </Link>
                        <Link to="/register" className="flex-1 py-2.5 text-center rounded-lg text-xs font-bold tracking-widest uppercase transition-colors bg-primary text-white hover:bg-primary/80">
                          Daftar
                        </Link>
                      </div>
                    </>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}
