import React from 'react';
import { createPortal } from 'react-dom';
import { Eye, X, Image as ImageIcon, ArrowLeft } from 'lucide-react';

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

  // Helper class untuk teks blur agar rapi dan konsisten
  const blurredText = "blur-[3px] opacity-60 select-none";

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 md:p-6 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 shrink-0 bg-white z-10 shadow-sm">
          <div className='flex items-center gap-3'>
              <div className='p-2.5 rounded-xl' style={{backgroundColor: `${secondaryColor}`}}>
                <Eye size={22} style={{color: `${primaryColor}`}} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight" style={{color: `${primaryColor}`}}>Preview Tampilan Aplikasi</h3>
                <p className='text-xs font-medium' style={{color: `${thirdColor}`}}>
                  Simulasi struktur asli Halaman Login dan Landing Page.
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

        {/* KONTEN PREVIEW (SCROLLABLE MODAL) */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-12 bg-gray-100/50 custom-scrollbar">
          
          {/* ========================================================= */}
          {/* 1. PREVIEW HALAMAN LOGIN (Sesuai Gambar) */}
          {/* ========================================================= */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
               <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs shadow-sm" style={{backgroundColor: primaryColor}}>1</span>
               Simulasi Halaman Login
            </h4>
            <div className="flex h-[360px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
               {/* Left: Background Image */}
               <div className="w-1/2 relative bg-gray-200 overflow-hidden">
                  {loginBg ? (
                     <img src={loginBg} className="w-full h-full object-cover" alt="Login BG" />
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                       <ImageIcon size={32}/>
                       <span className="text-[10px] mt-2">No Image</span>
                     </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Tombol Kembali ke Landing Page */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                     <ArrowLeft size={10} style={{color: primaryColor}} />
                     <div className={`text-[7px] font-bold ${blurredText}`} style={{color: primaryColor}}>Kembali Ke Landing Page</div>
                  </div>

                  {/* Detail Bawah Logo */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3">
                     <div className="w-10 h-10 bg-white rounded-full p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                        {logo ? <img src={logo} className="w-full h-full object-contain" /> : <ImageIcon size={16} className="text-gray-400"/>}
                     </div>
                     <div>
                        <div className={`text-white text-sm font-black ${blurredText}`}>Alumni Tracer Study</div>
                     </div>
                  </div>
                  <div className={`absolute bottom-2 left-6 right-6 text-white/90 text-[7px] leading-relaxed ${blurredText}`}>
                     Masuk dan terhubung kembali dengan {namaSekolah}. Pantau peluang kerja dan tetap dekat dengan sesama alumni.
                  </div>
               </div>
               
               {/* Right: Login Form */}
               <div className="w-1/2 p-8 flex flex-col justify-center">
                  <div className={`text-2xl font-black ${blurredText}`} style={{color: primaryColor}}>Selamat Datang</div>
                  <div className={`text-[10px] mb-6 mt-1 ${blurredText}`} style={{color: thirdColor}}>Masukan email dan password untuk mengakses akun anda</div>
                  
                  <div className="space-y-4">
                     <div className="space-y-1.5">
                        <div className={`text-[9px] font-bold text-gray-700 ${blurredText}`}>Email</div>
                        <div className="h-9 w-full border border-gray-200 rounded-lg bg-gray-50 px-2 flex items-center">
                           <div className={`h-2 w-1/2 bg-gray-300 rounded ${blurredText}`}></div>
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <div className={`text-[9px] font-bold text-gray-700 ${blurredText}`}>Password</div>
                        <div className="h-9 w-full border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between px-2">
                           <div className={`h-2 w-1/3 bg-gray-300 rounded ${blurredText}`}></div>
                           <Eye size={12} className="text-gray-400" />
                        </div>
                     </div>
                     <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-1.5">
                           <div className="w-3 h-3 rounded border border-gray-300"></div>
                           <div className={`text-[8px] text-gray-500 ${blurredText}`}>Ingatkan saya</div>
                        </div>
                        <div className={`text-[8px] font-bold ${blurredText}`} style={{color: primaryColor}}>Lupa password?</div>
                     </div>
                     <div className="h-10 w-full rounded-xl mt-4 flex items-center justify-center shadow-sm" style={{ backgroundColor: primaryColor }}>
                        <span className={`text-white text-[11px] font-bold ${blurredText}`}>Masuk →</span>
                     </div>
                  </div>

                  <div className="mt-8 text-center flex items-center justify-center gap-1">
                     <span className={`text-[8px] text-gray-500 ${blurredText}`}>Belum punya akun alumni?</span>
                     <span className={`text-[8px] font-bold text-blue-600 ${blurredText}`}>Daftar</span>
                  </div>
               </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. PREVIEW LANDING PAGE (SCROLLABLE & Sesuai Gambar) */}
          {/* ========================================================= */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
               <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs shadow-sm" style={{backgroundColor: primaryColor}}>2</span>
               Simulasi Landing Page (Scrollable)
            </h4>
            
            {/* Kontainer Landing Page - Tinggi Diatur agar isinya bisa discroll */}
            <div className="h-[450px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm relative flex flex-col">
               
               {/* Navbar Landing (Sticky) */}
               <div className="sticky top-0 h-12 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 z-30 shrink-0">
                  <div className="flex items-center gap-2">
                     <div className="w-6 h-6 bg-gray-50 rounded-full p-1 overflow-hidden">
                        {logo ? <img src={logo} className="w-full h-full object-contain" /> : <ImageIcon size={12} className="text-gray-400"/>}
                     </div>
                     <div className="flex flex-col">
                        <span className={`text-[9px] font-black leading-tight ${blurredText}`} style={{ color: primaryColor }}>Alumni Tracer</span>
                        <span className={`text-[6px] font-bold text-gray-500 ${blurredText}`}>{namaSekolah}</span>
                     </div>
                  </div>
                  <div className={`flex gap-4 ${blurredText}`}>
                     <div className="w-8 h-1.5 bg-gray-200 rounded-full"></div>
                     <div className="w-8 h-1.5 bg-gray-200 rounded-full"></div>
                     <div className="w-8 h-1.5 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="w-16 h-5 rounded-md shadow-sm" style={{backgroundColor: primaryColor}}></div>
               </div>

               {/* Scrollable Area Content Landing */}
               <div className="flex-1 overflow-y-auto custom-scrollbar relative z-20 pb-0">
                  
                  {/* Hero Section */}
                  <div className="px-8 py-10 flex flex-row items-center min-h-[250px]">
                     <div className="w-1/2 pr-6 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-orange-50 border border-orange-100 mb-4 w-fit">
                           <div className={`text-[7px] font-bold text-orange-600 ${blurredText}`}>Selamat datang di Tracer Study</div>
                        </div>
                        <div className={`text-3xl font-black leading-[1.1] mb-3 ${blurredText}`} style={{ color: primaryColor }}>
                          Tetap Terhubung <br/> dengan Alumni <br/> <span style={{ color: thirdColor }}>{namaSekolah}.</span>
                        </div>
                        <div className={`text-[8px] max-w-[80%] leading-relaxed mb-6 text-gray-500 ${blurredText}`}>
                          Bagikan perjalanan karirmu, lihat perkembangan teman-teman alumni, temukan info lowongan kerja, dan bangun jaringan yang lebih luas.
                        </div>
                        <div className="px-4 py-2 w-max rounded-lg text-[9px] font-bold text-white flex items-center justify-center gap-2 shadow-md" style={{ backgroundColor: primaryColor }}>
                          <span className={`${blurredText}`}>Masuk Portal Alumni</span>
                        </div>
                     </div>
                     {/* Hero Visual Collage Mock */}
                     <div className="w-1/2 relative h-full min-h-[200px]">
                        <div className="absolute right-0 top-0 w-[80%] h-48 bg-gray-200 rounded-2xl shadow-inner flex flex-col items-center justify-center border-4 border-white">
                           <ImageIcon size={24} className="text-gray-400"/>
                        </div>
                        {/* Floating mini stats */}
                        <div className="absolute left-0 top-10 bg-white p-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 w-28">
                           <div className="w-6 h-6 bg-gray-100 rounded-md"></div>
                           <div className="space-y-1">
                             <div className={`w-8 h-2 bg-gray-300 rounded-full ${blurredText}`}></div>
                             <div className={`w-12 h-1.5 bg-gray-200 rounded-full ${blurredText}`}></div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Petunjuk Section */}
                  <div className="px-8 py-8 bg-gray-50/50 border-y border-gray-100">
                     <div className={`text-lg font-black mb-1 ${blurredText}`} style={{color: primaryColor}}>Petunjuk Pendaftaran</div>
                     <div className={`text-[8px] text-gray-500 mb-6 ${blurredText}`}>Berikut adalah tahapan petunjuk pendaftaran alumni study tracer.</div>
                     <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                             <div className="h-16 w-full bg-gray-100 rounded-xl mb-3 flex items-center justify-center"><ImageIcon size={16} className="text-gray-300"/></div>
                             <div className={`h-2.5 w-2/3 bg-gray-300 rounded-full mb-2 ${blurredText}`}></div>
                             <div className={`h-1.5 w-full bg-gray-200 rounded-full mb-1 ${blurredText}`}></div>
                             <div className={`h-1.5 w-4/5 bg-gray-200 rounded-full ${blurredText}`}></div>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* ========================================================= */}
                  {/* Bagian Statistik dan Manfaat (Mirip image_10.png) */}
                  {/* ========================================================= */}
                  <div className="px-8 py-10 space-y-8">
                    
                    {/* Baris Pertama: Statistik Besar dan Evaluasi */}
                    <div className="flex gap-6">
                      
                      {/* Kontainer Pil Statistik Besar (Kiri) */}
                      <div className="w-2/3 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col">
                        {/* Efek Gradien Krem Lembut di Kanan (Mewakili gumpalan) */}
                        <div className="absolute right-0 top-0 bottom-0 w-1/3 rounded-r-[2rem] bg-gradient-to-l from-cream-100 to-white"></div>
                        
                        {/* Judul "LIVE DATA STATISTIK" dengan Ikon */}
                        <div className="flex items-center gap-2 mb-8 relative z-10">
                          <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center p-0.5">
                              {/* Representasi Ikon Grafik Warna-warni */}
                              <div className="w-1.5 h-4 bg-red-400 rounded-sm"></div>
                              <div className="w-1.5 h-3.5 bg-yellow-400 rounded-sm"></div>
                              <div className="w-1.5 h-5 bg-green-400 rounded-sm"></div>
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${blurredText}`} style={{color: thirdColor}}>LIVE DATA STATISTIK</span>
                        </div>
                        
                        {/* Metrik Horizontal */}
                        <div className="grid grid-cols-4 gap-4 relative z-10 flex-1 items-end">
                          {[
                            { value: '109', label: 'TOTAL ALUMNI AKTIF' },
                            { value: '38%', label: 'BEKERJA' },
                            { value: '37%', label: 'KULIAH' },
                            { value: '25%', label: 'WIRAUSAHA' },
                          ].map((stat, i) => (
                            <div key={i} className="text-center">
                              <div className={`text-4xl font-black ${blurredText}`} style={{color: primaryColor}}>{stat.value}</div>
                              <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${blurredText}`} style={{color: thirdColor}}>{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Kontainer Pil Evaluasi (Kanan Atas) */}
                      <div className="w-1/3 rounded-[2rem] p-8 shadow-sm" style={{backgroundColor: primaryColor}}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl">
                            {/* Representasi Ikon Topi Toga */}
                            <div className="w-6 h-4 bg-white rounded-t-sm"></div>
                            <div className="w-1 h-3 bg-white rounded-full"></div>
                          </div>
                          <span className={`text-[11px] font-bold ${blurredText}`} style={{color: secondaryColor}}>Evaluasi Akurat</span>
                        </div>
                        <div className={`text-[9px] leading-relaxed ${blurredText}`} style={{color: secondaryColor}}>
                          Membantu sekolah menyesuaikan kurikulum dengan kebutuhan industri nyata.
                        </div>
                      </div>
                    </div>
                    
                    {/* Baris Kedua: Jejaring dan Lowongan */}
                    <div className="flex gap-6">
                      
                      {/* Kontainer Pil Jejaring Kuat (Kiri Bawah) */}
                      <div className="w-1/3 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xl">
                              {/* Representasi Ikon Dua Orang */}
                              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                              <div className="w-4 h-4 rounded-full bg-gray-300 -ml-1"></div>
                          </div>
                          <span className={`text-[11px] font-bold ${blurredText}`} style={{color: primaryColor}}>Jejaring Kuat</span>
                        </div>
                        <div className={`text-[9px] leading-relaxed ${blurredText}`} style={{color: thirdColor}}>
                          Temukan mentor atau rekan bisnis dari lintas angkatan dengan mudah dan cepat.
                        </div>
                      </div>
                      
                      {/* Kontainer Pil Punya Info Lowongan? (Kanan Bawah) */}
                      <div className="w-2/3 rounded-[2rem] p-8 shadow-sm flex items-center justify-between" style={{backgroundColor: primaryColor}}>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl">
                                  {/* Representasi Ikon Lowongan Kerja */}
                                  <div className="w-5 h-4 bg-white rounded-t-sm"></div>
                                  <div className="w-2 h-1 bg-white rounded-full"></div>
                              </div>
                              <span className={`text-[13px] font-black ${blurredText}`} style={{color: secondaryColor}}>Punya Info Lowongan?</span>
                            </div>
                            <div className={`text-[9px] max-w-lg leading-relaxed ${blurredText}`} style={{color: secondaryColor}}>
                              Bantu adik kelasmu mendapatkan karir impian dengan membagikan info lowongan kerja dari perusahaan tempatmu bekerja.
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                            <span className={`text-white text-xl ${blurredText}`}>+</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alumni Kita Section */}
                  <div className="px-8 py-8 bg-gray-50/50 border-t border-gray-100">
                     <div className={`text-lg font-black mb-1 ${blurredText}`} style={{color: primaryColor}}>Tetap terhubung dengan Alumni Kita.</div>
                     <div className="grid grid-cols-4 gap-4 mt-6">
                        {[1, 2, 3, 4].map(i => (
                           <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                              <div className="w-full h-20 flex items-center justify-center" style={{backgroundColor: primaryColor}}>
                                <span className={`text-white text-2xl font-black opacity-50 ${blurredText}`}>
                                  {i===1 ? 'NC' : i===2 ? 'PB' : i===3 ? 'DI' : 'JI'}
                                </span>
                              </div>
                              <div className="p-3 space-y-1.5">
                                 <div className={`h-2.5 w-3/4 bg-gray-300 rounded-full ${blurredText}`}></div>
                                 <div className={`h-1.5 w-1/2 bg-gray-200 rounded-full ${blurredText}`}></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Lowongan Pekerjaan Section */}
                  <div className="px-8 py-8">
                     <div className={`text-lg font-black mb-1 ${blurredText}`} style={{color: primaryColor}}>Lowongan Pekerjaan</div>
                     <div className="grid grid-cols-4 gap-4 mt-6">
                        {[1, 2, 3, 4].map(i => (
                           <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex flex-col">
                              <div className="w-full h-16 bg-gray-200 rounded-xl mb-3"></div>
                              <div className={`h-2.5 w-3/4 bg-gray-300 rounded-full mb-1 ${blurredText}`}></div>
                              <div className={`h-1.5 w-1/2 bg-gray-200 rounded-full mb-4 ${blurredText}`}></div>
                              <div className="w-full h-4 bg-gray-50 border border-gray-100 rounded-lg mt-auto"></div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Mock Footer Landing */}
                  <div className="bg-white px-8 py-10 border-t border-gray-200 grid grid-cols-4 gap-6">
                     <div className="space-y-3">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-md bg-gray-100"></div>
                           <div className="flex flex-col space-y-1">
                             <div className={`h-2 w-16 bg-gray-300 rounded-full ${blurredText}`}></div>
                             <div className={`h-1.5 w-10 bg-gray-200 rounded-full ${blurredText}`}></div>
                           </div>
                        </div>
                        <div className={`h-1.5 w-full bg-gray-200 rounded-full ${blurredText}`}></div>
                        <div className={`h-1.5 w-4/5 bg-gray-200 rounded-full ${blurredText}`}></div>
                     </div>
                     <div className="space-y-2">
                        <div className={`h-2 w-16 bg-gray-300 rounded-full mb-2 ${blurredText}`}></div>
                        <div className={`h-1.5 w-20 bg-gray-200 rounded-full ${blurredText}`}></div>
                        <div className={`h-1.5 w-16 bg-gray-200 rounded-full ${blurredText}`}></div>
                        <div className={`h-1.5 w-24 bg-gray-200 rounded-full ${blurredText}`}></div>
                     </div>
                     <div className="space-y-2">
                        <div className={`h-2 w-20 bg-gray-300 rounded-full mb-2 ${blurredText}`}></div>
                        <div className={`h-1.5 w-16 bg-gray-200 rounded-full ${blurredText}`}></div>
                        <div className={`h-1.5 w-24 bg-gray-200 rounded-full ${blurredText}`}></div>
                     </div>
                     <div className="space-y-2">
                        <div className={`h-2 w-24 bg-gray-300 rounded-full mb-2 ${blurredText}`}></div>
                        <div className="w-full h-6 bg-gray-50 border border-gray-100 rounded-lg"></div>
                        <div className="w-full h-6 rounded-lg" style={{backgroundColor: thirdColor}}></div>
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
    </div>,
    document.body
  );
}