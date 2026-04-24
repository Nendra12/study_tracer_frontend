import React, { useMemo, useState } from "react";
import { FileText, Heart, Image as ImageIcon, MessageCircle, Repeat2, Search, Smile, Video, X } from "lucide-react";
import { STORAGE_BASE_URL } from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import SmoothDropdown from "../../admin/SmoothDropdown";

const DUMMY_ALUMNI_POSTS = [
  {
    id: "p-1",
    author: {
      name: "Rani Putri",
      headline: "Frontend Engineer • Angkatan 2020",
      isConnected: true,
    },
    createdAtLabel: "2 jam lalu",
    content:
      "Teman-teman, aku baru selesai update CV & portofolio. Ada yang mau review? Aku juga open untuk kolaborasi project kecil-kecilan.",
    stats: { likes: 18, reposts: 2 },
    comments: [
      {
        id: "p-1-c-1",
        authorName: "Dimas Aulia",
        createdAtLabel: "1 jam lalu",
        text: "Keren! Kirim link portonya dong.",
        replies: [
          {
            id: "p-1-c-1-r-1",
            authorName: "Rani Putri",
            createdAtLabel: "55 menit lalu",
            text: "Siap, aku kirim via chat ya 🙌",
          },
        ],
      },
      {
        id: "p-1-c-2",
        authorName: "Siti Nurhaliza",
        createdAtLabel: "58 menit lalu",
        text: "Boleh, aku review bagian UI-nya ya.",
        replies: [],
      },
      {
        id: "p-1-c-3",
        authorName: "Bima Pratama",
        createdAtLabel: "40 menit lalu",
        text: "Semangat terus!",
        replies: [],
      },
      {
        id: "p-1-c-4",
        authorName: "Ayu Lestari",
        createdAtLabel: "25 menit lalu",
        text: "Nice! Aku juga lagi update CV nih.",
        replies: [],
      },
    ],
  },
  {
    id: "p-2",
    author: {
      name: "Dimas Aulia",
      headline: "Data Analyst • Angkatan 2019",
      isConnected: true,
    },
    createdAtLabel: "Kemarin",
    content:
      "Tips singkat untuk yang lagi apply kerja: tulis impact pakai angka. Contoh: ‘mengurangi waktu proses 40%’ itu lebih kuat.",
    stats: { likes: 42, reposts: 5 },
    comments: [
      {
        id: "p-2-c-1",
        authorName: "Rani Putri",
        createdAtLabel: "Kemarin",
        text: "Setuju banget. Ini yang paling sering dilupain.",
        replies: [],
      },
      {
        id: "p-2-c-2",
        authorName: "Siti Nurhaliza",
        createdAtLabel: "Kemarin",
        text: "Ada contoh format bullet yang kamu pakai?",
        replies: [
          {
            id: "p-2-c-2-r-1",
            authorName: "Dimas Aulia",
            createdAtLabel: "Kemarin",
            text: "Biasanya aku pakai: Action + Metric + Tools. Nanti aku share contoh ya.",
          },
        ],
      },
    ],
  },
  {
    id: "p-3",
    author: {
      name: "Siti Nurhaliza",
      headline: "UI/UX Designer • Angkatan 2021",
      isConnected: true,
    },
    createdAtLabel: "3 hari lalu",
    content:
      "Ada yang punya rekomendasi komunitas design/UX di Bandung? Aku baru pindah dan pengen ikut meetup.",
    stats: { likes: 27, reposts: 1 },
    comments: [
      {
        id: "p-3-c-1",
        authorName: "Dimas Aulia",
        createdAtLabel: "3 hari lalu",
        text: "Coba cek event di coworking space sekitar Dago.",
        replies: [],
      },
      {
        id: "p-3-c-2",
        authorName: "Rani Putri",
        createdAtLabel: "3 hari lalu",
        text: "Aku ada grup kecil, nanti aku invite ya.",
        replies: [],
      },
      {
        id: "p-3-c-3",
        authorName: "Ayu Lestari",
        createdAtLabel: "2 hari lalu",
        text: "Welcome Bandung!",
        replies: [],
      },
      {
        id: "p-3-c-4",
        authorName: "Bima Pratama",
        createdAtLabel: "2 hari lalu",
        text: "Seru tuh meetup, ikut dong kalau ada.",
        replies: [],
      },
      {
        id: "p-3-c-5",
        authorName: "Nanda Prakoso",
        createdAtLabel: "1 hari lalu",
        text: "Aku punya list komunitas, mau aku share?",
        replies: [],
      },
    ],
  },
];

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

function getInitials(name) {
  if (!name) return "?";
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = parts[0]?.[0] || "";
  const second = parts.length > 1 ? parts[1]?.[0] || "" : "";
  return (first + second).toUpperCase();
}

