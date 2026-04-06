"use client";

import { useEffect } from "react";
import { trackExternalLinkClick } from "@/lib/analytics";

/**
 * Document-level delegated listener that fires `external_link_click` for any
 * click on an anchor whose href points off-site. Mounted once in the root
 * layout so it covers every page (frontend, admin, rich-text content, etc.).
 *
 * Uses the capture phase so it still records clicks when downstream handlers
 * call stopPropagation, and respects analytics consent via trackExternalLinkClick.
 */
export function ExternalLinkTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const siteHost = window.location.host;

    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Only http(s) destinations — skip mailto:, tel:, #fragments, relative paths
      if (!/^https?:\/\//i.test(href)) return;

      let url: URL;
      try {
        url = new URL(href);
      } catch {
        return;
      }

      // Same host = internal link, skip
      if (url.host === siteHost) return;

      // Derive a context label: nearest landmark/section id or the current path
      const landmark = anchor.closest(
        "[data-analytics-context],nav,header,footer,main,section,article",
      );
      const context =
        landmark?.getAttribute("data-analytics-context") ??
        landmark?.getAttribute("id") ??
        landmark?.tagName?.toLowerCase() ??
        window.location.pathname;

      trackExternalLinkClick({
        destination_url: url.href,
        context,
      });
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
