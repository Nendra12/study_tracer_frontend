import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Save, RefreshCcw, Eye } from 'lucide-react';
import { alertSuccess, alertConfirm, alertError } from '../../utilitis/alert';

// Import Hook dari ThemeContext
import { useThemeSettings } from '../../context/ThemeContext';
// Import Komponen Preview
import TampilanPreview from '../../components/admin/TampilanPreview';
// Import Admin API
import { adminApi } from '../../api/admin';

export default function PengaturanTampilan() {
  const { theme, updateSettings, refreshFromApi } = useThemeSettings();

  const [namaSekolah, setNamaSekolah] = useState(theme?.namaSekolah || 'SMK Negeri 1 Gondang');
  const [primaryColor, setPrimaryColor] = useState(theme?.primaryColor || '#3C5759');
  const [secondaryColor, setSecondaryColor] = useState(theme?.secondaryColor || '#F3F4F4');
  const [thirdColor, setThirdColor] = useState(theme?.thirdColor || '#9CA3AF');
  
  const [logoPreview, setLogoPreview] = useState(theme?.logo || null);
  const [loginBgPreview, setLoginBgPreview] = useState(theme?.loginBg || null);
  
  // Menyimpan file asli untuk dikirim ke backend
  const [logoFile, setLogoFile] = useState(null);
  const [loginBgFile, setLoginBgFile] = useState(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const logoInputRef = useRef(null);
  const loginBgInputRef = useRef(null);

  const primaryPickerRef = useRef(null);
  const secondaryPickerRef = useRef(null);
  const thirdPickerRef = useRef(null);

  useEffect(() => {
    if (theme) {
      setNamaSekolah(theme.namaSekolah);
      setPrimaryColor(theme.primaryColor);
      setSecondaryColor(theme.secondaryColor);
      setThirdColor(theme.thirdColor);
      if (theme.logo) setLogoPreview(theme.logo);
      if (theme.loginBg) setLoginBgPreview(theme.loginBg);
    }
  }, [theme]);

  const handleImageChange = (e, setPreview, setFile) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleColorTextChange = (newHexText, setColor, pickerInputRef) => {
    setColor(newHexText);
    if (/^#[0-9A-F]{6}$/i.test(newHexText)) {
      if (pickerInputRef && pickerInputRef.current) {
        pickerInputRef.current.value = newHexText;
      }
    }
  };

  const handleSave = async () => {
    const confirm = await alertConfirm("Terapkan perubahan tampilan ini ke seluruh sistem?");
    if (!confirm.isConfirmed) return;

    setIsSaving(true);
    
    try {
      // Bangun FormData untuk dikirim ke backend
      const formData = new FormData();
      formData.append('nama_sekolah', namaSekolah);
      formData.append('primary_color', primaryColor);
      formData.append('secondary_color', secondaryColor);
      formData.append('third_color', thirdColor);
      
      // Kirim file gambar hanya jika ada file baru yang dipilih
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      if (loginBgFile) {
        formData.append('login_bg', loginBgFile);
      }

      await adminApi.updatePengaturanTampilan(formData);

      // Refresh theme dari API agar semua komponen mendapatkan URL gambar terbaru
      await refreshFromApi();

      // Reset file state setelah berhasil
      setLogoFile(null);
      setLoginBgFile(null);

      alertSuccess("Tampilan aplikasi berhasil diperbarui secara global.");
    } catch (error) {
      console.error('Gagal menyimpan pengaturan tampilan:', error);
      const message = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan pengaturan.';
      alertError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setNamaSekolah(theme?.namaSekolah || 'SMK Negeri 1 Gondang');
    setPrimaryColor(theme?.primaryColor || '#3C5759');
    setSecondaryColor(theme?.secondaryColor || '#F3F4F4');
    setThirdColor(theme?.thirdColor || '#9CA3AF');
    setLogoPreview(theme?.logo || null);
    setLoginBgPreview(theme?.loginBg || null);
    setLogoFile(null);
    setLoginBgFile(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full relative">
      
      {/* CARD UTAMA */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative z-10">
        
        <div className="p-6 md:p-8 space-y-10">
          
          {/* SECTION 1: TEKS & GAMBAR */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
              <h3 className="text-lg font-bold text-primary">Identitas & Media</h3>
              <button
                onClick={() => setShowPreviewModal(true)}
                className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Eye size={14} className='text-primary' /> Preview Warna
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3 max-w-xl">
                <label className="block text-sm font-bold text-gray-700">Nama Sekolah / Organisasi</label>
                <input 
                  type="text" value={namaSekolah} onChange={(e) => setNamaSekolah(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
                  placeholder="Contoh: SMK Negeri 1 Gondang"
                />
                <p className="text-[11px] text-gray-400 font-medium">Teks ini akan muncul di Header, Sidebar, dan Landing Page.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Logo */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700">Logo Aplikasi</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" /> : <ImageIcon size={24} className="text-gray-400" />}
                    </div>
                    <div className="space-y-2 flex-1">
                      <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={(e) => handleImageChange(e, setLogoPreview, setLogoFile)} />
                      <button onClick={() => logoInputRef.current.click()} className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center">
                        <Upload size={14} /> Ganti Logo
                      </button>
                      <p className="text-[11px] text-gray-400 font-medium max-w-[200px]">Format: PNG transparan (Max 2MB).</p>
                    </div>
                  </div>
                </div>

                {/* Upload BG Login */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700">Gambar Background Halaman Login</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-32 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {loginBgPreview ? <img src={loginBgPreview} alt="Login BG" className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-gray-400" />}
                    </div>
                    <div className="space-y-2 flex-1">
                      <input type="file" accept="image/*" className="hidden" ref={loginBgInputRef} onChange={(e) => handleImageChange(e, setLoginBgPreview, setLoginBgFile)} />
                      <button onClick={() => loginBgInputRef.current.click()} className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center">
                        <Upload size={14} /> Ganti Gambar
                      </button>
                      <p className="text-[11px] text-gray-400 font-medium max-w-[200px]">Format: JPG/PNG (Max 5MB). Resolusi ideal potrait/landscape.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: WARNA TEMA */}
          <section>
            <h3 className="text-lg font-bold text-primary mb-6 border-b border-gray-100 pb-2">Palet Warna Aplikasi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Primary */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Primary</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Warna utama & tombol</p>
                  </div>
                  <input type="color" ref={primaryPickerRef} value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0 appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md shadow-sm" />
                </div>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">#</span>
                    <input type="text" value={primaryColor} onChange={(e) => handleColorTextChange(e.target.value, setPrimaryColor, primaryPickerRef)} className="w-full pl-7 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-mono uppercase text-gray-600 outline-none transition-all focus:ring-1 focus:ring-primary/20 focus:border-primary" placeholder="XXXXXX" maxLength={7} />
                </div>
              </div>

              {/* Secondary */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Secondary</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Latar belakang minor</p>
                  </div>
                  <input type="color" ref={secondaryPickerRef} value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0 appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md shadow-sm" />
                </div>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">#</span>
                    <input type="text" value={secondaryColor} onChange={(e) => handleColorTextChange(e.target.value, setSecondaryColor, secondaryPickerRef)} className="w-full pl-7 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-mono uppercase text-gray-600 outline-none transition-all focus:ring-1 focus:ring-primary/20 focus:border-primary" placeholder="XXXXXX" maxLength={7} />
                </div>
              </div>

              {/* Third */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Third</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Teks sekunder / aksen</p>
                  </div>
                  <input type="color" ref={thirdPickerRef} value={thirdColor} onChange={(e) => setThirdColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0 appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md shadow-sm" />
                </div>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">#</span>
                    <input type="text" value={thirdColor} onChange={(e) => handleColorTextChange(e.target.value, setThirdColor, thirdPickerRef)} className="w-full pl-7 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-mono uppercase text-gray-600 outline-none transition-all focus:ring-1 focus:ring-primary/20 focus:border-primary" placeholder="XXXXXX" maxLength={7} />
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button onClick={handleReset} disabled={isSaving} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
            <RefreshCcw size={16} /> Batal / Reset
          </button>
          <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={16} />}
            {isSaving ? 'Menerapkan...' : 'Simpan Perubahan'}
          </button>
        </div>

      </div>

      {/* Render Komponen Preview Modal */}
      <TampilanPreview 
        isOpen={showPreviewModal} 
        onClose={() => setShowPreviewModal(false)}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        thirdColor={thirdColor}
        logo={logoPreview}
        loginBg={loginBgPreview}
        namaSekolah={namaSekolah}
      />

    </div>
  );
}