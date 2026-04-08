import React from 'react';
import { Globe } from 'lucide-react';

export default function PreviewMeta({ metaIcon, logo, namaSekolah, metaTitle, metaDescription }) {
  return (
    <div className="flex justify-center items-center h-full min-h-[50vh]">
      <div className="w-full max-w-3xl bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 font-sans text-left">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
            {metaIcon ? (
              <img src={metaIcon} className="w-full h-full object-contain p-1" alt="favicon" />
            ) : logo ? (
              <img src={logo} className="w-full h-full object-contain p-1" alt="favicon" />
            ) : (
              <Globe size={16} className="text-gray-500" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-[#202124] font-medium leading-tight">
              {namaSekolah || "Alumni Tracer"}
            </span>
            <span className="text-xs text-[#4d5156] leading-tight">
              https://alumnitracer.sch.id <span className="opacity-70 ml-1">⋮</span>
            </span>
          </div>
        </div>
        <h3 className="text-[22px] font-medium text-[#1a0dab] hover:underline cursor-pointer mb-2 leading-snug">
          {metaTitle || "Alumni Tracer - Bangun Jejaring Karir Masa Depan"}
        </h3>
        <p className="text-sm text-[#4d5156] leading-relaxed max-w-2xl">
          <span className="font-bold text-[#202124]">Alumni Tracer</span> {metaDescription ? (
            <span>{metaDescription.replace(/^Alumni Tracer/i, '').trim()}</span>
          ) : (
            "dinilai penting karena menjadi alat evaluasi kinerja sekolah dan sekarang telah dijadikan salah satu syarat kelengkapan akreditasi pendidikan."
          )}
        </p>
      </div>
    </div>
  );
}