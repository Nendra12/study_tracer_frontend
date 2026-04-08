import React from 'react';
import { Eye, Upload, Image as ImageIcon } from 'lucide-react';

export default function IdentitySection({
  namaSekolah, setNamaSekolah,
  logoPreview, setLogoPreview, setLogoFile, logoInputRef,
  loginBgPreview, setLoginBgPreview, setLoginBgFile, loginBgInputRef,
  openPreview, handleImageChange
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
        <h3 className="text-lg font-bold text-primary">Identitas Sekolah & Media Login</h3>
        <button
          onClick={() => openPreview('login')}
          className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Eye size={14} className='text-primary' /> Preview Tampilan
        </button>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Nama Sekolah / Organisasi</label>
          <input
            type="text" value={namaSekolah} onChange={(e) => setNamaSekolah(e.target.value)}
            className="w-full lg:w-1/2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
            placeholder="Contoh: SMKN 2 Kraksaan"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-50 pt-6">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">Logo Aplikasi</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div 
                onClick={() => logoInputRef.current.click()}
                className="w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:border-primary transition-colors group relative"
              >
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={20} className="text-white" />
                    </div>
                  </>
                ) : (
                  <ImageIcon size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
                )}
              </div>
              <div className="space-y-2 flex-1">
                <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={(e) => handleImageChange(e, setLogoPreview, setLogoFile)} />
                <button onClick={() => logoInputRef.current.click()} className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
                  <Upload size={14} /> Ganti Logo
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">Gambar Background Halaman Login</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div 
                onClick={() => loginBgInputRef.current.click()}
                className="w-40 h-28 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:border-primary transition-colors group relative"
              >
                {loginBgPreview ? (
                  <>
                    <img src={loginBgPreview} alt="Login BG" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={24} className="text-white" />
                    </div>
                  </>
                ) : (
                  <ImageIcon size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
                )}
              </div>
              <div className="space-y-2 flex-1">
                <input type="file" accept="image/*" className="hidden" ref={loginBgInputRef} onChange={(e) => handleImageChange(e, setLoginBgPreview, setLoginBgFile)} />
                <button onClick={() => loginBgInputRef.current.click()} className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
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