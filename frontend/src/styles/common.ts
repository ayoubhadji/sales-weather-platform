import type { CSSProperties } from "react";

export const colors = {
  dark: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
  accent: "#38bdf8",
  accentDark: "#0ea5e9",
  danger: "#dc2626",
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