import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Image as ImageIcon, Loader2, ChevronDown, Check, Plus } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { masterDataApi } from '../../api/masterData';
import { useAuth } from '../../context/AuthContext';

const TambahLowongan = ({ isOpen, onClose, onSuccess, editJob = null }) => {
  const { isAdmin } = useAuth();
  const isEditMode = !!editJob;
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

  // Skills state
  const [skillsList, setSkillsList] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]); // [{id, nama}]
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const skillDropdownRef = useRef(null);

  // Set minimal tanggal adalah besok
  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    setMinDate(today.toISOString().split('T')[0]);
  }, []);

  // Pre-fill form when editing
  useEffect(() => {
    if (editJob && isOpen) {
      setFormData({
        judul: editJob.judul || '',
        perusahaan: editJob.perusahaan?.nama || editJob.nama_perusahaan || '',
        tanggal_berakhir: editJob.lowongan_selesai || '',
        deskripsi: editJob.deskripsi || '',
        tipe_pekerjaan: editJob.tipe_pekerjaan || '',
        lokasi: editJob.lokasi || '',
        foto: null,
        id_provinsi: '',
        id_kota: '',
        jam_mulai: editJob.jam_mulai || '',
        jam_berakhir: editJob.jam_berakhir || '',
      });
      // Pre-fill skills from editJob
      if (editJob.skills && Array.isArray(editJob.skills)) {
        setSelectedSkills(editJob.skills.map(s => ({ id: s.id, nama: s.nama })));
      } else {
        setSelectedSkills([]);
      }
      setPreviewUrl(null);
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

  // Fetch provinsi on mount
  useEffect(() => {
    if (!isOpen) return;
    const fetchProvinsi = async () => {
      setLoadingProvinsi(true);
      try {
        const res = await masterDataApi.getProvinsi();
        setProvinsiList(res.data?.data || res.data || []);
      } catch {
        setProvinsiList([]);
      } finally {
        setLoadingProvinsi(false);
      }
    };
    fetchProvinsi();
  }, [isOpen]);

  // Fetch skills on mount
  useEffect(() => {
    if (!isOpen) return;
    const fetchSkills = async () => {
      try {
        const res = await masterDataApi.getSkills();
        const data = res.data?.data || res.data || [];
        setSkillsList(data.map(s => ({ id: s.id, nama: s.nama })));
      } catch {
        setSkillsList([]);
      }
    };
    fetchSkills();
  }, [isOpen]);

  // Close skill dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (skillDropdownRef.current && !skillDropdownRef.current.contains(e.target)) {
        setShowSkillDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch kota when provinsi changes
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

  // Skill helpers
  const filteredSkills = skillsList.filter(
    s => s.nama.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !selectedSkills.some(sel => sel.id === s.id)
  );

  const addSkill = (skill) => {
    if (!selectedSkills.some(s => s.id === skill.id)) {
      setSelectedSkills(prev => [...prev, skill]);
    }
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  const removeSkill = (skillId) => {
    setSelectedSkills(prev => prev.filter(s => s.id !== skillId));
  };

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setFormData({ ...formData, foto: file });
      setPreviewUrl(URL.createObjectURL(file));
    } else if (file) {
      alert("File terlalu besar (Maks 2MB)");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset kota when provinsi changes
      if (name === 'id_provinsi') {
        updated.id_kota = '';
      }
      return updated;
    });
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    try {
      if (isEditMode) {
        // Update existing lowongan using FormData for file upload support
        const fd = new FormData();
        fd.append('judul_lowongan', formData.judul);
        fd.append('nama_perusahaan', formData.perusahaan);
        if (formData.tipe_pekerjaan) fd.append('tipe_pekerjaan', formData.tipe_pekerjaan);
        if (formData.deskripsi) fd.append('deskripsi', formData.deskripsi);
        if (formData.tanggal_berakhir) fd.append('lowongan_selesai', formData.tanggal_berakhir);
        if (formData.jam_mulai) fd.append('jam_mulai', formData.jam_mulai);
        if (formData.jam_berakhir) fd.append('jam_berakhir', formData.jam_berakhir);

        // Build lokasi from selected kota/provinsi names or use existing
        const selectedProvinsi = provinsiList.find(p => String(p.id) === String(formData.id_provinsi));
        const selectedKota = kotaList.find(k => String(k.id) === String(formData.id_kota));
        let lokasiStr = formData.lokasi;
        if (selectedKota && selectedProvinsi) {
          lokasiStr = `${selectedKota.nama}, ${selectedProvinsi.nama}`;
        } else if (selectedProvinsi) {
          lokasiStr = selectedProvinsi.nama;
        }
        if (lokasiStr) fd.append('lokasi', lokasiStr);

        // Include foto if a new one was selected
        if (formData.foto) fd.append('foto_lowongan', formData.foto);

        // Skills (send array of IDs)
        selectedSkills.forEach(s => fd.append('skills[]', s.id));

        await adminApi.updateLowongan(editJob.id, fd);
      } else {
        // Create new lowongan
        const fd = new FormData();
      fd.append('judul_lowongan', formData.judul);
      fd.append('nama_perusahaan', formData.perusahaan);
      if (formData.tanggal_berakhir) fd.append('lowongan_selesai', formData.tanggal_berakhir);
      if (formData.deskripsi) fd.append('deskripsi', formData.deskripsi);
      if (formData.tipe_pekerjaan) fd.append('tipe_pekerjaan', formData.tipe_pekerjaan);
      if (formData.jam_mulai) fd.append('jam_mulai', formData.jam_mulai);
      if (formData.jam_berakhir) fd.append('jam_berakhir', formData.jam_berakhir);
      
      // Build lokasi from selected kota/provinsi names
      const selectedProvinsi = provinsiList.find(p => String(p.id) === String(formData.id_provinsi));
      const selectedKota = kotaList.find(k => String(k.id) === String(formData.id_kota));
      let lokasiStr = formData.lokasi;
      if (selectedKota && selectedProvinsi) {
        lokasiStr = `${selectedKota.nama}, ${selectedProvinsi.nama}`;
      } else if (selectedProvinsi) {
        lokasiStr = selectedProvinsi.nama;
      }
      if (lokasiStr) fd.append('lokasi', lokasiStr);
      
      if (formData.foto) fd.append('foto_lowongan', formData.foto);

      // Skills (send array of IDs)
      selectedSkills.forEach(s => fd.append('skills[]', s.id));

      // Admin: auto-publish, skip pending approval
      if (isAdmin) {
        fd.append('status', 'published');
      }

      const createRes = await adminApi.createLowongan(fd);

      // Admin: auto-approve the newly created job
      if (isAdmin) {
        const newJobId = createRes.data?.data?.id;
        if (newJobId) {
          try { await adminApi.approveLowongan(newJobId); } catch { /* ignore */ }
        }
      }
      } // end else (create mode)
      
      // Reset form
      setFormData({
        judul: '', perusahaan: '', tanggal_berakhir: '', deskripsi: '',
        tipe_pekerjaan: '', lokasi: '', foto: null, id_provinsi: '', id_kota: '',
        jam_mulai: '', jam_berakhir: '',
      });
      setSelectedSkills([]);
      setPreviewUrl(null);
      
      if (onSuccess) onSuccess();
      else onClose();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || (isEditMode ? 'Gagal memperbarui lowongan' : 'Gagal membuat lowongan'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-[#3C5759]">{isEditMode ? 'Edit Lowongan Kerja' : 'Pasang Lowongan Kerja'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Section Upload Foto - Responsif Stacked on Mobile */}
          <div className="space-y-3">
            <span className="text-sm font-bold text-slate-700">Gambar / Banner <span className="text-gray-400 font-normal">(opsional)</span></span>
            
            {/* Flex-col untuk mobile (stack), sm:flex-row untuk desktop (menyamping) */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
              
              {/* Box Preview - Paling Atas di Mobile */}
              <div className="w-32 h-32 sm:w-24 sm:h-24 bg-white rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden shadow-sm shrink-0">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={32} className="text-gray-300" />
                )}
              </div>

              {/* Input File - Di bawah preview pada mobile */}
              <div className="flex-1 flex flex-col items-center sm:items-start space-y-3 text-center sm:text-left">
                <p className="text-xs text-gray-500 italic">Silakan unggah gambar persegi, ukuran kurang dari 2MB.</p>
                <div className="flex flex-col items-center sm:items-start gap-2">
                  <label className="px-6 py-2 border-2 border-[#3C5759] text-[#3C5759] font-bold rounded-xl cursor-pointer hover:bg-[#3C5759] hover:text-white transition-all text-sm">
                    Pilih File
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                  <span className="text-[11px] text-gray-400 truncate max-w-[200px]">
                    {formData.foto ? formData.foto.name : "Tidak ada file dipilih"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Job Title <span className="text-red-500">*</span></label>
              <input 
                name="judul"
                type="text" 
                value={formData.judul}
                placeholder="Contoh: Senior Product Designer"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3C5759]/20 focus:border-[#3C5759] outline-none transition-all"
                onChange={handleInputChange}
              />
              {errors.judul_lowongan && <p className="text-red-500 text-xs">{errors.judul_lowongan[0]}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Perusahaan <span className="text-red-500">*</span></label>
                <input 
                  name="perusahaan"
                  type="text" 
                  value={formData.perusahaan}
                  placeholder="Nama Perusahaan"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3C5759]/20 outline-none transition-all"
                  onChange={handleInputChange}
                />
                {errors.nama_perusahaan && <p className="text-red-500 text-xs">{errors.nama_perusahaan[0]}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tanggal Lowongan Berakhir</label>
                <input 
                  name="tanggal_berakhir"
                  type="date" 
                  value={formData.tanggal_berakhir}
                  min={minDate}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3C5759]/20 outline-none transition-all text-gray-600"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Jam Mulai & Jam Berakhir */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jam Mulai <span className="text-gray-400 font-normal text-[10px]">(opsional)</span></label>
                <input 
                  name="jam_mulai"
                  type="time" 
                  value={formData.jam_mulai}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3C5759]/20 focus:border-[#3C5759] outline-none transition-all text-gray-600"
                  onChange={handleInputChange}
                />
                {errors.jam_mulai && <p className="text-red-500 text-xs">{errors.jam_mulai[0]}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jam Berakhir <span className="text-gray-400 font-normal text-[10px]">(opsional)</span></label>
                <input 
                  name="jam_berakhir"
                  type="time" 
                  value={formData.jam_berakhir}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3C5759]/20 focus:border-[#3C5759] outline-none transition-all text-gray-600"
                  onChange={handleInputChange}
                />
                {errors.jam_berakhir && <p className="text-red-500 text-xs">{errors.jam_berakhir[0]}</p>}
              </div>
            </div>

            {/* Tipe Pekerjaan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tipe Pekerjaan</label>
              <select
                name="tipe_pekerjaan"
                value={formData.tipe_pekerjaan}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3C5759]/20 outline-none transition-all text-gray-600"
              >
                <option value="">-- Pilih Tipe --</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            {/* Provinsi & Kota */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Provinsi</label>
                <select 
                  name="id_provinsi"
                  value={formData.id_provinsi}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3C5759]/20 outline-none transition-all text-gray-600"
                  disabled={loadingProvinsi}
                >
                  <option value="">{loadingProvinsi ? 'Memuat...' : '-- Pilih Provinsi --'}</option>
                  {provinsiList.map((p) => (
                    <option key={p.id} value={p.id}>{p.nama}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kota / Kabupaten</label>
                <select 
                  name="id_kota"
                  value={formData.id_kota}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3C5759]/20 outline-none transition-all text-gray-600"
                  disabled={loadingKota || !formData.id_provinsi}
                >
                  <option value="">{loadingKota ? 'Memuat...' : !formData.id_provinsi ? 'Pilih provinsi dulu' : '-- Pilih Kota --'}</option>
                  {kotaList.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Skills Input */}
            <div className="space-y-1.5" ref={skillDropdownRef}>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Skills <span className="text-gray-400 font-normal text-[10px]">(opsional)</span>
              </label>
              
              {/* Selected Skills Tags */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedSkills.map(skill => (
                    <span key={skill.id} className="flex items-center gap-1 px-2.5 py-1 bg-[#E8F0F0] text-[#3C5759] text-xs font-bold rounded-lg">
                      {skill.nama}
                      <button type="button" onClick={() => removeSkill(skill.id)} className="hover:text-red-500 cursor-pointer ml-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Skill Search/Dropdown */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => { setSkillSearch(e.target.value); setShowSkillDropdown(true); }}
                    onFocus={() => setShowSkillDropdown(true)}
                    placeholder="Cari skill..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3C5759]/20 focus:border-[#3C5759] outline-none transition-all"
                  />
                  <ChevronDown
                    size={18}
                    className={`absolute right-3 text-gray-400 cursor-pointer transition-transform ${showSkillDropdown ? 'rotate-180 text-[#3C5759]' : ''}`}
                    onClick={() => setShowSkillDropdown(!showSkillDropdown)}
                  />
                </div>
                
                {showSkillDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <ul className="max-h-40 overflow-y-auto py-1">
                      {filteredSkills.length > 0 ? (
                        filteredSkills.map(skill => (
                          <li
                            key={skill.id}
                            onClick={() => addSkill(skill)}
                            className="flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 text-gray-700 hover:text-[#3C5759] transition-colors"
                          >
                            {skill.nama}
                            <Check size={14} className="text-gray-300" />
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-3 text-xs text-gray-400 italic text-center">
                          {skillSearch ? 'Skill tidak ditemukan' : 'Semua skill sudah dipilih'}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              {errors.skills && <p className="text-red-500 text-xs">{errors.skills[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Deskripsi Pekerjaan</label>
              <textarea 
                name="deskripsi"
                rows={4}
                value={formData.deskripsi}
                placeholder="Deskripsi peran, responsibilitas dan detail rekuirement"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3C5759]/20 outline-none transition-all resize-none min-h-[120px]"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end items-center gap-4 bg-gray-50/50">
          <button onClick={onClose} disabled={submitting} className="text-sm font-bold text-gray-500 hover:text-gray-700 px-4">Batal</button>
          <button 
            onClick={handleSubmit}
            disabled={submitting || !formData.judul || !formData.perusahaan}
            className="flex items-center gap-2 px-8 py-3 bg-[#3C5759] text-white font-bold rounded-2xl hover:bg-[#2e4344] transition-all shadow-lg shadow-[#3C5759]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <><Loader2 size={18} className="animate-spin" /> {isEditMode ? 'Memperbarui...' : 'Mengirim...'}</> : <>{isEditMode ? 'Perbarui' : 'Kirim'} <Send size={18} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TambahLowongan;