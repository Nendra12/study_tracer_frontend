import React, { useState, useEffect } from "react";
import {
  Building2,
  GraduationCap,
  Plus,
  Trash2,
  Pencil,
  Search,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { alertSuccess, alertError, alertConfirm, alertWarning } from "../../utilitis/alert"; 
import BoxUnduhData from "../../components/admin/BoxUnduhData";
import Pagination from "../../components/admin/Pagination";

const DATA_PER_PAGE = 7;

// ============================================================================
// DATA DUMMY
// ============================================================================
const DUMMY_KOTA = [
  { id: 1, nama: "Jakarta" },
  { id: 2, nama: "Surabaya" },
  { id: 3, nama: "Malang" },
  { id: 4, nama: "Bandung" },
  { id: 5, nama: "Yogyakarta" }
];

const DUMMY_UNIVERSITAS = [
  { id: 1, nama: "Universitas Brawijaya", jalan: "Jl. Veteran Malang", image: null },
  { id: 2, nama: "Universitas Indonesia", jalan: "Kampus UI Depok", image: null },
  { id: 3, nama: "Institut Teknologi Bandung", jalan: "Jl. Ganesha No. 10, Bandung", image: null },
  { id: 4, nama: "Universitas Gadjah Mada", jalan: "Bulaksumur, Yogyakarta", image: null },
];

const DUMMY_PERUSAHAAN = [
  { id: 1, nama: "PT Telkom Indonesia", jalan: "Jl. Japati No. 1, Bandung", image: null },
  { id: 2, nama: "PT GoTo Gojek Tokopedia", jalan: "Gedung Pasaraya Blok M, Jakarta", image: null },
  { id: 3, nama: "CV Maju Mundur", jalan: "Jl. Pahlawan No. 12, Surabaya", image: null },
];


// ============================================================================
// 1. TABEL MITRA UNIVERSITAS / KAMPUS
// ============================================================================
const UniversitasTable = ({ data = [], onCreate, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ nama: "", jalan: "", imagePreview: null, imageFile: null });
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const resetForm = () => setFormData({ nama: "", jalan: "", imagePreview: null, imageFile: null });

  const isDuplicate = (name, currentId = null) => {
    return data.some(item => 
      item.nama?.toLowerCase().trim() === name.toLowerCase().trim() && item.id !== currentId
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alertWarning("Ukuran gambar maksimal 2MB");
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, imageFile: file, imagePreview: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    const trimmedName = formData.nama.trim();
    if (!trimmedName) return;
    if (isDuplicate(trimmedName)) return alertWarning(`Universitas "${trimmedName}" sudah ada dalam daftar.`);

    setSaving(true);
    setTimeout(() => {
      onCreate({ nama: trimmedName, jalan: formData.jalan, image: formData.imagePreview });
      alertSuccess("Universitas berhasil ditambahkan");
      resetForm();
      setIsAdding(false);
      setSaving(false);
    }, 500);
  };

  const handleUpdate = async (id) => {
    const trimmedName = formData.nama.trim();
    if (!trimmedName) return;
    if (isDuplicate(trimmedName, id)) return alertWarning(`Nama universitas "${trimmedName}" sudah digunakan.`);

    setSaving(true);
    setTimeout(() => {
      onUpdate(id, { nama: trimmedName, jalan: formData.jalan, image: formData.imagePreview });
      alertSuccess("Universitas berhasil diperbarui");
      setEditId(null);
      resetForm();
      setSaving(false);
    }, 500);
  };

  const handleDelete = async (id, name) => {
    const { isConfirmed } = await alertConfirm(`Apakah Anda yakin ingin menghapus universitas "${name}"?`);
    if (!isConfirmed) return;
    onDelete(id);
    alertSuccess("Universitas berhasil dihapus");
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setIsAdding(false);
    setFormData({
      nama: item.nama || "",
      jalan: item.jalan || "",
      imagePreview: item.image || null,
      imageFile: null
    });
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const filteredData = (data || []).filter((item) =>
    (item.nama || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / DATA_PER_PAGE));
  const paginatedData = filteredData.slice((currentPage - 1) * DATA_PER_PAGE, currentPage * DATA_PER_PAGE);

  return (
    <div className="bg-white rounded-lg border border-gray-100 mb-6 overflow-hidden shadow-sm">
      <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="p-1.5 bg-blue-100 rounded-lg text-primary"><GraduationCap size={16} /></div>
          <h3 className="font-bold text-primary text-md truncate">Mitra Kampus / Universitas</h3>
          <span className="text-xs text-slate-400 font-medium">({filteredData.length})</span>
        </div>
        <button onClick={() => { setIsAdding(true); setEditId(null); resetForm(); }} className="text-fourth bg-primary flex items-center gap-1 text-xs font-bold hover:text-white hover:opacity-90 px-2.5 py-2 rounded-lg transition-all cursor-pointer group">
          <Plus size={12} className="group-hover:scale-125 transition-transform" /> <span className="hidden sm:inline">Tambah Universitas</span>
        </button>
      </div>

      <div className="px-4 pt-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input type="text" placeholder="Cari kampus atau universitas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50" />
        </div>
      </div>

      <div className="p-4 overflow-x-auto min-h-[15.5rem]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-3 w-20 text-center">Logo</th>
              <th className="px-3 py-3 w-1/3">Nama Kampus</th>
              <th className="px-3 py-3 w-1/3">Alamat Lengkap</th>
              <th className="px-3 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isAdding && (
              <tr className="bg-blue-50/50 animate-in fade-in duration-300 align-top">
                <td className="py-2 px-3 text-center">
                  <label className="cursor-pointer flex flex-col items-center justify-center w-14 h-14 mx-auto rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-50 hover:border-primary transition-all group relative overflow-hidden bg-white shadow-sm" title="Upload Logo">
                    {formData.imagePreview ? (
                      <>
                        <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-contain p-1" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[8px] text-white font-bold uppercase">Ganti</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={16} className="text-gray-400 group-hover:text-primary mb-1 transition-colors" />
                        <span className="text-[7px] font-bold text-gray-400 group-hover:text-primary uppercase tracking-wider transition-colors">Upload</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </td>
                <td className="py-2 px-3">
                  <input type="text" value={formData.nama} onChange={(e) => setFormData(p => ({ ...p, nama: e.target.value }))} placeholder="Nama Universitas" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none" autoFocus />
                </td>
                <td className="py-2 px-3">
                  <input type="text" value={formData.jalan} onChange={(e) => setFormData(p => ({ ...p, jalan: e.target.value }))} placeholder="Alamat lengkap (termasuk kota)" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none" />
                </td>
                <td className="py-2 px-3">
                  <div className="flex justify-end gap-2 mt-1">
                    <button onClick={() => { setIsAdding(false); resetForm(); }} className="cursor-pointer px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
                    <button onClick={handleCreate} disabled={saving || !formData.nama.trim()} className="cursor-pointer px-4 py-2 text-xs font-bold bg-primary text-white rounded-lg shadow-sm flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50">
                      {saving ? <Loader2 size={12} className="animate-spin" /> : null} Simpan
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {paginatedData.length === 0 && !isAdding ? (
              <tr><td colSpan={4} className="py-8 text-center text-xs text-slate-400">Tidak ada data ditemukan.</td></tr>
            ) : (
              paginatedData.map((item) =>
                editId === item.id ? (
                  <tr key={item.id} className="bg-blue-50/50 animate-in fade-in duration-300 align-top">
                    <td className="py-2 px-3 text-center">
                      <label className="cursor-pointer flex flex-col items-center justify-center w-14 h-14 mx-auto rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-50 hover:border-primary transition-all group relative overflow-hidden bg-white shadow-sm" title="Ganti Logo">
                        {formData.imagePreview ? (
                          <>
                            <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-contain p-1" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[8px] text-white font-bold uppercase">Ganti</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={16} className="text-gray-400 group-hover:text-primary mb-1 transition-colors" />
                            <span className="text-[7px] font-bold text-gray-400 group-hover:text-primary uppercase tracking-wider transition-colors">Upload</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    </td>
                    <td className="py-2 px-3">
                      <input type="text" value={formData.nama} onChange={(e) => setFormData(p => ({ ...p, nama: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none" autoFocus />
                    </td>
                    <td className="py-2 px-3">
                      <input type="text" value={formData.jalan} onChange={(e) => setFormData(p => ({ ...p, jalan: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex justify-end gap-2 mt-1">
                        <button onClick={() => { setEditId(null); resetForm(); }} className="cursor-pointer px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
                        <button onClick={() => handleUpdate(item.id)} disabled={saving || !formData.nama.trim()} className="cursor-pointer px-4 py-2 text-xs font-bold bg-primary text-white rounded-lg shadow-sm flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50">
                          {saving ? <Loader2 size={12} className="animate-spin" /> : null} Simpan
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors align-middle">
                    <td className="py-3 px-3 text-center">
                      <div className="w-12 h-12 mx-auto rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.nama} className="w-full h-full object-contain p-1" />
                        ) : (
                          <GraduationCap size={20} className="text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-700 text-sm group-hover:text-primary transition-colors">{item.nama}</td>
                    <td className="py-3 px-3 text-xs text-gray-500 max-w-[12.5rem] truncate">{item.jalan || '-'}</td>
                    <td className="py-3 px-3">
                      <div className="flex justify-end gap-1 transition-opacity">
                        <button onClick={() => startEdit(item)} className="cursor-pointer p-1.5 text-gray-400 hover:text-primary hover:bg-blue-100 rounded-lg active:scale-90" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(item.id, item.nama)} className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-lg active:scale-90" title="Hapus"><Trash2 size={14} /></button>
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

// ============================================================================
// 2. TABEL MITRA PERUSAHAAN
// ============================================================================
const PerusahaanTable = ({ data = [], onCreate, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ nama: "", jalan: "", imagePreview: null, imageFile: null });
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const resetForm = () => setFormData({ nama: "", jalan: "", imagePreview: null, imageFile: null });

  const isDuplicate = (name, currentId = null) => {
    return data.some(item => 
      item.nama?.toLowerCase().trim() === name.toLowerCase().trim() && item.id !== currentId
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alertWarning("Ukuran gambar maksimal 2MB");
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, imageFile: file, imagePreview: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    const trimmedName = formData.nama.trim();
    if (!trimmedName) return;
    if (isDuplicate(trimmedName)) return alertWarning(`Perusahaan "${trimmedName}" sudah ada dalam daftar.`);

    setSaving(true);
    setTimeout(() => {
      onCreate({ nama: trimmedName, jalan: formData.jalan, image: formData.imagePreview });
      alertSuccess("Perusahaan berhasil ditambahkan");
      resetForm();
      setIsAdding(false);
      setSaving(false);
    }, 500);
  };

  const handleUpdate = async (id) => {
    const trimmedName = formData.nama.trim();
    if (!trimmedName) return;
    if (isDuplicate(trimmedName, id)) return alertWarning(`Nama perusahaan "${trimmedName}" sudah digunakan oleh data lain.`);

    setSaving(true);
    setTimeout(() => {
      onUpdate(id, { nama: trimmedName, jalan: formData.jalan, image: formData.imagePreview });
      alertSuccess("Perusahaan berhasil diperbarui");
      setEditId(null);
      resetForm();
      setSaving(false);
    }, 500);
  };

  const handleDelete = async (id, name) => {
    const { isConfirmed } = await alertConfirm(`Apakah Anda yakin ingin menghapus perusahaan "${name}"?`);
    if (!isConfirmed) return;
    onDelete(id);
    alertSuccess("Perusahaan berhasil dihapus");
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setIsAdding(false);
    setFormData({
      nama: item.nama || "",
      jalan: item.jalan || "",
      imagePreview: item.image || null,
      imageFile: null
    });
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const filteredData = (data || []).filter((item) =>
    (item.nama || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / DATA_PER_PAGE));
  const paginatedData = filteredData.slice((currentPage - 1) * DATA_PER_PAGE, currentPage * DATA_PER_PAGE);

  return (
    <div className="bg-white rounded-lg border border-gray-100 mb-6 overflow-hidden shadow-sm">
      <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="p-1.5 bg-blue-100 rounded-lg text-primary"><Building2 size={16} /></div>
          <h3 className="font-bold text-primary text-md truncate">Mitra Perusahaan</h3>
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
          <input type="text" placeholder="Cari perusahaan mitra..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50" />
        </div>
      </div>

      <div className="p-4 overflow-x-auto min-h-[15.5rem]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-3 w-20 text-center">Logo</th>
              <th className="px-3 py-3 w-1/3">Nama Perusahaan</th>
              <th className="px-3 py-3 w-1/3">Alamat Lengkap</th>
              <th className="px-3 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isAdding && (
              <tr className="bg-blue-50/50 animate-in fade-in duration-300 align-top">
                <td className="py-2 px-3 text-center">
                  <label className="cursor-pointer flex flex-col items-center justify-center w-14 h-14 mx-auto rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-50 hover:border-primary transition-all group relative overflow-hidden bg-white shadow-sm" title="Upload Logo">
                    {formData.imagePreview ? (
                      <>
                        <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-contain p-1" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[8px] text-white font-bold uppercase">Ganti</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={16} className="text-gray-400 group-hover:text-primary mb-1 transition-colors" />
                        <span className="text-[7px] font-bold text-gray-400 group-hover:text-primary uppercase tracking-wider transition-colors">Upload</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </td>
                <td className="py-2 px-3">
                  <input type="text" value={formData.nama} onChange={(e) => setFormData(p => ({ ...p, nama: e.target.value }))} placeholder="Nama Perusahaan" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none" autoFocus />
                </td>
                <td className="py-2 px-3">
                  <input type="text" value={formData.jalan} onChange={(e) => setFormData(p => ({ ...p, jalan: e.target.value }))} placeholder="Alamat lengkap (termasuk kota)" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none" />
                </td>
                <td className="py-2 px-3">
                  <div className="flex justify-end gap-2 mt-1">
                    <button onClick={() => { setIsAdding(false); resetForm(); }} className="cursor-pointer px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
                    <button onClick={handleCreate} disabled={saving || !formData.nama.trim()} className="cursor-pointer px-4 py-2 text-xs font-bold bg-primary text-white rounded-lg shadow-sm flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50">
                      {saving ? <Loader2 size={12} className="animate-spin" /> : null} Simpan
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {paginatedData.length === 0 && !isAdding ? (
              <tr><td colSpan={4} className="py-8 text-center text-xs text-slate-400">Tidak ada data ditemukan.</td></tr>
            ) : (
              paginatedData.map((item) =>
                editId === item.id ? (
                  <tr key={item.id} className="bg-blue-50/50 animate-in fade-in duration-300 align-top">
                    <td className="py-2 px-3 text-center">
                      <label className="cursor-pointer flex flex-col items-center justify-center w-14 h-14 mx-auto rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-50 hover:border-primary transition-all group relative overflow-hidden bg-white shadow-sm" title="Ganti Logo">
                        {formData.imagePreview ? (
                          <>
                            <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-contain p-1" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[8px] text-white font-bold uppercase">Ganti</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={16} className="text-gray-400 group-hover:text-primary mb-1 transition-colors" />
                            <span className="text-[7px] font-bold text-gray-400 group-hover:text-primary uppercase tracking-wider transition-colors">Upload</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    </td>
                    <td className="py-2 px-3">
                      <input type="text" value={formData.nama} onChange={(e) => setFormData(p => ({ ...p, nama: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none" autoFocus />
                    </td>
                    <td className="py-2 px-3">
                      <input type="text" value={formData.jalan} onChange={(e) => setFormData(p => ({ ...p, jalan: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex justify-end gap-2 mt-1">
                        <button onClick={() => { setEditId(null); resetForm(); }} className="cursor-pointer px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
                        <button onClick={() => handleUpdate(item.id)} disabled={saving || !formData.nama.trim()} className="cursor-pointer px-4 py-2 text-xs font-bold bg-primary text-white rounded-lg shadow-sm flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50">
                          {saving ? <Loader2 size={12} className="animate-spin" /> : null} Simpan
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors align-middle">
                    <td className="py-3 px-3 text-center">
                      <div className="w-12 h-12 mx-auto rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.nama} className="w-full h-full object-contain p-1" />
                        ) : (
                          <Building2 size={20} className="text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-700 text-sm group-hover:text-primary transition-colors">{item.nama}</td>
                    <td className="py-3 px-3 text-xs text-gray-500 max-w-[12.5rem] truncate">{item.jalan || '-'}</td>
                    <td className="py-3 px-3">
                      <div className="flex justify-end gap-1 transition-opacity">
                        <button onClick={() => startEdit(item)} className="cursor-pointer p-1.5 text-gray-400 hover:text-primary hover:bg-blue-100 rounded-lg active:scale-90" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(item.id, item.nama)} className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-lg active:scale-90" title="Hapus"><Trash2 size={14} /></button>
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

// ============================================================================
// 3. MAIN PAGE COMPONENT: KEMITRAAN (DENGAN DATA DUMMY & IMAGE UPLOAD)
// ============================================================================
export default function Kemitraan() {
  const [selectedFormat, setSelectedFormat] = useState("CSV");
  const [selectedReport, setSelectedReport] = useState("Mitra Universitas");
  const [exportingReport, setExportingReport] = useState(false);
  
  // Menggunakan DUMMY STATE
  const [universitasData, setUniversitasData] = useState(DUMMY_UNIVERSITAS);
  const [perusahaanData, setPerusahaanData] = useState(DUMMY_PERUSAHAAN);

  // --- CRUD UNIVERSITAS (Local State) ---
  const handleCreateUniv = (formData) => {
    const newItem = {
      id: Date.now(),
      nama: formData.nama,
      jalan: formData.jalan,
      image: formData.image
    };
    setUniversitasData([newItem, ...universitasData]);
  };

  const handleUpdateUniv = (id, formData) => {
    setUniversitasData(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, nama: formData.nama, jalan: formData.jalan, image: formData.image };
      }
      return item;
    }));
  };

  const handleDeleteUniv = (id) => {
    setUniversitasData(prev => prev.filter(item => item.id !== id));
  };


  // --- CRUD PERUSAHAAN (Local State) ---
  const handleCreatePerusahaan = (formData) => {
    const newItem = {
      id: Date.now(),
      nama: formData.nama,
      jalan: formData.jalan,
      image: formData.image
    };
    setPerusahaanData([newItem, ...perusahaanData]);
  };

  const handleUpdatePerusahaan = (id, formData) => {
    setPerusahaanData(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, nama: formData.nama, jalan: formData.jalan, image: formData.image };
      }
      return item;
    }));
  };

  const handleDeletePerusahaan = (id) => {
    setPerusahaanData(prev => prev.filter(item => item.id !== id));
  };


  // --- HANDLER EXPORT ---
  const handleBuatLaporan = async () => {
    setExportingReport(true);
    try {
      let headers, rows, fileName, title;
      if (selectedReport === 'Mitra Universitas') {
        if (universitasData.length === 0) return alertWarning("Data Universitas kosong");
        headers = ['Nama Kampus/Universitas', 'Alamat Lengkap'];
        rows = universitasData.map(u => [u.nama, u.jalan || '']);
        fileName = `laporan_universitas_${new Date().toISOString().slice(0,10)}`;
        title = 'Laporan Data Mitra Universitas';
      } else {
        if (perusahaanData.length === 0) return alertWarning("Data Perusahaan kosong");
        headers = ['Nama Perusahaan', 'Alamat Lengkap'];
        rows = perusahaanData.map(p => [p.nama, p.jalan || '']);
        fileName = `laporan_perusahaan_${new Date().toISOString().slice(0,10)}`;
        title = 'Laporan Data Mitra Perusahaan';
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-8 space-y-6 order-last lg:order-first">
          
          {/* TABEL UNIVERSITAS */}
          <UniversitasTable 
            data={universitasData} 
            onCreate={handleCreateUniv}
            onUpdate={handleUpdateUniv}
            onDelete={handleDeleteUniv}
          />

          {/* TABEL PERUSAHAAN */}
          <PerusahaanTable 
            data={perusahaanData} 
            onCreate={handleCreatePerusahaan}
            onUpdate={handleUpdatePerusahaan}
            onDelete={handleDeletePerusahaan}
          />
          
        </div>

        <BoxUnduhData
          title="Ekspor Laporan Kemitraan"
          options={["Mitra Universitas", "Mitra Perusahaan"]}
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