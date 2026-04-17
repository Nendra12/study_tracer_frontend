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

          {/* PERBAIKAN: Tombol kembali dipisah di sebelah kanan */}
          <div className="md:col-span-2 mt-2">
            <label className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2.5 block">
              Alamat Perusahaan <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1 w-full">
                <textarea
                  value={pekerjaan.jalan || ''}
                  onChange={(e) => setPekerjaan(prev => ({ ...prev, jalan: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border-2 border-fourth rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-y min-h-[100px] leading-relaxed"
                  placeholder="Masukkan alamat lengkap perusahaan..."
                  onKeyDown={(e) => {
                    // Menggunakan Ctrl+Enter (atau Cmd+Enter) untuk membuka peta 
                    // agar tombol Enter biasa bisa digunakan untuk baris baru (newline)
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      setShowBekerjaMap(true);
                    }
                  }}
                />

                {/* Pesan Bantuan atau Keterangan Shortcut */}
                <p className="mt-1 text-[10px] text-slate-400 font-medium italic">
                  Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">Enter</kbd> untuk membuka peta
                </p>

                {form.latitude_perusahaan !== null && form.longitude_perusahaan !== null && (
                  <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <Check size={14} strokeWidth={3} /> Koordinat tersimpan
                  </p>
                )}
              </div>

              {/* Tombol Map tetap berada di kanan atas mengikuti sm:items-start */}
              <button
                type="button"
                onClick={() => setShowBekerjaMap(true)}
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-6 h-[48px] text-xs font-bold text-white transition hover:bg-[#2A3E3F] cursor-pointer shadow-sm"
              >
                <MapPin size={16} />
                Pilih di Peta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}