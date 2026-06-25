import Script from "next/script";

export default function SupportButton() {
  return (
    <>
      {/* Custom button anywhere in your layouts or pages */}
      <button
        data-myhappr-username="samueltuoyo"
        data-color="#FF5E5E"
        data-text-color="#ffffff"
        data-radius="9999px"
        data-text="Support Dokugen"
        data-title="Support Dokugen"
        data-theme="#0a0a0a"
        style={{
          backgroundColor: "#FF5E5E",
          color: "#ededed",
          borderRadius: "9999px",
          padding: "12px 24px",
          border: "none",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        Support Dokugen
      </button>

      {/* Load script once in your layout or page */}
      <Script src="https://myhappr.com/widget.js" strategy="afterInteractive" />
    </>
  );
}
