import React from 'react';
import { Eye, Upload, Image as ImageIcon } from 'lucide-react';

export default function MetaDataSection({
  metaTitle, setMetaTitle,
  metaDescription, setMetaDescription,
  metaIconPreview, setMetaIconPreview, setMetaIconFile, metaIconInputRef,
  openPreview, handleImageChange
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
        <h3 className="text-lg font-bold text-primary">Manajemen Meta Data (SEO)</h3>
        <button
          onClick={() => openPreview('meta')}
          className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Eye size={14} className='text-primary' /> Preview Tampilan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
            <input
              type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
              placeholder="Contoh: Study Tracer - Alumni"
            />
            <p className="text-[11px] text-gray-400 font-medium mt-1">Muncul di tab browser hasil pencarian mesin telusur.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Meta Deskripsi <span className="text-red-500 text-xs font-normal">(Wajib terisi)</span>
            </label>
            <textarea
              value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows="3"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white resize-none"
              placeholder="Masukkan deskripsi singkat tentang website untuk SEO..."
            ></textarea>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold text-gray-700">Meta Icon (Favicon)</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div 
              onClick={() => metaIconInputRef.current.click()}
              className="w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:border-primary transition-colors group relative"
            >
              {metaIconPreview ? (
                <>
                  <img src={metaIconPreview} alt="Meta Icon" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={20} className="text-white" />
                  </div>
                </>
              ) : (
                <ImageIcon size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
              )}
            </div>
            
            <div className="space-y-2 flex-1">
              <input type="file" accept=".ico,.png,.jpg,.jpeg,.svg" className="hidden" ref={metaIconInputRef} onChange={(e) => handleImageChange(e, setMetaIconPreview, setMetaIconFile)} />
              <button onClick={() => metaIconInputRef.current.click()} className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
                <Upload size={14} /> Ganti Icon
              </button>
              <p className="text-[11px] text-gray-400 font-medium max-w-50">Format: ICO, PNG, SVG (Idealnya 1:1, max 2MB).</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}