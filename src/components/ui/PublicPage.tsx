import React from "react";
import { useRouter } from "next/navigation";
import "../auth/PublicPage.css";

interface PublicPageProps {
  onLoginClick: () => void;
}

const PublicPage: React.FC<PublicPageProps> = ({ onLoginClick }) => {
  const router = useRouter();

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <img src="/nis-logo.png" alt="Nigeria Immigration Service" />
          <span>Nigeria Immigration Service</span>
        </div>

        <nav className="nav">
          <a href="/about" style={{ cursor: "pointer" }}>About</a>
          <a style={{ cursor: "pointer" }}>Services</a>
          <a style={{ cursor: "pointer" }}>Contact</a>
          <button className="login-btn" onClick={onLoginClick}>
            Login
          </button>
          {/* New button for Patient Login */}
          <button className="login-btn" onClick={() => router.push('/patient-login')}>
            Patient Login
          </button>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-text">
          <h1>NIS Healthcare Management Service</h1>
          <p>
            Secure, digital healthcare solutions for Nigeria Immigration Service
            officers and their families.
          </p>

          <div className="hero-actions">
            <button className="primary-btn">Access Services</button>
            <button className="secondary-btn">Learn More</button>
          </div>
        </div>

        <div className="hero-image">
          <img src="/doctor.png" alt="Healthcare professional" />
        </div>
      </section>

      {/* SERVICES */}
      <section className="services">
        <h2>Our Core Services</h2>

        <div className="service-grid">
          <div className="service-card">
            <div className="icon">📹</div>
            <h3>Telemedicine</h3>
            <p>
              Video, audio, and chat consultations with certified medical
              professionals anywhere, anytime.
            </p>
          </div>

          <div className="service-card">
            <div className="icon">📁</div>
            <h3>Electronic Medical Records</h3>
            <p>
              Secure digital storage and access to medical records,
              prescriptions, lab results, and treatment history.
            </p>
          </div>
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

export default PublicPage;
