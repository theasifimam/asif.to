"use client";

export default function MessageText({ message }) {
  const mentioned = new Set(
    (message.mentions || []).map((user) => user.username?.toLowerCase()),
  );

  return (
    <p className="whitespace-pre-wrap wrap-break-word text-sm leading-5">
      {message.content.split(/(https?:\/\/[^\s<>]+|@[a-z0-9._-]+)/gi).map((part, index) =>
        /^https?:\/\//i.test(part) ? <a key={index} href={part} className="underline break-all" target="_blank" rel="noopener noreferrer">{part}</a> : mentioned.has(part.slice(1).toLowerCase()) ? (
          <span
            key={index}
            className="rounded bg-white/25 px-1 py-0.5 font-bold text-inherit"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </p>
  );
}
