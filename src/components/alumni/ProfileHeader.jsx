import React from 'react';
import { Eye, Edit, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfileHeader({ profile, onPerbarui }) {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      {/* Judul dan Tombol */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#3C5759] tracking-tight mb-1">
            Profil Saya
          </h1>
          <p className="text-[#3C5759]/70 text-sm font-medium">
            Kelola informasi pribadi dan pencapaian karier Anda
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            // Arahkan ke halaman detail menggunakan ID alumni
            onClick={() => {
              const alumniId = profile?.id || profile?.id_alumni;
              if (alumniId) {
                navigate(`/alumni/${alumniId}`);
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#3C5759]/20 text-[#3C5759] rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
          >
            <Eye size={16} /> Lihat Profil Publik
          </button>
          
          <button 
            onClick={() => onPerbarui?.()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#3C5759] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer"
          >
            <Edit size={16} /> Perbarui Profil
          </button>
        </div>
      </div>

      {/* Alert Box Kebijakan */}
      <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
        <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-amber-800 mb-0.5">Kebijakan Pembaruan</h3>
          <p className="text-xs text-amber-700/80 font-medium">
            Pembaruan pada profil Anda memerlukan persetujuan Admin dan tidak akan langsung ditampilkan di direktori publik
          </p>
        </div>
      </div>
    </div>
  );
}