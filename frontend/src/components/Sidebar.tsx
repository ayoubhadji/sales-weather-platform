import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Weather", path: "/weather" },
    { name: "Sales", path: "/sales" },
    { name: "Predictions", path: "/predictions" },
    { name: "Promotions", path: "/promotions" },
    { name: "Alerts", path: "/alerts" },
  ];

  return (
    <div
      style={{
        width: "220px",
        backgroundColor: "#1e293b",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h2>🌦 SWP</h2>

      <hr />

      {menuItems.map((item) => (
        <div key={item.path} style={{ margin: "20px 0" }}>
          <NavLink
            to={item.path}
            style={{
              color: "white",
              textDecoration: "none",
            }}
          >
            {item.name}
          </NavLink>
        </div>
      ))}
    </div>
  );
}

export default Sidebar;