import { useEffect, useState } from "react";
import { apiClient } from "../../lib/api-client";
import { GET_MY_GROUPS } from "../../utils/constants";
import { useAppStore } from "../../store";
import { Users, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import CreateGroupModal from "./CreateGroupModal";

/**
 * GroupList — Sidebar for the groups page
 */
const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { setSelectedContact, selectedContact } = useAppStore();

  const fetchGroups = async () => {
    try {
      const response = await apiClient.get(GET_MY_GROUPS, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setGroups(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSelect = (group) => {
    // We treat the group object similarly to a contact object in the store
    // but the store/logic distinguishes them via group._id + (isGroup flag or checks)
    setSelectedContact({ ...group, isGroup: true });
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-white/5" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-2 bg-white/10 rounded w-1/2" />
              <div className="h-2 bg-white/5 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg"
        >
          <Plus size={14} />
          Create New Group
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <p className="px-3 py-2 text-[10px] text-white/30 uppercase tracking-widest font-bold">
          Joined Groups
        </p>
        
        {groups.length > 0 ? (
          groups.map((group) => (
            <button
              key={group._id}
              onClick={() => handleSelect(group)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                selectedContact?._id === group._id
                  ? "bg-violet-600/20 text-white"
                  : "text-white/60 hover:bg-white/5"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600/40 to-indigo-600/40 flex items-center justify-center text-white font-bold text-xs border border-white/5">
                {group.name[0].toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold truncate">{group.name}</p>
                <p className="text-[10px] text-white/30 truncate">
                  {group.members.length} members
                </p>
              </div>
            </button>
          ))
        ) : (
          <div className="px-6 py-12 flex flex-col items-center gap-3 text-center opacity-20">
            <Users size={32} />
            <p className="text-xs">No groups found. Create one to start communicating with teams.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchGroups();
          }}
        />
      )}
    </div>
  );
};

export default GroupList;
