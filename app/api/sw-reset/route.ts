export async function POST() {
  const body = `
    <script>
    (async ()=>{
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) await r.unregister();
      caches && caches.keys && (await caches.keys()).forEach(k=>caches.delete(k));
      document.body.innerText = 'Service worker and caches cleared.';
    })();
    </script>
  `
  return new Response(body, { headers: { "content-type": "text/html" }})
}

