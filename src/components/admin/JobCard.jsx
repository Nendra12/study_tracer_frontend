import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Layers, CalendarClock, Check, X, Pencil, RotateCcw, Trash2, Tag } from "lucide-react";
import banner from "../../assets/banner.jfif";
import { STORAGE_BASE_URL } from "../../api/axios";
import hitungMundur from "../../utilitis/hitungMundurTanggal";
import { adminApi } from "../../api/admin";

// Fungsi helper status harus ada di sini
const getDisplayStatus = (job) => {
  if (job.approval_status === "pending") return "MENUNGGU PERSETUJUAN";
  if (job.status === "closed") return "BERAKHIR";
  if (job.approval_status === "rejected") return "DITOLAK";
  if (job.status === "published" && job.approval_status === "approved") return "AKTIF";
  if (job.status === "draft") return "DRAFT";
  return job.status?.toUpperCase() || "-";
};

const JobCard = ({ job, onApprove, onReject, onDelete, onRepost, onEdit }) => {
  const navigate = useNavigate();
  const displayStatus = getDisplayStatus(job);

  const getStatusColor = (status) => {
    switch (status) {
      case "MENUNGGU PERSETUJUAN": return "bg-orange-100 text-orange-600 border-orange-200";
      case "AKTIF": return "bg-green-100 text-green-600 border-green-200";
      case "BERAKHIR": case "DITOLAK": return "bg-red-100 text-red-600 border-red-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getBorderColor = (status) => {
    switch (status) {
      case "MENUNGGU PERSETUJUAN": return "border-l-4 border-l-orange-400";
      case "AKTIF": return "border-l-4 border-l-green-400";
      case "BERAKHIR": case "DITOLAK": return "border-l-4 border-l-red-400";
      default: return "border-l-4 border-l-gray-400";
    }
  };

  const fotoUrl = job.foto
    ? (job.foto.startsWith('http') ? job.foto : `${STORAGE_BASE_URL}/${job.foto}`)
    : banner;

  let durasi = ''
  // console.log(job.id, " ; ", job.jam_berakhir)
  const now = new Date()
  if (job.lowongan_selesai && job.jam_berakhir) {
    const tanggalJamSelesai = new Date(`${job.lowongan_selesai}T${job.jam_berakhir}`)

    if (tanggalJamSelesai <= now) {
      durasi = "selesai"

      const action = async () => {
        try {
          await adminApi.updateLowonganStatus(job.id, "closed")

        } catch (error) {
          console.log(error)
        }
      }

      action()
    } else {
      durasi = hitungMundur(tanggalJamSelesai)
    }

  } else {
    durasi = "-"
  }

  return (
    <div
      onClick={() => navigate(`/wb-admin/jobs/job-detail/${job.id}`)}
      className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 cursor-pointer group/card ${getBorderColor(displayStatus)}`}
    >
      <div className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0 w-full">
        <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 relative group-hover/card:shadow-inner transition-all">
          <img src={fotoUrl} alt={job.judul} className="w-full h-full object-cover opacity-90 group-hover/card:scale-105 transition-transform duration-500" onError={(e) => { e.target.src = banner; }} />
        </div>

        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getStatusColor(displayStatus)}`}>{displayStatus}</span>
            {job.lowongan_selesai && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-md">
                <CalendarClock size={10} /> Berakhir {durasi}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-800 truncate group-hover/card:text-primary transition-colors leading-tight">{job.judul}</h3>
            <p className="text-xs font-bold text-gray-400 mt-0.5">{job.perusahaan?.nama || '-'}</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 font-bold items-center">
            <div className="flex items-center gap-1.5"><MapPin size={12} className="text-gray-400" /> {job.lokasi || job.perusahaan?.kota?.nama || '-'}</div>
            {job.tipe_pekerjaan && (
              <div className="flex items-center gap-1.5"><Layers size={12} className="text-gray-400" /> {job.tipe_pekerjaan}</div>
            )}
          </div>
          {/* Skills tags */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {job.skills.slice(0, 4).map((skill) => (
                <span key={skill.id} className="flex items-center gap-1 px-2 py-0.5 bg-[#E8F0F0] text-[#3C5759] text-[10px] font-bold rounded-md">
                  <Tag size={9} /> {skill.nama}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-md">+{job.skills.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 border-gray-50 pt-3 md:pt-0 mt-2 md:mt-0" onClick={(e) => e.stopPropagation()}>
        {displayStatus === "MENUNGGU PERSETUJUAN" ? (
          <div className="flex items-center gap-2">
            <button onClick={() => onApprove(job.id)} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"><Check size={14} /> Setujui</button>
            <button onClick={() => onReject(job.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"><X size={16} /></button>
            <button onClick={() => onEdit(job)} className="p-2 text-gray-400 hover:text-primary cursor-pointer"><Pencil size={18} /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {(displayStatus === "BERAKHIR" || displayStatus === "DITOLAK") && (
              <button onClick={() => onRepost(job.id)} className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100 cursor-pointer"><RotateCcw size={18} /></button>
            )}
            <button onClick={() => onEdit(job)} className="p-2 text-slate-500 bg-slate-50 hover:text-primary rounded-xl border border-slate-100 cursor-pointer"><Pencil size={18} /></button>
            <button onClick={() => onDelete(job.id)} className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-100 cursor-pointer"><Trash2 size={18} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;