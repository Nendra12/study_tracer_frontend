import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Image as ImageIcon, Loader2, Search, Plus, ChevronDown, Check, MapPin, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { alumniApi } from '../../api/alumni';
import { masterDataApi } from '../../api/masterData';
import { useAuth } from '../../context/AuthContext';
import { STORAGE_BASE_URL } from '../../api/axios';
import SmoothDropdown from '../../components/admin/SmoothDropdown';
import LocationPicker from '../../components/common/LocationPicker';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { toastWarning, alertSuccess, alertError } from '../../utilitis/alert';

export default function TambahLowonganPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const isEditMode = false; // Page is only for adding for now

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
    nomor_kontak: [''], // ARRAY UNTUK MULTIPLE CONTACTS
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
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // --- DATA DARI API ---
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [loadingProvinsi, setLoadingProvinsi] = useState(false);
  const [loadingKota, setLoadingKota] = useState(false);
  const [perusahaanMaster, setPerusahaanMaster] = useState([]);

  // --- CUSTOM COMPANY DROPDOWN STATE ---
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const companyRef = useRef(null);

  const [skillsList, setSkillsList] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [creatingSkill, setCreatingSkill] = useState(false);
  
  // STATE MAP
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
      if (companyRef.current && !companyRef.current.contains(e.target)) {
        setCompanyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Provinsi & Skills saat halaman dibuka
  useEffect(() => {
    const fetchMasterData = async () => {
      setLoadingProvinsi(true);
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
      } finally {
        setLoadingProvinsi(false);
      }
    };
    fetchMasterData();
  }, []);

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

  // Inisialisasi State Saat Mount
  useEffect(() => {
    setFormData({
      judul: '', perusahaan: '', tanggal_berakhir: '', deskripsi: '', nomor_kontak: [''],
      id_perusahaan: '', alamat_perusahaan: '', tipe_pekerjaan: '', lokasi: '', foto: null, id_provinsi: '', id_kota: '',
      latitude_perusahaan: null, longitude_perusahaan: null,
      jam_mulai: '', jam_berakhir: '',
    });
    setSelectedSkills([]);
    setPreviewUrl(null);
    setErrors({});
    setSubmitError(null);
    setSkillSearch('');
    setCompanySearchTerm('');
  }, []);

  const isExistingCompany = Boolean(formData.id_perusahaan);

  const handleOpenMap = () => {
    setShowLocationPicker(true);
  };

  // --- HANDLER CUSTOM COMPANY DROPDOWN ---
  const filteredCompanies = perusahaanMaster.filter(p =>
    (p.nama || p.nama_perusahaan || '').toLowerCase().includes(companySearchTerm.toLowerCase())
  );

  const handleCompanySelect = (comp) => {
    setFormData(prev => ({
      ...prev,
      perusahaan: comp.nama || comp.nama_perusahaan,
      id_perusahaan: String(comp.id),
      alamat_perusahaan: comp.jalan || prev.alamat_perusahaan,
      latitude_perusahaan: comp.latitude ?? prev.latitude_perusahaan,
      longitude_perusahaan: comp.longitude ?? prev.longitude_perusahaan,
    }));
    setCompanyDropdownOpen(false);
    setCompanySearchTerm('');
    if (errors.perusahaan) setErrors(prev => ({ ...prev, perusahaan: undefined }));
  };

  const handleAddCustomCompany = () => {
    setFormData(prev => ({
      ...prev,
      perusahaan: companySearchTerm.trim(),
      id_perusahaan: '', 
      latitude_perusahaan: null, 
      longitude_perusahaan: null,
    }));
    setCompanyDropdownOpen(false);
    setCompanySearchTerm('');
    if (errors.perusahaan) setErrors(prev => ({ ...prev, perusahaan: undefined }));
  };

  // --- SKILL HELPERS ---
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
    const exists = skillsList.find(s => (s.nama || s.name || '').toLowerCase() === skillSearch.trim().toLowerCase());
    if (exists) { addSkill(exists); return; }

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

  // --- HANDLER NOMOR KONTAK ---
  const handleContactChange = (index, value) => {
    const newContacts = [...formData.nomor_kontak];
    newContacts[index] = value;
    setFormData(prev => ({ ...prev, nomor_kontak: newContacts }));
    if (errors[`nomor_kontak_${index}`]) {
      setErrors(prev => ({ ...prev, [`nomor_kontak_${index}`]: undefined }));
    }
  };

  const addContact = () => {
    // Pastikan maksimal hanya 3 kontak yang bisa ditambahkan
    if (formData.nomor_kontak.length < 3) {
      setFormData(prev => ({ ...prev, nomor_kontak: [...prev.nomor_kontak, ''] }));
    }
  };

  const removeContact = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      nomor_kontak: prev.nomor_kontak.filter((_, i) => i !== index) 
    }));
    if (errors[`nomor_kontak_${index}`]) {
      setErrors(prev => ({ ...prev, [`nomor_kontak_${index}`]: undefined }));
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
    let newErrors = {};
    if (!formData.judul.trim()) newErrors.judul = 'Job Title wajib diisi';
    if (!formData.perusahaan.trim()) newErrors.perusahaan = 'Nama Perusahaan wajib diisi';
    if (!formData.tanggal_berakhir) newErrors.tanggal_berakhir = 'Tanggal Berakhir wajib diisi';
    if (!formData.jam_mulai) newErrors.jam_mulai = 'Jam Mulai wajib diisi';
    if (!formData.jam_berakhir) newErrors.jam_berakhir = 'Jam Berakhir wajib diisi';
    if (!formData.tipe_pekerjaan) newErrors.tipe_pekerjaan = 'Tipe Pekerjaan wajib dipilih';
    
    if (!isExistingCompany) {
      if (!formData.id_provinsi) newErrors.id_provinsi = 'Provinsi wajib dipilih';
      if (!formData.id_kota) newErrors.id_kota = 'Kota wajib dipilih';
      if (!formData.alamat_perusahaan?.trim()) newErrors.alamat_perusahaan = 'Alamat perusahaan wajib diisi';
    }
    if (!formData.deskripsi.trim() || formData.deskripsi === '<p></p>') newErrors.deskripsi = 'Deskripsi wajib diisi';

    // VALIDASI ARRAY NOMOR KONTAK
    const validContacts = [];
    formData.nomor_kontak.forEach((kontak, idx) => {
      const trimmed = kontak.trim();
      if (!trimmed) {
        if (idx === 0 && formData.nomor_kontak.length === 1) {
          newErrors[`nomor_kontak_${idx}`] = 'Nomor kontak wajib diisi';
        }
        return;
      }
      
      if (!/^[\d\s+\-()]+$/.test(trimmed)) {
        newErrors[`nomor_kontak_${idx}`] = 'Format tidak valid (hanya angka dan simbol +, -, ())';
        return;
      }
      
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length < 10) {
        newErrors[`nomor_kontak_${idx}`] = 'Minimal 10 angka';
      } else if (digits.length > 13) {
        newErrors[`nomor_kontak_${idx}`] = 'Maksimal 13 angka';
      } else {
        validContacts.push(trimmed);
      }
    });

    if (Object.keys(newErrors).length === 0 && validContacts.length === 0) {
      newErrors['nomor_kontak_0'] = 'Minimal ada satu nomor kontak yang diisi';
    }

    if (!isEditMode && !formData.foto) {
      newErrors.foto = 'Gambar/Banner wajib diunggah';
    } else if (isEditMode && !previewUrl) {
      newErrors.foto = 'Gambar/Banner wajib diunggah';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      document.querySelector('.custom-modal-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      // Mengirimkan kontak sebagai string yang dipisah koma
      fd.append('nomor_kontak', validContacts.join(', '));
      
      fd.append('kebutuhan_lainnya', ''); // Kosongkan karena digabung dengan deskripsi
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
        await alumniApi.updateLowongan(editJob.id, fd); 
        alertSuccess('Lowongan kerja berhasil diperbarui!');
      } else {
        await alumniApi.submitLowongan(fd);
        alertSuccess('Lowongan kerja berhasil dikirim dan menunggu persetujuan admin!');
      }

      navigate('/alumni/lowongan');
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
        if (validationErrors.nomor_kontak) mapped.nomor_kontak_0 = validationErrors.nomor_kontak[0];
        
        setErrors(mapped);
        document.querySelector('.custom-modal-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError(err.response?.data?.message || 'Gagal mengirim lowongan. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Standarisasi kelas Input CSS
  const inputClass = (err) => `w-full h-[48px] px-4 bg-slate-50 border ${err ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-all`;
  const textareaClass = (err) => `w-full p-4 bg-slate-50 border ${err ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[120px]`;
  const dropdownWrapperClass = "relative focus-within:z-[100] [&>div]:!space-y-0 [&_label]:!block [&_label]:!mb-2.5 [&_label]:!text-[11px] [&_label]:!font-black [&_label]:!text-primary [&_label]:!uppercase [&_label]:!tracking-widest [&_button]:!mt-0 [&_button]:!h-[48px] [&_button]:!px-4 [&_button]:!py-0 [&_button]:!bg-slate-50 [&_button]:!border [&_button]:!border-slate-200 [&_button]:!rounded-xl [&_button_span]:!font-semibold [&_button_span]:!text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">

        <div className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col relative">
          
          {/* KONTEN UTAMA */}
          <div className="p-6 md:p-8 space-y-8 flex-1">

          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-bold">
              {submitError}
            </div>
          )}

          {/* Upload Foto */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-primary uppercase tracking-widest block">
              Gambar / Banner <span className="text-red-500">*</span>
            </label>
            <div className={`flex flex-col sm:flex-row items-center gap-6 p-6 border-2 border-dashed ${errors.foto ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-gray-50/50'} rounded-2xl`}>
              <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden shadow-sm shrink-0 relative group">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    <button onClick={() => { setFormData(prev => ({ ...prev, foto: null })); setPreviewUrl(null); }} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <X size={20} className="text-white" />
                    </button>
                  </>
                ) : <ImageIcon size={32} className="text-gray-300" />}
              </div>
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <p className="text-xs text-gray-500 font-medium">Silakan unggah gambar persegi, ukuran maks 2MB.</p>
                <label className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer hover:bg-slate-50 transition-all text-sm shadow-sm inline-block">
                  Pilih File
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>
            {errors.foto && <p className="text-xs text-red-500 font-medium mt-1">{errors.foto}</p>}
          </div>

          <div className="space-y-6">
            
            <div className="relative z-[50]">
              <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2.5 block">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input name="judul" value={formData.judul} onChange={handleInputChange} placeholder="Contoh: Senior Product Designer" className={inputClass(errors.judul)} />
              {errors.judul && <p className="text-xs text-red-500 font-medium mt-1">{errors.judul}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-[45]">
              {/* DROPDOWN PERUSAHAAN CUSTOM */}
              <div className="w-full relative z-[100]" ref={companyRef}>
                <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2.5 block">
                  Nama Perusahaan <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                  className={`cursor-pointer w-full h-[48px] px-4 bg-slate-50 border ${errors.perusahaan ? 'border-red-400' : 'border-slate-200'} flex items-center justify-between rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-primary/20`}
                >
                  <span className={formData.perusahaan ? 'text-slate-700 font-semibold truncate' : 'text-gray-400 font-semibold truncate'}>
                    {formData.perusahaan || 'Pilih atau ketik nama perusahaan'}
                  </span>
                  <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform duration-300 ${companyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {companyDropdownOpen && (
                  <div className="absolute z-[120] top-[105%] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                      <Search size={14} className="text-gray-400 ml-1 shrink-0" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Cari..."
                        className="w-full bg-transparent text-sm outline-none p-1 font-medium text-slate-700"
                        value={companySearchTerm}
                        onChange={(e) => setCompanySearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (companySearchTerm.trim() && !filteredCompanies.some(c => (c.nama||c.nama_perusahaan)?.toLowerCase() === companySearchTerm.trim().toLowerCase())) {
                              handleAddCustomCompany();
                            }
                          }
                        }}
                      />
                    </div>
                    <ul className="py-1 max-h-48 overflow-y-auto custom-scrollbar">
                      {filteredCompanies.length > 0 && filteredCompanies.map(comp => (
                        <li key={comp.id} onClick={() => handleCompanySelect(comp)} className="px-4 py-2.5 text-sm font-medium cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors flex justify-between items-center">
                          <span className={`truncate ${formData.id_perusahaan === String(comp.id) ? "font-bold text-primary" : ""}`}>
                            {comp.nama || comp.nama_perusahaan}
                          </span>
                          {formData.id_perusahaan === String(comp.id) && <Check size={16} className="text-primary shrink-0 ml-2" />}
                        </li>
                      ))}

                      {companySearchTerm.trim() && !filteredCompanies.some(c => (c.nama||c.nama_perusahaan)?.toLowerCase() === companySearchTerm.trim().toLowerCase()) && (
                        <li onClick={handleAddCustomCompany} className="px-4 py-3 text-sm text-primary font-bold cursor-pointer hover:bg-primary/5 flex items-center gap-2 border-t border-gray-50">
                          <Plus size={14} className="shrink-0" />
                          <span className="truncate">Tambahkan "{companySearchTerm.trim()}"</span>
                        </li>
                      )}

                      {filteredCompanies.length === 0 && !companySearchTerm.trim() && (
                        <li className="px-4 py-3 text-xs text-gray-400 italic font-medium text-center">Ketik untuk mencari...</li>
                      )}
                    </ul>
                  </div>
                )}
                {errors.perusahaan && <p className="text-xs text-red-500 font-medium mt-1">{errors.perusahaan}</p>}
              </div>

              <div className="relative z-[90]">
                <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2.5 block">
                  Tanggal Berakhir <span className="text-red-500">*</span>
                </label>
                <input type="date" name="tanggal_berakhir" value={formData.tanggal_berakhir} min={minDate} onChange={handleInputChange} className={inputClass(errors.tanggal_berakhir)} />
                {errors.tanggal_berakhir && <p className="text-xs text-red-500 font-medium mt-1">{errors.tanggal_berakhir}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-[40]">
              <div className="relative">
                <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2.5 block">
                  Jam Mulai <span className="text-red-500">*</span>
                </label>
                <input type="time" name="jam_mulai" value={formData.jam_mulai} onChange={handleInputChange} className={inputClass(errors.jam_mulai)} />
                {errors.jam_mulai && <p className="text-xs text-red-500 font-medium mt-1">{errors.jam_mulai}</p>}
              </div>
              <div className="relative">
                <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2.5 block">
                  Jam Berakhir <span className="text-red-500">*</span>
                </label>
                <input type="time" name="jam_berakhir" value={formData.jam_berakhir} onChange={handleInputChange} className={inputClass(errors.jam_berakhir)} />
                {errors.jam_berakhir && <p className="text-xs text-red-500 font-medium mt-1">{errors.jam_berakhir}</p>}
              </div>
            </div>

            <div className={`z-[35] ${dropdownWrapperClass}`}>
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
              {errors.tipe_pekerjaan && <p className="text-xs text-red-500 font-medium mt-1">{errors.tipe_pekerjaan}</p>}
            </div>

            {/* FORM TAMBAHAN JIKA PERUSAHAAN BARU */}
            {!isExistingCompany && formData.perusahaan.trim() !== '' && (
              <div className="p-6 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-6 relative z-[30] animate-in slide-in-from-top-4 duration-300">
                <p className="text-[11px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg inline-block">PERUSAHAAN BARU, MOHON LENGKAPI ALAMAT:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-[25]">
                  <div className={`z-[50] ${dropdownWrapperClass}`}>
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
                    {errors.id_provinsi && <p className="text-xs text-red-500 font-medium mt-1">{errors.id_provinsi}</p>}
                  </div>

                  <div className={`z-[40] ${dropdownWrapperClass}`}>
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
                    {errors.id_kota && <p className="text-xs text-red-500 font-medium mt-1">{errors.id_kota}</p>}
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2.5 block">
                    Alamat Perusahaan Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 items-start">
                    <input
                      name="alamat_perusahaan"
                      value={formData.alamat_perusahaan}
                      onChange={handleInputChange}
                      placeholder="Johnson Springs, Kabupaten Kotawaringin Timur"
                      className={`${inputClass(errors.alamat_perusahaan)} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={handleOpenMap}
                      className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 h-[48px] text-xs font-bold text-white transition hover:bg-primary/80 cursor-pointer shadow-sm"
                    >
                      <MapPin size={16} />
                      <span className="hidden sm:inline">Pilih di Peta</span>
                    </button>
                  </div>
                  {formData.latitude_perusahaan !== null && formData.longitude_perusahaan !== null && (
                    <p className="text-xs text-emerald-600 mt-2 font-bold flex items-center gap-1">
                      <Check size={12} strokeWidth={3} /> Koordinat peta tersimpan
                    </p>
                  )}
                  {errors.alamat_perusahaan && <p className="text-xs text-red-500 font-medium mt-1">{errors.alamat_perusahaan}</p>}
                </div>
              </div>
            )}

            {/* BAGIAN SKILLS */}
            <div className="relative z-[20] focus-within:z-[100]" ref={skillDropdownRef}>
              <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2.5 block">
                Skills <span className="normal-case opacity-70 font-medium">(Opsional)</span>
              </label>

              <div className="flex flex-wrap gap-2 mb-3">
                {selectedSkills.map(skill => (
                  <span key={skill.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary text-xs font-bold rounded-lg border border-primary/10">
                    {skill.nama}
                    <button type="button" onClick={() => removeSkill(skill.id)} className="hover:text-red-500 cursor-pointer ml-1">
                      <X size={14} strokeWidth={3} />
                    </button>
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
                        if (skillSearch && filteredSkills.length === 0) handleCreateSkill();
                      }
                    }}
                    placeholder="Cari dan pilih skill..."
                    className="w-full h-[48px] pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    disabled={creatingSkill}
                  />
                  {showSkillDropdown && (
                    <div className="absolute z-[120] top-[105%] left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto py-2">
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
                        <div className="px-4 py-3 text-xs text-gray-400 italic font-medium text-center">Ketik untuk mencari atau menambah skill</div>
                      )}
                    </div>
                  )}
                </div>
                
                {skillSearch && filteredSkills.length === 0 && (
                  <button
                    type="button"
                    onClick={handleCreateSkill}
                    disabled={creatingSkill}
                    className="flex items-center gap-1.5 px-6 h-[48px] bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:bg-primary/80 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {creatingSkill ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    <span className="hidden sm:inline">Tambah</span>
                  </button>
                )}
              </div>
            </div>

            <div className="relative z-[10]">
              <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2.5 block">
                Deskripsi, Kualifikasi & Kebutuhan Lainnya <span className="text-red-500">*</span>
              </label>
              <div className={errors.deskripsi ? 'ring-2 ring-red-400 rounded-xl' : ''}>
                <RichTextEditor
                  content={formData.deskripsi}
                  onChange={(html) => setFormData(prev => ({ ...prev, deskripsi: html }))}
                  placeholder="Jelaskan peran, tanggung jawab, kualifikasi, syarat khusus, benefit tambahan..."
                  minHeight="200px"
                />
              </div>
              {errors.deskripsi && <p className="text-xs text-red-500 font-medium mt-1">{errors.deskripsi}</p>}
            </div>

            {/* KOMPONEN INPUT NOMOR KONTAK DINAMIS */}
            <div className="relative z-[5]">
              <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2.5 block">
                Nomor Kontak <span className="text-red-500">*</span>
              </label>
              <div className="space-y-4">
                {formData.nomor_kontak.map((kontak, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1">
                        <input 
                          value={kontak} 
                          onChange={(e) => handleContactChange(idx, e.target.value)} 
                          placeholder="Contoh: 08123456789" 
                          className={inputClass(errors[`nomor_kontak_${idx}`])} 
                        />
                      </div>
                      
                      {formData.nomor_kontak.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContact(idx)}
                          className="flex shrink-0 items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors cursor-pointer h-[48px] w-[48px]"
                          title="Hapus Nomor Kontak"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                    {/* Pesan Error ditempatkan mengalir (relative) di bawah input */}
                    {errors[`nomor_kontak_${idx}`] && (
                      <p className="text-xs text-red-500 font-medium mt-1.5 ml-1">
                        {errors[`nomor_kontak_${idx}`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Tombol hanya muncul jika jumlah kontak kurang dari 3 */}
              {formData.nomor_kontak.length < 3 && (
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={addContact}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer px-1"
                  >
                    <Plus size={14} strokeWidth={3} /> Tambah Nomor Kontak Lain
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer / Tombol Aksi */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50 sticky bottom-0 z-[110]">
          <button onClick={() => navigate('/alumni/lowongan')} disabled={submitting} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm cursor-pointer">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer text-sm">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <>Kirim <Send size={16} /></>}
          </button>
        </div>
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
        selectedKota={kotaList.find(k => String(k.id) === String(formData.id_kota))?.nama || ''}
        selectedProvinsi={provinsiList.find(p => String(p.id) === String(formData.id_provinsi))?.nama || ''}
        initialAddress={formData.alamat_perusahaan || ''}
        title="Pilih Lokasi Perusahaan"
      />
    </div>
  );
}