import { useEffect } from "react";

export default function InPagePush() {
  useEffect(() => {
    const existing = document.getElementById("monetag-ipp");
    if (existing) return;

    const s = document.createElement("script");
    s.id = "monetag-ipp";
    s.dataset.zone = "11067213";
    s.src = "https://nap5k.com/tag.min.js";
    document.head.appendChild(s);
  }, []);

  return null;
}