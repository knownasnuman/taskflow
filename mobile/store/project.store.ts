// mobile/store/project.store.ts
import { create } from "zustand";
import api from "../services/api";

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    members: number;
    tasks: number;
  };
}

interface ProjectState {
  projects: Project[];
  currentProject: any | null;
  isLoading: boolean;
  updateProject: (id: string, data: { name: string; description?: string }) => Promise<void>;

  getProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<void>;
  getProjectById: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  getProjects: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/api/projects");
      set({ projects: response.data.projects, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });

      const message = error.response?.data?.error || "Projeler yüklenemedi";
      throw new Error(message);
    }
  },

  createProject: async (name, description) => {
    set({ isLoading: true });
    try {
      const response = await api.post("/api/projects", { name, description });

      set((state) => ({
        projects: [response.data.project, ...state.projects],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  getProjectById: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/api/projects/${id}`);
      set({ currentProject: response.data.project, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      await api.delete(`/api/projects/${id}`);

      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },

  updateProject: async (id, data) => {
  try {
    const response = await api.put(`/api/projects/${id}`, data);

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? response.data.project : p
      ),
    }));
  } catch (error) {
    throw error;
  }
},
}));

export default useProjectStore;
