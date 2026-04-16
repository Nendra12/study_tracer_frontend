import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Save, RefreshCcw } from 'lucide-react';
import { alertSuccess, alertConfirm, alertError } from '../../utilitis/alert';
import { useThemeSettings } from '../../context/ThemeContext';
import TampilanPreview from '../../components/admin/TampilanPreview'; 
import { adminApi } from '../../api/admin';
import { useNavigate } from 'react-router-dom'; 

// Import Sub-Komponen
import MetaDataSection from '../../components/admin/pengaturan/MetaDataSection';
import IdentitySection from '../../components/admin/pengaturan/IdentitySection';
import LandingPageSection from '../../components/admin/pengaturan/LandingPageSection';
import ThemeColorSection from '../../components/admin/pengaturan/ThemeColorSection';
import FooterModalSection from '../../components/admin/pengaturan/FooterModalSection';
import SkeletonPengaturan from '../../components/admin/skeleton/SkeletonPengaturan';

export default function PengaturanTampilan() {
  const { theme, updateSettings, refreshFromApi } = useThemeSettings();
  const navigate = useNavigate();

  // State untuk melacak initial loading
  const [isLoading, setIsLoading] = useState(true);

  const [namaSekolah, setNamaSekolah] = useState(theme?.namaSekolah || 'SMKN 2 Kraksaan');
  const [primaryColor, setPrimaryColor] = useState(theme?.primaryColor || '#3C5759');
  const [secondaryColor, setSecondaryColor] = useState(theme?.secondaryColor || '#F3F4F4');
  const [thirdColor, setThirdColor] = useState(theme?.thirdColor || '#9CA3AF');

  const [landingTitle, setLandingTitle] = useState(theme?.landingTitle || '');
  const [landingDescription, setLandingDescription] = useState(theme?.landingDescription || '');

  const [deskripsiFooter, setDeskripsiFooter] = useState(theme?.deskripsiFooter || '');
  const [emailKontak, setEmailKontak] = useState(theme?.emailKontak || '');
  const [webKontak, setWebKontak] = useState(theme?.webKontak || '');
  const [telpKontak, setTelpKontak] = useState(theme?.telpKontak || '');
  const [teksPrivasi, setTeksPrivasi] = useState(theme?.teksPrivasi || '');
  const [teksLayanan, setTeksLayanan] = useState(theme?.teksLayanan || '');
  const [teksDukungan, setTeksDukungan] = useState(theme?.teksDukungan || '');

  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaIconPreview, setMetaIconPreview] = useState(null);
  const [metaIconFile, setMetaIconFile] = useState(null);
  const metaIconInputRef = useRef(null);

  const [logoPreview, setLogoPreview] = useState(theme?.logo || null);
  const [loginBgPreview, setLoginBgPreview] = useState(theme?.loginBg || null);
  const [landingBgPreview, setLandingBgPreview] = useState(theme?.landingBg || null);

  const [logoFile, setLogoFile] = useState(null);
  const [loginBgFile, setLoginBgFile] = useState(null);
  const [landingBgFile, setLandingBgFile] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('landing');

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
      setLandingTitle(theme.landingTitle || '');
      setLandingDescription(theme.landingDescription || '');
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

  useEffect(() => {
    const fetchMetaAndData = async () => {
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
      } finally {
        // Matikan loading setelah data tertarik (Bisa ditambahkan delay setTimeout sedikit jika proses api terlalu cepat)
        setIsLoading(false);
      }
    };
    
    fetchMetaAndData();
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
    if (!metaDescription || metaDescription.trim() === '') {
      alertError('Meta deskripsi wajib diisi.');
      return; 
    }
    const confirm = await alertConfirm("Terapkan perubahan tampilan ini ke seluruh sistem?");
    if (!confirm.isConfirmed) return;

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('nama_sekolah', namaSekolah);
      formData.append('primary_color', primaryColor);
      formData.append('secondary_color', secondaryColor);
      formData.append('third_color', thirdColor);
      formData.append('landing_title', landingTitle);
      formData.append('landing_description', landingDescription);
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

      const metaDataForm = new FormData();
      if (metaTitle) metaDataForm.append('title', metaTitle);
      if (metaDescription) metaDataForm.append('description', metaDescription);
      if (metaIconFile) metaDataForm.append('icon', metaIconFile);

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

  const handleReset = async () => {
    const confirm = await alertConfirm(
      "Yakin ingin mereset semua pengaturan ke default? Semua customisasi termasuk logo dan background akan dihapus."
    );
    if (!confirm.isConfirmed) return;

    setIsSaving(true);

    try {
      await adminApi.resetPengaturanTampilan();
      await refreshFromApi();
      setLogoFile(null);
      setLoginBgFile(null);
      setLandingBgFile(null);
      setMetaIconFile(null);
      alertSuccess("Pengaturan berhasil direset ke default.");
    } catch (error) {
      alertError(error.response?.data?.message || "Gagal mereset pengaturan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKembali = async () => {
    const confirm = await alertConfirm(
      "Yakin ingin mengembalikan ke versi sebelumnya? Perubahan terakhir akan dibatalkan."
    );
    if (!confirm.isConfirmed) return;

    setIsSaving(true);

    try {
      await adminApi.revertPengaturanTampilan();
      await refreshFromApi();
      setLogoFile(null);
      setLoginBgFile(null);
      setLandingBgFile(null);
      setMetaIconFile(null);
      alertSuccess("Pengaturan berhasil dikembalikan ke versi sebelumnya.");
    } catch (error) {
      if (error.response?.status === 404) {
        alertError("Tidak ada riwayat perubahan yang dapat dikembalikan.");
      } else {
        alertError(error.response?.data?.message || "Gagal mengembalikan perubahan.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const openPreview = (tabName) => {
    setActivePreviewTab(tabName);
    setShowPreviewModal(true);
  };

  // Render Skeleton jika sedang proses fetching awal
  if (isLoading) {
    return <SkeletonPengaturan />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full relative">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative z-10">
        <div className="p-6 md:p-8 space-y-12">

          <MetaDataSection 
            metaTitle={metaTitle} setMetaTitle={setMetaTitle}
            metaDescription={metaDescription} setMetaDescription={setMetaDescription}
            metaIconPreview={metaIconPreview} setMetaIconPreview={setMetaIconPreview}
            setMetaIconFile={setMetaIconFile} metaIconInputRef={metaIconInputRef}
            openPreview={openPreview} handleImageChange={handleImageChange}
          />

          <IdentitySection 
            namaSekolah={namaSekolah} setNamaSekolah={setNamaSekolah}
            logoPreview={logoPreview} setLogoPreview={setLogoPreview} setLogoFile={setLogoFile} logoInputRef={logoInputRef}
            loginBgPreview={loginBgPreview} setLoginBgPreview={setLoginBgPreview} setLoginBgFile={setLoginBgFile} loginBgInputRef={loginBgInputRef}
            openPreview={openPreview} handleImageChange={handleImageChange}
          />

          <LandingPageSection 
            landingTitle={landingTitle} setLandingTitle={setLandingTitle}
            landingDescription={landingDescription} setLandingDescription={setLandingDescription}
            landingBgPreview={landingBgPreview} setLandingBgPreview={setLandingBgPreview} setLandingBgFile={setLandingBgFile} landingBgInputRef={landingBgInputRef}
            openPreview={openPreview} handleImageChange={handleImageChange}
          />

          <ThemeColorSection 
            primaryColor={primaryColor} setPrimaryColor={setPrimaryColor} primaryPickerRef={primaryPickerRef}
            secondaryColor={secondaryColor} setSecondaryColor={setSecondaryColor} secondaryPickerRef={secondaryPickerRef}
            thirdColor={thirdColor} setThirdColor={setThirdColor} thirdPickerRef={thirdPickerRef}
            handleColorTextChange={handleColorTextChange}
          />

          <FooterModalSection 
            deskripsiFooter={deskripsiFooter} setDeskripsiFooter={setDeskripsiFooter}
            emailKontak={emailKontak} setEmailKontak={setEmailKontak}
            webKontak={webKontak} setWebKontak={setWebKontak}
            telpKontak={telpKontak} setTelpKontak={setTelpKontak}
            teksPrivasi={teksPrivasi} setTeksPrivasi={setTeksPrivasi}
            teksLayanan={teksLayanan} setTeksLayanan={setTeksLayanan}
            teksDukungan={teksDukungan} setTeksDukungan={setTeksDukungan}
            openPreview={openPreview}
          />

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button 
            onClick={handleKembali} 
            disabled={isSaving} 
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 hover:text-red-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw size={16} /> Kembalikan Perubahan
          </button>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button 
              onClick={handleReset} 
              disabled={isSaving} 
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCcw size={16} /> Batal / Reset
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="w-full sm:w-auto px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={16} />}
              {isSaving ? 'Menerapkan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>

      <TampilanPreview
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        activeTab={activePreviewTab}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        thirdColor={thirdColor}
        logo={logoPreview}
        loginBg={loginBgPreview}
        landingBg={landingBgPreview}
        namaSekolah={namaSekolah}
        metaTitle={metaTitle}
        metaDescription={metaDescription}
        metaIcon={metaIconPreview}
        landingTitle={landingTitle} 
        landingDescription={landingDescription} 
        deskripsiFooter={deskripsiFooter}
        emailKontak={emailKontak}
        webKontak={webKontak}
        telpKontak={telpKontak}
        teksPrivasi={teksPrivasi}
        teksLayanan={teksLayanan}
        teksDukungan={teksDukungan}
      />
    </div>
  );
}