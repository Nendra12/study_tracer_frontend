import React, { useState, useEffect } from 'react';
import { User, Briefcase, Award, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';
import ProfileHeader from '../../components/alumni/ProfileHeader';
import ProfileSidebar from '../../components/alumni/ProfileSidebar'; // <--- IMPORT KOMPONEN SIDEBAR
import { alumniApi } from '../../api/alumni';
import { useAuth } from '../../context/AuthContext';

// Import Komponen Tab
import TabDetailPribadi from '../../components/alumni/TabDetailPribadi';
import TabStatusKarier from '../../components/alumni/TabStatusKarier';
import TabKeahlian from '../../components/alumni/TabKeahlian';

export default function Profil() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  // State Global Profil
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  
  // State Navigasi Tab SPA
  const [activeTab, setActiveTab] = useState('detail'); // 'detail' | 'karier' | 'keahlian'
  const [triggerEdit, setTriggerEdit] = useState(false);

  function handlePerbarui() {
    setActiveTab('detail');
    setTriggerEdit(prev => !prev); // toggle to trigger useEffect
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

  function showSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  const navUser = { 
    nama_alumni: profile?.nama || authUser?.alumni?.nama_alumni || 'Alumni', 
    foto: profile?.foto || authUser?.alumni?.foto, 
    can_access_all: true 
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 size={36} className="animate-spin text-[#3C5759]" /></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        
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
            onRefresh={fetchProfile} 
            onShowSuccess={showSuccess} 
          />

          {/* --- KONTEN KANAN DENGAN TAB SPA --- */}
          <div className="lg:col-span-8 bg-white rounded-[2rem] shadow-sm flex flex-col overflow-hidden border border-slate-100">
            
            {/* Header Tabs */}
            <div className="flex border-b border-slate-100 px-2 overflow-x-auto hide-scrollbar">
              <button onClick={() => setActiveTab('detail')} className={`flex items-center gap-2 px-6 py-5 text-sm font-bold border-b-2 whitespace-nowrap cursor-pointer transition-all ${activeTab === 'detail' ? 'border-[#3C5759] text-[#3C5759]' : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-[#3C5759]/70'}`}>
                <User size={16} /> Detail Pribadi
              </button>
              <button onClick={() => setActiveTab('karier')} className={`flex items-center gap-2 px-6 py-5 text-sm font-bold border-b-2 whitespace-nowrap cursor-pointer transition-all ${activeTab === 'karier' ? 'border-[#3C5759] text-[#3C5759]' : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-[#3C5759]/70'}`}>
                <Briefcase size={16} /> Status Karier
              </button>
              <button onClick={() => setActiveTab('keahlian')} className={`flex items-center gap-2 px-6 py-5 text-sm font-bold border-b-2 whitespace-nowrap cursor-pointer transition-all ${activeTab === 'keahlian' ? 'border-[#3C5759] text-[#3C5759]' : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-[#3C5759]/70'}`}>
                <Award size={16} /> Keahlian
              </button>
            </div>

            {/* Render Tab Konten Secara Dinamis */}
            {activeTab === 'detail' && <TabDetailPribadi profile={profile} onRefresh={fetchProfile} onShowSuccess={showSuccess} triggerEdit={triggerEdit} />}
            {activeTab === 'karier' && <TabStatusKarier profile={profile} onRefresh={fetchProfile} onShowSuccess={showSuccess} />}
            {activeTab === 'keahlian' && <TabKeahlian profile={profile} onRefresh={fetchProfile} onShowSuccess={showSuccess} />}

          </div>
        </div>
      </main>

      <Footer />
      <style dangerouslySetInnerHTML={{__html: `.hide-scrollbar::-webkit-scrollbar { display: none; }`}} />
    </div>
  );
}