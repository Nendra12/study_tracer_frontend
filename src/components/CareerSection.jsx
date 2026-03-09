import React from 'react';
import { motion } from 'framer-motion';
import { MapIcon, MapPin, MoveUpRight } from 'lucide-react';

export default function CareerSection() {
  const jobs = [
    {
      role: "Frontend Developer (React)",
      type: "Full-time",
      loc: "Jakarta Selatan",
      comp: "TechAsia Inc.",
      desc: "Membangun antarmuka modern untuk platform edukasi digital.",
      banner: "https://i.pinimg.com/736x/13/40/11/1340118d98bb8e13d0fc55fa303a13ab.jpg"
    },
    {
      role: "Network Administrator",
      type: "Contract",
      loc: "Surabaya",
      comp: "Telkomsel",
      desc: "Maintenance infrastruktur jaringan dan keamanan server.",
      banner: "https://i.pinimg.com/736x/51/a4/86/51a4862d1dbfb9f45315d381c1526f21.jpg"
    },
    {
      role: "Graphic Designer",
      type: "Remote",
      loc: "Global",
      comp: "Kreativ Studio",
      desc: "Menciptakan aset visual kreatif untuk brand internasional.",
      banner: "https://i.pinimg.com/736x/ee/e8/ca/eee8cae4c277e4868e8c7d617b6ac545.jpg"
    },
    {
      role: "Finance Staff",
      type: "Full-time",
      loc: "Semarang",
      comp: "Indofood",
      desc: "Mengelola laporan keuangan dan administrasi pajak.",
      banner: "https://i.pinimg.com/736x/a1/d5/ab/a1d5aba26b169b4d13b621a2c9a01d3a.jpg"
    }
  ];

  return (
    <section id="karir" className="py-15 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className=" relative">

        {/* Header Section */}
        <motion.div
          className="mx-auto mb-16"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-black text-[#3c5759] tracking-tight mb-4">
            Lowongan <span className="text-[#9ca3af]">Pekerjaan</span>
          </h2>
          <p className="text-[#526061] font-medium">
            Informasi lowongan terbaru hasil kurasi jaringan alumni dan mitra strategis SMKN 1 Gondang.
          </p>
        </motion.div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {jobs.map((job, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white cursor-pointer rounded-[2rem] overflow-hidden border border-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(60,87,89,0.1)] transition-all duration-500 flex flex-col"
            >
              {/* Job Banner */}
              <div className="h-60 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                <img
                  src={job.banner}
                  alt={job.role}
                  className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-[#3c5759] uppercase">
                    {job.type}
                  </span>
                </div>
              </div>

              {/* Job Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#3c5759] leading-tight mb-1 group-hover:text-amber-600 transition-colors">
                    {job.role}
                  </h3>
                  <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider">
                    {job.comp}
                  </p>
                </div>

                <p className="text-sm text-[#526061] leading-relaxed mb-6 line-clamp-2">
                  {job.desc}
                </p>

                {/* Footer Card */}
                <div className="mt-auto pt-4 border-t border-[#f3f4f4] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#9ca3af]">
                    <MapPin />
                    <span className="text-xs font-bold">{job.loc}</span>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-[#f3f4f4] text-[#3c5759] flex items-center justify-center group-hover:bg-[#3c5759] group-hover:text-white transition-all">
                    <MoveUpRight size={15}/>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
