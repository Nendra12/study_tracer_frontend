import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function AlumniSuccess() {
  const alumniData = [
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

  return (
    /* Menggunakan bg-[#f9fafb] (Off-White sedikit hangat) agar beda dengan section sebelumnya */
    <section
      id="alumni"
      className="py-15 bg-[#f3f4f4] px-4 sm:px-6  lg:px-8 overflow-hidden"
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
            <h2 className="text-4xl lg:text-5xl font-black text-[#3c5759] leading-tight mb-4">
              Tetap terhubung dengan <br />
              <span className="text-[#9ca3af]">Alumni Kita.</span>
            </h2>
            <p className="text-[#526061] font-medium text-lg italic border-l-4 border-amber-400 pl-4">
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
              className="group relative bg-white rounded-3xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(60,87,89,0.1)] transition-all duration-500"
            >
              {/* Image Container dengan efek zoom */}
              <div className="relative h-72 w-full rounded-3xl overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gradient-to-t from-[#3c5759]/80 via-transparent to-transparent z-10 opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <img
                  src={alumni.img}
                  alt={alumni.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                />

                {/* Floating Badge Year */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
                    <span className="text-[#3c5759] text-[12px] font-black ">
                      Angkatan {alumni.year}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Details */}
              <div className="px-3 pb-4">
                <h3 className="text-2xl font-black text-[#3c5759] group-hover:text-amber-600 transition-colors">
                  {alumni.name}
                </h3>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-sm font-extrabold text-[#526061]">
                    {alumni.role}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                    <span className="text-xs font-bold text-[#9ca3af] uppercase tracking-widest">
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
