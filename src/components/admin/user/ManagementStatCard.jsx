import React from 'react';
import { Loader2 } from 'lucide-react';

const ManagementStatCard = ({ title, value, trend, icon: Icon, iconBg, iconColor, loading }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between group">
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-slate-800 group-hover:text-primary transition-colors">
          {loading ? <Loader2 size={24} className="animate-spin" /> : value}
        </h3>
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
            {trend}
          </span>
        </div>
      )}
    </div>
    <div className={`p-3 rounded-xl ${iconBg} ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={24} />
    </div>
  </div>
);

export default ManagementStatCard;
