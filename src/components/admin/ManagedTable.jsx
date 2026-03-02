import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Search,
  Loader2,
  X,
  Check
} from "lucide-react";
import { alertConfirm } from "../../utilitis/alert"; 
import MultiSelectDropdown from "./MultiSelectDropdown";
import Pagination from "./Pagination";

const ITEMS_PER_PAGE = 7;

const ManagedTable = ({
  title,
  icon: Icon,
  data = [],
  loading = false,
  placeholder,
  onAddLabel,
  nameKey = "nama",
  onCreate,
  onUpdate,
  onDelete,
  readOnly = false,
  withJurusan = false,
  dropdownOptions = []
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ nama: "", jurusan: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = (data || []).filter((item) =>
    (item.nama || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const resetForm = () => setFormData({ nama: "", jurusan: [] });

  const handleCreate = async () => {
    if (!formData.nama.trim()) return;
    setSaving(true);
    try {
      await onCreate({ [nameKey]: formData.nama.trim(), jurusan: withJurusan ? formData.jurusan : [] });
      resetForm(); setIsAdding(false);
    } catch (err) { console.error(err); } 
    finally { setSaving(false); }
  };

  const handleUpdate = async (id) => {
    if (!formData.nama.trim()) return;
    setSaving(true);
    try {
      await onUpdate(id, { [nameKey]: formData.nama.trim(), jurusan: withJurusan ? formData.jurusan : [] });
      setEditId(null); resetForm();
    } catch (err) { console.error(err); } 
    finally { setSaving(false); }
  };

  const startEdit = (item) => {
    setEditId(item.id); setIsAdding(false);
    setFormData({ nama: item.nama, jurusan: Array.isArray(item.jurusan) ? item.jurusan : [] });
  };

  const handleDelete = async (id, name) => {
    const { isConfirmed } = await alertConfirm(`Hapus "${name}"?`);
    if (isConfirmed) onDelete(id);
  };

  const tableContainerClass = (isAdding || editId)
    ? "p-4 overflow-x-auto min-h-[250px] transition-all duration-300"
    : "p-4 overflow-x-auto transition-all duration-300";

  return (
    <div className="bg-white rounded-lg border border-gray-100 mb-6 shadow-sm relative">
      <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="p-1.5 bg-blue-100 rounded-lg text-primary flex-shrink-0">
            {Icon && <Icon size={16} />}
          </div>
          <h3 className="font-bold text-primary text-md truncate">{title}</h3>
          {!loading && <span className="text-xs text-slate-400 font-medium">({filteredData.length})</span>}
        </div>
        {!readOnly && (
          <button
            onClick={() => { setIsAdding(true); setEditId(null); resetForm(); }}
            disabled={loading}
            className="text-fourth bg-primary flex items-center gap-1 text-xs font-bold hover:text-white hover:bg-secondary px-2.5 py-2 rounded-lg transition-all group cursor-pointer disabled:opacity-50"
          >
            <Plus size={12} className="group-hover:scale-125 transition-transform" />
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
            placeholder={`Cari ${title?.toLowerCase() || 'data'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 disabled:bg-gray-100"
          />
        </div>
      </div>

      <div className={tableContainerClass}>
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-200 bg-slate-50">
              <th className={`px-3 py-3 ${withJurusan ? "w-1/3" : ""}`}>Nama</th>
              {withJurusan && <th className="px-3 py-3">Jurusan Tersedia</th>}
              {!readOnly && <th className="px-3 py-3 text-right w-24">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isAdding && !readOnly && (
              <tr className="bg-blue-50/50 animate-in fade-in duration-300 align-top">
                <td className="py-3 px-3">
                  <input type="text" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder={placeholder} className="w-full px-2 py-2 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none" autoFocus onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
                </td>
                {withJurusan && (
                  <td className="py-3 px-3">
                    <MultiSelectDropdown options={dropdownOptions} selected={formData.jurusan} onChange={(newVal) => setFormData({ ...formData, jurusan: newVal })} placeholder="Pilih Jurusan..." />
                  </td>
                )}
                <td className="py-3 px-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setIsAdding(false); resetForm(); }} className="cursor-pointer px-2 py-1 text-[11px] font-bold text-gray-500 hover:bg-gray-200 rounded transition-colors">Batal</button>
                    <button onClick={handleCreate} disabled={saving || !formData.nama.trim()} className="cursor-pointer px-2 py-1 text-[11px] font-bold bg-primary text-white rounded shadow-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
                      {saving && <Loader2 size={10} className="animate-spin" />} Simpan
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skel-${idx}`} className="animate-pulse bg-white">
                  <td className="py-4 px-3"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                  {withJurusan && <td className="py-4 px-3"><div className="flex gap-2"><div className="h-4 bg-gray-200 rounded w-16"></div><div className="h-4 bg-gray-200 rounded w-24"></div></div></td>}
                  {!readOnly && <td className="py-4 px-3"><div className="flex justify-end gap-2"><div className="h-7 w-7 bg-gray-200 rounded-lg"></div><div className="h-7 w-7 bg-gray-200 rounded-lg"></div></div></td>}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan={withJurusan ? 3 : 2} className="py-6 text-center text-xs text-slate-400">Tidak ada data ditemukan.</td></tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors align-top">
                  <td className="py-3 px-3">
                    {editId === item.id ? (
                      <input type="text" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleUpdate(item.id)} className="w-full px-2 py-2 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none" autoFocus />
                    ) : (
                      <span className="font-medium text-gray-700 text-sm group-hover:text-primary transition-colors">{item.nama}</span>
                    )}
                  </td>
                  {withJurusan && (
                    <td className="py-3 px-3">
                      {editId === item.id ? (
                        <MultiSelectDropdown options={dropdownOptions} selected={formData.jurusan} onChange={(newVal) => setFormData({ ...formData, jurusan: newVal })} placeholder="Pilih Jurusan..." />
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {item.jurusan && item.jurusan.length > 0 ? item.jurusan.map((j, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">{j}</span>
                          )) : <span className="text-xs text-gray-400 italic">- Tidak ada jurusan -</span>}
                        </div>
                      )}
                    </td>
                  )}
                  {!readOnly && (
                    <td className="py-3 px-3">
                      {editId === item.id ? (
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleUpdate(item.id)} disabled={saving} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"><Check size={16} /></button>
                          <button onClick={() => { setEditId(null); resetForm(); }} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={16} /></button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1 transition-opacity">
                          <button onClick={() => startEdit(item)} className="cursor-pointer p-1.5 text-gray-400 hover:text-[#3C5759] hover:bg-blue-100 rounded-lg active:scale-90"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(item.id, item.nama)} className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-lg active:scale-90"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MENGGUNAKAN KOMPONEN PAGINATION */}
      {!loading && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />}
    </div>
  );
};

export default ManagedTable;