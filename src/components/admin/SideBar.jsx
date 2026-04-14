import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Briefcase, Database,
  FileText, LogOut, X, Map,
  IdCardLanyard, Megaphone, Palette, Handshake
} from 'lucide-react';
import DefaultLogo from '../../assets/icon.png';
import { Link, matchPath, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { alertConfirm } from '../../utilitis/alert';
import { useThemeSettings } from '../../context/ThemeContext';

export default function SideBar({ active, setActive }) {
  const [activeMenu, setActiveMenu] = useState('Beranda');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const { theme } = useThemeSettings();
  const navigate = useNavigate();
  const location = useLocation()

  // --- TAMBAHAN MENU SEBARAN ALUMNI DI BAWAH BERANDA ---
  const menuItems = [
    { name: 'Beranda', icon: <LayoutDashboard size={20} />, path: '/wb-admin' },
    { name: 'Sebaran Alumni', icon: <Map size={20} />, path: '/wb-admin/sebaran-alumni' },
    { name: 'Manajemen Pengguna', icon: <Users size={20} />, path: '/wb-admin/manage-user' },
    { name: 'Manajemen Pekerjaan', icon: <Briefcase size={20} />, path: '/wb-admin/jobs' },
    { name: 'Status Karier', icon: <IdCardLanyard size={20} />, path: '/wb-admin/status-karir' },
    { name: 'Data Master', icon: <Database size={20} />, path: '/wb-admin/master' },
    { name: 'Kemitraan', icon: <Handshake size={20} />, path: '/wb-admin/kemitraan' },
    { name: 'Kuesioner', icon: <FileText size={20} />, path: '/wb-admin/kuisoner' },
    { name: 'Pengumuman', icon: <Megaphone size={20} />, path: '/wb-admin/pengumuman' }, 
    { name: 'Pengaturan Tampilan', icon: <Palette size={20} />, path: '/wb-admin/tampilan' },
  ];

  const handleLogout = async () => {
    const confirm = await alertConfirm("Apakah Anda yakin ingin keluar?");
    if (!confirm.isConfirmed) return;

    setIsLoggingOut(true);

    try {
      await logout();
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const routes = [
    { path: "/wb-admin", title: "Beranda" },
    { path: "/wb-admin/sebaran-alumni", title: "Sebaran Alumni" }, // Tambahan Route Title
    { path: "/wb-admin/manage-user", title: "Manajemen Pengguna" },
    { path: "/wb-admin/jobs/job-detail/:id", title: "Manajemen Pekerjaan" },
    { path: "/wb-admin/jobs", title: "Manajemen Pekerjaan" },
    { path: "/wb-admin/status-karir", title: "Status Karier" },
    { path: "/wb-admin/master", title: "Data Master" },
    { path: "/wb-admin/kemitraan", title: "Kemitraan" },
    { path: "/wb-admin/kuisoner", title: "Kuesioner" },
    { path: "/wb-admin/kuisoner/tambah-kuesioner", title: "Kuesioner" },
    { path: "/wb-admin/kuisoner/preview-kuesioner/:id", title: "Kuesioner" },
    { path: "/wb-admin/kuisoner/tinjau-jawaban/:jawabanid", title: "Kuesioner" },
    { path: "/wb-admin/kuisoner/tinjau-jawaban/:jawabanid/statistik", title: "Kuesioner" },
    { path: "/wb-admin/kuisoner/tinjau-jawaban/:jawabanid/detail/:detailid", title: "Kuesioner" },
    { path: "/wb-admin/kuisoner/update-kuesioner/:id", title: "Kuesioner" },
    { path: "/wb-admin/pengumuman", title: "Pengumuman" },
    { path: "/wb-admin/tampilan", title: "Pengaturan Tampilan" },
  ];

  const getTitle = () => {
    const current = routes.find((route) =>
      matchPath({ path: route.path, end: true }, location.pathname)
    );

    return current?.title || "Dashboard";
  };

  useEffect(() => {
    setActiveMenu(getTitle());
  }, [location.pathname]);

  return (
    <>
      {active && (
        <div
          className="fixed inset-0 bg-black/40 z-21 xl:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setActive(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed xl:relative z-30
        w-72 md:w-65
        h-dvh
        bg-white border-r border-fourth
        flex flex-col
        transition-all duration-300 ease-in-out
        ${active ? 'translate-x-0' : '-translate-x-full xl:hidden'}
      `}>

        {/* Header Sidebar + Tombol Close */}
        <div className="p-5 flex items-center justify-between">
          {/* Bungkus logo dan teks dengan Link menuju "/" (Landing Page) */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <img src={theme?.logo || DefaultLogo} alt="Logo" className='w-10 md:w-12'/>
            <div className="min-w-0">
              <h1 className="text-primary font-bold leading-tight text-sm truncate">{theme?.namaSekolah || 'Alumni Tracer'}</h1>
              <p className="text-third text-[10px]">Admin Portal</p>
            </div>
          </Link>

          <button
            onClick={() => setActive(false)}
            className="xl:hidden p-2 text-third hover:bg-fourth rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => {
            const isActive = activeMenu === item.name;
            return (
              <Link
                key={index}
                to={item.path}
                onClick={() => {
                  setActiveMenu(item.name);
                  if(window.innerWidth < 1280) setActive(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-fourth text-primary font-bold shadow-sm'
                    : 'text-third hover:bg-fourth/50 hover:text-primary'}
                `}
              >
                <span className={isActive ? 'text-primary' : 'text-third'}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-fourth bg-white">
          <button
            onClick={ handleLogout }
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Keluar Aplikasi</span>
          </button>
          <div className="h-2 xl:hidden"></div>
        </div>
      </div>

      {isLoggingOut && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-700 font-medium">Menghapus sesi...</p>
          </div>
        </div>
      )}
    </> 
  );
}