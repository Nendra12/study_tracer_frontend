import { Route, Routes, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import { ProtectedRoute } from "../utilitis/ProtectedRoute";
import UserManagement from "../pages/admin/UserManagement";
import JobsManagement from "../pages/admin/JobsManagement";
import JobDetail from "../pages/admin/JobDetail";
import MasterTable from "../pages/admin/MasterTable";
import LupaPass from "../pages/LupaPass";
import Register from "../pages/register/Register";
import { useAuth } from "../context/AuthContext";
import Logout from "../pages/Logout";
import StatusKarir from "../pages/admin/StatusKarir";
import NotFound from "../pages/NotFound";
import Kuesioner from "../pages/admin/Kuesioner";
import TambahKuisioner from "../pages/admin/TambahKuisoner";
import PreviewKuesioner from "../pages/admin/PreviewKuesioner";
import LihatJawaban from "../pages/admin/LihatJawaban";
import LihatJawabanDetail from "../pages/admin/LihatJawabanDetail";
<<<<<<< HEAD
import UpdateKuesioner from "../pages/admin/UpdateKuesioner";
=======
import Beranda from "../pages/alumni/beranda";
import Alumni from "../pages/alumni/alumni"; 
import Lowongan from "../pages/alumni/lowongan"; 
import Profil from "../pages/alumni/profil";

>>>>>>> 68f44270455f794d3fe7a94ab45c95087ba6279c

export default function AppRouter() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={isAdmin ? "/wb-admin" : "/"} /> : <Login />} />
      <Route path="/reset-password" element={<LupaPass />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
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
              <Route path="detail/:detailid" element={<LihatJawabanDetail />} />
            </Route>
          </Route>
        </Route>
      </Route>
      {/* --- Alumni/User Routes --- */}
      
      <Route path="/" element={
        isAuthenticated && !isAdmin ? <Beranda /> : <Navigate to="/login" replace />
      } />
      
      <Route path="/alumni" element={
        isAuthenticated && !isAdmin ? <Alumni /> : <Navigate to="/login" replace />
      } />
      
      <Route path="/lowongan" element={
        isAuthenticated && !isAdmin ? <Lowongan /> : <Navigate to="/login" replace />
      } />

      {/* --- Tambahkan Route Profil --- */}
      <Route path="/profil" element={
        isAuthenticated && !isAdmin ? <Profil /> : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
