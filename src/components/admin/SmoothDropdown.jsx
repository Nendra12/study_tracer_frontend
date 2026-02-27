import React, { useEffect, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function SmoothDropdown({
  label,
  options = [],
  placeholder = "Pilih opsi",
  isRequired = false,
  value = null,
  message = '',
  onSelect // Callback fungsi jika kamu butuh data di komponen parent
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) onSelect(option); // Mengirim data ke parent jika ada
  };

  useEffect(() => {
    setSelected(value)
  }, [value])

  // console.log("Komxol : ", value)

  return (
    <div className="space-y-1 w-full relative">
      {/* Label Dinamis */}
      {label && (
        <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">
          {label} {isRequired ? <span className="text-red-500">*</span> : <span className="text-[9px] text-third italic">{message }</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${label ? 'mt-2' : ''} w-full p-3 bg-white cursor-pointer border-2 flex items-center justify-between rounded-xl text-sm transition-all duration-200 outline-none
          ${isOpen ? 'border-primary shadow-sm' : 'border-fourth hover:border-primary/50'}`}
      >
        <span className={selected ? 'text-primary font-medium' : 'text-third'}>
          {selected || placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`text-third transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute z-20 w-full mt-2 bg-white border border-fourth rounded-xl shadow-lg overflow-hidden transition-all duration-200 origin-top
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
      >
        <ul className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
          {options.length > 0 ? (
            options.map((option) => (
              <li
                key={option}
                onClick={() => handleSelect(option)}
                className="flex items-center justify-between px-4 py-3 text-sm cursor-pointer text-secondary hover:bg-fourth hover:text-primary transition-colors duration-150"
              >
                <span className={selected === option ? "font-bold text-primary" : ""}>
                  {option}
                </span>
                {selected === option && <Check size={16} className="text-primary" />}
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-xs text-third italic">Opsi tidak tersedia</li>
          )}
        </ul>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
