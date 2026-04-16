import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function YearsInput({
  label,
  placeholder = "Pilih Tahun",
  isRequired = false,
  value = null,
  onSelect,
  maxYear = new Date().getFullYear() + 5,
  minYear = null, // <-- TAMBAHAN BARU: Prop minYear
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // <-- PERBAIKAN LOGIKA: Jika minYear diisi, hitung jaraknya. Jika tidak, default 50 tahun ke belakang.
  const length = minYear ? (maxYear - minYear + 1) : 50;
  const years = Array.from({ length }, (_, i) => maxYear - i);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (year) => {
    if (onSelect) onSelect(year);
    setIsOpen(false);
  };

  return (
    <div className={`space-y-1 w-full text-left relative ${isOpen ? 'z-[9999]' : ''}`} ref={dropdownRef}>
      {label && (
        <label className="text-[11px] font-bold text-primary/80 uppercase tracking-wider block mb-1">
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`cursor-pointer w-full p-2.5 px-3 bg-white border border-fourth flex items-center justify-between rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-primary ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
      >
        <span className={value ? 'font-medium text-gray-700' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
          <ul className="py-1 max-h-48 overflow-y-auto custom-scrollbar">
            {years.map((year) => (
              <li
                key={year}
                onClick={() => handleSelect(String(year))}
                className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
              >
                <span className={String(value) === String(year) ? "font-bold text-primary" : ""}>
                  {year}
                </span>
                {String(value) === String(year) && <Check size={14} className="text-primary shrink-0" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}