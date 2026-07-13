import { useState } from "react";
import type { CSSProperties } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CloudSun,
  Users,
  Store,
  FileText,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Package,
  Tag,
  UtensilsCrossed,
  Receipt,
  Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type NavChild = {
  label: string;
  path: string;
};

type NavItem = {
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: NavChild[];
};

const adminNavItems: NavItem[] = [
  { label: "Tableau de bord", icon: LayoutDashboard, path: "/admin" },
  {
    label: "Produits",
    icon: Package,
    children: [
      { label: "Tous les produits", path: "/admin/products" },
      { label: "Ajouter un produit", path: "/admin/products/new" },
    ],
  },
  { label: "Ventes", icon: TrendingUp, path: "/admin/sales" },
  { label: "Promotions", icon: Tag, path: "/admin/promotions" },
  { label: "Predictions", icon: CloudSun, path: "/admin/predictions" },
  { label: "Alertes", icon: Bell, path: "/admin/alerts" },
  { label: "Franchises", icon: Store, path: "/admin/franchises" },
  { label: "Weather", icon: CloudSun, path: "/admin/weather" },
  { label: "Rapports", icon: FileText, path: "/admin/reports" },
  { label: "Parametres", icon: Settings, path: "/admin/settings" },
];

const franchiseNavItems: NavItem[] = [
  { label: "Tableau de bord", icon: LayoutDashboard, path: "/franchise" },
  { label: "Meteo", icon: CloudSun, path: "/franchise/weather" },
  { label: "Menu produits", icon: UtensilsCrossed, path: "/franchise/menu" },
  { label: "Nouveau ticket", icon: Receipt, path: "/franchise/tickets/new" },
  { label: "Mes tickets", icon: TrendingUp, path: "/franchise/tickets" },
  { label: "Parametres", icon: Settings, path: "/franchise/settings" },
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { user } = useAuth();

  const role: "admin" | "franchise" = user?.role === "ADMIN" ? "admin" : "franchise";
  const items = role === "admin" ? adminNavItems : franchiseNavItems;

  const toggleMenu = (label: string) => {
    if (collapsed) return;
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  return (
    <aside
      style={{
        ...styles.aside,
        width: collapsed ? "76px" : "260px",
      }}
    >
      {/* Header / brand */}
      <div style={styles.brand}>
        <div style={styles.brandIcon}>
          <CloudSun size={20} color="#fff" />
        </div>
        {!collapsed && (
          <div style={{ lineHeight: 1.15, overflow: "hidden" }}>
            <div style={styles.brandTitle}>Sales Weather</div>
            <div style={styles.brandSubtitle}>
              {role === "admin" ? "Admin" : "Franchise"}
            </div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav style={styles.nav}>
        {items.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children?.length;
          const isOpen = openMenu === item.label;

          if (hasChildren) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  style={styles.navButton}
                  title={collapsed ? item.label : undefined}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!collapsed && (
                    <>
                      <span style={styles.navLabel}>{item.label}</span>
                      <ChevronDown
                        size={16}
                        style={{
                          transition: "transform 0.2s ease",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          flexShrink: 0,
                        }}
                      />
                    </>
                  )}
                </button>

                {!collapsed && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      transition: "grid-template-rows 0.25s ease",
                    }}
                  >
                    <div style={{ overflow: "hidden" }}>
                      {item.children!.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          style={({ isActive }) => ({
                            ...styles.subLink,
                            ...(isActive ? styles.subLinkActive : {}),
                          })}
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.path!}
              title={collapsed ? item.label : undefined}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => {
          setCollapsed((prev) => !prev);
          setOpenMenu(null);
        }}
        style={styles.collapseButton}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        {!collapsed && <span style={{ fontSize: "13px" }}>Reduire</span>}
      </button>
    </aside>
  );
}

const styles: Record<string, CSSProperties> = {
  aside: {
    height: "100vh",
    background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
    color: "#cbd5e1",
    display: "flex",
    flexDirection: "column",
    transition: "width 0.2s ease",
    overflow: "hidden",
    flexShrink: 0,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "18px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    minHeight: "70px",
    boxSizing: "border-box",
  },
  brandIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandTitle: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: "16px",
    fontWeight: 700,
    color: "#fff",
    whiteSpace: "nowrap",
  },
  brandSubtitle: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#94a3b8",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  nav: {
    flex: 1,
    padding: "12px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    overflowY: "auto",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "8px",
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "14px",
    borderLeft: "3px solid transparent",
    transition: "background-color 0.15s ease, color 0.15s ease",
  },
  navLinkActive: {
    backgroundColor: "rgba(56,189,248,0.12)",
    color: "#fff",
    borderLeft: "3px solid #38bdf8",
  },
  navButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "8px",
    color: "#cbd5e1",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "left",
  },
  navLabel: {
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  subLink: {
    display: "block",
    padding: "8px 12px 8px 46px",
    fontSize: "13px",
    color: "#94a3b8",
    textDecoration: "none",
    borderRadius: "8px",
  },
  subLinkActive: {
    color: "#38bdf8",
    backgroundColor: "rgba(56,189,248,0.08)",
  },
  collapseButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px",
    background: "transparent",
    border: "none",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "13px",
  },
};

export default Sidebar;