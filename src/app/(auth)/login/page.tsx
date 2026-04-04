'use client';
import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useSnackbar } from "../../../contexts/SnackbarContext";
import "../../../components/auth/PublicPage.css";
import { getDashboardPath } from "../../../utils/getDashboardPath";

const LoginPage: React.FC = () => {
  const [loginIdentifier, setLoginIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { showSnackbar } = useSnackbar();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('[Frontend] Login form submitted.');
    
    setIsSubmitting(true);
    try {
      const user = await login({ loginIdentifier, password });
      showSnackbar("Login successful!", "success");
      const dashboardPath = getDashboardPath(user);
      router.push(dashboardPath);
    } catch (error: any) {
      console.error('[Frontend] Login failed:', error);
      const errorMessage = error.message || "Login failed. Please try again.";
      showSnackbar(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <img src="/nis-logo.png" alt="Nigeria Immigration Service" />
          <span>Nigeria Immigration Service</span>
        </div>

        <nav className="nav">
          <button
            onClick={() => router.push("/")}
            style={{
              cursor: "pointer",
              background: "none",
              border: "none",
              color: "inherit",
              font: "inherit",
            }}
          >
            Home
          </button>
          <button
            onClick={() => router.push("/about")}
            style={{
              cursor: "pointer",
              background: "none",
              border: "none",
              color: "inherit",
              font: "inherit",
            }}
          >
            About
          </button>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-text">
          <h1>NIS Healthcare Management Service</h1>
          <p>
            Secure, digital healthcare solutions for Nigeria Immigration
            Service officers and their families.
          </p>
        </div>

        <div className="login-card">
          <form onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label>NIS Number or Email</label>
              <input
                type="text"
                placeholder="NIS Number or Email"
                value={loginIdentifier}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setLoginIdentifier(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <button
                type="button"
                className="forgot-password-btn"
                style={{
                  background: "none",
                  border: "none",
                  color: "#007bff",
                  cursor: "pointer",
                  fontSize: "0.9em",
                }}
              >
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit" 
              className="primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            <p className="auth-link">
              Don&apos;t have an account?{" "}
              <span
                onClick={() => router.push("/register")}
                style={{ cursor: "pointer", color: "#007bff" }}
              >
                Register here
              </span>
            </p>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} Nigeria Immigration Service – Healthcare
          Management Service
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;

