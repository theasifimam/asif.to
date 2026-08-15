# Admin component structure

- `admin/` — shared admin page composition primitives
- `auth/` — authorization and access-state components
- `editor/` — rich-editor controls and editorial helpers
- `feedback/` — confirmation and feedback dialogs
- `forms/` — reusable form shells and form layout primitives
- `navigation/` — sidebar, top bar, account menu, and mobile navigation
- `providers/` — application-level React providers
- `search/` — global admin search
- `ui/` — low-level reusable controls
- `users/` — user-management components shared across user routes
- `automation/`, `bento/`, `cards/` — specialized shared feature components

Components used by only one route remain colocated under that route's
`components/` directory. Promote them here only after they become shared.
