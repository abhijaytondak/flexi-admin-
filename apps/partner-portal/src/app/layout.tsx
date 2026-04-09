import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ToastProvider";
import "@/styles/theme.css";

export const metadata: Metadata = {
  title: "FlexiBenefits — HR Admin Portal",
  description: "Enterprise HR Benefits Portal by SalarySe",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <Layout>{children}</Layout>
          <ToastProvider />
        </ErrorBoundary>
      </body>
    </html>
  );
}
