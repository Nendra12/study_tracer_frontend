import React, { useState, useEffect } from "react";
import { User, ArrowLeft, ArrowRight, Upload, Image as ImageIcon, MapPin, X } from "lucide-react";
import YearsInput from "../../components/YearsInput";
import SosmedInput from "../../components/SosmedInput";
import DateOfBirthInput from "../../components/DateOfBirthInput";
import { masterDataApi } from "../../api/masterData";
import SelectInput from "../../components/admin/SelectInput";
import { alertError } from "../../utilitis/alert";
import MultiSelectDropdown from "../../components/admin/MultiSelectDropdown";

// 1. Import komponen SmoothKota
import SmoothKota from "../../components/admin/SmoothKota"; // Sesuaikan path jika berbeda

export default function Step2Profile({ onNext, onBack, formData, updateFormData }) {
  const [preview, setPreview] = useState(() => {
    if (formData.foto && typeof formData.foto === 'object') return URL.createObjectURL(formData.foto);
    if (typeof formData.foto === 'string') return formData.foto;
    return null;
  });
  
  const [jurusanOpts, setJurusanOpts] = useState([]);
  const [skillOptions, setSkillOptions] = useState([]);
  const [kotaOpts, setKotaOpts] = useState([]); // 2. State untuk menyimpan opsi kota
  const [errors, setErrors] = useState({});

  useEffect(() => {
    masterDataApi.getJurusan().then((res) => {
      const data = res.data.data || [];
      const formattedData = data.map(j => ({
        value: j.id, 
        label: j.nama_jurusan || j.nama
      }));
      setJurusanOpts(formattedData);
    })

    masterDataApi.getSkills().then((res) => {
      setSkillOptions(res.data.data || []);
    }).catch(() => {
      setSkillOptions([{ id: 1, nama: "ReactJS" }, { id: 2, nama: "NodeJS" }]);
    });

    // 3. Fetch data kota dari API
    masterDataApi.getKota().then((res) => {
      const data = res.data.data || [];
      // Format data untuk dropdown { value, label }
      const formattedKota = data.map(k => ({
        value: k.nama_kota || k.nama, // Asumsi API mengembalikan nama kota
        label: k.nama_kota || k.nama
      }));
      setKotaOpts(formattedKota);
    }).catch(err => console.error("Gagal load kota", err));
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Validasi Format File (Harus berupa gambar)
      if (!file.type.startsWith('image/')) {
        alertError('Format file tidak didukung! Harap unggah file berupa format gambar (Contoh: JPG, JPEG, PNG atau SVG).');
        e.target.value = ''; // Reset pilihan file
        return;
      }

      // 2. Validasi Ukuran File (Maksimal 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB dalam bytes
      if (file.size > maxSize) {
        alertError('Ukuran file terlalu besar! Maksimal ukuran foto adalah 2MB.');
        e.target.value = ''; // Reset pilihan file
        return;
      }

      // Jika lolos semua validasi, pasang fotonya
      setPreview(URL.createObjectURL(file));
      updateFormData({ foto: file });
      setErrors(prev => ({ ...prev, foto: undefined }));
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
    if (!formData.tempat_lahir?.trim()) errs.tempat_lahir = 'Tempat lahir wajib diisi';
    if (!formData.alamat?.trim()) errs.alamat = 'Alamat wajib diisi';
    if (!formData.tahun_masuk) errs.tahun_masuk = 'Tahun masuk wajib diisi';

    // --- 1. Validasi No HP (Min 10, Max 13 Angka) ---
    if (!formData.no_hp?.trim()) {
      errs.no_hp = 'No HP wajib diisi';
    } else {
      const digits = formData.no_hp.replace(/\D/g, '');
      if (digits.length < 10) errs.no_hp = 'No HP minimal 10 angka';
      else if (digits.length > 13) errs.no_hp = 'No HP maksimal 13 angka';
    }

    // --- 2. Validasi NIS (Harus Pas 10 Angka) ---
    if (!formData.nis?.trim()) {
      errs.nis = 'NIS wajib diisi';
    } else {
      const digits = formData.nis.replace(/\D/g, '');
      if (digits.length !== 10) errs.nis = 'NIS harus terdiri dari tepat 10 angka';
    }

    // --- 3. Validasi NISN (Harus Pas 10 Angka) ---
    if (!formData.nisn?.trim()) {
      errs.nisn = 'NISN wajib diisi';
    } else {
      const digits = formData.nisn.replace(/\D/g, '');
      if (digits.length !== 10) errs.nisn = 'NISN harus terdiri dari tepat 10 angka';
    }

    const currentYear = new Date().getFullYear();
    
    // Validasi Tahun Masuk
    if (formData.tahun_masuk && parseInt(formData.tahun_masuk) > currentYear) {
      errs.tahun_masuk = `Tahun masuk tidak boleh lebih dari ${currentYear}`;
    }

    // Validasi Tahun Lulus (Min +2 tahun, Max +5 tahun)
    if (formData.tahun_lulus && formData.tahun_masuk) {
      const masuk = parseInt(formData.tahun_masuk);
      const lulus = parseInt(formData.tahun_lulus);
      
      if ((lulus - masuk) <= 2) {
        errs.tahun_lulus = 'Tahun lulus harus lebih dari 2 tahun setelah tahun masuk';
      } else if ((lulus - masuk) > 5) {
        errs.tahun_lulus = `Tahun lulus maksimal 5 tahun setelah tahun masuk (${masuk + 5})`;
      }
    }

    // Validasi Usia Minimal (14 Tahun di bawah tahun masuk)
    if (formData.tanggal_lahir && formData.tahun_masuk) {
      const birthYear = new Date(formData.tanggal_lahir).getFullYear();
      const entryYear = parseInt(formData.tahun_masuk);
      
      if (entryYear - birthYear < 14) {
        errs.tanggal_lahir = 'Usia minimal saat tahun masuk adalah 14 tahun';
      }
    } else if (!formData.tanggal_lahir) {
      errs.tanggal_lahir = 'Tanggal lahir wajib diisi';
    }

    // Validasi Alamat Lengkap
    if (!formData.alamat?.trim()) {
      errs.alamat = 'Alamat wajib diisi';
    } else {
      const alamatText = formData.alamat.trim();
      if (alamatText.length < 15) {
        errs.alamat = 'Alamat terlalu pendek (min. 15 karakter). Mohon sertakan jalan, RT/RW, atau desa.';
      } else if (alamatText.length > 255) {
        errs.alamat = 'Alamat terlalu panjang (maks. 255 karakter)';
      }
    }

    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    onNext();
  };

  const genderOptions = [
    { value: "Laki-laki", label: "Laki-laki" },
    { value: "Perempuan", label: "Perempuan" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-fourth rounded-lg text-primary"><User size={18} /></div>
          <h3 className="font-bold text-primary text-lg">Personal Info</h3>
        </div>
        <span className="text-[10px] bg-fourth px-3 py-1 rounded-full text-primary font-bold uppercase">Langkah 2 dari 3</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* --- Baris 1 --- */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-primary uppercase">Nama Lengkap <span className="text-red-500">*</span></label>
          <input type="text" value={formData.nama_alumni || ""} onChange={(e) => { updateFormData({ nama_alumni: e.target.value }); setErrors(prev => ({ ...prev, nama_alumni: undefined })); }} className={`w-full p-2.5 bg-white border ${errors.nama_alumni ? 'border-red-400' : 'border-fourth'} rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all`} placeholder="Nama lengkap" />
          {errors.nama_alumni && <p className="text-xs text-red-500 mt-0.5">{errors.nama_alumni}</p>}
        </div>

        <div className="space-y-1 relative z-[55] focus-within:z-[9999]">
          <SelectInput 
            label="Jurusan" 
            placeholder="Pilih jurusan" 
            options={jurusanOpts} 
            value={formData.id_jurusan || ""} 
            onSelect={(val) => { updateFormData({ id_jurusan: val }); setErrors(prev => ({ ...prev, id_jurusan: undefined })); }} 
          />
          {errors.id_jurusan && <p className="text-xs text-red-500 mt-0.5">{errors.id_jurusan}</p>}
        </div>

        {/* --- Baris 2 --- */}
        <div className="space-y-1 relative z-30">
          <SelectInput 
            label="Jenis Kelamin" 
            placeholder="Pilih..." 
            options={genderOptions} 
            value={formData.jenis_kelamin || ""} 
            onSelect={(val) => { updateFormData({ jenis_kelamin: val }); setErrors(prev => ({ ...prev, jenis_kelamin: undefined })); }} 
          />
          {errors.jenis_kelamin && <p className="text-xs text-red-500 mt-0.5">{errors.jenis_kelamin}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-primary uppercase">No HP <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            inputMode="numeric" 
            value={formData.no_hp || ""} 
            onChange={(e) => { 
              const val = e.target.value.replace(/\D/g, ''); 
              updateFormData({ no_hp: val }); 
              
              // Validasi Real-Time No HP
              if (val.length > 0 && val.length < 10) {
                setErrors(prev => ({ ...prev, no_hp: 'No HP minimal 10 angka' }));
              } else if (val.length === 0) {
                setErrors(prev => ({ ...prev, no_hp: 'No HP wajib diisi' }));
              } else {
                setErrors(prev => ({ ...prev, no_hp: undefined })); 
              }
            }} 
            maxLength={13}
            className={`w-full p-2.5 bg-white border ${errors.no_hp ? 'border-red-400' : 'border-fourth'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all`} 
            placeholder="081..." 
          />
          {errors.no_hp && <p className="text-xs text-red-500 mt-0.5">{errors.no_hp}</p>}
        </div>

        {/* --- Baris 3 --- */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-primary uppercase">NIS <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            inputMode="numeric"
            value={formData.nis || ""} 
            onChange={(e) => { 
              const val = e.target.value.replace(/\D/g, ''); 
              updateFormData({ nis: val }); 
              
              // Validasi Real-Time NIS
              if (val.length > 0 && val.length < 10) {
                setErrors(prev => ({ ...prev, nis: 'NIS harus terdiri dari tepat 10 angka' }));
              } else if (val.length === 0) {
                setErrors(prev => ({ ...prev, nis: 'NIS wajib diisi' }));
              } else {
                setErrors(prev => ({ ...prev, nis: undefined })); 
              }
            }} 
            maxLength={10}
            className={`w-full p-2.5 bg-white border ${errors.nis ? 'border-red-400' : 'border-fourth'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all`} 
            placeholder="Masukkan NIS" 
          />
          {errors.nis && <p className="text-xs text-red-500 mt-0.5">{errors.nis}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-primary uppercase">NISN <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            inputMode="numeric"
            value={formData.nisn || ""} 
            onChange={(e) => { 
              const val = e.target.value.replace(/\D/g, ''); 
              updateFormData({ nisn: val }); 
              
              // Validasi Real-Time NISN
              if (val.length > 0 && val.length < 10) {
                setErrors(prev => ({ ...prev, nisn: 'NISN harus terdiri dari tepat 10 angka' }));
              } else if (val.length === 0) {
                setErrors(prev => ({ ...prev, nisn: 'NISN wajib diisi' }));
              } else {
                setErrors(prev => ({ ...prev, nisn: undefined })); 
              }
            }} 
            maxLength={10}
            className={`w-full p-2.5 bg-white border ${errors.nisn ? 'border-red-400' : 'border-fourth'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all`} 
            placeholder="Masukkan NISN" 
          />
          {errors.nisn && <p className="text-xs text-red-500 mt-0.5">{errors.nisn}</p>}
        </div>

        {/* --- Baris 4 --- */}
        {/* PERBAIKAN Z-INDEX: Menggunakan z-[70] default dan z-[9999] saat focus-within agar opsi tidak tertutup */}
        <div className="space-y-1 relative z-[70] focus-within:z-[9999]">
          <YearsInput 
            label="Tahun Masuk" 
            isRequired={true} 
            value={formData.tahun_masuk} 
            maxYear={new Date().getFullYear()} 
            onSelect={(val) => { 
              updateFormData({ tahun_masuk: val }); 
              setErrors(prev => ({ ...prev, tahun_masuk: undefined }));

              // 1. Validasi Real-time: Cek ulang Tahun Lulus jika sudah terisi
              if (formData.tahun_lulus) {
                const masuk = parseInt(val);
                const lulus = parseInt(formData.tahun_lulus);
                
                if ((lulus - masuk) <= 2) {
                  setErrors(prev => ({ ...prev, tahun_lulus: 'Tahun lulus harus lebih dari 2 tahun setelah tahun masuk' }));
                } else if ((lulus - masuk) > 5) {
                  setErrors(prev => ({ ...prev, tahun_lulus: `Tahun lulus maksimal 5 tahun setelah tahun masuk (${masuk + 5})` }));
                } else {
                  setErrors(prev => ({ ...prev, tahun_lulus: undefined }));
                }
              }

              // 2. PERBAIKAN: Validasi Real-time Cek Ulang Tanggal Lahir (Dua Arah)
              if (formData.tanggal_lahir) {
                const birthYear = new Date(formData.tanggal_lahir).getFullYear();
                const entryYear = parseInt(val);
                
                if (entryYear - birthYear < 14) {
                  alertError('Peringatan: Tanggal lahir harus minimal 14 tahun di bawah tahun masuk.');
                  setErrors(prev => ({ ...prev, tanggal_lahir: 'Usia tidak mencukupi (minimal 14 tahun)' }));
                } else {
                  setErrors(prev => ({ ...prev, tanggal_lahir: undefined }));
                }
              }
            }} 
          />
          {errors.tahun_masuk && <p className="text-xs text-red-500 mt-0.5">{errors.tahun_masuk}</p>}
        </div>

        {/* PERBAIKAN Z-INDEX: Dibuat sedikit di bawah Tahun Masuk agar berurutan */}
        <div className="space-y-1 relative z-[65] focus-within:z-[9999]">
          <YearsInput 
            label="Tahun Lulus" 
            isRequired={true} 
            value={formData.tahun_lulus} 
            maxYear={formData.tahun_masuk ? parseInt(formData.tahun_masuk) + 5 : new Date().getFullYear() + 5}
            minYear={formData.tahun_masuk ? parseInt(formData.tahun_masuk) : null}
            onSelect={(val) => { 
              updateFormData({ tahun_lulus: val }); 
              
              if (formData.tahun_masuk) {
                const masuk = parseInt(formData.tahun_masuk);
                const lulus = parseInt(val);
                
                if ((lulus - masuk) <= 2) {
                  setErrors(prev => ({ ...prev, tahun_lulus: 'Tahun lulus harus lebih dari 2 tahun setelah tahun masuk' }));
                } else if ((lulus - masuk) > 5) {
                  setErrors(prev => ({ ...prev, tahun_lulus: `Tahun lulus maksimal 5 tahun setelah tahun masuk (${masuk + 5})` }));
                } else {
                  setErrors(prev => ({ ...prev, tahun_lulus: undefined }));
                }
              } else {
                 setErrors(prev => ({ ...prev, tahun_lulus: undefined }));
              }
            }} 
          />
          {errors.tahun_lulus && <p className="text-xs text-red-500 mt-0.5">{errors.tahun_lulus}</p>}
        </div>

        {/* --- Baris 5 --- */}
        {/* PERBAIKAN Z-INDEX: Memastikan SmoothKota tidak tertutup oleh grid di bawahnya */}
        <div className="space-y-1 relative z-[60] focus-within:z-[9999] [&_button]:!p-2.5 [&_button]:!px-3 [&_button]:!rounded-xl [&_button]:!border-fourth [&_button_span]:!text-sm">
          <SmoothKota 
            label="Tempat Lahir"
            isRequired={true}
            options={kotaOpts}
            value={formData.tempat_lahir || ""}
            placeholder="Cari kota..."
            isSearchable={true}
            onSelect={(val) => { 
              updateFormData({ tempat_lahir: val }); 
              setErrors(prev => ({ ...prev, tempat_lahir: undefined })); 
            }}
          />
          {errors.tempat_lahir && <p className="text-xs text-red-500 mt-0.5">{errors.tempat_lahir}</p>}
        </div>

        <div className="space-y-1 relative z-[55]">
          <DateOfBirthInput 
            isRequired={true} 
            value={formData.tanggal_lahir} 
            onChange={(val) => { 
              updateFormData({ tanggal_lahir: val }); 
              setErrors(prev => ({ ...prev, tanggal_lahir: undefined }));

              if (formData.tahun_masuk) {
                const birthYear = new Date(val).getFullYear();
                const entryYear = parseInt(formData.tahun_masuk);
                
                if (entryYear - birthYear < 14) {
                  alertError('Peringatan: Tanggal lahir harus minimal 14 tahun di bawah tahun masuk.');
                  setErrors(prev => ({ ...prev, tanggal_lahir: 'Usia tidak mencukupi (minimal 14 tahun)' }));
                }
              }
            }} 
          />
          {errors.tanggal_lahir && <p className="text-xs text-red-500 mt-0.5">{errors.tanggal_lahir}</p>}
        </div>

        {/* --- Baris 6 (Full Width) --- */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
           <div className="space-y-1">
              <label className="text-[11px] font-bold text-primary uppercase">Alamat <span className="text-red-500">*</span></label>
              <textarea 
                value={formData.alamat || ""} 
                onChange={(e) => { 
                  const val = e.target.value;
                  updateFormData({ alamat: val }); 
                  
                  // Validasi Real-Time Alamat
                  if (val.trim().length > 0 && val.trim().length < 15) {
                    setErrors(prev => ({ ...prev, alamat: 'Sertakan alamat lengkap (nama jalan, RT/RW, atau desa)' }));
                  } else if (val.trim().length > 255) {
                    setErrors(prev => ({ ...prev, alamat: 'Alamat terlalu panjang' }));
                  } else if (val.trim().length === 0) {
                    setErrors(prev => ({ ...prev, alamat: 'Alamat wajib diisi' }));
                  } else {
                    setErrors(prev => ({ ...prev, alamat: undefined })); 
                  }
                }} 
                rows="3"
                placeholder="Contoh: Jl. Merdeka No. 123, RT 01/RW 02, Desa Maju..."
                className={`w-full p-2.5 bg-white border ${errors.alamat ? 'border-red-400' : 'border-fourth'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary`} 
              />
              {errors.alamat && <p className="text-xs text-red-500 mt-0.5">{errors.alamat}</p>}
           </div>
           
           <div className="space-y-1">
              <label className="text-[11px] font-bold text-primary uppercase">Foto <span className="text-red-500">*</span></label>
              <label className="flex items-center gap-4 border border-dashed border-fourth rounded-xl p-3 cursor-pointer hover:border-primary h-[106px] relative group transition-all">
                {preview ? (
                  <img src={preview} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                ) : (
                  <div className="p-4 bg-fourth rounded-lg text-third"><ImageIcon size={24} /></div>
                )}
                <div className="flex-1">
                  <div className="text-xs font-bold text-primary mb-1 flex items-center gap-1"><Upload size={12} /> Pilih File</div>
                  <span className="text-[10px] text-gray-400">Masukkan file dengan format foto dengan ukuran maksimal 2MB (Contoh: PNG/JPG)</span>
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

        {/* --- Baris 7 --- */}
        {/* UBAH z-30 MENJADI z-[60] DI BAWAH INI */}
        <div className="md:col-span-1 relative z-[60] focus-within:z-[100]">
          <SosmedInput 
            value={formData.social_media} 
            onChange={(val) => updateFormData({ social_media: val })} 
          />
        </div>
        
        <div className="md:col-span-1 pt-0.5">
          <MultiSelectDropdown 
            label="Keahlian / Skills" 
            placeholder="Cari skill..." 
            options={skillOptions} 
            selected={formData.skills || []} 
            onChange={(val) => updateFormData({ skills: val })} 
            valueKey="id"
          />
        </div>
      </div>

      {/* --- Footer Buttons --- */}
      <div className="pt-6 mt-4 flex justify-between border-t border-fourth">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-fourth rounded-xl text-xs font-bold text-primary hover:bg-fourth transition-all active:scale-95">
          <ArrowLeft size={14} /> Kembali
        </button>
        <button onClick={handleNext} className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20">
          Selanjutnya <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}