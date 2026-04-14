import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, User, ClipboardCheck, ShieldCheck, Clock, GraduationCap } from 'lucide-react';

export default function HeroBeranda({ greeting, namaAlumni, navigate, tahunLulus, isVerified, hasCompletedKuesioner }) {
  return (
    <div className="relative bg-primary pt-28 pb-32 overflow-hidden rounded-b-[3rem] shadow-xl">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-primary/80 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
      <div className="absolute bottom-[-20%] right-[-5%] w-[30%] h-[50%] bg-fourth/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-white mt-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-start text-left  flex-1 lg:max-w-xl">
            <div className="flex items-center gap-3 font-semibold mb-4 bg-white/10 border border-white/20 px-4 py-2 rounded-md backdrop-blur-sm shadow-lg">
              {greeting.icon}
              <span className="text-white text-sm md:text-base tracking-wide">{greeting.text}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-tight">
              Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-fourth to-third">{namaAlumni ? namaAlumni.split(' ')[0] : 'Alumni'}</span>
            </h1>
            <p className="text-lg text-[#cbd5e1] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed font-medium">
              Portal ini dirancang untuk memantau progres karir Anda, menemukan peluang eksklusif, dan menjaga silaturahmi dengan almamater tercinta.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
              <button onClick={() => navigate("/alumni/lowongan")} className="cursor-pointer w-full sm:w-auto px-8 py-3.5 bg-white text-primary rounded-md text-sm font-black shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 transition-all duration-300">
                <ArrowRight size={18} /> Lihat Lowongan 
              </button>
              <button onClick={() => navigate('/alumni/profile')} className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-md text-sm font-bold backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                <User size={18} /> Perbarui Profil
              </button>
            </div>
          </motion.div>

          <div className="hidden lg:flex relative z-10 w-full max-w-[450px] h-[320px] items-center justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.8, rotate: -5 }} animate={{ opacity: 1, scale: 1, rotate: -2, y: [-8, 8, -8] }} transition={{ opacity: { duration: 0.6, delay: 0.2 }, rotate: { duration: 0.6, delay: 0.2 }, y: { repeat: Infinity, duration: 6, ease: "easeInOut" } }} className="absolute inset-0 m-auto w-[340px] h-[210px] bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-sm">
                    <ClipboardCheck size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-base tracking-wide leading-tight">Data Tracer</h4>
                    <p className="text-slate-500 text-xs font-medium">Tahun Lulus: {tahunLulus}</p>
                  </div>
                </div>
                {isVerified ? (
                  <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                    <ShieldCheck size={12} strokeWidth={3} /> Terverifikasi
                  </div>
                ) : (
                  <div className="bg-amber-500/20 border border-amber-500/50 text-amber-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                    <Clock size={12} strokeWidth={3} /> Pending
                  </div>
                )}
              </div>

              <div className="relative z-10 space-y-3">
                <div className="flex justify-between text-xs font-bold items-end">
                  <span className="text-slate-600">Progres Kuesioner</span>
                  <span className="text-2xl font-black text-primary">{hasCompletedKuesioner ? "100%" : "75%"}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-[2px] border border-slate-200">
                  <motion.div initial={{ width: 0 }} animate={{ width: hasCompletedKuesioner ? "100%" : "75%" }} transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }} className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full relative">
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                  </motion.div>
                </div>
                <p className="text-[10px] text-slate-400 italic font-medium">
                  {hasCompletedKuesioner ? "Terima kasih telah mengisi kuesioner." : "Selesaikan bagian kuesioner untuk divalidasi sistem."}
                </p>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, y: [-4, 4, -4] }} transition={{ opacity: { delay: 0.9, duration: 0.4 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1.5 } }} className="absolute top-10 -left-6 z-0 bg-white/10 border border-white/20 w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center text-white backdrop-blur-md rotate-12">
              <GraduationCap size={22} strokeWidth={2} />
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}