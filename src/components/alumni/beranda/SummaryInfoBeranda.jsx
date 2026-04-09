import React from 'react';

export default function SummaryInfoBeranda({ tahunLulus, jurusan, statusNew, place, DateIcon, EducationIcon, UserIcon, BuildingIcon }) {
  const summaryItems = [
    { label: "Tahun Lulus", value: tahunLulus || "-", icon: DateIcon },
    { label: "Jurusan", value: jurusan || "-", icon: EducationIcon },
    { label: "Status Saat Ini", value: statusNew || "-", icon: UserIcon },
    { label: `${statusNew === "Bekerja" ? 'Instansi/Perusahaan' : 'Universitas'}`, value: place || "-", icon: BuildingIcon },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {summaryItems.map((item, idx) => (
        <div key={idx} className="bg-white p-4 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100/50">
            <img src={item.icon} alt="" className="w-6 h-6 opacity-75"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5 line-clamp-1" title={item.label}>{item.label}</p>
            <p className="text-sm font-black text-primary leading-tight line-clamp-2" title={item.value}>{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}