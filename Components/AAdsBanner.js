import React from "react";

const AAdsBanner = () => {
  return (
    <div
      id="frame"
      style={{
        width: "100%",
        maxWidth: "720px", // Ensures it doesn’t exceed the header width
        height: "auto",
        textAlign: "center",
        margin: "10px auto", // Adds spacing to prevent overlap
        overflow: "hidden",
      }}
    >
      <iframe
        data-aa="2381957"
        src="//acceptable.a-ads.com/2381957"
        style={{
          border: "0px",
          padding: "0",
          width: "100%",
          height: "90px", // Ensures a proper fit
          overflow: "hidden",
          backgroundColor: "transparent",
        }}
        title="A-Ads Banner"
      ></iframe>
      <a
        style={{
          display: "block",
          textAlign: "right",
          fontSize: "12px",
          color: "#fff",
        }}
        id="frame-link"
        href="https://aads.com/campaigns/new/?source_id=2381957&source_type=ad_unit&partner=2381957"
      >
        Advertise here
      </a>
    </div>
  );
};

export default AAdsBanner;
