import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Clock, ChevronDown, ChevronUp, Loader2, AlertCircle, FileQuestion, ArrowLeft, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { alumniApi } from '../../api/alumni';

// Komponen Badge Status
function StatusBadge({ status }) {
  const isComplete = status === 'Selesai';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
      isComplete ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
    }`}>
      {isComplete ? <CheckCircle2 size={13} /> : <Clock size={13} />}
      {status || 'Menunggu'}
    </span>
  );
}

// Komponen Progress Bar
function ProgressBar({ percentage }) {
  const pct = percentage || 0;
  return (
    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'
        }`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}

// Komponen Kartu Kuesioner
function KuesionerCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  
  const kuesioner = item?.kuesioner || {};
  const ringkasan = item?.ringkasan || {};
  const jawaban = item?.jawaban || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md group">
      {/* Header Utama Kartu */}
      <div className="p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
              {kuesioner.title || kuesioner.judul || 'Kuesioner Tracer Study'}
            </h3>
            {kuesioner.deskripsi && (
              <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{kuesioner.deskripsi}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-2.5 mt-4">
              {kuesioner.status_karir && (
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {kuesioner.status_karir}
                </span>
              )}
              {kuesioner.tanggal_publikasi && (
                <span className="text-[11px] text-slate-400 font-bold bg-slate-50 px-3 py-1 rounded-lg">
                  {new Date(kuesioner.tanggal_publikasi).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <StatusBadge status={ringkasan.status} />
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-600">
              {ringkasan.total_dijawab || 0}/{ringkasan.total_pertanyaan || 0} Pertanyaan Dijawab
            </span>
            <span className="font-black text-slate-800 text-lg">{ringkasan.persentase_selesai || 0}%</span>
          </div>
          <ProgressBar percentage={ringkasan.persentase_selesai} />
          
          {ringkasan.tanggal_submit && (
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-5">
              Waktu Submit: {new Date(ringkasan.tanggal_submit).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      {/* Tombol Toggle Ekspansi */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-center gap-2 py-4 border-t border-slate-100 text-xs font-black transition-colors cursor-pointer ${
          expanded ? 'bg-slate-50 text-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
        }`}
      >
        {expanded ? (
          <>Sembunyikan Detail Jawaban <ChevronUp size={16} strokeWidth={3} /></>
        ) : (
          <>Lihat Detail Jawaban <ChevronDown size={16} strokeWidth={3} /></>
        )}
      </button>

      {/* Bagian Jawaban Detail */}
      {expanded && jawaban && jawaban.length > 0 && (
        <div className="bg-slate-50/50 divide-y divide-slate-100 border-t border-slate-100">
          {jawaban.map((j, idx) => (
            <div key={j.id_jawaban || idx} className="p-6 lg:p-8">
              <div className="flex items-start gap-4">
                {/* Nomor Pertanyaan */}
                <span className="flex-none w-8 h-8 rounded-xl bg-primary/10 text-primary text-sm font-black flex items-center justify-center shadow-sm">
                  {idx + 1}
                </span>
                {/* Pertanyaan dan Jawaban */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-bold text-slate-800 leading-relaxed mb-4">{j.pertanyaan}</p>
                  
                  {/* Tampilan Jawaban */}
                  {j.opsi_dipilih ? (
                    <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                      <Radio size={16} className="text-emerald-500 flex-none" />
                      <p className="text-sm font-bold text-slate-700 leading-normal">
                        Opsi Dipilih: <span className="font-medium text-slate-600">{j.opsi_dipilih.opsi || j.opsi_dipilih}</span>
                      </p>
                    </div>
                  ) : j.jawaban_text ? (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        {j.jawaban_text}
                      </p>
                    </div>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs text-slate-400 font-bold italic">Tidak ada jawaban</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Halaman Utama Riwayat Kuesioner
export default function RiwayatKuesioner() {
  const navigate = useNavigate();
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
      
      const payload = res?.data?.data || res?.data || null;
      setData(payload);
    } catch (err) {
      console.error('Failed to load riwayat kuesioner', err);
      setError(err?.response?.data?.message || err?.message || 'Gagal memuat riwayat kuesioner.');
    } finally {
      setLoading(false);
    }
  }

  // Tampilan Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] pt-28 pb-16 flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="text-primary animate-spin" />
        <p className="text-sm text-slate-500 font-bold">Memuat riwayat kuesioner...</p>
      </div>
    );
  }

  // Tampilan Error
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] pt-28 pb-16 flex flex-col items-center justify-center gap-3">
        <AlertCircle size={36} className="text-red-400" />
        <p className="text-sm text-red-500 font-bold">{error}</p>
        <button
          type="button"
          onClick={fetchRiwayat}
          className="text-sm font-bold text-primary hover:underline cursor-pointer px-4 py-2 border border-primary/20 rounded-xl mt-3 hover:bg-primary/5 transition-colors"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  // Ekstraksi Data
  const riwayatList = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
  const totalDijawab = data?.total_kuesioner_dijawab ?? riwayatList.length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col animate-in fade-in duration-300">
      {/* Container Utama dengan Lebar Standar max-w-7xl */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-16">
        
        {/* Tombol Kembali ke Profil */}
        <button
          onClick={() => navigate('/alumni/profile')}
          className="flex items-center gap-2.5 text-sm font-bold text-slate-500 hover:text-primary transition-all cursor-pointer mb-8 w-fit hover:-translate-x-1"
        >
          <ArrowLeft size={18} strokeWidth={3} /> Kembali ke Profil Saya
        </button>

        {/* Kartu Ringkasan (Summary Header) */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-8">
          <div className="flex items-center gap-4.5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <ClipboardList size={26} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">Riwayat Kuesioner</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Informasi total kuesioner yang telah berhasil Anda jawab.</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 px-5 py-3 rounded-2xl text-center shadow-inner">
            <span className="text-xs font-bold text-slate-500">Total Dijawab</span>
            <p className="text-2xl font-black text-primary leading-none mt-1">{totalDijawab}</p>
          </div>
        </div>

        {/* Tampilan Jika Kosong */}
        {riwayatList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 lg:p-24 flex flex-col items-center justify-center gap-4 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
              <FileQuestion size={40} className="text-slate-300" />
            </div>
            <h2 className="text-xl text-slate-700 font-black tracking-tight">Belum ada kuesioner yang dijawab</h2>
            <p className="text-sm text-slate-500 font-medium max-w-md">Jawab kuesioner yang tersedia di halaman utama untuk melihat riwayat serta detail jawaban Anda di sini.</p>
          </div>
        ) : (
          /* Daftar Kartu Kuesioner */
          <div className="grid grid-cols-1 gap-6">
            {riwayatList.map((item, idx) => (
              <KuesionerCard key={item?.kuesioner?.id_kuesioner || idx} item={item} />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}