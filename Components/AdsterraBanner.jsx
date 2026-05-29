import Script from "next/script";

export default function AdsterraBanner() {
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", margin: "20px 0" }}>
      <Script
        id="adsterra-banner-config"
        strategy="afterInteractive"
      >{`
        atOptions = {
          'key' : '14b8beb509bf1abd982dbf6914e82e63',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      `}</Script>

      <Script
        src="https://www.highperformanceformat.com/14b8beb509bf1abd982dbf6914e82e63/invoke.js"
        strategy="afterInteractive"
      />
    </div>
  );
}