import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import LoginButton from "./alumni/LoginButton";
import Login from "../pages/Login";
import { useAuth } from "../context/AuthContext";
import { ChevronDown, Home, LogOut, User, UserPen } from "lucide-react";
import { STORAGE_BASE_URL } from "../api/axios";
import { useThemeSettings } from "../context/ThemeContext";
import { alertConfirm } from "../utilitis/alert";

import Icon from "../assets/icon.png"

export default function NavbarLanding({ setActiveSection, activeSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // const [activeSection, setActiveSection] = useState("beranda");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { theme } = useThemeSettings();
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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Efek deteksi section aktif berdasarkan scroll position
  useEffect(() => {
    const handleScrollSpy = () => {
      const sections = ["beranda", "petunjuk", "fitur", "alumni", "karir"];
      const scrollPosition = window.scrollY + 120; // Offset untuk navbar

      let currentSection = "beranda";

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;

          if (scrollPosition >= offsetTop - 100) {
            currentSection = section;
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScrollSpy);
    handleScrollSpy(); // Initial check
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, []);

  // Fungsi untuk scroll smooth dengan offset navbar
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();

    // Set active section immediately untuk instant feedback
    setActiveSection(targetId.replace("#", ""));

    const element = document.getElementById(targetId.replace("#", ""));
    if (element) {
      const navbarHeight = 100; // Tinggi navbar + offset tambahan
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };
  const { user, logout } = useAuth();

  const profile = user?.profile ?? null;
  const namaAlumni = profile?.nama || 'Alumni';
  const canAccessAll = user?.can_access_all ?? false;
  const fotoUrl = profile?.foto ? getImageUrl(profile.foto) : null;

  const navLinks = [
    { name: "Beranda", href: "#beranda" },
    { name: "Petunjuk", href: "#petunjuk" },
    { name: "Fitur", href: "#fitur" },
    { name: "Alumni", href: "#alumni" },
    { name: "Karir", href: "#karir" },
  ];

  const handleLogoutClick = async () => {
    const result = await alertConfirm('Apakah Anda yakin ingin keluar dari aplikasi?');
    if (!result.isConfirmed) return;

    setIsDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out"
    >
      <div
        className={`max-w-7xl mx-auto pt-4 transition-all duration-500 ${scrolled ? "px-8 sm:px-12 lg:px-25" : "px-4 sm:px-6 lg:px-8"
          }`}
      >
        <div
          className={`rounded-3xl py-3 flex justify-between items-center transition-all duration-500 ${scrolled
            ? "shadow-md bg-white/70 backdrop-blur-xl px-4"
            : "bg-transparant"
            }`}
        >
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={theme?.logo || Icon}
              alt="Alumni Tracer Logo"
              className="w-12 h-10 object-contain drop-shadow-sm"
            />
            <div className="flex flex-col transition-all duration-500 ease-in-out">
              <span className="font-black text-primary text-lg">
                Alumni Tracer
              </span>
              {!scrolled && (
                <span className="text-xs font-semibold text-primary/80">
                  {theme?.namaSekolah || 'SMKN 2 Kraksaan'}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden xl:flex bg-fourth/80 p-1 rounded-md border border-white/60">
            {navLinks.map((item, i) => {
              const isActive = activeSection === item.href.replace("#", "");
              return (
                <motion.a
                  key={i}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${isActive
                    ? "bg-white text-primary shadow-sm"
                    : "text-third hover:text-primary"
                    }`}
                >
                  {item.name}
                </motion.a>
              );
            })}
          </div>

          {/* Action Button & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden xl:flex items-center gap-2">
                  {/* Notification Button */}


                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="cursor-pointer flex items-center gap-2 p-1 pr-3 rounded-md border border-white/60 bg-white/80 backdrop-blur-sm hover:bg-fourth transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary overflow-hidden">
                        {fotoUrl ? (
                          <img
                            src={fotoUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-white text-xs p-2 uppercase font-black flex items-center justify-center h-full">
                            {user?.nama_alumni?.charAt(0) || "A"}
                          </div>
                        )}
                      </div>
                      <ChevronDown
                        size={14}
                        className={`text-primary/80 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden z-50"
                        >
                          {/* User Info Header */}
                          <div className="px-5 py-4 bg-fourth/50 border-b border-white/50">
                            <p className="text-[10px] font-black text-third uppercase tracking-widest">
                              Masuk sebagai
                            </p>
                            <p className="text-sm font-bold text-primary truncate mt-1">
                              {namaAlumni || "Alumni"}
                            </p>
                          </div>

                          {/* Menu Items */}
                          <div className="p-2">
                            <Link
                              to="/alumni/profile"
                              onClick={() => setIsDropdownOpen(false)}
                              className="group flex items-center gap-3 px-4 py-3 text-sm font-semibold text-primary/80 hover:text-primary hover:bg-fourth rounded-md transition-all"
                            >
                              <User
                                size={18}
                                className="text-third group-hover:text-primary"
                              />
                              Profil Anda
                            </Link>
                            <button
                              onClick={handleLogoutClick}
                              className="w-full group flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-md transition-all"
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

              </>
            ) : (
              <>
                <div className="hidden xl:block">
                  <LoginButton />
                </div>
              </>
            )}

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-fourth rounded-full"
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
                className="absolute top-full left-0 right-0 mt-4 p-4 bg-white/90 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl xl:hidden flex flex-col gap-2"
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
                    <Link to={'/alumni/profile'} className="w-10 h-10 flex items-center justify-center bg-fourth rounded-md">
                      <UserPen size={24} />
                    </Link>
                  </div>
                )}
                {navLinks.map((item, i) => {
                  const isActive = activeSection === item.href.replace("#", "");
                  return (
                    <motion.a
                      key={i}
                      href={item.href}
                      onClick={(e) => {
                        handleSmoothScroll(e, item.href);
                        setIsOpen(false);
                      }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: { delay: i * 0.1 },
                      }}
                      className={`px-6 py-4 rounded-lg font-bold transition-all ${isActive
                        ? "bg-primary text-white"
                        : "text-primary/80 hover:bg-fourth hover:text-primary"
                        }`}
                    >
                      {item.name}
                    </motion.a>
                  );
                })}
                {user ? (
                  <></>
                ) : (
                  <>
                    <hr className="border-fourth my-2" />
                    <div className="w-full">
                      <LoginButton />
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}
