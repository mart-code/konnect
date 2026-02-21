import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { HOST } from "../utils/constants";
import { useAppStore } from "../store";
import { toast } from "sonner";

const SocketContext = createContext(null);

/**
 * SocketProvider — creates a socket.io-client connection and registers
 * global server-to-client event listeners.
 *
 * How it works:
 * 1. When a logged-in user mounts this provider, we create a socket
 *    connection to the backend, passing the userId as a handshake query param.
 *    The server stores this in its userSocketMap for call signaling.
 *
 * 2. We register listeners:
 *    - "receiveMessage": new chat message → update Zustand store
 *    - "incomingCall":   WebRTC call offer → update Zustand call slice
 *    - "callAccepted":   remote answer → stored in a ref for the call modal
 *    - "iceCandidate":   ICE candidate → stored in a ref for the call modal
 *    - "callEnded":      peer hung up → clear active call in Zustand
 *
 * 3. The socket instance is exposed via useSocket() so child components
 *    can emit events (e.g., joinRoom, sendMessage, callUser).
 */
export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const {
    userInfo,
    selectedContact,
    addDmMessage,
    addGroupMessage,
    setIncomingCall,
    clearActiveCall,
    triggerContactsRefetch,
  } = useAppStore();

  useEffect(() => {
    if (!userInfo) return;

    // Create socket connection — userId sent as query param so the server
    // can map it to socket.id for direct call signaling
    const socket = io(HOST, {
      withCredentials: true,
      query: { userId: userInfo.id },
    });

    socketRef.current = socket;

    // ─── INCOMING MESSAGE ───────────────────────────────────────────
    socket.on("receiveMessage", (message) => {
      if (message.groupId) {
        addGroupMessage(message.groupId, message);
      } else {
        // Handle both sender/receiver perspectives for DMs
        const contactId = message.sender === userInfo.id ? message.receiver : message.sender;
        addDmMessage(contactId, message);
      }
    });

    // --- WebRTC Signaling Listeners ---

    // ─── INCOMING CALL ──────────────────────────────────────────────
    socket.on("incomingCall", ({ from, offer }) => {
      setIncomingCall({ from, offer });
    });

    // ─── CALL ACCEPTED ──────────────────────────────────────────────
    socket.on("callAccepted", ({ answer }) => {
      // We don't update Zustand here, the CallModal listens to the socket directly
      // for "callAccepted" but we keep this for consistency if needed later.
    });

    // ─── ICE CANDIDATE ──────────────────────────────────────────────
    socket.on("iceCandidate", ({ candidate }) => {
      // Handled directly inside CallModal
    });

    // ─── CALL ENDED ─────────────────────────────────────────────────
    socket.on("callEnded", () => {
      useAppStore.getState().clearActiveCall();
      useAppStore.getState().clearIncomingCall();
    });

    // ─── FRIEND REQUESTS ────────────────────────────────────────────
    socket.on("newFriendRequest", (request) => {
      toast.info(`New friend request from ${request.sender.firstName || request.sender.email}`, {
        description: "Check your contacts to accept.",
        duration: 5000,
      });
      triggerContactsRefetch();
    });

    socket.on("friendRequestAccepted", ({ friendName }) => {
      toast.success(`${friendName} accepted your friend request!`, {
        duration: 5000,
      });
      triggerContactsRefetch();
    });

    return () => {
      socket.disconnect();
    };
  }, [userInfo?.id]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * useSocket — returns the socket ref.
 * Usage: const socketRef = useSocket(); then socketRef.current.emit(...)
 * We expose a ref (not the raw socket) so the reference is stable across renders.
 */
export const useSocket = () => useContext(SocketContext);
