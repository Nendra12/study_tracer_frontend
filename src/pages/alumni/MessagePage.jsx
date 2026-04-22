import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Paperclip, MoreVertical, CheckCheck, ArrowLeft, Briefcase, GraduationCap, Building2, Plus, Star, Archive, MessageSquarePlus, EllipsisIcon, ImagePlus, Smile, Gift, SendHorizontal, X, Download, UsersRound, ListChecks, Trash2, Check } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
import NewChatModal from '../../components/alumni/NewChatModal';

const INITIAL_CONTACTS = [
  { id: 1, name: 'Pusat Karir (Bu Rina)', role: 'Admin', type: 'admin', lastMessage: 'Jangan lupa update portofolio ya.', time: '10:30', unread: 2, online: true, avatar: 'https://ui-avatars.com/api/?name=Pusat+Karir&background=e0e7ff&color=4f46e5', isFavorite: true, isArchived: false },
  { id: 2, name: 'HRD PT. Teknologi', role: 'Perusahaan', type: 'company', lastMessage: 'Bisa jadwalkan interview?', time: 'Kemarin', unread: 0, online: false, avatar: 'https://ui-avatars.com/api/?name=HRD+Tech&background=f1f5f9&color=64748b', isFavorite: false, isArchived: false },
  { id: 3, name: 'Budi Santoso', role: 'Alumni 2020', type: 'alumni', lastMessage: 'Wah, selamat atas pekerjaan barunya!', time: 'Senin', unread: 0, online: true, avatar: 'https://ui-avatars.com/api/?name=Budi+S&background=ecfdf5&color=10b981', isFavorite: false, isArchived: false },
];

const INITIAL_CONVERSATIONS = {
  1: [
    { id: 1, type: 'text', text: 'Halo, apakah data tracer study-nya sudah diisi?', sender: 'them', time: '10:25' },
    { id: 2, type: 'text', text: 'Halo Bu. Sudah saya isi sebagian, untuk riwayat pekerjaan sedang saya lengkapi.', sender: 'me', time: '10:28' },
    { id: 3, type: 'text', text: 'Baik, ditunggu ya batas waktunya Jumat. Jangan lupa update portofolio ya.', sender: 'them', time: '10:30' },
  ],
  2: [
    { id: 1, type: 'text', text: 'Halo, kami telah mereview CV Anda.', sender: 'them', time: 'Kamis' },
    { id: 2, type: 'text', text: 'Bisa jadwalkan interview?', sender: 'them', time: 'Kemarin' },
  ],
  3: [
    { id: 1, type: 'text', text: 'Wah, selamat atas pekerjaan barunya!', sender: 'them', time: 'Senin' },
  ]
};

const MAX_FAVORITES = 3;

const TenorPicker = ({ onSelectGif, onClose }) => {
  const [search, setSearch] = useState('');
  const [gifs, setGifs] = useState([]);

  useEffect(() => {
    const endpoint = search ? 'search' : 'trending';
    fetch(`https://g.tenor.com/v1/${endpoint}?q=${search}&key=LIVDSRZULELA&limit=12`)
      .then(res => res.json())
      .then(data => setGifs(data.results || []))
      .catch(() => setGifs([]));
  }, [search]);

  return (
    <div className="absolute bottom-16 left-4 md:left-24 bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl w-72 p-3 z-50">
      <div className="flex items-center justify-between mb-2 px-1">
        <h4 className="text-xs font-bold text-gray-500 uppercase">Cari GIF</h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>
      <input
        type="text"
        placeholder="Cari GIF dari Tenor..."
        className="w-full bg-gray-50 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 mb-2 transition-all"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-1.5 h-48 overflow-y-auto pr-1 custom-scrollbar">
        {gifs.map(gif => (
          <img
            key={gif.id}
            src={gif.media[0].tinygif.url}
            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity bg-gray-100"
            onClick={() => onSelectGif(gif.media[0].gif.url)}
            alt="gif"
          />
        ))}
      </div>
    </div>
  );
};

