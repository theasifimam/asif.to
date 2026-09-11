const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "";

export const avatarUrl = (avatar) =>
  !avatar ? "" : avatar.startsWith("http") ? avatar : `${STORAGE_URL}${avatar}`;

export const idOf = (value) => String(value?._id || value || "");

export const formatTime = (date) =>
  date
    ? new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(date))
    : "";

export const formatBytes = (size = 0) => {
  if (size < 1024) return `${size} B`;
  if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1048576).toFixed(1)} MB`;
};

export const conversationName = (conversation, userId) =>
  conversation?.type === "channel"
    ? `#${conversation.name}`
    : conversation?.members?.find((member) => idOf(member) !== String(userId))
        ?.fullName || "Direct message";

export const otherMember = (conversation, userId) =>
  conversation?.members?.find((member) => idOf(member) !== String(userId));

export const getBubbleRadius = (mine, isFirst, isMiddle, isLast, isSingle) => {
  if (mine) {
    if (isSingle) return "rounded-3xl rounded-br-[4px]";
    if (isFirst) return "rounded-3xl rounded-br-[8px]";
    if (isMiddle) return "rounded-l-3xl rounded-r-[8px]";
    if (isLast) return "rounded-l-3xl rounded-tr-[8px] rounded-br-[4px]";
  } else {
    if (isSingle) return "rounded-3xl rounded-bl-[4px]";
    if (isFirst) return "rounded-3xl rounded-bl-[8px]";
    if (isMiddle) return "rounded-r-3xl rounded-l-[8px]";
    if (isLast) return "rounded-r-3xl rounded-tl-[8px] rounded-bl-[4px]";
  }
  return "rounded-3xl";
};

export const encodeContentCards = (text = "", contentCards = []) => {
  if (!contentCards || !contentCards.length) return text;
  const cardsPayload = contentCards
    .map((c) => `[admin-card:${JSON.stringify(c)}]`)
    .join("\n");
  return text.trim() ? `${text.trim()}\n${cardsPayload}` : cardsPayload;
};

export const parseContentCards = (rawContent = "") => {
  if (!rawContent || typeof rawContent !== "string") {
    return { text: "", cards: [] };
  }
  const cards = [];
  const cardRegex = /\[admin-card:(\{.*?\})\]/g;
  let match;
  while ((match = cardRegex.exec(rawContent)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      cards.push(parsed);
    } catch {
      // ignore
    }
  }
  const cleanText = rawContent.replace(cardRegex, "").trim();
  return { text: cleanText, cards };
};
