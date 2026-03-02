import React, { useEffect, useState } from 'react';
import {
    Plus,
    Trash2,
    Save,
    ChevronLeft,
    GripVertical,
    Calendar as CalendarIcon,
    Type,
    AlignLeft,
    LayoutList,
    ArrowLeft,
    Archive
} from 'lucide-react';
import { data, Link } from 'react-router-dom';
import SmoothDropdown from '../../components/admin/SmoothDropdown';
import DateRangePicker from '../../components/DatePicker';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { adminApi } from '../../api/admin';
import { alertSuccess } from '../../utilitis/alert';

const TambahKuisioner = () => {
    // State untuk Data Kuesioner (Box Kiri)


    const [statusKarir, setStatusKarir] = useState('')
    const [statusKarirData, setStatusKarirData] = useState([])

    const fetchData = async () => {
        try {
            const [dataKarir] = await Promise.all([
                adminApi.getStatus().catch(() => null)
            ])

            let datast = []
            if (dataKarir?.data?.data) {
                setStatusKarir(dataKarir.data.data)
                dataKarir.data.data.map((val) => {
                    datast.push(val.nama)
                })
            }

            setStatusKarirData(datast)
        } catch (error) {
            console.log(error)
        }
    }

    const [formData, setFormData] = useState({
        title: '',
        id_status: '',
        deskripsi: '',
        tanggalMulai: '',
        tanggalSelesai: '',
        status: ''
    });

    useEffect(() => {
        const call = async () => {
            const data = await fetchData()
        }

        call()
    }, [])


    useEffect(() => {
        if (statusKarirData?.length > 0) {
            setFormData(prev => ({
                ...prev,
                id_status: statusKarirData[0]
            }))
        }
    }, [statusKarirData])

    // State untuk Pertanyaan (Box Kanan)
    const [questions, setQuestions] = useState([
        { id: 1, text: '', options: ['Opsi 1'] }
    ]);

    // Handlers untuk Pertanyaan
    const addQuestion = () => {
        const newId = questions.length > 0 ? questions[questions.length - 1].id + 1 : 1;
        setQuestions([...questions, { id: newId, text: '', options: ['Opsi 1'] }]);
    };

    const removeQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestionText = (id, text) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
    };

    const addOption = (qId) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return { ...q, options: [...q.options, `Opsi ${q.options.length + 1}`] };
            }
            return q;
        }));
    };

    const updateOptionText = (qId, optIndex, text) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...q.options];
                newOptions[optIndex] = text;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const removeOption = (qId, optIndex) => {
        setQuestions(questions.map(q => {
            if (q.id === qId && q.options.length > 1) {
                return { ...q, options: q.options.filter((_, i) => i !== optIndex) };
            }
            return q;
        }));
    };

    const saveKuisioner = async (data) => {
        try {
            const temp = await adminApi.createKuesioner(data)
            alertSuccess(temp.message)
        } catch (error) {
            console.log(error)
        }
    }

    const handleDraft = async () => {
        const { tanggalMulai, tanggalSelesai, ...rest } = formData

        const statusObj = statusKarir.find(
            item => item.nama === formData.id_status
        )

        const payload = {
            ...rest,
            tanggal_mulai: tanggalMulai,
            tanggal_selesai: tanggalSelesai,
            id_status: statusObj?.id,
            status: "draft",
            created_at: new Date().toISOString()
        }

        await saveKuisioner(payload)
    }

    // console.log(statusKarir)
    return (
        <div className="space-y-6 max-w-full p-1 animate-in fade-in duration-700">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">

                    <Link
                        to="/wb-admin/kuisoner"
                        className="flex items-center gap-2 text-third hover:text-primary transition-colors text-sm font-medium group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Kembali
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDraft} className="cursor-pointer flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-orange-500 text-orange-600 rounded-xl text-sm font-bold shadow-sm hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Archive size={18} /> Simpan Draft
                        </button>
                        <button
                            className="cursor-pointer flex items-center gap-2 px-8 py-2.5 bg-[#3D5A5C] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2D4345] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={18} /> Publish
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT BOX: Konfigurasi Kuesioner (Sesuai Sketsa) */}
                    <div className="lg:col-span-4 space-y-6 sticky top-8">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                Data Kuesioner
                            </h2>

                            <div className="space-y-5">
                                {/* title */}
                                <div>
                                    <label className="text-[11px] font-bold text-secondary uppercase">Judul <span className="text-red-500">*</span></label>
                                    <div className="relative mt-3">
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-white border border-fourth rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Masukan title kuesioner.."
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Jenis Kuesioner */}
                                <div>
                                    <SmoothDropdown
                                        label="Target Karier"
                                        options={statusKarirData}
                                        placeholder="Pilih status karier"
                                        isRequired={true}
                                        value={'Bekerja'}
                                        onSelect={(val) => setFormData({ ...formData, id_status: val })}
                                    />
                                </div>

                                {/* Tanggal Mulai & Selesai */}
                                <DateRangePicker formData={formData} setFormData={setFormData} />

                                {/* Deskripsi */}
                                <div>
                                    <label className="text-[11px] font-bold text-secondary uppercase">Deskripsi Singkat</label>
                                    <div className="relative mt-3">                                        <textarea
                                        rows="4"
                                        className={`w-full p-2.5 bg-white border border-fourth rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary resize-none transition-all h-26.5`}
                                        placeholder="Berikan instruksi atau tujuan kuesioner..."
                                        onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                    ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT BOX: Daftar Pertanyaan (Google Form Style) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-150">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-primary">Daftar Pertanyaan Pilihan Ganda</h2>
                                <button
                                    onClick={addQuestion}
                                    className="cursor-pointer text-xs bg-secondary/10 text-secondary hover:bg-secondary hover:text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                                >
                                    <Plus size={16} /> Tambah Pertanyaan
                                </button>
                            </div>

                            <div className="space-y-8">
                                {questions.map((q, qIndex) => (
                                    <div key={q.id} className="group relative bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 p-6 rounded-2xl transition-all duration-300">
                                        {/* Drag Handle (Visual Only) */}
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 p-1 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <GripVertical size={20} />
                                        </div>

                                        <div className="flex gap-4">
                                            <span className="flex-none w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                                {qIndex + 1}
                                            </span>
                                            <div className="grow space-y-4">
                                                {/* Input Pertanyaan */}
                                                <div className="flex items-start gap-4">
                                                    <div className="grow">
                                                        <RichTextEditor
                                                            content={q.text}
                                                            onChange={(html) => updateQuestionText(q.id, html)}
                                                            placeholder="Ketik pertanyaan di sini..."
                                                            minHeight="80px"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removeQuestion(q.id)}
                                                        className="cursor-pointer p-2 text-slate-300 hover:text-red-500 transition-colors flex-none"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>

                                                {/* Pilihan Jawaban */}
                                                <div className="space-y-3 ml-2">
                                                    {q.options.map((opt, optIndex) => (
                                                        <div key={optIndex} className="flex items-start gap-3">
                                                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-none mt-3"></div>
                                                            <div className="grow">
                                                                <RichTextEditor
                                                                    content={opt}
                                                                    onChange={(html) => updateOptionText(q.id, optIndex, html)}
                                                                    placeholder={`Opsi ${optIndex + 1}`}
                                                                    minHeight="60px"
                                                                />
                                                            </div>
                                                            {q.options.length > 1 && (
                                                                <button
                                                                    onClick={() => removeOption(q.id, optIndex)}
                                                                    className="cursor-pointer text-slate-300 hover:text-red-500 transition-colors p-2 flex-none"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => addOption(q.id)}
                                                        className="cursor-pointer text-xs text-secondary font-bold flex items-center gap-1.5 ml-7 pt-2 hover:underline active:opacity-70"
                                                    >
                                                        <Plus size={14} /> Tambah Opsi
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {questions.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                                        <LayoutList size={48} className="mb-4 opacity-20" />
                                        <p className="text-sm font-medium">Belum ada pertanyaan ditambahkan.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TambahKuisioner;