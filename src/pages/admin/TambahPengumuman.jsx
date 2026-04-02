import React, { useState, useEffect } from 'react';
import { X, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import SmoothDropdown from '../../components/admin/SmoothDropdown';
import TeksEditorInputan from '../../components/admin/TeksEditorInputan';
import { adminApi } from '../../api/admin';
import { STORAGE_BASE_URL } from '../../api/axios';
import { alertError } from '../../utilitis/alert';

const TambahPengumuman = ({ isOpen, onClose, onSuccess, editData = null }) => {
  const isEditMode = !!editData;

  const [formData, setFormData] = useState({
    judul: '',
    status: 'aktif',
    is_pinned: false,
    konten: '',
    foto: null,
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // --- HELPER UNTUK MAPPING STATUS ---
  const statusOptions = [
    "Aktif (Dipublikasikan)", 
    "Draft (Disimpan saja)", 
    "Berakhir (Arsip)"
  ];

  const getStatusLabel = (val) => {
    if (val === 'aktif') return "Aktif (Dipublikasikan)";
    if (val === 'draft') return "Draft (Disimpan saja)";
    if (val === 'berakhir') return "Berakhir (Arsip)";
    return "Aktif (Dipublikasikan)";
  };

  const getStatusValue = (label) => {
    if (label === "Aktif (Dipublikasikan)") return 'aktif';
    if (label === "Draft (Disimpan saja)") return 'draft';
    if (label === "Berakhir (Arsip)") return 'berakhir';
    return 'aktif';
  };

  // --- SINKRONISASI DATA SAAT EDIT ---
  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        judul: editData.judul || '',
        status: editData.status || 'aktif',
        is_pinned: editData.is_pinned || false,
        konten: editData.konten || '',
        foto: null,
      });
      // Set preview gambar dari data yang ada
      if (editData.foto) {
        const fotoUrl = editData.foto.startsWith('http') 
          ? editData.foto 
          : `${STORAGE_BASE_URL}/${editData.foto}`;
        setPreviewUrl(fotoUrl);
      } else {
        setPreviewUrl(null);
      }
      setErrors({});
    } else if (!editData && isOpen) {
      setFormData({
        judul: '',
        status: 'aktif',
        is_pinned: false,
        konten: '',
        foto: null,
      });
      setPreviewUrl(null);
      setErrors({});
    }
  }, [editData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, foto: null, remove_foto: true }));
    setPreviewUrl(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    
    try {
      // Buat FormData untuk multipart upload
      const fd = new FormData();
      fd.append('judul', formData.judul);
      fd.append('konten', formData.konten);
      fd.append('status', formData.status);
      fd.append('is_pinned', formData.is_pinned ? '1' : '0');
      
      if (formData.foto instanceof File) {
        fd.append('foto', formData.foto);
      }

      if (isEditMode) {
        // Untuk update, tambahkan _method PUT
        fd.append('_method', 'PUT');
        
        // Handle penghapusan foto secara eksplisit
        if (formData.remove_foto && !formData.foto) {
          fd.append('remove_foto', '1');
        }
        
        await adminApi.updatePengumuman(editData.id, fd);
      } else {
        await adminApi.createPengumuman(fd);
      }
      
      onSuccess(); // Trigger refetch di parent
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        const msg = err.response?.data?.message || 'Gagal menyimpan pengumuman';
        alertError?.(msg) || alert(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-primary">
            {isEditMode ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Section Upload Gambar */}
          <div className="space-y-3">
            <span className="text-sm font-bold text-primary">Gambar / Banner <span className="text-gray-400 font-normal">(opsional)</span></span>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
              <div className="w-32 h-32 sm:w-24 sm:h-24 bg-white rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden shadow-sm shrink-0 relative group">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      onClick={handleRemoveImage}
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
                <p className="text-xs text-gray-500 italic text-center sm:text-left">Silakan unggah gambar pengumuman, rasio bebas, ukuran maks 2MB.</p>
                <label className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-xl cursor-pointer hover:bg-primary hover:text-white transition-all text-sm block sm:inline-block text-center">
                  Pilih File
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Input Judul */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary uppercase tracking-wider">Judul Pengumuman *</label>
              <input 
                name="judul" 
                value={formData.judul} 
                onChange={handleInputChange} 
                placeholder="Contoh: Pemeliharaan Server Sistem Tracer" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" 
              />
              {errors.judul && <p className="text-red-500 text-xs mt-1">{errors.judul[0]}</p>}
            </div>

            {/* Status Publikasi menggunakan SmoothDropdown */}
            <div className="w-full">
              <SmoothDropdown 
                label="Status Publikasi"
                options={statusOptions}
                value={getStatusLabel(formData.status)}
                onSelect={(selectedLabel) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    status: getStatusValue(selectedLabel) 
                  }));
                }}
                isSearchable={false}
              />
            </div>

            {/* Toggle Pin/Sematkan */}
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50/50">
              <input 
                type="checkbox" 
                id="is_pinned"
                name="is_pinned" 
                checked={formData.is_pinned}
                onChange={handleInputChange}
                className="w-5 h-5 cursor-pointer accent-primary"
              />
              <div className="flex flex-col">
                <label htmlFor="is_pinned" className="text-sm font-bold text-primary cursor-pointer">Sematkan di Atas</label>
                <p className="text-xs text-gray-500">Pengumuman akan selalu muncul di urutan pertama dashboard pengguna.</p>
              </div>
            </div>

            {/* Input Konten */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Isi Pengumuman *</label>
              <TeksEditorInputan 
                content={formData.konten}
                onChange={(html) => {
                  setFormData(prev => ({ ...prev, konten: html }));
                  if (errors.konten) setErrors(prev => ({ ...prev, konten: undefined }));
                }}
                placeholder="Tuliskan detail pengumuman di sini..."
                minHeight="200px"
              />
              {errors.konten && <p className="text-red-500 text-xs mt-1">{errors.konten[0]}</p>}
            </div>
          </div>
        </div>

        {/* Footer / Tombol Submit */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50 rounded-b-2xl">
          <button 
            onClick={onClose} 
            disabled={submitting} 
            className="cursor-pointer text-sm font-bold text-gray-500 hover:text-gray-700 px-4 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting || !formData.judul.trim() || !formData.konten.trim()} 
            className="cursor-pointer flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-[#2e4344] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <>{isEditMode ? 'Simpan Perubahan' : 'Kirim Pengumuman'} <Send size={18} /></>}
          </button>
        </div>

      </div>
    </div>
  );
};

export default TambahPengumuman;