function StatButton({ icon: Icon, label, count, active, onClick, variant }) {
  const iconClassName = active ? (variant === "like" ? "text-red-500" : "text-primary") : "text-slate-500";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
        // Default style stays the same; only the heart turns red when liked.
        variant === "like" ? "text-slate-600 hover:bg-slate-50" : active ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Icon
        size={16}
        className={iconClassName}
        fill={variant === "like" ? (active ? "currentColor" : "none") : "none"}
      />
      <span className={active ? "" : "text-slate-600"}>{label}</span>
      <span className="text-slate-400 font-black">{count}</span>
    </button>
  );
}

function CommentItem({
  authorName,
  createdAtLabel,
  text,
  onReplyClick,
  showRepliesToggle,
  onToggleReplies,
  showReplies,
  liked,
  onToggleLike,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-none">
        <span className="text-slate-600 font-black text-xs">{getInitials(authorName)}</span>
      </div>
      <div className="flex-1">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-xs font-black text-slate-800 truncate">{authorName}</p>
              <button
                type="button"
                className="text-[10px] font-black text-primary hover:text-primary/80 transition-colors cursor-pointer flex-none"
                onClick={() => {}}
              >
                +Connect
              </button>
            </div>
            <div className="flex items-center gap-2 flex-none">
              <p className="text-[10px] font-bold text-slate-400">{createdAtLabel}</p>
              <button
                type="button"
                className="p-1 rounded-full hover:bg-white transition-colors cursor-pointer"
                onClick={onToggleLike}
                aria-label="Like komentar"
              >
                <Heart
                  size={16}
                  className={liked ? "text-red-500" : "text-slate-400"}
                  fill={liked ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-700 mt-1 leading-relaxed">{text}</p>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs font-bold text-slate-400">
          <button type="button" className="hover:text-primary transition-colors cursor-pointer" onClick={onReplyClick}>
            Reply
          </button>
          {showRepliesToggle ? (
            <>
              <span className="text-slate-200">|</span>
              <button type="button" className="hover:text-primary transition-colors cursor-pointer" onClick={onToggleReplies}>
                {showReplies ? "Sembunyikan balasan" : "Lihat balasan"}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AddCommentRow({ avatarUrl, displayName, placeholder = "Tambahkan komentar...", value, onChange }) {
  return (
    <div className="w-full flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3">
      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-none">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName || "User"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary text-white text-xs font-black">
            {getInitials(displayName || "A")}
          </div>
        )}
      </div>
      <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
        />
        <div className="flex items-center gap-3 flex-none">
          <button type="button" className="p-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer" aria-label="Emoji">
            <Smile size={18} className="text-slate-400" />
          </button>
          <button type="button" className="p-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer" aria-label="Tambah gambar">
            <ImageIcon size={18} className="text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StartPostModal({ open, avatarUrl, displayName, value, onChange, onClose, onSubmit }) {
  const canPost = String(value || "").trim().length > 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-120">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 p-4 sm:p-6 flex items-start sm:items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-none">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName || "User"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-white text-xs font-black">
                    {getInitials(displayName || "A")}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-slate-800 truncate">{displayName || "Alumni"}</p>
                </div>
                <p className="text-xs font-bold text-slate-500">Posting ke Koneksi</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-50 transition-colors cursor-pointer flex-none"
              aria-label="Tutup"
            >
              <X size={18} className="text-slate-500" />
            </button>
          </div>

          <div className="px-5 sm:px-6 pb-4">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Apa yang ingin kamu bicarakan?"
              className="w-full min-h-65 resize-none text-slate-700 placeholder:text-slate-400 text-base font-medium outline-none"
            />
          </div>

          <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button type="button" className="p-2 rounded-full hover:bg-slate-50 transition-colors cursor-pointer" aria-label="Emoji">
                <Smile size={18} className="text-slate-500" fill="none" />
              </button>
              <button type="button" className="p-2 rounded-full hover:bg-slate-50 transition-colors cursor-pointer" aria-label="Tambah foto">
                <ImageIcon size={18} className="text-slate-500" fill="none" />
              </button>
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={!canPost}
              className={`h-10 px-6 rounded-full text-sm font-black transition-colors border ${
                canPost
                  ? "bg-primary text-white border-primary hover:bg-[#2e4042] cursor-pointer"
                  : "bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed"
              }`}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StartPostComposer({ avatarUrl, displayName, onStartPost }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-none">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName || "User"} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary text-white text-xs font-black">
              {getInitials(displayName || "A")}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onStartPost}
          className="flex-1 h-12 rounded-full border border-slate-200 bg-white px-5 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Mulai postingan
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button type="button" className="h-10 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-600">
          <Video size={18} className="text-slate-500" fill="none" />
          Video
        </button>
        <button type="button" className="h-10 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-600">
          <ImageIcon size={18} className="text-slate-500" fill="none" />
          Foto
        </button>
        <button type="button" className="h-10 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-600">
          <FileText size={18} className="text-slate-500" fill="none" />
          Tulis artikel
        </button>
      </div>
    </div>
  );
}

export default function MiniMedsosBeranda() {
  const { user } = useAuth();
  const myProfile = user?.profile;
  const myName = myProfile?.nama || user?.nama_alumni || "Alumni";
  const myAvatarUrl = myProfile?.foto_thumbnail
    ? getImageUrl(myProfile.foto_thumbnail)
    : myProfile?.foto
      ? getImageUrl(myProfile.foto)
      : null;

  const initialPosts = useMemo(() => DUMMY_ALUMNI_POSTS, []);
  const [posts, setPosts] = useState(initialPosts);

  const initialLikes = useMemo(() => {
    const map = {};
    initialPosts.forEach((p) => {
      map[p.id] = { liked: false, count: p.stats?.likes ?? 0 };
    });
    return map;
  }, [initialPosts]);

  const [likesState, setLikesState] = useState(initialLikes);
  const [openCommentsById, setOpenCommentsById] = useState({});
  const [showAllCommentsById, setShowAllCommentsById] = useState({});
  const [openRepliesByKey, setOpenRepliesByKey] = useState({});
  const [openReplyBoxByKey, setOpenReplyBoxByKey] = useState({});
  const [commentDraftByPostId, setCommentDraftByPostId] = useState({});
  const [replyDraftByKey, setReplyDraftByKey] = useState({});
  const [commentLikeByKey, setCommentLikeByKey] = useState({});
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [postSortMode, setPostSortMode] = useState("popular");
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postDraft, setPostDraft] = useState("");

  const visiblePosts = useMemo(() => {
    const query = String(postSearchQuery || "").trim().toLowerCase();

    const filtered = posts.filter((post) => {
      if (!query) return true;
      const author = String(post.author?.name || "").toLowerCase();
      const content = String(post.content || "").toLowerCase();
      return author.includes(query) || content.includes(query);
    });

    const scoreLike = (post) => likesState[post.id]?.count ?? (post.stats?.likes ?? 0);
    const scorePopular = (post) => {
      const likeCount = scoreLike(post);
      const commentCount = post.comments?.length ?? 0;
      const repostCount = post.stats?.reposts ?? 0;
      return likeCount + commentCount * 2 + repostCount * 3;
    };

    const sorted = [...filtered].sort((a, b) => {
      if (postSortMode === "liked") return scoreLike(b) - scoreLike(a);
      return scorePopular(b) - scorePopular(a);
    });

    return sorted;
  }, [postSearchQuery, postSortMode, likesState, posts]);

  const toggleLike = (postId) => {
    setLikesState((prev) => {
      const current = prev[postId] || { liked: false, count: 0 };
      const liked = !current.liked;
      const count = Math.max(0, (current.count || 0) + (liked ? 1 : -1));
      return { ...prev, [postId]: { liked, count } };
    });
  };

  const toggleComments = (postId) => {
    setOpenCommentsById((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleReplies = (postId, commentId) => {
    const key = `${postId}:${commentId}`;
    setOpenRepliesByKey((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleReplyBox = (postId, commentId) => {
    const key = `${postId}:${commentId}`;
    setOpenReplyBoxByKey((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCommentLike = (key) => {
    setCommentLikeByKey((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOpenPostModal = () => {
    setPostModalOpen(true);
  };

  const handleClosePostModal = () => {
    setPostModalOpen(false);
    setPostDraft("");
  };

  const handleSubmitPost = () => {
    const content = String(postDraft || "").trim();
    if (!content) return;

    const newPostId = `p-new-${Date.now()}`;
    const newPost = {
      id: newPostId,
      author: {
        name: myName,
        headline: "Hanya untuk Koneksi",
        isConnected: true,
      },
      createdAtLabel: "Baru saja",
      content,
      stats: { likes: 0, reposts: 0 },
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setLikesState((prev) => ({ ...prev, [newPostId]: { liked: false, count: 0 } }));
    handleClosePostModal();
  };

  return (
    <section className="bg-white p-6 sm:p-8 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mt-2">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
        <div>
          <h2 className="text-2xl font-black text-primary tracking-tight">Postingan Alumni</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Postingan terbaru dari alumni yang sudah terkoneksi.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <StartPostComposer avatarUrl={myAvatarUrl} displayName={myName} onStartPost={handleOpenPostModal} />

        <StartPostModal
          open={postModalOpen}
          avatarUrl={myAvatarUrl}
          displayName={myName}
          value={postDraft}
          onChange={setPostDraft}
          onClose={handleClosePostModal}
          onSubmit={handleSubmitPost}
        />

        <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full">
          <div className="flex h-11.75 w-full lg:flex-1 border-2 border-gray-100 rounded-xl bg-white overflow-hidden transition-all focus-within:border-gray-200">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari postingan..."
                value={postSearchQuery}
                onChange={(e) => setPostSearchQuery(e.target.value)}
                className="w-full h-full pl-10 pr-4 bg-transparent text-sm text-slate-700 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="w-full lg:w-56 relative z-60">
            <SmoothDropdown
              options={[
                { value: "popular", label: "Terpopuler" },
                { value: "liked", label: "Paling banyak disukai" },
              ]}
              value={postSortMode}
              onSelect={(val) => setPostSortMode(val)}
              placeholder="Filter"
            />
          </div>
        </div>

        {visiblePosts.map((post) => (
          <article key={post.id} className="rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="p-5 sm:p-6">
              <header className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-none">
                    <span className="text-primary font-black text-sm">{getInitials(post.author?.name)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black text-slate-800 truncate">{post.author?.name}</h3>
                      {post.author?.isConnected ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Koneksi
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate">{post.author?.headline}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-bold flex-none">{post.createdAtLabel}</div>
              </header>

              <div className="mt-4">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{post.content}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                <StatButton
                  icon={Heart}
                  label="Suka"
                  count={likesState[post.id]?.count ?? (post.stats?.likes ?? 0)}
                  active={likesState[post.id]?.liked ?? false}
                  onClick={() => toggleLike(post.id)}
                  variant="like"
                />
                <StatButton
                  icon={MessageCircle}
                  label="Komentar"
                  count={post.comments?.length ?? 0}
                  active={!!openCommentsById[post.id]}
                  onClick={() => toggleComments(post.id)}
                />
                <StatButton
                  icon={Repeat2}
                  label="Bagikan"
                  count={post.stats?.reposts ?? 0}
                  active={false}
                  onClick={() => {}}
                />
              </div>

              {openCommentsById[post.id] ? (
                <div className="mt-4">
                  <div className="space-y-3">
                    <AddCommentRow
                      avatarUrl={myAvatarUrl}
                      displayName={myName}
                      value={commentDraftByPostId[post.id] ?? ""}
                      onChange={(val) => setCommentDraftByPostId((prev) => ({ ...prev, [post.id]: val }))}
                    />

                    {(showAllCommentsById[post.id] ? post.comments || [] : (post.comments || []).slice(0, 3)).map((c) => {
                      const key = `${post.id}:${c.id}`;
                      const hasReplies = Array.isArray(c.replies) && c.replies.length > 0;
                      const showReplies = !!openRepliesByKey[key];
                      const showReplyBox = !!openReplyBoxByKey[key];

                      return (
                        <div key={c.id} className="space-y-3">
                          <CommentItem
                            authorName={c.authorName}
                            createdAtLabel={c.createdAtLabel}
                            text={c.text}
                            onReplyClick={() => toggleReplyBox(post.id, c.id)}
                            showRepliesToggle={hasReplies}
                            onToggleReplies={() => toggleReplies(post.id, c.id)}
                            showReplies={showReplies}
                            liked={!!commentLikeByKey[key]}
                            onToggleLike={() => toggleCommentLike(key)}
                          />

                          {showReplyBox ? (
                            <div className="pl-12">
                              <AddCommentRow
                                avatarUrl={myAvatarUrl}
                                displayName={myName}
                                placeholder="Balas komentar..."
                                value={replyDraftByKey[key] ?? ""}
                                onChange={(val) => setReplyDraftByKey((prev) => ({ ...prev, [key]: val }))}
                              />
                            </div>
                          ) : null}

                          {hasReplies && showReplies ? (
                            <div className="pl-12 border-l-2 border-slate-100 ml-3 space-y-3">
                              {c.replies.map((r) => (
                                <CommentItem
                                  key={r.id}
                                  authorName={r.authorName}
                                  createdAtLabel={r.createdAtLabel}
                                  text={r.text}
                                  onReplyClick={() => {}}
                                  showRepliesToggle={false}
                                  onToggleReplies={() => {}}
                                  showReplies={false}
                                  liked={!!commentLikeByKey[`${key}:${r.id}`]}
                                  onToggleLike={() => toggleCommentLike(`${key}:${r.id}`)}
                                />
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}

                    {!showAllCommentsById[post.id] && (post.comments || []).length > 3 ? (
                      <div className="pt-1">
                        <button
                          type="button"
                          className="text-sm font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer"
                          onClick={() => setShowAllCommentsById((prev) => ({ ...prev, [post.id]: true }))}
                        >
                          Komentar lainnya
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
