import { useState } from "react";
import api from "../services/api";

type Props = {
  onClose: () => void;
  onSaved: () => void;
};

function ModalAddFranchise({
  onClose,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);

  async function handleSave() {
    
    if (!name || !email || !password) {
  alert("Name, email and password are required.");
  return;
}

    setLoading(true);

    try {
      await api.post("/users", {
        name,
        email,
        password,
        city,
        address,
        phone,
        role: "FRANCHISE",
        isActive,
      });

      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Unable to create franchise.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />

      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0 }}>Add Franchise</h2>

          <button
            style={closeButton}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div style={bodyStyle}>

          <Field label="Franchise Name">
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label="Email">
            <input
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Field label="City">
            <input
              style={inputStyle}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </Field>

          <Field label="Address">
            <input
              style={inputStyle}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Field>

          <Field label="Phone">
            <input
              style={inputStyle}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>

          <Field label="Status">
            <select
              style={inputStyle}
              value={String(isActive)}
              onChange={(e) =>
                setIsActive(e.target.value === "true")
              }
            >
              <option value="true">
                Active
              </option>

              <option value="false">
                Inactive
              </option>
            </select>
          </Field>
                  </div>

        <div style={footerStyle}>
          <button
            style={cancelButton}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            style={saveButton}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Franchise"}
          </button>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: "block",
          marginBottom: 6,
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,.55)",
  backdropFilter: "blur(4px)",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "650px",
  maxWidth: "95%",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 30px 80px rgba(0,0,0,.25)",
  zIndex: 1001,
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "22px 24px",
  borderBottom: "1px solid #e2e8f0",
};

const bodyStyle: React.CSSProperties = {
  padding: "24px",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  padding: "20px 24px",
  borderTop: "1px solid #e2e8f0",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  boxSizing: "border-box",
};

const closeButton: React.CSSProperties = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 20,
  color: "#64748b",
};

const cancelButton: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const saveButton: React.CSSProperties = {
  padding: "12px 22px",
  borderRadius: 10,
  border: "none",
  background: "#0f172a",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};

export default ModalAddFranchise;