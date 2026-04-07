import React from 'react';
import { createPortal } from 'react-dom';
import { 
  Eye, X, Image as ImageIcon, ArrowLeft, 
  ShieldCheck, FileText, Headphones, Globe, Mail, Phone, Check,
  Briefcase, GraduationCap, Users, Search
} from 'lucide-react';

export default function TampilanPreview({ 
  isOpen, 
  onClose, 
  activeTab = 'landing',
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
  landingDescription,
  deskripsiFooter,
  emailKontak,
  webKontak,
  telpKontak,
  teksPrivasi,
  teksLayanan,
  teksDukungan
}) {
  if (!isOpen) return null;

  const blurredText = "blur-[3px] opacity-60 select-none";

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 z-99999 flex items-center justify-center p-4 md:p-6 backdrop-blur-sm animate-in fade-in duration-300"
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
          {/* TAB 1: PREVIEW META DATA */}
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
            <div className="space-y-12 animate-in fade-in duration-500 flex flex-col items-center">
               <div className="w-full max-w-4xl">
                 <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs shadow-sm" style={{backgroundColor: primaryColor}}>1</span>
                    Simulasi Halaman Login
                 </h4>
                 <div className="flex h-[400px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    {/* Left: Background Image */}
                    <div className="w-1/2 relative bg-gray-200 overflow-hidden">
                       {loginBg ? (
                          <img src={loginBg} className="w-full h-full object-cover" alt="Login BG" />
                       ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon size={32}/>
                            <span className="text-xs mt-2 font-medium">Belum ada gambar background</span>
                          </div>
                       )}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                       <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                          <ArrowLeft size={12} style={{color: primaryColor}} />
                          <div className="text-[10px] font-bold" style={{color: primaryColor}}>Kembali Ke Landing Page</div>
                       </div>
                       
                       {/* PERBAIKAN LOGO: Ukuran diperkecil dan diposisikan lebih presisi */}
                       <div className="absolute bottom-10 left-6 right-6 flex items-center gap-2.5">
                          <div className="w-9 h-9 bg-white rounded-full p-1.5 shrink-0 flex items-center justify-center shadow-md">
                             {logo ? <img src={logo} className="w-full h-full object-contain" /> : <ImageIcon size={16} className="text-gray-400"/>}
                          </div>
                          <div>
                             <div className="text-white text-[13px] font-black drop-shadow-md">Alumni Tracer Study</div>
                          </div>
                       </div>
                       
                       <div className="absolute bottom-4 left-6 right-6 text-white/90 text-[10px] leading-relaxed font-medium drop-shadow-md">
                          Masuk dan terhubung kembali dengan <span className="font-bold">{namaSekolah || 'Sekolah Anda'}</span>. Pantau peluang kerja dan tetap dekat dengan sesama alumni.
                       </div>
                    </div>
                    {/* Right: Login Form */}
                    <div className="w-1/2 p-8 flex flex-col justify-center">
                       <div className="text-2xl font-black mb-1" style={{color: primaryColor}}>Selamat Datang</div>
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
                             <div className="text-[10px] font-bold cursor-pointer hover:underline" style={{color: primaryColor}}>Lupa password?</div>
                          </div>
                          <div className="h-10 w-full rounded-xl mt-6 flex items-center justify-center shadow-md cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: primaryColor }}>
                             <span className="text-white text-xs font-bold">Masuk →</span>
                          </div>
                       </div>
                       
                       <div className="mt-8 text-center flex items-center justify-center gap-1.5">
                          <span className="text-[10px] text-gray-500">Belum punya akun alumni?</span>
                          <span className="text-[10px] font-bold cursor-pointer hover:underline" style={{color: primaryColor}}>Daftar</span>
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: PREVIEW LANDING PAGE (Disesuaikan Referensi Terbaru) */}
          {/* ========================================================= */}
          {activeTab === 'landing' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div>
                 <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs shadow-sm" style={{backgroundColor: primaryColor}}>1</span>
                    Simulasi Landing Page
                 </h4>
                 <div className="h-[550px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm relative flex flex-col">
                    
                    {/* Navbar Landing */}
                    <div className="sticky top-0 h-14 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-30 shrink-0">
                       
                       {/* Left: Logo & Nama Sekolah */}
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-white rounded-full p-1.5 overflow-hidden border border-gray-100 shadow-sm">
                             {logo ? <img src={logo} className="w-full h-full object-contain" /> : <ImageIcon size={16} className="text-gray-400"/>}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[11px] font-black leading-tight" style={{ color: primaryColor }}>Alumni Tracer</span>
                             <span className="text-[7px] font-bold text-gray-500">{namaSekolah || "SMK Negeri 1 Gondang"}</span>
                          </div>
                       </div>
                       
                       {/* Center: Nav Menu Box */}
                       <div className="flex gap-4 items-center bg-white border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm">
                          <span className="text-[8px] font-bold px-2.5 py-1 rounded" style={{color: primaryColor, border: `1px solid ${primaryColor}20`, backgroundColor: `${primaryColor}10`}}>Beranda</span>
                          {['Petunjuk', 'Fitur', 'Alumni', 'Karir'].map(menu => (
                            <span key={menu} className="text-[8px] font-bold text-gray-400 hover:text-gray-600 cursor-pointer px-1">{menu}</span>
                          ))}
                       </div>

                       {/* Right: Profil Avatar Mockup */}
                       <div className="flex items-center gap-1.5 cursor-pointer">
                         <div className="w-6 h-6 bg-orange-200 rounded-md flex items-center justify-center overflow-hidden border border-gray-200">
                           <span className="text-[10px]">🐱</span>
                         </div>
                         <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-400"><path d="M6 9l6 6 6-6"/></svg>
                       </div>
                    </div>
                    
                    {/* Scrollable Landing Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative z-20 pb-0">
                       
                       {/* Hero Section */}
                       <div className="px-8 py-10 flex flex-row items-center min-h-[300px] bg-white relative">
                          
                          <div className="w-1/2 pr-6 flex flex-col justify-center relative z-10">
                             
                             {/* Judul mengikuti ketikan, Nama sekolah tidak hilang */}
                             <div className="text-4xl font-black leading-[1.1] mb-4 tracking-tight whitespace-pre-line">
                               {landingTitle ? (
                                 <>
                                   <span style={{ color: primaryColor }}>{landingTitle}</span><br/>
                                   <span style={{ color: thirdColor }}>{namaSekolah || 'SMK Negeri 1 Jakarta'}.</span>
                                 </>
                               ) : (
                                 <>
                                   <span style={{ color: primaryColor }}>Tetap Terhubung</span><br/>
                                   <span style={{ color: primaryColor }}>Dengan Alumni</span><br/>
                                   <span style={{ color: thirdColor }}>{namaSekolah || 'SMK Negeri 1 Jakarta'}.</span>
                                 </>
                               )}
                             </div>
                             
                             <div className="text-[9px] max-w-[90%] leading-relaxed mb-6 text-gray-500 font-medium">
                               {landingDescription ? landingDescription : "Bagikan perjalanan karirmu, lihat perkembangan teman-teman alumni, temukan info lowongan kerja, dan bangun jaringan yang lebih luas dengan study tracer."}
                             </div>
                             
                             <div className="flex items-center gap-4">
                               <div className="px-4 py-2.5 rounded-md text-[8px] font-bold text-white shadow-md cursor-pointer hover:opacity-90" style={{ backgroundColor: primaryColor }}>
                                 Masuk Portal Alumni →
                               </div>
                               <div className="flex items-center gap-1.5">
                                 <div className="flex -space-x-1.5">
                                    <div className="w-5 h-5 rounded-full bg-orange-200 border border-white"></div>
                                    <div className="w-5 h-5 rounded-full bg-green-200 border border-white"></div>
                                    <div className="w-5 h-5 rounded-full bg-blue-200 border border-white"></div>
                                 </div>
                                 <span className="text-[7px] font-bold" style={{ color: primaryColor }}>+109 Bergabung</span>
                               </div>
                             </div>
                          </div>
                          
                          <div className="w-1/2 relative h-full min-h-[250px] z-10 flex items-center justify-center">
                             <div className="absolute right-0 top-2 w-[85%] h-56 bg-gray-100 rounded-3xl shadow-md border-4 border-white overflow-hidden transform rotate-3">
                                {landingBg ? <img src={landingBg} className="w-full h-full object-cover" alt="Landing visual"/> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={40} className="text-gray-300"/></div>}
                             </div>
                             {/* Floating Card 1 */}
                             <div className="absolute top-12 left-0 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2">
                                <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center text-gray-700">
                                   <Briefcase size={12}/>
                                </div>
                                <div className="pr-2">
                                  <div className="text-xs font-black" style={{ color: primaryColor }}>38%</div>
                                  <div className="text-[5px] font-bold text-gray-500 uppercase tracking-wide">Alumni Aktif Bekerja</div>
                                </div>
                             </div>
                             {/* Floating Card 2 */}
                             <div className="absolute bottom-8 left-6 p-3 rounded-xl shadow-lg transform -rotate-2 w-44" style={{ backgroundColor: primaryColor, opacity: 0.9 }}>
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-[5px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">Baru</span>
                                  <div className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center text-[8px]">⭐</div>
                                </div>
                                <div className="text-[7px] text-white/90 font-medium leading-relaxed">
                                  Update data karirmu dan bantu sekolah tingkatkan akreditasi!
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Petunjuk Section */}
                       <div className="px-8 py-10 bg-[#f8f9fa] border-y border-gray-100">
                          <div className="text-2xl font-black mb-1">
                             <span style={{ color: primaryColor }}>Petunjuk</span> <span style={{ color: thirdColor }}>Pendaftaran</span>
                          </div>
                          <div className="text-[8px] text-gray-500 mb-6 font-medium">Berikut adalah tahapan petunjuk pendaftaran akun Study Tracer {namaSekolah || 'SMK Negeri 1 Gondang'}.</div>
                          
                          <div className="grid grid-cols-4 gap-4">
                             {[
                               { num: '01', title: 'Registrasi Akun', desc: 'Masuk ke halaman pendaftaran Disini dan lengkapi data diri.' },
                               { num: '02', title: 'Verifikasi Data', desc: 'Tim admin akan memvalidasi status kelulusan Anda.' },
                               { num: '03', title: 'Isi Kuesioner', desc: 'Lengkapi formulir tracer study mengenai status karir, kuliah.' },
                               { num: '04', title: 'Selesai & Update', desc: 'Data Anda tersimpan! Anda kini bisa mengakses portal.' },
                             ].map((step, i) => (
                               <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative mt-3 flex flex-col">
                                  <div className="absolute -top-3 left-4 w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold text-white shadow-sm" style={{ backgroundColor: primaryColor }}>{step.num}</div>
                                  <div className="h-16 w-full bg-gray-50 rounded-lg mb-3 mt-2 flex items-center justify-center border border-gray-100">
                                     <ImageIcon size={14} className="text-gray-300"/>
                                  </div>
                                  <div className="text-[10px] font-black mb-1.5" style={{ color: primaryColor }}>{step.title}</div>
                                  <div className="text-[6.5px] text-gray-500 leading-relaxed">{step.desc}</div>
                               </div>
                             ))}
                          </div>
                       </div>

                       {/* Bagian Statistik dan Manfaat */}
                       <div className="px-8 py-10 space-y-5 bg-white">
                         <div>
                            <div className="text-2xl font-black mb-1 leading-tight">
                               <span style={{ color: primaryColor }}>Satu Platform,</span><br/>
                               <span style={{ color: thirdColor }}>Banyak Manfaat.</span>
                            </div>
                            <div className="text-[8px] text-gray-500 font-medium">Memantau perkembangan karir dan pendidikan alumni {namaSekolah || 'SMK Negeri 1 Gondang'} secara transparan.</div>
                         </div>
                          
                         <div className="flex flex-col gap-4">
                           {/* Row 1 */}
                           <div className="flex gap-4">
                              <div className="flex-1 bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-36">
                                 <div className="flex items-center gap-2 mb-4 relative z-10">
                                    <div className="w-4 h-4 rounded bg-gray-50 flex items-center justify-center border border-gray-100">📊</div>
                                    <span className="text-[7px] font-bold uppercase tracking-widest" style={{color: primaryColor}}>LIVE DATA STATISTIK</span>
                                 </div>
                                 <div className="grid grid-cols-4 gap-2 relative z-10 flex-1 items-end pb-1">
                                    {[
                                      { value: '109', label: 'TOTAL ALUMNI AKTIF' },
                                      { value: '38%', label: 'BEKERJA' },
                                      { value: '37%', label: 'KULIAH' },
                                      { value: '25%', label: 'WIRAUSAHA' },
                                    ].map((stat, i) => (
                                      <div key={i} className="text-left">
                                        <div className="text-3xl font-black mb-0.5" style={{color: primaryColor}}>{stat.value}</div>
                                        <div className="text-[5px] font-bold uppercase tracking-wider" style={{color: thirdColor}}>{stat.label}</div>
                                      </div>
                                    ))}
                                 </div>
                              </div>
                              <div className="w-1/3 rounded-[1.5rem] p-5 shadow-sm flex flex-col justify-center relative overflow-hidden h-36" style={{backgroundColor: primaryColor, opacity: 0.95}}>
                                 <div className="absolute right-[-10px] bottom-[-10px] text-6xl opacity-10">🎓</div>
                                 <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white mb-3 relative z-10">
                                    <GraduationCap size={16} />
                                 </div>
                                 <div className="text-[11px] font-black text-white mb-1 relative z-10">Evaluasi Akurat</div>
                                 <div className="text-[6.5px] text-white/80 leading-relaxed font-medium relative z-10">
                                   Membantu sekolah menyesuaikan kurikulum dengan kebutuhan industri nyata.
                                 </div>
                              </div>
                           </div>
                           
                           {/* Row 2 */}
                           <div className="flex gap-4">
                              <div className="w-1/3 bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col justify-center h-32">
                                 <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 mb-3 border border-gray-100">
                                    <Users size={14} />
                                 </div>
                                 <div className="text-[11px] font-black mb-1" style={{ color: primaryColor }}>Jejaring Kuat</div>
                                 <div className="text-[6.5px] text-gray-500 leading-relaxed font-medium">Temukan mentor atau rekan bisnis dari lintas angkatan dengan mudah dan cepat.</div>
                              </div>
                              <div className="flex-1 rounded-[1.5rem] p-6 shadow-sm flex items-center justify-between h-32" style={{backgroundColor: primaryColor, opacity: 0.85}}>
                                 <div className="max-w-[70%]">
                                    <div className="text-[13px] font-black text-white mb-1.5">Punya Info Lowongan?</div>
                                    <div className="text-[7px] text-white/90 leading-relaxed font-medium">
                                       Bantu adik kelasmu mendapatkan karir impian dengan membagikan info lowongan kerja dari perusahaan tempatmu bekerja.
                                    </div>
                                 </div>
                                 <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white">
                                    <Search size={20} />
                                 </div>
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
                  Simulasi Teks Footer
               </h4>
               <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-8 py-10">
                     <div className="grid grid-cols-4 gap-8">
                        <div className="space-y-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center overflow-hidden p-1.5 shrink-0">
                                 {logo ? <img src={logo} className="w-full h-full object-contain"/> : <ImageIcon size={18} className="text-gray-400"/>}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-xs font-black leading-tight" style={{ color: primaryColor }}>Alumni Tracer</span>
                                 <span className="text-[10px] font-bold text-gray-500">{namaSekolah || "SMK Negeri 1 Gondang"}</span>
                              </div>
                           </div>
                           {/* PERBAIKAN FOOTER: Menggunakan deskripsiFooter */}
                           <p className="text-xs text-gray-500 leading-relaxed font-medium">
                              {deskripsiFooter || "Platform pelacakan dan jaringan alumni resmi. Menghubungkan lulusan, membina pertumbuhan, dan membangun komunitas."}
                           </p>
                        </div>

                        <div className="space-y-4">
                           <div className="text-sm font-black" style={{color: primaryColor}}>Tautan Cepat</div>
                           <ul className="space-y-2.5 text-xs font-bold text-gray-500">
                              <li className="hover:text-blue-500 cursor-pointer transition-colors">Beranda</li>
                              <li className="hover:text-blue-500 cursor-pointer transition-colors">Petunjuk</li>
                              <li className="hover:text-blue-500 cursor-pointer transition-colors">Statistik Publik</li>
                           </ul>
                        </div>

                        <div className="space-y-4">
                           <div className="text-sm font-black" style={{color: primaryColor}}>Untuk Alumni</div>
                           <ul className="space-y-2.5 text-xs font-bold text-gray-500">
                              <li className="hover:text-blue-500 cursor-pointer transition-colors">Masuk Akun</li>
                              <li className="hover:text-blue-500 cursor-pointer transition-colors">Daftar Baru</li>
                              <li className="hover:text-blue-500 cursor-pointer transition-colors">Perbarui Profil</li>
                           </ul>
                        </div>

                        <div className="space-y-4">
                           <div className="text-sm font-black" style={{color: primaryColor}}>Kontak Kami</div>
                           <div className="space-y-3">
                              {/* PERBAIKAN KONTAK: Menggunakan webKontak, emailKontak, telpKontak */}
                              <div className="flex items-center gap-3 group cursor-pointer">
                                 <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors"><Globe size={12} /></div>
                                 <span className="text-xs font-bold text-gray-500 group-hover:text-blue-500 transition-colors">{webKontak || "alumnitracer.sch.id"}</span>
                              </div>
                              <div className="flex items-center gap-3 group cursor-pointer">
                                 <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors"><Mail size={12} /></div>
                                 <span className="text-xs font-bold text-gray-500 group-hover:text-blue-500 transition-colors">{emailKontak || "info@alumnitracer.com"}</span>
                              </div>
                              <div className="flex items-center gap-3 group cursor-pointer">
                                 <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors"><Phone size={12} /></div>
                                 <span className="text-xs font-bold text-gray-500 group-hover:text-blue-500 transition-colors">{telpKontak || "(0358) 611606"}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="px-8 py-5 border-t border-gray-200 flex justify-between items-center bg-gray-100/50">
                     <div className="text-[10px] font-bold text-gray-400">© 2026 Alumni Tracer. Hak cipta dilindungi.</div>
                     <div className="flex gap-4 text-[10px] font-bold text-gray-500">
                        <span className="hover:text-blue-500 cursor-pointer transition-colors">Kebijakan Privasi</span>
                        <span className="hover:text-blue-500 cursor-pointer transition-colors">Ketentuan Layanan</span>
                        <span className="hover:text-blue-500 cursor-pointer transition-colors">Kontak Dukungan</span>
                     </div>
                  </div>
               </div>

               <h4 className="text-sm font-bold text-gray-700 mb-3 mt-8 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs shadow-sm" style={{backgroundColor: primaryColor}}>2</span>
                  Simulasi Teks Modal (Jelas)
               </h4>
               
               {/* PERBAIKAN MODAL: Tidak blur dan menggunakan variabel teksPrivasi dkk */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gray-200/50 rounded-2xl border border-gray-200">
                  
                  {/* MODAL 1: Privasi */}
                  <div className="bg-white rounded-2xl shadow-lg flex flex-col border border-gray-100 overflow-hidden">
                     <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-white rounded-lg border border-gray-100 shadow-sm text-emerald-500"><ShieldCheck size={14}/></div>
                           <span className="text-[10px] font-black text-gray-800">Kebijakan Privasi</span>
                        </div>
                        <X size={12} className="text-gray-400 cursor-pointer" />
                     </div>
                     <div className="p-4 flex-1 overflow-y-auto">
                        {teksPrivasi ? (
                          <p className="text-[9px] text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">{teksPrivasi}</p>
                        ) : (
                          <p className="text-[9px] text-gray-400 italic">Belum ada teks kebijakan privasi yang diisi.</p>
                        )}
                     </div>
                     <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[9px] font-bold shadow-sm cursor-pointer hover:opacity-90" style={{backgroundColor: primaryColor}}>
                           <Check size={10} /> Mengerti
                        </div>
                     </div>
                  </div>

                  {/* MODAL 2: Layanan */}
                  <div className="bg-white rounded-2xl shadow-lg flex flex-col border border-gray-100 overflow-hidden">
                     <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-white rounded-lg border border-gray-100 shadow-sm text-blue-500"><FileText size={14}/></div>
                           <span className="text-[10px] font-black text-gray-800">Ketentuan Layanan</span>
                        </div>
                        <X size={12} className="text-gray-400 cursor-pointer" />
                     </div>
                     <div className="p-4 flex-1 overflow-y-auto">
                        {teksLayanan ? (
                          <p className="text-[9px] text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">{teksLayanan}</p>
                        ) : (
                          <p className="text-[9px] text-gray-400 italic">Belum ada teks ketentuan layanan yang diisi.</p>
                        )}
                     </div>
                     <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[9px] font-bold shadow-sm cursor-pointer hover:opacity-90" style={{backgroundColor: primaryColor}}>
                           <Check size={10} /> Mengerti
                        </div>
                     </div>
                  </div>

                  {/* MODAL 3: Kontak */}
                  <div className="bg-white rounded-2xl shadow-lg flex flex-col border border-gray-100 overflow-hidden">
                     <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-white rounded-lg border border-gray-100 shadow-sm text-amber-500"><Headphones size={14}/></div>
                           <span className="text-[10px] font-black text-gray-800">Kontak Dukungan</span>
                        </div>
                        <X size={12} className="text-gray-400 cursor-pointer" />
                     </div>
                     <div className="p-4 flex-1 flex flex-col">
                        <p className="text-[9px] text-gray-600 leading-relaxed font-medium mb-3">
                           {teksDukungan || "Butuh bantuan atau menemukan masalah teknis? Tim dukungan kami siap membantu Anda."}
                        </p>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2.5 mt-auto">
                           <div>
                              <div className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Email</div>
                              <div className="text-[9px] font-bold text-gray-700">{emailKontak || "info@alumnitracer.com"}</div>
                           </div>
                           <div>
                              <div className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Website Resmi</div>
                              <div className="text-[9px] font-bold text-gray-700">{webKontak || "alumnitracer.sch.id"}</div>
                           </div>
                           <div>
                              <div className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Telepon</div>
                              <div className="text-[9px] font-bold text-gray-700">{telpKontak || "(0358) 611606"}</div>
                           </div>
                        </div>
                     </div>
                     <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[9px] font-bold shadow-sm cursor-pointer hover:opacity-90" style={{backgroundColor: primaryColor}}>
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