"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

/**
 * Client Component to initialize analytics
 * Must be a Client Component because it uses useEffect
 */
export function AnalyticsInitializer() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return null;
}

