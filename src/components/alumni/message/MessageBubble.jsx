import React from 'react';
import { ChevronDown, Download, ImagePlus, Paperclip, Reply, Trash2, Check } from 'lucide-react';

export default function MessageBubble({
  msg,
  isMe,
  isGroupMessage,
  senderName,
  isHighlighted,
  isMessageSelectionMode,
  isSelected,
  onToggleSelect,
  activeMessageMenuId,
  setActiveMessageMenuId,
  onReply,
  onDelete,
  onScrollToMessage,
  onPreviewImage,
  getImageUrl,
  formatClockTime,
  renderMessageStatus,
}) {
  const isImage = msg.type === 'image' || msg.type === 'gif';

  return (
    <div
      id={`message-${msg.id_message}`}
      onClick={() => {
        if (!isMessageSelectionMode) return;
        onToggleSelect?.(msg.id_message);
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
        <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
          {isGroupMessage && msg.type !== 'system' && (
            <span className={`text-[11px] font-semibold mb-1 px-1 ${isMe ? 'text-primary/80' : 'text-gray-500'}`}>{senderName}</span>
          )}

          <div
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveMessageMenuId(msg.id_message);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (msg.type !== 'system') onReply?.(msg);
            }}
            className={`w-full rounded-[20px] relative ${isMe
              ? 'bg-primary text-white rounded-br-sm shadow-md shadow-indigo-200/50'
              : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm'
              } ${(isImage) ? 'p-1' : 'pl-4 pr-7 py-3'}`}
          >
            {/* Menu Trigger */}
            <div className="absolute top-1 right-1 opacity-0 group-hover/msg:opacity-100 transition-opacity flex flex-col items-end justify-start z-20">
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
                    <div className="absolute top-full mt-1 right-0 w-36 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.1)] border border-gray-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-200 text-gray-700">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReply?.(msg);
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
                            onDelete?.(msg.id_message);
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

            {/* Reply preview */}
            {msg.reply_to && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onScrollToMessage?.(msg.reply_to.id_message);
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

            {/* Content */}
            {isImage ? (
              <div className="relative flex flex-col group/img">
                <img
                  src={getImageUrl(msg.file_url)}
                  alt="content"
                  onClick={() => onPreviewImage?.(msg)}
                  className="w-64 sm:w-72 max-w-full max-h-72 object-cover block rounded-[16px] cursor-pointer hover:opacity-95 transition-opacity"
                  title="Klik untuk memperbesar"
                />

                {!msg.body && (
                  <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm flex items-center gap-1 text-[10px] text-white shadow-sm pointer-events-none z-10">
                    {formatClockTime(msg.created_at)}
                    {renderMessageStatus(msg, isMe)}
                  </div>
                )}

                {msg.body && (
                  <div className="px-2 pt-2 pb-0.5 flex flex-col">
                    <p className="text-[13px] leading-relaxed break-words">{msg.body}</p>
                    <div className={`text-[10px] flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                      {formatClockTime(msg.created_at)}
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
                    {formatClockTime(msg.created_at)}
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
                  {formatClockTime(msg.created_at)}
                  {renderMessageStatus(msg, isMe)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
