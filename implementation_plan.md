# Social Post Studio — Implementation Plan

Build a full-featured Social Post Studio inside `apps/admin` that turns content ideas into professionally branded social-media images (single or carousel) for Instagram, LinkedIn, X, etc.

## Architecture Summary

| Layer | Stack | Pattern |
|---|---|---|
| **Frontend** | Next.js 16 + Tailwind v4 + Radix UI + Framer Motion | Existing admin app patterns |
| **Backend** | Express 5 + Mongoose 9 | New model + CRUD controller + routes |
| **Syntax Highlighting** | `highlight.js` (already installed v11.11.1) | Reuse existing dependency |
| **Export** | `html-to-image` (new dep — lightweight, DOM-based) | Canvas capture at exact px |
| **ZIP Downloads** | `JSZip` + `file-saver` (new deps) | Client-side ZIP bundling |
| **Drag & Drop** | `@dnd-kit` (already installed) | Slide reordering |

---

## Proposed Changes

### Backend — Mongoose Model

#### [NEW] [`SocialPost.js`](file:///c:/desktopfolders/asif.to/server/src/models/SocialPost.js)

New Mongoose model:

```js
{
  name: String,              // internal title
  category: String,          // "react", "javascript", "nextjs", etc.
  platform: String,          // "instagram", "linkedin", "twitter", "facebook"
  format: String,            // "square-1080", "portrait-1080"
  status: String,            // "draft" | "published"
  settings: {
    accentColor: String,
    codeTheme: String,       // "dark" | "light"
    showBranding: Boolean,
    showSlideNumbers: Boolean,
    showCategory: Boolean,
    footerText: String,
  },
  slides: [{
    id: String,
    order: Number,
    template: String,        // template ID
    eyebrow: String,
    title: String,
    subtitle: String,
    body: String,
    highlightedText: String,
    code: {
      language: String,
      filename: String,
      content: String,
      highlightLines: [Number],
      showLineNumbers: Boolean,
    },
    bulletPoints: [String],
    quote: String,
    author: String,
    badge: String,
    stepNumber: Number,
    cta: String,
    footerText: String,
    url: String,
    comparisonLeft: { label, items: [String] },
    comparisonRight: { label, items: [String] },
  }],
  createdBy: ObjectId → User,
  createdAt, updatedAt
}
```

---

### Backend — Controller & Routes

#### [NEW] [`socialPost.controller.js`](file:///c:/desktopfolders/asif.to/server/src/controllers/socialPost.controller.js)

Standard CRUD following the cheatsheet controller pattern: `list`, `getById`, `create`, `update`, `delete`, `duplicate`.

#### [NEW] [`socialPost.routes.js`](file:///c:/desktopfolders/asif.to/server/src/routes/socialPost.routes.js)

```
GET    /social-posts           → list (protected)
GET    /social-posts/:id       → getById (protected)
POST   /social-posts           → create (protected)
PATCH  /social-posts/:id       → update (protected)
POST   /social-posts/:id/duplicate → duplicate (protected)
DELETE /social-posts/:id       → delete (protected)
```

Permission: `articles.create` (reuses existing content-creation permission — no new permission needed).

#### [MODIFY] [`index.js`](file:///c:/desktopfolders/asif.to/server/src/index.js)

Register `socialPost.routes.js` at `/api/v1/social-posts`.

---

### Frontend — API Layer

#### [MODIFY] [`api.js`](file:///c:/desktopfolders/asif.to/apps/admin/src/lib/api.js)

Add `socialPostsApi` object: `list`, `get`, `create`, `update`, `duplicate`, `delete`.

---

### Frontend — Permissions & Navigation

#### [MODIFY] [`permissions.js`](file:///c:/desktopfolders/asif.to/apps/admin/src/lib/permissions.js)

Add route rule: `/social-posts` → `articles.create`.

#### [MODIFY] [`layout.jsx`](file:///c:/desktopfolders/asif.to/apps/admin/src/app/(admin)/layout.jsx)

Add "Social Posts" nav item under the "Content" group with `Image` (lucide) icon pointing to `/social-posts`.

---

### Frontend — Pages

#### [NEW] `src/app/(admin)/social-posts/page.jsx`

**Social Posts listing page** — list all drafts/published posts in a card grid, with search, filter by category, and "Create Post" button. Pattern follows the existing articles listing page.

#### [NEW] `src/app/(admin)/social-posts/new/page.jsx`

Redirect/wrapper that creates a new blank post and opens the studio editor.

#### [NEW] `src/app/(admin)/social-posts/[id]/page.jsx`

**Social Post Studio** — the full editor. Split-panel layout:
- **Left panel**: Content editor (slide fields, settings, template selector)
- **Right panel**: Large live preview canvas at exact dimensions
- **Bottom strip**: Slide thumbnails with drag-to-reorder

---

### Frontend — Social Post Studio Components

All new files under `src/components/social-posts/`:

