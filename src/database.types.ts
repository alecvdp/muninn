export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          archived_at: string | null;
          board_position: number | null;
          board_status: string | null;
          context: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          last_agent_context: string | null;
          local_path: string | null;
          name: string;
          priority: number | null;
          repo_url: string | null;
          status: string;
          tech_stack: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          archived_at?: string | null;
          board_position?: number | null;
          board_status?: string | null;
          context?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          last_agent_context?: string | null;
          local_path?: string | null;
          name: string;
          priority?: number | null;
          repo_url?: string | null;
          status?: string;
          tech_stack?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          archived_at?: string | null;
          board_position?: number | null;
          board_status?: string | null;
          context?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          last_agent_context?: string | null;
          local_path?: string | null;
          name?: string;
          priority?: number | null;
          repo_url?: string | null;
          status?: string;
          tech_stack?: string[] | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      tools: {
        Row: {
          active_subscription: boolean | null;
          bill_day: number | null;
          billing_cycle: string | null;
          category: string;
          cost: number | null;
          created_at: string | null;
          id: string;
          name: string;
          notes: string | null;
          platform: string[] | null;
          renewal_date: string | null;
          tags: string[] | null;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          active_subscription?: boolean | null;
          bill_day?: number | null;
          billing_cycle?: string | null;
          category?: string;
          cost?: number | null;
          created_at?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          platform?: string[] | null;
          renewal_date?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          active_subscription?: boolean | null;
          bill_day?: number | null;
          billing_cycle?: string | null;
          category?: string;
          cost?: number | null;
          created_at?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          platform?: string[] | null;
          renewal_date?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [];
      };
      agent_sessions: {
        Row: {
          agent_id: string | null;
          ended_at: string | null;
          id: string;
          interface: string;
          machine: string | null;
          memories_created: number | null;
          project_id: string | null;
          started_at: string | null;
          summary: string | null;
          tables_touched: string[] | null;
        };
        Insert: {
          agent_id?: string | null;
          ended_at?: string | null;
          id?: string;
          interface: string;
          machine?: string | null;
          memories_created?: number | null;
          project_id?: string | null;
          started_at?: string | null;
          summary?: string | null;
          tables_touched?: string[] | null;
        };
        Update: {
          agent_id?: string | null;
          ended_at?: string | null;
          id?: string;
          interface?: string;
          machine?: string | null;
          memories_created?: number | null;
          project_id?: string | null;
          started_at?: string | null;
          summary?: string | null;
          tables_touched?: string[] | null;
        };
        Relationships: [];
      };
      memories: {
        Row: {
          category: string;
          confidence: string | null;
          content: string;
          created_at: string | null;
          embedding: unknown | null;
          id: string;
          project_id: string | null;
          source: string | null;
          superseded_by: string | null;
          tags: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          category: string;
          confidence?: string | null;
          content: string;
          created_at?: string | null;
          embedding?: unknown | null;
          id?: string;
          project_id?: string | null;
          source?: string | null;
          superseded_by?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          category?: string;
          confidence?: string | null;
          content?: string;
          created_at?: string | null;
          embedding?: unknown | null;
          id?: string;
          project_id?: string | null;
          source?: string | null;
          superseded_by?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'memories_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'memories_superseded_by_fkey';
            columns: ['superseded_by'];
            referencedRelation: 'memories';
            referencedColumns: ['id'];
          },
        ];
      };
      derived_insights: {
        Row: {
          confidence: string | null;
          content: string;
          created_at: string | null;
          embedding: unknown | null;
          id: string;
          insight_type: string;
          source_memory_ids: string[] | null;
          source_session_ids: string[] | null;
          superseded_by: string | null;
        };
        Insert: {
          confidence?: string | null;
          content: string;
          created_at?: string | null;
          embedding?: unknown | null;
          id?: string;
          insight_type: string;
          source_memory_ids?: string[] | null;
          source_session_ids?: string[] | null;
          superseded_by?: string | null;
        };
        Update: {
          confidence?: string | null;
          content?: string;
          created_at?: string | null;
          embedding?: unknown | null;
          id?: string;
          insight_type?: string;
          source_memory_ids?: string[] | null;
          source_session_ids?: string[] | null;
          superseded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'derived_insights_superseded_by_fkey';
            columns: ['superseded_by'];
            referencedRelation: 'derived_insights';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
