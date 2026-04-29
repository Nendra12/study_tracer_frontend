import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { alumniApi } from '../../api/alumni';
import { formatTime, getAvatarUrl, getDisplayName, getLastMessagePreview } from '../../hooks/useMessaging';
import { getLowonganChatPayload } from '../../utils/share';

export default function ShareToChatModal({ isOpen, onClose, lowongan }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sendingId, setSendingId] = useState(null);

  const shareMessage = useMemo(() => getLowonganChatPayload(lowongan || {}), [lowongan]);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const fetchList = async () => {
      setLoading(true);
      try {
        const res = await alumniApi.getConversations({ search: search || undefined, per_page: 50 });
        const d = res.data?.data;
        if (active) setConversations(d?.data || d || []);
      } catch (err) {
        if (active) setConversations([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    const t = setTimeout(fetchList, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [isOpen, search]);

  if (!isOpen) return null;

  const handleSend = async (convId) => {
    if (!convId || !shareMessage) return;

    setSendingId(convId);
    try {
      await alumniApi.sendMessage(convId, { type: 'text', body: shareMessage });
      toast.success('Link lowongan dikirim ke chat.');
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim pesan.');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-extrabold text-gray-800">Kirim ke chat</h3>
            <p className="text-[11px] text-gray-500">Pilih percakapan untuk mengirim link lowongan.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari percakapan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-10 flex flex-col items-center gap-3 text-primary">
              <Loader2 size={26} className="animate-spin" />
              <span className="text-sm font-medium text-gray-500">Memuat percakapan...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">Percakapan tidak ditemukan.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conv) => {
                const convId = conv.id_conversation;
                const avatar = getAvatarUrl(conv);
                const name = getDisplayName(conv);
                const preview = getLastMessagePreview(conv);
                const time = formatTime(conv.last_message?.created_at || conv.created_at);
                const isSending = sendingId === convId;

                return (
                  <button
                    key={convId}
                    onClick={() => handleSend(convId)}
                    disabled={isSending}
                    className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    <img
                      src={avatar}
                      alt={name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-gray-800 truncate">{name}</p>
                        <span className="text-[10px] text-gray-400">{time}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{preview || 'Tidak ada pesan'}</p>
                    </div>
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
