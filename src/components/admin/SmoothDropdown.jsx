import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export default function SmoothDropdown({
  label,
  options = [],
  placeholder = "Pilih opsi",
  isRequired = false,
  value = null,
  message = '',
  onSelect,
  isSearchable = false // Tambahkan prop ini sebagai default false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    setSearchTerm("");
    if (onSelect) onSelect(option);
  };

  // Logika filter hanya jalan jika isSearchable true
  const filteredOptions = isSearchable 
    ? options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div className="space-y-1 w-full relative" ref={dropdownRef}>
      {label && (
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          {label} {isRequired ? <span className="text-red-500">*</span> : <span className="text-[9px] text-slate-400 italic">{message}</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-white border-2 border-gray-100 flex items-center justify-between rounded-xl text-sm transition-all outline-none"
      >
        <span className={selected ? 'text-slate-700 font-medium' : 'text-gray-400'}>
          {selected || placeholder}
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[110] w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* INPUT SEARCH HANYA MUNCUL JIKA DIMINTA */}
          {isSearchable && (
            <div className="p-2 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
              <Search size={14} className="text-gray-400 ml-1" />
              <input 
                autoFocus
                type="text"
                placeholder="Cari..."
                className="w-full bg-transparent text-sm outline-none p-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          <ul className="py-1 max-h-48 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                >
                  <span className={selected === option ? "font-bold text-primary" : ""}>
                    {option}
                  </span>
                  {selected === option && <Check size={16} className="text-primary" />}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-xs text-gray-400 italic text-center">Data tidak ditemukan</li>
            )}
          </ul>
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />}
    </div>
  );
}