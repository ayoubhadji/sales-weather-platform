import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "220px",
        background: "#2c3e50",
        color: "white",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      <h2>SWP</h2>

      <hr />

      <p><Link to="/">Dashboard</Link></p>
      <p><Link to="/products">Products</Link></p>
      <p><Link to="/weather">Weather</Link></p>
      <p><Link to="/sales">Sales</Link></p>
      <p><Link to="/predictions">Predictions</Link></p>
      <p><Link to="/promotions">Promotions</Link></p>
      <p><Link to="/alerts">Alerts</Link></p>
    </div>
  );
}

export default Sidebar;