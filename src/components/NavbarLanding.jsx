import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import LoginButton from './alumni/LoginButton';
import Login from '../pages/Login';

export default function NavbarLanding() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('beranda');

  // Efek deteksi scroll untuk mengubah styling navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efek deteksi section aktif berdasarkan scroll position
  useEffect(() => {
    const handleScrollSpy = () => {
      const sections = ['beranda', 'petunjuk', 'fitur', 'alumni', 'karir'];
      const scrollPosition = window.scrollY + 120; // Offset untuk navbar

      let currentSection = 'beranda';

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;

          if (scrollPosition >= offsetTop - 100) {
            currentSection = section;
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScrollSpy);
    handleScrollSpy(); // Initial check
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  // Fungsi untuk scroll smooth dengan offset navbar
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();

    // Set active section immediately untuk instant feedback
    setActiveSection(targetId.replace('#', ''));

    const element = document.getElementById(targetId.replace('#', ''));
    if (element) {
      const navbarHeight = 100; // Tinggi navbar + offset tambahan
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navLinks = [
    { name: 'Beranda', href: '#beranda' },
    { name: 'Petunjuk', href: '#petunjuk' },
    { name: 'Fitur', href: '#fitur' },
    { name: 'Alumni', href: '#alumni' },
    { name: 'Karir', href: '#karir' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out"
    >
      <div className={`max-w-7xl mx-auto pt-4 transition-all duration-500 ${
        scrolled ? 'px-8 sm:px-12 lg:px-25' : 'px-4 sm:px-6 lg:px-8'
      }`}>
        <div className={`rounded-3xl py-3 flex justify-between items-center transition-all duration-500 ${
          scrolled ? 'shadow-md bg-white/70 backdrop-blur-xl px-6' : 'bg-transparant'
        }`}>

        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/icon.png"
            alt="Alumni Tracer Logo"
            className="w-12 h-10 object-contain drop-shadow-sm"
          />
          <div className='flex flex-col transition-all duration-500 ease-in-out'>
            <span className="font-black text-primary text-lg">Alumni Tracer</span>
            { !scrolled && <span className='text-xs font-semibold'>SMK Negeri 1 Gondang</span> }
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden xl:flex bg-[#f3f4f4]/80 p-1 rounded-2xl border border-white/60">
          {navLinks.map((item, i) => {
            const isActive = activeSection === item.href.replace('#', '');
            return (
              <motion.a
                key={i}
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-third hover:text-primary'
                }`}
              >
                {item.name}
              </motion.a>
            );
          })}
        </div>

        {/* Action Button & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:block">
            <LoginButton />
          </div>

          {/* Hamburger Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="xl:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-[#f3f4f4] rounded-full"
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-primary block"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-5 h-0.5 bg-primary block"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-primary block"
            />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-4 p-4 bg-white/90 backdrop-blur-2xl border border-white/50 rounded-[2rem] shadow-2xl xl:hidden flex flex-col gap-2"
            >
              {navLinks.map((item, i) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <motion.a
                    key={i}
                    href={item.href}
                    onClick={(e) => {
                      handleSmoothScroll(e, item.href);
                      setIsOpen(false);
                    }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: i * 0.1 } }}
                    className={`px-6 py-4 rounded-2xl font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-[#526061] hover:bg-[#f3f4f4] hover:text-primary'
                    }`}
                  >
                    {item.name}
                  </motion.a>
                );
              })}
              <hr className="border-[#f3f4f4] my-2" />
              <div className="w-full">
                <LoginButton />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}
