import { useState } from "react";
import { X, Users, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { getColor } from "../../lib/utils";
import { useQuery, useMutation } from "@apollo/client";
import { GET_FRIENDS_QUERY, ADD_MEMBERS_TO_GROUP_MUTATION, GET_GROUPS_QUERY } from "../../graphql/queries";

const AddMembersModal = ({ group, onClose, onSuccess }) => {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const existingMemberIds = group.members.map(m => m.id);

  const { data, loading: fetchingFriends } = useQuery(GET_FRIENDS_QUERY, {
    onError: () => {
      toast.error("Failed to load friends list");
    }
  });

  const friends = data?.getFriends || [];
  const availableFriends = friends.filter(friend => !existingMemberIds.includes(friend.id));

  const [addMembers, { loading }] = useMutation(ADD_MEMBERS_TO_GROUP_MUTATION, {
    onCompleted: () => {
      toast.success("Members added successfully");
      onSuccess();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add members");
    },
    refetchQueries: [{ query: GET_GROUPS_QUERY }],
  });

  const toggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFriends.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    await addMembers({ 
      variables: { 
        groupId: group.id, 
        members: selectedFriends 
      } 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e1f2e] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Users size={18} className="text-violet-500" />
            Add Members to {group.name}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] text-white/30 uppercase font-bold tracking-widest mb-2">
              Select New Members ({selectedFriends.length})
            </label>
            <div className="bg-white/5 rounded-xl border border-white/5 max-h-64 overflow-y-auto p-1 space-y-1">
              {fetchingFriends ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="animate-spin text-white/10" size={20} />
                </div>
              ) : availableFriends.length > 0 ? (
                availableFriends.map((friend) => (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => toggleFriend(friend.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      selectedFriends.includes(friend.id)
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
                    {selectedFriends.includes(friend.id) && (
                      <Check size={14} className="text-violet-500" />
                    )}
                  </button>
                ))
              ) : (
                <p className="py-8 text-center text-xs text-white/20 italic">No more friends to add</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={selectedFriends.length === 0 || loading}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition-all shadow-lg mt-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Add Members"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMembersModal;
