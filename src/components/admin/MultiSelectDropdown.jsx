import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Check } from "lucide-react";

export default function MultiSelectDropdown({ label, options = [], selected = [], onChange, placeholder }) {
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

  const toggleOption = (optionName) => {
    let newSelected = selected.includes(optionName) 
      ? selected.filter(item => item !== optionName) 
      : [...selected, optionName];
    onChange(newSelected);
  };

  const removeOption = (e, optionName) => {
    e.stopPropagation();
    onChange(selected.filter(item => item !== optionName));
  };

  const filteredOptions = options.filter(opt =>
    (opt.nama || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-1 relative" ref={ref}>
      {/* Label yang dibutuhkan oleh Step2Profile */}
      {label && <label className="text-[11px] font-bold text-secondary uppercase">{label}</label>}
      
      <div 
        className="w-full px-2 py-1.5 min-h-[42px] bg-white border border-fourth rounded-xl focus-within:ring-2 focus-within:ring-primary flex flex-wrap gap-1 items-center cursor-text transition-all" 
        onClick={() => setIsOpen(true)}
      >
        {selected.length === 0 && !search && (
          <span className="text-gray-400 text-xs absolute left-3 pointer-events-none">{placeholder}</span>
        )}
        
        {/* Render item yang dipilih */}
        {selected.map((item, idx) => (
          <span key={idx} className="bg-fourth text-secondary px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-slate-200">
            {item} 
            <X size={10} className="cursor-pointer hover:text-red-500 transition-colors" onClick={(e) => removeOption(e, item)} />
          </span>
        ))}
        
        <input 
          type="text" 
          className="flex-1 min-w-[60px] outline-none bg-transparent text-sm h-full" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          onFocus={() => setIsOpen(true)} 
        />
        <ChevronDown size={14} className="text-gray-400 ml-auto" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-fourth rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div 
                key={opt.id} 
                className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex justify-between ${selected.includes(opt.nama) ? 'text-primary font-bold bg-blue-50/50' : 'text-slate-600'}`} 
                onClick={() => toggleOption(opt.nama)}
              >
                <span>{opt.nama}</span> 
                {selected.includes(opt.nama) && <Check size={12} />}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-gray-400 text-center">Tidak ada skill ditemukan</div>
          )}
        </div>
      )}
    </div>
  );
}