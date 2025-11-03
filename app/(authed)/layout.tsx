import type { ReactNode } from "react";
import LoginGate from "@/components/LoginGate";
import ConsentGate from "@/components/ConsentGate";
import { DebugPanel } from "@/components/debug-panel";
import { AuthFix } from "@/components/auth-fix";

export default function AuthedLayout({ children }: { children: ReactNode }) {
  return (
    <LoginGate>
      <ConsentGate>
        <AuthFix />
        {children}
        {process.env.NODE_ENV === 'development' && <DebugPanel />}
      </ConsentGate>
    </LoginGate>
  );
}

