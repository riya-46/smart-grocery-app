import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const apiBaseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const AUTH_API_URL = `${
    apiBaseUrl ||
    (window.location.hostname === "localhost" ? "http://localhost:5000" : "")
  }/api/auth`;

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    const loginUser = async () => {
      try {
        const response = await axios.post(`${AUTH_API_URL}/login`, {
          email: email.trim().toLowerCase(),
          password,
        });

        localStorage.setItem("smartgrocery_token", response.data.token);
        localStorage.setItem(
          "smartgrocery_user",
          JSON.stringify(response.data.user)
        );

        navigate("/home");
      } catch (error) {
        alert(error.response?.data?.message || "Login failed");
      }
    };

    loginUser();
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    const registerUser = async () => {
      try {
        await axios.post(`${AUTH_API_URL}/register`, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });
        alert("Account created successfully. Please login to continue.");
        setIsLogin(true);
        setName("");
        setEmail(email.trim().toLowerCase());
        setPassword("");
      } catch (error) {
        alert(error.response?.data?.message || "Registration failed");
      }
    };

    registerUser();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Smart Grocery App</h1>

        {isLogin ? (
          <>
            <p>Login to continue</p>

            <form className="login-form" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit">Login</button>
            </form>

            <p className="switch-text">
              New user?{" "}
              <span
                onClick={() => {
                  setIsLogin(false);
                  setEmail("");
                  setPassword("");
                }}
              >
                Create Account
              </span>
            </p>
          </>
        ) : (
          <>
            <p>Create your account</p>

            <form className="login-form" onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit">Register</button>
            </form>

            <p className="switch-text">
              Already have account?{" "}
              <span
                onClick={() => {
                  setIsLogin(true);
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
              >
                Login
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
