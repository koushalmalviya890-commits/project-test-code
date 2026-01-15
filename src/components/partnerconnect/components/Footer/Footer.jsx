import "./Footer.css";
import { Calendar, MapPin, Mail, ArrowUp } from "lucide-react";

export default function Footer({ onSelectRole }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLinkClick = (e, role) => {
    e.preventDefault(); // 1. Stops the page from jumping to the top
    onSelectRole(role); // 2. Triggers the scroll and state change in Home.js
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-top">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="logo-box">Cumma</div>
            <p className="brand-desc">
              Streamline revenue for facilities. Amplify discovery for startups.
              Co-build India’s startup infrastructure layer.
            </p>

            <div className="footer-meta">
              <div className="meta-item">
                <Calendar size={16} className="icon" />
                <span>Launching March 30, 2026</span>
              </div>
              <div className="meta-item">
                <MapPin size={16} className="icon" />
                <span>Powered by BizDateUp</span>
              </div>
            </div>
          </div>

          {/* Links Section - Grouped for better spacing control */}
          <div className="footer-nav-group">
            <div className="footer-links">
              <h4>Quick Links</h4>
              <a href="#">How It Works</a>
              <a href="#" onClick={(e) => handleLinkClick(e, "facility")}>
                Facilities
              </a>

              <a href="#" onClick={(e) => handleLinkClick(e, "affiliate")}>
                Affiliate
              </a>

              <a href="#" onClick={(e) => handleLinkClick(e, "strategic")}>
                Partner Programs
              </a>
            </div>

            <div className="footer-links">
              <h4>Partner Programs</h4>
              <a href="#" onClick={(e) => handleLinkClick(e, "facility")}>
                90-Day Trial
              </a>

              <a href="#" onClick={(e) => handleLinkClick(e, "affiliate")}>
                Affiliate Program
              </a>

              <a href="#" onClick={(e) => handleLinkClick(e, "strategic")}>
                Strategic Partnership
              </a>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <span className="copyright">
            © 2026 Idamumai Technologies. All rights reserved.
          </span>
          <a href="mailto:hello@cumma.in" className="email-link">
            <Mail size={16} /> hello@cumma.in
          </a>
        </div>
      </div>

      {/* Floating Scroll Button */}
      <button
        className="scroll-top"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>
    </footer>
  );
}
