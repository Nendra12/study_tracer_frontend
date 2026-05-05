import api from './axios';

export const adminApi = {
  // ── Dashboard ──────────────────────────────────
  getDashboardStats() {
    return api.get('/admin/dashboard-stats');
  },

  getLowonganStats() {
    return api.get('/admin/lowongan-stats');
  },

  getTopCompanies(limit = 5) {
    return api.get('/admin/top-companies', { params: { limit } });
  },

  getGeographicDistribution() {
    return api.get('/admin/geographic-distribution');
  },

  // ── User Management ────────────────────────────
  getUserStats() {
    return api.get('/admin/user-stats');
  },

  getPendingUsers(perPage = 15) {
    return api.get('/admin/pending-users', { params: { per_page: perPage } });
  },

  approveUser(id) {
    return api.post(`/admin/approve-user/${id}`);
  },

  rejectUser(id, data = {}) {
    return api.post(`/admin/reject-user/${id}`, data);
  },

  banUser(id, data = {}) {
    return api.post(`/admin/ban-user/${id}`, data);
  },

  getAllAlumni(filters = {}, perPage = 15) {
    return api.get('/admin/alumni', { params: { ...filters, per_page: perPage } });
  },

  getFeaturedAlumni() {
    return api.get('/admin/alumni-featured');
  },

  updateFeaturedAlumni(alumniIds = []) {
    return api.put('/admin/alumni-featured', { alumni_ids: alumniIds });
  },

  toggleFeaturedAlumni(id, isFeatured) {
    return api.post(`/admin/alumni/${id}/featured`, { is_featured: isFeatured });
  },

  getAlumniDetail(id) {
    return api.get(`/admin/alumni/${id}`);
  },

  deleteUser(id) {
    return api.delete(`/admin/users/${id}`);
  },

  exportAlumniCsv(filters = {}) {
    return api.get('/admin/alumni/export', {
      params: filters,
      responseType: 'blob',
    });
  },

  // ── Pending Career Status Updates ─────────────
  getPendingCareerUpdates() {
    return api.get('/admin/pending-career-updates');
  },

  approveCareerUpdate(id) {
    return api.post(`/admin/career-updates/${id}/approve`);
  },

  rejectCareerUpdate(id) {
    return api.post(`/admin/career-updates/${id}/reject`);
  },

  // ── Pending Profile Updates (All Sections) ────
  getPendingProfileUpdates() {
    return api.get('/admin/pending-profile-updates');
  },

  approveProfileUpdate(id) {
    return api.post(`/admin/profile-updates/${id}/approve`);
  },

  rejectProfileUpdate(id, reason = '') {
    return api.post(`/admin/profile-updates/${id}/reject`, { reason });
  },

  // ── Lowongan Management ────────────────────────
  getLowongan(filters = {}, perPage = 15) {
    return api.get('/admin/lowongan', { params: { ...filters, per_page: perPage } });
  },

  createLowongan(data) {
    return api.post('/admin/lowongan', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateLowongan(id, data) {
    return api.post(`/admin/lowongan/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteLowongan(id) {
    return api.delete(`/admin/lowongan/${id}`);
  },

  getPendingLowongan() {
    return api.get('/admin/lowongan/pending');
  },

  approveLowongan(id) {
    return api.post(`/admin/lowongan/${id}/approve`);
  },

  rejectLowongan(id) {
    return api.post(`/admin/lowongan/${id}/reject`);
  },

  repostLowongan(id) {
    return api.post(`/admin/lowongan/${id}/repost`);
  },

  updateLowonganStatus(id, status) {
    return api.patch(`/admin/lowongan/${id}/status`, { status });
  },

  autoCloseExpiredLowongan() {
    return api.post('/admin/lowongan/auto-close-expired');
  },

  // ── Kuesioner Management ───────────────────────
  getKuesioner(filters = {}, perPage = 15) {
    return api.get('/admin/kuesioner', { params: { ...filters, per_page: perPage } });
  },

  createKuesioner(data) {
    return api.post('/admin/kuesioner', data);
  },

  getKuesionerDetail(id) {
    return api.get(`/admin/kuesioner/${id}`);
  },

  updateStatusKuesioner(id, data) {
    return api.patch(`/admin/kuesioner/${id}/status`, data)
  },

  updateKuesioner(id, data) {
    return api.put(`/admin/kuesioner/${id}`, data);
  },

  deleteKuesioner(id) {
    return api.delete(`/admin/kuesioner/${id}`);
  },

  getStatsKuesioner(id) {
    return api.get(`/admin/kuesioner/${id}/statistics`);
  },

  getPertanyaanAll() {
    return api.get('/admin/pertanyaan')
  },

  addPertanyaan(data) {
    return api.post('/admin/pertanyaan', data);
  },

  updatePertanyaan(kuesionerId, pertanyaanId, data) {
    return api.put(`/admin/kuesioner/${kuesionerId}/pertanyaan/${pertanyaanId}`, data);
  },

  deletePertanyaan(kuesionerId, pertanyaanId) {
    return api.delete(`/admin/kuesioner/${kuesionerId}/pertanyaan/${pertanyaanId}`);
  },

  // Section Ques (Judul Pertanyaan)
  createSectionQues(data) {
    return api.post('/admin/section-ques', data);
  },

  // ── Jawaban Kuesioner (admin view) ─────────────
  getKuesionerJawaban(kuesionerId, filters = {}) {
    return api.get(`/admin/kuesioner/${kuesionerId}/jawaban`, { params: filters });
  },

  getKuesionerJawabanDetail(kuesionerId, alumniId) {
    return api.get(`/admin/kuesioner/${kuesionerId}/jawaban/${alumniId}`);
  },

  // ── Status Karier Management ───────────────────
  getStatusKarierUniversitas() { return api.get('/admin/status-karier/universitas'); },
  createStatusKarierUniversitas(data) { return api.post('/admin/status-karier/universitas', data); },
  updateStatusKarierUniversitas(id, data) { return api.put(`/admin/status-karier/universitas/${id}`, data); },
  deleteStatusKarierUniversitas(id) { return api.delete(`/admin/status-karier/universitas/${id}`); },

  getStatusKarierProdi() { return api.get('/admin/status-karier/prodi'); },
  createStatusKarierProdi(data) { return api.post('/admin/status-karier/prodi', data); },
  updateStatusKarierProdi(id, data) { return api.put(`/admin/status-karier/prodi/${id}`, data); },
  deleteStatusKarierProdi(id) { return api.delete(`/admin/status-karier/prodi/${id}`); },

  getStatusKarierBidangUsaha() { return api.get('/admin/status-karier/bidang-usaha'); },
  createStatusKarierBidangUsaha(data) { return api.post('/admin/status-karier/bidang-usaha', data); },
  updateStatusKarierBidangUsaha(id, data) { return api.put(`/admin/status-karier/bidang-usaha/${id}`, data); },
  deleteStatusKarierBidangUsaha(id) { return api.delete(`/admin/status-karier/bidang-usaha/${id}`); },

  getStatusKarierWirausaha(filters = {}) { return api.get('/admin/status-karier/wirausaha', { params: filters }); },
  createStatusKarierWirausaha(data) { return api.post('/admin/status-karier/wirausaha', data); },
  updateStatusKarierWirausaha(id, data) { return api.put(`/admin/status-karier/wirausaha/${id}`, data); },
  deleteStatusKarierWirausaha(id) { return api.delete(`/admin/status-karier/wirausaha/${id}`); },

  getStatusKarierPosisi() { return api.get('/admin/status-karier/posisi'); },

  getStatusKarierReport() { return api.get('/admin/status-karier/report'); },
  exportStatusKarierReport(params = {}) {
    return api.get('/admin/status-karier/export', {
      params,
      responseType: 'blob',
    });
  },

  // ── Master Data CRUD (admin only) ─────────────
  getProvinsi() { return api.get('/admin/master/provinsi'); },
  createProvinsi(data) { return api.post('/admin/master/provinsi', data); },
  updateProvinsi(id, data) { return api.put(`/admin/master/provinsi/${id}`, data); },
  deleteProvinsi(id) { return api.delete(`/admin/master/provinsi/${id}`); },

  getKota(idProvinsi = null) { 
    return api.get('/admin/master/kota', {
      params: idProvinsi ? { id_provinsi: idProvinsi } : {}
    }); 
  },
  createKota(data) { return api.post('/admin/master/kota', data); },
  updateKota(id, data) { return api.put(`/admin/master/kota/${id}`, data); },
  deleteKota(id) { return api.delete(`/admin/master/kota/${id}`); },

  getJurusan() { return api.get('/admin/master/jurusan'); },
  createJurusan(data) { return api.post('/admin/master/jurusan', data); },
  updateJurusan(id, data) { return api.put(`/admin/master/jurusan/${id}`, data); },
  deleteJurusan(id) { return api.delete(`/admin/master/jurusan/${id}`); },

  getJurusanKuliah() { return api.get('/admin/master/jurusan-kuliah'); },
  createJurusanKuliah(data) { return api.post('/admin/master/jurusan-kuliah', data); },
  updateJurusanKuliah(id, data) { return api.put(`/admin/master/jurusan-kuliah/${id}`, data); },
  deleteJurusanKuliah(id) { return api.delete(`/admin/master/jurusan-kuliah/${id}`); },

  getSkills() { return api.get('/admin/master/skills'); },
  createSkill(data) { return api.post('/admin/master/skills', data); },
  updateSkill(id, data) { return api.put(`/admin/master/skills/${id}`, data); },
  deleteSkill(id) { return api.delete(`/admin/master/skills/${id}`); },

  getSocialMedia() { return api.get('/admin/master/social-media'); },
  createSocialMedia(data) { return api.post('/admin/master/social-media', data); },
  updateSocialMedia(id, data) { return api.put(`/admin/master/social-media/${id}`, data); },
  deleteSocialMedia(id) { return api.delete(`/admin/master/social-media/${id}`); },

  getStatus() { return api.get('/admin/master/status'); },
  createStatus(data) { return api.post('/admin/master/status', data); },
  updateStatus(id, data) { return api.put(`/admin/master/status/${id}`, data); },
  deleteStatus(id) { return api.delete(`/admin/master/status/${id}`); },

  getBidangUsaha() { return api.get('/admin/master/bidang-usaha'); },
  createBidangUsaha(data) { return api.post('/admin/master/bidang-usaha', data); },
  updateBidangUsaha(id, data) { return api.put(`/admin/master/bidang-usaha/${id}`, data); },
  deleteBidangUsaha(id) { return api.delete(`/admin/master/bidang-usaha/${id}`); },

  getPerusahaan(filters = {}) { return api.get('/admin/master/perusahaan', { params: filters }); },
  createPerusahaan(data) { return api.post('/admin/master/perusahaan', data); },
  updatePerusahaan(id, data) { return api.put(`/admin/master/perusahaan/${id}`, data); },
  deletePerusahaan(id) { return api.delete(`/admin/master/perusahaan/${id}`); },

  getUniversitas() { return api.get('/admin/master/universitas'); },
  createUniversitas(data) { return api.post('/admin/master/universitas', data); },

  getTipePekerjaan() { return api.get('/admin/master/tipe-pekerjaan'); },

  // ── Pengumuman Management ─────────────────────
  getPengumumanStats() {
    return api.get('/admin/pengumuman/stats');
  },

  getPengumuman(filters = {}, perPage = 15) {
    return api.get('/admin/pengumuman', { params: { ...filters, per_page: perPage } });
  },

  getPengumumanDetail(id) {
    return api.get(`/admin/pengumuman/${id}`);
  },

  createPengumuman(data) {
    return api.post('/admin/pengumuman', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updatePengumuman(id, data) {
    return api.post(`/admin/pengumuman/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deletePengumuman(id) {
    return api.delete(`/admin/pengumuman/${id}`);
  },

  togglePinPengumuman(id) {
    return api.patch(`/admin/pengumuman/${id}/pin`);
  },

  updatePengumumanStatus(id, status) {
    const fd = new FormData();
    fd.append('_method', 'PUT');
    fd.append('status', status);
    return api.post(`/admin/pengumuman/${id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ── Pengaturan Tampilan ───────────────────────
  getPengaturanTampilan() {
    return api.get('/admin/pengaturan-tampilan');
  },

  updatePengaturanTampilan(data) {
    return api.post('/admin/pengaturan-tampilan', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  revertPengaturanTampilan() {
    return api.post('/admin/pengaturan-tampilan/revert');
  },

  resetPengaturanTampilan() {
    return api.post('/admin/pengaturan-tampilan/reset');
  },

  // ── Kemitraan Management ─────────────────────
  getKemitraanUniversitas(params = {}) {
    return api.get('/admin/kemitraan/universitas', { params });
  },

  createKemitraanUniversitas(data) {
    return api.post('/admin/kemitraan/universitas', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateKemitraanUniversitas(id, data) {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
    }

    return api.post(`/admin/kemitraan/universitas/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteKemitraanUniversitas(id) {
    return api.delete(`/admin/kemitraan/universitas/${id}`);
  },

  getKemitraanPerusahaan(params = {}) {
    return api.get('/admin/kemitraan/perusahaan', { params });
  },

  createKemitraanPerusahaan(data) {
    return api.post('/admin/kemitraan/perusahaan', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateKemitraanPerusahaan(id, data) {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
    }

    return api.post(`/admin/kemitraan/perusahaan/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteKemitraanPerusahaan(id) {
    return api.delete(`/admin/kemitraan/perusahaan/${id}`);
  },

  exportKemitraan(type = 'universitas') {
    return api.get('/admin/kemitraan/export', {
      params: { type },
      responseType: 'blob',
    });
  },

  // ── Sebaran Alumni (Mapping) ─────────────────
  getSebaranMarkers(filters = {}) {
    return api.get('/admin/sebaran/markers', { params: filters });
  },

  getSebaranLocationDetail(type, id, filters = {}) {
    return api.get(`/admin/sebaran/location/${type}/${id}`, { params: filters });
  },

  getSebaranFilters() {
    return api.get('/admin/sebaran/filters');
  },

  getSebaranStats(filters = {}) {
    return api.get('/admin/sebaran/stats', { params: filters });
  },

  getSebaranHeatmap(filters = {}) {
    return api.get('/admin/sebaran/heatmap', { params: filters });
  },

  searchSebaranLocation(query, type = null) {
    const params = type ? { q: query, type } : { q: query };
    return api.get('/admin/sebaran/search', { params });
  },

  // ── Meta Data Management ──────────────────────
  getMetaData() {
    return api.get('/metadata'); 
  },
  
  updateMetaData(data) {
    return api.post('/admin/metadata', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ── Kelulusan Management ──────────────────────
  getKelulusanFilters() {
    return api.get('/admin/kelulusan/filters');
  },
  getCalonLulusan(params = {}) {
    return api.get('/admin/kelulusan/calon', { params });
  },
  getRiwayatKelulusan(params = {}) {
    return api.get('/admin/kelulusan/riwayat', { params });
  },
  addCalonLulusan(data) {
    return api.post('/admin/kelulusan/calon', data);
  },
  lookupNisn(nisn) {
    return api.get('/admin/kelulusan/lookup-nisn', { params: { nisn } });
  },
  deleteCalonLulusan(id) {
    return api.delete(`/admin/kelulusan/calon/${id}`);
  },
  updateCalonStatus(id, status) {
    return api.patch(`/admin/kelulusan/calon/${id}/status`, { status_kelulusan: status });
  },
  clearCalonLulusan() {
    return api.delete('/admin/kelulusan/calon');
  },
  simpanKelulusan() {
    return api.post('/admin/kelulusan/simpan');
  },
  importKelulusan(data) {
    return api.post('/admin/kelulusan/import', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  exportKelulusan(params = {}) {
    return api.get('/admin/kelulusan/export', { params, responseType: 'blob' });
  }
};