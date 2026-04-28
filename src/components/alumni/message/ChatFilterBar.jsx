import React from 'react';
import { LayoutGrid, MessageCircle, Pin, UsersRound } from 'lucide-react';

export default function ChatFilterBar({
  filterMode,
  setFilterMode,
  unreadCount,
  favoriteCount,
  groupCount,
}) {
  return (
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
        onClick={() => setFilterMode(filterMode === 'group' ? 'all' : 'group')}
        className={`relative flex-shrink-0 flex justify-center cursor-pointer border items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 group ${filterMode === 'group' ? 'bg-primary/10 border-primary/20 text-primary' : 'border-primary/20 text-primary/50 hover:text-primary hover:bg-gray-100'}`}
      >
        <UsersRound size={14} className={filterMode === 'group' ? 'fill-primary/20' : ''} />
        Grup
        {groupCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
            {groupCount}
          </span>
        )}
      </button>
    </div>
  );
}
