import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Briefcase, 
  Network, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Menu, 
  X, 
  GraduationCap,
  Mail,
  Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- DATA DUMMY ---
const dummyJobs = [
  {
    id: 1,
    title: "Senior Product Designer",
    company: "TechNexus Solutions",
    location: "San Francisco, CA",
    type: "Full-time",
    desc: "Kami mencari desainer berpengalaman untuk memimpin upaya pengalaman pengguna kami pada platform inti kami...",
    logoColor: "bg-blue-50 text-blue-500",
    initial: "T"
  },
  {
    id: 2,
    title: "Data Analyst",
    company: "GreenFin Analytics",
    location: "Remote",
    type: "Contract",
    desc: "Bergabunglah dengan tim yang berfokus pada keberlanjutan kami untuk membantu menganalisis dan memvisualisasikan data jejak karbon untuk...",
    logoColor: "bg-green-50 text-green-600",
    initial: "G"
  },
  {
    id: 3,
    title: "Marketing Manager",
    company: "Lucid Digital",
    location: "New York, NY",
    type: "Full-time",
    desc: "Dorong pertumbuhan dan kesadaran merek untuk startup baru di ruang teknologi pendidikan...",
    logoColor: "bg-purple-50 text-purple-600",
    initial: "L"
  }
];

const dummyAlumni = [
  {
    id: 1,
    name: "Budi Santoso",
    batch: "2018",
    job: "Senior Developer at Tech Giant",
    image: "https://i.pravatar.cc/150?img=11"
  },
  {
    id: 2,
    name: "Sari Wijaya",
    batch: "2019",
    job: "Marketing Lead at E-commerce",
    image: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: 3,
    name: "Andi Pratama",
    batch: "2017",
    job: "Founding Engineer at Startup",
    image: "https://i.pravatar.cc/150?img=12"
  },
  {
    id: 4,
    name: "Dewi Lestari",
    batch: "2020",
    job: "UI/UX Designer at Fintech",
    image: "https://i.pravatar.cc/150?img=9"
  }
];

