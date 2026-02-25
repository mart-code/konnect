import { Phone, PhoneOff, Video } from "lucide-react";
import { useAppStore } from "../../store";
import { getColor } from "../../lib/utils";

/**
 * CallOverlay — Floating UI for incoming calls
 *
 * Relationships:
 *   - Rendered when incomingCall state is present in Zustand
 *   - Notifies users regardless of which page they are on
 */
const CallOverlay = ({ onAccept, onReject }) => {
  const { incomingCall } = useAppStore();

  if (!incomingCall) return null;

  const { from } = incomingCall;
  const displayName = from.firstName
    ? `${from.firstName} ${from.lastName || ""}`
    : from.email;
  const initials = from.firstName
    ? `${from.firstName[0]}${from.lastName?.[0] || ""}`.toUpperCase()
    : from.email[0].toUpperCase();

  return (
    <div className="fixed top-8 right-8 z-[100] animate-in slide-in-from-right duration-500">
      <div className="bg-[#1e1f2e] border border-white/10 rounded-3xl p-6 shadow-2xl w-80 backdrop-blur-xl bg-opacity-90">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${getColor(from.color)} ring-4 ring-white/5`}>
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-2 rounded-full border-4 border-[#1e1f2e] animate-bounce">
              <Video size={16} className="text-white" />
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg">{displayName}</h3>
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold mt-1">
              Incoming Video Call...
            </p>
          </div>

          <div className="flex items-center gap-3 w-full mt-2">
            <button
              onClick={onReject}
              className="flex-1 flex flex-col items-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-2xl transition-all group"
            >
              <div className="p-3 bg-rose-500 rounded-full text-white shadow-lg group-active:scale-95 transition-transform">
                <PhoneOff size={20} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-tighter">Decline</span>
            </button>

            <button
              onClick={onAccept}
              className="flex-1 flex flex-col items-center gap-2 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-2xl transition-all group"
            >
              <div className="p-3 bg-emerald-500 rounded-full text-white shadow-lg animate-pulse group-active:scale-95 transition-transform">
                <Phone size={20} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-tighter">Accept</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vibration/Sound hidden component could go here */}
      <audio autoPlay loop src="/notification.mp3" className="hidden" />
    </div>
  );
};

export default CallOverlay;
