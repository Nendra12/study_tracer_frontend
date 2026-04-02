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

        if (data) {
          if (data.title) document.title = data.title;
          
          if (data.description) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', data.description);
          }
          
          const linkIcon = document.querySelector('link[rel="icon"]');
          if (linkIcon) {
            // Prioritaskan dari metadata
            console.log('Setting favicon from metadata:', data.icon_url);
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
        // Jika API error (misal jaringan down atau 404)
        console.error('Error fetching meta_data:', error);
        const linkIcon = document.querySelector('link[rel="icon"]');
        if (linkIcon && theme?.logo) {
          linkIcon.setAttribute('href', theme.logo);
        }
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