// --- ANIMASI ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-x-hidden relative selection:bg-[#2A4B50] selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-slate-100">
        {/* PERUBAHAN: max-w-7xl menjadi max-w-[1440px] agar lebih lebar */}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 2xl:px-16">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="w-10 h-10 bg-[#2A4B50] rounded-xl flex items-center justify-center text-white">
                <GraduationCap size={24} />
              </div>
              <span className="font-black text-xl text-[#2A4B50]">Alumni Tracer</span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-600">
              <a href="#" className="text-[#2A4B50] hover:text-[#2A4B50]/70 transition-colors">Beranda</a>
              <a href="#" className="hover:text-[#2A4B50] transition-colors">Alumni</a>
              <a href="#" className="hover:text-[#2A4B50] transition-colors">Lowongan Kerja</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="font-bold text-sm text-slate-600 hover:text-[#2A4B50] transition-colors cursor-pointer"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="bg-[#2A4B50] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#1E363A] transition-all shadow-lg shadow-[#2A4B50]/20 cursor-pointer"
              >
                Register
              </button>
            </div>

            {/* Mobile Toggle */}
            <button 
              className="md:hidden text-slate-600 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-6 absolute w-full flex flex-col gap-4 shadow-xl">
            <a href="#" className="font-bold text-[#2A4B50]">Beranda</a>
            <a href="#" className="font-bold text-slate-600">Alumni</a>
            <a href="#" className="font-bold text-slate-600">Lowongan Kerja</a>
            <hr className="my-2 border-slate-100" />
            <button onClick={() => navigate('/login')} className="font-bold text-slate-600 text-left">Login</button>
            <button onClick={() => navigate('/register')} className="bg-[#2A4B50] text-white px-6 py-3 rounded-full text-sm font-bold w-full text-center">
              Register
            </button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      {/* PERUBAHAN: max-w-7xl menjadi max-w-[1440px] */}
      <section className="pt-36 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-12 2xl:px-16 max-w-[1440px] mx-auto relative z-10">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#2A4B50]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="flex flex-col items-start text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} className="bg-slate-200/50 border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold mb-6 flex items-center gap-2 self-center lg:self-start">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Selamat datang di Alumni Tracer Study SMK Negeri 1 Gondang
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-[3.5rem] font-black leading-[1.1] text-[#2A4B50] mb-6 tracking-tight">
              Tetap Terhubung <br/> dengan Alumni <br/> SMKN 1 Gondang.
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-slate-500 font-medium leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Yuk gabung di Alumni Tracer SMKN 1 Gondang! Bagikan perjalanan karirmu, lihat perkembangan teman-teman alumni, temukan info lowongan kerja, dan bangun jaringan yang lebih luas.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
              <button 
                onClick={() => navigate('/login')}
                className="bg-[#2A4B50] text-white px-8 py-4 rounded-full font-bold w-full sm:w-auto hover:bg-[#1E363A] transition-all hover:-translate-y-1 shadow-xl shadow-[#2A4B50]/20 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Briefcase size={18} /> Masuk ke Portal
              </button>
              
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  <img src="https://i.pravatar.cc/100?img=1" className="w-10 h-10 rounded-full border-2 border-[#F8FAFC] shadow-sm" alt="User" />
                  <img src="https://i.pravatar.cc/100?img=2" className="w-10 h-10 rounded-full border-2 border-[#F8FAFC] shadow-sm" alt="User" />
                  <div className="w-10 h-10 rounded-full border-2 border-[#F8FAFC] bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 shadow-sm">+2k</div>
                </div>
                <div className="text-[11px] font-bold text-slate-500 text-left">
                  <span className="text-[#2A4B50] font-black text-xs">2,500+</span> Alumni<br/>sudah bergabung
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full h-[400px] lg:h-[500px] hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2A4B50] to-[#457b85] rounded-[2rem] transform rotate-3 shadow-2xl"></div>
            <div className="absolute inset-0 bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
              <div className="h-12 border-b border-slate-100 flex items-center px-5 gap-2 bg-slate-50/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="ml-auto text-[10px] font-bold text-slate-300 bg-white px-3 py-1 rounded-full shadow-sm">Alumni Tracer Dashboard</div>
              </div>
              <div className="p-8 flex-1 flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 shadow-inner"><Briefcase size={32} /></div>
                  <div className="h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 shadow-inner"><Network size={32} /></div>
                  <div className="h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 shadow-inner"><TrendingUp size={32} /></div>
                </div>
                <div className="space-y-4 mt-4">
                  <div className="h-6 bg-slate-100 rounded-full w-3/4"></div>
                  <div className="h-4 bg-slate-50 rounded-full w-full"></div>
                  <div className="h-4 bg-slate-50 rounded-full w-5/6"></div>
                </div>
                <div className="mt-auto h-20 bg-[#2A4B50] rounded-2xl flex items-center px-6 justify-between text-white/50 shadow-lg transform hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => navigate('/login')}>
                  <div className="w-32 h-4 bg-white/20 rounded-full"></div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><ArrowRight size={16} className="text-white"/></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-20 bg-white border-y border-slate-100">
        {/* PERUBAHAN: max-w-7xl menjadi max-w-[1440px] */}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 2xl:px-16">
          <div className="text-center mb-16">
            <p className="text-xs font-black tracking-widest text-[#2A4B50]/60 uppercase mb-3">Mengapa Bergabung Dengan Kami</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#2A4B50]">Memberdayakan Kesuksesan Alumni</h2>
            <p className="mt-4 text-slate-500 font-medium max-w-2xl mx-auto">Kami menyediakan perangkat yang Anda butuhkan untuk memajukan karir dan tetap terhubung dengan almamater tercinta.</p>
          </div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp} className="bg-[#F8FAFC] rounded-[2rem] p-8 hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#2A4B50] shadow-sm mb-6">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-black text-[#2A4B50] mb-3">Pelacakan Karir</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">Visualisasikan perjalanan profesional Anda dengan analitik canggih. Berkontribusi pada data universitas dan lihat kinerja angkatan Anda secara global.</p>
              <a href="#" className="inline-flex items-center gap-2 text-[#2A4B50] font-bold text-sm hover:gap-3 transition-all">Lihat Statistics <ArrowRight size={16} /></a>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-[#F8FAFC] rounded-[2rem] p-8 hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#2A4B50] shadow-sm mb-6">
                <Briefcase size={28} />
              </div>
              <h3 className="text-xl font-black text-[#2A4B50] mb-3">Bursa Kerja</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">Akses daftar pekerjaan eksklusif yang dikurasi untuk alumni. Filter berdasarkan industri, lokasi, dan jenis. Pasang lowongan Anda sendiri untuk merekrut bakat.</p>
              <a href="#" className="inline-flex items-center gap-2 text-[#2A4B50] font-bold text-sm hover:gap-3 transition-all">Cari Kerja <ArrowRight size={16} /></a>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-[#F8FAFC] rounded-[2rem] p-8 hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#2A4B50] shadow-sm mb-6">
                <Network size={28} />
              </div>
              <h3 className="text-xl font-black text-[#2A4B50] mb-3">Jejaring Alumni</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">Terhubung kembali dengan teman lama dan perluas jaringan profesional Anda. Temukan mentor dan bergabung dengan grup minat.</p>
              <a href="#" className="inline-flex items-center gap-2 text-[#2A4B50] font-bold text-sm hover:gap-3 transition-all">Mulai Berjejaring <ArrowRight size={16} /></a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- LOWONGAN PEKERJAAN --- */}
      {/* PERUBAHAN: max-w-7xl menjadi max-w-[1440px] */}
      <section className="py-24 max-w-[1440px] mx-auto px-6 lg:px-12 2xl:px-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <p className="text-xs font-black tracking-widest text-[#2A4B50]/60 uppercase mb-2">Peluang</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#2A4B50]">Lowongan Pekerjaan</h2>
            <p className="mt-3 text-slate-500 font-medium max-w-xl">Mulai langkah karir Anda berikutnya dengan peluang eksklusif dari jaringan organisasi mitra kami.</p>
          </div>
          <button onClick={() => navigate('/login')} className="bg-[#2A4B50] text-white px-8 py-3 rounded-full font-bold hover:bg-[#1E363A] transition-colors shrink-0 cursor-pointer">
            Cari Kerja
          </button>
        </div>

        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
        >
          {dummyJobs.map((job) => (
            <motion.div key={job.id} variants={fadeInUp} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer" onClick={() => navigate('/login')}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0 ${job.logoColor}`}>
                  {job.initial}
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-800 leading-tight group-hover:text-[#2A4B50] transition-colors">{job.title}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1">{job.company}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 border border-slate-100"><MapPin size={12}/> {job.location}</span>
                <span className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 border border-slate-100"><Clock size={12}/> {job.type}</span>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 flex-1 line-clamp-3">
                {job.desc}
              </p>
              <button className="w-full py-3 rounded-xl border-2 border-slate-100 font-bold text-slate-600 group-hover:border-[#2A4B50] group-hover:text-[#2A4B50] transition-colors">
                Lihat Detail
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* --- ALUMNI NETWORK SECTION --- */}
      <section className="py-24 bg-white border-y border-slate-100">
        {/* PERUBAHAN: max-w-7xl menjadi max-w-[1440px] */}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 2xl:px-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-[#2A4B50] mb-4">Terhubung dengan Alumni Kami</h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto mb-16">Inspirasi dari rekan-rekan alumni yang telah meniti karir gemilang di berbagai industri.</p>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start"
          >
            {dummyAlumni.map((alumni) => (
              <motion.div key={alumni.id} variants={fadeInUp} className="bg-slate-50 rounded-3xl p-8 flex flex-col items-center text-center hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer" onClick={() => navigate('/login')}>
                <img src={alumni.image} alt={alumni.name} className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-md object-cover" />
                <h3 className="font-black text-lg text-[#2A4B50]">{alumni.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Angkatan {alumni.batch}</p>
                <p className="text-sm font-bold text-slate-600 mb-6">{alumni.job}</p>
                <span className="mt-auto text-xs font-bold text-[#2A4B50] flex items-center gap-1 hover:underline">Lihat Profil <ArrowRight size={14}/></span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="bg-[#2A4B50] py-20 border-b-8 border-[#1E363A]">
        {/* PERUBAHAN: max-w-7xl menjadi max-w-[1440px] */}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 2xl:px-16 grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="pt-6 md:pt-0">
            <h2 className="text-5xl font-black text-white mb-2">15k+</h2>
            <p className="text-white/70 font-bold uppercase tracking-widest text-sm">Alumni Aktif</p>
          </div>
          <div className="pt-6 md:pt-0">
            <h2 className="text-5xl font-black text-white mb-2">92%</h2>
            <p className="text-white/70 font-bold uppercase tracking-widest text-sm">Tingkat Pekerjaan</p>
          </div>
          <div className="pt-6 md:pt-0">
            <h2 className="text-5xl font-black text-white mb-2">100+</h2>
            <p className="text-white/70 font-bold uppercase tracking-widest text-sm">Perusahaan Mitra</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
        {/* PERUBAHAN: max-w-7xl menjadi max-w-[1440px] */}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 2xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[#2A4B50] rounded-lg flex items-center justify-center text-white">
                  <GraduationCap size={18} />
                </div>
                <span className="font-black text-lg text-[#2A4B50]">Alumni Tracer</span>
              </div>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
                Platform pelacakan dan jaringan alumni resmi. Menghubungkan lulusan, membina pertumbuhan, dan membangun komunitas yang lebih kuat bersama-sama.
              </p>
              <div className="flex gap-4">
                <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#2A4B50] hover:text-white transition-colors cursor-pointer"><Mail size={18}/></button>
                <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#2A4B50] hover:text-white transition-colors cursor-pointer"><Phone size={18}/></button>
              </div>
            </div>

            {/* Links 1 */}
            <div>
              <h4 className="font-black text-[#2A4B50] mb-6">Tautan Cepat</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#2A4B50] transition-colors">Beranda</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#2A4B50] transition-colors">Tentang Kami</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#2A4B50] transition-colors">Statistik Publik</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#2A4B50] transition-colors">Bursa Kerja</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#2A4B50] transition-colors">Hubungi Bantuan</a></li>
              </ul>
            </div>

            {/* Links 2 */}
            <div>
              <h4 className="font-black text-[#2A4B50] mb-6">Untuk Alumni</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="hover:text-[#2A4B50] transition-colors">Masuk</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }} className="hover:text-[#2A4B50] transition-colors">Daftar</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#2A4B50] transition-colors">Perbarui Profil</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#2A4B50] transition-colors">Kirim Data Tracer</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#2A4B50] transition-colors">Kalender Acara</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-black text-[#2A4B50] mb-6">Berlangganan Newsletter</h4>
              <p className="text-slate-500 font-medium text-sm mb-4">Berlangganan untuk menerima pembaruan tentang pekerjaan dan acara.</p>
              <div className="flex flex-col gap-3">
                <input 
                  type="email" 
                  placeholder="Alamat email Anda" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2A4B50] focus:ring-2 focus:ring-[#2A4B50]/20"
                />
                <button className="w-full bg-[#2A4B50] text-white font-bold rounded-xl py-3 hover:bg-[#1E363A] transition-colors cursor-pointer shadow-md">
                  Berlangganan
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-100 text-xs font-bold text-slate-400 gap-4">
            <p>© 2026 Alumni Tracer. Hak cipta dilindungi undang-undang.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#2A4B50]">Kebijakan Privasi</a>
              <a href="#" className="hover:text-[#2A4B50]">Syarat Layanan</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}