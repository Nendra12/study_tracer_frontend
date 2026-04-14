import React, { useState } from 'react';
import { FileText, Edit2, Save, X, Briefcase, Plus, Trash2, Clock, AlertCircle, Lock } from 'lucide-react';
import SmoothDropdown from '../../admin/SmoothDropdown';
import { alumniApi } from '../../../api/alumni';
import DeskripsiKerierInput from '../../admin/DeskripsiKerierInput';
import { alertConfirm, toastError, toastWarning } from '../../../utilitis/alert';

export default function TabDeskripsiKarier({ profile, onRefresh, onShowSuccess, isVerified }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mode: 'add' | 'edit' (deskripsi yg sudah approved) | 'edit_pending' (edit ulang pending)
  const [editMode, setEditMode] = useState('add');

  const [formData, setFormData] = useState({
    id: '',               // id deskripsi karier (untuk edit approved)
    id_riwayat: '',
    deskripsi: '',
    pendingId: '',        // id pending_profile_updates (untuk edit/cancel pending)
  });

  const riwayatKarier = profile?.riwayat_status || [];
  const deskripsiList = profile?.deskripsi_karier || [];

  // Semua pending deskripsi karier milik alumni ini
  const pendingDeskripsi = (profile?.pending_updates || []).filter(
    u => u.section === 'deskripsi_karier' && u.status === 'pending'
  );

  const handleInputChange = (data) => {
    setFormData(prev => ({ ...prev, deskripsi: data }));
  };

  const resetForm = () => {
    setFormData({ id: '', id_riwayat: '', deskripsi: '', pendingId: '' });
    setIsEditing(false);
    setEditMode('add');
  };

  // Edit deskripsi yang sudah approved
  const handleEdit = (item) => {
    setFormData({
      id: String(item.id),
      id_riwayat: String(item.status_karier_id || item.id_riwayat),
      deskripsi: item.deskripsi,
      pendingId: '',
    });
    setEditMode('edit');
    setIsEditing(true);
  };

  // Edit ulang pending yang sudah dikirim
  const handleEditPending = (pending) => {
    setFormData({
      id: '',
      id_riwayat: String(pending.new_data?.id_riwayat || ''),
      deskripsi: pending.new_data?.deskripsi || '',
      pendingId: String(pending.id),
    });
    setEditMode('edit_pending');
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
        onShowSuccess('Penghapusan deskripsi karier telah dikirim, menunggu persetujuan admin');
        onRefresh();
      } catch (error) {
        const message = error.response?.data?.message || 'Gagal menghapus deskripsi';
        toastError(message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Batalkan pending
  const handleCancelPending = async (pendingId) => {
    const result = await alertConfirm(
      'Apakah Anda yakin ingin membatalkan pengajuan ini? Data yang telah ada sebelumnya akan tetap berlaku.'
    );

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await alumniApi.cancelPendingDeskripsiKarier(pendingId);
        onShowSuccess('Pengajuan deskripsi karier berhasil dibatalkan');
        onRefresh();
      } catch (error) {
        const message = error.response?.data?.message || 'Gagal membatalkan pengajuan';
        toastError(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_riwayat) {
      toastWarning('Pilih status karier terlebih dahulu!');
      return;
    }

    try {
      setLoading(true);

      if (editMode === 'edit_pending') {
        // Edit ulang pending yang sudah dikirim
        await alumniApi.updatePendingDeskripsiKarier(formData.pendingId, {
          deskripsi: formData.deskripsi,
        });
        onShowSuccess('Pengajuan deskripsi karier berhasil diperbarui, menunggu persetujuan admin');
      } else if (editMode === 'edit' && formData.id) {
        // Update deskripsi yang sudah approved
        await alumniApi.updateDeskripsiKarier(formData.id, {
          id_riwayat: formData.id_riwayat,
          deskripsi: formData.deskripsi,
        });
        onShowSuccess('Perubahan deskripsi karier telah dikirim, menunggu persetujuan admin');
      } else {
        // Tambah baru
        await alumniApi.addDeskripsiKarier({
          id_riwayat: formData.id_riwayat,
          deskripsi: formData.deskripsi,
        });
        onShowSuccess('Deskripsi karier telah dikirim, menunggu persetujuan admin');
      }

      onRefresh();
      resetForm();
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menyimpan deskripsi';
      toastError(message);
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
      const univName = item.kuliah.universitas?.nama || item.kuliah.universitas || 'Universitas';
      const lokasiKuliah = [item.kuliah.kota?.nama || item.kuliah.kota, item.kuliah.provinsi?.nama || item.kuliah.provinsi].filter(Boolean).join(', ');
      return lokasiKuliah ? `Mahasiswa di ${univName} (${lokasiKuliah})` : `Mahasiswa di ${univName}`;
    }
    if (item.wirausaha) {
      const namaUsaha = item.wirausaha.nama_usaha || 'Usaha';
      const lokasiUsaha = [item.wirausaha.kota?.nama || item.wirausaha.kota, item.wirausaha.provinsi?.nama || item.wirausaha.provinsi].filter(Boolean).join(', ');
      return lokasiUsaha ? `Wirausaha: ${namaUsaha} (${lokasiUsaha})` : `Wirausaha: ${namaUsaha}`;
    }
    return item.status?.nama || 'Status Tidak Diketahui';
  };

  // Mendapatkan label karier dari id_riwayat (untuk pending baru/create)
  const getKarierLabelById = (idRiwayat) => {
    const karier = riwayatKarier.find(k => String(k.id) === String(idRiwayat));
    return karier ? getKarierLabel(karier) : 'Status Tidak Diketahui';
  };

  // Filter riwayat karir yang belum ada deskripsinya DAN belum ada pending-nya
  const getAvailableRiwayat = () => {
    return riwayatKarier.filter(karier => {
      // Jika sedang edit dan ini adalah karir yang sedang diedit, tampilkan
      if (formData.id && String(karier.id) === String(formData.id_riwayat)) {
        return true;
      }
      // Cek apakah karir ini sudah ada deskripsinya (approved)
      const hasDescription = deskripsiList.some(
        desc => String(desc.status_karier_id || desc.id_riwayat) === String(karier.id)
      );
      // Cek apakah sudah ada pending create untuk riwayat ini
      const hasPendingCreate = pendingDeskripsi.some(
        p => p.action === 'create' && String(p.new_data?.id_riwayat) === String(karier.id)
      );
      return !hasDescription && !hasPendingCreate;
    });
  };

  // id_riwayat yang sedang diedit pending (agar tidak muncul di form tambah)
  const editingPendingRiwayatId = editMode === 'edit_pending' ? formData.id_riwayat : null;

  // Pending yang action-nya 'create' (deskripsi baru belum disetujui)
  const pendingCreate = pendingDeskripsi.filter(p => p.action === 'create');
  // Pending yang action-nya 'update' (edit deskripsi yang sudah ada)
  const pendingUpdate = pendingDeskripsi.filter(p => p.action === 'update');
  // Pending yang action-nya 'delete'
  const pendingDelete = pendingDeskripsi.filter(p => p.action === 'delete');

  // Deskripsi yang sedang diedit (sembunyikan card asli)
  const editingDeskripsiId = (editMode === 'edit' || (editMode === 'edit' && formData.id)) ? formData.id : null;
  // Pending yang sedang diedit ulang (sembunyikan card pending lama)
  const editingPendingId = editMode === 'edit_pending' ? formData.pendingId : null;

  return (
    <div className="p-5 lg:p-10 animate-in fade-in duration-300">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-md md:text-xl  font-bold text-primary">Deskripsi Karier</h2>
        </div>

        {!isEditing && getAvailableRiwayat().length > 0 && (
          <button
            onClick={() => { setEditMode('add'); setIsEditing(true); }}
            disabled={!isVerified}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${!isVerified
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-primary/10 text-primary hover:bg-primary hover:text-white cursor-pointer'
              }`}
            title={!isVerified ? 'Akun belum diverifikasi dan belum mengisi kuesioner' : ''}
          >
            {!isVerified ? <Lock size={16} /> : <Plus size={16} />}
            <span className='hidden md:block'>{!isVerified ? 'Terkunci' : 'Deskripsi Karier'}</span>
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

      {riwayatKarier.length > 0 && getAvailableRiwayat().length === 0 && pendingCreate.length === 0 && !isEditing && (
        <div className="text-center py-12 bg-green-50 rounded-2xl border border-dashed border-green-200 mb-8">
          <FileText className="mx-auto text-green-400 mb-4" size={40} />
          <h3 className="text-base font-bold text-green-800 mb-1">Semua Status Karier Sudah Memiliki Deskripsi</h3>
          <p className="text-green-600/80 text-sm max-w-sm mx-auto">Anda sudah menambahkan deskripsi untuk semua riwayat karier.</p>
        </div>
      )}

      {/* Form Tambah / Edit */}
      {isEditing && (
        <div className="border-t py-5 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm md:text-lg text-primary">
              {editMode === 'edit_pending'
                ? 'Edit Ulang Pengajuan'
                : editMode === 'edit'
                  ? 'Edit Deskripsi Karier'
                  : 'Tambah Deskripsi Karier Baru'}
            </h3>
            <button type="button" onClick={resetForm} className="cursor-pointer text-slate-400 hover:text-red-500">
              <X size={20} />
            </button>
          </div>

          {editMode === 'edit_pending' && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
              <Clock size={15} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 font-medium">
                Anda sedang mengedit pengajuan yang belum disetujui admin. Perubahan ini akan menggantikan isi pengajuan sebelumnya.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative z-60">
              {editMode === 'add' ? (
                // Tambah baru — tampilkan dropdown
                <SmoothDropdown
                  label="Pilih Status Karier"
                  isRequired={true}
                  isSearchable={false}
                  placeholder="-- Pilih Pekerjaan / Perusahaan --"
                  options={getAvailableRiwayat().map(karier => getKarierLabel(karier))}
                  value={
                    formData.id_riwayat && riwayatKarier.find(k => String(k.id) === String(formData.id_riwayat))
                      ? getKarierLabel(riwayatKarier.find(k => String(k.id) === String(formData.id_riwayat)))
                      : ''
                  }
                  onSelect={(selectedLabel) => {
                    const selectedKarier = getAvailableRiwayat().find(k => getKarierLabel(k) === selectedLabel);
                    if (selectedKarier) {
                      setFormData(prev => ({ ...prev, id_riwayat: String(selectedKarier.id) }));
                    }
                  }}
                />
              ) : (
                // Edit approved atau edit pending — read-only
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Status Karier <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-3 w-full p-3 bg-slate-100 border-2 border-slate-200 rounded-xl text-sm text-slate-700 font-medium">
                    {getKarierLabelById(formData.id_riwayat)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 italic">Status karier tidak dapat diubah saat edit</p>
                </div>
              )}
            </div>

            <div className="relative z-0 mt-4">
              <label className="block text-sm font-semibold text-primary mb-3">
                Deskripsi Tanggung Jawab & Pencapaian <span className="text-red-500">*</span>
              </label>
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
                {loading ? 'Menyimpan...' : <><Save size={16} />Simpan <span className='hidden md:block'> Deskripsi</span></>}
              </button>
            </div>
          </form>
        </div>
      )}

      {!isEditing && riwayatKarier.length > 0 && deskripsiList.length === 0 && pendingCreate.length === 0 && (
        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 mb-6 bg-white text-center">
          <FileText className="mx-auto text-slate-300 mb-4" size={40} />
          <h3 className="text-base font-bold text-slate-400 mb-1">Belum ada deskripsi</h3>
          <p className="text-sm font-medium text-slate-400">Tambahkan deskripsi kegiatan karier untuk melengkapi profil karier Anda agar lebih menarik.</p>
        </div>
      )}

      <div className="space-y-4">
        {/* --- Deskripsi Karier yang sudah APPROVED --- */}
        {deskripsiList
          .filter(item => String(item.id) !== String(editingDeskripsiId))
          .map((item, idx) => {
            const karierTerkait = riwayatKarier.find(k => String(k.id) === String(item.status_karier_id || item.id_riwayat));
            const hasPendingUpdate = pendingUpdate.some(p => String(p.related_id) === String(item.id));
            const hasPendingDelete = pendingDelete.some(p => String(p.related_id) === String(item.id));

            return (
              <div
                key={`approved-${idx}`}
                className={`p-5 bg-white rounded-2xl border shadow-sm relative group transition-all ${hasPendingDelete
                  ? 'border-red-200 opacity-60'
                  : hasPendingUpdate
                    ? 'border-amber-200'
                    : 'border-slate-100'
                  }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-800 text-base">
                      {karierTerkait ? getKarierLabel(karierTerkait) : 'Pekerjaan Tidak Diketahui'}
                    </h3>
                    {hasPendingUpdate && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full border border-amber-200">
                        <Clock size={10} /> Ada Perubahan Pending
                      </span>
                    )}
                    {hasPendingDelete && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 text-[11px] font-bold rounded-full border border-red-200">
                        <AlertCircle size={10} /> Menunggu Penghapusan
                      </span>
                    )}
                  </div>
                  {isVerified && !hasPendingDelete && !hasPendingUpdate && (
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
                  )}
                </div>
                <p
                  className="prose text-slate-600 text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                ></p>
              </div>
            );
          })}

        {/* --- Card deskripsi dari pending UPDATE (preview data baru) --- */}
        {pendingUpdate
          .filter(p => String(p.id) !== String(editingPendingId))
          .map((pending, idx) => {
            const karierLabel = getKarierLabelById(pending.new_data?.id_riwayat);
            return (
              <div
                key={`pending-update-${idx}`}
                className="p-4 sm:p-5 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm relative group flex flex-col gap-3"
              >
                {/* HEADER: Judul, Status & Tombol Aksi */}
                <div className="flex justify-between items-start gap-4">

                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-slate-800 text-base leading-tight">
                      {karierLabel}
                    </h3>
                    {/* Badge dipindah ke bawah judul & diubah menjadi w-fit agar tidak memakan ruang kosong */}
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleEditPending(pending)}
                        className="cursor-pointer p-1.5 sm:p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit Ulang Pengajuan"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleCancelPending(pending.id)}
                        className="cursor-pointer p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Batalkan Pengajuan"
                        disabled={loading}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* TOMBOL AKSI: Selalu tampil di HP, tapi sembunyi (muncul saat hover) di layar besar (md) */}


                </div>

                <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] sm:text-[11px] font-bold rounded-full border border-amber-300">
                  <Clock size={12} /> Menunggu Persetujuan
                </span>
                {/* KONTEN / DESKRIPSI */}
                <div
                  className="prose text-slate-600 text-sm leading-relaxed whitespace-pre-wrap break-words mt-1"
                  dangerouslySetInnerHTML={{ __html: pending.new_data?.deskripsi || '' }}
                />

                {/* FOOTER */}
                <p className="text-[11px] sm:text-xs text-amber-600 mt-1 italic leading-snug">
                  * Ini adalah perubahan yang menunggu persetujuan admin. Data asli tetap aktif hingga disetujui.
                </p>
              </div>
            );
          })}

        {/* --- Card deskripsi baru yang masih PENDING CREATE --- */}
        {pendingCreate
          .filter(p => String(p.id) !== String(editingPendingId))
          .map((pending, idx) => {
            const karierLabel = getKarierLabelById(pending.new_data?.id_riwayat);
            return (
              <div
                key={`pending-create-${idx}`}
                className="p-5 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm relative group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-800 text-base">{karierLabel}</h3>

                  </div>
                  <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditPending(pending)}
                      className="cursor-pointer p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Edit Ulang Pengajuan"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleCancelPending(pending.id)}
                      className="cursor-pointer p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Batalkan Pengajuan"
                      disabled={loading}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <span className="inline-flex items-center mb-3 gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full border border-amber-300">
                  <Clock size={10} /> Menunggu Persetujuan
                </span>
                <p
                  className="prose text-slate-600 text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: pending.new_data?.deskripsi || '' }}
                ></p>
                <p className="text-xs text-amber-600 mt-3 italic">
                  * Deskripsi baru ini menunggu persetujuan admin sebelum tampil di profil.
                </p>
              </div>
            );
          })}
      </div>

    </div>
  );
}