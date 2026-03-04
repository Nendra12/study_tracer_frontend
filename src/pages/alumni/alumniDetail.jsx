import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Mail, Phone, MapPin, GraduationCap,
  Briefcase, Calendar, ExternalLink, Globe, Award
} from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';

// --- DATA DUMMY DETAIL ---
const ALUMNI_DETAIL = {
  1: {
    id: 1,
    name: 'Jane Doe',
    angkatan: '2019',
    role: 'Software Engineer',
    company: 'TechCorp Inc.',
    status: 'Bekerja',
    location: 'Jakarta, Indonesia',
    image: 'https://i.pravatar.cc/300?u=jane',
    email: 'jane.doe@email.com',
    phone: '+62 812-3456-789',
    bio: 'Berpengalaman 5 tahun dalam mengembangkan aplikasi web berskala besar (scalable). Saat ini aktif mengeksplorasi integrasi AI untuk meningkatkan fungsionalitas aplikasi sehari-hari. Berkomitmen penuh pada penulisan kode yang bersih (clean code), pemeliharaan sistem yang optimal, serta membangun lingkungan kerja yang kolaboratif.',
    skills: ['JavaScript', 'React', 'Node.js', 'System Design', 'Python', 'AWS', 'UI/UX'],
    sosial: {
      linkedin: 'https://linkedin.com/in/janedoe',
      github: 'https://github.com/janedoe',
    },
    pengalaman: [
      {
        title: 'Senior Product Engineer',
        company: 'TechCorp Inc.',
        period: 'Jan 2023 - Present',
        description: 'Insinyur utama untuk rangkaian produk inti. Merancang solusi micro-frontend yang meningkatkan kecepatan penyebaran sebesar 40%.'
      },
      {
        title: 'Junior Developer',
        company: 'Innovate Corp',
        period: '2019 - 2022',
        description: 'Mengembangkan dan memelihara aplikasi web yang menghadap pelanggan. Berkolaborasi dengan tim desain untuk komponen UI responsif.'
      },
    ],
    pendidikan: [
      {
        institution: 'State University of Tech',
        degree: 'B.S. Computer Science',
        year: '2019',
        description: 'Lulus dengan pujian (Honors). Spesialisasi dalam Rekayasa Perangkat Lunak.'
      },
    ],
  },
  2: {
    id: 2,
    name: 'John Smith',
    angkatan: '2022',
    role: 'MBA Candidate',
    company: 'Harvard University',
    status: 'Kuliah',
    location: 'Boston, USA',
    image: 'https://i.pravatar.cc/300?u=john',
    email: 'john.smith@email.com',
    phone: '+1 555-234-5678',
    bio: 'Lulusan teknik industri yang saat ini menempuh program MBA di Harvard University. Memiliki passion di bidang business strategy dan product management.',
    skills: ['Business Strategy', 'Product Management', 'Data Analysis', 'Leadership', 'Excel'],
    sosial: {
      linkedin: 'https://linkedin.com/in/johnsmith',
      github: null,
    },
    pengalaman: [
      {
        title: 'Business Analyst Intern',
        company: 'McKinsey & Company',
        period: 'Jun 2021 - Aug 2021',
        description: 'Mengerjakan proyek konsultasi untuk klien di industri manufaktur.'
      },
    ],
    pendidikan: [
      {
        institution: 'Harvard University',
        degree: 'MBA',
        year: '2022 - 2024',
        description: 'Fokus pada strategi bisnis dan kewirausahaan.'
      },
    ],
  }
};

