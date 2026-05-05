import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, AlertCircle, Search, CheckCircle2, UserCircle } from 'lucide-react';
import SelectInput from './SelectInput';
import { adminApi } from '../../api/admin';

export default function ModalTambahManual({ isOpen, onClose, onSubmit, isSubmitting, jurusanOptions }) {
  const [formData, setFormData] = useState({ nisn: '', nama: '', id_jurusan: '', status_kelulusan: 'lulus' });
  const [errors, setErrors] = useState({ nisn: undefined });
  const [lookupState, setLookupState] = useState('idle'); // 'idle' | 'loading' | 'found' | 'not_found'
  const [lookupResult, setLookupResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ nisn: '', nama: '', id_jurusan: '', status_kelulusan: 'lulus' });
      setErrors({ nisn: undefined });
      setLookupState('idle');
      setLookupResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNisnChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, nisn: val }));
    // Reset lookup when NISN changes
    setLookupState('idle');
    setLookupResult(null);

    if (val.length > 0 && val.length < 10) {
      setErrors(prev => ({ ...prev, nisn: 'NISN harus terdiri dari tepat 10 angka' }));
    } else if (val.length === 0) {
      setErrors(prev => ({ ...prev, nisn: 'NISN wajib diisi' }));
    } else {
      setErrors(prev => ({ ...prev, nisn: undefined }));
    }
  };

  const handleLookup = async () => {
    if (formData.nisn.length !== 10) return;

    try {
      setLookupState('loading');
      const res = await adminApi.lookupNisn(formData.nisn);
      const data = res.data?.data;

      if (data?.found) {
        setLookupState('found');
        setLookupResult(data);
        // Auto-fill nama dan jurusan
        setFormData(prev => ({
          ...prev,
          nama: data.nama || prev.nama,
          id_jurusan: data.id_jurusan ? String(data.id_jurusan) : prev.id_jurusan,
        }));
      } else {
        setLookupState('not_found');
        setLookupResult(data);
      }
    } catch (err) {
      setLookupState('not_found');
      setLookupResult({ message: 'Gagal memverifikasi NISN.' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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

    if (!formData.id_jurusan) return;

    const payload = {
      nisn: formData.nisn,
      nama: formData.nama,
      id_jurusan: formData.id_jurusan,
      jurusan_id: formData.id_jurusan,
      jurusan: formData.id_jurusan,
      status_kelulusan: formData.status_kelulusan,
    };

    onSubmit(payload, () => {});
  };

  const isFormValid =
    formData.nisn.length === 10 &&
    formData.nama.trim().length > 0 &&
    formData.id_jurusan !== '' &&
    !errors.nisn;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-visible animate-in zoom-in-95 duration-200 my-auto">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-primary">Tambah Data Manual</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* NISN + Verifikasi */}
          <div>
            <label className="block text-[11px] font-black text-primary uppercase tracking-wider mb-2">
              NISN <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={formData.nisn || ""}
                onChange={handleNisnChange}
                className={`flex-1 px-4 py-2.5 text-sm rounded-xl outline-none transition-all border ${
                  errors.nisn
                    ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-500 bg-red-50/30'
                    : 'border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                }`}
                placeholder="Masukkan 10 digit NISN"
              />
              <button
                type="button"
                onClick={handleLookup}
                disabled={formData.nisn.length !== 10 || lookupState === 'loading'}
                className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
              >
                {lookupState === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                Cek
              </button>
            </div>
            {errors.nisn && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-1.5">
                <AlertCircle size={14} /> {errors.nisn}
              </p>
            )}

            {/* Lookup Result */}
            {lookupState === 'found' && (
              <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-200">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-800">Alumni ditemukan!</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    <span className="font-semibold">{lookupResult?.nama}</span> — {lookupResult?.jurusan}
                  </p>
                  <p className="text-[10px] text-emerald-600 mt-1">Nama & jurusan telah diisi otomatis.</p>
                </div>
              </div>
            )}

            {lookupState === 'not_found' && (
              <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-200">
                <UserCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800">Alumni tidak ditemukan</p>
                  <p className="text-xs text-amber-700 mt-0.5">NISN ini belum terdaftar. Silakan isi nama dan jurusan secara manual.</p>
                </div>
              </div>
            )}
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
              className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                lookupState === 'found' ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200'
              }`}
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
              Simpan Data
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
}