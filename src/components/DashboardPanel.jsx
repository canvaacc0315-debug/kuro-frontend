import { motion } from "framer-motion";

export default function DashboardPanel({ pdfs }) {
  const totalPdfs = pdfs.length;

  // For now these are placeholders; you can wire them to real values later
  const totalQueries = 0;
  const totalNotes = 0;

  return (
    <div className="h-full flex flex-col gap-6 text-xs text-ink">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] text-inkSoft uppercase tracking-[0.18em] mb-1 block">
            Dashboard
          </span>
          <span className="text-inkSoft">
            Snapshot of your activity in PDF Genie.
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="PDFs uploaded"
          value={totalPdfs}
          hint="Per user library. Increase this with more uploads."
        />
        <StatCard
          label="Queries asked"
          value={totalQueries}
          hint="Increment this from the chat panel for real stats."
        />
        <StatCard
          label="Notes saved"
          value={totalNotes}
          hint="Will grow once notes/bookmarks backend is added."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PanelBlock title="Most recent PDFs">
          {pdfs.length === 0 ? (
            <p className="text-[11px] text-inkSoft/75">
              Upload a PDF to see it appear here.
            </p>
          ) : (
            <ul className="space-y-1">
              {pdfs
                .slice()
                .reverse()
                .slice(0, 5)
                .map((pdf) => (
                  <li
                    key={pdf.pdf_id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{pdf.filename}</span>
                    <span className="text-[9px] text-inkSoft/70 uppercase tracking-[0.16em]">
                      {pdf.pdf_id.slice(0, 6)}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </PanelBlock>

        <PanelBlock title="Next upgrades">
          <ul className="list-disc list-inside space-y-1 text-[11px] text-inkSoft">
            <li>Persist queries & notes in a real database.</li>
            <li>Add plan limits (Free vs Pro) based on usage.</li>
            <li>Visual charts of daily activity (Recharts).</li>
            <li>Team workspaces & shared PDFs.</li>
          </ul>
        </PanelBlock>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full rounded-xl2 border border-stroke bg-panelSoft/80 px-4 py-3 flex flex-col justify-between shadow-subtle/40"
    >
      <div>
        <div className="text-[11px] text-inkSoft uppercase tracking-[0.18em] mb-3">
          {label}
        </div>
        <div className="text-3xl font-semibold leading-none mb-2">
          {value}
        </div>
      </div>
      {hint && (
        <p className="text-[10px] text-inkSoft/80 mt-1">{hint}</p>
      )}
    </motion.div>
  );
}

function PanelBlock({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl2 border border-stroke bg-panelSoft/80 px-4 py-3 shadow-subtle/40 h-full"
    >
      <div className="text-[11px] text-inkSoft uppercase tracking-[0.18em] mb-3">
        {title}
      </div>
      <div className="text-[11px]">{children}</div>
    </motion.div>
  );
}