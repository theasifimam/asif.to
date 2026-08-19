"use client";

import React from "react";
import { getFormat } from "../../formats";

/**
 * SlideFrame — shared wrapper for every template.
 *
 * Handles:
 * - Exact pixel dimensions from format config
 * - Dark background
 * - Branding footer (logo, domain, handle)
 * - Slide number badge
 * - Category badge
 * - Accent color strip
 * - Safe-area padding
 */
export default function SlideFrame({
  children,
  format = "square-1080",
  settings = {},
  slideIndex,
  totalSlides,
  className = "",
}) {
  const fmt = getFormat(format);
  const {
    accentColor = "#2563eb",
    showBranding = true,
    showSlideNumbers = true,
    showCategory = true,
    footerText = "asif.to",
  } = settings;

  const category = settings._category || "";

  return (
    <div
      className={`slide-frame ${className}`}
      style={{
        width: fmt.width,
        height: fmt.height,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "#0a0a0f",
        color: "#f4f4f5",
        fontFamily: "'Inter', 'Outfit', sans-serif",
        whiteSpace: "pre-line",
      }}
    >
      {/* Accent top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: accentColor,
        }}
      />

      {/* Decorative gradient orb */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Header row: category + slide number */}
      {(showCategory && category) || (showSlideNumbers && totalSlides > 1) ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "40px 52px 0",
            flexShrink: 0,
          }}
        >
          {showCategory && category ? (
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: accentColor,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {category}
            </span>
          ) : (
            <span />
          )}
          {showSlideNumbers && totalSlides > 1 && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              {String(slideIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
            </span>
          )}
        </div>
      ) : null}

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "40px 52px",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      {/* Footer branding */}
      {showBranding && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 52px 36px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Simple text logo */}
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 900,
                fontSize: 16,
                letterSpacing: "-0.02em",
                color: "#ffffff",
              }}
            >
              asif
              <span style={{ color: accentColor }}>.to</span>
            </span>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.3)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {footerText !== "asif.to" ? footerText : "@theasifto"}
          </span>
        </div>
      )}
    </div>
  );
}
