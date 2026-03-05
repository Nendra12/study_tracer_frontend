import React, { useEffect, useState } from 'react';
import {
    Plus,
    Trash2,
    Save,
    GripVertical,
    LayoutList,
    ArrowLeft,
    Archive,
    AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SmoothDropdown from '../../components/admin/SmoothDropdown';
import DateRangePicker from '../../components/DatePicker';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { adminApi } from '../../api/admin';
import { alertSuccess, alertError } from '../../utilitis/alert';
import { parseISO, isBefore } from 'date-fns';

const TambahKuisioner = () => {
    const navigate = useNavigate();
    const [statusKarir, setStatusKarir] = useState([]);
    const [statusKarirData, setStatusKarirData] = useState([]);
    const [errors, setErrors] = useState({});
    const [isValidating, setIsValidating] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        id_status: '',
        deskripsi: '',
        tanggalMulai: '',
        tanggalSelesai: '',
        status: ''
    });

    const [questions, setQuestions] = useState([
        { id: 1, text: '', options: ['Opsi 1'] }
    ]);

    const fetchData = async () => {
        try {
            const dataKarir = await adminApi.getStatus();
            if (dataKarir?.data?.data) {
                setStatusKarir(dataKarir.data.data);
                const names = dataKarir.data.data.map((val) => val.nama);
                setStatusKarirData(names);
                if (names.length > 0) {
                    setFormData(prev => ({ ...prev, id_status: names[0] }));
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers
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

    const validateForm = (isDraft = false) => {
        const newErrors = {};
        const now = new Date();

        if (!formData.title?.trim()) {
            newErrors.title = 'Judul kuesioner wajib diisi';
        } else if (formData.title.trim().length < 5) {
            newErrors.title = 'Judul minimal 5 karakter';
        }

        if (!formData.id_status) {
            newErrors.id_status = 'Target karier wajib dipilih';
        }

        if (!isDraft) {
            if (!formData.tanggalMulai) newErrors.tanggalMulai = 'Tanggal mulai wajib diisi';
            if (!formData.tanggalSelesai) newErrors.tanggalSelesai = 'Tanggal selesai wajib diisi';

            if (formData.tanggalMulai && formData.tanggalSelesai) {
                if (isBefore(parseISO(formData.tanggalSelesai), parseISO(formData.tanggalMulai))) {
                    newErrors.tanggalSelesai = 'Tanggal selesai harus setelah tanggal mulai';
                }
            }

            if (questions.length === 0) {
                newErrors.questions = 'Minimal harus ada 1 pertanyaan';
            } else {
                const emptyQuestions = questions.filter(q => !q.text || q.text.trim() === '' || q.text === '<p></p>');
                if (emptyQuestions.length > 0) newErrors.questions = `Ada ${emptyQuestions.length} pertanyaan kosong`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveKuisioner = async (payload) => {
        try {
            const temp = await adminApi.createKuesioner(payload);
            alertSuccess(temp.message || 'Kuesioner berhasil disimpan');
            navigate("/wb-admin/kuisoner");
        } catch (error) {
            alertError(error.response?.data?.message || 'Gagal menyimpan');
        }
    };

    const handleAction = async (isDraft) => {
        setIsValidating(true);
        if (!validateForm(isDraft)) {
            setIsValidating(false);
            alertError('Cek kembali pengisian form Anda');
            return;
        }

        const statusObj = statusKarir.find(item => item.nama === formData.id_status);
        const payload = {
            ...formData,
            tanggal_mulai: formData.tanggalMulai || null,
            tanggal_selesai: formData.tanggalSelesai || null,
            id_status: statusObj?.id,
            status: isDraft ? "draft" : "aktif",
            questions: questions
        };

        await saveKuisioner(payload);
        setIsValidating(false);
    };

    return (
        <div className="space-y-6 max-w-full overflow-hidden p-1 animate-in fade-in duration-700">
            <div className="max-w-7xl mx-auto">

                {/* Responsive Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <Link
                        to="/wb-admin/kuisoner"
                        className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium group w-fit"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Kembali
                    </Link>

                    <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => handleAction(true)}
                            disabled={isValidating}
                            className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 bg-white border-2 border-orange-500 text-orange-600 rounded-xl text-xs md:text-sm font-bold shadow-sm hover:bg-orange-50 transition-all disabled:opacity-50"
                        >
                            <Archive size={16} /> {isValidating ? '...' : 'Simpan Draft'}
                        </button>
                        <button
                            onClick={() => handleAction(false)}
                            disabled={isValidating}
                            className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-2.5 bg-primary text-white rounded-xl text-xs md:text-sm font-bold shadow-md hover:bg-[#2D4345] transition-all disabled:opacity-50"
                        >
                            <Save size={16} /> {isValidating ? '...' : 'Publish'}
                        </button>
                    </div>
                </div>

                {/* Error Box */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3 text-red-800">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-bold">Lengkapi data berikut:</h3>
                                <ul className="text-xs mt-1 list-disc list-inside opacity-80">
                                    {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT: Config (Static on mobile, Sticky on desktop) */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky h-fit">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
                            <h2 className="text-base md:text-lg font-bold text-primary mb-3 pb-3">Data Kuesioner</h2>

                            <div className="space-y-5">
                                <div data-error={!!errors.title}>
                                    <label className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Judul Kuesioner</label>
                                    <input
                                        type="text"
                                        className={`w-full mt-2 p-3 bg-slate-50 border ${errors.title ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                                        placeholder="Contoh: Survei Kepuasan Alumni"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <SmoothDropdown
                                    label="Target Karier"
                                    options={statusKarirData}
                                    value={formData.id_status}
                                    onSelect={(val) => setFormData({ ...formData, id_status: val })}
                                />

                                <DateRangePicker
                                    formData={formData}
                                    setFormData={setFormData}
                                    errors={errors}
                                />

                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Deskripsi (Opsional)</label>
                                    <textarea
                                        rows="3"
                                        className="w-full mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                        placeholder="Tulis instruksi singkat..."
                                        value={formData.deskripsi}
                                        onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Questions List */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-8 shadow-sm min-h-[500px]">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-5">
                                <div>
                                    <h2 className="text-lg font-bold text-primary">Daftar Pertanyaan</h2>
                                    <p className="text-xs text-slate-400">Gunakan pilihan ganda untuk jawaban responden</p>
                                </div>
                                <button
                                    onClick={addQuestion}
                                    className="flex items-center justify-center gap-2 bg-primary text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-secondary cursor-pointer transition-all shadow-sm"
                                >
                                    <Plus size={16} /> Tambah Pertanyaan
                                </button>
                            </div>

                            <div className="space-y-6 md:space-y-10">
                                {questions.map((q, qIndex) => (
                                    <div key={q.id} className="relative bg-slate-50/50 p-4 md:p-6 rounded-2xl border border-slate-100 transition-all">

                                        {/* Question Header */}
                                        <div className="flex items-start gap-3 md:gap-4 mb-5">
                                            <div className="flex-none w-7 h-7 md:w-8 md:h-8 bg-[#3D5A5C] text-white rounded-lg flex items-center justify-center font-bold text-xs md:text-sm shadow-sm">
                                                {qIndex + 1}
                                            </div>
                                            <div className="grow">
                                                <RichTextEditor
                                                    content={q.text}
                                                    onChange={(html) => updateQuestionText(q.id, html)}
                                                    placeholder="Ketik pertanyaan Anda..."
                                                    minHeight="60px"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeQuestion(q.id)}
                                                className="cursor-pointer p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        {/* Options Grid */}
                                        <div className="ml-0 md:ml-12 space-y-3">
                                            {q.options.map((opt, optIndex) => (
                                                <div key={optIndex} className="flex items-start gap-3 group">
                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 mt-3 flex-none" />
                                                    <div className="grow">
                                                        <RichTextEditor
                                                            content={opt}
                                                            onChange={(html) => updateOptionText(q.id, optIndex, html)}
                                                            placeholder={`Opsi ${optIndex + 1}`}
                                                            minHeight="40px"
                                                        />
                                                    </div>
                                                    {q.options.length > 1 && (
                                                        <button
                                                            onClick={() => removeOption(q.id, optIndex)}
                                                            className="cursor-pointer p-2 text-slate-300 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 size={14} />
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
                                ))}

                                {questions.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                        <LayoutList size={48} className="mb-4 opacity-20" />
                                        <p className="text-sm">Klik tombol di atas untuk membuat pertanyaan</p>
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