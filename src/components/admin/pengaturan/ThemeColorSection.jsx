import React from 'react';

export default function ThemeColorSection({
  primaryColor, setPrimaryColor, primaryPickerRef,
  secondaryColor, setSecondaryColor, secondaryPickerRef,
  thirdColor, setThirdColor, thirdPickerRef,
  handleColorTextChange
}) {
  const colors = [
    { label: 'Primary', sub: 'Warna utama', val: primaryColor, set: setPrimaryColor, ref: primaryPickerRef },
    { label: 'Secondary', sub: 'Latar belakang minor', val: secondaryColor, set: setSecondaryColor, ref: secondaryPickerRef },
    { label: 'Third', sub: 'Teks sekunder', val: thirdColor, set: setThirdColor, ref: thirdPickerRef },
  ];

  return (
    <section>
      <h3 className="text-lg font-bold text-primary mb-6 border-b border-gray-100 pb-2">Palet Warna Aplikasi</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {colors.map((item, i) => (
          <div key={i} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-gray-800">{item.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{item.sub}</p>
              </div>
              <input 
                type="color" 
                ref={item.ref} 
                value={item.val} 
                onChange={(e) => item.set(e.target.value)} 
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0 appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md shadow-sm" 
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">#</span>
              <input 
                type="text" 
                value={item.val} 
                onChange={(e) => handleColorTextChange(e.target.value, item.set, item.ref)} 
                className="w-full pl-7 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-mono uppercase text-gray-600 outline-none transition-all focus:ring-1 focus:ring-primary/20 focus:border-primary" 
                placeholder="XXXXXX" 
                maxLength={7} 
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}