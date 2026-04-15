import React from 'react';
import { Loader2, Save, X, Edit2 } from 'lucide-react';
import SmoothDropdown from '../../admin/SmoothDropdown';

export default function InfoKarierSaatIni({
  career,
  careerInfo,
  showForm,
  currentNeedsCompletion,
  isVerified,
  editingEndDate,
  setEditingEndDate,
  endDateValue,
  setEndDateValue,
  getEndYearsOptions,
  handleUpdateEndDate,
  saving
}) {
  if (!careerInfo) return null;

  return (
    <div className={`relative border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 mb-6 bg-white transition-all duration-300 ${showForm ? 'animate-in slide-in-from-top-4' : ''}`}>
      {currentNeedsCompletion && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
          Data alamat atau kota pada status karier ini belum lengkap. Silakan lengkapi pada pengajuan status karier berikutnya agar titik sebaran peta akurat.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Status Karier</label>
          <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-primary">{career?.status || '-'}</div>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Periode</label>
          {editingEndDate ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-primary">
                  {career?.tahun_mulai || '-'}
                </div>
                <span className="text-sm font-bold text-primary">-</span>
                <div className="flex-1 min-w-[120px] relative z-50">
                  <SmoothDropdown
                    isSearchable={true}
                    placeholder="Pilih Tahun"
                    options={getEndYearsOptions(career?.tahun_mulai)}
                    value={endDateValue}
                    onSelect={(val) => setEndDateValue(val)}
                  />
                </div>
              </div>
              <button
                onClick={handleUpdateEndDate}
                disabled={saving}
                className="cursor-pointer flex items-center gap-1 px-3 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-[#2A3E3F] transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              </button>
              <button
                onClick={() => {
                  setEditingEndDate(false);
                  setEndDateValue('');
                }}
                className="cursor-pointer p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-primary">
                {career?.tahun_mulai || '-'} - {career?.tahun_selesai || 'Sekarang'}
              </div>
              {!career?.tahun_selesai && isVerified && (
                <button
                  onClick={() => setEditingEndDate(true)}
                  className="cursor-pointer flex items-center gap-1 px-3 py-3 bg-slate-100 text-primary rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                  title="Edit tahun selesai"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* TAMPILAN FIELD DETAIL */}
        {careerInfo.fields.map((field, index) => (
          <div key={index} className={field.label === 'Alamat' || field.label === 'Program Studi / Jurusan' || field.label === 'Jalur Masuk' ? 'sm:col-span-2' : ''}>
            <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
              {field.label}
            </label>
            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-primary">
              {field.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}