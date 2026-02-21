import { Trash2, GripVertical } from "lucide-react";
import { useAppStore } from "../../store";
import { apiClient } from "../../lib/api-client";
import { UPDATE_TASK, DELETE_TASK } from "../../utils/constants";
import { toast } from "sonner";

/**
 * TaskCard — Individual task item
 *
 * Props:
 *   - task: { _id, title, status, createdAt }
 *
 * Relationships:
 *   - Rendered by pages/tasks/index.jsx inside status columns
 *   - Updates status via PATCH /api/tasks/:id
 *   - Deletes task via DELETE /api/tasks/:id
 */
const TaskCard = ({ task }) => {
  const { updateTask, removeTask } = useAppStore();

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await apiClient.patch(
        UPDATE_TASK(task._id),
        { status: newStatus },
        { withCredentials: true }
      );
      if (response.status === 200) {
        updateTask(response.data);
      }
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await apiClient.delete(DELETE_TASK(task._id), {
        withCredentials: true,
      });
      if (response.status === 200) {
        removeTask(task._id);
        toast.success("Task deleted");
      }
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="bg-[#1e1f2e] border border-white/5 p-4 rounded-xl group hover:border-violet-500/30 transition-all duration-200 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-white text-sm leading-relaxed">{task.title}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="bg-[#13141f] text-[10px] text-white/50 uppercase tracking-wider font-bold py-1 px-2 rounded-md outline-none border border-white/5 focus:border-violet-500/30 cursor-pointer"
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <span className="text-[10px] text-white/20 font-medium">
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
