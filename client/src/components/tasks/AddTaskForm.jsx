import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { apiClient } from "../../lib/api-client";
import { TASKS_ROUTES } from "../../utils/constants";
import { useAppStore } from "../../store";
import { toast } from "sonner";

/**
 * AddTaskForm — Inline form to create a new task
 *
 * Relationships:
 *   - Rendered at the top of the Task page
 *   - On success, updates the Zustand task slice
 */
import { useMutation } from "@apollo/client";
import { CREATE_TASK_MUTATION, GET_TASKS_QUERY } from "../../graphql/queries";

const AddTaskForm = () => {
  const [title, setTitle] = useState("");
  const { addTask } = useAppStore();

  const [createTask, { loading }] = useMutation(CREATE_TASK_MUTATION, {
    onCompleted: (data) => {
      addTask(data.createTask);
      setTitle("");
      toast.success("Task added");
    },
    onError: () => {
      toast.error("Failed to add task");
    },
    refetchQueries: [{ query: GET_TASKS_QUERY }],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTask({ variables: { title: title.trim() } });
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new task..."
        className="w-full bg-[#1e1f2e] text-white text-sm px-5 py-4 rounded-2xl border border-white/5 focus:border-violet-500/50 outline-none transition-all placeholder:text-white/20"
      />
      <button
        type="submit"
        disabled={!title.trim() || loading}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:bg-white/5 text-white rounded-xl transition-all"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Plus size={16} />
        )}
      </button>
    </form>
  );
};

export default AddTaskForm;
