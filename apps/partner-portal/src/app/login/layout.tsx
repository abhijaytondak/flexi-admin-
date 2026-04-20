import type { ReactNode } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function LoginRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
