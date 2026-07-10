import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import type { Product } from "../../types/Product";

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error loading admin products:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <h2>Loading products...</h2>;
  }

  return (
    <div>
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0 }}>Products</h1>
          <p style={{ margin: "8px 0 0", color: "#64748b" }}>
            Manage the product catalog used by admin and franchise flows.
          </p>
        </div>

        <Link to="/admin/products/new" style={buttonStyle}>
          Add product
        </Link>
      </div>

      <div style={tableShellStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Price</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} style={emptyCellStyle}>
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td style={tdStyle}>{product.id}</td>
                  <td style={tdStyle}>{product.name}</td>
                  <td style={tdStyle}>{product.category}</td>
                  <td style={tdStyle}>{product.price} DT</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 20,
};

const buttonStyle: React.CSSProperties = {
  background: "#0f172a",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 700,
};

const tableShellStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid #e2e8f0",
};

const emptyCellStyle: React.CSSProperties = {
  padding: 24,
  textAlign: "center",
  color: "#64748b",
};

export default Products;