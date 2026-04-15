import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Image as ImageIcon, Loader2, Search, Plus, MapPin } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { masterDataApi } from '../../api/masterData';
import { useAuth } from '../../context/AuthContext';
import { STORAGE_BASE_URL } from '../../api/axios';
import SmoothDropdown from '../../components/admin/SmoothDropdown';
import LocationPicker from '../../components/common/LocationPicker';
import { toastWarning } from '../../utilitis/alert';

export default function TambahLowongan({ isOpen, onClose, onSuccess, editJob = null }) {
  const { isAdmin } = useAuth();
  const isEditMode = !!editJob;

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  const [formData, setFormData] = useState({
    judul: '',
    perusahaan: '',
    id_perusahaan: '',
    alamat_perusahaan: '',
    tanggal_berakhir: '',
    deskripsi: '',
    tipe_pekerjaan: '',
    lokasi: '', // Opsional jika sudah pakai id_kota/id_provinsi, tapi kita sesuaikan dengan API
    foto: null,
    id_provinsi: '',
    id_kota: '',
    latitude_perusahaan: null,
    longitude_perusahaan: null,
    jam_mulai: '',
    jam_berakhir: '',
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [minDate, setMinDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // --- DATA DARI API ---
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [loadingKota, setLoadingKota] = useState(false);
  const [perusahaanMaster, setPerusahaanMaster] = useState([]);

  const [skillsList, setSkillsList] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [creatingSkill, setCreatingSkill] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const skillDropdownRef = useRef(null);

  // Set Minimum Date + Click outside handler
  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    setMinDate(today.toISOString().split('T')[0]);

    const handleClickOutside = (e) => {
      if (skillDropdownRef.current && !skillDropdownRef.current.contains(e.target)) {
        setShowSkillDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Provinsi & Skills saat modal dibuka
  useEffect(() => {
    if (!isOpen) return;

    const fetchMasterData = async () => {
      try {
        const [provRes, skillsRes, perusahaanRes] = await Promise.all([
          masterDataApi.getProvinsi(),
          masterDataApi.getSkills(),
          masterDataApi.getPerusahaan().catch(() => ({ data: { data: [] } })),
        ]);
        const provData = provRes.data?.data || provRes.data || [];
        setProvinsiList(Array.isArray(provData) ? provData : []);

        const skillsData = skillsRes.data?.data || skillsRes.data || [];
        setSkillsList(Array.isArray(skillsData) ? skillsData : []);

        const rawPerusahaan = perusahaanRes.data?.data?.data || perusahaanRes.data?.data || perusahaanRes.data || [];
        setPerusahaanMaster(Array.isArray(rawPerusahaan) ? rawPerusahaan : []);
      } catch (err) {
        console.error('Failed to fetch master data:', err);
      }
    };
    fetchMasterData();
  }, [isOpen]);

  // Fetch Kota berdasarkan Provinsi
  useEffect(() => {
    if (!formData.id_provinsi) {
      setKotaList([]);
      return;
    }
    const fetchKota = async () => {
      setLoadingKota(true);
      try {
        const res = await masterDataApi.getKota(formData.id_provinsi);
        const data = res.data?.data || res.data || [];
        setKotaList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch kota:', err);
        setKotaList([]);
      } finally {
        setLoadingKota(false);
      }
    };
    fetchKota();
  }, [formData.id_provinsi]);

  // Sinkronisasi Form Saat Buka Modal
  useEffect(() => {
    if (editJob && isOpen) {
      setFormData({
        judul: editJob.judul || '',
        perusahaan: editJob.perusahaan?.nama || editJob.nama_perusahaan || '',
        id_perusahaan: editJob.id_perusahaan ? String(editJob.id_perusahaan) : (editJob.perusahaan?.id ? String(editJob.perusahaan.id) : ''),
        alamat_perusahaan: editJob.alamat_perusahaan || editJob.perusahaan?.jalan || '',
        tanggal_berakhir: editJob.lowongan_selesai || '',
        deskripsi: editJob.deskripsi || '',
        tipe_pekerjaan: editJob.tipe_pekerjaan || '',
        lokasi: editJob.lokasi || '',
        foto: null,
        id_provinsi: editJob.id_provinsi ? String(editJob.id_provinsi) : '',
        id_kota: editJob.id_kota ? String(editJob.id_kota) : '',
        latitude_perusahaan: editJob.latitude_perusahaan ?? editJob.perusahaan?.latitude ?? null,
        longitude_perusahaan: editJob.longitude_perusahaan ?? editJob.perusahaan?.longitude ?? null,
        jam_mulai: formatTime(editJob.jam_mulai),
        jam_berakhir: formatTime(editJob.jam_berakhir),
      });
      setPreviewUrl(editJob.foto ? `${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${editJob.foto}` : null);
      if (editJob.skills && Array.isArray(editJob.skills)) {
        setSelectedSkills(editJob.skills.map(s => ({ id: s.id, nama: s.nama })));
      }
      setErrors({});
      setSubmitError(null);
    } else if (!editJob && isOpen) {
      setFormData({
        judul: '', perusahaan: '', tanggal_berakhir: '', deskripsi: '',
        id_perusahaan: '', alamat_perusahaan: '', tipe_pekerjaan: '', lokasi: '', foto: null, id_provinsi: '', id_kota: '',
        latitude_perusahaan: null, longitude_perusahaan: null,
        jam_mulai: '', jam_berakhir: '',
      });
      setSelectedSkills([]);
      setPreviewUrl(null);
      setErrors({});
      setSubmitError(null);
      setSkillSearch('');
    }
  }, [editJob, isOpen]);

  // Skill Helpers
  const filteredSkills = skillsList.filter(s =>
    (s.nama || s.name || '').toLowerCase().includes(skillSearch.toLowerCase()) &&
    !selectedSkills.some(sel => sel.id === s.id)
  );

  const addSkill = (skill) => {
    setSelectedSkills(prev => [...prev, { id: skill.id, nama: skill.nama || skill.name }]);
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  const removeSkill = (skillId) => {
    setSelectedSkills(prev => prev.filter(s => s.id !== skillId));
  };

  const handleCreateSkill = async () => {
    if (!skillSearch.trim()) return;

    // Cek apakah skill sebenarnya sudah ada di daftar
    const exists = skillsList.find(s =>
      (s.nama || s.name || '').toLowerCase() === skillSearch.trim().toLowerCase()
    );

    if (exists) {
      addSkill(exists);
      return;
    }

    try {
      setCreatingSkill(true);
      const res = await masterDataApi.createSkill({ name_skills: skillSearch.trim() });
      const created = res.data?.data || res.data;

      if (created) {
        const newSkill = {
          id: created.id || created.id_skills,
          nama: created.nama_skill || created.nama || created.name || skillSearch.trim(),
        };

        setSkillsList(prev => [...prev, newSkill]);
        addSkill(newSkill);
      }
    } catch (err) {
      console.error('Gagal membuat skill baru:', err);
      toastWarning('Gagal membuat skill baru: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreatingSkill(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'perusahaan') {
      const matched = perusahaanMaster.find((p) => {
        const nama = p.nama || p.nama_perusahaan || '';
        return nama.toLowerCase() === value.trim().toLowerCase();
      });

      setFormData((prev) => ({
        ...prev,
        perusahaan: value,
        id_perusahaan: matched ? String(matched.id) : '',
        alamat_perusahaan: matched ? (matched.jalan || prev.alamat_perusahaan) : prev.alamat_perusahaan,
        latitude_perusahaan: matched ? (matched.latitude ?? null) : prev.latitude_perusahaan,
        longitude_perusahaan: matched ? (matched.longitude ?? null) : prev.longitude_perusahaan,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const isExistingCompany = Boolean(formData.id_perusahaan);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setFormData({ ...formData, foto: file });
      setPreviewUrl(URL.createObjectURL(file));
      if (errors.foto) setErrors(prev => ({ ...prev, foto: undefined }));
    } else if (file) {
      toastWarning("File terlalu besar (Maks 2MB)");
      e.target.value = null;
    }
  };

  // Submit ke API
  const handleSubmit = async () => {
    // 1. Validasi Manual
    let newErrors = {};
    if (!formData.judul.trim()) newErrors.judul = 'Job Title wajib diisi';
    if (!formData.perusahaan.trim()) newErrors.perusahaan = 'Nama Perusahaan wajib diisi';
    if (!formData.tanggal_berakhir) newErrors.tanggal_berakhir = 'Tanggal Berakhir wajib diisi';
    if (!formData.jam_mulai) newErrors.jam_mulai = 'Jam Mulai wajib diisi';
    if (!formData.jam_berakhir) newErrors.jam_berakhir = 'Jam Berakhir wajib diisi';
    if (!formData.tipe_pekerjaan) newErrors.tipe_pekerjaan = 'Tipe Pekerjaan wajib dipilih';
    if (!isExistingCompany) {
      if (!formData.alamat_perusahaan?.trim()) newErrors.alamat_perusahaan = 'Alamat perusahaan wajib diisi untuk perusahaan baru';
      if (!formData.id_provinsi) newErrors.id_provinsi = 'Provinsi wajib dipilih';
      if (!formData.id_kota) newErrors.id_kota = 'Kota wajib dipilih';
    }
    if (!formData.deskripsi.trim()) newErrors.deskripsi = 'Deskripsi wajib diisi';

    // Validasi Gambar
    if (!isEditMode && !formData.foto) {
      newErrors.foto = 'Gambar/Banner wajib diunggah';
    } else if (isEditMode && !previewUrl) {
      newErrors.foto = 'Gambar/Banner wajib diunggah';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll ke atas agar user melihat error
      document.querySelector('.max-h-\\[90vh\\]')?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setErrors({});

    try {
      const fd = new FormData();
      fd.append('judul_lowongan', formData.judul);
      if (isExistingCompany) {
        fd.append('id_perusahaan', formData.id_perusahaan);
      } else {
        fd.append('nama_perusahaan', formData.perusahaan);
        fd.append('alamat_perusahaan', formData.alamat_perusahaan || '');
        fd.append('id_kota', formData.id_kota || '');
        if (formData.latitude_perusahaan !== null && formData.latitude_perusahaan !== undefined) {
          fd.append('latitude_perusahaan', formData.latitude_perusahaan);
        }
        if (formData.longitude_perusahaan !== null && formData.longitude_perusahaan !== undefined) {
          fd.append('longitude_perusahaan', formData.longitude_perusahaan);
        }
      }
      fd.append('deskripsi', formData.deskripsi);
      fd.append('tipe_pekerjaan', formData.tipe_pekerjaan);
      fd.append('lowongan_selesai', formData.tanggal_berakhir);
      fd.append('jam_mulai', formData.jam_mulai);
      fd.append('jam_berakhir', formData.jam_berakhir);
      
      if (formData.foto instanceof File) {
        fd.append('foto_lowongan', formData.foto);
      }

      selectedSkills.forEach(skill => {
        fd.append('skills[]', skill.id);
      });

      if (isEditMode) {
        await adminApi.updateLowongan(editJob.id, fd);
      } else {
        if (isAdmin) fd.append('status', 'published');
        const res = await adminApi.createLowongan(fd);
        if (isAdmin && res.data?.data?.id) await adminApi.approveLowongan(res.data.data.id);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Submit lowongan failed:', err);
      if (err.response?.status === 422) {
        const validationErrors = err.response.data?.errors || {};
        const mapped = {};
        if (validationErrors.judul_lowongan) mapped.judul = validationErrors.judul_lowongan[0];
        if (validationErrors.nama_perusahaan) mapped.perusahaan = validationErrors.nama_perusahaan[0];
        if (validationErrors.id_perusahaan) mapped.perusahaan = validationErrors.id_perusahaan[0];
        if (validationErrors.alamat_perusahaan) mapped.alamat_perusahaan = validationErrors.alamat_perusahaan[0];
        if (validationErrors.deskripsi) mapped.deskripsi = validationErrors.deskripsi[0];
        if (validationErrors.tipe_pekerjaan) mapped.tipe_pekerjaan = validationErrors.tipe_pekerjaan[0];
        if (validationErrors.lokasi) mapped.lokasi = validationErrors.lokasi[0];
        if (validationErrors.lowongan_selesai) mapped.tanggal_berakhir = validationErrors.lowongan_selesai[0];
        if (validationErrors.jam_mulai) mapped.jam_mulai = validationErrors.jam_mulai[0];
        if (validationErrors.jam_berakhir) mapped.jam_berakhir = validationErrors.jam_berakhir[0];
        if (validationErrors.foto_lowongan) mapped.foto = validationErrors.foto_lowongan[0];
        if (validationErrors.id_kota) mapped.id_kota = validationErrors.id_kota[0];
        if (validationErrors.id_provinsi) mapped.id_provinsi = validationErrors.id_provinsi[0];
        if (validationErrors.skills) mapped.skills = validationErrors.skills[0];
        setErrors(mapped);
        document.querySelector('.max-h-\\[90vh\\]')?.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError(err.response?.data?.message || 'Gagal mengirim lowongan. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-black text-primary tracking-tight">
            {isEditMode ? 'Edit Lowongan Kerja' : 'Pasang Lowongan Kerja'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors cursor-pointer">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1">

          {/* Submit Error Alert */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
              {submitError}
            </div>
          )}

          {/* Upload Foto */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-primary uppercase tracking-widest block">
              Gambar / Banner <span className="text-red-500">*</span>
            </label>
            <div className={`flex flex-col sm:flex-row items-center gap-6 p-6 border-2 border-dashed ${errors.foto ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-gray-50/50'} rounded-2xl`}>
              <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden shadow-sm shrink-0">
                {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" /> : <ImageIcon size={32} className="text-gray-300" />}
              </div>
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <p className="text-xs text-gray-500 font-medium">Silakan unggah gambar persegi, ukuran maks 2MB.</p>
                <label className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer hover:bg-slate-50 transition-all text-sm shadow-sm inline-block">
                  Pilih File
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>
            {errors.foto && <p className="text-xs text-red-500 font-medium">{errors.foto}</p>}
          </div>

          <div className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2 block">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input name="judul" value={formData.judul} onChange={handleInputChange} placeholder="Contoh: Senior Product Designer" className={`w-full px-4 py-3.5 bg-slate-50 border ${errors.judul ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20`} />
              {errors.judul && <p className="text-xs text-red-500 font-medium mt-1">{errors.judul}</p>}
            </div>

            {/* Nama Perusahaan & Tanggal Berakhir */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2 block">
                  Nama Perusahaan <span className="text-red-500">*</span>
                </label>
                <input name="perusahaan" list="perusahaan-master-options-alumni" value={formData.perusahaan} onChange={handleInputChange} placeholder="Ketik nama perusahaan atau pilih yang sudah ada" className={`w-full px-4 py-3.5 bg-slate-50 border ${errors.perusahaan ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20`} />
                <datalist id="perusahaan-master-options-alumni">
                  {perusahaanMaster.map((item) => {
                    const nama = item.nama || item.nama_perusahaan;
                    return <option key={item.id} value={nama} />;
                  })}
                </datalist>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isExistingCompany ? 'Perusahaan existing terdeteksi: akan kirim id_perusahaan.' : 'Perusahaan baru: lengkapi alamat dan kota perusahaan.'}
                </p>
                {errors.perusahaan && <p className="text-xs text-red-500 font-medium mt-1">{errors.perusahaan}</p>}
              </div>
              <div>
                <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2 block">
                  Tanggal Berakhir <span className="text-red-500">*</span>
                </label>
                <input type="date" name="tanggal_berakhir" value={formData.tanggal_berakhir} min={minDate} onChange={handleInputChange} className={`w-full px-4 py-3.5 bg-slate-50 border ${errors.tanggal_berakhir ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20`} />
                {errors.tanggal_berakhir && <p className="text-xs text-red-500 font-medium mt-1">{errors.tanggal_berakhir}</p>}
              </div>
            </div>

            {/* Jam Mulai & Jam Berakhir */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2 block">
                  Jam Mulai <span className="text-red-500">*</span>
                </label>
                <input type="time" name="jam_mulai" value={formData.jam_mulai} onChange={handleInputChange} className={`w-full px-4 py-3.5 bg-slate-50 border ${errors.jam_mulai ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20`} />
                {errors.jam_mulai && <p className="text-xs text-red-500 font-medium mt-1">{errors.jam_mulai}</p>}
              </div>
              <div>
                <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2 block">
                  Jam Berakhir <span className="text-red-500">*</span>
                </label>
                <input type="time" name="jam_berakhir" value={formData.jam_berakhir} onChange={handleInputChange} className={`w-full px-4 py-3.5 bg-slate-50 border ${errors.jam_berakhir ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20`} />
                {errors.jam_berakhir && <p className="text-xs text-red-500 font-medium mt-1">{errors.jam_berakhir}</p>}
              </div>
            </div>

            {/* Tipe Pekerjaan */}
            <div className="relative z-60">
              <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2 block">
                Tipe Pekerjaan <span className="text-red-500">*</span>
              </label>
              <div className={`w-full ${errors.tipe_pekerjaan ? 'ring-2 ring-red-400 rounded-xl' : ''}`}>
                <SmoothDropdown
                  isSearchable={false}
                  placeholder="-- Pilih Tipe --"
                  options={['Full-time', 'Part-time', 'Freelance', 'Internship', 'Contract']}
                  value={formData.tipe_pekerjaan}
                  onSelect={(val) => {
                    setFormData(prev => ({ ...prev, tipe_pekerjaan: val }));
                    if (errors.tipe_pekerjaan) setErrors(prev => ({ ...prev, tipe_pekerjaan: undefined }));
                  }}
                />
              </div>
              {errors.tipe_pekerjaan && <p className="text-xs text-red-500 font-medium mt-1">{errors.tipe_pekerjaan}</p>}
            </div>

            {!isExistingCompany && (
              <div>
                <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2 block">
                  Alamat Perusahaan Baru <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    name="alamat_perusahaan"
                    value={formData.alamat_perusahaan}
                    onChange={handleInputChange}
                    placeholder="Masukkan alamat lengkap perusahaan"
                    className={`w-full px-4 py-3.5 bg-slate-50 border ${errors.alamat_perusahaan ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="flex shrink-0 items-center justify-center gap-1 rounded-xl bg-primary px-4 py-3 text-xs font-semibold text-white transition hover:bg-primary/80 cursor-pointer"
                  >
                    <MapPin size={14} />
                    Pilih di Peta
                  </button>
                </div>
                {formData.latitude_perusahaan !== null && formData.longitude_perusahaan !== null && (
                  <p className="mt-1 text-xs text-emerald-600">
                    Koordinat tersimpan: {Number(formData.latitude_perusahaan).toFixed(5)}, {Number(formData.longitude_perusahaan).toFixed(5)}
                  </p>
                )}
                {errors.alamat_perusahaan && <p className="text-xs text-red-500 font-medium mt-1">{errors.alamat_perusahaan}</p>}
              </div>
            )}

            {/* Area Lokasi (Provinsi & Kota) - hanya untuk perusahaan baru */}
            {!isExistingCompany && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-50">
              <div>
                <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2 block">
                  Provinsi <span className="text-red-500">*</span>
                </label>
                <div className={`w-full rounded-xl ${errors.id_provinsi ? 'ring-2 ring-red-400' : ''}`}>
                  <SmoothDropdown
                    isSearchable={true}
                    placeholder="Pilih Provinsi"
                    options={provinsiList.map(p => p.nama)}
                    value={provinsiList.find(p => String(p.id) === String(formData.id_provinsi))?.nama || ""}
                    onSelect={(namaProv) => {
                      const prov = provinsiList.find(p => p.nama === namaProv);
                      if (prov) {
                        setFormData({ ...formData, id_provinsi: String(prov.id), id_kota: '' });
                        if (errors.id_provinsi) setErrors(prev => ({ ...prev, id_provinsi: undefined }));
                      }
                    }}
                  />
                </div>
                {errors.id_provinsi && <p className="text-xs text-red-500 font-medium mt-1">{errors.id_provinsi}</p>}
              </div>

              <div>
                <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2 block">
                  Kota <span className="text-red-500">*</span>
                </label>
                <div className={`w-full rounded-xl ${errors.id_kota ? 'ring-2 ring-red-400' : ''}`}>
                  <SmoothDropdown
                    isSearchable={true}
                    placeholder={!formData.id_provinsi ? "Pilih provinsi dulu" : loadingKota ? "Memuat..." : "Pilih Kota"}
                    options={kotaList.map(k => k.nama)}
                    value={kotaList.find(k => String(k.id) === String(formData.id_kota))?.nama || ""}
                    onSelect={(namaKota) => {
                      const kota = kotaList.find(k => k.nama === namaKota);
                      if (kota) {
                        setFormData({ ...formData, id_kota: String(kota.id) });
                        if (errors.id_kota) setErrors(prev => ({ ...prev, id_kota: undefined }));
                      }
                    }}
                  />
                </div>
                {errors.id_kota && <p className="text-xs text-red-500 font-medium mt-1">{errors.id_kota}</p>}
              </div>
            </div>
            )}

            {/* Bagian Skills (TIDAK WAJIB) */}
            <div className="relative z-40" ref={skillDropdownRef}>
              <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2 block">
                Skills <span className="normal-case opacity-70">(Opsional)</span>
              </label>

              <div className="flex flex-wrap gap-2 mb-3">
                {selectedSkills.map(skill => (
                  <span key={skill.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary text-xs font-bold rounded-lg border border-primary/10">
                    {skill.nama}
                    <button type="button" onClick={() => removeSkill(skill.id)} className="hover:text-red-500 cursor-pointer ml-1"><X size={14} /></button>
                  </span>
                ))}
              </div>

              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => { setSkillSearch(e.target.value); setShowSkillDropdown(true); }}
                    onFocus={() => setShowSkillDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (skillSearch && filteredSkills.length === 0) {
                          handleCreateSkill();
                        }
                      }
                    }}
                    placeholder="Cari dan pilih skill..."
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                    disabled={creatingSkill}
                  />
                  {showSkillDropdown && (
                    <div className="absolute z-50 top-[105%] left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto py-2">
                      {filteredSkills.length > 0 ? filteredSkills.map(s => (
                        <div key={s.id} onClick={() => addSkill(s)} className="px-4 py-2.5 text-sm font-medium cursor-pointer hover:bg-slate-50 hover:text-primary">
                          {s.nama || s.name}
                        </div>
                      )) : skillSearch.trim() ? (
                        <div 
                          onClick={handleCreateSkill} 
                          className="px-4 py-3 text-sm text-primary font-bold cursor-pointer hover:bg-primary/5 flex items-center gap-2"
                        >
                          {creatingSkill ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                          Tambahkan "{skillSearch}" sebagai skill baru
                        </div>
                      ) : (
                        <div className="px-4 py-3 text-xs text-gray-400 italic text-center">Ketik untuk mencari atau menambah skill</div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Tombol Tambah Muncul Jika Skill Tidak Ditemukan */}
                {skillSearch && filteredSkills.length === 0 && (
                  <button
                    type="button"
                    onClick={handleCreateSkill}
                    disabled={creatingSkill}
                    className="flex items-center gap-1.5 px-4 py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary/80 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingSkill ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    <span className="hidden sm:inline">Tambah</span>
                  </button>
                )}
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2 block">
                Deskripsi & Kualifikasi Pekerjaan <span className="text-red-500">*</span>
              </label>
              <textarea name="deskripsi" rows={5} value={formData.deskripsi} onChange={handleInputChange} placeholder="Jelaskan peran, tanggung jawab..." className={`w-full px-5 py-4 bg-slate-50 border ${errors.deskripsi ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 resize-none`} />
              {errors.deskripsi && <p className="text-xs text-red-500 font-medium mt-1">{errors.deskripsi}</p>}
            </div>

          </div>
        </div>

        {/* Footer Modal / Tombol Aksi */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-white sticky bottom-0 z-10 rounded-b-3xl">
          <button onClick={onClose} disabled={submitting} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm cursor-pointer">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer text-sm">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <>{isEditMode ? 'Simpan' : 'Kirim'} <Send size={16} /></>}
          </button>
        </div>
      </div>

      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onConfirm={({ latitude, longitude, address }) => {
          setFormData((prev) => ({
            ...prev,
            alamat_perusahaan: address || prev.alamat_perusahaan,
            latitude_perusahaan: latitude,
            longitude_perusahaan: longitude,
          }));
          if (errors.alamat_perusahaan) {
            setErrors((prev) => ({ ...prev, alamat_perusahaan: undefined }));
          }
        }}
        initialLat={typeof formData.latitude_perusahaan === 'number' ? formData.latitude_perusahaan : -7.25}
        initialLng={typeof formData.longitude_perusahaan === 'number' ? formData.longitude_perusahaan : 112.75}
        title="Pilih Lokasi Perusahaan"
      />
    </div>
  );
}