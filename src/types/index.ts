import type { Database } from '../database.types';

// Row types (read)
export type ProjectRow = Database['public']['Tables']['projects']['Row'];
export type ToolRow = Database['public']['Tables']['tools']['Row'];
export type SessionRow = Database['public']['Tables']['agent_sessions']['Row'];
export type MemoryRow = Database['public']['Tables']['memories']['Row'];
export type InsightRow = Database['public']['Tables']['derived_insights']['Row'];
export type ProfileRow = Database['public']['Tables']['profile']['Row'];
export type PreferenceRow = Database['public']['Tables']['preferences']['Row'];

// Insert types (create)
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ToolInsert = Database['public']['Tables']['tools']['Insert'];

// Update types (patch)
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
export type ToolUpdate = Database['public']['Tables']['tools']['Update'];
