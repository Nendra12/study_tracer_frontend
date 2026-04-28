export function toDateKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMessageDate(msg) {
  const raw = msg?.created_at || msg?.createdAt || msg?.sent_at || msg?.timestamp || null;
  if (!raw) return null;
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function getDayLabel(date) {
  if (!date) return '';

  const now = new Date();
  const todayKey = toDateKey(now);
  const dateKey = toDateKey(date);
  if (!dateKey) return '';

  if (dateKey === todayKey) return 'Hari ini';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dateKey === toDateKey(yesterday)) return 'Kemarin';

  if (date.getDay() === now.getDay()) {
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  return date.toLocaleDateString('id-ID', { weekday: 'long' });
}

export function formatClockTime(raw) {
  if (!raw) return '';
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
