import type { ReactNode } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";

/**
 * Segment layout: bypasses the app sidebar by wrapping the login route in
 * the full-viewport AuthLayout. The root `app/layout.tsx` still provides
 * providers and global styles — this simply replaces the visible chrome.
 */
export default function LoginRouteLayout({ children }: { children: ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
