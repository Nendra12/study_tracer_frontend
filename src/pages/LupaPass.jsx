import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, KeyRound, Lock, Eye, EyeOff, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import LoginImage from '../assets/login_image.webp';
import Logo from '../assets/icon.png';
import { authApi } from '../api/auth';
import { alertSuccess, alertError } from '../utilitis/alert';

export default function LupaPass() {
  const navigate = useNavigate();

  // Step: 1 = email, 2 = OTP, 3 = new password
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Countdown for resend OTP
  const [countdown, setCountdown] = useState(0);

  // OTP input refs
  const otpRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // ── Step 1: Send OTP ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.forgotPassword({ email });
      setStep(2);
      setCountdown(60);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const firstError = Object.values(data.errors).flat()[0];
        setError(firstError || data.message);
      } else {
        setError(data?.message || 'Gagal mengirim kode OTP. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Handle OTP input ──
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only last char
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Masukkan kode OTP 6 digit.');
      return;
    }
    setStep(3);
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    setLoading(true);

    try {
      await authApi.forgotPassword({ email });
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError('Gagal mengirim ulang kode OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({
        email,
        token: otp.join(''),
        password,
        password_confirmation: passwordConfirm,
      });

      alertSuccess('Password berhasil direset. Silakan login dengan password baru.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const firstError = Object.values(data.errors).flat()[0];
        setError(firstError || data.message);
      } else {
        setError(data?.message || 'Gagal mereset password. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step indicators ──
  const steps = [
    { id: 1, label: 'Email' },
    { id: 2, label: 'Verifikasi' },
    { id: 3, label: 'Password Baru' },
  ];

  return (
    <div className="flex h-screen w-full bg-gray-50 items-center justify-center p-4 overflow-hidden">
      <div className="flex w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden h-[75vh] lg:h-[85vh]">
        {/* Left Image */}
        <div className="hidden lg:block lg:w-1/2 h-full relative">
          <img src={LoginImage} alt="Login Visual" className="w-full h-full object-cover" />
          <div className="bg-black/30 absolute top-0 w-full h-full"></div>
          <div className="absolute bottom-0 z-10 p-5">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="" className="w-15" />
              <h1 className="font-extrabold text-fourth">Alumni Tracer Study</h1>
            </div>
            <p className="text-fourth text-medium">
              Masuk dan terhubung kembali dengan SMKN 1 Gondang. Pantau peluang kerja dan tetap dekat dengan sesama alumni.
            </p>
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white h-full font-lexend overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            {/* Back button */}
            <Link
              to="/login"
              className="flex items-center gap-2 text-third hover:text-primary transition-colors mb-6 text-sm font-medium group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Kembali ke Login
            </Link>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-8">
              {steps.map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        step > s.id
                          ? 'bg-primary text-white'
                          : step === s.id
                          ? 'bg-primary text-white ring-4 ring-primary/20'
                          : 'bg-fourth text-third'
                      }`}
                    >
                      {step > s.id ? <CheckCircle size={14} /> : s.id}
                    </div>
                    <span
                      className={`text-[10px] font-semibold hidden sm:block ${
                        step >= s.id ? 'text-primary' : 'text-third'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 rounded-full transition-all ${
                        step > s.id ? 'bg-primary' : 'bg-fourth'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* ═══ STEP 1: Email ═══ */}
            {step === 1 && (
              <>
                <h2 className="text-2xl font-bold text-primary mb-2">Lupa Password?</h2>
                <p className="text-third text-sm mb-6 leading-relaxed">
                  Masukkan email yang terdaftar. Kami akan mengirimkan kode OTP 6 digit ke email Anda.
                </p>

                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">Alamat Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-third">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-10 p-3 bg-fourth border border-third/30 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:opacity-95 text-white font-bold py-3 rounded-lg transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Mail size={18} />
                        Kirim Kode OTP
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ═══ STEP 2: OTP ═══ */}
            {step === 2 && (
              <>
                <h2 className="text-2xl font-bold text-primary mb-2">Verifikasi Kode OTP</h2>
                <p className="text-third text-sm mb-2 leading-relaxed">
                  Masukkan kode 6 digit yang telah dikirim ke
                </p>
                <p className="text-primary font-semibold text-sm mb-6">{email}</p>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* OTP Boxes */}
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${
                          digit
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-fourth bg-fourth text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Countdown & Resend */}
                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-xs text-third">
                        Kirim ulang dalam <span className="font-bold text-primary">{countdown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-1 mx-auto disabled:opacity-50"
                      >
                        <RefreshCw size={12} />
                        Kirim Ulang Kode
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.join('').length < 6}
                    className="w-full bg-primary hover:opacity-95 text-white font-bold py-3 rounded-lg transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <KeyRound size={18} />
                        Verifikasi
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(''); }}
                    className="text-xs text-third hover:text-primary transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                  >
                    <ArrowLeft size={12} />
                    Ubah email
                  </button>
                </div>
              </>
            )}

            {/* ═══ STEP 3: New Password ═══ */}
            {step === 3 && (
              <>
                <h2 className="text-2xl font-bold text-primary mb-2">Buat Password Baru</h2>
                <p className="text-third text-sm mb-6 leading-relaxed">
                  Masukkan password baru untuk akun <span className="font-semibold text-primary">{email}</span>
                </p>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">Password Baru</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-third">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        className="w-full pl-10 pr-10 p-3 bg-fourth border border-third/30 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-third hover:text-primary transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">Konfirmasi Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-third">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPasswordConfirm ? 'text' : 'password'}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        placeholder="Ulangi password baru"
                        className="w-full pl-10 pr-10 p-3 bg-fourth border border-third/30 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-third hover:text-primary transition-colors cursor-pointer"
                      >
                        {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Password strength hint */}
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          password.length >= level * 3
                            ? password.length >= 12
                              ? 'bg-green-500'
                              : password.length >= 8
                              ? 'bg-yellow-500'
                              : 'bg-red-400'
                            : 'bg-fourth'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-third -mt-3">
                    {password.length === 0
                      ? ''
                      : password.length < 8
                      ? 'Password terlalu pendek'
                      : password.length < 12
                      ? 'Kekuatan: Sedang'
                      : 'Kekuatan: Kuat'}
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:opacity-95 text-white font-bold py-3 rounded-lg transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Reset Password
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-fourth">
              <p className="text-xs text-third text-center">
                Kode OTP berlaku selama <span className="font-bold">60 menit</span>. Periksa folder spam jika email tidak ditemukan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
