import React, { useState } from 'react';
import { Briefcase, Plus, X, ChevronDown, Loader2, Save, Clock, CheckCircle2, AlertCircle, Edit2 } from 'lucide-react';
import { alumniApi } from '../../api/alumni';
import { masterDataApi } from '../../api/masterData';

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

  const [form, setForm] = useState({
    id_status: '', tahun_mulai: '', tahun_selesai: '',
    posisi: '', nama_perusahaan: '', id_kota: '', id_provinsi: '', jalan: '',
    nama_universitas: '', id_jurusanKuliah: '', jalur_masuk: '', jenjang: '',
    id_bidang: '', nama_usaha: ''
  });

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
    try {
      const res = await masterDataApi.getKota(idProvinsi);
      setKotaList(res.data.data || res.data || []);
    } catch (err) { console.error('Failed to load kota:', err); }
  }

  function handleOpenForm() {
    // Cek apakah karir saat ini masih berjalan (tahun_selesai null)
    if (career && !career.tahun_selesai) {
      alert('Anda harus mengisi tanggal berakhir pada karir saat ini terlebih dahulu sebelum menambahkan status karir baru.');
      return;
    }
    setShowForm(true);
    setForm({ id_status: '', tahun_mulai: '', tahun_selesai: '', posisi: '', nama_perusahaan: '', id_kota: '', id_provinsi: '', jalan: '', nama_universitas: '', id_jurusanKuliah: '', jalur_masuk: '', jenjang: '', id_bidang: '', nama_usaha: '' });
    loadMasterData();
  }

  function handleProvinsiChange(e) {
    const val = e.target.value;
    setForm(prev => ({ ...prev, id_provinsi: val, id_kota: '' }));
    if (val) loadKota(val);
    else setKotaList([]);
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

      // Add career-specific data based on type
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

      // Use PUT endpoint to update existing career status directly
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

  // console.log(profile)
  const career = profile?.current_career;
  // Deduplicate riwayat by id to prevent double entries
  const rawRiwayat = profile?.riwayat_status || [];
  const riwayat = rawRiwayat
    .filter((item, index, self) => index === self.findIndex(r => r.id === item.id))
    .filter((item) => {
      // Exclude the current career from riwayat (it's already shown in "Status Saat Ini")
      if (!career) return true;
      // Match by comparing key fields
      if (career.status && item.status?.nama === career.status &&
        item.tahun_mulai === career.tahun_mulai) {
        // Further check: compare detail fields
        if (career.pekerjaan && item.pekerjaan) {
          return !(item.pekerjaan.posisi === career.pekerjaan.posisi);
        }
        if (career.kuliah && item.kuliah) {
          return !(item.kuliah.universitas?.nama === career.kuliah.universitas);
        }
        if (career.wirausaha && item.wirausaha) {
          return !(item.wirausaha.nama_usaha === career.wirausaha.nama_usaha);
        }
        // If status matches but no detail to compare, exclude (it's likely the same)
        if (!item.pekerjaan && !item.kuliah && !item.wirausaha) return false;
      }
      return true;
    });

  function getCareerDisplayInfo() {
    if (!career) return null;

    // Untuk Bekerja/Kerja
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

    // Untuk Kuliah
    if (career.kuliah) {
      return {
        type: 'kuliah',
        fields: [
          { label: 'Jenjang', value: career.kuliah.jenjang || '-' },
          { label: 'Universitas', value: career.kuliah.universitas || '-' },
          { label: 'Program Studi / Jurusan', value: career.kuliah.jurusan_kuliah.nama || '-' },
          { label: 'Jalur Masuk', value: career.kuliah.jalur_masuk || '-' }
        ]
      };
    }

    // Untuk Wirausaha
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
  // console.log("rir karir", career)

  return (
    <div className="p-8 md:p-10 flex-1 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-primary">
          <Briefcase size={20} />
          <h2 className="text-lg font-black">Status Karier Saat Ini</h2>
        </div>
        {!showForm && (
          <div className="relative group">
            <button
              onClick={handleOpenForm}
              className={`flex items-center gap-1 text-xs font-bold transition-all ${career && !career.tahun_selesai
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-primary hover:underline cursor-pointer'
                }`}
              disabled={career && !career.tahun_selesai}
            >
              <Plus size={14} /> Tambahkan status baru
            </button>
            {career && !career.tahun_selesai && (
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

      {/* Form Tambah Status - Muncul di atas dengan animasi */}
      {showForm && (
        <div className="border-2 border-primary/30 rounded-3xl p-6 mb-6 bg-primary/5 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-primary">Tambahkan Status Baru</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Status</label>
              <div className="relative">
                <select value={form.id_status} onChange={(e) => setForm(prev => ({ ...prev, id_status: e.target.value }))} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Pilih Status</option>
                  {statusList.map(st => <option key={st.id} value={st.id}>{st.nama || st.nama_status}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Tahun Mulai</label>
              <input type="number" placeholder="2024" value={form.tahun_mulai} onChange={(e) => setForm(prev => ({ ...prev, tahun_mulai: e.target.value }))} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Tahun Selesai <span className="normal-case font-medium">(opsional)</span></label>
              <input type="number" placeholder="2025" value={form.tahun_selesai} onChange={(e) => setForm(prev => ({ ...prev, tahun_selesai: e.target.value }))} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            {!statusName.includes('belum') && (statusName.includes('kerja') || statusName.includes('bekerja')) && (
              <>
                <div>
                  <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Posisi / Judul Job</label>
                  <input type="text" placeholder="Software Engineer" value={form.posisi} onChange={(e) => setForm(prev => ({ ...prev, posisi: e.target.value }))} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Nama Perusahaan</label>
                  <input type="text" placeholder="PT. Contoh Perusahaan" value={form.nama_perusahaan} onChange={(e) => setForm(prev => ({ ...prev, nama_perusahaan: e.target.value }))} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Provinsi</label>
                  <div className="relative">
                    <select value={form.id_provinsi} onChange={handleProvinsiChange} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">Pilih Provinsi</option>
                      {provinsiList.map(p => <option key={p.id} value={p.id}>{p.nama || p.nama_provinsi}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Kota</label>
                  <div className="relative">
                    <select value={form.id_kota} onChange={(e) => setForm(prev => ({ ...prev, id_kota: e.target.value }))} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20" disabled={!form.id_provinsi}>
                      <option value="">Pilih Kota</option>
                      {kotaList.map(k => <option key={k.id} value={k.id}>{k.nama || k.nama_kota}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Alamat / Jalan <span className="normal-case font-medium">(opsional)</span></label>
                  <input type="text" placeholder="Jl. Contoh No. 123" value={form.jalan} onChange={(e) => setForm(prev => ({ ...prev, jalan: e.target.value }))} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </>
            )}

            {statusName.includes('kuliah') && (
              <>
                <div>
                  <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Nama Universitas</label>
                  <input type="text" placeholder="Universitas Contoh" value={form.nama_universitas} onChange={(e) => setForm(prev => ({ ...prev, nama_universitas: e.target.value }))} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Jurusan Kuliah</label>
                  <div className="relative">
                    <select value={form.id_jurusanKuliah} onChange={(e) => setForm(prev => ({ ...prev, id_jurusanKuliah: e.target.value }))} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">Pilih Jurusan</option>
                      {jurusanKuliahList.map(j => <option key={j.id} value={j.id}>{j.nama || j.nama_jurusan}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Jenjang</label>
                  <div className="relative">
                    <select value={form.jenjang} onChange={(e) => setForm(prev => ({ ...prev, jenjang: e.target.value }))} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">Pilih Jenjang</option>
                      <option value="D3">D3</option><option value="D4">D4</option><option value="S1">S1</option><option value="S2">S2</option><option value="S3">S3</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Jalur Masuk</label>
                  <div className="relative">
                    <select value={form.jalur_masuk} onChange={(e) => setForm(prev => ({ ...prev, jalur_masuk: e.target.value }))} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">Pilih Jalur</option>
                      <option value="SNBP">SNBP</option><option value="SNBT">SNBT</option><option value="Mandiri">Mandiri</option><option value="Prestasi">Prestasi</option><option value="Lainnya">Lainnya</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                  </div>
                </div>
              </>
            )}

            {(statusName.includes('wirausaha') || statusName.includes('usaha')) && (
              <>
                <div>
                  <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Nama Usaha</label>
                  <input type="text" placeholder="Nama Usaha Anda" value={form.nama_usaha} onChange={(e) => setForm(prev => ({ ...prev, nama_usaha: e.target.value }))} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Bidang Usaha</label>
                  <div className="relative">
                    <select value={form.id_bidang} onChange={(e) => setForm(prev => ({ ...prev, id_bidang: e.target.value }))} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">Pilih Bidang</option>
                      {bidangUsahaList.map(b => <option key={b.id} value={b.id}>{b.nama || b.nama_bidang}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                  </div>
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

      {/* Current Career - Dengan animasi slide down ketika form dibuka */}
      {careerInfo && (
        <div className={`border-2 border-dashed border-slate-200 rounded-3xl p-6 mb-6 bg-white transition-all duration-300 ${showForm ? 'animate-in slide-in-from-top-4' : ''}`}>
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
                      type="text"
                      placeholder="2026"
                      value={endDateValue}
                      onChange={(e) => setEndDateValue(e.target.value)}
                      className="flex-1 bg-white border-2 border-primary/30 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    onClick={handleUpdateEndDate}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-[#2A3E3F] transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingEndDate(false);
                      setEndDateValue('');
                    }}
                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
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
                      className="flex items-center gap-1 px-3 py-3 bg-slate-100 text-primary rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                      title="Edit tahun selesai"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Tampilkan field sesuai dengan jenis karir */}
            {careerInfo.fields.map((field, index) => (
              <div key={index} className={field.label === 'Alamat' || field.label === 'Program Studi / Jurusan' ? 'sm:col-span-2' : ''}>
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
        <div className="mt-6">
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

              // Untuk Pekerjaan
              if (item.pekerjaan) {
                title = item.pekerjaan.posisi || title;
                if (item.pekerjaan.perusahaan?.nama) details.push({ label: 'Perusahaan', value: item.pekerjaan.perusahaan.nama });
                const lokasi = [item.pekerjaan.perusahaan?.kota, item.pekerjaan.perusahaan?.provinsi].filter(Boolean).join(', ');
                if (lokasi) details.push({ label: 'Lokasi', value: lokasi });
              }
              // Untuk Kuliah
              else if (item.kuliah) {
                title = item.kuliah.jenjang ? `Mahasiswa ${item.kuliah.jenjang}` : (item.status?.nama || 'Kuliah');
                if (item.kuliah.universitas?.nama) details.push({ label: 'Universitas', value: item.kuliah.universitas.nama });
                if (item.kuliah.jurusan_kuliah?.nama) details.push({ label: 'Program Studi', value: item.kuliah.jurusan_kuliah.nama });
                if (item.kuliah.jalur_masuk) details.push({ label: 'Jalur Masuk', value: item.kuliah.jalur_masuk });
              }
              // Untuk Wirausaha
              else if (item.wirausaha) {
                title = 'Wirausaha';
                if (item.wirausaha.nama_usaha) details.push({ label: 'Nama Usaha', value: item.wirausaha.nama_usaha });
                if (item.wirausaha.bidang_usaha?.nama) details.push({ label: 'Bidang Usaha', value: item.wirausaha.bidang_usaha.nama });
              }

              const periode = `${item.tahun_mulai || '-'} - ${item.tahun_selesai || 'Sekarang'}`;

              return (
                <div key={item.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-[15px] font-black text-primary mb-2">{title}</h3>
                    {details.length > 0 && (
                      <div className="space-y-1">
                        {details.map((detail, idx) => (
                          <p key={idx} className="text-sm font-medium text-primary/70">
                            <span className="font-black text-primary/50">{detail.label}:</span> {detail.value}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-white border border-slate-200 px-4 py-1.5 rounded-full text-xs font-black text-primary/60 shrink-0 shadow-sm self-start sm:self-center">
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