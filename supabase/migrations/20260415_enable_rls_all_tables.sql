-- Enable Row-Level Security on all tables.
-- Without RLS the client-embedded anon key grants unrestricted access.

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE derived_insights ENABLE ROW LEVEL SECURITY;

-- Policies: allow full access for authenticated users only.
-- The anon key can no longer read or mutate data.

-- projects
CREATE POLICY "Authenticated users can select projects"
  ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert projects"
  ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update projects"
  ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete projects"
  ON projects FOR DELETE TO authenticated USING (true);

-- tools
CREATE POLICY "Authenticated users can select tools"
  ON tools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tools"
  ON tools FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tools"
  ON tools FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete tools"
  ON tools FOR DELETE TO authenticated USING (true);

-- agent_sessions
CREATE POLICY "Authenticated users can select agent_sessions"
  ON agent_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert agent_sessions"
  ON agent_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update agent_sessions"
  ON agent_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete agent_sessions"
  ON agent_sessions FOR DELETE TO authenticated USING (true);

-- memories
CREATE POLICY "Authenticated users can select memories"
  ON memories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert memories"
  ON memories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update memories"
  ON memories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete memories"
  ON memories FOR DELETE TO authenticated USING (true);

-- derived_insights
CREATE POLICY "Authenticated users can select derived_insights"
  ON derived_insights FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert derived_insights"
  ON derived_insights FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update derived_insights"
  ON derived_insights FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete derived_insights"
  ON derived_insights FOR DELETE TO authenticated USING (true);
