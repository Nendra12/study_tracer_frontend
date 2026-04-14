import React, { useState, useEffect, useCallback } from "react";
import { School, BookOpen, Store, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { alertSuccess, alertError, alertWarning } from "../../utilitis/alert";
import { adminApi } from "../../api/admin";
import { createExportFileName, downloadCsv } from "../../utilitis/export";

// --- IMPORT KOMPONEN REUSABLE ---
import ManagedTable from "../../components/admin/ManagedTable";
import BoxUnduhData from "../../components/admin/BoxUnduhData";
import TableLayoutSkeleton from "../../components/admin/skeleton/TableLayoutSkeleton";
import SmoothKota from "../../components/admin/SmoothKota";

function UniversitasTable({ data = [], kotaList = [], onCreate, onUpdate, onDelete }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ nama_universitas: '', alamat: '', id_kota: '' });

  const resetForm = () => setFormData({ nama_universitas: '', alamat: '', id_kota: '' });

  const startEdit = (item) => {
    setIsAdding(false);
    setEditId(item.id);
    setFormData({
      nama_universitas: item.nama || '',
      alamat: item.alamat || '',
      id_kota: item.id_kota ? String(item.id_kota) : (item.kota_id ? String(item.kota_id) : ''),
    });
  };

  const handleCreate = async () => {
    if (!formData.nama_universitas.trim() || !formData.id_kota) return;
    setSaving(true);
    try {
      await onCreate(formData);
      resetForm();
      setIsAdding(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!formData.nama_universitas.trim() || !formData.id_kota) return;
    setSaving(true);
    try {
      await onUpdate(id, formData);
      resetForm();
      setEditId(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 mb-6 shadow-sm overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-100 rounded-lg text-primary"><School size={16} /></div>
          <h3 className="font-bold text-primary text-md">Data Universitas</h3>
          <span className="text-xs text-slate-400 font-medium">({data.length})</span>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            resetForm();
            setIsAdding(true);
          }}
          className="text-fourth bg-primary flex items-center gap-1 text-xs font-bold hover:text-white hover:opacity-90 px-2.5 py-2 rounded-lg transition-all cursor-pointer"
        >
          <Plus size={12} /> Tambah Kampus
        </button>
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-3">Nama</th>
              <th className="px-3 py-3">Program Studi</th>
              <th className="px-3 py-3">Alamat</th>
              <th className="px-3 py-3">Kota</th>
              <th className="px-3 py-3">Provinsi</th>
              <th className="px-3 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isAdding && (
              <tr className="bg-blue-50/50 align-top">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={formData.nama_universitas}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nama_universitas: e.target.value }))}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded"
                    placeholder="Nama universitas"
                  />
                </td>
                <td className="px-3 py-2">
                  <span className="text-xs text-slate-400">Diatur di tabel Program Studi</span>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={formData.alamat}
                    onChange={(e) => setFormData((prev) => ({ ...prev, alamat: e.target.value }))}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded"
                    placeholder="Alamat universitas"
                  />
                </td>
                <td className="px-3 py-2">
                  <SmoothKota
                    isSearchable={true}
                    placeholder="Pilih Kota"
                    value={formData.id_kota}
                    options={kotaList.map((k) => ({ value: String(k.id), label: k.nama }))}
                    onSelect={(val) => setFormData((prev) => ({ ...prev, id_kota: String(val) }))}
                  />
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">Otomatis dari kota</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <button onClick={handleCreate} disabled={saving} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded">
                      <Check size={14} />
                    </button>
                    <button onClick={() => { setIsAdding(false); resetForm(); }} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded">
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {data.length === 0 && !isAdding ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-slate-400">Tidak ada data universitas.</td>
              </tr>
            ) : (
              data.map((item) => (
                editId === item.id ? (
                  <tr key={item.id} className="bg-blue-50/50 align-top">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={formData.nama_universitas}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nama_universitas: e.target.value }))}
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-slate-400">Diatur di tabel Program Studi</span>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={formData.alamat}
                        onChange={(e) => setFormData((prev) => ({ ...prev, alamat: e.target.value }))}
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <SmoothKota
                        isSearchable={true}
                        placeholder="Pilih Kota"
                        value={formData.id_kota}
                        options={kotaList.map((k) => ({ value: String(k.id), label: k.nama }))}
                        onSelect={(val) => setFormData((prev) => ({ ...prev, id_kota: String(val) }))}
                      />
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">Otomatis dari kota</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleUpdate(item.id)} disabled={saving} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded">
                          <Check size={14} />
                        </button>
                        <button onClick={() => { setEditId(null); resetForm(); }} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded">
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-3 text-sm font-medium text-gray-700">{item.nama || '-'}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">
                      {item.jurusan?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.jurusan.map((j) => (
                            <span key={`${item.id}-${j}`} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              {j}
                            </span>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">{item.alamat || '-'}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{item.kota || '-'}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{item.provinsi || '-'}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => startEdit(item)} className="p-1.5 text-gray-400 hover:text-[#3C5759] hover:bg-blue-100 rounded-lg"><Pencil size={14} /></button>
                        <button onClick={() => onDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function StatusKarir() {
  // --- STATE UNTUK EKSPOR ---
  const [selectedFormat, setSelectedFormat] = useState("CSV");
  const [selectedReport, setSelectedReport] = useState("Data Universitas");
  const [exportingReport, setExportingReport] = useState(false);

  // --- STATE UNTUK DATA TABEL ---
  const [univData, setUnivData] = useState([]);
  const [prodiData, setProdiData] = useState([]);
  const [wirausahaData, setWirausahaData] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  
  // --- STATE LOADING ---
  const [loading, setLoading] = useState({ univ: true, prodi: true, wirausaha: true });

  // --- FUNGSI FETCH DATA DARI API ---
  const fetchUniversitas = useCallback(async () => {
    setLoading(prev => ({ ...prev, univ: true }));
    try {
      const res = await adminApi.getStatusKarierUniversitas();
      const data = res.data?.data || [];
      setUnivData(
        data.map((u) => {
          const rawJurusan = Array.isArray(u.jurusan_kuliah)
            ? u.jurusan_kuliah
            : u.jurusan_kuliah
              ? [u.jurusan_kuliah]
              : [];

          return { 
            id: u.id, 
            nama: u.nama || u.nama_universitas, 
            jurusan: rawJurusan.map((j) => j.nama || j.nama_jurusan || j.nama_prodi).filter(Boolean),
            alamat: u.alamat || u.jalan || '-',
            id_kota: u.id_kota || u.kota?.id || '',
            kota: u.kota?.nama || u.nama_kota || '-',
            provinsi: u.provinsi?.nama || u.kota?.provinsi?.nama || u.nama_provinsi || '-',
          };
        })
      );
    } catch (err) { 
      console.error("Gagal memuat universitas:", err); 
    } finally { 
      setLoading(prev => ({ ...prev, univ: false })); 
    }
  }, []);

  const fetchProdi = useCallback(async () => {
    setLoading(prev => ({ ...prev, prodi: true }));
    try {
      const res = await adminApi.getStatusKarierProdi();
      setProdiData((res.data?.data || []).map((p) => ({ 
        id: p.id, 
        nama: p.nama || p.nama_jurusan 
      })));
    } catch (err) { 
      console.error("Gagal memuat prodi:", err); 
    } finally { 
      setLoading(prev => ({ ...prev, prodi: false })); 
    }
  }, []);

  const fetchWirausaha = useCallback(async () => {
    setLoading(prev => ({ ...prev, wirausaha: true }));
    try {
      const res = await adminApi.getStatusKarierBidangUsaha();
      setWirausahaData((res.data?.data || []).map((w) => ({ 
        id: w.id, 
        nama: w.nama || w.nama_bidang 
      })));
    } catch (err) { 
      console.error("Gagal memuat bidang usaha:", err); 
    } finally { 
      setLoading(prev => ({ ...prev, wirausaha: false })); 
    }
  }, []);

  useEffect(() => {
    fetchUniversitas();
    fetchProdi();
    fetchWirausaha();

    adminApi.getKota()
      .then((res) => {
        setKotaList(res.data?.data || []);
      })
      .catch(() => setKotaList([]));
  }, [fetchUniversitas, fetchProdi, fetchWirausaha]);


  const isDuplicate = (category, name, currentId = null) => {
    if (!name) return false;
    const cleanName = name.toLowerCase().trim();
    let targetData = [];

    if (category === "univ") targetData = univData;
    else if (category === "prodi") targetData = prodiData;
    else if (category === "wirausaha") targetData = wirausahaData;

    return targetData.some(item => 
      (item.nama || "").toLowerCase().trim() === cleanName && item.id !== currentId
    );
  };

  // --- FUNGSI CREATE, UPDATE, DELETE ---
  const handleCreate = async (category, data) => {
    try {

      const namaInput = data.nama_universitas || data.nama_prodi || data.nama_bidang || data.nama;
      if (isDuplicate(category, namaInput)) {
        return alertWarning(`Data "${namaInput}" sudah ada dalam daftar.`);
      }

      if (category === "univ") {
        await adminApi.createStatusKarierUniversitas({
          nama_universitas: data.nama_universitas || data.nama,
          alamat: data.alamat || '',
          id_kota: data.id_kota,
        });
        fetchUniversitas();
      } else if (category === "prodi") {
        await adminApi.createStatusKarierProdi({ nama_prodi: data.nama_prodi || data.nama }); 
        fetchProdi();
      } else if (category === "wirausaha") {
        await adminApi.createStatusKarierBidangUsaha({ nama_bidang: data.nama_bidang || data.nama }); 
        fetchWirausaha();
      }
      alertSuccess("Data berhasil ditambahkan!");
    } catch (err) { 
      alertError(err.response?.data?.message || "Gagal menambahkan data"); 
    }
  };

  const handleUpdate = async (category, id, data) => {
    try {

      const namaInput = data.nama_universitas || data.nama_prodi || data.nama_bidang || data.nama || Object.values(data)[0];
      if (isDuplicate(category, namaInput, id)) {
        return alertWarning(`Nama "${namaInput}" sudah digunakan oleh data lain.`);
      }
      
      if (category === "univ") {
        await adminApi.updateStatusKarierUniversitas(id, {
          nama_universitas: data.nama_universitas || data.nama || Object.values(data)[0],
          alamat: data.alamat || '',
          id_kota: data.id_kota,
        });
        fetchUniversitas();
      } else if (category === "prodi") {
        await adminApi.updateStatusKarierProdi(id, { nama_prodi: data.nama_prodi || data.nama || Object.values(data)[0] }); 
        fetchProdi();
      } else if (category === "wirausaha") {
        await adminApi.updateStatusKarierBidangUsaha(id, { nama_bidang: data.nama_bidang || data.nama || Object.values(data)[0] }); 
        fetchWirausaha();
      }
      alertSuccess("Data berhasil diubah!");
    } catch (err) { 
      alertError(err.response?.data?.message || "Gagal memperbarui data"); 
    }
  };

  const handleDelete = async (category, id) => {
    try {
      if (category === "univ") { 
        await adminApi.deleteStatusKarierUniversitas(id); 
        fetchUniversitas(); 
      } else if (category === "prodi") { 
        await adminApi.deleteStatusKarierProdi(id); 
        fetchProdi(); 
      } else if (category === "wirausaha") { 
        await adminApi.deleteStatusKarierBidangUsaha(id); 
        fetchWirausaha(); 
      }
      alertSuccess("Data berhasil dihapus!");
    } catch (err) { 
      alertError(err.response?.data?.message || "Gagal menghapus data"); 
    }
  };

  // --- FUNGSI EXPORT DATA ---
  const handleBuatLaporan = async () => {
    setExportingReport(true);
    try {
      let headers = [];
      let rows = [];
      let reportSlug = 'status_karier_universitas';
      let reportTitle = 'Laporan Status Karier - Data Universitas';

      if (selectedReport === "Data Program Studi") {
        reportSlug = 'status_karier_prodi';
        reportTitle = 'Laporan Status Karier - Data Program Studi';
        headers = ["No", "Nama Program Studi"];
        rows = prodiData.map((item, index) => [
          index + 1,
          item?.nama || "-",
        ]);
      } else if (selectedReport === "Bidang Wirausaha") {
        reportSlug = 'status_karier_wirausaha';
        reportTitle = 'Laporan Status Karier - Bidang Wirausaha';
        headers = ["No", "Nama Bidang Wirausaha"];
        rows = wirausahaData.map((item, index) => [
          index + 1,
          item?.nama || "-",
        ]);
      } else {
        headers = ["No", "Nama Universitas", "Program Studi", "Alamat", "Kota", "Provinsi"];
        rows = univData.map((item, index) => [
          index + 1,
          item?.nama || "-",
          (item?.jurusan && item.jurusan.length > 0) ? item.jurusan.join('; ') : "-",
          item?.alamat || "-",
          item?.kota || "-",
          item?.provinsi || "-",
        ]);
      }

      if (rows.length === 0) {
        return alertWarning("Data laporan kosong");
      }

      if (selectedFormat === "CSV") {
        downloadCsv({ headers, rows, prefix: reportSlug });
      } else {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        const doc = new jsPDF();
        doc.text(reportTitle, 14, 15);
        autoTable(doc, {
          head: [headers],
          body: rows,
          startY: 25,
          headStyles: { fillColor: [60, 87, 89] },
        });
        doc.save(createExportFileName(reportSlug, 'pdf'));
      }
      
      alertSuccess("Laporan berhasil diunduh!");
    } catch (err) { 
      alertError("Gagal mengunduh laporan"); 
    } finally { 
      setExportingReport(false); 
    }
  };

  // ------------------------------------------------------------------------
  // TAMPILKAN SKELETON JIKA DATA MASIH LOADING
  // ------------------------------------------------------------------------
  if (loading.univ || loading.prodi || loading.wirausaha) {
    return <TableLayoutSkeleton tableCount={3} />;
  }

  // ------------------------------------------------------------------------
  // RENDER UI UTAMA
  // ------------------------------------------------------------------------
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        
        {/* KOLOM KIRI: DAFTAR TABEL */}
        <div className="lg:col-span-8 space-y-6 order-last lg:order-first">
          
          <UniversitasTable
            data={univData}
            kotaList={kotaList}
            onCreate={(data) => handleCreate('univ', data)}
            onUpdate={(id, data) => handleUpdate('univ', id, data)}
            onDelete={(id) => handleDelete('univ', id)}
          />
          
          <ManagedTable
            title="Program Studi"
            icon={BookOpen}
            data={prodiData}
            placeholder="Contoh: Ilmu Komunikasi"
            onAddLabel="Tambah Prodi"
            nameKey="nama_prodi"
            onCreate={(data) => handleCreate('prodi', data)}
            onUpdate={(id, data) => handleUpdate('prodi', id, data)}
            onDelete={(id) => handleDelete('prodi', id)}
          />
          
          <ManagedTable
            title="Bidang Wirausaha"
            icon={Store}
            data={wirausahaData}
            placeholder="Contoh: Kuliner"
            onAddLabel="Tambah Bidang"
            nameKey="nama_bidang"
            onCreate={(data) => handleCreate('wirausaha', data)}
            onUpdate={(id, data) => handleUpdate('wirausaha', id, data)}
            onDelete={(id) => handleDelete('wirausaha', id)}
          />

        </div>

        {/* KOLOM KANAN: KOMPONEN BOX UNDUH DATA */}
        <BoxUnduhData
          title="Laporan Status"
          options={["Data Universitas", "Data Program Studi", "Bidang Wirausaha"]}
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