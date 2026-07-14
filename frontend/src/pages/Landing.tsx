import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CloudSun,
  Sun,
  Cloud,
  TrendingUp,
  Receipt,
  Tag,
  Store,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { colors } from "../styles/common";

/* -------------------------------------------------------------------------- */
/* Scroll-reveal hook                                                         */
/* -------------------------------------------------------------------------- */
function useOnScreen<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function useCountUp(target: number, active: boolean, durationMs = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let frame: number;
    let start: number | null = null;
    const step = (t: number) => {
      if (start === null) start = t;
      const progress = Math.min((t - start) / durationMs, 1);
      setValue(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target, durationMs]);
  return value;
}

function Landing() {
  return (
    <div style={{ backgroundColor: "#fff", overflowX: "hidden" }}>
      <style>{landingKeyframes}</style>
      <TopNav />
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <FinalCta />
      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Top nav                                                                    */
/* -------------------------------------------------------------------------- */
function TopNav() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 40px",
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(15,23,42,0.35)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CloudSun size={18} color="#fff" />
        </div>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Sales Weather</span>
      </div>

      <Link
        to="/login"
        style={{
          padding: "9px 20px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Log in
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */
function Hero() {
  const clouds = useMemo(
    () =>
      Array.from({ length: 5 }).map(() => ({
        top: 5 + Math.random() * 55,
        scale: 0.6 + Math.random() * 1,
        duration: 35 + Math.random() * 35,
        delay: -Math.random() * 40,
        opacity: 0.12 + Math.random() * 0.18,
      })),
    []
  );

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0f172a 0%, #1e293b 45%, #0ea5e9 130%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "0 24px",
      }}
    >
      {/* decorative layer */}
      <div style={{ position: "absolute", inset: 0 }}>
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, rgba(56,189,248,0.35), transparent 25%, rgba(251,191,36,0.25) 50%, transparent 75%, rgba(56,189,248,0.3) 100%)",
            animation: "heroSpin 30s linear infinite",
          }}
        />
        {clouds.map((c, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${c.top}%`,
              left: "-15%",
              opacity: c.opacity,
              transform: `scale(${c.scale})`,
              animation: `heroCloudDrift ${c.duration}s linear ${c.delay}s infinite`,
            }}
          >
            <Cloud size={100} color="#fff" fill="#fff" />
          </div>
        ))}
      </div>

      {/* content */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 720 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#e2e8f0",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 24,
            animation: "fadeInUp 0.6s ease both",
          }}
        >
          <Sun size={14} color={colors.accent} />
          Weather-powered sales intelligence
        </div>

        <h1
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: "clamp(32px, 6vw, 58px)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.1,
            margin: "0 0 20px",
            animation: "fadeInUp 0.6s ease 0.1s both",
          }}
        >
          Know what the sky
          <br />
          means for your sales.
        </h1>

        <p
          style={{
            fontSize: 17,
            color: "rgba(226,232,240,0.85)",
            maxWidth: 520,
            margin: "0 auto 36px",
            lineHeight: 1.6,
            animation: "fadeInUp 0.6s ease 0.2s both",
          }}
        >
          Sales Weather turns tomorrow's forecast into today's decisions —
          predict demand, manage every franchise, and build tickets in seconds.
        </p>

        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
            animation: "fadeInUp 0.6s ease 0.3s both",
          }}
        >
          <Link to="/login" style={heroPrimaryButton}>
            Get started
            <ArrowRight size={16} />
          </Link>
          <a href="#features" style={heroSecondaryButton}>
            See how it works
          </a>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 28,
          animation: "bounce 2s ease-in-out infinite",
          color: "rgba(255,255,255,0.6)",
        }}
      >
        <ChevronDown size={22} />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Stats bar                                                                  */
/* -------------------------------------------------------------------------- */
function StatsBar() {
  const { ref, visible } = useOnScreen<HTMLDivElement>();
  const stats = [
    { label: "Forecast accuracy", value: 92, suffix: "%" },
    { label: "Franchises supported", value: 40, suffix: "+" },
    { label: "Tickets processed / day", value: 1200, suffix: "+" },
    { label: "Avg. setup time", value: 5, suffix: " min" },
  ];

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: colors.dark,
        padding: "48px 24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 24,
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {stats.map((s, i) => (
        <StatItem key={s.label} {...s} active={visible} delay={i * 100} />
      ))}
    </section>
  );
}

function StatItem({
  label,
  value,
  suffix,
  active,
  delay,
}: {
  label: string;
  value: number;
  suffix: string;
  active: boolean;
  delay: number;
}) {
  const count = useCountUp(value, active);
  return (
    <div
      style={{
        textAlign: "center",
        animation: active ? "fadeInUp 0.5s ease both" : undefined,
        animationDelay: `${delay}ms`,
        opacity: active ? undefined : 0,
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 800, color: "#fff" }}>
        {Math.round(count)}
        {suffix}
      </div>
      <div style={{ fontSize: 13, color: "rgba(226,232,240,0.6)", marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Features                                                                   */
/* -------------------------------------------------------------------------- */
function Features() {
  const features = [
    {
      icon: CloudSun,
      title: "Weather-driven predictions",
      text: "Forecast demand for every product based on real weather data, not guesswork.",
    },
    {
      icon: Store,
      title: "Multi-store management",
      text: "Track every franchise's performance from a single, unified admin view.",
    },
    {
      icon: Tag,
      title: "Smart promotions",
      text: "Launch and monitor targeted discounts tied to weather and demand patterns.",
    },
    {
      icon: Receipt,
      title: "Instant tickets",
      text: "Build sales tickets from a restaurant-style menu in just a few taps.",
    },
  ];

  return (
    <section id="features" style={{ padding: "90px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <SectionHeading
        eyebrow="Why Sales Weather"
        title="Everything your franchise network needs"
        subtitle="One platform connecting forecasts, sales, and every store on the ground."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 20,
          marginTop: 48,
        }}
      >
        {features.map((f, i) => (
          <FeatureCard key={f.title} {...f} delay={i * 100} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  text,
  delay,
}: {
  icon: typeof CloudSun;
  title: string;
  text: string;
  delay: number;
}) {
  const { ref, visible } = useOnScreen<HTMLDivElement>();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 26,
        borderRadius: 16,
        border: `1px solid ${colors.border}`,
        backgroundColor: "#fff",
        opacity: visible ? 1 : 0,
        animation: visible ? "fadeInUp 0.5s ease both" : undefined,
        animationDelay: `${delay}ms`,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 16px 32px rgba(15,23,42,0.1)" : "0 4px 12px rgba(15,23,42,0.04)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${colors.dark} 0%, #334155 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Icon size={20} color="#fff" />
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 16, color: colors.dark }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14, color: colors.textMuted, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* How it works                                                              */
/* -------------------------------------------------------------------------- */
function HowItWorks() {
  const steps = [
    { number: "01", title: "Connect the forecast", text: "Import daily weather data for each store's location." },
    { number: "02", title: "Predict demand", text: "See which products will sell based on tomorrow's conditions." },
    { number: "03", title: "Sell with confidence", text: "Franchises build tickets, admins track results in real time." },
  ];

  return (
    <section style={{ backgroundColor: "#f8fafc", padding: "90px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHeading
          eyebrow="How it works"
          title="From forecast to sale in three steps"
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 24,
            marginTop: 48,
          }}
        >
          {steps.map((s, i) => (
            <StepCard key={s.number} {...s} delay={i * 120} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ number, title, text, delay }: { number: string; title: string; text: string; delay: number }) {
  const { ref, visible } = useOnScreen<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        animation: visible ? "fadeInUp 0.5s ease both" : undefined,
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: 40,
          fontWeight: 700,
          color: colors.accent,
          marginBottom: 8,
        }}
      >
        {number}
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 17, color: colors.dark }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14, color: colors.textMuted, lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Final CTA                                                                 */
/* -------------------------------------------------------------------------- */
function FinalCta() {
  const { ref, visible } = useOnScreen<HTMLDivElement>();
  return (
    <section
      ref={ref}
      style={{
        padding: "100px 24px",
        textAlign: "center",
        background: `linear-gradient(135deg, ${colors.dark} 0%, #0f172a 100%)`,
        opacity: visible ? 1 : 0,
        animation: visible ? "fadeInUp 0.6s ease both" : undefined,
      }}
    >
      <h2
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: "clamp(26px, 4vw, 38px)",
          color: "#fff",
          margin: "0 0 16px",
        }}
      >
        Ready to see tomorrow's sales today?
      </h2>
      <p style={{ color: "rgba(226,232,240,0.75)", marginBottom: 30 }}>
        Log in to your dashboard and start forecasting.
      </p>
      <Link to="/login" style={heroPrimaryButton}>
        Log in to your account
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared bits                                                               */
/* -------------------------------------------------------------------------- */
function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: colors.accentDark,
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: "clamp(24px, 4vw, 32px)",
          color: colors.dark,
          margin: "0 0 10px",
        }}
      >
        {title}
      </h2>
      {subtitle && <p style={{ color: colors.textMuted, fontSize: 15 }}>{subtitle}</p>}
    </div>
  );
}

function Footer() {
  return (
    <footer
      style={{
        padding: "24px",
        textAlign: "center",
        fontSize: 13,
        color: colors.textMuted,
        borderTop: `1px solid ${colors.border}`,
      }}
    >
      © {new Date().getFullYear()} Sales Weather Platform. All rights reserved.
    </footer>
  );
}

const heroPrimaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "13px 24px",
  borderRadius: 12,
  backgroundColor: colors.accent,
  color: "#0f172a",
  fontWeight: 700,
  fontSize: 14,
  textDecoration: "none",
};

const heroSecondaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "13px 24px",
  borderRadius: 12,
  backgroundColor: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.25)",
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  textDecoration: "none",
};

const landingKeyframes = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes heroSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes heroCloudDrift {
  from { transform: translateX(0); }
  to { transform: translateX(140vw); }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}
`;

export default Landing;