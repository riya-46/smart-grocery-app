import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Smart Grocery App</h1>

        {isLogin ? (
          <>
            <p>Login to continue</p>

            <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/home");
              }}
            >
              <input type="email" placeholder="Enter your email" />
              <input type="password" placeholder="Enter your password" />
              <button type="submit">Login</button>
            </form>

            <p className="switch-text">
              New user?{" "}
              <span onClick={() => setIsLogin(false)}>Create Account</span>
            </p>
          </>
        ) : (
          <>
            <p>Create your account</p>

            <form className="login-form">
              <input type="text" placeholder="Enter your name" />
              <input type="email" placeholder="Enter your email" />
              <input type="password" placeholder="Create password" />
              <button type="submit">Register</button>
            </form>

            <p className="switch-text">
              Already have account?{" "}
              <span onClick={() => setIsLogin(true)}>Login</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;