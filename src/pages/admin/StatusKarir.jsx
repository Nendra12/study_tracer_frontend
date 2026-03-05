import React, { useState, useEffect, useCallback } from "react";
import { School, BookOpen, Store } from "lucide-react";
import { alertSuccess, alertError, alertWarning } from "../../utilitis/alert";
import { adminApi } from "../../api/admin";

// --- IMPORT KOMPONEN REUSABLE ---
import ManagedTable from "../../components/admin/ManagedTable";
import BoxUnduhData from "../../components/admin/BoxUnduhData";
import TableLayoutSkeleton from "../../components/admin/skeleton/TableLayoutSkeleton";

export default function StatusKarir() {
  // --- STATE UNTUK EKSPOR ---
  const [selectedFormat, setSelectedFormat] = useState("CSV");
  const [selectedReport, setSelectedReport] = useState("Data Universitas");
  const [exportingReport, setExportingReport] = useState(false);

  // --- STATE UNTUK DATA TABEL ---
  const [univData, setUnivData] = useState([]);
  const [prodiData, setProdiData] = useState([]);
  const [wirausahaData, setWirausahaData] = useState([]);
  
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
            : u.jurusan_kuliah ? [u.jurusan_kuliah] : [];
          return { 
            id: u.id, 
            nama: u.nama || u.nama_universitas, 
            jurusan: rawJurusan.map(j => j.nama || j.nama_jurusan), 
            _jurusanRaw: rawJurusan 
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
        const res = await adminApi.createStatusKarierUniversitas({ nama: data.nama_universitas || data.nama });
        const newUnivId = res.data?.data?.id;
        // Jika ada jurusan yang dipilih saat buat universitas baru
        if (newUnivId && data.jurusan && data.jurusan.length > 0) {
          await Promise.all(data.jurusan.map(j => adminApi.createStatusKarierProdi({ nama_prodi: j, id_universitas: newUnivId })));
        }
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
        const nama = data.nama_universitas || data.nama || Object.values(data)[0];
        await adminApi.updateStatusKarierUniversitas(id, { nama });
        
        // Sinkronisasi Multi-select Jurusan
        const currentUniv = univData.find(u => u.id === id);
        const currentJurusan = currentUniv?.jurusan || [];
        const rawJurusan = currentUniv?._jurusanRaw || [];
        const newJurusan = data.jurusan || [];
        
        const toAdd = newJurusan.filter(j => !currentJurusan.includes(j));
        const toRemove = currentJurusan.filter(j => !newJurusan.includes(j));
        
        const syncPromises = [];
        toAdd.forEach(j => syncPromises.push(adminApi.createStatusKarierProdi({ nama_prodi: j, id_universitas: id })));
        toRemove.forEach(j => {
          const rawJ = rawJurusan.find(rj => (rj.nama || rj.nama_jurusan) === j);
          if (rawJ) syncPromises.push(adminApi.deleteStatusKarierProdi(rawJ.id));
        });
        if (syncPromises.length > 0) await Promise.all(syncPromises);
        
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
      const typeMap = { "Data Universitas": "universitas", "Data Program Studi": "prodi", "Bidang Wirausaha": "wirausaha" };
      const type = typeMap[selectedReport] || "universitas";
      const format = selectedFormat.toLowerCase();
      
      const res = await adminApi.exportStatusKarierReport({ type, format });
      const blob = new Blob([res.data], { type: format === "pdf" ? "application/pdf" : "text/csv" });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url; 
      link.download = `status_karier_${type}.${format}`;
      document.body.appendChild(link); 
      link.click(); 
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
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
          
          <ManagedTable
            title="Data Universitas & Jurusan"
            icon={School}
            data={univData}
            placeholder="Nama Universitas"
            onAddLabel="Tambah Kampus"
            nameKey="nama_universitas"
            withJurusan={true}
            dropdownOptions={prodiData}
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