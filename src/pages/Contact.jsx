import { Mail, Globe, Clock, Zap } from "lucide-react";
import PublicPageLayout from "../components/layout/PublicPageLayout";
import AnimatedCard from "../components/animations/AnimatedCard.jsx";

export default function Contact() {
  return (
    <PublicPageLayout>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1>Contact <span className="text-gradient-red">Us</span></h1>
        <p>We’d love to hear from you. Our team is always here to help.</p>
      </div>

      <div style={{ marginBottom: "3rem" }}>
        <p>
          Whether you have a question, feedback, feature request, or need help
          using RovexAI, our support team is ready to assist you.
        </p>
        <p>
          We’re committed to providing reliable support and continuously
          improving our platform based on user feedback.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        <AnimatedCard
          icon={<Mail size={24} color="var(--brand-red)" />}
          title="Email Us"
          description="RovexAi.HelpDesk @2025@gmail.com"
          delay={0.1}
        />
        <AnimatedCard
          icon={<Globe size={24} color="var(--brand-red)" />}
          title="Website"
          description="Visit our main website at https://rovexai.com"
          delay={0.2}
        />
        <AnimatedCard
          icon={<Clock size={24} color="var(--brand-red)" />}
          title="Support Hours"
          description="We are available 24/7. Our AI agents never sleep!"
          delay={0.3}
        />
        <AnimatedCard
          icon={<Zap size={24} color="var(--brand-red)" />}
          title="Response Time"
          description="Most inquiries are answered within 4 hours by our priority team."
          delay={0.4}
        />
      </div>

      <div style={{ textAlign: "center", marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid var(--border-light)" }}>
        <h2>We’re Here to <span style={{ color: 'var(--brand-red)' }}>Help</span></h2>
        <p style={{ maxWidth: '600px', margin: '0 auto' }}>
          Thank you for choosing RovexAI. Your feedback helps us build a better
          document intelligence platform for everyone.
        </p>
      </div>
    </PublicPageLayout>
  );
}