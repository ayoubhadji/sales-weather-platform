import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type PageHeaderProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

function PageHeader({
  icon: Icon,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div
      style={{
        marginBottom: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <Icon size={20} />
        </div>

        <div>
          <h1 style={{ margin: 0 }}>{title}</h1>

          {description && (
            <p
              style={{
                margin: "6px 0 0",
                color: "#64748b",
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

export default PageHeader;