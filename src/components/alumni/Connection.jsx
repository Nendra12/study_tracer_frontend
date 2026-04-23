import React, { useMemo } from 'react';
import { Ban, Check, Loader2, ShieldOff, UserCheck, UserPlus, UserX } from 'lucide-react';
import { alertConfirm, toastError, toastSuccess } from '../../utilitis/alert';

const STATUS_LABEL = {
  none: 'Belum Terhubung',
  accepted: 'Terhubung',
  pending_sent: 'Permintaan Terkirim',
  pending_incoming: 'Permintaan Masuk',
  blocked_by_me: 'Anda Memblokir Alumni Ini',
  blocked_by_them: 'Anda Diblokir Alumni Ini',
  rejected: 'Permintaan Pernah Ditolak',
};

function getBadgeStyle(status) {
  if (status === 'accepted') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (status === 'pending_sent' || status === 'pending_incoming') return 'bg-amber-100 text-amber-700 border-amber-200';
  if (status === 'blocked_by_me' || status === 'blocked_by_them') return 'bg-rose-100 text-rose-700 border-rose-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
}

export default function Connection({
  alumniId,
  isSelf = false,
  statusEntry,
  isLoading = false,
  isActionLoading = false,
  onConnect,
  onAccept,
  onReject,
  onRemove,
  onBlock,
  onUnblock,
  compact = false,
  mode = 'full',
  className = '',
}) {
  const status = statusEntry?.status || 'none';

  const wrapperClass = useMemo(() => {
    if (compact) return `space-y-2 ${className}`.trim();
    return `space-y-3 ${className}`.trim();
  }, [className, compact]);

  if (!alumniId || isSelf) return null;

  const runAction = async (action, successMessage) => {
    try {
      await action();
      if (successMessage) toastSuccess(successMessage);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Aksi koneksi gagal diproses.';
      toastError(message);
    }
  };

  const withConfirm = async (message, action, successMessage) => {
    const result = await alertConfirm(message);
    if (!result?.isConfirmed) return;
    await runAction(action, successMessage);
  };

  const buttonBase = compact
    ? 'h-8 px-3 text-[11px] font-bold rounded-lg border transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 w-full'
    : 'h-10 px-4 text-xs font-bold rounded-xl border transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';

  const actionsLayoutClass = compact ? 'grid grid-cols-2 gap-2' : 'flex flex-wrap gap-2';

  const badgeEl = (
    <div className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider w-max ${compact ? 'mx-auto' : ''} ${getBadgeStyle(status)}`}>
      {isLoading ? (
        <span className="inline-flex items-center gap-1.5">
          <Loader2 size={12} className="animate-spin" /> Sinkron...
        </span>
      ) : (
        STATUS_LABEL[status] || STATUS_LABEL.none
      )}
    </div>
  );

  const actionsEl = (
    <div className={actionsLayoutClass}>
        {status === 'none' || status === 'rejected' ? (
          <>
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => runAction(() => onConnect?.(alumniId), 'Permintaan koneksi berhasil dikirim.')}
              className={`${buttonBase} bg-primary text-white border-primary hover:opacity-90`}
            >
              {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Connect
            </button>
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => withConfirm('Alumni ini akan diblokir dan koneksi akan dihapus. Lanjutkan?', () => onBlock?.(alumniId), 'Alumni berhasil diblokir.')}
              className={`${buttonBase} bg-white text-rose-700 border-rose-200 hover:bg-rose-50`}
            >
              <Ban size={14} /> Block
            </button>
          </>
        ) : null}

        {status === 'pending_sent' ? (
          <>
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => withConfirm('Batalkan permintaan koneksi ini?', () => onRemove?.(alumniId), 'Permintaan koneksi dibatalkan.')}
              className={`${buttonBase} bg-white text-slate-700 border-slate-200 hover:bg-slate-50`}
            >
              {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />}
              Batalkan
            </button>
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => withConfirm('Alumni ini akan diblokir. Lanjutkan?', () => onBlock?.(alumniId), 'Alumni berhasil diblokir.')}
              className={`${buttonBase} bg-white text-rose-700 border-rose-200 hover:bg-rose-50`}
            >
              <Ban size={14} /> Block
            </button>
          </>
        ) : null}

        {status === 'pending_incoming' ? (
          <>
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => runAction(() => onAccept?.(alumniId), 'Permintaan koneksi diterima.')}
              className={`${buttonBase} bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700`}
            >
              {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Terima
            </button>
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => runAction(() => onReject?.(alumniId), 'Permintaan koneksi ditolak.')}
              className={`${buttonBase} bg-white text-amber-700 border-amber-200 hover:bg-amber-50`}
            >
              <UserX size={14} /> Tolak
            </button>
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => withConfirm('Alumni ini akan diblokir. Lanjutkan?', () => onBlock?.(alumniId), 'Alumni berhasil diblokir.')}
              className={`${buttonBase} bg-white text-rose-700 border-rose-200 hover:bg-rose-50 ${compact ? 'col-span-2' : ''}`}
            >
              <Ban size={14} /> Block
            </button>
          </>
        ) : null}

        {status === 'accepted' ? (
          <>
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => withConfirm('Hapus koneksi dengan alumni ini?', () => onRemove?.(alumniId), 'Koneksi berhasil dihapus.')}
              className={`${buttonBase} bg-white text-slate-700 border-slate-200 hover:bg-slate-50`}
            >
              {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
              Hapus Koneksi
            </button>
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => withConfirm('Alumni ini akan diblokir dan koneksi akan dihapus. Lanjutkan?', () => onBlock?.(alumniId), 'Alumni berhasil diblokir.')}
              className={`${buttonBase} bg-white text-rose-700 border-rose-200 hover:bg-rose-50`}
            >
              <Ban size={14} /> Block
            </button>
          </>
        ) : null}

        {status === 'blocked_by_me' ? (
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => withConfirm('Buka blokir alumni ini?', () => onUnblock?.(alumniId), 'Blokir berhasil dibuka.')}
            className={`${buttonBase} bg-white text-primary border-primary/30 hover:bg-primary/5 ${compact ? 'col-span-2' : ''}`}
          >
            {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />}
            Unblock
          </button>
        ) : null}
    </div>
  );

  if (mode === 'badge') {
    return (
      <div className={wrapperClass} onClick={(e) => e.stopPropagation()}>
        {badgeEl}
      </div>
    );
  }

  if (mode === 'actions') {
    return (
      <div className={wrapperClass} onClick={(e) => e.stopPropagation()}>
        {actionsEl}
      </div>
    );
  }

  return (
    <div className={wrapperClass} onClick={(e) => e.stopPropagation()}>
      {badgeEl}
      {actionsEl}
    </div>
  );
}
