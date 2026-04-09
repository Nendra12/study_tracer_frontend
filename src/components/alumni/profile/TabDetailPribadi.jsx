import React, { useState, useEffect } from 'react';
import { Edit, Save, X, ChevronDown, Loader2, Clock, Lock } from 'lucide-react';
import { alumniApi } from '../../../api/alumni';
import { alertConfirm } from '../../../utilitis/alert';

// Map field backend → alias yang mungkin ada di changed_fields
const FIELD_KEYS = {
  nama_alumni: ['nama_alumni', 'nama'],
  nis: ['nis'],
  nisn: ['nisn'],
  tempat_lahir: ['tempat_lahir'],
  tanggal_lahir: ['tanggal_lahir'],
  jenis_kelamin: ['jenis_kelamin'],
  alamat: ['alamat'],
  no_hp: ['no_hp'],
  tahun_masuk: ['tahun_masuk'],
};

// Ambil nilai dari latest_personal_info (data merged pending+approved)
function getLatestValue(latest, field) {
  if (!latest) return '';
  const map = {
    nama_alumni: latest.nama ?? latest.nama_alumni,
    nis: latest.nis,
    nisn: latest.nisn,
    tempat_lahir: latest.tempat_lahir,
    tanggal_lahir: latest.tanggal_lahir,
    jenis_kelamin: latest.jenis_kelamin,
    alamat: latest.alamat,
    no_hp: latest.no_hp,
    tahun_masuk: latest.tahun_masuk,
  };
  return map[field] ?? '';
}

