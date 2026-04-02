import React, { useState, useEffect } from "react";
import DefaultLoginImage from "../assets/login_image.webp";
import DefaultLogo from "../assets/icon.png";
import { Mail, MoveRight, Loader2, Eye, EyeOff, ArrowLeft, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useThemeSettings } from "../context/ThemeContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState('');
  const { login } = useAuth();
  const { theme } = useThemeSettings();
  const navigate = useNavigate();

  // Cek apakah user diredirect karena session expired
  useEffect(() => {
    const reason = localStorage.getItem('session_expired_reason');
    if (reason) {
      setSessionExpiredMsg(reason);
      localStorage.removeItem('session_expired_reason');
    }
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login({ email, password });
      // console.log(user.role)
      if (user.role === "admin") {
        navigate("/wb-admin");
      } else {
        navigate("/alumni");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Login gagal. Periksa email dan password Anda.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-fourtd items-center justify-center p-4 overflow-hidden">
      <div className="flex w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden h-[75vh] lg:h-[85vh] lg:min-h-[85vh]">
        {/* Bagian Kiri: Banner Gambar */}
        <div className="hidden lg:block lg:w-1/2 h-full relative">
          <img
            src={theme?.loginBg || DefaultLoginImage}
            alt="Login Visual"
            className="w-full h-full object-cover"
          />
          <div className="bg-black/30 absolute top-0 w-full h-full"></div>
          <Link
            to="/"
            className="group absolute top-6 left-6 flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold text-primary transition-all duration-300 bg-white/90 backdrop-blur-md rounded-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-primary/20 hover:bg-primary hover:text-white"
          >
            <ArrowLeft size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Kembali Ke Landing Page</span>
          </Link>
          <div className="absolute bottom-0 z-10 p-5">
            <div className="flex items-center gap-3">
              <img src={theme?.logo || DefaultLogo} alt="" className="w-15" />
              <h1 className="font-extrabold text-fourth">
                Alumni Tracer Study
              </h1>
            </div>
            <p className="text-fourth text-medium">
              Masuk dan terhubung kembali dengan {theme?.namaSekolah || 'SMKN 1 Gondang'}. Pantau peluang
              kerja dan tetap dekat dengan sesama alumni.
            </p>
          </div>
        </div>

        {/* Bagian Kanan: Form Login */}
        <div className="w-full lg:w-1/2 py-3 px-8 md:p-12 flex flex-col justify-center bg-white max-h-dvh">
          <div className="max-w-md mx-auto w-full">
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <img src={theme?.logo || DefaultLogo} alt="logo" className="w-15" />
              <div>
                <h1 className="font-extrabold text-secondary">
                  Alumni Tracer Study
                </h1>
                <p className="font-light text-xs text-third">
                  {theme?.namaSekolah || 'SMK Negeri 1 Gondang'}
                </p>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-primary mb-3"> {/* Ubah text-secondary jadi text-primary */}
              Selamat Datang
            </h2>

            {/* Social Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <p className="text-gray-500 text-sm"> {/* Ubah text-secondary jadi text-gray-500 atau text-third */}
                Masukan email dan password untuk mengakses akun anda
              </p>
            </div>

            {/* Session Expired Warning */}
            {sessionExpiredMsg && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <Clock size={20} className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-800">Sesi Berakhir</p>
                  <p className="text-xs text-amber-600 mt-0.5">{sessionExpiredMsg}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-third">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 p-3 bg-fourth border border-third rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"} // Logic perubahan type
                    placeholder="Masukkan Password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all pr-12" // Tambah padding kanan (pr-12) agar teks tidak tertutup icon
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff size={20} /> // Icon mata dicoret
                    ) : (
                      <Eye size={20} /> // Icon mata terbuka
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-secondary"
                  />
                  Ingatkan saya
                </label>
                <Link
                  to={"/reset-password"}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Lupa password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full bg-primary hover:opacity-90 active:scale-[0.98] text-white font-bold py-3 rounded-lg transition-all mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <MoveRight width={20} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-sm text-gray-500 text-center">
              Belum punya akun alumni?{" "}
              <Link
                to={"/register"}
                className="text-blue-600 hover:underline font-bold"
              >
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
