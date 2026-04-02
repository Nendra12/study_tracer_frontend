import { useEffect } from 'react'
import AppRouter from "./router/AppRouter"
import { useThemeSettings } from './context/ThemeContext'

function App() {
  const { theme } = useThemeSettings();

  // Set document title & favicon dari ThemeContext (data dari /settings/tampilan)
  useEffect(() => {
    if (theme?.namaSekolah) {
      document.title = `Study Tracer - ${theme.namaSekolah}`;
    }

    if (theme?.logo) {
      const linkIcon = document.querySelector('link[rel="icon"]');
      if (linkIcon) {
        linkIcon.setAttribute('href', theme.logo);
      }
    }
  }, [theme?.namaSekolah, theme?.logo]);

  return (
    <>
      <AppRouter />
    </>
  )
}

export default App
