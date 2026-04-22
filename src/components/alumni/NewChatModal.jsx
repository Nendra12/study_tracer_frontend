import React, { useState } from 'react';
import { X, Search, User } from 'lucide-react';

const SUGGESTED_CONTACTS = [
  { id: 101, name: 'Biro Akademik', role: 'Admin', type: 'admin', avatar: 'https://ui-avatars.com/api/?name=Biro+Akademik&background=e0e7ff&color=4f46e5' },
  { id: 102, name: 'PT. Maju Mundur', role: 'Perusahaan', type: 'company', avatar: 'https://ui-avatars.com/api/?name=PT+Maju&background=f1f5f9&color=64748b' },
  { id: 103, name: 'Rina Wijaya', role: 'Alumni 2019', type: 'alumni', avatar: 'https://ui-avatars.com/api/?name=Rina+W&background=ecfdf5&color=10b981' },
];

export default function NewChatModal({ isOpen, onClose, onSelectContact }) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredContacts = SUGGESTED_CONTACTS.filter(contact => 
    contact.name.toLowerCase().includes(search.toLowerCase()) || 
    contact.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Pesan Baru</h2>
          <button 
            onClick={onClose}
            className="p-2 cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama, peran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-none text-sm rounded-md py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-primary transition-all outline-none"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="p-2 overflow-y-auto max-h-[60vh]">
          <h3 className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Saran Koneksi Alumni</h3>
          
          {filteredContacts.length > 0 ? (
            <div className="space-y-1 mt-1">
              {filteredContacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => onSelectContact(contact)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{contact.name}</h4>
                    <p className="text-xs text-gray-500">{contact.role}</p>
                  </div>
                </button>
              ))}
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
