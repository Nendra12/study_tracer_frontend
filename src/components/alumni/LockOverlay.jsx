import React from 'react';
import { Lock } from 'lucide-react';

export default function LockOverlay({ 
  message = "Verifikasi akun & isi kuesioner untuk membuka fitur ini", 
  roundedClass = "rounded-3xl", // Default untuk card biasa
  iconSize = 24,
  textClass = "text-xs"
}) {
  return (
    <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-[2px] ${roundedClass}`}>
      <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl flex flex-col items-center max-w-[85%] text-center border border-white/50">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400">
          <Lock size={iconSize} />
        </div>
        <p className={`font-bold text-slate-700 ${textClass}`}>
          Akses Terkunci
        </p>
        <p className="text-slate-500 text-[11px] mt-1 font-medium leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}