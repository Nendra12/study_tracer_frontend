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

  updateExistingCareerStatus(id, data) {
    return api.put(`/alumni/career-status/${id}`, data);
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

  // Alumni Submit Lowongan (auto pending + draft)
  submitLowongan(data) {
    return api.post('/alumni/lowongan', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // My Lowongan (own submissions with progress timeline)
  getMyLowongan(params = {}) {
    return api.get('/alumni/my-lowongan', { params });
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

  // Deskripsi Karier
  addDeskripsiKarier(data) {
    return api.post('/alumni/deskripsi-karier', data);
  },

  updateDeskripsiKarier(id, data) {
    return api.put(`/alumni/deskripsi-karier/${id}`, data);
  },

  deleteDeskripsiKarier(id) {
    return api.delete(`/alumni/deskripsi-karier/${id}`);
  },

  // Download Public Profile as PDF
  downloadPublicProfilePdf(id) {
    return api.get(`/alumni/directory/${id}/pdf`, {
      responseType: 'blob',
    });
  },

  // Notifications
  getNotifications(params = {}) {
    return api.get('/alumni/notifications', { params });
  },

  getNotificationUnreadCount() {
    return api.get('/alumni/notifications/unread-count');
  },

  markNotificationAsRead(id) {
    return api.post(`/alumni/notifications/${id}/read`);
  },

  markAllNotificationsAsRead() {
    return api.post('/alumni/notifications/read-all');
  },

  deleteNotification(id) {
    return api.delete(`/alumni/notifications/${id}`);
  },

  deleteAllNotifications() {
    return api.delete('/alumni/notifications');
  },

  // Portofolio
  createPortofolio(data) {
    return api.post('/alumni/portofolio', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updatePortofolio(id, data) {
    return api.post(`/alumni/portofolio/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deletePortofolio(id) {
    return api.delete(`/alumni/portofolio/${id}`);
  },

  // Pending portofolio operations
  updatePendingPortofolio(pendingId, data) {
    return api.post(`/alumni/portofolio/pending/${pendingId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  cancelPendingPortofolio(pendingId) {
    return api.delete(`/alumni/portofolio/pending/${pendingId}`);
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
