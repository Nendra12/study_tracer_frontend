import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { STORAGE_BASE_URL } from '../api/axios'; // Pastikan path ini benar

export default function ThumbnailPortal({ user, alumniList = [], stats, itemVariants }) {
  const navigate = useNavigate();

  function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_BASE_URL}/${path}`;
  }

  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-wrap gap-4 pt-2"
    >
      {/* Tombol Masuk Portal */}
      <button
        onClick={() => user ? navigate(user.role === 'admin' ? "/admin" : "/alumni") : navigate("/login")}
        className="bg-primary text-white px-8 py-4 rounded-md font-bold cursor-pointer hover:bg-primary/80 hover:-translate-y-1 transition-all duration-300 ease-in-out shadow-[0_8px_30px_rgba(60,87,89,0.3)] flex items-center gap-2"
      >
        Masuk Portal {user ? (user.role === 'admin' ? 'Admin' : 'Alumni') : 'Alumni'} <span className="text-xl">→</span>
      </button>
      
      {/* Grup Foto Profil & Statistik (Tanpa background card berlebihan) */}
      <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/50 backdrop-blur-sm border border-white/50">
        <div className="flex -space-x-3">
          {alumniList.map((i, index) => {
            if (index >= 4) return null;
            const imgUrl = getImageUrl(i.foto);

            return (
              <div key={index} className="relative z-10 hover:z-20 transition-all">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt="user"
                    loading="lazy" // Optimasi lazy load tetap ada
                    className="w-10 h-10 object-cover rounded-full border-2 border-fourth bg-gray-200"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = `https://ui-avatars.com/api/?name=${i.nama_alumni || 'A'}&background=random`;
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-fourth bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-500">
                    {i.nama_alumni ? i.nama_alumni.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <span className="text-sm font-bold text-primary">
          +{stats?.total_alumni || 0} Bergabung
        </span>
      </div>
    </motion.div>
  );
}