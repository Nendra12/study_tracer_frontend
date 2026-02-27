import React from 'react';
import { Filter, Check } from 'lucide-react';

const FilterTahunLulus = ({ isTahunFilterOpen, setIsTahunFilterOpen, selectedTahunLulus, setSelectedTahunLulus, tahunLulusList }) => (
  <div className="relative">
    <button
      onClick={() => setIsTahunFilterOpen(!isTahunFilterOpen)}
      className={`cursor-pointer p-2.5 rounded-xl transition-all border
        ${isTahunFilterOpen || selectedTahunLulus !== 'Semua'
          ? 'bg-primary/10 text-primary border-primary/20'
          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
        }`}
      title="Filter Tahun Lulus"
    >
      <span className="text-xs font-bold mr-1">Tahun</span>
      <Filter size={14} className="inline" />
    </button>

    {isTahunFilterOpen && (
      <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tahun Lulus</span>
          {selectedTahunLulus !== 'Semua' && (
            <button onClick={() => { setSelectedTahunLulus('Semua'); setIsTahunFilterOpen(false); }} className="text-[10px] text-primary font-bold hover:underline">Reset</button>
          )}
        </div>
        <div className="p-1 max-h-60 overflow-y-auto">
          <button
            onClick={() => { setSelectedTahunLulus('Semua'); setIsTahunFilterOpen(false); }}
            className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex justify-between items-center
              ${selectedTahunLulus === 'Semua' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Semua Tahun
            {selectedTahunLulus === 'Semua' && <Check size={14} />}
          </button>
          {tahunLulusList.map((year) => (
            <button
              key={year}
              onClick={() => { setSelectedTahunLulus(year); setIsTahunFilterOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex justify-between items-center
                ${selectedTahunLulus === year ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {year}
              {selectedTahunLulus === year && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default FilterTahunLulus;
