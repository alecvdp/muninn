## 2026-04-11
- Use Tailwind v3 `theme.extend.colors` with CSS variable-backed HSL colors; do not use v4 `@theme` syntax.
- Use Zustand `devtools` namespaced actions for each store so store updates are readable in browser devtools.
- Route structure for Muninn is `/`, `/tools`, `/agents`, `/settings`, with `App.tsx` acting as the shared layout shell around nested page outlets.
