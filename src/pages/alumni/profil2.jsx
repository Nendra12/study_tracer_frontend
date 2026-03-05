import React, { useState, useEffect } from 'react';
import { 
  Eye, Edit, AlertCircle, Mail, Phone, Plus, User, Briefcase, Award, ChevronDown, Loader2, Save, X, Check
} from 'lucide-react';
import { FaLinkedin, FaGithub, FaInstagram, FaFacebook, FaGlobe } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';
import { alumniApi } from '../../api/alumni';
import { masterDataApi } from '../../api/masterData';
import { STORAGE_BASE_URL } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

function displayUrl(url) {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '');
}

export default function Profil2() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form tambah status baru
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Master data
  const [statusList, setStatusList] = useState([]);
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [bidangUsahaList, setBidangUsahaList] = useState([]);
  const [jurusanKuliahList, setJurusanKuliahList] = useState([]);

  // Form state
  const [form, setForm] = useState({
    id_status: '',
    tahun_mulai: '',
    tahun_selesai: '',
    // Bekerja
    posisi: '',
    nama_perusahaan: '',
    id_kota: '',
    id_provinsi: '',
    jalan: '',
    // Kuliah
    nama_universitas: '',
    id_jurusanKuliah: '',
    jalur_masuk: '',
    jenjang: '',
    // Wirausaha
    id_bidang: '',
    nama_usaha: '',
  });

  useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await alumniApi.getProfile();
      setProfile(res.data.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.response?.data?.message || 'Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  }

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
    } catch (err) {
      console.error('Failed to load master data:', err);
    }
  }

  async function loadKota(idProvinsi) {
    try {
      const res = await masterDataApi.getKota(idProvinsi);
      setKotaList(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load kota:', err);
    }
  }

  function handleOpenForm() {
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

  // Get selected status name
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

      if (statusName.includes('kerja') || statusName.includes('bekerja')) {
        payload.pekerjaan = {
          posisi: form.posisi,
          nama_perusahaan: form.nama_perusahaan,
          id_kota: form.id_kota,
          jalan: form.jalan,
        };
      } else if (statusName.includes('kuliah')) {
        payload.universitas = {
          nama_universitas: form.nama_universitas,
          id_jurusanKuliah: form.id_jurusanKuliah,
          jalur_masuk: form.jalur_masuk,
          jenjang: form.jenjang,
        };
      } else if (statusName.includes('wirausaha') || statusName.includes('usaha')) {
        payload.wirausaha = {
          id_bidang: form.id_bidang,
          nama_usaha: form.nama_usaha,
        };
      }

      await alumniApi.updateCareerStatus(payload);
      setShowForm(false);
      setSuccessMsg('Status karier berhasil ditambahkan');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchProfile();
    } catch (err) {
      console.error('Failed to save career status:', err);
      alert('Gagal menyimpan status: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }

  const navUser = {
    nama_alumni: profile?.nama || authUser?.alumni?.nama_alumni || 'Alumni',
    foto: profile?.foto || authUser?.alumni?.foto,
    can_access_all: true,
  };

  const fotoUrl = profile?.foto ? getImageUrl(profile.foto) : null;
  const career = profile?.current_career;
  const riwayat = profile?.riwayat_status || [];

  const socialLinks = [];
  if (profile?.linkedin) socialLinks.push({ name: 'LinkedIn', url: profile.linkedin, icon: <FaLinkedin size={16} /> });
  if (profile?.github) socialLinks.push({ name: 'GitHub', url: profile.github, icon: <FaGithub size={16} /> });
  if (profile?.instagram) socialLinks.push({ name: 'Instagram', url: profile.instagram, icon: <FaInstagram size={16} /> });
  if (profile?.facebook) socialLinks.push({ name: 'Facebook', url: profile.facebook, icon: <FaFacebook size={16} /> });
  if (profile?.website) socialLinks.push({ name: 'Website', url: profile.website, icon: <FaGlobe size={16} /> });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
        <Navbar user={navUser} />
        <div className="flex-1 flex items-center justify-center"><Loader2 size={36} className="animate-spin text-[#3C5759]/40" /></div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
        <Navbar user={navUser} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-700 mb-2">Gagal Memuat Profil</h2>
            <p className="text-slate-500 text-sm mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-[#3C5759] text-white px-6 py-2 rounded-xl text-sm font-bold cursor-pointer">Coba Lagi</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Helper to get career display text
  function getCareerDisplayInfo() {
    if (!career) return null;
    const status = career.status || '';
    if (career.pekerjaan) {
      return {
        posisi: career.pekerjaan.posisi || '-',
        perusahaan: career.pekerjaan.perusahaan || '-',
        kota: career.pekerjaan.kota || '-',
        provinsi: career.pekerjaan.provinsi || '-',
      };
    }
    if (career.kuliah) {
      return {
        posisi: career.kuliah.jenjang ? `Mahasiswa ${career.kuliah.jenjang}` : 'Mahasiswa',
        perusahaan: career.kuliah.universitas || '-',
        kota: career.kuliah.jurusan_kuliah || '-',
        provinsi: career.kuliah.jalur_masuk || '-',
      };
    }
    if (career.wirausaha) {
      return {
        posisi: 'Wirausaha',
        perusahaan: career.wirausaha.nama_usaha || '-',
        kota: career.wirausaha.bidang_usaha || '-',
        provinsi: '-',
      };
    }
    return null;
  }

  const careerInfo = getCareerDisplayInfo();

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-28 pb-16">
        
        {successMsg && (
          <div className="fixed top-20 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2">
            <Check size={16} /> {successMsg}
          </div>
        )}

        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#3C5759] tracking-tight mb-1">Profil Saya</h1>
            <p className="text-[#3C5759]/70 text-sm font-medium">Kelola informasi pribadi dan pencapaian karier Anda</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#3C5759]/20 text-[#3C5759] rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
              <Eye size={16} /> Lihat Profil Publik
            </button>
            <button onClick={() => navigate('/profil')} className="flex items-center gap-2 px-5 py-2.5 bg-[#3C5759] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer">
              <Edit size={16} /> Perbarui Profil
            </button>
          </div>
        </div>

        {/* --- ALERT BOX --- */}
        <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3 mb-8 shadow-sm">
          <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-800 mb-0.5">Kebijakan Pembaruan</h3>
            <p className="text-xs text-amber-700/80 font-medium">Pembaruan pada profil Anda memerlukan persetujuan Admin dan tidak akan langsung ditampilkan di direktori publik</p>
          </div>
        </div>

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- SIDEBAR KIRI --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm text-center">
              <div className="relative w-32 h-32 mx-auto mb-5">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
                  {fotoUrl ? (
                    <img src={fotoUrl} alt={profile?.nama} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#3C5759]/20 bg-[#3C5759]/5">
                      {profile?.nama?.charAt(0) || 'A'}
                    </div>
                  )}
                </div>
              </div>
              <h2 className="text-xl font-black text-[#3C5759] mb-1">{profile?.nama || '-'}</h2>
              <p className="text-sm font-semibold text-[#3C5759]/60 mb-6">Angkatan {profile?.tahun_masuk || '-'} • {profile?.jurusan?.nama || '-'}</p>
              <div className="space-y-3 pt-6 border-t border-slate-100 text-left">
                <div className="flex items-center gap-3 text-[#3C5759]/70">
                  <Mail size={16} className="shrink-0" />
                  <span className="text-sm font-medium truncate">{profile?.email || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-[#3C5759]/70">
                  <Phone size={16} className="shrink-0" />
                  <span className="text-sm font-medium">{profile?.no_hp || '-'}</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-base font-black text-[#3C5759] mb-5">Tautan Sosial</h3>
              <div className="space-y-4 mb-6">
                {socialLinks.length > 0 ? socialLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3 text-[#3C5759]/70 truncate pr-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">{link.icon}</div>
                      <span className="text-sm font-medium truncate">{displayUrl(link.url)}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 font-medium">Belum ada tautan sosial</p>
                )}
              </div>
            </div>
          </div>

          {/* --- KONTEN KANAN --- */}
          <div className="lg:col-span-8 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            
            {/* TABS */}
            <div className="flex border-b border-slate-100 px-2 overflow-x-auto hide-scrollbar">
              <button onClick={() => navigate('/profil')} className={`flex items-center gap-2 px-6 py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${location.pathname === '/profil' ? 'border-[#3C5759] text-[#3C5759]' : 'border-transparent text-slate-400 hover:text-[#3C5759]/70 hover:bg-slate-50'}`}>
                <User size={16} /> Detail Pribadi
              </button>
              <button onClick={() => navigate('/profil2')} className={`flex items-center gap-2 px-6 py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${location.pathname === '/profil2' ? 'border-[#3C5759] text-[#3C5759]' : 'border-transparent text-slate-400 hover:text-[#3C5759]/70 hover:bg-slate-50'}`}>
                <Briefcase size={16} /> Status Karier
              </button>
              <button onClick={() => navigate('/profil3')} className={`flex items-center gap-2 px-6 py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${location.pathname === '/profil3' ? 'border-[#3C5759] text-[#3C5759]' : 'border-transparent text-slate-400 hover:text-[#3C5759]/70 hover:bg-slate-50'}`}>
                <Award size={16} /> Keahlian
              </button>
            </div>

            {/* CONTENT KARIER */}
            <div className="p-8 md:p-10 flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-[#3C5759]">
                  <Briefcase size={20} />
                  <h2 className="text-lg font-black">Status Karier Saat Ini</h2>
                </div>
                {!showForm && (
                  <button onClick={handleOpenForm} className="flex items-center gap-1 text-xs font-bold text-[#3C5759] hover:underline cursor-pointer">
                    <Plus size={14} /> Tambahkan status baru
                  </button>
                )}
              </div>

              {/* Current Career Display */}
              {careerInfo && !showForm && (
                <div className="border-2 border-dashed border-slate-200 rounded-[1.5rem] p-6 mb-6 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Status</label>
                      <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759]">{career?.status || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Posisi / Judul</label>
                      <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759]">{careerInfo.posisi}</div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Perusahaan / Institusi</label>
                      <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759]">{careerInfo.perusahaan}</div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Periode</label>
                      <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759]">{career?.tahun_mulai || '-'} - {career?.tahun_selesai || 'Sekarang'}</div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Kota / Detail</label>
                      <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759]">{careerInfo.kota}</div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Provinsi</label>
                      <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759]">{careerInfo.provinsi}</div>
                    </div>
                  </div>
                </div>
              )}

              {!careerInfo && !showForm && (
                <div className="border-2 border-dashed border-slate-200 rounded-[1.5rem] p-8 mb-6 bg-white text-center">
                  <Briefcase size={32} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">Belum ada status karier. Klik "Tambahkan status baru" untuk memulai.</p>
                </div>
              )}

              {/* Form Tambah Status Baru */}
              {showForm && (
                <div className="border-2 border-[#3C5759]/30 rounded-[1.5rem] p-6 mb-6 bg-[#3C5759]/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-[#3C5759]">Tambahkan Status Baru</h3>
                    <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Status */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Status</label>
                      <div className="relative">
                        <select value={form.id_status} onChange={(e) => setForm(prev => ({ ...prev, id_status: e.target.value }))} className="w-full bg-white border border-[#3C5759]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] appearance-none focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20">
                          <option value="">Pilih Status</option>
                          {statusList.map(st => (
                            <option key={st.id} value={st.id}>{st.nama || st.nama_status}</option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3C5759]/50 pointer-events-none" />
                      </div>
                    </div>

                    {/* Tahun Mulai / Selesai */}
                    <div>
                      <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Tahun Mulai</label>
                      <input type="number" placeholder="2024" value={form.tahun_mulai} onChange={(e) => setForm(prev => ({ ...prev, tahun_mulai: e.target.value }))} className="w-full bg-white border border-[#3C5759]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Tahun Selesai <span className="lowercase normal-case font-medium">(opsional)</span></label>
                      <input type="number" placeholder="2025" value={form.tahun_selesai} onChange={(e) => setForm(prev => ({ ...prev, tahun_selesai: e.target.value }))} className="w-full bg-white border border-[#3C5759]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20" />
                    </div>

                    {/* Dynamic fields based on status */}
                    {(statusName.includes('kerja') || statusName.includes('bekerja')) && (
                      <>
                        <div>
                          <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Posisi / Judul Job</label>
                          <input type="text" placeholder="Software Engineer" value={form.posisi} onChange={(e) => setForm(prev => ({ ...prev, posisi: e.target.value }))} className="w-full bg-white border border-[#3C5759]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Nama Perusahaan</label>
                          <input type="text" placeholder="PT. Contoh Perusahaan" value={form.nama_perusahaan} onChange={(e) => setForm(prev => ({ ...prev, nama_perusahaan: e.target.value }))} className="w-full bg-white border border-[#3C5759]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Provinsi</label>
                          <div className="relative">
                            <select value={form.id_provinsi} onChange={handleProvinsiChange} className="w-full bg-white border border-[#3C5759]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] appearance-none focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20">
                              <option value="">Pilih Provinsi</option>
                              {provinsiList.map(p => (
                                <option key={p.id} value={p.id}>{p.nama || p.nama_provinsi}</option>
                              ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3C5759]/50 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Kota</label>
                          <div className="relative">
                            <select value={form.id_kota} onChange={(e) => setForm(prev => ({ ...prev, id_kota: e.target.value }))} className="w-full bg-white border border-[#3C5759]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] appearance-none focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20" disabled={!form.id_provinsi}>
                              <option value="">Pilih Kota</option>
                              {kotaList.map(k => (
                                <option key={k.id} value={k.id}>{k.nama || k.nama_kota}</option>
                              ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3C5759]/50 pointer-events-none" />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Alamat / Jalan <span className="lowercase normal-case font-medium">(opsional)</span></label>
                          <input type="text" placeholder="Jl. Contoh No. 123" value={form.jalan} onChange={(e) => setForm(prev => ({ ...prev, jalan: e.target.value }))} className="w-full bg-white border border-[#3C5759]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20" />
                        </div>
                      </>
                    )}

                    {statusName.includes('kuliah') && (
                      <>
                        <div>
                          <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Nama Universitas</label>
                          <input type="text" placeholder="Universitas Contoh" value={form.nama_universitas} onChange={(e) => setForm(prev => ({ ...prev, nama_universitas: e.target.value }))} className="w-full bg-white border border-[#3C5759]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Jurusan Kuliah</label>
                          <div className="relative">
                            <select value={form.id_jurusanKuliah} onChange={(e) => setForm(prev => ({ ...prev, id_jurusanKuliah: e.target.value }))} className="w-full bg-white border border-[#3C5759]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] appearance-none focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20">
                              <option value="">Pilih Jurusan</option>
                              {jurusanKuliahList.map(j => (
                                <option key={j.id} value={j.id}>{j.nama || j.nama_jurusan}</option>
                              ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3C5759]/50 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Jenjang</label>
                          <div className="relative">
                            <select value={form.jenjang} onChange={(e) => setForm(prev => ({ ...prev, jenjang: e.target.value }))} className="w-full bg-white border border-[#3C5759]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] appearance-none focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20">
                              <option value="">Pilih Jenjang</option>
                              <option value="D3">D3</option>
                              <option value="D4">D4</option>
                              <option value="S1">S1</option>
                              <option value="S2">S2</option>
                              <option value="S3">S3</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3C5759]/50 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Jalur Masuk</label>
                          <div className="relative">
                            <select value={form.jalur_masuk} onChange={(e) => setForm(prev => ({ ...prev, jalur_masuk: e.target.value }))} className="w-full bg-white border border-[#3C5759]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] appearance-none focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20">
                              <option value="">Pilih Jalur</option>
                              <option value="SNBP">SNBP</option>
                              <option value="SNBT">SNBT</option>
                              <option value="Mandiri">Mandiri</option>
                              <option value="Prestasi">Prestasi</option>
                              <option value="Lainnya">Lainnya</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3C5759]/50 pointer-events-none" />
                          </div>
                        </div>
                      </>
                    )}

                    {(statusName.includes('wirausaha') || statusName.includes('usaha')) && (
                      <>
                        <div>
                          <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Nama Usaha</label>
                          <input type="text" placeholder="Nama Usaha Anda" value={form.nama_usaha} onChange={(e) => setForm(prev => ({ ...prev, nama_usaha: e.target.value }))} className="w-full bg-white border border-[#3C5759]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Bidang Usaha</label>
                          <div className="relative">
                            <select value={form.id_bidang} onChange={(e) => setForm(prev => ({ ...prev, id_bidang: e.target.value }))} className="w-full bg-white border border-[#3C5759]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] appearance-none focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20">
                              <option value="">Pilih Bidang</option>
                              {bidangUsahaList.map(b => (
                                <option key={b.id} value={b.id}>{b.nama || b.nama_bidang}</option>
                              ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3C5759]/50 pointer-events-none" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Save / Cancel */}
                  <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#3C5759]/10">
                    <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer">
                      Batal
                    </button>
                    <button onClick={handleSave} disabled={saving || !form.id_status || !form.tahun_mulai} className="flex items-center gap-2 px-5 py-2.5 bg-[#3C5759] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer disabled:opacity-50">
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Status
                    </button>
                  </div>
                </div>
              )}

              {/* Riwayat */}
              {riwayat.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-black text-[#3C5759]/60 uppercase tracking-widest mb-4">Riwayat Status</h3>
                  <div className="space-y-4">
                    {riwayat.map((item) => {
                      let title = item.status?.nama || '-';
                      let subtitle = '';
                      let location = '';

                      if (item.pekerjaan) {
                        title = item.pekerjaan.posisi || title;
                        subtitle = item.pekerjaan.perusahaan?.nama || '';
                        const kota = item.pekerjaan.perusahaan?.kota || '';
                        const prov = item.pekerjaan.perusahaan?.provinsi || '';
                        location = [kota, prov].filter(Boolean).join(', ');
                      } else if (item.kuliah) {
                        title = item.kuliah.jenjang ? `Mahasiswa ${item.kuliah.jenjang}` : (item.status?.nama || 'Kuliah');
                        subtitle = item.kuliah.universitas?.nama || '';
                        location = item.kuliah.jurusan_kuliah?.nama || '';
                      } else if (item.wirausaha) {
                        title = 'Wirausaha';
                        subtitle = item.wirausaha.nama_usaha || '';
                        location = item.wirausaha.bidang_usaha?.nama || '';
                      }

                      const periode = `${item.tahun_mulai || '-'} - ${item.tahun_selesai || 'Sekarang'}`;

                      return (
                        <div key={item.id} className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-[15px] font-black text-[#3C5759] mb-1">{title}</h3>
                            {subtitle && <p className="text-sm font-semibold text-[#3C5759]/60">{subtitle}</p>}
                            {location && <p className="text-sm font-semibold text-[#3C5759]/60">{location}</p>}
                          </div>
                          <div className="bg-white border border-slate-200 px-4 py-1.5 rounded-full text-xs font-black text-[#3C5759]/60 shrink-0 shadow-sm self-start sm:self-center">
                            {periode}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <style dangerouslySetInnerHTML={{__html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
}