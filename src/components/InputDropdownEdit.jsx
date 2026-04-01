import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus } from 'lucide-react';

export default function InputDropdownEdit({
  label,
  options = [],
  placeholder = "Pilih atau ketik...",
  isRequired = false,
  onSelect
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const dropdownRef = useRef(null);

  // Filter opsi berdasarkan input user
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(query.toLowerCase())
  );

  // Cek apakah input user benar-benar baru (tidak ada di list)
  const isCustomValue = query.length > 0 && !options.some(
    (opt) => opt.toLowerCase() === query.toLowerCase()
  );

  const handleSelect = (value) => {
    setSelected(value);
    setQuery(value); // Set teks input sesuai yang dipilih
    setIsOpen(false);
    if (onSelect) onSelect(value);
  };

  // Menutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        
        // JIKA ada ketikan (query) dan berbeda dari yang sudah dipilih, simpan yang baru!
        if (query && query !== selected) {
           handleSelect(query); 
        } 
        // JIKA input malah dikosongkan, kembalikan ke pilihan terakhir (selected)
        else if (!query && selected) {
           setQuery(selected);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selected]);

  return (
    <div className="space-y-1 w-full relative" ref={dropdownRef}>
      <label className="text-[11px] font-bold text-primary uppercase tracking-wider">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>

      {/* Input Group */}
      <div className={`mt-2 flex items-center bg-white border-2 rounded-xl transition-all duration-300
        ${isOpen ? 'border-primary ring-2 ring-primary/10' : 'border-fourth hover:border-primary/50'}`}>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
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

      {/* Dropdown Menu */}
      <div className={`absolute z-20 w-full mt-2 bg-white border border-fourth rounded-xl shadow-xl overflow-hidden transition-all duration-200 origin-top
        ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>

        <ul className="max-h-52 overflow-y-auto py-1 custom-scrollbar">
          {/* Opsi dari List */}
          {filteredOptions.map((option) => (
            <li
              key={option}
              onClick={() => handleSelect(option)}
              className="flex items-center justify-between px-4 py-3 text-sm cursor-pointer hover:bg-fourth text-primary hover:text-primary transition-colors group"
            >
              <span className={selected === option ? "font-bold text-primary" : ""}>
                {option}
              </span>
              {selected === option && <Check size={16} className="text-primary" />}
            </li>
          ))}

          {/* Opsi Tambah Baru (Custom) */}
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
