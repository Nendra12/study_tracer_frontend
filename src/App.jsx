import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import AppRouter from "./router/AppRouter"
import { useLoading } from './context/LoadingContext'
import { setupLoadingInterceptor } from './api/axios'
import Loader from './components/Loaders'

function App() {
  const { isLoading, showLoading, hideLoading } = useLoading();
  const location = useLocation();

  useEffect(() => {
    // Setup axios interceptor dengan loading callbacks
    setupLoadingInterceptor(showLoading, hideLoading);
  }, [showLoading, hideLoading]);

  // Hanya tampilkan loading di halaman alumni
  const isAlumniRoute = location.pathname.startsWith('/alumni');
  const shouldShowLoading = isLoading && isAlumniRoute;

  return (
    <>
      {shouldShowLoading && (
        <div className="flex items-center justify-center h-screen w-screen fixed top-0 left-0 bg-white z-[9999]">
          <Loader />
        </div>
      )}
      <AppRouter />
    </>
  )
}

export default App
