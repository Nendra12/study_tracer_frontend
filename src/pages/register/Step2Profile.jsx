import React, { useState, useRef, useEffect } from "react";
import { User, ArrowLeft, ArrowRight, Upload, Image as ImageIcon, MapPin, X, ChevronDown, Check } from "lucide-react";
import YearsInput from "../../components/YearsInput";
import SosmedInput from "../../components/SosmedInput";
import DateOfBirthInput from "../../components/DateOfBirthInput";
import { masterDataApi } from "../../api/masterData";

// --- MULTI-SELECT DROPDOWN (Skills) ---
const MultiSelectDropdown = ({ label, options = [], selected = [], onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const clickOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id]);
  };

  const getLabel = (id) => {
    const found = options.find(opt => opt.id === id);
    return found ? found.nama : id;
  };

  const filtered = options.filter(opt => opt.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-1 relative" ref={ref}>
      <label className="text-[11px] font-bold text-secondary uppercase">{label}</label>
      <div 
        className="w-full px-2 py-1.5 min-h-[42px] bg-white border border-fourth rounded-xl focus-within:ring-2 focus-within:ring-primary flex flex-wrap gap-1 items-center cursor-text" 
        onClick={() => setIsOpen(true)}
      >
        {!selected.length && !search && (
          <span className="text-gray-400 text-xs absolute left-2 pointer-events-none">{placeholder}</span>
        )}
        {selected.map((id, idx) => (
          <span key={idx} className="bg-fourth text-secondary px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-slate-200">
            {getLabel(id)} 
            <X size={10} className="cursor-pointer hover:text-red-500" onClick={(e) => { e.stopPropagation(); toggle(id); }} />
          </span>
        ))}
        <input 
          type="text" 
          className="flex-1 min-w-[60px] outline-none bg-transparent text-sm h-full" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          onFocus={() => setIsOpen(true)} 
        />
        <ChevronDown size={14} className="text-gray-400 ml-auto" />
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-fourth rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.length ? filtered.map((opt) => (
            <div 
              key={opt.id} 
              className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex justify-between ${selected.includes(opt.id) ? 'text-primary font-bold bg-blue-50/50' : 'text-slate-600'}`} 
              onClick={() => toggle(opt.id)}
            >
              <span>{opt.nama}</span> 
              {selected.includes(opt.id) && <Check size={12} />}
            </div>
          )) : (
            <div className="px-3 py-2 text-xs text-gray-400 text-center">Skill tidak ditemukan</div>
          )}
        </div>
      )}
    </div>
  );
};

// --- SINGLE SELECT DROPDOWN ---
const SelectInput = ({ label, value, options, onSelect, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const clickOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  return (
    <div className="space-y-1 relative" ref={ref}>
      <label className="text-[11px] font-bold text-secondary uppercase">{label} <span className="text-red-500">*</span></label>
      <div onClick={() => setIsOpen(!isOpen)} className="w-full px-3 py-2.5 bg-white border border-fourth rounded-xl text-sm flex justify-between items-center cursor-pointer hover:border-primary transition-all">
        <span className={value ? "text-slate-800" : "text-gray-400"}>{value || placeholder}</span>
        <div className="flex gap-1 items-center">
          {value && <X size={14} className="text-gray-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); onSelect(""); }} />}
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-fourth rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {options.map((opt, idx) => (
            <div key={idx} onClick={() => { onSelect(opt); setIsOpen(false); }} className={`px-3 py-2 text-xs cursor-pointer hover:bg-fourth ${value === opt ? "font-bold text-primary" : "text-slate-600"}`}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Step2Profile({ onNext, onBack, formData, updateFormData }) {
  const [preview, setPreview] = useState(() => {
    if (formData.foto && typeof formData.foto === 'object') return URL.createObjectURL(formData.foto);
    if (typeof formData.foto === 'string') return formData.foto;
    return null;
  });
  
  const [jurusanOpts, setJurusanOpts] = useState([]);
  const [jurusanMapRev, setJurusanMapRev] = useState({});
  const [jurusanMap, setJurusanMap] = useState({});
  const [skillOptions, setSkillOptions] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    masterDataApi.getJurusan().then((res) => {
      const data = res.data.data || [];
      setJurusanOpts(data.map(j => j.nama_jurusan || j.nama));
      const map = {}, mapRev = {};
      data.forEach(j => { map[j.nama_jurusan || j.nama] = j.id; mapRev[j.id] = j.nama_jurusan || j.nama; });
      setJurusanMap(map); setJurusanMapRev(mapRev);
    }).catch(() => setJurusanOpts(["RPL", "TKJ", "MM"]));

    masterDataApi.getSkills().then((res) => {
        setSkillOptions(res.data.data || []);
    }).catch(() => {
        setSkillOptions([{ id: 1, nama: "ReactJS" }, { id: 2, nama: "NodeJS" }]);
    });
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      updateFormData({ foto: file });
    }
  };

  const removeImage = (e) => {
    e.preventDefault(); e.stopPropagation();
    setPreview(null);
    updateFormData({ foto: null });
  };

  const validate = () => {
    const errs = {};
    if (!formData.nama_alumni?.trim()) errs.nama_alumni = 'Nama lengkap wajib diisi';
    if (!formData.id_jurusan) errs.id_jurusan = 'Jurusan wajib dipilih';
    if (!formData.jenis_kelamin) errs.jenis_kelamin = 'Jenis kelamin wajib dipilih';
    if (!formData.nis?.trim()) errs.nis = 'NIS wajib diisi';
    if (!formData.nisn?.trim()) errs.nisn = 'NISN wajib diisi';
    if (!formData.tempat_lahir?.trim()) errs.tempat_lahir = 'Tempat lahir wajib diisi';
    if (!formData.tanggal_lahir) errs.tanggal_lahir = 'Tanggal lahir wajib diisi';
    if (!formData.alamat?.trim()) errs.alamat = 'Alamat wajib diisi';
    if (!formData.tahun_masuk) errs.tahun_masuk = 'Tahun masuk wajib diisi';

    // No HP: required, min 10, max 13
    if (!formData.no_hp?.trim()) {
      errs.no_hp = 'No HP wajib diisi';
    } else {
      const digits = formData.no_hp.replace(/\D/g, '');
      if (digits.length < 10) errs.no_hp = 'No HP minimal 10 digit';
      else if (digits.length > 13) errs.no_hp = 'No HP maksimal 13 digit';
    }

    // Tahun lulus: must be >= 3 years after tahun masuk
    if (formData.tahun_lulus) {
      if (formData.tahun_masuk && (parseInt(formData.tahun_lulus) - parseInt(formData.tahun_masuk)) < 3) {
        errs.tahun_lulus = 'Tahun lulus harus minimal 3 tahun setelah tahun masuk';
      }
    }

    // Tanggal lahir: must be before tahun masuk
    if (formData.tanggal_lahir && formData.tahun_masuk) {
      const birthYear = new Date(formData.tanggal_lahir).getFullYear();
      if (birthYear >= parseInt(formData.tahun_masuk)) {
        errs.tanggal_lahir = 'Tanggal lahir invalid';
      }
    }

    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-fourth rounded-lg text-primary"><User size={18} /></div>
          <h3 className="font-bold text-primary text-lg">Personal Info</h3>
        </div>
        <span className="text-[10px] bg-fourth px-3 py-1 rounded-full text-secondary font-bold uppercase">Langkah 2 dari 3</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* --- Baris 1 --- */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-secondary uppercase">Nama Lengkap <span className="text-red-500">*</span></label>
          <input type="text" value={formData.nama_alumni || ""} onChange={(e) => { updateFormData({ nama_alumni: e.target.value }); setErrors(prev => ({ ...prev, nama_alumni: undefined })); }} className={`w-full p-2.5 bg-white border ${errors.nama_alumni ? 'border-red-400' : 'border-fourth'} rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all`} placeholder="Nama lengkap" />
          {errors.nama_alumni && <p className="text-xs text-red-500 mt-0.5">{errors.nama_alumni}</p>}
        </div>

        <div className="space-y-1">
          <SelectInput label="Jurusan" placeholder="Pilih jurusan" options={jurusanOpts} value={jurusanMapRev[formData.id_jurusan] || formData.id_jurusan} onSelect={(val) => { updateFormData({ id_jurusan: val ? jurusanMap[val] : "" }); setErrors(prev => ({ ...prev, id_jurusan: undefined })); }} />
          {errors.id_jurusan && <p className="text-xs text-red-500 mt-0.5">{errors.id_jurusan}</p>}
        </div>

        {/* --- Baris 2 --- */}
        <div className="space-y-1">
          <SelectInput label="Jenis Kelamin" placeholder="Pilih..." options={["Laki-laki", "Perempuan"]} value={formData.jenis_kelamin || ""} onSelect={(val) => { updateFormData({ jenis_kelamin: val }); setErrors(prev => ({ ...prev, jenis_kelamin: undefined })); }} />
          {errors.jenis_kelamin && <p className="text-xs text-red-500 mt-0.5">{errors.jenis_kelamin}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-secondary uppercase">No HP <span className="text-red-500">*</span></label>
          <input type="text" inputMode="numeric" value={formData.no_hp || ""} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); updateFormData({ no_hp: val }); setErrors(prev => ({ ...prev, no_hp: undefined })); }} maxLength={13} className={`w-full p-2.5 bg-white border ${errors.no_hp ? 'border-red-400' : 'border-fourth'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all`} placeholder="08..." />
          {errors.no_hp && <p className="text-xs text-red-500 mt-0.5">{errors.no_hp}</p>}
        </div>

        {/* --- Baris 3 --- */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-secondary uppercase">NIS <span className="text-red-500">*</span></label>
          <input type="text" value={formData.nis || ""} onChange={(e) => { updateFormData({ nis: e.target.value }); setErrors(prev => ({ ...prev, nis: undefined })); }} className={`w-full p-2.5 bg-white border ${errors.nis ? 'border-red-400' : 'border-fourth'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all`} placeholder="NIS" />
          {errors.nis && <p className="text-xs text-red-500 mt-0.5">{errors.nis}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-secondary uppercase">NISN <span className="text-red-500">*</span></label>
          <input type="text" value={formData.nisn || ""} onChange={(e) => { updateFormData({ nisn: e.target.value }); setErrors(prev => ({ ...prev, nisn: undefined })); }} className={`w-full p-2.5 bg-white border ${errors.nisn ? 'border-red-400' : 'border-fourth'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all`} placeholder="NISN" />
          {errors.nisn && <p className="text-xs text-red-500 mt-0.5">{errors.nisn}</p>}
        </div>

        {/* --- Baris 4 --- */}
        <div className="space-y-1">
          <YearsInput label="Tahun Masuk" isRequired={true} value={formData.tahun_masuk} onSelect={(val) => { updateFormData({ tahun_masuk: val }); setErrors(prev => ({ ...prev, tahun_masuk: undefined })); }} />
          {errors.tahun_masuk && <p className="text-xs text-red-500 mt-0.5">{errors.tahun_masuk}</p>}
        </div>
        <div className="space-y-1">
          <YearsInput label="Tahun Lulus" isRequired={true} value={formData.tahun_lulus} onSelect={(val) => { updateFormData({ tahun_lulus: val }); setErrors(prev => ({ ...prev, tahun_lulus: undefined })); }} />
          {errors.tahun_lulus && <p className="text-xs text-red-500 mt-0.5">{errors.tahun_lulus}</p>}
        </div>

        {/* --- Baris 5 --- */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-secondary uppercase">Tempat Lahir <span className="text-red-500">*</span></label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-3 text-third" />
            <input type="text" value={formData.tempat_lahir || ""} onChange={(e) => { updateFormData({ tempat_lahir: e.target.value }); setErrors(prev => ({ ...prev, tempat_lahir: undefined })); }} className={`w-full pl-9 p-2.5 bg-white border ${errors.tempat_lahir ? 'border-red-400' : 'border-fourth'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all`} placeholder="Kota" />
          </div>
          {errors.tempat_lahir && <p className="text-xs text-red-500 mt-0.5">{errors.tempat_lahir}</p>}
        </div>

        <div className="space-y-1">
          <DateOfBirthInput isRequired={true} value={formData.tanggal_lahir} onChange={(val) => { updateFormData({ tanggal_lahir: val }); setErrors(prev => ({ ...prev, tanggal_lahir: undefined })); }} />
          {errors.tanggal_lahir && <p className="text-xs text-red-500 mt-0.5">{errors.tanggal_lahir}</p>}
        </div>

        {/* --- Baris 6 (Full Width) --- */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
           <div className="space-y-1">
              <label className="text-[11px] font-bold text-secondary uppercase">Alamat <span className="text-red-500">*</span></label>
              <textarea rows="4" value={formData.alamat || ""} onChange={(e) => { updateFormData({ alamat: e.target.value }); setErrors(prev => ({ ...prev, alamat: undefined })); }} className={`w-full p-2.5 bg-white border ${errors.alamat ? 'border-red-400' : 'border-fourth'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary resize-none transition-all h-[106px]`} placeholder="Alamat lengkap..." />
              {errors.alamat && <p className="text-xs text-red-500 mt-0.5">{errors.alamat}</p>}
           </div>
           
           <div className="space-y-1">
              <label className="text-[11px] font-bold text-secondary uppercase">Foto <span className="text-red-500">*</span></label>
              <label className="flex items-center gap-4 border border-dashed border-fourth rounded-xl p-3 cursor-pointer hover:border-primary h-[106px] relative group transition-all">
                {preview ? (
                  <img src={preview} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                ) : (
                  <div className="p-4 bg-fourth rounded-lg text-third"><ImageIcon size={24} /></div>
                )}
                <div className="flex-1">
                  <div className="text-xs font-bold text-primary mb-1 flex items-center gap-1"><Upload size={12} /> Pilih File</div>
                  <span className="text-[10px] text-gray-400">Max 2MB (PNG/JPG)</span>
                  <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </div>
                {preview && (
                  <button onClick={removeImage} className="absolute top-2 right-2 p-1 bg-white border border-red-100 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                    <X size={14} />
                  </button>
                )}
              </label>
           </div>
        </div>

        {/* --- Baris 7 (SEJAJAR: SOSMED & SKILL) --- */}
        <div className="md:col-span-1">
          <SosmedInput 
            value={formData.social_media} 
            onChange={(val) => updateFormData({ social_media: val })} 
          />
        </div>
        
        <div className="md:col-span-1 pt-[2px]"> {/* Sedikit padding top agar label sejajar secara visual */}
          <MultiSelectDropdown 
            label="Keahlian / Skills" 
            placeholder="Cari skill..." 
            options={skillOptions} 
            selected={formData.skills || []} 
            onChange={(val) => updateFormData({ skills: val })} 
          />
        </div>
      </div>

      {/* --- Footer Buttons --- */}
      <div className="pt-6 mt-4 flex justify-between border-t border-fourth">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-fourth rounded-xl text-xs font-bold text-secondary hover:bg-fourth transition-all active:scale-95">
          <ArrowLeft size={14} /> Kembali
        </button>
        <button onClick={handleNext} className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20">
          Selanjutnya <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}