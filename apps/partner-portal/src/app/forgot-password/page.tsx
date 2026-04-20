import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password — SalarySe HR Admin",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
