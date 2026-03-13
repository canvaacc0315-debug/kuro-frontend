import { useNavigate } from "react-router-dom";
import logoIcon from "../../assets/logo.svg";

export default function KuroFooter() {
    const navigate = useNavigate();

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
                        <a href="/homepage#features">Features</a>
                        <a href="/homepage#how">How it Works</a>
                    </div>
                    <div className="hp-footer-col">
                        <h4>Company</h4>
                        <button onClick={() => navigate("/about")} style={{ background: "none", border: "none", color: "inherit", padding: 0, font: "inherit", cursor: "pointer", textAlign: "left" }}>About</button>
                        <button onClick={() => navigate("/contact")} style={{ background: "none", border: "none", color: "inherit", padding: 0, font: "inherit", cursor: "pointer", textAlign: "left" }}>Contact</button>
                    </div>
                    <div className="hp-footer-col">
                        <h4>Legal</h4>
                        <button onClick={() => navigate("/privacy")} style={{ background: "none", border: "none", color: "inherit", padding: 0, font: "inherit", cursor: "pointer", textAlign: "left" }}>Privacy Policy</button>
                        <button onClick={() => navigate("/terms")} style={{ background: "none", border: "none", color: "inherit", padding: 0, font: "inherit", cursor: "pointer", textAlign: "left" }}>Terms of Service</button>
                    </div>
                </div>
            </div>

            <div className="hp-footer-bottom">
                <p>© {new Date().getFullYear()} RovexAI. All rights reserved.</p>
            </div>
        </footer>
    );
}
