import React from 'react';
import { Image as ImageIcon, ArrowLeft, Eye } from 'lucide-react';

export default function PreviewLogin({ primaryColor, loginBg, logo, namaSekolah }) {
  return (
    <div className="space-y-12 animate-in fade-in duration-500 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs shadow-sm" style={{ backgroundColor: primaryColor }}>1</span>
          Simulasi Halaman Login
        </h4>
        <div className="flex h-[400px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Left: Background Image */}
          <div className="w-1/2 relative bg-gray-200 overflow-hidden">
            {loginBg ? (
              <img src={loginBg} className="w-full h-full object-cover" alt="Login BG" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <ImageIcon size={32} />
                <span className="text-xs mt-2 font-medium">Belum ada gambar background</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
              <ArrowLeft size={12} style={{ color: primaryColor }} />
              <div className="text-[10px] font-bold" style={{ color: primaryColor }}>Kembali Ke Landing Page</div>
            </div>

            <div className="absolute bottom-10 left-6 right-6 flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white rounded-full p-1.5 shrink-0 flex items-center justify-center shadow-md">
                {logo ? <img src={logo} className="w-full h-full object-contain" alt="Logo" /> : <ImageIcon size={16} className="text-gray-400" />}
              </div>
              <div>
                <div className="text-white text-[13px] font-black drop-shadow-md">Alumni Tracer Study</div>
              </div>
            </div>

            <div className="absolute bottom-4 left-6 right-6 text-white/90 text-[10px] leading-relaxed font-medium drop-shadow-md">
              Masuk dan terhubung kembali dengan <span className="font-bold">{namaSekolah || 'SMKN 2 Kraksaan'}</span>. Pantau peluang kerja dan tetap dekat dengan sesama alumni.
            </div>
          </div>

          {/* Right: Login Form */}
          <div className="w-1/2 p-8 flex flex-col justify-center">
            <div className="text-2xl font-black mb-1" style={{ color: primaryColor }}>Selamat Datang</div>
            <div className="text-xs mb-6 text-gray-500 font-medium">Masukan email dan password untuk mengakses akun anda</div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-gray-700">Email</div>
                <div className="h-10 w-full border border-gray-200 rounded-lg bg-gray-50 px-3 flex items-center">
                  <span className="text-xs text-gray-400">contoh@email.com</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-gray-700">Password</div>
                <div className="h-10 w-full border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between px-3">
                  <span className="text-xs text-gray-400">••••••••</span>
                  <Eye size={14} className="text-gray-400" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded border border-gray-300 bg-white"></div>
                  <div className="text-[10px] text-gray-600 font-medium">Ingatkan saya</div>
                </div>
                <div className="text-[10px] font-bold cursor-pointer hover:underline" style={{ color: primaryColor }}>Lupa password?</div>
              </div>
              <div className="h-10 w-full rounded-xl mt-6 flex items-center justify-center shadow-md cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: primaryColor }}>
                <span className="text-white text-xs font-bold">Masuk →</span>
              </div>
            </div>

            <div className="mt-8 text-center flex items-center justify-center gap-1.5">
              <span className="text-[10px] text-gray-500">Belum punya akun alumni?</span>
              <span className="text-[10px] font-bold cursor-pointer hover:underline" style={{ color: primaryColor }}>Daftar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}