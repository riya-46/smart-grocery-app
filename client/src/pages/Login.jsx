import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CHECKMARK = "\u2713";

const FEATURE_LIST = [
  "Unlimited grocery items and expense tracking",
  "Calendar-based date selection",
  "Mode-wise expense distribution for Family, Party, Guest, and Festival",
  "Real-time pie charts and trend graphs",
  "Daily and monthly expense summaries",
  "Integrated AI for healthy food items and recipe suggestions",
  "User-specific data isolation",
];

const HERO_LINES = [
  { text: "Track groceries", emoji: "\u{1F6D2}" },
  { text: "Control expenses", emoji: "\u{1F4B5}" },
  { text: "Get AI suggestions", emoji: "\u{1F916}" },
  { text: "Live smarter", emoji: "\u{1F60E}" },
];

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthPending, setIsAuthPending] = useState(false);
  const authPanelRef = useRef(null);

  const navigate = useNavigate();
  const apiBaseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const AUTH_API_URL = `${
    apiBaseUrl ||
    (window.location.hostname === "localhost" ? "http://localhost:5000" : "")
  }/api/auth`;

  const scrollToAuthPanel = () => {
    window.requestAnimationFrame(() => {
      authPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setIsAuthPending(true);

      const response = await axios.post(`${AUTH_API_URL}/login`, {
        email: email.trim().toLowerCase(),
        password,
      });

      localStorage.setItem("smartgrocery_token", response.data.token);
      localStorage.setItem(
        "smartgrocery_user",
        JSON.stringify(response.data.user)
      );

      navigate("/home", { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setIsAuthPending(false);
    }
  };

  const openLogin = (shouldScroll = false) => {
    setIsLogin(true);
    setName("");
    setPassword("");

    if (shouldScroll) {
      scrollToAuthPanel();
    }
  };

  const openRegister = (shouldScroll = false) => {
    setIsLogin(false);
    setPassword("");

    if (shouldScroll) {
      scrollToAuthPanel();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setIsAuthPending(true);

      await axios.post(`${AUTH_API_URL}/register`, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      alert("Account created successfully. Please login to continue.");
      openLogin();
      setEmail(email.trim().toLowerCase());
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setIsAuthPending(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-shell">
        <section className="auth-hero">
          <p className="auth-kicker">READY TO GET STARTED?</p>
          <h1 className="auth-headline">
            {HERO_LINES.map((line) => (
              <span className="auth-headline-line" key={line.text}>
                <span className="auth-headline-text">{line.text}</span>
                <span className="auth-headline-emoji" aria-hidden="true">
                  {line.emoji}
                </span>
              </span>
            ))}
          </h1>
          <p className="auth-subtitle">Start managing groceries today</p>

          <div
            className="auth-quick-actions"
            role="tablist"
            aria-label="Authentication mode"
          >
            <button
              type="button"
              className={`auth-jump-link ${!isLogin ? "active" : ""}`}
              disabled={isAuthPending}
              onClick={() => openRegister(true)}
              aria-pressed={!isLogin}
            >
              Register Now
            </button>
            <button
              type="button"
              className={`auth-jump-link ${isLogin ? "active" : ""}`}
              disabled={isAuthPending}
              onClick={() => openLogin(true)}
              aria-pressed={isLogin}
            >
              Login to Dashboard
            </button>
          </div>
        </section>

        <section className="auth-grid">
          <article className="auth-feature-card card">
            <div>
              <div>
                <p className="auth-feature-kicker">All Features Included</p>
                <h2>Everything you need to run day-to-day grocery operations.</h2>
              </div>
            </div>

            <ul className="auth-feature-list">
              {FEATURE_LIST.map((feature) => (
                <li key={feature}>
                  <span className="auth-check" aria-hidden="true">
                    {CHECKMARK}
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="auth-panel" ref={authPanelRef}>
            <p className="auth-panel-kicker">
              {isLogin ? "Welcome back" : "Create your workspace"}
            </p>
            <h2>{isLogin ? "Login to continue" : "Register your account"}</h2>

            <form
              className="login-form auth-form"
              onSubmit={isLogin ? handleLogin : handleRegister}
            >
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  disabled={isAuthPending}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                disabled={isAuthPending}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder={isLogin ? "Enter your password" : "Create password"}
                value={password}
                disabled={isAuthPending}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button type="submit" disabled={isAuthPending}>
                {isAuthPending
                  ? isLogin
                    ? "Logging in..."
                    : "Creating account..."
                  : isLogin
                    ? "Login"
                    : "Register"}
              </button>
            </form>

            <p className="switch-text auth-switch-text">
              {isLogin ? "New user?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="auth-inline-btn"
                disabled={isAuthPending}
                onClick={isLogin ? openRegister : openLogin}
              >
                {isLogin ? "Create Account" : "Login"}
              </button>
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}

export default Login;
