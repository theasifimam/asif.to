# Web component structure

- `analytics/` — browser analytics and page-view tracking
- `articles/` — article cards, readers, saving, bookmarking, and markdown
- `auth/` — sign-in, sign-up, OAuth, sessions, and account controls
- `authors/` — public author and user profile experiences
- `chapter/` — reusable chapter reader building blocks
- `courses/` — course, chapter, topic, and cheatsheet page clients
- `exam/` — final-exam UI and exam hooks
- `home/` — homepage-only sections and discovery surfaces
- `interactive-code/` — code playground workspace and runtime
- `interview/` — interview guide and answer experiences
- `layout/` — site-wide header, footer, mobile navigation, and layout state
- `legal/`, `practice/`, `search/` — feature-specific components
- `providers/` — application-level React providers
- `seo/` — structured-data and SEO presentation helpers
- `ui/` — small reusable, feature-agnostic controls

Route-only components should stay beside their route. Components shared by more
than one route belong in the closest feature folder above.
