import React, { useEffect, useState } from 'react';
import Navbar from '../../components/alumni/Navbar';
import { ChevronRight, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { alumniApi } from '../../api/alumni';
import { id as idLocale } from 'date-fns/locale';
import { alertSuccess } from '../../utilitis/alert';

function KuesionerModal() {
    const userTes = JSON.parse(localStorage.getItem('user'))
    // console.log(userTes)
    const user = {
        id_user: userTes ? userTes.id : '', // Tambahkan ID user di sini
        nama_alumni: userTes ? userTes.profile.nama : '',
        foto: userTes ? userTes.profile.foto : '',
        can_access_all: userTes?.can_access_all ?? false
    };

    const { id } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dataHeader, setDataHeader] = useState({});

    // State untuk menampung jawaban: { [id_pertanyaan]: id_opsi }
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate()
    // Format datetime untuk display
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        try {
            const date = parseISO(dateTimeString);
            return format(date, 'dd MMMM yyyy, HH:mm', { locale: idLocale });
        } catch (error) {
            return dateTimeString;
        }
    };

    // console.log(userTes.id)

    const fetchData = async (idKuesioner) => {
        try {
            setLoading(true);
            const dataKues = await alumniApi.getKuesionerDetail(idKuesioner);

            if (dataKues?.data?.data) {
                const raw = dataKues.data.data;
                setDataHeader({
                    "judul": raw.title,
                    "deskripsi": raw.deskripsi,
                    "tanggal_mulai": raw.tanggal_mulai,
                    "tanggal_selesai": raw.tanggal_selesai
                });

                const formattedQuestions = raw.pertanyaan?.map((temp) => ({
                    "id": temp.id,
                    "question": temp.isi_pertanyaan,
                    "options": temp.opsi, // Simpan objek opsi utuh agar punya ID dan teks
                    "type": "vertical",
                }));

                setQuestions(formattedQuestions);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData(id);
    }, [id]);

    // Handler saat user memilih jawaban
    const handleSelectOption = (questionId, optionId) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    // Handler Kirim/Simpan
    const handleSubmit = async () => {
        const totalPertanyaan = questions.length;
        const totalDijawab = Object.keys(answers).length;
        const isAllAnswered = totalDijawab === totalPertanyaan;

        // Susun payload sesuai permintaan
        const payload = questions.map(q => ({
            id_pertanyaan: q.id,
            id_opsiJawaban: answers[q.id] || null,
            status: isAllAnswered ? "Selesai" : "Proses",
            created_at: new Date().toISOString()
        }));

        if (!isAllAnswered) {
            const confirm = window.confirm("Beberapa pertanyaan belum diisi. Tetap simpan?");
            if (!confirm) return;
        }

        console.log("Payload yang dikirim ke server:", payload);
        const iduser = user.id_user

        try {
            setIsSubmitting(true);
            const response = await alumniApi.submitKuesionerAnswers(iduser, {
                jawaban: payload
            });

            alertSuccess("Jawaban berhasil disimpan dengan status: " + (isAllAnswered ? "Selesai" : "Proses"));

            navigate("/")
        } catch (error) {
            alert("Gagal menyimpan jawaban.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-primary/20 pb-20">
            <Navbar user={user} />

            <div className="max-w-3xl mx-auto w-full px-4 space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl mt-25 border border-gray-200 overflow-hidden mb-6 shadow-sm">
                    <div className="h-2 w-full bg-primary"></div>
                    <div className="p-7">
                        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                            {dataHeader.judul || 'Loading...'}
                        </h1>
                        <p className="text-sm text-gray-600 max-w-2xl mb-6 leading-relaxed">
                            {dataHeader.deskripsi || 'Silahkan isi kuesioner di bawah ini.'}
                        </p>
                        <div className="border-t border-gray-100 my-5"></div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                                <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Waktu Mulai</p>
                                <p className="text-sm font-medium text-gray-800">{formatDateTime(dataHeader.tanggal_mulai)} WIB</p>
                            </div>
                            <div className="bg-red-50 rounded-lg px-4 py-3 border border-red-100">
                                <p className="text-[11px] uppercase tracking-wide text-red-500 mb-1">Waktu Selesai</p>
                                <p className="text-sm font-semibold text-red-600">{formatDateTime(dataHeader.tanggal_selesai)} WIB</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions List */}
                {questions.map((q, index) => (
                    <div key={q.id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm transition-all">
                        <div className="flex gap-4 mb-6">
                            <div className="flex-none">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                                    {index + 1}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 self-center">
                                {q.question}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {q.options?.map((opt, idx) => (
                                <label
                                    key={idx}
                                    className={`group flex items-center p-4 rounded-xl border transition-all cursor-pointer ${answers[q.id] === opt.id
                                            ? 'border-primary bg-slate-50'
                                            : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${q.id}`}
                                        checked={answers[q.id] === opt.id}
                                        onChange={() => handleSelectOption(q.id, opt.id)}
                                        className="w-5 h-5 border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className={`ml-4 transition-colors ${answers[q.id] === opt.id ? 'text-primary font-semibold' : 'text-slate-600'
                                        }`}>
                                        {opt.opsi}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Action Button */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || questions.length === 0}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#2a3f41] cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Jawaban'}
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default KuesionerModal;