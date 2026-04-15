import React from 'react';
import { MapPin, Check } from 'lucide-react';
import SmoothDropdown from '../../admin/SmoothDropdown';
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
      <div className="md:col-span-2 relative z-[80] w-full">
        <UniversitySelector
          univValue={universitas.nama_universitas}
          jurusanValue={universitas.id_jurusanKuliah}
          onUnivSelect={(val) => setUniversitas(prev => ({ ...prev, nama_universitas: val }))}
          onJurusanSelect={(val) => setUniversitas(prev => ({ ...prev, id_jurusanKuliah: val }))}
          onChangeUniv={(val) => setUniversitas(prev => ({ ...prev, nama_universitas: val }))}
          onChangeJurusan={(val) => setUniversitas(prev => ({ ...prev, id_jurusanKuliah: val }))}
        />
      </div>

      <div className="w-full relative z-[70]">
        <SmoothDropdown
          label={<>Jenjang <span className="text-red-500">*</span></>}
          isSearchable={false}
          placeholder="Pilih Jenjang"
          options={["D3", "D4", "S1", "S2", "S3"]}
          value={universitas.jenjang}
          onSelect={(val) => setUniversitas(prev => ({ ...prev, jenjang: val }))}
        />
      </div>

      <div className="w-full relative z-[60]">
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
            <SmoothDropdown
              label={<>Provinsi Universitas <span className="text-red-500">*</span></>}
              isSearchable={true}
              placeholder={loadingProvinsi ? 'Memuat...' : 'Pilih Provinsi'}
              options={provinsiList.map((p) => p.nama || p.nama_provinsi)}
              value={provinsiList.find((p) => String(p.id) === String(universitas.id_provinsi))?.nama || provinsiList.find((p) => String(p.id) === String(universitas.id_provinsi))?.nama_provinsi || ''}
              onSelect={(namaProv) => {
                const prov = provinsiList.find((p) => p.nama === namaProv || p.nama_provinsi === namaProv);
                if (prov) {
                  setUniversitas((prev) => ({ ...prev, id_provinsi: String(prov.id), id_kota: '' }));
                  loadKota(prov.id, 'kuliah');
                }
              }}
            />
          </div>

          <div className="w-full relative z-[40]">
            <SmoothDropdown
              label={<>Kota Universitas <span className="text-red-500">*</span></>}
              isSearchable={true}
              placeholder={!universitas.id_provinsi ? 'Pilih provinsi dulu' : loadingKotaKuliah ? 'Memuat...' : 'Pilih Kota'}
              options={kotaKuliahList.map((k) => k.nama || k.nama_kota)}
              value={kotaKuliahList.find((k) => String(k.id) === String(universitas.id_kota))?.nama || kotaKuliahList.find((k) => String(k.id) === String(universitas.id_kota))?.nama_kota || ''}
              onSelect={(namaKota) => {
                const kota = kotaKuliahList.find((k) => k.nama === namaKota || k.nama_kota === namaKota);
                if (kota) {
                  setUniversitas((prev) => ({ ...prev, id_kota: String(kota.id) }));
                }
              }}
            />
          </div>

          {/* PERBAIKAN: Tombol kembali dipisah di sebelah kanan */}
          <div className="md:col-span-2 mt-2">
            <label className="text-[11px] font-black text-primary uppercase tracking-widest mb-2.5 block">
              Alamat Universitas <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={universitas.alamat || ''}
                  onChange={(e) => setUniversitas((prev) => ({ ...prev, alamat: e.target.value }))}
                  className="w-full px-4 h-[48px] bg-white border-2 border-fourth rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                  placeholder="Masukkan alamat lengkap universitas"
                />
                {form.latitude_universitas !== null && form.longitude_universitas !== null && (
                  <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check size={12} strokeWidth={3} /> Koordinat tersimpan
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowUniMap(true)}
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