import React, { useState, useEffect } from 'react';
import { Edit, Save, X, ChevronDown, Loader2 } from 'lucide-react';
import { alumniApi } from '../../api/alumni';

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
      const formData = new FormData();
      Object.entries(editForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined) formData.append(key, value);
      });
      await alumniApi.updateProfile(formData);
      setIsEditing(false);
      onShowSuccess('Profil berhasil diperbarui');
      onRefresh(); 
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Gagal menyimpan profil: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
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

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Nama Lengkap</label>
          <input type="text" readOnly={!isEditing} value={editForm.nama_alumni} onChange={(e) => setEditForm(prev => ({ ...prev, nama_alumni: e.target.value }))} className={inputClass(isEditing)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">NIS</label>
            <input type="text" readOnly={!isEditing} value={editForm.nis} onChange={(e) => setEditForm(prev => ({ ...prev, nis: e.target.value }))} className={inputClass(isEditing)} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">NISN</label>
            <input type="text" readOnly={!isEditing} value={editForm.nisn} onChange={(e) => setEditForm(prev => ({ ...prev, nisn: e.target.value }))} className={inputClass(isEditing)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Tempat Lahir</label>
            <input type="text" readOnly={!isEditing} value={editForm.tempat_lahir} onChange={(e) => setEditForm(prev => ({ ...prev, tempat_lahir: e.target.value }))} className={inputClass(isEditing)} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Tanggal Lahir</label>
            <input type={isEditing ? 'date' : 'text'} readOnly={!isEditing} value={editForm.tanggal_lahir} onChange={(e) => setEditForm(prev => ({ ...prev, tanggal_lahir: e.target.value }))} className={inputClass(isEditing)} />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Jenis Kelamin</label>
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
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">No. HP</label>
            <input type="text" readOnly={!isEditing} value={editForm.no_hp} onChange={(e) => setEditForm(prev => ({ ...prev, no_hp: e.target.value }))} className={inputClass(isEditing)} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Tahun Masuk</label>
            <input type="text" readOnly={!isEditing} value={editForm.tahun_masuk} onChange={(e) => setEditForm(prev => ({ ...prev, tahun_masuk: e.target.value }))} className={inputClass(isEditing)} />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Alamat</label>
          <textarea readOnly={!isEditing} rows="3" value={editForm.alamat} onChange={(e) => setEditForm(prev => ({ ...prev, alamat: e.target.value }))} className={`${inputClass(isEditing)} resize-none`} />
        </div>
      </div>
    </div>
  );
}