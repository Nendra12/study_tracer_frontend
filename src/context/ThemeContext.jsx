import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// 1. Buat Context
const ThemeContext = createContext();

// 2. Custom Hook agar lebih mudah dipanggil di komponen lain
export const useThemeSettings = () => {
  return useContext(ThemeContext);
};

// Default fallback values
const DEFAULT_THEME = {
  namaSekolah: 'SMK Negeri 1 Gondang',
  primaryColor: '#3c5759',
  secondaryColor: '#f3f4f4',
  thirdColor: '#9ca3af',
  logo: null,
  loginBg: null,
};

// 3. Provider Component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi "Sakti" untuk menginjeksi warna ke CSS Variables
  const applyColorsToDOM = (colors) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primaryColor);
    root.style.setProperty('--color-secondary', colors.secondaryColor);
    root.style.setProperty('--color-third', colors.thirdColor);
  };

  // Helper: map API response ke format frontend theme
  // API Resource mengembalikan: logo, login_bg (sudah berupa full URL dari Storage::url())
  const mapApiToTheme = (data) => {
    return {
      namaSekolah: data.nama_sekolah || DEFAULT_THEME.namaSekolah,
      primaryColor: data.primary_color || DEFAULT_THEME.primaryColor,
      secondaryColor: data.secondary_color || DEFAULT_THEME.secondaryColor,
      thirdColor: data.third_color || DEFAULT_THEME.thirdColor,
      logo: data.logo || DEFAULT_THEME.logo,
      loginBg: data.login_bg || DEFAULT_THEME.loginBg,
    };
  };

  // Fetch pengaturan tampilan dari backend saat pertama kali web dimuat
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings/tampilan');
        const apiData = response.data?.data || response.data;

        if (apiData) {
          const mapped = mapApiToTheme(apiData);
          setTheme(mapped);
          applyColorsToDOM(mapped);
        } else {
          applyColorsToDOM(DEFAULT_THEME);
        }
      } catch (error) {
        console.warn('Gagal mengambil pengaturan tampilan, menggunakan default:', error.message);
        applyColorsToDOM(DEFAULT_THEME);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Fungsi untuk dipanggil dari halaman "Pengaturan Tampilan" (update lokal saja)
  const updateSettings = (newSettings) => {
    const updatedTheme = { ...theme, ...newSettings };
    setTheme(updatedTheme);
    applyColorsToDOM(updatedTheme);
  };

  // Fungsi untuk reload settings dari API (setelah berhasil save di backend)
  const refreshFromApi = async () => {
    try {
      const response = await api.get('/settings/tampilan');
      const apiData = response.data?.data || response.data;
      if (apiData) {
        const mapped = mapApiToTheme(apiData);
        setTheme(mapped);
        applyColorsToDOM(mapped);
      }
    } catch (error) {
      console.warn('Gagal refresh pengaturan tampilan:', error.message);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, updateSettings, refreshFromApi, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};