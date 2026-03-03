import React from 'react';
import Navbar from '../../components/alumni/Navbar'; // Sesuaikan path jika perlu

// PASTIKAN ADA KATA "export default" DI SINI
export default function Alumni() {
  const user = { nama_alumni: 'Alumni' }; // Mock user sementara

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <div className="pt-24 text-center">
        <h1 className="text-2xl font-bold">Halaman Jejaring Alumni</h1>
        <p>Konten halaman alumni akan muncul di sini.</p>
      </div>
    </div>
  );
}