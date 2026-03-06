import React, { useState, useEffect } from 'react';
import morning from '../../assets/morning.png';
import afternoon from '../../assets/afternoon.png';
import night from '../../assets/moon.png';

const Greeting = () => {
  const [data, setData] = useState({
    text: '',
    subText: '',
    styles: '',
    icon: null
  });

  useEffect(() => {
    const hours = new Date().getHours();

    if (hours >= 5 && hours < 12) {
      setData({
        text: 'Selamat Pagi!',
        // Soft Amber/Rose Gold (Apple Morning Style)
        styles: 'bg-orange-200/50 text-orange-900',
        icon: morning
      });
    } else if (hours >= 12 && hours < 18) {
      setData({
        text: 'Selamat Siang',
        // Bright Sky Blue (Apple Day Style)
        styles: 'from-blue-200/50 via-cyan-100/40 to-indigo-100/30 text-blue-900',
        icon: afternoon
      });
    } else {
      setData({
        text: 'Selamat Malam',
        // Deep Indigo/Slate (Notion Dark/Apple Night Style)
        styles: 'from-indigo-900/80 via-slate-900/90 to-black text-indigo-100',
        icon: night
      });
    }
  }, []);

  return (
    <div className="w-full max-w-md p-0.5 rounded-3xl bg-white/10 shadow-sm border border-white/20 backdrop-blur-md">
      <div className={`relative overflow-hidden rounded-[1.4rem] p-6 bg-gradient-to-br ${data.styles} transition-all duration-700 ease-in-out`}>

        {/* Dekorasi Ornamen Lingkaran Abstract (Mesh Effect) */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-center gap-5">
            <img src={data.icon} alt={data.text} className='w-15 '/>
            {/* <span className="text-2xl animate-bounce-slow">{data.icon}</span>*/}
            <h1 className="text-xl font-bold tracking-tight md:text-2xl leading-none">
              {data.text}
            </h1>
          </div>
        </div>

        {/* Apple Style Time Tag */}
        <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default Greeting;
