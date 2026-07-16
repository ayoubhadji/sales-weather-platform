import { useEffect, useState } from "react";
import api from "../services/api";
import type { FranchiseStats } from "../types/FranchiseStats";

type Props = {
  franchise: FranchiseStats;
  onClose: () => void;
  onSaved: () => void;
};

type UserDetails = {
  id: number;
  name: string;
  email: string;
  city?: string;
  address?: string;
  phone?: string;
  role: string;
  isActive: boolean;
};

function ModalEditFranchise({
  franchise,
  onClose,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("FRANCHISE");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const response = await api.get(`/users/${franchise.id}`);

      const user: UserDetails = response.data;

      setName(user.name);
      setEmail(user.email);
      setCity(user.city ?? "");
      setAddress(user.address ?? "");
      setPhone(user.phone ?? "");
      setRole(user.role);
      setIsActive(user.isActive);
    } catch (error) {
      console.error(error);
      alert("Unable to load franchise.");
      onClose();
    } finally {
      setLoadingUser(false);
    }
  }

  async function handleSave() {
    setLoading(true);

    try {
      const payload: any = {
        name,
        email,
        city,
        address,
        phone,
        role,
        isActive,
      };

      if (password.trim() !== "") {
        payload.password = password;
      }

      await api.patch(`/users/${franchise.id}`, payload);

      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Unable to update franchise.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />

      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0 }}>Edit Franchise</h2>

          <button
            style={closeButton}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {loadingUser ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
            }}
          >
            Loading...
          </div>
        ) : (
          <>
            <div style={bodyStyle}>

              <Field label="Franchise Name">
                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  style={inputStyle}
                />
              </Field>

              <Field label="Email">
                <input
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  style={inputStyle}
                />
              </Field>

              <Field label="City">
                <input
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                  style={inputStyle}
                />
              </Field>

              <Field label="Address">
                <input
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  style={inputStyle}
                />
              </Field>

              <Field label="Phone">
                <input
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  style={inputStyle}
                />
              </Field>

              <Field label="New Password">
                <input
                  type="password"
                  placeholder="Leave empty to keep current password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  style={inputStyle}
                />
              </Field>

              <Field label="Status">
                <select
                  value={String(isActive)}
                  onChange={(e) =>
                    setIsActive(e.target.value === "true")
                  }
                  style={inputStyle}
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
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                    </div>
                </>
                )}
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
        background: "rgba(15,23,42,0.55)",
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

        export default ModalEditFranchise;