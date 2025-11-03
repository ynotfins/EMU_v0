import type { ReactNode } from "react";
import LoginGate from "@/components/LoginGate";
import ConsentGate from "@/components/ConsentGate";

export default function AuthedLayout({ children }: { children: ReactNode }) {
  return (
    <LoginGate>
      <ConsentGate>{children}</ConsentGate>
    </LoginGate>
  );
}

