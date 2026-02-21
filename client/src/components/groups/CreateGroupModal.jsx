import { useState, useEffect } from "react";
import { X, Users, Loader2, Check } from "lucide-react";
import { apiClient } from "../../lib/api-client";
import { CREATE_GROUP, GET_FRIENDS } from "../../utils/constants";
import { toast } from "sonner";
import { getColor } from "../../lib/utils";

/**
 * CreateGroupModal — Modal to create a new group with selected friends
 */
const CreateGroupModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingFriends, setFetchingFriends] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await apiClient.get(GET_FRIENDS, {
          withCredentials: true,
        });
        if (response.status === 200) {
          setFriends(response.data);
        }
      } catch (error) {
        toast.error("Failed to load friends list");
      } finally {
        setFetchingFriends(false);
      }
    };
    fetchFriends();
  }, []);

  const toggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (selectedFriends.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(
        CREATE_GROUP,
        { name: name.trim(), memberIds: selectedFriends },
        { withCredentials: true }
      );
      if (response.status === 201) {
        toast.success("Group created successfully");
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e1f2e] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Users size={18} className="text-violet-500" />
            Create Group
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] text-white/30 uppercase font-bold tracking-widest mb-2">
              Group Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Team"
              className="w-full bg-white/5 border border-white/5 focus:border-violet-500/30 text-sm text-white rounded-xl px-4 py-3 outline-none transition-all placeholder:text-white/10"
            />
          </div>

          <div>
            <label className="block text-[10px] text-white/30 uppercase font-bold tracking-widest mb-2">
              Select Members ({selectedFriends.length})
            </label>
            <div className="bg-white/5 rounded-xl border border-white/5 max-h-48 overflow-y-auto p-1 space-y-1">
              {fetchingFriends ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="animate-spin text-white/10" size={20} />
                </div>
              ) : friends.length > 0 ? (
                friends.map((friend) => (
                  <button
                    key={friend._id}
                    type="button"
                    onClick={() => toggleFriend(friend._id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      selectedFriends.includes(friend._id)
                        ? "bg-violet-600/20 text-white"
                        : "text-white/40 hover:bg-white/5 hover:text-white/60"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${getColor(friend.color)}`}>
                      {(friend.firstName?.[0] || friend.email[0]).toUpperCase()}
                    </div>
                    <p className="flex-1 text-left text-xs truncate">
                      {friend.firstName ? `${friend.firstName} ${friend.lastName || ""}` : friend.email}
                    </p>
                    {selectedFriends.includes(friend._id) && (
                      <Check size={14} className="text-violet-500" />
                    )}
                  </button>
                ))
              ) : (
                <p className="py-8 text-center text-xs text-white/20 italic">No friends available</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || selectedFriends.length === 0 || loading}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition-all shadow-lg mt-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Create Group"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
