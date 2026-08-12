import { ImageResponse } from "next/og";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_CONTENT_TYPE = "image/png";

// --- Utilities ---

const cleanText = (value, fallback = "") =>
  String(value || fallback)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const shorten = (value, maximumLength) => {
  const text = cleanText(value);
  if (text.length <= maximumLength) return text;

  const shortened = text.slice(0, maximumLength - 1);
  const lastSpace = shortened.lastIndexOf(" ");
  const cutAt = lastSpace > maximumLength * 0.7 ? lastSpace : shortened.length;
  return `${shortened.slice(0, cutAt)}…`;
};

const getOgTitleFontSize = (titleLength) => {
  if (titleLength <= 34) return 72;
  if (titleLength <= 64) return 64;
  if (titleLength <= 100) return 56;
  return 48;
};

const normalizeOgData = (data = {}) => {
  // Cleaner type assignment using array includes
  const type = ["interview", "course"].includes(data.type)
    ? data.type
    : "topic";
  const course = shorten(data.course || data.category, 52);

  return {
    type,
    title: shorten(data.title, 160) || "asif.to",
    course,
    description: shorten(data.description, 180),
    label:
      type === "interview"
        ? "INTERVIEW PREP"
        : type === "course"
          ? "COURSE"
          : cleanText(data.label, course || "LEARNING GUIDE").toUpperCase(),
  };
};

// --- Component ---

export function renderOgImage(data) {
  const content = normalizeOgData(data);
  const titleFontSize = getOgTitleFontSize(content.title.length);
  const isInterview = content.type === "interview";

  // Centralized theme object keeps the JSX clean and modular
  const theme = {
    brandBlue: "#2563eb",
    brandDark: "#09090b",
    emeraldText: "#059669",
    emeraldGlow: "#10b981",
    textMuted: "#52525b",
    textLight: "#71717a",
    bgCanvas: "#f4f4f5",
    bgCard: "#ffffff",
    borderCard: "#e4e4e7",
    tagBg: isInterview ? "#fffbeb" : "#eff6ff",
    tagText: isInterview ? "#d97706" : "#2563eb",
  };

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: "48px",
        backgroundColor: theme.bgCanvas,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Bento Card Container */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: theme.bgCard,
          borderRadius: "40px",
          border: `1px solid ${theme.borderCard}`,
          padding: "56px 64px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
        }}
      >
        {/* Header */}
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
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-1px",
            }}
          >
            <span style={{ color: theme.brandBlue }}>asif</span>
            <span style={{ color: theme.brandDark }}>.to</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 20px",
              borderRadius: "999px",
              backgroundColor: theme.tagBg,
              color: theme.tagText,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            {content.label}
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {content.course && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: theme.emeraldText,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: theme.emeraldGlow,
                  marginRight: 12,
                }}
              />
              {content.course}
            </div>
          )}

          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 800,
              color: theme.brandDark,
              lineHeight: 1.15,
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
                color: theme.textMuted,
                lineHeight: 1.5,
                maxWidth: "850px",
                marginTop: "12px",
                fontWeight: 400,
              }}
            >
              {content.description}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `2px solid ${theme.bgCanvas}`,
            paddingTop: "28px",
            marginTop: "20px",
          }}
        >
          <div
            style={{ color: theme.textLight, fontSize: 18, fontWeight: 500 }}
          >
            Practical web development, step by step
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
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
