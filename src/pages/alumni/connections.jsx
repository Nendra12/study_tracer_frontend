import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, Ban, Link2, Loader2, Send, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { STORAGE_BASE_URL } from '../../api/axios';
import { useConnections } from '../../hooks/useConnections';
import Connection from '../../components/alumni/Connection';
import Pagination from '../../components/admin/Pagination';

import ConnectionImg from '../../assets/connection.png';

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

function getAvatarFallback(name) {
  const safeName = (name || 'A').toString().trim() || 'A';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=3C5759&color=fff&size=200`;
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
  const [pageMeta, setPageMeta] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 12 }); // PERUBAHAN: Ubah perPage ke 12 agar genap dibagi 3 kolom

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

      const result = await fetcher({ page, per_page: 12 }); // PERUBAHAN: Gunakan per_page 12
      const mapped = (result.data || []).map((item) => mapConnectionItem(item, tabKey));

      setItems(mapped);
      setPageMeta({
        currentPage: result.currentPage,
        lastPage: result.lastPage,
        total: result.total,
        perPage: result.perPage || 12, // PERUBAHAN: Update meta perPage
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

  const runAndRefresh = useCallback(async (handler, ...handlerArgs) => {
    if (!handler) return;
    await handler(...handlerArgs);
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
      <section className="relative pt-28 pb-20 w-full z-30 bg-primary rounded-b-[2.5rem] overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 capitalize">
              Connections
            </h1>
            <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed">
              Kelola koneksi alumni, permintaan masuk, permintaan terkirim, dan daftar block dalam satu tempat.
            </p>
          </div>

          <div className="hidden lg:flex items-center justify-center opacity-80">
            <img src={ConnectionImg} alt="connections" className="w-56 xl:w-64" />
          </div>
        </div>
      </section>

      <main className="w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-40 -mt-10 pb-12">
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-slate-100 mb-8">
          <div className="flex flex-wrap gap-3">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${active ? 'bg-primary text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center">
            <AlertCircle size={44} className="text-red-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600 mb-4">{error}</p>
            <button
              onClick={() => loadTabData(activeTab, pageMeta.currentPage || 1)}
              className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-md"
            >
              Coba Lagi
            </button>
          </div>
        ) : isLoading ? (
          <div className="bg-white rounded-2xl p-16 border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={24} className="animate-spin text-primary" /> 
            <span className="font-semibold text-sm">Memuat data koneksi...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 border border-slate-100 shadow-sm text-center text-slate-500 font-medium">
            {emptyMessage}
          </div>
        ) : (
          <>
            {/* PERUBAHAN: Layout Grid 3 Kolom & Card Horizontal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const image = getImageUrl(item.photo);
                const fallbackAvatar = getAvatarFallback(item.name);
                const isSelf = String(item.id) === String(myAlumniId);

                return (
                  <div
                    key={`${activeTab}-${item.id}-${item.connectionId || 'none'}`}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-row h-[180px]" // PERUBAHAN: flex-row & h-[180px]
                  >
                    {/* BAGIAN KIRI: FOTO (w-[40%]) */}
                    <div className="w-[40%] h-full shrink-0 bg-slate-100 border-r border-slate-100 overflow-hidden">
                      <img
                        src={image || fallbackAvatar}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          if (e.currentTarget.src !== fallbackAvatar) e.currentTarget.src = fallbackAvatar;
                        }}
                      />
                    </div>

                    {/* BAGIAN KANAN: DATA & ACTIONS (w-[60%]) */}
                    <div className="w-[60%] h-full p-4 flex flex-col">
                      {/* Info Detail */}
                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-primary line-clamp-1 pr-1" title={item.name}>{item.name}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 line-clamp-1">
                          {item.major} • '{item.year.toString().slice(-2)}
                        </p>
                        
                        {/* Opsional: Tampilkan role/pekerjaan hanya jika datanya ada (bukan '-') */}
                        {item.role && item.role !== '-' && (
                           <p className="text-xs text-slate-600 font-medium line-clamp-1 leading-snug mt-1">
                             {item.role} {item.company && item.company !== '-' ? `di ${item.company}` : ''}
                           </p>
                        )}
                      </div>

                      {/* Status & Actions - Didorong ke bawah dengan 'mt-auto' agar tidak mepet */}
                      <div className="mt-auto mb-3 flex flex-col gap-2.5 [&_div.badge]:!p-0 [&_div.badge]:!border-0 [&_div.badge]:!bg-transparent [&_div.actions]:!mt-0">
                        <Connection
                          alumniId={item.id}
                          isSelf={isSelf}
                          statusEntry={item.statusEntry}
                          isLoading={isLoading}
                          compact
                          mode="badge"
                        />
                        <Connection
                          alumniId={item.id}
                          isSelf={isSelf}
                          statusEntry={item.statusEntry}
                          onConnect={(...args) => runAndRefresh(sendRequest, ...args)}
                          onAccept={(...args) => runAndRefresh(acceptRequest, ...args)}
                          onReject={(...args) => runAndRefresh(rejectRequest, ...args)}
                          onRemove={(...args) => runAndRefresh(removeOrCancel, ...args)}
                          onBlock={(...args) => runAndRefresh(block, ...args)}
                          onUnblock={(...args) => runAndRefresh(unblock, ...args)}
                          isActionLoading={isLoading}
                          compact
                          mode="actions"
                        />
                      </div>

                      {/* Link Profil di paling bawah kanan */}
                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={() => navigate(`/alumni/daftar-alumni/${item.id}`)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/70 transition-colors cursor-pointer"
                        >
                          Lihat Profil <ArrowRight size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {pageMeta.lastPage > 1 && (
              <div className="mt-10 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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