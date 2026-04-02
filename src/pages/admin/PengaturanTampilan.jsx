import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Save, RefreshCcw, Eye } from 'lucide-react';
import { alertSuccess, alertConfirm, alertError } from '../../utilitis/alert';

// Import Hook dari ThemeContext
import { useThemeSettings } from '../../context/ThemeContext';
// Import Komponen Preview
import TampilanPreview from '../../components/admin/TampilanPreview'; // Pastikan path ini benar!
// Import Admin API
import { adminApi } from '../../api/admin';

export default function PengaturanTampilan() {
  const { theme, updateSettings, refreshFromApi } = useThemeSettings();

  // State Identitas & Warna
  const [namaSekolah, setNamaSekolah] = useState(theme?.namaSekolah || 'SMK Negeri 1 Gondang');
  const [primaryColor, setPrimaryColor] = useState(theme?.primaryColor || '#3C5759');
  const [secondaryColor, setSecondaryColor] = useState(theme?.secondaryColor || '#F3F4F4');
  const [thirdColor, setThirdColor] = useState(theme?.thirdColor || '#9CA3AF');
  
  // State Teks Footer & Modal Baru
  const [deskripsiFooter, setDeskripsiFooter] = useState(theme?.deskripsiFooter || '');
  const [emailKontak, setEmailKontak] = useState(theme?.emailKontak || '');
  const [webKontak, setWebKontak] = useState(theme?.webKontak || '');
  const [telpKontak, setTelpKontak] = useState(theme?.telpKontak || '');
  const [teksPrivasi, setTeksPrivasi] = useState(theme?.teksPrivasi || '');
  const [teksLayanan, setTeksLayanan] = useState(theme?.teksLayanan || '');
  const [teksDukungan, setTeksDukungan] = useState(theme?.teksDukungan || '');

  // State Meta Data
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaIconPreview, setMetaIconPreview] = useState(null);
  const [metaIconFile, setMetaIconFile] = useState(null);
  const metaIconInputRef = useRef(null);

  // State Preview Gambar
  const [logoPreview, setLogoPreview] = useState(theme?.logo || null);
  const [loginBgPreview, setLoginBgPreview] = useState(theme?.loginBg || null);
  const [landingBgPreview, setLandingBgPreview] = useState(theme?.landingBg || null);
  
  // File untuk diupload
  const [logoFile, setLogoFile] = useState(null);
  const [loginBgFile, setLoginBgFile] = useState(null);
  const [landingBgFile, setLandingBgFile] = useState(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const logoInputRef = useRef(null);
  const loginBgInputRef = useRef(null);
  const landingBgInputRef = useRef(null);

  const primaryPickerRef = useRef(null);
  const secondaryPickerRef = useRef(null);
  const thirdPickerRef = useRef(null);

  useEffect(() => {
    if (theme) {
      setNamaSekolah(theme.namaSekolah);
      setPrimaryColor(theme.primaryColor);
      setSecondaryColor(theme.secondaryColor);
      setThirdColor(theme.thirdColor);
      setDeskripsiFooter(theme.deskripsiFooter || '');
      setEmailKontak(theme.emailKontak || '');
      setWebKontak(theme.webKontak || '');
      setTelpKontak(theme.telpKontak || '');
      setTeksPrivasi(theme.teksPrivasi || '');
      setTeksLayanan(theme.teksLayanan || '');
      setTeksDukungan(theme.teksDukungan || '');
      
      if (theme.logo) setLogoPreview(theme.logo);
      if (theme.loginBg) setLoginBgPreview(theme.loginBg);
      if (theme.landingBg) setLandingBgPreview(theme.landingBg);
    }
  }, [theme]);

  // Fetch Meta Data secara terpisah
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await adminApi.getMetaData();
        const data = res.data?.data;
        if (data) {
          setMetaTitle(data.title || '');
          setMetaDescription(data.description || '');
          if (data.icon_url) setMetaIconPreview(data.icon_url);
        }
      } catch (err) {
        console.error('Failed to fetch metadata', err);
      }
    };
    fetchMeta();
  }, []);

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
      const formData = new FormData();
      formData.append('nama_sekolah', namaSekolah);
      formData.append('primary_color', primaryColor);
      formData.append('secondary_color', secondaryColor);
      formData.append('third_color', thirdColor);
      
      // Append data Footer & Modal baru
      formData.append('deskripsi_footer', deskripsiFooter);
      formData.append('email_kontak', emailKontak);
      formData.append('web_kontak', webKontak);
      formData.append('telp_kontak', telpKontak);
      formData.append('teks_privasi', teksPrivasi);
      formData.append('teks_layanan', teksLayanan);
      formData.append('teks_dukungan', teksDukungan);
      
      if (logoFile) formData.append('logo', logoFile);
      if (loginBgFile) formData.append('login_bg', loginBgFile);
      if (landingBgFile) formData.append('landing_bg', landingBgFile);

      // --- Meta Data Request ---
      const metaDataForm = new FormData();
      if (metaTitle) metaDataForm.append('title', metaTitle);
      if (metaDescription) metaDataForm.append('description', metaDescription);
      if (metaIconFile) metaDataForm.append('icon', metaIconFile);

      // Jalankan keduanya secara bersamaan (atau berurutan)
      await adminApi.updatePengaturanTampilan(formData);
      await adminApi.updateMetaData(metaDataForm);
      
      await refreshFromApi();

      setLogoFile(null);
      setLoginBgFile(null);
      setLandingBgFile(null);

      alertSuccess("Pengaturan tampilan & konten berhasil diperbarui.");
    } catch (error) {
      console.error('Gagal menyimpan:', error);
      alertError(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setNamaSekolah(theme?.namaSekolah || 'SMK Negeri 1 Gondang');
    setPrimaryColor(theme?.primaryColor || '#3C5759');
    setSecondaryColor(theme?.secondaryColor || '#F3F4F4');
    setThirdColor(theme?.thirdColor || '#9CA3AF');
    setDeskripsiFooter(theme?.deskripsiFooter || '');
    setEmailKontak(theme?.emailKontak || '');
    setWebKontak(theme?.webKontak || '');
    setTelpKontak(theme?.telpKontak || '');
    setTeksPrivasi(theme?.teksPrivasi || '');
    setTeksLayanan(theme?.teksLayanan || '');
    setTeksDukungan(theme?.teksDukungan || '');
    setLogoPreview(theme?.logo || null);
    setLoginBgPreview(theme?.loginBg || null);
    setLandingBgPreview(theme?.landingBg || null);
    setLogoFile(null);
    setLoginBgFile(null);
    setLandingBgFile(null);
    setMetaIconFile(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full relative">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative z-10">
        <div className="p-6 md:p-8 space-y-12">

          {/* Section 1 : Meta Data Management */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
              <h3 className="text-lg font-bold text-primary">Manajemen Meta Data (SEO)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
                  <input 
                    type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
                    placeholder="Contoh: Study Tracer - Alumni"
                  />
                  <p className="text-[11px] text-gray-400 font-medium mt-1">Muncul di tab browser hasil pencarian mesin telusur.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Meta Deskripsi</label>
                  <textarea 
                    value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows="3"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white resize-none"
                    placeholder="Masukkan deskripsi singkat tentang website untuk SEO..."
                  ></textarea>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700">Meta Icon (Favicon)</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {metaIconPreview ? <img src={metaIconPreview} alt="Meta Icon" className="w-full h-full object-contain p-2" /> : <ImageIcon size={24} className="text-gray-400" />}
                  </div>
                  <div className="space-y-2 flex-1">
                    <input type="file" accept=".ico,.png,.jpg,.jpeg,.svg" className="hidden" ref={metaIconInputRef} onChange={(e) => handleImageChange(e, setMetaIconPreview, setMetaIconFile)} />
                    <button onClick={() => metaIconInputRef.current.click()} className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
                      <Upload size={14} /> Ganti Icon
                    </button>
                    <p className="text-[11px] text-gray-400 font-medium max-w-50">Format: ICO, PNG, SVG (Idealnya 1:1, max 2MB).</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 1: TEKS & GAMBAR */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
              <h3 className="text-lg font-bold text-primary">Identitas & Media</h3>
              <button
                onClick={() => setShowPreviewModal(true)}
                className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Eye size={14} className='text-primary' /> Preview Tampilan
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">Nama Sekolah / Organisasi</label>
                    <input 
                      type="text" value={namaSekolah} onChange={(e) => setNamaSekolah(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
                      placeholder="Contoh: SMK Negeri 1 Gondang"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">Gambar Background Landing Page</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-32 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {landingBgPreview ? <img src={landingBgPreview} alt="Landing BG" className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-gray-400" />}
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
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">Logo Aplikasi</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" /> : <ImageIcon size={24} className="text-gray-400" />}
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
                      <div className="w-32 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {loginBgPreview ? <img src={loginBgPreview} alt="Login BG" className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-gray-400" />}
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
            </div>
          </section>

          {/* SECTION 2: WARNA TEMA */}
          <section>
            <h3 className="text-lg font-bold text-primary mb-6 border-b border-gray-100 pb-2">Palet Warna Aplikasi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Primary', sub: 'Warna utama', val: primaryColor, set: setPrimaryColor, ref: primaryPickerRef },
                { label: 'Secondary', sub: 'Latar belakang minor', val: secondaryColor, set: setSecondaryColor, ref: secondaryPickerRef },
                { label: 'Third', sub: 'Teks sekunder', val: thirdColor, set: setThirdColor, ref: thirdPickerRef },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{item.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.sub}</p>
                    </div>
                    <input type="color" ref={item.ref} value={item.val} onChange={(e) => item.set(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0 appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md shadow-sm" />
                  </div>
                  <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">#</span>
                      <input type="text" value={item.val} onChange={(e) => handleColorTextChange(e.target.value, item.set, item.ref)} className="w-full pl-7 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-mono uppercase text-gray-600 outline-none transition-all focus:ring-1 focus:ring-primary/20 focus:border-primary" placeholder="XXXXXX" maxLength={7} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: KONTEN FOOTER & TEKS MODAL */}
          <section>
            <h3 className="text-lg font-bold text-primary mb-6 border-b border-gray-100 pb-2">Konten Footer & Teks Modal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Kolom Kiri: Informasi Kontak Footer */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Footer</label>
                  <textarea 
                    value={deskripsiFooter} onChange={(e) => setDeskripsiFooter(e.target.value)} rows="3"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white resize-none"
                    placeholder="Masukkan deskripsi singkat tentang sistem alumni..."
                  ></textarea>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-primary border-b border-gray-100 pb-1">Detail Kontak Kami</h4>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Email</label>
                    <input type="email" value={emailKontak} onChange={(e) => setEmailKontak(e.target.value)} placeholder="contoh@domain.com" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Website</label>
                    <input type="text" value={webKontak} onChange={(e) => setWebKontak(e.target.value)} placeholder="www.domain.com" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Telepon</label>
                    <input type="text" value={telpKontak} onChange={(e) => setTelpKontak(e.target.value)} placeholder="(0123) 456789" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Teks Modal */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Teks Modal Kebijakan Privasi</label>
                  <textarea 
                    value={teksPrivasi} onChange={(e) => setTeksPrivasi(e.target.value)} rows="3"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white resize-none"
                    placeholder="Masukkan teks kebijakan privasi..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Teks Modal Ketentuan Layanan</label>
                  <textarea 
                    value={teksLayanan} onChange={(e) => setTeksLayanan(e.target.value)} rows="3"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white resize-none"
                    placeholder="Masukkan teks ketentuan layanan..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Teks Pengantar Kontak Dukungan</label>
                  <textarea 
                    value={teksDukungan} onChange={(e) => setTeksDukungan(e.target.value)} rows="2"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white resize-none"
                    placeholder="Masukkan pesan pengantar untuk modal kontak..."
                  ></textarea>
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

      <TampilanPreview 
        isOpen={showPreviewModal} 
        onClose={() => setShowPreviewModal(false)}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        thirdColor={thirdColor}
        logo={logoPreview}
        loginBg={loginBgPreview}
        landingBg={landingBgPreview}
        namaSekolah={namaSekolah}
      />
    </div>
  );
}