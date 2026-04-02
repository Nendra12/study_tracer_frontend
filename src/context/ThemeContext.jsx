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
  landingBg: null,
  deskripsiFooter: '',
  emailKontak: '',
  webKontak: '',
  telpKontak: '',
  teksPrivasi: '',
  teksLayanan: '',
  teksDukungan: '',
};

// Derive storage base from API base URL
// API = http://localhost:8000/api → Storage = http://localhost:8000/storage
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const STORAGE_BASE = API_BASE.replace('/api', '/storage');

/**
 * Fix Storage URL yang salah dari backend.
 * Backend mungkin mengembalikan http://localhost/storage/... (tanpa port)
 * karena APP_URL di .env Laravel belum diatur dengan benar.
 * Fungsi ini mengoreksi bagian /storage/... agar sesuai base yang benar.
 */
const fixStorageUrl = (url) => {
  if (!url) return null;
  // Ambil path setelah /storage/ dari URL yang dikembalikan backend
  const storageIndex = url.indexOf('/storage/');
  if (storageIndex !== -1) {
    const relativePath = url.substring(storageIndex + '/storage/'.length);
    return `${STORAGE_BASE}/${relativePath}`;
  }
  return url;
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
  // API Resource mengembalikan: logo, login_bg (URL dari Storage::url())
  // fixStorageUrl diperlukan karena APP_URL backend mungkin tidak sesuai
  const mapApiToTheme = (data) => {
    return {
      namaSekolah: data.nama_sekolah || DEFAULT_THEME.namaSekolah,
      primaryColor: data.primary_color || DEFAULT_THEME.primaryColor,
      secondaryColor: data.secondary_color || DEFAULT_THEME.secondaryColor,
      thirdColor: data.third_color || DEFAULT_THEME.thirdColor,
      logo: fixStorageUrl(data.logo) || DEFAULT_THEME.logo,
      loginBg: fixStorageUrl(data.login_bg) || DEFAULT_THEME.loginBg,
      landingBg: fixStorageUrl(data.landing_bg) || DEFAULT_THEME.landingBg,
      deskripsiFooter: data.deskripsi_footer ?? DEFAULT_THEME.deskripsiFooter,
      emailKontak: data.email_kontak ?? DEFAULT_THEME.emailKontak,
      webKontak: data.web_kontak ?? DEFAULT_THEME.webKontak,
      telpKontak: data.telp_kontak ?? DEFAULT_THEME.telpKontak,
      teksPrivasi: data.teks_privasi ?? DEFAULT_THEME.teksPrivasi,
      teksLayanan: data.teks_layanan ?? DEFAULT_THEME.teksLayanan,
      teksDukungan: data.teks_dukungan ?? DEFAULT_THEME.teksDukungan,
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