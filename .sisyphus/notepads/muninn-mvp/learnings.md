Created `src/store/tools.ts` by mirroring the `projects` store pattern: shared `syncSelectedTool` helper, Supabase CRUD methods, and realtime subscription cleanup.

Computed stats stayed simple and local to the store; `renewingWithin30Days` uses a small date helper instead of introducing extra filtering machinery.
