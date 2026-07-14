import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import type { Product } from "../../types/Product";
import PageHeader from "../../components/PageHeader";
import { card, colors, primaryButton } from "../../styles/common";
import { Package, Plus, Pencil, Trash2, Search, ImageOff, Camera, X } from "lucide-react";

const CATEGORIES = ["FOOD", "FAST_FOOD", "HOT_DRINK", "COLD_DRINK", "DESSERT", "SNACK"];

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const [editImage, setEditImage] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadProducts();
  }, []);

  // Close on Escape + lock background scroll while the modal is open
  useEffect(() => {
    if (!editingProduct) return;

    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditingProduct(null);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingProduct]);

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

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      window.alert("Could not delete this product.");
    } finally {
      setDeletingId(null);
    }
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setEditName(product.name);
    setEditCategory(product.category);
    setEditPrice(product.price.toString());
    setEditImage(null);
    setEditPreview(product.imageUrl ? `http://localhost:3000${product.imageUrl}` : "");
  }

  async function handleUpdateProduct() {
    if (!editingProduct) return;

    setSaving(true);

    try {
      let imageUrl = editingProduct.imageUrl;

      // Upload a new image only if the user selected one
      if (editImage) {
        const formData = new FormData();
        formData.append("file", editImage);

        const uploadResponse = await api.post("/products/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imageUrl = uploadResponse.data.imageUrl;
      }

      await api.patch(`/products/${editingProduct.id}`, {
        name: editName,
        category: editCategory,
        price: Number(editPrice),
        imageUrl,
      });

      await loadProducts();
      setEditingProduct(null);
    } catch (error) {
      console.error(error);
      alert("Unable to update the product.");
    } finally {
      setSaving(false);
    }
  }

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  return (
    <div>
      <style>{modalKeyframes}</style>

      <PageHeader
        icon={Package}
        title="Products"
        description={`${products.length} product(s) in the catalog used by admin and franchise flows.`}
        action={
          <Link to="/admin/products/new" style={{ ...primaryButton, textDecoration: "none" }}>
            <Plus size={16} />
            Add product
          </Link>
        }
      />

      <div style={{ position: "relative", maxWidth: 320, marginBottom: 20 }}>
        <Search
          size={16}
          color={colors.textMuted}
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or category..."
          style={{
            width: "100%",
            padding: "10px 12px 10px 36px",
            borderRadius: 10,
            border: `1px solid ${colors.border}`,
            fontSize: 14,
            boxSizing: "border-box",
            backgroundColor: "#fff",
          }}
        />
      </div>

      {loading ? (
        <ProductGridSkeleton />
      ) : filteredProducts.length === 0 ? (
        <div style={card}>
          <p style={{ color: colors.textMuted, margin: 0 }}>No products found.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
            gap: 20,
          }}
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              style={{
                ...card,
                padding: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 160,
                  background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                  position: "relative",
                }}
              >
                {product.imageUrl ? (
                  <img
                    src={`http://localhost:3000${product.imageUrl}`}
                    alt={product.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                      if (placeholder) placeholder.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  style={{
                    display: product.imageUrl ? "none" : "flex",
                    position: "absolute",
                    inset: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 6,
                    color: colors.textMuted,
                  }}
                >
                  <ImageOff size={26} />
                  <span style={{ fontSize: 11 }}>No image</span>
                </div>

                <span
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: 10,
                    backgroundColor: "rgba(15,23,42,0.75)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    padding: "3px 9px",
                    borderRadius: 999,
                  }}
                >
                  {product.category}
                </span>
              </div>

              <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: colors.dark, marginBottom: 4 }}>
                  {product.name}
                </div>
                <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 10 }}>
                  ID #{product.id}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: colors.accentDark, marginBottom: 14 }}>
                  {product.price} DT
                </div>

                <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                  <button onClick={() => openEditModal(product)} style={editButtonStyle}>
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    style={deleteButtonStyle}
                  >
                    <Trash2 size={14} />
                    {deletingId === product.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit product modal */}
      {editingProduct && (
        <div style={overlayStyle} onClick={() => setEditingProduct(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setEditingProduct(null)}
              style={closeButtonStyle}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h2 style={{ margin: "0 0 20px", fontSize: 19, color: colors.dark }}>Edit Product</h2>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {/* Photo picker */}
              <div style={{ width: 180, flexShrink: 0 }}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="photo-drop"
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 14,
                    border: `1.5px dashed ${colors.border}`,
                    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  {editPreview ? (
                    <img
                      src={editPreview}
                      alt="preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        color: colors.textMuted,
                      }}
                    >
                      <ImageOff size={26} />
                      <span style={{ fontSize: 11 }}>No image</span>
                    </div>
                  )}

                  <div className="photo-drop-overlay">
                    <Camera size={20} color="#fff" />
                    <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>
                      Change photo
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (!e.target.files?.length) return;
                      const file = e.target.files[0];
                      setEditImage(file);
                      setEditPreview(URL.createObjectURL(file));
                    }}
                    style={{ display: "none" }}
                  />
                </div>
                <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 8, textAlign: "center" }}>
                  Click the photo to replace it
                </p>
              </div>

              {/* Form fields */}
              <div style={{ flex: 1, minWidth: 220, display: "grid", gap: 14 }}>
                <label style={fieldLabelStyle}>
                  Name
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={fieldInputStyle}
                  />
                </label>

                <label style={fieldLabelStyle}>
                  Category
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    style={{ ...fieldInputStyle, cursor: "pointer" }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={fieldLabelStyle}>
                  Price (DT)
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    style={fieldInputStyle}
                  />
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
              <button style={editButtonStyle} onClick={() => setEditingProduct(null)}>
                Cancel
              </button>
              <button style={primaryButton} onClick={handleUpdateProduct} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
        gap: 20,
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div style={{ width: "100%", height: 160, backgroundColor: "#f1f5f9" }} />
          <div style={{ padding: "14px 16px" }}>
            <div style={{ height: 14, width: "70%", backgroundColor: "#f1f5f9", borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 18, width: "40%", backgroundColor: "#f1f5f9", borderRadius: 4, marginBottom: 14 }} />
            <div style={{ height: 32, width: "100%", backgroundColor: "#f1f5f9", borderRadius: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const editButtonStyle: React.CSSProperties = {
  flex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "8px 10px",
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  background: "#fff",
  color: colors.dark,
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};

const deleteButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "8px 10px",
  borderRadius: 8,
  border: `1px solid #fecaca`,
  background: "#fef2f2",
  color: colors.danger,
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.5)",
  backdropFilter: "blur(3px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
  animation: "overlayFadeIn 0.15s ease",
};

const modalStyle: React.CSSProperties = {
  width: 560,
  maxWidth: "calc(100vw - 32px)",
  background: "#fff",
  borderRadius: 18,
  padding: 26,
  position: "relative",
  boxShadow: "0 24px 60px rgba(15,23,42,0.25)",
  animation: "modalPopIn 0.18s ease",
};

const closeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: "none",
  background: "#f1f5f9",
  color: colors.dark,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: colors.dark,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const fieldInputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  fontSize: 14,
  fontWeight: 400,
  color: colors.dark,
  outline: "none",
};

const modalKeyframes = `
@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes modalPopIn {
  from { opacity: 0; transform: scale(0.96) translateY(6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.photo-drop-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15,23,42,0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.photo-drop:hover .photo-drop-overlay {
  opacity: 1;
}
`;

export default Products;