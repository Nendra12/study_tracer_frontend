import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

export default function SelectInput({ label, value, options, onSelect, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const clickOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  // Mencari label untuk ditampilkan berdasarkan value (ID) yang dipilih
  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : value;

  return (
    <div className="space-y-1 relative" ref={ref}>
      <label className="text-[11px] font-bold text-secondary uppercase">
        {label} <span className="text-red-500">*</span>
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-3 py-2.5 bg-white border border-fourth rounded-xl text-sm flex justify-between items-center cursor-pointer hover:border-primary transition-all"
      >
        <span className={displayLabel ? "text-slate-800" : "text-gray-400"}>
          {displayLabel || placeholder}
        </span>
        <div className="flex gap-1 items-center">
          {value && (
            <X 
              size={14} 
              className="text-gray-400 hover:text-red-500" 
              onClick={(e) => { e.stopPropagation(); onSelect(""); }} 
            />
          )}
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-fourth rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {options.map((opt, idx) => (
            <div 
              key={idx} 
              onClick={() => { onSelect(opt.value); setIsOpen(false); }} 
              className={`px-3 py-2 text-xs cursor-pointer hover:bg-fourth ${value === opt.value ? "font-bold text-primary" : "text-slate-600"}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}