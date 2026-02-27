import React from 'react';
import { Filter, Check } from 'lucide-react';

const FilterJurusan = ({ isFilterOpen, setIsFilterOpen, selectedJurusan, setSelectedJurusan, jurusanList }) => (
  <div className="relative">
    <button
      onClick={() => setIsFilterOpen(!isFilterOpen)}
      className={`cursor-pointer p-2.5 rounded-xl transition-all border
        ${isFilterOpen || selectedJurusan !== 'Semua'
          ? 'bg-primary/10 text-primary border-primary/20'
          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
        }`}
    >
      <Filter size={18} />
    </button>

    {isFilterOpen && (
      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Jurusan</span>
          {selectedJurusan !== 'Semua' && (
            <button onClick={() => { setSelectedJurusan('Semua'); setIsFilterOpen(false); }} className="text-[10px] text-primary font-bold hover:underline">Reset</button>
          )}
        </div>
        <div className="p-1 max-h-60 overflow-y-auto">
          <button
            onClick={() => { setSelectedJurusan('Semua'); setIsFilterOpen(false); }}
            className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex justify-between items-center
              ${selectedJurusan === 'Semua' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Semua Jurusan
            {selectedJurusan === 'Semua' && <Check size={14} />}
          </button>
          {jurusanList.map((j) => (
            <button
              key={j.id}
              onClick={() => { setSelectedJurusan(j.id); setIsFilterOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex justify-between items-center
                ${selectedJurusan === j.id ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {j.nama}
              {selectedJurusan === j.id && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default FilterJurusan;
