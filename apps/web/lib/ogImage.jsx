import { ImageResponse } from "next/og";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export const OG_IMAGE_CONTENT_TYPE = "image/png";

function cleanText(value, fallback = "") {
  return String(value || fallback)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shorten(value, maximumLength) {
  const text = cleanText(value);
  if (text.length <= maximumLength) return text;

  const shortened = text.slice(0, maximumLength - 1);
  const lastSpace = shortened.lastIndexOf(" ");
  const cutAt = lastSpace > maximumLength * 0.7 ? lastSpace : shortened.length;
  return `${shortened.slice(0, cutAt)}…`;
}

export function getOgTitleFontSize(value) {
  const length = cleanText(value).length;
  if (length <= 34) return 76;
  if (length <= 64) return 66;
  if (length <= 100) return 56;
  return 48;
}

export function normalizeOgData(data = {}) {
  const type =
    data.type === "interview"
      ? "interview"
      : data.type === "course"
        ? "course"
        : "topic";
  const title = shorten(data.title, 160) || "asif.to";
  const course = shorten(data.course || data.category, 52);
  const description = shorten(data.description, 180);

  return {
    type,
    title,
    course,
    description,
    label:
      type === "interview"
        ? "INTERVIEW QUESTIONS"
        : type === "course"
          ? "COURSE"
          : cleanText(data.label, course || "LEARNING GUIDE").toUpperCase(),
  };
}

export function renderOgImage(data) {
  const content = normalizeOgData(data);
  const titleFontSize = getOgTitleFontSize(content.title);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        background: "#fafafa",
        color: "#18181b",
        padding: "62px 72px 58px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 12,
          display: "flex",
        }}
      >
        <div style={{ width: "45%", background: "#2563eb" }} />
        <div style={{ width: "27%", background: "#06b6d4" }} />
        <div style={{ flex: 1, background: "#10b981" }} />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 0,
          }}
        >
          <span style={{ color: "#2563eb" }}>asif</span>
          <span style={{ color: "#18181b" }}>.to</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "2px solid #d4d4d8",
            color: content.type === "interview" ? "#b45309" : "#52525b",
            background: content.type === "interview" ? "#fffbeb" : "#ffffff",
            padding: "10px 16px",
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 0,
          }}
        >
          {content.label}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: 28,
          paddingBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            maxWidth: 1050,
            maxHeight: 210,
            fontSize: titleFontSize,
            lineHeight: 1.08,
            fontWeight: 800,
            letterSpacing: 0,
            overflow: "hidden",
            overflowWrap: "anywhere",
          }}
        >
          {content.title}
        </div>

        {(content.course || content.description) && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: titleFontSize >= 66 ? 28 : 22,
            }}
          >
            {content.course && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#2563eb",
                  fontSize: 27,
                  lineHeight: 1.2,
                  fontWeight: 700,
                  letterSpacing: 0,
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 5,
                    marginRight: 13,
                    background: "#10b981",
                  }}
                />
                {content.course}
              </div>
            )}
            {content.description && (
              <div
                style={{
                  display: "flex",
                  maxWidth: 970,
                  maxHeight: 66,
                  marginTop: 14,
                  color: "#52525b",
                  fontSize: 24,
                  lineHeight: 1.35,
                  fontWeight: 400,
                  letterSpacing: 0,
                  overflow: "hidden",
                  overflowWrap: "anywhere",
                }}
              >
                {content.description}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "2px solid #e4e4e7",
          paddingTop: 19,
          color: "#71717a",
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: 0,
        }}
      >
        <span>Practical web development, step by step</span>
        <span>asif.to</span>
      </div>
    </div>,
    OG_IMAGE_SIZE,
  );
}
