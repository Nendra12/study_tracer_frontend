import React, { useState, useRef } from "react";
import { Loader2, X, Image as ImageIcon } from "lucide-react";
import { STORAGE_BASE_URL } from "../../api/axios"; 

// --- FUNGSI BANTUAN & KOMPONEN KECIL ---
function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

function getInitials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || "") + (parts.length > 1 ? parts[1]?.[0] || "" : "")).toUpperCase();
}

function Avatar({ url, name, size = "w-11 h-11", textSize = "text-sm" }) {
  return (
    <div className={`${size} rounded-full bg-primary/10 flex items-center justify-center flex-none overflow-hidden`}>
      {url ? (
        <img src={url} alt={name || "User"} className="w-full h-full object-cover" />
      ) : (
        <span className={`text-primary font-black ${textSize}`}>{getInitials(name)}</span>
      )}
    </div>
  );
}

// --- KOMPONEN UTAMA MODAL ---
export default function StartPostModal({ open, avatarUrl, displayName, onClose, onSubmit, submitting }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files].slice(0, 10));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) return;
    try { 
      // Hardcode visibilitas menjadi "connections"
      await onSubmit(content, "connections", images); 
      setContent(""); 
      setImages([]); 
      onClose(); 
    } catch {}
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 p-4 sm:p-6 flex items-start sm:items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-full">
          <div className="p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-slate-50">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar url={avatarUrl} name={displayName} size="w-12 h-12" />
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-800 truncate">{displayName || "Alumni"}</p>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  Posting ke Koneksi
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex-none" aria-label="Tutup">
              <X size={18} className="text-slate-500" />
            </button>
          </div>
          
          <div className="px-5 sm:px-6 py-4 overflow-y-auto flex-1">
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Apa yang ingin kamu bicarakan?" className="w-full min-h-[160px] resize-none text-slate-700 placeholder:text-slate-400 text-base font-medium outline-none" />
            
            {images.length > 0 && (
              <div className="pt-4 flex flex-wrap gap-2">
                {images.map((file, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border border-slate-200">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-md bg-black/60 flex items-center justify-center cursor-pointer">
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-5 sm:px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleAddImages} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-md hover:bg-slate-200 transition-colors cursor-pointer text-primary bg-primary/5" aria-label="Tambah foto">
                <ImageIcon size={18} />
              </button>
            </div>
            <button type="button" onClick={handleSubmit} disabled={(!content.trim() && images.length === 0) || submitting}
              className={`h-10 px-6 rounded-md text-sm font-black transition-colors border inline-flex items-center gap-2 ${
                (content.trim() || images.length > 0) && !submitting ? "bg-primary text-white border-primary hover:bg-primary/80 cursor-pointer shadow-md" : "bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed"
              }`}>
              {submitting && <Loader2 size={14} className="animate-spin" />} Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}