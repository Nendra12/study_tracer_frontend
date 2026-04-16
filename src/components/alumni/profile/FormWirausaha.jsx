import React from 'react';
import { MapPin, Check } from 'lucide-react';
import SmoothDropdown from '../../admin/SmoothDropdown';

export default function FormWirausaha({
  form, setForm, wirausaha, setWirausaha, bidangUsahaList, bidangUsahaMap,
  provinsiList, kotaUsahaList, loadingProvinsi, loadingKotaUsaha,
  loadKota, renderTahunDinamis, setShowUsahaMap
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <div className="w-full relative z-[70]">
        <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2.5 block">
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

      <div className="w-full relative z-[60]">
        <SmoothDropdown
          label={<>Bidang Usaha <span className="text-red-500">*</span></>}
          isSearchable={true}
          placeholder="Pilih Bidang Usaha"
          options={bidangUsahaList.map(b => b.nama || b.nama_bidang)}
          value={Object.keys(bidangUsahaMap).find(key => bidangUsahaMap[key] === wirausaha.id_bidang) || wirausaha.id_bidang}
          onSelect={(namaBid) => {
            const bid = bidangUsahaList.find(b => b.nama === namaBid || b.nama_bidang === namaBid);
            if (bid) setWirausaha(prev => ({ ...prev, id_bidang: String(bid.id) }));
          }}
        />
      </div>

      {renderTahunDinamis('Wirausaha', 'Usaha')}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2 mt-2 pt-6 border-t border-gray-200 relative z-40">
        <div className="w-full relative z-[50]">
          <SmoothDropdown
            label={<>Provinsi Usaha <span className="text-red-500">*</span></>}
            isSearchable={true}
            placeholder={loadingProvinsi ? 'Memuat...' : 'Pilih Provinsi'}
            options={provinsiList.map((p) => p.nama || p.nama_provinsi)}
            value={provinsiList.find((p) => String(p.id) === String(wirausaha.id_provinsi))?.nama || provinsiList.find((p) => String(p.id) === String(wirausaha.id_provinsi))?.nama_provinsi || ''}
            onSelect={(namaProv) => {
              const prov = provinsiList.find((p) => p.nama === namaProv || p.nama_provinsi === namaProv);
              if (prov) {
                setWirausaha((prev) => ({ ...prev, id_provinsi: String(prov.id), id_kota: '' }));
                loadKota(prov.id, 'usaha');
              }
            }}
          />
        </div>

        <div className="w-full relative z-[40]">
          <SmoothDropdown
            label={<>Kota Usaha <span className="text-red-500">*</span></>}
            isSearchable={true}
            placeholder={!wirausaha.id_provinsi ? 'Pilih provinsi dulu' : loadingKotaUsaha ? 'Memuat...' : 'Pilih Kota'}
            options={kotaUsahaList.map((k) => k.nama || k.nama_kota)}
            value={kotaUsahaList.find((k) => String(k.id) === String(wirausaha.id_kota))?.nama || kotaUsahaList.find((k) => String(k.id) === String(wirausaha.id_kota))?.nama_kota || ''}
            onSelect={(namaKota) => {
              const kota = kotaUsahaList.find((k) => k.nama === namaKota || k.nama_kota === namaKota);
              if (kota) {
                setWirausaha((prev) => ({ ...prev, id_kota: String(kota.id) }));
              }
            }}
          />
        </div>

        {/* PERBAIKAN: Tombol kembali dipisah di sebelah kanan */}
        <div className="md:col-span-2 mt-2">
          <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2.5 block">
            Alamat Usaha <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="flex-1 w-full">
              <input
                type="text"
                value={wirausaha.alamat || ''}
                onChange={(e) => setWirausaha((prev) => ({ ...prev, alamat: e.target.value }))}
                className="w-full px-4 h-[48px] bg-white border-2 border-fourth rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                placeholder="Masukkan alamat lengkap usaha"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setShowUsahaMap(true);
                  }
                }}
              />
              {form.latitude_usaha !== null && form.longitude_usaha !== null && (
                <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check size={12} strokeWidth={3} /> Koordinat tersimpan
                </p>
              )}
            </div>
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