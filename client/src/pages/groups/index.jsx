import { useAppStore } from "../../store";
import GroupList from "../../components/groups/GroupList";
import MessagePanel from "../../components/chat/MessagePanel";
import { Users } from "lucide-react";

/**
 * Groups Page — /groups
 *
 * Architecture:
 *   - Same 2-pane split as /chat
 *   - Sidebar lists groups
 *   - Main area renders MessagePanel (which we will refactor to handle groups)
 */
const Groups = () => {
  const { selectedContact } = useAppStore();

  return (
    <div className="flex h-full bg-[#13141f]">
      {/* Sidebar - Group List */}
      <div className="w-80 border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 rounded-lg">
            <Users className="text-indigo-500" size={20} />
          </div>
          <div>
            <h1 className="text-white font-bold">Groups</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
              Team Communications
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <GroupList />
        </div>
      </div>

      {/* Main Conversation Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {selectedContact?.isGroup ? (
          <MessagePanel />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mb-6">
              <Users className="text-indigo-500/40" size={40} />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">
              Select a group
            </h2>
            <p className="text-white/40 max-w-xs text-sm leading-relaxed">
              Choose a group from the left sidebar to start collaborating with your team members.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
