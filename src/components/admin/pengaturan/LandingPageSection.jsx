import React from 'react';
import { Eye, Upload, Image as ImageIcon } from 'lucide-react';

export default function LandingPageSection({
  landingTitle, setLandingTitle,
  landingDescription, setLandingDescription,
  landingBgPreview, setLandingBgPreview, setLandingBgFile, landingBgInputRef,
  openPreview, handleImageChange
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
        <h3 className="text-lg font-bold text-primary">Konten Landing Page</h3>
        <button
          onClick={() => openPreview('landing')}
          className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Eye size={14} className='text-primary' /> Preview Tampilan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Judul Utama Landing Page</label>
            <input
              type="text" value={landingTitle} onChange={(e) => setLandingTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
              placeholder="Contoh: Tetap Terhubung dengan Alumni"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Utama Landing Page</label>
            <textarea
              value={landingDescription} onChange={(e) => setLandingDescription(e.target.value)} rows="4"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white resize-none"
              placeholder="Masukkan deskripsi untuk landing page..."
            ></textarea>
          </div>
        </div>
        
        <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">Gambar Background Landing Page</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div 
                  onClick={() => landingBgInputRef.current.click()}
                  className="w-40 h-28 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:border-primary transition-colors group relative"
                >
                  {landingBgPreview ? (
                    <>
                      <img src={landingBgPreview} alt="Landing BG" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={24} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <ImageIcon size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <input type="file" accept="image/*" className="hidden" ref={landingBgInputRef} onChange={(e) => handleImageChange(e, setLandingBgPreview, setLandingBgFile)} />
                  <button onClick={() => landingBgInputRef.current.click()} className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
                    <Upload size={14} /> Ganti Gambar
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}