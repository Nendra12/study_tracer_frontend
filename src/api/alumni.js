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
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post('/alumni/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put('/alumni/profile', data);
  },

  updateCareerStatus(data) {
    return api.post('/alumni/career-status', data);
  },

  updateExistingCareerStatus(id, data) {
    return api.put(`/alumni/career-status/${id}`, data);
  },

  // Skills management (with pending approval)
  updateSkills(skillIds) {
    return api.put('/alumni/profile/skills', { skills: skillIds });
  },

  updatePendingSkills(pendingId, skillIds) {
    return api.put(`/alumni/profile/pending-skills/${pendingId}`, { skills: skillIds });
  },

  cancelPendingSkills(pendingId) {
    return api.delete(`/alumni/profile/pending-skills/${pendingId}`);
  },

  // Social media pending management
  updatePendingSocialMedia(pendingId, socialMedia) {
    return api.put(`/alumni/profile/pending-social/${pendingId}`, { social_media: socialMedia });
  },

  cancelPendingSocialMedia(pendingId) {
    return api.delete(`/alumni/profile/pending-social/${pendingId}`);
  },

  // General: cancel any pending profile update by id (personal_info, dll.)
  cancelPendingProfileUpdate(pendingId) {
    return api.delete(`/alumni/profile/pending/${pendingId}`);
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

  // Alumni Connections (mutual connection + block)
  sendConnectionRequest(alumniId) {
    return api.post(`/alumni/connections/${alumniId}/request`);
  },

  acceptConnectionRequest(connectionId) {
    return api.post(`/alumni/connections/${connectionId}/accept`);
  },

  rejectConnectionRequest(connectionId) {
    return api.post(`/alumni/connections/${connectionId}/reject`);
  },

  removeConnectionOrCancelRequest(alumniId) {
    return api.delete(`/alumni/connections/${alumniId}`);
  },

  getMyConnections(params = {}) {
    return api.get('/alumni/connections', { params });
  },

  getPendingConnectionRequests(params = {}) {
    return api.get('/alumni/connections/pending', { params });
  },

  getSentConnectionRequests(params = {}) {
    return api.get('/alumni/connections/sent', { params });
  },

  getAlumniConnections(alumniId, params = {}) {
    return api.get(`/alumni/connections/${alumniId}/connections`, { params });
  },

  getMyConnectionStats() {
    return api.get('/alumni/connections/stats');
  },

  getAlumniConnectionStats(alumniId) {
    return api.get(`/alumni/connections/${alumniId}/stats`);
  },

  getConnectionStatus(alumniId) {
    return api.get(`/alumni/connections/${alumniId}/status`);
  },

  getMutualConnections(alumniId, params = {}) {
    return api.get(`/alumni/connections/mutual/${alumniId}`, { params });
  },

  getConnectionSuggestions(params = {}) {
    return api.get('/alumni/connections/suggestions', { params });
  },

  blockAlumni(alumniId) {
    return api.post(`/alumni/connections/${alumniId}/block`);
  },

  unblockAlumni(alumniId) {
    return api.delete(`/alumni/connections/${alumniId}/block`);
  },

  getBlockedAlumni(params = {}) {
    return api.get('/alumni/connections/blocked', { params });
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

  updatePendingDeskripsiKarier(pendingId, data) {
    return api.put(`/alumni/deskripsi-karier/pending/${pendingId}`, data);
  },

  cancelPendingDeskripsiKarier(pendingId) {
    return api.delete(`/alumni/deskripsi-karier/pending/${pendingId}`);
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

  // Pengumuman (published, aktif only)
  getPengumuman(params = {}) {
    return api.get('/alumni/pengumuman', { params });
  },

  getPengumumanDetail(id) {
    return api.get(`/alumni/pengumuman/${id}`);
  },

  // =====================
  // MESSAGING (Real-time Chat)
  // =====================

  // Conversations
  getConversations(params = {}) {
    return api.get('/alumni/messages/conversations', { params });
  },

  getConversation(id) {
    return api.get(`/alumni/messages/conversations/${id}`);
  },

  getOrCreatePrivateConversation(idAlumni) {
    return api.post('/alumni/messages/conversations/private', { id_alumni: idAlumni });
  },

  createGroupConversation(data) {
    if (data instanceof FormData) {
      return api.post('/alumni/messages/conversations/group', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/alumni/messages/conversations/group', data);
  },

  updateGroupConversation(id, data) {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/alumni/messages/conversations/${id}/group`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put(`/alumni/messages/conversations/${id}/group`, data);
  },

  leaveConversation(id) {
    return api.post(`/alumni/messages/conversations/${id}/leave`);
  },

  deleteConversation(id) {
    return api.delete(`/alumni/messages/conversations/${id}`);
  },

  // Conversation Settings
  togglePinConversation(id) {
    return api.post(`/alumni/messages/conversations/${id}/pin`);
  },

  toggleMuteConversation(id) {
    return api.post(`/alumni/messages/conversations/${id}/mute`);
  },

  // Messages
  getMessages(conversationId, params = {}) {
    return api.get(`/alumni/messages/conversations/${conversationId}/messages`, { params });
  },

  sendMessage(conversationId, data) {
    if (data instanceof FormData) {
      return api.post(`/alumni/messages/conversations/${conversationId}/messages`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post(`/alumni/messages/conversations/${conversationId}/messages`, data);
  },

  deleteMessage(id) {
    return api.delete(`/alumni/messages/${id}`);
  },

  // Read Receipts & Typing
  markConversationAsRead(conversationId) {
    return api.post(`/alumni/messages/conversations/${conversationId}/read`);
  },

  sendTypingIndicator(conversationId, isTyping) {
    return api.post(`/alumni/messages/conversations/${conversationId}/typing`, {
      is_typing: isTyping,
    });
  },

  // Stats & Contacts
  getMessageUnreadCount() {
    return api.get('/alumni/messages/unread-count');
  },

  getMessageContacts(params = {}) {
    return api.get('/alumni/messages/contacts', { params });
  },

  // =====================
  // MINI MEDSOS (Social Feed)
  // =====================

  // Feed & Posts
  getPostFeed(params = {}) {
    return api.get('/alumni/posts/feed', { params });
  },

  getMyPosts(params = {}) {
    return api.get('/alumni/posts/my', { params });
  },

  getAlumniPosts(alumniId, params = {}) {
    return api.get(`/alumni/posts/alumni/${alumniId}`, { params });
  },

  getPost(postId) {
    return api.get(`/alumni/posts/${postId}`);
  },

  createPost(data) {
    // Always use FormData for multipart (images support)
    if (data instanceof FormData) {
      return api.post('/alumni/posts', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/alumni/posts', data);
  },

  updatePost(postId, data) {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/alumni/posts/${postId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put(`/alumni/posts/${postId}`, data);
  },

  deletePost(postId) {
    return api.delete(`/alumni/posts/${postId}`);
  },

  // Likes
  togglePostLike(postId) {
    return api.post(`/alumni/posts/${postId}/like`);
  },

  getPostLikers(postId, params = {}) {
    return api.get(`/alumni/posts/${postId}/likers`, { params });
  },

  // Comments
  getPostComments(postId, params = {}) {
    return api.get(`/alumni/posts/${postId}/comments`, { params });
  },

  addPostComment(postId, data) {
    return api.post(`/alumni/posts/${postId}/comments`, data);
  },

  getCommentReplies(commentId, params = {}) {
    return api.get(`/alumni/posts/comments/${commentId}/replies`, { params });
  },

  updatePostComment(commentId, data) {
    return api.put(`/alumni/posts/comments/${commentId}`, data);
  },

  deletePostComment(commentId) {
    return api.delete(`/alumni/posts/comments/${commentId}`);
  },

  // Report
  reportPost(postId, data) {
    return api.post(`/alumni/posts/${postId}/report`, data);
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

  // Landing page (public, tanpa auth)
  getLandingStats() {
    return api.get('/landing/stats');
  },

  getFeaturedAlumni() {
    return api.get('/landing/featured-alumni');
  },

  getFeaturedJobs() {
    return api.get('/landing/featured-jobs');
  },
};

