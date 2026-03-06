import { Outlet } from "react-router-dom";
import Navbar from "../components/alumni/Navbar";
import Footer from "../components/alumni/Footer";
import { alumniApi } from "../api/alumni";
import { useState } from "react";
import { useEffect } from "react";

export default function AlumniLayout() {
  const userData = JSON.parse(localStorage.getItem('user'))
  const [berandaData, setBerandaData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchBeranda() {
      try {
        const res = await alumniApi.getBeranda();
        if (!cancelled) setBerandaData(res.data.data);
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch beranda:', err);
          setError(err.response?.data?.message || 'Gagal memuat data beranda');
        }
      }
    }
    fetchBeranda();
    return () => { cancelled = true; };
  }, []);

  const profile = berandaData?.profile;
  const namaAlumni = profile?.nama || userData?.profile.nama  || 'Alumni';
  const canAccessAll = berandaData?.can_access_all ?? false;
  const user = {
      id_user: userData ? userData.id : '',
      nama_alumni: namaAlumni,
      foto: profile?.foto,
      can_access_all: canAccessAll,
  };

  return (
    // Di file Layout utama Anda
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={user} />

      {/* MAIN HARUS FULL WIDTH AGAR HERO BISA MENTOK KE PINGGIR */}
      <main className="flex-grow">
         <Outlet /> {/* Beranda akan muncul di sini */}
      </main>

      <Footer />
    </div>
  )
}
