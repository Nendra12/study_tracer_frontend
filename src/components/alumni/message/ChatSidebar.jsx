import React from 'react';
import { MessageSquarePlus, Search } from 'lucide-react';
import ChatFilterBar from './ChatFilterBar';
import ChatListItem from './ChatListItem';
import SelectionActionOverlay from './SelectionActionOverlay';

export default function ChatSidebar({
  showChatArea,
  onStartAddChat,
  searchQuery,
  setSearchQuery,
  filterMode,
  setFilterMode,
  unreadCount,
  favoriteCount,
  groupCount,
  isSelectionMode,
  setIsSelectionMode,
  selectedContacts,
  setSelectedContacts,
  messaging,
  filteredContacts,
  activeChat,
  activeSidebarMenuId,
  setActiveSidebarMenuId,
  getDisplayName,
  getAvatarUrl,
  getLastMessagePreview,
  formatTime,
  onSelectChat,
  onToggleSelect,
  onOpenInfo,
  onTogglePin,
  onDeleteChat,
  onDeleteSelectedChats,
  onToggleSelectAll,
  isAllSelected,
}) {
  return (
    <div
      className={`w-full md:w-80 lg:w-[400px] flex-col border-r border-gray-100 bg-white relative ${showChatArea ? 'hidden md:flex' : 'flex'}`}
    >
      <div className="p-5 md:pt-6 px-6 shrink-0">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-extrabold text-primary">Pesan</h1>
          <div className="flex gap-2 items-center">
            <button
              onClick={onStartAddChat}
              className="p-2.5 cursor-pointer text-gray-400 hover:bg-[#f8f9fa] hover:text-gray-700 rounded-full transition-colors"
              title
            >
              <MessageSquarePlus size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" size={18} />
          <input
            type="text"
            placeholder="Cari pesan atau nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f8f9fa] border-none text-sm rounded-md py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary transition-all outline-none"
          />
        </div>

        <ChatFilterBar
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          unreadCount={unreadCount}
          favoriteCount={favoriteCount}
          groupCount={groupCount}
        />

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

      <div
        className={`flex-1 overflow-y-auto px-3 pt-3 transition-all duration-300 custom-scrollbar ${isSelectionMode && selectedContacts.length > 0 ? 'pb-40' : 'pb-3'}`}
      >
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
            const isPinned = contact.settings?.is_pinned;
            const isActive = activeChat?.id_conversation === cId;
            const name = getDisplayName(contact);
            const avatarUrl = getAvatarUrl(contact);
            const preview = getLastMessagePreview(contact);
            const timeLabel = formatTime(contact.last_message?.created_at || contact.created_at);

            return (
              <ChatListItem
                key={cId}
                contact={contact}
                isSelectionMode={isSelectionMode}
                isSelected={selectedContacts.includes(cId)}
                isActive={isActive}
                isPinned={!!isPinned}
                activeSidebarMenuId={activeSidebarMenuId}
                setActiveSidebarMenuId={setActiveSidebarMenuId}
                avatarUrl={avatarUrl}
                name={name}
                timeLabel={timeLabel}
                preview={preview}
                unreadCount={contact.unread_count || 0}
                onClick={onSelectChat}
                onToggleSelect={onToggleSelect}
                onOpenInfo={onOpenInfo}
                onTogglePin={onTogglePin}
                onDeleteChat={onDeleteChat}
              />
            );
          })
        )}
      </div>

      <SelectionActionOverlay
        selectedCount={selectedContacts.length}
        totalCount={filteredContacts.length}
        isAllSelected={isAllSelected}
        onToggleSelectAll={onToggleSelectAll}
        onDeleteSelected={onDeleteSelectedChats}
      />
    </div>
  );
}
