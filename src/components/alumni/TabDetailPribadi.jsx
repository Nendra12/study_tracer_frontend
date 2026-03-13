import React, { useState, useEffect } from 'react';
import { Edit, Save, X, ChevronDown, Loader2, Clock } from 'lucide-react';
import { alumniApi } from '../../api/alumni';

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

export default function TabDetailPribadi({ profile, onRefresh, onShowSuccess, triggerEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    initEditForm(profile);
  }, [profile]);

  // Auto-enter edit mode when triggerEdit changes to true
  useEffect(() => {
    if (triggerEdit) {
      setIsEditing(true);
    }
  }, [triggerEdit]);

  function initEditForm(data) {
    setEditForm({
      nama_alumni: data?.nama || '',
      nis: data?.nis || '',
      nisn: data?.nisn || '',
      tempat_lahir: data?.tempat_lahir || '',
      tanggal_lahir: data?.tanggal_lahir || '',
      jenis_kelamin: data?.jenis_kelamin || '',
      alamat: data?.alamat || '',
      no_hp: data?.no_hp || '',
      tahun_masuk: data?.tahun_masuk || '',
    });
  }

  function startEditing() { setIsEditing(true); }
  function cancelEditing() { setIsEditing(false); initEditForm(profile); }

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

  const pendingUpdates = (profile?.pending_updates || []).filter(u => u.section === 'personal_info' && u.status === 'pending');
  const latestPendingFields = profile?.latest_personal_info_status === 'pending'
    ? (profile?.latest_pending_fields || [])
    : [];

  const hasNonPhotoPendingFromUpdates = pendingUpdates.some((u) => {
    const oldData = u?.old_data || {};
    const newData = u?.new_data || {};
    const keys = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])];
    if (keys.length === 0) return true;
    return keys.some((field) => !['foto', 'foto_path', 'gambar_path'].includes(field));
  });

  const hasNonPhotoPending = latestPendingFields.length > 0
    ? latestPendingFields.some((field) => !['foto', 'foto_path', 'gambar_path'].includes(field))
    : hasNonPhotoPendingFromUpdates;

  function isFieldPending(fieldName) {
    const aliases = FIELD_KEYS[fieldName] || [fieldName];
    return aliases.some(alias => latestPendingFields.includes(alias));
  }

  function renderLabel(label, fieldName) {
    const pending = isFieldPending(fieldName);
    return (
      <span className="flex items-center gap-2">
        <span>{label}</span>
        {pending && (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black tracking-wide uppercase">
            Pending
          </span>
        )}
      </span>
    );
  }

  const inputClass = (isEdit) => isEdit
    ? "w-full bg-white border border-primary/30 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
    : "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none";

  return (
    <div className="p-8 md:p-10 flex-1 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-black text-primary tracking-tight">Detail Pribadi</h2>
          <p className="text-sm text-primary/60">Informasi dasar akun Anda.</p>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button onClick={cancelEditing} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer">
              Batal
            </button>
            <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan
            </button>
          </div>
        ) : (
          <button onClick={startEditing} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all cursor-pointer">
            <Edit size={14} /> Edit Data
          </button>
        )}
      </div>

      {/* Pending Update Alert */}
      {hasNonPhotoPending && (
        <div className="mb-6 bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-800 mb-0.5">Menunggu Persetujuan Admin</h3>
            <p className="text-xs text-amber-700/80 font-medium">
              Anda memiliki perubahan detail pribadi yang sedang ditinjau oleh admin. Perubahan baru akan menggantikan pengajuan sebelumnya.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">{renderLabel('Nama Lengkap', 'nama_alumni')}</label>
          <input type="text" readOnly={!isEditing} value={editForm.nama_alumni} onChange={(e) => setEditForm(prev => ({ ...prev, nama_alumni: e.target.value }))} className={inputClass(isEditing)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">{renderLabel('NIS', 'nis')}</label>
            <input type="text" readOnly={!isEditing} value={editForm.nis} onChange={(e) => setEditForm(prev => ({ ...prev, nis: e.target.value }))} className={inputClass(isEditing)} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">{renderLabel('NISN', 'nisn')}</label>
            <input type="text" readOnly={!isEditing} value={editForm.nisn} onChange={(e) => setEditForm(prev => ({ ...prev, nisn: e.target.value }))} className={inputClass(isEditing)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">{renderLabel('Tempat Lahir', 'tempat_lahir')}</label>
            <input type="text" readOnly={!isEditing} value={editForm.tempat_lahir} onChange={(e) => setEditForm(prev => ({ ...prev, tempat_lahir: e.target.value }))} className={inputClass(isEditing)} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">{renderLabel('Tanggal Lahir', 'tanggal_lahir')}</label>
            <input type={isEditing ? 'date' : 'text'} readOnly={!isEditing} value={editForm.tanggal_lahir} onChange={(e) => setEditForm(prev => ({ ...prev, tanggal_lahir: e.target.value }))} className={inputClass(isEditing)} />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">{renderLabel('Jenis Kelamin', 'jenis_kelamin')}</label>
          <div className="relative">
            <select disabled={!isEditing} className={`${inputClass(isEditing)} appearance-none`} value={editForm.jenis_kelamin} onChange={(e) => setEditForm(prev => ({ ...prev, jenis_kelamin: e.target.value }))}>
              <option value="">-</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">{renderLabel('No. HP', 'no_hp')}</label>
            <input type="text" readOnly={!isEditing} value={editForm.no_hp} onChange={(e) => setEditForm(prev => ({ ...prev, no_hp: e.target.value }))} className={inputClass(isEditing)} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">{renderLabel('Tahun Masuk', 'tahun_masuk')}</label>
            <input type="text" readOnly={!isEditing} value={editForm.tahun_masuk} onChange={(e) => setEditForm(prev => ({ ...prev, tahun_masuk: e.target.value }))} className={inputClass(isEditing)} />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">{renderLabel('Alamat', 'alamat')}</label>
          <textarea readOnly={!isEditing} rows="3" value={editForm.alamat} onChange={(e) => setEditForm(prev => ({ ...prev, alamat: e.target.value }))} className={`${inputClass(isEditing)} resize-none`} />
        </div>
      </div>
    </div>
  );
}