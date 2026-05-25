import React from 'react';
import { MapPin, Check } from 'lucide-react';
import SmoothDropdown from '../../admin/SmoothDropdown';
import InputDropdownEdit from '../../InputDropdownEdit';

export default function FormBekerja({
  form, setForm, pekerjaan, setPekerjaan, posisiOptions, perusahaanOptions,
  provinsiList, kotaPekerjaanList, loadingProvinsi, loadingKotaPekerjaan,
  loadKota, renderTahunDinamis, setShowBekerjaMap
}) {
  const isExistingPerusahaan = perusahaanOptions.some(p => p.toLowerCase() === (pekerjaan.nama_perusahaan || '').trim().toLowerCase());
  const showPerusahaanLocation = (pekerjaan.nama_perusahaan || '').trim() !== '' && !isExistingPerusahaan;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <div className="relative z-[80] w-full">
        <InputDropdownEdit
          label={<>Pekerjaan Sekarang <span className="text-red-500">*</span></>}
          value={pekerjaan.posisi}
          options={posisiOptions}
          placeholder="Contoh: Software Engineer"
          isRequired={false}
          onChange={(val) => setPekerjaan(prev => ({ ...prev, posisi: val }))}
          onSelect={(val) => setPekerjaan(prev => ({ ...prev, posisi: val }))}
        />
      </div>

      <div className="relative z-[80] w-full">
        <InputDropdownEdit
          label={<>Nama Perusahaan <span className="text-red-500">*</span></>}
          value={pekerjaan.nama_perusahaan}
          options={perusahaanOptions}
          placeholder="Ketik atau pilih nama perusahaan"
          isRequired={false}
          onChange={(val) => setPekerjaan(prev => ({ ...prev, nama_perusahaan: val }))}
          onSelect={(val) => setPekerjaan(prev => ({ ...prev, nama_perusahaan: val }))}
        />
      </div>

      {renderTahunDinamis('Bekerja', 'Kerja')}

      {/* AREA LOKASI (PROVINSI -> KOTA -> ALAMAT) */}
      {showPerusahaanLocation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2 mt-2 pt-6 border-t border-gray-200 relative z-[40]">
          <div className="md:col-span-2 mb-1">
            <p className="text-[11px] font-bold text-amber-600 italic bg-amber-50 px-3 py-1.5 rounded-lg inline-block border border-amber-200/50">
              Data perusahaan baru terdeteksi, mohon lengkapi lokasi perusahaan.
            </p>
          </div>

          <div className="w-full relative z-[45]">
            <InputDropdownEdit
              label={<>Provinsi <span className="text-red-500">*</span></>}
              placeholder={loadingProvinsi ? "Memuat..." : "Ketik atau Pilih Provinsi"}
              options={provinsiList.map(p => p.nama || p.nama_provinsi)}
              value={provinsiList.find(p => String(p.id) === String(pekerjaan.id_provinsi))?.nama || provinsiList.find(p => String(p.id) === String(pekerjaan.id_provinsi))?.nama_provinsi || pekerjaan.id_provinsi || ""}
              onSelect={(namaProv) => {
                const prov = provinsiList.find(p => p.nama === namaProv || p.nama_provinsi === namaProv);
                if (prov) {
                  setPekerjaan(prev => ({ ...prev, id_provinsi: String(prov.id), id_kota: '' }));
                  loadKota(prov.id, 'pekerjaan');
                } else {
                  setPekerjaan(prev => ({ ...prev, id_provinsi: namaProv, id_kota: '' }));
                }
              }}
              onChange={(namaProv) => {
                const prov = provinsiList.find(p => p.nama === namaProv || p.nama_provinsi === namaProv);
                if (prov) {
                  setPekerjaan(prev => ({ ...prev, id_provinsi: String(prov.id), id_kota: '' }));
                  loadKota(prov.id, 'pekerjaan');
                } else {
                  setPekerjaan(prev => ({ ...prev, id_provinsi: namaProv }));
                }
              }}
            />
          </div>

          <div className="w-full relative z-[40]">
            <InputDropdownEdit
              label={<>Kota / Kabupaten <span className="text-red-500">*</span></>}
              placeholder={!pekerjaan.id_provinsi ? "Pilih provinsi dulu" : loadingKotaPekerjaan ? "Memuat..." : "Ketik atau Pilih Kota"}
              options={kotaPekerjaanList.map(k => k.nama || k.nama_kota)}
              value={kotaPekerjaanList.find(k => String(k.id) === String(pekerjaan.id_kota))?.nama || kotaPekerjaanList.find(k => String(k.id) === String(pekerjaan.id_kota))?.nama_kota || pekerjaan.id_kota || ""}
              onSelect={(namaKota) => {
                const kota = kotaPekerjaanList.find(k => k.nama === namaKota || k.nama_kota === namaKota);
                if (kota) {
                  setPekerjaan(prev => ({ ...prev, id_kota: String(kota.id) }));
                } else {
                  setPekerjaan(prev => ({ ...prev, id_kota: namaKota }));
                }
              }}
              onChange={(namaKota) => {
                const kota = kotaPekerjaanList.find(k => k.nama === namaKota || k.nama_kota === namaKota);
                if (kota) {
                  setPekerjaan(prev => ({ ...prev, id_kota: String(kota.id) }));
                } else {
                  setPekerjaan(prev => ({ ...prev, id_kota: namaKota }));
                }
              }}
            />
          </div>

          <div className="md:col-span-2 mt-2">
            <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2.5 block">
              Alamat Perusahaan <span className="text-red-500">*</span>
            </label>
            
            {(!pekerjaan.jalan && !form.latitude_perusahaan) ? (
              <button
                type="button"
                onClick={() => setShowBekerjaMap(true)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-primary/5 border-2 border-dashed border-primary/40 text-primary rounded-xl hover:bg-primary/10 transition-all text-sm font-bold cursor-pointer"
              >
                <MapPin size={18} /> Buka Peta untuk Pilih Lokasi
              </button>
            ) : (
              <div className="flex h-[48px] w-full items-center border border-slate-200 bg-slate-50 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input
                  name="alamat_perusahaan"
                  value={pekerjaan.jalan || ''}
                  onChange={(e) => setPekerjaan(prev => ({ ...prev, jalan: e.target.value }))}
                  className="w-full h-full px-4 text-sm font-semibold outline-none bg-transparent"
                  placeholder="Masukkan alamat lengkap perusahaan..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      setShowBekerjaMap(true);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowBekerjaMap(true)}
                  className="h-full px-5 bg-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer border-l border-transparent shrink-0"
                >
                  <MapPin size={16} /> <span className="hidden sm:inline">Ubah Peta</span>
                </button>
              </div>
            )}

            <p className="mt-1.5 text-[10px] text-slate-400 font-medium italic">
              Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">Enter</kbd> pada kolom input untuk membuka peta
            </p>

            {form.latitude_perusahaan !== null && form.longitude_perusahaan !== null && (
              <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <Check size={14} strokeWidth={3} /> Koordinat peta tersimpan
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}