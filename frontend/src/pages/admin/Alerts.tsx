import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  BrainCircuit,
  CheckCircle2,
  Circle,
  CloudSun,
  Info,
  Package,
  Percent,
  Settings,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import api from "../../services/api";
import { card, colors } from "../../styles/common";
import type { Alert } from "../../types/Alert";

type SeverityMeta = {
  label: string;
  color: string;
  bg: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
};

type AlertType = Alert["type"];

type AlertTypeMeta = {
  label: string;
  meaning: string;
  color: string;
  bg: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
};

const ALERT_TYPE_META: Record<AlertType, AlertTypeMeta> = {
  WEATHER: { label: "Weather", meaning: "Weather-related impact", color: "#0f766e", bg: "#ccfbf1", icon: CloudSun },
  ML: { label: "ML", meaning: "Prediction/model issue", color: "#7c3aed", bg: "#ede9fe", icon: BrainCircuit },
  PROMOTION: { label: "Promotion", meaning: "Promotion recommendation/event", color: "#c2410c", bg: "#ffedd5", icon: Percent },
  SALES: { label: "Sales", meaning: "Sales anomaly", color: "#0369a1", bg: "#e0f2fe", icon: TrendingDown },
  PRODUCT: { label: "Product", meaning: "Product-related alert", color: "#a16207", bg: "#fef9c3", icon: Package },
  SYSTEM: { label: "System", meaning: "Technical/system issue", color: "#475569", bg: "#e2e8f0", icon: Settings },
};

function getAlertTypeMeta(type?: string): AlertTypeMeta {
  return ALERT_TYPE_META[type as AlertType] ?? ALERT_TYPE_META.SYSTEM;
}

// Normalizes whatever string your backend sends (critical/high/warning/info/etc.)
// into a consistent visual treatment. Add more aliases here if your Severity
// enum uses different values than what's mapped below.
function getSeverityMeta(severity: string): SeverityMeta {
  const key = severity?.toLowerCase();
  if (key === "critical" || key === "high") {
    return { label: "Critical", color: "#dc2626", bg: "#dc26261a", icon: ShieldAlert };
  }
  if (key === "warning" || key === "medium") {
    return { label: "Warning", color: "#f59e0b", bg: "#f59e0b1a", icon: AlertTriangle };
  }
  return { label: "Info", color: "#2563eb", bg: "#2563eb1a", icon: Info };
}

