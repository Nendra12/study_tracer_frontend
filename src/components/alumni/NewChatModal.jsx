import React, { useState, useEffect } from 'react';
import { X, Search, User, Loader2 } from 'lucide-react';
import { alumniApi } from '../../api/alumni';
import { STORAGE_BASE_URL } from '../../api/axios';

export default function NewChatModal({ isOpen, onClose, onSelectContact }) {
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_BASE_URL}/${path}`;
  }

  useEffect(() => {
    if (!isOpen) return;
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
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama alumni..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-none text-sm rounded-md py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-primary transition-all outline-none"
            />
          </div>
        </div>

        <div className="p-2 overflow-y-auto max-h-[60vh]">
          <h3 className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Koneksi Alumni</h3>

          {loading ? (
            <div className="py-8 flex items-center justify-center text-gray-400">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : contacts.length > 0 ? (
            <div className="space-y-1 mt-1">
              {contacts.map(contact => {
                const foto = getImageUrl(contact.foto);
                const avatarUrl = foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.nama_alumni)}&background=e0e7ff&color=4f46e5`;
                return (
                  <button
                    key={contact.id_alumni}
                    onClick={() => handleSelect(contact)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left cursor-pointer"
                  >
                    <img src={avatarUrl} alt={contact.nama_alumni} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{contact.nama_alumni}</h4>
                      <p className="text-xs text-gray-400">
                        {[contact.jurusan, contact.tahun_lulus].filter(Boolean).join(' · ') || 'Alumni'}
                      </p>
                    </div>
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
        </div>
      </div>
    </div>
  );
}
