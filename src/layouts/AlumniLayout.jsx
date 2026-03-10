import { Outlet } from "react-router-dom";
import Footer from "../components/alumni/Footer";
import { useAuth } from "../context/AuthContext";
import NavbarAlumni from "../components/alumni/NavbarAlumni";

export default function AlumniLayout() {
  const { user } = useAuth()
  const profile = user?.profile;
  const namaAlumni = profile?.nama || 'Alumni';
  const canAccessAll = user?.can_access_all ?? false;
  const userData = {
      id_user: user ? user.id : '',
      nama_alumni: namaAlumni,
      foto: profile?.foto,
      foto_thumbnail: profile?.foto_thumbnail,
      can_access_all: canAccessAll,
  };

  return (
    // Di file Layout utama Anda
    <div className="min-h-screen font-sans flex flex-col bg-slate-50">

      <NavbarAlumni user={userData} />
      <main className="flex-grow">
         <Outlet/> {/* Beranda akan muncul di sini */}
      </main>

      <Footer />
    </div>
  )
}
