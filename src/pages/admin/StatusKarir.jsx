import React, { useState, useEffect, useCallback } from "react";
import { School, BookOpen, Store, Plus, Pencil, Trash2 } from "lucide-react";
import { alertSuccess, alertError, alertWarning } from "../../utilitis/alert";
import { adminApi } from "../../api/admin";
import { createExportFileName, downloadCsv } from "../../utilitis/export";

// --- IMPORT KOMPONEN REUSABLE ---
import ManagedTable from "../../components/admin/ManagedTable";
import BoxUnduhData from "../../components/admin/BoxUnduhData";
import TableLayoutSkeleton from "../../components/admin/skeleton/TableLayoutSkeleton";
import UniversitasEditorModal from "../../components/admin/UniversitasEditorModal";
import Pagination from "../../components/admin/Pagination";

const ITEMS_PER_PAGE = 7;

const validateUniversityName = (name = '') => {
  const cleaned = String(name).replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'Nama universitas wajib diisi.';

  const words = cleaned.split(' ').filter(Boolean);
  if (words.length < 2) return 'Nama universitas harus ditulis lengkap, bukan singkatan.';

  const connectors = ['dan', 'di', 'of', 'the', 'for', '&'];
  const meaningfulWords = words.filter((word) => !connectors.includes(word.toLowerCase()));

  if (meaningfulWords.length === 0) return 'Nama universitas harus ditulis lengkap, bukan singkatan.';

  const acronymLike = meaningfulWords.every((word) => /^[A-Z]{1,4}$/.test(word));
  const hasLongWord = meaningfulWords.some((word) => word.length >= 4);

  if (acronymLike || !hasLongWord) {
    return 'Nama universitas harus ditulis lengkap, bukan singkatan.';
  }

  return '';
};

