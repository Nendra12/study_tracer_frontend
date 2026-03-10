import React, { useState } from 'react';
import { FileText, Edit2, Save, X, Briefcase, Plus } from 'lucide-react';
import SmoothDropdown from '../admin/SmoothDropdown'; 

export default function TabDeskripsiKarier({ profile, onRefresh, onShowSuccess }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    status_karier_id: '',
    deskripsi: ''
  });

  const riwayatKarier = profile?.riwayat_status || []; 
  const deskripsiList = profile?.deskripsi_karier || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ id: null, status_karier_id: '', deskripsi: '' });
    setIsEditing(false);
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      status_karier_id: String(item.status_karier_id), 
      deskripsi: item.deskripsi
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.status_karier_id) {
        alert("Pilih status karier terlebih dahulu!");
        return;
    }

    setLoading(true);
    try {
      // TODO: Ganti dengan fungsi pemanggilan API simpan deskripsi Anda
      // Contoh: await alumniApi.saveDeskripsiKarier(formData);
      
      setTimeout(() => {
        onShowSuccess('Deskripsi karier berhasil disimpan!');
        onRefresh(); 
        resetForm();
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Gagal menyimpan deskripsi karier:", error);
      setLoading(false);
    }
  };

  // Fungsi helper untuk merender nama pekerjaan/kampus/usaha
  const getKarierLabel = (item) => {
    if (item.pekerjaan) {
      return `${item.pekerjaan.posisi || 'Bekerja'} di ${item.pekerjaan.perusahaan?.nama || item.pekerjaan.perusahaan || 'Perusahaan'}`;
    }
    if (item.kuliah) {
      return `Mahasiswa di ${item.kuliah.universitas?.nama || item.kuliah.universitas || 'Universitas'}`;
    }
    if (item.wirausaha) {
      return `Wirausaha: ${item.wirausaha.nama_usaha || 'Usaha'}`;
    }
    return item.status?.nama || 'Status Tidak Diketahui';
  };

  return (
    <div className="p-6 lg:p-10 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-primary">Deskripsi Karier</h2>
          <p className="text-slate-500 text-sm mt-1">Ceritakan lebih detail mengenai peran dan tanggung jawab pada pekerjaan Anda.</p>
        </div>
        
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-bold text-sm transition-all"
          >
            <Plus size={16} /> Tambah Deskripsi Karier
          </button>
        )}
      </div>

      {riwayatKarier.length === 0 && !isEditing && (
        <div className="text-center py-12 bg-amber-50 rounded-2xl border border-dashed border-amber-200">
          <Briefcase className="mx-auto text-amber-400 mb-4" size={40} />
          <h3 className="text-base font-bold text-amber-800 mb-1">Status Karier Belum Diisi</h3>
          <p className="text-amber-600/80 text-sm max-w-sm mx-auto">Silakan isi data pada tab "Status Karier" terlebih dahulu sebelum menambahkan deskripsi.</p>
        </div>
      )}

      {/* --- FORM EDIT / TAMBAH --- */}
      {isEditing && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-primary">
              {formData.id ? 'Edit Deskripsi Karier' : 'Tambah Deskripsi Karier Baru'}
            </h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-red-500">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* DROPDOWN CUSTOM */}
            <div className="relative z-60"> 
              <SmoothDropdown
                label="Pilih Status Karier"
                isRequired={true}
                isSearchable={false}
                placeholder="-- Pilih Pekerjaan / Perusahaan --"
                options={riwayatKarier.map(karier => getKarierLabel(karier))}
                value={
                  riwayatKarier.find(k => String(k.id) === String(formData.status_karier_id)) 
                    ? getKarierLabel(riwayatKarier.find(k => String(k.id) === String(formData.status_karier_id))) 
                    : ""
                }
                onSelect={(selectedLabel) => {
                  const selectedKarier = riwayatKarier.find(k => getKarierLabel(k) === selectedLabel);
                  if (selectedKarier) {
                    setFormData(prev => ({ ...prev, status_karier_id: String(selectedKarier.id) }));
                  }
                }}
              />
            </div>

            <div className="relative z-0 mt-4">
              <label className="block text-sm font-semibold text-primary mb-2">Deskripsi Tanggung Jawab & Pencapaian <span className="text-red-500">*</span></label>
              <textarea 
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                required
                rows="6"
                placeholder="Ceritakan detail pekerjaan Anda, tanggung jawab utama, proyek yang dikerjakan, atau pencapaian yang diraih..."
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-sm resize-none transition-all"
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
                {loading ? 'Menyimpan...' : <><Save size={16} /> Simpan Deskripsi</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- LIST DESKRIPSI KARIER --- */}
      {!isEditing && riwayatKarier.length > 0 && deskripsiList.length === 0 && (
         <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <FileText className="mx-auto text-slate-300 mb-4" size={40} />
          <h3 className="text-base font-bold text-primary mb-1">Belum ada deskripsi</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Tambahkan deskripsi untuk melengkapi profil karier Anda agar lebih menarik.</p>
        </div>
      )}

      <div className="space-y-4">
        {deskripsiList.map((item, idx) => {
          const karierTerkait = riwayatKarier.find(k => String(k.id) === String(item.status_karier_id));

          return (
            <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm relative group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {karierTerkait ? getKarierLabel(karierTerkait) : 'Pekerjaan Tidak Diketahui'}
                  </h3>
                </div>
                <button 
                  onClick={() => handleEdit(item)}
                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Edit Deskripsi"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {item.deskripsi}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}