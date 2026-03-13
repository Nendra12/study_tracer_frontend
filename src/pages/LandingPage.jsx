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
import { Globe, Mail, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { publicApi } from "../api/alumni";
import Loader from "../components/Loaders";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth()

  // State untuk data dinamis
  const [stats, setStats] = useState(null);
  const [alumniList, setAlumniList] = useState([]);
  const [jobList, setJobList] = useState([]);
  const [loading, setLoading] = useState(false)

  // Fetch data landing page dari API
  useEffect(() => {
    async function fetchLandingData() {
      try {
        setLoading(true)
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
        setLoading(false)
      }
    }
    fetchLandingData();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>*/}
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-sans text-secondary overflow-hidden selection:bg-primary selection:text-white">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[25%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[50%] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Floating Modern Navbar */}
      <NavbarLanding />

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
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm"
            >
              <img src={Alumni} alt="" className="w-7" />
              <span className="text-[12px] font-bold text-primary">
                Selamat datang di Tracer Study SMK Negeri 1 Gondang
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl lg:text-6xl font-black text-primary leading-[1.1] tracking-tight"
            >
              Tetap Terhubung <br />
              <span>dengan Alumni </span> <br />
              <span className="text-transparent bg-clip-text bg-third">
                SMKN 1 Gondang.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-secondary leading-relaxed max-w-md font-medium"
            >
              Bagikan perjalanan karirmu, lihat perkembangan teman-teman alumni,
              temukan info lowongan kerja, dan bangun jaringan yang lebih luas
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 pt-2"
            >
              <button
                onClick={() => user ? navigate("/alumni") : navigate("/login")}
                className="bg-primary text-white px-8 py-4 rounded-xl font-bold cursor-pointer hover:bg-secondary hover:-translate-y-1 transition-all shadow-[0_8px_30px_rgba(60,87,89,0.3)] flex items-center gap-2"
              >
                Masuk Portal Alumni <span className="text-xl">→</span>
              </button>
              <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/50 backdrop-blur-sm border border-white/50">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="user"
                      className="w-10 h-10 rounded-full border-2 border-[#f3f4f4]"
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-primary">
                  +{stats?.total_alumni || 0} Bergabung
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Dribbble Style Collage/Bento */}
          <div className="relative h-[600px] w-full hidden lg:block">
            {/* Main Image Card */}
            <motion.div
              className="absolute top-10 right-0 w-[80%] h-[80%] bg-white rounded-[2rem] p-2 shadow-2xl shadow-third
              /20 transform rotate-2 hover:-rotate-3 transition-transform duration-500 z-10"
              initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
              animate={{ opacity: 1, scale: 1, rotate: 2 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [1, 1, 0.3, 1], delay: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop"
                alt="Graduation"
                className="w-full h-full object-cover rounded-3xl"
              />
            </motion.div>

            {/* Floating Stat Card */}
            <motion.div
              className="absolute top-[20%] left-[-5%] bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-xl z-20 animate-bounce"
              style={{ animationDuration: "3s" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-4">
                {/* <div className="w-12 h-12 rounded-full bg-[#f3f4f4] flex items-center justify-center text-2xl">💼</div>*/}
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

      <footer className="bg-[#f3f4f4] pt-20 pb-10 px-4 sm:px-6 lg:px-8 border-t border-[#f3f4f4]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Kolom 1: Branding */}
            <div className="space-y-6">
              <Link
                to="/" className="flex items-center gap-2.5 group">
                <img
                  src="/icon.png"
                  alt="Alumni Tracer Logo"
                  className="w-12 h-10 object-contain drop-shadow-sm"
                />
                <div className='flex flex-col transition-all duration-500 ease-in-out'>
                  <span className="font-black text-primary text-lg">Alumni Tracer</span>
                  <span className='text-xs font-semibold'>SMK Negeri 1 Gondang</span>
                </div>
              </Link>
              <p className="text-secondary text-sm leading-relaxed font-medium">
                Platform pelacakan dan jaringan alumni resmi. Menghubungkan
                lulusan, membina pertumbuhan, dan membangun komunitas yang lebih
                kuat bersama-sama.
              </p>
              <div className="flex gap-4">
                {[<Globe />, <Mail />, <Phone />].map((icon, i) => (
                  <button
                    key={i}
                    className="w-10 h-10 rounded-full bg-[#f3f4f4] flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Kolom 2: Tautan Cepat */}
            <div>
              <h3 className="text-primary font-black mb-6">Tautan Cepat</h3>
              <ul className="space-y-4">
                {[
                  "Beranda",
                  "Tentang Kami",
                  "Statistik Publik",
                  "Bursa Kerja",
                  "Hubungi Bantuan",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-secondary text-sm font-bold hover:text-primary transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kolom 3: Untuk Alumni */}
            <div>
              <h3 className="text-primary font-black mb-6">Untuk Alumni</h3>
              <ul className="space-y-4">
                {[
                  "Masuk",
                  "Daftar",
                  "Perbarui Profil",
                  "Kirim Data Tracer",
                  "Kalender Acara",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-secondary text-sm font-bold hover:text-primary transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kolom 4: Newsletter */}
            <div className="space-y-6">
              <h3 className="text-primary font-black">
                Berlangganan Newsletter
              </h3>
              <p className="text-secondary text-sm font-medium">
                Berlangganan untuk menerima pembaruan tentang pekerjaan dan
                acara.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Alamat email Anda"
                  className="w-full px-5 py-4 rounded-xl bg-[#f3f4f4] border-transparent focus:bg-white focus:border-primary/20 focus:ring-0 text-sm font-medium transition-all outline-none"
                />
                <button className="cursor-pointer w-full py-4 bg-third
                 hover:bg-primary text-white rounded-xl font-black text-sm shadow-sm transition-all active:scale-95">
                  Berlangganan
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#f3f4f4] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-third
             text-xs font-bold">
              © {currentYear} Alumni Tracer. Hak cipta dilindungi undang-undang.
            </p>
            <div className="flex gap-8">
              <a
                href="#"
                className="text-third
                 text-xs font-bold hover:text-primary"
              >
                Kebijakan Privasi
              </a>
              <a
                href="#"
                className="text-third
                 text-xs font-bold hover:text-primary"
              >
                Syarat Layanan
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
