import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Image as ImageIcon, Loader2, ChevronDown, Check, Search } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { masterDataApi } from '../../api/masterData';
import { useAuth } from '../../context/AuthContext';
import { STORAGE_BASE_URL } from '../../api/axios';
import SmoothDropdown from '../../components/admin/SmoothDropdown'; // Sesuaikan path ini

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
    tanggal_berakhir: '',
    deskripsi: '',
    tipe_pekerjaan: '',
    lokasi: '',
    foto: null,
    id_provinsi: '',
    id_kota: '',
    jam_mulai: '',
    jam_berakhir: '',
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [minDate, setMinDate] = useState('');
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [loadingProvinsi, setLoadingProvinsi] = useState(false);
  const [loadingKota, setLoadingKota] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // --- SKILLS STATE ---
  const [skillsList, setSkillsList] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
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
      const provinceId = editJob.id_provinsi ? String(editJob.id_provinsi) : '';
      const cityId = editJob.id_kota ? String(editJob.id_kota) : '';

      setFormData({
        judul: editJob.judul || '',
        perusahaan: editJob.perusahaan?.nama || editJob.nama_perusahaan || '',
        tanggal_berakhir: editJob.lowongan_selesai || '',
        deskripsi: editJob.deskripsi || '',
        tipe_pekerjaan: editJob.tipe_pekerjaan || '',
        lokasi: editJob.lokasi || '',
        foto: null,
        id_provinsi: provinceId,
        id_kota: cityId,
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
        tipe_pekerjaan: '', lokasi: '', foto: null, id_provinsi: '', id_kota: '',
        jam_mulai: '', jam_berakhir: '',
      });
      setSelectedSkills([]);
      setPreviewUrl(null);
      setErrors({});
    }
  }, [editJob, isOpen]);

  // Fetch Master Data
  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      setLoadingProvinsi(true);
      try {
        const [resProv, resSkills] = await Promise.all([
          masterDataApi.getProvinsi(),
          masterDataApi.getSkills()
        ]);
        setProvinsiList(resProv.data?.data || resProv.data || []);
        setSkillsList((resSkills.data?.data || resSkills.data || []).map(s => ({ id: s.id, nama: s.nama })));
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setFormData({ ...formData, foto: file });
      setPreviewUrl(URL.createObjectURL(file));
    } else if (file) {
      alert("File terlalu besar (Maks 2MB)");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('judul_lowongan', formData.judul);
      fd.append('nama_perusahaan', formData.perusahaan);
      if (formData.tipe_pekerjaan) fd.append('tipe_pekerjaan', formData.tipe_pekerjaan);
      if (formData.deskripsi) fd.append('deskripsi', formData.deskripsi);
      if (formData.tanggal_berakhir) fd.append('lowongan_selesai', formData.tanggal_berakhir);
      if (formData.jam_mulai) fd.append('jam_mulai', formatTime(formData.jam_mulai));
      if (formData.jam_berakhir) fd.append('jam_berakhir', formatTime(formData.jam_berakhir));
      if (formData.id_provinsi) fd.append('id_provinsi', formData.id_provinsi);
      if (formData.id_kota) fd.append('id_kota', formData.id_kota);
      if (formData.foto) fd.append('foto_lowongan', formData.foto);
      selectedSkills.forEach(s => fd.append('skills[]', s.id));

      if (isEditMode) {
        await adminApi.updateLowongan(editJob.id, fd);
      } else {
        if (isAdmin) fd.append('status', 'published');
        const res = await adminApi.createLowongan(fd);
        if (isAdmin && res.data?.data?.id) await adminApi.approveLowongan(res.data.data.id);
      }
      onSuccess();
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else alert('Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-[#3C5759]">{isEditMode ? 'Edit Lowongan Kerja' : 'Pasang Lowongan Kerja'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-8">
          {/* Banner */}
          <div className="space-y-3">
            <span className="text-sm font-bold text-slate-700">Gambar / Banner <span className="text-gray-400 font-normal">(opsional)</span></span>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
              <div className="w-32 h-32 sm:w-24 sm:h-24 bg-white rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden shadow-sm shrink-0">
                {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" /> : <ImageIcon size={32} className="text-gray-300" />}
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-xs text-gray-500 italic text-center sm:text-left">Silakan unggah gambar persegi, ukuran maks 2MB.</p>
                <label className="px-6 py-2 border-2 border-[#3C5759] text-[#3C5759] font-bold rounded-xl cursor-pointer hover:bg-[#3C5759] hover:text-white transition-all text-sm block sm:inline-block text-center">
                  Pilih File
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Job Title *</label>
              <input name="judul" value={formData.judul} onChange={handleInputChange} placeholder="Contoh: Senior Product Designer" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3C5759]/20" />
              {errors.judul_lowongan && <p className="text-red-500 text-xs mt-1">{errors.judul_lowongan[0]}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Perusahaan *</label>
                <input name="perusahaan" value={formData.perusahaan} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tanggal Berakhir</label>
                <input type="date" name="tanggal_berakhir" value={formData.tanggal_berakhir} min={minDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jam Mulai</label>
                <input type="time" name="jam_mulai" value={formData.jam_mulai} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jam Berakhir</label>
                <input type="time" name="jam_berakhir" value={formData.jam_berakhir} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tipe Pekerjaan</label>
              <select name="tipe_pekerjaan" value={formData.tipe_pekerjaan} onChange={handleInputChange} className="cursor-pointer w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                <option value="">-- Pilih Tipe --</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            {/* --- DROPDOWN PROVINSI & KOTA MENGGUNAKAN SMOOTHDROPDOWN --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SmoothDropdown
                label="Provinsi"
                isSearchable={true}
                placeholder={loadingProvinsi ? "Memuat..." : "Pilih Provinsi"}
                options={provinsiList.map(p => p.nama)}
                value={provinsiList.find(p => String(p.id) === String(formData.id_provinsi))?.nama || ""}
                onSelect={(namaProv) => {
                  const prov = provinsiList.find(p => p.nama === namaProv);
                  if (prov) {
                    setFormData({ ...formData, id_provinsi: String(prov.id), id_kota: '' });
                  }
                }}
              />

              <SmoothDropdown
                label="Kota"
                isSearchable={true}
                placeholder={!formData.id_provinsi ? "Pilih provinsi dulu" : loadingKota ? "Memuat..." : "Pilih Kota"}
                options={kotaList.map(k => k.nama)}
                value={kotaList.find(k => String(k.id) === String(formData.id_kota))?.nama || ""}
                onSelect={(namaKota) => {
                  const kota = kotaList.find(k => k.nama === namaKota);
                  if (kota) {
                    setFormData({ ...formData, id_kota: String(kota.id) });
                  }
                }}
              />
            </div>

            {/* --- BAGIAN SKILLS (SEARCHABLE) --- */}
            <div className="space-y-1.5" ref={skillDropdownRef}>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Skills <span className="text-gray-400 font-normal text-[10px]">(opsional)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedSkills.map(skill => (
                  <span key={skill.id} className="flex items-center gap-1 px-2.5 py-1 bg-[#E8F0F0] text-[#3C5759] text-xs font-bold rounded-lg border border-[#3C5759]/20 shadow-sm">
                    {skill.nama}
                    <button type="button" onClick={() => removeSkill(skill.id)} className="hover:text-red-500 cursor-pointer ml-1">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => { setSkillSearch(e.target.value); setShowSkillDropdown(true); }}
                  onFocus={() => setShowSkillDropdown(true)}
                  placeholder="Cari dan pilih skill..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3C5759]/20 outline-none"
                />
                {showSkillDropdown && (
                  <div className="absolute z-50 top-[105%] w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto py-1">
                    {filteredSkills.length > 0 ? filteredSkills.map(s => (
                      <div key={s.id} onClick={() => addSkill(s)} className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 hover:text-[#3C5759] flex justify-between items-center">
                        {s.nama}
                      </div>
                    )) : <div className="px-4 py-3 text-xs text-gray-400 italic text-center">Skill tidak ditemukan</div>}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Deskripsi</label>
              <textarea name="deskripsi" rows={4} value={formData.deskripsi} onChange={handleInputChange} placeholder="Deskripsi peran..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none min-h-[120px]" />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50">
          <button onClick={onClose} disabled={submitting} className="cursor-pointer text-sm font-bold text-gray-500 hover:text-gray-700 px-4">Batal</button>
          <button onClick={handleSubmit} disabled={submitting || !formData.judul || !formData.perusahaan} className="cursor-pointer flex items-center gap-2 px-8 py-3 bg-[#3C5759] text-white font-bold rounded-2xl hover:bg-[#2e4344] transition-all shadow-lg active:scale-95 disabled:opacity-50">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <>{isEditMode ? 'Perbarui' : 'Kirim'} <Send size={18} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TambahLowongan;