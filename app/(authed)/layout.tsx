import type { ReactNode } from "react";
import LoginGate from "@/components/LoginGate";
import ConsentGate from "@/components/ConsentGate";
import { DebugPanel } from "@/components/debug-panel";

export default function AuthedLayout({ children }: { children: ReactNode }) {
  return (
    <LoginGate>
      <ConsentGate>
        {children}
        <DebugPanel />
      </ConsentGate>
    </LoginGate>
  );
}

