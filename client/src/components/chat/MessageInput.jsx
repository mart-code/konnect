import { useState, useRef } from "react";
import { Send, Paperclip, Loader2, Image, FileText, Music, Video, X } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import { useAppStore } from "../../store";
import { apiClient } from "../../lib/api-client";
import { UPLOAD_FILE } from "../../utils/constants";
import { toast } from "sonner";

/**
 * MessageInput — Input field for text and file attachments
 *
 * Relationships:
 *   - Emits "sendMessage" via SocketContext
 *   - Uploads files via POST /api/messages/upload (Multer)
 */
const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const socketRef = useSocket();
  const { selectedContact, userInfo } = useAppStore();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedContact || !socketRef.current) return;

    const isGroup = selectedContact?.isGroup;
    const roomId = isGroup
      ? `group_${selectedContact.id}`
      : `dm_${[userInfo.id, selectedContact.id].sort().join("_")}`;
    
    socketRef.current.emit("sendMessage", {
      roomId,
      message: {
        sender: userInfo.id,
        receiver: isGroup ? null : selectedContact.id,
        groupId: isGroup ? selectedContact.id : null,
        content: message.trim(),
        messageType: "text",
      },
    });

    setMessage("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedContact || !socketRef.current) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post(UPLOAD_FILE, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        const { fileUrl, messageType } = response.data;
        const isGroup = selectedContact?.isGroup;
        const roomId = isGroup
          ? `group_${selectedContact.id}`
          : `dm_${[userInfo.id, selectedContact.id].sort().join("_")}`;

        socketRef.current.emit("sendMessage", {
          roomId,
          message: {
            sender: userInfo.id,
            receiver: isGroup ? null : selectedContact.id,
            groupId: isGroup ? selectedContact.id : null,
            content: "",
            messageType,
            fileUrl,
          },
        });
        toast.success("File sent");
      }
    } catch (error) {
      toast.error("Failed to upload file");
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 bg-[#13141f] border-t border-white/5">
      <form
        onSubmit={handleSendMessage}
        className="max-w-4xl mx-auto flex items-center gap-3 bg-[#1e1f2e] p-2 pr-3 rounded-2xl border border-white/5 focus-within:border-violet-500/50 transition-all shadow-xl"
      >
        <div className="flex items-center">
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-3 text-white/30 hover:text-violet-500 hover:bg-violet-600/10 rounded-xl transition-all disabled:opacity-50"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
          </button>
        </div>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-white text-sm py-3 outline-none placeholder:text-white/20"
        />

        <button
          type="submit"
          disabled={!message.trim() || uploading}
          className="p-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:bg-white/5 text-white rounded-xl transition-all shadow-lg"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
