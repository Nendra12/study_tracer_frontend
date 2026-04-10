import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

// NAMA FUNCTION SUDAH DIGANTI MENJADI SmoothKota
export default function SmoothKota({
  label,
  options = [], 
  placeholder = "Pilih opsi",
  isRequired = false,
  value = null, 
  message = '',
  onSelect,
  isSearchable = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Normalisasi data untuk mendukung string biasa maupun object
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return { value: opt.value, label: String(opt.label) };
    }
    return { value: opt, label: String(opt) };
  });

  const selectedOption = normalizedOptions.find(opt => opt.value === value) || null;

  const handleSelect = (option) => {
    setIsOpen(false);
    setSearchTerm("");
    if (onSelect) onSelect(option.value);
  };

  const filteredOptions = isSearchable 
    ? normalizedOptions.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : normalizedOptions;

  return (
    <div className={`space-y-1 w-full min-w-[180px] relative text-left isolate ${isOpen ? 'z-9999' : 'z-60'}`} ref={dropdownRef}>
      {label && (
        <label className="text-[11px] font-bold text-primary/80 uppercase tracking-wider block mb-1">
          {label} {isRequired ? <span className="text-red-500">*</span> : <span className="text-[9px] text-slate-400 italic">{message}</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer w-full px-2 py-1.5 bg-white border border-gray-200 flex items-center justify-between rounded text-xs transition-all outline-none focus:ring-1 focus:ring-primary"
      >
        <span className={selectedOption ? 'font-medium text-gray-700 truncate text-left' : 'text-gray-400 truncate text-left'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-9999 w-full min-w-[240px] mt-1 bg-white opacity-100 border border-gray-100 rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
          
          {isSearchable && (
            <div className="p-2 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
              <Search size={12} className="text-gray-400 ml-1 shrink-0" />
              <input 
                autoFocus
                type="text"
                placeholder="Cari..."
                className="w-full bg-transparent text-xs outline-none p-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          <ul className="py-1 max-h-48 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => (
                <li
                  key={option.value !== undefined ? option.value : idx}
                  onClick={() => handleSelect(option)}
                  className="flex items-start justify-between px-3 py-2 text-xs cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors gap-2"
                >
                  <span className={`break-words ${value === option.value ? "font-bold text-primary" : ""}`}>
                    {option.label}
                  </span>
                  {value === option.value && <Check size={14} className="text-primary shrink-0 mt-0.5" />}
                </li>
              ))
            ) : (
              <li className="px-3 py-3 text-xs text-gray-400 italic text-center">Data tidak ditemukan</li>
            )}
          </ul>
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-9990" onClick={() => setIsOpen(false)} />}
    </div>
  );
}