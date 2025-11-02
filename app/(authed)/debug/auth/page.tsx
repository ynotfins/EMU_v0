"use client";

import { useEffect, useState } from "react";

import { auth } from "@/lib/firebase";

export default function AuthDebug() {

  const [info, setInfo] = useState<any>(null);

  useEffect(() => {

    const u = auth.currentUser;

    if (!u) return setInfo({ uid: null });

    u.getIdToken().then((t) => setInfo({ uid: u.uid, email: u.email, token: t.slice(0, 24) + "…" }));

  }, []);

  return <pre className="p-4 text-sm rounded-lg border bg-muted/50">{JSON.stringify(info, null, 2)}</pre>;

}

