import React from 'react';
import { GraduationCap, Search } from 'lucide-react';

export default function Navbar({ user }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      {/* Menggunakan max-w-[1440px] agar lebih full layar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#3C5759] text-white p-1.5 rounded-lg"><GraduationCap size={20} /></div>
          <span className="font-black text-slate-800 tracking-tight text-lg">Alumni Tracer</span>
        </div>
        
        <div className="hidden md:flex bg-slate-100 rounded-full p-1">
          {['Beranda', 'Lowongan', 'Kuesioner', 'Profil'].map((item, i) => (
            <button key={item} className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${i === 0 ? 'bg-white text-[#3C5759] shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Search size={18} className="text-slate-400 hover:text-[#3C5759] transition-colors cursor-pointer" />
          <div className="w-8 h-8 rounded-full bg-[#3C5759] border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-105 transition-transform">
            {user?.nama_alumni?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </nav>
  );
}