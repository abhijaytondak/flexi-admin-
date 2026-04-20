import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in — SalarySe HR Admin",
  description: "Sign in to the SalarySe HR Admin Dashboard",
};

export default function LoginPage() {
  return <LoginForm />;
}
