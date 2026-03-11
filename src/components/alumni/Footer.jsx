import React, { useState } from 'react';
import FooterModals from './FooterModals'; // Import komponen baru

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // State untuk mengontrol modal
  const [modalType, setModalType] = useState(null);

  const openModal = (type) => setModalType(type);
  const closeModal = () => setModalType(null);

  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-auto relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-xs sm:text-sm text-center md:text-left font-medium">
          © {currentYear} Alumni Tracer. Hak cipta dilindungi undang-undang
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <button 
            onClick={() => openModal('privasi')}
            className="text-slate-500 hover:text-[#425A5C] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            Kebijakan Privasi
          </button>
          <button 
            onClick={() => openModal('layanan')}
            className="text-slate-500 hover:text-[#425A5C] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            Ketentuan Layanan
          </button>
          <button 
            onClick={() => openModal('kontak')}
            className="text-slate-500 hover:text-[#425A5C] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            Kontak Dukungan
          </button>
        </div>
      </div>

      {/* Render Modal */}
      <FooterModals 
        isOpen={!!modalType} 
        type={modalType} 
        onClose={closeModal} 
      />
    </footer>
  );
}