import { Archive, Eraser, Info, ListChecks, Pin, Trash2, BellOff, Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatMenuOptions({
  isChatMenuOpen,
  setIsChatMenuOpen,
  setIsMessageSelectionMode,
  activeChat,
  onTogglePin,
  onToggleMute,
  onDeleteChat,
  onLeaveGroup,
}) {
  const navigate = useNavigate();
  const isPinned = activeChat?.settings?.is_pinned;
  const isMuted = activeChat?.settings?.is_muted;
  const isGroup = activeChat?.type === 'group';
  const contactId = activeChat?.contact?.id_alumni;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setIsChatMenuOpen(false)} />
      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
        {!isGroup && contactId && (
          <button
            onClick={() => { navigate(`/alumni/daftar-alumni/${contactId}`); setIsChatMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer"
          >
            <Info size={16} /> Info alumni
          </button>
        )}
        <button
          onClick={() => { setIsMessageSelectionMode(true); setIsChatMenuOpen(false); }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer"
        >
          <ListChecks size={16} /> Pilih pesan
        </button>
        <button
          onClick={() => { onTogglePin?.(); setIsChatMenuOpen(false); }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer"
        >
          <Pin size={16} className={isPinned ? "fill-primary" : ""} /> {isPinned ? 'Batal Sematkan' : 'Sematkan chat'}
        </button>
        <button
          onClick={() => { onToggleMute?.(); setIsChatMenuOpen(false); }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer"
        >
          {isMuted ? <Bell size={16} /> : <BellOff size={16} />} {isMuted ? 'Aktifkan notifikasi' : 'Bisukan'}
        </button>

        <div className="h-px bg-gray-100 my-1.5 mx-3"></div>

        {isGroup && (
          <button
            onClick={() => { onLeaveGroup?.(); setIsChatMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer"
          >
            <LogOut size={16} /> Keluar grup
          </button>
        )}
        <button
          onClick={() => { onDeleteChat?.(); setIsChatMenuOpen(false); }}
          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer font-medium"
        >
          <Trash2 size={16} /> Hapus chat
        </button>
      </div>
    </>
  );
}