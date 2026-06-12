import { getAllSignals } from "@/lib/content";

export default function Archive() {
  const signals = getAllSignals();

  return (
    <div
      style={{
        background: "#0a0a0a",
        minHeight: "100vh",
        padding: "52px 40px",
        fontFamily: "'Geist Mono', 'ui-monospace', monospace",
      }}
    >
      <div style={{ maxWidth: "520px", margin: "0 auto" }}>
        <a href="/" className="link-back">◂</a>

        <ul style={{ listStyle: "none", marginTop: "64px" }}>
          {signals.map((signal) => (
            <li key={signal.date}>
              <a
                href={`/signal/${signal.date}`}
                className="archive-date"
              >
                {signal.date}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
