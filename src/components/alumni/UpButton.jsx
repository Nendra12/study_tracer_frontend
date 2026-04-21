"use client";

import { ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function UpButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Monitor scroll position to show/hide the button
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Function to execute the smooth scroll back to the top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        /* Tambahan: 
          - shadow-lg agar lebih menonjol
          - backdrop-blur untuk efek modern (opsional)
          - pointer-events-none saat sembunyi agar tidak menghalangi klik
          - hover:bg-third (asumsi 'third' adalah warna custom di tailwind.config)
        */
        className={`fixed cursor-pointer bottom-6 right-6 md:bottom-8 md:right-8 z-50 p-2 md:p-3 rounded-full border-2 border-third text-third bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-500 ease-in-out flex items-center justify-center group ${
          isVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-10 pointer-events-none"
        } hover:bg-third hover:text-white hover:scale-110 hover:shadow-xl`}
      >
        {/* Ikon dengan kelas custom untuk animasi saat di-hover */}
        <ChevronUp className="w-6 h-6 icon-float transition-colors duration-300" />
      </button>

      {/* Custom CSS untuk animasi ikon */}
      <style jsx global>{`
        /* Animasi default (opsional, bisa dihapus jika hanya ingin animasi saat hover) */
        @keyframes float-up {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px); /* Ikon naik sedikit */
          }
        }

        /* Ikon akan memantul ke atas dan ke bawah secara terus-menerus SAAT tombol di-hover */
        .group:hover .icon-float {
          animation: float-up 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}