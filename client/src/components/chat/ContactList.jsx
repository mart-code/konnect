import { useState, useEffect } from "react";
import { useAppStore } from "../../store";
import { apiClient } from "../../lib/api-client";
import { Search, UserPlus, Users, Loader2, Check, X, Bell } from "lucide-react";
import { getColor } from "../../lib/utils";
import { toast } from "sonner";
import { 
  GET_FRIENDS, 
  SEARCH_CONTACTS, 
  SEND_FRIEND_REQUEST, 
  GET_PENDING_REQUESTS, 
  ACCEPT_FRIEND_REQUEST 
} from "../../utils/constants";

/**
 * ContactList — Sidebar component for chat, listing friends and search results
 *
 * Relationships:
 *   - Fetches users on mount
 *   - On selection, updates selectedContact in Zustand
 */
const ContactList = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const { setSelectedContact, selectedContact, userInfo, contactsRefetch } = useAppStore();

  const fetchContacts = async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        apiClient.get(GET_FRIENDS, { withCredentials: true }),
        apiClient.get(GET_PENDING_REQUESTS, { withCredentials: true }),
      ]);
      if (friendsRes.status === 200) setFriends(friendsRes.data);
      if (requestsRes.status === 200) setRequests(requestsRes.data);
    } catch (error) {
      toast.error("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [contactsRefetch]);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const response = await apiClient.get(
          `${SEARCH_CONTACTS}?q=${searchQuery}`,
          { withCredentials: true }
        );
        if (response.status === 200) {
          setSearchResults(response.data);
        }
      } catch (error) {
        // Silent fail for search
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(search, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (contact) => {
    setSelectedContact(contact);
  };

  const handleSendRequest = async (userId) => {
    try {
      const response = await apiClient.post(
        SEND_FRIEND_REQUEST,
        { receiverId: userId },
        { withCredentials: true }
      );
      if (response.status === 201) {
        toast.success("Friend request sent");
        setSearchQuery("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await apiClient.post(
        ACCEPT_FRIEND_REQUEST(requestId),
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success("Friend request accepted");
        fetchContacts();
      }
    } catch (error) {
      toast.error("Failed to accept request");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-white/5" />
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
      {/* Search Input */}
      <div className="px-4 py-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-500 transition-colors" size={14} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/5 focus:border-violet-500/30 text-xs text-white rounded-xl pl-9 pr-4 py-3 outline-none transition-all placeholder:text-white/20"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="animate-spin text-violet-500" size={12} />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {searchQuery.length >= 2 ? (
          /* Search Results */
          <div className="space-y-1">
            <p className="px-3 py-2 text-[10px] text-white/30 uppercase tracking-widest font-bold">
              Search Results
            </p>
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user._id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${getColor(user.color)}`}>
                    {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold truncate text-white">
                      {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.email}
                    </p>
                  </div>
                  {friends.some(f => f._id === user._id) ? (
                    <button onClick={() => { handleSelect(user); setSearchQuery(""); }} className="p-2 text-violet-500 hover:bg-violet-500/10 rounded-lg">
                      <Check size={16} />
                    </button>
                  ) : user._id !== userInfo.id && (
                    <button
                      onClick={() => handleSendRequest(user._id)}
                      className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all"
                      title="Send Friend Request"
                    >
                      <UserPlus size={16} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              !searching && <p className="px-3 py-4 text-xs text-white/20 italic">No users found</p>
            )}
          </div>
        ) : (
          /* Friends List */
          <div className="space-y-1">
            {/* Pending Requests */}
            {requests.length > 0 && (
              <div className="mb-4">
                <p className="px-3 py-2 text-[10px] text-amber-500 uppercase tracking-widest font-bold flex items-center gap-2">
                  <Bell size={10} />
                  Pending Requests ({requests.length})
                </p>
                {requests.map((req) => (
                  <div key={req._id} className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl mb-1 border border-white/5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${getColor(req.sender.color)}`}>
                      {(req.sender.firstName?.[0] || req.sender.email[0]).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-[10px]">
                      <p className="text-white font-semibold truncate">
                        {req.sender.firstName || req.sender.email.split("@")[0]}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleAcceptRequest(req._id)}
                        className="p-1.5 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-all"
                      >
                        <Check size={12} />
                      </button>
                      <button className="p-1.5 bg-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="px-3 py-2 text-[10px] text-white/30 uppercase tracking-widest font-bold">
              Your Friends
            </p>
            {friends.length > 0 ? (
              friends.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelect(user)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    selectedContact?._id === user._id
                      ? "bg-violet-600/20 text-white shadow-lg"
                      : "text-white/60 hover:bg-white/5"
                  }`}
                >
                  <div className="relative">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${getColor(user.color)}`}>
                      {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold truncate capitalize">
                      {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.email}
                    </p>
                    <p className="text-[10px] text-white/30 truncate">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-10 flex flex-col items-center gap-3 text-center opacity-30">
                <Users size={32} />
                <p className="text-xs leading-relaxed">Search for users above to add friends and start chatting.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactList;
