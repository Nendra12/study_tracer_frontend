import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Clock, ChevronDown, ChevronUp, Loader2, AlertCircle, FileQuestion } from 'lucide-react';
import { alumniApi } from '../../../api/alumni';

function StatusBadge({ status }) {
  const isComplete = status === 'Selesai';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
      isComplete ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
    }`}>
      {isComplete ? <CheckCircle2 size={12} /> : <Clock size={12} />}
      {status}
    </span>
  );
}

function ProgressBar({ percentage }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          percentage >= 100 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-blue-500' : 'bg-amber-500'
        }`}
        style={{ width: `${Math.min(100, percentage)}%` }}
      />
    </div>
  );
}

function KuesionerCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const { kuesioner, ringkasan, jawaban } = item;

  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-slate-800 truncate">{kuesioner.title}</h3>
            {kuesioner.deskripsi && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{kuesioner.deskripsi}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {kuesioner.status_karir && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {kuesioner.status_karir}
                </span>
              )}
              {kuesioner.tanggal_publikasi && (
                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(kuesioner.tanggal_publikasi).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
          <StatusBadge status={ringkasan.status} />
        </div>

        {/* Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">
              {ringkasan.total_dijawab}/{ringkasan.total_pertanyaan} pertanyaan dijawab
            </span>
            <span className="font-black text-slate-800">{ringkasan.persentase_selesai}%</span>
          </div>
          <ProgressBar percentage={ringkasan.persentase_selesai} />
        </div>

        {ringkasan.tanggal_submit && (
          <p className="text-[11px] text-slate-400 font-medium mt-3">
            Disubmit: {new Date(ringkasan.tanggal_submit).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Expand/Collapse Toggle */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-3 border-t border-slate-100 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        {expanded ? (
          <>Sembunyikan Jawaban <ChevronUp size={14} /></>
        ) : (
          <>Lihat Detail Jawaban <ChevronDown size={14} /></>
        )}
      </button>

      {/* Jawaban Detail */}
      {expanded && jawaban && jawaban.length > 0 && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {jawaban.map((j, idx) => (
            <div key={j.id_jawaban || idx} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="flex-none w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700">{j.pertanyaan}</p>
                  <div className="mt-2">
                    {j.opsi_dipilih ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-100">
                        <CheckCircle2 size={13} className="text-blue-600 flex-none" />
                        <span className="text-sm font-medium text-blue-800">{j.opsi_dipilih.opsi}</span>
                      </div>
                    ) : j.jawaban_text ? (
                      <p className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-md border border-slate-100">
                        {j.jawaban_text}
                      </p>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Tidak ada jawaban</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TabRiwayatKuesioner() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  async function fetchRiwayat() {
    try {
      setLoading(true);
      setError(null);
      const res = await alumniApi.getRiwayatKuesioner();
      const payload = res?.data?.data ?? res?.data ?? null;
      setData(payload);
    } catch (err) {
      console.error('Failed to load riwayat kuesioner', err);
      setError(err?.response?.data?.message || err?.message || 'Gagal memuat riwayat kuesioner.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="text-primary animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Memuat riwayat kuesioner...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button
          type="button"
          onClick={fetchRiwayat}
          className="text-sm font-bold text-primary hover:underline cursor-pointer"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  const riwayatList = data?.data ?? [];
  const totalDijawab = data?.total_kuesioner_dijawab ?? 0;

  if (riwayatList.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3">
        <FileQuestion size={48} className="text-slate-300" />
        <p className="text-sm text-slate-500 font-medium">Belum ada kuesioner yang dijawab.</p>
        <p className="text-xs text-slate-400">Jawab kuesioner yang tersedia untuk melihat riwayat Anda di sini.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardList size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800">Riwayat Kuesioner</h3>
            <p className="text-xs text-slate-500">Total {totalDijawab} kuesioner dijawab</p>
          </div>
        </div>
      </div>

      {/* Kuesioner Cards */}
      <div className="space-y-4">
        {riwayatList.map((item, idx) => (
          <KuesionerCard key={item.kuesioner?.id_kuesioner || idx} item={item} />
        ))}
      </div>
    </div>
  );
}
