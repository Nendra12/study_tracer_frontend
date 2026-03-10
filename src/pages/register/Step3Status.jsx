import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, GraduationCap, Store, Search, CheckCircle, ArrowLeft, Loader2, X } from 'lucide-react';
import SmoothDropdown from '../../components/admin/SmoothDropdown';
import InputDropdownEdit from '../../components/InputDropdownEdit';
import YearsInput from '../../components/YearsInput';
import UniversitySelector from '../../components/UniversitasSelector';
import { masterDataApi } from '../../api/masterData';
import ReCAPTCHA from 'react-google-recaptcha';

export default function Step3Status({ onBack, formData, updateFormData, onSubmit, loading }) {
  // State untuk modal CAPTCHA
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const recaptchaRef = useRef(null);
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
  // Tambahkan id_provinsi ke dalam inisial state pekerjaan agar dropdown berfungsi
  const [pekerjaan, setPekerjaan] = useState(formData.pekerjaan || { posisi: '', nama_perusahaan: '', id_provinsi: '', id_kota: '', jalan: '' });
  const [universitas, setUniversitas] = useState(formData.universitas || { nama_universitas: '', id_jurusan_kuliah: '', jalur_masuk: '', jenjang: '' });
  const [wirausaha, setWirausaha] = useState(formData.wirausaha || { id_bidang: '', nama_usaha: '' });
  
  const [tahunMulai, setTahunMulai] = useState(formData.tahun_mulai || '');
  const [tahunSelesai, setTahunSelesai] = useState(formData.tahun_selesai || '');
  
  // State untuk mengecek apakah masih berlangsung (Saat ini)
  const [isSaatIni, setIsSaatIni] = useState(!formData.tahun_selesai);

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
    
    const updates = {
      id_status: matched?.id || formData.id_status,
      tahun_mulai: tahunMulai,
      tahun_selesai: isSaatIni ? "" : tahunSelesai,
      pekerjaan: selectedStatus === 'Bekerja' ? pekerjaan : null,
      universitas: selectedStatus === 'Kuliah' ? universitas : null,
      wirausaha: selectedStatus === 'Wirausaha' ? wirausaha : null,
    };
    updateFormData(updates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, pekerjaan, universitas, wirausaha, tahunMulai, tahunSelesai, isSaatIni, statusList]);

  const statusOptions = [
    { id: 'Bekerja', label: 'Bekerja', sub: '(Working)', icon: Briefcase },
    { id: 'Kuliah', label: 'Kuliah', sub: '(Studying)', icon: GraduationCap },
    { id: 'Wirausaha', label: 'Wirausaha', sub: '(Entrepreneur)', icon: Store },
    { id: 'Mencari Kerja', label: 'Mencari Kerja', sub: '(Unemployed)', icon: Search },
  ];

  // HELPER COMPONENT: Untuk merender inputan Tahun Selesai & Checkbox
  const renderTahunSelesai = (label) => (
    <div className="space-y-1">
      {!isSaatIni ? (
        <YearsInput
          label={label}
          text='(opsional)'
          value={tahunSelesai}
          onSelect={(val) => setTahunSelesai(val)}
        />
      ) : (
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-secondary uppercase">
            {label} <span className="text-gray-400 normal-case font-normal">(opsional)</span>
          </label>
          <div className="w-full px-3 py-2.5 bg-gray-100 border border-fourth rounded-xl text-sm text-gray-500 font-medium cursor-not-allowed">
            Sedang Berlangsung 
          </div>
        </div>
      )}
      
      <label className="flex items-center gap-2 pt-1.5 text-[11px] text-secondary cursor-pointer hover:text-primary transition-colors w-fit">
        <input
          type="checkbox"
          checked={isSaatIni}
          onChange={(e) => {
            setIsSaatIni(e.target.checked);
            if (e.target.checked) setTahunSelesai(''); 
          }}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer transition-all"
        />
        <span className="font-bold">Masih berlangsung (Saat ini)</span>
      </label>
    </div>
  );

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
              <p className={`text-sm font-bold ${selectedStatus === option.id ? 'text-primary' : 'text-secondary'}`}>{option.label}</p>
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
            <InputDropdownEdit
              label="Pekerjaan Sekarang *"
              value={pekerjaan.posisi}
              options={["UI/UX", "DevOps", "Cloud Engineering", "Karyawan"]}
              placeholder="Masukkan nama pekerjaan"
              isRequired={true}
              onSelect={(val) => setPekerjaan({ ...pekerjaan, posisi: val })}
            />
            <InputDropdownEdit
              label="Nama Perusahaan *"
              value={pekerjaan.nama_perusahaan}
              options={perusahaanList}
              placeholder="Ketik atau pilih nama perusahaan"
              isRequired={true}
              onSelect={(val) => setPekerjaan({ ...pekerjaan, nama_perusahaan: val })}
            />
            <YearsInput
              label="Tahun Masuk"
              isRequired={true}
              value={tahunMulai}
              onSelect={(val) => setTahunMulai(val)}
            />
            
            {renderTahunSelesai("Tahun Selesai")}

            {/* AREA LOKASI (PROVINSI & KOTA) - Tampilan Baru */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2 mt-4 relative z-50">
              <div className="w-full">
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

              <div className="w-full">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <UniversitySelector
                onUnivSelect={(val) => setUniversitas(prev => ({ ...prev, nama_universitas: val }))}
                onJurusanSelect={(val) => setUniversitas(prev => ({ ...prev, id_jurusan_kuliah: val }))}
              />
            </div>
            <SmoothDropdown
              label="Jalur Masuk Kuliah"
              value={universitas.jalur_masuk}
              options={["SNBP", "SNBT", "Mandiri", "Beasiswa"]}
              isRequired={true}
              onSelect={(val) => setUniversitas({ ...universitas, jalur_masuk: val })}
            />
            <SmoothDropdown
              label="Jenjang Kuliah"
              value={universitas.jenjang}
              options={["D3", "D4", "S1", "S2", "S3"]}
              isRequired={true}
              onSelect={(val) => setUniversitas({ ...universitas, jenjang: val })}
            />
            <YearsInput label="Tahun Masuk" value={tahunMulai} onSelect={(val) => setTahunMulai(val)} isRequired={true} />
            {renderTahunSelesai("Tahun Lulus")}
          </div>
        )}

        {/* FORM WIRAUSAHA */}
        {selectedStatus === 'Wirausaha' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-secondary uppercase">Nama Usaha *</label>
              <input
                type="text"
                value={wirausaha.nama_usaha}
                onChange={(e) => setWirausaha({ ...wirausaha, nama_usaha: e.target.value })}
                className="mt-2 w-full p-3 bg-white border border-fourth rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <SmoothDropdown
              label="Bidang Usaha"
              value={Object.keys(bidangUsahaMap).find(key => bidangUsahaMap[key] === wirausaha.id_bidang) || wirausaha.id_bidang}
              options={bidangUsahaList}
              isRequired={true}
              onSelect={(val) => setWirausaha({ ...wirausaha, id_bidang: bidangUsahaMap[val] || val })}
            />
            <YearsInput label="Tahun Mulai" value={tahunMulai} onSelect={(val) => setTahunMulai(val)} isRequired={true} />
            {renderTahunSelesai("Tahun Berakhir")}
          </div>
        )}

        {/* MENCARI KERJA */}
        {selectedStatus === 'Mencari Kerja' && (
          <p className="text-center text-sm text-third py-4 italic">Semangat! Tetaplah berusaha dan tingkatkan skill Anda.</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 md:px-6 py-2 border border-fourth rounded-xl text-xs md:text-sm font-bold text-secondary hover:bg-fourth transition-all cursor-pointer"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setShowCaptchaModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-xs md:text-sm font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Selesai</>}
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
                updateFormData({ captcha_token: '' });
                if (recaptchaRef.current) {
                  recaptchaRef.current.reset();
                }
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold text-primary mb-2">Verifikasi CAPTCHA</h3>
              <p className="text-sm text-gray-600">Silakan selesaikan verifikasi keamanan sebelum melanjutkan pendaftaran</p>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center mb-6">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''}
                onChange={(token) => {
                  updateFormData({ captcha_token: token });
                }}
                onExpired={() => {
                  updateFormData({ captcha_token: '' });
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={!formData.captcha_token || loading}
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
                Centang kotak "I'm not a robot" terlebih dahulu
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}