"use client";

import { useReportWebVitals } from "next/web-vitals";

export default function WebVitals() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify({
      ...metric,
      path: window.location.pathname,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/web-vitals", body);
    } else {
      fetch("/api/web-vitals", { body, method: "POST", keepalive: true });
    }
  });

  return null;
}
