import React, { useState, useRef, useEffect } from 'react';
import {
    Plus,
    Filter,
    ChevronDown,
    Ghost,
    FileQuestionMark,
    Archive,
    EyeOff,
    Eye
} from 'lucide-react';
import { KuesionerCard } from '../../components/admin/KuesionerCard';
import { adminApi } from '../../api/admin';
import { KuesionerSkeleton1, StatistikSkeleton, ToolbarSkeleton } from '../../components/admin/KuesionerSkletenon2';
import { alertConfirm, alertError, alertSuccess } from '../../utilitis/alert';
import { useNavigate } from 'react-router-dom';

export default function Kuesioner() {
    const [activeTab, setActiveTab] = useState('semua');
    const [activeKarier, setActiveKarier] = useState('Semua Karier');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const [karierOptions, setKarierOptions] = useState([]);
    const [dataKuesioner, setDataKuesioner] = useState([]);
    const [updateStatus, setUpdateStatus] = useState(false)
    const [loadingUpdate, setLoadingUpdate] = useState(false)
    const [loadingDelete, setLoadingDelete] = useState(false)

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [kuesioner] = await Promise.all([
                adminApi.getKuesioner().catch(() => null)
            ])

            let dataKues = []
            let statusKar = ["Semua Karier"]
            if (kuesioner?.data?.data?.data) {
                kuesioner.data.data.data.map((temp) => {
                    dataKues.push(temp)
                    if (!statusKar.includes(temp.status_karir.nama)) {
                        statusKar.push(temp.status_karir.nama)

                    }
                })
            }

            setKarierOptions(statusKar)
            setDataKuesioner(dataKues)

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchAll()
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredData = dataKuesioner.filter(item => {
        const matchesStatus = activeTab === 'semua' || item.status === activeTab;
        const matchesKarier = activeKarier === 'Semua Karier' || item.status_karir.nama === activeKarier;
        return matchesStatus && matchesKarier;
    });

    const handleStatus = async (id, data) => {
        const confirm = await alertConfirm(`Ubah status kuesioner menjadi "${data}"?`)
        if (!confirm.isConfirmed) return;
        try {
            setLoadingUpdate(true)
            let bodyPas = {
                "status": data
            }
            await adminApi.updateStatusKuesioner(id, bodyPas)
            alertSuccess("Kuesioner berhasil di update")
            setUpdateStatus(prev => !prev)
        } catch (error) {
            alertError(error)
        } finally {
            setLoadingUpdate(false)
        }
    }

    const handleHapusKuesioer = async (id) => {
        const confirm = await alertConfirm("Apakah anda yakin menghapus kuesioner ini? ")

        if (confirm.isConfirmed) {
            try {
                setLoadingDelete(true)
                const del = await adminApi.deleteKuesioner(id)
                alertSuccess(del.message)
                setUpdateStatus(prev => !prev)
            } catch (error) {
                alertError(error)
            } finally {
                setLoadingDelete(false)
            }
        } else {
            return
        }
    }

    useEffect(() => {
        const getData = async () => {
            await fetchAll()
        }
        getData()
    }, [updateStatus])

    return (
        <div className="space-y-6 max-w-full overflow-hidden p-1 animate-in fade-in duration-700">
            <div className="max-w-7xl mx-auto">
                {
                    loading ? (
                        <>
                            <StatistikSkeleton />
                            <ToolbarSkeleton />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <KuesionerSkeleton1 key={i} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: 'Total Kuesioner', val: `${dataKuesioner?.length}`, icon: FileQuestionMark },
                                    { label: 'Aktif', val: `${dataKuesioner?.filter(i => i.status === "aktif").length}`, icon: Eye },
                                    { label: 'Draft', val: `${dataKuesioner?.filter(i => i.status === "draft").length}`, icon: Archive },
                                    { label: 'Nonaktif', val: `${dataKuesioner?.filter(i => i.status === "hidden").length}`, icon: EyeOff },
                                ].map((item, i) => (
                                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
                                        <div>
                                            <p className="text-third text-xs md:text-sm font-medium">{item.label}</p>
                                            <h3 className="text-xl md:text-2xl font-bold text-primary mt-1">
                                                {item.val}
                                            </h3>
                                        </div>
                                        <div className="flex flex-col gap-2 xl:flex-row md:justify-between items-start">
                                            <div className="p-3 bg-fourth rounded-xl text-primary flex-shrink-0">
                                                <item.icon size={24} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Toolbar & Filter */}
                            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8">
                                <button onClick={() => navigate("/wb-admin/kuisoner/tambah-kuesioner")} className="cursor-pointer bg-primary text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold hover:bg-secondary transition-all shadow-sm">
                                    <Plus size={18} /> Tambah Kuesioner
                                </button>
                                <div className="flex flex-col md:flex-row bg-slate-200/50 p-1 rounded-xl gap-1 relative">
                                    <div className="flex bg-white/50 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
                                        {['semua', 'aktif', 'nonaktif', 'draft'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab == 'nonaktif' ? 'hidden' : tab)}
                                                className={`text-[10px] md:text-xs flex-1 md:flex-none cursor-pointer px-4 py-2 font-bold rounded-lg transition-all capitalize whitespace-nowrap ${(activeTab === tab) || (tab === "nonaktif" && activeTab === "hidden") ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-secondary"
                                                    }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Dropdown Wrapper */}
                                    <div className="relative" ref={menuRef}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsMenuOpen(!isMenuOpen);
                                            }}
                                            className='w-full flex text-[10px] md:text-xs gap-2 items-center justify-between cursor-pointer p-2.5 rounded-lg transition-all border bg-primary text-white hover:bg-secondary'
                                        >
                                            <div className="flex items-center gap-2 pointer-events-none">
                                                <Filter size={14} />
                                                <span className='font-bold'>{activeKarier}</span>
                                            </div>
                                            <ChevronDown size={14} className={`transition-transform pointer-events-none ${isMenuOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Dropdown Menu - Tambahkan z-50 dan top-full */}
                                        {isMenuOpen && (
                                            <div className="absolute right-0 top-full mt-2 w-full md:w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-[999] overflow-hidden">
                                                {karierOptions.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => {
                                                            setActiveKarier(opt);
                                                            setIsMenuOpen(false);
                                                        }}
                                                        className={`cursor-pointer w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 transition-colors block ${activeKarier === opt ? "text-primary bg-slate-50" : "text-slate-600"
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Grid Render */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <KuesionerCard key={item.id} kuesioner={item} update={handleStatus} loadingUpdate={loadingUpdate} hapus={handleHapusKuesioer} loadingHapus={loadingDelete} />
                                    ))
                                ) : (
                                    <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 md:p-20 flex flex-col items-center justify-center text-center">
                                        <Ghost size={40} className="text-slate-300 mb-4" />
                                        <h3 className="text-primary font-bold text-lg">Tidak ada data</h3>
                                        <p className="text-slate-500 text-sm">Coba ubah filter status atau karier Anda.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )

                }
            </div>
        </div>
    );
}