import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const getPageNumbers = (current, last) => {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', last];
  if (current >= last - 3) return [1, '...', last - 4, last - 3, last - 2, last - 1, last];
  return [1, '...', current - 1, current, current + 1, '...', last];
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    // 1. Ubah flex menjadi flex-col untuk mobile, dan sm:flex-row untuk tablet/desktop
    // Tambahkan gap-3 agar saat menumpuk di mobile ada jaraknya
    <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 rounded-b-lg w-full">
      
      <span className="text-xs text-slate-500 font-medium text-center sm:text-left">
        Hal. {currentPage} dari {totalPages}
      </span>
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-1">
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="cursor-pointer p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          <ChevronLeft size={14} />
        </button>
        
        {getPageNumbers(currentPage, totalPages).map((page, i) => (
          <button
            key={i}
            disabled={page === '...'}
            onClick={() => typeof page === "number" && onPageChange(page)}
            // 3. Modifikasi styling agar titik tiga (...) tidak terlihat seperti tombol aktif
            className={`min-w-[28px] h-7 flex items-center justify-center px-1 rounded-lg text-xs font-bold transition-all ${
              page === '...' 
                ? 'cursor-default bg-transparent text-slate-400 border-transparent' 
                : currentPage === page
                  ? "bg-primary text-white shadow-sm cursor-pointer"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="cursor-pointer p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          <ChevronRight size={14} />
        </button>
      </div>

    </div>
  );
};

export default Pagination;