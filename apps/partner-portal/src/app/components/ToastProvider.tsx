import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: "var(--text-sm)",
          borderRadius: "var(--rounded-lg)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--elevation-md)",
        },
      }}
      richColors
      closeButton
      duration={4000}
    />
  );
}
