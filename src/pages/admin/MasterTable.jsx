import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Building2,
  GraduationCap,
  Plus,
  Trash2,
  Pencil,
  Search
} from "lucide-react";
import { adminApi } from "../../api/admin";
import { alertSuccess, alertError, alertConfirm, alertWarning } from "../../utilitis/alert"; 
import ManagedTable from "../../components/admin/ManagedTable";
import BoxUnduhData from "../../components/admin/BoxUnduhData";
import TableLayoutSkeleton from "../../components/admin/skeleton/TableLayoutSkeleton";
import Pagination from "../../components/admin/Pagination";
import PerusahaanEditorModal from "../../components/admin/PerusahaanEditorModal";
import { downloadCsv, createExportFileName } from "../../utilitis/export";

const PERUSAHAAN_PER_PAGE = 7;

// --- PERUSAHAAN TABLE ---
const PerusahaanTable = ({ data = [], onRefresh, kotaList }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ nama_perusahaan: "", id_kota: "", jalan: "" });
  const [formErrors, setFormErrors] = useState({ nama_perusahaan: "", id_kota: "" });
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const deleteLock = useRef(false);

  const resetForm = () => {
    setFormData({ nama_perusahaan: "", id_kota: "", jalan: "" });
    setFormErrors({ nama_perusahaan: "", id_kota: "" });
  };

  const getKotaById = (idKota) => {
    if (!idKota) return null;
    return kotaList.find((k) => String(k.id) === String(idKota)) || null;
  };

  const getKotaIdFromItem = (item) => {
    const directId = item?.id_kota || item?.kota?.id || item?.kota_id || item?.kotaId;
    if (directId) return String(directId);

    const cityName = typeof item?.kota === "string"
      ? item.kota
      : item?.kota?.nama || item?.nama_kota;

    if (!cityName) return "";
    const match = kotaList.find((k) => (k.nama || "").toLowerCase() === String(cityName).toLowerCase());
    return match ? String(match.id) : "";
  };

  const resolveLocation = (item) => {
    const kotaObj = typeof item.kota === "object" && item.kota ? item.kota : null;
    const kotaFromList = getKotaById(item.id_kota || kotaObj?.id);

    const kota = kotaObj?.nama || (typeof item.kota === "string" ? item.kota : "") || kotaFromList?.nama || "-";
    const provinsi = kotaObj?.provinsi?.nama || item.provinsi?.nama || kotaFromList?.provinsi?.nama || kotaFromList?.nama_provinsi || "-";

    return { kota, provinsi };
  };

  const selectedKota = getKotaById(formData.id_kota);
  const selectedProvinsiLabel = selectedKota?.provinsi?.nama || selectedKota?.nama_provinsi || "-";

  const validateForm = () => {
    const errors = {
      nama_perusahaan: formData.nama_perusahaan.trim() ? "" : "Nama perusahaan wajib diisi.",
      id_kota: formData.id_kota ? "" : "Kota wajib dipilih.",
    };

    setFormErrors(errors);
    return !errors.nama_perusahaan && !errors.id_kota;
  };

  const isDuplicate = (name, currentId = null) => {
    return data.some(item => 
      item.nama?.toLowerCase().trim() === name.toLowerCase().trim() && item.id !== currentId
    );
  };

  const handleCreate = async () => {
    const trimmedName = formData.nama_perusahaan.trim();
    if (!validateForm()) return;

    if (isDuplicate(trimmedName)) {
      return alertWarning(`Perusahaan "${trimmedName}" sudah ada dalam daftar.`);
    }

    setSaving(true);
    try {
      await adminApi.createPerusahaan({
        nama_perusahaan: trimmedName,
        id_kota: formData.id_kota,
        jalan: formData.jalan?.trim() || "",
      });
      alertSuccess("Perusahaan berhasil ditambahkan");
      resetForm();
      setIsAdding(false);
      onRefresh();
    } catch (err) {
      alertError(err.response?.data?.message || "Gagal menambah perusahaan");
    } finally { setSaving(false); }
  };

  const handleUpdate = async (id) => {
    const trimmedName = formData.nama_perusahaan.trim();
    if (!validateForm()) return;

    if (isDuplicate(trimmedName, id)) {
      return alertWarning(`Nama perusahaan "${trimmedName}" sudah digunakan oleh data lain.`);
    }

    setSaving(true);
    try {
      await adminApi.updatePerusahaan(id, {
        nama_perusahaan: trimmedName,
        id_kota: formData.id_kota,
        jalan: formData.jalan?.trim() || "",
      });
      alertSuccess("Perusahaan berhasil diperbarui");
      setEditId(null);
      resetForm();
      onRefresh();
    } catch (err) {
      alertError(err.response?.data?.message || "Gagal mengubah perusahaan");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (deleteLock.current) return;
    deleteLock.current = true;

    try {
      // PerusahaanTable BUKAN ManagedTable, jadi di sini KITA TETAP BUTUH alertConfirm
      const { isConfirmed } = await alertConfirm(`Apakah Anda yakin ingin menghapus perusahaan "${name}"?`);
      if (!isConfirmed) return;
      
      await adminApi.deletePerusahaan(id);
      alertSuccess("Perusahaan berhasil dihapus");
      onRefresh();
    } catch (err) {
      alertError(err.response?.data?.message || "Gagal menghapus perusahaan");
    } finally {
      deleteLock.current = false;
    }
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setIsAdding(false);
    setFormData({
      nama_perusahaan: item.nama || "",
      id_kota: getKotaIdFromItem(item),
      jalan: item.jalan || "",
    });
    setFormErrors({ nama_perusahaan: "", id_kota: "" });
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const filteredData = (data || []).filter((item) =>
    (item.nama || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PERUSAHAAN_PER_PAGE));
  const paginatedData = filteredData.slice((currentPage - 1) * PERUSAHAAN_PER_PAGE, currentPage * PERUSAHAAN_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="bg-white rounded-lg border border-gray-100 mb-6 overflow-hidden shadow-sm">
      <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-linear-to-r from-white to-gray-50">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="p-1.5 bg-blue-100 rounded-lg text-primary"><Building2 size={16} /></div>
          <h3 className="font-bold text-primary text-md truncate">Manajemen Perusahaan</h3>
          <span className="text-xs text-slate-400 font-medium">({filteredData.length})</span>
        </div>
        <button onClick={() => { setIsAdding(true); setEditId(null); resetForm(); }} className="text-fourth bg-primary flex items-center gap-1 text-xs font-bold hover:text-white hover:opacity-90 px-2.5 py-2 rounded-lg transition-all cursor-pointer group">
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

      <div className="p-4 overflow-x-auto min-h-62.5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-3 w-1/4">Nama</th>
              <th className="px-3 py-3 w-1/5">Kota</th>
              <th className="px-3 py-3 w-1/5">Provinsi</th>
              <th className="px-3 py-3 w-1/3">Alamat</th>
              <th className="px-3 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr><td colSpan={5} className="py-6 text-center text-xs text-slate-400">Tidak ada data ditemukan.</td></tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors align-top">
                  <td className="py-3 px-3 font-medium text-gray-700 text-sm group-hover:text-primary transition-colors">{item.nama}</td>
                  <td className="py-3 px-3 text-xs text-gray-500">{resolveLocation(item).kota}</td>
                  <td className="py-3 px-3 text-xs text-gray-500">{resolveLocation(item).provinsi}</td>
                  <td className="py-3 px-3 text-xs text-gray-500 max-w-50 truncate">{item.jalan || '-'}</td>
                  <td className="py-3 px-3">
                    <div className="flex justify-end gap-1 transition-opacity">
                      <button onClick={() => startEdit(item)} className="cursor-pointer p-1.5 text-gray-400 hover:text-[#3C5759] hover:bg-blue-100 rounded-lg active:scale-90" title="Edit"><Pencil size={14} /></button>
                      <button onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDelete(item.id, item.nama);
                      }} className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-lg active:scale-90" title="Hapus"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={(page) => setCurrentPage(page)} 
      />

      <PerusahaanEditorModal
        isOpen={isAdding || editId !== null}
        mode={isAdding ? "add" : "edit"}
        formData={formData}
        errors={formErrors}
        kotaList={kotaList}
        selectedProvinsiLabel={selectedProvinsiLabel}
        saving={saving}
        onNameChange={(val) => {
          setFormData((prev) => ({ ...prev, nama_perusahaan: val }));
          setFormErrors((prev) => ({ ...prev, nama_perusahaan: val.trim() ? "" : "Nama perusahaan wajib diisi." }));
        }}
        onAlamatChange={(val) => setFormData((prev) => ({ ...prev, jalan: val }))}
        onKotaChange={(val) => {
          setFormData((prev) => ({ ...prev, id_kota: val }));
          setFormErrors((prev) => ({ ...prev, id_kota: "" }));
        }}
        onCancel={() => { setIsAdding(false); setEditId(null); resetForm(); }}
        onSave={() => {
          if (isAdding) return handleCreate();
          if (editId !== null) return handleUpdate(editId);
          return null;
        }}
      />
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function MasterTable() {
  const [selectedFormat, setSelectedFormat] = useState("CSV");
  const [selectedReport, setSelectedReport] = useState("Data Jurusan");
  const [exportingReport, setExportingReport] = useState(false);
  
  const deleteJurusanLock = useRef(false);

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
    } catch { 
      alertError("Gagal memuat data jurusan");
    } finally { setLoadingJurusan(false); }
  }, []);

  const fetchPerusahaan = useCallback(async () => {
    setLoadingPerusahaan(true);
    try {
      const res = await adminApi.getPerusahaan({ per_page: 2000 });
      const content = res.data.data;
      setPerusahaanData(Array.isArray(content) ? content : (content?.data || []));
    } catch { 
      setPerusahaanData([]);
      alertError("Gagal memuat data perusahaan");
    } finally { setLoadingPerusahaan(false); }
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

  const isJurusanDuplicate = (name, currentId = null) => {
    return jurusanData.some(j => j.nama?.toLowerCase().trim() === name.toLowerCase().trim() && j.id !== currentId);
  };

  const resolvePerusahaanLocationForExport = (item) => {
    const kotaObj = typeof item.kota === "object" && item.kota ? item.kota : null;
    const kotaFromList = kotaList.find((k) => String(k.id) === String(item.id_kota || kotaObj?.id));

    return {
      kota: kotaObj?.nama || (typeof item.kota === "string" ? item.kota : "") || kotaFromList?.nama || "-",
      provinsi: kotaObj?.provinsi?.nama || item.provinsi?.nama || kotaFromList?.provinsi?.nama || kotaFromList?.nama_provinsi || "-",
    };
  };

  const handleBuatLaporan = async () => {
    setExportingReport(true);
    try {
      let headers, rows, fileName, title;
      if (selectedReport === 'Data Jurusan') {
        if (jurusanData.length === 0) return alertWarning("Data Jurusan kosong");
        headers = ['No', 'Nama Jurusan'];
        rows = jurusanData.map((j, index) => [index + 1, j.nama || '-']);
        fileName = 'laporan_jurusan';
        title = 'Laporan Data Jurusan';
      } else {
        if (perusahaanData.length === 0) return alertWarning("Data Perusahaan kosong");
        headers = ['No', 'Nama Perusahaan', 'Kota', 'Provinsi', 'Alamat'];
        rows = perusahaanData.map((p, index) => {
          const location = resolvePerusahaanLocationForExport(p);
          return [index + 1, p.nama || '-', location.kota, location.provinsi, p.jalan || '-'];
        });
        fileName = 'laporan_perusahaan';
        title = 'Laporan Data Perusahaan';
      }

      if (selectedFormat === 'PDF') {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        const doc = new jsPDF();
        doc.text(title, 14, 15);
        autoTable(doc, { head: [headers], body: rows, startY: 25, headStyles: { fillColor: [60, 87, 89] } });
        doc.save(createExportFileName(fileName, 'pdf'));
      } else {
        downloadCsv({ headers, rows, prefix: fileName });
      }
      alertSuccess('Laporan berhasil diunduh');
    } catch { alertError('Gagal membuat laporan'); }
    finally { setExportingReport(false); }
  };

  if (loadingJurusan || loadingPerusahaan) {
    return <TableLayoutSkeleton tableCount={2} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-8 space-y-6 order-last lg:order-first">
          <ManagedTable
            title="Manajemen Jurusan"
            icon={GraduationCap}
            data={jurusanData}
            placeholder="Contoh: Teknik Komputer Jaringan"
            onAddLabel="Tambah Jurusan"
            nameKey="nama_jurusan"
            onCreate={async (d) => { 
              if (isJurusanDuplicate(d.nama_jurusan)) return alertWarning(`Jurusan "${d.nama_jurusan}" sudah terdaftar.`);
              try {
                await adminApi.createJurusan(d); 
                alertSuccess("Jurusan berhasil ditambahkan"); 
                fetchJurusan(); 
              } catch (e) { alertError("Gagal menambah jurusan"); }
            }}
            onUpdate={async (id, d) => { 
              if (isJurusanDuplicate(d.nama_jurusan, id)) return alertWarning(`Nama jurusan "${d.nama_jurusan}" sudah digunakan.`);
              try {
                await adminApi.updateJurusan(id, d); 
                alertSuccess("Jurusan berhasil diperbarui"); 
                fetchJurusan(); 
              } catch (e) { alertError("Gagal mengubah jurusan"); }
            }}
            
            /* --- INI BAGIAN YANG DIPERBAIKI --- */
            onDelete={async (id) => { 
              if (deleteJurusanLock.current) return;
              deleteJurusanLock.current = true;

              try {
                // KITA HAPUS alertConfirm dari sini karena komponen <ManagedTable/> 
                // secara otomatis sudah menanyakan "Apakah Anda Yakin?" di dalam desainnya.
                
                await adminApi.deleteJurusan(id); 
                alertSuccess("Jurusan berhasil dihapus"); 
                fetchJurusan(); 
              } catch (e) { 
                alertError("Gagal menghapus jurusan"); 
              } finally {
                deleteJurusanLock.current = false;
              }
            }}
            /* --------------------------------- */
            
            useTextEditActions={true}
          />
          <PerusahaanTable 
            data={perusahaanData} 
            onRefresh={fetchPerusahaan} 
            kotaList={kotaList} 
          />
        </div>

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