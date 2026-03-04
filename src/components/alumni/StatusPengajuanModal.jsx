import React from 'react';
import { X, Hourglass, CheckCircle2, RefreshCcw, CheckCircle, XCircle, Clock } from 'lucide-react';

// Map step status to icon, color, and style
function getStepVisual(status) {
  switch (status) {
    case 'completed':
      return {
        icon: <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />,
        titleColor: 'text-[#4B6B6D]',
        opacity: '',
        badge: null,
      };
    case 'current':
      return {
        icon: (
          <div className="bg-[#3C5759] rounded-full p-1.5 shrink-0">
            <RefreshCcw size={14} className="text-white" />
          </div>
        ),
        titleColor: 'text-[#3C5759]',
        opacity: '',
        badge: (
          <div className="inline-block bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-1 rounded-full mt-1 mb-2.5">
            Langkah Saat Ini
          </div>
        ),
      };
    case 'rejected':
      return {
        icon: <XCircle size={24} className="text-red-500 shrink-0" />,
        titleColor: 'text-red-600',
        opacity: '',
        badge: (
          <div className="inline-block bg-red-50 text-red-600 text-[11px] font-bold px-2.5 py-1 rounded-full mt-1 mb-2.5">
            Ditolak
          </div>
        ),
      };
    case 'waiting':
    default:
      return {
        icon: <CheckCircle size={24} className="text-slate-200 shrink-0" />,
        titleColor: 'text-slate-400',
        opacity: 'opacity-50',
        badge: null,
      };
  }
}

// Format date string for display
function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    }) + ' • ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

export default function StatusPengajuanModal({ isOpen, onClose, data }) {
  if (!isOpen) return null;

  const steps = data?.steps || [];
  const estimasi = data?.estimasi || '-';
  const overallStatus = data?.status; // e.g. 'pending', 'ok', 'rejected'

  // Calculate progress from steps
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const currentIdx = steps.findIndex(s => s.status === 'current');
  const progressPercent = steps.length > 0 
    ? Math.round(((completedCount + (currentIdx >= 0 ? 0.5 : 0)) / steps.length) * 100) 
    : 0;

  return (
    // Overlay Background
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm">
      
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-[#3C5759]">Status Pengajuan</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY / CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          
          {/* Box Estimasi */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 flex items-center gap-4 mb-8">
            <div className="bg-slate-200/50 p-2.5 rounded-full text-slate-500">
              <Hourglass size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Estimasi Waktu Penyelesaian</p>
              <p className="text-sm font-bold text-slate-800">{estimasi}</p>
            </div>
          </div>

          {/* TIMELINE CONTAINER */}
          <div className="mt-2">
            {steps.length > 0 ? (
              steps.map((step, idx) => {
                const visual = getStepVisual(step.status);
                const isLast = idx === steps.length - 1;

                return (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {visual.icon}
                      {!isLast && <div className="w-[2px] h-full bg-slate-200 my-2"></div>}
                    </div>

                    <div className={`flex-1 ${isLast ? 'pb-2' : 'pb-8'} ${visual.opacity}`}>
                      <h3 className={`text-base font-bold ${visual.titleColor} flex items-center gap-2 flex-wrap`}>
                        {step.title}
                      </h3>

                      {step.date && (
                        <p className="text-xs text-slate-400 mt-0.5 mb-1">{formatDate(step.date)}</p>
                      )}

                      {visual.badge}

                      {step.description && (
                        <div className={`${step.status === 'completed' ? 'bg-slate-50 border border-slate-100 rounded-xl p-3.5 mt-2' : 'mt-1'}`}>
                          <p className={`text-sm leading-relaxed ${
                            step.status === 'completed' ? 'text-[#4B6B6D] font-medium' : 
                            step.status === 'rejected' ? 'text-red-600' :
                            step.status === 'waiting' ? 'text-slate-400' :
                            'text-slate-600'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      )}

                      {/* Progress Bar for current step */}
                      {step.status === 'current' && (
                        <div className="w-full h-1.5 bg-slate-200 rounded-full mt-4 overflow-hidden flex">
                          <div className="h-full bg-[#3C5759] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada data status pengajuan</p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER / ACTION */}
        <div className="px-6 py-5 border-t border-slate-100 bg-white">
          <button 
            onClick={onClose}
            className="w-full bg-[#3C5759] text-white py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[#3C5759]/20 hover:bg-[#2A3E3F] transition-all cursor-pointer"
          >
            Mengerti
          </button>
        </div>

      </div>
    </div>
  );
}