import React, { useState, useEffect } from 'react';
import { Search, User, Loader2, Users, Check, ImagePlus, ArrowLeft } from 'lucide-react';
import { alumniApi } from '../../api/alumni';
import { STORAGE_BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';

export default function NewChatPane({ onSelectContact, onCancel }) {
  const [mode, setMode] = useState('private');
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupAvatarFile, setGroupAvatarFile] = useState(null);
  const [groupAvatarPreview, setGroupAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);

  function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_BASE_URL}/${path}`;
  }

  useEffect(() => {
    const timer = setTimeout(() => fetchContacts(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchContacts = async (q = '') => {
    setLoading(true);
    try {
      const res = await alumniApi.getMessageContacts({ search: q || undefined, limit: 30 });
      let data = res.data?.data || [];
      
      // Mengurutkan secara alfabetis
      data.sort((a, b) => a.nama_alumni.localeCompare(b.nama_alumni));
      setContacts(data);
    } catch {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (contact) => {
    try {
      const res = await alumniApi.getOrCreatePrivateConversation(contact.id_alumni);
      const conversation = res.data?.data;
      onSelectContact(conversation);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const toggleGroupMember = (memberId) => {
    setSelectedMemberIds((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  const handleGroupAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGroupAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setGroupAvatarPreview(event.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Nama grup wajib diisi');
      return;
    }
    if (selectedMemberIds.length === 0) {
      toast.error('Pilih minimal 1 anggota grup');
      return;
    }

    setCreatingGroup(true);
    try {
      const formData = new FormData();
      formData.append('group_name', groupName.trim());
      selectedMemberIds.forEach((id) => formData.append('participants[]', id));
      if (groupAvatarFile) {
        formData.append('avatar', groupAvatarFile);
      }

      const res = await alumniApi.createGroupConversation(formData);
      const conversation = res.data?.data;
      if (conversation) {
        toast.success('Grup berhasil dibuat');
        onSelectContact(conversation);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat grup');
    } finally {
      setCreatingGroup(false);
    }
  };

  // Grouping the contacts by first letter
  const groupedContacts = contacts.reduce((acc, contact) => {
    const firstLetter = contact.nama_alumni.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(contact);
    return acc;
  }, {});

  const sortedLetters = Object.keys(groupedContacts).sort();

  return (
    <div className="flex flex-col h-full w-full bg-white animate-in slide-in-from-left duration-300 z-10 relative">
      <div className="flex items-center gap-4 p-5 md:pt-6 border-b border-gray-100 bg-white shrink-0">
        <button onClick={onCancel} className="p-2 -ml-2 cursor-pointer text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-extrabold text-primary">Pesan Baru</h2>
      </div>

      <div className="p-5 border-b border-gray-100 shrink-0 bg-white">
        <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setMode('private')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${mode === 'private' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Chat Personal
          </button>
          <button
            onClick={() => setMode('group')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${mode === 'group' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Buat Grup
          </button>
        </div>

        
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar">
        {mode === 'group' && (
          <div className="mb-5 mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Grup</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Contoh: Alumni TI 2020"
                className="mt-1.5 w-full bg-white  text-sm rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="relative cursor-pointer shrink-0">
                <input type="file" accept="image/*" className="hidden" onChange={handleGroupAvatarChange} />
                {groupAvatarPreview ? (
                  <img src={groupAvatarPreview} alt="Avatar grup" className="w-14 h-14 rounded-full object-cover border-2 border-primary/20" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-primary/50 hover:text-primary transition-colors">
                    <ImagePlus size={20} />
                  </div>
                )}
              </label>
              <div className="text-xs text-gray-500 flex-1">
                <p className="font-semibold text-gray-700 mb-0.5">Avatar Grup</p>
                <p>Klik ikon di samping untuk memilih foto profil grup (opsional).</p>
              </div>
            </div>
          </div>
        )}

        <div className="relative my-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={mode === 'group' ? 'Cari anggota grup...' : 'Cari nama alumni...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 text-sm rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
          />
        </div>

        <h3 className="py-2 text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          {mode === 'group' ? 'Pilih Anggota Grup' : 'Koneksi Alumni'}
        </h3>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-primary gap-3">
            <Loader2 size={28} className="animate-spin" />
            <span className="text-sm font-medium text-gray-500">Memuat alumni...</span>
          </div>
        ) : contacts.length > 0 ? (
          <div className="space-y-4 mt-2 pb-20">
            {sortedLetters.map((letter) => (
              <div key={letter}>
                {/* Alphabet Header */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-black text-primary">{letter}</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                
                {/* Contact List for this letter */}
                <div className="space-y-1">
                  {groupedContacts[letter].map(contact => {
                    const foto = getImageUrl(contact.foto);
                    const avatarUrl = foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.nama_alumni)}&background=e0e7ff&color=4f46e5`;
                    const isSelected = selectedMemberIds.includes(contact.id_alumni);
                    return (
                      <button
                        key={contact.id_alumni}
                        onClick={() => mode === 'group' ? toggleGroupMember(contact.id_alumni) : handleSelect(contact)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left cursor-pointer ${mode === 'group' && isSelected ? 'bg-primary/5 border border-primary/20' : 'hover:bg-gray-50 border border-transparent'}`}
                      >
                        <img src={avatarUrl} alt={contact.nama_alumni} className="w-11 h-11 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-800 truncate">{contact.nama_alumni}</h4>
                          <p className="text-xs text-gray-400 truncate">
                            {[contact.jurusan, contact.tahun_lulus].filter(Boolean).join(' · ') || 'Alumni'}
                          </p>
                        </div>
                        {mode === 'group' && (
                          <div className={`ml-2 w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center justify-center text-gray-400">
            <User size={40} className="mb-3 opacity-20" />
            <p className="text-sm">Tidak ada koneksi alumni yang ditemukan</p>
          </div>
        )}
      </div>

      {/* Sticky footer for create group button */}
      {mode === 'group' && (
        <div className="p-4 bg-white border-t border-gray-100 shrink-0 relative z-20">
          <button
            onClick={handleCreateGroup}
            disabled={creatingGroup || !groupName.trim() || selectedMemberIds.length === 0}
            className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm ${creatingGroup || !groupName.trim() || selectedMemberIds.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-primary text-white hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'}`}
          >
            {creatingGroup ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} />}
            {creatingGroup ? 'Membuat grup...' : `Buat Grup (${selectedMemberIds.length} anggota)`}
          </button>
        </div>
      )}
    </div>
  );
}
