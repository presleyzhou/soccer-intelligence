"use client";

import { useEffect } from "react";

export default function RootPage() {
  useEffect(() => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    window.location.replace(`${basePath}/en`);
  }, []);

  return (
    <main className="container">
      <p>Opening Soccer Intelligence...</p>
    </main>
  );
}
