import React, { useState } from 'react';
import { Briefcase, Plus, X, Loader2, Save, Clock, CheckCircle2, AlertCircle, Edit2 } from 'lucide-react';
import { alumniApi } from '../../../api/alumni';
import { masterDataApi } from '../../../api/masterData';
import SmoothDropdown from '../../admin/SmoothDropdown';

export default function TabStatusKarier({ profile, onRefresh, onShowSuccess }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingAlert, setPendingAlert] = useState(false);
  const [editingEndDate, setEditingEndDate] = useState(false);
  const [endDateValue, setEndDateValue] = useState('');

  const [statusList, setStatusList] = useState([]);
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [bidangUsahaList, setBidangUsahaList] = useState([]);
  const [jurusanKuliahList, setJurusanKuliahList] = useState([]);
  const [loadingKota, setLoadingKota] = useState(false);

  const [isSaatIni, setIsSaatIni] = useState(false);

  const [form, setForm] = useState({
    id_status: '', tahun_mulai: '', tahun_selesai: '',
    posisi: '', nama_perusahaan: '', id_kota: '', id_provinsi: '', jalan: '',
    nama_universitas: '', id_jurusanKuliah: '', jalur_masuk: '', jenjang: '',
    id_bidang: '', nama_usaha: ''
  });

  const career = profile?.current_career;

  async function loadMasterData() {
    try {
      const [statusRes, provinsiRes, bidangRes, jurusanRes] = await Promise.all([
        masterDataApi.getStatus(),
        masterDataApi.getProvinsi(),
        masterDataApi.getBidangUsaha(),
        masterDataApi.getJurusanKuliah(),
      ]);
      setStatusList(statusRes.data.data || statusRes.data || []);
      setProvinsiList(provinsiRes.data.data || provinsiRes.data || []);
      setBidangUsahaList(bidangRes.data.data || bidangRes.data || []);
      setJurusanKuliahList(jurusanRes.data.data || jurusanRes.data || []);
    } catch (err) { console.error('Failed to load master data:', err); }
  }

  async function loadKota(idProvinsi) {
    if (!idProvinsi) {
      setKotaList([]);
      return;
    }
    setLoadingKota(true);
    try {
      const res = await masterDataApi.getKota(idProvinsi);
      setKotaList(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load kota:', err);
      setKotaList([]);
    } finally {
      setLoadingKota(false);
    }
  }

  function handleOpenForm() {
    if (career && !career.tahun_selesai && career.status != 'Belum Bekerja') {
      alert('Anda harus mengisi tanggal berakhir pada karir saat ini terlebih dahulu sebelum menambahkan status karir baru.');
      return;
    }
    setShowForm(true);
    setForm({ id_status: '', tahun_mulai: '', tahun_selesai: '', posisi: '', nama_perusahaan: '', id_kota: '', id_provinsi: '', jalan: '', nama_universitas: '', id_jurusanKuliah: '', jalur_masuk: '', jenjang: '', id_bidang: '', nama_usaha: '' });
    loadMasterData();
  }

  const selectedStatus = statusList.find(s => String(s.id) === String(form.id_status));
  const statusName = (selectedStatus?.nama || selectedStatus?.nama_status || '').toLowerCase();

  async function handleSave() {
    try {
      setSaving(true);
      const payload = {
        id_status: form.id_status,
        tahun_mulai: form.tahun_mulai,
        tahun_selesai: form.tahun_selesai || null,
      };

      const isBelum = statusName.includes('belum');
      if (!isBelum && (statusName.includes('kerja') || statusName.includes('bekerja'))) {
        payload.pekerjaan = { posisi: form.posisi, nama_perusahaan: form.nama_perusahaan, id_kota: form.id_kota, jalan: form.jalan };
      } else if (statusName.includes('kuliah')) {
        payload.universitas = { nama_universitas: form.nama_universitas, id_jurusanKuliah: form.id_jurusanKuliah, jalur_masuk: form.jalur_masuk, jenjang: form.jenjang };
      } else if (statusName.includes('wirausaha') || statusName.includes('usaha')) {
        payload.wirausaha = { id_bidang: form.id_bidang, nama_usaha: form.nama_usaha };
      }

      await alumniApi.updateCareerStatus(payload);
      setShowForm(false);
      setPendingAlert(true);
      onShowSuccess('Status karier berhasil dikirim, menunggu verifikasi admin');
      onRefresh();
    } catch (err) {
      console.error('Failed to save career status:', err);
      alert('Gagal menyimpan status: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateEndDate() {
    if (!endDateValue) {
      alert('Mohon isi tahun selesai');
      return;
    }
    if (!career?.id_status || !career?.id_riwayat) {
      alert('Data karir tidak lengkap. Silakan refresh halaman.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        id_status: career.id_status,
        tahun_mulai: career.tahun_mulai,
        tahun_selesai: endDateValue,
      };

      if (career.pekerjaan) {
        payload.pekerjaan = {
          posisi: career.pekerjaan.posisi,
          nama_perusahaan: career.pekerjaan.perusahaan,
          id_kota: career.pekerjaan.id_kota,
          jalan: career.pekerjaan.jalan
        };
      } else if (career.kuliah) {
        payload.universitas = {
          nama_universitas: career.kuliah.universitas,
          id_jurusanKuliah: career.kuliah.jurusan_kuliah?.id,
          jalur_masuk: career.kuliah.jalur_masuk,
          jenjang: career.kuliah.jenjang
        };
      } else if (career.wirausaha) {
        payload.wirausaha = {
          id_bidang: career.wirausaha.id_bidang,
          nama_usaha: career.wirausaha.nama_usaha
        };
      }

      await alumniApi.updateExistingCareerStatus(career.id_riwayat, payload);
      setEditingEndDate(false);
      setEndDateValue('');
      onShowSuccess('Tahun selesai berhasil diperbarui');
      onRefresh();
    } catch (err) {
      console.error('Failed to update end date:', err);
      alert('Gagal memperbarui tahun selesai: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }

  const rawRiwayat = profile?.riwayat_status || [];
  const riwayat = rawRiwayat
    .filter((item, index, self) => index === self.findIndex(r => r.id === item.id))
    .filter((item) => {
      if (!career) return true;
      if (career.status && item.status?.nama === career.status && item.tahun_mulai === career.tahun_mulai) {
        if (career.pekerjaan && item.pekerjaan) return !(item.pekerjaan.posisi === career.pekerjaan.posisi);
        if (career.kuliah && item.kuliah) return !(item.kuliah.universitas?.nama === career.kuliah.universitas);
        if (career.wirausaha && item.wirausaha) return !(item.wirausaha.nama_usaha === career.wirausaha.nama_usaha);
        if (!item.pekerjaan && !item.kuliah && !item.wirausaha) return false;
      }
      return true;
    });

  function getCareerDisplayInfo() {
    if (!career) return null;

    if (career.pekerjaan) {
      return {
        type: 'pekerjaan',
        fields: [
          { label: 'Posisi / Jabatan', value: career.pekerjaan.posisi || '-' },
          { label: 'Perusahaan', value: career.pekerjaan.perusahaan || '-' },
          { label: 'Kota', value: career.pekerjaan.kota || '-' },
          { label: 'Provinsi', value: career.pekerjaan.provinsi || '-' },
          { label: 'Alamat', value: career.pekerjaan.jalan || '-' }
        ]
      };
    }

    if (career.kuliah) {
      return {
        type: 'kuliah',
        fields: [
          { label: 'Jenjang', value: career.kuliah.jenjang || '-' },
          { label: 'Universitas', value: career.kuliah.universitas || '-' },
          { label: 'Program Studi / Jurusan', value: career.kuliah.jurusan_kuliah?.nama || '-' },
          { label: 'Jalur Masuk', value: career.kuliah.jalur_masuk || '-' }
        ]
      };
    }

    if (career.wirausaha) {
      return {
        type: 'wirausaha',
        fields: [
          { label: 'Nama Usaha', value: career.wirausaha.nama_usaha || '-' },
          { label: 'Bidang Usaha', value: career.wirausaha.bidang_usaha || '-' }
        ]
      };
    }

    return null;
  }
  const careerInfo = getCareerDisplayInfo();

  return (
    <div className="p-8 md:p-10 flex-1 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-primary">
          <h2 className="text-lg font-black">Status Karier Saat Ini</h2>
        </div>
        {!showForm && (
          <div className="relative group">
            <button
              onClick={handleOpenForm}
              className={`flex items-center gap-1 text-xs font-bold transition-all ${career && !career.tahun_selesai && career.status != 'Belum Bekerja'
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-primary hover:underline cursor-pointer'
                }`}
              disabled={career && !career.tahun_selesai && career.status != 'Belum Bekerja'}
            >
              <Plus size={14} /> Tambahkan status baru
            </button>
            {career && !career.tahun_selesai && career.status != 'Belum Bekerja' && (
              <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-64 bg-slate-800 text-white text-xs p-3 rounded-lg shadow-lg z-10">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <p>Isi tanggal berakhir pada karir saat ini sebelum menambahkan status baru</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Tambah Status */}
      {showForm && (
        <div className="relative z-50 border-2 border-primary/30 rounded-3xl p-6 mb-6 bg-primary/5 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-primary">Tambahkan Status Baru</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            {/* Status */}
            <div className="sm:col-span-2 relative z-[60]">
              <SmoothDropdown
                label="Status"
                isSearchable={false}
                placeholder="Pilih Status"
                options={statusList.map(st => st.nama || st.nama_status)}
                value={statusList.find(st => String(st.id) === String(form.id_status))?.nama || statusList.find(st => String(st.id) === String(form.id_status))?.nama_status || ""}
                onSelect={(namaStatus) => {
                  const status = statusList.find(st => (st.nama === namaStatus) || (st.nama_status === namaStatus));
                  if (status) setForm(prev => ({ ...prev, id_status: String(status.id) }));
                }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Tahun Mulai</label>
              <input type="number" placeholder="2024" value={form.tahun_mulai} onChange={(e) => setForm(prev => ({ ...prev, tahun_mulai: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              {!isSaatIni ? (
                <div>
                  <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
                    Tahun Selesai <span className="normal-case font-medium text-slate-400">(opsional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="2025"
                    value={form.tahun_selesai}
                    onChange={(e) => setForm(prev => ({ ...prev, tahun_selesai: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
                    Tahun Selesai <span className="normal-case font-medium text-slate-400">(opsional)</span>
                  </label>
                  {/* Tampilan input disabled saat dicentang, saya sesuaikan padding-nya agar sama dengan input asli Anda */}
                  <div className="w-full bg-gray-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-gray-500 font-medium cursor-not-allowed">
                    Sedang Berlangsung
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 pt-1.5 text-[11px] text-secondary cursor-pointer hover:text-primary transition-colors w-fit">
                <input
                  type="checkbox"
                  checked={isSaatIni}
                  onChange={(e) => {
                    setIsSaatIni(e.target.checked);
                    // Kosongkan value tahun_selesai di dalam object form saat dicentang
                    if (e.target.checked) setForm(prev => ({ ...prev, tahun_selesai: '' }));
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer transition-all"
                />
                <span className="font-bold">Masih berlangsung (Saat ini)</span>
              </label>
            </div>

            {/* FIELD UNTUK PEKERJAAN */}
            {!statusName.includes('belum') && (statusName.includes('kerja') || statusName.includes('bekerja')) && (
              <>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Posisi / Judul Job</label>
                  <input type="text" placeholder="Contoh: Software Engineer" value={form.posisi} onChange={(e) => setForm(prev => ({ ...prev, posisi: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Nama Perusahaan</label>
                  <input type="text" placeholder="Contoh: PT. Teknologi Sukses" value={form.nama_perusahaan} onChange={(e) => setForm(prev => ({ ...prev, nama_perusahaan: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>

                {/* PROVINSI & KOTA BERSEBELAHAN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:col-span-2 relative z-50">
                  <div className="w-full">
                    <SmoothDropdown
                      label="Provinsi"
                      isSearchable={true}
                      placeholder="Pilih Provinsi"
                      options={provinsiList.map(p => p.nama || p.nama_provinsi)}
                      value={provinsiList.find(p => String(p.id) === String(form.id_provinsi))?.nama || provinsiList.find(p => String(p.id) === String(form.id_provinsi))?.nama_provinsi || ""}
                      onSelect={(namaProv) => {
                        const prov = provinsiList.find(p => p.nama === namaProv || p.nama_provinsi === namaProv);
                        if (prov) {
                          setForm(prev => ({ ...prev, id_provinsi: String(prov.id), id_kota: '' }));
                          loadKota(prov.id);
                        }
                      }}
                    />
                  </div>
                  <div className="w-full">
                    <SmoothDropdown
                      label="Kota / Kabupaten"
                      isSearchable={true}
                      placeholder={!form.id_provinsi ? "Pilih provinsi dulu" : loadingKota ? "Memuat..." : "Pilih Kota"}
                      options={kotaList.map(k => k.nama || k.nama_kota)}
                      value={kotaList.find(k => String(k.id) === String(form.id_kota))?.nama || kotaList.find(k => String(k.id) === String(form.id_kota))?.nama_kota || ""}
                      onSelect={(namaKota) => {
                        const kota = kotaList.find(k => k.nama === namaKota || k.nama_kota === namaKota);
                        if (kota) setForm(prev => ({ ...prev, id_kota: String(kota.id) }));
                      }}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Alamat / Jalan <span className="normal-case font-medium text-slate-400">(opsional)</span></label>
                  <input type="text" placeholder="Contoh: Jl. Sudirman No. 123" value={form.jalan} onChange={(e) => setForm(prev => ({ ...prev, jalan: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </>
            )}

            {/* FIELD UNTUK KULIAH */}
            {statusName.includes('kuliah') && (
              <>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Nama Universitas</label>
                  <input type="text" placeholder="Contoh: Universitas Indonesia" value={form.nama_universitas} onChange={(e) => setForm(prev => ({ ...prev, nama_universitas: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>

                <div className="sm:col-span-2 relative z-50">
                  <SmoothDropdown
                    label="Program Studi / Jurusan"
                    isSearchable={true}
                    placeholder="Pilih Jurusan"
                    options={jurusanKuliahList.map(j => j.nama || j.nama_jurusan)}
                    value={jurusanKuliahList.find(j => String(j.id) === String(form.id_jurusanKuliah))?.nama || jurusanKuliahList.find(j => String(j.id) === String(form.id_jurusanKuliah))?.nama_jurusan || ""}
                    onSelect={(namaJur) => {
                      const jur = jurusanKuliahList.find(j => j.nama === namaJur || j.nama_jurusan === namaJur);
                      if (jur) setForm(prev => ({ ...prev, id_jurusanKuliah: String(jur.id) }));
                    }}
                  />
                </div>

                {/* JENJANG & JALUR MASUK SEJAJAR DI FORM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:col-span-2 relative z-40">
                  <div className="w-full relative">
                    <SmoothDropdown
                      label="Jenjang"
                      isSearchable={false}
                      placeholder="Pilih Jenjang"
                      options={["D3", "D4", "S1", "S2", "S3"]}
                      value={form.jenjang}
                      onSelect={(val) => setForm(prev => ({ ...prev, jenjang: val }))}
                    />
                  </div>

                  <div className="w-full relative">
                    <SmoothDropdown
                      label="Jalur Masuk"
                      isSearchable={false}
                      placeholder="Pilih Jalur Masuk"
                      options={["SNBP", "SNBT", "Mandiri", "Prestasi", "Lainnya"]}
                      value={form.jalur_masuk}
                      onSelect={(val) => setForm(prev => ({ ...prev, jalur_masuk: val }))}
                    />
                  </div>
                </div>
              </>
            )}

            {/* FIELD UNTUK WIRAUSAHA */}
            {(statusName.includes('wirausaha') || statusName.includes('usaha')) && (
              <>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Nama Usaha</label>
                  <input type="text" placeholder="Contoh: Toko Kopi Sejahtera" value={form.nama_usaha} onChange={(e) => setForm(prev => ({ ...prev, nama_usaha: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>

                <div className="sm:col-span-2 relative z-50">
                  <SmoothDropdown
                    label="Bidang Usaha"
                    isSearchable={true}
                    placeholder="Pilih Bidang Usaha"
                    options={bidangUsahaList.map(b => b.nama || b.nama_bidang)}
                    value={bidangUsahaList.find(b => String(b.id) === String(form.id_bidang))?.nama || bidangUsahaList.find(b => String(b.id) === String(form.id_bidang))?.nama_bidang || ""}
                    onSelect={(namaBid) => {
                      const bid = bidangUsahaList.find(b => b.nama === namaBid || b.nama_bidang === namaBid);
                      if (bid) setForm(prev => ({ ...prev, id_bidang: String(bid.id) }));
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-primary/10">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer">Batal</button>
            <button onClick={handleSave} disabled={saving || !form.id_status || !form.tahun_mulai} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Status
            </button>
          </div>
        </div>
      )}

      {/* Current Career */}
      {careerInfo && (
        <div className={`relative border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 mb-6 bg-white transition-all duration-300 ${showForm ? 'animate-in slide-in-from-top-4' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Status Karier</label>
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-primary">{career?.status || '-'}</div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Periode</label>
              {editingEndDate ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-primary">
                      {career?.tahun_mulai || '-'}
                    </div>
                    <span className="text-sm font-bold text-primary">-</span>
                    <input
                      type="number"
                      placeholder="2026"
                      value={endDateValue}
                      onChange={(e) => setEndDateValue(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    onClick={handleUpdateEndDate}
                    disabled={saving}
                    className="cursor-pointer flex items-center gap-1 px-3 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-[#2A3E3F] transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingEndDate(false);
                      setEndDateValue('');
                    }}
                    className="cursor-pointer p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-primary">
                    {career?.tahun_mulai || '-'} - {career?.tahun_selesai || 'Sekarang'}
                  </div>
                  {!career?.tahun_selesai && (
                    <button
                      onClick={() => setEditingEndDate(true)}
                      className="cursor-pointer flex items-center gap-1 px-3 py-3 bg-slate-100 text-primary rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                      title="Edit tahun selesai"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* TAMPILAN FIELD (JALUR MASUK DITAMBAHKAN KE COL-SPAN-2) */}
            {careerInfo.fields.map((field, index) => (
              <div key={index} className={field.label === 'Alamat' || field.label === 'Program Studi / Jurusan' || field.label === 'Jalur Masuk' ? 'sm:col-span-2' : ''}>
                <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
                  {field.label}
                </label>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-primary">
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!careerInfo && !showForm && (
        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 mb-6 bg-white text-center">
          <Briefcase size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400">Belum ada status karier. Klik "Tambahkan status baru" untuk memulai.</p>
        </div>
      )}

      {/* Show pending alert even when no riwayat exists */}
      {pendingAlert && riwayat.length === 0 && (
        <div className="mt-6 mb-4 bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in duration-300">
          <Clock size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-800 mb-1">Menunggu Verifikasi Admin</h3>
            <p className="text-xs text-amber-700/80 font-medium">
              Status karier baru Anda telah berhasil dikirim dan sedang dalam proses verifikasi oleh admin.
              Status akan diperbarui setelah disetujui.
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-green-500" />
                <span className="text-[11px] font-bold text-green-700">Data Terkirim</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-amber-500" />
                <span className="text-[11px] font-bold text-amber-700">Menunggu Review Admin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertCircle size={14} className="text-slate-300" />
                <span className="text-[11px] font-bold text-slate-400">Disetujui</span>
              </div>
            </div>
          </div>
          <button onClick={() => setPendingAlert(false)} className="text-amber-400 hover:text-amber-600 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {riwayat.length > 0 && (
        <div className="relative z-0 mt-8">
          {/* Pending Verification Alert */}
          {pendingAlert && (
            <div className="mb-4 bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in duration-300">
              <Clock size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-amber-800 mb-1">Menunggu Verifikasi Admin</h3>
                <p className="text-xs text-amber-700/80 font-medium">
                  Status karier baru Anda telah berhasil dikirim dan sedang dalam proses verifikasi oleh admin.
                  Status akan diperbarui setelah disetujui.
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="text-[11px] font-bold text-green-700">Data Terkirim</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-500" />
                    <span className="text-[11px] font-bold text-amber-700">Menunggu Review Admin</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-slate-300" />
                    <span className="text-[11px] font-bold text-slate-400">Disetujui</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setPendingAlert(false)} className="text-amber-400 hover:text-amber-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>
          )}
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
                if (item.kuliah.universitas?.nama) details.push({ label: 'Universitas', value: item.kuliah.universitas.nama });
                if (item.kuliah.jurusan_kuliah?.nama) details.push({ label: 'Program Studi', value: item.kuliah.jurusan_kuliah.nama });
                if (item.kuliah.jalur_masuk) details.push({ label: 'Jalur Masuk', value: item.kuliah.jalur_masuk });
              }
              else if (item.wirausaha) {
                title = 'Wirausaha';
                if (item.wirausaha.nama_usaha) details.push({ label: 'Nama Usaha', value: item.wirausaha.nama_usaha });
                if (item.wirausaha.bidang_usaha?.nama) details.push({ label: 'Bidang Usaha', value: item.wirausaha.bidang_usaha.nama });
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
      )}
    </div>
  );
}