"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Pages where you want Monetag Vignette to run
const ALLOWED_PATHS = ["/", "/tasks", "/referral"];

const MONETAG_ZONE = "11066464";
const MONETAG_SRC = "https://n6wxm.com/vignette.min.js";

export default function MonetagScript() {
  const pathname = usePathname();

  useEffect(() => {
    // Only run on allowed pages
    const allowed = ALLOWED_PATHS.some((path) => pathname.startsWith(path));
    if (!allowed) return;

    // Avoid adding the script twice
    if (document.querySelector(`script[data-monetag-zone="${MONETAG_ZONE}"]`)) {
      return;
    }

    const script = document.createElement("script");
    script.dataset.monetagZone = MONETAG_ZONE;
    script.dataset.zone = MONETAG_ZONE;
    script.src = MONETAG_SRC;
    script.async = true;
    document.body.appendChild(script);

    // Optional cleanup when leaving the page
    return () => {
      script.remove();
    };
  }, [pathname]);

  return null;
}