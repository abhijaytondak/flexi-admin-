import { Suspense, useState, useEffect, useCallback } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Download,
  Users,
  Bell,
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
import { UserProfileProvider, useUserProfile } from "../contexts/UserProfileContext";
import { NotificationDrawer } from "./NotificationDrawer";
import { useIsMobile } from "../hooks/useIsMobile";

// ─── Nav Items ──────────────────────────────────────────────────────────────

const MAIN_NAV_ITEMS = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    badge: "9",
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
  if (pathname === "/settings") return "Settings";
  if (pathname === "/help") return "Help Center";
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
  badge,
  iconBg,
  iconFg,
}: {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  badge?: string;
  iconBg: string;
  iconFg: string;
}) {
  return (
    <NavLink
      to={path}
      end={path === "/"}
      className="flex items-center gap-3 transition-colors duration-150"
      style={({ isActive }) => ({
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: "var(--text-sm)",
        fontWeight: isActive ? 500 : 400,
        color: isActive ? "var(--sidebar-text)" : "var(--sidebar-text-muted)",
        backgroundColor: isActive ? "var(--sidebar-active-bg)" : "transparent",
        textDecoration: "none",
        marginBottom: 2,
        cursor: "pointer",
      })}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        if (!el.getAttribute("aria-current")) {
          el.style.backgroundColor = "var(--sidebar-hover-bg)";
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        if (!el.getAttribute("aria-current")) {
          el.style.backgroundColor = "transparent";
        }
      }}
    >
      {({ isActive }) => (
        <>
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

          {/* Optional count badge */}
          {badge && (
            <span
              className="flex items-center justify-center"
              style={{
                minWidth: 20,
                height: 20,
                padding: "0 6px",
                borderRadius: "var(--rounded-full)",
                backgroundColor: isActive
                  ? "var(--brand-accent)"
                  : "var(--color-border)",
                color: isActive ? "#FFFFFF" : "var(--sidebar-text-muted)",
                fontSize: 11,
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

// ─── Inner Layout (needs context) ───────────────────────────────────────────

function LayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const isMobile = useIsMobile();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    try { localStorage.removeItem("userProfile"); } catch { /* noop */ }
    setProfileMenuOpen(false);
    toast.success("Logged out");
    navigate("/");
  }, [navigate]);

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  const pageTitle = getPageTitle(location.pathname);

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
          style={{
            padding: "16px 16px 12px",
          }}
        >
          {/* SalarySe logo */}
          <div className="flex items-center shrink-0" style={{ height: 36 }}>
            <img
              src="/logo.svg"
              alt="SalarySe"
              style={{ height: 28, width: "auto" }}
            />
          </div>
          {/* Close button on mobile, expand chevron on desktop */}
          {isMobile ? (
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--sidebar-text-muted)",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
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

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div
          style={{
            height: 1,
            backgroundColor: "var(--sidebar-divider)",
            margin: "4px 16px 8px",
          }}
        />

        {/* ── Main Navigation ─────────────────────────────────────────── */}
        <nav
          className="flex-1 overflow-y-auto"
          style={{ padding: "0 12px" }}
        >
          {/* Section label */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--sidebar-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "8px 12px 6px",
            }}
          >
            Main
          </div>

          {MAIN_NAV_ITEMS.map((item) => (
            <SidebarNavItem key={item.path} {...item} />
          ))}

          <div
            style={{
              height: 1,
              backgroundColor: "var(--sidebar-divider)",
              margin: "12px 4px 8px",
            }}
          />

          {/* Help center — linked to /help route */}
          <SidebarNavItem
            path="/help"
            label="Help center"
            icon={HelpCircle}
            iconBg="var(--icon-help-bg)"
            iconFg="var(--icon-help-fg)"
          />
        </nav>

        {/* ── Profile Footer ──────────────────────────────────────────── */}
        <div style={{ position: "relative", borderTop: "1px solid var(--sidebar-divider)" }}>
          <button
            onClick={() => setProfileMenuOpen((v) => !v)}
            className="flex items-center gap-3 transition-colors duration-150"
            style={{
              padding: "12px 16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--rounded-full)",
                backgroundColor: profile.avatarColor,
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "#fff",
              }}
            >
              {profile.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="truncate"
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  color: "var(--sidebar-text)",
                  lineHeight: 1.3,
                }}
              >
                {profile.name}
              </div>
              <div
                className="truncate"
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--sidebar-text-muted)",
                  lineHeight: 1.3,
                }}
              >
                Profile
              </div>
            </div>
          </button>

          {profileMenuOpen && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 4px)",
                left: 12,
                right: 12,
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                padding: 8,
                zIndex: 50,
              }}
            >
              <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--color-border)", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-foreground)" }}>{profile.name}</div>
                <div style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>{profile.email}</div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "8px 10px", background: "none", border: "none",
                  borderRadius: 6, cursor: "pointer", textAlign: "left",
                  fontSize: 13, color: "var(--brand-red)", fontFamily: "'IBM Plex Sans', sans-serif",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-background)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main Area ───────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1" style={{ marginLeft: isMobile ? 0 : 260 }}>
        {/* ── Top Bar ─────────────────────────────────────────────────── */}
        <header
          className="flex items-center justify-between shrink-0"
          style={{
            height: 56,
            padding: isMobile ? "0 12px" : "0 24px",
            backgroundColor: "var(--color-background)",
            borderBottom: "1px solid var(--color-border)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          {/* Left: Hamburger (mobile) + Breadcrumb */}
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--sidebar-text-muted)",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 4,
                }}
              >
                <Menu size={20} />
              </button>
            )}
            {!isMobile && (
              <Home
                size={14}
                style={{ color: "var(--sidebar-text-muted)" }}
              />
            )}
            {!isMobile && (
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--sidebar-text-muted)",
                }}
              >
                SalarySe
              </span>
            )}
            {!isMobile && (
              <ChevronRight
                size={12}
                style={{ color: "var(--color-border)" }}
              />
            )}
            <span
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                color: "var(--sidebar-text)",
              }}
            >
              {pageTitle}
            </span>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
              className="flex items-center justify-center transition-colors duration-150"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                background: "none",
                cursor: "pointer",
                color: "var(--sidebar-text-muted)",
                position: "relative",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span
                  className="flex items-center justify-center"
                  style={{
                    position: "absolute",
                    top: 3,
                    right: 3,
                    minWidth: 16,
                    height: 16,
                    padding: "0 4px",
                    borderRadius: "var(--rounded-full)",
                    backgroundColor: "var(--brand-accent)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>
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
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUnreadCountChange={handleUnreadCountChange}
      />
    </div>
  );
}

// ─── Layout (wraps with providers) ──────────────────────────────────────────

export function Layout() {
  return (
    <UserProfileProvider>
      <LayoutInner />
    </UserProfileProvider>
  );
}
