import React, { useState, useRef, useEffect } from 'react';
import { Edit, Mail, Phone, Plus, X, Loader2, Check, Clock, Lock } from 'lucide-react';
import { FaLinkedin, FaGithub, FaInstagram, FaFacebook, FaGlobe } from 'react-icons/fa';
import Cropper from 'react-easy-crop';
import { alumniApi } from '../../../api/alumni';
import { masterDataApi } from '../../../api/masterData';
import { STORAGE_BASE_URL } from '../../../api/axios';
import { alertConfirm, alertError, alertWarning } from '../../../utilitis/alert';

// Helper untuk URL Foto
function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

// Helper untuk membuang "https://" agar tampilan lebih rapi
function displayUrl(url) {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '');
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function getCroppedFile(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }
      const file = new File([blob], `profile-${Date.now()}.jpg`, { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg', 0.92);
  });
}

// Konfigurasi Platform Sosial Media
const SOCIAL_PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin size={16} />, placeholder: 'https://linkedin.com/in/username' },
  { key: 'github', label: 'GitHub', icon: <FaGithub size={16} />, placeholder: 'https://github.com/username' },
  { key: 'instagram', label: 'Instagram', icon: <FaInstagram size={16} />, placeholder: 'https://instagram.com/username' },
  { key: 'facebook', label: 'Facebook', icon: <FaFacebook size={16} />, placeholder: 'https://facebook.com/username' },
  { key: 'website', label: 'Website', icon: <FaGlobe size={16} />, placeholder: 'https://yourwebsite.com' },
];

// Helper: konversi array social_media dari pending new_data menjadi map {key: url}
// Menggunakan String() untuk menghindari type mismatch antara id numerik dan string
function pendingSocialToMap(pendingSocialArray, masterList) {
  const map = {};
  if (!Array.isArray(pendingSocialArray)) return map;
  for (const item of pendingSocialArray) {
    // Gunakan String() agar tidak gagal karena type mismatch int vs string
    const master = masterList.find(
      sm => String(sm.id_sosmed ?? sm.id) === String(item.id_sosmed)
    );
    if (!master) continue;
    const name = (master.nama_sosmed || master.nama || '').toLowerCase();
    for (const platform of SOCIAL_PLATFORMS) {
      if (name.includes(platform.key)) {
        map[platform.key] = item.url;
        break;
      }
    }
  }
  return map;
}

