import React from 'react';
import Navbar from '../../components/alumni/Navbar';

// PASTIKAN ADA KATA "export default" DI SINI
export default function Profil() {
  const user = { nama_alumni: 'Alumni' };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <div className="pt-24 text-center">
        <h1 className="text-2xl font-bold">Halaman Profil Saya</h1>
        <p>Konten profil alumni akan muncul di sini.</p>
      </div>
    </div>
  );
}