import React from 'react';
import { createPortal } from 'react-dom';
import { Eye, X } from 'lucide-react';

import PreviewMeta from './preview/PreviewMeta';
import PreviewLogin from './preview/PreviewLogin';
import PreviewLanding from './preview/PreviewLanding';
import PreviewFooter from './preview/PreviewFooter';

export default function TampilanPreview({ 
  isOpen, 
  onClose, 
  activeTab = 'landing',
  primaryColor, 
  secondaryColor, 
  thirdColor,
  logo,
  loginBg,
  landingBg,
  namaSekolah,
  metaTitle,
  metaDescription,
  metaIcon,
  landingTitle,
  landingDescription,
  deskripsiFooter,
  emailKontak,
  webKontak,
  telpKontak,
  teksPrivasi,
  teksLayanan,
  teksDukungan
}) {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 md:p-6 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 shrink-0 bg-white z-10 shadow-sm">
          <div className='flex items-center gap-3'>
              <div className='p-2.5 rounded-xl' style={{backgroundColor: `${secondaryColor}`}}>
                <Eye size={22} style={{color: `${primaryColor}`}} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight" style={{color: `${primaryColor}`}}>Preview Tampilan Aplikasi</h3>
                <p className='text-xs font-medium' style={{color: `${thirdColor}`}}>
                  {activeTab === 'meta' && "Simulasi hasil pencarian di Google Search."}
                  {activeTab === 'login' && "Simulasi struktur Halaman Login."}
                  {activeTab === 'landing' && "Simulasi struktur Landing Page."}
                  {activeTab === 'footer' && "Simulasi struktur Footer dan Modal Informasi."}
                </p>
              </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* KONTEN PREVIEW */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-12 bg-gray-100/50 custom-scrollbar">
          
          {activeTab === 'meta' && (
            <PreviewMeta 
              metaIcon={metaIcon} logo={logo} namaSekolah={namaSekolah} 
              metaTitle={metaTitle} metaDescription={metaDescription} 
            />
          )}

          {activeTab === 'login' && (
            <PreviewLogin 
              primaryColor={primaryColor} loginBg={loginBg} 
              logo={logo} namaSekolah={namaSekolah} 
            />
          )}

          {activeTab === 'landing' && (
            <PreviewLanding 
              primaryColor={primaryColor} thirdColor={thirdColor} logo={logo} 
              namaSekolah={namaSekolah} landingBg={landingBg} 
              landingTitle={landingTitle} landingDescription={landingDescription} 
            />
          )}

          {activeTab === 'footer' && (
            <PreviewFooter 
              primaryColor={primaryColor} logo={logo} namaSekolah={namaSekolah} 
              deskripsiFooter={deskripsiFooter} webKontak={webKontak} 
              emailKontak={emailKontak} telpKontak={telpKontak} 
              teksPrivasi={teksPrivasi} teksLayanan={teksLayanan} teksDukungan={teksDukungan} 
            />
          )}

        </div>

        {/* FOOTER MODAL */}
        <div className="p-5 md:p-6 border-t border-gray-100 bg-white shrink-0 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
            style={{backgroundColor: primaryColor}}
          >
            Tutup Preview
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}