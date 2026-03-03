import {
    Eye,
    Clock,
    Play,
    Archive,
    EyeOff,
    Info,
    Pencil,
    Trash2,
    Loader2,
    ScanEye,
    FolderSync,
} from 'lucide-react';
import hitungMundur from '../../utilitis/hitungMundurTanggal';
import { useNavigate } from 'react-router-dom';


export const KuesionerCard = ({ kuesioner, update, loadingUpdate, hapus, loadingHapus }) => {
    const { id, title, deskripsi, status, tanggal_selesai, status_karir } = kuesioner;
    const statusStyles = {
        aktif: "bg-green-100 text-green-700 border-green-200",
        draft: "bg-orange-100 text-orange-700 border-orange-200",
        nonaktif: "bg-red-100 text-red-700 border-red-200",
    };

    const navigate = useNavigate()
    const handleStatus = (id, data) => {
        update(id, data)
    }

    const handleHapus = (id) => {
        hapus(id)
    }

    const durasi = hitungMundur(tanggal_selesai)
    // console.log(id)
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    <Clock size={14} />
                    <span>Sisa: {durasi}</span>
                </div>
                <div className='flex items-center gap-1'>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${statusStyles[status]}`}>
                        {status === 'hidden' ? 'nonaktif' : status}
                    </span>
                    <button onClick={() => handleHapus(id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                        {
                            loadingHapus? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                </>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                </>
                            )
                        }
                    </button>
                </div>
            </div>

            <div className="mb-4 flex-grow">
                <h3 className="text-lg font-bold text-primary line-clamp-1 mb-1">{title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{deskripsi}</p>
            </div>

            <div className="mb-4">
                <span className={`text-[10px] text-primary uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border border-slate-200`}>
                    {status_karir.nama}
                </span>
            </div>
            
            <div className='flex gap-2'>
                <button onClick={() => navigate(`/wb-admin/kuisoner/preview-kuesioner/${id}`)} className="mb-3  flex items-center justify-center gap-1.5 bg-primary hover:bg-secondary text-white text-xs font-medium py-2.5 px-3 rounded-lg transition-colors cursor-pointer">
                    <ScanEye size={14} /> Preview
                </button>
                <button onClick={() => navigate(`/wb-admin/kuisoner/tinjau-jawaban/${id}`)}  className="mb-3 w-full flex items-center justify-center gap-1.5 bg-primary hover:bg-secondary text-white text-xs font-medium py-2.5 px-3 rounded-lg transition-colors cursor-pointer">
                    <FolderSync size={14} />Tinjau Jawaban
                </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50">
                <button onClick={() => navigate(`/wb-admin/kuisoner/update-kuesioner/${id}`)} title="Edit" className="flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer">
                    <Pencil size={14} /> Edit
                </button>
                {status === 'draft' && (
                    <button onClick={() => handleStatus(id, "aktif")} className="col-span-2 flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer">
                        {
                            loadingUpdate ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    
                                </>
                            ) : (
                                <>
                                    <Eye size={14} /> Aktif
                                </>
                            )
                        }
                    </button>
                )}
                {status === 'aktif' && (
                    <>
                        <button onClick={() => handleStatus(id, "hidden")} title="Hidden" className="flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer">
                            {
                                loadingUpdate ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        
                                    </>
                                ) : (
                                    <>
                                        <EyeOff size={14} /> Hidden
                                    </>
                                )
                            }


                        </button>
                        <button onClick={() => handleStatus(id, "draft")} title="Draft" className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer">


                            {
                                loadingUpdate ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        
                                    </>
                                ) : (
                                    <>
                                        <Archive size={14} /> Draft
                                    </>
                                )
                            }
                        </button>
                    </>
                )}
                {status === 'hidden' && (
                    <>
                        <button onClick={() => handleStatus(id, "aktif")} title="Aktif" className="flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer">
                            {
                                loadingUpdate ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        
                                    </>
                                ) : (
                                    <>
                                        <Eye size={14} /> Aktif
                                    </>
                                )
                            }
                        </button>
                        <button onClick={() => handleStatus(id, "draft")} title="Draft" className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer">
                            {
                                loadingUpdate ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        
                                    </>
                                ) : (
                                    <>
                                        <Archive size={14} /> Draft
                                    </>
                                )
                            }
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};