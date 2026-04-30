import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import SelectInput from './SelectInput'; // Import persis seperti di Step2Profile

export default function ModalTambahManual({ isOpen, onClose, onSubmit, isSubmitting, jurusanOptions }) {
  const [formData, setFormData] = useState({ nisn: '', nama: '', id_jurusan: '' });
  const [errors, setErrors] = useState({ nisn: undefined });

  // Reset form dan error setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setFormData({ nisn: '', nama: '', id_jurusan: '' });
      setErrors({ nisn: undefined });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi ulang saat submit
    let hasError = false;
    let currentErrors = {};

    if (!formData.nisn?.trim()) {
      currentErrors.nisn = 'NISN wajib diisi';
      hasError = true;
    } else {
      const digits = formData.nisn.replace(/\D/g, '');
      if (digits.length !== 10) {
        currentErrors.nisn = 'NISN harus terdiri dari tepat 10 angka';
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(currentErrors);
      return; 
    }

    if (!formData.id_jurusan) {
      return; 
    }

    // TRIK JITU: Kirim semua kemungkinan nama kolom agar backend PASTI menangkap ID-nya
    const payload = {
      nisn: formData.nisn,
      nama: formData.nama,
      id_jurusan: formData.id_jurusan,   // Dipakai di registrasi
      jurusan_id: formData.id_jurusan,   // Standar default Laravel
      jurusan: formData.id_jurusan       // Jika backend minta string field
    };

    onSubmit(payload, () => {
      // Callback success
    });
  };

  const isFormValid = 
    formData.nisn.length === 10 && 
    formData.nama.trim().length > 0 && 
    formData.id_jurusan !== '' && 
    !errors.nisn;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-visible animate-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-primary">Tambah Data Manual</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Form Modal */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Input NISN Validasi Real-Time */}
          <div>
            <label className="block text-[11px] font-black text-primary uppercase tracking-wider mb-2">
              NISN <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              inputMode="numeric"
              maxLength={10} 
              value={formData.nisn || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ''); 
                setFormData(prev => ({ ...prev, nisn: val }));
                
                if (val.length > 0 && val.length < 10) {
                  setErrors(prev => ({ ...prev, nisn: 'NISN harus terdiri dari tepat 10 angka' }));
                } else if (val.length === 0) {
                  setErrors(prev => ({ ...prev, nisn: 'NISN wajib diisi' }));
                } else {
                  setErrors(prev => ({ ...prev, nisn: undefined })); 
                }
              }}
              className={`w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all border ${
                errors.nisn 
                  ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-500 bg-red-50/30' 
                  : 'border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
              }`}
              placeholder="Masukkan 10 digit NISN siswa"
            />
            {errors.nisn && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-1.5 animate-in fade-in">
                <AlertCircle size={14} /> {errors.nisn}
              </p>
            )}
          </div>

          {/* Input Nama */}
          <div>
            <label className="block text-[11px] font-black text-primary uppercase tracking-wider mb-2">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Masukkan nama lengkap siswa"
            />
          </div>

          {/* Input Jurusan (SelectInput) */}
          <div className="relative z-50"> 
             <SelectInput 
                label="Jurusan" 
                placeholder="Pilih jurusan" 
                options={jurusanOptions} // Membaca props dari masterJurusan
                value={formData.id_jurusan || ""} 
                onSelect={(val) => setFormData({...formData, id_jurusan: val})} 
              />
          </div>

          {/* Action Modal */}
          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !isFormValid}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan Data
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}