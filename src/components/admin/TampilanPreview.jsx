import React from 'react';
import { Eye, X, Image as ImageIcon } from 'lucide-react';

export default function TampilanPreview({ 
  isOpen, 
  onClose, 
  primaryColor, 
  secondaryColor, 
  thirdColor,
  logo,
  loginBg,
  namaSekolah 
}) {
  if (!isOpen) return null;

  // Helper class untuk teks blur agar konsisten
  const blurredText = "blur-[3px] opacity-60 select-none";

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 shrink-0 bg-white z-10">
          <div className='flex items-center gap-3'>
              <div className='p-2.5 rounded-xl' style={{backgroundColor: `${secondaryColor}`}}>
                <Eye size={22} style={{color: `${primaryColor}`}} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight" style={{color: `${primaryColor}`}}>Preview Tampilan Aplikasi</h3>
                <p className='text-xs font-medium' style={{color: `${thirdColor}`}}>
                  Simulasi warna pada Halaman Login, Landing Page, dan Dashboard.
                </p>
              </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* KONTEN PREVIEW (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-10 bg-gray-50/50 custom-scrollbar">
          
          {/* ========================================================= */}
          {/* 1. PREVIEW HALAMAN LOGIN */}
          {/* ========================================================= */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
               <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs" style={{backgroundColor: primaryColor}}>1</span>
               Simulasi Halaman Login
            </h4>
            <div className="flex h-[320px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
               {/* Left: Background Image */}
               <div className="w-1/2 relative bg-gray-200 overflow-hidden">
                  {loginBg ? (
                     <img src={loginBg} className="w-full h-full object-cover" alt="Login BG" />
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-gray-400"><ImageIcon size={32}/><span className="text-[10px] mt-2">No Image</span></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3">
                     <div className="w-10 h-10 bg-white rounded-full p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                        {logo ? <img src={logo} className="w-full h-full object-contain" /> : <ImageIcon size={16} className="text-gray-400"/>}
                     </div>
                     <div>
                        <div className={`text-white text-sm font-black ${blurredText}`}>{namaSekolah}</div>
                        <div className={`text-white/80 text-[8px] ${blurredText}`}>Portal Resmi Tracer Study</div>
                     </div>
                  </div>
               </div>
               
               {/* Right: Login Form */}
               <div className="w-1/2 p-8 flex flex-col justify-center">
                  <div className={`text-2xl font-black text-gray-800 ${blurredText}`}>Selamat Datang</div>
                  <div className={`text-[10px] text-gray-500 mb-6 mt-1 ${blurredText}`}>Masukan email dan password untuk mengakses akun anda</div>
                  
                  <div className="space-y-4">
                     <div className="space-y-1.5">
                        <div className={`text-[9px] font-bold text-gray-700 ${blurredText}`}>Email</div>
                        <div className="h-9 w-full border border-gray-200 rounded-lg bg-gray-50"></div>
                     </div>
                     <div className="space-y-1.5">
                        <div className={`text-[9px] font-bold text-gray-700 ${blurredText}`}>Password</div>
                        <div className="h-9 w-full border border-gray-200 rounded-lg bg-gray-50"></div>
                     </div>
                     <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-1.5">
                           <div className="w-3 h-3 rounded border border-gray-300"></div>
                           <div className={`text-[8px] text-gray-500 ${blurredText}`}>Ingatkan saya</div>
                        </div>
                        <div className={`text-[8px] font-bold ${blurredText}`} style={{color: primaryColor}}>Lupa password?</div>
                     </div>
                     <div className="h-10 w-full rounded-xl mt-4 flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                        <span className={`text-white text-[11px] font-bold ${blurredText}`}>Masuk →</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. PREVIEW LANDING PAGE */}
          {/* ========================================================= */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
               <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs" style={{backgroundColor: primaryColor}}>2</span>
               Simulasi Landing Page
            </h4>
            <div className="h-[320px] bg-[#f8f9fa] border border-gray-200 rounded-2xl overflow-hidden shadow-sm relative flex flex-col">
               {/* Efek Latar Blur di Landing */}
               <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[80px] opacity-20 pointer-events-none" style={{backgroundColor: primaryColor}}></div>
               <div className="absolute bottom-[-20%] right-[-5%] w-[40%] h-[60%] rounded-full blur-[80px] opacity-30 pointer-events-none" style={{backgroundColor: secondaryColor}}></div>

               {/* Navbar Landing */}
               <div className="h-12 bg-white/60 backdrop-blur-md border-b border-white/50 flex items-center justify-between px-6 z-10 shrink-0">
                  <div className="flex items-center gap-2">
                     <div className="w-6 h-6 bg-white rounded-full p-1 overflow-hidden shadow-sm">
                        {logo ? <img src={logo} className="w-full h-full object-contain" /> : <ImageIcon size={12} className="text-gray-400"/>}
                     </div>
                     <span className={`text-xs font-black ${blurredText}`} style={{ color: primaryColor }}>{namaSekolah}</span>
                  </div>
                  <div className={`flex gap-4 ${blurredText}`}>
                     <span className="text-[9px] font-bold text-gray-600">Beranda</span>
                     <span className="text-[9px] font-bold text-gray-600">Fitur</span>
                     <span className="text-[9px] font-bold text-gray-600">Bursa Kerja</span>
                  </div>
               </div>

               {/* Hero Section */}
               <div className="flex-1 p-8 flex flex-col justify-center relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-white mb-4 w-fit shadow-sm">
                     <div className="w-3 h-3 rounded-full" style={{backgroundColor: primaryColor}}></div>
                     <span className={`text-[8px] font-bold ${blurredText}`} style={{color: primaryColor}}>Selamat datang di Tracer Study</span>
                  </div>
                  <div className={`text-3xl font-black leading-tight ${blurredText}`} style={{ color: primaryColor }}>
                    Tetap Terhubung <br/> dengan Alumni <br/> <span style={{ color: thirdColor }}>{namaSekolah}.</span>
                  </div>
                  <div className={`mt-3 text-[10px] max-w-[60%] leading-relaxed ${blurredText}`} style={{ color: thirdColor }}>
                    Bagikan perjalanan karirmu, lihat perkembangan teman-teman alumni, temukan info lowongan kerja, dan bangun jaringan yang lebih luas.
                  </div>
                  <div className="mt-6 px-6 py-3 w-max rounded-xl text-[11px] font-bold text-white shadow-lg flex items-center justify-center gap-2" style={{ backgroundColor: primaryColor }}>
                    <span className={`${blurredText}`}>Masuk Portal Alumni</span> →
                  </div>
               </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. PREVIEW DASHBOARD ADMIN/ALUMNI */}
          {/* ========================================================= */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
               <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs" style={{backgroundColor: primaryColor}}>3</span>
               Simulasi Dashboard
            </h4>
            <div className="h-[320px] border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex">
               {/* Sidebar */}
               <div className="w-40 flex flex-col p-4 shrink-0" style={{ backgroundColor: primaryColor }}>
                  <div className="flex items-center gap-2.5 mb-6">
                     <div className="w-8 h-8 bg-white rounded-lg p-1 flex items-center justify-center overflow-hidden">
                        {logo ? <img src={logo} className="w-full h-full object-contain" /> : <ImageIcon size={16} className="text-gray-400"/>}
                     </div>
                     <div className="flex flex-col">
                       <span className={`text-[10px] font-black text-white ${blurredText}`}>{namaSekolah}</span>
                       <span className={`text-[7px] text-white/70 ${blurredText}`}>Admin Portal</span>
                     </div>
                  </div>
                  <div className="space-y-1.5 flex-1">
                     {[1,2,3,4,5].map(i => (
                       <div key={i} className={`h-8 rounded-lg flex items-center px-3 gap-2 ${i === 1 ? 'bg-white/10 shadow-sm' : 'opacity-70'}`}>
                          <div className="w-3 h-3 rounded bg-white/20"></div>
                          <div className={`h-2 rounded-full ${i===1 ? 'bg-white w-20' : 'bg-white/60 w-16'} ${blurredText}`}></div>
                       </div>
                     ))}
                  </div>
               </div>
               
               {/* Main Content Area */}
               <div className="flex-1 flex flex-col bg-gray-50">
                  {/* Header */}
                  <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-5 shrink-0">
                     <div className={`text-xs font-black ${blurredText}`} style={{ color: primaryColor }}>Dashboard Utama</div>
                     <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                  </div>
                  
                  {/* Content Cards */}
                  <div className="p-5 space-y-4 overflow-hidden" style={{ backgroundColor: secondaryColor }}>
                     {/* Top Stats */}
                     <div className="flex gap-4">
                       <div className="flex-1 bg-white h-20 rounded-xl border border-gray-100 p-3 shadow-sm flex flex-col justify-center">
                         <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${blurredText}`} style={{ color: thirdColor }}>Total Alumni</div>
                         <div className={`text-2xl font-black ${blurredText}`} style={{ color: primaryColor }}>1.250</div>
                       </div>
                       <div className="flex-1 bg-white h-20 rounded-xl border border-gray-100 p-3 shadow-sm flex flex-col justify-center">
                         <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${blurredText}`} style={{ color: thirdColor }}>Lowongan Aktif</div>
                         <div className={`text-2xl font-black ${blurredText}`} style={{ color: primaryColor }}>84</div>
                       </div>
                     </div>
                     {/* List Area */}
                     <div className="bg-white h-32 rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
                        <div className={`text-[10px] font-bold ${blurredText}`} style={{ color: primaryColor }}>Aktivitas Terbaru</div>
                        {[1,2].map(i => (
                           <div key={i} className="flex items-center gap-3 border-b border-gray-50 pb-2">
                              <div className="w-6 h-6 rounded-full bg-gray-100 shrink-0"></div>
                              <div className="flex-1">
                                 <div className={`h-2 bg-gray-200 rounded w-full mb-1.5 ${blurredText}`}></div>
                                 <div className={`h-1.5 bg-gray-100 rounded w-2/3 ${blurredText}`}></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>

        </div>

        {/* FOOTER MODAL */}
        <div className="p-5 md:p-6 border-t border-gray-100 bg-white shrink-0 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
            style={{backgroundColor: primaryColor}}
          >
            Tutup Preview
          </button>
        </div>
      </div>
    </div>
  );
}