import React, { useEffect, useState } from "react";
import { Store, Plus, Pencil } from "lucide-react";

import WirausahaEditorModal from "../WirausahaEditorModal";
import Pagination from "../Pagination";

const ITEMS_PER_PAGE = 7;

const validateRequiredText = (value = "", label = "Field") => {
  if (!String(value).trim()) return `${label} wajib diisi.`;
  return "";
};

export default function WirausahaTable({
  data = [],
  kotaList = [],
  bidangUsahaList = [],
  bidangUsahaMap = {},
  bidangUsahaIdToLabel = {},
  onCreate,
  onUpdate,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({ nama_usaha: "", id_bidang: "", alamat: "", id_kota: "" });
  const [formErrors, setFormErrors] = useState({ nama_usaha: "", id_bidang: "", id_kota: "" });

  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  const paginatedData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const resetForm = () => {
    setFormData({ nama_usaha: "", id_bidang: "", alamat: "", id_kota: "" });
    setFormErrors({ nama_usaha: "", id_bidang: "", id_kota: "" });
  };

  const validateForm = (payload) => {
    const errors = {
      nama_usaha: validateRequiredText(payload.nama_usaha, "Nama Usaha"),
      id_bidang: validateRequiredText(payload.id_bidang, "Bidang Usaha"),
      id_kota: payload.id_kota ? "" : "Kota wajib dipilih.",
    };

    setFormErrors(errors);
    return !errors.nama_usaha && !errors.id_bidang && !errors.id_kota;
  };

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

  const selectedKota = getKotaById(formData.id_kota);
  const selectedProvinsiLabel = selectedKota?.provinsi?.nama || selectedKota?.nama_provinsi || "-";

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startEdit = (item) => {
    setIsAdding(false);
    setEditId(item.id);
    setFormData({
      nama_usaha: item.nama_usaha || item.nama || "",
      id_bidang: item.id_bidang ? String(item.id_bidang) : "",
      alamat: item.alamat || "",
      id_kota: item.id_kota ? String(item.id_kota) : (item.kota_id ? String(item.kota_id) : ""),
    });
    setFormErrors({ nama_usaha: "", id_bidang: "", id_kota: "" });
  };

  const handleCreate = async () => {
    const payload = {
      nama_usaha: formData.nama_usaha.trim(),
      id_bidang: formData.id_bidang,
      alamat: formData.alamat.trim(),
      id_kota: formData.id_kota,
    };

    if (!validateForm(payload)) return;

    setSaving(true);
    try {
      const success = await onCreate?.(payload);
      if (!success) return;

      resetForm();
      setIsAdding(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    const payload = {
      nama_usaha: formData.nama_usaha.trim(),
      id_bidang: formData.id_bidang,
      alamat: formData.alamat.trim(),
      id_kota: formData.id_kota,
    };

    if (!validateForm(payload)) return;

    setSaving(true);
    try {
      const success = await onUpdate?.(id, payload);
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
          <div className="p-1.5 bg-blue-100 rounded-lg text-primary"><Store size={16} /></div>
          <h3 className="font-bold text-primary text-md">Data Wirausaha</h3>
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
          <Plus size={12} /> Tambah Wirausaha
        </button>
      </div>

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
                <td colSpan={6} className="py-6 text-center text-xs text-slate-400">Tidak ada data wirausaha.</td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="px-3 py-3 text-sm font-medium text-gray-700">{item.nama_usaha || item.nama || "-"}</td>
                  <td className="px-3 py-3 text-xs text-slate-600">
                    {item.bidangLabel || bidangUsahaIdToLabel[String(item.id_bidang)] || item.bidang || "-"}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600">{item.alamat || "-"}</td>
                  <td className="px-3 py-3 text-xs text-slate-600">{resolveLocation(item).kotaName}</td>
                  <td className="px-3 py-3 text-xs text-slate-600">{resolveLocation(item).provinsiName}</td>
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

      <WirausahaEditorModal
        isOpen={isAdding || editId !== null}
        mode={isAdding ? "add" : "edit"}
        formData={formData}
        errors={formErrors}
        kotaList={kotaList}
        bidangUsahaList={bidangUsahaList}
        bidangUsahaMap={bidangUsahaMap}
        selectedProvinsiLabel={selectedProvinsiLabel}
        saving={saving}
        onNamaUsahaChange={(val) => {
          setFormData((prev) => ({ ...prev, nama_usaha: val }));
          setFormErrors((prev) => ({ ...prev, nama_usaha: validateRequiredText(val, "Nama Usaha") }));
        }}
        onBidangUsahaChange={(val) => {
          setFormData((prev) => ({ ...prev, id_bidang: val }));
          setFormErrors((prev) => ({ ...prev, id_bidang: validateRequiredText(val, "Bidang Usaha") }));
        }}
        onAlamatChange={(val) => setFormData((prev) => ({ ...prev, alamat: val }))}
        onKotaChange={(val) => {
          setFormData((prev) => ({ ...prev, id_kota: val }));
          setFormErrors((prev) => ({ ...prev, id_kota: "" }));
        }}
        onCancel={() => {
          setIsAdding(false);
          setEditId(null);
          resetForm();
        }}
        onSave={() => {
          if (isAdding) return handleCreate();
          if (editId !== null) return handleUpdate(editId);
          return null;
        }}
      />
    </div>
  );
}
