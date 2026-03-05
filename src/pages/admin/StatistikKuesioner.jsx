import React, { useEffect, useState, useRef } from 'react';
import Chart from 'react-apexcharts';
import { adminApi } from '../../api/admin';
import { Link, useParams } from 'react-router-dom';
import ChartKuesioner from '../../components/admin/ChartKuesioner';
import { ArrowLeft, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SkeletonKuesionerAnswer from '../../components/admin/skeleton/SkeletonKuesionerAnswer';

function StatistikKuesioner() {
    // Data Pertanyaan 1 (Bar Chart)

    const { jawabanid } = useParams()
    const contentRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [loading, setLoading] = useState(false)

    const [statistik, setStatistik] = useState([])
    const [totaljawaban, setTotalJawaban] = useState(0)
    const [kuesioner, setKuesioner] = useState({})

    // Helper function to strip HTML tags for chart labels
    const stripHtml = (html) => {
        if (!html) return '';
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

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
                    // Override all oklch colors with hex fallbacks
                    const style = clonedDoc.createElement('style');
                    style.textContent = `
                        * {
                            /* Reset any oklch in custom properties */
                            --tw-bg-opacity: 1 !important;
                            --tw-text-opacity: 1 !important;
                            --tw-border-opacity: 1 !important;
                        }
                        
                        /* Background colors */
                        .bg-primary { background-color: #3b82f6 !important; }
                        .bg-white { background-color: #ffffff !important; }
                        .bg-slate-50 { background-color: #f8fafc !important; }
                        .bg-slate-100 { background-color: #f1f5f9 !important; }
                        
                        /* Text colors */
                        .text-primary { color: #3b82f6 !important; }
                        .text-third { color: #64748b !important; }
                        .text-fourth { color: #f8fafc !important; }
                        .text-white { color: #ffffff !important; }
                        .text-slate-400 { color: #94a3b8 !important; }
                        .text-slate-500 { color: #64748b !important; }
                        .text-slate-600 { color: #475569 !important; }
                        .text-slate-700 { color: #334155 !important; }
                        .text-slate-800 { color: #1e293b !important; }
                        .text-slate-900 { color: #0f172a !important; }
                        .text-gray-600 { color: #4b5563 !important; }
                        .text-gray-700 { color: #374151 !important; }
                        .text-gray-900 { color: #111827 !important; }
                        
                        /* Border colors */
                        .border-slate-100 { border-color: #f1f5f9 !important; }
                        .border-slate-200 { border-color: #e2e8f0 !important; }
                        .border-gray-100 { border-color: #f3f4f6 !important; }
                        .border-gray-200 { border-color: #e5e7eb !important; }
                        
                        /* Hover states */
                        .hover\\:bg-slate-50 { background-color: #f8fafc !important; }
                        
                        /* Transitions and shadows - disable for PDF */
                        .transition-all, .transition-colors, .transition-shadow, .transition-transform {
                            transition: none !important;
                        }
                        
                        /* HTML Content Styling for PDF */
                        .html-content p { margin: 0.25rem 0 !important; }
                        .html-content strong { font-weight: 700 !important; }
                        .html-content em { font-style: italic !important; }
                        .html-content u { text-decoration: underline !important; }
                        .html-content ul, .html-content ol { margin-left: 1.5rem !important; padding-left: 0.5rem !important; }
                        .html-content li { margin: 0.25rem 0 !important; }
                        .html-content a { color: #3b82f6 !important; }
                    `;
                    clonedDoc.head.appendChild(style);

                    // Also override any inline styles with oklch
                    const allElements = clonedDoc.getElementsByTagName('*');
                    for (let el of allElements) {
                        if (el.style.color && el.style.color.includes('oklch')) {
                            el.style.color = '#000000';
                        }
                        if (el.style.backgroundColor && el.style.backgroundColor.includes('oklch')) {
                            el.style.backgroundColor = '#ffffff';
                        }
                        if (el.style.borderColor && el.style.borderColor.includes('oklch')) {
                            el.style.borderColor = '#e2e8f0';
                        }
                    }
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
                {/* Global styles for HTML content */}
                <style>{`
                    .html-content p {
                        margin: 0.25rem 0;
                        line-height: 1.5;
                    }
                    .html-content strong {
                        font-weight: 700;
                    }
                    .html-content em {
                        font-style: italic;
                    }
                    .html-content u {
                        text-decoration: underline;
                    }
                    .html-content ul, .html-content ol {
                        margin-left: 1.5rem;
                        padding-left: 0.5rem;
                        margin-top: 0.5rem;
                        margin-bottom: 0.5rem;
                    }
                    .html-content li {
                        margin: 0.25rem 0;
                    }
                    .html-content h1, .html-content h2, .html-content h3 {
                        font-weight: 700;
                        margin-top: 0.5rem;
                        margin-bottom: 0.5rem;
                    }
                    .html-content a {
                        color: #3b82f6;
                        text-decoration: underline;
                    }
                    .html-content code {
                        background-color: #f1f5f9;
                        padding: 0.125rem 0.25rem;
                        border-radius: 0.25rem;
                        font-family: monospace;
                        font-size: 0.875em;
                    }
                    .html-content pre {
                        background-color: #f1f5f9;
                        padding: 0.75rem;
                        border-radius: 0.5rem;
                        overflow-x: auto;
                        margin: 0.5rem 0;
                    }
                    .html-content blockquote {
                        border-left: 4px solid #e2e8f0;
                        padding-left: 1rem;
                        margin: 0.5rem 0;
                        color: #64748b;
                    }
                `}</style>

                <div className="flex justify-between items-center gap-4 mb-6">
                    <Link
                        to={`/wb-admin/kuisoner/tinjau-jawaban/${jawabanid}`}
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
                            <FileDown size={18} className="shrink-0" />
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

                                        <div
                                            className="mt-3 text-sm font-semibold text-fourth leading-snug html-content"
                                            dangerouslySetInnerHTML={{ __html: st.pertanyaan }}
                                        />
                                    </div>

                                    {/* Chart Section */}
                                    <div className="p-6">
                                        <ChartKuesioner
                                            subtitle=""
                                            series={st.statistiks?.map(item => item.percentage) || []}
                                            labels={st.statistiks?.map(item => stripHtml(item.opsi)) || []}
                                        />
                                        {/* Detail Opsi Jawaban dengan HTML */}
                                        <div className="mt-6 pt-6 border-t border-slate-100">
                                            <h4 className="text-xs font-bold text-slate-600 uppercase mb-3">Detail Jawaban</h4>
                                            <div className="space-y-2">
                                                {st.statistiks?.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                                    >
                                                        <div
                                                            className="w-3 h-3 rounded-full shrink-0 mt-1"
                                                            style={{
                                                                backgroundColor: [
                                                                    "#6366f1",
                                                                    "#3b82f6",
                                                                    "#06b6d4",
                                                                    "#10b981",
                                                                    "#f59e0b",
                                                                    "#f43f5e",
                                                                ][idx % 6]
                                                            }}
                                                        />
                                                        <div className="flex-1">
                                                            <div
                                                                className="text-sm text-slate-700 html-content"
                                                                dangerouslySetInnerHTML={{ __html: item.opsi }}
                                                            />
                                                            <div className="flex gap-3 mt-1">
                                                                <span className="text-xs text-slate-500">
                                                                    {item.count} responden
                                                                </span>
                                                                <span className="text-xs font-semibold text-primary">
                                                                    {item.percentage}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>                                    </div>
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