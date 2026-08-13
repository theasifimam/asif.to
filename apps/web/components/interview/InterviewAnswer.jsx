function inline(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => part.startsWith("**") && part.endsWith("**")
    ? <strong key={index} className="font-bold text-zinc-900 dark:text-white">{part.slice(2, -2)}</strong>
    : part);
}

export default function InterviewAnswer({ content }) {
  const blocks = String(content || "").split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
  return <div className="w-full min-w-0 max-w-full space-y-4 break-words text-sm leading-7 text-zinc-700 [overflow-wrap:anywhere] dark:text-zinc-300 sm:text-[15px]">
    {blocks.map((block, index) => {
      if (block.startsWith("### ")) return <h3 key={index} className="pt-2 text-lg font-black tracking-tight text-zinc-900 dark:text-white">{inline(block.slice(4))}</h3>;
      if (block.startsWith("## ")) return <h2 key={index} className="pt-2 text-xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-2xl">{inline(block.slice(3))}</h2>;
      if (block.startsWith("- ")) return <ul key={index} className="list-disc space-y-1 pl-5">{block.split("\n").map((line) => <li key={line}>{inline(line.replace(/^- /, ""))}</li>)}</ul>;
      return <p key={index}>{inline(block)}</p>;
    })}
  </div>;
}