export default function ProfileSidebar({ profile, onRefresh, onShowSuccess, isVerified }) {
  const fileInputRef = useRef(null);

  // States
  const [savingFoto, setSavingFoto] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [cancelingSocial, setCancelingeSocial] = useState(false);

  const [showCropModal, setShowCropModal] = useState(false);
  const [rawPreviewUrl, setRawPreviewUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Mode edit: 'view' | 'edit' | 'edit_pending'
  const [editMode, setEditMode] = useState('view');
  const [socialForm, setSocialForm] = useState({});
  const [socialMediaList, setSocialMediaList] = useState([]);
  const [showAddSocial, setShowAddSocial] = useState(false);

  // Inisialisasi form sosial saat profile berubah
  // Hanya reset jika tidak sedang dalam mode edit (agar form tidak hilang saat refresh)
  useEffect(() => {
    if (editMode === 'view') {
      initSocialForm(profile);
    }
  }, [profile]);

  useEffect(() => {
    if (showCropModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCropModal]);

  function initSocialForm(data) {
    setSocialForm({
      linkedin: data?.linkedin || '',
      github: data?.github || '',
      instagram: data?.instagram || '',
      facebook: data?.facebook || '',
      website: data?.website || '',
    });
  }

  // --- LOGIKA UPLOAD FOTO ---
  function handleFotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImageFile = file.type?.startsWith('image/');
    if (!isImageFile) {
      alertWarning('File yang diunggah harus berupa format foto (image)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const preview = URL.createObjectURL(file);
    setRawPreviewUrl(preview);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setShowCropModal(true);
  }

  async function uploadFoto(file) {
    try {
      setSavingFoto(true);
      const formData = new FormData();
      formData.append('foto', file);
      formData.append('nama_alumni', profile?.nama || '');
      await alumniApi.updateProfile(formData);
      onShowSuccess('Perubahan foto dikirim dan menunggu persetujuan admin');
      onRefresh();
    } catch (err) {
      alertError('Gagal mengunggah foto');
    } finally {
      setSavingFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleApplyCrop() {
    if (!rawPreviewUrl || !croppedAreaPixels) {
      return;
    }

    const croppedFile = await getCroppedFile(rawPreviewUrl, croppedAreaPixels);
    if (!croppedFile) {
      alertError('Gagal memproses crop gambar');
      return;
    }

    await uploadFoto(croppedFile);
    handleCloseCropModal();
  }

  function handleCloseCropModal() {
    setShowCropModal(false);
    setCroppedAreaPixels(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    if (rawPreviewUrl) {
      URL.revokeObjectURL(rawPreviewUrl);
      setRawPreviewUrl(null);
    }
  }

  // --- LOGIKA SOSIAL MEDIA ---
  async function loadSocialMediaMaster() {
    try {
      const res = await masterDataApi.getSocialMedia();
      setSocialMediaList(res.data.data || res.data || []);
    } catch (err) { console.error('Failed to load social media options:', err); }
  }

  // Mulai edit dari data saat ini (approved)
  async function handleStartEdit() {
    await loadSocialMediaMaster();
    initSocialForm(profile);
    setShowAddSocial(false);
    setEditMode('edit');
  }

  // Mulai edit ulang dari data pending
  async function handleStartEditPending() {
    // Ambil data pending langsung dari profile
    const pending = (profile?.pending_updates || []).find(
      u => u.section === 'social_media' && u.status === 'pending'
    ) || null;

    const pendingData = pending?.new_data?.social_media || [];

    // Strategi 1: coba map via master list (untuk resolusi nama platform)
    const masterList = socialMediaList.length > 0 ? socialMediaList : await loadMasterAndReturn();
    let pendingMap = pendingSocialToMap(pendingData, masterList);

    // Strategi 2: jika map kosong atau partial, coba match via nama platform di master

    if (pendingData.length > 0 && Object.keys(pendingMap).length === 0) {
      for (const item of pendingData) {
        const master = masterList.find(
          sm => Number(sm.id_sosmed ?? sm.id) === Number(item.id_sosmed)
        );
        if (master) {
          const name = (master.nama_sosmed || master.nama || '').toLowerCase();
          for (const platform of SOCIAL_PLATFORMS) {
            if (name.includes(platform.key)) {
              pendingMap[platform.key] = item.url;
              break;
            }
          }
        } else {
          for (const platform of SOCIAL_PLATFORMS) {
            const url = (item.url || '').toLowerCase();
            if (url.includes(platform.key)) {
              pendingMap[platform.key] = item.url;
              break;
            }
          }
        }
      }
    }

    setSocialForm({
      linkedin: pendingMap.linkedin || '',
      github: pendingMap.github || '',
      instagram: pendingMap.instagram || '',
      facebook: pendingMap.facebook || '',
      website: pendingMap.website || '',
    });
    setShowAddSocial(true);
    setEditMode('edit_pending');
  }

  async function loadMasterAndReturn() {
    const res = await masterDataApi.getSocialMedia();
    const list = res.data.data || res.data || [];
    setSocialMediaList(list);
    return list;
  }

  function handleCancelEdit() {
    setEditMode('view');
    setShowAddSocial(false);
    initSocialForm(profile);
  }

  async function handleSaveSocial() {
    try {
      setSavingSocial(true);
      // Pastikan master data sudah dimuat
      let currentMaster = socialMediaList;
      console.log(currentMaster)
      if (currentMaster.length === 0) {
        const res = await masterDataApi.getSocialMedia();
        currentMaster = res.data.data || res.data || [];
        setSocialMediaList(currentMaster);
      }

      // Build array social_media untuk backend
      const socialMediaPayload = [];
      for (const platform of SOCIAL_PLATFORMS) {
        const url = socialForm[platform.key]?.trim();
        if (url) {
          const master = currentMaster.find(sm => (sm.nama_sosmed || sm.nama || '').toLowerCase().includes(platform.key));
          if (master) {
            socialMediaPayload.push({
              id_sosmed: master.id_sosmed || master.id,
              url,
            });
          }
        }
      }

      if (editMode === 'edit_pending') {
        // Ambil id pending dari profile
        const pending = (profile?.pending_updates || []).find(
          u => u.section === 'social_media' && u.status === 'pending'
        ) || null;
        if (pending?.id) {
          await alumniApi.updatePendingSocialMedia(pending.id, socialMediaPayload);
          onShowSuccess('Pengajuan tautan sosial berhasil diperbarui, menunggu persetujuan admin');
        }
      } else {
        // Kirim via updateProfile (JSON payload)
        await alumniApi.updateProfile({ social_media: socialMediaPayload });
        onShowSuccess('Tautan sosial dikirim, menunggu persetujuan admin');
      }

      setEditMode('view');
      setShowAddSocial(false);
      onRefresh();
    } catch (err) {
      alertError('Gagal menyimpan tautan sosial');
    } finally {
      setSavingSocial(false);
    }
  }

  async function handleCancelPending() {
    const confirm = await alertConfirm("Apakah anda yakin membatalkan pengajuan tautan sosial ini? Data yang ada sebelumnya akan tetap berlaku.")
    if (!confirm.isConfirmed) return;
    const pending = (profile?.pending_updates || []).find(
      u => u.section === 'social_media' && u.status === 'pending'
    ) || null;
    if (!pending?.id) return;
    try {
      setCancelingeSocial(true);
      await alumniApi.cancelPendingSocialMedia(pending.id);
      onShowSuccess('Pengajuan tautan sosial berhasil dibatalkan');
      onRefresh();
    } catch (err) {
      alertError('Gagal membatalkan pengajuan');
    } finally {
      setCancelingeSocial(false);
    }
  }

  const fotoUrl = profile?.foto ? getImageUrl(profile.foto) : null;
  const pendingUpdates = (profile?.pending_updates || []).filter(
    (u) => u.section === 'personal_info' && u.status === 'pending'
  );
  const latestPendingFields = profile?.latest_pending_fields || [];
  const hasPersonalPending = profile?.latest_personal_info_status === 'pending';
  const isFotoPendingFromLatest = hasPersonalPending && (
    latestPendingFields.includes('foto') ||
    latestPendingFields.includes('foto_path') ||
    latestPendingFields.includes('gambar_path')
  );

  const isFotoPendingFromUpdates = pendingUpdates.some((u) => {
    const oldData = u?.old_data || {};
    const newData = u?.new_data || {};
    const keys = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])];
    return keys.some((field) => ['foto', 'foto_path', 'gambar_path'].includes(field));
  });

  const isFotoPending = isFotoPendingFromLatest || isFotoPendingFromUpdates;

  // Pending social media (diakses juga oleh handler)
  const pendingSocial = (profile?.pending_updates || []).find(
    u => u.section === 'social_media' && u.status === 'pending'
  ) || null;

  return (
    <div className="lg:col-span-4 space-y-6">

      {/* Input File Tersembunyi */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFotoSelect} accept="image/*" />

      {/* KOTAK 1: INFO PROFIL */}
      <div className="bg-white rounded-md p-8 shadow-sm text-center border border-slate-100">
        <div className="relative w-32 h-32 mx-auto mb-5">
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-50">
            {fotoUrl ? (
              <img src={fotoUrl} alt="Foto Profil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary/40">
                {profile?.nama?.charAt(0) || 'A'}
              </div>
            )}
          </div>
          {isFotoPending && (
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200">
              PENDING
            </span>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={savingFoto || !isVerified}
            title={!isVerified ? 'Akun belum diverifikasi dan belum mengisi kuesioner' : ''}
            className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors border-2 border-white shadow-sm disabled:opacity-50 ${
              !isVerified ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary cursor-pointer hover:bg-[#2A3E3F]'
            }`}
          >
            {savingFoto ? <Loader2 size={14} className="animate-spin" /> : (!isVerified ? <Lock size={14} /> : <Edit size={14} />)}
          </button>
        </div>

        <h2 className="text-xl font-black text-primary">{profile?.nama || '-'}</h2>
        <p className="text-sm font-semibold text-primary/60 mb-6">
          Angkatan {profile?.tahun_masuk || '-'}
          {profile?.jurusan?.nama && ` • ${profile.jurusan.nama}`}
        </p>
        <div className="space-y-3 pt-6 border-t border-slate-100 text-left">
          <div className="flex items-center gap-3 text-primary/70">
            <Mail size={16} className="shrink-0" />
            <span className="text-sm font-medium truncate">{profile?.email || '-'}</span>
          </div>
          <div className="flex items-center gap-3 text-primary/70">
            <Phone size={16} className="shrink-0" />
            <span className="text-sm font-medium">{profile?.no_hp || '-'}</span>
          </div>
        </div>
      </div>

      {/* KOTAK 2: TAUTAN SOSIAL */}
      {(() => {
        const hasPending = !!pendingSocial;
        const isEditing = editMode === 'edit' || editMode === 'edit_pending';

        const approvedLinks = [];
        if (profile?.linkedin) approvedLinks.push({ key: 'linkedin', url: profile.linkedin, icon: <FaLinkedin size={16} /> });
        if (profile?.github) approvedLinks.push({ key: 'github', url: profile.github, icon: <FaGithub size={16} /> });
        if (profile?.instagram) approvedLinks.push({ key: 'instagram', url: profile.instagram, icon: <FaInstagram size={16} /> });
        if (profile?.facebook) approvedLinks.push({ key: 'facebook', url: profile.facebook, icon: <FaFacebook size={16} /> });
        if (profile?.website) approvedLinks.push({ key: 'website', url: profile.website, icon: <FaGlobe size={16} /> });

        return (
          <div className={`bg-white rounded-md p-8 shadow-sm border transition-all ${hasPending && !isEditing ? 'border-amber-200' : 'border-slate-100'}`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-primary">Tautan Sosial</h3>
                {hasPending && !isEditing && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full border border-amber-200">
                    <Clock size={9} /> PENDING
                  </span>
                )}
              </div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    onClick={handleSaveSocial}
                    disabled={savingSocial}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingSocial ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              ) : (
                hasPending ? (
                  <></>
                ) : (
                  <button
                    onClick={handleStartEdit}
                    disabled={!isVerified}
                    title={!isVerified ? 'Akun belum diverifikasi dan belum mengisi kuesioner' : ''}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      !isVerified 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'text-slate-500 hover:text-primary hover:bg-primary/10 cursor-pointer'
                    }`}
                  >
                    {!isVerified ? <Lock size={14} /> : <Edit size={14} />} 
                    {!isVerified ? 'Terkunci' : 'Edit'}
                  </button>
                )
              )}
            </div>

            {/* === MODE EDIT === */}
            {isEditing && (
              <>
                {editMode === 'edit_pending' && (
                  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                    <Clock size={14} className="text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700 font-medium">
                      Anda sedang mengedit pengajuan yang belum disetujui admin. Perubahan ini akan menggantikan isi pengajuan sebelumnya.
                    </p>
                  </div>
                )}
                <div className="space-y-3 mb-4">
                  {SOCIAL_PLATFORMS.map((platform) => {
                    const hasValue = socialForm[platform.key];
                    if (!hasValue && !showAddSocial) return null;
                    return (
                      <div key={platform.key} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 text-primary/60">
                          {platform.icon}
                        </div>
                        <input
                          type="text"
                          value={socialForm[platform.key] || ''}
                          onChange={(e) => setSocialForm(prev => ({ ...prev, [platform.key]: e.target.value }))}
                          placeholder={platform.placeholder}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-primary"
                        />
                        {hasValue && (
                          <button
                            onClick={() => setSocialForm(prev => ({ ...prev, [platform.key]: '' }))}
                            className="text-slate-300 hover:text-red-500 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {!showAddSocial && (
                    <button
                      onClick={() => setShowAddSocial(true)}
                      className="flex items-center gap-2 text-sm font-bold text-primary/60 hover:text-primary transition-colors cursor-pointer mt-2"
                    >
                      <Plus size={16} /> Tampilkan semua platform
                    </button>
                  )}
                </div>
              </>
            )}

            {/* === MODE VIEW === */}
            {!isEditing && (
              <>
                {/* Banner Pending */}
                {hasPending && (
                  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <Clock size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-amber-800 font-bold mb-0.5">Perubahan Menunggu Persetujuan Admin</p>
                        <p className="text-[11px] text-amber-700">
                          Tautan sosial yang baru diinput akan berlaku setelah disetujui admin.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleStartEditPending}
                        className="flex items-center gap-1 text-[11px] font-bold text-primary bg-white border border-primary/30 hover:bg-primary/5 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors"
                      >
                        <Edit size={11} /> Edit Ulang
                      </button>
                      <button
                        onClick={handleCancelPending}
                        disabled={cancelingSocial}
                        className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        <X size={11} /> {cancelingSocial ? 'Membatalkan...' : 'Batalkan Pengajuan'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Daftar tautan sosial (approved) */}
                <div className="space-y-3">
                  {approvedLinks.length > 0 ? approvedLinks.map((link) => (
                    <div key={link.key} className="flex items-center gap-3 text-primary/70">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                        {link.icon}
                      </div>
                      <span className="text-sm font-medium truncate flex-1">{displayUrl(link.url)}</span>
                    </div>
                  )) : !hasPending ? (
                    <p className="text-sm text-slate-400 font-medium">Belum ada tautan sosial</p>
                  ) : null}
                </div>

                {/* Tombol tambah jika kosong */}
                {isEditing && !hasPending && (
                  <button
                    onClick={() => { setShowAddSocial(true); handleStartEdit(); }}
                    className="flex items-center gap-2 text-sm font-bold text-primary/60 hover:text-primary transition-colors cursor-pointer mt-4"
                  >
                    <Plus size={16} /> Tambahkan tautan sosial
                  </button>
                )}
              </>
            )}
          </div>
        );
      })()}

      {showCropModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleCloseCropModal} />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-100 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-primary">Atur Crop Foto Profil</h3>
                <p className="text-xs text-primary/60 font-medium">Sesuaikan area foto sebelum dikirim ke admin.</p>
              </div>
              <button onClick={handleCloseCropModal} className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <div className="relative w-full h-90 bg-slate-900 rounded-2xl overflow-hidden">
                {rawPreviewUrl && (
                  <Cropper
                    image={rawPreviewUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                  />
                )}
              </div>

              <div className="mt-5">
                <label className="block text-[11px] font-bold text-slate-500 mb-2">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[#425A5C]"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={handleCloseCropModal}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleApplyCrop}
                  disabled={savingFoto}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-[#2A3E3F] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {savingFoto ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Gunakan Foto Ini
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}