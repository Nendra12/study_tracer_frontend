import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Check, Plus } from "lucide-react";

export default function MultiSelectDropdown({ 
  label, 
  options = [], 
  selected = [], 
  onChange, 
  placeholder, 
  valueKey = "nama" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const clickOut = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  const getValue = (opt) => opt[valueKey] ?? opt.nama;
  const getLabel = (val) => {
    const opt = options.find(o => String(getValue(o)) === String(val));
    return opt ? opt.nama : val; 
  };

  const toggleOption = (opt) => {
    const val = getValue(opt);
    let newSelected = selected.includes(val) 
      ? selected.filter(item => item !== val) 
      : [...selected, val];
    onChange(newSelected);
    setSearch(""); 
  };

  const removeOption = (e, val) => {
    e.stopPropagation();
    onChange(selected.filter(item => item !== val));
  };

  const handleAddCustom = () => {
    const val = search.trim();
    if (!val) return;

    const isAlreadySelected = selected.some(item => String(getLabel(item)).toLowerCase() === val.toLowerCase());
    
    if (!isAlreadySelected) {
      onChange([...selected, val]);
    }
    setSearch("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      if (search.trim()) {
        handleAddCustom();
      }
    }
  };

  const filteredOptions = options.filter(opt =>
    (opt.nama || "").toLowerCase().includes(search.toLowerCase())
  );

  const isExactMatch = options.some(opt => (opt.nama || "").toLowerCase() === search.trim().toLowerCase());

  return (
    <div className="space-y-1 relative" ref={ref}>
      {/* Label */}
      {label && <label className="text-[11px] font-bold text-primary uppercase">{label}</label>}
      
      {/* Container Input & Badge */}
      <div 
        className="w-full px-2 py-1.5 min-h-[42px] bg-white border border-fourth rounded-xl focus-within:ring-2 focus-within:ring-primary flex flex-wrap gap-1 items-center cursor-text transition-all" 
        onClick={() => setIsOpen(true)}
      >
        {selected.length === 0 && !search && (
          <span className="text-gray-400 text-xs absolute left-3 pointer-events-none">{placeholder}</span>
        )}
        
        {/* Render item yang dipilih (Badge) */}
        {selected.map((item, idx) => (
          <span key={idx} className="bg-fourth text-primary px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-slate-200">
            {getLabel(item)} 
            <X size={10} className="cursor-pointer hover:text-red-500 transition-colors" onClick={(e) => removeOption(e, item)} />
          </span>
        ))}
        
        {/* Input Pencarian */}
        <input 
          type="text" 
          className="flex-1 min-w-[60px] outline-none bg-transparent text-sm h-full py-1" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          onFocus={() => setIsOpen(true)} 
          onKeyDown={handleKeyDown}
        />
        <ChevronDown size={14} className="text-gray-400 ml-auto mr-1" />
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-fourth rounded-xl shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
          
          {/* List Opsi Tersedia */}
          {filteredOptions.length > 0 && (
            <div className="py-1">
              {filteredOptions.map((opt) => (
                <div 
                  key={opt.id || opt.nama} 
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex justify-between ${selected.includes(getValue(opt)) ? 'text-primary font-bold bg-blue-50/50' : 'text-slate-600'}`} 
                  onClick={() => toggleOption(opt)}
                >
                  <span>{opt.nama}</span> 
                  {selected.includes(getValue(opt)) && <Check size={12} />}
                </div>
              ))}
            </div>
          )}

          {/* Jika tidak ada hasil pencarian */}
          {filteredOptions.length === 0 && !search.trim() && (
            <div className="px-3 py-3 text-xs text-gray-400 text-center italic">
              Tidak ada skill ditemukan
            </div>
          )}

          {/* Tombol Tambah Custom (Muncul jika ada ketikan dan belum exact match) */}
          {search.trim() !== "" && !isExactMatch && (
            <div 
              className="px-3 py-2.5 text-xs cursor-pointer text-primary font-bold hover:bg-blue-50 flex items-center gap-2 border-t border-slate-100 bg-slate-50 sticky bottom-0"
              onClick={handleAddCustom}
            >
              <Plus size={14} /> Tambah "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}