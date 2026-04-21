import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, X, Loader2, Save, Clock, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { alumniApi } from '../../../api/alumni';
import { masterDataApi } from '../../../api/masterData';
import SmoothDropdown from '../../admin/SmoothDropdown';
import LocationPicker from '../../common/LocationPicker';
import { toastError, toastWarning } from '../../../utilitis/alert';

// IMPORT KOMPONEN YANG TELAH DIPISAH
import FormBekerja from './FormBekerja';
import FormKuliah from './FormKuliah';
import FormWirausaha from './FormWirausaha';
import RiwayatStatusKarier from './RiwayatStatusKarier';
import InfoKarierSaatIni from './InfoKarierSaatIni';

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
  const [bidangUsahaMap, setBidangUsahaMap] = useState({});
  const [jurusanKuliahList, setJurusanKuliahList] = useState([]);

  const [loadingKotaPekerjaan, setLoadingKotaPekerjaan] = useState(false);
  const [loadingKotaKuliah, setLoadingKotaKuliah] = useState(false);
  const [loadingKotaUsaha, setLoadingKotaUsaha] = useState(false);
  const [loadingProvinsi, setLoadingProvinsi] = useState(false);

  const [showUniMap, setShowUniMap] = useState(false);
  const [showUsahaMap, setShowUsahaMap] = useState(false);
  const [showBekerjaMap, setShowBekerjaMap] = useState(false);

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

  const [pekerjaan, setPekerjaan] = useState({ posisi: '', nama_perusahaan: '', id_provinsi: '', id_kota: '', jalan: '', tahun_mulai: '', tahun_selesai: '', is_saat_ini: true });
  const [universitas, setUniversitas] = useState({ nama_universitas: '', alamat: '', id_provinsi: '', id_kota: '', id_jurusanKuliah: '', jalur_masuk: '', jenjang: '', tahun_mulai: '', tahun_selesai: '', is_saat_ini: true });
  const [wirausaha, setWirausaha] = useState({ id_bidang: '', nama_usaha: '', alamat: '', id_provinsi: '', id_kota: '', tahun_mulai: '', tahun_selesai: '', is_saat_ini: true });

  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 5;
  const startYearsOptions = Array.from({ length: 10 }, (_, i) => String(maxYear - i));
  const getEndYearsOptions = (startYear) => {
    if (!startYear) return startYearsOptions;
    const start = parseInt(startYear);
    if (isNaN(start)) return startYearsOptions;
    const len = Math.max(1, maxYear - start + 1);
    return Array.from({ length: len }, (_, i) => String(maxYear - i)).filter(year => parseInt(year) >= start);
  };

  const career = profile?.current_career;
  const hasPendingCareer = !!profile?.has_pending_career;

  async function loadMasterData() {
    try {
      setLoadingProvinsi(true);
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

      const bidangData = bidangRes.data?.data || bidangRes.data || [];
      setBidangUsahaList(bidangData);

      const bidangMap = {};
      (Array.isArray(bidangData) ? bidangData : []).forEach((b) => {
        const name = b?.nama || b?.nama_bidang || b?.nama_bidang_usaha;
        const id = b?.id;
        if (name != null) bidangMap[String(name)] = id != null ? String(id) : String(name);
      });
      setBidangUsahaMap(bidangMap);

      setJurusanKuliahList(jurusanRes.data?.data || jurusanRes.data || []);

      const rawP = masterPerusahaan.data?.data?.data || masterPerusahaan.data?.data || masterPerusahaan.data || [];
      const mp = Array.isArray(rawP) ? rawP.map(item => item.nama_perusahaan || item.nama || item) : [];

      const rawU = masterUniv.data?.data?.data || masterUniv.data?.data || masterUniv.data || [];
      const mu = Array.isArray(rawU) ? rawU.map(item => item.nama_universitas || item.nama || item) : [];

      let pSet = new Set(mp.filter(Boolean));
      let uSet = new Set(mu.filter(Boolean));
      let posSet = new Set(["UI/UX", "Software Engineer", "DevOps", "Data Analyst", "Karyawan"]);

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
    } catch (err) {
      console.error('Failed to load master data:', err);
    } finally {
      setLoadingProvinsi(false);
    }
  }

  async function loadKota(idProvinsi, target) {
    if (!idProvinsi) {
      if (target === 'pekerjaan') setKotaPekerjaanList([]);
      if (target === 'kuliah') setKotaKuliahList([]);
      if (target === 'usaha') setKotaUsahaList([]);
      return [];
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
      return data;
    } catch (err) {
      console.error('Failed to load kota:', err);
      return [];
    } finally {
      if (target === 'pekerjaan') setLoadingKotaPekerjaan(false);
      if (target === 'kuliah') setLoadingKotaKuliah(false);
      if (target === 'usaha') setLoadingKotaUsaha(false);
    }
  }

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
    setPekerjaan({ posisi: '', nama_perusahaan: '', id_provinsi: '', id_kota: '', jalan: '', tahun_mulai: '', tahun_selesai: '', is_saat_ini: true });
    setUniversitas({ nama_universitas: '', alamat: '', id_provinsi: '', id_kota: '', id_jurusanKuliah: '', jalur_masuk: '', jenjang: '', tahun_mulai: '', tahun_selesai: '', is_saat_ini: true });
    setWirausaha({ id_bidang: '', nama_usaha: '', alamat: '', id_provinsi: '', id_kota: '', tahun_mulai: '', tahun_selesai: '', is_saat_ini: true });
    setIsSaatIni(false);
    loadMasterData();
  }

  const selectedStatus = statusList.find(s => String(s.id) === String(form.id_status));
  const statusName = (selectedStatus?.nama || selectedStatus?.nama_status || '').toLowerCase();

  const renderTahunDinamis = (type, label) => {
    const data = type === 'Bekerja' ? pekerjaan : type === 'Kuliah' ? universitas : wirausaha;
    const setData = type === 'Bekerja' ? setPekerjaan : type === 'Kuliah' ? setUniversitas : setWirausaha;

    return (
      <>
        <div className="relative z-[70] w-full focus-within:z-[9999]">
          <SmoothDropdown
            label={<>Tahun Mulai <span className="text-red-500">*</span></>}
            isSearchable={true}
            placeholder="Pilih Tahun"
            options={startYearsOptions}
            value={data.tahun_mulai}
            onSelect={(val) => {
              const updateData = { ...data, tahun_mulai: val };
              if (data.tahun_selesai && parseInt(val) > parseInt(data.tahun_selesai)) {
                updateData.tahun_selesai = "";
              }
              setData(updateData);
            }}
          />
        </div>

        <div className="relative z-[70] w-full focus-within:z-[9999]">
          {!data.is_saat_ini ? (
            <SmoothDropdown
              label="Tahun Selesai (opsional)"
              isSearchable={true}
              placeholder="Pilih Tahun"
              options={getEndYearsOptions(data.tahun_mulai)}
              value={data.tahun_selesai}
              onSelect={(val) => setData({ ...data, tahun_selesai: val })}
            />
          ) : (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-primary/80 uppercase tracking-wider">
                Tahun Selesai (opsional)
              </label>
              <div className="w-full mt-3 bg-slate-50 border-2 border-fourth rounded-xl px-4 h-[48px] text-sm text-slate-400 font-medium cursor-not-allowed flex items-center">
                Sedang Berlangsung
              </div>
            </div>
          )}
          <label className="flex items-center gap-2 mt-3 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={data.is_saat_ini}
              onChange={(e) => setData({
                ...data,
                is_saat_ini: e.target.checked,
                tahun_selesai: e.target.checked ? "" : data.tahun_selesai
              })}
              className="w-4 h-4 rounded border-gray-100 text-primary focus:ring-primary accent-primary cursor-pointer transition-all"
            />
            <span className="text-[11px] font-bold text-primary">Masih berlangsung (Saat ini)</span>
          </label>
        </div>
      </>
    );
  };

  async function handleSave() {
    try {
      setSaving(true);
      const isBelum = statusName.includes('belum') || statusName.includes('mencari');

      if (!form.id_status) {
        toastWarning('Status karir wajib dipilih.');
        return;
      }

      const payload = {
        id_status: form.id_status,
        tahun_mulai: form.tahun_mulai,
        tahun_selesai: isSaatIni ? null : (form.tahun_selesai || null),
      };

      if (!isBelum) {
        let activeData = null;

        if (statusName.includes('kerja') || statusName.includes('bekerja')) {
          activeData = pekerjaan;
          if (!activeData.posisi?.trim()) return toastWarning('Posisi/Pekerjaan wajib diisi.');
          if (!activeData.nama_perusahaan?.trim()) return toastWarning('Nama perusahaan wajib diisi.');
          const isExisting = perusahaanOptions.some(p => p.toLowerCase() === activeData.nama_perusahaan.trim().toLowerCase());
          if (!isExisting) {
            if (!activeData.id_provinsi) return toastWarning('Provinsi perusahaan baru wajib dipilih.');
            if (!activeData.id_kota) return toastWarning('Kota perusahaan baru wajib dipilih.');
            if (!activeData.jalan?.trim()) return toastWarning('Alamat perusahaan baru wajib diisi.');
          }

          let finalJalan = activeData.jalan || '';
          if (isNaN(parseInt(activeData.id_kota)) && activeData.id_kota) finalJalan += `, ${activeData.id_kota}`;
          if (isNaN(parseInt(activeData.id_provinsi)) && activeData.id_provinsi) finalJalan += `, ${activeData.id_provinsi}`;

          payload.tahun_mulai = activeData.tahun_mulai;
          payload.tahun_selesai = activeData.is_saat_ini ? null : (activeData.tahun_selesai || null);
          payload.pekerjaan = {
            posisi: activeData.posisi,
            nama_perusahaan: activeData.nama_perusahaan,
            id_kota: (!isNaN(parseInt(activeData.id_kota)) && activeData.id_kota !== '') ? activeData.id_kota : null,
            jalan: finalJalan,
            latitude: form.latitude_perusahaan,
            longitude: form.longitude_perusahaan
          };

        } else if (statusName.includes('kuliah')) {
          activeData = universitas;
          if (!activeData.nama_universitas?.trim()) return toastWarning('Nama universitas wajib diisi.');
          if (!activeData.jenjang) return toastWarning('Jenjang kuliah wajib dipilih.');
          if (!activeData.jalur_masuk) return toastWarning('Jalur masuk kuliah wajib dipilih.');

          const isExisting = universitasOptions.some(u => u.toLowerCase() === activeData.nama_universitas.trim().toLowerCase());
          if (!isExisting) {
            if (!activeData.id_provinsi) return toastWarning('Provinsi universitas baru wajib dipilih.');
            if (!activeData.id_kota) return toastWarning('Kota universitas baru wajib dipilih.');
            if (!activeData.alamat?.trim()) return toastWarning('Alamat universitas baru wajib diisi.');
          }

          let finalAlamatUniv = activeData.alamat || '';
          if (isNaN(parseInt(activeData.id_kota)) && activeData.id_kota) finalAlamatUniv += `, ${activeData.id_kota}`;
          if (isNaN(parseInt(activeData.id_provinsi)) && activeData.id_provinsi) finalAlamatUniv += `, ${activeData.id_provinsi}`;

          payload.tahun_mulai = activeData.tahun_mulai;
          payload.tahun_selesai = activeData.is_saat_ini ? null : (activeData.tahun_selesai || null);
          payload.universitas = {
            nama_universitas: activeData.nama_universitas,
            alamat: finalAlamatUniv,
            id_kota: (!isNaN(parseInt(activeData.id_kota)) && activeData.id_kota !== '') ? activeData.id_kota : null,
            latitude: form.latitude_universitas,
            longitude: form.longitude_universitas,
            id_jurusanKuliah: activeData.id_jurusanKuliah,
            jalur_masuk: activeData.jalur_masuk,
            jenjang: activeData.jenjang,
          };

        } else if (statusName.includes('wirausaha') || statusName.includes('usaha')) {
          activeData = wirausaha;
          if (!activeData.nama_usaha?.trim()) return toastWarning('Nama usaha wajib diisi.');
          if (!activeData.id_bidang) return toastWarning('Bidang usaha wajib dipilih.');
          if (!activeData.id_provinsi) return toastWarning('Provinsi usaha wajib dipilih.');
          if (!activeData.id_kota) return toastWarning('Kota usaha wajib dipilih.');
          if (!activeData.alamat?.trim()) return toastWarning('Alamat usaha wajib diisi.');

          let finalAlamatUsaha = activeData.alamat || '';
          if (isNaN(parseInt(activeData.id_kota)) && activeData.id_kota) finalAlamatUsaha += `, ${activeData.id_kota}`;
          if (isNaN(parseInt(activeData.id_provinsi)) && activeData.id_provinsi) finalAlamatUsaha += `, ${activeData.id_provinsi}`;

          payload.tahun_mulai = activeData.tahun_mulai;
          payload.tahun_selesai = activeData.is_saat_ini ? null : (activeData.tahun_selesai || null);
          payload.wirausaha = {
            id_bidang: activeData.id_bidang,
            nama_usaha: activeData.nama_usaha,
            alamat: finalAlamatUsaha,
            id_kota: (!isNaN(parseInt(activeData.id_kota)) && activeData.id_kota !== '') ? activeData.id_kota : null,
            latitude: form.latitude_usaha,
            longitude: form.longitude_usaha,
          };
        }

        if (!payload.tahun_mulai) {
          return toastWarning('Tahun mulai wajib diisi.');
        }
      } else {
        if (!form.tahun_mulai) return toastWarning('Tahun mulai wajib diisi.');
      }

      // console.log("Payload : ", payload)
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

  // console.log(pekerjaan)

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
            >
              {!isVerified ? <Lock size={14} /> : hasPendingCareer ? <Clock size={14} /> : <Plus size={14} />}
              <span className='hidden md:block'>{!isVerified ? 'Terkunci' : hasPendingCareer ? 'Menunggu Approval' : 'Tambahkan status baru'}</span>
            </button>
            <div className="invisible absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 rounded bg-gray-800 px-3 py-2 text-xs text-white opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100 z-10">
              Anda harus mengisi tanggal selesai terlebih dahulu!

              <div className="absolute left-1/2 top-full -translate-x-1/2 border-[6px] border-transparent border-t-gray-800"></div>
            </div>
          </div>
        )}
      </div>

      {hasPendingCareer && (
        <div className="mb-4 bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <Clock size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-800 mb-1">Menunggu Verifikasi Admin</h3>
            <p className="text-xs text-amber-700/80 font-medium">Status karier baru Anda sedang diproses admin.</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="relative z-50 mb-6 border-t py-5 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-primary">Tambahkan Status Baru</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">

            <div className="sm:col-span-2 relative z-[100]">
              <SmoothDropdown
                label={<>Status <span className="text-red-500">*</span></>}
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

            {statusName.includes('belum') && (
              <>
                <div className="relative z-[90]">
                  <SmoothDropdown
                    label={<>Tahun Mulai <span className="text-red-500">*</span></>}
                    isSearchable={true}
                    placeholder="Pilih Tahun"
                    options={startYearsOptions}
                    value={form.tahun_mulai}
                    onSelect={(val) => setForm(prev => {
                      let newSelesai = prev.tahun_selesai;
                      if (prev.tahun_selesai && parseInt(val) > parseInt(prev.tahun_selesai)) newSelesai = '';
                      return { ...prev, tahun_mulai: val, tahun_selesai: newSelesai };
                    })}
                  />
                </div>
                <div className="relative z-[80]">
                  {!isSaatIni ? (
                    <SmoothDropdown
                      label="Tahun Selesai (opsional)"
                      isSearchable={true}
                      placeholder="Pilih Tahun"
                      options={getEndYearsOptions(form.tahun_mulai)}
                      value={form.tahun_selesai}
                      onSelect={(val) => setForm(prev => ({ ...prev, tahun_selesai: val }))}
                    />
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-primary/80 uppercase tracking-widest block mb-2.5">
                        Tahun Selesai
                      </label>
                      <div className="w-full bg-slate-50 border-2 border-fourth rounded-xl px-4 h-[48px] text-sm text-slate-400 font-medium cursor-not-allowed flex items-center">
                        Sedang Berlangsung
                      </div>
                    </div>
                  )}
                  <label className="flex items-center gap-2 mt-3 cursor-pointer w-fit">
                    <input type="checkbox" checked={isSaatIni} onChange={(e) => { setIsSaatIni(e.target.checked); if (e.target.checked) setForm(prev => ({ ...prev, tahun_selesai: '' })); }} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer transition-all" />
                    <span className="text-[11px] font-bold text-primary">Masih berlangsung (Saat ini)</span>
                  </label>
                </div>
              </>
            )}

            {!statusName.includes('belum') && (statusName.includes('kerja') || statusName.includes('bekerja')) && (
              <div className="sm:col-span-2">
                <FormBekerja form={form} setForm={setForm} pekerjaan={pekerjaan} setPekerjaan={setPekerjaan} posisiOptions={posisiOptions} perusahaanOptions={perusahaanOptions} provinsiList={provinsiList} kotaPekerjaanList={kotaPekerjaanList} loadingProvinsi={loadingProvinsi} loadingKotaPekerjaan={loadingKotaPekerjaan} loadKota={loadKota} renderTahunDinamis={renderTahunDinamis} setShowBekerjaMap={setShowBekerjaMap} />
              </div>
            )}

            {statusName.includes('kuliah') && (
              <div className="sm:col-span-2">
                <FormKuliah form={form} setForm={setForm} universitas={universitas} setUniversitas={setUniversitas} universitasOptions={universitasOptions} provinsiList={provinsiList} kotaKuliahList={kotaKuliahList} loadingProvinsi={loadingProvinsi} loadingKotaKuliah={loadingKotaKuliah} loadKota={loadKota} renderTahunDinamis={renderTahunDinamis} setShowUniMap={setShowUniMap} />
              </div>
            )}

            {(statusName.includes('wirausaha') || statusName.includes('usaha')) && (
              <div className="sm:col-span-2">
                <FormWirausaha form={form} setForm={setForm} wirausaha={wirausaha} setWirausaha={setWirausaha} bidangUsahaList={bidangUsahaList} bidangUsahaMap={bidangUsahaMap} provinsiList={provinsiList} kotaUsahaList={kotaUsahaList} loadingProvinsi={loadingProvinsi} loadingKotaUsaha={loadingKotaUsaha} loadKota={loadKota} renderTahunDinamis={renderTahunDinamis} setShowUsahaMap={setShowUsahaMap} />
              </div>
            )}

          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-primary/10">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer">Batal</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan <span className='hidden md:block'>Status</span>
            </button>
          </div>
        </div>
      )}

      {/* MAPS LOCATION PICKER */}
      <LocationPicker
        isOpen={showBekerjaMap}
        onClose={() => setShowBekerjaMap(false)}
        onConfirm={({ latitude, longitude, address, provinceRaw, cityRaw }) => {
          setForm((prev) => ({ ...prev, latitude_perusahaan: latitude, longitude_perusahaan: longitude }));
          setPekerjaan((prev) => ({ ...prev, jalan: address || prev.jalan }));
          // Auto-sync provinsi & kota jika berbeda
          if (provinceRaw) {
            const matchedProv = provinsiList.find(p =>
              (p.nama || p.nama_provinsi || '').toLowerCase().includes(provinceRaw.toLowerCase()) ||
              provinceRaw.toLowerCase().includes((p.nama || p.nama_provinsi || '').toLowerCase())
            );
            if (matchedProv) {
              if (String(matchedProv.id) !== String(pekerjaan.id_provinsi)) {
                setPekerjaan((prev) => ({ ...prev, id_provinsi: String(matchedProv.id), id_kota: cityRaw || '' }));
                loadKota(matchedProv.id, 'pekerjaan').then((kotaData) => {
                  if (cityRaw && kotaData) {
                    const matchedKota = kotaData.find(k =>
                      (k.nama || k.nama_kota || '').toLowerCase().includes(cityRaw.toLowerCase()) ||
                      cityRaw.toLowerCase().includes((k.nama || k.nama_kota || '').toLowerCase())
                    );
                    if (matchedKota) setPekerjaan((prev) => ({ ...prev, id_kota: String(matchedKota.id) }));
                    else setPekerjaan((prev) => ({ ...prev, id_kota: cityRaw }));
                  }
                });
              } else if (cityRaw) {
                const matchedKota = kotaPekerjaanList.find(k =>
                  (k.nama || k.nama_kota || '').toLowerCase().includes(cityRaw.toLowerCase()) ||
                  cityRaw.toLowerCase().includes((k.nama || k.nama_kota || '').toLowerCase())
                );
                if (matchedKota) {
                  if (String(matchedKota.id) !== String(pekerjaan.id_kota)) {
                    setPekerjaan((prev) => ({ ...prev, id_kota: String(matchedKota.id) }));
                  }
                } else setPekerjaan((prev) => ({ ...prev, id_kota: cityRaw }));
              }
            } else {
              setPekerjaan((prev) => ({ ...prev, id_provinsi: provinceRaw, id_kota: cityRaw || '' }));
            }
          } else if (cityRaw) {
            setPekerjaan((prev) => ({ ...prev, id_kota: cityRaw }));
          }
        }}
        initialLat={typeof form.latitude_perusahaan === 'number' ? form.latitude_perusahaan : -7.25}
        initialLng={typeof form.longitude_perusahaan === 'number' ? form.longitude_perusahaan : 112.75}
        selectedKota={kotaPekerjaanList.find(k => String(k.id) === String(pekerjaan.id_kota))?.nama || ''}
        selectedProvinsi={provinsiList.find(p => String(p.id) === String(pekerjaan.id_provinsi))?.nama || ''}
        initialAddress={pekerjaan.jalan || ''}
        title="Pilih Lokasi Perusahaan"
      />
      <LocationPicker
        isOpen={showUniMap}
        onClose={() => setShowUniMap(false)}
        onConfirm={({ latitude, longitude, address, provinceRaw, cityRaw }) => {
          setForm((prev) => ({ ...prev, latitude_universitas: latitude, longitude_universitas: longitude }));
          setUniversitas((prev) => ({ ...prev, alamat: address || prev.alamat }));
          // Auto-sync provinsi & kota jika berbeda
          if (provinceRaw) {
            const matchedProv = provinsiList.find(p =>
              (p.nama || p.nama_provinsi || '').toLowerCase().includes(provinceRaw.toLowerCase()) ||
              provinceRaw.toLowerCase().includes((p.nama || p.nama_provinsi || '').toLowerCase())
            );
            if (matchedProv) {
              if (String(matchedProv.id) !== String(universitas.id_provinsi)) {
                setUniversitas((prev) => ({ ...prev, id_provinsi: String(matchedProv.id), id_kota: cityRaw || '' }));
                loadKota(matchedProv.id, 'kuliah').then((kotaData) => {
                  if (cityRaw && kotaData) {
                    const matchedKota = kotaData.find(k =>
                      (k.nama || k.nama_kota || '').toLowerCase().includes(cityRaw.toLowerCase()) ||
                      cityRaw.toLowerCase().includes((k.nama || k.nama_kota || '').toLowerCase())
                    );
                    if (matchedKota) setUniversitas((prev) => ({ ...prev, id_kota: String(matchedKota.id) }));
                    else setUniversitas((prev) => ({ ...prev, id_kota: cityRaw }));
                  }
                });
              } else if (cityRaw) {
                const matchedKota = kotaKuliahList.find(k =>
                  (k.nama || k.nama_kota || '').toLowerCase().includes(cityRaw.toLowerCase()) ||
                  cityRaw.toLowerCase().includes((k.nama || k.nama_kota || '').toLowerCase())
                );
                if (matchedKota) {
                  if (String(matchedKota.id) !== String(universitas.id_kota)) {
                    setUniversitas((prev) => ({ ...prev, id_kota: String(matchedKota.id) }));
                  }
                } else setUniversitas((prev) => ({ ...prev, id_kota: cityRaw }));
              }
            } else {
              setUniversitas((prev) => ({ ...prev, id_provinsi: provinceRaw, id_kota: cityRaw || '' }));
            }
          } else if (cityRaw) {
            setUniversitas((prev) => ({ ...prev, id_kota: cityRaw }));
          }
        }}
        initialLat={typeof form.latitude_universitas === 'number' ? form.latitude_universitas : -7.25}
        initialLng={typeof form.longitude_universitas === 'number' ? form.longitude_universitas : 112.75}
        selectedKota={kotaKuliahList.find(k => String(k.id) === String(universitas.id_kota))?.nama || ''}
        selectedProvinsi={provinsiList.find(p => String(p.id) === String(universitas.id_provinsi))?.nama || ''}
        initialAddress={universitas.alamat || ''}
        title="Pilih Lokasi Universitas"
      />
      <LocationPicker
        isOpen={showUsahaMap}
        onClose={() => setShowUsahaMap(false)}
        onConfirm={({ latitude, longitude, address, provinceRaw, cityRaw }) => {
          setForm((prev) => ({ ...prev, latitude_usaha: latitude, longitude_usaha: longitude }));
          setWirausaha((prev) => ({ ...prev, alamat: address || prev.alamat }));
          // Auto-sync provinsi & kota jika berbeda
          if (provinceRaw) {
            const matchedProv = provinsiList.find(p =>
              (p.nama || p.nama_provinsi || '').toLowerCase().includes(provinceRaw.toLowerCase()) ||
              provinceRaw.toLowerCase().includes((p.nama || p.nama_provinsi || '').toLowerCase())
            );
            if (matchedProv) {
              if (String(matchedProv.id) !== String(wirausaha.id_provinsi)) {
                setWirausaha((prev) => ({ ...prev, id_provinsi: String(matchedProv.id), id_kota: cityRaw || '' }));
                loadKota(matchedProv.id, 'usaha').then((kotaData) => {
                  if (cityRaw && kotaData) {
                    const matchedKota = kotaData.find(k =>
                      (k.nama || k.nama_kota || '').toLowerCase().includes(cityRaw.toLowerCase()) ||
                      cityRaw.toLowerCase().includes((k.nama || k.nama_kota || '').toLowerCase())
                    );
                    if (matchedKota) setWirausaha((prev) => ({ ...prev, id_kota: String(matchedKota.id) }));
                    else setWirausaha((prev) => ({ ...prev, id_kota: cityRaw }));
                  }
                });
              } else if (cityRaw) {
                const matchedKota = kotaUsahaList.find(k =>
                  (k.nama || k.nama_kota || '').toLowerCase().includes(cityRaw.toLowerCase()) ||
                  cityRaw.toLowerCase().includes((k.nama || k.nama_kota || '').toLowerCase())
                );
                if (matchedKota) {
                  if (String(matchedKota.id) !== String(wirausaha.id_kota)) {
                    setWirausaha((prev) => ({ ...prev, id_kota: String(matchedKota.id) }));
                  }
                } else setWirausaha((prev) => ({ ...prev, id_kota: cityRaw }));
              }
            } else {
              setWirausaha((prev) => ({ ...prev, id_provinsi: provinceRaw, id_kota: cityRaw || '' }));
            }
          } else if (cityRaw) {
            setWirausaha((prev) => ({ ...prev, id_kota: cityRaw }));
          }
        }}
        initialLat={typeof form.latitude_usaha === 'number' ? form.latitude_usaha : -7.25}
        initialLng={typeof form.longitude_usaha === 'number' ? form.longitude_usaha : 112.75}
        selectedKota={kotaUsahaList.find(k => String(k.id) === String(wirausaha.id_kota))?.nama || ''}
        selectedProvinsi={provinsiList.find(p => String(p.id) === String(wirausaha.id_provinsi))?.nama || ''}
        initialAddress={wirausaha.alamat || ''}
        title="Pilih Lokasi Usaha"
      />

      {/* PANGGIL KOMPONEN INFO KARIER SAAT INI */}
      <InfoKarierSaatIni
        career={career}
        careerInfo={careerInfo}
        showForm={showForm}
        currentNeedsCompletion={currentNeedsCompletion}
        isVerified={isVerified}
        editingEndDate={editingEndDate}
        setEditingEndDate={setEditingEndDate}
        endDateValue={endDateValue}
        setEndDateValue={setEndDateValue}
        getEndYearsOptions={getEndYearsOptions}
        handleUpdateEndDate={handleUpdateEndDate}
        saving={saving}
      />

      {!careerInfo && !showForm && (
        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 mb-6 bg-white text-center">
          <Briefcase size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400">Belum ada status karier. Klik "Tambahkan status baru" untuk memulai.</p>
        </div>
      )}

      {/* PANGGIL KOMPONEN RIWAYAT KARIER */}
      <RiwayatStatusKarier riwayat={riwayat} />
    </div>
  );
}