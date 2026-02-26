import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  GraduationCap,
  FileText,
  Download,
  Trash2,
  Pencil,
  Search,
  Building2,
  Loader2,
  X,
  Check,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { adminApi } from "../../api/admin";
import { alertSuccess, alertError, alertConfirm } from "../../utilitis/alert";
import SmoothDropdown from "../../components/admin/SmoothDropdown";

const PERUSAHAAN_PER_PAGE = 7;

const getPageNumbers = (current, last) => {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', last];
  if (current >= last - 3) return [1, '...', last - 4, last - 3, last - 2, last - 1, last];
  return [1, '...', current - 1, current, current + 1, '...', last];
};

// --- SUB-KOMPONEN MANAGED TABLE (UNTUK JURUSAN) ---
const ManagedTable = ({
  title,
  icon: Icon,
  data = [],
  loading,
  placeholder,
  onAddLabel,
  nameKey,
  onCreate,
  onUpdate,
  onDelete,
  readOnly = false,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await onCreate({ [nameKey]: newName.trim() });
      setNewName("");
      setIsAdding(false);
    } catch (err) {
      alertError(err.response?.data?.message || "Gagal menambah data");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await onUpdate(id, { [nameKey]: editName.trim() });
      setEditId(null);
    } catch (err) {
      alertError(err.response?.data?.message || "Gagal mengubah data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const { isConfirmed } = await alertConfirm(`Hapus "${name}"?`);
    if (!isConfirmed) return;
    try {
      await onDelete(id);
    } catch (err) {
      alertError(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  const filteredData = (data || []).filter((item) =>
    (item.nama || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="p-1.5 bg-blue-100 rounded-lg text-primary flex-shrink-0">
            <Icon size={16} />
          </div>
          <h3 className="font-bold text-primary text-md truncate">{title}</h3>
          <span className="text-xs text-slate-400 font-medium">({data.length})</span>
        </div>
        {!readOnly && (
          <button
            onClick={() => { setIsAdding(true); setEditId(null); }}
            className="text-fourth bg-primary flex items-center gap-1 text-xs font-bold hover:bg-secondary px-2.5 py-2 rounded-lg transition-all group cursor-pointer"
          >
            <Plus size={12} />
            <span className="hidden sm:inline">{onAddLabel}</span>
          </button>
        )}
      </div>

      <div className="px-4 pt-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder={`Cari ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50"
          />
        </div>
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 font-bold text-[12px] uppercase tracking-widest border-b-2 border-gray-200 bg-gray-50">
              <th className="px-3 py-3">Nama {title.replace("Manajemen ", "")}</th>
              {!readOnly && <th className="px-3 py-3 text-right w-32">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isAdding && !readOnly && (
              <tr className="bg-blue-50/50 animate-in fade-in duration-300">
                <td className="py-3 px-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none"
                    autoFocus
                  />
                </td>
                <td className="py-3 px-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setIsAdding(false); setNewName(""); }} className="cursor-pointer px-3 py-1.5 text-[12px] font-bold text-gray-500 hover:bg-gray-200 rounded transition-colors">Batal</button>
                    <button
                      onClick={handleCreate}
                      disabled={saving || !newName.trim()}
                      className="cursor-pointer px-3 py-1.5 text-[12px] font-bold bg-primary text-white rounded shadow-sm flex items-center gap-1"
                    >
                      {saving && <Loader2 size={12} className="animate-spin" />}
                      Simpan
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {loading ? (
              <tr><td colSpan={2} className="py-10 text-center"><Loader2 size={24} className="animate-spin text-primary mx-auto" /></td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={2} className="py-8 text-center text-xs text-slate-400">Tidak ada data.</td></tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="py-3 px-3">
                    {editId === item.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdate(item.id)}
                        className="w-full px-3 py-2 text-sm border border-primary rounded-lg focus:ring-1 focus:ring-primary outline-none bg-white"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-gray-700 text-sm group-hover:text-primary transition-colors">{item.nama}</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex justify-end gap-1">
                      {editId === item.id ? (
                        <>
                          <button onClick={() => handleUpdate(item.id)} disabled={saving} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                          </button>
                          <button onClick={() => setEditId(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditId(item.id); setEditName(item.nama); setIsAdding(false); }}
                            className="cursor-pointer p-2 text-gray-400 hover:text-primary hover:bg-blue-100 rounded-lg transition-all"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.nama)}
                            className="cursor-pointer p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- PERUSAHAAN TABLE ---
const PerusahaanTable = ({ data = [], loading, onRefresh, kotaList }) => {
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

  const FormRow = ({ onSave, onCancel }) => (
    <tr className="bg-blue-50/50 animate-in fade-in duration-300">
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
          <button onClick={onCancel} className="cursor-pointer px-2 py-1.5 text-[11px] font-bold text-gray-500 hover:bg-gray-200 rounded transition-colors">Batal</button>
          <button onClick={onSave} disabled={saving || !formData.nama_perusahaan.trim()} className="cursor-pointer px-2 py-1.5 text-[11px] font-bold bg-primary text-white rounded shadow-sm flex items-center gap-1">
            {saving && <Loader2 size={10} className="animate-spin" />} Simpan
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="p-1.5 bg-blue-100 rounded-lg text-primary"><Building2 size={16} /></div>
          <h3 className="font-bold text-primary text-md truncate">Manajemen Perusahaan</h3>
          <span className="text-xs text-slate-400 font-medium">({data.length})</span>
        </div>
        <button onClick={() => { setIsAdding(true); setEditId(null); resetForm(); }} className="text-fourth bg-primary flex items-center gap-1 text-xs font-bold hover:bg-secondary px-2.5 py-2 rounded-lg transition-all cursor-pointer">
          <Plus size={12} /> <span className="hidden sm:inline">Tambah Perusahaan</span>
        </button>
      </div>

      <div className="px-4 pt-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400 transition-colors" />
          </div>
          <input type="text" placeholder="Cari perusahaan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50/50" />
        </div>
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 font-bold text-[11px] uppercase tracking-widest border-b-2 border-gray-200 bg-gray-50">
              <th className="px-3 py-3">Nama</th>
              <th className="px-3 py-3">Kota</th>
              <th className="px-3 py-3">Alamat</th>
              <th className="px-3 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isAdding && <FormRow onSave={handleCreate} onCancel={() => { setIsAdding(false); resetForm(); }} />}
            {loading ? (
              <tr><td colSpan={4} className="py-10 text-center"><Loader2 size={24} className="animate-spin text-primary mx-auto" /></td></tr>
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-xs text-slate-400">Tidak ada data.</td></tr>
            ) : (
              paginatedData.map((item) =>
                editId === item.id ? (
                  <FormRow key={item.id} onSave={() => handleUpdate(item.id)} onCancel={() => { setEditId(null); resetForm(); }} />
                ) : (
                  <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-700 text-sm group-hover:text-primary transition-colors">{item.nama}</td>
                    <td className="py-3 px-3 text-xs text-gray-500">{item.kota?.nama || '-'}</td>
                    <td className="py-3 px-3 text-xs text-gray-500 max-w-[200px] truncate">{item.jalan || '-'}</td>
                    <td className="py-3 px-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => startEdit(item)} className="cursor-pointer p-2 text-gray-400 hover:text-primary hover:bg-blue-100 rounded-lg transition-all"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(item.id, item.nama)} className="cursor-pointer p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Hal. {currentPage} dari {totalPages}</span>
          <div className="flex items-center gap-1">
            <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50"><ChevronLeft size={14}/></button>
            {getPageNumbers(currentPage, totalPages).map((page, i) => (
              <button key={i} onClick={() => typeof page === 'number' && setCurrentPage(page)} className={`min-w-[28px] h-7 rounded-lg text-xs font-bold ${currentPage === page ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{page}</button>
            ))}
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50"><ChevronRight size={14}/></button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN MASTER TABLE ---
const MasterTable = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 space-y-4 order-last lg:order-first">
          <ManagedTable
            title="Manajemen Jurusan"
            icon={GraduationCap}
            data={jurusanData}
            loading={loadingJurusan}
            placeholder="Contoh: Teknik Komputer Jaringan"
            onAddLabel="Tambah Jurusan"
            nameKey="nama_jurusan"
            onCreate={async (d) => { await adminApi.createJurusan(d); alertSuccess("Berhasil"); fetchJurusan(); }}
            onUpdate={async (id, d) => { await adminApi.updateJurusan(id, d); alertSuccess("Berhasil"); fetchJurusan(); }}
            onDelete={async (id) => { await adminApi.deleteJurusan(id); alertSuccess("Berhasil"); fetchJurusan(); }}
          />
          <PerusahaanTable data={perusahaanData} loading={loadingPerusahaan} onRefresh={fetchPerusahaan} kotaList={kotaList} />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-4 sticky top-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-lg text-primary"><FileText size={16} /></div>
              <h3 className="font-bold text-primary text-sm">Ekspor Laporan</h3>
            </div>
            <div className="space-y-4">
              <SmoothDropdown label="Jenis Data" options={["Data Jurusan", "Data Perusahaan"]} onSelect={(e) => setSelectedReport(e.target.value)} />
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase">Format</label>
                <div className="flex gap-2">
                  {["CSV", "PDF"].map(fmt => (
                    <button key={fmt} onClick={() => setSelectedFormat(fmt)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${selectedFormat === fmt ? "bg-primary text-white" : "bg-gray-50 text-gray-400 border"}`}>{fmt}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleBuatLaporan} disabled={exportingReport} className="w-full py-2.5 bg-primary text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                {exportingReport ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Unduh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterTable;