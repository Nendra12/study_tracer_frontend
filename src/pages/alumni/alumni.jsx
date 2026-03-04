import React, { useState } from 'react';
import { 
  Search, 
  Briefcase, 
  GraduationCap, 
  Rocket, 
  LineChart, 
  Building2,
  ChevronRight
} from 'lucide-react';
import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';
import Pagination from '../../components/admin/Pagination';
import SmoothDropdown from '../../components/admin/SmoothDropdown';

// --- MOCK DATA ---
const ALUMNI_DATA = [
  { id: 1, name: 'Jane Doe', angkatan: '2019', role: 'Software Engineer', company: 'TechCorp Inc.', status: 'Bekerja', image: 'https://i.pravatar.cc/300?u=jane' },
  { id: 2, name: 'John Smith', angkatan: '2022', role: 'MBA Candidate', company: 'Harvard University', status: 'Kuliah', image: 'https://i.pravatar.cc/300?u=john' },
  { id: 3, name: 'Alice Johnson', angkatan: '2020', role: 'Founder & CEO', company: 'NextGen Solutions', status: 'Wirausaha', image: 'https://i.pravatar.cc/' },
  { id: 4, name: 'Bunga', angkatan: '2018', role: 'Product Manager', company: 'Innovate LLC', status: 'Bekerja', image: 'https://i.pravatar.cc/300?u=bob' },
  { id: 5, name: 'Charlie Davis', angkatan: '2021', role: 'Data Analyst', company: 'Mencari Pekerjaan', status: 'Mencari Pekerjaan', image: 'https://i.pravatar.cc/300?u=charlie' },
  { id: 6, name: 'Sarah Lee', angkatan: '2017', role: 'Product Designer', company: 'Creative Studio', status: 'Bekerja', image: 'https://i.pravatar.cc/300?u=sarah' },
  { id: 7, name: 'Adhyan Agung Elang', angkatan: '2023', role: 'Data Scientist', company: 'Tech Startup', status: 'Bekerja', image: 'https://i.pravatar.cc/300?u=adhyan' },
  { id: 8, name: 'A\'isy Salmaa P.', angkatan: '2022', role: 'Fresh Graduate', company: 'Universitas Brawijaya', status: 'Lulus', image: 'https://i.pravatar.cc/300?u=aisy' },
];

// ikon status
const getStatusStyle = (status) => {
  let icon;
  switch (status) {
    case 'Bekerja': icon = <Briefcase size={16} />; break;
    case 'Kuliah': icon = <GraduationCap size={16} />; break;
    case 'Wirausaha': icon = <Rocket size={16} />; break;
    case 'Mencari Pekerjaan': 
    case 'Mencari': icon = <LineChart size={16} />; break;
    default: icon = <Briefcase size={16} />; break;
  }
  
  return { 
    bg: 'bg-primary/10', 
    text: 'text-primary', 
    icon 
  };
};

// --- OPSI DROPDOWN ---
const tahunOptions = ['Semua Tahun', '2023', '2022', '2021', '2020'];
const statusOptions = ['Semua Status', 'Bekerja', 'Kuliah', 'Wirausaha', 'Mencari Pekerjaan'];
const univOptions = ['Semua Universitas', 'Universitas Indonesia', 'Institut Teknologi Bandung', 'Universitas Gadjah Mada'];

export default function Alumni() {
  const user = { nama_alumni: 'User Test' }; 
  
  const [selectedTahun, setSelectedTahun] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedUniv, setSelectedUniv] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  const handleResetFilters = () => {
    setSelectedTahun('');
    setSelectedStatus('');
    setSelectedUniv('');
  };

  return (
    // Gunakan warna background solid abu-abu sangat terang agar menyatu dengan blur/fade bawah
    <div className="min-h-screen bg-[#f8f9fa] font-sans pb-16">
      <Navbar user={user} />

      {/* --- HEADER & FILTER SECTION --- */}
      {/* pb-48 membuat area gambar memanjang ke bawah melewati area filter */}
      <div className="relative pt-24 pb-48 w-full">
        
        {/* GAMBAR BACKGROUND */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/background3.jpeg" 
            alt="Background" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-white/50 md:bg-gradient-to-r md:from-white/80 md:via-white/60 md:to-white/20"></div>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#f8f9fa]"></div>
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight mb-2 uppercase">Direktori Alumni</h1>
            <p className="text-primary/90 text-sm md:text-base max-w-2xl font-semibold drop-shadow-sm">
              Terhubung dengan para lulusan dan perluas jaringan profesional Anda.
            </p>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 z-10 relative">
            {/* Kolom Pencarian */}
            <div className="relative flex-1 group shadow-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="cari berdasarkan nama, perusahaan, atau peran..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-primary/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-[52px] text-primary placeholder:text-primary/40"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0 drop-shadow-md">
              <div className="w-44 bg-white rounded-2xl">
                <SmoothDropdown options={tahunOptions} value={selectedTahun} onSelect={(val) => setSelectedTahun(val === 'Semua Tahun' ? '' : val)} placeholder="Tahun Kelulusan" />
              </div>
              <div className="w-48 bg-white rounded-2xl">
                <SmoothDropdown options={statusOptions} value={selectedStatus} onSelect={(val) => setSelectedStatus(val === 'Semua Status' ? '' : val)} placeholder="Status Pekerjaan" />
              </div>
              <div className="w-52 bg-white rounded-2xl">
                <SmoothDropdown options={univOptions} value={selectedUniv} onSelect={(val) => setSelectedUniv(val === 'Semua Universitas' ? '' : val)} placeholder="Universitas" isSearchable={true} />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT (CARD AREA) --- */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 -mt-32 relative z-20">
        
        {/* ALUMNI CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ALUMNI_DATA.map((alumni) => {
            const statusStyle = getStatusStyle(alumni.status);
            
            return (
              <div key={alumni.id} className="bg-white rounded-2xl flex flex-col overflow-hidden border border-primary/5 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="h-56 w-full bg-primary/5 relative group overflow-hidden">
                  {alumni.image ? (
                    <img src={alumni.image} alt={alumni.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-primary/20">
                      {alumni.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="font-bold text-primary text-lg leading-tight line-clamp-1">{alumni.name}</h3>
                    <p className="text-xs font-medium text-primary/50 mt-0.5">Angkatan {alumni.angkatan}</p>
                  </div>

                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-start gap-2.5 text-primary/80">
                      <div className="text-primary/40 mt-0.5">{statusStyle.icon}</div>
                      <p className="text-sm font-medium line-clamp-2">{alumni.role}</p>
                    </div>
                    <div className="flex items-start gap-2.5 text-primary/70">
                      <div className="text-primary/40 mt-0.5"><Building2 size={16} /></div>
                      <p className="text-sm line-clamp-2">{alumni.company}</p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${statusStyle.bg} ${statusStyle.text}`}>
                      {alumni.status}
                    </span>
                  </div>
                </div>

                <button className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors">
                  Detail <ChevronRight size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* --- PAGINATION --- */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

      </main>
      <Footer />
    </div>
  );
}