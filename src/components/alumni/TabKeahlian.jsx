import React, { useState, useEffect } from 'react';
import { Award, Plus, X, Save, Loader2, Clock, Edit2, Trash2 } from 'lucide-react';
import { alumniApi } from '../../api/alumni';
import { masterDataApi } from '../../api/masterData';

// Menggunakan SmoothDropdown milik Anda
import SmoothDropdown from '../admin/SmoothDropdown';

export default function TabKeahlian({ profile, onRefresh, onShowSuccess }) {
  const [masterSkills, setMasterSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);

  // State untuk dropdown dan perubahan
  const [selectedDropdownValue, setSelectedDropdownValue] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // State untuk tambah skill baru
  const [newSkillName, setNewSkillName] = useState('');
  const [creatingSkill, setCreatingSkill] = useState(false);

  // State untuk pending updates
  const [isEditingPending, setIsEditingPending] = useState(false);
  const [cancelingPending, setCancelingPending] = useState(false);

  useEffect(() => {
    // Map skill dari profil yang sudah ada di database
    const skills = (profile?.skills || []).map(s => ({
      id: s.id || s.id_skills,
      nama_skill: s.nama_skill || s.nama || s.name || '',
    }));
    setMySkills(skills);
    fetchMasterSkills();
  }, [profile]);

  async function fetchMasterSkills() {
    try {
      const res = await masterDataApi.getSkills();
      setMasterSkills(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load master skills:', err);
    }
  }

  // Tambah skill ke state lokal (belum save ke server)
  function handleSelectSkill(skillName) {
    if (!skillName) return;

    const skill = masterSkills.find(s => (s.nama_skill || s.nama || s.name) === skillName);

    if (skill) {
      const skillId = skill.id || skill.id_skills;
      const isAlreadyAdded = mySkills.find(s => s.id === skillId);

      if (!isAlreadyAdded) {
        setMySkills(prev => [...prev, {
          id: skillId,
          nama_skill: skill.nama_skill || skill.nama || skill.name || ''
        }]);
        setHasChanges(true);
      }
    }

    setSelectedDropdownValue('');
  }

  // Menghapus skill dari state lokal
  function removeSkill(skillId) {
    setMySkills(prev => prev.filter(s => s.id !== skillId));
    setHasChanges(true);
  }

  // Membuat skill baru lalu menambahkannya ke state lokal
  async function handleCreateSkill() {
    if (!newSkillName.trim()) return;

    const exists = masterSkills.find(s =>
      (s.nama_skill || s.nama || s.name || '').toLowerCase() === newSkillName.trim().toLowerCase()
    );

    if (exists) {
      handleSelectSkill(exists.nama_skill || exists.nama || exists.name);
      setNewSkillName('');
      return;
    }

    try {
      setCreatingSkill(true);
      const res = await masterDataApi.createSkill({ name_skills: newSkillName.trim() });
      const created = res.data?.data || res.data;

      if (created) {
        const newSkill = {
          id: created.id || created.id_skills,
          nama_skill: created.nama_skill || created.nama || created.name || newSkillName.trim(),
        };

        setMasterSkills(prev => [...prev, newSkill]);

        const isAlreadyAdded = mySkills.find(s => s.id === newSkill.id);
        if (!isAlreadyAdded) {
          setMySkills(prev => [...prev, newSkill]);
          setHasChanges(true);
        }
      }

      setNewSkillName('');
    } catch (err) {
      console.error('Failed to create new skill:', err);
      alert('Gagal membuat keahlian baru: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreatingSkill(false);
    }
  }

  // Simpan perubahan skills (create atau update pending)
  async function handleSaveSkills() {
    try {
      setSaving(true);
      const skillIds = mySkills.map(s => s.id);

      const pendingUpdate = pendingUpdates[0];

      if (isEditingPending && pendingUpdate) {
        // Update existing pending
        await alumniApi.updatePendingSkills(pendingUpdate.id, skillIds);
        onShowSuccess('Perubahan keahlian yang pending berhasil diperbarui');
      } else {
        // Create new pending
        await alumniApi.updateSkills(skillIds);
        onShowSuccess('Perubahan keahlian telah dikirim, menunggu persetujuan admin');
      }

      setHasChanges(false);
      setShowSearch(false);
      setIsEditingPending(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to save skills:', err);
      alert('Gagal menyimpan keahlian: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }

  // Edit pending skills
  function handleEditPending() {
    const pendingUpdate = pendingUpdates[0];
    if (!pendingUpdate) return;

    const pendingSkillIds = pendingUpdate.new_data?.skill_ids || [];

    // Load pending skills ke state
    const pendingSkills = pendingSkillIds
      .map(id => {
        const skill = masterSkills.find(s =>
          s.id === id ||
          s.id_skills === id ||
          String(s.id) === String(id) ||
          String(s.id_skills) === String(id)
        );
        return skill ? {
          id: skill.id || skill.id_skills,
          nama_skill: skill.nama_skill || skill.nama || skill.name || ''
        } : null;
      })
      .filter(Boolean);

    setMySkills(pendingSkills);
    setIsEditingPending(true);
    setShowSearch(true);
  }

  // Cancel pending update
  async function handleCancelPending() {
    const pendingUpdate = pendingUpdates[0];
    if (!pendingUpdate) return;

    if (!confirm('Apakah Anda yakin ingin membatalkan pengajuan perubahan keahlian?')) return;

    try {
      setCancelingPending(true);
      await alumniApi.cancelPendingSkills(pendingUpdate.id);
      onShowSuccess('Pengajuan perubahan keahlian berhasil dibatalkan');
      setIsEditingPending(false);
      setShowSearch(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to cancel pending:', err);
      alert('Gagal membatalkan pengajuan: ' + (err.response?.data?.message || err.message));
    } finally {
      setCancelingPending(false);
    }
  }

  // Cancel edit (kembalikan ke state awal)
  function handleCancelEdit() {
    const skills = (profile?.skills || []).map(s => ({
      id: s.id || s.id_skills,
      nama_skill: s.nama_skill || s.nama || s.name || '',
    }));
    setMySkills(skills);
    setHasChanges(false);
    setShowSearch(false);
    setIsEditingPending(false);
  }

  // Menyiapkan opsi untuk SmoothDropdown
  const dropdownOptions = masterSkills
    .filter(s => {
      const skillId = s.id || s.id_skills;
      return !mySkills.find(ms => ms.id === skillId);
    })
    .map(s => s.nama_skill || s.nama || s.name);

  const pendingUpdates = (profile?.pending_updates || []).filter(u => u.section === 'skills' && u.status === 'pending');

  // Display pending skills sebagai preview
  const displayPendingSkills = pendingUpdates.length > 0 ?
    (pendingUpdates[0].new_data?.skill_ids || [])
      .map(id => {
        const skill = masterSkills.find(s =>
          s.id === id ||
          s.id_skills === id ||
          String(s.id) === String(id) ||
          String(s.id_skills) === String(id)
        );
        return skill ? {
          id: skill.id || skill.id_skills,
          nama_skill: skill.nama_skill || skill.nama || skill.name || ''
        } : null;
      })
      .filter(Boolean)
    : [];

    console.log(hasChanges)
  return (
    <div className="p-8 md:p-10 flex-1 animate-in fade-in duration-300">

      {/* Pending Update Alert */}
      {pendingUpdates.length > 0 && !isEditingPending && (
        <div className="mb-6 bg-amber-50 border border-amber-200/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-800 mb-0.5">Menunggu Persetujuan Admin</h3>
              <p className="text-xs text-amber-700/80 font-medium mb-3">
                Anda memiliki perubahan keahlian yang sedang ditinjau oleh admin.
              </p>

              {/* Preview pending skills */}
              <div className="flex flex-wrap gap-2 mb-3">
                {displayPendingSkills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1.5 bg-amber-100 border border-amber-300/60 rounded-lg text-xs font-bold text-amber-800"
                  >
                    {skill.nama_skill}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleEditPending}
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-all"
                >
                  <Edit2 size={12} />
                  Edit Pending
                </button>
                <button
                  onClick={handleCancelPending}
                  disabled={cancelingPending}
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-50 transition-all disabled:opacity-50"
                >
                  {cancelingPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Batalkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER KEAHLIAN --- */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 text-primary">
          <Award size={22} className="stroke-[2.5]" />
          <h2 className="text-xl font-black tracking-tight">Keahlian Profil</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Tambah/Batal */}
          {!isEditingPending && !hasChanges && (
            <button
              onClick={() => setShowSearch(!showSearch)}
              disabled={pendingUpdates.length > 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${showSearch
                ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                : 'bg-primary text-white hover:bg-[#2A3E3F]'
                }`}
            >
              {showSearch ? <X size={14} /> : <Plus size={14} />}
              {showSearch ? 'Batal' : 'Edit Keahlian'}
            </button>
          )}

          {/* Tombol Simpan & Batal saat editing */}
          {(hasChanges || isEditingPending) && (
            <>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className=" flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold shadow-md hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
              >
                <X size={14} />
                Batal
              </button>
              <button
                onClick={handleSaveSkills}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-green-700 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Simpan Perubahan
              </button>
            </>
          )}
        </div>
      </div>

      {/* --- KONTEN PENCARIAN & LIST --- */}
      <div className="mb-10">
        <p className="text-sm text-primary/60 mb-4 font-medium">
          Daftar keahlian dan keterampilan teknis yang Anda miliki.
        </p>

        {/* Dropdown Pencarian */}
        {showSearch && (
          <div className="relative mb-6 z-20 animate-in slide-in-from-top-2 duration-200">
            <SmoothDropdown
              options={dropdownOptions}
              value={selectedDropdownValue}
              onSelect={handleSelectSkill}
              placeholder="Ketik untuk mencari keahlian (contoh: JavaScript, Komunikasi)..."
              isSearchable={true}
            />
            <p className="text-[10px] text-primary/50 mt-2 font-semibold px-2">
              * Pilih keahlian dari daftar dropdown, atau tambahkan keahlian baru di bawah. Jangan lupa klik "Simpan Perubahan".
            </p>

            {/* Input untuk membuat keahlian baru */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateSkill(); } }}
                placeholder="Keahlian tidak ada? Ketik nama keahlian baru..."
                className="flex-1 px-4 py-2.5 border border-primary/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                disabled={creatingSkill}
              />
              <button
                onClick={handleCreateSkill}
                disabled={creatingSkill || !newSkillName.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingSkill ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Tambah Baru
              </button>
            </div>
          </div>
        )}

        {/* --- DAFTAR TAG KEAHLIAN --- */}
        <div className="flex flex-wrap gap-2.5 mt-2">
          {mySkills.length > 0 ? (
            mySkills.map((skill) => (
              <span
                key={skill.id}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm"
              >
                {skill.nama_skill}
                {showSearch && (
                  <button
                    onClick={() => removeSkill(skill.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Hapus keahlian"
                  >
                    <X size={16} strokeWidth={2.5} />
                  </button>
                )}
              </span>
            ))
          ) : (
            <div className="w-full py-6 border-2 border-dashed border-slate-200 rounded-xl text-center">
              <p className="text-sm text-slate-400 font-medium">
                Belum ada keahlian yang ditambahkan.
              </p>
              {!showSearch && !isEditingPending && pendingUpdates.length === 0 && (
                <button
                  onClick={() => setShowSearch(true)}
                  className="text-xs text-primary font-bold mt-2 hover:underline cursor-pointer"
                >
                  Tambahkan sekarang
                </button>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}