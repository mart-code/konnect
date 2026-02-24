import { useEffect, useState } from "react";
import { apiClient } from "../../lib/api-client";
import { TASKS_ROUTES } from "../../utils/constants";
import { useAppStore } from "../../store";
import TaskCard from "../../components/tasks/TaskCard";
import AddTaskForm from "../../components/tasks/AddTaskForm";
import { LayoutGrid, ClipboardList, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

/**
 * Task Management Dashboard — /tasks
 *
 * Architecture:
 *   - Fetches tasks from /api/tasks on mount
 *   - Uses Zustand task-slice for global state management
 *   - Tasks are filtered into three columns: Todo, In Progress, Done
 */
import { useQuery } from "@apollo/client";
import { GET_TASKS_QUERY } from "../../graphql/queries";

const Tasks = () => {
  const { tasks, setTasks } = useAppStore();

  const { data, loading } = useQuery(GET_TASKS_QUERY, {
    onCompleted: (data) => {
      setTasks(data.getTasks);
    },
    onError: () => {
      toast.error("Failed to fetch tasks");
    },
    fetchPolicy: "network-only",
  });

  // Re-sync store when data changes
  useEffect(() => {
    if (data?.getTasks) {
      setTasks(data.getTasks);
    }
  }, [data, setTasks]);

  const columns = [
    { id: "todo", title: "Todo", icon: Circle, color: "text-blue-400" },
    {
      id: "in-progress",
      title: "In Progress",
      icon: ClipboardList,
      color: "text-amber-400",
    },
    { id: "done", title: "Done", icon: CheckCircle2, color: "text-emerald-400" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <LayoutGrid className="text-violet-500" />
            Task Manager
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Organize and track your personal productivity.
          </p>
        </div>
        <div className="w-full md:w-96">
          <AddTaskForm />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col bg-[#1a1b26]/50 rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <column.icon className={column.color} size={16} />
                <h2 className="text-white font-semibold text-sm uppercase tracking-wider">
                  {column.title}
                </h2>
              </div>
              <span className="bg-white/5 text-white/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {tasks.filter((t) => t.status === column.id).length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {tasks
                .filter((t) => t.status === column.id)
                .map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              
              {tasks.filter((t) => t.status === column.id).length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 opacity-20 italic text-xs text-white">
                  No tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