function timeAgo(value?: string) {
  if (!value) return null;
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string | "all">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    void loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const response = await api.get("/alerts");
      setAlerts(response.data);
    } catch (error) {
      console.error("Error loading admin alerts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(alert: Alert) {
    if (alert.isRead) return;
    setUpdatingId(alert.id);

    // Optimistic update so the UI feels immediate.
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, isRead: true } : a)),
    );

    try {
      await api.patch(`/alerts/${alert.id}`, { isRead: true });
    } catch (error) {
      console.error("Error marking alert as read:", error);
      // Roll back on failure.
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, isRead: false } : a)),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    alerts.forEach((a) => {
      const label = getSeverityMeta(a.severity).label;
      counts[label] = (counts[label] ?? 0) + 1;
    });
    return counts;
  }, [alerts]);

  const unreadCount = useMemo(() => alerts.filter((a) => !a.isRead).length, [alerts]);

  const filtered = useMemo(() => {
    return alerts
      .filter((a) => (severityFilter === "all" ? true : getSeverityMeta(a.severity).label === severityFilter))
      .filter((a) => (unreadOnly ? !a.isRead : true));
  }, [alerts, severityFilter, unreadOnly]);

  return (
    <div>
      <PageHeader
        icon={Bell}
        title="Alerts"
        description="Monitor warning messages and their read/unread state."
      />

      {/* Status strip */}
      <div style={statusStrip}>
        <StatChip
          label="Unread"
          count={unreadCount}
          color={colors.dark}
          active={unreadOnly}
          onClick={() => setUnreadOnly((v) => !v)}
        />
        {["Critical", "Warning", "Info"].map((label) => (
          <StatChip
            key={label}
            label={label}
            count={severityCounts[label] ?? 0}
            color={getSeverityMeta(label.toLowerCase()).color}
            active={severityFilter === label}
            onClick={() => setSeverityFilter(severityFilter === label ? "all" : label)}
          />
        ))}
      </div>

      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        {loading ? (
          <LoadingRows />
        ) : filtered.length === 0 ? (
          <EmptyState hasFilter={severityFilter !== "all" || unreadOnly} />
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 36 }}></th>
                <th style={thStyle}>Severity</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Message</th>
                <th style={thStyle}>Raised</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => {
                const meta = getSeverityMeta(alert.severity);
                const SeverityIcon = meta.icon;
                return (
                  <tr
                    key={alert.id}
                    style={{
                      ...rowStyle,
                      background: alert.isRead ? "transparent" : "#fafbff",
                    }}
                  >
                    <td style={tdStyle}>
                      <Circle
                        size={8}
                        fill={alert.isRead ? "transparent" : "#2563eb"}
                        color={alert.isRead ? colors.border : "#2563eb"}
                      />
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          ...severityBadge,
                          background: meta.bg,
                          color: meta.color,
                        }}
                      >
                        <SeverityIcon size={12} color={meta.color} />
                        {meta.label}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {(() => {
                        const typeMeta = getAlertTypeMeta(alert.type);
                        const TypeIcon = typeMeta.icon;
                        return (
                          <span
                            title={typeMeta.meaning}
                            style={{
                              ...typeBadge,
                              background: typeMeta.bg,
                              color: typeMeta.color,
                            }}
                          >
                            <TypeIcon size={13} color={typeMeta.color} />
                            {typeMeta.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: alert.isRead ? 500 : 700,
                        color: colors.dark,
                      }}
                    >
                      {alert.title}
                    </td>
                    <td style={{ ...tdStyle, color: colors.textMuted, maxWidth: 360 }}>
                      {alert.message}
                    </td>
                    <td style={{ ...tdStyle, color: colors.textMuted, fontSize: 13 }}>
                      {timeAgo(alert.createdAt) ?? "—"}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {alert.isRead ? (
                        <span style={readTag}>
                          <CheckCircle2 size={14} />
                          Read
                        </span>
                      ) : (
                        <button
                          style={{
                            ...markReadButton,
                            opacity: updatingId === alert.id ? 0.6 : 1,
                          }}
                          onClick={() => markAsRead(alert)}
                          disabled={updatingId === alert.id}
                        >
                          Mark as read
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatChip({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...statChip,
        border: active ? `2px solid ${color}` : `1px solid ${colors.border}`,
        color: active ? color : colors.dark,
      }}
    >
      <span style={{ ...statDot, background: color }} />
      {label}
      <span style={{ ...statCount, color }}>{count}</span>
    </button>
  );
}

function LoadingRows() {
  return (
    <div style={{ padding: 24 }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: 44,
            borderRadius: 8,
            background: "#f1f5f9",
            marginBottom: 12,
            opacity: 1 - i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div style={emptyState}>
      <Bell size={32} color={colors.textMuted} />
      <p style={{ margin: 0, fontWeight: 600, color: colors.dark }}>
        {hasFilter ? "No alerts match this filter" : "All clear"}
      </p>
      <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>
        {hasFilter ? "Try a different severity or view all alerts." : "No alerts to show right now."}
      </p>
    </div>
  );
}

const typeBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "5px 8px",
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const statusStrip: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  margin: "20px 0 24px",
};

const statChip: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 14px",
  borderRadius: 999,
  background: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const statDot: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  flexShrink: 0,
};

const statCount: React.CSSProperties = {
  fontWeight: 700,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  background: "#f8fafc",
  borderBottom: `1px solid ${colors.border}`,
  fontSize: 13,
  color: colors.textMuted,
  fontWeight: 600,
};

const rowStyle: React.CSSProperties = {
  transition: "background 0.15s ease",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: `1px solid ${colors.border}`,
  fontSize: 14,
  verticalAlign: "middle",
};

const severityBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const readTag: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  color: "#16a34a",
  fontWeight: 600,
};

const markReadButton: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  background: "#fff",
  fontSize: 13,
  fontWeight: 600,
  color: colors.dark,
  cursor: "pointer",
};

const emptyState: React.CSSProperties = {
  padding: "48px 24px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  textAlign: "center",
};

export default Alerts;