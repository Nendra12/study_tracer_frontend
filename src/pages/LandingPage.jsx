import React, { useState, useEffect } from "react";
import NavbarLanding from "../components/NavbarLanding";
import Alumni from "../assets/svg/share.svg";
import Work from "../assets/svg/work.svg";
import Akreditasi from "../assets/svg/ticket.svg";
import { Link, useNavigate } from "react-router-dom";
import GuideSection from "../components/GuideSection";
import AlumniStats from "../components/AlumniStats";
import AlumniSuccess from "../components/AlumniSuccess";
import { motion } from "framer-motion";
import CareerSection from "../components/CareerSection";
import { Globe, Mail, Phone, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { publicApi } from "../api/alumni";
import Loader from "../components/Loaders";
import { STORAGE_BASE_URL } from "../api/axios";
import { useThemeSettings } from "../context/ThemeContext";
import FooterModals from "../components/alumni/FooterModals";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth()
  const { theme } = useThemeSettings();

  // State untuk data dinamis
  const [stats, setStats] = useState(null);
  const [alumniList, setAlumniList] = useState([]);
  const [jobList, setJobList] = useState([]);
  const [activeSection, setActiveSection] = useState("beranda");
  const [apiLoading, setApiLoading] = useState(true);
  const [imgLoading, setImgLoading] = useState(true);
  const [modalType, setModalType] = useState(null);

  const openModal = (type) => setModalType(type);
  const closeModal = () => setModalType(null);

  // Fetch data landing page dari API
  useEffect(() => {
    async function fetchLandingData() {
      try {
        setApiLoading(true);
        const [statsRes, alumniRes, jobsRes] = await Promise.all([
          publicApi.getLandingStats(),
          publicApi.getFeaturedAlumni(),
          publicApi.getFeaturedJobs(),
        ]);
        setStats(statsRes.data.data);
        setAlumniList(alumniRes.data.data || []);
        setJobList(jobsRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch landing data:', err);
      } finally {
        setApiLoading(false);
      }
    }
    fetchLandingData();
  }, []);

  // Preload gambar utama (hero image) untuk menghindari visual glich (putih)
  useEffect(() => {
    const heroImgSrc = theme?.landingBg || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop";
    setImgLoading(true); // reset
    const img = new Image();
    img.src = heroImgSrc;
    img.onload = () => setImgLoading(false);
    img.onerror = () => setImgLoading(false);

    // Fallback timer: kalau gambar terlalu besar/lama, paksa buka halaman dalam maksimal 3 detik
    const timer = setTimeout(() => {
      setImgLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [theme?.landingBg]);

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();

    // Set active section immediately untuk instant feedback
    setActiveSection(targetId.replace("#", ""));

    const element = document.getElementById(targetId.replace("#", ""));
    if (element) {
      const navbarHeight = 100; // Tinggi navbar + offset tambahan
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Jeda antar elemen masuk
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const floatingVariants = (delay = 0) => ({
    initial: { y: 0 },
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      },
    },
  });
  const currentYear = new Date().getFullYear();

  function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_BASE_URL}/${path}`;
  }

  // console.log(alumniList)
  const isPageReady = !apiLoading && !imgLoading;

  if (!isPageReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader />
      </div>
    );
  }

  console.log(alumniList)

  return (
    <div className="relative min-h-screen font-sans text-primary/80 overflow-hidden selection:bg-primary selection:text-white">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[25%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[50%] bg-primary/80/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Floating Modern Navbar */}
      <NavbarLanding setActiveSection={setActiveSection} activeSection={activeSection} />

      {/* Hero Section */}
      <section
        id="beranda"
        className="pt-28 xl:pt-21 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <motion.div
            className="space-y-5 z-10 relative"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl lg:text-6xl font-black text-primary leading-[1.1] tracking-tight whitespace-pre-line"
            >
              {/* Jika ada landingTitle dari admin, pakai itu. Jika tidak, pakai teks default */}
              {theme?.landingTitle ? (
                <>
                  {theme.landingTitle} <br />
                  <span className="text-transparent bg-clip-text bg-third">
                    {theme?.namaSekolah || 'SMKN 2 Kraksaan'}.
                  </span>
                </>
              ) : (
                <>
                  Tetap Terhubung <br />
                  <span>dengan Alumni </span> <br />
                  <span className="text-transparent bg-clip-text bg-third">
                    {theme?.namaSekolah || 'SMKN 2 Kraksaan'}.
                  </span>
                </>
              )}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-primary/80 leading-relaxed max-w-md font-medium"
            >
              {theme?.landingDescription || (
                <>
                  Bagikan perjalanan karirmu, lihat perkembangan teman-teman alumni,
                  temukan info lowongan kerja, dan bangun jaringan yang lebih luas
                </>
              )}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 pt-2"
            >
              <button
                onClick={() => user ? navigate("/alumni") : navigate("/login")}
                className="bg-primary text-white px-8 py-4 rounded-md font-bold cursor-pointer hover:bg-primary/80 hover:-translate-y-1 transition-all shadow-[0_8px_30px_rgba(60,87,89,0.3)] flex items-center gap-2 transition-all duration-300 ease-in-out"
              >
                Masuk Portal {user ? user.role == 'alumni' ? 'Alumni' : 'Admin' : 'Alumni'} <span className="text-xl">→</span>
              </button>
              <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/50 backdrop-blur-sm border border-white/50">
                <div className="flex -space-x-3">
                  {alumniList.map((i, index) => (
                    <div key={index}>
                      {index < 4 && (
                        <img
                          key={index}
                          src={`${getImageUrl(i.foto)}`}
                          alt="user"
                          className="w-10 h-10 object-cover rounded-full border-2 border-fourth"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <span className="ml-9 text-sm font-bold text-primary">
                  +{stats?.total_alumni || 0} Bergabung
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Dribbble Style Collage/Bento */}
          <div className="relative h-[600px] w-full hidden lg:block">
            {/* Main Image Card */}
            <motion.div
              className="absolute top-10 right-0 w-[80%] h-[80%] bg-white rounded-md p-2 shadow-2xl shadow-third
              /20 transform rotate-2 hover:-rotate-3 transition-transform duration-500 z-10"
              initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
              animate={{ opacity: 1, scale: 1, rotate: 2 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [1, 1, 0.3, 1], delay: 0.3 }}
            >
              <img
                src={theme?.landingBg || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop"}
                alt="Graduation"
                className="w-full h-full object-cover rounded-3xl"
              />
            </motion.div>

            {/* Floating Stat Card */}
            <motion.div
              className="absolute top-[20%] left-[-5%] bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-white/60 shadow-xl z-20 animate-bounce"
              style={{ animationDuration: "3s" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-4">
                <img src={Work} alt="kerja" className="w-12" />
                <div>
                  <div className="text-2xl font-black text-primary">{stats?.career_distribution?.bekerja?.percentage || 0}%</div>
                  <div className="text-xs font-bold text-third uppercase tracking-wider">
                    Alumni Aktif Bekerja
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Info Card */}
            <motion.div
              className="absolute bottom-[11%] left-[7%] bg-primary text-white p-6 rounded-3xl shadow-[0_20px_40px_rgba(60,87,89,0.4)] z-20 w-64 transform -rotate-3 hover:rotate-0 transition-transform duration-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                  Baru
                </span>
                <img src={Akreditasi} alt="star" className="w-8" />
              </div>
              <p className="font-semibold text-sm">
                Update data karirmu dan bantu sekolah tingkatkan akreditasi!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <GuideSection />

      {/* Fitur & Statistik - Bento Grid Style */}
      <AlumniStats stats={stats} />

      {/* Top Alumni Section (4 Cards Dribbble Style) */}
      <AlumniSuccess alumniList={alumniList} />

      {/* Karir & Lowongan - Sleek List */}
      <CareerSection jobList={jobList} />

      {/* PERUBAHAN: Mengurangi padding-top (pt-12) dan membuang padding ganda di dalam wrapper */}
      <footer className="bg-fourth pt-12 pb-6 border-t border-[#e2e8f0]">
        {/* Pembungkus utama (Sekarang hanya 1 lapis agar tidak double) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Ubah ke 12 Kolom. mb-10 dikurangi menjadi mb-8 agar jarak ke garis bawah tidak terlalu jauh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 mb-8">

            {/* Kolom 1: Branding & Kontak Info (Mengambil 4 dari 12 kolom) */}
            <div className="space-y-4 lg:col-span-4 lg:pr-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <img
                  src={theme?.logo || "/icon.png"}
                  alt="Alumni Tracer Logo"
                  className="w-12 h-10 object-contain drop-shadow-sm"
                />
                <div className='flex flex-col transition-all duration-500 ease-in-out'>
                  <span className="font-black text-primary text-lg leading-tight">Alumni Tracer</span>
                  <span className='text-[11px] font-semibold text-primary/80'>
                    {theme?.namaSekolah || 'SMKN 2 Kraksaan'}
                  </span>
                </div>
              </Link>
              <p className="text-primary/80 text-sm leading-relaxed font-medium">
                {theme?.deskripsiFooter || 'Platform pelacakan dan jaringan alumni resmi. Menghubungkan lulusan, membina pertumbuhan, dan membangun komunitas yang lebih kuat bersama-sama.'}
              </p>
            </div>

            {/* Kolom 2: Tautan Cepat (Merata ke kiri) */}
            <div className="lg:col-span-2 lg:justify-self-start">
              <h3 className="text-primary font-black mb-4">Tautan Cepat</h3>
              <ul className="space-y-2.5">
                {[
                  { label: "Beranda", href: "#beranda" },
                  { label: "Petunjuk", href: "#petunjuk" },
                  { label: "Statistik Publik", href: "#fitur" },
                  { label: "Alumni", href: "#alumni" },
                  { label: "Bursa Kerja", href: "#karir" }
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={(e) => handleSmoothScroll(e, item.href)}
                      className="text-primary/80 text-sm font-bold hover:text-primary transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kolom 3: Untuk Alumni (Posisi di tengah) */}
            <div className="lg:col-span-3 lg:justify-self-center">
              <h3 className="text-primary font-black mb-4">Untuk Alumni</h3>
              <ul className="space-y-2.5">
                {[
                  { label: "Masuk", path: "/login" },
                  { label: "Daftar", path: "/register" },
                  { label: "Perbarui Profil", path: "/alumni/profil" }
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className="text-primary/80 text-sm font-bold hover:text-primary transition-colors cursor-pointer"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kolom 4: Kontak Kami (Merata ke kanan) */}
            <div className="lg:col-span-3 lg:justify-self-end flex flex-col">
              <h3 className="text-primary font-black mb-4">
                Kontak Kami
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                    <Globe size={14} />
                  </div>
                  <a href={`https://${(theme?.webKontak || 'website-sekolah.sch.id').replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary/80 hover:text-primary transition-colors break-all">
                    {(theme?.webKontak || 'website-sekolah.sch.id').replace(/^https?:\/\//, '')}
                  </a>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                    <Mail size={14} />
                  </div>
                  <a href={`mailto:${theme?.emailKontak || 'info@sekolah.sch.id'}`} className="text-sm font-bold text-primary/80 hover:text-primary transition-colors break-all">
                    {theme?.emailKontak || 'info@sekolah.sch.id'}
                  </a>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                    <Phone size={14} />
                  </div>
                  <a href={`tel:${(theme?.telpKontak || '(0358) 611606').replace(/[^\d+]/g, '')}`} className="text-sm font-bold text-primary/80 hover:text-primary transition-colors">
                    {theme?.telpKontak || '(0358) 611606'}
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-[#e2e8f0] flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
            <p className="text-third text-xs font-bold text-center md:text-left">
              © {currentYear} Alumni Tracer. Hak cipta dilindungi.
            </p>

            <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
              <button
                onClick={() => openModal('privasi')}
                className="text-third hover:text-primary text-xs font-bold transition-colors cursor-pointer"
              >
                Kebijakan Privasi
              </button>
              <button
                onClick={() => openModal('layanan')}
                className="text-third hover:text-primary text-xs font-bold transition-colors cursor-pointer"
              >
                Ketentuan Layanan
              </button>
              <button
                onClick={() => openModal('kontak')}
                className="text-third hover:text-primary text-xs font-bold transition-colors cursor-pointer"
              >
                Kontak Dukungan
              </button>
            </div>
          </div>
          
        </div>
      </footer>

      {/* Render Modal Footer di paling bawah setelah tag </footer> */}
      <FooterModals
        isOpen={!!modalType}
        type={modalType}
        onClose={closeModal}
      />
    </div>
  );
}
