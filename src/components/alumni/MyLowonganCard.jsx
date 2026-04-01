import React from 'react';
import { Briefcase, MapPin, Building2, Clock, CheckCircle2, Circle, XCircle, Loader2 } from 'lucide-react';
import { STORAGE_BASE_URL } from '../../api/axios';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

export function ApprovalBadge({ status }) {
  const config = {
    pending: { label: 'Menunggu Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
    approved: { label: 'Disetujui', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
    rejected: { label: 'Ditolak', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
  };
  const c = config[status] || config.pending;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${c.bg} ${c.text} border ${c.border}`}>
      <Icon size={13} />
      {c.label}
    </span>
  );
}

export function TimelineProgress({ timeline }) {
  if (!timeline || timeline.length === 0) return null;

  const getStepIcon = (step) => {
    if (step.status === 'completed') return <CheckCircle2 size={18} className="text-emerald-500 bg-white rounded-full relative z-10" />;
    if (step.status === 'rejected') return <XCircle size={18} className="text-red-500 bg-white rounded-full relative z-10" />;
    if (step.status === 'in_progress') return <Loader2 size={18} className="text-amber-500 animate-spin bg-white rounded-full relative z-10" />;
    return <Circle size={18} className="text-slate-300 bg-white rounded-full relative z-10" />;
  };

  const getLineColor = (step) => {
    if (step.status === 'completed') return 'bg-emerald-400';
    if (step.status === 'rejected') return 'bg-red-400';
    return 'bg-slate-200';
  };

  return (
    <div className="flex items-start w-full relative pt-1">
      {timeline.map((step, idx) => (
        <div key={step.step} className="flex flex-col items-center min-w-17.5 flex-1 relative">
          {/* Pembungkus Ikon dan Garis */}
          <div className="relative w-full flex justify-center items-center mb-1.5">
            {/* Garis Kiri (Mulai dari item ke-2) */}
            {idx > 0 && (
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-0.5 z-0 ${getLineColor(timeline[idx - 1])}`} />
            )}
            
            {/* Garis Kanan (Berhenti sebelum item terakhir) */}
            {idx < timeline.length - 1 && (
              <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-0.5 z-0 ${getLineColor(step)}`} />
            )}

            {/* Ikon Step (z-index lebih tinggi dari garis) */}
            {getStepIcon(step)}
          </div>

          <span className={`text-[10px] font-bold text-center leading-tight px-1 ${
            step.status === 'completed' ? 'text-emerald-600' :
            step.status === 'rejected' ? 'text-red-500' :
            step.status === 'in_progress' ? 'text-amber-600' :
            'text-slate-400'
          }`}>
            {step.label}
          </span>
          {step.date && (
            <span className="text-[9px] text-slate-400 mt-0.5">
              {new Date(step.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function MyLowonganCard({ data }) {
  const fotoUrl = getImageUrl(data.foto_thumbnail || data.foto);
  const fotoOriginal = getImageUrl(data.foto);
  const perusahaanNama = data.perusahaan?.nama || '-';

  return (
    <div className="bg-white rounded-2xl border border-primary/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-32 sm:h-auto h-40 bg-slate-100 shrink-0 overflow-hidden">
          <img
            src={fotoUrl || '/Desain Poster Job.jpg'}
            alt="Lowongan"
            className="w-full h-full object-cover"
            onError={(e) => { if (fotoOriginal && e.target.src !== fotoOriginal) e.target.src = fotoOriginal; else e.target.src = '/Desain Poster Job.jpg'; }}
          />
        </div>

        <div className="flex-1 p-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-primary text-base leading-tight truncate">{data.judul}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                <Building2 size={14} className="shrink-0" />
                <span className="font-medium truncate">{perusahaanNama}</span>
              </div>
            </div>
            <ApprovalBadge status={data.approval_status} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            {data.tipe_pekerjaan && (
              <span className="flex items-center gap-1">
                <Briefcase size={12} /> {data.tipe_pekerjaan}
              </span>
            )}
            {data.lokasi && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {data.lokasi}
              </span>
            )}
            {data.lowongan_selesai && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> Berakhir: {new Date(data.lowongan_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>

          {data.skills && data.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.skills.slice(0, 4).map((skill, idx) => (
                <span key={idx} className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/10">
                  {skill.nama || skill}
                </span>
              ))}
              {data.skills.length > 4 && (
                <span className="text-primary/50 text-[10px] font-bold px-1">+{data.skills.length - 4}</span>
              )}
            </div>
          )}

          {data.timeline && data.timeline.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <TimelineProgress timeline={data.timeline} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}