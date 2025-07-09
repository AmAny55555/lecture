"use client";
import { useEffect } from "react";

export default function NoPrintScreen() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "PrintScreen") {
        e.preventDefault();
        alert("التقاط الشاشة غير مسموح به في هذا التطبيق.");
        try {
          navigator.clipboard.writeText("");
        } catch {}
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
