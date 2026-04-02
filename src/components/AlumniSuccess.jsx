import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { STORAGE_BASE_URL } from "../api/axios";

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

const fallbackAlumni = [
  {
    name: "Danendra M.",
    year: "2022",
    role: "Full-stack Dev",
    company: "Tech Startup",
    img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Siti Aminah",
    year: "2019",
    role: "Data Analyst",
    company: "Bank Mandiri",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Rizky Pratama",
    year: "2021",
    role: "UI/UX Designer",
    company: "Gojek",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Alya Rahma",
    year: "2022",
    role: "Digital Marketing",
    company: "Tokopedia",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop",
  },
];

export default function AlumniSuccess({ alumniList }) {
  const alumniData = (alumniList && alumniList.length > 0)
    ? alumniList.slice(0, 4).map(a => {
      const latestStatus = a.riwayat_status?.[0];
      const statusName = latestStatus?.status?.nama_status || a.status || '-';
      const companyName = latestStatus?.pekerjaan?.perusahaan?.nama_perusahaan
        || latestStatus?.kuliah?.universitas?.nama_universitas
        || latestStatus?.wirausaha?.nama_usaha
        || a.company || '-';
      return {
        name: a.nama_alumni || a.name || '-',
        year: a.tahun_lulus ? new Date(a.tahun_lulus).getFullYear() : (a.angkatan || '-'),
        role: statusName,
        company: companyName,
        img: a.foto ? getImageUrl(a.foto) : `https://ui-avatars.com/api/?name=${encodeURIComponent(a.nama_alumni || a.name || 'A')}&background=3C5759&color=fff&size=400`,
      };
    })
    : fallbackAlumni;

  return (
    /* Menggunakan bg-[#f9fafb] (Off-White sedikit hangat) agar beda dengan section sebelumnya */
    <section
      id="alumni"
      className="py-10 px-4 sm:px-6 sm:py-15 lg:px-8  max-w-7xl mx-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header dengan Layout Flex yang dinamis */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className=""
          >
            <h2 className="text-4xl lg:text-5xl font-black text-primary leading-tight mb-4">
              Tetap terhubung dengan <br />
              <span className="text-third">Alumni Kita.</span>
            </h2>
            <p className="text-primary/80 font-medium text-lg italic border-l-4 border-amber-400 pl-4">
              "Pendidikan adalah tiket ke masa depan." — Lihat bagaimana alumni
              kami mewujudkannya.
            </p>
          </motion.div>
        </div>

        {/* Grid Kartu Alumni */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {alumniData.map((alumni, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-md p-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(60,87,89,0.1)] transition-all duration-500"
            >
              {/* Image Container dengan efek zoom */}
              <div className="relative h-72 w-full rounded-md overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent z-10 opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <img
                  src={alumni.img}
                  alt={alumni.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                />

                {/* Floating Badge Year */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-xl shadow-sm">
                    <span className="text-primary text-[12px] font-black ">
                      Angkatan {alumni.year}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Details */}
              <div className="px-3 pb-4">
                <h3 className="text-2xl font-black text-primary group-hover:text-amber-600 transition-colors">
                  {alumni.name}
                </h3>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-sm font-extrabold text-primary/80">
                    {alumni.role}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                    <span className="text-xs font-bold text-third uppercase tracking-widest">
                      {alumni.company}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
