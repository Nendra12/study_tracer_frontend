import React, { useState } from 'react';
import {
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { authApi } from '../../api/auth';

export default function Step1Account({ onNext, formData, updateFormData }) {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // State untuk mengatur visibilitas password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isGoogleSignup = Boolean(formData.google_id);
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Format email tidak valid';
    if (!isGoogleSignup) {
      if (!formData.password) errs.password = 'Password wajib diisi';
      else if (formData.password.length < 8) errs.password = 'Password minimal 8 karakter';
      if (formData.password !== formData.password_confirmation) errs.password_confirmation = 'Konfirmasi password tidak cocok';
    }
    return errs;
  };

  const handleGoogleRegisterSuccess = async (credentialResponse) => {
    const googleIdToken = credentialResponse?.credential;
    if (!googleIdToken) {
      setErrors({ email: 'Token Google tidak ditemukan. Silakan coba lagi.' });
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await authApi.googleRegister({ google_id_token: googleIdToken });
      const { google_email, google_name, google_id, google_picture } = res?.data?.data || {};

      updateFormData({
        email: google_email || formData.email,
        nama_alumni: google_name || formData.nama_alumni,
        google_id: google_id || '',
        google_picture: google_picture || '',
        auth_provider: 'google',
        password: '',
        password_confirmation: '',
      });

      setErrors({});
      onNext();
    } catch (error) {
      const msg =
        error.response?.data?.errors?.email?.[0] ||
        error.response?.data?.message ||
        'Verifikasi Google gagal. Silakan coba lagi.';
      setErrors({ email: msg });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleNext = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Validate email with backend
    setLoading(true);
    try {
      await authApi.validateEmail({ email: formData.email });
      setErrors({});
      onNext();
    } catch (error) {
      if (error.response?.data?.errors?.email) {
        setErrors({ email: error.response.data.errors.email[0] });
      } else {
        setErrors({ email: 'Terjadi kesalahan saat memvalidasi email' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-fourth rounded-lg text-primary"><LockKeyhole size={20} /></div>
        <h3 className="font-bold text-primary text-lg">Pengaturan Akun</h3>
      </div>

      <div className="space-y-5">

        {/* --- ALERT SUKSES GOOGLE (Tampil jika sudah terverifikasi) --- */}
        {isGoogleSignup && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-bold text-emerald-700 shadow-sm animate-in fade-in">
            <CheckCircle size={18} className="shrink-0 text-emerald-500" />
            Akun Google berhasil dihubungkan.
          </div>
        )}

        {/* --- FORM EMAIL REGULER --- */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-primary">Email <span className="text-red-500">*</span></label>
          <div className="relative mt-2">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-third" size={16} />
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              disabled={isGoogleSignup}
              className={`w-full pl-10 pr-4 py-3 bg-white border ${errors.email ? 'border-red-400' : 'border-fourth'} rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all`}
            />
          </div>
          {errors.email ? (
            <p className="text-xs text-red-500">{errors.email}</p>
          ) : (
            <p className="text-[10px] text-third italic">pastikan email Anda aktif dan valid</p>
          )}
        </div>

        {/* --- FORM PASSWORD (Sembunyi jika pakai Google) --- */}
        {!isGoogleSignup && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Input Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary">Password <span className="text-red-500">*</span></label>
              <div className="relative mt-2">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-third" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat password"
                  autoComplete="new-password"
                  data-ms-reveal="false"
                  value={formData.password}
                  onChange={(e) => updateFormData({ password: e.target.value })}
                  className={`w-full pl-10 pr-10 py-3 bg-white border ${errors.password ? 'border-red-400' : 'border-fourth'} rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-third hover:text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-red-500">{errors.password}</p>
              ) : (
                <p className="text-[10px] text-third italic">minimal 8 karakter</p>
              )}
            </div>

            {/* Input Konfirmasi Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary">Konfirmasi Password <span className="text-red-500">*</span></label>
              <div className="relative mt-2">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-third" size={16} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                  data-ms-reveal="false"
                  value={formData.password_confirmation}
                  onChange={(e) => updateFormData({ password_confirmation: e.target.value })}
                  className={`w-full pl-10 pr-10 py-3 bg-white border ${errors.password_confirmation ? 'border-red-400' : 'border-fourth'} rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-third hover:text-primary transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              {errors.password_confirmation && <p className="text-xs text-red-500">{errors.password_confirmation}</p>}
            </div>
          </div>
        )}

        {/* --- PEMISAH "ATAU" --- */}
        {hasGoogleClientId && !isGoogleSignup && (
          <div className="flex items-center gap-4 py-4">
            <div className="h-px bg-fourth flex-1"></div>
            <span className="text-[10px] font-black text-third uppercase tracking-widest">Atau daftar dengan</span>
            <div className="h-px bg-fourth flex-1"></div>
          </div>
        )}

        {/* --- BAGIAN GOOGLE LOGIN (Tampil jika belum login Google) --- */}
        {hasGoogleClientId && !isGoogleSignup && (
          <div className="flex flex-col items-center justify-center space-y-4 pb-2">
            <div className={`${googleLoading ? 'opacity-70 pointer-events-none' : ''} shadow-sm rounded-lg overflow-hidden`}>
              <GoogleLogin
                onSuccess={handleGoogleRegisterSuccess}
                onError={() => setErrors({ email: 'Registrasi Google gagal. Silakan coba lagi.' })}
                useOneTap={false}
              />
            </div>
          </div>
        )}

      </div>

      <div className="pt-8 flex justify-end border-t border-fourth">
        <button
          onClick={handleNext}
          disabled={loading || googleLoading}
          className="flex items-center gap-2 px-6 md:px-8 py-3 bg-primary text-white rounded-xl text-xs md:text-sm font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {loading ? 'Memvalidasi...' : 'Selanjutnya'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}