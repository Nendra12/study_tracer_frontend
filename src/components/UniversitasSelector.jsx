import React, { useState, useEffect } from "react";
import InputDropdownEdit from "./InputDropdownEdit";
import { masterDataApi } from "../api/masterData";

export default function UniversitySelector({ 
  univValue = "",      
  jurusanValue = "",   
  onUnivSelect, 
  onJurusanSelect 
}) {
  const [universities, setUniversities] = useState([]);
  const [univMap, setUnivMap] = useState({});
  const [selectedUniv, setSelectedUniv] = useState(""); // Kosongkan dulu, nanti diisi via useEffect
  const [allMajors, setAllMajors] = useState([]); 
  const [availableMajors, setAvailableMajors] = useState([]);
  const [majorMap, setMajorMap] = useState({});
  const [displayJurusanName, setDisplayJurusanName] = useState("");

  // 1. Fetch Universities & Create Map
  useEffect(() => {
    masterDataApi.getUniversitas()
      .then((res) => {
        const data = res.data.data || [];
        const names = data.map((u) => u.nama_universitas || u.nama);
        const map = {};
        data.forEach((u) => { map[u.nama_universitas || u.nama] = u.id; });
        
        setUniversities(names);
        setUnivMap(map);

        // --- PERBAIKAN: Jika univValue berisi ID, cari namanya untuk ditampilkan ---
        if (univValue) {
          const foundName = Object.keys(map).find(key => String(map[key]) === String(univValue));
          setSelectedUniv(foundName || univValue);
        }
      })
      .catch(() => {
        setUniversities(["Universitas Indonesia", "Telkom University", "Politeknik Negeri Malang", "Institut Teknologi Bandung"]);
      });
  }, [univValue]); // Pantau univValue untuk sinkronisasi balik

  // 2. Fetch Jurusan
  useEffect(() => {
    masterDataApi.getJurusanKuliah()
      .then((res) => {
        const data = res.data.data || [];
        setAllMajors(data);
      })
      .catch(() => setAllMajors([]));
  }, []);

  // 3. Update Available Majors & Translate Jurusan ID to Name
  useEffect(() => {
    if (allMajors.length === 0) return;
    
    const names = allMajors.map((j) => j.nama_jurusan_kuliah || j.nama);
    const map = {};
    allMajors.forEach((j) => { map[j.nama_jurusan_kuliah || j.nama] = j.id; });
    
    setAvailableMajors(names);
    setMajorMap(map);

    // --- PERBAIKAN: Terjemahkan ID Jurusan ke Nama ---
    if (jurusanValue) {
      const found = allMajors.find(m => String(m.id) === String(jurusanValue) || (m.nama_jurusan_kuliah || m.nama) === jurusanValue);
      if (found) {
        setDisplayJurusanName(found.nama_jurusan_kuliah || found.nama);
      } else {
        setDisplayJurusanName(jurusanValue);
      }
    }
  }, [allMajors, jurusanValue]);

  const handleUnivSelect = (val) => {
    setSelectedUniv(val); // Simpan nama (string) di lokal agar input tidak muncul angka
    const univId = univMap[val];
    
    // Kirim ID ke parent jika ada di map, jika tidak (ketik manual) kirim string-nya
    if (onUnivSelect) onUnivSelect(univId || val);
    
    // Reset jurusan jika kampus diganti
    if (val !== selectedUniv) {
      if (onJurusanSelect) onJurusanSelect(null);
      setDisplayJurusanName("");
    }
  };

  const handleJurusanSelect = (val) => {
    setDisplayJurusanName(val);
    const majorId = majorMap[val];
    // Kirim ID ke parent untuk database
    if (onJurusanSelect) onJurusanSelect(majorId ?? val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 col-span-full text-left">
      <div className="space-y-1">
        <InputDropdownEdit
          label="Nama Universitas / Kampus"
          options={universities}
          value={selectedUniv} // <-- Gunakan state lokal 'selectedUniv' yang sudah diproses
          placeholder="Cari atau ketik nama kampus"
          isRequired={true}
          onChange={handleUnivSelect}
          onSelect={handleUnivSelect}
        />
      </div>

      <div className={`space-y-1 transition-all duration-300 ${!selectedUniv ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        <InputDropdownEdit
          key={selectedUniv} // Re-render input jurusan saat univ berubah
          label="Jurusan"
          options={availableMajors}
          value={displayJurusanName} 
          placeholder={selectedUniv ? "Cari atau ketik jurusan" : "Pilih universitas dulu"}
          isRequired={true}
          onChange={handleJurusanSelect}
          onSelect={handleJurusanSelect}
        />
        {!selectedUniv && (
          <p className="text-[9px] text-third italic">
            *Pilih universitas untuk melihat daftar jurusan
          </p>
        )}
      </div>
    </div>
  );
}