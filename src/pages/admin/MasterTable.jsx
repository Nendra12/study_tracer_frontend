import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  GraduationCap,
  Plus,
  Trash2,
  Pencil,
  Search,
  Loader2,
  X,
  Check
} from "lucide-react";
import { adminApi } from "../../api/admin";
import { alertSuccess, alertError, alertConfirm } from "../../utilitis/alert";
import ManagedTable from "../../components/admin/ManagedTable";
import BoxUnduhData from "../../components/admin/BoxUnduhData";
import TableLayoutSkeleton from "../../components/admin/TableLayoutSkeleton";
import Pagination from "../../components/admin/Pagination";

const PERUSAHAAN_PER_PAGE = 7;

// --- PERUSAHAAN TABLE ---
const PerusahaanTable = ({ data = [], onRefresh, kotaList }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ nama_perusahaan: "", id_kota: "", alamat_perusahaan: "" });
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const resetForm = () => setFormData({ nama_perusahaan: "", id_kota: "", alamat_perusahaan: "" });

  const handleCreate = async () => {
    if (!formData.nama_perusahaan.trim()) return;
    setSaving(true);
    try {
      await adminApi.createPerusahaan(formData);
      alertSuccess("Perusahaan berhasil ditambahkan");
      resetForm();
      setIsAdding(false);
      onRefresh();
    } catch (err) {
      alertError(err.response?.data?.message || "Gagal menambah perusahaan");
    } finally { setSaving(false); }
  };

  const handleUpdate = async (id) => {
    if (!formData.nama_perusahaan.trim()) return;
    setSaving(true);
    try {
      await adminApi.updatePerusahaan(id, formData);
      alertSuccess("Perusahaan berhasil diubah");
      setEditId(null);
      resetForm();
      onRefresh();
    } catch (err) {
      alertError(err.response?.data?.message || "Gagal mengubah perusahaan");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    const { isConfirmed } = await alertConfirm(`Hapus perusahaan "${name}"?`);
    if (!isConfirmed) return;
    try {
      await adminApi.deletePerusahaan(id);
      alertSuccess("Perusahaan berhasil dihapus");
      onRefresh();
    } catch (err) {
      alertError(err.response?.data?.message || "Gagal menghapus perusahaan");
    }
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setIsAdding(false);
    setFormData({
      nama_perusahaan: item.nama || "",
      id_kota: item.kota?.id || item.id_kota || "",
      alamat_perusahaan: item.jalan || item.alamat_perusahaan || "",
    });
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const filteredData = (data || []).filter((item) =>
    (item.nama || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PERUSAHAAN_PER_PAGE));
  const paginatedData = filteredData.slice((currentPage - 1) * PERUSAHAAN_PER_PAGE, currentPage * PERUSAHAAN_PER_PAGE);

  return (
    <div className="bg-white rounded-lg border border-gray-100 mb-6 overflow-hidden shadow-sm">
      <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="p-1.5 bg-blue-100 rounded-lg text-primary"><Building2 size={16} /></div>
          <h3 className="font-bold text-primary text-md truncate">Manajemen Perusahaan</h3>
          <span className="text-xs text-slate-400 font-medium">({filteredData.length})</span>
        </div>
        <button onClick={() => { setIsAdding(true); setEditId(null); resetForm(); }} className="text-fourth bg-primary flex items-center gap-1 text-xs font-bold hover:text-white hover:bg-secondary px-2.5 py-2 rounded-lg transition-all cursor-pointer group">
          <Plus size={12} className="group-hover:scale-125 transition-transform" /> <span className="hidden sm:inline">Tambah Perusahaan</span>
        </button>
      </div>

      <div className="px-4 pt-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input type="text" placeholder="Cari perusahaan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50" />
        </div>
      </div>

      <div className="p-4 overflow-x-auto min-h-[250px]">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-3 w-1/4">Nama</th>
              <th className="px-3 py-3 w-1/4">Kota</th>
              <th className="px-3 py-3 w-1/3">Alamat</th>
              <th className="px-3 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            
            {/* ROW TAMBAH DATA (Di-render langsung, bukan via komponen) */}
            {isAdding && (
              <tr className="bg-blue-50/50 animate-in fade-in duration-300 align-top">
                <td className="py-2 px-3">
                  <input type="text" value={formData.nama_perusahaan} onChange={(e) => setFormData(p => ({ ...p, nama_perusahaan: e.target.value }))} placeholder="Nama Perusahaan" className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none" autoFocus />
                </td>
                <td className="py-2 px-3">
                  <select value={formData.id_kota} onChange={(e) => setFormData(p => ({ ...p, id_kota: e.target.value }))} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none bg-white">
                    <option value="">-- Kota --</option>
                    {kotaList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                </td>
                <td className="py-2 px-3">
                  <input type="text" value={formData.alamat_perusahaan} onChange={(e) => setFormData(p => ({ ...p, alamat_perusahaan: e.target.value }))} placeholder="Alamat" className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none" />
                </td>
                <td className="py-2 px-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setIsAdding(false); resetForm(); }} className="cursor-pointer px-2 py-1.5 text-[11px] font-bold text-gray-500 hover:bg-gray-200 rounded transition-colors">Batal</button>
                    <button onClick={handleCreate} disabled={saving || !formData.nama_perusahaan.trim()} className="cursor-pointer px-2 py-1.5 text-[11px] font-bold bg-primary text-white rounded shadow-sm flex items-center gap-1 hover:opacity-90 disabled:opacity-50">
                      {saving && <Loader2 size={10} className="animate-spin" />} Simpan
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {paginatedData.length === 0 ? (
              <tr><td colSpan={4} className="py-6 text-center text-xs text-slate-400">Tidak ada data ditemukan.</td></tr>
            ) : (
              paginatedData.map((item) =>
                editId === item.id ? (
                  
                  /* ROW EDIT DATA (Di-render langsung) */
                  <tr key={item.id} className="bg-blue-50/50 animate-in fade-in duration-300 align-top">
                    <td className="py-2 px-3">
                      <input type="text" value={formData.nama_perusahaan} onChange={(e) => setFormData(p => ({ ...p, nama_perusahaan: e.target.value }))} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none" autoFocus />
                    </td>
                    <td className="py-2 px-3">
                      <select value={formData.id_kota} onChange={(e) => setFormData(p => ({ ...p, id_kota: e.target.value }))} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none bg-white">
                        <option value="">-- Kota --</option>
                        {kotaList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input type="text" value={formData.alamat_perusahaan} onChange={(e) => setFormData(p => ({ ...p, alamat_perusahaan: e.target.value }))} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditId(null); resetForm(); }} className="cursor-pointer px-2 py-1.5 text-[11px] font-bold text-gray-500 hover:bg-gray-200 rounded transition-colors">Batal</button>
                        <button onClick={() => handleUpdate(item.id)} disabled={saving || !formData.nama_perusahaan.trim()} className="cursor-pointer px-2 py-1.5 text-[11px] font-bold bg-primary text-white rounded shadow-sm flex items-center gap-1 hover:opacity-90 disabled:opacity-50">
                          {saving && <Loader2 size={10} className="animate-spin" />} Simpan
                        </button>
                      </div>
                    </td>
                  </tr>

                ) : (
                  
                  /* ROW TAMPIL DATA BIASA */
                  <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors align-top">
                    <td className="py-3 px-3 font-medium text-gray-700 text-sm group-hover:text-primary transition-colors">{item.nama}</td>
                    <td className="py-3 px-3 text-xs text-gray-500">{item.kota?.nama || '-'}</td>
                    <td className="py-3 px-3 text-xs text-gray-500 max-w-[200px] truncate">{item.jalan || '-'}</td>
                    <td className="py-3 px-3">
                      <div className="flex justify-end gap-1 transition-opacity">
                        <button onClick={() => startEdit(item)} className="cursor-pointer p-1.5 text-gray-400 hover:text-[#3C5759] hover:bg-blue-100 rounded-lg active:scale-90"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(item.id, item.nama)} className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-lg active:scale-90"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>

                )
              )
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={(page) => setCurrentPage(page)} 
      />
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function MasterTable() {
  const [selectedFormat, setSelectedFormat] = useState("CSV");
  const [selectedReport, setSelectedReport] = useState("Data Jurusan");
  const [exportingReport, setExportingReport] = useState(false);
  
  const [jurusanData, setJurusanData] = useState([]);
  const [perusahaanData, setPerusahaanData] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  
  const [loadingJurusan, setLoadingJurusan] = useState(true);
  const [loadingPerusahaan, setLoadingPerusahaan] = useState(true);

  const fetchJurusan = useCallback(async () => {
    setLoadingJurusan(true);
    try {
      const res = await adminApi.getJurusan();
      setJurusanData(res.data.data || []);
    } catch { /* ignore */ }
    finally { setLoadingJurusan(false); }
  }, []);

  const fetchPerusahaan = useCallback(async () => {
    setLoadingPerusahaan(true);
    try {
      const res = await adminApi.getPerusahaan();
      const content = res.data.data;
      setPerusahaanData(Array.isArray(content) ? content : (content?.data || []));
    } catch { setPerusahaanData([]); }
    finally { setLoadingPerusahaan(false); }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getKota();
        setKotaList(res.data.data || []);
      } catch { /* ignore */ }
    })();
    fetchJurusan();
    fetchPerusahaan();
  }, [fetchJurusan, fetchPerusahaan]);

  const handleBuatLaporan = async () => {
    setExportingReport(true);
    try {
      let headers, rows, fileName, title;
      if (selectedReport === 'Data Jurusan') {
        headers = ['Nama Jurusan'];
        rows = jurusanData.map(j => [j.nama]);
        fileName = `laporan_jurusan_${new Date().toISOString().slice(0,10)}`;
        title = 'Laporan Data Jurusan';
      } else {
        headers = ['Nama Perusahaan', 'Kota', 'Alamat'];
        rows = perusahaanData.map(p => [p.nama, p.kota?.nama || '', p.jalan || '']);
        fileName = `laporan_perusahaan_${new Date().toISOString().slice(0,10)}`;
        title = 'Laporan Data Perusahaan';
      }

      if (selectedFormat === 'PDF') {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        const doc = new jsPDF();
        doc.text(title, 14, 15);
        autoTable(doc, { head: [headers], body: rows, startY: 25, headStyles: { fillColor: [60, 87, 89] } });
        doc.save(`${fileName}.pdf`);
      } else {
        const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${fileName}.csv`; a.click();
        URL.revokeObjectURL(url);
      }
      alertSuccess('Laporan berhasil diunduh');
    } catch { alertError('Gagal membuat laporan'); }
    finally { setExportingReport(false); }
  };

  // Tampilkan Skeleton selama data masih di-fetch
  if (loadingJurusan || loadingPerusahaan) {
    return <TableLayoutSkeleton tableCount={2} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        
        {/* KOLOM KIRI: DAFTAR TABEL */}
        <div className="lg:col-span-8 space-y-6 order-last lg:order-first">
          <ManagedTable
            title="Manajemen Jurusan"
            icon={GraduationCap}
            data={jurusanData}
            placeholder="Contoh: Teknik Komputer Jaringan"
            onAddLabel="Tambah Jurusan"
            nameKey="nama_jurusan"
            onCreate={async (d) => { await adminApi.createJurusan(d); alertSuccess("Berhasil ditambahkan"); fetchJurusan(); }}
            onUpdate={async (id, d) => { await adminApi.updateJurusan(id, d); alertSuccess("Berhasil diubah"); fetchJurusan(); }}
            onDelete={async (id) => { await adminApi.deleteJurusan(id); alertSuccess("Berhasil dihapus"); fetchJurusan(); }}
          />
          <PerusahaanTable 
            data={perusahaanData} 
            onRefresh={fetchPerusahaan} 
            kotaList={kotaList} 
          />
        </div>

        {/* KOLOM KANAN: MENGGUNAKAN KOMPONEN BOX UNDUH DATA */}
        <BoxUnduhData
          title="Ekspor Laporan"
          options={["Data Jurusan", "Data Perusahaan"]}
          selectedFormat={selectedFormat}
          onFormatSelect={(fmt) => setSelectedFormat(fmt)}
          onReportSelect={(val) => setSelectedReport(val)}
          onDownload={handleBuatLaporan}
          isExporting={exportingReport}
        />

      </div>
    </div>
  );
}