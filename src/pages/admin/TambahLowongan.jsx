import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Image as ImageIcon, Loader2, Search, Plus, MapPin } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { masterDataApi } from '../../api/masterData';
import { useAuth } from '../../context/AuthContext';
import { STORAGE_BASE_URL } from '../../api/axios';
import SmoothDropdown from '../../components/admin/SmoothDropdown';
import LocationPicker from '../../components/common/LocationPicker';
import { toastWarning, alertSuccess } from '../../utilitis/alert';

const TambahLowongan = ({ isOpen, onClose, onSuccess, editJob = null }) => {
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
    lokasi: '',
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
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [loadingProvinsi, setLoadingProvinsi] = useState(false);
  const [loadingKota, setLoadingKota] = useState(false);
  const [perusahaanMaster, setPerusahaanMaster] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // --- SKILLS STATE ---
  const [skillsList, setSkillsList] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [creatingSkill, setCreatingSkill] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const skillDropdownRef = useRef(null);

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

  // --- 1. SINKRONISASI DATA SAAT EDIT ---
  useEffect(() => {
    if (editJob && isOpen) {
      const cityId = editJob.id_kota
        ? String(editJob.id_kota)
        : editJob.perusahaan?.kota?.id
          ? String(editJob.perusahaan.kota.id)
          : '';
      const provinceId = editJob.id_provinsi
        ? String(editJob.id_provinsi)
        : editJob.perusahaan?.kota?.provinsi?.id
          ? String(editJob.perusahaan.kota.provinsi.id)
          : '';

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
        id_provinsi: provinceId,
        id_kota: cityId,
        latitude_perusahaan: editJob.latitude_perusahaan ?? editJob.perusahaan?.latitude ?? null,
        longitude_perusahaan: editJob.longitude_perusahaan ?? editJob.perusahaan?.longitude ?? null,
        jam_mulai: formatTime(editJob.jam_mulai),
        jam_berakhir: formatTime(editJob.jam_berakhir),
      });

      const fotoPath = editJob.foto_lowongan || editJob.foto;
      setPreviewUrl(fotoPath ? `${STORAGE_BASE_URL}/${fotoPath}` : null);

      if (editJob.skills && Array.isArray(editJob.skills)) {
        setSelectedSkills(editJob.skills.map(s => ({ id: s.id, nama: s.nama })));
      }
      setErrors({});
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
      setSkillSearch('');
    }
  }, [editJob, isOpen]);

  // Fetch Master Data
  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      setLoadingProvinsi(true);
      try {
        const [resProv, resSkills, resPerusahaan] = await Promise.all([
          masterDataApi.getProvinsi(),
          masterDataApi.getSkills(),
          masterDataApi.getPerusahaan().catch(() => ({ data: { data: [] } })),
        ]);
        setProvinsiList(resProv.data?.data || resProv.data || []);
        setSkillsList((resSkills.data?.data || resSkills.data || []).map(s => ({ id: s.id, nama: s.nama })));

        const rawPerusahaan = resPerusahaan.data?.data?.data || resPerusahaan.data?.data || resPerusahaan.data || [];
        setPerusahaanMaster(Array.isArray(rawPerusahaan) ? rawPerusahaan : []);
      } catch (err) {
        console.error("Failed to fetch master data", err);
      } finally {
        setLoadingProvinsi(false);
      }
    };
    fetchData();
  }, [isOpen]);

  // Fetch Kota otomatis saat id_provinsi berubah
  useEffect(() => {
    if (!formData.id_provinsi) {
      setKotaList([]);
      return;
    }
    const fetchKota = async () => {
      setLoadingKota(true);
      try {
        const res = await masterDataApi.getKota(formData.id_provinsi);
        setKotaList(res.data?.data || res.data || []);
      } catch {
        setKotaList([]);
      } finally {
        setLoadingKota(false);
      }
    };
    fetchKota();
  }, [formData.id_provinsi]);

  // --- SKILL HELPERS ---
  const filteredSkills = skillsList.filter(s =>
    s.nama.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !selectedSkills.some(sel => sel.id === s.id)
  );

  const addSkill = (skill) => {
    setSelectedSkills(prev => [...prev, skill]);
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
      s.nama.toLowerCase() === skillSearch.trim().toLowerCase()
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
      alert('Gagal membuat skill baru: ' + (err.response?.data?.message || err.message));
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
      alert("File terlalu besar (Maks 2MB)");
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
      if (!formData.alamat_perusahaan.trim()) newErrors.alamat_perusahaan = 'Alamat perusahaan wajib diisi untuk perusahaan baru';
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

    // Jika ada error, hentikan submit dan tampilkan pesan merah
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll ke atas agar user melihat error
      document.querySelector('.max-h-\\[90vh\\]')?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
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
        
        // Memanggil SweetAlert Sukses untuk Edit
        alertSuccess('Lowongan kerja berhasil diperbarui!');
      } else {
        if (isAdmin) fd.append('status', 'published');
        const res = await adminApi.createLowongan(fd);
        if (isAdmin && res.data?.data?.id) await adminApi.approveLowongan(res.data.data.id);
        
        // Memanggil SweetAlert Sukses untuk Tambah Baru
        alertSuccess('Lowongan kerja berhasil dipublikasikan!');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Submit lowongan failed:', err);
      
      // Jika error dari validasi backend (422)
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
        // Jika error sistem / server (500), tampilkan SweetAlert Error
        const msg = err.response?.data?.message || 'Gagal mengirim lowongan. Silakan coba lagi.';
        alertError(msg); 
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-primary">{isEditMode ? 'Edit Lowongan Kerja' : 'Pasang Lowongan Kerja'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-8">
          {/* Banner */}
          <div className="space-y-3">
            <span className="text-sm font-bold text-primary/80">Gambar / Banner <span className="text-red-500">*</span></span>
            <div className={`flex flex-col sm:flex-row items-center gap-6 p-6 border-2 border-dashed ${errors.foto ? 'border-red-400' : 'border-gray-100'} rounded-2xl bg-gray-50/30`}>
              <div className="w-32 h-32 sm:w-24 sm:h-24 bg-white rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden shadow-sm shrink-0 relative group">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      onClick={() => { setFormData(prev => ({ ...prev, foto: null })); setPreviewUrl(null); }}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      <X size={20} className="text-white" />
                    </button>
                  </>
                ) : (
                  <ImageIcon size={32} className="text-gray-300" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-xs text-gray-500 italic text-center sm:text-left">Silakan unggah gambar persegi, ukuran maks 2MB.</p>
                <label className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-xl cursor-pointer hover:bg-primary hover:text-white transition-all text-sm block sm:inline-block text-center">
                  Pilih File
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>
            {errors.foto && <p className="text-red-500 text-xs mt-1">{errors.foto[0]}</p>}
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Job Title <span className="text-red-500">*</span></label>
              <input name="judul" value={formData.judul} onChange={handleInputChange} placeholder="Contoh: Senior Product Designer" className={`w-full px-4 py-3 bg-gray-50 border ${errors.judul ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20`} />
              {errors.judul && <p className="text-red-500 text-xs mt-1">{errors.judul[0]}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Nama Perusahaan <span className="text-red-500">*</span></label>
                <input name="perusahaan" list="perusahaan-master-options-admin" value={formData.perusahaan} onChange={handleInputChange} placeholder="Ketik nama perusahaan atau pilih yang sudah ada" className={`w-full px-4 py-3 bg-gray-50 border ${errors.perusahaan ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20`} />
                <datalist id="perusahaan-master-options-admin">
                  {perusahaanMaster.map((item) => {
                    const nama = item.nama || item.nama_perusahaan;
                    return <option key={item.id} value={nama} />;
                  })}
                </datalist>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isExistingCompany ? 'Perusahaan existing terdeteksi: akan kirim id_perusahaan.' : 'Perusahaan baru: lengkapi alamat dan kota perusahaan.'}
                </p>
                {errors.perusahaan && <p className="text-red-500 text-xs mt-1">{errors.perusahaan[0]}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Tanggal Berakhir <span className="text-red-500">*</span></label>
                <input type="date" name="tanggal_berakhir" value={formData.tanggal_berakhir} min={minDate} onChange={handleInputChange} className={`w-full px-4 py-3 bg-gray-50 border ${errors.tanggal_berakhir ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20`} />
                {errors.tanggal_berakhir && <p className="text-red-500 text-xs mt-1">{errors.tanggal_berakhir[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Jam Mulai <span className="text-red-500">*</span></label>
                <input type="time" name="jam_mulai" value={formData.jam_mulai} onChange={handleInputChange} className={`w-full px-4 py-3 bg-gray-50 border ${errors.jam_mulai ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20`} />
                {errors.jam_mulai && <p className="text-red-500 text-xs mt-1">{errors.jam_mulai[0]}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Jam Berakhir <span className="text-red-500">*</span></label>
                <input type="time" name="jam_berakhir" value={formData.jam_berakhir} onChange={handleInputChange} className={`w-full px-4 py-3 bg-gray-50 border ${errors.jam_berakhir ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20`} />
                {errors.jam_berakhir && <p className="text-red-500 text-xs mt-1">{errors.jam_berakhir[0]}</p>}
              </div>
            </div>

            <div>
              <SmoothDropdown
                label={<>Tipe Pekerjaan <span className="text-red-500">*</span></>}
                placeholder="Pilih Tipe Pekerjaan"
                options={["Full-time", "Part-time", "Freelance", "Internship", "Contract"]}
                value={formData.tipe_pekerjaan || ""}
                onSelect={(val) => {
                  setFormData(prev => ({ ...prev, tipe_pekerjaan: val }));
                  if (errors.tipe_pekerjaan) setErrors(prev => ({ ...prev, tipe_pekerjaan: undefined }));
                }}
              />
              {errors.tipe_pekerjaan && <p className="text-red-500 text-xs mt-1">{errors.tipe_pekerjaan[0]}</p>}
            </div>

            {!isExistingCompany && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Alamat Perusahaan Baru <span className="text-red-500">*</span></label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    name="alamat_perusahaan"
                    value={formData.alamat_perusahaan}
                    onChange={handleInputChange}
                    placeholder="Masukkan alamat lengkap perusahaan"
                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.alamat_perusahaan ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20`}
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
                  <p className="text-xs text-emerald-600">
                    Koordinat tersimpan: {Number(formData.latitude_perusahaan).toFixed(5)}, {Number(formData.longitude_perusahaan).toFixed(5)}
                  </p>
                )}
                {errors.alamat_perusahaan && <p className="text-red-500 text-xs mt-1">{errors.alamat_perusahaan[0] || errors.alamat_perusahaan}</p>}
              </div>
            )}

            {/* --- DROPDOWN PROVINSI & KOTA MENGGUNAKAN SMOOTHDROPDOWN --- */}
            {!isExistingCompany && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <SmoothDropdown
                  label={<>Provinsi <span className="text-red-500">*</span></>}
                  isSearchable={true}
                  placeholder={loadingProvinsi ? "Memuat..." : "Pilih Provinsi"}
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
                {errors.id_provinsi && <p className="text-red-500 text-xs mt-1">{errors.id_provinsi[0]}</p>}
              </div>

              <div>
                <SmoothDropdown
                  label={<>Kota <span className="text-red-500">*</span></>}
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
                {errors.id_kota && <p className="text-red-500 text-xs mt-1">{errors.id_kota[0]}</p>}
              </div>
            </div>
            )}

            {/* --- BAGIAN SKILLS (SEARCHABLE & ADD NEW) --- */}
            <div className="space-y-1.5" ref={skillDropdownRef}>
              <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">
                Skills <span className="text-gray-400 font-normal text-[10px]">(opsional)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedSkills.map(skill => (
                  <span key={skill.id} className="flex items-center gap-1 px-2.5 py-1 bg-[#E8F0F0] text-primary text-xs font-bold rounded-lg border border-primary/20 shadow-sm">
                    {skill.nama}
                    <button type="button" onClick={() => removeSkill(skill.id)} className="hover:text-red-500 cursor-pointer ml-1">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                    placeholder="Cari atau ketik skill baru..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    disabled={creatingSkill}
                  />
                  {showSkillDropdown && (
                    <div className="absolute z-50 top-[105%] w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto py-1">
                      {filteredSkills.length > 0 ? (
                        filteredSkills.map(s => (
                          <div key={s.id} onClick={() => addSkill(s)} className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 hover:text-primary flex justify-between items-center">
                            {s.nama}
                          </div>
                        ))
                      ) : skillSearch.trim() ? (
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Deskripsi <span className="text-red-500">*</span></label>
              <textarea name="deskripsi" rows={4} value={formData.deskripsi} onChange={handleInputChange} placeholder="Deskripsi peran..." className={`w-full px-4 py-3 bg-gray-50 border ${errors.deskripsi ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm outline-none resize-none min-h-30 focus:ring-2 focus:ring-primary/20`} />
              {errors.deskripsi && <p className="text-red-500 text-xs mt-1">{errors.deskripsi[0]}</p>}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50">
          <button onClick={onClose} disabled={submitting} className="cursor-pointer text-sm font-bold text-gray-500 hover:text-gray-700 px-4">Batal</button>
          {/* PERUBAHAN: Menghapus penguncian disabled dari !formData.judul dll, agar bisa divalidasi errornya saat diklik */}
          <button onClick={handleSubmit} disabled={submitting} className="cursor-pointer flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/80 transition-all shadow-lg active:scale-95 disabled:opacity-50">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <>{isEditMode ? 'Perbarui' : 'Kirim'} <Send size={18} /></>}
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
};

export default TambahLowongan;