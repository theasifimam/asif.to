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
  if (length <= 34) return 72;
  if (length <= 64) return 64;
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
        ? "INTERVIEW PREP"
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
        padding: "40px",
        backgroundColor: "#09090b", // Deep, sleek background
        backgroundImage:
          "radial-gradient(circle at 25% 25%, #18181b 0%, #09090b 100%)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Bento-style inner card */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#18181b",
          borderRadius: "32px",
          border: "1px solid #27272a",
          padding: "56px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
        }}
      >
        {/* Top Bar: Brand & Label */}
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
              fontSize: 36,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-1px",
            }}
          >
            <span style={{ color: "#3b82f6" }}>asif</span>
            <span style={{ color: "#a1a1aa" }}>.to</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 20px",
              borderRadius: "999px",
              backgroundColor:
                content.type === "interview"
                  ? "rgba(245, 158, 11, 0.1)"
                  : "rgba(59, 130, 246, 0.1)",
              border:
                content.type === "interview"
                  ? "1px solid rgba(245, 158, 11, 0.3)"
                  : "1px solid rgba(59, 130, 246, 0.3)",
              color: content.type === "interview" ? "#fcd34d" : "#93c5fd",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "1px",
            }}
          >
            {content.label}
          </div>
        </div>

        {/* Main Content Area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {content.course && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#10b981",
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "-0.5px",
              }}
            >
              {/* Glowing status indicator */}
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  marginRight: 12,
                  boxShadow: "0 0 12px #10b981",
                }}
              />
              {content.course}
            </div>
          )}

          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              maxWidth: "900px",
            }}
          >
            {content.title}
          </div>

          {content.description && (
            <div
              style={{
                fontSize: 24,
                color: "#a1a1aa",
                lineHeight: 1.5,
                maxWidth: "850px",
                marginTop: "8px",
              }}
            >
              {content.description}
            </div>
          )}
        </div>

        {/* Bottom Footer Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #27272a",
            paddingTop: "24px",
            marginTop: "20px",
          }}
        >
          <div style={{ color: "#71717a", fontSize: 18, fontWeight: 500 }}>
            Practical web development, step by step
          </div>

          {/* Decorative minimalist dots replacing the old chunky bars */}
          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#3b82f6",
              }}
            />
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#06b6d4",
              }}
            />
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#10b981",
              }}
            />
          </div>
        </div>
      </div>
    </div>,
    OG_IMAGE_SIZE,
  );
}
