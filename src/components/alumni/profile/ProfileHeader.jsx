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
          <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight mb-1">
            Profil Saya
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            // Arahkan ke halaman detail menggunakan ID alumni
            onClick={() => {
              const alumniId = profile?.id || profile?.id_alumni;
              if (alumniId) {
                navigate(`/alumni/daftar-alumni/${alumniId}`, { state: { fromProfile: true } });
              }
            }}
            // Ubah bg menjadi primary, text menjadi white, dan berikan efek hover yang sesuai
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-md text-sm font-bold hover:opacity-90 transition-all cursor-pointer shadow-sm"
          >
            <Eye size={16} /> Lihat Profil Publik
          </button>

        </div>
      </div>

      {/* Alert Box Kebijakan */}
      <div className="bg-amber-50 border border-amber-200/60 rounded-md p-4 flex items-start gap-3 shadow-sm">
        <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-amber-800 mb-0.5">Kebijakan Pembaruan</h3>
          <p className="text-xs text-amber-700/80 font-medium text-justify sm:text-left">
            Pembaruan pada profile memerlukan persetujuan Admin. Selama masa peninjauan, perubahan tidak dapat diakses publik. Harap pastikan semua informasi yang Anda berikan akurat dan sesuai dengan kebijakan kami untuk mempercepat proses persetujuan.
          </p>
        </div>
      </div>
    </div>
  );
}
