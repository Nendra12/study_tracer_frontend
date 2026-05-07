import { useCallback, useEffect, useMemo, useState } from 'react';
import { alumniApi } from '../api/alumni';

const STATUS = {
  NONE: 'none',
  ACCEPTED: 'accepted',
  PENDING_SENT: 'pending_sent',
  PENDING_INCOMING: 'pending_incoming',
  BLOCKED_BY_ME: 'blocked_by_me',
  BLOCKED_BY_THEM: 'blocked_by_them',
  REJECTED: 'rejected',
};

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getPayload = (response) => response?.data?.data ?? response?.data ?? null;

const normalizeStatus = (payload) => {
  if (!payload) {
    return {
      status: STATUS.NONE,
      connectionId: null,
      raw: null,
    };
  }

  const data = payload?.data ?? payload;

  if (typeof data === 'string') {
    const asText = data.toLowerCase();
    if (asText.includes('accepted') || asText.includes('connected')) {
      return { status: STATUS.ACCEPTED, connectionId: null, raw: data };
    }
    if (asText.includes('pending')) {
      return { status: STATUS.PENDING_SENT, connectionId: null, raw: data };
    }
    if (asText.includes('blocked')) {
      return { status: STATUS.BLOCKED_BY_ME, connectionId: null, raw: data };
    }
    if (asText.includes('reject')) {
      return { status: STATUS.REJECTED, connectionId: null, raw: data };
    }
    return { status: STATUS.NONE, connectionId: null, raw: data };
  }

  const rawStatus = String(
    data.status ?? data.connection_status ?? data.state ?? data.relationship_status ?? ''
  ).toLowerCase();

  const direction = String(
    data.direction ?? data.request_direction ?? data.pending_direction ?? ''
  ).toLowerCase();

  const blockedByMe = Boolean(
    data.is_blocked_by_me ?? data.blocked_by_me ?? data.blocked_by_requester ?? false
  );

  const blockedByThem = Boolean(
    data.is_blocked_by_them ?? data.blocked_by_them ?? data.blocked_by_addressee ?? false
  );

  const isConnected = Boolean(data.is_connected ?? false);

  const connectionId =
    data.id_connection ??
    data.connection_id ??
    data.connection?.id_connection ??
    data.connection?.id ??
    null;

  if (blockedByMe) {
    return { status: STATUS.BLOCKED_BY_ME, connectionId, raw: data };
  }

  if (blockedByThem) {
    return { status: STATUS.BLOCKED_BY_THEM, connectionId, raw: data };
  }

  if (rawStatus === 'accepted' || isConnected) {
    return { status: STATUS.ACCEPTED, connectionId, raw: data };
  }

  if (rawStatus === 'pending') {
    if (direction === 'incoming' || direction === 'received' || direction === 'addressee') {
      return { status: STATUS.PENDING_INCOMING, connectionId, raw: data };
    }
    return { status: STATUS.PENDING_SENT, connectionId, raw: data };
  }

  if (rawStatus === 'rejected') {
    return { status: STATUS.REJECTED, connectionId, raw: data };
  }

  return { status: STATUS.NONE, connectionId, raw: data };
};

const getId = (entity) => {
  if (entity === undefined || entity === null) return null;
  if (typeof entity !== 'object') return entity;
  return entity.id ?? entity.id_alumni ?? entity.alumni_id ?? entity.id_users ?? null;
};

const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || '';

const inferBlockedStatusFromError = (err) => {
  const raw = getErrorMessage(err);
  const msg = String(raw || '').toLowerCase();

  // Common backend messages (ID):
  // - "Alumni sudah di-block sebelumnya" => blocked_by_me
  // - "Anda diblokir ..." => blocked_by_them
  if (msg.includes('sudah') && (msg.includes('di-block') || msg.includes('di block') || msg.includes('diblok'))) {
    return STATUS.BLOCKED_BY_ME;
  }

  if (msg.includes('anda diblokir') || msg.includes('kamu diblokir') || msg.includes('diblokir oleh') || msg.includes('diblokir alumni')) {
    return STATUS.BLOCKED_BY_THEM;
  }

  if (msg.includes('blocked by') || msg.includes('you are blocked')) {
    return STATUS.BLOCKED_BY_THEM;
  }

  return null;
};

