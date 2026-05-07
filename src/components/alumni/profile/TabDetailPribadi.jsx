import React, { useState, useEffect } from 'react';
import { Edit, Save, X, ChevronDown, Loader2, Clock, Lock } from 'lucide-react';
import { alumniApi } from '../../../api/alumni';
import { alertConfirm, toastError } from '../../../utilitis/alert';
import SelectInput from '../../admin/SelectInput';
import DateOfBirthInput from '../../DateOfBirthInput';
import YearsInput from '../../YearsInput';
import SmoothKota from '../../admin/SmoothKota';
import { masterDataApi } from '../../../api/masterData';

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
  const [kotaOpts, setKotaOpts] = useState([]);
  const [errors, setErrors] = useState({});

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

  useEffect(() => {
    masterDataApi.getKota().then((res) => {
      const data = res.data.data || [];
      const formattedKota = data.map(k => ({
        value: k.nama_kota || k.nama,
        label: k.nama_kota || k.nama
      }));
      setKotaOpts(formattedKota);
    }).catch(err => console.error("Gagal load kota", err));
  }, []);

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
    setErrors({});
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    initFormFromLatest();
    setErrors({});
  }

  const validate = () => {
    const errs = {};
    const formData = editForm;

    if (!formData.nama_alumni?.trim()) errs.nama_alumni = 'Nama lengkap wajib diisi';
    if (!formData.jenis_kelamin) errs.jenis_kelamin = 'Jenis kelamin wajib dipilih';
    if (!formData.tempat_lahir?.trim()) errs.tempat_lahir = 'Tempat lahir wajib diisi';
    if (!formData.alamat?.trim()) errs.alamat = 'Alamat wajib diisi';
    if (!formData.tahun_masuk) errs.tahun_masuk = 'Tahun masuk wajib diisi';

    if (formData.nama_alumni) {
      const reg = /^[a-zA-Z\s'-]+$/
      if (!reg.test(formData.nama_alumni)) {
        errs.nama_alumni = 'Nama alumni tidak boleh mengandung angka atau simbol';
      }
    }

    // Validasi No HP (Min 10, Max 13 Angka)
    if (!formData.no_hp?.trim()) {
      errs.no_hp = 'No HP wajib diisi';
    } else {
      const digits = formData.no_hp.replace(/\D/g, '');
      if (digits.length < 10) errs.no_hp = 'No HP minimal 10 angka';
      else if (digits.length > 13) errs.no_hp = 'No HP maksimal 13 angka';
    }

    // Validasi NIS (Harus Pas 10 Angka)
    if (!formData.nis?.trim()) {
      errs.nis = 'NIS wajib diisi';
    } else {
      const digits = formData.nis.replace(/\D/g, '');
      if (digits.length !== 10) errs.nis = 'NIS harus terdiri dari tepat 10 angka';
    }

    // Validasi NISN (Harus Pas 10 Angka)
    if (!formData.nisn?.trim()) {
      errs.nisn = 'NISN wajib diisi';
    } else {
      const digits = formData.nisn.replace(/\D/g, '');
      if (digits.length !== 10) errs.nisn = 'NISN harus terdiri dari tepat 10 angka';
    }

    const currentYear = new Date().getFullYear();
    
    // Validasi Tahun Masuk
    if (formData.tahun_masuk && parseInt(formData.tahun_masuk) > currentYear) {
      errs.tahun_masuk = `Tahun masuk tidak boleh lebih dari ${currentYear}`;
    }

    // Validasi Usia Minimal (14 Tahun di bawah tahun masuk)
    if (formData.tanggal_lahir && formData.tahun_masuk) {
      const birthYear = new Date(formData.tanggal_lahir).getFullYear();
      const entryYear = parseInt(formData.tahun_masuk);
      
      if (entryYear - birthYear < 14) {
        errs.tanggal_lahir = 'Usia minimal saat tahun masuk adalah 14 tahun';
      }
    } else if (!formData.tanggal_lahir) {
      errs.tanggal_lahir = 'Tanggal lahir wajib diisi';
    }

    // Validasi Alamat Lengkap
    if (!formData.alamat?.trim()) {
      errs.alamat = 'Alamat wajib diisi';
    } else {
      const alamatText = formData.alamat.trim();
      if (alamatText.length < 15) {
        errs.alamat = 'Alamat terlalu pendek (min. 15 karakter). Mohon sertakan jalan, RT/RW, atau desa.';
      } else if (alamatText.length > 255) {
        errs.alamat = 'Alamat terlalu panjang (maks. 255 karakter)';
      }
    }

    return errs;
  };

  async function handleSaveProfile() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toastError('Mohon perbaiki data yang tidak valid sebelum menyimpan.');
      return;
    }

    try {
      setSaving(true);
      await alumniApi.updateProfile(editForm);
      setIsEditing(false);
      onShowSuccess('Perubahan profil telah dikirim, menunggu persetujuan admin');
      onRefresh();
    } catch (err) {
      console.error('Failed to update profile:', err);
      toastError('Gagal menyimpan profil: ' + (err.response?.data?.message || err.message));
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
      toastError('Gagal membatalkan: ' + (err.response?.data?.message || err.message));
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

  const inputClass = (isEdit, isError) => isEdit
    ? `w-full bg-white border ${isError ? 'border-red-400' : 'border-primary/30'} rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20`
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${!isVerified
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
            minLength={2}
            maxLength={100}
            value={isEditing ? editForm.nama_alumni : displayForm.nama_alumni}
            onChange={(e) => {
              const val = e.target.value;
              setEditForm(prev => ({ ...prev, nama_alumni: val }));
              
              if (!val.trim()) {
                setErrors(prev => ({ ...prev, nama_alumni: 'Nama lengkap wajib diisi' }));
              } else {
                const reg = /^[a-zA-Z\s'-]+$/;
                if (!reg.test(val)) {
                  setErrors(prev => ({ ...prev, nama_alumni: 'Nama alumni tidak boleh mengandung angka atau simbol' }));
                } else {
                  setErrors(prev => ({ ...prev, nama_alumni: undefined }));
                }
              }
            }}
            className={`${inputClass(isEditing, errors.nama_alumni)} ${!isEditing && isFieldChanged('nama_alumni') ? 'border-amber-200 bg-amber-50/50' : ''}`}
          />
          {isEditing && errors.nama_alumni && <p className="text-xs text-red-500 mt-0.5">{errors.nama_alumni}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
              {renderLabel('NIS', 'nis')}
            </label>
            <input
              type="text"
              minLength={10}
              maxLength={10}
              readOnly={!isEditing}
              value={isEditing ? editForm.nis : displayForm.nis}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setEditForm(prev => ({ ...prev, nis: val }));
                
                if (val.length > 0 && val.length < 10) {
                  setErrors(prev => ({ ...prev, nis: 'NIS harus terdiri dari tepat 10 angka' }));
                } else if (val.length === 0) {
                  setErrors(prev => ({ ...prev, nis: 'NIS wajib diisi' }));
                } else {
                  setErrors(prev => ({ ...prev, nis: undefined }));
                }
              }}
              className={`${inputClass(isEditing, errors.nis)} ${!isEditing && isFieldChanged('nis') ? 'border-amber-200 bg-amber-50/50' : ''}`}
            />
            {isEditing && errors.nis && <p className="text-xs text-red-500 mt-0.5">{errors.nis}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
              {renderLabel('NISN', 'nisn')}
            </label>
            <input
              type="text"
              inputMode="numeric" // Memunculkan numpad/keyboard angka di mobile
              minLength={10}
              maxLength={10}
              readOnly={!isEditing}
              value={isEditing ? editForm.nisn : displayForm.nisn}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setEditForm(prev => ({ ...prev, nisn: val }));
                
                if (val.length > 0 && val.length < 10) {
                  setErrors(prev => ({ ...prev, nisn: 'NISN harus terdiri dari tepat 10 angka' }));
                } else if (val.length === 0) {
                  setErrors(prev => ({ ...prev, nisn: 'NISN wajib diisi' }));
                } else {
                  setErrors(prev => ({ ...prev, nisn: undefined }));
                }
              }}
              className={`${inputClass(isEditing, errors.nisn)} ${!isEditing && isFieldChanged('nisn') ? 'border-amber-200 bg-amber-50/50' : ''}`}
            />
            {isEditing && errors.nisn && <p className="text-xs text-red-500 mt-0.5">{errors.nisn}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="relative z-[60] [&_button]:!p-2.5 [&_button]:!px-3 [&_button]:!rounded-xl [&_button]:!border-primary/30 [&_button_span]:!text-sm focus-within:z-[99]">
            <div className="mb-2">
              <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest">
                {renderLabel('Tempat Lahir', 'tempat_lahir')}
              </label>
            </div>
            <div className={`rounded-xl ${isEditing && errors.tempat_lahir ? 'border border-red-400' : ''}`}>
              <SmoothKota
                isRequired={true}
                hideLabel={true}
                options={kotaOpts}
                value={isEditing ? editForm.tempat_lahir : displayForm.tempat_lahir}
                placeholder="Cari kota..."
                isSearchable={true}
                onSelect={(val) => {
                  setEditForm(prev => ({ ...prev, tempat_lahir: val }));
                  if (errors.tempat_lahir) setErrors(prev => ({ ...prev, tempat_lahir: undefined }));
                }}
                disabled={!isEditing}
              />
            </div>
            {isEditing && errors.tempat_lahir && <p className="text-xs text-red-500 mt-0.5">{errors.tempat_lahir}</p>}
          </div>
          <div className="relative z-[55]">
            <div className="mb-2">
              <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest">
                {renderLabel('Tanggal Lahir', 'tanggal_lahir')}
              </label>
            </div>
            <div className={`rounded-xl ${isEditing && errors.tanggal_lahir ? 'border border-red-400 p-0.5' : ''}`}>
              <DateOfBirthInput
                isRequired={true}
                hideLabel={true}
                value={isEditing ? editForm.tanggal_lahir : displayForm.tanggal_lahir}
                onChange={(val) => {
                  setEditForm(prev => ({ ...prev, tanggal_lahir: val }));
                  
                  if (editForm.tahun_masuk) {
                    const birthYear = new Date(val).getFullYear();
                    const entryYear = parseInt(editForm.tahun_masuk);
                    if (entryYear - birthYear < 14) {
                      setErrors(prev => ({ ...prev, tanggal_lahir: 'Usia tidak mencukupi (minimal 14 tahun)' }));
                    } else {
                      setErrors(prev => ({ ...prev, tanggal_lahir: undefined }));
                    }
                  } else {
                    setErrors(prev => ({ ...prev, tanggal_lahir: undefined }));
                  }
                }}
                disabled={!isEditing}
              />
            </div>
            {isEditing && errors.tanggal_lahir && <p className="text-xs text-red-500 mt-0.5">{errors.tanggal_lahir}</p>}
          </div>
        </div>

        <div className="relative z-30">
          <div className="mb-2">
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest">
              {renderLabel('Jenis Kelamin', 'jenis_kelamin')}
            </label>
          </div>
          <div className={`rounded-xl ${isEditing && errors.jenis_kelamin ? 'border border-red-400' : ''}`}>
            <SelectInput
              hideLabel={true}
              placeholder="Pilih..."
              options={[
                { value: "Laki-laki", label: "Laki-laki" },
                { value: "Perempuan", label: "Perempuan" }
              ]}
              value={isEditing ? editForm.jenis_kelamin : displayForm.jenis_kelamin}
              onSelect={(val) => {
                setEditForm(prev => ({ ...prev, jenis_kelamin: val }));
                if (errors.jenis_kelamin) setErrors(prev => ({ ...prev, jenis_kelamin: undefined }));
              }}
              disabled={!isEditing}
            />
          </div>
          {isEditing && errors.jenis_kelamin && <p className="text-xs text-red-500 mt-0.5">{errors.jenis_kelamin}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
              {renderLabel('No. HP', 'no_hp')}
            </label>
            <input
              type="text"
              readOnly={!isEditing}
              inputMode="numeric"
              maxLength={13}
              value={isEditing ? editForm.no_hp : displayForm.no_hp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setEditForm(prev => ({ ...prev, no_hp: val }));

                if (val.length > 0 && val.length < 10) {
                  setErrors(prev => ({ ...prev, no_hp: 'No HP minimal 10 angka' }));
                } else if (val.length === 0) {
                  setErrors(prev => ({ ...prev, no_hp: 'No HP wajib diisi' }));
                } else {
                  setErrors(prev => ({ ...prev, no_hp: undefined }));
                }
              }}
              className={`${inputClass(isEditing, errors.no_hp)} ${!isEditing && isFieldChanged('no_hp') ? 'border-amber-200 bg-amber-50/50' : ''}`}
            />
            {isEditing && errors.no_hp && <p className="text-xs text-red-500 mt-0.5">{errors.no_hp}</p>}
          </div>
          <div className="relative z-[70] focus-within:z-[99]">
            <div className="mb-2">
              <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest">
                {renderLabel('Tahun Masuk', 'tahun_masuk')}
              </label>
            </div>
            <div className={`rounded-xl ${isEditing && errors.tahun_masuk ? 'border border-red-400 p-0.5' : ''}`}>
              <YearsInput
                isRequired={true}
                value={isEditing ? editForm.tahun_masuk : displayForm.tahun_masuk}
                maxYear={new Date().getFullYear()}
                onSelect={(val) => {
                  setEditForm(prev => ({ ...prev, tahun_masuk: val }));
                  setErrors(prev => ({ ...prev, tahun_masuk: undefined }));
                  
                  if (editForm.tanggal_lahir) {
                    const birthYear = new Date(editForm.tanggal_lahir).getFullYear();
                    const entryYear = parseInt(val);
                    if (entryYear - birthYear < 14) {
                      setErrors(prev => ({ ...prev, tanggal_lahir: 'Usia tidak mencukupi (minimal 14 tahun)' }));
                    } else {
                      setErrors(prev => ({ ...prev, tanggal_lahir: undefined }));
                    }
                  }
                }}
                disabled={!isEditing}
              />
            </div>
            {isEditing && errors.tahun_masuk && <p className="text-xs text-red-500 mt-0.5">{errors.tahun_masuk}</p>}
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
            onChange={(e) => {
              const val = e.target.value;
              setEditForm(prev => ({ ...prev, alamat: val }));

              if (val.trim().length > 0 && val.trim().length < 15) {
                setErrors(prev => ({ ...prev, alamat: 'Sertakan alamat lengkap (nama jalan, RT/RW, atau desa)' }));
              } else if (val.trim().length > 255) {
                setErrors(prev => ({ ...prev, alamat: 'Alamat terlalu panjang' }));
              } else if (val.trim().length === 0) {
                setErrors(prev => ({ ...prev, alamat: 'Alamat wajib diisi' }));
              } else {
                setErrors(prev => ({ ...prev, alamat: undefined }));
              }
            }}
            className={`${inputClass(isEditing, errors.alamat)} resize-none ${!isEditing && isFieldChanged('alamat') ? 'border-amber-200 bg-amber-50/50' : ''}`}
          />
          {isEditing && errors.alamat && <p className="text-xs text-red-500 mt-0.5">{errors.alamat}</p>}
        </div>
      </div>
    </div>
  );
}