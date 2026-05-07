import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MiniMedsosBeranda from "../../components/alumni/beranda/MiniMedsosBeranda";
import PostsImg from "../../assets/svg/news-broadcast-svgrepo-com.svg";

export default function PostinganAlumni() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !user.can_access_all) {
      navigate('/alumni', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen flex flex-col font-sans selection:bg-primary/20 overflow-x-hidden">
      <section className="relative pt-28 pb-20 w-full z-30 bg-primary rounded-b-[2.5rem]">
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 capitalize">
              Postingan Alumni
            </h1>
            <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed">
              Lihat update terbaru dari alumni, berbagi cerita, dan tetap terhubung dengan komunitas.
            </p>
          </div>

          <div className="hidden lg:flex items-center justify-center opacity-80">
            <img src={PostsImg} alt="postingan" className="w-40" />
          </div>
        </div>
      </section>

      {/* Komponen ini sekarang akan menangani padding dan max-width nya sendiri agar identik dengan Pengumuman */}
      <MiniMedsosBeranda />
    </div>
  );
}