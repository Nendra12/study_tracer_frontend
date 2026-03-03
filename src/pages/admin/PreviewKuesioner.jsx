import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { adminApi } from "../../api/admin";
import { useEffect, useState } from "react";
import ReviewKuesionerSkeleton from "../../components/admin/ReviewKuesionerSkeleton";
import { parseISO, format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function PreviewKuesioner() {
    const { id } = useParams()
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [dataHeader, setDataHeader] = useState({})

    // Format datetime untuk display
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        try {
            const date = parseISO(dateTimeString);
            return format(date, 'dd MMMM yyyy, HH:mm', { locale: idLocale });
        } catch (e) {
            return dateTimeString;
        }
    };

    const fetchData = async (id) => {
        try {
            setLoading(true)
            const dataKues = await adminApi.getKuesionerDetail(id)
            let datakuesioner = []
            if (dataKues?.data?.data) {
                setDataHeader({
                    "judul": dataKues.data.data.title,
                    "deskripsi": dataKues.data.data.deskripsi,
                    "tanggal_mulai": dataKues.data.data.tanggal_mulai,
                    "tanggal_selesai": dataKues.data.data.tanggal_selesai
                })

                dataKues.data.data.pertanyaan?.map((temp) => {
                    datakuesioner.push({
                        "id": temp.id,
                        "question": temp.isi_pertanyaan,
                        "options": temp.opsi.map(o => o.opsi), // Fix: Remove extra array nesting
                        "type": "vertical",
                    })
                })
            }
            console.log(datakuesioner)
            setQuestions(datakuesioner)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData(id)
    }, [])

    return (
        <div className="space-y-6 max-w-full p-1 animate-in fade-in duration-700">
            <div className="max-w-3xl mx-auto">
                {
                    loading ? (
                        <ReviewKuesionerSkeleton />
                    ) : (
                        <>
                            <Link
                                to="/wb-admin/kuisoner"
                                className="mb-5 flex items-center gap-2 text-third hover:text-primary transition-colors text-sm font-medium group"
                            >
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                Kembali
                            </Link>
                            {/* --- HEADER SECTION --- */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm hover:shadow-md transition-shadow">

                                {/* Accent */}
                                <div className="h-2 w-full bg-primary"></div>

                                <div className="p-7">

                                    {/* Title */}
                                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                                        {dataHeader.judul ? dataHeader.judul : ''}
                                    </h1>

                                    <p className="text-sm text-gray-600 max-w-2xl mb-6 leading-relaxed">
                                        {dataHeader.deskripsi ? dataHeader.deskripsi : ''}
                                    </p>

                                    {/* Divider */}
                                    <div className="border-t border-gray-100 my-5"></div>

                                    {/* Metadata */}
                                    <div className="grid sm:grid-cols-3 gap-4">

                                        <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                                            <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                                                Waktu Mulai
                                            </p>
                                            <p className="text-sm font-medium text-gray-800">
                                                {formatDateTime(dataHeader.tanggal_mulai)}
                                            </p>
                                        </div>

                                        <div className="bg-red-50 rounded-lg px-4 py-3 border border-red-100">
                                            <p className="text-[11px] uppercase tracking-wide text-red-500 mb-1">
                                                Waktu Selesai
                                            </p>
                                            <p className="text-sm font-semibold text-red-600">
                                                {formatDateTime(dataHeader.tanggal_selesai)}
                                            </p>
                                        </div>

                                    </div>

                                </div>
                            </div>

                            {/* --- QUESTIONS SECTION --- */}
                            <div className="space-y-6">
                                {questions.map((q, index) => (
                                    <div key={q.id} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-fourth text-primary font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                {/* Render HTML content for question */}
                                                <div
                                                    className="text-gray-800 font-bold mb-6 pt-1 prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: q.question }}
                                                />

                                                <div className={q.type === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
                                                    {q.options.map((option, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-start p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
                                                        >
                                                            <div className="w-5 h-5 rounded-full border-2 border-gray-200 mr-3 mt-0.5 flex-shrink-0 group-hover:border-blue-400 transition-colors"></div>
                                                            {/* Render HTML content for options */}
                                                            <div
                                                                className="text-gray-600 text-sm prose prose-sm max-w-none flex-1"
                                                                dangerouslySetInnerHTML={{ __html: option }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </>
                    )
                }
            </div>
        </div>
    );
}