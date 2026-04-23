import { useState, useCallback, useRef } from 'react';
import { alumniApi } from '../api/alumni';
import { STORAGE_BASE_URL } from '../api/axios';
import toast from 'react-hot-toast';

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

export function getAvatarUrl(conversation) {
  if (conversation?.type === 'group') {
    const name = conversation.group_name || 'Grup';
    return conversation.group_avatar
      ? getImageUrl(conversation.group_avatar)
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e0e7ff&color=4f46e5`;
  }
  const foto = getImageUrl(conversation?.contact?.foto);
  const name = conversation?.contact?.nama_alumni || 'User';
  return foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e0e7ff&color=4f46e5`;
}

export function getDisplayName(conversation) {
  if (conversation?.type === 'group') return conversation.group_name || 'Grup';
  return conversation?.contact?.nama_alumni || 'User';
}

export function getLastMessagePreview(conv) {
  const lm = conv?.last_message;
  if (!lm) return '';
  const prefix = conv.type === 'group' ? `${lm.sender?.nama_alumni || 'User'}: ` : '';
  if (lm.type === 'image') return prefix + '🖼️ Foto';
  if (lm.type === 'file') return prefix + '📎 ' + (lm.file_name || 'File');
  if (lm.type === 'gif') return prefix + '🎬 GIF';
  if (lm.type === 'system') return lm.body || '';
  return prefix + (lm.body || '');
}

export function formatTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 172800000) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function useMessaging(currentUserId) {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [msgPagination, setMsgPagination] = useState({ currentPage: 1, lastPage: 1 });
  const [sending, setSending] = useState(false);
  const typingTimerRef = useRef(null);

  const fetchConversations = useCallback(async (search = '') => {
    setLoadingConversations(true);
    try {
      const res = await alumniApi.getConversations({ search: search || undefined, per_page: 50 });
      const d = res.data?.data;
      setConversations(d?.data || d || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const fetchMessages = useCallback(async (convId, page = 1, append = false) => {
    setLoadingMessages(true);
    try {
      const res = await alumniApi.getMessages(convId, { per_page: 30, page });
      const d = res.data?.data;
      const newMsgs = (d?.data || d || []).reverse();
      setMessages(prev => append ? [...newMsgs, ...prev] : newMsgs);
      setMsgPagination({ currentPage: d?.current_page || 1, lastPage: d?.last_page || 1 });
      // Mark as read
      alumniApi.markConversationAsRead(convId).catch(() => {});
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const selectConversation = useCallback(async (conv) => {
    setActiveConversation(conv);
    setMessages([]);
    await fetchMessages(conv.id_conversation);
    // Update unread locally
    setConversations(prev => prev.map(c =>
      c.id_conversation === conv.id_conversation ? { ...c, unread_count: 0 } : c
    ));
  }, [fetchMessages]);

  const sendMessage = useCallback(async (convId, data) => {
    setSending(true);
    try {
      const res = await alumniApi.sendMessage(convId, data);
      const msg = res.data?.data;
      if (msg) {
        setMessages(prev => [...prev, msg]);
        // Update conversation list
        setConversations(prev => {
          const updated = prev.map(c => {
            if (c.id_conversation === convId) {
              return {
                ...c,
                last_message: {
                  id_message: msg.id_message,
                  type: msg.type,
                  body: msg.body,
                  file_name: msg.file_name,
                  created_at: msg.created_at,
                  sender: msg.sender,
                },
              };
            }
            return c;
          });
          return updated.sort((a, b) => {
            const aPin = a.settings?.is_pinned ? 1 : 0;
            const bPin = b.settings?.is_pinned ? 1 : 0;
            if (aPin !== bPin) return bPin - aPin;
            const aTime = a.last_message?.created_at || a.created_at || '';
            const bTime = b.last_message?.created_at || b.created_at || '';
            return bTime.localeCompare(aTime);
          });
        });
      }
      return msg;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim pesan');
      throw err;
    } finally {
      setSending(false);
    }
  }, []);

  const deleteMessage = useCallback(async (msgId) => {
    try {
      await alumniApi.deleteMessage(msgId);
      setMessages(prev => prev.filter(m => m.id_message !== msgId));
      toast.success('Pesan dihapus');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus pesan');
    }
  }, []);

  const togglePin = useCallback(async (convId) => {
    try {
      const res = await alumniApi.togglePinConversation(convId);
      const isPinned = res.data?.data?.is_pinned;
      setConversations(prev => prev.map(c =>
        c.id_conversation === convId
          ? { ...c, settings: { ...c.settings, is_pinned: isPinned } }
          : c
      ));
      if (activeConversation?.id_conversation === convId) {
        setActiveConversation(prev => ({ ...prev, settings: { ...prev.settings, is_pinned: isPinned } }));
      }
      toast.success(isPinned ? 'Disematkan' : 'Sematan dihapus');
    } catch (err) {
      toast.error('Gagal mengubah pin');
    }
  }, [activeConversation]);

  const toggleMute = useCallback(async (convId) => {
    try {
      const res = await alumniApi.toggleMuteConversation(convId);
      const isMuted = res.data?.data?.is_muted;
      setConversations(prev => prev.map(c =>
        c.id_conversation === convId
          ? { ...c, settings: { ...c.settings, is_muted: isMuted } }
          : c
      ));
      if (activeConversation?.id_conversation === convId) {
        setActiveConversation(prev => ({ ...prev, settings: { ...prev.settings, is_muted: isMuted } }));
      }
      toast.success(isMuted ? 'Notifikasi dimatikan' : 'Notifikasi diaktifkan');
    } catch (err) {
      toast.error('Gagal mengubah notifikasi');
    }
  }, [activeConversation]);

  const deleteConversation = useCallback(async (convId) => {
    try {
      await alumniApi.deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.id_conversation !== convId));
      if (activeConversation?.id_conversation === convId) {
        setActiveConversation(null);
        setMessages([]);
      }
      toast.success('Percakapan dihapus');
    } catch (err) {
      toast.error('Gagal menghapus');
    }
  }, [activeConversation]);

  const leaveGroup = useCallback(async (convId) => {
    try {
      await alumniApi.leaveConversation(convId);
      setConversations(prev => prev.filter(c => c.id_conversation !== convId));
      if (activeConversation?.id_conversation === convId) {
        setActiveConversation(null);
        setMessages([]);
      }
      toast.success('Berhasil keluar dari grup');
    } catch (err) {
      toast.error('Gagal keluar grup');
    }
  }, [activeConversation]);

  const emitTyping = useCallback((convId, isTyping) => {
    alumniApi.sendTypingIndicator(convId, isTyping).catch(() => {});
  }, []);

  const handleTypingInput = useCallback((convId) => {
    emitTyping(convId, true);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => emitTyping(convId, false), 2000);
  }, [emitTyping]);

  // Handle realtime events
  const handleRealtimeMessage = useCallback((data) => {
    const msg = data?.message;
    const convId = data?.conversation_id || msg?.id_conversation;
    if (!msg || !convId) return;

    // Add message if viewing this conversation
    if (activeConversation?.id_conversation === convId && msg.sender?.id_users !== currentUserId) {
      setMessages(prev => {
        if (prev.find(m => m.id_message === msg.id_message)) return prev;
        return [...prev, msg];
      });
      alumniApi.markConversationAsRead(convId).catch(() => {});
    }

    // Update conversation list
    setConversations(prev => {
      let found = false;
      const updated = prev.map(c => {
        if (c.id_conversation === convId) {
          found = true;
          const isActive = activeConversation?.id_conversation === convId;
          return {
            ...c,
            last_message: { id_message: msg.id_message, type: msg.type, body: msg.body, file_name: msg.file_name, created_at: msg.created_at, sender: msg.sender },
            unread_count: isActive ? 0 : (c.unread_count || 0) + 1,
          };
        }
        return c;
      });
      if (!found) fetchConversations();
      return updated;
    });
  }, [activeConversation, currentUserId, fetchConversations]);

  const handleRealtimeDelete = useCallback((data) => {
    const msgId = data?.message_id;
    if (msgId) setMessages(prev => prev.filter(m => m.id_message !== msgId));
  }, []);

  const handleRealtimeRead = useCallback((data) => {
    // Could update read receipts UI here
  }, []);

  return {
    conversations, messages, activeConversation, loadingConversations, loadingMessages, sending, msgPagination,
    fetchConversations, fetchMessages, selectConversation, sendMessage, deleteMessage,
    togglePin, toggleMute, deleteConversation, leaveGroup, handleTypingInput,
    handleRealtimeMessage, handleRealtimeDelete, handleRealtimeRead,
    setActiveConversation, setMessages, setConversations,
  };
}
