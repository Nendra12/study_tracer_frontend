import { Menu } from "lucide-react";
import { matchPath, useLocation } from "react-router-dom";

export default function Header({ toggleSidebar, user }) {
  const location = useLocation();

  const routes = [
    {
      path: "/wb-admin",
      title: "Beranda Admin",
      text: `Selamat datang kembali, Admin`,
    },
    {
      path: "/wb-admin/sebaran-alumni",
      title: "Sebaran Alumni",
      text: "Pemetaan persebaran alumni yang bekerja, kuliah, dan wirausaha",
    },
    {
      path: "/wb-admin/manage-user",
      title: "Manajemen Pengguna",
      text: "Kelola pendaftaran alumni tertunda dan permintaan pembaruan profil",
    },
    {
      path: "/wb-admin/jobs/job-detail/:id",
      title: "Detail Pekerjaan",
      text: "Detail informasi lowongan pekerjaan",
    },
    {
      path: "/wb-admin/jobs",
      title: "Manajemen Pekerjaan",
      text: "Tinjau, setujui, dan kelola postingan lowongan kerja dari alumni",
    },
    {
      path: "/wb-admin/status-karir",
      title: "Manajemen Status",
      text: "Mengelola Status karir alumni",
    },
    {
      path: "/wb-admin/master",
      title: "Manajemen Data Master",
      text: "Kelola konfigurasi sistem, jurusan, jenis pekerjaan, dan laporan tracer study",
    },
    {
      path: "/wb-admin/kemitraan",
      title: "Kemitraan",
      text: "Kelola daftar mitra perusahaan dan universitas untuk jejaring karir",
    },
    {
      path: "/wb-admin/kuisoner/tambah-kuesioner",
      title: "Buat Kuesioner Baru",
      text: "Lengkapi detail dan buat daftar pertanyaan",
    },
    {
      path: "/wb-admin/kuisoner/tinjau-jawaban/:jawabanid",
      title: "Jawaban Alumni",
      text: "Kelola dan tinjau jawaban individu",
    },
    {
      path: "/wb-admin/kuisoner/*",
      title: "Manajemen Kuesioner",
      text: "Kelola dan atur kuesioner untuk Studi Penelusuran Lulusan",
    },
    {
      path: "/wb-admin/pengumuman",
      title: "Pengumuman",
      text: "Kelola dan publikasikan informasi penting untuk alumni",
    },
    {
      path: "/wb-admin/pengumuman/detail/:id",
      title: "Detail Pengumuman",
      text: "Melihat konten pengumuman secara penuh",
    },
    {
      path: "/wb-admin/tampilan",
      title: "Pengaturan Tampilan",
      text: "Sesuaikan tema warna, logo, dan ikon aplikasi",
    },
  ];

  const getTitle = () => {
    const current = routes.find((route) =>
      matchPath({ path: route.path, end: true }, location.pathname)
    );
    return current;
  };

  const contentTitle = getTitle();

  return (
    <header
      className="
          fixed top-0 right-0 z-80
          h-20 bg-white/80 backdrop-blur-md border-b border-fourth
          flex items-center justify-between
          px-6 md:px-8
          w-full xl:w-[calc(100%-16.25rem)]
          transition-all duration-300
        "
    >
      <div className="min-w-0">
        <h2 className="text-lg md:text-xl font-bold text-primary">
          {contentTitle?.title || "Halaman Admin"}
        </h2>
        <p className="text-[10px] md:text-xs text-third truncate">
          {contentTitle?.text || ""}
        </p>
      </div>

      <button
        className="xl:hidden p-2 hover:bg-fourth rounded-xl transition-colors cursor-pointer"
        onClick={toggleSidebar}
      >
        <Menu size={24} className="text-primary" />
      </button>
    </header>
  );
}