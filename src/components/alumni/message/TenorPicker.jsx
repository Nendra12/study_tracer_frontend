import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function TenorPicker({ onSelectGif, onClose }) {
  const [search, setSearch] = useState('');
  const [gifs, setGifs] = useState([]);

  useEffect(() => {
    const endpoint = search ? 'search' : 'trending';
    fetch(`https://g.tenor.com/v1/${endpoint}?q=${search}&key=LIVDSRZULELA&limit=12`)
      .then((res) => res.json())
      .then((data) => setGifs(data.results || []))
      .catch(() => setGifs([]));
  }, [search]);

  return (
    <div className="absolute bottom-16 left-4 md:left-24 bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl w-72 p-3 z-50">
      <div className="flex items-center justify-between mb-2 px-1">
        <h4 className="text-xs font-bold text-gray-500 uppercase">Cari GIF</h4>
        <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
      <input
        type="text"
        placeholder="Cari GIF..."
        className="w-full bg-gray-50 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 mb-2 transition-all"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-1.5 h-48 overflow-y-auto pr-1 custom-scrollbar">
        {gifs.map((gif) => (
          <img
            key={gif.id}
            src={gif.media[0].tinygif.url}
            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity bg-gray-100"
            onClick={() => onSelectGif(gif.media[0].gif.url)}
            alt="gif"
          />
        ))}
      </div>
    </div>
  );
}
