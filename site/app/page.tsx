import { getTodaySignal } from "@/lib/content";

export default function Home() {
  const signal = getTodaySignal();

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
      data-signal-type={signal.sponsored ? "sponsored" : undefined}
    >
      <div
        className="fade-in fade-in-0"
        style={{
          fontSize: "13px",
          color: "#555577",
          letterSpacing: "3px",
          marginBottom: "48px",
        }}
      >
        {signal.sequence}
      </div>

      <div
        className="fade-in fade-in-1"
        style={{
          fontSize: "44px",
          fontWeight: "200",
          letterSpacing: "6px",
          marginBottom: "36px",
        }}
      >
        {signal.number}
      </div>

      <div
        className="fade-in fade-in-2 fragment"
        style={{
          fontSize: "17px",
          maxWidth: "480px",
          textAlign: "center",
          lineHeight: "1.9",
          marginBottom: "44px",
        }}
      >
        {signal.fragment}
      </div>

      <div
        className="fade-in fade-in-3"
        style={{
          fontSize: "13px",
          letterSpacing: "2px",
          color: "#555577",
        }}
      >
        {signal.color}
      </div>

      {signal.sponsored && signal.sponsorUrl && (
        <a
          href={signal.sponsorUrl}
          className="link-sponsor fade-in fade-in-4"
          target="_blank"
          rel="noopener noreferrer"
        >
          ◈
        </a>
      )}

      <a
        href="/archive"
        className="link-archive fade-in fade-in-4"
      >
        ◦
      </a>
    </div>
  );
}
