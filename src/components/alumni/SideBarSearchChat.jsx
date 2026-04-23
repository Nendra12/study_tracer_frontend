import { Search, X } from "lucide-react";

import { formatTime, getDisplayName } from '../../hooks/useMessaging';

export default function SideBarSearchChat({ messageSearchQuery, setMessageSearchQuery, messageSearchResults, scrollToMessage, activeChat, setIsSearchMessageOpen, currentUserId }) {
    return (
        <div className="w-full md:w-80 lg:w-[320px] border-l border-gray-100 bg-white flex flex-col absolute md:relative inset-y-0 right-0 z-20 shadow-xl md:shadow-none animate-in slide-in-from-right-8 duration-300">
            <div className="h-[76px] px-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
                <button
                    onClick={() => setIsSearchMessageOpen(false)}
                    className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                    <X size={20} />
                </button>
                <h2 className="text-sm font-bold text-gray-800">Cari Pesan</h2>
            </div>
            <div className="p-4 shrink-0 border-b border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Cari pesan di obrolan ini..."
                        value={messageSearchQuery}
                        onChange={(e) => setMessageSearchQuery(e.target.value)}
                        className="w-full bg-[#f8f9fa] border-none text-sm rounded-md py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        autoFocus
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
                {messageSearchQuery.trim() === '' ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <Search size={40} className="text-gray-200 mb-3" />
                        <p className="text-sm text-gray-400">Ketik kata kunci untuk mencari pesan dalam obrolan dengan {getDisplayName(activeChat)}</p>
                    </div>
                ) : messageSearchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <p className="text-sm text-gray-500">Pesan tidak ditemukan untuk "{messageSearchQuery}"</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {messageSearchResults.map((msg) => (
                            <div
                                key={msg.id_message}
                                onClick={() => scrollToMessage(msg.id_message)}
                                className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[11px] font-bold text-gray-500">{msg.sender?.id_users === currentUserId ? 'Anda' : (msg.sender?.nama_alumni || 'User')}</span>
                                    <span className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">
                                    {msg.body || msg.file_name}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}