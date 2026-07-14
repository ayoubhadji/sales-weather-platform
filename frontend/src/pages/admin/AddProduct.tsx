import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PackagePlus, ArrowLeft, Camera, ImageOff } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import { card, colors, primaryButton } from "../../styles/common";

const categoryOptions = ["FOOD", "FAST_FOOD", "HOT_DRINK", "COLD_DRINK", "DESSERT", "SNACK"];

function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      let imageUrl: string | null = null;

      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const uploadResponse = await api.post("/products/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imageUrl = uploadResponse.data.imageUrl;
      }

      await api.post("/products", {
        name,
        category,
        price: Number(price),
        imageUrl,
      });

      navigate("/admin/products");
    } catch (submitError) {
      console.error("Error creating product:", submitError);
      setError("Unable to create product. Check the submitted values.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div>
      <style>{dropZoneStyles}</style>

      <PageHeader
        icon={PackagePlus}
        title="Add Product"
        description="Create a new product that can later be used in sales and promotions."
        action={
          <Link
            to="/admin/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: colors.dark,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={14} />
            Back to products
          </Link>
        }
      />

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <form onSubmit={handleSubmit} style={{ ...card, maxWidth: 560, flex: "1 1 480px" }}>
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
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
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
                    {preview ? "Change photo" : "Add photo"}
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
              <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 8, textAlign: "center" }}>
                Click the box to upload a photo
              </p>
            </div>

            {/* Fields */}
            <div style={{ flex: 1, minWidth: 240, display: "grid", gap: 16 }}>
              <label style={fieldLabelStyle}>
                Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={fieldInputStyle}
                  placeholder="e.g. Margherita Pizza"
                  required
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label style={fieldLabelStyle}>
                  Category
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ ...fieldInputStyle, cursor: "pointer" }}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={fieldLabelStyle}>
                  Price (DT)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={fieldInputStyle}
                    placeholder="0.00"
                    required
                  />
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div
              style={{
                marginTop: 18,
                padding: "12px 14px",
                borderRadius: 10,
                background: "#fef2f2",
                color: colors.danger,
                border: "1px solid #fecaca",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button type="submit" disabled={loading} style={primaryButton}>
              {loading ? "Saving..." : "Save product"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                background: "#fff",
                color: colors.dark,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Live preview */}
        <div style={{ flex: "0 0 240px", position: "sticky", top: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>
            Menu preview
          </div>
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div
              style={{
                width: "100%",
                height: 160,
                position: "relative",
                background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
              }}
            >
              {preview ? (
                <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.textMuted,
                  }}
                >
                  <ImageOff size={26} />
                </div>
              )}
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
                {category.replace("_", " ")}
              </span>
            </div>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: colors.dark, marginBottom: 6 }}>
                {name || "Product name"}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: colors.accentDark }}>
                {price ? `${Number(price).toFixed(2)} DT` : "0.00 DT"}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 10, lineHeight: 1.5 }}>
            This is how the product will appear on the franchise menu.
          </p>
        </div>
      </div>
    </div>
  );
}

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

const dropZoneStyles = `
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

export default AddProduct;