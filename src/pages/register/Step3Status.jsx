import React, { useState, useEffect } from 'react';
import { Briefcase, GraduationCap, Store, Search, CheckCircle, ArrowLeft, Loader2, X, RefreshCcw, ShieldCheck } from 'lucide-react';
import SmoothDropdown from '../../components/admin/SmoothDropdown';
import InputDropdownEdit from '../../components/InputDropdownEdit';
import YearsInput from '../../components/YearsInput';
import UniversitySelector from '../../components/UniversitasSelector';
import { masterDataApi } from '../../api/masterData';
import { authApi } from '../../api/auth';

export default function Step3Status({ onBack, formData, updateFormData, onSubmit, loading }) {
  // State untuk modal CAPTCHA
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);

  // 1. Sinkronisasi Status Awal dari formData
  const getInitialStatus = () => {
    if (formData.pekerjaan) return 'Bekerja';
    if (formData.universitas) return 'Kuliah';
    if (formData.wirausaha) return 'Wirausaha';
    if (formData.id_status && !formData.pekerjaan && !formData.universitas && !formData.wirausaha) return 'Mencari Kerja';
    return 'Bekerja';
  };

  const [selectedStatus, setSelectedStatus] = useState(getInitialStatus);
  const [statusList, setStatusList] = useState([]);
  const [bidangUsahaList, setBidangUsahaList] = useState([]);
  const [bidangUsahaMap, setBidangUsahaMap] = useState({});
  const [perusahaanList, setPerusahaanList] = useState([]);
  
  // STATE BARU: Untuk Provinsi dan Kota
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [loadingProvinsi, setLoadingProvinsi] = useState(false);
  const [loadingKota, setLoadingKota] = useState(false);

  // State Form
  const [pekerjaan, setPekerjaan] = useState(formData.pekerjaan || { 
    posisi: '', nama_perusahaan: '', id_provinsi: '', id_kota: '', jalan: '', 
    tahun_mulai: '', tahun_selesai: '', is_saat_ini: true 
  });

  const [universitas, setUniversitas] = useState(formData.universitas || { 
    nama_universitas: '', id_jurusan_kuliah: '', jalur_masuk: '', jenjang: '', 
    tahun_mulai: '', tahun_selesai: '', is_saat_ini: true 
  });

  const [wirausaha, setWirausaha] = useState(formData.wirausaha || { 
    id_bidang: '', nama_usaha: '', 
    tahun_mulai: '', tahun_selesai: '', is_saat_ini: true 
  });
  
  const [tahunMulai, setTahunMulai] = useState(formData.tahun_mulai || '');
  const [tahunSelesai, setTahunSelesai] = useState(formData.tahun_selesai || '');
  
  // State untuk mengecek apakah masih berlangsung (Saat ini)
  const [isSaatIni, setIsSaatIni] = useState(!formData.tahun_selesai);

  const loadCaptcha = async (isRefresh = false) => {
    setCaptchaLoading(true);
    try {
      const res = isRefresh
        ? await authApi.refreshCaptcha()
        : await authApi.generateCaptcha();

      setCaptchaImage(res?.data?.captcha?.image || '');
      updateFormData({
        captcha_token: '',
        captcha_key: res?.data?.captcha?.key || '',
      });
    } catch (err) {
      console.error('Gagal memuat captcha register:', err);
      setCaptchaImage('');
      updateFormData({ captcha_token: '', captcha_key: '' });
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    if (showCaptchaModal) {
      loadCaptcha(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCaptchaModal]);

  // 2. Fetch data master (Status, Bidang Usaha, Perusahaan, & Provinsi)
  useEffect(() => {
    masterDataApi.getStatus().then((res) => setStatusList(res.data.data || []));
    
    masterDataApi.getBidangUsaha().then((res) => {
      const data = res.data.data || [];
      setBidangUsahaList(data.map((b) => b.nama_bidang || b.nama));
      const map = {};
      data.forEach((b) => { map[b.nama_bidang || b.nama] = b.id; });
      setBidangUsahaMap(map);
    });

    masterDataApi.getPerusahaan()
      .then((res) => {
        const rawData = res.data?.data?.data || res.data?.data || [];
        const names = Array.isArray(rawData)
          ? rawData.map((p) => p.nama_perusahaan || p.nama || p).filter(Boolean)
          : [];
        setPerusahaanList(names);
      })
      .catch((err) => console.error("Gagal mengambil data perusahaan", err));

    // Fetch Provinsi
    setLoadingProvinsi(true);
    masterDataApi.getProvinsi()
      .then((res) => setProvinsiList(res.data?.data || res.data || []))
      .catch((err) => console.error("Gagal mengambil provinsi", err))
      .finally(() => setLoadingProvinsi(false));
  }, []);

  // Fetch Kota berdasarkan Provinsi yang dipilih
  useEffect(() => {
    if (!pekerjaan.id_provinsi) {
      setKotaList([]);
      return;
    }
    setLoadingKota(true);
    masterDataApi.getKota(pekerjaan.id_provinsi)
      .then((res) => setKotaList(res.data?.data || res.data || []))
      .catch((err) => console.error("Gagal mengambil kota", err))
      .finally(() => setLoadingKota(false));
  }, [pekerjaan.id_provinsi]);

  // 3. FUNGSI PENYIMPANAN OTOMATIS
  useEffect(() => {
    const statusNameMap = { 'Mencari Kerja': 'Belum Bekerja' };
    const backendName = statusNameMap[selectedStatus] || selectedStatus;
    const matched = statusList.find((s) => (s.nama_status || s.nama) === backendName);
    
    const activeData = selectedStatus === 'Bekerja' ? pekerjaan : selectedStatus === 'Kuliah' ? universitas : wirausaha;

    const updates = {
      id_status: matched?.id || formData.id_status,
      tahun_mulai: activeData?.tahun_mulai || "",
      tahun_selesai: activeData?.is_saat_ini ? "" : activeData?.tahun_selesai,
      pekerjaan: selectedStatus === 'Bekerja' ? pekerjaan : null,
      universitas: selectedStatus === 'Kuliah' ? universitas : null,
      wirausaha: selectedStatus === 'Wirausaha' ? wirausaha : null,
    };
    updateFormData(updates);
  }, [selectedStatus, pekerjaan, universitas, wirausaha, statusList]);

  const statusOptions = [
    { id: 'Bekerja', label: 'Bekerja', sub: '(Working)', icon: Briefcase },
    { id: 'Kuliah', label: 'Kuliah', sub: '(Studying)', icon: GraduationCap },
    { id: 'Wirausaha', label: 'Wirausaha', sub: '(Entrepreneur)', icon: Store },
    { id: 'Mencari Kerja', label: 'Mencari Kerja', sub: '(Unemployed)', icon: Search },
  ];

  const renderTahunDinamis = (type, label) => {
    const data = type === 'Bekerja' ? pekerjaan : type === 'Kuliah' ? universitas : wirausaha;
    const setData = type === 'Bekerja' ? setPekerjaan : type === 'Kuliah' ? setUniversitas : setWirausaha;

    // Ambil tahun sekarang untuk batas maksimal tahun mulai
    const tahunSekarang = new Date().getFullYear();

    return (
      <>
        {/* Kolom Kiri: Tahun Mulai */}
        <div className="relative z-[60]">
          <YearsInput
            label={`Tahun Mulai ${label} *`}
            value={data.tahun_mulai}
            // Batasi tahun mulai agar tidak bisa memilih masa depan
            maxYear={tahunSekarang} 
            onSelect={(val) => {
              // Jika tahun mulai baru lebih besar dari tahun selesai yang sudah ada, reset tahun selesai
              const updateData = { ...data, tahun_mulai: val };
              if (data.tahun_selesai && parseInt(val) > parseInt(data.tahun_selesai)) {
                updateData.tahun_selesai = "";
              }
              setData(updateData);
            }}
            isRequired={true}
          />
        </div>

        {/* Kolom Kanan: Tahun Selesai + Checkbox */}
        <div className="relative z-[50]">
          {!data.is_saat_ini ? (
            <YearsInput
              label={`Tahun Selesai ${label}`}
              value={data.tahun_selesai}
              // Batasi tahun selesai agar minimal sama dengan tahun mulai
              minYear={data.tahun_mulai ? parseInt(data.tahun_mulai) : undefined}
              onSelect={(val) => setData({ ...data, tahun_selesai: val })}
            />
          ) : (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-primary uppercase">{`Tahun Selesai ${label}`}</label>
              <div className="p-2.5 bg-gray-100 border border-fourth rounded-xl text-sm text-gray-400 cursor-not-allowed">
                Sedang Berlangsung
              </div>
            </div>
          )}
          <label className="flex items-center gap-2 mt-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={data.is_saat_ini}
              onChange={(e) => setData({ 
                ...data, 
                is_saat_ini: e.target.checked, 
                tahun_selesai: e.target.checked ? "" : data.tahun_selesai 
              })}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <span className="text-[10px] font-bold text-primary uppercase">Masih berlangsung</span>
          </label>
        </div>
      </>
    );
  };

  // FUNGSI BARU: Simpan data secara paksa sebelum kembali ke halaman sebelumnya
  // Di dalam Step3Status.jsx, perbarui fungsi handleBack menjadi:

  const handleBack = () => {
    const statusNameMap = { 'Mencari Kerja': 'Belum Bekerja' };
    const backendName = statusNameMap[selectedStatus] || selectedStatus;
    const matched = statusList.find((s) => (s.nama_status || s.nama) === backendName);
    
    // Ambil data dari objek yang sedang aktif
    const activeData = selectedStatus === 'Bekerja' ? pekerjaan : 
                      selectedStatus === 'Kuliah' ? universitas : wirausaha;

    const updates = {
      id_status: matched?.id || formData.id_status,
      // Gunakan tahun dari data aktif, bukan dari state tahunMulai yang lama
      tahun_mulai: activeData?.tahun_mulai || "",
      tahun_selesai: activeData?.is_saat_ini ? "" : activeData?.tahun_selesai,
      pekerjaan: selectedStatus === 'Bekerja' ? pekerjaan : null,
      universitas: selectedStatus === 'Kuliah' ? universitas : null,
      wirausaha: selectedStatus === 'Wirausaha' ? wirausaha : null,
    };
    
    updateFormData(updates);
    onBack(); 
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h3 className="font-bold text-primary mb-1">Seperti apa karir anda sekarang? <span className="text-red-500">*</span></h3>
      </div>

      {/* Cards Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setSelectedStatus(option.id)}
            className={`relative p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedStatus === option.id
              ? 'border-primary bg-fourth/20 border-dashed'
              : 'border-fourth border-dashed hover:border-primary/40'
            }`}
          >
            {selectedStatus === option.id && (
              <div className="absolute top-2 right-2 text-primary">
                <CheckCircle size={16} fill="currentColor" className="text-white fill-primary" />
              </div>
            )}
            
            <option.icon size={28} className={selectedStatus === option.id ? 'text-primary' : 'text-third'} />
            <div className="text-center">
              <p className={`text-sm font-bold ${selectedStatus === option.id ? 'text-primary' : 'text-primary'}`}>{option.label}</p>
              <p className="text-[10px] text-third">{option.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Dynamic Form */}
      <div className="p-4 md:p-8 border border-third border-dashed rounded-2xl bg-gray-50/50">
        
        {/* FORM BEKERJA */}
        {selectedStatus === 'Bekerja' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            
            <div className="relative z-[80]">
              <InputDropdownEdit
                label="Pekerjaan Sekarang *"
                value={pekerjaan.posisi}
                options={["UI/UX", "DevOps", "Cloud Engineering", "Karyawan"]}
                placeholder="Masukkan nama pekerjaan"
                isRequired={true}
                onChange={(val) => setPekerjaan(prev => ({ ...prev, posisi: val }))}
                onSelect={(val) => setPekerjaan(prev => ({ ...prev, posisi: val }))}
              />
            </div>
            
            <div className="relative z-[70]">
              <InputDropdownEdit
                label="Nama Perusahaan *"
                value={pekerjaan.nama_perusahaan}
                options={perusahaanList}
                placeholder="Ketik atau pilih nama perusahaan"
                isRequired={true}
                onChange={(val) => setPekerjaan(prev => ({ ...prev, nama_perusahaan: val }))}
                onSelect={(val) => setPekerjaan(prev => ({ ...prev, nama_perusahaan: val }))}
              />
            </div>
            
            {renderTahunDinamis('Bekerja', 'Kerja')}

            {/* AREA LOKASI (PROVINSI & KOTA) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2 mt-4 relative z-[40]">
              {/* ... biarkan provinsi dan kota seperti sebelumnya ... */}
              <div className="w-full relative z-[45]">
                <SmoothDropdown
                  label="Provinsi *"
                  isSearchable={true}
                  placeholder={loadingProvinsi ? "Memuat..." : "Pilih Provinsi"}
                  options={provinsiList.map(p => p.nama)}
                  value={provinsiList.find(p => String(p.id) === String(pekerjaan.id_provinsi))?.nama || ""}
                  onSelect={(namaProv) => {
                    const prov = provinsiList.find(p => p.nama === namaProv);
                    if (prov) {
                      setPekerjaan(prev => ({ ...prev, id_provinsi: String(prov.id), id_kota: '' }));
                    }
                  }}
                />
              </div>

              <div className="w-full relative z-[40]">
                <SmoothDropdown
                  label="Kota / Kabupaten *"
                  isSearchable={true}
                  placeholder={!pekerjaan.id_provinsi ? "Pilih provinsi dulu" : loadingKota ? "Memuat..." : "Pilih Kota"}
                  options={kotaList.map(k => k.nama)}
                  value={kotaList.find(k => String(k.id) === String(pekerjaan.id_kota))?.nama || ""}
                  onSelect={(namaKota) => {
                    const kota = kotaList.find(k => k.nama === namaKota);
                    if (kota) {
                      setPekerjaan(prev => ({ ...prev, id_kota: String(kota.id) }));
                    }
                  }}
                />
              </div>
            </div>
            
          </div>
        )}

        {/* FORM KULIAH */}
        {selectedStatus === 'Kuliah' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="md:col-span-2 relative z-[80]">
              <UniversitySelector
                univValue={universitas.nama_universitas} 
                jurusanValue={universitas.id_jurusan_kuliah}
                onUnivSelect={(val) => setUniversitas(prev => ({ ...prev, nama_universitas: val }))}
                onJurusanSelect={(val) => setUniversitas(prev => ({ ...prev, id_jurusan_kuliah: val }))}
                onChangeUniv={(val) => setUniversitas(prev => ({ ...prev, nama_universitas: val }))}
                onChangeJurusan={(val) => setUniversitas(prev => ({ ...prev, id_jurusan_kuliah: val }))}
              />
            </div>

            <div className="relative z-[70]">
              <SmoothDropdown
                label="Jalur Masuk Kuliah *"
                value={universitas.jalur_masuk}
                options={["SNBP", "SNBT", "Mandiri", "Beasiswa"]}
                isRequired={true}
                onSelect={(val) => setUniversitas({ ...universitas, jalur_masuk: val })}
              />
            </div>

            <div className="relative z-[60]">
              <SmoothDropdown
                label="Jenjang Kuliah *"
                value={universitas.jenjang}
                options={["D3", "D4", "S1", "S2", "S3"]}
                isRequired={true}
                onSelect={(val) => setUniversitas({ ...universitas, jenjang: val })}
              />
            </div>

            {/* Panggil fungsi tahun di sini agar sejajar Kiri-Kanan */}
            {renderTahunDinamis('Kuliah', 'Kuliah')}
          </div>
        )}

        {/* FORM WIRAUSAHA */}
        {selectedStatus === 'Wirausaha' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-1 relative z-[70]">
              <label className="text-[11px] font-bold text-primary uppercase">Nama Usaha *</label>
              <input
                type="text"
                value={wirausaha.nama_usaha}
                onChange={(e) => setWirausaha({ ...wirausaha, nama_usaha: e.target.value })}
                className="mt-2 w-full p-3 bg-white border-2 border-fourth rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                placeholder="Masukkan nama usaha"
              />
            </div>

            <div className="relative z-[60]">
              <SmoothDropdown
                label="Bidang Usaha *"
                value={Object.keys(bidangUsahaMap).find(key => bidangUsahaMap[key] === wirausaha.id_bidang) || wirausaha.id_bidang}
                options={bidangUsahaList}
                isRequired={true}
                onSelect={(val) => setWirausaha({ ...wirausaha, id_bidang: bidangUsahaMap[val] || val })}
              />
            </div>

            {/* Panggil fungsi tahun di sini agar sejajar Kiri-Kanan */}
            {renderTahunDinamis('Wirausaha', 'Usaha')}
          </div>
        )}

        {/* MENCARI KERJA */}
        {selectedStatus === 'Mencari Kerja' && (
          <p className="text-center text-sm text-third py-4 italic">Semangat! Tetaplah berusaha dan tingkatkan skill Anda.</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 relative z-10">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-4 md:px-6 py-2 border border-fourth rounded-xl text-xs md:text-sm font-bold text-primary hover:bg-fourth transition-all cursor-pointer"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
         <button
            type="button"
            disabled={loading}
            onClick={() => setShowCaptchaModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-xs md:text-sm font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Memproses Data...</span>
              </>
            ) : (
              <>
                <CheckCircle size={18} /> 
                <span>Selesai</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal CAPTCHA */}
      {showCaptchaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
            {/* Close button */}
            <button
              onClick={() => {
                setShowCaptchaModal(false);
                updateFormData({ captcha_token: '', captcha_key: '' });
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold text-primary mb-2">Verifikasi CAPTCHA</h3>
              <p className="text-sm text-gray-600">Silakan masukkan kode captcha sebelum melanjutkan pendaftaran</p>
            </div>

            {/* Image Captcha */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-[150px] rounded-md bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                  {captchaLoading ? (
                    <Loader2 size={18} className="animate-spin text-gray-400" />
                  ) : captchaImage ? (
                    <img src={captchaImage} alt="Captcha" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-400">Captcha gagal dimuat</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => loadCaptcha(true)}
                  disabled={loading || captchaLoading}
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <RefreshCcw size={14} className={captchaLoading ? "animate-spin" : ""} />
                  Muat Ulang
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-third">
                  <ShieldCheck size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Masukkan kode captcha"
                  value={formData.captcha_token || ''}
                  onChange={(e) => updateFormData({ captcha_token: e.target.value })}
                  className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                  disabled={loading || captchaLoading}
                />
              </div>

              <p className="text-[11px] text-gray-500">
                Captcha hanya berlaku sekali percobaan. Jika gagal, gunakan captcha yang baru.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={!formData.captcha_token || !formData.captcha_key || loading || captchaLoading || !captchaImage}
              onClick={() => {
                setShowCaptchaModal(false);
                onSubmit();
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <CheckCircle size={18} /> Lanjutkan Pendaftaran
                </>
              )}
            </button>

            {!formData.captcha_token && (
              <p className="text-center text-xs text-gray-500 mt-3">
                Masukkan kode captcha terlebih dahulu
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}