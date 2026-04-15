import React from 'react';

export default function RiwayatStatusKarier({ riwayat }) {
  if (!riwayat || riwayat.length === 0) return null;

  return (
    <div className="relative z-0 mt-8">
      <h3 className="text-sm font-black text-primary/60 uppercase tracking-widest mb-4">Riwayat Status</h3>
      <div className="space-y-4">
        {riwayat.map((item) => {
          let title = item.status?.nama || '-';
          let details = [];

          if (item.pekerjaan) {
            title = item.pekerjaan.posisi || title;
            if (item.pekerjaan.perusahaan?.nama) details.push({ label: 'Perusahaan', value: item.pekerjaan.perusahaan.nama });
            const lokasi = [item.pekerjaan.perusahaan?.kota, item.pekerjaan.perusahaan?.provinsi].filter(Boolean).join(', ');
            if (lokasi) details.push({ label: 'Lokasi', value: lokasi });
          }
          else if (item.kuliah) {
            title = item.kuliah.jenjang ? `Mahasiswa ${item.kuliah.jenjang}` : (item.status?.nama || 'Kuliah');
            if (item.kuliah.universitas?.nama || item.kuliah.universitas) details.push({ label: 'Universitas', value: item.kuliah.universitas?.nama || item.kuliah.universitas });
            if (item.kuliah.jurusan_kuliah?.nama) details.push({ label: 'Program Studi', value: item.kuliah.jurusan_kuliah.nama });
            if (item.kuliah.jalur_masuk) details.push({ label: 'Jalur Masuk', value: item.kuliah.jalur_masuk });
            const lokasiKuliah = [item.kuliah.kota?.nama || item.kuliah.kota, item.kuliah.provinsi?.nama || item.kuliah.provinsi].filter(Boolean).join(', ');
            if (lokasiKuliah) details.push({ label: 'Lokasi', value: lokasiKuliah });
            if (item.kuliah.alamat) details.push({ label: 'Alamat', value: item.kuliah.alamat });
          }
          else if (item.wirausaha) {
            title = 'Wirausaha';
            if (item.wirausaha.nama_usaha) details.push({ label: 'Nama Usaha', value: item.wirausaha.nama_usaha });
            if (item.wirausaha.bidang_usaha?.nama || item.wirausaha.bidang_usaha) details.push({ label: 'Bidang Usaha', value: item.wirausaha.bidang_usaha?.nama || item.wirausaha.bidang_usaha });
            const lokasiUsaha = [item.wirausaha.kota?.nama || item.wirausaha.kota, item.wirausaha.provinsi?.nama || item.wirausaha.provinsi].filter(Boolean).join(', ');
            if (lokasiUsaha) details.push({ label: 'Lokasi', value: lokasiUsaha });
            if (item.wirausaha.alamat) details.push({ label: 'Alamat', value: item.wirausaha.alamat });
          }

          const periode = `${item.tahun_mulai || '-'} - ${item.tahun_selesai || 'Sekarang'}`;

          return (
            <div key={item.id} className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-3xl p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-[15px] font-black text-primary mb-2">{title}</h3>
                {details.length > 0 && (
                  <div className="space-y-1.5 mt-3">
                    {details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider w-24 shrink-0 mt-0.5">{detail.label}</span>
                        <span className="font-medium text-sm text-slate-700 leading-tight">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-full text-[11px] font-black text-primary shrink-0 self-start sm:self-center">
                {periode}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}