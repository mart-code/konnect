import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { apiClient } from "../../lib/api-client";
import { CREATE_POST } from "../../utils/constants";
import { useAppStore } from "../../store";
import { toast } from "sonner";
import { getColor } from "../../lib/utils";

/**
 * CreatePostModal — controlled modal for creating a new post.
 *
 * Props:
 *   - onClose: ()=>void — called when modal should close
 *   - onPostCreated: (post)=>void — called after optimistic update so parent
 *     can prepend the new post to its local feed state
 *
 * Optimistic update flow:
 *   1. User clicks submit
 *   2. We immediately build a "draft" post using the current userInfo from Zustand
 *      and call onPostCreated(draftPost) — the UI updates INSTANTLY
 *   3. We then fire the API call in the background
 *   4. If the API succeeds, the server returns the real post (with a real _id).
 *      We could replace the draft, but since the _id isn't displayed we skip that.
 *   5. If the API fails, we call onPostCreated(null, draftId) to roll back,
 *      and show a toast error.
 *
 * Relationships:
 *   - Rendered by AppLayout.jsx (so it can overlay any page)
 *   - Notifies pages/home/index.jsx via onPostCreated callback
 */
const CreatePostModal = ({ onClose, onPostCreated }) => {
  const { userInfo } = useAppStore();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const displayName = userInfo?.firstName
    ? `${userInfo.firstName} ${userInfo.lastName || ""}`.trim()
    : userInfo?.email || "You";

  const initials = userInfo?.firstName
    ? `${userInfo.firstName[0]}${userInfo.lastName?.[0] || ""}`.toUpperCase()
    : userInfo?.email?.[0]?.toUpperCase() || "?";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Post cannot be empty");
      return;
    }

    const tempId = `temp-${Date.now()}`;

    // Step 1: Optimistic update
    const draftPost = {
      _id: tempId,
      author: {
        _id: userInfo.id,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        image: userInfo.image,
        color: userInfo.color,
        email: userInfo.email,
      },
      content: content.trim(),
      likes: [],
      createdAt: new Date().toISOString(),
    };
    onPostCreated?.(draftPost);
    onClose();

    // Step 2: Background API call
    setLoading(true);
    try {
      await apiClient.post(CREATE_POST, { content: content.trim() }, { withCredentials: true });
    } catch (err) {
      // Step 3: Rollback on error
      onPostCreated?.(null, tempId);
      toast.error(err.response?.data?.message || "Failed to post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e1f2e] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-white font-semibold">Create Post</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors rounded-lg p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex items-start gap-3 mb-4">
            {userInfo?.image ? (
              <img src={userInfo.image} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${getColor(userInfo?.color)}`}>
                {initials}
              </div>
            )}
            <div className="flex-1">
              <p className="text-white font-semibold text-sm mb-2">{displayName}</p>
              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                className="w-full bg-transparent text-white/80 placeholder-white/30 text-sm resize-none outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className={`text-xs ${content.length > 1800 ? "text-rose-400" : "text-white/30"}`}>
              {content.length}/2000
            </span>
            <button
              type="submit"
              disabled={!content.trim() || loading}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
