import React from "react";

const AAdsBanner = () => {
  return (
    <div
      style={{
        width: "100%",
        margin: "20px auto",
        position: "relative",
        zIndex: 99998,
        textAlign: "center",
      }}
    >
      <iframe
        data-aa="2439349"
        src="https://acceptable.a-ads.com/2439349/?size=Adaptive"
        title="AAds Banner"
        loading="eager"
        style={{
          border: 0,
          padding: 0,
          width: "100%",
          maxWidth: "728px",
          height: "90px",
          display: "block",
          margin: "0 auto",
          overflow: "hidden",
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
};

export default AAdsBanner;