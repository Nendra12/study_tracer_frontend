import React from 'react';
import { ImagePlus, Paperclip, X } from 'lucide-react';

export default function ReplyingToBanner({ replyingToMessage, currentUserId, onCancel }) {
  if (!replyingToMessage) return null;

  return (
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
        onClick={onCancel}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-200 rounded-full transition-colors"
        title="Batal membalas"
      >
        <X size={18} />
      </button>
    </div>
  );
}
