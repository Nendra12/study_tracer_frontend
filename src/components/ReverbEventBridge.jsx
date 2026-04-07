import { useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Global bridge: converts Reverb window events into user-facing toast notifications.
 * Keep this mounted once at app root.
 */
export default function ReverbEventBridge() {
  useEffect(() => {
    const onNotificationReceived = (event) => {
      const title = event?.detail?.notification?.title || 'Notifikasi baru';
      toast.success(title, { id: 'reverb-notification-received' });
    };

    const onKuesionerUpdated = () => {
      toast('Ada pembaruan kuesioner.', { icon: '📋', id: 'reverb-kuesioner-updated' });
    };

    const onAccessLockChanged = (event) => {
      const canAccessAll = !!event?.detail?.can_access_all;
      const message = canAccessAll
        ? 'Akses akun Anda sudah dibuka.'
        : 'Akses akun Anda sedang dibatasi.';
      toast(message, { icon: canAccessAll ? '🔓' : '🔒', id: 'reverb-access-lock-changed' });
    };

    const onAccountStatusChanged = (event) => {
      const status = event?.detail?.status;
      if (status === 'banned') {
        toast.error('Akun Anda diblokir oleh admin.', { id: 'reverb-account-banned' });
        return;
      }
      toast('Status akun Anda diperbarui.', { icon: '👤', id: 'reverb-account-status-changed' });
    };

    const onLowonganStatusChanged = (event) => {
      const payload = event?.detail;
      const title = payload?.job_title || 'lowongan';
      const status = payload?.status || 'diperbarui';
      toast(`Status ${title} ${status}.`, { icon: '💼', id: 'reverb-lowongan-status-changed' });
    };

    const onPengumumanCreated = (event) => {
      const title = event?.detail?.judul || 'pengumuman baru';
      toast.success(`Pengumuman baru: ${title}`, { id: 'reverb-pengumuman-created' });
    };

    const onDashboardStatsUpdated = (event) => {
      const type = event?.detail?.type || 'dashboard';
      toast(`Data ${type} diperbarui.`, { icon: '📊', id: 'reverb-dashboard-stats-updated' });
    };

    window.addEventListener('reverb:notification.received', onNotificationReceived);
    window.addEventListener('reverb:kuesioner.updated', onKuesionerUpdated);
    window.addEventListener('reverb:access.lock-changed', onAccessLockChanged);
    window.addEventListener('reverb:account.status-changed', onAccountStatusChanged);
    window.addEventListener('reverb:lowongan.status-changed', onLowonganStatusChanged);
    window.addEventListener('reverb:pengumuman.created', onPengumumanCreated);
    window.addEventListener('reverb:dashboard.stats-updated', onDashboardStatsUpdated);

    return () => {
      window.removeEventListener('reverb:notification.received', onNotificationReceived);
      window.removeEventListener('reverb:kuesioner.updated', onKuesionerUpdated);
      window.removeEventListener('reverb:access.lock-changed', onAccessLockChanged);
      window.removeEventListener('reverb:account.status-changed', onAccountStatusChanged);
      window.removeEventListener('reverb:lowongan.status-changed', onLowonganStatusChanged);
      window.removeEventListener('reverb:pengumuman.created', onPengumumanCreated);
      window.removeEventListener('reverb:dashboard.stats-updated', onDashboardStatsUpdated);
    };
  }, []);

  return null;
}
