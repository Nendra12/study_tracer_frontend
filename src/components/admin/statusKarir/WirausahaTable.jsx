import React, { useEffect, useState } from "react";
import { Store } from "lucide-react";
import Pagination from "../Pagination";

const ITEMS_PER_PAGE = 7;

export default function WirausahaTable({
  data = [],
  kotaList = [],
  bidangUsahaIdToLabel = {},
  // Props lain seperti onCreate, onUpdate, dll tidak dipakai lagi di UI ini, 
  // tapi dibiarkan agar tidak error jika Parent masih mengirimkannya.
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  const paginatedData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getKotaById = (idKota) => {
    if (!idKota) return null;
    return kotaList.find((k) => String(k.id) === String(idKota)) || null;
  };

  const resolveLocation = (item) => {
    const kotaDetail = getKotaById(item.id_kota || item.kota_id);
    const kotaName = item.kota && item.kota !== "-" ? item.kota : (kotaDetail?.nama || "-");
    const provinsiName = item.provinsi && item.provinsi !== "-"
      ? item.provinsi
      : (kotaDetail?.provinsi?.nama || kotaDetail?.nama_provinsi || "-");

    return { kotaName, provinsiName };
  };

  // Memastikan halaman kembali ke halaman terakhir yang valid jika data berkurang
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="bg-white rounded-lg border border-gray-100 mb-6 shadow-sm overflow-hidden">
      
      {/* HEADER TABEL */}
      <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-linear-to-r from-white to-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-100 rounded-lg text-primary">
            <Store size={16} />
          </div>
          <h3 className="font-bold text-primary text-md">Data Wirausaha</h3>
          <span className="text-xs text-slate-400 font-medium">({data.length})</span>
        </div>
        {/* Tombol "Tambah Wirausaha" sudah dihapus */}
      </div>

      {/* ISI TABEL */}
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-3 w-1/5">Nama</th>
              <th className="px-3 py-3 w-1/5">Bidang</th>
              <th className="px-3 py-3 w-1/4">Alamat</th>
              <th className="px-3 py-3 w-1/6">Kota</th>
              <th className="px-3 py-3 w-1/6">Provinsi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                  Tidak ada data wirausaha.
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="px-3 py-3 text-sm font-medium text-gray-700">
                    {item.nama_usaha || item.nama || "-"}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600">
                    {item.bidangLabel || bidangUsahaIdToLabel[String(item.id_bidang)] || item.bidang || "-"}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600">
                    {item.alamat || "-"}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600">
                    {resolveLocation(item).kotaName}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600">
                    {resolveLocation(item).provinsiName}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINASI */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

    </div>
  );
}