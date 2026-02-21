import { useNavigate, useLocation, NavLink, Outlet } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Users,
  CheckSquare,
  LogOut,
  PlusCircle,
  Settings,
} from "lucide-react";
import { useAppStore } from "../../store";
import { getColor } from "../../lib/utils";
import { useState } from "react";
import CreatePostModal from "../feed/CreatePostModal";
import CallOverlay from "../chat/CallOverlay";
import CallModal from "../chat/CallModal";
import { apiClient } from "../../lib/api-client";
import { LOGOUT_ROUTE } from "../../utils/constants";
import { toast } from "sonner";

/**
 * SideNav — persistent left sidebar shown on all authenticated app pages.
 */
const navItems = [
  { to: "/home", icon: Home, label: "Home", color: "from-blue-500 to-cyan-500" },
  { to: "/chat", icon: MessageSquare, label: "Chat", color: "from-violet-500 to-purple-500" },
  { to: "/groups", icon: Users, label: "Groups", color: "from-emerald-500 to-teal-500" },
  { to: "/tasks", icon: CheckSquare, label: "Tasks", color: "from-amber-500 to-orange-500" },
];

const SideNav = ({ onCreatePost }) => {
  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await apiClient.post(LOGOUT_ROUTE, {}, { withCredentials: true });
      if (response.status === 200) {
        setUserInfo(undefined);
        toast.success("Logged out successfully");
        navigate("/auth");
      }
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };

  const initials = userInfo?.firstName
    ? `${userInfo.firstName[0]}${userInfo.lastName?.[0] || ""}`.toUpperCase()
    : userInfo?.email?.[0]?.toUpperCase() || "?";

  return (
    <aside className="fixed left-0 top-0 h-full w-16 md:w-20 bg-[#16161e] border-r border-white/[0.03] flex flex-col items-center py-6 gap-2 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
      {/* Logo */}
      <div
        className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl cursor-pointer mb-6 shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-90 transition-transform"
        onClick={() => navigate("/home")}
        title="Konnect"
      >
        K
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col items-center gap-2 flex-1 w-full px-2">
        {navItems.map(({ to, icon: Icon, label, color }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              `w-full flex items-center justify-center p-3.5 rounded-2xl transition-all duration-300 group relative ${
                isActive
                  ? `bg-gradient-to-br ${color} text-white shadow-lg active`
                  : "text-white/20 hover:bg-white/[0.03] hover:text-white/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="relative z-10"
                />

                {/* Active Highlight Glow */}
                <div
                  className={`absolute inset-0 rounded-2xl blur-md bg-white transition-opacity duration-300 ${
                    isActive ? "opacity-20" : "opacity-0"
                  }`}
                />

                {/* Tooltip */}
                <span className="absolute left-full ml-4 px-3 py-1.5 bg-[#1a1b26] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl border border-white/5 invisible md:visible">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}


        {/* Create Post FAB */}
        <button
          onClick={onCreatePost}
          title="Create Post"
          className="w-full flex items-center justify-center p-3.5 rounded-2xl text-white/20 hover:bg-violet-600/10 hover:text-violet-400 transition-all duration-300 group relative mt-4 border border-dashed border-white/10"
        >
          <PlusCircle size={22} />
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-[#1a1b26] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl border border-white/5 invisible md:visible">
            Create Post
          </span>
        </button>
      </nav>

      {/* Footer Actions */}
      <div className="mt-auto flex flex-col items-center gap-4 w-full px-2">
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-full flex items-center justify-center p-3.5 rounded-2xl text-white/20 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 group relative"
        >
          <LogOut size={20} />
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-[#1a1b26] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl border border-white/5 invisible md:visible">
            Logout
          </span>
        </button>

        <button
          onClick={() => navigate("/profile")}
          title="Profile"
          className="group relative mb-2"
        >
          {userInfo?.image ? (
            <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500">
               <img
                src={userInfo.image}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-[#16161e] group-hover:opacity-80 transition-all"
              />
            </div>
           
          ) : (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ${getColor(userInfo?.color)} ring-2 ring-[#16161e] shadow-lg group-hover:rotate-12 transition-transform`}
            >
              {initials}
            </div>
          )}
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-[#1a1b26] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl border border-white/5 invisible md:visible">
            Profile
          </span>
        </button>
      </div>
    </aside>
  );
};


/**
 * AppLayout — the shell that wraps all authenticated pages.
 *
 * Structure:
 *   <AppLayout>
 *     <SideNav>  ← fixed left sidebar
 *     <main>     ← <Outlet /> renders the current page (Home, Chat, Tasks, Groups)
 *
 * The "Create Post" modal state lives here (not in SideNav) because:
 *   - The modal is rendered at the layout level so it overlays any child page
 *   - SideNav receives onCreatePost as a prop to trigger it
 *   - CreatePostModal receives an onPostCreated callback, but the actual feed
 *     update happens in the Home page via a re-render trigger (postCreatedAt)
 */
const AppLayout = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { incomingCall, setIncomingCall, setActiveCall, activeCall } = useAppStore();

  const handleAcceptCall = () => {
    setActiveCall({
      to: incomingCall.from,
      isCaller: false,
      offer: incomingCall.offer,
    });
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    // In a real app, you'd emit 'rejectCall' via socket here
    setIncomingCall(null);
  };

  return (
    <div className="flex h-screen bg-[#13141f] text-white overflow-hidden">
      <SideNav onCreatePost={() => setShowCreatePost(true)} />

      {/* Main content area — offset by sidebar width */}
      <main className="flex-1 ml-16 md:ml-20 overflow-y-auto">
        <Outlet />
      </main>

      {/* Global Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}

      {/* Global WebRTC Components */}
      {incomingCall && (
        <CallOverlay onAccept={handleAcceptCall} onReject={handleRejectCall} />
      )}

      {activeCall && <CallModal />}
    </div>
  );
};

export default AppLayout;
