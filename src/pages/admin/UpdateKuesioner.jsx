import React, { useEffect, useState } from 'react';
import {
    Plus,
    Trash2,
    Save,
    GripVertical,
    Calendar as CalendarIcon,
    LayoutList,
    ArrowLeft,
    AlertCircle
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SmoothDropdown from '../../components/admin/SmoothDropdown';
import DateRangePicker from '../../components/DatePicker';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { adminApi } from '../../api/admin';
import { alertSuccess, alertError } from '../../utilitis/alert';
import { parseISO, isBefore } from 'date-fns';
import TambahKuesionerSkeleton from '../../components/admin/skeleton/TambahKuesionerSkeleton';

const UpdateKuesioner = () => {
    // State untuk Data Kuesioner (Box Kiri)

    const { id } = useParams()
    const navigate = useNavigate()
    const [statusKarir, setStatusKarir] = useState('')
    const [statusKarirData, setStatusKarirData] = useState([])
    const [errors, setErrors] = useState({})
    const [isValidating, setIsValidating] = useState(false)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        id_status: '',
        deskripsi: '',
        tanggalMulai: '',
        tanggalSelesai: '',
        status: ''
    });

    // State untuk Pertanyaan (Box Kanan)
    const [questions, setQuestions] = useState([
        { id: 1, text: '', options: ['Opsi 1'] }
    ]);

    const fetchData = async (id) => {
        try {
            setLoading(true)
            const [dataKarir, kuesionerDatas] = await Promise.all([
                adminApi.getStatus().catch(() => null),
                adminApi.getKuesionerDetail(id).catch(() => null)
            ])

            let datast = []
            if (dataKarir?.data?.data) {
                setStatusKarir(dataKarir.data.data)
                dataKarir.data.data.map((val) => {
                    datast.push(val.nama)
                })
            }

            setStatusKarirData(datast)

            let dataKuess = {}
            let loadedQuestions = []

            if (kuesionerDatas?.data?.data) {
                const kuesiners = kuesionerDatas.data.data
                dataKuess = {
                    "title": kuesiners.title,
                    "id_status": kuesiners.status_karir.nama,
                    "deskripsi": kuesiners.deskripsi,
                    "tanggalMulai": kuesiners.tanggal_mulai,
                    "tanggalSelesai": kuesiners.tanggal_selesai,
                    "status": kuesiners.status
                }

                // Load pertanyaan dan opsi jawaban
                if (kuesiners.pertanyaan && kuesiners.pertanyaan.length > 0) {
                    loadedQuestions = kuesiners.pertanyaan.map((pertanyaan) => ({
                        id: pertanyaan.id,
                        text: pertanyaan.isi_pertanyaan || '', // HTML content dari database
                        options: pertanyaan.opsi && pertanyaan.opsi.length > 0
                            ? pertanyaan.opsi.map(opt => opt.opsi) // HTML content dari database
                            : ['Opsi 1']
                    }))
                }
            }

            setFormData(dataKuess)

            // Set questions jika ada data, atau gunakan default
            if (loadedQuestions.length > 0) {
                setQuestions(loadedQuestions)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchData(id)
    }, [id])

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

    // Fungsi Validasi
    const validateForm = (isDraft = false) => {
        const newErrors = {};
        const now = new Date();

        // Validasi Title
        if (!formData.title || formData.title.trim() === '') {
            newErrors.title = 'Judul kuesioner wajib diisi';
        } else if (formData.title.trim().length < 5) {
            newErrors.title = 'Judul minimal 5 karakter';
        }

        // Validasi Status Karier
        if (!formData.id_status) {
            newErrors.id_status = 'Target karier wajib dipilih';
        }

        // Validasi Tanggal untuk Publish (wajib), optional untuk Draft
        if (!isDraft) {
            if (!formData.tanggalMulai) {
                newErrors.tanggalMulai = 'Tanggal mulai wajib diisi untuk publish';
            } else {
                // Validasi waktu mulai tidak boleh kurang dari sekarang
                const startDate = parseISO(formData.tanggalMulai);
                if (isBefore(startDate, now)) {
                    newErrors.tanggalMulai = 'Waktu mulai tidak boleh kurang dari sekarang';
                }
            }

            if (!formData.tanggalSelesai) {
                newErrors.tanggalSelesai = 'Tanggal selesai wajib diisi untuk publish';
            } else if (formData.tanggalMulai) {
                const startDate = parseISO(formData.tanggalMulai);
                const endDate = parseISO(formData.tanggalSelesai);
                if (isBefore(endDate, startDate)) {
                    newErrors.tanggalSelesai = 'Tanggal selesai harus lebih besar dari tanggal mulai';
                }
            }
        } else {
            // Untuk draft, jika tanggal diisi, tetap validasi
            if (formData.tanggalMulai) {
                const startDate = parseISO(formData.tanggalMulai);
                if (isBefore(startDate, now)) {
                    newErrors.tanggalMulai = 'Waktu mulai tidak boleh kurang dari sekarang';
                }
            }

            if (formData.tanggalMulai && formData.tanggalSelesai) {
                const startDate = parseISO(formData.tanggalMulai);
                const endDate = parseISO(formData.tanggalSelesai);
                if (isBefore(endDate, startDate)) {
                    newErrors.tanggalSelesai = 'Tanggal selesai harus lebih besar dari tanggal mulai';
                }
            }
        }

        // Validasi Pertanyaan untuk Publish
        if (!isDraft) {
            if (questions.length === 0) {
                newErrors.questions = 'Minimal harus ada 1 pertanyaan untuk publish';
            } else {
                // Validasi setiap pertanyaan
                const emptyQuestions = questions.filter(q => !q.text || q.text.trim() === '' || q.text === '<p></p>');
                if (emptyQuestions.length > 0) {
                    newErrors.questions = `Ada ${emptyQuestions.length} pertanyaan yang belum diisi`;
                }

                // Validasi opsi jawaban
                const invalidOptions = questions.filter(q => {
                    const filledOptions = q.options.filter(opt => opt && opt.trim() !== '' && opt !== '<p></p>');
                    return filledOptions.length < 2;
                });

                if (invalidOptions.length > 0) {
                    newErrors.options = `Setiap pertanyaan harus memiliki minimal 2 opsi jawaban yang terisi`;
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveKuisioner = async (data) => {
        data["questions"] = questions
        try {
            const temp = await adminApi.updateKuesioner(id, data)
            alertSuccess(temp.data?.message || 'Kuesioner berhasil diperbarui')
            navigate("/wb-admin/kuisoner")
        } catch (error) {
            console.log(error)
            alertError(error.response?.data?.message || 'Gagal memperbarui kuesioner')
        }
        console.log(data)
    }

    const handleSimpan = async () => {
        setIsValidating(true);

        // Validasi dengan mode publish (lebih ketat)
        if (!validateForm(false)) {
            setIsValidating(false);
            alertError('Mohon lengkapi semua data yang diperlukan sebelum publish');
            // Scroll ke error pertama
            setTimeout(() => {
                const errorElement = document.querySelector('[data-error="true"]');
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return;
        }

        const { tanggalMulai, tanggalSelesai, ...rest } = formData

        const statusObj = statusKarir.find(
            item => item.nama === formData.id_status
        )

        const payload = {
            ...rest,
            tanggal_mulai: tanggalMulai,
            tanggal_selesai: tanggalSelesai,
            id_status: statusObj?.id,
            status: formData.status,
            created_at: new Date().toISOString()
        }

        await saveKuisioner(payload)
        setIsValidating(false);
    }

    if (loading) {
        return (
            <TambahKuesionerSkeleton />
        )
    }
    // console.log(statusKarir)
    return (
        <div className="space-y-6 max-w-full overflow-hidden p-1 animate-in fade-in duration-700">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">

                    <Link
                        to="/wb-admin/kuisoner"
                        className="flex items-center gap-2 text-third hover:text-primary transition-colors text-sm font-medium group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="inline">Kembali</span>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleSimpan}
                            disabled={isValidating}
                            className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 bg-[#3D5A5C] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2D4345] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={18} /> {isValidating ? 'Memproses...' : 'Simpan'}
                        </button>
                    </div>
                </div>

                {/* Error Summary */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-red-800 mb-2">Terdapat kesalahan pada form:</h3>
                                <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                                    {Object.entries(errors).map(([key, value]) => (
                                        <li key={key}>{value}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">

                    {/* LEFT BOX: Konfigurasi Kuesioner (Sesuai Sketsa) */}
                    <div className="lg:col-span-4 space-y-4 sm:space-y-6 lg:sticky">
                        <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                            <h2 className="text-base sm:text-lg font-bold text-primary mb-4 sm:mb-6 flex items-center gap-2">
                                Data Kuesioner
                            </h2>

                            <div className="space-y-4 sm:space-y-5">
                                {/* title */}
                                <div data-error={!!errors.title}>
                                    <label className="text-[10px] sm:text-[11px] font-bold text-secondary uppercase">Judul <span className="text-red-500">*</span></label>
                                    <div className="relative mt-2 sm:mt-3">
                                        <input
                                            type="text"
                                            className={`w-full p-2.5 sm:p-3 bg-white border ${errors.title ? 'border-red-400 focus:ring-red-400' : 'border-fourth focus:ring-primary'} rounded-lg sm:rounded-xl text-sm outline-none focus:ring-2 transition-all`}
                                            placeholder="Masukan title kuesioner.."
                                            value={formData.title}
                                            onChange={(e) => {
                                                setFormData({ ...formData, title: e.target.value });
                                                if (errors.title) {
                                                    setErrors({ ...errors, title: null });
                                                }
                                            }}
                                        />
                                    </div>
                                    {errors.title && (
                                        <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.title}
                                        </p>
                                    )}
                                </div>

                                {/* Jenis Kuesioner */}
                                <div data-error={!!errors.id_status}>
                                    <SmoothDropdown
                                        label="Target Karier"
                                        options={statusKarirData}
                                        placeholder="Pilih status karier"
                                        isRequired={true}
                                        value={formData.id_status || 'Bekerja'}
                                        onSelect={(val) => {
                                            setFormData({ ...formData, id_status: val });
                                            if (errors.id_status) {
                                                setErrors({ ...errors, id_status: null });
                                            }
                                        }}
                                    />
                                    {errors.id_status && (
                                        <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.id_status}
                                        </p>
                                    )}
                                </div>

                                {/* Tanggal Mulai & Selesai */}
                                <div data-error={!!(errors.tanggalMulai || errors.tanggalSelesai)}>
                                    <DateRangePicker
                                        formData={formData}
                                        setFormData={(data) => {
                                            setFormData(data);
                                            // Clear errors when dates change
                                            if (errors.tanggalMulai || errors.tanggalSelesai) {
                                                const newErrors = { ...errors };
                                                delete newErrors.tanggalMulai;
                                                delete newErrors.tanggalSelesai;
                                                setErrors(newErrors);
                                            }
                                        }}
                                        errors={errors}
                                    />
                                    {(errors.tanggalMulai || errors.tanggalSelesai) && (
                                        <div className="mt-2 space-y-1">
                                            {errors.tanggalMulai && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {errors.tanggalMulai}
                                                </p>
                                            )}
                                            {errors.tanggalSelesai && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {errors.tanggalSelesai}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Deskripsi */}
                                <div>
                                    <label className="text-[10px] sm:text-[11px] font-bold text-secondary uppercase">Deskripsi Singkat</label>
                                    <div className="relative mt-2 sm:mt-3">
                                        <textarea
                                            rows="4"
                                            className={`w-full p-2.5 bg-white border border-fourth rounded-lg sm:rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary resize-none transition-all h-26.5`}
                                            placeholder="Berikan instruksi atau tujuan kuesioner..."
                                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                            value={formData.deskripsi || ""}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT BOX: Daftar Pertanyaan (Google Form Style) */}
                    <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                        <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm min-h-150" data-error={!!(errors.questions || errors.options)}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-slate-100">
                                <div className="flex-1 w-full sm:w-auto">
                                    <h2 className="text-base sm:text-lg font-bold text-primary">Daftar Pertanyaan Pilihan Ganda</h2>
                                    {(errors.questions || errors.options) && (
                                        <div className="mt-2 space-y-1">
                                            {errors.questions && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {errors.questions}
                                                </p>
                                            )}
                                            {errors.options && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {errors.options}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={addQuestion}
                                    className="cursor-pointer w-full sm:w-auto text-xs bg-secondary/10 text-secondary hover:bg-secondary hover:text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> <span className="hidden sm:inline">Tambah Pertanyaan</span><span className="sm:hidden">Tambah</span>
                                </button>
                            </div>

                            <div className="space-y-6 sm:space-y-8">
                                {questions.map((q, qIndex) => (
                                    <div key={q.id} className="group relative bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-300">
                                        {/* Drag Handle (Visual Only) - Hidden on mobile */}
                                        <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 p-1 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <GripVertical size={20} />
                                        </div>

                                        <div className="flex gap-3 sm:gap-4">
                                            <span className="flex-none w-7 h-7 sm:w-8 sm:h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm">
                                                {qIndex + 1}
                                            </span>
                                            <div className="grow space-y-3 sm:space-y-4">
                                                {/* Input Pertanyaan */}
                                                <div className="flex items-center justify-between gap-2 sm:gap-4">
                                                    <div className="grow w-full">
                                                        <RichTextEditor
                                                            content={q.text}
                                                            onChange={(html) => updateQuestionText(q.id, html)}
                                                            placeholder="Ketik pertanyaan di sini..."
                                                            minHeight="80px"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removeQuestion(q.id)}
                                                        className="cursor-pointer p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                                    >
                                                        <Trash2 size={16} className="sm:w-4.5 sm:h-4.5" />
                                                    </button>
                                                </div>

                                                {/* Pilihan Jawaban */}
                                                <div className="space-y-2 sm:space-y-3 ml-1 sm:ml-2">
                                                    {q.options.map((opt, optIndex) => (
                                                        <div key={optIndex} className="flex items-start gap-2 sm:gap-3">
                                                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-slate-300 flex-none mt-2.5 sm:mt-3"></div>
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
                                                                    className="cursor-pointer text-slate-300 hover:text-red-500 transition-colors p-1.5 sm:p-2 flex-none rounded-lg hover:bg-red-50"
                                                                >
                                                                    <Trash2 size={13} className="sm:w-3.5 sm:h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => addOption(q.id)}
                                                        className="cursor-pointer text-xs text-secondary font-bold flex items-center gap-1.5 ml-5 sm:ml-7 pt-2 hover:underline active:opacity-70"
                                                    >
                                                        <Plus size={14} /> Tambah Opsi
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {questions.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl sm:rounded-3xl">
                                        <LayoutList size={36} className="sm:w-12 sm:h-12 mb-3 sm:mb-4 opacity-20" />
                                        <p className="text-xs sm:text-sm font-medium text-center px-4">Belum ada pertanyaan ditambahkan.</p>
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

export default UpdateKuesioner;