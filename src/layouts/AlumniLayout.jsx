import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/alumni/Footer";
import { useAuth } from "../context/AuthContext";
import NavbarAlumni from "../components/alumni/NavbarAlumni";
import useInactivityTimeout from "../utilitis/useInactivityTimeout";
import SessionWarningModal from "../components/SessionWarningModal";

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
  const location = useLocation(); 
  const isMessage = location.pathname.includes('/alumni/pesan');

  // Session inactivity timeout (5 jam)
  const { showWarning, remainingSeconds, extendSession, dismissWarning } = useInactivityTimeout();

  return (
    // Di file Layout utama Anda
    <div className="min-h-screen font-sans flex flex-col bg-slate-50">

      <NavbarAlumni user={userData} />
      <main className="flex-grow">
        <Outlet /> {/* Beranda akan muncul di sini */}
      </main>

      {
        !isMessage && <Footer />
      }

      {/* Session Warning Modal */}
      <SessionWarningModal
        show={showWarning}
        remainingSeconds={remainingSeconds}
        onExtend={extendSession}
        onDismiss={dismissWarning}
      />
    </div>
  )
}
