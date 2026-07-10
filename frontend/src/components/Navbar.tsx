import { useState, useRef, useEffect } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, LogOut, ChevronDown, User, CloudSun } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Ferme le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };

  const handleSettings = () => {
    setOpen(false);
    navigate(user?.role === "ADMIN" ? "/admin/settings" : "/franchise/settings");
  };

  const roleLabel = user?.role === "ADMIN" ? "Administrateur" : "Franchise";

  return (
    <header
      style={{
        height: "70px",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 30px",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CloudSun size={20} color="#fff" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          <span
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: "19px",
              fontWeight: 700,
              color: "#1e293b",
              letterSpacing: "-0.01em",
            }}
          >
            Sales Weather
          </span>
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              color: "#64748b",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Prediction Platform
          </span>
        </div>
      </div>

      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "8px 10px",
            borderRadius: "6px",
            fontSize: "14px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eceef0")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "#1e293b",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={16} />
          </div>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }}>
            <strong>{user?.name ?? "..."}</strong>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
              {roleLabel}
            </span>
          </span>
          <ChevronDown
            size={16}
            style={{
              transition: "transform 0.2s ease",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              backgroundColor: "#fff",
              border: "1px solid #e2e4e8",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              minWidth: "180px",
              overflow: "hidden",
              zIndex: 100,
            }}
          >
            <button
              onClick={handleSettings}
              style={menuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Settings size={16} />
              Parametres
            </button>
            <div style={{ height: "1px", backgroundColor: "#eee" }} />
            <button
              onClick={handleLogout}
              style={{ ...menuItemStyle, color: "#dc2626" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <LogOut size={16} />
              Deconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

const menuItemStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 14px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  textAlign: "left",
};

export default Navbar;