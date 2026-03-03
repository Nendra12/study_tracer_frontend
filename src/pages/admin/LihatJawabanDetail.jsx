import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  BookOpen,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Quote,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  FileText,
  BarChart3,
  FileDown
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../api/admin";
import { STORAGE_BASE_URL } from "../../api/axios";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import JawabanDetailSkeleton from "../../components/admin/DetailJawaban";

const htmlContentStyles = `
  .html-content {
    word-wrap: break-word;
  }
  .html-content p {
    margin-bottom: 0.5rem;
  }
  .html-content p:last-child {
    margin-bottom: 0;
  }
  .html-content strong, .html-content b {
    font-weight: 700;
  }
  .html-content em, .html-content i {
    font-style: italic;
  }
  .html-content ul, .html-content ol {
    margin-left: 1.5rem;
    margin-bottom: 0.5rem;
  }
  .html-content ul {
    list-style-type: disc;
  }
  .html-content ol {
    list-style-type: decimal;
  }
  .html-content li {
    margin-bottom: 0.25rem;
  }
  .html-content a {
    color: #3D5A5C;
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
    margin-bottom: 0.5rem;
  }
  .html-content blockquote {
    border-left: 4px solid #cbd5e1;
    padding-left: 1rem;
    font-style: italic;
    color: #64748b;
  }
  .html-content h1, .html-content h2, .html-content h3, .html-content h4 {
    font-weight: 700;
    margin-top: 0.75rem;
    margin-bottom: 0.5rem;
  }
  .html-content h1 { font-size: 1.5rem; }
  .html-content h2 { font-size: 1.25rem; }
  .html-content h3 { font-size: 1.125rem; }
  .html-content h4 { font-size: 1rem; }
  .html-content br {
    display: block;
    content: "";
    margin-top: 0.25rem;
  }
`;

