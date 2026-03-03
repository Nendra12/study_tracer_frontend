import React from 'react';
import { createPortal } from 'react-dom';
import {
  X, Loader2,
  Instagram, Linkedin, Facebook, Globe, Github
} from 'lucide-react';

// Normalize foto URL from backend
const buildFotoUrl = (foto, STORAGE_BASE_URL) => {
  if (!foto) return null;
  if (foto.startsWith('http')) return foto;
  const path = foto.replace(/^\/?(storage\/)?/, '');
  return `${STORAGE_BASE_URL}/${path}`;
};

// Extract year from tahun_lulus
const extractYear = (val) => {
  if (!val) return null;
  if (typeof val === 'number') return String(val);
  const str = String(val);
  const match = str.match(/\d{4}/);
  return match ? match[0] : str;
};

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
};

// Status badge
const statusBadge = (status) => {
  const map = {
    pending: { bg: 'bg-orange-50 text-orange-600 border-orange-100', label: 'Menunggu' },
    ok: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Aktif' },
    rejected: { bg: 'bg-red-50 text-red-500 border-red-100', label: 'Ditolak' },
    banned: { bg: 'bg-slate-50 text-slate-500 border-slate-100', label: 'Blacklist' },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${s.bg}`}>
      {s.label}
    </span>
  );
};

const AlumniDetailModal = ({
  showDetail,
  setShowDetail,
  detailLoading,
  detailAlumni,
  handleApprove,
  handleReject,
  STORAGE_BASE_URL,
}) => {
  if (!showDetail) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowDetail(false)}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {detailLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : detailAlumni ? (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-primary">Detail Alumni</h2>
              <button onClick={() => setShowDetail(false)} className="cursor-pointer p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              {detailAlumni.foto ? (
                <img
                  src={buildFotoUrl(detailAlumni.foto, STORAGE_BASE_URL)}
                  alt={detailAlumni.nama}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-slate-700 text-white items-center justify-center font-bold text-xl shadow-md"
                style={{ display: detailAlumni.foto ? 'none' : 'flex' }}
              >
                {getInitials(detailAlumni.nama)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{detailAlumni.nama}</h3>
                <p className="text-sm text-slate-500">{detailAlumni.user?.email || '-'}</p>
                <div className="mt-1">{statusBadge(detailAlumni.status_create)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['NIS', detailAlumni.nis],
                ['NISN', detailAlumni.nisn],
                ['Jenis Kelamin', detailAlumni.jenis_kelamin],
                ['Tempat Lahir', detailAlumni.tempat_lahir],
                ['Tanggal Lahir', detailAlumni.tanggal_lahir],
                ['Tahun Masuk', detailAlumni.tahun_masuk],
                ['Tahun Lulus', extractYear(detailAlumni.tahun_lulus)],
                ['Jurusan', detailAlumni.jurusan?.nama],
                ['Alamat', detailAlumni.alamat],
                ['No HP', detailAlumni.no_hp],
              ].map(([label, val], i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
                  <p className="font-medium text-slate-700">{val || '-'}</p>
                </div>
              ))}
            </div>

            {/* --- BAGIAN MEDIA SOSIAL --- */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Media Sosial & Tautan</p>

              {Object.values({
                ig: detailAlumni.instagram,
                li: detailAlumni.linkedin,
                gh: detailAlumni.github,
                fb: detailAlumni.facebook,
                ws: detailAlumni.website
              }).some(val => val) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Instagram', val: detailAlumni.instagram, icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
                    { label: 'LinkedIn', val: detailAlumni.linkedin, icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-50' },
                    { label: 'GitHub', val: detailAlumni.github, icon: Github, color: 'text-slate-800', bg: 'bg-slate-100' },
                    { label: 'Facebook', val: detailAlumni.facebook, icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Website', val: detailAlumni.website, icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  ].map((soc, i) => (
                    soc.val && (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border border-slate-100 ${soc.bg}`}>
                        <soc.icon size={18} className={soc.color} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{soc.label}</p>
                          <a
                            href={soc.val.startsWith('http') ? soc.val : `https://${soc.val}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-slate-700 hover:text-primary truncate block transition-colors"
                          >
                            {soc.val.replace(/^https?:\/\/(www\.)?/, '')}
                          </a>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-medium italic">-</p>
              )}
            </div>

            {/* --- BAGIAN SKILLS --- */}
            <div className="mt-5">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Skills</p>
              <div className="flex flex-wrap gap-2">
                {detailAlumni.skills && detailAlumni.skills.length > 0 ? (
                  detailAlumni.skills.map(s => (
                    <span key={s.id} className="px-3 py-1.5 bg-white text-primary text-[11px] font-bold rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {s.nama}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400 font-medium italic">-</span>
                )}
              </div>
            </div>

            {/* --- RIWAYAT KARIR --- */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Riwayat Karir</p>
              <div className="space-y-2">
                {detailAlumni.riwayat_status && detailAlumni.riwayat_status.length > 0 ? (
                  detailAlumni.riwayat_status.map((r) => (
                    <div key={r.id} className="bg-slate-50 rounded-lg p-3 text-sm border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{r.status?.nama || 'Status'}</span>
                        <span className="text-slate-400 text-xs">
                          ({r.tahun_mulai}{r.tahun_selesai ? ` - ${r.tahun_selesai}` : ' - Sekarang'})
                        </span>
                      </div>

                      {r.pekerjaan && (
                        <p className="text-slate-600 text-xs mt-1 font-medium">
                          {r.pekerjaan.posisi} di <span className="text-slate-800">{r.pekerjaan.perusahaan?.nama || '-'}</span>
                        </p>
                      )}

                      {r.universitas && (
                        <p className="text-slate-600 text-xs mt-1 font-medium">
                          {r.universitas.nama} — <span className="text-slate-800">{r.universitas.jurusan_kuliah?.nama || '-'}</span>
                        </p>
                      )}

                      {r.wirausaha && (
                        <p className="text-slate-600 text-xs mt-1 font-medium">
                          {r.wirausaha.nama_usaha} (<span className="text-slate-800">{r.wirausaha.bidang_usaha?.nama || '-'}</span>)
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-slate-400 font-medium italic">Pencari Kerja</span>
                )}
              </div>
            </div>

            {/* --- TOMBOL AKSI --- */}
            {detailAlumni.status_create === 'pending' && (
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => { handleReject(detailAlumni.id); setShowDetail(false); }}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                >
                  Tolak
                </button>
                <button
                  onClick={() => { handleApprove(detailAlumni.id); setShowDetail(false); }}
                  className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
                >
                  Setujui
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
};

export default AlumniDetailModal;
