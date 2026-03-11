import React, { useState } from 'react';
import { FileText, Edit2, Save, X, Briefcase, Plus, Trash2 } from 'lucide-react';
import SmoothDropdown from '../admin/SmoothDropdown';
import { alumniApi } from '../../api/alumni';
import DeskripsiKerierInput from '../admin/DeskripsiKerierInput';
import { alertConfirm } from '../../utilitis/alert';

export default function TabDeskripsiKarier({ profile, onRefresh, onShowSuccess }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    id_riwayat: '',
    deskripsi: ''
  });

  const riwayatKarier = profile?.riwayat_status || [];
  const deskripsiList = profile?.deskripsi_karier || [];

  const handleInputChange = (data) => {
    setFormData(prev => ({ ...prev, deskripsi: data }));
  };

  const resetForm = () => {
    setFormData({ id: '', id_riwayat: '', deskripsi: '' });
    setIsEditing(false);
  };

  const handleEdit = (item) => {
    setFormData({
      id: String(item.id),
      id_riwayat: String(item.status_karier_id || item.id_riwayat),
      deskripsi: item.deskripsi
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    const result = await alertConfirm(
      'Apakah Anda yakin ingin menghapus deskripsi karier ini? Tindakan ini tidak dapat dibatalkan.'
    );

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await alumniApi.deleteDeskripsiKarier(id);
        onShowSuccess('Deskripsi karier berhasil dihapus!');
        onRefresh();
      } catch (error) {
        const message = error.response?.data?.message || 'Gagal menghapus deskripsi';
        alert(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_riwayat) {
      alert("Pilih status karier terlebih dahulu!");
      return;
    }

    try {
      setLoading(true);

      if (formData.id) {
        // Update existing
        await alumniApi.updateDeskripsiKarier(formData.id, {
          id_riwayat: formData.id_riwayat,
          deskripsi: formData.deskripsi
        });
        onShowSuccess('Deskripsi karier berhasil diperbarui!');
      } else {
        // Add new
        await alumniApi.addDeskripsiKarier({
          id_riwayat: formData.id_riwayat,
          deskripsi: formData.deskripsi
        });
        onShowSuccess('Deskripsi karier berhasil disimpan!');
      }

      onRefresh();
      resetForm();
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menyimpan deskripsi';
      alert(message);
    } finally {
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

  // Filter riwayat karir yang belum ada deskripsinya (kecuali yang sedang diedit)
  const getAvailableRiwayat = () => {
    return riwayatKarier.filter(karier => {
      // Jika sedang edit dan ini adalah karir yang sedang diedit, tampilkan
      if (formData.id && String(karier.id) === String(formData.id_riwayat)) {
        return true;
      }
      // Cek apakah karir ini sudah ada deskripsinya
      const hasDescription = deskripsiList.some(
        desc => String(desc.status_karier_id || desc.id_riwayat) === String(karier.id)
      );
      return !hasDescription;
    });
  };



  return (
    <div className="p-6 lg:p-10 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-primary">Deskripsi Karier</h2>
          <p className="text-slate-500 text-sm mt-1">Ceritakan lebih detail mengenai peran dan tanggung jawab pada pekerjaan Anda.</p>
        </div>

        {!isEditing && getAvailableRiwayat().length > 0 && (
          <button
            onClick={() => setIsEditing(true)}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-bold text-sm transition-all"
          >
            <Plus size={16} /> Deskripsi Karier
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

      {riwayatKarier.length > 0 && getAvailableRiwayat().length === 0 && !isEditing && (
        <div className="text-center py-12 bg-green-50 rounded-2xl border border-dashed border-green-200 mb-8">
          <FileText className="mx-auto text-green-400 mb-4" size={40} />
          <h3 className="text-base font-bold text-green-800 mb-1">Semua Status Karier Sudah Memiliki Deskripsi</h3>
          <p className="text-green-600/80 text-sm max-w-sm mx-auto">Anda sudah menambahkan deskripsi untuk semua riwayat karier.</p>
        </div>
      )}

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
            <div className="relative z-60 ">
              {formData.id ? (
                // Saat edit, tampilkan sebagai read-only
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Status Karier <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-3 w-full p-3 bg-slate-100 border-2 border-slate-200 rounded-xl text-sm text-slate-700 font-medium">
                    {riwayatKarier.find(k => String(k.id) === String(formData.id_riwayat))
                      ? getKarierLabel(riwayatKarier.find(k => String(k.id) === String(formData.id_riwayat)))
                      : "Status tidak ditemukan"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 italic">Status karier tidak dapat diubah saat edit</p>
                </div>
              ) : (
                // Saat tambah baru, tampilkan dropdown
                <SmoothDropdown
                  label="Pilih Status Karier"
                  isRequired={true}
                  isSearchable={false}
                  placeholder="-- Pilih Pekerjaan / Perusahaan --"
                  options={getAvailableRiwayat().map(karier => getKarierLabel(karier))}
                  value={
                    formData.id_riwayat && riwayatKarier.find(k => String(k.id) === String(formData.id_riwayat))
                      ? getKarierLabel(riwayatKarier.find(k => String(k.id) === String(formData.id_riwayat)))
                      : ""
                  }
                  onSelect={(selectedLabel) => {
                    const selectedKarier = getAvailableRiwayat().find(k => getKarierLabel(k) === selectedLabel);
                    if (selectedKarier) {
                      setFormData(prev => ({ ...prev, id_riwayat: String(selectedKarier.id) }));
                    }
                  }}
                />
              )}
            </div>

            <div className="relative z-0 mt-4">
              <label className="block text-sm font-semibold text-primary mb-3">Deskripsi Tanggung Jawab & Pencapaian <span className="text-red-500">*</span></label>
              <DeskripsiKerierInput
                content={formData.deskripsi}
                onChange={(html) => handleInputChange(html)}
                placeholder="Ketik pertanyaan Anda..."
                minHeight="60px"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="cursor-pointer px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary/90 transition-all disabled:opacity-70"
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
        {deskripsiList
          .filter(item => !isEditing || String(item.id) !== String(formData.id))
          .map((item, idx) => {
            const karierTerkait = riwayatKarier.find(k => String(k.id) === String(item.status_karier_id || item.id_riwayat));

            return (
              <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm relative group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">
                      {karierTerkait ? getKarierLabel(karierTerkait) : 'Pekerjaan Tidak Diketahui'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(item)}
                      className="cursor-pointer p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Edit Deskripsi"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="cursor-pointer p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Deskripsi"
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p
                  className="prose  text-slate-600 text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                ></p>
              </div>
            );
          })}
      </div>

    </div>
  );
}