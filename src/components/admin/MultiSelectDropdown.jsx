import React, { useState, useEffect, useRef } from "react";
import { X, Check, ChevronDown } from "lucide-react";

const MultiSelectDropdown = ({ options = [], selected = [], onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className="w-full px-2 py-2 min-h-[38px] text-xs border border-gray-200 rounded focus-within:ring-1 focus-within:ring-primary bg-white cursor-text flex flex-wrap gap-1 items-center"
        onClick={() => setIsOpen(true)}
      >
        {selected.length === 0 && !search && (
          <span className="text-gray-400 absolute left-2 pointer-events-none">{placeholder}</span>
        )}
        {selected.map((item, idx) => (
          <span key={idx} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1">
            {item}
            <X size={12} className="cursor-pointer hover:text-blue-800" onClick={(e) => removeOption(e, item)} />
          </span>
        ))}
        <input
          type="text"
          className="flex-1 min-w-[60px] outline-none bg-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <ChevronDown size={14} className="text-gray-400 ml-auto" />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.id}
                className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex items-center justify-between ${selected.includes(opt.nama) ? 'bg-blue-50 font-medium text-primary' : 'text-slate-600'}`}
                onClick={() => toggleOption(opt.nama)}
              >
                <span>{opt.nama}</span>
                {selected.includes(opt.nama) && <Check size={14} />}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-gray-400 italic">Tidak ada opsi ditemukan</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;