export default function AlumniDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  // Ambil data user login secara konsisten
  const user = {
    nama_alumni: authUser?.alumni?.nama_alumni || authUser?.nama || 'Alumni',
    foto: authUser?.alumni?.foto || authUser?.foto,
  };

  const alumni = ALUMNI_DETAIL[id];

  if (!alumni) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-black text-[#3C5759] mb-2">Alumni Tidak Ditemukan</h2>
            <button onClick={() => navigate('/alumni')} className="mt-4 px-6 py-3 bg-[#3C5759] text-white rounded-xl font-bold hover:bg-[#2A3E3F] transition-all">
              Kembali ke Direktori
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-[#3C5759]/20">
      <Navbar user={user} />

      {/* --- HEADER BANNER --- */}
      <div className="relative pt-16 h-[300px] md:h-[350px] overflow-hidden">
        <div className="absolute inset-0 bg-[#3C5759]">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Gelombang SVG */}
        <div className="absolute bottom-0 left-0 w-full leading-[0] z-10">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#f8fafc" d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-20 -mt-32 pb-20">
        
        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-6 md:p-10 mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative shrink-0">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl border-8 border-white shadow-2xl overflow-hidden bg-slate-50">
                <img src={alumni.image} alt={alumni.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-[#3C5759] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border-4 border-white">
                {alumni.status}
              </div>
            </motion.div>

            <div className="flex-1">
              <motion.button 
                whileHover={{ x: -3 }}
                onClick={() => navigate('/alumni')} 
                className="flex items-center gap-2 text-[#3C5759]/40 hover:text-[#3C5759] text-xs font-bold uppercase tracking-widest mb-4 transition-all cursor-pointer"
              >
                <ArrowLeft size={14} /> Kembali ke Direktori
              </motion.button>
              
              <h1 className="text-3xl md:text-5xl font-black text-[#3C5759] tracking-tight leading-none mb-3">
                {alumni.name}
              </h1>
              <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm font-bold text-[#3C5759]/60">
                <span className="flex items-center gap-2">
                  <Briefcase size={16} className="text-[#3C5759]/30" /> {alumni.role} di <span className="text-[#3C5759]">{alumni.company}</span>
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#3C5759]/30" /> {alumni.location}
                </span>
                <span className="flex items-center gap-2">
                  <GraduationCap size={18} className="text-[#3C5759]/30" /> Angkatan {alumni.angkatan}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* SIDEBAR KIRI (4 Kolom) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xs font-black text-[#3C5759]/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <Globe size={14} /> Tentang Saya
              </h2>
              <p className="text-[#3C5759]/80 text-sm leading-relaxed font-medium">
                {alumni.bio}
              </p>
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xs font-black text-[#3C5759]/30 uppercase tracking-[0.2em] mb-6">Informasi Kontak</h2>
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-black text-[#3C5759]/30 uppercase tracking-widest mb-1">Email</p>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-[#3C5759]/50" />
                    <span className="text-sm font-bold text-[#3C5759]">{alumni.email}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#3C5759]/30 uppercase tracking-widest mb-1">Telepon</p>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-[#3C5759]/50" />
                    <span className="text-sm font-bold text-[#3C5759]">{alumni.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-slate-50">
                {alumni.sosial.linkedin && (
                  <a href={alumni.sosial.linkedin} target="_blank" className="w-12 h-12 rounded-2xl bg-[#3C5759]/5 flex items-center justify-center text-[#3C5759]/60 hover:bg-[#3C5759] hover:text-white transition-all">
                    <FaLinkedin size={20} />
                  </a>
                )}
                {alumni.sosial.github && (
                  <a href={alumni.sosial.github} target="_blank" className="w-12 h-12 rounded-2xl bg-[#3C5759]/5 flex items-center justify-center text-[#3C5759]/60 hover:bg-black hover:text-white transition-all">
                    <FaGithub size={20} />
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xs font-black text-[#3C5759]/30 uppercase tracking-[0.2em] mb-6">Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {alumni.skills.map((skill, idx) => (
                  <span key={idx} className="px-4 py-2 text-[11px] font-black text-[#3C5759]/70 bg-[#3C5759]/5 rounded-xl border border-[#3C5759]/5">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* KONTEN KANAN (8 Kolom) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Pengalaman */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-black text-[#3C5759] tracking-tight flex items-center gap-3 mb-10">
                <Briefcase size={22} /> Pengalaman Karir
              </h2>
              <div className="relative pl-8 border-l-2 border-slate-100 space-y-12">
                {alumni.pengalaman.map((exp, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-white border-4 border-[#3C5759] z-10" />
                    <span className="text-[10px] font-black text-[#3C5759]/40 uppercase tracking-[0.2em]">{exp.period}</span>
                    <h3 className="text-lg font-black text-[#3C5759] mt-1">{exp.title}</h3>
                    <p className="text-sm font-bold text-[#3C5759]/50 mb-4">{exp.company}</p>
                    <p className="text-sm text-[#3C5759]/70 leading-relaxed italic bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                      "{exp.description}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pendidikan */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-black text-[#3C5759] tracking-tight flex items-center gap-3 mb-10">
                <GraduationCap size={22} /> Riwayat Pendidikan
              </h2>
              <div className="relative pl-8 border-l-2 border-slate-100 space-y-12">
                {alumni.pendidikan.map((edu, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-white border-4 border-[#3C5759] z-10" />
                    <span className="text-[10px] font-black text-[#3C5759]/40 uppercase tracking-[0.2em]">{edu.year}</span>
                    <h3 className="text-lg font-black text-[#3C5759] mt-1">{edu.institution}</h3>
                    <p className="text-sm font-bold text-[#3C5759]/50 mb-2">{edu.degree}</p>
                    <p className="text-sm text-[#3C5759]/70 leading-relaxed">{edu.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}