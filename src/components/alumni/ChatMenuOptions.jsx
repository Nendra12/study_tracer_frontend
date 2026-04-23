import { Eraser, Info, ListChecks, Pin, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatMenuOptions({ isChatMenuOpen, setIsChatMenuOpen, handleFeatureNotReady, setIsMessageSelectionMode, toggleFavorite, activeChat, handleClearChat, handleDeleteChat }) {
    const navigate = useNavigate();
    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={() => setIsChatMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={() => navigate("/alumni/daftar-alumni/104")}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer"
                >
                    <Info size={16} /> Info alumni
                </button>
                <button
                    onClick={() => { setIsMessageSelectionMode(true); setIsChatMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer"
                >
                    <ListChecks size={16} /> Pilih pesan
                </button>
                <button
                    onClick={(e) => { toggleFavorite(e, activeChat.id); setIsChatMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer"
                >
                    <Pin size={16} className={activeChat?.isFavorite ? "fill-primary" : ""} /> {activeChat?.isFavorite ? 'Batal Sematkan' : 'Sematkan chat'}
                </button>

                <div className="h-px bg-gray-100 my-1.5 mx-3"></div>

                <button
                    onClick={() => { handleClearChat(); setIsChatMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-3 cursor-pointer"
                >
                    <Eraser size={16} /> Bersihkan obrolan
                </button>
                <button
                    onClick={() => { handleDeleteChat(); setIsChatMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer font-medium"
                >
                    <Trash2 size={16} /> Hapus chat
                </button>
            </div>
        </>
    )
}