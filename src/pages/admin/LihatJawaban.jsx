import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  FileDown,
  FileSpreadsheet,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ClipboardList,
  Users,
  ArrowLeft,
  UserSearch,
  Ghost
} from "lucide-react";
import SmoothDropdown from "../../components/admin/SmoothDropdown";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "../../api/admin";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Sub-komponen StatCard
function StatCard({ icon, label, value, bgColor, iconColor, className = "" }) {
  return (
    <div className={`p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 ${bgColor} ${className}`}>
      <div className={`p-3.5 rounded-xl ${iconColor} bg-slate-50 border border-slate-100`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function LihatJawaban() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Bekerja");
  const [tabs, setTabs] = useState([])
  const [dataAlumni, setdataAlumni] = useState([])
  const [stats, setStats] = useState({
    totalResponden: 0,
    baruMingguIni: 0,
    menungguTinjauan: 0
  })
  const [selectedJurusan, setSelectedJurusan] = useState("Semua Jurusan")
  const [selectedTahun, setSelectedTahun] = useState("Tahun Kelulusan")
  const navigate = useNavigate();

  const getYearOnly = (dateString) => {
    const date = new Date(dateString);
    return date.getFullYear(); // Menghasilkan angka: 2018
  };

  const formatTanggalIndo = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateStats = (jawabanData) => {
    const totalResponden = jawabanData.length

    // Hitung alumni yang submit dalam 7 hari terakhir
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const baruMingguIni = jawabanData.filter(j => {
      const submitDate = new Date(j.tanggal_submit)
      return submitDate >= oneWeekAgo
    }).length

    // Hitung yang belum selesai
    const menungguTinjauan = jawabanData.filter(j => j.status === 'Belum Selesai').length

    setStats({
      totalResponden,
      baruMingguIni,
      menungguTinjauan
    })
  }

  const fetchAPI = useCallback(async () => {
    try {
      const [kuisoner, jawaban] = await Promise.all([
        adminApi.getKuesioner().catch(() => null),
        adminApi.getKuesionerJawaban(1)
      ])

      let statusData = []

      if (kuisoner?.data?.data) {
        kuisoner.data.data.data.map((p) => {
          statusData.push({
            "id": p.id,
            "status": p.status.nama
          })
        })
      }

      setTabs(statusData)

      let jawabanData = []
      if (jawaban?.data?.data?.data) {
        jawabanData = jawaban.data.data.data
      }

      setdataAlumni(jawabanData)

      calculateStats(jawabanData)

    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }, [])

  useEffect(() => {
    fetchAPI()
  }, [fetchAPI])

  // Filter data alumni berdasarkan search, jurusan, dan tahun
  const filteredAlumni = dataAlumni.filter((alumni) => {
    const matchesSearch = searchTerm === "" ||
      alumni.alumni.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumni.alumni.nis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumni.alumni.nisn?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesJurusan = selectedJurusan === "Semua Jurusan" ||
      alumni.alumni.jurusan === selectedJurusan

    const matchesTahun = selectedTahun === "Tahun Kelulusan" ||
      getYearOnly(alumni.alumni.tahun_lulus).toString() === selectedTahun

    return matchesSearch && matchesJurusan && matchesTahun
  })

  // Get unique jurusan for filter options
  const jurusanOptions = ["Semua Jurusan", ...new Set(dataAlumni.map(a => a.alumni.jurusan).filter(Boolean))]

  // Get unique tahun for filter options
  const tahunOptions = ["Tahun Kelulusan", ...new Set(dataAlumni.map(a => getYearOnly(a.alumni.tahun_lulus).toString()).filter(Boolean).sort((a, b) => Number(b) - Number(a)))]

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // 1. Judul & Header
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(`Data Jawaban Kuesioner - ${activeTab}`, 14, 20);

    // Garis Pemisah (Aksen Visual)
    doc.setDrawColor(61, 90, 92);
    doc.setLineWidth(0.5);
    doc.line(14, 23, 60, 23);

    // 2. Metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total Responden: ${stats.totalResponden}`, 14, 32);
    doc.text(`Tanggal Export: ${formatTanggalIndo(new Date().toISOString())}`, 14, 38);

    // 3. Persiapan Data (Pastikan mapping sesuai struktur data Anda)
    const tableData = filteredAlumni.map((alumni, index) => [
      index + 1,
      alumni.alumni?.nama || '-',
      alumni.alumni?.nis || '-',
      alumni.alumni?.jurusan || '-',
      getYearOnly(alumni.alumni?.tahun_lulus),
      formatTanggalIndo(alumni.tanggal_submit),
      alumni.status
    ]);

    // 4. Generate Tabel (Memanggil autoTable secara langsung)
    autoTable(doc, {
      head: [['No', 'Nama Alumni', 'NIS', 'Jurusan', 'Tahun', 'Tgl. Pengisian', 'Status']],
      body: tableData,
      startY: 45,
      styles: {
        fontSize: 8, // Sedikit lebih kecil agar lebih aman untuk kertas A4
        cellPadding: 3
      },
      headStyles: {
        fillColor: [61, 90, 92],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center' }, // Kolom No center
        4: { halign: 'center' }, // Kolom Tahun center
        6: { halign: 'center' }, // Kolom Status center
      },
      // Zebra striping agar mudah dibaca
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    // 5. Simpan File
    const timestamp = new Date().getTime();
    doc.save(`Jawaban_Kuesioner_${activeTab.replace(/\s+/g, '_')}_${timestamp}.pdf`);
  };

  // Export to Excel
  const handleExportExcel = () => {
    // Prepare data for Excel
    const excelData = filteredAlumni.map((alumni, index) => ({
      'No': index + 1,
      'Nama Alumni': alumni.alumni.nama,
      'NIS': alumni.alumni.nis,
      'NISN': alumni.alumni.nisn,
      'Jurusan': alumni.alumni.jurusan || '-',
      'Tahun Lulus': getYearOnly(alumni.alumni.tahun_lulus),
      'Tanggal Pengisian': formatTanggalIndo(alumni.tanggal_submit),
      'Total Jawaban': alumni.total_jawaban,
      'Status': alumni.status
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },  // No
      { wch: 25 }, // Nama
      { wch: 12 }, // NIS
      { wch: 15 }, // NISN
      { wch: 15 }, // Jurusan
      { wch: 12 }, // Tahun
      { wch: 20 }, // Tanggal
      { wch: 12 }, // Total Jawaban
      { wch: 15 }  // Status
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab);

    // Save Excel file
    XLSX.writeFile(wb, `Jawaban_Kuesioner_${activeTab}_${new Date().getTime()}.xlsx`);
  };

  const handleFilter = async (tab) => {
    try {
      const [dataJawaban] = await Promise.all([
        adminApi.getKuesionerJawaban(tab.id)
      ])
      let jawabanData = []
      if (dataJawaban?.data?.data?.data) {
        jawabanData = dataJawaban.data.data.data
      }

      setdataAlumni(jawabanData)

      calculateStats(jawabanData)

    } catch (error) {
      console.log(error)
    }
    setActiveTab(tab.status)
  }

  const handleViewDetail = (id) => {
    navigate(`/wb-admin/kuisoner/lihat-jawaban/detail/${id}`);
  };

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-700">

      {/* --- Header Section --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <Link
          to="/wb-admin/kuisoner"
          className="flex items-center gap-2 text-third hover:text-primary transition-colors text-sm font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Kembali
        </Link>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportPDF}
            className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <FileDown size={18} />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3D5A5C] text-white rounded-xl text-sm font-bold shadow-md shadow-[#3D5A5C]/20 hover:bg-[#2D4345] transition-all active:scale-95"
          >
            <FileSpreadsheet size={18} />
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <StatCard
          icon={<Users size={24} />}
          label="Total Responden"
          value={stats.totalResponden}
          bgColor="bg-white"
          iconColor="text-[#3D5A5C]"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Baru Minggu Ini"
          value={`+${stats.baruMingguIni}`}
          bgColor="bg-white"
          iconColor="text-emerald-500"
        />
        <StatCard
          icon={<ClipboardList size={24} />}
          label="Menunggu Tinjauan"
          value={stats.menungguTinjauan}
          bgColor="bg-white"
          iconColor="text-orange-500"
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      {/* --- Classification Tabs --- */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex p-1.5 bg-slate-200/50 backdrop-blur-sm rounded-2xl w-fit min-w-full sm:min-w-0 border border-slate-200">
          {tabs?.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleFilter(tab)}
              className={`
                cursor-pointer flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap
                ${activeTab === tab.status
                  ? "bg-white text-[#3D5A5C] shadow-sm ring-1 ring-slate-200/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/40"}
              `}
            >
              {tab.status}
            </button>
          ))}
        </div>
      </div>

      {/* --- Filters Section --- */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 h-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder={`Cari alumni yang sedang ${activeTab.toLowerCase()}...`}
            className="w-full pl-12 pr-4 h-full bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3D5A5C]/20 focus:border-[#3D5A5C] transition-all shadow-sm placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="w-full sm:w-56 h-12">
            <SmoothDropdown
              options={jurusanOptions}
              placeholder="Semua Jurusan"
              value={selectedJurusan}
              onSelect={(value) => setSelectedJurusan(value)}
            />
          </div>
          <div className="w-full sm:w-56 h-12">
            <SmoothDropdown
              options={tahunOptions}
              placeholder="Tahun Kelulusan"
              value={selectedTahun}
              onSelect={(value) => setSelectedTahun(value)}
            />
          </div>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-225">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-5 pl-8">Nama Alumni</th>
                <th className="px-6 py-5">Jurusan</th>
                <th className="px-6 py-5 text-center">Tahun</th>
                <th className="px-6 py-5">Tgl. Pengisian</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 pr-8 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredAlumni.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                      <Ghost size={48} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-slate-400 font-medium text-sm">Tidak ada data jawbaan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAlumni.map((alumni) => (
                  <tr key={alumni.alumni.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group last:border-0">
                    <td className="px-6 py-4 pl-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <img
                            src={alumni.alumni.foto || `https://i.pravatar.cc/150?u=${alumni.alumni.id}`}
                            alt={alumni.alumni.nama}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{alumni.alumni.nama}</p>
                          <p className="text-[11px] text-slate-400 font-medium">NIS : {alumni.alumni.nis}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-600 block truncate max-w-50">{alumni.alumni.jurusan || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{getYearOnly(alumni.alumni.tahun_lulus)}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{formatTanggalIndo(alumni.tanggal_submit)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border ${alumni.status === "Selesai"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-orange-50 text-orange-600 border-orange-100"
                        }`}>
                        {alumni.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 pr-8 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(alumni.alumni.id)}
                          className="p-2 text-slate-400 hover:text-[#3D5A5C] hover:bg-[#3D5A5C]/10 rounded-lg transition-all active:scale-95"
                          title="Lihat Detail Jawaban"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-slate-400 text-center sm:text-left">
            Menampilkan <span className="text-slate-700">{filteredAlumni.length > 0 ? 1 : 0}-{filteredAlumni.length}</span> dari <span className="text-slate-700">{stats.totalResponden}</span> data {activeTab}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#3D5A5C] hover:border-[#3D5A5C] transition-all disabled:opacity-50"
              disabled
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1">
              <button className="w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold bg-[#3D5A5C] text-white shadow-md shadow-[#3D5A5C]/20">1</button>
            </div>
            <button
              className="flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#3D5A5C] hover:border-[#3D5A5C] transition-all"
              disabled
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}