export default function MessagePage() {
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeChat, setActiveChat] = useState(INITIAL_CONTACTS[0]);
  const [messageInput, setMessageInput] = useState('');
  const [showChatArea, setShowChatArea] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeChat]);

  const handleSelectChat = (contact) => {
    setContacts(contacts.map(c => c.id === contact.id ? { ...c, unread: 0 } : c));
    const currentContact = contacts.find(c => c.id === contact.id) || contact;
    setActiveChat(currentContact);
    setShowChatArea(true);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    setAttachmentPreview(null);
  };

  const currentMessages = conversations[activeChat?.id] || [];

  const pushMessage = (msgObj, notificationText) => {
    setConversations(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), msgObj]
    }));

    setContacts(prev => prev.map(c =>
      c.id === activeChat.id
        ? { ...c, lastMessage: notificationText, time: msgObj.time }
        : c
    ));
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() && !attachmentPreview) return;

    const newMessage = {
      id: Date.now(),
      type: attachmentPreview ? attachmentPreview.type : 'text',
      text: attachmentPreview ? undefined : messageInput.trim(),
      caption: attachmentPreview ? messageInput.trim() : undefined,
      fileName: attachmentPreview ? attachmentPreview.fileName : undefined,
      url: attachmentPreview ? attachmentPreview.url : undefined,
      sender: 'me',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    let brief = messageInput.trim() || 'Kirim Lampiran';
    if (attachmentPreview) {
      const pType = attachmentPreview.type;
      if (pType === 'image') brief = '🖼️ Mengirim gambar' + (messageInput.trim() ? `: ${messageInput.trim()}` : '');
      else if (pType === 'file') brief = '📎 Mengirim file' + (messageInput.trim() ? `: ${messageInput.trim()}` : '');
      else if (pType === 'gif') brief = '🎬 Mengirim GIF' + (messageInput.trim() ? `: ${messageInput.trim()}` : '');
    }

    pushMessage(newMessage, brief);
    setMessageInput('');
    setAttachmentPreview(null);
    setShowEmojiPicker(false);
  };

  const handleSendAttachment = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setShowEmojiPicker(false);
    setShowGifPicker(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachmentPreview({
        type: type,
        fileName: file.name,
        url: event.target.result,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };

  const handleSendGif = (url) => {
    const newGifMessage = {
      id: Date.now(),
      type: 'gif',
      text: undefined,
      caption: undefined,
      fileName: 'GIF dari Tenor',
      url: url,
      sender: 'me',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    
    pushMessage(newGifMessage, '🎬 Mengirim GIF');
    setShowGifPicker(false);
  };

  const handleAddContact = (newContact) => {
    const exists = contacts.find(c => c.id === newContact.id);
    if (!exists) {
      setContacts([{ ...newContact, lastMessage: '', time: '', unread: 0, isFavorite: false, isArchived: false }, ...contacts]);
    }
    handleSelectChat(newContact);
    setIsModalOpen(false);
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    const currentFavCount = contacts.filter((c) => c.isFavorite).length;
    const target = contacts.find((c) => c.id === id);
    const willFavorite = !(target?.isFavorite);

    if (willFavorite && currentFavCount >= MAX_FAVORITES) {
      toast.error(`Maksimal ${MAX_FAVORITES} chat yang bisa difavoritkan.`);
      return;
    }

    setContacts(contacts.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
    toast.success('Status favorit diperbarui!');
  };

  const handleToggleSelect = (contactId) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const allSelectedArchived = selectedContacts.length > 0 && selectedContacts.every(id => contacts.find(c => c.id === id)?.isArchived);
  const allSelectedFavorited = selectedContacts.length > 0 && selectedContacts.every(id => contacts.find(c => c.id === id)?.isFavorite);

  const handleBulkArchive = () => {
    setContacts(contacts.map(c => selectedContacts.includes(c.id) ? { ...c, isArchived: !allSelectedArchived } : c));
    toast.success(`${selectedContacts.length} obrolan ${allSelectedArchived ? 'batal diarsipkan' : 'diarsipkan'}`);
    setIsSelectionMode(false);
    setSelectedContacts([]);
  };

  const handleBulkFavorite = () => {
    if (!allSelectedFavorited) {
      const currentFavCount = contacts.filter((c) => c.isFavorite).length;
      const addCount = selectedContacts
        .map((id) => contacts.find((c) => c.id === id))
        .filter((c) => c && !c.isFavorite).length;

      if (currentFavCount + addCount > MAX_FAVORITES) {
        toast.error(`Maksimal ${MAX_FAVORITES} chat favorit. Hapus favorit lain dulu.`);
        return;
      }
    }

    setContacts(contacts.map(c => selectedContacts.includes(c.id) ? { ...c, isFavorite: !allSelectedFavorited } : c));
    toast.success(`${selectedContacts.length} obrolan ${allSelectedFavorited ? 'dihapus dari favorit' : 'ditambahkan ke favorit'}`);
    setIsSelectionMode(false);
    setSelectedContacts([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Hapus ${selectedContacts.length} obrolan? (Tindakan ini permanen)`)) {
      setContacts(contacts.filter(c => !selectedContacts.includes(c.id)));
      toast.success(`${selectedContacts.length} obrolan dihapus`);
      if (selectedContacts.includes(activeChat?.id)) {
         setActiveChat(null);
      }
      setIsSelectionMode(false);
      setSelectedContacts([]);
    }
  };

  const getRoleIcon = (type) => {
    switch (type) {
      case 'admin': return <Building2 size={12} className="text-primary" />;
      case 'company': return <Briefcase size={12} className="text-blue-500" />;
      case 'alumni': return <GraduationCap size={12} className="text-emerald-500" />;
      default: return null;
    }
  };

  const favoriteCount = contacts.filter((c) => c.isFavorite).length;

  const filteredContacts = contacts.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterMode === 'favorite') return matchSearch && c.isFavorite;
    if (filterMode === 'archived') return matchSearch && c.isArchived;
    return matchSearch && !c.isArchived;
  });

  const handleFeatureNotReady = (featureName) => {
    toast(`Fitur ${featureName} akan segera hadir!`, { icon: '🚧' });
  };

  const onEmojiClick = (emojiObject) => {
    setMessageInput(prev => prev + emojiObject.emoji);
  };

  return (
    <div className="h-screen bg-[#f8f9fa] font-sans flex flex-col selection:bg-primary/20 overflow-hidden">
      <Toaster position="top-right" />
      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectContact={handleAddContact}
      />

      {/* Hidden file inputs */}
      <input type="file" accept="image/*" ref={imageInputRef} className="hidden" onChange={(e) => handleSendAttachment(e, 'image')} />
      <input type="file" accept="*" ref={fileInputRef} className="hidden" onChange={(e) => handleSendAttachment(e, 'file')} />

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="absolute top-6 right-6 flex gap-4 z-50">
            <a 
              href={previewImage.url} 
              download={previewImage.fileName || 'image.png'} 
              onClick={(e) => e.stopPropagation()}
              className="p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              title="Unduh Gambar"
            >
              <Download size={24} />
            </a>
            <button 
              className="p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors" 
              onClick={() => setPreviewImage(null)}
              title="Tutup Preview"
            >
              <X size={24} />
            </button>
          </div>
          <img 
            src={previewImage.url} 
            className="max-w-full max-h-full object-contain rounded-md" 
            onClick={(e) => e.stopPropagation()} 
            alt="Preview"
          />
        </div>
      )}

      <main className="flex-1 min-h-0 w-full max-w-305 mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 pt-24 flex flex-col">
        <div className="flex-1 min-h-0 flex bg-white md:rounded-2xl md:shadow-xl md:border md:border-gray-100 overflow-hidden">

          {/* KIRI: List Kontak */}
          <div className={`w-full md:w-80 lg:w-[400px] flex-col border-r border-gray-100 bg-white relative ${showChatArea ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-5 md:pt-6 px-6 shrink-0">
              <div className="flex justify-between items-center mb-5">
                <h1 className="text-2xl font-extrabold text-primary">Pesan</h1>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-2.5 cursor-pointer text-gray-400 hover:bg-[#f8f9fa] hover:text-gray-700 rounded-full transition-colors"
                  >
                    <MessageSquarePlus size={20} className="stroke-[2.5]" />
                  </button>
                  <button
                    onClick={() => handleFeatureNotReady('Pengaturan')}
                    className="p-2.5 cursor-pointer text-gray-400 hover:bg-[#f8f9fa] hover:text-gray-700 rounded-full transition-colors"
                  >
                    <MoreVertical size={20} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                <input
                  type="text"
                  placeholder="Cari pesan atau nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#f8f9fa] border-none text-sm rounded-md py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary transition-all outline-none"
                />
              </div>
              <div className="pt-4 pb-4 border-b border-gray-100 shrink-0 bg-white flex gap-3">
                <button
                  onClick={() => setFilterMode(filterMode === 'favorite' ? 'all' : 'favorite')}
                  className={`flex justify-center cursor-pointer border items-center gap-2 w-full px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 group ${filterMode === 'favorite' ? 'bg-primary/10 border-primary/20 text-primary' : 'border-primary/20 text-primary/50 hover:text-primary hover:bg-gray-100'}`}
                >
                  <div className={`${filterMode === 'favorite' ? 'text-primary' : 'text-gray-500 group-hover:text-primary'} transition`}>
                    <Star size={16} className={filterMode === 'favorite' ? 'fill-primary' : ''} />
                  </div>
                  Favorit
                </button>

                <button
                  onClick={() => setFilterMode(filterMode === 'archived' ? 'all' : 'archived')}
                  className={`flex justify-center cursor-pointer border items-center gap-2 w-full px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 group ${filterMode === 'archived' ? 'bg-primary/10 border-primary/20 text-primary' : 'border-primary/20 text-primary/50 hover:text-primary hover:bg-gray-100'}`}
                >
                  <div className={`${filterMode === 'archived' ? 'text-primary' : 'text-gray-500 group-hover:text-primary'} transition`}>
                    <Archive size={16} />
                  </div>
                  Arsip
                </button>

                <button
                  onClick={() => handleFeatureNotReady('Grup')}
                  className={`flex justify-center cursor-pointer border items-center gap-2 w-full px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 group ${filterMode === 'archived' ? 'bg-primary/10 border-primary/20 text-primary' : 'border-primary/20 text-primary/50 hover:text-primary hover:bg-gray-100'}`}
                >
                  <div className={`${filterMode === 'archived' ? 'text-primary' : 'text-gray-500 group-hover:text-primary'} transition`}>
                    <UsersRound size={16} />
                  </div>
                  Grup
                </button>
              </div>

              <div className="flex items-center justify-between px-4 py-2 bg-gray-50/80 border-b border-gray-100 shrink-0">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Daftar Obrolan</span>
                <button
                  onClick={() => {
                      setIsSelectionMode(!isSelectionMode);
                      setSelectedContacts([]);
                  }}
                  className={`text-xs font-bold transition-colors cursor-pointer ${isSelectionMode ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {isSelectionMode ? 'Selesai' : 'Pilih Pesan'}
                </button>
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto px-3 pt-3 transition-all duration-300 custom-scrollbar ${isSelectionMode && selectedContacts.length > 0 ? 'pb-40' : 'pb-3'}`}>
              {filteredContacts.length === 0 ? (
                <div className="text-center text-gray-400 mt-10 text-sm">Tidak ada kontak ditemukan</div>
              ) : (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => isSelectionMode ? handleToggleSelect(contact.id) : handleSelectChat(contact)}
                    className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition-all mb-1 hover:bg-[#f8f9fa] ${
                      isSelectionMode && selectedContacts.includes(contact.id) 
                        ? 'bg-primary/10 border-primary/20 border' 
                        : activeChat?.id === contact.id && !isSelectionMode ? 'bg-primary/5 border border-transparent' : 'border border-transparent'
                    }`}
                  >
                    {isSelectionMode && (
                        <div className="shrink-0 mr-1 animate-in fade-in slide-in-from-left-2 duration-200">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                              selectedContacts.includes(contact.id) ? 'bg-primary border-primary text-white' : 'border-gray-300'
                            }`}>
                                {selectedContacts.includes(contact.id) && <Check size={14} strokeWidth={3} />}
                            </div>
                        </div>
                    )}
                    <div className="relative shrink-0">
                      <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                      {contact.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className={`text-sm font-bold truncate pr-2 ${activeChat?.id === contact.id ? 'text-primary' : 'text-gray-800'}`}>
                          {contact.name}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-medium text-gray-400">{contact.time}</span>
                          {!isSelectionMode && (contact.isFavorite || favoriteCount < MAX_FAVORITES) && (
                            <button
                              onClick={(e) => toggleFavorite(e, contact.id)}
                              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                                contact.isFavorite
                                  ? 'text-yellow-400 hover:bg-yellow-50'
                                  : 'text-gray-300 hover:bg-[#f8f9fa] hover:text-yellow-400'
                              }`}
                              title={contact.isFavorite ? 'Hapus dari favorit' : `Favoritkan (max ${MAX_FAVORITES})`}
                              aria-label={contact.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                            >
                              <Star size={14} className={contact.isFavorite ? 'fill-yellow-400' : ''} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 justify-between">
                        <p className={`text-xs truncate ${activeChat?.id === contact.id && contact.unread > 0 ? 'font-bold text-primary' : 'text-gray-500'}`}>
                          {contact.lastMessage || 'Tidak ada pesan'}
                        </p>

                        <div className="flex items-center gap-1">
                          {contact.unread > 0 && (
                            <div className="shrink-0 min-w-5 h-5 px-1 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                              {contact.unread}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

          {/* Action Overlay */}
          {isSelectionMode && selectedContacts.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_4px_30px_rgb(0,0,0,0.1)] border border-gray-100 p-3 z-20 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between text-sm px-1">
                <span className="font-bold text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-gray-100 shadow-sm">{selectedContacts.length} dipilih</span>
                <button 
                  onClick={() => {
                      if (selectedContacts.length === filteredContacts.length) {
                          setSelectedContacts([]);
                      } else {
                          setSelectedContacts(filteredContacts.map(c => c.id));
                      }
                  }} 
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  {selectedContacts.length === filteredContacts.length && filteredContacts.length > 0 ? 'Batal Pilih Semua' : 'Pilih Semua'}
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleBulkFavorite}
                  className="flex-1 cursor-pointer flex justify-center items-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200 shadow-sm"
                >
                  <Star size={14} className={allSelectedFavorited ? "fill-yellow-600" : ""} /> {allSelectedFavorited ? 'Batal' : 'Favorit'}
                </button>

                <button
                  onClick={handleBulkArchive}
                  className="flex-1 cursor-pointer flex justify-center items-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-sm"
                >
                  <Archive size={14} /> {allSelectedArchived ? 'Batal' : 'Arsip'}
                </button>

                <button
                  onClick={handleBulkDelete}
                  className="flex-1 cursor-pointer flex justify-center items-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-sm"
                >
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </div>
          )}

          </div>

          {/* KANAN: Ruang Obrolan */}
          <div className={`flex-1 flex-col bg-[#fdfdfd] relative ${!showChatArea ? 'hidden md:flex' : 'flex'}`}>
            {activeChat ? (
              <>
                <div className="h-[76px] px-4 md:px-6 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-10">
                  <div className="flex items-center gap-3 md:gap-4">
                    <button
                      onClick={() => setShowChatArea(false)}
                      className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>

                    <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <h2 className="text-sm font-bold text-gray-800 leading-tight">{activeChat.name}</h2>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {getRoleIcon(activeChat.type)}
                        <p className="text-[11px] font-medium text-gray-500">{activeChat.role}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {(activeChat.isFavorite || favoriteCount < MAX_FAVORITES) && (
                      <button
                        onClick={(e) => toggleFavorite(e, activeChat.id)}
                        className={`p-2.5 rounded-full transition-colors ${activeChat.isFavorite ? 'text-yellow-400 hover:bg-yellow-50' : 'text-gray-400 hover:bg-[#f8f9fa] hover:text-yellow-400'}`}
                        title={activeChat.isFavorite ? 'Hapus dari favorit' : `Favoritkan (max ${MAX_FAVORITES})`}
                        aria-label={activeChat.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                      >
                        <Star size={18} className={activeChat.isFavorite ? "fill-yellow-400" : ""} />
                      </button>
                    )}
                    <button
                      onClick={() => handleFeatureNotReady('Menu Obrolan')}
                      className="p-2.5 text-gray-400 hover:bg-[#f8f9fa] hover:text-gray-700 rounded-full transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 bg-white relative custom-scrollbar">
                  <div className="text-center mb-2">
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100/80 backdrop-blur px-3 py-1 rounded-full">
                      OBROLAN DIMULAI
                    </span>
                  </div>

                  {currentMessages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                      Kirim pesan untuk memulai obrolan
                    </div>
                  ) : (
                    currentMessages.map((msg) => {
                      const isMe = msg.sender === 'me';
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
                          <div
                            className={`max-w-[85%] md:max-w-[70%] rounded-[20px] relative group overflow-hidden ${
                              isMe
                                ? 'bg-primary text-white rounded-br-sm shadow-sm'
                                : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm'
                            } ${
                              // FIX: Gunakan p-1 untuk semua image/gif terlepas dari ada caption atau tidak
                              (msg.type === 'image' || msg.type === 'gif') ? 'p-1' : 'px-4 py-3'
                            }`}
                          >
                            {/* --- RENDER CONTENT --- */}
                            {(msg.type === 'image' || msg.type === 'gif') ? (
                              <div className="relative flex flex-col group/img">
                                <img
                                  src={msg.url}
                                  alt="content"
                                  onClick={() => setPreviewImage(msg)}
                                  className="w-64 sm:w-72 max-w-full max-h-72 object-cover block rounded-[16px] cursor-pointer hover:opacity-95 transition-opacity"
                                  title="Klik untuk memperbesar"
                                />

                                {/* Waktu di atas gambar jika tidak ada caption */}
                                {!msg.caption && (
                                  <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm flex items-center gap-1 text-[10px] text-white shadow-sm pointer-events-none">
                                    {msg.time}
                                    {isMe && <CheckCheck size={12} className="text-blue-300" />}
                                  </div>
                                )}

                                {/* FIX: Penyesuaian padding caption agar lebih rapat dan proporsional */}
                                {msg.caption && (
                                  <div className="px-2 pt-2 pb-0.5 flex flex-col">
                                    <p className="text-[13px] leading-relaxed break-words">{msg.caption}</p>
                                    <div className={`text-[10px] flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                      {msg.time}
                                      {isMe && <CheckCheck size={14} className="text-blue-300" />}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : msg.type === 'file' ? (
                              <>
                                <a 
                                  href={msg.url}
                                  download={msg.fileName || 'dokumen'}
                                  className={`flex items-center gap-3 p-3 rounded-xl mb-1 border hover:opacity-80 transition-opacity cursor-pointer text-left ${isMe ? 'bg-white/20 border-white/20 group-hover:bg-white/30' : 'bg-gray-50 border-gray-100 group-hover:bg-gray-100'}`}
                                  title="Unduh File"
                                >
                                  <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20 text-white' : 'bg-white shadow-sm text-primary'}`}>
                                    <Paperclip size={18} />
                                  </div>
                                  <div className="flex flex-col flex-1 min-w-0 pr-2">
                                    <span className="text-sm font-medium truncate max-w-[150px] md:max-w-xs">{msg.fileName}</span>
                                    <span className={`text-[10px] mt-0.5 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>Klik untuk unduh dokumen</span>
                                  </div>
                                  <Download size={18} className={`shrink-0 ${isMe ? 'text-white' : 'text-gray-400'}`} />
                                </a>
                                <div className="flex items-center justify-between gap-4 mt-1 px-1">
                                  {msg.caption ? <p className="text-[13px]">{msg.caption}</p> : <div />}
                                  <div className={`text-[10px] flex items-center gap-1 shrink-0 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                    {msg.time}
                                    {isMe && <CheckCheck size={14} className="text-blue-300" />}
                                  </div>
                                </div>
                              </>
                            ) : (
                              /* PESAN TEKS: Menggunakan flex untuk merapatkan waktu ke teks */
                              <div className="flex flex-wrap items-end justify-end gap-x-2 gap-y-0">
                                <p className="text-[13px] leading-relaxed flex-grow min-w-[50px]">{msg.text}</p>
                                <div className={`text-[10px] mb-[-2px] flex items-center gap-1 shrink-0 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                  {msg.time}
                                  {isMe && <CheckCheck size={14} className="text-blue-300" />}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 md:p-5 bg-white border-t border-gray-100 shrink-0 relative">

                  {/* Absolute pickers */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-[calc(100%+10px)] right-4 md:right-10 z-50 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <EmojiPicker onEmojiClick={onEmojiClick} searchDisabled />
                    </div>
                  )}

                  {showGifPicker && (
                    <TenorPicker onSelectGif={handleSendGif} onClose={() => setShowGifPicker(false)} />
                  )}

                  {/* Preview Attachment sebelum dikirim */}
                  {attachmentPreview && (
                    <div className="mb-4 p-3 bg-primary/10 rounded-2xl border border-primary/10 flex items-start justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-4">
                        {attachmentPreview.type === 'image' && (
                          <img src={attachmentPreview.url} className="w-16 h-16 object-cover rounded-xl shadow-sm border border-primary/10" alt="preview" />
                        )}
                        {attachmentPreview.type === 'gif' && (
                          <img src={attachmentPreview.url} className="w-16 h-16 object-cover rounded-xl shadow-sm border border-primary/10" alt="preview" />
                        )}
                        {attachmentPreview.type === 'file' && (
                          <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-primary/10 flex items-center justify-center text-primary">
                            <Paperclip size={24} />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800 truncate max-w-[200px] md:max-w-sm">{attachmentPreview.fileName}</span>
                          <span className="text-xs text-primary mt-0.5">Tambahkan pesan keterangan (opsional)...</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setAttachmentPreview(null)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-colors shadow-sm bg-gray-50/50 backdrop-blur"
                        title="Batal lampiran"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center max-w-4xl gap-1 mx-auto">
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="p-2 cursor-pointer rounded-full text-gray-400 hover:bg-[#f8f9fa] hover:text-primary transition-colors shrink-0"
                      title="Kirim Gambar"
                    >
                      <ImagePlus size={20} />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 cursor-pointer rounded-full text-gray-400 hover:bg-[#f8f9fa] hover:text-primary transition-colors shrink-0"
                      title="Kirim File"
                    >
                      <Paperclip size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setShowGifPicker(!showGifPicker);
                        setShowEmojiPicker(false);
                      }}
                      className={`p-2 cursor-pointer rounded-full transition-colors shrink-0 font-bold text-sm ${showGifPicker ? 'text-primary bg-primary/10' : 'text-gray-400 hover:bg-[#f8f9fa] hover:text-primary'}`}
                      title="Kirim GIF"
                    >
                      GIF
                    </button>
                    <button
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker);
                        setShowGifPicker(false);
                      }}
                      className={`p-2 cursor-pointer rounded-full transition-colors shrink-0 ${showEmojiPicker ? 'text-primary bg-primary/10' : 'text-gray-400 hover:bg-[#f8f9fa] hover:text-primary'}`}
                      title="Kirim Emoji"
                    >
                      <Smile size={20} />
                    </button>
                    <div className="flex-1 bg-[#f8f9fa] rounded-full border border-transparent focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all flex items-center pr-2 ml-1">
                      <input
                        type="text"
                        placeholder={attachmentPreview ? "Tambahkan caption..." : "Tulis pesan..."}
                        className="w-full bg-transparent text-sm py-3 px-4 focus:outline-none text-primary"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button
                        className={`p-2 cursor-pointer rounded-full transition-all shrink-0 ${messageInput.trim() || attachmentPreview
                          ? 'bg-primary text-white hover:bg-primary/90 shadow-md'
                          : 'bg-gray-200 text-gray-400'
                          }`}
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() && !attachmentPreview}
                      >
                        <SendHorizontal size={16} className={messageInput.trim() || attachmentPreview ? "ml-0.5" : ""} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                <MessageSquarePlus size={48} className="mb-4 text-gray-200 stroke-1" />
                <p>Pilih pesan untuk mulai mengobrol</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}