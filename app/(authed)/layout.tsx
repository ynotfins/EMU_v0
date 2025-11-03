import type { ReactNode } from "react";
import LoginGate from "@/components/LoginGate";
import ConsentGate from "@/components/ConsentGate";
import { AuthFix } from "@/components/auth-fix";

export default function AuthedLayout({ children }: { children: ReactNode }) {
  return (
    <LoginGate>
      <ConsentGate>
        <AuthFix />
        {children}
      </ConsentGate>
    </LoginGate>
  );
}

