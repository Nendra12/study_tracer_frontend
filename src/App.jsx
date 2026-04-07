import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import AppRouter from "./router/AppRouter"
import { useThemeSettings } from './context/ThemeContext'
import api from './api/axios'
import ReverbEventBridge from './components/ReverbEventBridge'

function App() {
  const { theme } = useThemeSettings();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await api.get('/metadata');
        const data = res.data?.data || null;

        if (data) {
          if (data.title) document.title = data.title;

          if (data.description) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', data.description);
          }

          const linkIcon = document.querySelector('link[rel="icon"]');
          if (linkIcon) {
            // Prioritaskan dari metadata
            if (data.icon_url) {
              linkIcon.setAttribute('href', data.icon_url);
            }
            // Jika kosong, pakai fallback dari theme
            else if (theme?.logo) {
              linkIcon.setAttribute('href', theme.logo);
            }
          }
        } else {
          // Jika tidak ada rows metadata
          const linkIcon = document.querySelector('link[rel="icon"]');
          if (linkIcon && theme?.logo) {
            linkIcon.setAttribute('href', theme.logo);
          }
        }
      } catch (error) {
        // Endpoint metadata opsional pada beberapa backend.
        // Saat 404, gunakan fallback tanpa menampilkan error di console.
        if (error?.response?.status !== 404) {
          console.error('Error fetching meta_data:', error);
        }
        const linkIcon = document.querySelector('link[rel="icon"]');
        if (linkIcon && theme?.logo) {
          linkIcon.setAttribute('href', theme.logo);
        }
      }
    };

    fetchMetadata();
  }, [theme?.logo]); // Dependensi: jalankan ulang jika theme.logo akhirnya diload oleh ThemeContext

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            fontWeight: 600,
          },
        }}
      />
      <ReverbEventBridge />
      <AppRouter />
    </>
  )
}

export default App