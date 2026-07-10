import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const categoryOptions = [
  "FOOD",
  "FAST_FOOD",
  "HOT_DRINK",
  "COLD_DRINK",
  "DESSERT",
  "SNACK",
];

function AddProduct() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/products", {
        name,
        category,
        price: Number(price),
      });

      navigate("/admin/products");
    } catch (submitError) {
      console.error("Error creating product:", submitError);
      setError("Unable to create product. Check the submitted values.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={cardStyle}>
      <h1 style={{ marginTop: 0 }}>Add Product</h1>
      <p style={{ color: "#64748b" }}>
        Create a new product that can later be used in sales and promotions.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16, maxWidth: 520 }}>
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
        </Field>

        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Price">
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={inputStyle}
            required
          />
        </Field>

        {error && <div style={errorStyle}>{error}</div>}

        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={loading} style={primaryButtonStyle}>
            {loading ? "Saving..." : "Save product"}
          </button>
          <button type="button" onClick={() => navigate("/admin/products")} style={secondaryButtonStyle}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  background: "#fff",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "none",
  background: "#0f172a",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  background: "#fef2f2",
  color: "#b91c1c",
  border: "1px solid #fecaca",
};

export default AddProduct;