export default function LihatJawabanDetail() {
  const navigate = useNavigate();
  const { jawabanid, detailid } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminApi.getKuesionerJawabanDetail(jawabanid, detailid);

        if (response?.data?.data) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch jawaban detail:", err);
        setError(err.response?.data?.message || "Gagal mengambil data jawaban");
      } finally {
        setLoading(false);
      }
    };

    if (jawabanid && detailid) {
      fetchData();
    }
  }, [jawabanid, detailid]);

  const formatTanggal = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getYearOnly = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.getFullYear();
  };

  // Strip HTML tags for plain text export
  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
  };

  const handleExportPDF = () => {
    if (!data) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('Detail Jawaban Kuesioner', 14, 20);

    // Garis pemisah
    doc.setDrawColor(61, 90, 92);
    doc.setLineWidth(0.5);
    doc.line(14, 23, 60, 23);

    // Info Alumni
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text('Informasi Alumni', 14, 32);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let yPos = 38;
    doc.text(`Nama: ${alumni.nama || '-'}`, 14, yPos);
    yPos += 6;
    doc.text(`NIS: ${alumni.nis || '-'}`, 14, yPos);
    yPos += 6;
    doc.text(`Jurusan: ${alumni.jurusan || '-'}`, 14, yPos);
    yPos += 6;
    doc.text(`Tahun Lulus: ${getYearOnly(alumni.tahun_lulus)}`, 14, yPos);
    yPos += 10;

    // Info Kuesioner
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text('Kuesioner', 14, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(stripHtml(kuesioner.judul), 14, yPos, { maxWidth: 180 });
    yPos += 6;
    doc.text(`Progress: ${statistik.terjawab}/${statistik.total_pertanyaan} (${statistik.persentase_selesai}%)`, 14, yPos);
    yPos += 10;

    // Pertanyaan dan Jawaban
    pertanyaan.forEach((item, index) => {
      // Check if need new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      const pertanyaanText = `${index + 1}. ${stripHtml(item.isi_pertanyaan)}`;
      const lines = doc.splitTextToSize(pertanyaanText, 180);
      doc.text(lines, 14, yPos);
      yPos += lines.length * 6;

      // Jawaban
      doc.setFontSize(10);
      if (item.jawaban) {
        if (item.jawaban.opsi_dipilih) {
          doc.setTextColor(61, 90, 92);
          doc.text(`Jawaban: ${stripHtml(item.jawaban.opsi_dipilih.opsi)}`, 20, yPos);
        } else if (item.jawaban.jawaban_text) {
          doc.setTextColor(61, 90, 92);
          const jawabanLines = doc.splitTextToSize(`Jawaban: ${stripHtml(item.jawaban.jawaban_text)}`, 170);
          doc.text(jawabanLines, 20, yPos);
          yPos += (jawabanLines.length - 1) * 5;
        }
      } else {
        doc.setTextColor(200, 100, 50);
        doc.text('Jawaban: Belum dijawab', 20, yPos);
      }
      yPos += 10;
    });

    // Save
    const timestamp = new Date().getTime();
    doc.save(`Detail_Jawaban_${alumni.nama}_${timestamp}.pdf`);
  };

  const handleExportExcel = () => {
    if (!data) return;

    // Prepare data for Excel
    const excelData = pertanyaan.map((item, index) => {
      let jawaban = '-';
      if (item.jawaban) {
        if (item.jawaban.opsi_dipilih) {
          jawaban = stripHtml(item.jawaban.opsi_dipilih.opsi);
        } else if (item.jawaban.jawaban_text) {
          jawaban = stripHtml(item.jawaban.jawaban_text);
        }
      }

      return {
        'No': index + 1,
        'Pertanyaan': stripHtml(item.isi_pertanyaan),
        'Jawaban': jawaban,
        'Status': item.jawaban ? 'Terjawab' : 'Belum Dijawab'
      };
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },  // No
      { wch: 60 }, // Pertanyaan
      { wch: 50 }, // Jawaban
      { wch: 15 }  // Status
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add info sheet
    const infoData = [
      ['DETAIL JAWABAN KUESIONER'],
      [],
      ['Nama Alumni', alumni.nama || '-'],
      ['NIS', alumni.nis || '-'],
      ['Jurusan', alumni.jurusan || '-'],
      ['Tahun Lulus', getYearOnly(alumni.tahun_lulus)],
      ['Email', alumni.email || '-'],
      [],
      ['Kuesioner', stripHtml(kuesioner.judul)],
      ['Total Pertanyaan', statistik.total_pertanyaan],
      ['Terjawab', statistik.terjawab],
      ['Belum Dijawab', statistik.belum_dijawab],
      ['Progress', `${statistik.persentase_selesai}%`]
    ];
    const infoWs = XLSX.utils.aoa_to_sheet(infoData);
    infoWs['!cols'] = [{ wch: 20 }, { wch: 50 }];

    XLSX.utils.book_append_sheet(wb, infoWs, 'Informasi');
    XLSX.utils.book_append_sheet(wb, ws, 'Jawaban');

    // Save Excel file
    const timestamp = new Date().getTime();
    XLSX.writeFile(wb, `Detail_Jawaban_${alumni.nama}_${timestamp}.xlsx`);
  };

  // Helper function to create HTML markup object for dangerouslySetInnerHTML
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent || '' };
  };

  if (loading) {
    return (
      <>
        <JawabanDetailSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen font-sans text-primary">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm font-bold group mb-6"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar
        </button>

        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-primary mb-2">Gagal Memuat Data</h3>
          <p className="text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { alumni, kuesioner, pertanyaan, statistik } = data;

  return (
    <div className="space-y-6 max-w-full overflow-hidden p-1 animate-in fade-in duration-700">
      {/* Inject CSS for HTML content */}
      <style>{htmlContentStyles}</style>

      {/* --- HEADER NAVIGASI --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm font-bold group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-secondary text-sm font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <FileDown size={18} />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#3D5A5C] text-white rounded-xl text-xs font-bold hover:bg-[#2D4345] shadow-md shadow-[#3D5A5C]/20 transition-all active:scale-95"
          >
            <FileSpreadsheet size={16} /> Excel
          </button>
        </div>
      </div>

      {/* --- KONTEN UTAMA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* --- KOLOM KIRI: Profile Alumni --- */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-8">
            {/* Header Dekoratif */}
            <div className="h-24 bg-linear-to-r from-primary to-primary relative">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="w-20 h-20 rounded-full border-[3px] border-white shadow-md overflow-hidden bg-white">
                  <img
                    src={alumni.foto ? `${STORAGE_BASE_URL}/${alumni.foto}` : `https://i.pravatar.cc/150?u=${alumni.id}`}
                    alt={alumni.nama}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150' }}
                  />
                </div>
              </div>
            </div>

            {/* Konten Profil */}
            <div className="pt-12 pb-6 px-6 text-center">
              <h2 className="text-lg font-black text-primary">{alumni.nama || '-'}</h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">
                NIS: {alumni.nis || '-'}
              </p>

              <div className="mt-4 flex justify-center">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {kuesioner.status_karir || 'Alumni'}
                </span>
              </div>

              <div className="mt-6 space-y-4 text-left border-t border-slate-100 pt-6">
                <InfoItem icon={<BookOpen size={16} />} label="Jurusan" value={alumni.jurusan || '-'} />
                <InfoItem icon={<Calendar size={16} />} label="Tahun Lulus" value={getYearOnly(alumni.tahun_lulus)} />
                <InfoItem icon={<Mail size={16} />} label="Email" value={alumni.email || '-'} />
                <InfoItem icon={<Phone size={16} />} label="No. HP" value={alumni.no_hp || '-'} />
                <InfoItem icon={<MapPin size={16} />} label="Alamat" value={alumni.alamat || '-'} />
              </div>
            </div>

            {/* Statistik Progress */}
            <div className="px-6 pb-6 border-t border-slate-100 pt-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">Progress</span>
                  <span className="text-sm font-black text-primary">{statistik.persentase_selesai}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500 rounded-full"
                    style={{ width: `${statistik.persentase_selesai}%` }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs">
                  <span className="text-secondary">
                    <span className="font-bold text-emerald-600">{statistik.terjawab}</span> Terjawab
                  </span>
                  <span className="text-secondary">
                    <span className="font-bold text-orange-600">{statistik.belum_dijawab}</span> Belum
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- KOLOM KANAN: Detail Jawaban --- */}
        <div className="lg:col-span-8 space-y-6">

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1
                  className="text-xl font-black text-primary html-content"
                  dangerouslySetInnerHTML={createMarkup(kuesioner.judul)}
                />
                <p
                  className="text-sm text-secondary mt-2 html-content"
                  dangerouslySetInnerHTML={createMarkup(kuesioner.deskripsi || 'Detail respon kuesioner alumni.')}
                />
                <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <FileText size={14} />
                    <span>{statistik.total_pertanyaan} Pertanyaan</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Publikasi: {formatTanggal(kuesioner.tanggal_publikasi)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {pertanyaan.map((item, index) => {
              const hasOpsi = item.opsi_jawaban && item.opsi_jawaban.length > 0;
              const jawaban = item.jawaban;

              return (
                <div
                  key={item.id_pertanyaan}
                  className={`bg-white p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md ${jawaban ? 'border-slate-200' : 'border-orange-200 bg-orange-50/30'
                    }`}
                >

                  {/* Pertanyaan */}
                  <div className="flex gap-4 mb-5">
                    <span className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-xs font-black border ${jawaban
                      ? 'bg-slate-100 text-secondary border-slate-200'
                      : 'bg-orange-100 text-orange-600 border-orange-200'
                      }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3
                        className="text-base font-bold text-primary leading-snug pt-0.5 html-content"
                        dangerouslySetInnerHTML={createMarkup(item.isi_pertanyaan)}
                      />
                      {!jawaban && (
                        <p className="text-xs text-orange-600 font-medium mt-2">
                          Pertanyaan belum dijawab
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Jawaban */}
                  <div className="pl-11">
                    {hasOpsi ? (
                      // Pertanyaan Pilihan Ganda
                      <div className="grid grid-cols-1 gap-2.5">
                        {item.opsi_jawaban.map((opsi) => {
                          const isSelected = jawaban?.opsi_dipilih?.id_opsi === opsi.id_opsi;
                          return (
                            <div
                              key={opsi.id_opsi}
                              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${isSelected
                                ? "bg-primary/5 border-primary shadow-sm"
                                : "bg-white border-slate-100 text-secondary"
                                }`}
                            >
                              {/* Custom Radio Button */}
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isSelected ? "border-primary bg-primary" : "border-slate-300 bg-transparent"
                                }`}>
                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>

                              <span
                                className={`font-medium html-content ${isSelected ? "text-primary font-bold" : ""}`}
                                dangerouslySetInnerHTML={createMarkup(opsi.opsi)}
                              />

                              {isSelected && (
                                <div className="ml-auto text-primary">
                                  <CheckCircle2 size={18} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // Pertanyaan Essay/Text
                      jawaban?.jawaban_text ? (
                        <div className="relative">
                          <div className="absolute top-3 left-3 text-slate-400">
                            <Quote size={16} className="rotate-180" />
                          </div>
                          <div
                            className="w-full p-4 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-primary font-medium text-sm leading-relaxed html-content"
                            dangerouslySetInnerHTML={createMarkup(jawaban.jawaban_text)}
                          />
                        </div>
                      ) : (
                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-600 text-sm italic">
                          Belum ada jawaban
                        </div>
                      )
                    )}


                  </div>

                </div>
              );
            })}
          </div>

          {/* Footer Action */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => navigate(-1)}
              className="cursor-pointer px-6 py-2.5 bg-white border border-slate-300 text-secondary text-sm font-bold rounded-xl hover:bg-slate-50 hover:text-primary transition-all"
            >
              Tutup Halaman
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// Komponen Kecil untuk Info Profile
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-slate-50 text-slate-400 rounded-lg shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm mt-3 font-bold text-primary leading-tight">{value}</p>
    </div>
  </div>
);