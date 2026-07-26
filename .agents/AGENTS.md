# Media-Portfolio Agent Rules

## Data Source Architecture

The public-facing pages (Home, Gallery, About) read **directly from the local JSON files** in `src/data/`. No Supabase sync is required for these pages.

| Page | Data source |
|------|-------------|
| `/` (Home) | `src/data/gallery.json`, `src/data/timeline.json` |
| `/gallery` | `src/data/gallery.json`, `src/data/tags.json` |
| `/about` | `src/data/milestones.json` |
| `/admin` (Admin panel) | Supabase (reads & writes live) |

## Workflow for Adding/Editing Gallery Images

1. Edit `src/data/gallery.json` with the new image entries.
2. If you added new tags, also update `src/data/tags.json`.
3. Commit and push — the next Vercel deploy will pick up the changes automatically.

> **No migration script needed** for the public pages. `migrate-to-supabase.mjs` is now only relevant if the admin panel data needs to be re-seeded.
