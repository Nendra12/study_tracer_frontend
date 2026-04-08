import React from 'react';
import { Eye } from 'lucide-react';

export default function FooterModalSection({
  deskripsiFooter, setDeskripsiFooter,
  emailKontak, setEmailKontak,
  webKontak, setWebKontak,
  telpKontak, setTelpKontak,
  teksPrivasi, setTeksPrivasi,
  teksLayanan, setTeksLayanan,
  teksDukungan, setTeksDukungan,
  openPreview
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
        <h3 className="text-lg font-bold text-primary">Konten Footer & Teks Modal</h3>
        <button
          onClick={() => openPreview('footer')}
          className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Eye size={14} className='text-primary' /> Preview Tampilan
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Footer</label>
            <textarea
              value={deskripsiFooter} onChange={(e) => setDeskripsiFooter(e.target.value)} rows="3"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white resize-none"
              placeholder="Masukkan deskripsi singkat tentang sistem alumni..."
            ></textarea>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-primary border-b border-gray-100 pb-1">Detail Kontak Kami</h4>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Email</label>
              <input type="email" value={emailKontak} onChange={(e) => setEmailKontak(e.target.value)} placeholder="contoh@domain.com" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Website</label>
              <input type="text" value={webKontak} onChange={(e) => setWebKontak(e.target.value)} placeholder="www.domain.com" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Telepon</label>
              <input type="text" value={telpKontak} onChange={(e) => setTelpKontak(e.target.value)} placeholder="(0123) 456789" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Teks Modal Kebijakan Privasi</label>
            <textarea
              value={teksPrivasi} onChange={(e) => setTeksPrivasi(e.target.value)} rows="3"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white resize-none"
              placeholder="Masukkan teks kebijakan privasi..."
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Teks Modal Ketentuan Layanan</label>
            <textarea
              value={teksLayanan} onChange={(e) => setTeksLayanan(e.target.value)} rows="3"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white resize-none"
              placeholder="Masukkan teks ketentuan layanan..."
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Teks Pengantar Kontak Dukungan</label>
            <textarea
              value={teksDukungan} onChange={(e) => setTeksDukungan(e.target.value)} rows="2"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white resize-none"
              placeholder="Masukkan pesan pengantar untuk modal kontak..."
            ></textarea>
          </div>
        </div>
      </div>
    </section>
  );
}