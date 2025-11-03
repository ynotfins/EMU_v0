"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.unregister();
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
      } finally { setDone(true); }
    })();
  }, []);
  return <pre className="p-6 text-sm">{done ? "Service worker and caches cleared." : "Clearing…"}</pre>;
}

