import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="text-[#3C5759] font-black text-sm tracking-tight">ALUMNI TRACER</p>
          <p className="text-slate-400 text-[11px] font-medium">© 2026 Hak Cipta Dilindungi.</p>
        </div>
        
        <div className="flex gap-8">
          {['Privasi', 'Syarat', 'Bantuan'].map((item) => (
            <a key={item} href="#" className="text-slate-400 hover:text-[#3C5759] text-[11px] font-bold uppercase tracking-widest transition-colors">
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}