#### Core Studio
| File | Purpose |
|---|---|
| `SocialPostStudio.jsx` | Main orchestrator — manages post state, autosave, undo/redo |
| `SlideEditor.jsx` | Left-panel form for the active slide's fields |
| `SlideNavigator.jsx` | Bottom slide thumbnail strip with drag-reorder (uses `@dnd-kit`) |
| `LivePreview.jsx` | Right-panel preview wrapper with zoom/fit controls |
| `PostSettingsPanel.jsx` | Post-level settings (name, category, platform, format, branding) |

#### Template System
| File | Purpose |
|---|---|
| `templates/registry.js` | Template registry — maps template IDs to metadata + components + supported fields |
| `templates/TemplateRenderer.jsx` | Dynamic renderer — receives slide data + template ID, renders the correct template |
| `templates/TemplateSelector.jsx` | Visual template picker with category filtering & thumbnails |
| `templates/shared/SlideFrame.jsx` | Shared wrapper for all templates — handles branding footer, slide numbers, accent color, safe-area padding |
| `templates/shared/CodeBlock.jsx` | Syntax-highlighted code block using `highlight.js` with terminal header, filename, line numbers |
| `templates/shared/AutoFitText.jsx` | Responsive text component that clamps/scales font sizes within min/max bounds |

#### Individual Templates (10)
| Template | File |
|---|---|
| Developer Tip | `templates/DeveloperTip.jsx` |
| Code Snippet | `templates/CodeSnippet.jsx` |
| Interview Question | `templates/InterviewQuestion.jsx` |
| Tutorial Cover | `templates/TutorialCover.jsx` |
| Tutorial Step | `templates/TutorialStep.jsx` |
| Comparison | `templates/Comparison.jsx` |
| Definition | `templates/Definition.jsx` |
| Quote | `templates/Quote.jsx` |
| Minimal | `templates/Minimal.jsx` |
| Summary / CTA | `templates/Summary.jsx` |

#### Export Engine
| File | Purpose |
|---|---|
| `export/ExportEngine.js` | Uses `html-to-image` to capture the preview DOM node at exact pixel dimensions |
| `export/ExportControls.jsx` | Download PNG/JPEG buttons, "Download All" for carousel (ZIP via `JSZip`) |

#### Presets & Formats
| File | Purpose |
|---|---|
| `presets.js` | Content preset definitions (Quick Tip, Tutorial, Interview, Comparison) |
| `formats.js` | Centralized image format definitions (square, portrait, future formats) |

#### Hooks
| File | Purpose |
|---|---|
| `hooks/useSocialPost.js` | Custom hook — manages post CRUD, autosave (debounced), loading state |
| `hooks/useUndoRedo.js` | Simple undo/redo stack for slide edits |

---

## Key Design Decisions

### 1. Syntax Highlighting in Exports

`highlight.js` is already installed. Templates will render code blocks with `hljs` classes. Since `html-to-image` captures the live DOM (including applied CSS), syntax highlighting will appear correctly in exported PNG/JPEG — no canvas re-rendering needed.

### 2. Export Strategy

Using `html-to-image` (specifically `toPng` / `toJpeg`) which renders the actual DOM node into a raster image. The preview canvas element is always sized at exact target dimensions (1080×1080 or 1080×1350) using CSS `width`/`height` in pixels, then visually scaled down via CSS `transform: scale()`. At export time, the transform is temporarily removed to capture at full resolution.

### 3. Branding Colors

Templates use the existing admin blue primary (`#2563eb` / `var(--m3-primary)`). The accent color override in post settings allows per-post customization but defaults to brand blue.

### 4. Font Loading in Exports

The admin app already loads Inter + Outfit via `next/font/google`. Since `html-to-image` captures rendered DOM, these fonts will be preserved in exports as long as they're loaded — which they always are in the admin panel.

### 5. Autosave

Debounced save (2 second delay after last edit) using the `useSocialPost` hook. Visual indicator shows save status (saved / saving / unsaved).

### 6. Template Architecture

Each template is a pure React component receiving standardized `{ slide, format, settings }` props. The `registry.js` declares which fields each template supports, so the `SlideEditor` dynamically shows only relevant form fields. Adding a new template = creating one JSX file + one registry entry.

---

## New Dependencies

| Package | Purpose | Size |
|---|---|---|
| `html-to-image` | DOM → PNG/JPEG capture | ~15KB |
| `jszip` | Client-side ZIP creation | ~45KB |
| `file-saver` | `saveAs()` for downloads | ~3KB |

All installed in `apps/admin` only.

---

## Verification Plan

### Automated
```bash
cd apps/admin && npx next lint    # Lint check
cd apps/admin && npx next build   # Production build
```

### Manual Verification
- Create single-image post → export PNG at 1080×1080 → verify pixel dimensions, fonts, branding, syntax highlighting
- Create carousel post (6 slides) → export all as ZIP → verify all files named correctly at exact dimensions
- Portrait format 1080×1350 → export → verify
- Long title overflow → verify auto-fitting/truncation
- Large code block → verify containment within slide boundaries
- Save draft → refresh page → verify data persists
- Navigate to existing admin features → verify nothing broken
- Verify `@dnd-kit` slide reordering works
- Test all 10 templates with representative content
