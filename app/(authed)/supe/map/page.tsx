// Build markers from incidents updated in the last 4 hours

"use client";

import { useEffect, useState } from "react";

import { LiveMap } from "@/components/live-map";

import { db } from "@/lib/firebase";

import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

export default function Page() {

  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {

    const since = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

    (async () => {

      const q = query(collection(db, "incidents"), where("updatedAt", ">=", since), orderBy("updatedAt", "desc"));

      const snap = await getDocs(q);

      const ms = snap.docs

        .map(d => ({ docId: d.id, ...(d.data() as any) }))

        .filter(x => typeof x.lat === "number" && typeof x.lng === "number")

        .map(x => ({ uid: String(x.docId), name: x.type || "Alert", lat: Number(x.lat), lng: Number(x.lng) }));

      setMarkers(ms);

    })();

  }, []);

  return (

    <div className="p-4 space-y-4">

      <h1 className="text-2xl font-bold">Live Map</h1>

      <LiveMap markers={markers} />

    </div>

  );

}

