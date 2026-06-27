import { useState } from "react";
import styles from "../styles/login.module.css";

/* ── Shared SVG icons ── */
const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

/* ══════════════════════════════════════════
   AuthPage — single component, two modes
   mode: "login" | "signup"  (default: login)
   ══════════════════════════════════════════ */
export default function AuthPage({ defaultMode = "login" }) {
  const [mode, setMode] = useState(defaultMode);

  /* shared fields */
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  /* login-only */
  const [rememberMe, setRememberMe] = useState(false);

  /* signup-only */
  const [firstName, setFirstName]           = useState("");
  const [lastName, setLastName]             = useState("");

  const isLogin  = mode === "login";
  const isSignup = mode === "signup";

  /* reset state when switching tabs */
  const switchMode = (next) => {
    setMode(next);
    setError("");
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setShowPassword(false);

  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      if (!email || !password) {
        setError("Enter your email and password to continue.");
        return;
      }
    }

    if (isSignup) {
      if (!firstName || !lastName) {
        setError("Enter your first and last name.");
        return;
      }
      if (!email) {
        setError("Enter a valid email address.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
    }

    setError("");
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Logo ── */}
        <div className={styles.logoArea}>
          <div className={styles.logoCircle}>
            <span className={styles.logoIcon}><LogoIcon /></span>
          </div>
          <h1 className={styles.heading}>
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className={styles.subheading}>
            {isLogin ? "Sign in to your account" : "Get started for free today"}
          </p>
        </div>

        {/* ── Login / Sign up tabs ── */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${isLogin ? styles.tabActive : ""}`}
            onClick={() => switchMode("login")}
          >
            Log in
          </button>
          <button
            type="button"
            className={`${styles.tab} ${isSignup ? styles.tabActive : ""}`}
            onClick={() => switchMode("signup")}
          >
            Sign up
          </button>
        </div>

        {/* ── Card ── */}
        <div className={styles.card}>
          <form onSubmit={handleSubmit}>

            {/* Signup-only: First name + Last name */}
            {isSignup && (
              <div className={styles.nameRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="firstName" className={styles.label}>First name</label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className={styles.input}
                    autoComplete="given-name"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label htmlFor="lastName" className={styles.label}>Last name</label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className={styles.input}
                    autoComplete="family-name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className={styles.fieldGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={styles.input}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className={styles.fieldGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignup ? "Min. 8 characters" : "••••••••"}
                  className={`${styles.input} ${styles.inputWithIcon}`}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && <p className={styles.errorMsg}>{error}</p>}

            {/* Signup-only: Terms */}
            {isSignup && (
              <p className={styles.terms}>
                By creating an account you agree to our{" "}
                <a href="#" className={styles.termsLink}>Terms of Service</a>{" "}
                and{" "}
                <a href="#" className={styles.termsLink}>Privacy Policy</a>.
              </p>
            )}

            {/* Submit */}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading
                ? isLogin ? "Signing in…" : "Creating account…"
                : isLogin ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}