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

  const navUser = {
    nama_alumni: profile?.nama || authUser?.profile?.nama || 'Alumni',
    foto: profile?.foto || authUser?.profile?.foto,
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

        <ProfileHeader profile={profile} onPerbarui={handlePerbarui} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* --- SIDEBAR KIRI (Dipanggil dari Komponen) --- */}
          <ProfileSidebar
            profile={profile}
            onRefresh={refreshProfile}
            onShowSuccess={showSuccess}
          />

          {/* --- KONTEN KANAN DENGAN TAB SPA --- */}
          <div className="lg:col-span-8 bg-white rounded-4xl shadow-sm flex flex-col overflow-hidden border border-slate-100">

            {/* Header Tabs */}
            <div className="flex border-b border-slate-100 px-2 overflow-x-auto hide-scrollbar">
              <button onClick={() => setActiveTab('detail')} className={`flex items-center gap-2 px-6 py-5 text-sm font-bold border-b-2 whitespace-nowrap cursor-pointer transition-all ${activeTab === 'detail' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-primary/70'}`}>
                <User size={16} /> Detail Pribadi
              </button>
              <button onClick={() => setActiveTab('karier')} className={`flex items-center gap-2 px-6 py-5 text-sm font-bold border-b-2 whitespace-nowrap cursor-pointer transition-all ${activeTab === 'karier' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-primary/70'}`}>
                <Briefcase size={16} /> Status Karier
              </button>
              <button onClick={() => setActiveTab('deskripsi_karier')} className={`flex items-center gap-2 px-6 py-5 text-sm font-bold border-b-2 whitespace-nowrap cursor-pointer transition-all ${activeTab === 'deskripsi_karier' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-primary/70'}`}>
                <FileText size={16} /> Deskripsi Karier
              </button>
              <button onClick={() => setActiveTab('keahlian')} className={`flex items-center gap-2 px-6 py-5 text-sm font-bold border-b-2 whitespace-nowrap cursor-pointer transition-all ${activeTab === 'keahlian' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-primary/70'}`}>
                <Award size={16} /> Keahlian
              </button>
              <button onClick={() => setActiveTab('portofolio')} className={`flex items-center gap-2 px-6 py-5 text-sm font-bold border-b-2 whitespace-nowrap cursor-pointer transition-all ${activeTab === 'portofolio' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-primary/70'}`}>
                <Layout size={16} /> Portofolio
              </button>
            </div>

            {/* Render Tab Konten Secara Dinamis */}
            {activeTab === 'detail' && <TabDetailPribadi profile={profile} onRefresh={refreshProfile} onShowSuccess={showSuccess} triggerEdit={triggerEdit} />}
            {activeTab === 'karier' && <TabStatusKarier profile={profile} onRefresh={refreshProfile} onShowSuccess={showSuccess} />}
            {activeTab === 'deskripsi_karier' && <TabDeskripsiKarier profile={profile} onRefresh={refreshProfile} onShowSuccess={showSuccess} />}
            {activeTab === 'keahlian' && <TabKeahlian profile={profile} onRefresh={refreshProfile} onShowSuccess={showSuccess} />}
            {activeTab === 'portofolio' && <TabPortofolio profile={profile} onRefresh={refreshProfile} onShowSuccess={showSuccess} />}

          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
}
