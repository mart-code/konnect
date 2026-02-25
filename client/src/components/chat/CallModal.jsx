import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store";
import { useSocket } from "../../context/SocketContext";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize, Minimize } from "lucide-react";
import { getColor } from "../../lib/utils";

/**
 * CallModal — Handles WebRTC peer-to-peer connection and video streaming
 *
 * Flow:
 * 1. Initialize local stream (camera/mic)
 * 2. If CALLER: create offer → send via socket
 * 3. If CALLEE: wait for offer → create answer → send via socket
 * 4. Exchange ICE candidates
 * 5. Attach remote stream to video element
 */
const CallModal = () => {
  const { activeCall, setActiveCall, setIncomingCall } = useAppStore();
  const socketRef = useSocket();
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    const startCall = async () => {
      try {
        // 1. Get Local Media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // 2. Setup Peer Connection
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnection.current = pc;

        // Add local tracks to PC
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Handle remote stream
        pc.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate && activeCall?.to) {
            socketRef.current.emit("iceCandidate", {
              to: activeCall.to._id,
              candidate: event.candidate,
            });
          }
        };

        // 3. Signaling Flow
        if (activeCall.isCaller) {
          // Caller creates the offer
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current.emit("callUser", {
            to: activeCall.to._id,
            offer,
          });
        } else if (activeCall.offer) {
          // Callee handles the offer and sends answer
          await pc.setRemoteDescription(new RTCSessionDescription(activeCall.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current.emit("answerCall", {
            to: activeCall.to._id,
            answer,
          });
        }

        // 4. Listen for signaling events relay
        socketRef.current.on("callAccepted", async ({ answer }) => {
          if (peerConnection.current) {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        socketRef.current.on("iceCandidate", async ({ candidate }) => {
          if (peerConnection.current) {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        socketRef.current.on("callEnded", () => {
          endCall(false);
        });

      } catch (err) {
        console.error("WebRTC Error:", err);
      }
    };

    startCall();

    return () => {
      socketRef.current.off("callAccepted");
      socketRef.current.off("iceCandidate");
      socketRef.current.off("callEnded");
    };
  }, []);

  const endCall = (emit = true) => {
    if (emit && activeCall?.to) {
      socketRef.current.emit("endCall", { to: activeCall.to._id });
    }
    
    localStream?.getTracks().forEach((track) => track.stop());
    peerConnection.current?.close();
    
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setIncomingCall(null);
  };

  const toggleMute = () => {
    localStream.getAudioTracks()[0].enabled = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    localStream.getVideoTracks()[0].enabled = !isVideoOff;
    setIsVideoOff(!isVideoOff);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-[#13141f] flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5">
        
        {/* Remote Video (Main) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold ${getColor(activeCall?.to?.color)} animate-pulse`}>
                {(activeCall?.to?.firstName?.[0] || activeCall?.to?.email?.[0]).toUpperCase()}
              </div>
              <p className="text-white/40 text-sm font-medium animate-pulse">
                Waiting for {activeCall?.to?.firstName || "contact"} to join...
              </p>
            </div>
          )}
        </div>

        {/* Local Video (PiP) */}
        <div className="absolute top-6 right-6 w-48 aspect-video bg-[#1e1f2e] rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl z-20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-4 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 z-30">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-2xl transition-all ${isMuted ? "bg-rose-500 text-white" : "text-white hover:bg-white/10"}`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-2xl transition-all ${isVideoOff ? "bg-rose-500 text-white" : "text-white hover:bg-white/10"}`}
          >
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <button
            onClick={() => endCall(true)}
            className="p-4 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all shadow-lg active:scale-95"
          >
            <PhoneOff size={24} />
          </button>
        </div>

        {/* Floating Info */}
        <div className="absolute top-8 left-8 flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-white/70 text-xs font-bold uppercase tracking-widest">
            {activeCall?.to?.firstName ? `${activeCall?.to.firstName} ${activeCall?.to.lastName || ""}` : activeCall?.to.email}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
