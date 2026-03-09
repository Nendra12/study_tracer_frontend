import React from "react";
import { motion } from "framer-motion";
import Stats from "../assets/svg/stats-graph-svgrepo-com.svg"
import Education from "../assets/svg/education-svgrepo-com.svg"
import EducationStats from "../assets/svg/education-bag-learning-7-svgrepo-com.svg"
import Relation from "../assets/svg/users-relation-svgrepo-com.svg"
import Job from "../assets/svg/looking-for-job-svgrepo-com.svg"

// Komponen angka yang animasi muncul
const StatNumber = ({ value, suffix = "" }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl lg:text-5xl font-black text-[#3c5759] tracking-tighter"
    >
      {value}
      {suffix}
    </motion.span>
  );
};

export default function AlumniStats() {
  return (
    <section
      id="fitur"
      className="py-15 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Header Section */}
      <div className="mb-16 gap-6">
        {/* Judul Section */}
        <motion.div
          className=" mx-auto mb-16 space-y-4"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-black text-[#3c5759] tracking-tight">
            Satu Platform, <br />
            <span className="text-[#9ca3af]">Banyak Manfaat.</span>
          </h2>
          <p className="text-[#526061] text-lg font-medium opacity-80">
            Memantau perkembangan karir dan pendidikan alumni SMK Negeri 1
            Gondang secara transparan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-[220px]">
          {/* Box 1: Statistik Utama (Wider) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1 * 0.1 }}
            className="md:col-span-4 lg:col-span-4 bg-white rounded-[2.5rem] p-10 border border-white shadow-sm flex flex-col gap-2 justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#f3f4f4] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative z-10 flex items-center gap-2">
              <img src={Stats} alt="stats" className="w-6" />
              <span className="text-[#3c5759] text-[10px] font-black uppercase tracking-widest">
                Live Data Statistik
              </span>
            </div>

            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col">
                <StatNumber value="2.5" suffix="K" />
                <span className="text-[10px] font-bold text-[#9ca3af] mt-2 uppercase tracking-widest">
                  Total Alumni Aktif
                </span>
              </div>
              <div className="flex flex-col">
                <StatNumber value="85" suffix="%" />
                <span className="text-[10px] font-bold text-[#9ca3af] mt-2 uppercase tracking-widest">
                  Bekerja
                </span>
              </div>
              <div className="flex flex-col">
                <StatNumber value="15" suffix="%" />
                <span className="text-[10px] font-bold text-[#9ca3af] mt-2 uppercase tracking-widest">
                  Kuliah
                </span>
              </div>
              <div className="flex flex-col">
                <StatNumber value="10" suffix="%" />
                <span className="text-[10px] font-bold text-[#9ca3af] mt-2 uppercase tracking-widest">
                  Wirausaha
                </span>
              </div>
            </div>
          </motion.div>

          {/* Box 2: Evaluasi Akurat (Square) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 2 * 0.1 }}
            className="md:col-span-2 lg:col-span-2 bg-[#3c5759] rounded-[2.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute -bottom-6 -right-6 text-9xl opacity-10 rotate-12">
              <img src={Education} alt="education" className="w-40" />
            </div>
            <div className="p-2 w-15 h-15 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl relative z-10">
              <img src={EducationStats} alt="stats" className=""/>
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2 tracking-tight">
                Evaluasi Akurat
              </h3>
              <p className="text-white/60 text-xs font-medium leading-relaxed">
                Membantu sekolah menyesuaikan kurikulum dengan kebutuhan
                industri nyata.
              </p>
            </div>
          </motion.div>

          {/* Box 3: Jejaring Kuat */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 3 * 0.1 }}
            className="md:col-span-2 lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-white shadow-sm flex flex-col justify-between"
          >
            <div className="w-15 h-15 p-2 bg-[#f3f4f4] rounded-2xl flex items-center justify-center text-xl text-[#3c5759]">
              <img src={Relation} alt="stats" className=""/>
            </div>
            <div>
              <h3 className="text-xl font-black text-[#3c5759] mb-2 tracking-tight">
                Jejaring Kuat
              </h3>
              <p className="text-[#526061] text-xs font-medium leading-relaxed">
                Temukan mentor atau rekan bisnis dari lintas angkatan dengan
                mudah dan cepat.
              </p>
            </div>
          </motion.div>

          {/* Box 4: Callout Message (Wider) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 4 * 0.1 }}
            className="md:col-span-4 lg:col-span-4 flex-col lg:flex-row bg-gradient-to-br from-[#526061] to-[#3c5759] rounded-[2.5rem] p-8 md:p-10 text-white flex lg:items-center gap-3 lg:justify-between relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-10"></div>
            <div className="order-2 lg:order-1 max-w-xl relative z-10">
              <h3 className="text-2xl font-bold mb-3 tracking-tight">
                Punya Info Lowongan?
              </h3>
              <p className="text-white/80 text-sm font-medium leading-relaxed">
                Bantu adik kelasmu mendapatkan karir impian dengan membagikan info lowongan kerja dari perusahaan tempatmu bekerja.
              </p>
            </div>
            <div className="order-1 lg:order-2 p-3 w-15 h-15 lg:p-5 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex text-xl relative z-10">
              <img src={Job} alt="stats" className=""/>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
