function Navbar() {
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
      }}
    >
      <h2>Sales Weather Prediction Platform</h2>

      <div>
        <strong>Admin</strong>
      </div>
    </header>
  );
}

export default Navbar;