import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function FranchiseLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <Navbar />

        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 30px",
            backgroundColor: "#f4f6f8",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default FranchiseLayout;