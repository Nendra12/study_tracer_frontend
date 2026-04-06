import React from 'react';
import { createPortal } from 'react-dom';
import { 
  Eye, X, Image as ImageIcon, ArrowLeft, 
  ShieldCheck, FileText, Headphones, Globe, Mail, Phone, Check
} from 'lucide-react';

export default function TampilanPreview({ 
  isOpen, 
  onClose, 
  activeTab = 'landing', // Default tab
  primaryColor, 
  secondaryColor, 
  thirdColor,
  logo,
  loginBg,
  landingBg,
  namaSekolah,
  metaTitle,
  metaDescription,
  metaIcon,
  landingTitle,
  landingDescription
}) {
  if (!isOpen) return null;

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
                  {activeTab === 'meta' && "Simulasi hasil pencarian di Google Search."}
                  {activeTab === 'login' && "Simulasi struktur Halaman Login."}
                  {activeTab === 'landing' && "Simulasi struktur Landing Page."}
                  {activeTab === 'footer' && "Simulasi struktur Footer dan Modal Informasi."}
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

        {/* KONTEN PREVIEW */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-12 bg-gray-100/50 custom-scrollbar">
          
          {/* ========================================================= */}
          {/* TAB 1: PREVIEW META DATA (GOOGLE SEARCH MOCKUP) */}
          {/* ========================================================= */}
          {activeTab === 'meta' && (
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
          )}

          {/* ========================================================= */}
          {/* TAB 2: PREVIEW LOGIN */}
          {/* ========================================================= */}
          {activeTab === 'login' && (
            <div className="space-y-12 animate-in fade-in duration-500">
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
                       <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                          <ArrowLeft size={10} style={{color: primaryColor}} />
                          <div className={`text-[7px] font-bold ${blurredText}`} style={{color: primaryColor}}>Kembali Ke Landing Page</div>
                       </div>
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
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: PREVIEW LANDING PAGE (SCROLLABLE & UTUH) */}
          {/* ========================================================= */}
          {activeTab === 'landing' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div>
                 <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs shadow-sm" style={{backgroundColor: primaryColor}}>1</span>
                    Simulasi Landing Page (Scrollable)
                 </h4>
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
                       <div className="px-8 py-10 flex flex-row items-center min-h-[250px] bg-gray-50/30 relative">
                          {landingBg && (
                             <div className="absolute inset-0 z-0 opacity-15">
                                <img src={landingBg} className="w-full h-full object-cover" alt="Hero BG" />
                             </div>
                          )}
                          <div className="w-1/2 pr-6 flex flex-col justify-center relative z-10">
                             <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-orange-50 border border-orange-100 mb-4 w-fit">
                                <div className={`text-[7px] font-bold text-orange-600 ${blurredText}`}>Selamat datang di Tracer Study</div>
                             </div>
                             {/* Penggunaan Teks Landing Dinamis! */}
                             <div className={`text-3xl font-black leading-[1.1] mb-3 ${blurredText}`} style={{ color: primaryColor }}>
                               {landingTitle ? landingTitle : <>Tetap Terhubung <br/> dengan Alumni <br/> <span style={{ color: thirdColor }}>{namaSekolah}.</span></>}
                             </div>
                             <div className={`text-[8px] max-w-[80%] leading-relaxed mb-6 text-gray-500 ${blurredText}`}>
                               {landingDescription ? landingDescription : "Bagikan perjalanan karirmu, lihat perkembangan teman-teman alumni, temukan info lowongan kerja, dan bangun jaringan yang lebih luas."}
                             </div>
                             <div className="px-4 py-2 w-max rounded-lg text-[9px] font-bold text-white flex items-center justify-center gap-2 shadow-md" style={{ backgroundColor: primaryColor }}>
                               <span className={`${blurredText}`}>Masuk Portal Alumni</span>
                             </div>
                          </div>
                          <div className="w-1/2 relative h-full min-h-[200px] z-10">
                             <div className="absolute right-0 top-0 w-[80%] h-48 bg-gray-200 rounded-2xl shadow-inner flex flex-col items-center justify-center border-4 border-white overflow-hidden">
                                {landingBg ? <img src={landingBg} className="w-full h-full object-cover" alt="Landing visual"/> : <ImageIcon size={24} className="text-gray-400"/>}
                             </div>
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
                       <div className="px-8 py-8 bg-white border-y border-gray-100">
                          <div className={`text-lg font-black mb-1 ${blurredText}`} style={{color: primaryColor}}>Petunjuk Pendaftaran</div>
                          <div className={`text-[8px] text-gray-500 mb-6 ${blurredText}`}>Berikut adalah tahapan petunjuk pendaftaran alumni study tracer.</div>
                          <div className="grid grid-cols-4 gap-4 mt-4">
                             {[1, 2, 3, 4].map(i => (
                               <div key={i} className="bg-gray-50/50 p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                  <div className="h-16 w-full bg-white rounded-xl mb-3 flex items-center justify-center border border-gray-100"><ImageIcon size={16} className="text-gray-300"/></div>
                                  <div className={`h-2.5 w-2/3 bg-gray-300 rounded-full mb-2 ${blurredText}`}></div>
                                  <div className={`h-1.5 w-full bg-gray-200 rounded-full mb-1 ${blurredText}`}></div>
                                  <div className={`h-1.5 w-4/5 bg-gray-200 rounded-full ${blurredText}`}></div>
                               </div>
                             ))}
                          </div>
                       </div>

                       {/* Bagian Statistik dan Manfaat */}
                       <div className="px-8 py-10 space-y-6 bg-gray-50/30">
                         <div className={`text-xl font-black mb-1 max-w-[50%] ${blurredText}`} style={{color: primaryColor}}>Satu Platform, Banyak Manfaat.</div>
                         <div className={`text-[8px] text-gray-500 mb-6 ${blurredText}`}>Memantau perkembangan karir dan pendidikan alumni secara transparan.</div>
                          
                         <div className="flex gap-6">
                           <div className="w-2/3 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col">
                             <div className="flex items-center gap-2 mb-6 relative z-10">
                               <div className="w-5 h-5 rounded-md bg-gray-50 flex items-center justify-center p-0.5 border border-gray-100">
                                   <div className="w-1 h-3 bg-red-400 rounded-sm mx-[0.5px]"></div>
                                   <div className="w-1 h-2.5 bg-yellow-400 rounded-sm mx-[0.5px]"></div>
                                   <div className="w-1 h-4 bg-green-400 rounded-sm mx-[0.5px]"></div>
                               </div>
                               <span className={`text-[8px] font-bold uppercase tracking-widest ${blurredText}`} style={{color: primaryColor}}>LIVE DATA STATISTIK</span>
                             </div>
                             <div className="grid grid-cols-4 gap-2 relative z-10 flex-1 items-end">
                               {[
                                 { value: '109', label: 'TOTAL ALUMNI AKTIF' },
                                 { value: '38%', label: 'BEKERJA' },
                                 { value: '37%', label: 'KULIAH' },
                                 { value: '25%', label: 'WIRAUSAHA' },
                               ].map((stat, i) => (
                                 <div key={i} className="text-left">
                                   <div className={`text-3xl font-black mb-1 ${blurredText}`} style={{color: primaryColor}}>{stat.value}</div>
                                   <div className={`text-[7px] font-bold uppercase tracking-wider ${blurredText}`} style={{color: thirdColor}}>{stat.label}</div>
                                 </div>
                               ))}
                             </div>
                           </div>
                           
                           <div className="w-1/3 rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-center" style={{backgroundColor: primaryColor}}>
                             <div className="flex items-start gap-3 mb-3">
                               <div className="w-8 h-8 rounded-lg bg-white/20 flex flex-col items-center justify-center">
                                  <div className="w-4 h-2 border-b-2 border-x-2 border-white rounded-b-sm"></div>
                                  <div className="w-1 h-2 bg-white mt-0.5"></div>
                               </div>
                             </div>
                             <div className={`text-[12px] font-bold text-white mb-2 ${blurredText}`}>Evaluasi Akurat</div>
                             <div className={`text-[8px] text-white/80 leading-relaxed ${blurredText}`}>
                               Membantu sekolah menyesuaikan kurikulum dengan kebutuhan industri nyata.
                             </div>
                           </div>
                         </div>
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: PREVIEW FOOTER & MODAL */}
          {/* ========================================================= */}
          {activeTab === 'footer' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs shadow-sm" style={{backgroundColor: primaryColor}}>1</span>
                  Simulasi Footer Landing Page
               </h4>
               <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-8">
                     <div className="grid grid-cols-4 gap-6">
                        <div className="space-y-4">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center overflow-hidden p-1 shrink-0">
                                 {logo ? <img src={logo} className="w-full h-full object-contain"/> : <ImageIcon size={14} className="text-gray-400"/>}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-black leading-tight" style={{ color: primaryColor }}>Alumni Tracer</span>
                                 <span className="text-[7px] font-bold text-gray-500">{namaSekolah}</span>
                              </div>
                           </div>
                           <div className="space-y-1.5 pt-1">
                              <div className={`h-1.5 w-full bg-gray-300 rounded-full ${blurredText}`}></div>
                              <div className={`h-1.5 w-full bg-gray-300 rounded-full ${blurredText}`}></div>
                              <div className={`h-1.5 w-4/5 bg-gray-300 rounded-full ${blurredText}`}></div>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="text-[10px] font-black" style={{color: primaryColor}}>Tautan Cepat</div>
                           <div className="space-y-2">
                              <div className={`h-1.5 w-16 bg-gray-300 rounded-full ${blurredText}`}></div>
                              <div className={`h-1.5 w-20 bg-gray-300 rounded-full ${blurredText}`}></div>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="text-[10px] font-black" style={{color: primaryColor}}>Untuk Alumni</div>
                           <div className="space-y-2">
                              <div className={`h-1.5 w-12 bg-gray-300 rounded-full ${blurredText}`}></div>
                              <div className={`h-1.5 w-16 bg-gray-300 rounded-full ${blurredText}`}></div>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="text-[10px] font-black" style={{color: primaryColor}}>Kontak Kami</div>
                           <div className="space-y-2.5">
                              <div className="flex items-center gap-2">
                                 <div className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400"><Globe size={10} /></div>
                                 <div className={`h-1.5 w-24 bg-gray-300 rounded-full ${blurredText}`}></div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <div className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400"><Mail size={10} /></div>
                                 <div className={`h-1.5 w-28 bg-gray-300 rounded-full ${blurredText}`}></div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <div className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400"><Phone size={10} /></div>
                                 <div className={`h-1.5 w-20 bg-gray-300 rounded-full ${blurredText}`}></div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50/50">
                     <div className={`h-1.5 w-32 bg-gray-400 rounded-full ${blurredText}`}></div>
                     <div className="flex gap-4">
                        <div className={`h-1.5 w-16 bg-gray-400 rounded-full ${blurredText}`}></div>
                        <div className={`h-1.5 w-20 bg-gray-400 rounded-full ${blurredText}`}></div>
                        <div className={`h-1.5 w-24 bg-gray-400 rounded-full ${blurredText}`}></div>
                     </div>
                  </div>
               </div>

               <h4 className="text-sm font-bold text-gray-700 mb-3 mt-8 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs shadow-sm" style={{backgroundColor: primaryColor}}>2</span>
                  Simulasi Teks Modal
               </h4>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gray-200/50 rounded-2xl border border-gray-200">
                  <div className="bg-white rounded-2xl shadow-lg flex flex-col border border-gray-100 overflow-hidden">
                     <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100 text-emerald-500"><ShieldCheck size={14}/></div>
                           <span className="text-[10px] font-black text-gray-800">Kebijakan Privasi</span>
                        </div>
                        <X size={12} className="text-gray-400" />
                     </div>
                     <div className="p-4 flex-1 space-y-2">
                        <div className={`h-1.5 w-full bg-gray-200 rounded-full ${blurredText}`}></div>
                        <div className={`h-1.5 w-3/4 bg-gray-200 rounded-full ${blurredText}`}></div>
                     </div>
                     <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[9px] font-bold shadow-sm" style={{backgroundColor: primaryColor}}>
                           <Check size={10} /> Mengerti
                        </div>
                     </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg flex flex-col border border-gray-100 overflow-hidden">
                     <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100 text-blue-500"><FileText size={14}/></div>
                           <span className="text-[10px] font-black text-gray-800">Ketentuan Layanan</span>
                        </div>
                        <X size={12} className="text-gray-400" />
                     </div>
                     <div className="p-4 flex-1 space-y-2">
                        <div className={`h-1.5 w-full bg-gray-200 rounded-full ${blurredText}`}></div>
                        <div className={`h-1.5 w-5/6 bg-gray-300 rounded-full ${blurredText}`}></div>
                     </div>
                     <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[9px] font-bold shadow-sm" style={{backgroundColor: primaryColor}}>
                           <Check size={10} /> Mengerti
                        </div>
                     </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg flex flex-col border border-gray-100 overflow-hidden">
                     <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100 text-amber-500"><Headphones size={14}/></div>
                           <span className="text-[10px] font-black text-gray-800">Kontak Dukungan</span>
                        </div>
                        <X size={12} className="text-gray-400" />
                     </div>
                     <div className="p-4 flex-1">
                        <div className={`h-1.5 w-full bg-gray-200 rounded-full mb-4 ${blurredText}`}></div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                           <div>
                              <div className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email</div>
                              <div className={`h-1.5 w-24 bg-gray-300 rounded-full ${blurredText}`}></div>
                           </div>
                           <div>
                              <div className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-1">Website Resmi</div>
                              <div className={`h-1.5 w-32 bg-gray-300 rounded-full ${blurredText}`}></div>
                           </div>
                           <div>
                              <div className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-1">Telepon</div>
                              <div className={`h-1.5 w-20 bg-gray-300 rounded-full ${blurredText}`}></div>
                           </div>
                        </div>
                     </div>
                     <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[9px] font-bold shadow-sm" style={{backgroundColor: primaryColor}}>
                           <Check size={10} /> Mengerti
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

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