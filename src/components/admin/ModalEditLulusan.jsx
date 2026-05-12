import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2 } from 'lucide-react';
import SelectInput from './SelectInput';

export default function ModalEditLulusan({ isOpen, onClose, onSubmit, isSubmitting, jurusanOptions, editData }) {
  const [formData, setFormData] = useState({ 
    nisn: '', 
    nama: '', 
    id_jurusan: '', 
    status_kelulusan: 'lulus',
    tahun_lulus: ''
  });

  // Mencegah scroll pada body & mengisi data awal saat modal terbuka
  useEffect(() => {
    if (isOpen && editData) {
      document.body.style.overflow = 'hidden';
      
      // Mencari value jurusan yang cocok dari option berdasarkan nama/id
      const matchedJurusan = jurusanOptions.find(j => 
        j.label === editData.jurusan || 
        j.value === editData.id_jurusan || 
        j.value === editData.jurusan_id
      );

      setFormData({ 
        nisn: editData.nisn || '', 
        nama: editData.nama || '', 
        id_jurusan: matchedJurusan ? matchedJurusan.value : '', 
        status_kelulusan: editData.status_kelulusan || 'lulus',
        tahun_lulus: editData.tahun_lulus || editData.tahunLulus || ''
      });
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, editData, jurusanOptions]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.id_jurusan) return;

    const payload = {
      nisn: formData.nisn,
      nama: formData.nama,
      id_jurusan: formData.id_jurusan,
      jurusan_id: formData.id_jurusan,
      status_kelulusan: formData.status_kelulusan,
      tahun_lulus: formData.tahun_lulus
    };

    onSubmit(payload);
  };

  const isFormValid = formData.nama.trim().length > 0 && formData.id_jurusan !== '';

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-start sm:items-center justify-center p-4 bg-black/50 backdrop-blur animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-[0_0_40px_-15px_rgba(0,0,0,0.2)] border border-slate-100 overflow-visible animate-in zoom-in-95 duration-200 my-auto">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-primary">Edit Data Lulusan</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* NISN (Disabled saat edit untuk menghindari duplikasi key) */}
          <div>
            <label className="block text-[11px] font-black text-primary uppercase tracking-wider mb-2">
              NISN
            </label>
            <input
              type="text"
              value={formData.nisn}
              disabled
              className="w-full px-4 py-2.5 text-sm border border-slate-200 bg-slate-100 text-slate-500 rounded-xl outline-none cursor-not-allowed"
            />
          </div>

          {/* Nama */}
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

          {/* Jurusan */}
          <div className="relative z-50">
            <SelectInput
              label="Jurusan"
              placeholder="Pilih jurusan"
              options={jurusanOptions}
              value={formData.id_jurusan || ""}
              onSelect={(val) => setFormData({...formData, id_jurusan: val})}
            />
          </div>
          
          {/* Tahun Lulus */}
          <div>
            <label className="block text-[11px] font-black text-primary uppercase tracking-wider mb-2">
              Tahun Lulus
            </label>
            <input
              type="number"
              value={formData.tahun_lulus}
              onChange={(e) => setFormData({...formData, tahun_lulus: e.target.value})}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Contoh: 2026"
            />
          </div>

          {/* Status Kelulusan */}
          <div>
            <label className="block text-[11px] font-black text-primary uppercase tracking-wider mb-2">
              Status Kelulusan <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, status_kelulusan: 'lulus'})}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer ${
                  formData.status_kelulusan === 'lulus'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                ✓ Lulus
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, status_kelulusan: 'tidak_lulus'})}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer ${
                  formData.status_kelulusan === 'tidak_lulus'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                ✗ Tidak Lulus
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
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
              Simpan Perubahan
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
}