import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus } from 'lucide-react';

export default function InputDropdownEdit({
  label,
  options = [],
  placeholder = "Pilih atau ketik...",
  isRequired = false,
  value = "", // <-- TAMBAHAN: Menerima nilai awal
  onChange,   // <-- TAMBAHAN: Menangkap ketikan manual
  onSelect
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || ""); // Inisialisasi dengan value
  const [selected, setSelected] = useState(value || null);
  const dropdownRef = useRef(null);

  // TAMBAHAN: Sinkronisasi jika 'value' berubah dari luar (misal saat tombol Kembali ditekan)
  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
      setSelected(value || null);
    }
  }, [value]);

  const filteredOptions = options.filter((option) => {
    const stringOption = String(option || "");
    const stringQuery = String(query || "");
    return stringOption.toLowerCase().includes(stringQuery.toLowerCase());
  });

  const isCustomValue = query.length > 0 && !options.some(
    (opt) => opt.toLowerCase() === query.toLowerCase()
  );

  const handleSelect = (val) => {
    setSelected(val);
    setQuery(val);
    setIsOpen(false);
    if (onChange) onChange(val); // Beritahu parent
    if (onSelect) onSelect(val); // Beritahu parent
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (query && query !== selected) {
           handleSelect(query); 
        } 
        else if (!query && selected) {
           setQuery(selected);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selected, query]); // <-- Tambahkan query ke dependency

  return (
    <div className="space-y-1 w-full relative" ref={dropdownRef}>
      <label className="text-[11px] font-bold text-primary uppercase tracking-wider">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>

      <div className={`mt-2 flex items-center bg-white border-2 rounded-xl transition-all duration-300
        ${isOpen ? 'border-primary ring-2 ring-primary/10' : 'border-fourth hover:border-primary/50'}`}>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (onChange) onChange(e.target.value); // <-- TAMBAHAN: Simpan ketikan manual secara realtime
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full p-3 text-sm outline-none bg-transparent text-primary placeholder:text-third/50"
        />

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-3 text-third hover:text-primary transition-colors cursor-pointer"
        >
          <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className={`absolute z-20 w-full mt-2 bg-white border border-fourth rounded-xl shadow-xl overflow-hidden transition-all duration-200 origin-top
        ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>

        <ul className="max-h-52 overflow-y-auto py-1 custom-scrollbar">
          {filteredOptions.map((option, index) => ( // Tambahkan 'index' di sini
            <li
              key={`${option}-${index}`} // Sekarang 'index' sudah terdefinisi
              onClick={() => handleSelect(option)}
              className="flex items-center justify-between px-4 py-3 text-sm cursor-pointer hover:bg-fourth text-primary transition-colors group"
            >
              <span className={selected === option ? "font-bold text-primary" : ""}>
                {option}
              </span>
              {selected === option && <Check size={16} className="text-primary" />}
            </li>
          ))}

          {isCustomValue && (
            <li
              onClick={() => handleSelect(query)}
              className="flex items-center gap-2 px-4 py-3 text-sm cursor-pointer bg-primary/5 text-primary font-bold hover:bg-primary/10 border-t border-fourth/50 transition-all"
            >
              <Plus size={16} />
              <span>Gunakan "{query}"</span>
            </li>
          )}

          {filteredOptions.length === 0 && !isCustomValue && (
            <li className="px-4 py-3 text-[11px] text-third italic text-center bg-fourth/20">
              Ketik untuk menambahkan data baru
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}