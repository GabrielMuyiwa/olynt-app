"use client";

import { useEffect } from "react";
import Script from "next/script";

const ExoClickOutstream = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.AdProvider) {
        window.AdProvider.push({ serve: {} });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        marginTop: "24px",
        marginBottom: "24px",
        width: "100%",
      }}
    >
      <Script
        src="https://a.magsrv.com/ad-provider.js"
        strategy="afterInteractive"
      />

      <ins
        className="eas6a97888e37"
        data-zoneid="5937384"
        style={{
          display: "block",
          width: "100%",
          minHeight: "250px",
        }}
      />
    </div>
  );
};

export default ExoClickOutstream;