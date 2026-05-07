import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { alumniApi } from '../api/alumni';

// =====================
// HELPERS
// =====================

const getPayload = (response) => response?.data?.data ?? response?.data ?? null;

const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Terjadi kesalahan.';

const getCommentId = (comment) =>
  comment?.id_comment ?? comment?.id_post_comment ?? comment?.comment_id ?? comment?.id_comment_post ?? comment?.id ?? null;

/**
 * Custom hook: useMiniMedsos
 * Manages feed state, CRUD, likes, comments, and real-time updates.
 */
export function useMiniMedsos() {
  // =====================
  // STATE
  // =====================
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  // Comment states per post
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [commentsPagination, setCommentsPagination] = useState({});
  const [repliesByComment, setRepliesByComment] = useState({});
  const [repliesLoading, setRepliesLoading] = useState({});

  // Keep track of action in-progress per post
  const [actionLoading, setActionLoading] = useState({});

  // Real-time listener refs
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // =====================
  // FEED
  // =====================

  /**
   * Fetch the feed (page 1).
   */
  const fetchFeed = useCallback(async (perPage = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await alumniApi.getPostFeed({ per_page: perPage });
      const payload = getPayload(response);
      const items = payload?.data ?? [];
      const meta = payload?.meta ?? payload;

      if (mountedRef.current) {
        setPosts(items);
        setPagination({
          currentPage: Number(meta?.current_page ?? 1),
          lastPage: Number(meta?.last_page ?? 1),
          total: Number(meta?.total ?? items.length),
        });
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(getErrorMessage(err));
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  /**
   * Load more posts (next page).
   */
  const loadMorePosts = useCallback(async (perPage = 10) => {
    if (pagination.currentPage >= pagination.lastPage) return;

    setLoadingMore(true);
    try {
      const nextPage = pagination.currentPage + 1;
      const response = await alumniApi.getPostFeed({ per_page: perPage, page: nextPage });
      const payload = getPayload(response);
      const items = payload?.data ?? [];
      const meta = payload?.meta ?? payload;

      if (mountedRef.current) {
        setPosts((prev) => [...prev, ...items]);
        setPagination({
          currentPage: Number(meta?.current_page ?? nextPage),
          lastPage: Number(meta?.last_page ?? pagination.lastPage),
          total: Number(meta?.total ?? pagination.total),
        });
      }
    } catch (err) {
      if (mountedRef.current) setError(getErrorMessage(err));
    } finally {
      if (mountedRef.current) setLoadingMore(false);
    }
  }, [pagination]);

  // =====================
  // CREATE POST
  // =====================

  const createPost = useCallback(async (content, visibility = 'connections', imageFiles = []) => {
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('visibility', visibility);
      imageFiles.forEach((file) => formData.append('images[]', file));

      const response = await alumniApi.createPost(formData);
      const payload = getPayload(response);
      const newPost = payload?.data ?? payload;

      if (mountedRef.current && newPost) {
        // Prepend to feed
        setPosts((prev) => [newPost, ...prev]);
      }

      return newPost;
    } catch (err) {
      const msg = getErrorMessage(err);
      if (mountedRef.current) setError(msg);
      throw err;
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }, []);

  // =====================
  // DELETE POST
  // =====================

  const deletePost = useCallback(async (postId) => {
    setActionLoading((prev) => ({ ...prev, [postId]: 'deleting' }));
    try {
      await alumniApi.deletePost(postId);
      if (mountedRef.current) {
        setPosts((prev) => prev.filter((p) => (p.id_post ?? p.id) !== postId));
      }
    } catch (err) {
      if (mountedRef.current) setError(getErrorMessage(err));
      throw err;
    } finally {
      if (mountedRef.current) setActionLoading((prev) => ({ ...prev, [postId]: false }));
    }
  }, []);

  // =====================
  // TOGGLE LIKE
  // =====================

  const toggleLike = useCallback(async (postId) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        const id = p.id_post ?? p.id;
        if (id !== postId) return p;
        const wasLiked = Boolean(p.is_liked);
        return {
          ...p,
          is_liked: !wasLiked,
          likes_count: Math.max(0, (p.likes_count ?? 0) + (wasLiked ? -1 : 1)),
        };
      })
    );

    try {
      const response = await alumniApi.togglePostLike(postId);
      const payload = getPayload(response);

      if (mountedRef.current && payload) {
        setPosts((prev) =>
          prev.map((p) => {
            const id = p.id_post ?? p.id;
            if (id !== postId) return p;
            return {
              ...p,
              is_liked: Boolean(payload.liked),
              likes_count: payload.likes_count ?? p.likes_count,
            };
          })
        );
      }
    } catch (err) {
      // Revert optimistic update
      setPosts((prev) =>
        prev.map((p) => {
          const id = p.id_post ?? p.id;
          if (id !== postId) return p;
          const wasLiked = Boolean(p.is_liked);
          return {
            ...p,
            is_liked: !wasLiked,
            likes_count: Math.max(0, (p.likes_count ?? 0) + (wasLiked ? -1 : 1)),
          };
        })
      );
    }
  }, []);

  // =====================
  // COMMENTS
  // =====================

  /**
   * Fetch comments for a post.
   */
  const fetchComments = useCallback(async (postId, perPage = 15) => {
    setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      const response = await alumniApi.getPostComments(postId, { per_page: perPage });
      const payload = getPayload(response);
      const items = payload?.data ?? [];
      const meta = payload?.meta ?? payload;

      if (mountedRef.current) {
        setCommentsByPost((prev) => ({ ...prev, [postId]: items }));
        setCommentsPagination((prev) => ({
          ...prev,
          [postId]: {
            currentPage: Number(meta?.current_page ?? 1),
            lastPage: Number(meta?.last_page ?? 1),
            total: Number(meta?.total ?? items.length),
          },
        }));
      }
    } catch (err) {
      if (mountedRef.current) setError(getErrorMessage(err));
    } finally {
      if (mountedRef.current) setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
    }
  }, []);

  /**
   * Fetch replies for a comment.
   */
  const fetchCommentReplies = useCallback(async (commentId, perPage = 10) => {
    setRepliesLoading((prev) => ({ ...prev, [commentId]: true }));
    try {
      const response = await alumniApi.getCommentReplies(commentId, { per_page: perPage });
      const payload = getPayload(response);
      const items = payload?.data ?? [];

      if (mountedRef.current) {
        setRepliesByComment((prev) => ({ ...prev, [commentId]: items }));
      }
    } catch (err) {
      if (mountedRef.current) setError(getErrorMessage(err));
    } finally {
      if (mountedRef.current) setRepliesLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  }, []);

  /**
   * Add a comment (or reply) to a post.
   */
  const addComment = useCallback(async (postId, content, parentCommentId = null) => {
    setActionLoading((prev) => ({ ...prev, [`comment-${postId}`]: true }));
    try {
      const data = { content };
      if (parentCommentId !== null && parentCommentId !== undefined) data.id_parent_comment = parentCommentId;

      const response = await alumniApi.addPostComment(postId, data);
      const payload = getPayload(response);
      const newComment = payload?.data ?? payload;

      if (mountedRef.current && newComment) {
        if (!parentCommentId) {
          // Top-level comment: prepend
          setCommentsByPost((prev) => ({
            ...prev,
            [postId]: [newComment, ...(prev[postId] || [])],
          }));
          // Update comments_count on post
          setPosts((prev) =>
            prev.map((p) => {
              const id = p.id_post ?? p.id;
              if (id !== postId) return p;
              return { ...p, comments_count: (p.comments_count ?? 0) + 1 };
            })
          );
        } else {
          const parentId = parentCommentId;
          setRepliesByComment((prev) => ({
            ...prev,
            [parentId]: [...(prev[parentId] || []), newComment],
          }));
          setCommentsByPost((prev) => ({
            ...prev,
            [postId]: (prev[postId] || []).map((c) => {
              const id = getCommentId(c);
              if (id !== parentId) return c;
              return { ...c, replies_count: (c.replies_count ?? 0) + 1 };
            }),
          }));
        }
      }

      return newComment;
    } catch (err) {
      if (mountedRef.current) setError(getErrorMessage(err));
      throw err;
    } finally {
      if (mountedRef.current) setActionLoading((prev) => ({ ...prev, [`comment-${postId}`]: false }));
    }
  }, []);

  /**
   * Delete a comment.
   */
  const deleteComment = useCallback(async (postId, commentId) => {
    try {
      await alumniApi.deletePostComment(commentId);

      if (mountedRef.current) {
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).filter((c) => getCommentId(c) !== commentId),
        }));
        setPosts((prev) =>
          prev.map((p) => {
            const id = p.id_post ?? p.id;
            if (id !== postId) return p;
            return { ...p, comments_count: Math.max(0, (p.comments_count ?? 0) - 1) };
          })
        );
      }
    } catch (err) {
      if (mountedRef.current) setError(getErrorMessage(err));
      throw err;
    }
  }, []);

  // =====================
  // REPORT
  // =====================

  const reportPost = useCallback(async (postId, reason, description = null) => {
    try {
      const data = { reason };
      if (description) data.description = description;
      await alumniApi.reportPost(postId, data);
      return true;
    } catch (err) {
      if (mountedRef.current) setError(getErrorMessage(err));
      throw err;
    }
  }, []);

  // =====================
  // REAL-TIME LISTENERS (Reverb via CustomEvent)
  // =====================

  useEffect(() => {
    const handleNewPost = (e) => {
      const data = e.detail;
      const post = data?.post;
      if (!post) return;
      // Prepend if not already in list
      setPosts((prev) => {
        const id = post.id_post ?? post.id;
        const exists = prev.some((p) => (p.id_post ?? p.id) === id);
        if (exists) return prev;
        return [post, ...prev];
      });
    };

    const handleInteraction = (e) => {
      const data = e.detail;
      if (!data) return;
      const postId = data?.data?.post_id;
      if (!postId) return;

      if (data.type === 'liked') {
        setPosts((prev) =>
          prev.map((p) => {
            const id = p.id_post ?? p.id;
            if (id !== postId) return p;
            return { ...p, likes_count: (p.likes_count ?? 0) + 1 };
          })
        );
      } else if (data.type === 'commented') {
        setPosts((prev) =>
          prev.map((p) => {
            const id = p.id_post ?? p.id;
            if (id !== postId) return p;
            return { ...p, comments_count: (p.comments_count ?? 0) + 1 };
          })
        );
      }
    };

    window.addEventListener('reverb:post.created', handleNewPost);
    window.addEventListener('reverb:post.interaction', handleInteraction);
    return () => {
      window.removeEventListener('reverb:post.created', handleNewPost);
      window.removeEventListener('reverb:post.interaction', handleInteraction);
    };
  }, []);

  // =====================
  // RETURN API
  // =====================

  const api = useMemo(() => ({
    // State
    posts,
    loading,
    loadingMore,
    submitting,
    error,
    pagination,
    commentsByPost,
    commentsLoading,
    commentsPagination,
    repliesByComment,
    repliesLoading,
    actionLoading,

    // Actions
    fetchFeed,
    loadMorePosts,
    createPost,
    deletePost,
    toggleLike,
    fetchComments,
    fetchCommentReplies,
    addComment,
    deleteComment,
    reportPost,
    setError,
  }), [
    posts, loading, loadingMore, submitting, error, pagination,
    commentsByPost, commentsLoading, commentsPagination, actionLoading,
    fetchFeed, loadMorePosts, createPost, deletePost, toggleLike,
    fetchComments, addComment, deleteComment, reportPost,
  ]);

  return api;
}
