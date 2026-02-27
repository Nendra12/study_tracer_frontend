import React from 'react';
import { GripVertical, ListChecks, Pencil, Eye, Archive, EyeOff, Trash2 } from "lucide-react";

const QuestionCard = ({ q, onEdit, onUpdateStatus, onDelete }) => {
  return (
    <div className={`group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start gap-4 relative overflow-hidden ${
      q.status === "TERLIHAT" ? "border-l-4 border-l-primary" : 
      q.status === "DRAF" ? "border-l-4 border-l-orange-400" : "border-l-4 border-l-slate-300 bg-slate-50/50"
    }`}>
      <div className="hidden sm:block pt-1 cursor-grab text-slate-300 hover:text-slate-500">
        <GripVertical size={20} />
      </div>

      <div className="flex-1 w-full">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {q.category !== "Umum" && (
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
              <ListChecks size={12} /> {q.category}
            </span>
          )}
          {q.section && (
            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded tracking-wider">
              {q.section.judul}
            </span>
          )}
          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
            q.status === "TERLIHAT" ? "bg-green-100 text-green-700" : 
            q.status === "DRAF" ? "bg-orange-100 text-orange-700" : "bg-slate-200 text-slate-600"
          }`}>
            {q.status}
          </span>
        </div>
        <h4 className="font-bold text-slate-800 text-base mb-1">{q.text}</h4>
        <p className="text-xs text-slate-500 font-medium bg-slate-50 inline-block px-2 py-1 rounded border border-slate-100">{q.options}</p>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 mt-2 sm:mt-0">
        <button onClick={() => onEdit(q.id)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"><Pencil size={18} /></button>
        
        {q.status === "DRAF" && (
          <button onClick={() => onUpdateStatus(q.id, "TERLIHAT")} className="p-2 rounded-lg text-green-600 bg-green-50 hover:bg-green-100"><Eye size={18} /></button>
        )}

        {q.status === "TERLIHAT" && (
          <>
            <button onClick={() => onUpdateStatus(q.id, "DRAF")} className="p-2 rounded-lg text-orange-600 bg-orange-50 hover:bg-orange-100"><Archive size={18} /></button>
            <button onClick={() => onUpdateStatus(q.id, "TERSEMBUNYI")} className="p-2 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200"><EyeOff size={18} /></button>
          </>
        )}

        {q.status === "TERSEMBUNYI" && (
          <button onClick={() => onUpdateStatus(q.id, "TERLIHAT")} className="p-2 rounded-lg text-green-600 bg-green-50 hover:bg-green-100"><Eye size={18} /></button>
        )}

        <button onClick={() => onDelete(q.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
      </div>
    </div>
  );
};

export default QuestionCard;