import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Logo from '../../assets/icon.png';
import Step1Account from './Step1Account';
import Step2Profile from './Step2Profile';
import Step3Status from './Step3Status';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { alumniApi } from '../../api/alumni';

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [presentase, setPresentase] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Shared form data across all steps
  const [formData, setFormData] = useState({
    // Step 1 - Account
    email: '',
    password: '',
    password_confirmation: '',
    // Step 2 - Profile
    nama_alumni: '',
    id_jurusan: '',
    jenis_kelamin: '',
    no_hp: '',
    nis: '',
    nisn: '',
    tahun_masuk: '',
    tahun_lulus: '',
    alamat: '',
    foto: null,
    tempat_lahir: '',
    tanggal_lahir: '',
    skills: [],
    social_media: [],
    // Step 3 - Career Status
    id_status: '',
    tahun_mulai: '',
    tahun_selesai: '',
    pekerjaan: null,
    universitas: null,
    wirausaha: null,
  });

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
    setPresentase((prev) => prev + 50);
    setError('');
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    setPresentase((prev) => prev - 50);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    // Client-side validation for Kuliah fields
    if (formData.universitas) {
      if (!formData.universitas.id_jurusan_kuliah) {
        setError('Jurusan kuliah wajib dipilih dari daftar yang tersedia.');
        setLoading(false);
        return;
      }
      if (!formData.universitas.jalur_masuk) {
        setError('Jalur masuk kuliah wajib dipilih.');
        setLoading(false);
        return;
      }
      if (!formData.universitas.jenjang) {
        setError('Jenjang kuliah wajib dipilih.');
        setLoading(false);
        return;
      }
    }

    try {
      // Build FormData for multipart upload
      const fd = new FormData();

      // Step 1
      fd.append('email', formData.email);
      fd.append('password', formData.password);
      fd.append('password_confirmation', formData.password_confirmation);

      // Step 2
      fd.append('nama_alumni', formData.nama_alumni);
      fd.append('jenis_kelamin', formData.jenis_kelamin);
      if (formData.id_jurusan) fd.append('id_jurusan', formData.id_jurusan);
      if (formData.nis) fd.append('nis', formData.nis);
      if (formData.nisn) fd.append('nisn', formData.nisn);
      if (formData.no_hp) fd.append('no_hp', formData.no_hp);
      if (formData.tahun_masuk) fd.append('tahun_masuk', formData.tahun_masuk);
      if (formData.tahun_lulus) fd.append('tahun_lulus', formData.tahun_lulus);
      if (formData.alamat) fd.append('alamat', formData.alamat);
      if (formData.tempat_lahir) fd.append('tempat_lahir', formData.tempat_lahir);
      if (formData.tanggal_lahir) fd.append('tanggal_lahir', formData.tanggal_lahir);
      if (formData.foto) fd.append('foto', formData.foto);

      // Skills array
      formData.skills.forEach((skillId) => {
        fd.append('skills[]', skillId);
      });

      // Social media array
      formData.social_media.forEach((sm, i) => {
        fd.append(`social_media[${i}][id_sosmed]`, sm.id_sosmed);
        fd.append(`social_media[${i}][url]`, sm.url);
      });

      // Step 3 - Career status
      if (formData.id_status) {
        fd.append('id_status', formData.id_status);
        if (formData.tahun_mulai) fd.append('tahun_mulai', formData.tahun_mulai);
        if (formData.tahun_selesai) fd.append('tahun_selesai', formData.tahun_selesai);

        if (formData.pekerjaan) {
          fd.append('pekerjaan[posisi]', formData.pekerjaan.posisi);
          fd.append('pekerjaan[nama_perusahaan]', formData.pekerjaan.nama_perusahaan);
          if (formData.pekerjaan.id_kota) fd.append('pekerjaan[id_kota]', formData.pekerjaan.id_kota);
          if (formData.pekerjaan.jalan) fd.append('pekerjaan[jalan]', formData.pekerjaan.jalan);
        }

        if (formData.universitas) {
          fd.append('universitas[nama_universitas]', formData.universitas.nama_universitas);
          fd.append('universitas[id_jurusanKuliah]', formData.universitas.id_jurusan_kuliah);
          fd.append('universitas[jalur_masuk]', formData.universitas.jalur_masuk);
          fd.append('universitas[jenjang]', formData.universitas.jenjang);
        }

        if (formData.wirausaha) {
          if (formData.wirausaha.id_bidang) fd.append('wirausaha[id_bidang]', formData.wirausaha.id_bidang);
          fd.append('wirausaha[nama_usaha]', formData.wirausaha.nama_usaha);
        }
      }

      await register(fd);

      // Backend register endpoint doesn't save career status to riwayat_status table.
      // After registration (token is now set), call career-status API to save it.
      if (formData.id_status) {
        try {
          const careerPayload = {
            id_status: formData.id_status,
            tahun_mulai: formData.tahun_mulai || null,
            tahun_selesai: formData.tahun_selesai || null,
          };

          if (formData.pekerjaan) {
            careerPayload.pekerjaan = {
              posisi: formData.pekerjaan.posisi,
              nama_perusahaan: formData.pekerjaan.nama_perusahaan,
              id_kota: formData.pekerjaan.id_kota,
              jalan: formData.pekerjaan.jalan || '',
            };
          }

          if (formData.universitas) {
            // UniversitySelector passes university ID via nama_universitas field
            careerPayload.kuliah = {
              id_universitas: formData.universitas.nama_universitas,
              id_jurusanKuliah: formData.universitas.id_jurusan_kuliah,
              jalur_masuk: formData.universitas.jalur_masuk,
              jenjang: formData.universitas.jenjang,
            };
          }

          if (formData.wirausaha) {
            careerPayload.wirausaha = {
              id_bidang: formData.wirausaha.id_bidang,
              nama_usaha: formData.wirausaha.nama_usaha,
            };
          }

          await alumniApi.updateCareerStatus(careerPayload);
        } catch (careerErr) {
          console.error('Career status save failed:', careerErr);
          // Don't block registration for career status failure
        }
      }

      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const firstError = Object.values(data.errors).flat()[0];
        setError(firstError || data.message);
      } else {
        setError(data?.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: 'Informasi Akun' },
    { id: 2, label: 'Informasi lanjut' },
    { id: 3, label: 'Status Karir' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-lexend flex flex-col">
      {/* Navbar Minimalis */}
      <header className="bg-white border-b border-fourth px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="Logo" className="w-10" />
          <div>
            <h1 className="text-primary font-bold text-sm leading-tight">Alumni Tracer Study</h1>
            <p className="text-[10px] text-third">SMK Negeri 1 Gondang</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-third hidden md:block">Sudah punya akun?</span>
          <Link to="/login" className="p-2 border border-fourth rounded-lg text-xs font-bold text-primary flex items-center gap-2 hover:bg-fourth transition-all">
            <LogIn width={15}/>
            <span>Masuk</span>
          </Link>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="flex-1 max-w-4xl mx-auto w-full py-10 px-6">
        {/* Stepper Header */}
        <div className="mb-10">
          <div className='w-full gap-10 flex items-center justify-between'>
            <div>
              <h2 className="text-xl md:text-2xl  font-bold text-primary mb-1">Step {currentStep} dari 3 : {steps[currentStep-1].label}</h2>
            </div>
            <div className="px-3 py-1 bg-fourth text-third rounded-xl border">
              <p className="text-xs">{ presentase }% Progres</p>
            </div>
          </div>

          {/* Stepper UI */}
          <div className="relative flex justify-between mt-8 mx-auto">
            <div className="absolute top-4.5 rounded-2xl left-0 w-full h-2 bg-fourth -translate-y-1/2 z-0"></div>
            <div
              className="absolute top-4.5 left-0 h-2 rounded-2xl bg-primary -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${(currentStep - 1) * 50}%` }}
            ></div>

            {steps.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep >= step.id ? 'bg-primary text-white' : 'bg-fourth text-third'
                }`}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <span className={`text-[10px] mt-2 font-semibold ${currentStep >= step.id ? 'text-primary' : 'text-third'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Render Form Berdasarkan Step */}
        <div className="bg-white border border-fourth rounded-2xl p-8 shadow-sm transition-all duration-600">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          {currentStep === 1 && <Step1Account onNext={nextStep} formData={formData} updateFormData={updateFormData} />}
          {currentStep === 2 && <Step2Profile onNext={nextStep} onBack={prevStep} formData={formData} updateFormData={updateFormData} />}
          {currentStep === 3 && <Step3Status onBack={prevStep} formData={formData} updateFormData={updateFormData} onSubmit={handleSubmit} loading={loading} />}
        </div>
      </main>

      {/* Footer Minimalis */}
      <footer className="py-8 md:py-6 px-6 md:px-10 border-t border-fourth flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 text-[10px] text-third uppercase tracking-wider">
        {/* Teks Copyright - Rata tengah di HP, Rata kiri di Laptop */}
        <p className="text-center md:text-left leading-relaxed">
          © 2026 Alumni Tracer. Hak cipta dilindungi undang-undang
        </p>

        {/* Group Link - Grid di HP (biar rapi), Flex di Laptop */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 md:gap-6">
          <button className="hover:text-primary transition-colors cursor-pointer"> Kebijakan Privasi </button>
          <button className="hover:text-primary transition-colors cursor-pointer"> Ketentuan Layanan </button>
          <button className="hover:text-primary transition-colors cursor-pointer"> Kontak Dukungan </button>
        </div>
      </footer>
    </div>
  );
}