export default function TabDetailPribadi({ profile, onRefresh, onShowSuccess, triggerEdit, isVerified }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [editForm, setEditForm] = useState({});

  // latest_personal_info: data merged (pending override approved), dikirim dari backend
  const latest = profile?.latest_personal_info || null;
  const hasPending = latest?.status === 'pending';
  const changedFields = latest?.changed_fields || [];
  const pendingUpdateId = latest?.pending_update_id || null;

  // Inisialisasi form — saat view mode, gunakan latest (includes pending preview)
  // Saat edit, juga mulai dari latest agar user tahu apa yang sebelumnya diajukan
  useEffect(() => {
    if (!isEditing) {
      initFormFromLatest();
    }
  }, [profile]);

  useEffect(() => {
    if (triggerEdit) setIsEditing(true);
  }, [triggerEdit]);

  function initFormFromLatest() {
    const src = latest || profile;
    setEditForm({
      nama_alumni: src?.nama ?? src?.nama_alumni ?? '',
      nis: src?.nis ?? '',
      nisn: src?.nisn ?? '',
      tempat_lahir: src?.tempat_lahir ?? '',
      tanggal_lahir: src?.tanggal_lahir ?? '',
      jenis_kelamin: src?.jenis_kelamin ?? '',
      alamat: src?.alamat ?? '',
      no_hp: src?.no_hp ?? '',
      tahun_masuk: src?.tahun_masuk ?? '',
    });
  }

  function startEditing() {
    // Isi form dari latest (data terbaru termasuk pending)
    initFormFromLatest();
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    initFormFromLatest();
  }

  async function handleSaveProfile() {
    try {
      setSaving(true);
      await alumniApi.updateProfile(editForm);
      setIsEditing(false);
      onShowSuccess('Perubahan profil telah dikirim, menunggu persetujuan admin');
      onRefresh();
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Gagal menyimpan profil: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelPending() {
    if (!pendingUpdateId) return;
    const result = await alertConfirm('Batalkan pengajuan perubahan detail pribadi ini? Data yang ada sebelumnya akan tetap berlaku.');
    if (!result.isConfirmed) return;
    try {
      setCanceling(true);
      await alumniApi.cancelPendingProfileUpdate(pendingUpdateId);
      onShowSuccess('Pengajuan perubahan berhasil dibatalkan');
      onRefresh();
    } catch (err) {
      alert('Gagal membatalkan: ' + (err.response?.data?.message || err.message));
    } finally {
      setCanceling(false);
    }
  }

  // Cek apakah field ini ada di changed_fields (untuk badge per-field)
  function isFieldChanged(fieldName) {
    if (!hasPending) return false;
    const aliases = FIELD_KEYS[fieldName] || [fieldName];
    return aliases.some(alias => changedFields.includes(alias));
  }

  // Hanya tampilkan badge PENDING jika ada perubahan non-foto
  const hasNonPhotoChange = changedFields.some(
    f => !['foto', 'foto_path', 'gambar_path'].includes(f)
  );

  function renderLabel(label, fieldName) {
    const changed = isFieldChanged(fieldName);
    return (
      <span className="flex items-center gap-2">
        <span>{label}</span>
        {changed && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black tracking-wide uppercase border border-amber-200">
            <Clock size={8} /> Pending
          </span>
        )}
      </span>
    );
  }

  const inputClass = (isEdit) => isEdit
    ? 'w-full bg-white border border-primary/30 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
    : 'w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none';

  // Nilai yang ditampilkan di form (latest data termasuk pending preview)
  const displayForm = isEditing ? editForm : {
    nama_alumni: getLatestValue(latest, 'nama_alumni') || profile?.nama || '',
    nis: getLatestValue(latest, 'nis') || profile?.nis || '',
    nisn: getLatestValue(latest, 'nisn') || profile?.nisn || '',
    tempat_lahir: getLatestValue(latest, 'tempat_lahir') || profile?.tempat_lahir || '',
    tanggal_lahir: getLatestValue(latest, 'tanggal_lahir') || profile?.tanggal_lahir || '',
    jenis_kelamin: getLatestValue(latest, 'jenis_kelamin') || profile?.jenis_kelamin || '',
    alamat: getLatestValue(latest, 'alamat') || profile?.alamat || '',
    no_hp: getLatestValue(latest, 'no_hp') || profile?.no_hp || '',
    tahun_masuk: getLatestValue(latest, 'tahun_masuk') || profile?.tahun_masuk || '',
  };

  return (
    <div className="p-8 md:p-10 flex-1 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-md md:text-xl font-bold text-primary">Detail Pribadi</h2>
            {hasPending && hasNonPhotoChange && !isEditing && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full border border-amber-200">
                <Clock size={9} /> PENDING
              </span>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={cancelEditing}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              Batal
            </button>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-white shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan
            </button>
          </div>
        ) : (
          <button
            onClick={startEditing}
            disabled={!isVerified}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              !isVerified 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white cursor-pointer'
            }`}
            title={!isVerified ? 'Akun belum diverifikasi dan belum mengisi kuesioner' : ''}
          >
            {!isVerified ? <Lock size={14} /> : <Edit size={14} />} 
            {!isVerified ? 'Terkunci' : (hasPending && hasNonPhotoChange ? 'Edit Ulang' : 'Edit Data')}
          </button>
        )}
      </div>

      {/* Banner Pending */}
      {hasPending && hasNonPhotoChange && !isEditing && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-800 mb-0.5">Menunggu Persetujuan Admin</h3>
              <p className="text-xs text-amber-700/80 font-medium">
                Data yang ditampilkan di bawah adalah <strong>data terbaru yang Anda ajukan</strong> dan sedang dalam proses peninjauan. Perubahan akan berlaku setelah disetujui admin.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 text-[11px] font-bold text-primary bg-white border border-primary/30 hover:bg-primary/5 rounded-lg px-3 py-1.5 cursor-pointer transition-colors"
            >
              <Edit size={11} /> Edit Ulang
            </button>
            <button
              onClick={handleCancelPending}
              disabled={canceling}
              className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 cursor-pointer transition-colors disabled:opacity-50"
            >
              <X size={11} /> {canceling ? 'Membatalkan...' : 'Batalkan Pengajuan'}
            </button>
          </div>
        </div>
      )}

      {/* Info banner saat edit ulang pending */}
      {isEditing && hasPending && hasNonPhotoChange && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-2">
          <Clock size={14} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            Form diisi dengan data dari pengajuan sebelumnya. Simpan untuk mengganti pengajuan yang sedang pending.
          </p>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
            {renderLabel('Nama Lengkap', 'nama_alumni')}
          </label>
          <input
            type="text"
            readOnly={!isEditing}
            value={isEditing ? editForm.nama_alumni : displayForm.nama_alumni}
            onChange={(e) => setEditForm(prev => ({ ...prev, nama_alumni: e.target.value }))}
            className={`${inputClass(isEditing)} ${!isEditing && isFieldChanged('nama_alumni') ? 'border-amber-200 bg-amber-50/50' : ''}`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
              {renderLabel('NIS', 'nis')}
            </label>
            <input
              type="text"
              readOnly={!isEditing}
              value={isEditing ? editForm.nis : displayForm.nis}
              onChange={(e) => setEditForm(prev => ({ ...prev, nis: e.target.value }))}
              className={`${inputClass(isEditing)} ${!isEditing && isFieldChanged('nis') ? 'border-amber-200 bg-amber-50/50' : ''}`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
              {renderLabel('NISN', 'nisn')}
            </label>
            <input
              type="text"
              readOnly={!isEditing}
              value={isEditing ? editForm.nisn : displayForm.nisn}
              onChange={(e) => setEditForm(prev => ({ ...prev, nisn: e.target.value }))}
              className={`${inputClass(isEditing)} ${!isEditing && isFieldChanged('nisn') ? 'border-amber-200 bg-amber-50/50' : ''}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
              {renderLabel('Tempat Lahir', 'tempat_lahir')}
            </label>
            <input
              type="text"
              readOnly={!isEditing}
              value={isEditing ? editForm.tempat_lahir : displayForm.tempat_lahir}
              onChange={(e) => setEditForm(prev => ({ ...prev, tempat_lahir: e.target.value }))}
              className={`${inputClass(isEditing)} ${!isEditing && isFieldChanged('tempat_lahir') ? 'border-amber-200 bg-amber-50/50' : ''}`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
              {renderLabel('Tanggal Lahir', 'tanggal_lahir')}
            </label>
            <input
              type={isEditing ? 'date' : 'text'}
              readOnly={!isEditing}
              value={isEditing ? editForm.tanggal_lahir : displayForm.tanggal_lahir}
              onChange={(e) => setEditForm(prev => ({ ...prev, tanggal_lahir: e.target.value }))}
              className={`${inputClass(isEditing)} ${!isEditing && isFieldChanged('tanggal_lahir') ? 'border-amber-200 bg-amber-50/50' : ''}`}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
            {renderLabel('Jenis Kelamin', 'jenis_kelamin')}
          </label>
          <div className="relative">
            <select
              disabled={!isEditing}
              className={`${inputClass(isEditing)} appearance-none ${!isEditing && isFieldChanged('jenis_kelamin') ? 'border-amber-200 bg-amber-50/50' : ''}`}
              value={isEditing ? editForm.jenis_kelamin : displayForm.jenis_kelamin}
              onChange={(e) => setEditForm(prev => ({ ...prev, jenis_kelamin: e.target.value }))}
            >
              <option value="">-</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
              {renderLabel('No. HP', 'no_hp')}
            </label>
            <input
              type="text"
              readOnly={!isEditing}
              value={isEditing ? editForm.no_hp : displayForm.no_hp}
              onChange={(e) => setEditForm(prev => ({ ...prev, no_hp: e.target.value }))}
              className={`${inputClass(isEditing)} ${!isEditing && isFieldChanged('no_hp') ? 'border-amber-200 bg-amber-50/50' : ''}`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
              {renderLabel('Tahun Masuk', 'tahun_masuk')}
            </label>
            <input
              type="text"
              readOnly={!isEditing}
              value={isEditing ? editForm.tahun_masuk : displayForm.tahun_masuk}
              onChange={(e) => setEditForm(prev => ({ ...prev, tahun_masuk: e.target.value }))}
              className={`${inputClass(isEditing)} ${!isEditing && isFieldChanged('tahun_masuk') ? 'border-amber-200 bg-amber-50/50' : ''}`}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
            {renderLabel('Alamat', 'alamat')}
          </label>
          <textarea
            readOnly={!isEditing}
            rows="3"
            value={isEditing ? editForm.alamat : displayForm.alamat}
            onChange={(e) => setEditForm(prev => ({ ...prev, alamat: e.target.value }))}
            className={`${inputClass(isEditing)} resize-none ${!isEditing && isFieldChanged('alamat') ? 'border-amber-200 bg-amber-50/50' : ''}`}
          />
        </div>
      </div>
    </div>
  );
}