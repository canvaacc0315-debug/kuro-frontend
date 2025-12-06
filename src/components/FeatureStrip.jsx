import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "Secure Storage",
    desc: "Your PDFs stay private in your account. Clerk handles auth, we handle encryption & isolation.",
    tag: "AI",
  },
  {
    title: "Instant Answers",
    desc: "Search, ask, and extract insights in seconds using vector search + GPT, instead of skimming 200 pages.",
    tag: "AI",
  },
  {
    title: "Study Power-Ups",
    desc: "Generate summaries, flashcards, MCQs, and study guides from any chapter or page range.",
    tag: "AI",
  },
];

export default function FeatureStrip() {
  return (
    <section
      id="features"
      className="bg-black border-t border-bossStroke/60"
    >
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-center text-xl md:text-2xl font-extrabold tracking-[0.18em] uppercase mb-8">
          WHY CHOOSE <span className="text-bossRed">PDF GENIE</span>
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="relative bg-gradient-to-br from-bossBgSoft via-bossCard to-black border border-bossStroke rounded-boss px-5 py-5 shadow-boss flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-md bg-bossRed flex items-center justify-center text-xs font-bold">
                  {feature.tag}
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">
                  {feature.title}
                </h3>
              </div>
              <p className="text-[11px] text-bossTextSoft leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}