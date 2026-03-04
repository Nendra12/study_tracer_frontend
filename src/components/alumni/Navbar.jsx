import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, Search, User, LogOut, Lock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { STORAGE_BASE_URL } from '../../api/axios';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

export default function Navbar({ user }) {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const canAccessAll = user?.can_access_all ?? true;

  const navItems = [
    { label: 'Beranda', path: '/', locked: false },
    { label: 'Alumni', path: '/alumni', locked: !canAccessAll },
    { label: 'Lowongan Kerja', path: '/lowongan', locked: !canAccessAll }
  ];

  // Fungsi untuk menutup dropdown saat klik di luar area
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fotoUrl = user?.foto ? getImageUrl(user.foto) : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-[#3C5759] text-white p-1.5 rounded-lg"><GraduationCap size={20} /></div>
          <span className="font-black text-slate-800 tracking-tight text-lg">Alumni Tracer</span>
        </div>
        
        {/* Menu Navigasi Tengah */}
        <div className="hidden md:flex bg-slate-100 rounded-full p-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.locked) {
              return (
                <span
                  key={item.label}
                  className="px-5 py-1.5 rounded-full text-xs font-bold text-slate-300 cursor-not-allowed flex items-center gap-1"
                  title="Verifikasi & isi kuesioner untuk mengakses"
                >
                  <Lock size={10} /> {item.label}
                </span>
              );
            }

            return (
              <Link 
                key={item.label} 
                to={item.path}
                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-white text-[#3C5759] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Ikon Pencarian & Profil */}
        <div className="flex items-center gap-4">
          <Search size={18} className="text-slate-400 hover:text-[#3C5759] transition-colors cursor-pointer" />
          
          {/* Wrapper Dropdown Profil */}
          <div className="relative" ref={dropdownRef}>
            {/* Tombol Profil */}
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-8 h-8 rounded-full bg-[#3C5759] border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold hover:scale-105 transition-transform cursor-pointer focus:outline-none overflow-hidden"
            >
              {fotoUrl ? (
                <img src={fotoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.nama_alumni?.charAt(0) || 'A'
              )}
            </button>

            {/* Menu Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                  <p className="text-xs text-slate-400 font-medium">Masuk sebagai</p>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {user?.nama_alumni || 'Alumni'}
                  </p>
                </div>
                
                <Link 
                  to="/profil" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-[#3C5759] hover:bg-slate-50 transition-colors"
                >
                  <User size={16} />
                  Lihat Profil
                </Link>
                
                <Link 
                  to="/logout" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Keluar
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
}