import PublicPageLayout from "../components/layout/PublicPageLayout";

export default function Contact() {
  return (
    <PublicPageLayout>
      <h1>Contact Us</h1>

      <p>
        We’d love to hear from you. Whether you have a question, feedback,
        feature request, or need help using RovexAI, our team is here to assist
        you.
      </p>

      <p>
        RovexAI is committed to providing reliable support and continuously
        improving our platform based on user feedback. If you experience any
        issues or have suggestions, please don’t hesitate to reach out.
      </p>

      <h2>Get in Touch</h2>

      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:support@rovexai.com">RovexAi.HelpDesk@2025</a>
      </p>

      <p>
        <strong>Website:</strong>{" "}
        <a
          href="https://rovexai.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://rovexai.com
        </a>
      </p>

      <h2>Support Hours</h2>

      <p>
        Our support team is available <strong>24/7</strong>. Most inquiries are
        responded to within <strong>24 hours</strong>.
      </p>

      <p>
        Thank you for choosing RovexAI. We’re excited to help you unlock deeper
        insights from your documents.
      </p>
    </PublicPageLayout>
  );
}