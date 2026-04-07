import React, { useState, useEffect } from 'react';
import { User, Briefcase, Award, Check, Layout, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';
import ProfileHeader from '../../components/alumni/ProfileHeader';
import ProfileSidebar from '../../components/alumni/ProfileSidebar';
import { alumniApi } from '../../api/alumni';
import { useAuth } from '../../context/AuthContext';

// Import Komponen Tab
import TabDetailPribadi from '../../components/alumni/TabDetailPribadi';
import TabStatusKarier from '../../components/alumni/TabStatusKarier';
import TabDeskripsiKarier from '../../components/alumni/TabDeskripsiKarier';
import TabKeahlian from '../../components/alumni/TabKeahlian';
import { ProfilSkeleton } from '../../components/alumni/skeleton';
import TabPortofolio from '../../components/alumni/TabPortofolio';

function buildDisplayProfile(profile) {
  if (!profile) return profile;
  const latest = profile.latest_personal_info;
  if (!latest || typeof latest !== 'object') return profile;

  const next = { ...profile };

  // Map latest personal info payload ke frontend keys
  // (latest sudah berisi data merged: approved + pending override dari backend)
  if (latest.nama_alumni ?? latest.nama) next.nama = latest.nama_alumni ?? latest.nama;
  if (latest.nis !== undefined) next.nis = latest.nis;
  if (latest.nisn !== undefined) next.nisn = latest.nisn;
  if (latest.tempat_lahir !== undefined) next.tempat_lahir = latest.tempat_lahir;
  if (latest.tanggal_lahir !== undefined) next.tanggal_lahir = latest.tanggal_lahir;
  if (latest.jenis_kelamin !== undefined) next.jenis_kelamin = latest.jenis_kelamin;
  if (latest.alamat !== undefined) next.alamat = latest.alamat;
  if (latest.no_hp !== undefined) next.no_hp = latest.no_hp;
  if (latest.tahun_masuk !== undefined) next.tahun_masuk = latest.tahun_masuk;
  if (latest.foto !== undefined) next.foto = latest.foto;
  if (latest.foto_path !== undefined) next.foto = latest.foto_path;

  // Teruskan latest_personal_info AS-IS agar TabDetailPribadi bisa menggunakannya
  // Pastikan changed_fields tersedia (backend mengirim sebagai 'changed_fields')
  next.latest_personal_info = {
    ...latest,
    changed_fields: latest.changed_fields || latest.pending_fields || [],
    pending_update_id: latest.pending_update_id || latest.pending_id || null,
  };

  // Legacy keys untuk komponen lama (ProfileSidebar, dll.)
  next.latest_pending_fields = next.latest_personal_info.changed_fields;
  next.latest_personal_info_status = latest.status || null;
  next.latest_personal_info_pending_id = next.latest_personal_info.pending_update_id;

  return next;
}

export default function Profil() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  // State Global Profil
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // State Navigasi Tab SPA
  const [activeTab, setActiveTab] = useState('detail');
  const [triggerEdit, setTriggerEdit] = useState(false);

  function handlePerbarui() {
    setActiveTab('detail');
    setTriggerEdit(prev => !prev);
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await alumniApi.getProfile();
      setProfile(res.data.data);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  }

  // Refresh profil tanpa skeleton (agar tab tidak unmount dan local state tidak hilang)
  async function refreshProfile() {
    try {
      const res = await alumniApi.getProfile();
      setProfile(res.data.data);
    } catch (err) {
      console.error('Failed to refresh profile', err);
    }
  }

  function showSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  const displayProfile = buildDisplayProfile(profile);

  const navUser = {
    nama_alumni: displayProfile?.nama || authUser?.profile?.nama || 'Alumni',
    foto: displayProfile?.foto || authUser?.profile?.foto,
    can_access_all: true
  };

  if (loading) return <ProfilSkeleton />;

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">

      <main className="flex-1 w-full mt-5 max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-16">

        {/* Notifikasi Sukses Melayang */}
        {successMsg && (
          <div className="fixed top-20 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2">
            <Check size={16} /> {successMsg}
          </div>
        )}

        <ProfileHeader profile={displayProfile} onPerbarui={handlePerbarui} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <ProfileSidebar
            profile={displayProfile}
            onRefresh={refreshProfile}
            onShowSuccess={showSuccess}
          />
          <div className="lg:col-span-8 bg-white rounded-4xl shadow-sm flex flex-col overflow-hidden border border-slate-100">

            <div className="flex border-b border-slate-100 px-2 overflow-x-auto md:overflow-x-hidden whitespace-nowrap scrollbar-hide">
              <button
                onClick={() => setActiveTab('detail')}
                className={`flex shrink-0 items-center gap-2 px-6 py-5 text-sm font-bold sm:border-b-2 whitespace-nowrap cursor-pointer transition-all ${activeTab === 'detail' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-primary/70'}`}
              >
                <User size={16} /> Detail Pribadi
              </button>

              <button
                onClick={() => setActiveTab('karier')}
                className={`flex shrink-0 items-center gap-2 px-6 py-5 text-sm font-bold sm:border-b-2 whitespace-nowrap cursor-pointer transition-all ${activeTab === 'karier' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-primary/70'}`}
              >
                <Briefcase size={16} /> Status Karier
              </button>
              <button onClick={() => setActiveTab('deskripsi_karier')} className={`flex shrink-0  items-center gap-2 px-6 py-5 text-sm font-bold sm:border-b-2 whitespace-nowrap cursor-pointer transition-all ${activeTab === 'deskripsi_karier' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-primary/70'}`}>
                <FileText size={16} /> Deskripsi Karier
              </button>
              <button onClick={() => setActiveTab('keahlian')} className={`flex shrink-0  items-center gap-2 px-6 py-5 text-sm font-bold sm:border-b-2 whitespace-nowrap cursor-pointer transition-all ${activeTab === 'keahlian' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-primary/70'}`}>
                <Award size={16} /> Keahlian
              </button>
              <button onClick={() => setActiveTab('portofolio')} className={`flex shrink-0  items-center gap-2 px-6 py-5 text-sm font-bold sm:border-b-2 whitespace-nowrap cursor-pointer transition-all ${activeTab === 'portofolio' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-primary/70'}`}>
                <Layout size={16} /> Portofolio
              </button>
            </div>

            {/* Render Tab Konten Secara Dinamis */}
            {activeTab === 'detail' && <TabDetailPribadi profile={displayProfile} onRefresh={refreshProfile} onShowSuccess={showSuccess} triggerEdit={triggerEdit} />}
            {activeTab === 'karier' && <TabStatusKarier profile={displayProfile} onRefresh={refreshProfile} onShowSuccess={showSuccess} />}
            {activeTab === 'deskripsi_karier' && <TabDeskripsiKarier profile={displayProfile} onRefresh={refreshProfile} onShowSuccess={showSuccess} />}
            {activeTab === 'keahlian' && <TabKeahlian profile={displayProfile} onRefresh={refreshProfile} onShowSuccess={showSuccess} />}
            {activeTab === 'portofolio' && <TabPortofolio profile={displayProfile} onRefresh={refreshProfile} onShowSuccess={showSuccess} />}

          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
}
