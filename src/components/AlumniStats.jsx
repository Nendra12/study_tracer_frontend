import React, { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import Stats from "../assets/svg/statistics-bars-graphic-educational-symbol-svgrepo-com.svg"
import Education from "../assets/svg/education-svgrepo-com.svg"
import EducationStats from "../assets/svg/education-bag-learning-7-svgrepo-com.svg"
import Relation from "../assets/svg/users-relation-svgrepo-com.svg"
import Job from "../assets/svg/looking-for-job-svgrepo-com.svg"

// Komponen angka yang animasi muncul (menghitung naik)
const StatNumber = ({ value, suffix = "" }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (isInView) {
      const animation = animate(count, Number(value) || 0, { duration: 2, ease: "easeOut" });
      return () => animation.stop();
    }
  }, [isInView, value, count]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl lg:text-5xl font-black text-primary tracking-tighter"
    >
      <motion.span>{rounded}</motion.span>
      {suffix}
    </motion.span>
  );
};

export default function AlumniStats({ stats }) {
  const bekerja = stats?.career_distribution?.bekerja?.percentage ?? 0;
  const kuliah = stats?.career_distribution?.kuliah?.percentage ?? 0;
  const wirausaha = stats?.career_distribution?.wirausaha?.percentage ?? 0;
  const sumAlumni = stats?.total_alumni ?? 0;
  return (
    <section
      id="fitur"
      className="py-10 px-4 sm:px-6 sm:py-15 lg:px-8  max-w-7xl mx-auto"
    >
      {/* Header Section */}
      <div className=" gap-6">
        {/* Judul Section */}
        <motion.div
          className=" mx-auto mb-16 space-y-4"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-black text-primary tracking-tight">
            Satu Platform, <br />
            <span className="text-third">Banyak Manfaat.</span>
          </h2>
          <p className="text-primary text-lg font-medium opacity-80">
            Memantau perkembangan karir dan pendidikan alumni secara transparan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-[minmax(220px,auto)]">
          {/* Box 1: Statistik Utama (Wider) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1 * 0.1 }}
            className="md:col-span-4 lg:col-span-4 bg-white rounded-md p-10 border border-white shadow-sm flex flex-col gap-2 justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-fourth rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative z-10 mb-6 flex items-center gap-4">
              {/* Container Icon */}
              {/* Catatan: Tailwind bawaan tidak punya w-15/h-15, saya sesuaikan ke w-14/h-14. Jika Anda sudah custom di tailwind.config, silakan kembalikan ke 15 */}
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center shadow-inner">

                {/* SVG yang sudah di-clean up untuk React */}
                <svg
                  className="w-7 h-7 fill-primary" /* <-- Di sini kuncinya: fill-primary dan ukuran icon */
                  viewBox="0 0 31.869 31.869"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0,31.741h7.942V20.543c0-1.506-1.221-2.728-2.728-2.728H2.727C1.221,17.816,0,19.038,0,20.543V31.741z"></path>
                  <path d="M11.966,31.741h7.942V12.085c0-1.506-1.221-2.728-2.727-2.728h-2.49c-1.507,0-2.728,1.221-2.728,2.728L11.966,31.741 L11.966,31.741z"></path>
                  <path d="M26.656,0.127c-1.506,0-2.729,1.221-2.729,2.728v28.887h7.942V2.854c0-1.506-1.223-2.728-2.729-2.728L26.656,0.127 L26.656,0.127z"></path>
                </svg>

              </div>

              {/* Teks Judul */}
              <div className="flex flex-col">
                <h2 className="text-primary text-sm font-black uppercase tracking-widest mb-0.5">
                  Statistik Alumni
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Ringkasan data persebaran lulusan
                </p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col">
                <StatNumber value={sumAlumni} suffix="" />
                <span className="text-[10px] font-bold text-third mt-2 uppercase tracking-widest">
                  Total Alumni Aktif
                </span>
              </div>
              <div className="flex flex-col">
                <StatNumber value={bekerja} suffix="%" />
                <span className="text-[10px] font-bold text-third mt-2 uppercase tracking-widest">
                  Bekerja
                </span>
              </div>
              <div className="flex flex-col">
                <StatNumber value={kuliah} suffix="%" />
                <span className="text-[10px] font-bold text-third mt-2 uppercase tracking-widest">
                  Kuliah
                </span>
              </div>
              <div className="flex flex-col">
                <StatNumber value={wirausaha} suffix="%" />
                <span className="text-[10px] font-bold text-third mt-2 uppercase tracking-widest">
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
            className="md:col-span-2 lg:col-span-2 bg-primary rounded-md p-8 text-white flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute -bottom-6 -right-6 text-9xl opacity-10 rotate-12">
              <img src={Education} alt="education" className="w-40" />
            </div>
            <div className="p-2 w-15 h-15 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-xl relative z-10">
              <img src={EducationStats} alt="stats" className="" />
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
            className="md:col-span-2 lg:col-span-2 bg-white rounded-md p-8 border border-white shadow-sm flex flex-col justify-between"
          >
            <div className="w-15 h-15 p-2 bg-fourth rounded-full flex items-center justify-center text-xl text-primary">
              <svg
                className="w-9 h-9 fill-primary"
                viewBox="0 0 520.071 520.07"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g strokeWidth="0"></g>
                <g strokeLinecap="round" strokeLinejoin="round"></g>
                <g>
                  <g>
                    <g>
                      <circle cx="98.16" cy="60.547" r="57.586"></circle>
                      <path d="M421.917,2.961c31.806,0,57.582,25.783,57.582,57.586s-25.776,57.585-57.582,57.585 c-31.807,0-57.589-25.783-57.589-57.585S390.11,2.961,421.917,2.961z"></path>
                      <path d="M465.129,112.109c-11.337,10.586-26.51,17.117-43.213,17.117c-16.71,0-31.877-6.537-43.214-17.117 c-24.554,6.481-44.083,25.318-51.583,49.414c-21.214-3.91-43.746-6.029-67.082-6.029c-23.338,0-45.867,2.119-67.081,6.029 c-7.498-24.096-27.036-42.933-51.58-49.414c-11.343,10.58-26.51,17.111-43.217,17.111c-16.704,0-31.874-6.531-43.213-17.111 C23.374,120.449,0,149.17,0,183.319v59.77l0.15,0.925l4.123,1.289c12.85,4.013,25.083,7.069,36.78,9.46 c-5.391,11.559-8.334,23.723-8.334,36.289c0,54.272,53.779,101.169,131.199,122.802c-2.858,7.838-4.445,16.278-4.445,25.098v59.77 l0.154,0.934l4.12,1.289c38.792,12.117,72.504,16.166,100.253,16.166c54.189,0,85.594-15.457,87.532-16.438l3.854-1.95h0.408 v-59.77c0-8.382-1.419-16.42-4.008-23.921c79.76-21.072,135.569-68.701,135.569-123.979c0-11.976-2.647-23.578-7.554-34.637 c22.26-4.604,34.803-10.767,36.003-11.378l3.859-1.954l0.408,0.006v-59.77C520.077,149.17,496.705,120.449,465.129,112.109z M471.649,291.052c0,48.965-52.15,91.149-126.62,109.728c-9.806-16.054-25.534-28.117-44.171-33.029 c-11.343,10.58-26.516,17.105-43.217,17.105c-16.698,0-31.874-6.525-43.216-17.105c-18.223,4.812-33.683,16.443-43.524,31.965 C98.65,380.623,48.433,339.101,48.433,291.052c0-11.597,2.976-22.798,8.426-33.407c17.396,2.707,33.337,3.824,47.665,3.824 c54.187,0,85.597-15.451,87.532-16.432l3.854-1.954l0.414,0.006v-59.775c0-2.187-0.104-4.359-0.292-6.496 c20.206-3.644,41.704-5.621,64.007-5.621c22.308,0,43.811,1.977,64.014,5.621c-0.188,2.143-0.295,4.309-0.295,6.502v59.77 l0.153,0.931l4.126,1.289c38.786,12.111,72.501,16.16,100.24,16.16c13.312,0,25.222-0.928,35.684-2.358 C468.936,269.288,471.649,279.986,471.649,291.052z"></path>
                      <circle cx="257.641" cy="316.185" r="57.583"></circle>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-primary mb-2 tracking-tight">
                Jejaring Kuat
              </h3>
              <p className="text-primary/80 text-xs font-medium leading-relaxed">
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
            className="md:col-span-4 lg:col-span-4 flex-col lg:flex-row bg-gradient-to-br from-primary to-primary rounded-md p-8 md:p-10 text-white flex lg:items-center gap-3 lg:justify-between relative "
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
            <div className="order-1 lg:order-2 p-3 w-15 h-15 lg:p-5 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md rounded-full flex text-xl relative z-10">
              <img src={Job} alt="stats" className="" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
