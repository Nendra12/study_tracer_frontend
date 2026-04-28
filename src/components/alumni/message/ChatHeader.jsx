import React from 'react';
import { ArrowLeft, MoreVertical, Search } from 'lucide-react';

export default function ChatHeader({
  activeChat,
  getAvatarUrl,
  getDisplayName,
  typingText,
  onBackMobile,
  isSearchMessageOpen,
  onToggleSearch,
  isChatMenuOpen,
  onToggleChatMenu,
  children,
}) {
  if (!activeChat) return null;

  return (
    <div className="h-[76px] px-4 md:px-6 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onBackMobile}
          className="md:hidden cursor-pointer p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <img src={getAvatarUrl(activeChat)} alt={getDisplayName(activeChat)} className="w-10 h-10 rounded-full" />
        <div>
          <h2 className="text-sm font-bold text-gray-800 leading-tight">{getDisplayName(activeChat)}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            {typingText ? (
              <p className="text-[11px] font-medium text-green-600 italic">{typingText}</p>
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
          onClick={onToggleSearch}
          className={`p-2.5 cursor-pointer rounded-full transition-colors ${isSearchMessageOpen ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-[#f8f9fa] hover:text-gray-700'}`}
          title="Cari Pesan"
        >
          <Search size={18} />
        </button>

        <div className="relative">
          <button
            onClick={onToggleChatMenu}
            className={`p-2.5 cursor-pointer rounded-full transition-colors ${isChatMenuOpen ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-[#f8f9fa] hover:text-gray-700'}`}
          >
            <MoreVertical size={18} />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
