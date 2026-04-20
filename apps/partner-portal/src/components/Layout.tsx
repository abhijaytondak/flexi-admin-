"use client";

import { Suspense, useState, useEffect, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Download,
  Users,
  ChevronRight,
  HelpCircle,
  Home,
  ChevronsUpDown,
  Menu,
  X,
  LogOut,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { UserProfileProvider, useUserProfile } from "@partner-portal/shared/contexts/UserProfileContext";
import { useIsMobile } from "@partner-portal/shared/hooks/useIsMobile";

// Auth-only routes: the app sidebar is bypassed via segment layouts,
// but we also guard here in case a child renders Layout transitively.
const AUTH_ROUTES = new Set(["/login", "/forgot-password"]);

// ─── Nav Items ──────────────────────────────────────────────────────────────

const MAIN_NAV_ITEMS = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    iconBg: "var(--icon-dashboard-bg)",
    iconFg: "var(--icon-dashboard-fg)",
  },
  {
    path: "/policy",
    label: "Policy Engine",
    icon: FileText,
    iconBg: "var(--icon-policy-bg)",
    iconFg: "var(--icon-policy-fg)",
  },
  {
    path: "/approvals",
    label: "Approval Queue",
    icon: ClipboardCheck,
    iconBg: "var(--icon-approval-bg)",
    iconFg: "var(--icon-approval-fg)",
  },
  {
    path: "/payroll",
    label: "Payroll Export",
    icon: Download,
    iconBg: "var(--icon-payroll-bg)",
    iconFg: "var(--icon-payroll-fg)",
  },
  {
    path: "/employees",
    label: "Employee Directory",
    icon: Users,
    iconBg: "var(--icon-employees-bg)",
    iconFg: "var(--icon-employees-fg)",
  },
  {
    path: "/settings",
    label: "Settings",
    icon: Settings,
    iconBg: "var(--icon-settings-bg)",
    iconFg: "var(--icon-settings-fg)",
  },
  {
    path: "/help",
    label: "Help Center",
    icon: HelpCircle,
    iconBg: "var(--icon-help-bg)",
    iconFg: "var(--icon-help-fg)",
  },
] as const;

// Combined for route matching
const NAV_ITEMS = [...MAIN_NAV_ITEMS];

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  const item = NAV_ITEMS.find((n) => n.path === pathname);
  if (item) return item.label;
  if (pathname === "/onboarding") return "Onboarding";
  return "SalarySe";
}

// ─── Loading Spinner ────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: "calc(100vh - 56px)" }}
    >
      <div
        className="animate-spin"
        style={{
          width: 28,
          height: 28,
          border: "2.5px solid var(--color-border)",
          borderTopColor: "var(--brand-accent)",
          borderRadius: "var(--rounded-full)",
        }}
      />
    </div>
  );
}

// ─── Sidebar Nav Item ───────────────────────────────────────────────────────

function SidebarNavItem({
  path,
  label,
  icon: Icon,
  iconBg,
  iconFg,
}: {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  iconBg: string;
  iconFg: string;
}) {
  const pathname = usePathname();
  const isActive = path === "/" ? pathname === "/" : pathname === path;

  return (
    <Link
      href={path}
      className="flex items-center gap-3 transition-colors duration-150"
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: "var(--text-sm)",
        fontWeight: isActive ? 500 : 400,
        color: isActive ? "var(--sidebar-text)" : "var(--sidebar-text-muted)",
        backgroundColor: isActive ? "var(--sidebar-active-bg)" : "transparent",
        textDecoration: "none",
        marginBottom: 2,
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      {/* Icon badge — small rounded square with tinted background */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          backgroundColor: isActive ? "var(--brand-accent-alpha-12)" : iconBg,
        }}
      >
        <Icon
          size={14}
          style={{
            color: isActive ? "var(--brand-accent)" : iconFg,
          }}
        />
      </div>

      {/* Label */}
      <span className="flex-1">{label}</span>
    </Link>
  );
}

// ─── Sidebar Logout Row ─────────────────────────────────────────────────────

function SidebarLogoutRow({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 transition-colors duration-150"
      style={{
        width: "100%",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: "var(--text-sm)",
        fontWeight: 400,
        color: "var(--sidebar-text-muted)",
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
        fontFamily: "'IBM Plex Sans', sans-serif",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          // muted red tint — deliberately restrained
          backgroundColor: "rgba(231, 76, 60, 0.08)",
        }}
      >
        <LogOut size={14} style={{ color: "#C0392B" }} />
      </div>
      <span className="flex-1">Logout</span>
    </button>
  );
}

// ─── Inner Layout (needs context) ───────────────────────────────────────────

function LayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useUserProfile();
  const isMobile = useIsMobile();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("userProfile");
    } catch {
      /* noop */
    }
    toast.success("Logged out");
    router.push("/login");
  }, [router]);

  // If this is an auth route, short-circuit — the segment layout renders the
  // full-viewport AuthLayout without the sidebar chrome.
  if (AUTH_ROUTES.has(pathname)) {
    return <>{children}</>;
  }

  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex" style={{ minHeight: "100vh" }}>
      {/* ─── Mobile Backdrop ─────────────────────────────────────────── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 29,
          }}
        />
      )}

      {/* ─── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0"
        style={{
          width: 260,
          backgroundColor: "var(--sidebar-bg)",
          color: "var(--sidebar-text)",
          fontFamily: "'IBM Plex Sans', sans-serif",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 30,
          borderRight: "1px solid var(--color-border)",
          transition: "transform 300ms ease",
          transform: isMobile
            ? sidebarOpen
              ? "translateX(0)"
              : "translateX(-100%)"
            : "translateX(0)",
        }}
      >
        {/* ── Company / Brand Header ──────────────────────────────────── */}
        <div
          className="flex items-center gap-3"
          style={{ padding: "16px 16px 12px" }}
        >
          <div className="flex items-center shrink-0" style={{ height: 36 }}>
            <img
              src="/logo.svg"
              alt="SalarySe"
              style={{ height: 28, width: "auto" }}
            />
          </div>
          {isMobile ? (
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--sidebar-text-muted)", padding: 4,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              <X size={18} />
            </button>
          ) : (
            <ChevronsUpDown
              size={16}
              style={{ color: "var(--sidebar-text-muted)", flexShrink: 0 }}
            />
          )}
        </div>

        <div style={{ height: 1, backgroundColor: "var(--sidebar-divider)", margin: "4px 16px 8px" }} />

        {/* ── Main Navigation ─────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: "0 12px" }}>
          <div style={{
            fontSize: 11, fontWeight: 500, color: "var(--sidebar-text-muted)",
            textTransform: "uppercase", letterSpacing: "0.05em", padding: "8px 12px 6px",
          }}>
            Main
          </div>

          {MAIN_NAV_ITEMS.map((item) => (
            <SidebarNavItem key={item.path} {...item} />
          ))}
        </nav>

        {/* ── Profile Footer ──────────────────────────────────────────── */}
        <div
          style={{
            borderTop: "1px solid var(--sidebar-divider)",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* Profile row (display-only; logout lives below as its own row) */}
          <div
            className="flex items-center gap-3"
            style={{
              padding: "8px 12px",
              borderRadius: 8,
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 32, height: 32, borderRadius: "var(--rounded-full)",
                backgroundColor: profile.avatarColor,
                fontSize: "var(--text-xs)", fontWeight: 600, color: "#fff",
              }}
            >
              {profile.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate" style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--sidebar-text)", lineHeight: 1.3 }}>
                {profile.name}
              </div>
              <div className="truncate" style={{ fontSize: "var(--text-xs)", color: "var(--sidebar-text-muted)", lineHeight: 1.3 }}>
                {profile.email}
              </div>
            </div>
          </div>

          <SidebarLogoutRow onClick={handleLogout} />
        </div>
      </aside>

      {/* ─── Main Area ───────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1" style={{ marginLeft: isMobile ? 0 : 260 }}>
        {/* ── Top Bar ─────────────────────────────────────────────────── */}
        <header
          className="flex items-center justify-between shrink-0"
          style={{
            height: 56, padding: isMobile ? "0 12px" : "0 24px",
            backgroundColor: "var(--color-background)",
            borderBottom: "1px solid var(--color-border)",
            position: "sticky", top: 0, zIndex: 20,
          }}
        >
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--sidebar-text-muted)", padding: 4,
                  display: "flex", alignItems: "center", justifyContent: "center", marginRight: 4,
                }}
              >
                <Menu size={20} />
              </button>
            )}
            {!isMobile && <Home size={14} style={{ color: "var(--sidebar-text-muted)" }} />}
            {!isMobile && <span style={{ fontSize: "var(--text-sm)", color: "var(--sidebar-text-muted)" }}>SalarySe</span>}
            {!isMobile && <ChevronRight size={12} style={{ color: "var(--color-border)" }} />}
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--sidebar-text)" }}>
              {pageTitle}
            </span>
          </div>

          {/* Bell/notification button intentionally removed per PRD v0 */}
          <div />
        </header>

        {/* ── Content Area ────────────────────────────────────────────── */}
        <main
          role="main"
          className="flex-1"
          style={{
            padding: "var(--space-6)",
            backgroundColor: "var(--color-surface)",
            minHeight: "calc(100vh - 56px)",
          }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

// ─── Layout (wraps with providers) ──────────────────────────────────────────

export function Layout({ children }: { children: ReactNode }) {
  return (
    <UserProfileProvider>
      <LayoutInner>{children}</LayoutInner>
    </UserProfileProvider>
  );
}
