import { useState } from "react";
import { useNavigate } from "react-router-dom";

import authService from "../services/authService";
import { useAuth } from "../context/AuthContext";

const CONDITIONS = [
  { label: "Clear skies expected for Q3", pressure: "1013", trend: "steady" },
  { label: "High pressure building in the west region", pressure: "1021", trend: "rising" },
  { label: "Light front moving through northeast accounts", pressure: "1006", trend: "falling" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  const [condition] = useState(
    () => CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await authService.login({
        email,
        password,
      });

      login(response.user);

      if (response.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/franchise");
      }
    } catch (err) {
      setError("Invalid email or password.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sw-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }

        .sw-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          font-family: 'Inter', sans-serif;
          background: #F4F6FA;
        }

        @media (max-width: 880px) {
          .sw-shell { grid-template-columns: 1fr; }
          .sw-panel { display: none; }
        }

        /* ---------- Left: instrument panel ---------- */
        .sw-panel {
          position: relative;
          background: linear-gradient(165deg, #1B2A4A 0%, #223759 55%, #2E4066 100%);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 56px 56px 44px;
          color: #E9EEF7;
        }

        .sw-cloud {
          position: absolute;
          border-radius: 999px;
          background: rgba(255,255,255,0.05);
          filter: blur(0px);
        }

        .sw-brand {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #9FB2D6;
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 2;
        }

        .sw-brand-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #F2A65A;
        }

        .sw-hero {
          position: relative;
          z-index: 2;
        }

        .sw-hero h1 {
          font-family: 'Fraunces', serif;
          font-weight: 500;
          font-size: 38px;
          line-height: 1.18;
          margin: 0 0 14px;
          max-width: 380px;
          letter-spacing: -0.01em;
        }

        .sw-hero p {
          font-size: 15px;
          line-height: 1.6;
          color: #B9C6E0;
          max-width: 340px;
          margin: 0;
        }

        .sw-gauge-row {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 24px;
          margin-top: 40px;
        }

        .sw-gauge-readout {
          font-family: 'IBM Plex Mono', monospace;
        }

        .sw-gauge-readout .val {
          font-size: 26px;
          font-weight: 500;
          color: #F4F1E8;
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .sw-gauge-readout .val span {
          font-size: 12px;
          color: #8FA4CC;
          font-weight: 400;
        }

        .sw-gauge-readout .trend {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6FBFA0;
          margin-top: 4px;
        }

        .sw-gauge-readout .condition {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #C3CEE6;
          margin-top: 10px;
          max-width: 220px;
          line-height: 1.5;
        }

        .sw-needle {
          transform-origin: 60px 60px;
          animation: sw-sway 5.5s ease-in-out infinite;
        }

        @keyframes sw-sway {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(10deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .sw-needle { animation: none; }
          .sw-cloud { animation: none !important; }
        }

        /* ---------- Right: form ---------- */
        .sw-form-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
        }

        .sw-card {
          width: 100%;
          max-width: 380px;
        }

        .sw-card-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8B93A7;
          margin: 0 0 8px;
        }

        .sw-card h2 {
          font-family: 'Fraunces', serif;
          font-weight: 500;
          font-size: 26px;
          color: #12192B;
          margin: 0 0 32px;
        }

        .sw-field {
          margin-bottom: 18px;
        }

        .sw-field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #3A4257;
          margin-bottom: 6px;
        }

        .sw-input-wrap {
          position: relative;
          border: 1.5px solid #DEE3EC;
          border-radius: 10px;
          background: #fff;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .sw-input-wrap.focused {
          border-color: #2E4066;
          box-shadow: 0 0 0 3px rgba(46, 64, 102, 0.1);
        }

        .sw-input-wrap input {
          width: 100%;
          padding: 12px 14px;
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          color: #12192B;
          font-family: 'Inter', sans-serif;
          border-radius: 10px;
        }

        .sw-toggle-visibility {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          color: #8B93A7;
          font-family: 'Inter', sans-serif;
          padding: 6px 8px;
        }

        .sw-toggle-visibility:hover {
          color: #3A4257;
        }

        .sw-row-between {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 22px;
          margin-top: -8px;
        }

        .sw-forgot {
          font-size: 13px;
          color: #2E4066;
          text-decoration: none;
          font-weight: 500;
          border-bottom: 1px solid transparent;
          transition: border-color 0.15s ease;
        }

        .sw-forgot:hover {
          border-bottom-color: #2E4066;
        }

        .sw-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FBEAE6;
          border: 1px solid #F0C3B8;
          color: #A0431F;
          font-size: 13px;
          padding: 10px 12px;
          border-radius: 8px;
          margin-bottom: 18px;
        }

        .sw-submit {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 10px;
          background: #F2A65A;
          color: #3A2205;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.05s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .sw-submit:hover:not(:disabled) {
          background: #EE9A44;
        }

        .sw-submit:active:not(:disabled) {
          transform: scale(0.99);
        }

        .sw-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .sw-spinner {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(58,34,5,0.3);
          border-top-color: #3A2205;
          animation: sw-spin 0.7s linear infinite;
        }

        @keyframes sw-spin {
          to { transform: rotate(360deg); }
        }

        .sw-footnote {
          text-align: center;
          font-size: 12px;
          color: #9BA3B4;
          margin-top: 26px;
        }
      `}</style>

      {/* Left instrument panel */}
      <div className="sw-panel">
        <div
          className="sw-cloud"
          style={{ width: 260, height: 260, top: -80, right: -60 }}
        />
        <div
          className="sw-cloud"
          style={{ width: 180, height: 180, bottom: 40, left: -60 }}
        />

        <div className="sw-brand">
          <span className="sw-brand-dot" />
          Sales Weather Platform
        </div>

        <div className="sw-hero">
          <h1>Read the forecast before you sell.</h1>
          <p>
            Franchise and admin teams track demand the way a meteorologist
            tracks a front, so nobody walks into a territory unprepared.
          </p>

          <div className="sw-gauge-row">
            <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="Barometric pressure gauge">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#3C4E75" strokeWidth="1.5" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#F2A65A" strokeWidth="1.5" strokeDasharray="6 10" opacity="0.5" />
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const x1 = 60 + 44 * Math.sin(angle);
                const y1 = 60 - 44 * Math.cos(angle);
                const x2 = 60 + 50 * Math.sin(angle);
                const y2 = 60 - 50 * Math.cos(angle);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#5E70A0"
                    strokeWidth="1.5"
                  />
                );
              })}
              <g className="sw-needle">
                <line x1="60" y1="60" x2="60" y2="24" stroke="#F2A65A" strokeWidth="2.5" strokeLinecap="round" />
              </g>
              <circle cx="60" cy="60" r="5" fill="#F2A65A" />
            </svg>

            <div className="sw-gauge-readout">
              <div className="val">{condition.pressure}<span>hPa</span></div>
              <div className="trend">{condition.trend}</div>
              <div className="condition">{condition.label}</div>
            </div>
          </div>
        </div>

        <div />
      </div>

      {/* Right: form */}
      <div className="sw-form-wrap">
        <div className="sw-card">
          <p className="sw-card-eyebrow">Welcome back</p>
          <h2>Sign in to your account</h2>

          <form onSubmit={handleLogin} noValidate>
            <div className="sw-field">
              <label htmlFor="email">Email</label>
              <div className={`sw-input-wrap ${focusedField === "email" ? "focused" : ""}`}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="sw-field">
              <label htmlFor="password">Password</label>
              <div className={`sw-input-wrap ${focusedField === "password" ? "focused" : ""}`}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 56 }}
                />
                <button
                  type="button"
                  className="sw-toggle-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="sw-row-between">
              <a href="/forgot-password" className="sw-forgot">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="sw-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="sw-submit" disabled={loading}>
              {loading && <span className="sw-spinner" />}
              {loading ? "Signing in" : "Sign in"}
            </button>
          </form>

          <p className="sw-footnote">
            Trouble accessing your account? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}