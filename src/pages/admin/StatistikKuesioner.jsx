import React, { useEffect, useState, useRef } from 'react';
import Chart from 'react-apexcharts';
import { adminApi } from '../../api/admin';
import { Link, useParams } from 'react-router-dom';
import ChartKuesioner from '../../components/admin/ChartKuesioner';
import { ArrowLeft, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SkeletonKuesionerAnswer from '../../components/admin/SkeletonKuesionerAnswer';

function StatistikKuesioner() {
    // Data Pertanyaan 1 (Bar Chart)

    const { jawabanid } = useParams()
    const contentRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [loading, setLoading] = useState(false)

    const [statistik, setStatistik] = useState([])
    const [totaljawaban, setTotalJawaban] = useState(0)
    const [kuesioner, setKuesioner] = useState({})

    const fetchData = async (id) => {
        try {
            setLoading(true)
            const dataStats = await adminApi.getStatsKuesioner(id)

            // console.log(dataStats)
            let stats = []
            if (dataStats?.data?.data) {
                dataStats.data.data.statistics.map((st) => {
                    stats.push({
                        "pertanyaan": st.isi_pertanyaan,
                        "total_jawaban": st.total_answers,
                        "statistiks": st.opsi_statistics,
                    })
                })
                setKuesioner(dataStats.data.data.kuesioner)
                setTotalJawaban(dataStats.data.data.total_responden)
            }
            setStatistik(stats)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const start = async (id) => {
            await fetchData(id)
        }

        start(jawabanid)

    }, [jawabanid])

    const handleExportPDF = async () => {
        if (!contentRef.current || isExporting) return;

        setIsExporting(true);

        try {
            // Get the content element
            const element = contentRef.current;

            // Create canvas from HTML with enhanced options
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                onclone: (clonedDoc) => {
                    // Add a style tag to override oklch with rgb fallbacks
                    const style = clonedDoc.createElement('style');
                    style.textContent = `
                        .bg-primary { background-color: #3b82f6 !important; }
                        .text-primary { color: #3b82f6 !important; }
                        .text-third { color: #64748b !important; }
                        .text-fourth { color: #f8fafc !important; }
                        .text-white { color: #ffffff !important; }
                        .text-slate-600 { color: #475569 !important; }
                        .text-slate-400 { color: #94a3b8 !important; }
                        .text-slate-800 { color: #1e293b !important; }
                        .text-slate-900 { color: #0f172a !important; }
                        .text-gray-600 { color: #4b5563 !important; }
                        .text-gray-900 { color: #111827 !important; }
                        .bg-white { background-color: #ffffff !important; }
                        .bg-slate-50 { background-color: #f8fafc !important; }
                        .border-slate-200 { border-color: #e2e8f0 !important; }
                        .border-gray-200 { border-color: #e5e7eb !important; }
                        .border-gray-100 { border-color: #f3f4f6 !important; }
                        .rounded-xl, .rounded-2xl { border-radius: 0.75rem !important; }
                    `;
                    clonedDoc.head.appendChild(style);
                }
            });

            // Calculate dimensions for PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth - 20; // 10mm margin on each side
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 10;

            // Add first page
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Add additional pages if content is longer than one page
            while (heightLeft > 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            // Generate filename with timestamp
            const filename = `Statistik_${kuesioner.title || 'Kuesioner'}_${new Date().toISOString().split('T')[0]}.pdf`;

            // Save PDF
            pdf.save(filename);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Gagal membuat PDF. Silakan coba lagi.');
        } finally {
            setIsExporting(false);
        }
    };

    // console.log(loading)
    if (loading) {
        return <SkeletonKuesionerAnswer />
    }

    return (
        <div className="space-y-6 max-w-full overflow-hidden p-1 animate-in fade-in duration-700">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center gap-4 mb-6">
                    <Link
                        to="/wb-admin/kuisoner"
                        className="flex items-center gap-2 text-third hover:text-primary transition-colors text-sm font-medium group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Kembali
                    </Link>

                    <div className="flex gap-2 w-auto">
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting || statistik.length === 0}
                            className={`cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-bold shadow-sm transition-all ${isExporting || statistik.length === 0
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-slate-50 hover:border-slate-300'
                                }`}
                        >
                            <FileDown size={18} className={isExporting ? 'animate-bounce' : ''} />
                            <span className="inline">
                                {isExporting ? 'Membuat PDF...' : 'PDF'}
                            </span>
                        </button>
                    </div>
                </div>

                <div ref={contentRef}>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm hover:shadow-md transition-shadow">

                        {/* Accent */}
                        <div className="h-2 w-full bg-primary"></div>

                        <div className="p-7">

                            {/* Title */}
                            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                                {kuesioner.title ? kuesioner.title : ''}
                            </h1>

                            <p className="text-sm text-gray-600 max-w-2xl mb-6 leading-relaxed">
                                {kuesioner.deskripsi ? kuesioner.deskripsi : ''}
                            </p>

                            {/* Divider */}
                            <div className="border-t border-gray-100 mt-5"></div>

                        </div>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Card Pertanyaan 2 */}
                        {
                            statistik?.map((st, index) => (
                                
                                <div
                                    key={index}
                                    className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="px-6 py-4 bg-primary border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-white uppercase tracking-wider">
                                                Pertanyaan {index + 1}
                                            </span>

                                            <span className="text-xs bg-white text-primary px-3 py-1 rounded-full font-medium">
                                                {st.total_jawaban} Responden
                                            </span>
                                        </div>

                                        <h3 className="mt-3 text-sm font-semibold text-fourth leading-snug">
                                            {st.pertanyaan}
                                        </h3>
                                    </div>

                                    {/* Chart Section */}
                                    <div className="p-6">
                                        <ChartKuesioner
                                            subtitle=""
                                            series={st.statistiks?.map(item => item.percentage) || []}
                                            labels={st.statistiks?.map(item => item.opsi) || []}
                                        />
                                    </div>
                                </div>
                            
                            ))
                        }
                    </div>

                    {/* Footer info sederhana */}
                    <footer className="mt-12 text-center text-slate-400 text-sm">
                        Dicatat berdasarkan total <span className="font-bold text-slate-600">{totaljawaban} responden</span>
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default StatistikKuesioner;