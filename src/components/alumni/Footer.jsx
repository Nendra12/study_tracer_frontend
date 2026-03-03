import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-auto relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-xs sm:text-sm text-center md:text-left">
          © {currentYear} Alumni Tracer. Hak cipta dilindungi undang-undang
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <a href="#" className="text-slate-500 hover:text-[#3C5759] text-xs sm:text-sm font-medium transition-colors">Kebijakan Privasi</a>
          <a href="#" className="text-slate-500 hover:text-[#3C5759] text-xs sm:text-sm font-medium transition-colors">Ketentuan Layanan</a>
          <a href="#" className="text-slate-500 hover:text-[#3C5759] text-xs sm:text-sm font-medium transition-colors">Kontak Dukungan</a>
        </div>
      </div>
    </footer>
  );
}