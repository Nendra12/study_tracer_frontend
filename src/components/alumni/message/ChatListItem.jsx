import React from 'react';
import { Check, Ellipsis, Info, Pin, Trash2 } from 'lucide-react';

export default function ChatListItem({
  contact,
  isSelectionMode,
  isSelected,
  isActive,
  isPinned,
  activeSidebarMenuId,
  setActiveSidebarMenuId,
  avatarUrl,
  name,
  timeLabel,
  preview,
  unreadCount,
  onClick,
  onToggleSelect,
  onOpenInfo,
  onTogglePin,
  onDeleteChat,
}) {
  const cId = contact.id_conversation;

  const handleActivate = () => {
    if (isSelectionMode) onToggleSelect?.(cId);
    else onClick?.(contact);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleActivate();
        }
      }}
      className={`w-full cursor-pointer flex items-center gap-3.5 p-3 rounded-2xl text-left group transition-all mb-1 hover:bg-gray-50 ${isSelectionMode && isSelected
        ? 'bg-indigo-50 border-indigo-200 border'
        : isActive && !isSelectionMode ? 'bg-primary/10 border border-transparent'
          : (unreadCount || 0) > 0 ? 'bg-primary/5 border border-transparent'
            : 'border border-transparent'
        }`}
    >
      {isSelectionMode && (
        <div className="shrink-0 mr-1 animate-in fade-in slide-in-from-left-2 duration-200">
          <div
            className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300'
              }`}
          >
            {isSelected && <Check size={14} strokeWidth={3} />}
          </div>
        </div>
      )}

      <div className="relative shrink-0">
        <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h3 className={`text-sm mb-1.5 font-bold truncate pr-2 ${isActive ? 'text-primary' : 'text-gray-800'}`}>
            {name}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-[11px] font-medium text-gray-400 ${activeSidebarMenuId === cId ? 'hidden' : 'group-hover:hidden'}`}
            >
              {timeLabel}
            </span>

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
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSidebarMenuId(null);
                    }}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {contact.type === 'private' && contact.contact?.id_alumni && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenInfo?.(contact);
                          setActiveSidebarMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer"
                      >
                        <Info size={16} /> Info alumni
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin?.(contact);
                        setActiveSidebarMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <Pin size={16} className={isPinned ? 'fill-primary text-primary' : ''} />{' '}
                      {isPinned ? 'Batal Sematkan' : 'Sematkan chat'}
                    </button>

                    <div className="h-px bg-gray-100 my-1.5 mx-3"></div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat?.(cId);
                        setActiveSidebarMenuId(null);
                      }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin?.(contact);
                }}
                className="p-1.5 rounded-full transition-colors cursor-pointer text-primary"
                title="Disematkan"
              >
                <Pin size={14} className="text-primary fill-primary" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 justify-between">
          <p className={`text-xs truncate ${(unreadCount || 0) > 0 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
            {preview || 'Tidak ada pesan'}
          </p>

          <div className="flex items-center gap-1">
            {(unreadCount || 0) > 0 && (
              <div className="shrink-0 min-w-5 h-5 px-1 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                {unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
