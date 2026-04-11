import { useNavigate, useLocation } from "react-router-dom";
import logoIcon from "../../assets/logo.svg";

export default function KuroFooter() {
    const navigate = useNavigate();
    const location = useLocation();

    function scrollToSection(sectionId) {
        if (location.pathname === "/") {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            navigate(`/#${sectionId}`);
        }
    }

    return (
        <footer className="hp-footer">
            <div className="hp-footer-inner">
                <div className="hp-footer-brand">
                    <div className="hp-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                        <img src={logoIcon} alt="RovexAI Logo" className="hp-logo-img" width="24" height="24" />
                        <span className="hp-logo-text">Rovex<span className="hp-logo-red">AI</span></span>
                    </div>
                    <p className="hp-footer-tagline">Transforming how you work with documents through AI.</p>
                </div>

                <div className="hp-footer-cols">
                    <div className="hp-footer-col">
                        <h4>Product</h4>
                        <button onClick={() => scrollToSection("features")} style={{ background: "none", border: "none", color: "inherit", padding: 0, font: "inherit", cursor: "pointer", textAlign: "left" }}>Features</button>
                        <button onClick={() => scrollToSection("how")} style={{ background: "none", border: "none", color: "inherit", padding: 0, font: "inherit", cursor: "pointer", textAlign: "left" }}>How it Works</button>
                    </div>
                    <div className="hp-footer-col">
                        <h4>Company</h4>
                        <button onClick={() => navigate("/about")} style={{ background: "none", border: "none", color: "inherit", padding: 0, font: "inherit", cursor: "pointer", textAlign: "left" }}>About</button>
                        <button onClick={() => navigate("/contact")} style={{ background: "none", border: "none", color: "inherit", padding: 0, font: "inherit", cursor: "pointer", textAlign: "left" }}>Contact</button>
                    </div>
                    <div className="hp-footer-col">
                        <h4>Legal</h4>
                        <button onClick={() => navigate("/privacy-policy")} style={{ background: "none", border: "none", color: "inherit", padding: 0, font: "inherit", cursor: "pointer", textAlign: "left" }}>Privacy Policy</button>
                    </div>
                </div>
            </div>

            <div className="hp-footer-bottom">
                <p>© {new Date().getFullYear()} RovexAI. All rights reserved.</p>
            </div>
        </footer>
    );
}
