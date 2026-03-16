'use client';
import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useSnackbar } from "../../../contexts/SnackbarContext"; // Import useSnackbar
import "../../../components/auth/PublicPage.css";
import { AxiosError } from "axios";
import { getDashboardPath } from "../../../utils/getDashboardPath";

const PatientLoginPage: React.FC = () => {
  const [loginIdentifier, setLoginIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const { login, logout } = useAuth();
  const { showSnackbar } = useSnackbar(); // Use the snackbar context

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const user = await login({ loginIdentifier, password, isPatient: true });
      showSnackbar("Login successful!", "success");

      if (user.roles.includes("Patient") || user.roles.includes("Officer")) {
        const dashboardPath = getDashboardPath(user);
        router.push(dashboardPath);
      } else {
        showSnackbar("Access denied: This login is for Patients and Officers only.", "error");
        logout(); // Clear the session
        router.push("/"); // Fallback for non-authorized roles
      }
    } catch (err: unknown) {
      let errorMessage = "Login failed. Please try again.";
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      showSnackbar(errorMessage, "error");
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
          <h1>Patient Login</h1>
          <p>
            Secure access for registered patients.
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

            <button type="submit" className="primary-btn">
              Login
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

export default PatientLoginPage;
