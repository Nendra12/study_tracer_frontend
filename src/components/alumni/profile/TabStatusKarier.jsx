import React, { useState } from 'react';
import { Briefcase, Plus, X, Loader2, Save, Clock, CheckCircle2, AlertCircle, Edit2, Lock, MapPin } from 'lucide-react';
import { alumniApi } from '../../../api/alumni';
import { masterDataApi } from '../../../api/masterData';
import SmoothDropdown from '../../admin/SmoothDropdown';
import InputDropdownEdit from '../../InputDropdownEdit';
import UniversitySelector from '../../UniversitasSelector';
import LocationPicker from '../../common/LocationPicker';
import { toastError, toastWarning } from '../../../utilitis/alert';

export default function TabStatusKarier({ profile, onRefresh, onShowSuccess, isVerified }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEndDate, setEditingEndDate] = useState(false);
  const [endDateValue, setEndDateValue] = useState('');

  const [statusList, setStatusList] = useState([]);
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaPekerjaanList, setKotaPekerjaanList] = useState([]);
  const [kotaKuliahList, setKotaKuliahList] = useState([]);
  const [kotaUsahaList, setKotaUsahaList] = useState([]);
  const [bidangUsahaList, setBidangUsahaList] = useState([]);
  const [jurusanKuliahList, setJurusanKuliahList] = useState([]);
  const [loadingKotaPekerjaan, setLoadingKotaPekerjaan] = useState(false);
  const [loadingKotaKuliah, setLoadingKotaKuliah] = useState(false);
  const [loadingKotaUsaha, setLoadingKotaUsaha] = useState(false);
  const [showUniMap, setShowUniMap] = useState(false);
  const [showUsahaMap, setShowUsahaMap] = useState(false);
  const [showBekerjaMap, setShowBekerjaMap] = useState(false);

  // Autocomplete Options
  const [posisiOptions, setPosisiOptions] = useState([]);
  const [perusahaanOptions, setPerusahaanOptions] = useState([]);
  const [universitasOptions, setUniversitasOptions] = useState([]);

  const [isSaatIni, setIsSaatIni] = useState(false);

  const [form, setForm] = useState({
    id_status: '', tahun_mulai: '', tahun_selesai: '',
    posisi: '', nama_perusahaan: '', id_kota: '', id_provinsi: '', jalan: '', latitude_perusahaan: null, longitude_perusahaan: null,
    nama_universitas: '', id_jurusanKuliah: '', jalur_masuk: '', jenjang: '', alamat_universitas: '', id_kota_universitas: '', id_provinsi_universitas: '', latitude_universitas: null, longitude_universitas: null,
    id_bidang: '', nama_usaha: '', alamat_usaha: '', id_kota_usaha: '', id_provinsi_usaha: '', latitude_usaha: null, longitude_usaha: null
  });

  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 5;
  const startYearsOptions = Array.from({ length: 10 }, (_, i) => String(maxYear - i));
  const getEndYearsOptions = (startYear) => {
    if (!startYear) return startYearsOptions;

    const start = parseInt(startYear);
    if (isNaN(start)) return startYearsOptions;

    const len = Math.max(1, maxYear - start + 1);

    return Array.from({ length: len }, (_, i) => String(maxYear - i))
      .filter(year => parseInt(year) >= start);
  };

  const career = profile?.current_career;

  async function loadMasterData() {
    try {
      const [statusRes, provinsiRes, bidangRes, jurusanRes, masterPerusahaan, masterUniv, alumniRes] = await Promise.all([
        masterDataApi.getStatus(),
        masterDataApi.getProvinsi(),
        masterDataApi.getBidangUsaha(),
        masterDataApi.getJurusanKuliah(),
        masterDataApi.getPerusahaan().catch(() => ({ data: { data: [] } })),
        masterDataApi.getUniversitas().catch(() => ({ data: { data: [] } })),
        alumniApi.getAlumniDirectory({ per_page: 1000 }).catch(() => ({ data: { data: [] } }))
      ]);

      setStatusList(statusRes.data?.data || statusRes.data || []);
      setProvinsiList(provinsiRes.data?.data || provinsiRes.data || []);
      setBidangUsahaList(bidangRes.data?.data || bidangRes.data || []);
      setJurusanKuliahList(jurusanRes.data?.data || jurusanRes.data || []);

      // Extract Company and Univ from explicit master tables handling possible pagination format
      const rawP = masterPerusahaan.data?.data?.data || masterPerusahaan.data?.data || masterPerusahaan.data || [];
      const mp = Array.isArray(rawP) ? rawP.map(item => item.nama_perusahaan || item.nama || item) : [];

      const rawU = masterUniv.data?.data?.data || masterUniv.data?.data || masterUniv.data || [];
      const mu = Array.isArray(rawU) ? rawU.map(item => item.nama_universitas || item.nama || item) : [];

      let pSet = new Set(mp.filter(Boolean));
      let uSet = new Set(mu.filter(Boolean));
      let posSet = new Set(["UI/UX", "Software Engineer", "DevOps", "Data Analyst", "Karyawan"]);

      // Extract from Alumni Directory to capture organic usage
      const alumniList = alumniRes.data?.data?.data || alumniRes.data?.data || [];
      alumniList.forEach(a => {
        if (a.company) {
          if (a.status === 'Bekerja') pSet.add(a.company);
          if (a.status === 'Kuliah') uSet.add(a.company);
        }
        if (a.posisi) posSet.add(a.posisi);
        if (a.jabatan) posSet.add(a.jabatan);
      });

      setPerusahaanOptions(Array.from(pSet).sort());
      setUniversitasOptions(Array.from(uSet).sort());
      setPosisiOptions(Array.from(posSet).sort());
    } catch (err) { console.error('Failed to load master data:', err); }
  }

  async function loadKota(idProvinsi, target) {
    if (!idProvinsi) {
      if (target === 'pekerjaan') setKotaPekerjaanList([]);
      if (target === 'kuliah') setKotaKuliahList([]);
      if (target === 'usaha') setKotaUsahaList([]);
      return;
    }

    if (target === 'pekerjaan') setLoadingKotaPekerjaan(true);
    if (target === 'kuliah') setLoadingKotaKuliah(true);
    if (target === 'usaha') setLoadingKotaUsaha(true);

    try {
      const res = await masterDataApi.getKota(idProvinsi);
      const data = res.data.data || res.data || [];
      if (target === 'pekerjaan') setKotaPekerjaanList(data);
      if (target === 'kuliah') setKotaKuliahList(data);
      if (target === 'usaha') setKotaUsahaList(data);
    } catch (err) {
      console.error('Failed to load kota:', err);
      if (target === 'pekerjaan') setKotaPekerjaanList([]);
      if (target === 'kuliah') setKotaKuliahList([]);
      if (target === 'usaha') setKotaUsahaList([]);
    } finally {
      if (target === 'pekerjaan') setLoadingKotaPekerjaan(false);
      if (target === 'kuliah') setLoadingKotaKuliah(false);
      if (target === 'usaha') setLoadingKotaUsaha(false);
    }
  }

  const hasPendingCareer = !!profile?.has_pending_career;

  function handleOpenForm() {
    if (hasPendingCareer) {
      toastWarning('Anda masih memiliki status karir yang menunggu persetujuan admin. Harap tunggu hingga disetujui sebelum menambahkan status baru.');
      return;
    }
    if (career && !career.tahun_selesai && career.status != 'Belum Bekerja') {
      toastWarning('Anda harus mengisi tanggal berakhir pada karir saat ini terlebih dahulu sebelum menambahkan status karir baru.');
      return;
    }
    setShowForm(true);
    setForm({
      id_status: '', tahun_mulai: '', tahun_selesai: '',
      posisi: '', nama_perusahaan: '', id_kota: '', id_provinsi: '', jalan: '', latitude_perusahaan: null, longitude_perusahaan: null,
      nama_universitas: '', id_jurusanKuliah: '', jalur_masuk: '', jenjang: '', alamat_universitas: '', id_kota_universitas: '', id_provinsi_universitas: '', latitude_universitas: null, longitude_universitas: null,
      id_bidang: '', nama_usaha: '', alamat_usaha: '', id_kota_usaha: '', id_provinsi_usaha: '', latitude_usaha: null, longitude_usaha: null
    });
    loadMasterData();
  }

  const selectedStatus = statusList.find(s => String(s.id) === String(form.id_status));
  const statusName = (selectedStatus?.nama || selectedStatus?.nama_status || '').toLowerCase();

  async function handleSave() {
    try {
      setSaving(true);

      if (!form.id_status || !form.tahun_mulai) {
        toastWarning('Status dan tahun mulai wajib diisi.');
        return;
      }

      if (statusName.includes('kuliah')) {
        if (!form.nama_universitas?.trim()) return toastWarning('Nama universitas wajib diisi.');
        if (!form.alamat_universitas?.trim()) return toastWarning('Alamat universitas wajib diisi.');
        if (!form.id_kota_universitas) return toastWarning('Kota universitas wajib dipilih.');
      }

      if (statusName.includes('wirausaha') || statusName.includes('usaha')) {
        if (!form.nama_usaha?.trim()) return toastWarning('Nama usaha wajib diisi.');
        if (!form.id_bidang) return toastWarning('Bidang usaha wajib dipilih.');
        if (!form.alamat_usaha?.trim()) return toastWarning('Alamat usaha wajib diisi.');
        if (!form.id_kota_usaha) return toastWarning('Kota usaha wajib dipilih.');
      }

      const payload = {
        id_status: form.id_status,
        tahun_mulai: form.tahun_mulai,
        tahun_selesai: form.tahun_selesai || null,
      };

      const isBelum = statusName.includes('belum');
      if (!isBelum && (statusName.includes('kerja') || statusName.includes('bekerja'))) {
        payload.pekerjaan = { posisi: form.posisi, nama_perusahaan: form.nama_perusahaan, id_kota: form.id_kota, jalan: form.jalan, latitude: form.latitude_perusahaan, longitude: form.longitude_perusahaan };
      } else if (statusName.includes('kuliah')) {
        payload.universitas = {
          nama_universitas: form.nama_universitas,
          alamat: form.alamat_universitas,
          id_kota: form.id_kota_universitas,
          latitude: form.latitude_universitas,
          longitude: form.longitude_universitas,
          id_jurusanKuliah: form.id_jurusanKuliah,
          jalur_masuk: form.jalur_masuk,
          jenjang: form.jenjang,
        };
      } else if (statusName.includes('wirausaha') || statusName.includes('usaha')) {
        payload.wirausaha = {
          id_bidang: form.id_bidang,
          nama_usaha: form.nama_usaha,
          alamat: form.alamat_usaha,
          id_kota: form.id_kota_usaha,
          latitude: form.latitude_usaha,
          longitude: form.longitude_usaha,
        };
      }

      await alumniApi.updateCareerStatus(payload);
      setShowForm(false);
      onShowSuccess('Status karier berhasil dikirim, menunggu verifikasi admin');
      onRefresh();
    } catch (err) {
      console.error('Failed to save career status:', err);
      toastError('Gagal menyimpan status: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateEndDate() {
    if (!endDateValue) {
      toastWarning('Mohon isi tahun selesai');
      return;
    }
    if (!career?.id_status || !career?.id_riwayat) {
      toastWarning('Data karir tidak lengkap. Silakan refresh halaman.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        id_status: career.id_status,
        tahun_mulai: career.tahun_mulai,
        tahun_selesai: endDateValue,
      };

      if (career.pekerjaan) {
        payload.pekerjaan = {
          posisi: career.pekerjaan.posisi,
          nama_perusahaan: career.pekerjaan.perusahaan,
          id_kota: career.pekerjaan.id_kota,
          jalan: career.pekerjaan.jalan
        };
      } else if (career.kuliah) {
        payload.universitas = {
          nama_universitas: career.kuliah.universitas?.nama || career.kuliah.universitas,
          alamat: career.kuliah.alamat,
          id_kota: career.kuliah.id_kota || career.kuliah.kota?.id,
          latitude: career.kuliah.latitude,
          longitude: career.kuliah.longitude,
          id_jurusanKuliah: career.kuliah.jurusan_kuliah?.id,
          jalur_masuk: career.kuliah.jalur_masuk,
          jenjang: career.kuliah.jenjang
        };
      } else if (career.wirausaha) {
        payload.wirausaha = {
          id_bidang: career.wirausaha.id_bidang,
          nama_usaha: career.wirausaha.nama_usaha,
          alamat: career.wirausaha.alamat,
          id_kota: career.wirausaha.id_kota || career.wirausaha.kota?.id,
          latitude: career.wirausaha.latitude,
          longitude: career.wirausaha.longitude,
        };
      }

      await alumniApi.updateExistingCareerStatus(career.id_riwayat, payload);
      setEditingEndDate(false);
      setEndDateValue('');
      onShowSuccess('Tahun selesai berhasil diperbarui');
      onRefresh();
    } catch (err) {
      console.error('Failed to update end date:', err);
      toastError('Gagal memperbarui tahun selesai: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }

  const rawRiwayat = profile?.riwayat_status || [];
  const riwayat = rawRiwayat
    .filter((item, index, self) => index === self.findIndex(r => r.id === item.id))
    .filter((item) => {
      if (!career) return true;
      if (career.status && item.status?.nama === career.status && item.tahun_mulai === career.tahun_mulai) {
        if (career.pekerjaan && item.pekerjaan) return !(item.pekerjaan.posisi === career.pekerjaan.posisi);
        if (career.kuliah && item.kuliah) return !(item.kuliah.universitas?.nama === career.kuliah.universitas);
        if (career.wirausaha && item.wirausaha) return !(item.wirausaha.nama_usaha === career.wirausaha.nama_usaha);
        if (!item.pekerjaan && !item.kuliah && !item.wirausaha) return false;
      }
      return true;
    });

  function getCareerDisplayInfo() {
    if (!career) return null;

    if (career.pekerjaan) {
      return {
        type: 'pekerjaan',
        fields: [
          { label: 'Posisi / Jabatan', value: career.pekerjaan.posisi || '-' },
          { label: 'Perusahaan', value: career.pekerjaan.perusahaan || '-' },
          { label: 'Kota', value: career.pekerjaan.kota || '-' },
          { label: 'Provinsi', value: career.pekerjaan.provinsi || '-' },
          { label: 'Alamat', value: career.pekerjaan.jalan || '-' }
        ]
      };
    }

    if (career.kuliah) {
      return {
        type: 'kuliah',
        fields: [
          { label: 'Jenjang', value: career.kuliah.jenjang || '-' },
          { label: 'Universitas', value: career.kuliah.universitas?.nama || career.kuliah.universitas || '-' },
          { label: 'Program Studi / Jurusan', value: career.kuliah.jurusan_kuliah?.nama || '-' },
          { label: 'Jalur Masuk', value: career.kuliah.jalur_masuk || '-' },
          { label: 'Kota', value: career.kuliah.kota?.nama || career.kuliah.kota || '-' },
          { label: 'Provinsi', value: career.kuliah.provinsi?.nama || career.kuliah.provinsi || '-' },
          { label: 'Alamat', value: career.kuliah.alamat || '-' },
        ]
      };
    }

    if (career.wirausaha) {
      return {
        type: 'wirausaha',
        fields: [
          { label: 'Nama Usaha', value: career.wirausaha.nama_usaha || '-' },
          { label: 'Bidang Usaha', value: career.wirausaha.bidang_usaha?.nama || career.wirausaha.bidang_usaha || '-' },
          { label: 'Kota', value: career.wirausaha.kota?.nama || career.wirausaha.kota || '-' },
          { label: 'Provinsi', value: career.wirausaha.provinsi?.nama || career.wirausaha.provinsi || '-' },
          { label: 'Alamat', value: career.wirausaha.alamat || '-' },
        ]
      };
    }

    return null;
  }
  const careerInfo = getCareerDisplayInfo();
  const currentNeedsCompletion = Boolean(
    (career?.kuliah && (!career.kuliah.alamat || !(career.kuliah.id_kota || career.kuliah.kota?.id))) ||
    (career?.wirausaha && (!career.wirausaha.alamat || !(career.wirausaha.id_kota || career.wirausaha.kota?.id)))
  );

  return (
    <div className="p-5 md:p-10 flex-1 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-primary">
          <h2 className="text-md md:text-xl font-bold text-primary">Status Karier Saat Ini</h2>
        </div>
        {!showForm && (
          <div className="relative group">
            <button
              onClick={handleOpenForm}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${!isVerified || hasPendingCareer || (career && !career.tahun_selesai && career.status != 'Belum Bekerja')
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white cursor-pointer'
                }`}
              disabled={!isVerified || hasPendingCareer || (career && !career.tahun_selesai && career.status != 'Belum Bekerja')}
              title={!isVerified ? 'Akun belum diverifikasi dan belum mengisi kuesioner' : hasPendingCareer ? 'Menunggu persetujuan admin' : ''}
            >
              {!isVerified ? <Lock size={14} /> : hasPendingCareer ? <Clock size={14} /> : <Plus size={14} />}
              <span className='hidden md:block'>{!isVerified ? 'Terkunci' : hasPendingCareer ? 'Menunggu Approval' : 'Tambahkan status baru'}</span>
            </button>
            {hasPendingCareer && (
              <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-64 bg-amber-700 text-white text-xs p-3 rounded-lg shadow-lg z-10">
                <div className="flex items-start gap-2">
                  <Clock size={14} className="shrink-0 mt-0.5" />
                  <p>Status karir sebelumnya masih menunggu persetujuan admin. Anda tidak dapat menambahkan status baru sampai disetujui.</p>
                </div>
              </div>
            )}
            {!hasPendingCareer && career && !career.tahun_selesai && career.status != 'Belum Bekerja' && (
              <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-64 bg-slate-800 text-white text-xs p-3 rounded-lg shadow-lg z-10">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <p>Isi tanggal berakhir pada karir saat ini sebelum menambahkan status baru</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {hasPendingCareer && (
        <div className="mb-4 bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in duration-300">
          <Clock size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-800 mb-1">Menunggu Verifikasi Admin</h3>
            <p className="text-xs text-amber-700/80 font-medium">
              Status karier baru Anda telah berhasil dikirim dan sedang dalam proses verifikasi oleh admin.
              Status akan diperbarui setelah disetujui. Anda tidak dapat menambahkan status karir baru selama menunggu persetujuan.
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-green-500" />
                <span className="text-[11px] font-bold text-green-700">Data Terkirim</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-amber-500" />
                <span className="text-[11px] font-bold text-amber-700">Menunggu Review Admin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertCircle size={14} className="text-slate-300" />
                <span className="text-[11px] font-bold text-slate-400">Disetujui</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Form Tambah Status */}
      {showForm && (
        <div className="relative z-50 mb-6 border-t py-5 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-primary">Tambahkan Status Baru</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            {/* Status */}
            <div className="sm:col-span-2 relative z-[100]">
              <SmoothDropdown
                label={<><p className='text-primary'>Status</p></>}
                isSearchable={false}
                placeholder="Pilih Status"
                options={statusList.map(st => st.nama || st.nama_status)}
                value={statusList.find(st => String(st.id) === String(form.id_status))?.nama || statusList.find(st => String(st.id) === String(form.id_status))?.nama_status || ""}
                onSelect={(namaStatus) => {
                  const status = statusList.find(st => (st.nama === namaStatus) || (st.nama_status === namaStatus));
                  if (status) setForm(prev => ({ ...prev, id_status: String(status.id) }));
                }}
              />
            </div>

            <div className="relative z-[90]">
              <SmoothDropdown
                label="Tahun Mulai"
                isSearchable={true}
                placeholder="Pilih Tahun"
                options={startYearsOptions}
                value={form.tahun_mulai}
                onSelect={(val) => setForm(prev => {
                  let newSelesai = prev.tahun_selesai;
                  if (prev.tahun_selesai && parseInt(val) > parseInt(prev.tahun_selesai)) {
                    newSelesai = '';
                  }
                  return { ...prev, tahun_mulai: val, tahun_selesai: newSelesai };
                })}
              />
            </div>
            <div className="relative z-[80]">
              {!isSaatIni ? (
                <div>
                  <SmoothDropdown
                    label="Tahun Selesai (opsional)"
                    isSearchable={true}
                    placeholder="Pilih Tahun"
                    options={getEndYearsOptions(form.tahun_mulai)}
                    value={form.tahun_selesai}
                    onSelect={(val) => setForm(prev => ({ ...prev, tahun_selesai: val }))}
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-primary/80 uppercase tracking-wider block">
                    Tahun Selesai (opsional)
                  </label>
                  <div className="w-full mt-3 bg-gray-100 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-500 font-medium cursor-not-allowed flex items-center justify-between">
                    <span>Sedang Berlangsung</span>
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 pt-3 text-[11px] text-primary cursor-pointer hover:text-primary transition-colors w-fit">
                <input
                  type="checkbox"
                  checked={isSaatIni}
                  onChange={(e) => {
                    setIsSaatIni(e.target.checked);
                    if (e.target.checked) setForm(prev => ({ ...prev, tahun_selesai: '' }));
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer transition-all"
                />
                <span className="font-bold">Masih berlangsung (Saat ini)</span>
              </label>
            </div>

            {/* FIELD UNTUK PEKERJAAN */}
            {!statusName.includes('belum') && (statusName.includes('kerja') || statusName.includes('bekerja')) && (
              <>
                <div className="sm:col-span-2 relative z-[70]">
                  <InputDropdownEdit
                    label="Posisi / Judul Job"
                    options={posisiOptions}
                    value={form.posisi}
                    placeholder="Contoh: Software Engineer"
                    isRequired={false}
                    onChange={(val) => setForm(prev => ({ ...prev, posisi: val }))}
                    onSelect={(val) => setForm(prev => ({ ...prev, posisi: val }))}
                  />
                </div>
                <div className="sm:col-span-2 relative z-[60]">
                  <InputDropdownEdit
                    label="Nama Perusahaan"
                    options={perusahaanOptions}
                    value={form.nama_perusahaan}
                    placeholder="Contoh: PT. Teknologi Sukses"
                    isRequired={false}
                    onChange={(val) => setForm(prev => ({ ...prev, nama_perusahaan: val }))}
                    onSelect={(val) => setForm(prev => ({ ...prev, nama_perusahaan: val }))}
                  />
                </div>

                {/* PROVINSI & KOTA BERSEBELAHAN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:col-span-2 relative z-50">
                  <div className="w-full">
                    <SmoothDropdown
                      label="Provinsi"
                      isSearchable={true}
                      placeholder="Pilih Provinsi"
                      options={provinsiList.map(p => p.nama || p.nama_provinsi)}
                      value={provinsiList.find(p => String(p.id) === String(form.id_provinsi))?.nama || provinsiList.find(p => String(p.id) === String(form.id_provinsi))?.nama_provinsi || ""}
                      onSelect={(namaProv) => {
                        const prov = provinsiList.find(p => p.nama === namaProv || p.nama_provinsi === namaProv);
                        if (prov) {
                          setForm(prev => ({ ...prev, id_provinsi: String(prov.id), id_kota: '' }));
                          loadKota(prov.id, 'pekerjaan');
                        }
                      }}
                    />
                  </div>
                  <div className="w-full">
                    <SmoothDropdown
                      label="Kota / Kabupaten"
                      isSearchable={true}
                      placeholder={!form.id_provinsi ? "Pilih provinsi dulu" : loadingKotaPekerjaan ? "Memuat..." : "Pilih Kota"}
                      options={kotaPekerjaanList.map(k => k.nama || k.nama_kota)}
                      value={kotaPekerjaanList.find(k => String(k.id) === String(form.id_kota))?.nama || kotaPekerjaanList.find(k => String(k.id) === String(form.id_kota))?.nama_kota || ""}
                      onSelect={(namaKota) => {
                        const kota = kotaPekerjaanList.find(k => k.nama === namaKota || k.nama_kota === namaKota);
                        if (kota) setForm(prev => ({ ...prev, id_kota: String(kota.id) }));
                      }}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Alamat / Jalan <span className="normal-case font-medium text-slate-400">(opsional)</span></label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input type="text" placeholder="Contoh: Jl. Sudirman No. 123" value={form.jalan} onChange={(e) => setForm(prev => ({ ...prev, jalan: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <button
                      type="button"
                      onClick={() => setShowBekerjaMap(true)}
                      className="flex shrink-0 items-center justify-center gap-1 rounded-xl bg-primary px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#2A3E3F] cursor-pointer"
                    >
                      <MapPin size={14} />
                      Pilih di Peta
                    </button>
                  </div>
                  {form.latitude_perusahaan !== null && form.longitude_perusahaan !== null && (
                    <p className="mt-1 text-xs text-emerald-600">
                      Koordinat: {Number(form.latitude_perusahaan).toFixed(5)}, {Number(form.longitude_perusahaan).toFixed(5)}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* FIELD UNTUK KULIAH */}
            {statusName.includes('kuliah') && (
              <>
                <div className="sm:col-span-2 relative z-[70]">
                  <UniversitySelector
                    univValue={form.nama_universitas}
                    jurusanValue={form.id_jurusanKuliah}
                    onUnivSelect={(val) => setForm(prev => ({ ...prev, nama_universitas: val }))}
                    onJurusanSelect={(val) => setForm(prev => ({ ...prev, id_jurusanKuliah: val }))}
                    onChangeUniv={(val) => setForm(prev => ({ ...prev, nama_universitas: val }))}
                    onChangeJurusan={(val) => setForm(prev => ({ ...prev, id_jurusanKuliah: val }))}
                  />
                </div>

                {/* JENJANG & JALUR MASUK SEJAJAR DI FORM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:col-span-2 relative z-40">
                  <div className="w-full relative">
                    <SmoothDropdown
                      label="Jenjang"
                      isSearchable={false}
                      placeholder="Pilih Jenjang"
                      options={["D3", "D4", "S1", "S2", "S3"]}
                      value={form.jenjang}
                      onSelect={(val) => setForm(prev => ({ ...prev, jenjang: val }))}
                    />
                  </div>

                  <div className="w-full relative">
                    <SmoothDropdown
                      label="Jalur Masuk"
                      isSearchable={false}
                      placeholder="Pilih Jalur Masuk"
                      options={["SNBP", "SNBT", "Mandiri", "Prestasi", "Lainnya"]}
                      value={form.jalur_masuk}
                      onSelect={(val) => setForm(prev => ({ ...prev, jalur_masuk: val }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:col-span-2 relative z-40">
                  <div className="w-full relative">
                    <SmoothDropdown
                      label="Provinsi Universitas"
                      isSearchable={true}
                      placeholder="Pilih Provinsi"
                      options={provinsiList.map((p) => p.nama || p.nama_provinsi)}
                      value={provinsiList.find((p) => String(p.id) === String(form.id_provinsi_universitas))?.nama || provinsiList.find((p) => String(p.id) === String(form.id_provinsi_universitas))?.nama_provinsi || ''}
                      onSelect={(namaProv) => {
                        const prov = provinsiList.find((p) => p.nama === namaProv || p.nama_provinsi === namaProv);
                        if (prov) {
                          setForm((prev) => ({ ...prev, id_provinsi_universitas: String(prov.id), id_kota_universitas: '' }));
                          loadKota(prov.id, 'kuliah');
                        }
                      }}
                    />
                  </div>

                  <div className="w-full relative">
                    <SmoothDropdown
                      label="Kota Universitas"
                      isSearchable={true}
                      placeholder={!form.id_provinsi_universitas ? 'Pilih provinsi dulu' : loadingKotaKuliah ? 'Memuat...' : 'Pilih Kota'}
                      options={kotaKuliahList.map((k) => k.nama || k.nama_kota)}
                      value={kotaKuliahList.find((k) => String(k.id) === String(form.id_kota_universitas))?.nama || kotaKuliahList.find((k) => String(k.id) === String(form.id_kota_universitas))?.nama_kota || ''}
                      onSelect={(namaKota) => {
                        const kota = kotaKuliahList.find((k) => k.nama === namaKota || k.nama_kota === namaKota);
                        if (kota) {
                          setForm((prev) => ({ ...prev, id_kota_universitas: String(kota.id) }));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Alamat Universitas</label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      placeholder="Contoh: Jl. Kampus Utama No. 1"
                      value={form.alamat_universitas}
                      onChange={(e) => setForm((prev) => ({ ...prev, alamat_universitas: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUniMap(true)}
                      className="flex shrink-0 items-center justify-center gap-1 rounded-xl bg-primary px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#2A3E3F] cursor-pointer"
                    >
                      <MapPin size={14} />
                      Pilih di Peta
                    </button>
                  </div>
                  {form.latitude_universitas !== null && form.longitude_universitas !== null && (
                    <p className="mt-1 text-xs text-emerald-600">
                      Koordinat: {Number(form.latitude_universitas).toFixed(5)}, {Number(form.longitude_universitas).toFixed(5)}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* FIELD UNTUK WIRAUSAHA */}
            {(statusName.includes('wirausaha') || statusName.includes('usaha')) && (
              <>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Nama Usaha</label>
                  <input type="text" placeholder="Contoh: Toko Kopi Sejahtera" value={form.nama_usaha} onChange={(e) => setForm(prev => ({ ...prev, nama_usaha: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>

                <div className="sm:col-span-2 relative z-50">
                  <SmoothDropdown
                    label="Bidang Usaha"
                    isSearchable={true}
                    placeholder="Pilih Bidang Usaha"
                    options={bidangUsahaList.map(b => b.nama || b.nama_bidang)}
                    value={bidangUsahaList.find(b => String(b.id) === String(form.id_bidang))?.nama || bidangUsahaList.find(b => String(b.id) === String(form.id_bidang))?.nama_bidang || ""}
                    onSelect={(namaBid) => {
                      const bid = bidangUsahaList.find(b => b.nama === namaBid || b.nama_bidang === namaBid);
                      if (bid) setForm(prev => ({ ...prev, id_bidang: String(bid.id) }));
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:col-span-2 relative z-40">
                  <div className="w-full relative">
                    <SmoothDropdown
                      label="Provinsi Usaha"
                      isSearchable={true}
                      placeholder="Pilih Provinsi"
                      options={provinsiList.map((p) => p.nama || p.nama_provinsi)}
                      value={provinsiList.find((p) => String(p.id) === String(form.id_provinsi_usaha))?.nama || provinsiList.find((p) => String(p.id) === String(form.id_provinsi_usaha))?.nama_provinsi || ''}
                      onSelect={(namaProv) => {
                        const prov = provinsiList.find((p) => p.nama === namaProv || p.nama_provinsi === namaProv);
                        if (prov) {
                          setForm((prev) => ({ ...prev, id_provinsi_usaha: String(prov.id), id_kota_usaha: '' }));
                          loadKota(prov.id, 'usaha');
                        }
                      }}
                    />
                  </div>

                  <div className="w-full relative">
                    <SmoothDropdown
                      label="Kota Usaha"
                      isSearchable={true}
                      placeholder={!form.id_provinsi_usaha ? 'Pilih provinsi dulu' : loadingKotaUsaha ? 'Memuat...' : 'Pilih Kota'}
                      options={kotaUsahaList.map((k) => k.nama || k.nama_kota)}
                      value={kotaUsahaList.find((k) => String(k.id) === String(form.id_kota_usaha))?.nama || kotaUsahaList.find((k) => String(k.id) === String(form.id_kota_usaha))?.nama_kota || ''}
                      onSelect={(namaKota) => {
                        const kota = kotaUsahaList.find((k) => k.nama === namaKota || k.nama_kota === namaKota);
                        if (kota) {
                          setForm((prev) => ({ ...prev, id_kota_usaha: String(kota.id) }));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Alamat Usaha</label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      placeholder="Contoh: Jl. Raya Usaha No. 10"
                      value={form.alamat_usaha}
                      onChange={(e) => setForm((prev) => ({ ...prev, alamat_usaha: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUsahaMap(true)}
                      className="flex shrink-0 items-center justify-center gap-1 rounded-xl bg-primary px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#2A3E3F] cursor-pointer"
                    >
                      <MapPin size={14} />
                      Pilih di Peta
                    </button>
                  </div>
                  {form.latitude_usaha !== null && form.longitude_usaha !== null && (
                    <p className="mt-1 text-xs text-emerald-600">
                      Koordinat: {Number(form.latitude_usaha).toFixed(5)}, {Number(form.longitude_usaha).toFixed(5)}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-primary/10">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer">Batal</button>
            <button onClick={handleSave} disabled={saving || !form.id_status || !form.tahun_mulai} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan <span className='hidden md:block'>Status</span>
            </button>
          </div>
        </div>
      )}

      <LocationPicker
        isOpen={showBekerjaMap}
        onClose={() => setShowBekerjaMap(false)}
        onConfirm={({ latitude, longitude, address }) => {
          setForm((prev) => ({
            ...prev,
            jalan: address || prev.jalan,
            latitude_perusahaan: latitude,
            longitude_perusahaan: longitude,
          }));
        }}
        initialLat={typeof form.latitude_perusahaan === 'number' ? form.latitude_perusahaan : -7.25}
        initialLng={typeof form.longitude_perusahaan === 'number' ? form.longitude_perusahaan : 112.75}
        selectedKota={kotaPekerjaanList.find(k => String(k.id) === String(form.id_kota))?.nama || ''}
        selectedProvinsi={provinsiList.find(p => String(p.id) === String(form.id_provinsi))?.nama || ''}
        title="Pilih Lokasi Perusahaan"
      />

      <LocationPicker
        isOpen={showUniMap}
        onClose={() => setShowUniMap(false)}
        onConfirm={({ latitude, longitude, address }) => {
          setForm((prev) => ({
            ...prev,
            alamat_universitas: address || prev.alamat_universitas,
            latitude_universitas: latitude,
            longitude_universitas: longitude,
          }));
        }}
        initialLat={typeof form.latitude_universitas === 'number' ? form.latitude_universitas : -7.25}
        initialLng={typeof form.longitude_universitas === 'number' ? form.longitude_universitas : 112.75}
        selectedKota={kotaKuliahList.find(k => String(k.id) === String(form.id_kota_universitas))?.nama || ''}
        selectedProvinsi={provinsiList.find(p => String(p.id) === String(form.id_provinsi_universitas))?.nama || ''}
        title="Pilih Lokasi Universitas"
      />

      <LocationPicker
        isOpen={showUsahaMap}
        onClose={() => setShowUsahaMap(false)}
        onConfirm={({ latitude, longitude, address }) => {
          setForm((prev) => ({
            ...prev,
            alamat_usaha: address || prev.alamat_usaha,
            latitude_usaha: latitude,
            longitude_usaha: longitude,
          }));
        }}
        initialLat={typeof form.latitude_usaha === 'number' ? form.latitude_usaha : -7.25}
        initialLng={typeof form.longitude_usaha === 'number' ? form.longitude_usaha : 112.75}
        selectedKota={kotaUsahaList.find(k => String(k.id) === String(form.id_kota_usaha))?.nama || ''}
        selectedProvinsi={provinsiList.find(p => String(p.id) === String(form.id_provinsi_usaha))?.nama || ''}
        title="Pilih Lokasi Usaha"
      />

      {/* Current Career */}
      {careerInfo && (
        <div className={`relative border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 mb-6 bg-white transition-all duration-300 ${showForm ? 'animate-in slide-in-from-top-4' : ''}`}>
          {currentNeedsCompletion && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
              Data alamat atau kota pada status karier ini belum lengkap. Silakan lengkapi pada pengajuan status karier berikutnya agar titik sebaran peta akurat.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Status Karier</label>
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-primary">{career?.status || '-'}</div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Periode</label>
              {editingEndDate ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-primary">
                      {career?.tahun_mulai || '-'}
                    </div>
                    <span className="text-sm font-bold text-primary">-</span>
                    <div className="flex-1 min-w-[120px] relative z-50">
                      <SmoothDropdown
                        isSearchable={true}
                        placeholder="Pilih Tahun"
                        options={getEndYearsOptions(career?.tahun_mulai)}
                        value={endDateValue}
                        onSelect={(val) => setEndDateValue(val)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleUpdateEndDate}
                    disabled={saving}
                    className="cursor-pointer flex items-center gap-1 px-3 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-[#2A3E3F] transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingEndDate(false);
                      setEndDateValue('');
                    }}
                    className="cursor-pointer p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-primary">
                    {career?.tahun_mulai || '-'} - {career?.tahun_selesai || 'Sekarang'}
                  </div>
                  {!career?.tahun_selesai && isVerified && (
                    <button
                      onClick={() => setEditingEndDate(true)}
                      className="cursor-pointer flex items-center gap-1 px-3 py-3 bg-slate-100 text-primary rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                      title="Edit tahun selesai"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* TAMPILAN FIELD (JALUR MASUK DITAMBAHKAN KE COL-SPAN-2) */}
            {careerInfo.fields.map((field, index) => (
              <div key={index} className={field.label === 'Alamat' || field.label === 'Program Studi / Jurusan' || field.label === 'Jalur Masuk' ? 'sm:col-span-2' : ''}>
                <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
                  {field.label}
                </label>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-primary">
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!careerInfo && !showForm && (
        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 mb-6 bg-white text-center">
          <Briefcase size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400">Belum ada status karier. Klik "Tambahkan status baru" untuk memulai.</p>
        </div>
      )}



      {riwayat.length > 0 && (
        <div className="relative z-0 mt-8">
          {/* Pending Verification Alert */}

          <h3 className="text-sm font-black text-primary/60 uppercase tracking-widest mb-4">Riwayat Status</h3>
          <div className="space-y-4">
            {riwayat.map((item) => {
              let title = item.status?.nama || '-';
              let details = [];

              if (item.pekerjaan) {
                title = item.pekerjaan.posisi || title;
                if (item.pekerjaan.perusahaan?.nama) details.push({ label: 'Perusahaan', value: item.pekerjaan.perusahaan.nama });
                const lokasi = [item.pekerjaan.perusahaan?.kota, item.pekerjaan.perusahaan?.provinsi].filter(Boolean).join(', ');
                if (lokasi) details.push({ label: 'Lokasi', value: lokasi });
              }
              else if (item.kuliah) {
                title = item.kuliah.jenjang ? `Mahasiswa ${item.kuliah.jenjang}` : (item.status?.nama || 'Kuliah');
                if (item.kuliah.universitas?.nama || item.kuliah.universitas) details.push({ label: 'Universitas', value: item.kuliah.universitas?.nama || item.kuliah.universitas });
                if (item.kuliah.jurusan_kuliah?.nama) details.push({ label: 'Program Studi', value: item.kuliah.jurusan_kuliah.nama });
                if (item.kuliah.jalur_masuk) details.push({ label: 'Jalur Masuk', value: item.kuliah.jalur_masuk });
                const lokasiKuliah = [item.kuliah.kota?.nama || item.kuliah.kota, item.kuliah.provinsi?.nama || item.kuliah.provinsi].filter(Boolean).join(', ');
                if (lokasiKuliah) details.push({ label: 'Lokasi', value: lokasiKuliah });
                if (item.kuliah.alamat) details.push({ label: 'Alamat', value: item.kuliah.alamat });
              }
              else if (item.wirausaha) {
                title = 'Wirausaha';
                if (item.wirausaha.nama_usaha) details.push({ label: 'Nama Usaha', value: item.wirausaha.nama_usaha });
                if (item.wirausaha.bidang_usaha?.nama || item.wirausaha.bidang_usaha) details.push({ label: 'Bidang Usaha', value: item.wirausaha.bidang_usaha?.nama || item.wirausaha.bidang_usaha });
                const lokasiUsaha = [item.wirausaha.kota?.nama || item.wirausaha.kota, item.wirausaha.provinsi?.nama || item.wirausaha.provinsi].filter(Boolean).join(', ');
                if (lokasiUsaha) details.push({ label: 'Lokasi', value: lokasiUsaha });
                if (item.wirausaha.alamat) details.push({ label: 'Alamat', value: item.wirausaha.alamat });
              }

              const periode = `${item.tahun_mulai || '-'} - ${item.tahun_selesai || 'Sekarang'}`;

              return (
                <div key={item.id} className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-3xl p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-[15px] font-black text-primary mb-2">{title}</h3>
                    {details.length > 0 && (
                      <div className="space-y-1.5 mt-3">
                        {details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider w-24 shrink-0 mt-0.5">{detail.label}</span>
                            <span className="font-medium text-sm text-slate-700 leading-tight">{detail.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-full text-[11px] font-black text-primary shrink-0 self-start sm:self-center">
                    {periode}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}