import React, { useState, useEffect } from 'react';
import { Briefcase, GraduationCap, Store, Search, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import SmoothDropdown from '../../components/admin/SmoothDropdown';
import InputDropdownEdit from '../../components/InputDropdownEdit';
import YearsInput from '../../components/YearsInput';
import LocationSelector from '../../components/LocationSelector';
import UniversitySelector from '../../components/UniversitasSelector';
import { masterDataApi } from '../../api/masterData';

export default function Step3Status({ onBack, formData, updateFormData, onSubmit, loading }) {
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
  const [pekerjaanList, setPekerjaanList] = useState([]);

  // State Form
  const [pekerjaan, setPekerjaan] = useState(formData.pekerjaan || { posisi: '', nama_perusahaan: '', id_kota: '', jalan: '' });
  const [universitas, setUniversitas] = useState(formData.universitas || { nama_universitas: '', id_jurusan_kuliah: '', jalur_masuk: '', jenjang: '' });
  const [wirausaha, setWirausaha] = useState(formData.wirausaha || { id_bidang: '', nama_usaha: '' });
  
  const [tahunMulai, setTahunMulai] = useState(formData.tahun_mulai || '');
  const [tahunSelesai, setTahunSelesai] = useState(formData.tahun_selesai || '');
  
  // STATE BARU: Untuk mengecek apakah masih berlangsung (Saat ini)
  const [isSaatIni, setIsSaatIni] = useState(!formData.tahun_selesai);

  // Fetch data master
  useEffect(() => {
    masterDataApi.getStatus().then((res) => setStatusList(res.data.data || []));
    masterDataApi.getBidangUsaha().then((res) => {
      const data = res.data.data || [];
      setBidangUsahaList(data.map((b) => b.nama_bidang || b.nama));
      const map = {};
      data.forEach((b) => { map[b.nama_bidang || b.nama] = b.id; });
      setBidangUsahaMap(map);
    });
    // Fetch perusahaan names for dropdown
   masterDataApi.getPerusahaan()
      .then((res) => {
        // 👇 PERBAIKAN DI SINI: tambahkan ?.data?.data untuk format paginasi
        const rawData = res.data?.data?.data || res.data?.data || [];
        
        const names = Array.isArray(rawData)
          ? rawData.map((p) => p.nama_perusahaan || p.nama || p).filter(Boolean)
          : [];
        setPerusahaanList(names);
      })
      .catch((err) => {
        console.error("Gagal mengambil data perusahaan", err);
        setPerusahaanList([]);
      });
  }, []);

  // 3. FUNGSI PENYIMPANAN OTOMATIS
  useEffect(() => {
    const statusNameMap = { 'Mencari Kerja': 'Belum Bekerja' };
    const backendName = statusNameMap[selectedStatus] || selectedStatus;
    const matched = statusList.find((s) => (s.nama_status || s.nama) === backendName);
    
    const updates = {
      id_status: matched?.id || formData.id_status,
      tahun_mulai: tahunMulai,
      // Jika "Saat Ini" dicentang, kita kirimkan string kosong atau null sesuai kebutuhan backend
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
      
      {/* Checkbox "Masih Berlangsung" dengan warna kustom #3C5759 */}
      <label className="flex items-center gap-2 pt-1.5 text-[11px] text-secondary cursor-pointer hover:text-primary transition-colors w-fit">
        <input
          type="checkbox"
          checked={isSaatIni}
          onChange={(e) => {
            setIsSaatIni(e.target.checked);
            if (e.target.checked) setTahunSelesai(''); // Reset tahun jika dicentang
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
            {/* CENTANG KARTU DENGAN WARNA #3C5759 */}
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
              label="Pekerjaan Sekarang"
              value={pekerjaan.posisi}
              options={["UI/UX", "DevOps", "Cloud Engginering", "Karyawan"]}
              placeholder="Masukkan nama pekerjaan"
              isRequired={true}
              onSelect={(val) => setPekerjaan({ ...pekerjaan, posisi: val })}
            />
            <InputDropdownEdit
              label="Nama Perusahaan"
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
            
            {/* Panggil fungsi Helper Tahun Selesai */}
            {renderTahunSelesai("Tahun Selesai")}

            <div className='md:col-span-2 mt-2'>
              <LocationSelector
                onCitySelect={(cityId) => setPekerjaan({ ...pekerjaan, id_kota: cityId })}
              />
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
            
            {/* Panggil fungsi Helper Tahun Selesai */}
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
            
            {/* Panggil fungsi Helper Tahun Selesai */}
            {renderTahunSelesai("Tahun Berakhir")}
          </div>
        )}

        {/* MENCARI KERJA */}
        {selectedStatus === 'Mencari Kerja' && (
          <p className="text-center text-sm text-third py-4 italic">Semangat! Tetaplah berusaha dan tingkatkan skill Anda.</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex justify-between">
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
          onClick={onSubmit}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-xs md:text-sm font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Selesai</>}
        </button>
      </div>
    </div>
  );
}