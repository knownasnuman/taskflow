import { create } from "zustand";
import api from "../services/api";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
  createdAt: string;
  assigneeId?: string | null;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdBy: {
    id: string;
    name: string;
  };
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;

  getTasks: (projectId: string) => Promise<void>;
  createTask: (
    projectId: string,
    data: {
      title: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string;
      assigneeId?: string;
    },
  ) => Promise<void>;
  updateTask: (
    projectId: string,
    taskId: string,
    data: Partial<Task>,
  ) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  updateTaskLocally: (task: Task) => void;
}

const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,

  getTasks: async (projectId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/api/projects/${projectId}/tasks`);
      set({ tasks: response.data.tasks, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.error || "Projeler yüklenemedi";
      throw new Error(message);
    }
  },

  createTask: async (projectId, data) => {
    set({ isLoading: true });
    try {
      const response = await api.post(`/api/projects/${projectId}/tasks`, data);

      set((state) => ({
        tasks: [response.data.task, ...state.tasks],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateTask: async (projectId, taskId, data) => {
    try {
      const response = await api.put(
        `/api/projects/${projectId}/tasks/${taskId}`,
        data,
      );

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? response.data.task : t,
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (projectId, taskId) => {
    try {
      await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);

      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      }));
    } catch (error) {
      throw error;
    }
  },
  updateTaskLocally: (task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    }));
  },
}));

export default useTaskStore;
