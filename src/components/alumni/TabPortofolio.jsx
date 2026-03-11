import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Image as ImageIcon, X, Save, Clock } from 'lucide-react';
import { alumniApi } from '../../api/alumni';
import { STORAGE_BASE_URL } from '../../api/axios';

export default function TabPortofolio({ profile, onRefresh, onShowSuccess }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State untuk form tambah/edit portofolio
  const [formData, setFormData] = useState({
    id: null,
    judul: '',
    deskripsi: '',
    link_project: '',
    gambar: null
  });

  // Local state — inisialisasi dari profile.portofolio
  const [portofolioList, setPortofolioList] = useState(profile?.portofolio || []);
  const hasMutated = useRef(false);

  // Sync dari profile prop (saat page refresh / navigasi kembali)
  useEffect(() => {
    if (hasMutated.current) {
      hasMutated.current = false;
      return; // Skip — local state sudah benar dari mutasi
    }
    setPortofolioList(profile?.portofolio || []);
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ id: null, judul: '', deskripsi: '', link_project: '', gambar: null });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('judul', formData.judul);
      if (formData.deskripsi) fd.append('deskripsi', formData.deskripsi);
      if (formData.link_project) fd.append('link_project', formData.link_project);
      if (formData.gambar instanceof File) fd.append('gambar', formData.gambar);

      if (formData.id) {
        fd.append('_method', 'PUT');
        const res = await alumniApi.updatePortofolio(formData.id, fd);
        const updated = res.data.data;
        setPortofolioList(prev => prev.map(p => p.id === formData.id ? updated : p));
        onShowSuccess('Perubahan portofolio telah dikirim, menunggu persetujuan admin');
      } else {
        const res = await alumniApi.createPortofolio(fd);
        const created = res.data.data;
        setPortofolioList(prev => [created, ...prev]);
        onShowSuccess('Portofolio telah dikirim, menunggu persetujuan admin');
      }
      resetForm();
      hasMutated.current = true;
      onRefresh();
    } catch (error) {
      const msg = error.response?.data?.message || 'Gagal menyimpan portofolio';
      alert(msg);
      console.error('Gagal menyimpan portofolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      judul: item.judul || '',
      deskripsi: item.deskripsi || '',
      link_project: item.link_project || '',
      gambar: null,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus portofolio ini?')) return;
    try {
      await alumniApi.deletePortofolio(id);
      setPortofolioList(prev => prev.filter(p => p.id !== id));
      onShowSuccess('Penghapusan portofolio telah dikirim, menunggu persetujuan admin');
      hasMutated.current = true;
      onRefresh();
    } catch (error) {
      const msg = error.response?.data?.message || 'Gagal menghapus portofolio';
      alert(msg);
    }
  };

  const pendingUpdates = (profile?.pending_updates || []).filter(u => u.section === 'portofolio' && u.status === 'pending');

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_BASE_URL}/${path}`;
  };

  return (
    <div className="p-6 lg:p-10 animate-fade-in">
      {/* Pending Update Alert */}
      {pendingUpdates.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-800 mb-0.5">Menunggu Persetujuan Admin</h3>
            <p className="text-xs text-amber-700/80 font-medium">
              Anda memiliki perubahan portofolio yang sedang ditinjau oleh admin. Perubahan baru akan menggantikan pengajuan sebelumnya.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-primary">Portofolio & Proyek</h2>
          <p className="text-slate-500 text-sm mt-1">Tampilkan karya dan pengalaman proyek terbaik Anda.</p>
        </div>
        
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-bold text-sm transition-all"
          >
            <Plus size={16} /> Tambah Proyek
          </button>
        )}
      </div>

      {/* --- FORM TAMBAH / EDIT --- */}
      {isEditing && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-800">
              {formData.id ? 'Edit Proyek' : 'Tambah Proyek Baru'}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-red-500">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Proyek</label>
              <input 
                type="text" 
                name="judul"
                value={formData.judul}
                onChange={handleInputChange}
                required
                placeholder="Misal: Aplikasi E-Commerce Berbasis MERN"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Link Proyek / Website / Canva / Drive</label>
              <input 
                type="url" 
                name="link_project"
                value={formData.link_project}
                onChange={handleInputChange}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Gambar / Thumbnail Proyek</label>
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={(e) => setFormData({...formData, gambar: e.target.files[0] || null})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <p className="text-xs text-slate-500 mt-2">Upload gambar dengan format JPG, PNG, atau WEBP. Maksimal 5MB.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi Proyek</label>
              <textarea 
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                required
                rows="4"
                placeholder="Jelaskan peran Anda, teknologi yang digunakan, dan hasil dari proyek ini..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-sm resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary/90 transition-all disabled:opacity-70"
              >
                {loading ? 'Menyimpan...' : <><Save size={16} /> Simpan Proyek</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- LIST PORTOFOLIO --- */}
      {!isEditing && portofolioList.length === 0 && (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <ImageIcon className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-primary mb-2">Belum ada portofolio</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Tambahkan karya, penelitian, atau proyek terbaik yang pernah Anda kerjakan.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {portofolioList.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
            {/* Thumbnail Area */}
            <div className="h-48 bg-slate-100 overflow-hidden relative">
              {item.gambar ? (
                <img src={getImageUrl(item.gambar_thumbnail || item.gambar)} alt={item.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { const orig = getImageUrl(item.gambar); if (e.target.src !== orig) e.target.src = orig; }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <ImageIcon size={40} />
                </div>
              )}
              
              {/* Action Buttons (Overlay) */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(item)}
                  className="p-2 bg-white/90 backdrop-blur text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg shadow-sm transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-white/90 backdrop-blur text-red-600 hover:bg-red-600 hover:text-white rounded-lg shadow-sm transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-slate-800 line-clamp-1 mb-2">{item.judul}</h3>
              <p className="text-slate-600 text-sm flex-1 line-clamp-3 mb-4">{item.deskripsi}</p>
              
              {item.link_project && (
                <a 
                  href={item.link_project} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors mt-auto w-fit"
                >
                  <ExternalLink size={14} /> Lihat Proyek
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}