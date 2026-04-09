import React, { useState, useEffect } from 'react';
import { ChevronDown, Check, Trash2, Plus } from 'lucide-react';
import { FaLinkedin, FaGithub, FaInstagram, FaFacebook, FaGlobe, FaTiktok, FaYoutube } from 'react-icons/fa';
import { masterDataApi } from '../api/masterData';

const iconMap = {
  instagram: <FaInstagram size={18} className="text-pink-500" />,
  linkedin: <FaLinkedin size={18} className="text-blue-600" />,
  facebook: <FaFacebook size={18} className="text-blue-500" />,
  tiktok: <FaTiktok size={18} className="text-slate-800" />,
  youtube: <FaYoutube size={18} className="text-red-500" />,
  github: <FaGithub size={18} className="text-slate-700" />,
  website: <FaGlobe size={18} className="text-slate-500" />
};

const fallbackPlatforms = [
  { id: 1, label: 'Facebook', key: 'facebook' },
  { id: 2, label: 'GitHub', key: 'github' },
  { id: 3, label: 'Instagram', key: 'instagram' },
  { id: 4, label: 'LinkedIn', key: 'linkedin' },
  { id: 5, label: 'TikTok', key: 'tiktok' },
  { id: 7, label: 'YouTube', key: 'youtube' },
  { id: 8, label: 'Website', key: 'website' }
];

export default function SosmedInput({ value, onChange }) {
  const [platforms, setPlatforms] = useState([]);
  const [socials, setSocials] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  // Fetch platforms from API
  useEffect(() => {
    masterDataApi.getSocialMedia()
      .then((res) => {
        const data = res.data.data || [];
        const mapped = data.map((p) => ({
          id: p.id,
          label: p.nama_sosmed || p.nama || p.platform,
          key: (p.nama_sosmed || p.nama || p.platform || '').toLowerCase().replace(/\s+/g, ''),
        }))
        .filter(p => !p.key.includes('twitter')); 

        mapped.sort((a, b) => a.label.localeCompare(b.label));
        setPlatforms(mapped);

        if (value && value.length > 0) {
          setSocials(value.map(item => ({
            platformId: item.id_sosmed || item.platformId,
            url: item.url
          })));
        } else {
          if (mapped.length > 0) {
            setSocials([{ platformId: mapped[0].id, url: '' }]);
          }
        }
      })
      .catch(() => {
        setPlatforms(fallbackPlatforms);
        if (value && value.length > 0) {
          setSocials(value.map(item => ({ platformId: item.id_sosmed || item.platformId, url: item.url })));
        } else {
          setSocials([{ platformId: fallbackPlatforms[0].id, url: '' }]);
        }
      });
  }, []);

  const getIcon = (p) => iconMap[p.key] || <span className="w-4.5 h-4.5 rounded-full bg-gray-300 inline-block" />;

  const fireOnChange = (updatedSocials) => {
    if (onChange) {
      const result = updatedSocials
        .filter((s) => s.url && s.url.trim() !== "")
        .map((s) => ({ id_sosmed: s.platformId, url: s.url }));
      onChange(result);
    }
  };

  const addSocial = () => {
    const usedIds = socials.map(s => s.platformId);
    const nextAvailable = platforms.find(p => !usedIds.includes(p.id)) || platforms[0];
    
    if (socials.length < platforms.length) {
      const updated = [...socials, { platformId: nextAvailable.id, url: '' }];
      setSocials(updated);
    }
  };

  const removeSocial = (index) => {
    if (socials.length > 1) {
      const updated = socials.filter((_, i) => i !== index);
      setSocials(updated);
      fireOnChange(updated);
    }
  };

  const updateSocial = (index, field, value) => {
    const updated = [...socials];
    updated[index] = { ...updated[index], [field]: value };
    setSocials(updated);
    fireOnChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-primary tracking-wider uppercase">
          Sosial Media <span className="text-[10px] text-third italic lowercase">(opsional)</span>
        </label>

        {socials.length < platforms.length && (
          <button
            type="button"
            onClick={addSocial}
            className="flex items-center gap-1 text-[10px] font-bold text-primary bg-fourth px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer shadow-sm"
          >
            <Plus size={14} /> TAMBAH
          </button>
        )}
      </div>

      {/* List Inputan */}
      <div className="space-y-3">
        {socials.map((item, index) => {
          const selectedPlatform = platforms.find(p => p.id === item.platformId);
          // Ambil ID yang sudah dipakai (kecuali ID baris ini sendiri)
          const usedIds = socials.map(s => s.platformId).filter(id => id !== item.platformId);
          // Opsi yang masih bisa dipilih baris ini (termasuk dirinya sendiri)
          const availablePlatforms = platforms.filter(p => !usedIds.includes(p.id));

          return (
            <div key={index} className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className={`flex-1 flex items-center bg-white border rounded-xl transition-all duration-300 relative
                ${openDropdownIndex === index ? 'border-primary ring-2 ring-primary/5 z-30' : 'border-fourth hover:border-primary/50 z-10'}`}>

                {/* Custom Dropdown */}
                <div className="relative border-r border-fourth">
                  <button
                    type="button"
                    // PERBAIKAN: Hanya bisa diklik jika ada platform LAIN yang tersedia (> 1)
                    onClick={() => availablePlatforms.length > 1 && setOpenDropdownIndex(openDropdownIndex === index ? null : index)}
                    className={`flex items-center gap-2 px-3 py-2.5 min-w-12.5 justify-center ${availablePlatforms.length > 1 ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {selectedPlatform && getIcon(selectedPlatform)}
                    {/* PERBAIKAN: Panah hanya muncul jika opsi tersedia lebih dari 1 */}
                    {availablePlatforms.length > 1 && (
                      <ChevronDown size={14} className={`text-third transition-transform duration-300 ${openDropdownIndex === index ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                 {/* PERBAIKAN: Dropdown hanya mekar jika opsi tersedia lebih dari 1 */}
                 {openDropdownIndex === index && availablePlatforms.length > 1 && (
                  <div 
                    className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-48 bg-white border border-fourth rounded-xl shadow-xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ul className="py-1 max-h-56 overflow-y-auto custom-scrollbar">
                        {availablePlatforms.map((p) => (
                          <li
                            key={p.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateSocial(index, 'platformId', p.id);
                              setOpenDropdownIndex(null);
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-fourth cursor-pointer transition-colors text-sm text-primary"
                          >
                            {getIcon(p)}
                            <span>{p.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Input URL */}
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => updateSocial(index, 'url', e.target.value)}
                  placeholder={`Url ${selectedPlatform?.label || ''}`}
                  className="w-full p-2.5 text-sm outline-none bg-transparent text-primary placeholder:text-third/50"
                />
              </div>

              {/* Tombol Trash */}
              {socials.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSocial(index)}
                  className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl border border-transparent hover:border-red-100 cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Overlay Close Dropdown */}
      {openDropdownIndex !== null && (
        <div className="fixed inset-0 z-20 pointer-events-none" onClick={() => setOpenDropdownIndex(null)} />
      )}
    </div>
  );
}