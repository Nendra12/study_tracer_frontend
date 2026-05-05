import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { FileText, Heart, Image as ImageIcon, Loader2, MessageCircle, MoreHorizontal, Flag, Trash2, Search, Send, Video, X } from "lucide-react";
import { STORAGE_BASE_URL } from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import { useMiniMedsos } from "../../../hooks/useMiniMedsos";
import SmoothDropdown from "../../admin/SmoothDropdown";
import StartPostModal from "../StartPostModal";

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

function getInitials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || "") + (parts.length > 1 ? parts[1]?.[0] || "" : "")).toUpperCase();
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function Avatar({ url, name, size = "w-11 h-11", textSize = "text-sm" }) {
  return (
    <div className={`${size} rounded-full bg-primary/10 flex items-center justify-center flex-none overflow-hidden`}>
      {url ? (
        <img src={url} alt={name || "User"} className="w-full h-full object-cover" />
      ) : (
        <span className={`text-primary font-black ${textSize}`}>{getInitials(name)}</span>
      )}
    </div>
  );
}

function StatButton({ icon: Icon, label, count, active, onClick, variant }) {
  const iconClass = active ? (variant === "like" ? "text-red-500" : "text-primary") : "text-slate-500";
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
        variant === "like" ? "text-slate-600 hover:bg-slate-50" : active ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"
      }`}>
      <Icon size={16} className={iconClass} fill={variant === "like" ? (active ? "currentColor" : "none") : "none"} />
      <span className={active ? "" : "text-slate-600"}>{label}</span>
      <span className="text-slate-400 font-black">{count}</span>
    </button>
  );
}

function CommentItem({ comment, onReplyClick, onDelete, isOwnComment, isPostOwner }) {
  const author = comment.author || {};
  const authorName = author.nama_alumni || "Alumni";
  const avatarUrl = author.foto ? getImageUrl(author.foto) : null;

  return (
    <div className="flex items-start gap-3 w-full">
      <Avatar url={avatarUrl} name={authorName} size="w-9 h-9" textSize="text-xs" />
      <div className="flex-1 min-w-0">
        <div className="bg-slate-50 border border-slate-100 rounded-md px-4 py-3 w-full">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-xs font-black text-slate-800 truncate">{authorName}</p>
              {author.jurusan && <span className="text-[10px] text-slate-400 font-medium truncate">{author.jurusan}</span>}
            </div>
            <div className="flex items-center gap-2 flex-none">
              <p className="text-[10px] font-bold text-slate-400">{timeAgo(comment.created_at)}</p>
              {(isOwnComment || isPostOwner) && (
                <button type="button" onClick={onDelete} className="p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer" aria-label="Hapus komentar">
                  <Trash2 size={12} className="text-slate-400 hover:text-red-500" />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-700 mt-1 leading-relaxed break-words">{comment.content}</p>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs font-bold text-slate-400">
          <button type="button" className="hover:text-primary transition-colors cursor-pointer" onClick={onReplyClick}>Reply</button>
          {comment.replies_count > 0 && <span className="text-slate-300">{comment.replies_count} balasan</span>}
        </div>
      </div>
    </div>
  );
}

function AddCommentRow({ avatarUrl, displayName, placeholder = "Tambahkan komentar...", value, onChange, onSubmit, submitting }) {
  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey && value.trim()) { e.preventDefault(); onSubmit(); } };
  return (
    <div className="w-full flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3">
      <Avatar url={avatarUrl} name={displayName} size="w-8 h-8" textSize="text-xs" />
      <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
        <input value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={handleKeyDown}
          placeholder={placeholder} className="w-full text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none bg-transparent" />
        <button type="button" onClick={onSubmit} disabled={!value.trim() || submitting}
          className={`p-1.5 rounded-md transition-colors flex-none ${value.trim() && !submitting ? "hover:bg-primary/10 cursor-pointer" : "cursor-not-allowed"}`}>
          {submitting ? <Loader2 size={16} className="text-slate-400 animate-spin" /> : <Send size={16} className={value.trim() ? "text-primary" : "text-slate-300"} />}
        </button>
      </div>
    </div>
  );
}

function PostImages({ images }) {
  const validImages = Array.isArray(images) ? images : [];
  if (validImages.length === 0) return null;
  
  const count = validImages.length;

  const getSrc = (img) => {
    if (!img) return '';
    const path = typeof img === 'string' ? img : (img.url || img.image_path || img.file_path || img.path || img.image || img.foto);
    return getImageUrl(path);
  };

  if (count === 1) {
    return (
      <div className="mt-4 rounded-md overflow-hidden w-full bg-slate-50 flex justify-center">
        <img src={getSrc(validImages[0])} alt="Postingan" className="w-full max-h-[500px] object-cover" onError={(e) => e.target.style.display = 'none'} />
      </div>
    );
  }

  return (
    <div className={`mt-4 grid gap-1 rounded-md overflow-hidden w-full ${count === 2 ? "grid-cols-2" : count === 3 ? "grid-cols-2" : "grid-cols-2"}`}>
      {validImages.slice(0, 4).map((img, i) => (
        <div key={img.id_post_image || img.id || i} className={`relative ${count === 3 && i === 0 ? "row-span-2" : ""} bg-slate-50`}>
          <img src={getSrc(img)} alt={`Postingan ${i+1}`} className="w-full h-full min-h-[150px] max-h-60 object-cover" onError={(e) => e.target.style.display = 'none'} />
          {i === 3 && count > 4 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-2xl font-black">+{count - 4}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StartPostComposer({ avatarUrl, displayName, onStartPost }) {
  return (
    <div className="w-full rounded-md border border-slate-100 bg-white shadow-sm p-4 sm:p-5 md:p-6">
      <div className="flex items-center gap-3">
        <Avatar url={avatarUrl} name={displayName} size="w-12 h-12" />
        <button type="button" onClick={onStartPost}
          className="flex-1 h-12 rounded-full border border-slate-200 bg-white px-5 text-left text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer w-full">
          Mulai postingan...
        </button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 w-full">
        {[{ icon: Video, label: "Video" }, { icon: ImageIcon, label: "Foto" }, { icon: FileText, label: "Tulis artikel" }].map(({ icon: Icon, label }) => (
          <button key={label} type="button" onClick={onStartPost}
            className="h-10 rounded-md hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-600">
            <Icon size={18} className="text-slate-500" fill="none" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PostMenuDropdown({ isOwnPost, onDelete, onReport }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="p-1.5 rounded-md hover:bg-slate-50 transition-colors cursor-pointer">
        <MoreHorizontal size={16} className="text-slate-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-48 bg-white rounded-md shadow-lg border border-slate-100 py-1">
            {isOwnPost ? (
              <button type="button" onClick={() => { setOpen(false); onDelete(); }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer">
                <Trash2 size={14} /> Hapus Postingan
              </button>
            ) : (
              <button type="button" onClick={() => { setOpen(false); onReport(); }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                <Flag size={14} /> Laporkan
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// --- KOMPONEN UTAMA ---
export default function MiniMedsosBeranda() {
  const { user } = useAuth();
  const medsos = useMiniMedsos();
  const myProfile = user?.profile;
  const myName = myProfile?.nama || user?.nama_alumni || "Alumni";
  const myAvatarUrl = myProfile?.foto_thumbnail ? getImageUrl(myProfile.foto_thumbnail) : myProfile?.foto ? getImageUrl(myProfile.foto) : null;
  const myAlumniId = myProfile?.id_alumni || user?.id_alumni;

  const [openCommentsById, setOpenCommentsById] = useState({});
  const [commentDraftByPostId, setCommentDraftByPostId] = useState({});
  const [replyTargetByPostId, setReplyTargetByPostId] = useState({});
  
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [postSortMode, setPostSortMode] = useState("terbaru");
  
  const [postModalOpen, setPostModalOpen] = useState(false);

  const sortOptions = [
    { value: 'terbaru', label: 'Terbaru' },
    { value: 'popular', label: 'Terpopuler' }
  ];

  useEffect(() => { medsos.fetchFeed(); }, []);

  const toggleComments = useCallback((postId) => {
    setOpenCommentsById((prev) => {
      const isOpen = !prev[postId];
      if (isOpen && !medsos.commentsByPost[postId]) medsos.fetchComments(postId);
      return { ...prev, [postId]: isOpen };
    });
  }, [medsos]);

  const handleAddComment = useCallback(async (postId) => {
    const content = (commentDraftByPostId[postId] || "").trim();
    if (!content) return;
    const parentId = replyTargetByPostId[postId] || null;
    try {
      await medsos.addComment(postId, content, parentId);
      setCommentDraftByPostId((prev) => ({ ...prev, [postId]: "" }));
      setReplyTargetByPostId((prev) => ({ ...prev, [postId]: null }));
      if (parentId) medsos.fetchComments(postId); 
    } catch {}
  }, [commentDraftByPostId, replyTargetByPostId, medsos]);

  const handleSubmitPost = useCallback(async (content, visibility, images) => {
    await medsos.createPost(content, visibility, images);
  }, [medsos]);

  const handleDeletePost = useCallback(async (postId) => {
    if (!window.confirm("Hapus postingan ini?")) return;
    try { await medsos.deletePost(postId); } catch {}
  }, [medsos]);

  const handleReport = useCallback(async (postId) => {
    const reason = window.prompt("Alasan laporan (spam, harassment, inappropriate, misinformation, other):");
    if (!reason) return;
    try { await medsos.reportPost(postId, reason); alert("Postingan berhasil dilaporkan."); } catch {}
  }, [medsos]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setAppliedSearch(postSearchQuery);
  };

  const visiblePosts = useMemo(() => {
    const query = (appliedSearch || "").trim().toLowerCase();
    let filtered = medsos.posts;
    if (query) {
      filtered = filtered.filter((p) => {
        const authorName = (p.author?.nama_alumni || "").toLowerCase();
        const content = (p.content || "").toLowerCase();
        return authorName.includes(query) || content.includes(query);
      });
    }
    if (postSortMode === "popular") {
      return [...filtered].sort((a, b) => ((b.likes_count || 0) + (b.comments_count || 0)) - ((a.likes_count || 0) + (a.comments_count || 0)));
    }
    return filtered; 
  }, [appliedSearch, postSortMode, medsos.posts]);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 px-2 sm:px-0 lg:px-4">
      
      <section className="relative z-40 max-w-7xl mx-auto px-6 lg:px-12 -mt-10 mb-8 w-full">
        <div className="bg-white p-4 md:p-6 rounded-md shadow-xl border border-slate-100 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <form
              onSubmit={handleSearch}
              className="flex h-[47px] w-full lg:flex-1 border-2 border-gray-100 rounded-xl bg-white overflow-hidden transition-all focus-within:border-gray-200"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3 text-gray-400" size={18} />
                <input
                  type="text"
                  value={postSearchQuery}
                  onChange={(e) => setPostSearchQuery(e.target.value)}
                  placeholder="Cari postingan atau nama alumni..."
                  className="w-full h-full pl-10 pr-4 bg-transparent text-sm text-slate-700 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white px-6 md:px-8 h-full font-bold text-sm hover:bg-[#2e4042] transition-colors cursor-pointer border-l-2 border-gray-100"
              >
                Cari
              </button>
            </form>

            <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto shrink-0">
              <div className="w-full lg:w-48 relative z-50">
                <SmoothDropdown 
                  options={sortOptions.map(opt => opt.label)} 
                  value={sortOptions.find(opt => opt.value === postSortMode)?.label || "Terbaru"} 
                  onSelect={(label) => {
                    const selected = sortOptions.find(opt => opt.label === label);
                    if(selected) setPostSortMode(selected.value);
                  }} 
                  placeholder="Urutkan Berdasarkan" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-20 flex flex-col pb-12 gap-6">
        <StartPostComposer avatarUrl={myAvatarUrl} displayName={myName} onStartPost={() => setPostModalOpen(true)} />

        {medsos.loading && (
          <div className="w-full flex items-center justify-center py-16">
            <Loader2 size={32} className="text-primary animate-spin" />
          </div>
        )}

        {medsos.error && !medsos.loading && (
          <div className="w-full text-center py-8">
            <p className="text-red-500 text-sm font-medium">{medsos.error}</p>
            <button type="button" onClick={() => medsos.fetchFeed()} className="mt-2 text-sm font-bold text-primary hover:underline cursor-pointer">Coba lagi</button>
          </div>
        )}

        {!medsos.loading && !medsos.error && visiblePosts.length === 0 && (
          <div className="w-full text-center py-12 bg-white rounded-md border border-slate-100 shadow-sm">
            <FileText size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 text-sm font-medium">Pencarian tidak ditemukan atau belum ada postingan.</p>
          </div>
        )}

        <div className="w-full flex flex-col gap-6">
          {visiblePosts.map((post) => {
            const postId = post.id_post ?? post.id;
            const author = post.author || {};
            const authorName = author.nama_alumni || "Alumni";
            const authorAvatar = author.foto ? getImageUrl(author.foto) : null;
            const isOwnPost = Boolean(post.is_own_post) || (myAlumniId && author.id_alumni === myAlumniId);
            const comments = medsos.commentsByPost[postId] || [];
            const isCommentsOpen = !!openCommentsById[postId];
            const isCommentsLoading = !!medsos.commentsLoading[postId];

            return (
              <article key={postId} className="w-full rounded-md border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="p-5 md:p-6 w-full">
                  <header className="flex items-start justify-between gap-4 w-full">
                    <div className="flex items-start gap-3 min-w-0">
                      <Avatar url={authorAvatar} name={authorName} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-black text-slate-800 truncate">{authorName}</h3>
                          {post.visibility === "connections" && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">Koneksi</span>
                          )}
                          {post.visibility === "public" && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">Publik</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{author.jurusan || ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-none">
                      <span className="text-[11px] text-slate-400 font-bold">{timeAgo(post.created_at)}</span>
                      <PostMenuDropdown isOwnPost={isOwnPost} onDelete={() => handleDeletePost(postId)} onReport={() => handleReport(postId)} />
                    </div>
                  </header>

                  <div className="mt-4 w-full">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words w-full">{post.content}</p>
                  </div>

                  <PostImages images={post.images || post.post_images || post.media} />

                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2 w-full">
                    <StatButton icon={Heart} label="Suka" count={post.likes_count ?? 0} active={Boolean(post.is_liked)} onClick={() => medsos.toggleLike(postId)} variant="like" />
                    <StatButton icon={MessageCircle} label="Komentar" count={post.comments_count ?? 0} active={isCommentsOpen} onClick={() => toggleComments(postId)} />
                  </div>

                  {isCommentsOpen && (
                    <div className="mt-5 space-y-4 w-full">
                      <AddCommentRow avatarUrl={myAvatarUrl} displayName={myName}
                        placeholder={replyTargetByPostId[postId] ? "Balas komentar..." : "Tambahkan komentar..."}
                        value={commentDraftByPostId[postId] ?? ""}
                        onChange={(val) => setCommentDraftByPostId((prev) => ({ ...prev, [postId]: val }))}
                        onSubmit={() => handleAddComment(postId)}
                        submitting={!!medsos.actionLoading[`comment-${postId}`]} />

                      {replyTargetByPostId[postId] && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 px-2 mt-2">
                          <span className="font-bold">Membalas komentar</span>
                          <button type="button" onClick={() => setReplyTargetByPostId((prev) => ({ ...prev, [postId]: null }))}
                            className="text-red-400 hover:text-red-600 cursor-pointer bg-red-50 p-1 rounded-md"><X size={12} /></button>
                        </div>
                      )}

                      {isCommentsLoading ? (
                        <div className="flex justify-center py-4 w-full"><Loader2 size={20} className="text-slate-400 animate-spin" /></div>
                      ) : (
                        <div className="space-y-4 mt-4 w-full">
                          {comments.map((c) => {
                            const commentId = c.id_comment ?? c.id;
                            const isOwnComment = c.is_own_comment || (myAlumniId && c.author?.id_alumni === myAlumniId);
                            return (
                              <CommentItem key={commentId} comment={c}
                                isOwnComment={isOwnComment} isPostOwner={isOwnPost}
                                onReplyClick={() => { setReplyTargetByPostId((prev) => ({ ...prev, [postId]: commentId })); }}
                                onDelete={() => { if (window.confirm("Hapus komentar ini?")) medsos.deleteComment(postId, commentId); }} />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {medsos.pagination.currentPage < medsos.pagination.lastPage && (
          <div className="flex justify-center pt-8 w-full">
            <button type="button" onClick={() => medsos.loadMorePosts()} disabled={medsos.loadingMore}
              className="h-11 px-8 rounded-md text-sm font-bold text-white bg-primary hover:bg-[#2e4042] transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm">
              {medsos.loadingMore && <Loader2 size={16} className="animate-spin" />}
              {medsos.loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
            </button>
          </div>
        )}
      </main>

      <StartPostModal open={postModalOpen} avatarUrl={myAvatarUrl} displayName={myName} onClose={() => setPostModalOpen(false)} onSubmit={handleSubmitPost} submitting={medsos.submitting} />
    </div>
  );
}