import { useState, useEffect } from "react";
import { apiClient } from "../../lib/api-client";
import { GET_FEED } from "../../utils/constants";
import PostCard from "../../components/feed/PostCard";
import { RefreshCw, Users, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import CreatePostModal from "../../components/feed/CreatePostModal";

/**
 * Home Feed Page — /home
 *
 * Architecture:
 *   - Posts are stored in LOCAL state (not Zustand) because feed data is
 *     page-scoped — no other page needs to read it.
 *   - When the "Create Post" modal (from SideNav) emits onPostCreated,
 *     AppLayout passes the new post UP. But CreatePostModal inside THIS page
 *     calls addPost directly.
 *   - Re-fetch is triggered manually via the refresh button or by postVersion state.
 *
 * Optimistic update:
 *   - When CreatePostModal calls addPost(draftPost), we prepend the draft to `posts`
 *   - If rollback(tempId) is called (API failed), we filter out by _id
 */
const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(GET_FEED, { withCredentials: true });
      setPosts(res.data);
    } catch (err) {
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  // Called by CreatePostModal for optimistic prepend or rollback
  const handlePostCreated = (draftPost, rollbackId) => {
    if (rollbackId) {
      // Roll back the optimistic post
      setPosts((prev) => prev.filter((p) => p._id !== rollbackId));
    } else if (draftPost) {
      setPosts((prev) => [draftPost, ...prev]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Home Feed</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFeed}
            title="Refresh feed"
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <PlusCircle size={16} />
            New Post
          </button>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1e1f2e] rounded-2xl p-5 border border-white/5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <div className="h-3 w-28 bg-white/10 rounded" />
                  <div className="h-2 w-16 bg-white/5 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="h-3 bg-white/10 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users size={48} className="text-white/20 mb-4" />
          <p className="text-white/50 text-lg font-medium">Your feed is empty</p>
          <p className="text-white/30 text-sm mt-1">
            Add friends and follow their posts to see them here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {/* Page-level Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={(draft, rollbackId) => {
            setShowCreateModal(false);
            handlePostCreated(draft, rollbackId);
          }}
        />
      )}
    </div>
  );
};

export default Home;
