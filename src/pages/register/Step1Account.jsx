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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-fourth rounded-lg text-primary"><LockKeyhole size={20} /></div>
        <h3 className="font-bold text-primary">Pengaturan akun</h3>
      </div>

      <div className="space-y-4">
        {hasGoogleClientId && (
          <div className="space-y-3 rounded-xl border border-fourth bg-fourtd p-4">
            <div className="flex items-start gap-2 text-third">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p className="text-xs">Daftar cepat dengan Google. Password tidak diperlukan untuk akun Google.</p>
            </div>

            <div className={`${googleLoading ? 'opacity-70 pointer-events-none' : ''} flex justify-center md:justify-start`}>
              <GoogleLogin
                onSuccess={handleGoogleRegisterSuccess}
                onError={() => setErrors({ email: 'Registrasi Google gagal. Silakan coba lagi.' })}
                useOneTap={false}
              />
            </div>
          </div>
        )}

        {isGoogleSignup && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
            <CheckCircle size={14} className="shrink-0" />
            Akun Google terverifikasi. Lanjutkan ke langkah berikutnya.
          </div>
        )}

        {/* Input Email */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-primary">Email</label>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-third" size={16} />
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              disabled={isGoogleSignup}
              className="w-full pl-10 pr-4 py-3 bg-white border border-fourth rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <p className="text-[10px] text-third italic">pastikan email Anda valid</p>
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>

        {!isGoogleSignup && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary">Password <span className="text-red-500">*</span></label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-third" size={16} />
              <input
                // Ubah type berdasarkan state showPassword
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan Password Anda"
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
                // Tambahkan padding kanan (pr-10) agar teks tidak tertutup ikon mata
                className="w-full pl-10 pr-10 py-3 bg-white border border-fourth rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              {/* Tombol Toggle Mata */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-third hover:text-primary transition-colors cursor-pointer"
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-third italic">minimal 8 karakter</p>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Input Konfirmasi Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary">Konfirmasi Password <span className="text-red-500">*</span></label>
            <div className="relative mt-2">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-third" size={16} />
              <input
                // Ubah type berdasarkan state showConfirmPassword
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Masukkan Konfirmasi Password Anda"
                value={formData.password_confirmation}
                onChange={(e) => updateFormData({ password_confirmation: e.target.value })}
                // Tambahkan padding kanan (pr-10)
                className="w-full pl-10 pr-10 py-3 bg-white border border-fourth rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              {/* Tombol Toggle Mata */}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-third hover:text-primary transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            {errors.password_confirmation && <p className="text-xs text-red-500">{errors.password_confirmation}</p>}
          </div>
          </div>
        )}
      </div>

      <div className="pt-6 flex justify-end">
        <button
          onClick={handleNext}
          disabled={loading || googleLoading}
          className="flex items-center gap-2 px-4 md:px-8 py-3 bg-primary text-white rounded-xl text-xs md:text-sm font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Memvalidasi...' : 'Selanjutnya'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}