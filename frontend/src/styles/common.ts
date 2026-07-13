import type { CSSProperties } from "react";

export const colors = {
  dark: "#0f172a",
  darkEnd: "#020617",
  bgPage: "#f4f6f8",
  textMuted: "#64748b",
  border: "#e2e8f0",
  accent: "#38bdf8",
  accentDark: "#0ea5e9",
  danger: "#dc2626",
  success: "#16a34a",
  warning: "#d97706",
};

export const card: CSSProperties = {
  background: "#fff",
  border: `1px solid ${colors.border}`,
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
};

export const primaryButton: CSSProperties = {
  background: colors.dark,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "10px 16px",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
};

export const table: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

export const th: CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  borderBottom: `1px solid ${colors.border}`,
  background: "#f8fafc",
};

export const td: CSSProperties = {
  padding: "12px 14px",
  borderBottom: `1px solid ${colors.border}`,
};

export const iconBadge: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: `linear-gradient(135deg, ${colors.dark} 0%, #334155 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

export const pageHeaderTitle: CSSProperties = {
  fontFamily: "'Georgia', 'Times New Roman', serif",
  fontSize: 24,
  fontWeight: 700,
  color: colors.dark,
  margin: 0,
};

export const badge = (bg: string, fg: string): CSSProperties => ({
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  backgroundColor: bg,
  color: fg,
});