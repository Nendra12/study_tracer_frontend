import React, { useState, useEffect } from 'react';
import { X, Search, User, Loader2, Users, Check, ImagePlus } from 'lucide-react';
import { alumniApi } from '../../api/alumni';
import { STORAGE_BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';

export default function NewChatModal({ isOpen, onClose, onSelectContact }) {
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
    if (!isOpen) return;
    setMode('private');
    setSearch('');
    setSelectedMemberIds([]);
    setGroupName('');
    setGroupAvatarFile(null);
    setGroupAvatarPreview('');
    fetchContacts();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => fetchContacts(search), 400);
    return () => clearTimeout(timer);
  }, [search, isOpen]);

  const fetchContacts = async (q = '') => {
    setLoading(true);
    try {
      const res = await alumniApi.getMessageContacts({ search: q || undefined, limit: 30 });
      setContacts(res.data?.data || []);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Pesan Baru</h2>
          <button onClick={onClose} className="p-2 cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setMode('private')}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${mode === 'private' ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
              Chat Personal
            </button>
            <button
              onClick={() => setMode('group')}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${mode === 'group' ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
              Buat Grup
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={mode === 'group' ? 'Cari anggota grup...' : 'Cari nama alumni...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-none text-sm rounded-md py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-primary transition-all outline-none"
            />
          </div>
        </div>

        <div className="p-2 overflow-y-auto max-h-[60vh]">
          {mode === 'group' && (
            <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Grup</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Contoh: Alumni TI 2020"
                  className="mt-1 w-full bg-white border border-gray-200 text-sm rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="relative cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleGroupAvatarChange} />
                  {groupAvatarPreview ? (
                    <img src={groupAvatarPreview} alt="Avatar grup" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                      <ImagePlus size={18} />
                    </div>
                  )}
                </label>
                <div className="text-xs text-gray-500">
                  <p className="font-semibold text-gray-700">Avatar Grup</p>
                  <p>Opsional, ukuran maksimal mengikuti backend.</p>
                </div>
              </div>
            </div>
          )}

          <h3 className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            {mode === 'group' ? 'Pilih Anggota Grup' : 'Koneksi Alumni'}
          </h3>

          {loading ? (
            <div className="py-8 flex items-center justify-center text-gray-400">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : contacts.length > 0 ? (
            <div className="space-y-1 mt-1">
              {contacts.map(contact => {
                const foto = getImageUrl(contact.foto);
                const avatarUrl = foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.nama_alumni)}&background=e0e7ff&color=4f46e5`;
                const isSelected = selectedMemberIds.includes(contact.id_alumni);
                return (
                  <button
                    key={contact.id_alumni}
                    onClick={() => mode === 'group' ? toggleGroupMember(contact.id_alumni) : handleSelect(contact)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left cursor-pointer ${mode === 'group' && isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <img src={avatarUrl} alt={contact.nama_alumni} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{contact.nama_alumni}</h4>
                      <p className="text-xs text-gray-400">
                        {[contact.jurusan, contact.tahun_lulus].filter(Boolean).join(' · ') || 'Alumni'}
                      </p>
                    </div>
                    {mode === 'group' && (
                      <div className={`ml-auto w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
                        {isSelected && <Check size={12} />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center flex flex-col items-center justify-center text-gray-400">
              <User size={32} className="mb-2 opacity-20" />
              <p className="text-sm">Tidak ada koneksi alumni yang ditemukan</p>
            </div>
          )}

          {mode === 'group' && (
            <div className="pt-3 pb-1 sticky bottom-0 bg-white">
              <button
                onClick={handleCreateGroup}
                disabled={creatingGroup || !groupName.trim() || selectedMemberIds.length === 0}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${creatingGroup || !groupName.trim() || selectedMemberIds.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90 cursor-pointer'}`}
              >
                {creatingGroup ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
                {creatingGroup ? 'Membuat grup...' : `Buat Grup (${selectedMemberIds.length} anggota)`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
