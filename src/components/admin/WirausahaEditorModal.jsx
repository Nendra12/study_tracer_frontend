import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Loader2, X, Store } from "lucide-react";
import SmoothKota from "./SmoothKota";
import SmoothDropdown from "./SmoothDropdown";

export default function WirausahaEditorModal({
  isOpen,
  mode = "add",
  formData,
  errors,
  kotaList,
  bidangUsahaList = [],
  bidangUsahaMap = {},
  selectedProvinsiLabel,
  saving,
  onNamaUsahaChange,
  onBidangUsahaChange,
  onAlamatChange,
  onKotaChange,
  onCancel,
  onSave,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") onCancel?.();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const title = mode === "edit" ? "Edit Data Wirausaha" : "Tambah Wirausaha Baru";
  const selectedBidangLabel =
    Object.keys(bidangUsahaMap).find(
      (key) => String(bidangUsahaMap[key]) === String(formData.id_bidang)
    ) || "";

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-3xl bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-visible animate-in zoom-in-95 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-white to-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-primary">
              <Store size={18} />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black text-primary">{title}</h3>
              <p className="text-xs text-slate-500">Lengkapi data wirausaha dengan jelas dan lengkap.</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup popup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 relative z-20 overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-primary/80 uppercase tracking-wider">
                Nama Usaha <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama_usaha}
                onChange={(e) => onNamaUsahaChange(e.target.value)}
                className={`mt-3 w-full p-3 bg-white text-sm border-2 rounded-xl transition-all outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary ${
                  errors.nama_usaha ? "border-red-300" : "border-gray-100"
                }`}
                placeholder="Contoh: Kedai Kopi Nusantara"
                autoFocus
              />
              {errors.nama_usaha && <p className="text-xs text-red-500 font-medium">{errors.nama_usaha}</p>}
            </div>

            <div className="space-y-1 relative z-50 [&>div]:space-y-0">
              <SmoothDropdown
                label="Bidang Usaha"
                value={selectedBidangLabel || formData.id_bidang || ""}
                options={bidangUsahaList}
                isRequired={true}
                isSearchable={true}
                placeholder="Pilih Bidang"
                onSelect={(val) => onBidangUsahaChange(String(bidangUsahaMap[val] || val))}
              />
              {errors.id_bidang && <p className="text-xs text-red-500 font-medium">{errors.id_bidang}</p>}
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-black text-primary uppercase tracking-wider">Alamat</label>
              <input
                type="text"
                value={formData.alamat}
                onChange={(e) => onAlamatChange(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Alamat usaha"
              />
            </div>

            <div className="space-y-1 relative z-120 [&>div]:min-w-0 [&>div]:space-y-0 [&_button]:h-11 [&_button]:px-3 [&_button]:py-0 [&_button]:rounded-xl [&_button]:border-slate-200 [&_button]:bg-slate-50 [&_button]:focus:ring-2 [&_button]:focus:ring-primary/20 [&_button_span]:text-sm [&_button_span]:font-normal [&_button_span]:text-slate-600 [&_button_svg]:text-slate-400 [&_.absolute.z-9999]:z-120 [&_.absolute.z-9999]:rounded-xl [&_.absolute.z-9999]:border-slate-200 [&_.absolute.z-9999]:shadow-xl [&_.absolute.z-9999]:mt-2">
              <label className="text-[11px] font-black text-primary uppercase tracking-wider">Kota</label>
              <SmoothKota
                isSearchable={true}
                placeholder="Pilih Kota"
                value={formData.id_kota}
                options={kotaList.map((k) => ({ value: String(k.id), label: k.nama }))}
                onSelect={(val) => onKotaChange(String(val))}
              />
              {errors.id_kota && <p className="text-xs text-red-500 font-medium">{errors.id_kota}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-primary uppercase tracking-wider">Provinsi</label>
              <div className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-normal min-h-11 flex items-center">
                {selectedProvinsiLabel || "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 relative z-10 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="cursor-pointer px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="cursor-pointer px-4 py-2 text-sm font-bold bg-primary text-white rounded-xl shadow-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />} Simpan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
