import React from 'react';
import { Image as ImageIcon, Briefcase, GraduationCap, Users, Search } from 'lucide-react';

export default function PreviewLanding({ primaryColor, thirdColor, logo, namaSekolah, landingBg, landingTitle, landingDescription }) {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div>
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs shadow-sm" style={{ backgroundColor: primaryColor }}>1</span>
          Simulasi Landing Page
        </h4>
        <div className="h-[550px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm relative flex flex-col">

          {/* Navbar Landing */}
          <div className="sticky top-0 h-14 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-30 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full p-1.5 overflow-hidden border border-gray-100 shadow-sm">
                {logo ? <img src={logo} className="w-full h-full object-contain" alt="Logo" /> : <ImageIcon size={16} className="text-gray-400" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black leading-tight" style={{ color: primaryColor }}>Alumni Tracer</span>
                <span className="text-[7px] font-bold text-gray-500">{namaSekolah || "SMKN 2 Kraksaan"}</span>
              </div>
            </div>

            <div className="flex gap-4 items-center bg-white border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm">
              <span className="text-[8px] font-bold px-2.5 py-1 rounded" style={{ color: primaryColor, border: `1px solid ${primaryColor}20`, backgroundColor: `${primaryColor}10` }}>Beranda</span>
              {['Petunjuk', 'Fitur', 'Alumni', 'Karir'].map(menu => (
                <span key={menu} className="text-[8px] font-bold text-gray-400 hover:text-gray-600 cursor-pointer px-1">{menu}</span>
              ))}
            </div>

            <div className="flex items-center gap-1.5 cursor-pointer">
              <div className="w-6 h-6 bg-orange-200 rounded-md flex items-center justify-center overflow-hidden border border-gray-200">
                <span className="text-[10px]">🐱</span>
              </div>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-400"><path d="M6 9l6 6 6-6" /></svg>
            </div>
          </div>

          {/* Scrollable Landing Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-20 pb-0">
            {/* Hero Section */}
            <div className="px-8 py-10 flex flex-row items-center min-h-[300px] bg-white relative">
              <div className="w-1/2 pr-6 flex flex-col justify-center relative z-10">
                <div className="text-4xl font-black leading-[1.1] mb-4 tracking-tight whitespace-pre-line">
                  {landingTitle ? (
                    <>
                      <span style={{ color: primaryColor }}>{landingTitle}</span><br />
                      <span style={{ color: thirdColor }}>{namaSekolah || 'SMK Negeri 1 Jakarta'}.</span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: primaryColor }}>Tetap Terhubung</span><br />
                      <span style={{ color: primaryColor }}>Dengan Alumni</span><br />
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
                  {landingBg ? <img src={landingBg} className="w-full h-full object-cover" alt="Landing visual" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={40} className="text-gray-300" /></div>}
                </div>
                {/* Floating Cards Mockup */}
                <div className="absolute top-12 left-0 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center text-gray-700"><Briefcase size={12} /></div>
                  <div className="pr-2">
                    <div className="text-xs font-black" style={{ color: primaryColor }}>38%</div>
                    <div className="text-[5px] font-bold text-gray-500 uppercase tracking-wide">Alumni Aktif Bekerja</div>
                  </div>
                </div>
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

            {/* Petunjuk Section Mockup */}
            <div className="px-8 py-10 bg-[#f8f9fa] border-y border-gray-100">
              <div className="text-2xl font-black mb-1">
                <span style={{ color: primaryColor }}>Petunjuk</span> <span style={{ color: thirdColor }}>Pendaftaran</span>
              </div>
              <div className="text-[8px] text-gray-500 mb-6 font-medium">Berikut adalah tahapan petunjuk pendaftaran akun Study Tracer {namaSekolah || 'SMKN 2 Kraksaan'}.</div>
              <div className="grid grid-cols-4 gap-4">
                {[{ num: '01', title: 'Registrasi Akun' }, { num: '02', title: 'Verifikasi Data' }, { num: '03', title: 'Isi Kuesioner' }, { num: '04', title: 'Selesai & Update' }].map((step, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative mt-3 flex flex-col">
                    <div className="absolute -top-3 left-4 w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold text-white shadow-sm" style={{ backgroundColor: primaryColor }}>{step.num}</div>
                    <div className="h-16 w-full bg-gray-50 rounded-lg mb-3 mt-2 flex items-center justify-center border border-gray-100"><ImageIcon size={14} className="text-gray-300" /></div>
                    <div className="text-[10px] font-black mb-1.5" style={{ color: primaryColor }}>{step.title}</div>
                    <div className="text-[6.5px] text-gray-500 leading-relaxed">Simulasi langkah pendaftaran...</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bagian Statistik dan Manfaat Mockup */}
            <div className="px-8 py-10 space-y-5 bg-white">
              <div>
                <div className="text-2xl font-black mb-1 leading-tight"><span style={{ color: primaryColor }}>Satu Platform,</span><br /><span style={{ color: thirdColor }}>Banyak Manfaat.</span></div>
                <div className="text-[8px] text-gray-500 font-medium">Memantau perkembangan karir dan pendidikan alumni {namaSekolah || 'SMKN 2 Kraksaan'} secara transparan.</div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex-1 bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-36">
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                      <div className="w-4 h-4 rounded bg-gray-50 flex items-center justify-center border border-gray-100">📊</div>
                      <span className="text-[7px] font-bold uppercase tracking-widest" style={{ color: primaryColor }}>LIVE DATA STATISTIK</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 relative z-10 flex-1 items-end pb-1">
                      {[{ value: '109', label: 'TOTAL ALUMNI AKTIF' }, { value: '38%', label: 'BEKERJA' }, { value: '37%', label: 'KULIAH' }, { value: '25%', label: 'WIRAUSAHA' }].map((stat, i) => (
                        <div key={i} className="text-left">
                          <div className="text-3xl font-black mb-0.5" style={{ color: primaryColor }}>{stat.value}</div>
                          <div className="text-[5px] font-bold uppercase tracking-wider" style={{ color: thirdColor }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-1/3 rounded-[1.5rem] p-5 shadow-sm flex flex-col justify-center relative overflow-hidden h-36" style={{ backgroundColor: primaryColor, opacity: 0.95 }}>
                    <div className="absolute right-[-10px] bottom-[-10px] text-6xl opacity-10">🎓</div>
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white mb-3 relative z-10"><GraduationCap size={16} /></div>
                    <div className="text-[11px] font-black text-white mb-1 relative z-10">Evaluasi Akurat</div>
                    <div className="text-[6.5px] text-white/80 leading-relaxed font-medium relative z-10">Membantu sekolah menyesuaikan kurikulum dengan kebutuhan industri nyata.</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1/3 bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col justify-center h-32">
                    <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 mb-3 border border-gray-100"><Users size={14} /></div>
                    <div className="text-[11px] font-black mb-1" style={{ color: primaryColor }}>Jejaring Kuat</div>
                    <div className="text-[6.5px] text-gray-500 leading-relaxed font-medium">Temukan mentor atau rekan bisnis dari lintas angkatan dengan mudah dan cepat.</div>
                  </div>
                  <div className="flex-1 rounded-[1.5rem] p-6 shadow-sm flex items-center justify-between h-32" style={{ backgroundColor: primaryColor, opacity: 0.85 }}>
                    <div className="max-w-[70%]">
                      <div className="text-[13px] font-black text-white mb-1.5">Punya Info Lowongan?</div>
                      <div className="text-[7px] text-white/90 leading-relaxed font-medium">Bantu adik kelasmu mendapatkan karir impian dengan membagikan info lowongan kerja dari perusahaan tempatmu bekerja.</div>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white"><Search size={20} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}