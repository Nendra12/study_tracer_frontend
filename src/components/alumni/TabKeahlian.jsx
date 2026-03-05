import React, { useState, useEffect } from 'react';
import { Award, Plus, X, Save, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    // Map skill dari profil yang sudah ada di database
    const skills = (profile?.skills || []).map(s => ({
      id: s.id || s.id_skill,
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

  // Hanya update tampilan (state lokal), TIDAK memanggil API (supaya tidak refresh)
  function handleSelectSkill(skillName) {
    if (!skillName) return;

    // Cari objek skill lengkap dari master data
    const skill = masterSkills.find(s => (s.nama_skill || s.nama || s.name) === skillName);
    
    if (skill) {
      // Cek apakah skill sudah ada di daftar
      const isAlreadyAdded = mySkills.find(s => s.id === skill.id);
      
      if (!isAlreadyAdded) {
        setMySkills(prev => [...prev, { 
          id: skill.id, 
          nama_skill: skill.nama_skill || skill.nama || skill.name || '' 
        }]);
        setHasChanges(true); // Menandakan ada perubahan yang belum disimpan
      }
    }
    
    // Reset dropdown kembali kosong
    setSelectedDropdownValue('');
  }

  // Menghapus skill dari tampilan (state lokal)
  function removeSkill(skillId) {
    setMySkills(prev => prev.filter(s => s.id !== skillId));
    setHasChanges(true);
  }

  // Membuat skill baru lalu menambahkannya ke daftar lokal
  async function handleCreateSkill() {
    if (!newSkillName.trim()) return;
    
    // Cek apakah skill sudah ada di master data
    const exists = masterSkills.find(s => 
      (s.nama_skill || s.nama || s.name || '').toLowerCase() === newSkillName.trim().toLowerCase()
    );
    
    if (exists) {
      // Skill sudah ada, langsung tambahkan
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
        
        // Tambah ke master data list dan ke daftar saya
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

  // Fungsi untuk menyimpan ke API (Dijalankan manual lewat tombol)
  async function handleSaveSkills() {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('nama_alumni', profile?.nama || '');
      mySkills.forEach((skill, idx) => {
        formData.append(`skills[${idx}]`, skill.id);
      });
      
      await alumniApi.updateProfile(formData);
      setHasChanges(false);
      setShowSearch(false);
      onShowSuccess('Keahlian berhasil diperbarui');
      onRefresh(); // Refresh data utama setelah benar-benar sukses disimpan
    } catch (err) {
      console.error('Failed to save skills:', err);
      alert('Gagal menyimpan keahlian: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }

  // Menyiapkan opsi untuk SmoothDropdown (menyembunyikan yang sudah dipilih)
  const dropdownOptions = masterSkills
    .filter(s => !mySkills.find(ms => ms.id === s.id))
    .map(s => s.nama_skill || s.nama || s.name);

  return (
    <div className="p-8 md:p-10 flex-1 animate-in fade-in duration-300">
      
      {/* --- HEADER KEAHLIAN --- */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 text-[#3C5759]">
          <Award size={22} className="stroke-[2.5]" />
          <h2 className="text-xl font-black tracking-tight">Keahlian Profil</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Tombol Tambah/Batal Keahlian Dinamis */}
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
              showSearch 
                ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' 
                : 'bg-[#3C5759] text-white hover:bg-[#2A3E3F]'
            }`}
          >
            {showSearch ? <X size={14} /> : <Plus size={14} />} 
            {showSearch ? 'Batal Tambah' : 'Tambah Keahlian'}
          </button>

          {/* Tombol Simpan (Hanya muncul jika ada perubahan baru) */}
          {hasChanges && (
            <button 
              onClick={handleSaveSkills}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-green-700 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
              Simpan Perubahan
            </button>
          )}
        </div>
      </div>

      {/* --- KONTEN PENCARIAN & LIST --- */}
      <div className="mb-10">
        <p className="text-sm text-[#3C5759]/60 mb-4 font-medium">
          Daftar keahlian dan keterampilan teknis yang Anda miliki.
        </p>
        
        {/* Dropdown Pencarian - Muncul hanya jika showSearch === true */}
        {showSearch && (
          <div className="relative mb-6 z-20 animate-in slide-in-from-top-2 duration-200">
            <div className="w-full bg-slate-50 border border-[#3C5759]/20 rounded-xl shadow-sm ring-4 ring-[#3C5759]/5">
              <SmoothDropdown 
                options={dropdownOptions} 
                value={selectedDropdownValue} 
                onSelect={handleSelectSkill} 
                placeholder="Ketik untuk mencari keahlian (contoh: JavaScript, Komunikasi)..." 
                isSearchable={true} 
              />
            </div>
            <p className="text-[10px] text-[#3C5759]/50 mt-2 font-semibold px-2">
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
                className="flex-1 px-4 py-2.5 border border-[#3C5759]/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3C5759]/30 bg-white"
              />
              <button
                onClick={handleCreateSkill}
                disabled={creatingSkill || !newSkillName.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#3C5759] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingSkill ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Tambah Baru
              </button>
            </div>
          </div>
        )}

        {/* --- DAFTAR TAG KEAHLIAN YANG DIPILIH --- */}
        <div className="flex flex-wrap gap-2.5 mt-2">
          {mySkills.length > 0 ? (
            mySkills.map((skill) => (
              <span 
                key={skill.id} 
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm"
              >
                {skill.nama_skill}
                <button 
                  onClick={() => removeSkill(skill.id)} 
                  className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Hapus keahlian"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </span>
            ))
          ) : (
            <div className="w-full py-6 border-2 border-dashed border-slate-200 rounded-xl text-center">
              <p className="text-sm text-slate-400 font-medium">
                Belum ada keahlian yang ditambahkan.
              </p>
              {!showSearch && (
                <button 
                  onClick={() => setShowSearch(true)} 
                  className="text-xs text-[#3C5759] font-bold mt-2 hover:underline cursor-pointer"
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