export function useConnections() {
  const [statusMap, setStatusMap] = useState({});
  const [loadingStatusMap, setLoadingStatusMap] = useState({});
  const [actionLoadingMap, setActionLoadingMap] = useState({});
  const [trackedIds, setTrackedIds] = useState([]);
  const [listLoading, setListLoading] = useState({
    my: false,
    pending: false,
    sent: false,
    blocked: false,
  });

  const [pendingCount, setPendingCount] = useState(0);

  const setStatusEntry = useCallback((alumniId, entry) => {
    if (!alumniId) return;
    setStatusMap((prev) => ({
      ...prev,
      [String(alumniId)]: {
        ...(prev[String(alumniId)] || {}),
        ...entry,
      },
    }));
  }, []);

  const withActionLoading = useCallback(async (alumniId, actionName, action) => {
    const key = String(alumniId);
    setActionLoadingMap((prev) => ({ ...prev, [key]: actionName || true }));
    try {
      return await action();
    } finally {
      setActionLoadingMap((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  const fetchStatus = useCallback(async (alumniId, options = {}) => {
    if (!alumniId) return null;

    const key = String(alumniId);
    if (!options.force && statusMap[key]) {
      return statusMap[key];
    }

    setLoadingStatusMap((prev) => ({ ...prev, [key]: true }));
    try {
      const response = await alumniApi.getConnectionStatus(alumniId);
      const normalized = normalizeStatus(getPayload(response));
      setStatusEntry(alumniId, normalized);
      return normalized;
    } catch (err) {
      const inferred = inferBlockedStatusFromError(err);
      if (inferred) {
        const normalized = { status: inferred, connectionId: null, raw: { inferredFromError: true } };
        setStatusEntry(alumniId, normalized);
        return normalized;
      }
      // swallow non-block errors to avoid breaking Promise.all in fetchStatuses
      return null;
    } finally {
      setLoadingStatusMap((prev) => ({ ...prev, [key]: false }));
    }
  }, [setStatusEntry, statusMap]);

  const fetchStatuses = useCallback(async (alumniIds = [], options = {}) => {
    const ids = alumniIds
      .map((id) => getId(id))
      .filter((id) => id !== null && id !== undefined);

    const idsToFetch = options.force
      ? ids
      : ids.filter((id) => !statusMap[String(id)]);

    if (idsToFetch.length === 0) return;

    setLoadingStatusMap((prev) => {
      const next = { ...prev };
      idsToFetch.forEach((id) => { next[String(id)] = true; });
      return next;
    });

    try {
      const response = await alumniApi.getConnectionStatusesBatch(idsToFetch);
      const statuses = getPayload(response) || {};

      setStatusMap((prev) => {
        const next = { ...prev };
        idsToFetch.forEach((id) => {
          const rawStatus = statuses[id];
          next[String(id)] = {
            ...(next[String(id)] || {}),
            ...normalizeStatus(rawStatus)
          };
        });
        return next;
      });
    } catch (err) {
      const inferred = inferBlockedStatusFromError(err);
      if (inferred) {
        setStatusMap((prev) => {
          const next = { ...prev };
          idsToFetch.forEach((id) => {
            next[String(id)] = {
              ...(next[String(id)] || {}),
              status: inferred,
              connectionId: null,
              raw: { inferredFromError: true }
            };
          });
          return next;
        });
      }
    } finally {
      setLoadingStatusMap((prev) => {
        const next = { ...prev };
        idsToFetch.forEach((id) => { next[String(id)] = false; });
        return next;
      });
    }
  }, [statusMap]);

  const getPendingConnectionIdByAlumni = useCallback(async (alumniId) => {
    const response = await alumniApi.getPendingConnectionRequests({ per_page: 100 });
    const payload = getPayload(response);
    const items = toArray(payload);

    const matched = items.find((item) => {
      const requesterId = getId(item.requester) ?? item.id_alumni_requester ?? item.requester_id;
      return String(requesterId) === String(alumniId);
    });

    return matched?.id_connection ?? matched?.connection_id ?? matched?.id ?? null;
  }, []);

  const sendRequest = useCallback(async (alumniId) => {
    return withActionLoading(alumniId, 'connect', async () => {
      try {
        await alumniApi.sendConnectionRequest(alumniId);
        setStatusEntry(alumniId, { status: STATUS.PENDING_SENT });
        await fetchStatus(alumniId, { force: true });
      } catch (err) {
        const inferred = inferBlockedStatusFromError(err);
        if (inferred) {
          setStatusEntry(alumniId, { status: inferred, connectionId: null, raw: { inferredFromError: true } });
        }
        throw err;
      }
    });
  }, [fetchStatus, setStatusEntry, withActionLoading]);

  const acceptRequest = useCallback(async (alumniId, providedConnectionId = null) => {
    return withActionLoading(alumniId, 'accept', async () => {
      let connectionId = providedConnectionId ?? statusMap[String(alumniId)]?.connectionId;
      if (!connectionId) {
        connectionId = await getPendingConnectionIdByAlumni(alumniId);
      }
      if (!connectionId) {
        throw new Error('ID permintaan koneksi tidak ditemukan.');
      }

      await alumniApi.acceptConnectionRequest(connectionId);
      setStatusEntry(alumniId, { status: STATUS.ACCEPTED, connectionId });
      await fetchStatus(alumniId, { force: true });
    });
  }, [fetchStatus, getPendingConnectionIdByAlumni, setStatusEntry, statusMap, withActionLoading]);

  const rejectRequest = useCallback(async (alumniId, providedConnectionId = null) => {
    return withActionLoading(alumniId, 'reject', async () => {
      let connectionId = providedConnectionId ?? statusMap[String(alumniId)]?.connectionId;
      if (!connectionId) {
        connectionId = await getPendingConnectionIdByAlumni(alumniId);
      }
      if (!connectionId) {
        throw new Error('ID permintaan koneksi tidak ditemukan.');
      }

      await alumniApi.rejectConnectionRequest(connectionId);
      setStatusEntry(alumniId, { status: STATUS.REJECTED, connectionId });
      await fetchStatus(alumniId, { force: true });
    });
  }, [fetchStatus, getPendingConnectionIdByAlumni, setStatusEntry, statusMap, withActionLoading]);

  const removeOrCancel = useCallback(async (alumniId) => {
    return withActionLoading(alumniId, 'remove', async () => {
      await alumniApi.removeConnectionOrCancelRequest(alumniId);
      setStatusEntry(alumniId, { status: STATUS.NONE, connectionId: null });
      await fetchStatus(alumniId, { force: true });
    });
  }, [fetchStatus, setStatusEntry, withActionLoading]);

  const block = useCallback(async (alumniId) => {
    return withActionLoading(alumniId, 'block', async () => {
      try {
        await alumniApi.blockAlumni(alumniId);
        setStatusEntry(alumniId, { status: STATUS.BLOCKED_BY_ME, connectionId: null });
        await fetchStatus(alumniId, { force: true });
      } catch (err) {
        const inferred = inferBlockedStatusFromError(err);
        if (inferred === STATUS.BLOCKED_BY_ME) {
          setStatusEntry(alumniId, { status: STATUS.BLOCKED_BY_ME, connectionId: null, raw: { inferredFromError: true } });
        }
        throw err;
      }
    });
  }, [fetchStatus, setStatusEntry, withActionLoading]);

  const unblock = useCallback(async (alumniId) => {
    return withActionLoading(alumniId, 'unblock', async () => {
      await alumniApi.unblockAlumni(alumniId);
      setStatusEntry(alumniId, { status: STATUS.NONE, connectionId: null });
      await fetchStatus(alumniId, { force: true });
    });
  }, [fetchStatus, setStatusEntry, withActionLoading]);

  const registerAlumniIds = useCallback((ids = []) => {
    const normalized = ids
      .map((id) => getId(id))
      .filter((id) => id !== null && id !== undefined)
      .map((id) => String(id));

    setTrackedIds((prev) => {
      const set = new Set(prev);
      normalized.forEach((id) => set.add(id));
      return Array.from(set);
    });
  }, []);

  useEffect(() => {
    const onNotification = () => {
      if (trackedIds.length === 0) return;
      fetchStatuses(trackedIds, { force: true });
    };

    window.addEventListener('reverb:notification.received', onNotification);
    return () => window.removeEventListener('reverb:notification.received', onNotification);
  }, [fetchStatuses, trackedIds]);

  const normalizeListResponse = useCallback((response) => {
    const payload = getPayload(response);
    const rows = toArray(payload);

    return {
      data: rows,
      currentPage: Number(payload?.current_page || payload?.meta?.current_page || 1),
      lastPage: Number(payload?.last_page || payload?.meta?.last_page || 1),
      total: Number(payload?.total || payload?.meta?.total || rows.length || 0),
      perPage: Number(payload?.per_page || payload?.meta?.per_page || rows.length || 0),
    };
  }, []);

  const fetchMyConnections = useCallback(async (params = {}) => {
    setListLoading((prev) => ({ ...prev, my: true }));
    try {
      const response = await alumniApi.getMyConnections(params);
      return normalizeListResponse(response);
    } finally {
      setListLoading((prev) => ({ ...prev, my: false }));
    }
  }, [normalizeListResponse]);

  const fetchPendingRequests = useCallback(async (params = {}) => {
    setListLoading((prev) => ({ ...prev, pending: true }));
    try {
      const response = await alumniApi.getPendingConnectionRequests(params);
      const normalized = normalizeListResponse(response);
      setPendingCount(normalized.total);
      return normalized;
    } finally {
      setListLoading((prev) => ({ ...prev, pending: false }));
    }
  }, [normalizeListResponse]);

  const fetchSentRequests = useCallback(async (params = {}) => {
    setListLoading((prev) => ({ ...prev, sent: true }));
    try {
      const response = await alumniApi.getSentConnectionRequests(params);
      return normalizeListResponse(response);
    } finally {
      setListLoading((prev) => ({ ...prev, sent: false }));
    }
  }, [normalizeListResponse]);

  const fetchBlockedUsers = useCallback(async (params = {}) => {
    setListLoading((prev) => ({ ...prev, blocked: true }));
    try {
      const response = await alumniApi.getBlockedAlumni(params);
      return normalizeListResponse(response);
    } finally {
      setListLoading((prev) => ({ ...prev, blocked: false }));
    }
  }, [normalizeListResponse]);

  const refreshPendingCount = useCallback(async () => {
    const normalized = await fetchPendingRequests({ page: 1, per_page: 1 });
    return normalized.total;
  }, [fetchPendingRequests]);

  const api = useMemo(() => ({
    STATUS,
    statusMap,
    loadingStatusMap,
    actionLoadingMap,
    listLoading,
    pendingCount,
    fetchStatus,
    fetchStatuses,
    registerAlumniIds,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeOrCancel,
    block,
    unblock,
    fetchMyConnections,
    fetchPendingRequests,
    fetchSentRequests,
    fetchBlockedUsers,
    refreshPendingCount,
  }), [
    statusMap,
    loadingStatusMap,
    actionLoadingMap,
    listLoading,
    pendingCount,
    fetchStatus,
    fetchStatuses,
    registerAlumniIds,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeOrCancel,
    block,
    unblock,
    fetchMyConnections,
    fetchPendingRequests,
    fetchSentRequests,
    fetchBlockedUsers,
    refreshPendingCount,
  ]);

  return api;
}
