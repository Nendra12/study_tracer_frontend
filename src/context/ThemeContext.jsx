import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Buat Context
const ThemeContext = createContext();

// 2. Custom Hook agar lebih mudah dipanggil di komponen lain
export const useThemeSettings = () => {
  return useContext(ThemeContext);
};

// 3. Provider Component
export const ThemeProvider = ({ children }) => {
  // State default tema (Nantinya nilai awal ini bisa di-fetch dari API/Database)
  const [theme, setTheme] = useState({
    namaSekolah: 'SMK Negeri 1 Gondang',
    primaryColor: '#3c5759',
    secondaryColor: '#f3f4f4',
    thirdColor: '#9ca3af',
    logo: null, // URL gambar logo default
    loginBg: null // URL gambar login default
  });

  // Fungsi "Sakti" untuk menginjeksi warna ke CSS Variables
  const applyColorsToDOM = (colors) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primaryColor);
    root.style.setProperty('--color-secondary', colors.secondaryColor);
    root.style.setProperty('--color-third', colors.thirdColor);
  };

  // Terapkan warna saat pertama kali web dimuat
  useEffect(() => {
    // TIPS: Di sini kamu bisa menambahkan fungsi fetch API untuk 
    // mengambil pengaturan tema dari database saat user baru buka web.
    applyColorsToDOM(theme);
  }, []);

  // Fungsi untuk dipanggil dari halaman "Pengaturan Tampilan"
  const updateSettings = (newSettings) => {
    const updatedTheme = { ...theme, ...newSettings };
    
    // Update state React
    setTheme(updatedTheme);
    
    // Update warna di HTML langsung
    applyColorsToDOM(updatedTheme);
    
    // TIPS: Di sini kamu juga bisa memanggil API axios.post/put
    // untuk menyimpan pengaturan baru ini ke database backend.
  };

  return (
    <ThemeContext.Provider value={{ theme, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};