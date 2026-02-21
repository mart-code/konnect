import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store";
import { apiClient } from "../../lib/api-client";
import { GET_DM_MESSAGES, GET_GROUP_MESSAGES } from "../../utils/constants";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { useSocket } from "../../context/SocketContext";
import { getColor } from "../../lib/utils";
import { Phone, Video, Info, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

/**
 * MessagePanel — The main chat window for the selected contact
 *
 * Architecture:
 *   - Fetches message history on contact change
 *   - Listens for "joinRoom" event via socket
 *   - Subscribes to Zustand "dmMessages" for real-time updates
 *   - Implements auto-scroll to bottom
 */
const MessagePanel = () => {
  const { selectedContact, userInfo, dmMessages, setDmMessages, groupMessages, setGroupMessages, setActiveCall } = useAppStore();
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const socketRef = useSocket();

  const isGroup = selectedContact?.isGroup;
  const messages = isGroup 
    ? (groupMessages[selectedContact?._id] || [])
    : (dmMessages[selectedContact?._id] || []);

  const handleStartCall = () => {
    if (!isGroup && selectedContact) {
      setActiveCall({
        to: selectedContact,
        isCaller: true,
      });
    }
  };

  // 1. Fetch history when contact changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact?._id) return;
      setLoading(true);
      try {
        const endpoint = isGroup 
          ? GET_GROUP_MESSAGES(selectedContact._id)
          : GET_DM_MESSAGES(selectedContact._id);

        const response = await apiClient.get(endpoint, {
          withCredentials: true,
        });
        if (response.status === 200) {
          if (isGroup) {
            setGroupMessages(selectedContact._id, response.data);
          } else {
            setDmMessages(selectedContact._id, response.data);
          }
        }
      } catch (error) {
        toast.error("Failed to load message history");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // 2. Join room for real-time events
    if (socketRef.current && selectedContact?._id) {
      const roomId = isGroup
        ? `group_${selectedContact._id}`
        : `dm_${[userInfo.id, selectedContact._id].sort().join("_")}`;
      socketRef.current.emit("joinRoom", { roomId });
    }
  }, [selectedContact?._id, userInfo.id, setDmMessages, setGroupMessages, socketRef, isGroup]);

  // 3. Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initials = selectedContact?.name
    ? selectedContact.name[0].toUpperCase()
    : selectedContact?.firstName
    ? `${selectedContact.firstName[0]}${selectedContact.lastName?.[0] || ""}`.toUpperCase()
    : selectedContact?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#1a1b26]/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${isGroup ? "rounded-lg" : "rounded-full"} flex items-center justify-center text-sm font-bold ${isGroup ? "bg-indigo-600/50" : getColor(selectedContact.color)} ring-2 ring-white/5`}>
            {initials}
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm capitalize">
              {isGroup ? selectedContact.name : selectedContact.firstName ? `${selectedContact.firstName} ${selectedContact.lastName || ""}` : selectedContact.email}
            </h2>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isGroup ? "bg-indigo-500" : "bg-emerald-500"} animate-pulse`} />
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                {isGroup ? `${selectedContact.members.length} Members` : "Online"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isGroup && (
            <>
              <button className="p-2.5 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Phone size={18} />
              </button>
              <button 
                onClick={handleStartCall}
                className="p-2.5 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all text-violet-500/50 hover:text-violet-500"
              >
                <Video size={18} />
              </button>
            </>
          )}
          {isGroup && (
            <button className="p-2.5 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <Users size={18} />
            </button>
          )}
          <button className="p-2.5 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 scrollbar-hide flex flex-col gap-4 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed"
      >
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-violet-500/20" size={32} />
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg, index) => (
            <MessageBubble
              key={msg._id || index}
              message={msg}
              isSender={msg.sender === userInfo.id || msg.sender?._id === userInfo.id}
            />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center px-8">
            <div className="w-16 h-16 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={24} />
            </div>
            <p className="text-sm italic">This is the beginning of your conversation with {selectedContact.firstName || selectedContact.email}.</p>
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput />
    </div>
  );
};

// Simple icon for empty state
const MessageSquare = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

export default MessagePanel;
