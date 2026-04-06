import api from './axios';

export const authApi = {
  /**
   * GET /captcha/generate
   */
  generateCaptcha() {
    return api.get('/captcha/generate');
  },

  /**
   * GET /captcha/refresh
   */
  refreshCaptcha() {
    return api.get('/captcha/refresh');
  },

  /**
   * POST /register
   * Sends all registration data (account + profile + career status) in one request
   */
  register(formData) {
    return api.post('/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * POST /login
   * @param {{ email: string, password: string, captcha_token: string }} credentials
   */
  async login(credentials) {
    return api.post('/login', credentials);
  },

  /**
   * POST /logout
   */
  logout() {
    return api.post('/logout');
  },

  /**
   * GET /me — get authenticated user info
   */
  me() {
    return api.get('/me');
  },

  /**
   * POST /forgot-password — send OTP to email
   * @param {{ email: string }} data
   */
  forgotPassword(data) {
    return api.post('/forgot-password', data);
  },

  /**
   * POST /reset-password — verify OTP & set new password
   * @param {{ email: string, token: string, password: string, password_confirmation: string }} data
   */
  resetPassword(data) {
    return api.post('/reset-password', data);
  },

  /**
   * POST /validate-email — check if email is available for registration
   * @param {{ email: string }} data
   */
  validateEmail(data) {
    return api.post('/validate-email', data);
  },
};
