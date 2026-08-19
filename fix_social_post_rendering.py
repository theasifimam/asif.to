from pathlib import Path

root = Path.cwd()
slide_frame = root / "apps/admin/src/components/social-posts/templates/shared/SlideFrame.jsx"
code_block = root / "apps/admin/src/components/social-posts/templates/shared/CodeBlock.jsx"

if not slide_frame.exists() or not code_block.exists():
    raise SystemExit("Run this script from the root of the asif.to repository.")

# Preserve newlines in all templates via inherited white-space.
text = slide_frame.read_text(encoding="utf-8")
needle = '        fontFamily: "\'Inter\', \'Outfit\', sans-serif",\n'
replacement = needle + '        whiteSpace: "pre-line",\n'
if 'whiteSpace: "pre-line"' not in text:
    if needle not in text:
        raise SystemExit("Could not locate SlideFrame fontFamily block.")
    text = text.replace(needle, replacement, 1)
    slide_frame.write_text(text, encoding="utf-8")

# Add Highlight.js token colors directly in CodeBlock.
text = code_block.read_text(encoding="utf-8")

style_const = """
const HIGHLIGHT_STYLES = `
.social-code-block .hljs-comment,
.social-code-block .hljs-quote { color:#8b949e; font-style:italic; }

.social-code-block .hljs-keyword,
.social-code-block .hljs-selector-tag,
.social-code-block .hljs-subst { color:#ff7b72; }

.social-code-block .hljs-string,
.social-code-block .hljs-doctag,
.social-code-block .hljs-regexp,
.social-code-block .hljs-template-variable { color:#a5d6ff; }

.social-code-block .hljs-title,
.social-code-block .hljs-title.function_,
.social-code-block .hljs-section,
.social-code-block .hljs-name { color:#d2a8ff; }

.social-code-block .hljs-number,
.social-code-block .hljs-literal,
.social-code-block .hljs-symbol,
.social-code-block .hljs-bullet { color:#79c0ff; }

.social-code-block .hljs-built_in,
.social-code-block .hljs-type,
.social-code-block .hljs-class .hljs-title { color:#ffa657; }

.social-code-block .hljs-variable,
.social-code-block .hljs-params,
.social-code-block .hljs-attr,
.social-code-block .hljs-property { color:#ffa198; }

.social-code-block .hljs-meta,
.social-code-block .hljs-meta .hljs-keyword { color:#7ee787; }

.social-code-block[data-code-theme="light"] .hljs-comment,
.social-code-block[data-code-theme="light"] .hljs-quote { color:#6e7781; }

.social-code-block[data-code-theme="light"] .hljs-keyword,
.social-code-block[data-code-theme="light"] .hljs-selector-tag,
.social-code-block[data-code-theme="light"] .hljs-subst { color:#cf222e; }

.social-code-block[data-code-theme="light"] .hljs-string,
.social-code-block[data-code-theme="light"] .hljs-doctag,
.social-code-block[data-code-theme="light"] .hljs-regexp,
.social-code-block[data-code-theme="light"] .hljs-template-variable { color:#0a3069; }

.social-code-block[data-code-theme="light"] .hljs-title,
.social-code-block[data-code-theme="light"] .hljs-title.function_,
.social-code-block[data-code-theme="light"] .hljs-section,
.social-code-block[data-code-theme="light"] .hljs-name { color:#8250df; }

.social-code-block[data-code-theme="light"] .hljs-number,
.social-code-block[data-code-theme="light"] .hljs-literal,
.social-code-block[data-code-theme="light"] .hljs-symbol,
.social-code-block[data-code-theme="light"] .hljs-bullet { color:#0550ae; }

.social-code-block[data-code-theme="light"] .hljs-built_in,
.social-code-block[data-code-theme="light"] .hljs-type,
.social-code-block[data-code-theme="light"] .hljs-class .hljs-title,
.social-code-block[data-code-theme="light"] .hljs-variable,
.social-code-block[data-code-theme="light"] .hljs-params,
.social-code-block[data-code-theme="light"] .hljs-attr,
.social-code-block[data-code-theme="light"] .hljs-property { color:#953800; }

.social-code-block[data-code-theme="light"] .hljs-meta,
.social-code-block[data-code-theme="light"] .hljs-meta .hljs-keyword { color:#116329; }
`;
"""

if "const HIGHLIGHT_STYLES" not in text:
    marker = 'import hljs from "highlight.js";\n'
    if marker not in text:
        raise SystemExit("Could not locate highlight.js import.")
    text = text.replace(marker, marker + style_const, 1)

if 'className="social-code-block"' not in text:
    text = text.replace(
        '  return (\n    <div\n      style={{\n',
        '  return (\n    <div\n      className="social-code-block"\n      data-code-theme={isDark ? "dark" : "light"}\n      style={{\n',
        1,
    )

if "<style>{HIGHLIGHT_STYLES}</style>" not in text:
    target = '      </div>\n    </div>\n  );\n}\n'
    replacement = '      </div>\n      <style>{HIGHLIGHT_STYLES}</style>\n    </div>\n  );\n}\n'
    if target not in text:
        raise SystemExit("Could not locate CodeBlock closing markup.")
    text = text.replace(target, replacement, 1)

code_block.write_text(text, encoding="utf-8")

print("Applied fixes successfully.")
print("Run: npm --prefix apps/admin run build")
