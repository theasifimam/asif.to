/**
 * Formats inline markdown syntax into safe HTML string.
 * Supports:
 * - Markdown links: [text](url "optional title") -> opens in new tab (target="_blank" rel="noopener noreferrer")
 * - Inline code: `code`
 * - Inline images: ![alt](url "optional title")
 * - Bold: **bold**, <strong>, <b>
 * - Italic: *italic*, _italic_ (with boundary checks), <em>, <i>
 * - Highlights: ==highlight==, <mark>
 * - Line breaks: <br/>
 * - Safe HTML tag restoration and XSS protection for URLs
 */
export function formatInlineMarkdown(text) {
  if (!text) return "";

  const placeholders = new Map();
  let placeholderId = 0;
  const hold = (html) => {
    const key = `@@PH_${placeholderId++}_${Math.random().toString(36).slice(2, 7)}@@`;
    placeholders.set(key, html);
    return key;
  };

  // 1. Escape literal HTML tags to prevent arbitrary HTML execution
  let formattedText = String(text)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. Restore allowed inline HTML tags (links, code, etc.) into safe placeholders
  formattedText = formattedText.replace(
    /&lt;a\s+href=(?:&quot;(.*?)&quot;|'(.*?)'|([^\s&gt;]+))(.*?)&gt;(.*?)&lt;\/a&gt;/gi,
    (_, h1, h2, h3, rest, linkContent) => {
      const href = (h1 || h2 || h3 || "").trim();
      if (/^(javascript|vbscript|data):/i.test(href)) return linkContent;
      const hasTarget = /target=/i.test(rest);
      const shouldOpenNewTab = !hasTarget && !href.startsWith("#");
      const targetRel = shouldOpenNewTab
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      return hold(
        `<a href="${href}"${rest}${targetRel} class="text-blue-600 dark:text-blue-400 underline font-bold hover:text-blue-700">${linkContent}</a>`
      );
    }
  );

  formattedText = formattedText.replace(
    /&lt;code(?:\s+class=&quot;[^&quot;]*&quot;)?&gt;(.*?)&lt;\/code&gt;/gi,
    (_, code) =>
      hold(
        `<code class="bg-zinc-200/80 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-mono text-xs px-1.5 py-0.5 rounded-md wrap-break-word max-w-full">${code}</code>`
      )
  );

  // 3. Inline code `code` (held in placeholder to protect from bold/italic/underscore parsing)
  formattedText = formattedText.replace(/`([^`]+)`/g, (_, code) =>
    hold(
      `<code class="bg-zinc-200/80 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-mono text-xs px-1.5 py-0.5 rounded-md wrap-break-word max-w-full">${code}</code>`
    )
  );

  // 4. Inline markdown images ![alt](url "title")
  formattedText = formattedText.replace(
    /!\[(.*?)\]\(\s*(<[^>]+>|(?:[^\s()]|\([^\s()]*\))+)(?:\s+["'](.*?)["'])?\s*\)/g,
    (_, alt, rawUrl, title) => {
      const cleanUrl = (rawUrl.startsWith("<") && rawUrl.endsWith(">") ? rawUrl.slice(1, -1) : rawUrl).trim();
      if (/^(javascript|vbscript):/i.test(cleanUrl)) return "";
      const titleAttr = title ? ` title="${title}"` : "";
      return hold(
        `<img src="${cleanUrl}" alt="${alt || "Illustration"}"${titleAttr} class="inline-block max-h-96 rounded-xl my-2 shadow-xs" />`
      );
    }
  );

  // 5. Markdown links [text](url "title") - negative lookbehind ensures not an image
  formattedText = formattedText.replace(
    /(?<!!)\[([^\]]+)\]\(\s*(<[^>]+>|(?:[^\s()]|\([^\s()]*\))+)(?:\s+["'](.*?)["'])?\s*\)/g,
    (_, linkText, rawUrl, title) => {
      const href = (rawUrl.startsWith("<") && rawUrl.endsWith(">") ? rawUrl.slice(1, -1) : rawUrl).trim();
      if (/^(javascript|vbscript):/i.test(href)) return linkText;
      const shouldOpenNewTab = !href.startsWith("#");
      const targetRel = shouldOpenNewTab
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      const titleAttr = title ? ` title="${title}"` : "";

      // Allow bold, italic inside link text (code was already held in placeholder in step 3)
      const innerFormatted = linkText
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
        .replace(
          /==(.*?)==/g,
          '<mark class="bg-amber-300 dark:bg-amber-400 text-zinc-950 font-bold px-1 py-0.5 rounded shadow-xs">$1</mark>'
        );

      return hold(
        `<a href="${href}"${targetRel}${titleAttr} class="text-blue-600 dark:text-blue-400 underline font-bold hover:text-blue-700">${innerFormatted}</a>`
      );
    }
  );

  // 6. Replace Markdown highlight ==text== and <mark>
  formattedText = formattedText
    .replace(
      /==(.*?)==/g,
      '<mark class="bg-amber-300 dark:bg-amber-400 text-zinc-950 font-bold px-1.5 py-0.5 rounded-md shadow-xs">$1</mark>'
    )
    .replace(
      /&lt;mark(?:\s+class=&quot;[^&quot;]*&quot;)?&gt;(.*?)&lt;\/mark&gt;/gi,
      '<mark class="bg-amber-300 dark:bg-amber-400 text-zinc-950 font-bold px-1.5 py-0.5 rounded-md shadow-xs">$1</mark>'
    );

  // 7. Replace **bold** and <strong>/<b>
  formattedText = formattedText
    .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/gi, "<strong>$1</strong>")
    .replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/gi, "<strong>$1</strong>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // 8. Replace *italic* and _italic_ and <em>/<i>
  formattedText = formattedText
    .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/gi, "<em>$1</em>")
    .replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/gi, "<em>$1</em>")
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    .replace(/(?<=^|\s|[([{"'])_([^_]+)_(?=$|\s|[)\],.?!'"])/g, "<em>$1</em>");

  // 9. Line breaks <br/>
  formattedText = formattedText.replace(/&lt;br\s*\/?&gt;/gi, "<br/>");

  // 10. Restore placeholders (iteratively to support any nested placeholders)
  let prev;
  do {
    prev = formattedText;
    for (const [key, value] of placeholders.entries()) {
      formattedText = formattedText.replaceAll(key, value);
    }
  } while (formattedText !== prev);

  return formattedText;
}
