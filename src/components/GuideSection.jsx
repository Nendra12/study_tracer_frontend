import { motion } from "framer-motion";
import Satu from "../assets/svg/Sign up-pana.svg";
import Dua from "../assets/svg/Authentication-rafiki.svg";
import Tiga from "../assets/svg/Exams-amico.svg";
import Empat from "../assets/svg/Done-rafiki.svg";
import { Link } from "react-router-dom";

export default function GuideSection() {
  const steps = [
    {
      title: "Registrasi Akun",
      desc: (
        <>
          Masuk ke halaman pendaftaran{" "}
          <Link
            to="/register"
            className="text-[#3c5759] font-semibold underline hover:text-[#2a3d3e] transition-colors"
          >
            Disini
          </Link>{" "}
          dan lengkapi data diri menggunakan NISN serta email aktif Anda.
        </>
      ),
      icon: Satu,
      accent: "from-blue-400/20 to-blue-600/20",
      iconBg: "bg-blue-500",
    },
    {
      title: "Verifikasi Data",
      desc: "Tim admin akan memvalidasi status kelulusan Anda. Pastikan data angkatan sudah sesuai.",
      icon: Dua,
      accent: "from-emerald-400/20 to-emerald-600/20",
      iconBg: "bg-emerald-500",
    },
    {
      title: "Isi Kuesioner",
      desc: "Lengkapi formulir tracer study mengenai status karir, bekerja, kuliah, atau wirausaha saat ini.",
      icon: Tiga,
      accent: "from-amber-400/20 to-amber-600/20",
      iconBg: "bg-amber-500",
    },
    {
      title: "Selesai & Update",
      desc: "Data Anda tersimpan! Anda kini bisa mengakses portal lowongan kerja dan jejaring alumni.",
      icon: Empat,
      accent: "from-[#3c5759]/20 to-[#526061]/20",
      iconBg: "bg-[#3c5759]",
    },
  ];

  return (
    /* Menggunakan background senada dengan --color-fourth (#f3f4f4)
       Ditambah efek radial gradient lembut agar terlihat lebih premium */
    <section
      id="petunjuk"
      className="py-15 bg-[#f3f4f4] relative overflow-hidden"
    >
      {/* Dekorasi Background Senada */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(60,87,89,0.03)_0%,_transparent_70%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Tengah Atas */}
        <div className="max-w-3xl mb-20 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl lg:text-5xl font-black text-[#3c5759] tracking-tight"
          >
            Petunjuk <span className="text-[#9ca3af]">Pendaftaran</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#526061] text-md font-medium opacity-80"
          >
            Berikut adalah tahapan petunjuk pendaftaran akun Study Tracer SMK Negeri 1 Gondang.
          </motion.p>
        </div>

        {/* 4 Cards Sejajar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Garis Penghubung Modern */}
          <div className="hidden lg:block absolute top-[45%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#3c5759]/10 to-transparent -z-0"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgba(60,87,89,0.08)] transition-all duration-500"
            >
              {/* Step Number Badge */}
              <div className="absolute -top-4 left-10 w-10 h-10 rounded-2xl bg-[#3c5759] text-white flex items-center justify-center text-sm font-black shadow-[0_10px_20px_rgba(60,87,89,0.2)] z-20 group-hover:scale-110 transition-transform">
                0{index + 1}
              </div>

              <div className="relative z-10 flex flex-col items-start text-left">
                {/* Icon dengan Background Senada */}
                <img src={step.icon} alt="" />

                <h3 className="text-xl font-extrabold text-[#3c5759] mb-4 tracking-tight">
                  {step.title}
                </h3>

                <p className="text-[#526061]/80 text-sm leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>

              {/* Hover Accent Glow yang sangat tipis */}
              <div
                className={`absolute inset-0 rounded-[2.5rem] bg-gradient-to-br ${step.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
              ></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
