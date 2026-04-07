import React, { useState, useEffect } from "react";
import DefaultLoginImage from "../assets/login_image.jpg";
import DefaultLogo from "../assets/icon.png";
import { Mail, MoveRight, Loader2, Eye, EyeOff, ArrowLeft, Clock, RefreshCcw, ShieldCheck, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useThemeSettings } from "../context/ThemeContext";
import { authApi } from "../api/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaKey, setCaptchaKey] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
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

  const loadCaptcha = async (isRefresh = false) => {
    setCaptchaLoading(true);
    try {
      const res = isRefresh
        ? await authApi.refreshCaptcha()
        : await authApi.generateCaptcha();
      const image = res?.data?.captcha?.image || "";
      const key = res?.data?.captcha?.key || "";
      setCaptchaImage(image);
      setCaptchaKey(key);
      setCaptchaToken("");
    } catch (err) {
      console.error("Failed to load captcha:", err);
      setCaptchaImage("");
      setCaptchaKey("");
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    loadCaptcha(false);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const normalizedCaptcha = captchaToken.trim().toLowerCase();
      const user = await login({
        email,
        password,
        captcha_token: normalizedCaptcha,
        captcha_key: captchaKey,
      });
      if (user.role === "admin") {
        navigate("/wb-admin");
      } else {
        navigate("/alumni");
      }
    } catch (err) {
      const fieldErrors = err.response?.data?.errors || {};
      const msg =
        fieldErrors?.captcha_token?.[0] ||
        fieldErrors?.email?.[0] ||
        err.response?.data?.message ||
        "Login gagal. Periksa email, password, dan captcha Anda.";
      setError(msg);
      await loadCaptcha(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Padding Y paling luar dipangkas
    <div className="min-h-screen w-full bg-fourtd flex items-center justify-center p-4">
      
      {/* Container utama dibuat sedikit lebih kecil max-height-nya jika diperlukan, tapi konten yang menyusut sudah cukup */}
      <div className="flex flex-col lg:flex-row w-full max-w-4xl xl:max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Bagian Kiri: Banner Gambar */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-6 xl:p-8 overflow-hidden">
          <img
            src={theme?.loginBg || DefaultLoginImage}
            alt="Login Visual"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          
          <div className="relative z-10">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary transition-all duration-300 bg-white/90 backdrop-blur-md rounded-xl shadow-md hover:bg-primary hover:text-white"
            >
              <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
              <span>Kembali Ke Landing</span>
            </Link>
          </div>

          <div className="relative z-10 mt-10">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="bg-white p-1.5 rounded-lg shadow-sm">
                <img src={theme?.logo || DefaultLogo} alt="" className="w-8 h-8 object-contain" />
              </div>
              <h1 className="font-extrabold text-xl xl:text-2xl text-white drop-shadow-md">
                Alumni Tracer Study
              </h1>
            </div>
            <p className="text-white/90 text-sm font-medium leading-relaxed drop-shadow-md">
              Masuk dan terhubung kembali dengan {theme?.namaSekolah || 'SMKN 1 Kraksaan'}. Pantau peluang kerja dan tetap dekat dengan sesama alumni.
            </p>
          </div>
        </div>

        {/* Bagian Kanan: Form Login */}
        <div className="w-full lg:w-1/2 p-5 sm:px-8 sm:py-6 lg:px-10 lg:py-8 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            
            {/* Header Mobile */}
            <div className="flex items-center gap-2.5 mb-4 lg:hidden">
              <div className="bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                <img src={theme?.logo || DefaultLogo} alt="logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="font-extrabold text-primary text-base leading-tight">
                  Alumni Tracer Study
                </h1>
                <p className="font-medium text-[10px] text-gray-500">
                  {theme?.namaSekolah || 'SMKN 1 Kraksaan'}
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-primary mb-1">
              Selamat Datang
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-5 font-medium">
              Masukan email dan password untuk mengakses akun anda
            </p>

            {/* Session Expired Warning */}
            {sessionExpiredMsg && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <Clock size={16} className="text-amber-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800">Sesi Berakhir</p>
                  <p className="text-[10px] text-amber-600 mt-0.5 font-medium">{sessionExpiredMsg}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form - Jarak antar elemen (space-y) dikurangi jadi 3 (12px) */}
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Captcha
                </label>
                {/* Padding box captcha dikurangi */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 sm:p-3 space-y-2.5">
                  <div className="flex flex-row items-center gap-2">
                    <div className="h-10 w-[120px] sm:w-[140px] rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                      {captchaLoading ? (
                        <Loader2 size={14} className="animate-spin text-gray-400" />
                      ) : captchaImage ? (
                        <img src={captchaImage} alt="Captcha" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-gray-400 font-medium">Gagal</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => loadCaptcha(true)}
                      disabled={loading || captchaLoading}
                      className="cursor-pointer flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-bold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <RefreshCcw size={12} className={captchaLoading ? "animate-spin" : ""} />
                      Muat Ulang
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <ShieldCheck size={14} />
                    </div>
                    <input
                      type="text"
                      placeholder="Masukkan kode captcha"
                      value={captchaToken}
                      onChange={(e) => setCaptchaToken(e.target.value)}
                      className="w-full pl-8 p-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-medium"
                      required
                      disabled={loading || captchaLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] sm:text-xs pt-1">
                <label className="flex items-center gap-1.5 text-gray-600 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Ingatkan saya
                </label>
                <Link
                  to={"/reset-password"}
                  className="text-primary hover:text-primary/80 hover:underline font-bold transition-colors"
                >
                  Lupa password?
                </Link>
              </div>

              {/* Tombol Action */}
              <div className="flex gap-2.5 mt-3 sm:mt-4">
                
                {/* Tombol Kembali (Hanya Mobile) */}
                <Link
                  to="/"
                  className="flex lg:hidden items-center justify-center px-4 shrink-0 bg-primary/10 text-primary rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm"
                  title="Kembali ke Landing Page"
                >
                  <ArrowLeft size={16} />
                </Link>

                {/* Tombol Masuk */}
                <button
                  type="submit"
                  disabled={loading || captchaLoading || !captchaImage || !captchaToken.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-bold py-3 rounded-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-xs sm:text-sm">Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs sm:text-sm font-black">Masuk</span>
                      <MoveRight size={14} />
                    </>
                  )}
                </button>
              </div>

            </form>

            <p className="mt-4 sm:mt-6 text-xs text-gray-500 font-medium text-center">
              Belum punya akun alumni?{" "}
              <Link
                to={"/register"}
                className="text-primary hover:text-primary/80 hover:underline font-black transition-colors"
              >
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}