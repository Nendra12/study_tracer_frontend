import React, { useState, useEffect } from "react";
import DefaultLoginImage from "../assets/login_image.jpg";
import DefaultLogo from "../assets/icon.png";
import { Mail, MoveRight, Loader2, Eye, EyeOff, ArrowLeft, Clock, RefreshCcw, ShieldCheck, AlertCircle, MoveLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const { theme } = useThemeSettings();
  const navigate = useNavigate();
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

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

  const handleGoogleSuccess = async (credentialResponse) => {
    const googleIdToken = credentialResponse?.credential;
    if (!googleIdToken) {
      setError("Token Google tidak ditemukan. Silakan coba lagi.");
      return;
    }

    setError("");
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle(googleIdToken);
      if (user.role === "admin") {
        navigate("/wb-admin");
      } else {
        navigate("/alumni");
      }
    } catch (err) {
      const statusCode = err.response?.status;
      const fieldErrors = err.response?.data?.errors || {};
      const msg =
        fieldErrors?.email?.[0] ||
        (statusCode === 404 ? "Akun Google belum terdaftar. Silakan daftar terlebih dahulu." : null) ||
        err.response?.data?.message ||
        "Login Google gagal. Silakan coba lagi.";
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-fourtd flex items-center justify-center md:p-20 lg:p-5">
      <div className="absolute lg:hidden realtive top-0 w-full h-80">
        <Link
          to="/"
          className="absolute top-0 left-0 mt-3 ml-3 inline-flex items-center justify-center p-2 text-slate-500 rounded-full bg-slate-100 hover:text-slate-900 transition-colors duration-200"
          title="Kembali ke Landing Page"
        >
          <MoveLeft />
        </Link>
        <img
          src={theme?.loginBg || DefaultLoginImage}
          alt="Login Visual"
          className=" w-full h-full object-cover"
        />
      </div>
      <div className="flex mt-50 md:mt-40 lg:mt-0 z-100 flex-col lg:flex-row w-full xl:max-w-5xl bg-white rounded-t-[80px] lg:rounded-xl shadow-2xl overflow-hidden">

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
              className="absolute top-0 left-0 inline-flex items-center justify-center p-2 text-slate-500 rounded-full bg-white hover:text-slate-900 transition-colors duration-200"
            >
              <ArrowLeft size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
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
              Masuk dan terhubung kembali dengan {theme?.namaSekolah || 'SMKN 2 Kraksaan'}. Pantau peluang kerja dan tetap dekat dengan sesama alumni.
            </p>
          </div>
        </div>

        {/* Bagian Kanan: Form Login */}
        {/* PERUBAHAN: Mengurangi padding vertikal (lg:py-4) agar lebih memadat ke atas */}
        <div className="w-full lg:w-1/2 px-4 py-10 sm:p-8 lg:px-8 lg:py-4 xl:py-6 flex flex-col justify-center bg-white shadow-md">
          <div className="max-w-md  mx-auto w-full">

            {/* Header Mobile */}


            <div className="flex items-center gap-2.5 mb-5 hidden">
              <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                <img src={theme?.logo || DefaultLogo} alt="logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="font-extrabold text-primary text-base sm:text-lg leading-tight">
                  Alumni Tracer Study
                </h1>
                <p className="font-medium text-[10px] sm:text-xs text-gray-500">
                  {theme?.namaSekolah || 'SMKN 2 Kraksaan'}
                </p>
              </div>
            </div>

            <h2 className="text-2xl text-center sm:text-3xl font-bold text-primary mb-1 lg:text-2xl">
              Selamat Datang Alumni
            </h2>
            {/* PERUBAHAN: Mengurangi margin bawah (mb-3) */}
            <p className="text-center text-gray-500 text-xs sm:text-sm mb-4 lg:mb-3 font-medium">
              Masuk dengan email & password
            </p>

            {/* Session Expired Warning */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${sessionExpiredMsg ? "grid-rows-[1fr] opacity-100 mb-3 lg:mb-2.5" : "grid-rows-[0fr] opacity-0 m-0"
                }`}
            >
              <div className="overflow-hidden">
                <div className="p-3 lg:p-2 bg-amber-50 border border-amber-200 rounded-xl lg:rounded-lg flex items-start gap-2">
                  <Clock size={16} className="text-amber-500 shrink-0 mt-0.5 lg:mt-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">Sesi Berakhir</p>
                    <p className="text-[10px] text-amber-600 mt-0.5 font-medium">{sessionExpiredMsg}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${error ? "grid-rows-[1fr] opacity-100 mb-3 lg:mb-2.5" : "grid-rows-[0fr] opacity-0 m-0"
                }`}
            >
              <div className="overflow-hidden">
                <div className="p-3 lg:p-2 bg-red-50 border border-red-200 rounded-xl lg:rounded-lg text-red-600 text-xs sm:text-sm lg:text-xs font-medium flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 lg:mt-0" />
                  <span>{error}</span>
                </div>
              </div>
            </div>

            {/* Form - PERUBAHAN: space-y dirapatkan menjadi space-y-3 lg:space-y-2 */}
            <form className="space-y-3 lg:space-y-2" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs sm:text-sm lg:text-[11px] font-bold text-gray-700 mb-1 lg:mb-0.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 lg:pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  {/* PERUBAHAN: py dirapatkan menjadi py-2.5 lg:py-2 */}
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 lg:pl-9 py-2.5 lg:py-2 bg-gray-50 border border-gray-200 rounded-xl lg:rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm lg:text-xs"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm lg:text-[11px] font-bold text-gray-700 mb-1 lg:mb-0.5">
                  Password
                </label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-2.5 lg:py-2 pl-4 pr-12 lg:pr-10 bg-gray-50 border border-gray-200 rounded-xl lg:rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm lg:text-xs"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 lg:p-0"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm lg:text-[11px] font-bold text-gray-700 mb-1 lg:mb-0.5">
                  Captcha
                </label>
                {/* PERUBAHAN: Padding dan gap dirapatkan */}
                <div className="rounded-xl lg:rounded-lg border border-gray-200 bg-gray-50 p-2.5 sm:p-3 lg:p-2 space-y-2">

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    {/* PERUBAHAN: Tinggi gambar captcha dikurangi h-10 lg:h-9 */}
                    <div className="h-10 lg:h-9 w-full sm:w-[150px] lg:w-[130px] rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                      {captchaLoading ? (
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                      ) : captchaImage ? (
                        <img src={captchaImage} alt="Captcha" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-gray-400 font-medium">Gagal dimuat</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => loadCaptcha(true)}
                      disabled={loading || captchaLoading}
                      className="cursor-pointer w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 lg:px-3 py-2 lg:py-1.5 text-[11px] font-bold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
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
                      className="w-full pl-9 p-2 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs lg:text-[11px] font-medium"
                      required
                      disabled={loading || captchaLoading}
                    />
                  </div>
                  <p className="text-[9px] lg:text-[9px] text-gray-500 font-medium leading-none hidden lg:block">
                    *Captcha berlaku satu kali.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] sm:text-sm lg:text-[11px] pt-0.5">
                <label className="flex items-center gap-1.5 sm:gap-2 text-gray-600 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-3.5 lg:h-3.5 rounded border-gray-300 text-primary focus:ring-primary"
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
              <div className="flex gap-3 mt-3 lg:mt-2">
                {/* <Link
                  to="/"
                  className="flex lg:hidden items-center justify-center gap-1.5 px-4 shrink-0 bg-primary/10 text-primary rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm"
                  title="Kembali ke Landing Page"
                >
                  <ArrowLeft size={16} className="shrink-0" />
                  <span className="text-xs font-bold whitespace-nowrap">Kembali</span>
                </Link> */}

                <button
                  type="submit"
                  disabled={loading || googleLoading || captchaLoading || !captchaImage || !captchaToken.trim()}
                  className="flex-1 mt-2 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-bold py-3 lg:py-2.5 rounded-xl lg:rounded-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} lg:size={14} className="animate-spin shrink-0" />
                      <span className="text-sm lg:text-xs whitespace-nowrap">Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm lg:text-xs font-black whitespace-nowrap">Masuk</span>
                      <MoveRight size={16} className="shrink-0" />
                    </>
                  )}
                </button>
              </div>

              {hasGoogleClientId && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-[10px] lg:text-[9px] font-bold text-gray-400 uppercase tracking-wide">atau masuk dengan</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  <div className={`${googleLoading ? "opacity-70 pointer-events-none" : ""} flex justify-center`}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError("Login Google gagal. Silakan coba lagi.")}
                      useOneTap={false}
                    />
                  </div>
                </div>
              )}

            </form>

            <p className="mt-4 lg:mt-2 text-xs lg:text-[11px] text-gray-500 font-medium text-center">
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