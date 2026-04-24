import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Paperclip, MoreVertical, CheckCheck, ArrowLeft, Briefcase, GraduationCap, Building2, Plus, Star, Archive, MessageSquarePlus, EllipsisIcon, ImagePlus, Smile, Gift, SendHorizontal, X, Download, UsersRound, ListChecks, Trash2, Check, Pin, Info, Eraser, ChevronDown, Reply, Clock, CircleCheck, Ellipsis, Loader2, BellOff, LayoutGrid, MessageCircle } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
import NewChatModal from '../../components/alumni/NewChatModal';
import SideBarSearchChat from '../../components/alumni/SideBarSearchChat';
import ChatMenuOptions from '../../components/alumni/ChatMenuOptions';
import { useAuth } from '../../context/AuthContext';
import { useMessaging, getAvatarUrl, getDisplayName, getLastMessagePreview, formatTime, getImageUrl } from '../../hooks/useMessaging';


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
        <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>
      <input
        type="text"
        placeholder="Cari GIF..."
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
  const { user } = useAuth();
  const currentUserId = user?.id_users || user?.id;
  const messaging = useMessaging(currentUserId);

  const [messageInput, setMessageInput] = useState('');
  const [showChatArea, setShowChatArea] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSidebarMenuId, setActiveSidebarMenuId] = useState(null);
  const navigate = useNavigate();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [isSearchMessageOpen, setIsSearchMessageOpen] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);

  const [isMessageSelectionMode, setIsMessageSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [activeMessageMenuId, setActiveMessageMenuId] = useState(null);
  const [replyingToMessage, setReplyingToMessage] = useState(null);

  const [typingUsers, setTypingUsers] = useState({});

  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const isAutoScrolling = useRef(false);

  // Fetch conversations on mount
  useEffect(() => { messaging.fetchConversations(); }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => messaging.fetchConversations(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Listen for realtime events
  useEffect(() => {
    const onMsg = (e) => messaging.handleRealtimeMessage(e.detail);
    const onDel = (e) => messaging.handleRealtimeDelete(e.detail);
    const onRead = (e) => messaging.handleRealtimeRead(e.detail);
    const onTyping = (e) => {
      const d = e.detail;
      if (d?.user_id === currentUserId) return;
      const key = `${d?.conversation_id}_${d?.user_id}`;
      if (d?.is_typing) {
        setTypingUsers(prev => ({ ...prev, [key]: d.user_name || 'User' }));
        setTimeout(() => setTypingUsers(prev => { const n = { ...prev }; delete n[key]; return n; }), 3000);
      } else {
        setTypingUsers(prev => { const n = { ...prev }; delete n[key]; return n; });
      }
    };
    window.addEventListener('reverb:message.sent', onMsg);
    window.addEventListener('reverb:message.deleted', onDel);
    window.addEventListener('reverb:message.read', onRead);
    window.addEventListener('reverb:typing.indicator', onTyping);
    return () => {
      window.removeEventListener('reverb:message.sent', onMsg);
      window.removeEventListener('reverb:message.deleted', onDel);
      window.removeEventListener('reverb:message.read', onRead);
      window.removeEventListener('reverb:typing.indicator', onTyping);
    };
  }, [messaging.handleRealtimeMessage, messaging.handleRealtimeDelete, messaging.handleRealtimeRead, currentUserId]);

  const activeChat = messaging.activeConversation;
  const currentMessages = messaging.messages;

  const scrollToBottom = () => {
    isAutoScrolling.current = true;
    setShowScrollButton(false);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      isAutoScrolling.current = false;
    }, 800);
  };

  const handleScrollMessages = (e) => {
    if (isAutoScrolling.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight > 200) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  const scrollToMessage = (msgId) => {
    setHighlightedMessageId(msgId);
    setTimeout(() => {
      const element = document.getElementById(`message-${msgId}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    setTimeout(() => setHighlightedMessageId(null), 2500);
  };

  useEffect(() => { scrollToBottom(); }, [currentMessages, activeChat]);

  const handleSelectChat = (conv) => {
    messaging.selectConversation(conv);
    setShowChatArea(true);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    setAttachmentPreview(null);
    setIsSearchMessageOpen(false);
    setMessageSearchQuery('');
    setIsChatMenuOpen(false);
    setIsMessageSelectionMode(false);
    setSelectedMessageIds([]);
    setActiveMessageMenuId(null);
    setReplyingToMessage(null);
  };

  const renderMessageStatus = (msg, isMe) => {
    if (!isMe) return null;
    return <CircleCheck size={14} className="text-green-300 fill-green-300/20" />;
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !attachmentPreview) return;
    const convId = activeChat?.id_conversation;
    if (!convId) return;

    let data;
    if (attachmentPreview?.file) {
      data = new FormData();
      data.append('type', attachmentPreview.type);
      data.append('file', attachmentPreview.file);
      if (messageInput.trim()) data.append('body', messageInput.trim());
      if (replyingToMessage) data.append('reply_to_id', replyingToMessage.id_message);
    } else if (attachmentPreview?.type === 'gif') {
      data = { type: 'gif', gif_url: attachmentPreview.url, body: messageInput.trim() || undefined };
      if (replyingToMessage) data.reply_to_id = replyingToMessage.id_message;
    } else {
      data = { type: 'text', body: messageInput.trim() };
      if (replyingToMessage) data.reply_to_id = replyingToMessage.id_message;
    }

    setMessageInput('');
    setAttachmentPreview(null);
    setShowEmojiPicker(false);
    setReplyingToMessage(null);

    try {
      await messaging.sendMessage(convId, data);
    } catch { }
  };

  const handleSendAttachment = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachmentPreview({ type, fileName: file.name, url: event.target.result, file });
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleSendGif = (url) => {
    const convId = activeChat?.id_conversation;
    if (!convId) return;
    messaging.sendMessage(convId, { type: 'gif', gif_url: url }).catch(() => { });
    setShowGifPicker(false);
  };

  const handleAddContact = (conversation) => {
    messaging.fetchConversations();
    messaging.selectConversation(conversation);
    setShowChatArea(true);
    setIsModalOpen(false);
  };

  const toggleFavorite = (e, convId) => {
    if (e) e.stopPropagation();
    messaging.togglePin(convId);
  };

  const handleDeleteChat = (convId) => {
    const targetId = convId || activeChat?.id_conversation;
    if (!targetId) return;
    if (window.confirm('Hapus chat ini?')) {
      messaging.deleteConversation(targetId);
      if (activeChat?.id_conversation === targetId) setShowChatArea(false);
    }
  };

  const handleToggleSelect = (contactId) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const filteredContacts = messaging.conversations.filter(c => {
    const name = getDisplayName(c).toLowerCase();
    const matchSearch = name.includes(searchQuery.toLowerCase());
    if (filterMode === 'favorite') return matchSearch && c.settings?.is_pinned;
    if (filterMode === 'archived') return matchSearch && c.settings?.is_archived;
    return matchSearch && !c.settings?.is_archived;
  });

  const favoriteCount = messaging.conversations.filter(c => c.settings?.is_pinned).length;
  const unreadCount = messaging.conversations.filter(c => (c.unread_count || 0) > 0 && !c.settings?.is_archived).length;
  const archivedCount = messaging.conversations.filter(c => c.settings?.is_archived).length;

  const onEmojiClick = (emojiObject) => {
    setMessageInput(prev => prev + emojiObject.emoji);
  };

  const messageSearchResults = messageSearchQuery.trim() === ''
    ? []
    : currentMessages.filter(msg =>
      (msg.body && msg.body.toLowerCase().includes(messageSearchQuery.toLowerCase())) ||
      (msg.file_name && msg.file_name.toLowerCase().includes(messageSearchQuery.toLowerCase()))
    );

  const getTypingText = () => {
    if (!activeChat) return null;
    const names = Object.entries(typingUsers)
      .filter(([key]) => key.startsWith(`${activeChat.id_conversation}_`))
      .map(([, name]) => name);
    if (names.length === 0) return null;
    return `${names.join(', ')} sedang mengetik...`;
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
              href={getImageUrl(previewImage.file_url)}
              download={previewImage.file_name || 'image.png'}
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
            src={getImageUrl(previewImage.file_url)}
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
                    title
                  >
                    <MessageSquarePlus size={20} className="stroke-[2.5]" />
                  </button>
                  <button
                    onClick={() => toast('Fitur Pengaturan akan segera hadir!', { icon: '🚧' })}
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
              <div className="pt-4 pb-4 border-b border-gray-100 shrink-0 bg-white flex gap-2 overflow-x-auto custom-scrollbar px-1">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`relative flex-shrink-0 flex justify-center cursor-pointer border items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 group ${filterMode === 'all' ? 'bg-primary/10 border-primary/20 text-primary' : 'border-primary/20 text-primary/50 hover:text-primary hover:bg-gray-100'}`}
                >
                  <LayoutGrid size={14} />
                  Semua
                </button>
                <button
                  onClick={() => setFilterMode(filterMode === 'unread' ? 'all' : 'unread')}
                  className={`relative flex-shrink-0 flex justify-center cursor-pointer border items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 group ${filterMode === 'unread' ? 'bg-primary/10 border-primary/20 text-primary' : 'border-primary/20 text-primary/50 hover:text-primary hover:bg-gray-100'}`}
                >
                  <MessageCircle size={14} className={filterMode === 'unread' ? 'fill-primary/20' : ''} />
                  Belum dibaca
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setFilterMode(filterMode === 'favorite' ? 'all' : 'favorite')}
                  className={`relative flex-shrink-0 flex justify-center cursor-pointer border items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 group ${filterMode === 'favorite' ? 'bg-primary/10 border-primary/20 text-primary' : 'border-primary/20 text-primary/50 hover:text-primary hover:bg-gray-100'}`}
                >
                  <Pin size={14} className={filterMode === 'favorite' ? 'fill-primary' : ''} />
                  Disematkan
                  {favoriteCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                      {favoriteCount}
                    </span>
                  )}
                </button>


                <button
                  onClick={() => setFilterMode(filterMode === 'archived' ? 'all' : 'archived')}
                  className={`relative flex-shrink-0 flex justify-center cursor-pointer border items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 group ${filterMode === 'archived' ? 'bg-primary/10 border-primary/20 text-primary' : 'border-primary/20 text-primary/50 hover:text-primary hover:bg-gray-100'}`}
                >
                  <Archive size={14} />
                  Arsip
                  {archivedCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                      {archivedCount}
                    </span>
                  )}
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
              {messaging.loadingConversations ? (
                <div className="flex flex-col gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3.5 p-3 rounded-2xl">
                      <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0 animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center text-gray-400 mt-10 text-sm">Tidak ada kontak ditemukan</div>
              ) : (
                filteredContacts.map((contact) => {
                  const cId = contact.id_conversation;
                  const cName = getDisplayName(contact);
                  const cAvatar = getAvatarUrl(contact);
                  const isPinned = contact.settings?.is_pinned;
                  const isActive = activeChat?.id_conversation === cId;
                  return (
                    <button
                      key={cId}
                      onClick={() => isSelectionMode ? handleToggleSelect(cId) : handleSelectChat(contact)}
                      className={`w-full cursor-pointer flex items-center gap-3.5 p-3 rounded-2xl text-left group transition-all mb-1 hover:bg-[#f8f9fa] ${isSelectionMode && selectedContacts.includes(cId)
                        ? 'bg-indigo-50 border-indigo-200 border'
                        : isActive && !isSelectionMode ? 'bg-indigo-50/60 border border-transparent' : 'border border-transparent'
                        }`}
                    >
                      {isSelectionMode && (
                        <div className="shrink-0 mr-1 animate-in fade-in slide-in-from-left-2 duration-200">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${selectedContacts.includes(cId) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300'
                            }`}>
                            {selectedContacts.includes(cId) && <Check size={14} strokeWidth={3} />}
                          </div>
                        </div>
                      )}
                      <div className="relative shrink-0">
                        <img src={cAvatar} alt={cName} className="w-12 h-12 rounded-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className={`text-sm mb-1.5 font-bold truncate pr-2 ${isActive ? 'text-primary' : 'text-gray-800'}`}>
                            {cName}
                          </h3>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[11px] font-medium text-gray-400 ${activeSidebarMenuId === cId ? 'hidden' : 'group-hover:hidden'}`}>{formatTime(contact.last_message?.created_at || contact.created_at)}</span>
                            <div className={`relative ${activeSidebarMenuId === cId ? 'block' : 'group-hover:block hidden'}`}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSidebarMenuId(activeSidebarMenuId === cId ? null : cId);
                                }}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-primary cursor-pointer"
                              >
                                <Ellipsis size={16} />
                              </button>

                              {activeSidebarMenuId === cId && (
                                <>
                                  <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setActiveSidebarMenuId(null); }} />
                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    {contact.type === 'private' && contact.contact?.id_alumni && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/alumni/daftar-alumni/${contact.contact.id_alumni}`); setActiveSidebarMenuId(null); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer"
                                      >
                                        <Info size={16} /> Info alumni
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); toggleFavorite(e, cId); setActiveSidebarMenuId(null); }}
                                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer"
                                    >
                                      <Pin size={16} className={isPinned ? "fill-primary text-primary" : ""} /> {isPinned ? 'Batal Sematkan' : 'Sematkan chat'}
                                    </button>

                                    <div className="h-px bg-gray-100 my-1.5 mx-3"></div>

                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteChat(cId); setActiveSidebarMenuId(null); }}
                                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer font-medium"
                                    >
                                      <Trash2 size={16} /> Hapus chat
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                            {!isSelectionMode && isPinned && (
                              <button
                                onClick={(e) => toggleFavorite(e, cId)}
                                className="p-1.5 rounded-full transition-colors cursor-pointer text-primary"
                                title="Disematkan"
                              >
                                <Pin size={14} className='text-primary fill-primary' />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 justify-between">
                          <p className={`text-xs truncate ${isActive && (contact.unread_count || 0) > 0 ? 'font-bold text-primary' : 'text-gray-500'}`}>
                            {getLastMessagePreview(contact) || 'Tidak ada pesan'}
                          </p>

                          <div className="flex items-center gap-1">
                            {(contact.unread_count || 0) > 0 && (
                              <div className="shrink-0 min-w-5 h-5 px-1 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                                {contact.unread_count}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
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
                        setSelectedContacts(filteredContacts.map(c => c.id_conversation));
                      }
                    }}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    {selectedContacts.length === filteredContacts.length && filteredContacts.length > 0 ? 'Batal Pilih Semua' : 'Pilih Semua'}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      selectedContacts.forEach(id => messaging.deleteConversation(id));
                      setIsSelectionMode(false);
                      setSelectedContacts([]);
                    }}
                    className="flex-1 cursor-pointer flex justify-center items-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-sm"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* KANAN: Ruang Obrolan */}
          <div className={`flex-1 flex flex-row bg-[#fdfdfd] relative ${!showChatArea ? 'hidden md:flex' : 'flex'}`}>
            {activeChat ? (
              <>
                <div className="flex-1 flex flex-col min-w-0 relative">
                  <div className="h-[76px] px-4 md:px-6 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-3 md:gap-4">
                      <button
                        onClick={() => setShowChatArea(false)}
                        className="md:hidden cursor-pointer p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ArrowLeft size={20} />
                      </button>

                      <img src={getAvatarUrl(activeChat)} alt={getDisplayName(activeChat)} className="w-10 h-10 rounded-full" />
                      <div>
                        <h2 className="text-sm font-bold text-gray-800 leading-tight">{getDisplayName(activeChat)}</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {getTypingText() ? (
                            <p className="text-[11px] font-medium text-green-600 italic">{getTypingText()}</p>
                          ) : activeChat.type === 'group' ? (
                            <p className="text-[11px] font-medium text-gray-500">{activeChat.participants?.length || 0} anggota</p>
                          ) : (
                            <p className="text-[11px] font-medium text-gray-500">{activeChat.contact?.jurusan || 'Alumni'}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIsSearchMessageOpen(!isSearchMessageOpen)}
                        className={`p-2.5 cursor-pointer rounded-full transition-colors ${isSearchMessageOpen ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-[#f8f9fa] hover:text-gray-700'}`}
                        title="Cari Pesan"
                      >
                        <Search size={18} />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}
                          className={`p-2.5 cursor-pointer rounded-full transition-colors ${isChatMenuOpen ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-[#f8f9fa] hover:text-gray-700'}`}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {isChatMenuOpen && (
                          <ChatMenuOptions
                            isChatMenuOpen={isChatMenuOpen}
                            setIsChatMenuOpen={setIsChatMenuOpen}
                            setIsMessageSelectionMode={setIsMessageSelectionMode}
                            activeChat={activeChat}
                            onTogglePin={() => messaging.togglePin(activeChat.id_conversation)}
                            onToggleMute={() => messaging.toggleMute(activeChat.id_conversation)}
                            onDeleteChat={() => handleDeleteChat(activeChat.id_conversation)}
                            onLeaveGroup={() => messaging.leaveGroup(activeChat.id_conversation)}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div 
                    className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 bg-white relative custom-scrollbar"
                    onScroll={handleScrollMessages}
                  >
                    <div className="text-center mb-2">
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100/80 backdrop-blur px-3 py-1 rounded-full">
                        OBROLAN DIMULAI
                      </span>
                    </div>

                    {messaging.loadingMessages ? (
                      <div className="flex-1 flex flex-col gap-4 py-4 w-full">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={`flex w-full gap-2 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <div className={`w-2/3 md:w-1/2 h-16 rounded-2xl bg-gray-200 animate-pulse ${i % 2 === 0 ? 'rounded-br-sm' : 'rounded-bl-sm'}`}></div>
                          </div>
                        ))}
                      </div>
                    ) : currentMessages.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                        Kirim pesan untuk memulai obrolan
                      </div>
                    ) : (
                      currentMessages.map((msg) => {
                        if (msg.is_deleted) return null;
                        const isMe = msg.sender?.id_users === currentUserId;
                        const isHighlighted = highlightedMessageId === msg.id_message;
                        const isSelected = selectedMessageIds.includes(msg.id_message);
                        return (
                          <div
                            key={msg.id_message}
                            id={`message-${msg.id_message}`}
                            onClick={() => {
                              if (isMessageSelectionMode) {
                                if (isSelected) {
                                  setSelectedMessageIds(selectedMessageIds.filter(id => id !== msg.id_message));
                                } else {
                                  setSelectedMessageIds([...selectedMessageIds, msg.id_message]);
                                }
                              }
                            }}
                            className={`flex items-center w-full mb-4 transition-all duration-700 rounded-2xl ${isHighlighted ? 'ring-4 ring-primary/40 bg-primary/10 p-2 -m-2 z-10' : ''} ${isMessageSelectionMode ? 'cursor-pointer hover:bg-gray-50 p-2 -mx-2' : ''}`}
                          >
                            {isMessageSelectionMode && (
                              <div className="shrink-0 mr-3 flex items-center animate-in fade-in slide-in-from-left-2 duration-200">
                                <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
                                  {isSelected && <Check size={14} strokeWidth={3} />}
                                </div>
                              </div>
                            )}
                            <div className={`flex flex-1 ${isMe ? 'justify-end' : 'justify-start'} min-w-0 group/msg`}>

                              <div
                                className={`max-w-[85%] md:max-w-[70%] rounded-[20px] relative ${isMe
                                  ? 'bg-primary text-white rounded-br-sm shadow-md shadow-indigo-200/50'
                                  : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm'
                                  } ${
                                  // FIX: Gunakan p-1 untuk semua image/gif terlepas dari ada caption atau tidak
                                  (msg.type === 'image' || msg.type === 'gif') ? 'p-1' : 'pl-4 pr-7 py-3'
                                  }`}
                              >
                                {/* Menu Trigger inside the bubble (Absolutely positioned at top-right) */}
                                <div className={`absolute top-1 right-1 opacity-0 group-hover/msg:opacity-100 transition-opacity flex flex-col items-end justify-start z-20`}>
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMessageMenuId(activeMessageMenuId === msg.id_message ? null : msg.id_message);
                                      }}
                                      className={`p-1 rounded-full transition-colors cursor-pointer backdrop-blur-sm ${isMe ? 'text-white/90 hover:bg-black/10' : 'text-gray-500 hover:bg-gray-100'}`}
                                    >
                                      <ChevronDown size={18} />
                                    </button>

                                    {activeMessageMenuId === msg.id_message && (
                                      <>
                                        <div className="fixed inset-0 z-30 cursor-default" onClick={(e) => { e.stopPropagation(); setActiveMessageMenuId(null); }} />
                                        <div className={`absolute top-full mt-1 right-0 w-36 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.1)] border border-gray-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-200 text-gray-700`}>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setReplyingToMessage(msg);
                                              setActiveMessageMenuId(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer"
                                          >
                                            <Reply size={14} /> Balas
                                          </button>
                                          {isMe && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMessageMenuId(null);
                                                if (window.confirm('Hapus pesan ini?')) {
                                                  messaging.deleteMessage(msg.id_message);
                                                }
                                              }}
                                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer"
                                            >
                                              <Trash2 size={14} /> Hapus
                                            </button>
                                          )}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* --- RENDER CONTENT --- */}
                                {msg.reply_to && (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      scrollToMessage(msg.reply_to.id_message);
                                    }}
                                    className={`mb-1.5 p-2 rounded-lg border-l-4 cursor-pointer text-xs transition-colors ${isMe
                                        ? 'bg-white/10 border-blue-200 hover:bg-white/20'
                                        : 'bg-gray-100 border-primary hover:bg-gray-200'
                                      }`}
                                  >
                                    <div className="flex items-center gap-1.5 mb-1 font-semibold">
                                      {msg.reply_to.sender?.nama_alumni || 'User'}
                                    </div>
                                    <div className="truncate opacity-80 max-w-[200px] md:max-w-[300px]">
                                      {msg.reply_to.type === 'image' || msg.reply_to.type === 'gif' ? (
                                        <span className="flex items-center gap-1"><ImagePlus size={12} /> Foto</span>
                                      ) : msg.reply_to.type === 'file' ? (
                                        <span className="flex items-center gap-1"><Paperclip size={12} /> File</span>
                                      ) : (
                                        msg.reply_to.body
                                      )}
                                    </div>
                                  </div>
                                )}

                                {(msg.type === 'image' || msg.type === 'gif') ? (
                                  <div className="relative flex flex-col group/img">
                                    <img
                                      src={getImageUrl(msg.file_url)}
                                      alt="content"
                                      onClick={() => setPreviewImage(msg)}
                                      className="w-64 sm:w-72 max-w-full max-h-72 object-cover block rounded-[16px] cursor-pointer hover:opacity-95 transition-opacity"
                                      title="Klik untuk memperbesar"
                                    />

                                    {!msg.body && (
                                      <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm flex items-center gap-1 text-[10px] text-white shadow-sm pointer-events-none z-10">
                                        {formatTime(msg.created_at)}
                                        {renderMessageStatus(msg, isMe)}
                                      </div>
                                    )}

                                    {msg.body && (
                                      <div className="px-2 pt-2 pb-0.5 flex flex-col">
                                        <p className="text-[13px] leading-relaxed break-words">{msg.body}</p>
                                        <div className={`text-[10px] flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                          {formatTime(msg.created_at)}
                                          {renderMessageStatus(msg, isMe)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : msg.type === 'file' ? (
                                  <>
                                    <a
                                      href={getImageUrl(msg.file_url)}
                                      download={msg.file_name || 'dokumen'}
                                      className={`flex items-center gap-3 p-3 rounded-xl mb-1 border hover:opacity-80 transition-opacity cursor-pointer text-left ${isMe ? 'bg-white/20 border-white/20 group-hover:bg-white/30' : 'bg-gray-50 border-gray-100 group-hover:bg-gray-100'}`}
                                      title="Unduh File"
                                    >
                                      <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20 text-white' : 'bg-white shadow-sm text-primary'}`}>
                                        <Paperclip size={18} />
                                      </div>
                                      <div className="flex flex-col flex-1 min-w-0 pr-2">
                                        <span className="text-sm font-medium truncate max-w-[150px] md:max-w-xs">{msg.file_name}</span>
                                        <span className={`text-[10px] mt-0.5 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>Klik untuk unduh dokumen</span>
                                      </div>
                                      <Download size={18} className={`shrink-0 ${isMe ? 'text-white' : 'text-gray-400'}`} />
                                    </a>
                                    <div className="flex items-center justify-between gap-4 mt-1 px-1">
                                      {msg.body ? <p className="text-[13px]">{msg.body}</p> : <div />}
                                      <div className={`text-[10px] flex items-center gap-1 shrink-0 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                        {formatTime(msg.created_at)}
                                        {renderMessageStatus(msg, isMe)}
                                      </div>
                                    </div>
                                  </>
                                ) : msg.type === 'system' ? (
                                  <div className="w-full text-center">
                                    <span className="text-[11px] text-gray-400 bg-gray-100/80 px-3 py-1 rounded-full">{msg.body}</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap items-end justify-end gap-x-2 gap-y-0 relative z-0">
                                    <p className="text-[13px] leading-relaxed flex-grow min-w-[50px]">{msg.body}</p>
                                    <div className={`text-[10px] mb-[-2px] flex items-center gap-1 shrink-0 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                      {formatTime(msg.created_at)}
                                      {renderMessageStatus(msg, isMe)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {showScrollButton && (
                    <button
                      onClick={scrollToBottom}
                      className="absolute bottom-20 md:bottom-[88px] right-6 p-2.5 md:p-3 bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.15)] rounded-full text-primary hover:bg-gray-50 transition-all z-20 animate-in fade-in zoom-in slide-in-from-bottom-5 cursor-pointer"
                      title="Ke pesan terbaru"
                    >
                      <ChevronDown size={20} className="stroke-[2.5]" />
                    </button>
                  )}

                  {isMessageSelectionMode ? (
                    <div className="p-4 md:p-5 bg-white border-t border-gray-100 shrink-0 flex items-center justify-between shadow-[0_-4px_20px_rgb(0,0,0,0.05)] z-20">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {
                            setIsMessageSelectionMode(false);
                            setSelectedMessageIds([]);
                          }}
                          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        >
                          <X size={20} />
                        </button>
                        <span className="font-bold text-gray-800">{selectedMessageIds.length} dipilih</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (selectedMessageIds.length > 0) {
                              if (window.confirm(`Hapus ${selectedMessageIds.length} pesan secara permanen?`)) {
                                for (const id of selectedMessageIds) {
                                  await messaging.deleteMessage(id);
                                }
                                setIsMessageSelectionMode(false);
                                setSelectedMessageIds([]);
                              }
                            }
                          }}
                          disabled={selectedMessageIds.length === 0}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer ${selectedMessageIds.length > 0 ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
                        >
                          <Trash2 size={16} /> Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
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

                      {/* Preview Replying Message */}
                      {replyingToMessage && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-2xl border-l-4 border-l-primary border-y border-r border-gray-100 flex items-start justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2">
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="text-sm font-bold text-primary mb-0.5">
                              Membalas {replyingToMessage.sender?.id_users === currentUserId ? 'Anda' : (replyingToMessage.sender?.nama_alumni || 'User')}
                            </span>
                            <span className="text-xs text-gray-500 truncate max-w-[200px] md:max-w-sm">
                              {replyingToMessage.type === 'image' || replyingToMessage.type === 'gif' ? (
                                <span className="flex items-center gap-1"><ImagePlus size={12} /> Foto</span>
                              ) : replyingToMessage.type === 'file' ? (
                                <span className="flex items-center gap-1"><Paperclip size={12} /> {replyingToMessage.file_name}</span>
                              ) : (
                                replyingToMessage.body
                              )}
                            </span>
                          </div>
                          <button
                            onClick={() => setReplyingToMessage(null)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-200 rounded-full transition-colors"
                            title="Batal membalas"
                          >
                            <X size={18} />
                          </button>
                        </div>
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

                      <div className="flex items-center max-w-4xl gap-1 mx-auto relative">
                        {/* Mobile Plus Button */}
                        <div className="relative md:hidden shrink-0">
                          <button
                            onClick={() => setShowAttachments(!showAttachments)}
                            className={`p-2 cursor-pointer rounded-full transition-colors ${showAttachments ? 'bg-primary text-white' : 'text-gray-400 hover:bg-[#f8f9fa] hover:text-primary'}`}
                          >
                            <Plus size={20} className={showAttachments ? "rotate-45 transition-transform" : "transition-transform"} />
                          </button>

                          {showAttachments && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex flex-col gap-2 z-50 animate-in fade-in zoom-in-95">
                              <button
                                onClick={() => { imageInputRef.current?.click(); setShowAttachments(false); }}
                                className="p-3 cursor-pointer rounded-xl bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary transition-colors flex justify-center"
                                title="Kirim Gambar"
                              >
                                <ImagePlus size={20} />
                              </button>
                              <button
                                onClick={() => { fileInputRef.current?.click(); setShowAttachments(false); }}
                                className="p-3 cursor-pointer rounded-xl bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary transition-colors flex justify-center"
                                title="Kirim File"
                              >
                                <Paperclip size={20} />
                              </button>
                              <button
                                onClick={() => {
                                  setShowGifPicker(!showGifPicker);
                                  setShowEmojiPicker(false);
                                  setShowAttachments(false);
                                }}
                                className={`p-3 cursor-pointer rounded-xl transition-colors font-bold text-sm flex justify-center ${showGifPicker ? 'text-primary bg-primary/10' : 'bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary'}`}
                                title="Kirim GIF"
                              >
                                GIF
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Desktop Inline Icons */}
                        <div className="hidden md:flex items-center gap-1 shrink-0">
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
                        </div>

                        <button
                          onClick={() => {
                            setShowEmojiPicker(!showEmojiPicker);
                            setShowGifPicker(false);
                            setShowAttachments(false);
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
                            onChange={(e) => {
                              setMessageInput(e.target.value);
                              if (activeChat?.id_conversation) messaging.handleTypingInput(activeChat.id_conversation);
                            }}
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
                  )}
                </div>

                {/* Sidebar Search Messages */}
                {isSearchMessageOpen && (
                  <SideBarSearchChat
                    messageSearchQuery={messageSearchQuery}
                    setMessageSearchQuery={setMessageSearchQuery}
                    messageSearchResults={messageSearchResults}
                    scrollToMessage={scrollToMessage}
                    activeChat={activeChat}
                    setIsSearchMessageOpen={setIsSearchMessageOpen}
                    currentUserId={currentUserId}
                  />
                )}
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