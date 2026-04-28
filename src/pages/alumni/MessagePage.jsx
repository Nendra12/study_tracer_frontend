import React, { useState, useRef, useEffect } from 'react';
import { Check, MessageSquarePlus, Trash2, X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import NewChatPane from '../../components/alumni/NewChatPane';
import SideBarSearchChat from '../../components/alumni/SideBarSearchChat';
import ChatMenuOptions from '../../components/alumni/ChatMenuOptions';
import GroupInfoModal from '../../components/alumni/GroupInfoModal';
import ImagePreviewModal from '../../components/alumni/message/ImagePreviewModal';
import { formatClockTime } from '../../components/alumni/message/dateUtils';
import ChatSidebar from '../../components/alumni/message/ChatSidebar';
import ChatHeader from '../../components/alumni/message/ChatHeader';
import MessageList from '../../components/alumni/message/MessageList';
import ChatInputArea from '../../components/alumni/message/ChatInputArea';
import { useAuth } from '../../context/AuthContext';
import { useMessaging, getAvatarUrl, getDisplayName, getLastMessagePreview, formatTime, getImageUrl } from '../../hooks/useMessaging';
import { alertConfirm, toastSuccess, toastWarning } from '../../utilitis/alert';

export default function MessagePage() {
  const { user } = useAuth();
  const currentUserId = user?.id_users || user?.id;
  const messaging = useMessaging(currentUserId);

  const confirmThen = async (message, action) => {
    const result = await alertConfirm(message);
    if (!result?.isConfirmed) return false;
    await action?.();
    return true;
  };

  const [showChatArea, setShowChatArea] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isAddingChat, setIsAddingChat] = useState(false);
  const [activeSidebarMenuId, setActiveSidebarMenuId] = useState(null);
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState(null);

  const [isSearchMessageOpen, setIsSearchMessageOpen] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isSavingGroupInfo, setIsSavingGroupInfo] = useState(false);

  const [isMessageSelectionMode, setIsMessageSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [activeMessageMenuId, setActiveMessageMenuId] = useState(null);
  const [replyingToMessage, setReplyingToMessage] = useState(null);

  const [typingUsers, setTypingUsers] = useState({});

  const messagesEndRef = useRef(null);
  const isAutoScrolling = useRef(false);

  // Fetch conversations on mount
  useEffect(() => { messaging.fetchConversations(); }, []);

  // Debounced search (skip initial mount — already handled by the effect above)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
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

  useEffect(() => {
    const t = setTimeout(() => scrollToBottom(), 0);
    return () => clearTimeout(t);
  }, [currentMessages, activeChat]);

  const handleSelectChat = (conv) => {
    messaging.selectConversation(conv);
    setShowChatArea(true);
    setIsGroupInfoOpen(false);
    setIsSearchMessageOpen(false);
    setMessageSearchQuery('');
    setIsChatMenuOpen(false);
    setIsMessageSelectionMode(false);
    setSelectedMessageIds([]);
    setActiveMessageMenuId(null);
    setReplyingToMessage(null);
  };

  const handleOpenGroupInfo = () => {
    setIsGroupInfoOpen(true);
    setIsChatMenuOpen(false);
  };

  const renderMessageStatus = (msg, isMe) => {
    if (!isMe) return null;

    let isRead = false;
    if (activeChat?.type === 'private') {
      const contactReadAt = activeChat.contact?.last_read_at;
      if (contactReadAt && new Date(msg.created_at) <= new Date(contactReadAt)) {
        isRead = true;
      }
    } else if (activeChat?.type === 'group') {
      const participants = activeChat.participants || [];
      const others = participants.filter(p => p.id_users !== currentUserId);
      isRead = others.some(p => p.last_read_at && new Date(msg.created_at) <= new Date(p.last_read_at));
    }

    if (isRead) {
      return <Check size={14} className="text-green-300" title="Sudah dibaca" />;
    }
    return <Check size={14} className="text-white/70" title="Terkirim" />;
  };


  const handleAddContact = (conversation) => {
    messaging.fetchConversations();
    messaging.selectConversation(conversation);
    setShowChatArea(true);
    setIsAddingChat(false);
    toastSuccess('Obrolan siap digunakan.');
  };

  const toggleFavorite = (e, convId) => {
    if (e) e.stopPropagation();
    messaging.togglePin(convId);
  };

  const handleDeleteChat = async (convId) => {
    const targetId = convId || activeChat?.id_conversation;
    if (!targetId) return;
    const ok = await confirmThen('Chat ini akan dihapus. Lanjutkan?', async () => {
      const success = await messaging.deleteConversation(targetId);
      if (success && activeChat?.id_conversation === targetId) setShowChatArea(false);
    });
    if (!ok) return;
  };

  const handleDeleteSelectedChats = async () => {
    if (!selectedContacts?.length) return;
    const ok = await confirmThen(`Hapus ${selectedContacts.length} chat yang dipilih?`, async () => {
      for (const id of selectedContacts) {
        await messaging.deleteConversation(id);
      }
    });
    if (!ok) return;
    setIsSelectionMode(false);
    setSelectedContacts([]);
  };

  const handleDeleteMessage = async (msgId) => {
    if (!msgId) return;
    await confirmThen('Pesan ini akan dihapus. Lanjutkan?', async () => {
      await messaging.deleteMessage(msgId);
    });
  };

  const handleDeleteSelectedMessages = async () => {
    if (!selectedMessageIds?.length) return;
    const ok = await confirmThen(`Hapus ${selectedMessageIds.length} pesan secara permanen?`, async () => {
      for (const id of selectedMessageIds) {
        await messaging.deleteMessage(id);
      }
    });
    if (!ok) return;
    setIsMessageSelectionMode(false);
    setSelectedMessageIds([]);
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
    if (filterMode === 'unread') return matchSearch && (c.unread_count || 0) > 0 && !c.settings?.is_archived;
    if (filterMode === 'group') return matchSearch && c.type === 'group' && !c.settings?.is_archived;
    return matchSearch && !c.settings?.is_archived;
  });

  const favoriteCount = messaging.conversations.filter(c => c.settings?.is_pinned).length;
  const unreadCount = messaging.conversations.filter(c => (c.unread_count || 0) > 0 && !c.settings?.is_archived).length;
  const archivedCount = messaging.conversations.filter(c => c.settings?.is_archived).length;
  const groupCount = messaging.conversations.filter(c => c.type === 'group' && !c.settings?.is_archived).length;

  const isAllSelectedChats = selectedContacts.length > 0 && selectedContacts.length === filteredContacts.length;
  const handleToggleSelectAllChats = () => {
    if (isAllSelectedChats) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id_conversation));
    }
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

  const handleSubmitGroupInfo = async ({ group_name, avatar }) => {
    const convId = activeChat?.id_conversation;
    if (!convId) return;

    setIsSavingGroupInfo(true);
    try {
      await messaging.updateGroupConversation(convId, { group_name, avatar });
      await messaging.refreshConversationDetail?.(convId);
      setIsGroupInfoOpen(false);
    } catch (err) {
      console.error('Failed to update group info:', err);
    } finally {
      setIsSavingGroupInfo(false);
    }
  };


  return (
    <div className="h-screen bg-[#f8f9fa] font-sans flex flex-col selection:bg-primary/20 overflow-hidden">
      <Toaster position="top-right" />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        previewImage={previewImage}
        onClose={() => setPreviewImage(null)}
        getImageUrl={getImageUrl}
      />

      <main className="flex-1 min-h-0 w-full max-w-305 mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 pt-24 flex flex-col">
        <div className="flex-1 min-h-0 flex bg-white md:rounded-2xl md:shadow-xl md:border md:border-gray-100 overflow-hidden">

          <ChatSidebar
            showChatArea={showChatArea}
            onStartAddChat={() => {
              setIsAddingChat(true);
              setShowChatArea(true);
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            unreadCount={unreadCount}
            favoriteCount={favoriteCount}
            groupCount={groupCount}
            isSelectionMode={isSelectionMode}
            setIsSelectionMode={setIsSelectionMode}
            selectedContacts={selectedContacts}
            setSelectedContacts={setSelectedContacts}
            messaging={messaging}
            filteredContacts={filteredContacts}
            activeChat={activeChat}
            activeSidebarMenuId={activeSidebarMenuId}
            setActiveSidebarMenuId={setActiveSidebarMenuId}
            getDisplayName={getDisplayName}
            getAvatarUrl={getAvatarUrl}
            getLastMessagePreview={getLastMessagePreview}
            formatTime={formatTime}
            onSelectChat={handleSelectChat}
            onToggleSelect={handleToggleSelect}
            onOpenInfo={(contact) => {
              if (contact?.contact?.id_alumni) navigate(`/alumni/daftar-alumni/${contact.contact.id_alumni}`);
            }}
            onTogglePin={(contact) => toggleFavorite(null, contact.id_conversation)}
            onDeleteChat={handleDeleteChat}
            onDeleteSelectedChats={handleDeleteSelectedChats}
            onToggleSelectAll={handleToggleSelectAllChats}
            isAllSelected={isAllSelectedChats}
          />

          {/* KANAN: Ruang Obrolan */}
          <div className={`flex-1 flex flex-row bg-[#fdfdfd] relative ${!showChatArea ? 'hidden md:flex' : 'flex'}`}>
            {isAddingChat ? (
              <div className="flex-1 w-full relative h-full">
                <NewChatPane
                  onSelectContact={(conversation) => {
                    setIsAddingChat(false);
                    handleSelectChat(conversation);
                  }}
                  onCancel={() => {
                    setIsAddingChat(false);
                    if (!activeChat) setShowChatArea(false); // Back to list on mobile if no active chat
                  }}
                />
              </div>
            ) : activeChat ? (
              <>
                <div className="flex-1 flex flex-col min-w-0 relative">
                  <ChatHeader
                    activeChat={activeChat}
                    getAvatarUrl={getAvatarUrl}
                    getDisplayName={getDisplayName}
                    typingText={getTypingText()}
                    onBackMobile={() => setShowChatArea(false)}
                    isSearchMessageOpen={isSearchMessageOpen}
                    onToggleSearch={() => setIsSearchMessageOpen(!isSearchMessageOpen)}
                    isChatMenuOpen={isChatMenuOpen}
                    onToggleChatMenu={() => setIsChatMenuOpen(!isChatMenuOpen)}
                  >
                    {isChatMenuOpen && (
                      <ChatMenuOptions
                        isChatMenuOpen={isChatMenuOpen}
                        setIsChatMenuOpen={setIsChatMenuOpen}
                        setIsMessageSelectionMode={setIsMessageSelectionMode}
                        activeChat={activeChat}
                        onOpenGroupInfo={handleOpenGroupInfo}
                        onTogglePin={() => messaging.togglePin(activeChat.id_conversation)}
                        onToggleMute={() => messaging.toggleMute(activeChat.id_conversation)}
                        onDeleteChat={() => handleDeleteChat(activeChat.id_conversation)}
                        onLeaveGroup={() => confirmThen('Keluar dari grup ini?', () => messaging.leaveGroup(activeChat.id_conversation))}
                      />
                    )}
                  </ChatHeader>

                  <MessageList
                    messagingLoadingMessages={messaging.loadingMessages}
                    activeChat={activeChat}
                    currentUserId={currentUserId}
                    currentMessages={currentMessages}
                    highlightedMessageId={highlightedMessageId}
                    isMessageSelectionMode={isMessageSelectionMode}
                    selectedMessageIds={selectedMessageIds}
                    setSelectedMessageIds={setSelectedMessageIds}
                    activeMessageMenuId={activeMessageMenuId}
                    setActiveMessageMenuId={setActiveMessageMenuId}
                    onReply={(msg) => setReplyingToMessage(msg)}
                    onDeleteMessage={handleDeleteMessage}
                    onPreviewImage={(msg) => setPreviewImage(msg)}
                    scrollToMessage={scrollToMessage}
                    handleScrollMessages={handleScrollMessages}
                    messagesEndRef={messagesEndRef}
                    showScrollButton={showScrollButton}
                    scrollToBottom={scrollToBottom}
                    getImageUrl={getImageUrl}
                    formatClockTime={formatClockTime}
                    renderMessageStatus={renderMessageStatus}
                  />

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
                          onClick={handleDeleteSelectedMessages}
                          disabled={selectedMessageIds.length === 0}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer ${selectedMessageIds.length > 0 ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
                        >
                          <Trash2 size={16} /> Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ChatInputArea
                      messaging={messaging}
                      activeChat={activeChat}
                      currentUserId={currentUserId}
                      replyingToMessage={replyingToMessage}
                      setReplyingToMessage={setReplyingToMessage}
                    />
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

                <GroupInfoModal
                  isOpen={isGroupInfoOpen}
                  onClose={() => setIsGroupInfoOpen(false)}
                  conversation={activeChat}
                  onSubmit={handleSubmitGroupInfo}
                  saving={isSavingGroupInfo}
                />
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