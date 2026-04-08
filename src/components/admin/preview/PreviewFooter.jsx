import React from 'react';
import { Image as ImageIcon, Globe, Mail, Phone, ShieldCheck, Check, X, FileText, Headphones } from 'lucide-react';

export default function PreviewFooter({ primaryColor, logo, namaSekolah, deskripsiFooter, webKontak, emailKontak, telpKontak, teksPrivasi, teksLayanan, teksDukungan }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs shadow-sm" style={{ backgroundColor: primaryColor }}>1</span>
        Simulasi Teks Footer
      </h4>
      <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-8 py-10">
          <div className="grid grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center overflow-hidden p-1.5 shrink-0">
                  {logo ? <img src={logo} className="w-full h-full object-contain" alt="Logo" /> : <ImageIcon size={18} className="text-gray-400" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black leading-tight" style={{ color: primaryColor }}>Alumni Tracer</span>
                  <span className="text-[10px] font-bold text-gray-500">{namaSekolah || "SMKN 2 Kraksaan"}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                {deskripsiFooter || "Platform pelacakan dan jaringan alumni resmi. Menghubungkan lulusan, membina pertumbuhan, dan membangun komunitas."}
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-black" style={{ color: primaryColor }}>Tautan Cepat</div>
              <ul className="space-y-2.5 text-xs font-bold text-gray-500">
                <li className="hover:text-blue-500 cursor-pointer transition-colors">Beranda</li>
                <li className="hover:text-blue-500 cursor-pointer transition-colors">Petunjuk</li>
                <li className="hover:text-blue-500 cursor-pointer transition-colors">Statistik Publik</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-black" style={{ color: primaryColor }}>Untuk Alumni</div>
              <ul className="space-y-2.5 text-xs font-bold text-gray-500">
                <li className="hover:text-blue-500 cursor-pointer transition-colors">Masuk Akun</li>
                <li className="hover:text-blue-500 cursor-pointer transition-colors">Daftar Baru</li>
                <li className="hover:text-blue-500 cursor-pointer transition-colors">Perbarui Profil</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-black" style={{ color: primaryColor }}>Kontak Kami</div>
              <div className="space-y-3">
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
        <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs shadow-sm" style={{ backgroundColor: primaryColor }}>2</span>
        Simulasi Teks Modal (Jelas)
      </h4>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gray-200/50 rounded-2xl border border-gray-200">
        {/* MODAL 1: Privasi */}
        <div className="bg-white rounded-2xl shadow-lg flex flex-col border border-gray-100 overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white rounded-lg border border-gray-100 shadow-sm text-emerald-500"><ShieldCheck size={14} /></div>
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
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[9px] font-bold shadow-sm cursor-pointer hover:opacity-90" style={{ backgroundColor: primaryColor }}>
              <Check size={10} /> Mengerti
            </div>
          </div>
        </div>

        {/* MODAL 2: Layanan */}
        <div className="bg-white rounded-2xl shadow-lg flex flex-col border border-gray-100 overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white rounded-lg border border-gray-100 shadow-sm text-blue-500"><FileText size={14} /></div>
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
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[9px] font-bold shadow-sm cursor-pointer hover:opacity-90" style={{ backgroundColor: primaryColor }}>
              <Check size={10} /> Mengerti
            </div>
          </div>
        </div>

        {/* MODAL 3: Kontak */}
        <div className="bg-white rounded-2xl shadow-lg flex flex-col border border-gray-100 overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white rounded-lg border border-gray-100 shadow-sm text-amber-500"><Headphones size={14} /></div>
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
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[9px] font-bold shadow-sm cursor-pointer hover:opacity-90" style={{ backgroundColor: primaryColor }}>
              <Check size={10} /> Mengerti
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}