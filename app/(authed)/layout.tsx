import type { ReactNode } from "react";
import LoginGate from "@/components/LoginGate";

export default function AuthedLayout({ children }: { children: ReactNode }) {
  return <LoginGate>{children}</LoginGate>;
}

