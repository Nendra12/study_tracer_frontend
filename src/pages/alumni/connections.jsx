import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, Ban, Link2, Loader2, Send, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { STORAGE_BASE_URL } from '../../api/axios';
import { useConnections } from '../../hooks/useConnections';
import Connection from '../../components/alumni/Connection';
import Pagination from '../../components/admin/Pagination';

const TABS = [
  { key: 'my', label: 'My Connections', icon: Link2 },
  { key: 'pending', label: 'Pending', icon: UserPlus },
  { key: 'sent', label: 'Sent', icon: Send },
  { key: 'blocked', label: 'Blocked', icon: Ban },
];

const STATUS_BY_TAB = {
  my: 'accepted',
  pending: 'pending_incoming',
  sent: 'pending_sent',
  blocked: 'blocked_by_me',
};

function getImageUrl(path) {
  if (!path) return null;
  if (String(path).startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

function getAlumniId(entity) {
  if (!entity) return null;
  return entity.id || entity.id_alumni || entity.alumni_id || entity.id_users || null;
}

function mapConnectionItem(item, tabKey) {
  const profile =
    item.alumni ||
    item.profile ||
    item.user ||
    item.requester ||
    item.addressee ||
    item.blocked ||
    item.target ||
    item;

  const id = getAlumniId(profile) || getAlumniId(item);

  const name =
    profile.nama ||
    profile.name ||
    profile.nama_alumni ||
    profile.full_name ||
    '-';

  const major =
    profile.jurusan?.nama ||
    profile.jurusan ||
    profile.major ||
    '-';

  const year =
    profile.angkatan ||
    profile.tahun_masuk ||
    profile.graduation_year ||
    profile.tahun_lulus ||
    '-';

  const role =
    profile.role ||
    profile.current_career?.status ||
    item.role ||
    '-';

  const company =
    profile.company ||
    profile.current_career?.pekerjaan?.perusahaan?.nama ||
    profile.current_career?.kuliah?.universitas?.nama ||
    profile.current_career?.wirausaha?.nama_usaha ||
    '-';

  const photo = profile.foto || profile.photo || null;

  const connectionId =
    item.id_connection ||
    item.connection_id ||
    item.id ||
    null;

  return {
    id,
    name,
    major,
    year,
    role,
    company,
    photo,
    connectionId,
    statusEntry: {
      status: STATUS_BY_TAB[tabKey] || 'none',
      connectionId,
      raw: item,
    },
  };
}

export default function ConnectionsPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const {
    listLoading,
    fetchMyConnections,
    fetchPendingRequests,
    fetchSentRequests,
    fetchBlockedUsers,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeOrCancel,
    block,
    unblock,
    refreshPendingCount,
  } = useConnections();

  const [activeTab, setActiveTab] = useState('my');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [pageMeta, setPageMeta] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 10 });

  const isLoading = listLoading[activeTab] || false;

  const fetcherByTab = useMemo(() => ({
    my: fetchMyConnections,
    pending: fetchPendingRequests,
    sent: fetchSentRequests,
    blocked: fetchBlockedUsers,
  }), [fetchBlockedUsers, fetchMyConnections, fetchPendingRequests, fetchSentRequests]);

  const loadTabData = useCallback(async (tabKey, page = 1) => {
    setError('');
    try {
      const fetcher = fetcherByTab[tabKey];
      if (!fetcher) return;

      const result = await fetcher({ page, per_page: 10 });
      const mapped = (result.data || []).map((item) => mapConnectionItem(item, tabKey));

      setItems(mapped);
      setPageMeta({
        currentPage: result.currentPage,
        lastPage: result.lastPage,
        total: result.total,
        perPage: result.perPage || 10,
      });
    } catch (err) {
      setItems([]);
      setError(err?.response?.data?.message || 'Gagal memuat data koneksi.');
    }
  }, [fetcherByTab]);

  useEffect(() => {
    loadTabData(activeTab, 1);
  }, [activeTab, loadTabData]);

  useEffect(() => {
    const handleRealtime = () => {
      loadTabData(activeTab, pageMeta.currentPage || 1);
      refreshPendingCount();
    };

    window.addEventListener('reverb:notification.received', handleRealtime);
    return () => window.removeEventListener('reverb:notification.received', handleRealtime);
  }, [activeTab, loadTabData, pageMeta.currentPage, refreshPendingCount]);

  const myAlumniId = getAlumniId(authUser?.profile) || getAlumniId(authUser);

  const runAndRefresh = useCallback(async (handler, alumniId) => {
    if (!handler) return;
    await handler(alumniId);
    await loadTabData(activeTab, pageMeta.currentPage || 1);
    await refreshPendingCount();
  }, [activeTab, loadTabData, pageMeta.currentPage, refreshPendingCount]);

  const emptyMessage = {
    my: 'Belum ada koneksi diterima.',
    pending: 'Belum ada permintaan masuk.',
    sent: 'Belum ada permintaan terkirim.',
    blocked: 'Belum ada alumni yang diblokir.',
  }[activeTab];

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa]">
      <section className="relative pt-24 pb-18 lg:pb-10 w-full z-30 bg-primary rounded-b-[2.5rem]">
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Connections
            </h1>
            <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed">
              Kelola koneksi alumni, permintaan masuk, permintaan terkirim, dan daftar block dalam satu tempat.
            </p>
          </div>
        </div>
      </section>

      <main className="w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-40 -mt-10 pb-12">
        <div className="bg-white p-4 md:p-6 rounded-md shadow-xl border border-slate-100 mb-6">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${active ? 'bg-primary text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <div className="bg-white rounded-md p-10 border border-slate-100 shadow-sm text-center">
            <AlertCircle size={44} className="text-red-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600 mb-4">{error}</p>
            <button
              onClick={() => loadTabData(activeTab, pageMeta.currentPage || 1)}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        ) : isLoading ? (
          <div className="bg-white rounded-md p-12 border border-slate-100 shadow-sm flex items-center justify-center gap-2 text-slate-500">
            <Loader2 size={18} className="animate-spin" /> Memuat data koneksi...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-md p-12 border border-slate-100 shadow-sm text-center text-slate-500 font-medium">
            {emptyMessage}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {items.map((item) => {
                const image = getImageUrl(item.photo);
                const isSelf = String(item.id) === String(myAlumniId);

                return (
                  <div key={`${activeTab}-${item.id}-${item.connectionId || 'none'}`} className="bg-white rounded-md border border-slate-100 shadow-sm p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        {image ? (
                          <img src={image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary/40 font-black text-lg">
                            {item.name?.charAt(0) || 'A'}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-black text-primary truncate">{item.name}</h3>
                        <p className="text-xs text-slate-500 font-semibold mt-1">
                          {item.major} • Angkatan {item.year}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {item.role} {item.company && item.company !== '-' ? `di ${item.company}` : ''}
                        </p>
                      </div>

                      <button
                        onClick={() => navigate(`/alumni/daftar-alumni/${item.id}`)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        Profil <ArrowRight size={14} />
                      </button>
                    </div>

                    <div className="mt-4">
                      <Connection
                        alumniId={item.id}
                        isSelf={isSelf}
                        statusEntry={item.statusEntry}
                        onConnect={(alumniId) => runAndRefresh(sendRequest, alumniId)}
                        onAccept={(alumniId) => runAndRefresh(acceptRequest, alumniId)}
                        onReject={(alumniId) => runAndRefresh(rejectRequest, alumniId)}
                        onRemove={(alumniId) => runAndRefresh(removeOrCancel, alumniId)}
                        onBlock={(alumniId) => runAndRefresh(block, alumniId)}
                        onUnblock={(alumniId) => runAndRefresh(unblock, alumniId)}
                        compact
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {pageMeta.lastPage > 1 && (
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <Pagination
                  currentPage={pageMeta.currentPage}
                  totalPages={pageMeta.lastPage}
                  onPageChange={(page) => loadTabData(activeTab, page)}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
