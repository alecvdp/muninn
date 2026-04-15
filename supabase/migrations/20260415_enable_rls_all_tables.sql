-- Enable Row-Level Security on all tables.
-- Without RLS the client-embedded anon key grants unrestricted access.

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE derived_insights ENABLE ROW LEVEL SECURITY;

-- Policies: allow full access for both anon and authenticated roles.
-- The app currently has no authentication flow and uses the anon key,
-- so both roles are granted access.  When an auth flow is added later
-- these policies can be tightened to authenticated-only or
-- row-owner checks (e.g. USING (auth.uid() = owner_id)).

-- projects
CREATE POLICY "Allow full access to projects"
  ON projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert projects"
  ON projects FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update projects"
  ON projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete projects"
  ON projects FOR DELETE TO anon, authenticated USING (true);

-- tools
CREATE POLICY "Allow full access to tools"
  ON tools FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert tools"
  ON tools FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update tools"
  ON tools FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete tools"
  ON tools FOR DELETE TO anon, authenticated USING (true);

-- agent_sessions
CREATE POLICY "Allow full access to agent_sessions"
  ON agent_sessions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert agent_sessions"
  ON agent_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update agent_sessions"
  ON agent_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete agent_sessions"
  ON agent_sessions FOR DELETE TO anon, authenticated USING (true);

-- memories
CREATE POLICY "Allow full access to memories"
  ON memories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert memories"
  ON memories FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update memories"
  ON memories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete memories"
  ON memories FOR DELETE TO anon, authenticated USING (true);

-- derived_insights
CREATE POLICY "Allow full access to derived_insights"
  ON derived_insights FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert derived_insights"
  ON derived_insights FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update derived_insights"
  ON derived_insights FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete derived_insights"
  ON derived_insights FOR DELETE TO anon, authenticated USING (true);