function UniversitasTable({ data = [], kotaList = [], prodiOptions = [], onCreate, onUpdate, onDelete }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({ nama_universitas: '', alamat: '', id_kota: '', jurusan: [] });
  const [formErrors, setFormErrors] = useState({ nama_universitas: '', id_kota: '' });

  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  const paginatedData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const resetForm = () => {
    setFormData({ nama_universitas: '', alamat: '', id_kota: '', jurusan: [] });
    setFormErrors({ nama_universitas: '', id_kota: '' });
  };

  const validateForm = (payload) => {
    const errors = {
      nama_universitas: validateUniversityName(payload.nama_universitas),
      id_kota: payload.id_kota ? '' : 'Kota wajib dipilih.',
    };

    setFormErrors(errors);
    return !errors.nama_universitas && !errors.id_kota;
  };

  const normalizeJurusan = (list = []) => {
    if (!Array.isArray(list)) return [];
    return Array.from(
      new Set(
        list
          .map((item) => String(item || '').trim())
          .filter(Boolean)
      )
    );
  };

  const getKotaById = (idKota) => {
    if (!idKota) return null;
    return kotaList.find((k) => String(k.id) === String(idKota)) || null;
  };

  const resolveLocation = (item) => {
    const kotaDetail = getKotaById(item.id_kota || item.kota_id);
    const kotaName = item.kota && item.kota !== '-' ? item.kota : (kotaDetail?.nama || '-');
    const provinsiName = item.provinsi && item.provinsi !== '-'
      ? item.provinsi
      : (kotaDetail?.provinsi?.nama || kotaDetail?.nama_provinsi || '-');

    return { kotaName, provinsiName };
  };

  const selectedKota = getKotaById(formData.id_kota);
  const selectedProvinsiLabel = selectedKota?.provinsi?.nama || selectedKota?.nama_provinsi || '-';

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startEdit = (item) => {
    setIsAdding(false);
    setEditId(item.id);
    setFormData({
      nama_universitas: item.nama || '',
      alamat: item.alamat || '',
      id_kota: item.id_kota ? String(item.id_kota) : (item.kota_id ? String(item.kota_id) : ''),
      jurusan: normalizeJurusan(item.jurusan),
    });
    setFormErrors({ nama_universitas: '', id_kota: '' });
  };

  const handleCreate = async () => {
    const payload = {
      nama_universitas: formData.nama_universitas.trim(),
      alamat: formData.alamat.trim(),
      id_kota: formData.id_kota,
      jurusan: normalizeJurusan(formData.jurusan),
    };

    if (!validateForm(payload)) return;

    setSaving(true);
    try {
      const success = await onCreate(payload);
      if (!success) return;

      resetForm();
      setIsAdding(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    const payload = {
      nama_universitas: formData.nama_universitas.trim(),
      alamat: formData.alamat.trim(),
      id_kota: formData.id_kota,
      jurusan: normalizeJurusan(formData.jurusan),
    };

    if (!validateForm(payload)) return;

    setSaving(true);
    try {
      const success = await onUpdate(id, payload);
      if (!success) return;

      resetForm();
      setEditId(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 mb-6 shadow-sm overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-linear-to-r from-white to-gray-50">
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
              <th className="px-3 py-3 w-1/5">Nama</th>
              <th className="px-3 py-3 w-1/4">Program Studi</th>
              <th className="px-3 py-3 w-1/5">Alamat</th>
              <th className="px-3 py-3 w-1/6">Kota</th>
              <th className="px-3 py-3 w-1/6">Provinsi</th>
              <th className="px-3 py-3 text-right w-28">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-slate-400">Tidak ada data universitas.</td>
              </tr>
            ) : (
              paginatedData.map((item) => (
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
                  <td className="px-3 py-3 text-xs text-slate-600">{resolveLocation(item).kotaName}</td>
                  <td className="px-3 py-3 text-xs text-slate-600">{resolveLocation(item).provinsiName}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => startEdit(item)} className="p-1.5 text-gray-400 hover:text-[#3C5759] hover:bg-blue-100 rounded-lg"><Pencil size={14} /></button>
                      <button onClick={() => onDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={14} /></button>
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

      <UniversitasEditorModal
        isOpen={isAdding || editId !== null}
        mode={isAdding ? "add" : "edit"}
        formData={formData}
        errors={formErrors}
        kotaList={kotaList}
        prodiOptions={prodiOptions}
        selectedProvinsiLabel={selectedProvinsiLabel}
        saving={saving}
        onNameChange={(val) => {
          setFormData((prev) => ({ ...prev, nama_universitas: val }));
          setFormErrors((prev) => ({ ...prev, nama_universitas: validateUniversityName(val) }));
        }}
        onJurusanChange={(newVal) => setFormData((prev) => ({ ...prev, jurusan: newVal }))}
        onAlamatChange={(val) => setFormData((prev) => ({ ...prev, alamat: val }))}
        onKotaChange={(val) => {
          setFormData((prev) => ({ ...prev, id_kota: val }));
          setFormErrors((prev) => ({ ...prev, id_kota: '' }));
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
          const rawJurusanSource = u.jurusan_kuliah ?? u.jurusan ?? u.prodi;
          const rawJurusan = Array.isArray(rawJurusanSource)
            ? rawJurusanSource
            : rawJurusanSource
              ? [rawJurusanSource]
              : [];

          return { 
            id: u.id, 
            nama: u.nama || u.nama_universitas, 
            jurusan: rawJurusan
              .map((j) => {
                if (typeof j === 'string') return j;
                return j?.nama || j?.nama_jurusan || j?.nama_prodi;
              })
              .filter(Boolean),
            alamat: u.alamat || u.jalan || '-',
            id_kota: u.id_kota || u.kota?.id || u.kota_id || '',
            kota: u.kota?.nama || (typeof u.kota === 'string' ? u.kota : '') || u.nama_kota || '-',
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

  const resolveKotaProvinsi = (item) => {
    const kotaFromList = kotaList.find((k) => String(k.id) === String(item?.id_kota || item?.kota_id));
    const kota = item?.kota && item.kota !== '-' ? item.kota : (kotaFromList?.nama || '-');
    const provinsi = item?.provinsi && item.provinsi !== '-'
      ? item.provinsi
      : (kotaFromList?.provinsi?.nama || kotaFromList?.nama_provinsi || '-');

    return { kota, provinsi };
  };

  // --- FUNGSI CREATE, UPDATE, DELETE ---
  const handleCreate = async (category, data) => {
    try {

      const namaInput = data.nama_universitas || data.nama_prodi || data.nama_bidang || data.nama;

      if (isDuplicate(category, namaInput)) {
        alertWarning(`Data "${namaInput}" sudah ada dalam daftar.`);
        return false;
      }

      if (category === "univ") {
        const jurusanList = Array.isArray(data.jurusan)
          ? data.jurusan.map((item) => String(item || '').trim()).filter(Boolean)
          : [];

        const payload = {
          nama_universitas: data.nama_universitas || data.nama,
          alamat: data.alamat || '',
          id_kota: data.id_kota,
        };

        if (jurusanList.length > 0) {
          payload.jurusan_kuliah = jurusanList;
          payload.jurusan = jurusanList;
        }

        await adminApi.createStatusKarierUniversitas({
          ...payload,
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
      return true;
    } catch (err) { 
      alertError(err.response?.data?.message || "Gagal menambahkan data"); 
      return false;
    }
  };

  const handleUpdate = async (category, id, data) => {
    try {

      const namaInput = data.nama_universitas || data.nama_prodi || data.nama_bidang || data.nama || Object.values(data)[0];

      if (isDuplicate(category, namaInput, id)) {
        alertWarning(`Nama "${namaInput}" sudah digunakan oleh data lain.`);
        return false;
      }
      
      if (category === "univ") {
        const jurusanList = Array.isArray(data.jurusan)
          ? data.jurusan.map((item) => String(item || '').trim()).filter(Boolean)
          : [];

        const payload = {
          nama_universitas: data.nama_universitas || data.nama || Object.values(data)[0],
          alamat: data.alamat || '',
          id_kota: data.id_kota,
          jurusan_kuliah: jurusanList,
          jurusan: jurusanList,
        };

        await adminApi.updateStatusKarierUniversitas(id, {
          ...payload,
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
      return true;
    } catch (err) { 
      alertError(err.response?.data?.message || "Gagal memperbarui data"); 
      return false;
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
          resolveKotaProvinsi(item).kota,
          resolveKotaProvinsi(item).provinsi,
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
            prodiOptions={prodiData.map((item) => ({ nama: item.nama }))}
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
            useTextEditActions={true}
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
            useTextEditActions={true}
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