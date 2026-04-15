import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

     const storedUsername = localStorage.getItem("smartgrocery_username");
     if (!storedUsername) {
       const fallbackName = email.split("@")[0]?.trim();
       if (fallbackName) {
         localStorage.setItem("smartgrocery_username", fallbackName);
       }
     }

    localStorage.setItem("smartgrocery_email", email.trim());

    navigate("/home");
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    localStorage.setItem("smartgrocery_username", name.trim());
    localStorage.setItem("smartgrocery_email", email.trim());

    alert("Account created successfully");
    setIsLogin(true);
    setEmail("");
    setPassword("");
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
