import React, { useMemo } from 'react';
import { MapPin, Briefcase, School, Store } from 'lucide-react';

export default function TopSebaran({ markers = [] }) {
  const provinceData = useMemo(() => {
    const data = {};

    markers.forEach(marker => {
      const prov = marker.provinsi;
      if (!prov) return;

      if (!data[prov]) {
        data[prov] = {
          nama: prov,
          total: 0,
          bekerja: 0,
          kuliah: 0,
          wirausaha: 0
        };
      }

      data[prov].total += marker.alumni_count;
      if (marker.type === 'bekerja') data[prov].bekerja += marker.alumni_count;
      else if (marker.type === 'kuliah') data[prov].kuliah += marker.alumni_count;
      else if (marker.type === 'wirausaha') data[prov].wirausaha += marker.alumni_count;
    });

    return Object.values(data)
      .filter(p => p.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [markers]);

  if (!provinceData || provinceData.length === 0) return null;

  const maxTotal = provinceData[0]?.total || 1;

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative z-0">
      {/* Header & Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
            <MapPin size={20} className="stroke-[2.5]" />
          </div>
          Top Sebaran Alumni
        </h3>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 bg-slate-50 py-2 px-4 rounded-full">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            Bekerja
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            Kuliah
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
            Wirausaha
          </div>
        </div>
      </div>

      {/* List Provinsi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {provinceData.map((item, idx) => {
          // Minimal lebar bar 5% agar warna tetap terlihat meski datanya kecil
          const barWidth = Math.max((item.total / maxTotal) * 100, 5);

          // Persentase masing-masing status untuk mengisi bar
          const pctBekerja = (item.bekerja / item.total) * 100;
          const pctKuliah = (item.kuliah / item.total) * 100;
          const pctWirausaha = (item.wirausaha / item.total) * 100;

          return (
            <div key={`${item.nama}-${idx}`} className="group relative">
              {/* Info Top */}
              <div className="flex justify-between items-end mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400 w-5">{idx + 1}.</span>
                  <span className="text-sm font-bold text-slate-700 truncate transition-colors">
                    {item.nama}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-800">{item.total}</span>
                  <span className="text-[10px] font-bold text-slate-400 ml-1">ALUMNI</span>
                </div>
              </div>

              {/* Stacked Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3 flex">
                <div
                  className="h-full flex transition-all duration-1000 ease-out rounded-full overflow-hidden"
                  style={{ width: `${barWidth}%` }}
                >
                  <div style={{ width: `${pctBekerja}%` }} className="bg-blue-500 h-full" title={`Bekerja: ${item.bekerja}`} />
                  <div style={{ width: `${pctKuliah}%` }} className="bg-emerald-400 h-full" title={`Kuliah: ${item.kuliah}`} />
                  <div style={{ width: `${pctWirausaha}%` }} className="bg-amber-400 h-full" title={`Wirausaha: ${item.wirausaha}`} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {item.bekerja > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600">
                    <Briefcase size={14} className="stroke-[2]" />
                    <span className="text-xs font-medium">Kerja</span>
                    <span className="text-xs font-semibold">{item.bekerja}</span>
                  </div>
                )}

                {item.kuliah > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600">
                    <School size={14} className="stroke-[2]" />
                    <span className="text-xs font-medium">Kuliah</span>
                    <span className="text-xs font-semibold">{item.kuliah}</span>
                  </div>
                )}

                {item.wirausaha > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600">
                    <Store size={14} className="stroke-[2]" />
                    <span className="text-xs font-medium">Usaha</span>
                    <span className="text-xs font-semibold">{item.wirausaha}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}