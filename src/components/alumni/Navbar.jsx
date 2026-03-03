import React from 'react';
import { GraduationCap, User } from 'lucide-react';

export default function Navbar({ user }) {
  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-[#3C5759] p-1.5 rounded-lg">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 tracking-tight">Alumni Tracer</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="text-[#3C5759]">Beranda</a>
            <a href="#" className="hover:text-[#3C5759] transition-colors">Lowongan</a>
            <a href="#" className="hover:text-[#3C5759] transition-colors">Profil</a>
          </div>
          <div className="h-6 w-px bg-slate-100 mx-1 hidden md:block"></div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600 hidden sm:block">{user.name}</span>
            <img src={user.avatar} className="w-8 h-8 rounded-full border border-slate-200" alt="Profile" />
          </div>
        </div>
      </div>
    </nav>
  );
}