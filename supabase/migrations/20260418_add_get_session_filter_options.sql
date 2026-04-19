-- Returns distinct non-null interface and machine values from agent_sessions.
-- Replaces the client-side approach of fetching all rows to derive filter options.
create or replace function get_session_filter_options()
returns table(kind text, value text)
language sql stable
as $$
  select 'interface' as kind, interface as value
  from agent_sessions
  where interface is not null
  group by interface
  union all
  select 'machine' as kind, machine as value
  from agent_sessions
  where machine is not null
  group by machine;
$$;
