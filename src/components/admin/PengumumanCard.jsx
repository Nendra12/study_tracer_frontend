import React from 'react';
import { Calendar, Pencil, Trash2, Pin, Megaphone, Eye, EyeOff, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_BASE_URL } from '../../api/axios';

// Fallback gambar
import imgPengumuman from '../../assets/pengumuman.jpg';

// Helper: buat URL gambar lengkap dari path backend
const getImageUrl = (foto) => {
  if (!foto) return null;
  if (foto.startsWith('http')) return foto;
  return `${STORAGE_BASE_URL}/${foto}`;
};

export default function PengumumanCard({ item, onTogglePin, onEdit, onDelete, onViewImage, onChangeStatus }) {
  const navigate = useNavigate();
  
  // Gunakan foto_thumbnail kalau ada, fallback ke foto, lalu fallback ke gambar default
  const imageUrl = getImageUrl(item.foto_thumbnail) || getImageUrl(item.foto) || imgPengumuman;

  // Format tanggal
  const displayDate = item.created_at 
    ? new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
    : item.tanggal_dibuat || '-';

  // Fungsi untuk ke halaman detail (saat teks diklik)
  const handleTextClick = () => {
    navigate(`/wb-admin/pengumuman/detail/${item.id}`);
  };

  // Untuk lightbox, kirim URL gambar full (bukan thumbnail)
  const handleViewImage = () => {
    const fullImageUrl = getImageUrl(item.foto) || imgPengumuman;
    onViewImage({ ...item, foto: fullImageUrl });
  };

  // Tentukan tombol status yang akan ditampilkan
  const getStatusAction = () => {
    if (item.status === 'draft') {
      return {
        label: 'Publikasi',
        icon: <Eye size={13} />,
        targetStatus: 'aktif',
        className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
      };
    }
    if (item.status === 'aktif') {
      return {
        label: 'Ke Draft',
        icon: <EyeOff size={13} />,
        targetStatus: 'draft',
        className: 'text-amber-600 hover:text-amber-700 hover:bg-amber-50',
      };
    }
    if (item.status === 'berakhir') {
      return {
        label: 'Publikasi Ulang',
        icon: <Eye size={13} />,
        targetStatus: 'aktif',
        className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
      };
    }
    return null;
  };

  const statusAction = getStatusAction();

  return (
    <div className={`bg-white rounded-2xl border ${item.is_pinned ? 'border-primary/40 bg-blue-50/20' : 'border-gray-100'} shadow-sm flex flex-col group transition-all hover:shadow-md overflow-hidden`}>
      
      {/* 1. AREA GAMBAR - Klik untuk pop-up gambar saja */}
      <div 
        onClick={handleViewImage} 
        className="w-full h-32 sm:h-40 overflow-hidden relative bg-gray-100 flex-shrink-0 cursor-pointer"
      >
        <img 
          src={imageUrl} 
          alt={item.judul} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = imgPengumuman; }}
        />
        <div className="absolute top-3 right-3 flex gap-1.5">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
            item.status === 'aktif' ? 'bg-green-500 text-white' : 
            item.status === 'draft' ? 'bg-gray-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {item.status}
          </span>
        </div>
      </div>

      {/* 2. AREA TEKS - Klik untuk pindah ke halaman detail */}
      <div 
        onClick={handleTextClick}
        className="p-5 flex flex-col gap-4 flex-1 cursor-pointer hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl text-white flex-shrink-0 ${item.status === 'aktif' ? 'bg-primary' : item.status === 'draft' ? 'bg-gray-400' : 'bg-red-400'}`}>
            <Megaphone size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {item.is_pinned && <Pin size={12} className="text-primary fill-primary" />}
              <h3 className="font-bold text-primary text-base line-clamp-1">{item.judul}</h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
              <span className="flex items-center gap-1"><Calendar size={12} /> {displayDate}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: item.konten}} />
        
        {/* Aksi */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            {/* Tombol Pin */}
            <button 
              onClick={(e) => { e.stopPropagation(); onTogglePin(item.id); }} 
              className={`text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${item.is_pinned ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
            >
              <Pin size={14} /> {item.is_pinned ? 'Lepas' : 'Pin'}
            </button>

            {/* Tombol Publish / Draft / Republish */}
            {statusAction && onChangeStatus && (
              <>
                <span className="text-gray-200">|</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onChangeStatus(item.id, statusAction.targetStatus, item.judul); }} 
                  className={`text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${statusAction.className}`}
                >
                  {statusAction.icon} {statusAction.label}
                </button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
              className="cursor-pointer p-2 text-gray-400 hover:text-[#3C5759] hover:bg-blue-50 rounded-lg active:scale-90 transition-all" 
            >
              <Pencil size={16} />
            </button>
            {/* Tombol Arsipkan (hanya untuk yang aktif) */}
            {item.status === 'aktif' && onChangeStatus && (
              <button 
                onClick={(e) => { e.stopPropagation(); onChangeStatus(item.id, 'berakhir', item.judul); }} 
                className="cursor-pointer p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg active:scale-90 transition-all" 
                title="Arsipkan"
              >
                <Archive size={16} />
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(item.id, item.judul); }} 
              className="cursor-pointer p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg active:scale-90 transition-all" 
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}