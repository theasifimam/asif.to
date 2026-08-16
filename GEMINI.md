# Tailwind CSS Best Practices & Rules

When writing Tailwind CSS classes in this workspace, follow these modern conventions to prevent console and bundler warnings:

## 1. Canonical Star Selector (`*:`)
*   **Do not** use arbitrary child variants like `[&>*]:` to style direct children.
*   **Do** use the canonical star selector syntax (`*:`) introduced in Tailwind CSS v3.4+.
*   *Examples:*
    *   ❌ Outdated: `[&>*]:grow` ➔   Modern: `*:grow`
    *   ❌ Outdated: `sm:[&>*]:grow-0` ➔   Modern: `sm:*:grow-0`
    *   ❌ Outdated: `[&>*]:p-4` ➔   Modern: `*:p-4`

## 2. Standard Utilities Over Arbitrary Selectors
*   Before writing an arbitrary property/variant (e.g., `[&_input]:border-blue-500` or `[color:red]`), check if a standard Tailwind variant/utility exists.
*   Keep markup clean and readable by using official features (like `@container`, `@layer`, custom plugins, or configuration extensions) if complex patterns are repeated.
