import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password — SalarySe HR Admin",
  description: "Request a password reset link for the SalarySe HR Admin Dashboard",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
