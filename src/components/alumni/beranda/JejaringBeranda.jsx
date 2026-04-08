import React from 'react';
import { ArrowRight, Users } from 'lucide-react';
import AlumniProfileCard from "../AlumniProfileCard"; // Sesuaikan path

export default function JejaringBeranda({ canAccessAll, alumniTerbaru, navigate, setSelectedImage }) {
  return (
    <section className="bg-white p-6 sm:p-8 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mt-2">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black text-primary tracking-tight">Jejaring Alumni</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Kenali rekan sejawat dan bangun koneksi profesional</p>
        </div>
        <button
          onClick={() => { if (canAccessAll) navigate("/alumni/daftar-alumni"); }}
          className={`group flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full border transition-all ${canAccessAll ? "bg-white text-primary border-slate-200 hover:border-primary cursor-pointer" : "text-slate-300 border-slate-100 cursor-not-allowed"}`}
        >
          Lihat Semua <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {alumniTerbaru.data?.length > 0 ? (
          alumniTerbaru.data.slice(0, 4).map((alumni) => (
            <div key={alumni.id} onClick={() => { if (!alumniTerbaru.locked) navigate(`/alumni/daftar-alumni/${alumni.id}`, { state: { alumni } }); }} className={!alumniTerbaru.locked ? "cursor-pointer" : ""}>
              <AlumniProfileCard
                data={alumni}
                locked={alumniTerbaru.locked}
                onImageClick={(img, e) => {
                  if (e) e.stopPropagation();
                  if (!alumniTerbaru.locked) setSelectedImage(img);
                }}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
            <Users size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-slate-400 text-sm">Belum ada data alumni baru</p>
          </div>
        )}
      </div>
    </section>
  );
}