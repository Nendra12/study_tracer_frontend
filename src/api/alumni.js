import api from './axios';

export const alumniApi = {
  // Beranda
  getBeranda() {
    return api.get('/alumni/beranda');
  },

  getStatusPengajuan() {
    return api.get('/alumni/status-pengajuan');
  },

  // Profile
  getProfile() {
    return api.get('/alumni/profile');
  },

  updateProfile(data) {
    return api.put('/alumni/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateCareerStatus(data) {
    return api.post('/alumni/career-status', data);
  },

  // Lowongan (restricted - needs verified + kuesioner)
  getLowongan(params = {}) {
    return api.get('/alumni/lowongan', { params });
  },

  getSavedLowongan(params = {}) {
    return api.get('/alumni/saved-lowongan', { params });
  },

  toggleSaveLowongan(id) {
    return api.post(`/alumni/lowongan/${id}/toggle-save`);
  },

  // Kuesioner
  getKuesioner(filters = {}, perPage = 15) {
    return api.get('/alumni/kuesioner', { params: { ...filters, per_page: perPage } });
  },

  getKuesionerByStatus(statusId) {
    return api.get(`/alumni/kuesioner/status/${statusId}`);
  },

  getKuesionerDetail(id) {
    return api.get(`/alumni/kuesioner/${id}`);
  },

  submitKuesionerAnswers(kuesionerId, data) {
    return api.post(`/alumni/kuesioner/${kuesionerId}/jawaban`, data);
  },

  // Alumni Directory (restricted - needs verified + kuesioner)
  getAlumniDirectory(params = {}) {
    return api.get('/alumni/directory', { params });
  },

  getAlumniDirectoryFilters() {
    return api.get('/alumni/directory/filters');
  },

  // Public Profile (requires authenticated verified alumni)
  getAlumniPublicProfile(id) {
    return api.get(`/alumni/directory/${id}`);
  },

  // Download Public Profile as PDF
  downloadPublicProfilePdf(id) {
    return api.get(`/alumni/directory/${id}/pdf`, {
      responseType: 'blob',
    });
  },
};

// Public endpoints
export const publicApi = {
  getPublishedLowongan(params = {}) {
    return api.get('/lowongan/published', { params });
  },

  getLowonganDetail(id) {
    return api.get(`/lowongan/${id}`);
  },

  getPublishedKuesioner() {
    return api.get('/kuesioner/published');
  },
};
