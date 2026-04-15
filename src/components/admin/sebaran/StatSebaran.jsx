import React from 'react';
import { Users, Briefcase, GraduationCap, Store } from 'lucide-react';

function StatCard({ icon: Icon, label, value, colorClass, iconBgClass }) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-fourth shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`p-3.5 rounded-xl ${iconBgClass}`}>
        <Icon size={24} className={colorClass} />
      </div>
      <div>
        <p className="text-[10px] font-black text-third uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-extrabold text-primary leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function StatSebaran({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard icon={Users} label="Total Alumni" value={stats.total_alumni_mapped || 0} colorClass="text-primary" iconBgClass="bg-primary/10" />
      <StatCard icon={Briefcase} label="Bekerja" value={stats.breakdown?.bekerja?.count || 0} colorClass="text-blue-500" iconBgClass="bg-blue-50" />
      <StatCard icon={GraduationCap} label="Kuliah" value={stats.breakdown?.kuliah?.count || 0} colorClass="text-emerald-500" iconBgClass="bg-emerald-50" />
      <StatCard icon={Store} label="Wirausaha" value={stats.breakdown?.wirausaha?.count || 0} colorClass="text-amber-500" iconBgClass="bg-amber-50" />
    </div>
  );
}