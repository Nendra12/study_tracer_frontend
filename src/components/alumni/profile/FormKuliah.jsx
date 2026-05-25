import React from 'react';
import { MapPin, Check } from 'lucide-react';
import SmoothDropdown from '../../admin/SmoothDropdown';
import InputDropdownEdit from '../../InputDropdownEdit';
import UniversitySelector from '../../UniversitasSelector';

export default function FormKuliah({
  form, setForm, universitas, setUniversitas, universitasOptions,
  provinsiList, kotaKuliahList, loadingProvinsi, loadingKotaKuliah,
  loadKota, renderTahunDinamis, setShowUniMap
}) {
  const isExistingUniv = universitasOptions.some(u => u.toLowerCase() === (universitas.nama_universitas || '').trim().toLowerCase());
  const showUnivLocation = (universitas.nama_universitas || '').trim() !== '' && !isExistingUniv;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <div className="md:col-span-2 relative z-[90] w-full focus-within:z-[99]">
        <UniversitySelector
          univValue={universitas.nama_universitas}
          jurusanValue={universitas.id_jurusanKuliah}
          onUnivSelect={(val) => setUniversitas(prev => ({ ...prev, nama_universitas: val }))}
          onJurusanSelect={(val) => setUniversitas(prev => ({ ...prev, id_jurusanKuliah: val }))}
          onChangeUniv={(val) => setUniversitas(prev => ({ ...prev, nama_universitas: val }))}
          onChangeJurusan={(val) => setUniversitas(prev => ({ ...prev, id_jurusanKuliah: val }))}
        />
      </div>

      <div className="w-full relative z-[80] focus-within:z-[99]">
        <SmoothDropdown
          label={<>Jenjang <span className="text-red-500">*</span></>}
          isSearchable={false}
          placeholder="Pilih Jenjang"
          options={["D3", "D4", "S1", "S2", "S3"]}
          value={universitas.jenjang}
          onSelect={(val) => setUniversitas(prev => ({ ...prev, jenjang: val }))}
        />
      </div>

      <div className="w-full relative z-[80] focus-within:z-[99]">
        <SmoothDropdown
          label={<>Jalur Masuk <span className="text-red-500">*</span></>}
          isSearchable={false}
          placeholder="Pilih Jalur Masuk"
          options={["SNBP", "SNBT", "Mandiri", "Prestasi", "Lainnya"]}
          value={universitas.jalur_masuk}
          onSelect={(val) => setUniversitas(prev => ({ ...prev, jalur_masuk: val }))}
        />
      </div>

      {renderTahunDinamis('Kuliah', 'Kuliah')}

      {showUnivLocation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2 mt-2 pt-6 border-t border-gray-200 relative z-[40]">
          <div className="md:col-span-2 mb-1">
            <p className="text-[11px] font-bold text-amber-600 italic bg-amber-50 px-3 py-1.5 rounded-lg inline-block border border-amber-200/50">
              Data universitas baru terdeteksi, mohon lengkapi lokasi universitas.
            </p>
          </div>

          <div className="w-full relative z-[50]">
            <InputDropdownEdit
              label={<>Provinsi Universitas <span className="text-red-500">*</span></>}
              placeholder={loadingProvinsi ? 'Memuat...' : 'Ketik atau Pilih Provinsi'}
              options={provinsiList.map((p) => p.nama || p.nama_provinsi)}
              value={provinsiList.find((p) => String(p.id) === String(universitas.id_provinsi))?.nama || provinsiList.find((p) => String(p.id) === String(universitas.id_provinsi))?.nama_provinsi || universitas.id_provinsi || ''}
              onSelect={(namaProv) => {
                const prov = provinsiList.find((p) => p.nama === namaProv || p.nama_provinsi === namaProv);
                if (prov) {
                  setUniversitas((prev) => ({ ...prev, id_provinsi: String(prov.id), id_kota: '' }));
                  loadKota(prov.id, 'kuliah');
                } else {
                  setUniversitas((prev) => ({ ...prev, id_provinsi: namaProv, id_kota: '' }));
                }
              }}
              onChange={(namaProv) => {
                const prov = provinsiList.find((p) => p.nama === namaProv || p.nama_provinsi === namaProv);
                if (prov) {
                  setUniversitas((prev) => ({ ...prev, id_provinsi: String(prov.id), id_kota: '' }));
                  loadKota(prov.id, 'kuliah');
                } else {
                  setUniversitas((prev) => ({ ...prev, id_provinsi: namaProv }));
                }
              }}
            />
          </div>

          <div className="w-full relative z-[40]">
            <InputDropdownEdit
              label={<>Kota Universitas <span className="text-red-500">*</span></>}
              placeholder={!universitas.id_provinsi ? 'Pilih provinsi dulu' : loadingKotaKuliah ? 'Memuat...' : 'Ketik atau Pilih Kota'}
              options={kotaKuliahList.map((k) => k.nama || k.nama_kota)}
              value={kotaKuliahList.find((k) => String(k.id) === String(universitas.id_kota))?.nama || kotaKuliahList.find((k) => String(k.id) === String(universitas.id_kota))?.nama_kota || universitas.id_kota || ''}
              onSelect={(namaKota) => {
                const kota = kotaKuliahList.find((k) => k.nama === namaKota || k.nama_kota === namaKota);
                if (kota) {
                  setUniversitas((prev) => ({ ...prev, id_kota: String(kota.id) }));
                } else {
                  setUniversitas((prev) => ({ ...prev, id_kota: namaKota }));
                }
              }}
              onChange={(namaKota) => {
                const kota = kotaKuliahList.find((k) => k.nama === namaKota || k.nama_kota === namaKota);
                if (kota) {
                  setUniversitas((prev) => ({ ...prev, id_kota: String(kota.id) }));
                } else {
                  setUniversitas((prev) => ({ ...prev, id_kota: namaKota }));
                }
              }}
            />
          </div>

          <div className="md:col-span-2 mt-2">
            <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2.5 block">
              Alamat Universitas <span className="text-red-500">*</span>
            </label>

            {(!universitas.alamat && !form.latitude_universitas) ? (
              <button
                type="button"
                onClick={() => setShowUniMap(true)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-primary/5 border-2 border-dashed border-primary/40 text-primary rounded-xl hover:bg-primary/10 transition-all text-sm font-bold cursor-pointer"
              >
                <MapPin size={18} /> Buka Peta untuk Pilih Lokasi
              </button>
            ) : (
              <div className="flex h-[48px] w-full items-center border border-slate-200 bg-slate-50 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input
                  name="alamat_universitas"
                  value={universitas.alamat || ''}
                  onChange={(e) => setUniversitas(prev => ({ ...prev, alamat: e.target.value }))}
                  className="w-full h-full px-4 text-sm font-semibold outline-none bg-transparent"
                  placeholder="Masukkan alamat lengkap universitas..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      setShowUniMap(true);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowUniMap(true)}
                  className="h-full px-5 bg-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer border-l border-transparent shrink-0"
                >
                  <MapPin size={16} /> <span className="hidden sm:inline">Ubah Peta</span>
                </button>
              </div>
            )}

            <p className="mt-1.5 text-[10px] text-slate-400 font-medium italic">
              Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">Enter</kbd> pada kolom input untuk membuka peta
            </p>

            {form.latitude_universitas !== null && form.longitude_universitas !== null && (
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