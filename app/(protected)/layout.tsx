"use client";

import { ReactNode, useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";

import { useRouter, usePathname } from "next/navigation";



export default function ProtectedLayout({ children }: { children: ReactNode }) {

  const [ready, setReady] = useState(false);

  const router = useRouter();

  const path = usePathname();



  useEffect(() => {

    const unsub = onAuthStateChanged(auth, (user) => {

      const authed = !!user;

      if (!authed) {

        // preserve where we were going

        router.replace(`/login?next=${encodeURIComponent(path)}`);

      }

      setReady(true);

    });

    return () => unsub();

  }, [router, path]);



  if (!ready) return <div className="p-6 text-sm text-muted-foreground">Checking session…</div>;

  return <>{children}</>;

}

