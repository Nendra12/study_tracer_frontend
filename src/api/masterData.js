import api from './axios';

export const masterDataApi = {
  // Provinsi
  getProvinsi() {
    return api.get('/master/provinsi');
  },

  // Kota (optionally filtered by provinsi)
  getKota(idProvinsi = null) {
    const params = idProvinsi ? { id_provinsi: idProvinsi } : {};
    return api.get('/master/kota', { params });
  },

  // Jurusan SMK
  getJurusan() {
    return api.get('/master/jurusan');
  },

  // Jurusan Kuliah
  getJurusanKuliah() {
    return api.get('/master/jurusan-kuliah');
  },

  // Skills
  getSkills() {
    return api.get('/master/skills');
  },

  createSkill(data) {
    return api.post('/master/skills', data);
  },

  // Social Media platforms
  getSocialMedia() {
    return api.get('/master/social-media');
  },

  // Status (Bekerja, Kuliah, Wirausaha, Mencari Kerja)
  getStatus() {
    return api.get('/master/status');
  },

  // Bidang Usaha
  getBidangUsaha() {
    return api.get('/master/bidang-usaha');
  },

  // Universitas
  getUniversitas() {
    return api.get('/master/universitas');
  },

  // Perusahaan (for registration dropdown)
  getPerusahaan() {
    return api.get('/master/perusahaan');
  },
};
