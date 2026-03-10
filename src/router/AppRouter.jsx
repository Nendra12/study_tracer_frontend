import { Route, Routes, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "../context/AuthContext";
import { ProtectedRoute } from "../utilitis/ProtectedRoute";
import Loader from "../components/Loaders";
import LandingPage from "../pages/LandingPage";
import AlumniPortal from "../pages/alumni/PortalAlumni";

const Login = lazy(() => import("../pages/Login"))
const AdminLayout = lazy(() => import("../layouts/AdminLayout"))
const Dashboard = lazy(() => import("../pages/admin/Dashboard"))
const Landing = lazy(() => import("../pages/landing"));
const UserManagement = lazy(() => import("../pages/admin/UserManagement"))
const JobsManagement = lazy(() => import("../pages/admin/JobsManagement"));
const JobDetail = lazy(() => import("../pages/admin/JobDetail"));
const MasterTable = lazy(() => import("../pages/admin/MasterTable"));
const StatusKarir = lazy(() => import("../pages/admin/StatusKarir"));
const Kuesioner = lazy(() => import("../pages/admin/Kuesioner"));
const TambahKuisioner = lazy(() => import("../pages/admin/TambahKuisoner"));
const PreviewKuesioner = lazy(() => import("../pages/admin/PreviewKuesioner"));
const LihatJawaban = lazy(() => import("../pages/admin/LihatJawaban"));
const LihatJawabanDetail = lazy(() => import("../pages/admin/LihatJawabanDetail"));
const UpdateKuesioner = lazy(() => import("../pages/admin/UpdateKuesioner"));
const StatistikKuesioner = lazy(() => import("../pages/admin/StatistikKuesioner"));
const LupaPass = lazy(() => import("../pages/LupaPass"));
const Register = lazy(() => import("../pages/register/Register"));
const Logout = lazy(() => import("../pages/Logout"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Beranda = lazy(() => import("../pages/alumni/beranda"));
const Alumni = lazy(() => import("../pages/alumni/alumni"));
const AlumniDetail = lazy(() => import("../pages/alumni/alumniDetail"));
const Lowongan = lazy(() => import("../pages/alumni/lowongan"));
const Profil = lazy(() => import("../pages/alumni/profil"));
const KuesionerModal = lazy(() => import("../pages/alumni/KuesionerModal"));
const LowonganDetail = lazy(() => import("../pages/alumni/lowonganDetail"));
const Notifikasi = lazy(() => import("../pages/alumni/Notifikasi"));
const AlumniLayout = lazy(() => import("../layouts/AlumniLayout"));

export default function AppRouter() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>*/}
        <Loader />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={isAdmin ? "/wb-admin" : "/alumni"} /> : <Login />} />
      <Route path="/reset-password" element={<LupaPass />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/alumni" /> : <Register />} />
      <Route path="/kocak" element={<AlumniPortal />} />
      <Route path="/wb-admin" element={
        <ProtectedRoute isAllowed={isAuthenticated && isAdmin} redirectTo="/login" />
      }>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="manage-user" >
            <Route index element={<UserManagement />} />
          </Route>
          <Route path="jobs">
            <Route index element={<JobsManagement />} />
            <Route path="job-detail/:id" element={<JobDetail />} />
          </Route>
          <Route path="status-karir">
            <Route index element={<StatusKarir />} />
          </Route>
          <Route path="master" element={<MasterTable />} />
          <Route path="kuisoner">
            <Route index element={<Kuesioner />} />
            <Route path="tambah-kuesioner" element={<TambahKuisioner />} />
            <Route path="preview-kuesioner/:id" element={<PreviewKuesioner />} />
            <Route path="update-kuesioner/:id" element={<UpdateKuesioner />} />
            <Route path="tinjau-jawaban/:jawabanid" >
              <Route index element={<LihatJawaban />} />
              <Route path="statistik" element={<StatistikKuesioner />} />
              <Route path="detail/:detailid" element={<LihatJawabanDetail />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="/alumni" element={<ProtectedRoute isAllowed={isAuthenticated && !isAdmin} redirectTo={"/login"} /> }>
        <Route element={<AlumniLayout />} >
          <Route index element={<AlumniPortal />} />
          <Route path="daftar-alumni" element={<Alumni />} />
          <Route path="daftar-alumni/:id" element={<AlumniDetail />} />
          <Route path="lowongan" element={<Lowongan />} />
          <Route path="lowongan/:id" element={<LowonganDetail />} />
          <Route path="kuesioner/:id" element={<KuesionerModal />} />
          <Route path="profile" element={<Profil />} />
          <Route path="notifikasi" element={<Notifikasi />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
