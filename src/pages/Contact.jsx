import { Mail, Globe, MapPin, MessagesSquare } from "lucide-react";
import PublicPageLayout from "../components/layout/PublicPageLayout";
import AnimatedCard from "../components/animations/AnimatedCard.jsx";

export default function Contact() {
  return (
    <PublicPageLayout>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: '3rem', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
          Contact <span className="text-gradient-red">Us</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Have a question or need technical support? We're here to help you get the most out of RovexAI.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        <AnimatedCard
          icon={<Mail size={22} />}
          title="Email Support"
          description="Send us a message and our technical team will respond within 24 hours."
          badge="Fastest"
          onClick={() => window.location.href = "mailto:RovexAi.HelpDesk@gmail.com"}
          delay={0.1}
        />
        <AnimatedCard
          icon={<Globe size={22} />}
          title="Documentation"
          description="Browse our comprehensive guides and API documentation to learn more."
          onClick={() => window.location.href = "https://rovexai.com"}
          delay={0.2}
        />
        <AnimatedCard
          icon={<MessagesSquare size={22} />}
          title="Community"
          description="Join the official community to share tips and get quick community answers."
          delay={0.3}
        />
        <AnimatedCard
          icon={<MapPin size={22} />}
          title="Headquarters"
          description="Global Operations. 100% remote-first company building intelligent tools."
          delay={0.4}
        />
      </div>

      <div style={{ textAlign: "center", paddingTop: "3rem", borderTop: "1px solid var(--border-light)" }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 600 }}>We’re Here to Help</h2>
        <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          Thank you for choosing RovexAI. Your direct feedback drives our machine learning roadmap and platform improvements.
        </p>
      </div>
    </PublicPageLayout>
  );
}