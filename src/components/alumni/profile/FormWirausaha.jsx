import React from 'react';
import { MapPin, Check } from 'lucide-react';
import SmoothDropdown from '../../admin/SmoothDropdown';
import InputDropdownEdit from '../../InputDropdownEdit';

export default function FormWirausaha({
  form, setForm, wirausaha, setWirausaha, bidangUsahaList, bidangUsahaMap,
  provinsiList, kotaUsahaList, loadingProvinsi, loadingKotaUsaha,
  loadKota, renderTahunDinamis, setShowUsahaMap
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <div className="w-full relative z-[70]">
        <label className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2.5 block">
          Nama Usaha <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={wirausaha.nama_usaha}
          onChange={(e) => setWirausaha({ ...wirausaha, nama_usaha: e.target.value })}
          className="w-full px-4 h-[48px] bg-white border-2 border-fourth rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
          placeholder="Contoh: Toko Kopi Sejahtera"
        />
      </div>

      <div className="w-full relative z-[80]">
        <SmoothDropdown
          label={<>Bidang Usaha <span className="text-red-500">*</span></>}
          isSearchable={true}
          placeholder="Pilih Bidang Usaha"
          options={bidangUsahaList.map(b => b.nama || b.nama_bidang || b.nama_bidang_usaha).filter(Boolean)}
          value={Object.keys(bidangUsahaMap).find(key => bidangUsahaMap[key] === wirausaha.id_bidang) || wirausaha.id_bidang}
          onSelect={(namaBid) => {
            const bid = bidangUsahaList.find(b => b.nama === namaBid || b.nama_bidang === namaBid || b.nama_bidang_usaha === namaBid);
            if (bid) setWirausaha(prev => ({ ...prev, id_bidang: String(bid.id) }));
          }}
        />
      </div>

      {renderTahunDinamis('Wirausaha', 'Usaha')}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2 mt-2 pt-6 border-t border-gray-200 relative z-40">
        <div className="w-full relative z-[50]">
          <InputDropdownEdit
            label={<>Provinsi Usaha <span className="text-red-500">*</span></>}
            placeholder={loadingProvinsi ? 'Memuat...' : 'Ketik atau Pilih Provinsi'}
            options={provinsiList.map((p) => p.nama || p.nama_provinsi)}
            value={provinsiList.find((p) => String(p.id) === String(wirausaha.id_provinsi))?.nama || provinsiList.find((p) => String(p.id) === String(wirausaha.id_provinsi))?.nama_provinsi || wirausaha.id_provinsi || ''}
            onSelect={(namaProv) => {
              const prov = provinsiList.find((p) => p.nama === namaProv || p.nama_provinsi === namaProv);
              if (prov) {
                setWirausaha((prev) => ({ ...prev, id_provinsi: String(prov.id), id_kota: '' }));
                loadKota(prov.id, 'usaha');
              } else {
                setWirausaha((prev) => ({ ...prev, id_provinsi: namaProv, id_kota: '' }));
              }
            }}
            onChange={(namaProv) => {
              const prov = provinsiList.find((p) => p.nama === namaProv || p.nama_provinsi === namaProv);
              if (prov) {
                setWirausaha((prev) => ({ ...prev, id_provinsi: String(prov.id), id_kota: '' }));
                loadKota(prov.id, 'usaha');
              } else {
                setWirausaha((prev) => ({ ...prev, id_provinsi: namaProv }));
              }
            }}
          />
        </div>

        <div className="w-full relative z-[40]">
          <InputDropdownEdit
            label={<>Kota Usaha <span className="text-red-500">*</span></>}
            placeholder={!wirausaha.id_provinsi ? 'Pilih provinsi dulu' : loadingKotaUsaha ? 'Memuat...' : 'Ketik atau Pilih Kota'}
            options={kotaUsahaList.map((k) => k.nama || k.nama_kota)}
            value={kotaUsahaList.find((k) => String(k.id) === String(wirausaha.id_kota))?.nama || kotaUsahaList.find((k) => String(k.id) === String(wirausaha.id_kota))?.nama_kota || wirausaha.id_kota || ''}
            onSelect={(namaKota) => {
              const kota = kotaUsahaList.find((k) => k.nama === namaKota || k.nama_kota === namaKota);
              if (kota) {
                setWirausaha((prev) => ({ ...prev, id_kota: String(kota.id) }));
              } else {
                setWirausaha((prev) => ({ ...prev, id_kota: namaKota }));
              }
            }}
            onChange={(namaKota) => {
              const kota = kotaUsahaList.find((k) => k.nama === namaKota || k.nama_kota === namaKota);
              if (kota) {
                setWirausaha((prev) => ({ ...prev, id_kota: String(kota.id) }));
              } else {
                setWirausaha((prev) => ({ ...prev, id_kota: namaKota }));
              }
            }}
          />
        </div>

        {/* PERBAIKAN: Tombol kembali dipisah di sebelah kanan */}
        <div className="md:col-span-2 mt-2">
          <label className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2.5 block">
            Alamat Usaha <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1 w-full">
              <textarea
                value={wirausaha.alamat || ''}
                onChange={(e) => setWirausaha((prev) => ({ ...prev, alamat: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-white border-2 border-fourth rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-y min-h-[100px] leading-relaxed"
                placeholder="Masukkan alamat lengkap usaha..."
                onKeyDown={(e) => {
                  // Menggunakan Ctrl+Enter (atau Cmd+Enter) untuk membuka peta
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    setShowUsahaMap(true);
                  }
                }}
              />

              {/* Pesan Bantuan atau Keterangan Shortcut */}
              <p className="mt-1 text-[10px] text-slate-400 font-medium italic">
                Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">Enter</kbd> untuk membuka peta
              </p>

              {form.latitude_usaha !== null && form.longitude_usaha !== null && (
                <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <Check size={14} strokeWidth={3} /> Koordinat tersimpan
                </p>
              )}
            </div>

            {/* Tombol Map */}
            <button
              type="button"
              onClick={() => setShowUsahaMap(true)}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-6 h-[48px] text-xs font-bold text-white transition hover:bg-[#2A3E3F] cursor-pointer shadow-sm"
            >
              <MapPin size={16} />
              Pilih di Peta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}