import { getColor } from "../../lib/utils";
import { HOST } from "../../utils/constants";
import { Heart, MessageCircle } from "lucide-react";

/**
 * PostCard — renders a single post in the feed.
 *
 * Props:
 *   - post: { _id, author: { _id, firstName, lastName, image, color, email }, content, likes, createdAt }
 *
 * Relationships:
 *   - Rendered by pages/home/index.jsx inside the feed list
 *   - Does NOT manage its own data — the parent page handles fetching
 */
const PostCard = ({ post }) => {
  const { author, content, likes = [], createdAt } = post;

  const displayName =
    author?.firstName
      ? `${author.firstName} ${author.lastName || ""}`.trim()
      : author?.email || "Unknown";

  const initials = author?.firstName
    ? `${author.firstName[0]}${author.lastName?.[0] || ""}`.toUpperCase()
    : author?.email?.[0]?.toUpperCase() || "?";

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-[#1e1f2e] rounded-2xl p-5 border border-white/5 hover:border-violet-500/20 transition-all duration-200 shadow-md">
      {/* Author header */}
      <div className="flex items-center gap-3 mb-4">
        {author?.image ? (
          <img
            src={`${HOST}${author.image}`}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${getColor(author?.color)}`}
          >
            {initials}
          </div>
        )}
        <div>
          <p className="text-white font-semibold text-sm">{displayName}</p>
          <p className="text-white/40 text-xs">{timeAgo(createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap mb-4">
        {content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-white/5">
        <button className="flex items-center gap-1.5 text-white/40 hover:text-rose-400 transition-colors text-sm">
          <Heart size={15} />
          <span>{likes.length}</span>
        </button>
        <button className="flex items-center gap-1.5 text-white/40 hover:text-violet-400 transition-colors text-sm">
          <MessageCircle size={15} />
          <span>Comment</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
