import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../database.types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

interface ProjectsState {
  projects: ProjectRow[];
  selectedProjectId: string | null;
  selectedProject: ProjectRow | null;
  boardColumns: string[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  subscribeToProjects: () => Promise<() => Promise<void> | void>;
  createProject: (project: ProjectInsert) => Promise<ProjectRow | null>;
  updateProject: (id: string, updates: ProjectUpdate) => Promise<ProjectRow | null>;
  deleteProject: (id: string) => Promise<boolean>;
  updateBoardStatus: (id: string, status: string) => Promise<ProjectRow | null>;
  updateBoardPosition: (id: string, position: number) => Promise<ProjectRow | null>;
  selectProject: (id: string | null) => void;
  clearError: () => void;
}

const boardColumns = ['idea', 'todo', 'in-progress', 'paused', 'done'];
let projectsChannel: RealtimeChannel | null = null;

const syncSelectedProject = (state: ProjectsState, selectedProjectId = state.selectedProjectId) =>
  state.projects.find((project) => project.id === selectedProjectId) ?? null;

export const useProjectsStore = create<ProjectsState>()(
  devtools((set, get) => ({
    projects: [],
    selectedProjectId: null,
    selectedProject: null,
    boardColumns,
    isLoading: false,
    error: null,

    fetchProjects: async () => {
      set({ isLoading: true, error: null }, false, 'projects/fetchProjects:start');

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('board_position', { ascending: true, nullsFirst: false })
        .order('updated_at', { ascending: false, nullsFirst: false });

      if (error) {
        set({ isLoading: false, error: error.message }, false, 'projects/fetchProjects:error');
        return;
      }

      const nextProjects = data ?? [];
      set(
        (state) => ({
          projects: nextProjects,
          selectedProject: syncSelectedProject({ ...state, projects: nextProjects }),
          isLoading: false,
          error: null,
        }),
        false,
        'projects/fetchProjects:success',
      );
    },

    subscribeToProjects: async () => {
      if (projectsChannel) {
        await supabase.removeChannel(projectsChannel);
        projectsChannel = null;
      }

      projectsChannel = supabase
        .channel('muninn-projects')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
          void get().fetchProjects();
        })
        .subscribe();

      return async () => {
        if (!projectsChannel) return;
        await supabase.removeChannel(projectsChannel);
        projectsChannel = null;
      };
    },

    createProject: async (project) => {
      const { data, error } = await supabase.from('projects').insert(project).select('*').single();

      if (error) {
        set({ error: error.message }, false, 'projects/createProject:error');
        return null;
      }

      set((state) => {
        const projects = [data, ...state.projects];
        return {
          projects,
          selectedProject: syncSelectedProject({ ...state, projects }),
          error: null,
        };
      }, false, 'projects/createProject:success');

      return data;
    },

    updateProject: async (id, updates) => {
      const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select('*').single();

      if (error) {
        set({ error: error.message }, false, 'projects/updateProject:error');
        return null;
      }

      set((state) => {
        const projects = state.projects.map((project) => (project.id === id ? data : project));
        return {
          projects,
          selectedProject: syncSelectedProject({ ...state, projects }),
          error: null,
        };
      }, false, 'projects/updateProject:success');

      return data;
    },

    deleteProject: async (id) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);

      if (error) {
        set({ error: error.message }, false, 'projects/deleteProject:error');
        return false;
      }

      set((state) => {
        const projects = state.projects.filter((project) => project.id !== id);
        const selectedProjectId = state.selectedProjectId === id ? null : state.selectedProjectId;
        return {
          projects,
          selectedProjectId,
          selectedProject: syncSelectedProject({ ...state, projects, selectedProjectId }),
          error: null,
        };
      }, false, 'projects/deleteProject:success');

      return true;
    },

    updateBoardStatus: async (id, status) => get().updateProject(id, { board_status: status }),

    updateBoardPosition: async (id, position) => get().updateProject(id, { board_position: position }),

    selectProject: (id) =>
      set(
        (state) => ({
          selectedProjectId: id,
          selectedProject: syncSelectedProject({ ...state, selectedProjectId: id }),
        }),
        false,
        'projects/selectProject',
      ),

    clearError: () => set({ error: null }, false, 'projects/clearError'),
  }), { name: 'projects-store' }),
);
