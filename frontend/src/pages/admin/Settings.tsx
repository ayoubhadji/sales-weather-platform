import { useEffect, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";

import api from "../../services/api";
import PageHeader from "../../components/PageHeader";

import type { UserProfile } from "../../types/UserProfile";

import {
  card,
  colors,
  primaryButton,
} from "../../styles/common";

function Settings() {
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const response = await api.get("/users/me");

      const user: UserProfile = response.data;

      setProfile(user);

      setName(user.name);
      setEmail(user.email);
      setCity(user.city ?? "");
      setAddress(user.address ?? "");
      setPhone(user.phone ?? "");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (
      password &&
      password !== confirmPassword
    ) {
      alert("Passwords do not match.");
      return;
    }

    try {
      await api.patch("/users/me", {
        name,
        email,
        city,
        address,
        phone,
        ...(password && { password }),
      });

      alert("Profile updated successfully.");

      setPassword("");
      setConfirmPassword("");

      loadProfile();
    } catch (error) {
      console.error(error);
      alert("Unable to update profile.");
    }
  }

  if (loading) {
    return <h2>Loading settings...</h2>;
  }

  return (
    <div>
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Manage your account information."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
        }}
      >
        <div>

          <div style={card}>
            <h2 style={{ marginTop: 0 }}>
              Personal Information
            </h2>

            <Field label="Name">
              <input
                style={inputStyle}
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </Field>

            <Field label="Email">
              <input
                style={inputStyle}
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </Field>

            <Field label="City">
              <input
                style={inputStyle}
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
              />
            </Field>

            <Field label="Address">
              <input
                style={inputStyle}
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
              />
            </Field>

            <Field label="Phone">
              <input
                style={inputStyle}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
              />
            </Field>
          </div>

          <div
            style={{
              ...card,
              marginTop: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Security
            </h2>

            <Field label="New Password">
              <input
                type="password"
                style={inputStyle}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />
            </Field>

            <Field label="Confirm Password">
              <input
                type="password"
                style={inputStyle}
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
              />
            </Field>

            <button
              style={primaryButton}
              onClick={saveProfile}
            >
              Save Changes
            </button>
                      </div>
        </div>

        <div>
          <div style={card}>
            <h2 style={{ marginTop: 0 }}>
              Account Information
            </h2>

            <InfoRow
              label="Role"
              value={profile?.role ?? "-"}
            />

            <InfoRow
              label="Status"
              value={
                profile?.isActive
                  ? "🟢 Active"
                  : "🔴 Inactive"
              }
            />

            <InfoRow
              label="Member Since"
              value={
                profile
                  ? new Date(
                      profile.createdAt
                    ).toLocaleDateString()
                  : "-"
              }
            />
          </div>
        </div>
      </div>
    </div>
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
    <div style={{ marginBottom: 20 }}>
      <label style={labelStyle}>
        {label}
      </label>

      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        marginBottom: 18,
      }}
    >
      <div
        style={{
          color: colors.textMuted,
          fontSize: 13,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 700,
          fontSize: 18,
          marginTop: 6,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 10,
  border: `1px solid ${colors.border}`,
  fontSize: 14,
  boxSizing: "border-box",
};

export default Settings;