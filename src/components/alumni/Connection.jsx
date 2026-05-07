import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Ban, Check, Loader2, ShieldOff, UserCheck, UserPlus, UserX, ChevronDown, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const status = statusEntry?.status || 'none';
  const connectionId =
    statusEntry?.connectionId ??
    statusEntry?.raw?.id_connection ??
    statusEntry?.raw?.connection_id ??
    statusEntry?.raw?.id ??
    null;

  const wrapperClass = useMemo(() => {
    if (compact) return `space-y-2 ${className}`.trim();
    return `space-y-3 ${className}`.trim();
  }, [className, compact]);

  if (!alumniId || isSelf) return null;

  const isBusy = Boolean(isActionLoading);
  const activeAction = typeof isActionLoading === 'string' ? isActionLoading : null;
  const isAction = (name) => (activeAction ? activeAction === name : isBusy);

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
            {isAction('connect') ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Connect
          </button>
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => withConfirm('Alumni ini akan diblokir dan koneksi akan dihapus. Lanjutkan?', () => onBlock?.(alumniId), 'Alumni berhasil diblokir.')}
            className={`${buttonBase} bg-white text-rose-700 border-rose-200 hover:bg-rose-50`}
          >
            {isAction('block') ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
            Block
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
            {isAction('remove') ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />}
            Batalkan
          </button>
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => withConfirm('Alumni ini akan diblokir. Lanjutkan?', () => onBlock?.(alumniId), 'Alumni berhasil diblokir.')}
            className={`${buttonBase} bg-white text-rose-700 border-rose-200 hover:bg-rose-50`}
          >
            {isAction('block') ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
            Block
          </button>
        </>
      ) : null}

      {status === 'pending_incoming' ? (
        <>
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => withConfirm('Terima permintaan koneksi dari alumni ini?', () => onAccept?.(alumniId, connectionId), 'Permintaan koneksi diterima.')}
            className={`${buttonBase} bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700`}
          >
            {isAction('accept') ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Terima
          </button>
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => withConfirm('Tolak permintaan koneksi dari alumni ini?', () => onReject?.(alumniId, connectionId), 'Permintaan koneksi ditolak.')}
            className={`${buttonBase} bg-white text-amber-700 border-amber-200 hover:bg-amber-50`}
          >
            {isAction('reject') ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />}
            Tolak
          </button>
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => withConfirm('Alumni ini akan diblokir. Lanjutkan?', () => onBlock?.(alumniId), 'Alumni berhasil diblokir.')}
            className={`${buttonBase} bg-white text-rose-700 border-rose-200 hover:bg-rose-50 ${compact ? 'col-span-2' : ''}`}
          >
            {isAction('block') ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
            Block
          </button>
        </>
      ) : null}

      {status === 'accepted' ? (
        <>
          <div className="relative flex-1 lg:flex-none flex" ref={dropdownRef}>
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`${buttonBase} bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 w-full ${compact ? '' : 'lg:w-auto'} justify-between sm:justify-center px-4`}
            >
              <span className="flex items-center gap-2">
                {isBusy ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                Terhubung
              </span>
              <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-full min-w-[140px] bg-white border border-slate-100 shadow-xl rounded-xl p-1.5 z-999 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/alumni/pesan', { state: { targetAlumniId: alumniId } });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[11px] sm:text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-primary rounded-lg transition-colors text-left mb-1"
                >
                  <MessageSquare size={14} /> Kirim Pesan
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    withConfirm('Yakin ingin putuskan koneksi dengan alumni ini?', () => onRemove?.(alumniId), 'Koneksi berhasil dihapus.');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[11px] sm:text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left mb-1"
                >
                  <UserX size={14} /> Putuskan
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => withConfirm('Alumni ini akan diblokir. Lanjutkan?', () => onBlock?.(alumniId), 'Alumni berhasil diblokir.')}
            className={`${buttonBase} flex-1 lg:flex-none bg-white text-rose-700 border-rose-200 hover:bg-rose-50`}
          >
            {isAction('block') ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
            Block
          </button>
        </>
      ) : null}

      {status === 'blocked_by_me' ? (
        <button
          type="button"
          disabled={isActionLoading}
          onClick={() => withConfirm('Buka blokir alumni ini?', () => onUnblock?.(alumniId), 'Blokir berhasil dibuka.')}
          className={`${buttonBase} bg-white text-primary border-primary/30 hover:bg-primary/5`}
          
        >
          {isAction('unblock') ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />}
          Unblock
        </button>
      ) : null}
    </div>
  );

  if (mode === 'actions') {
    return (
      <div className={wrapperClass} onClick={(e) => e.stopPropagation()}>
        {actionsEl}
      </div>
    );
  }

  return (
    <div className={wrapperClass} onClick={(e) => e.stopPropagation()}>
      {actionsEl}
    </div>
  );
}
