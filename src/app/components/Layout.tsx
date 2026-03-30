import { Suspense, useState, useEffect, useCallback } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Download,
  BarChart3,
  Users,
  Settings,
  Search,
  Bell,
  ChevronRight,
} from "lucide-react";
import { UserProfileProvider, useUserProfile } from "../contexts/UserProfileContext";
import { SearchProvider, useSearch } from "../contexts/SearchContext";
import { NotificationDrawer } from "./NotificationDrawer";

// ─── Nav Items ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/policy", label: "Policy Engine", icon: FileText },
  { path: "/approvals", label: "Approval Queue", icon: ClipboardCheck },
  { path: "/payroll", label: "Payroll Export", icon: Download },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/employees", label: "Employee Directory", icon: Users },
  { path: "/settings", label: "Settings", icon: Settings },
] as const;

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  const item = NAV_ITEMS.find((n) => n.path === pathname);
  if (item) return item.label;
  if (pathname === "/onboarding") return "Onboarding";
  if (pathname === "/fiscal") return "Fiscal Settings";
  return "FlexiBenefits";
}

// ─── Loading Spinner ────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <div
        className="animate-spin"
        style={{
          width: 32,
          height: 32,
          border: "3px solid var(--color-border)",
          borderTopColor: "var(--brand-navy)",
          borderRadius: "var(--rounded-full)",
        }}
      />
    </div>
  );
}

// ─── Inner Layout (needs context) ───────────────────────────────────────────

function LayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { query, setQuery } = useSearch();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Clear search on route change
  useEffect(() => {
    setQuery("");
  }, [location.pathname, setQuery]);

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex" style={{ minHeight: "100vh" }}>
      {/* ─── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0"
        style={{
          width: 240,
          backgroundColor: "var(--sidebar-bg)",
          color: "var(--sidebar-text)",
          fontFamily: "'IBM Plex Sans', sans-serif",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 30,
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3"
          style={{
            padding: "var(--space-5) var(--space-5)",
            borderBottom: "1px solid var(--sidebar-divider)",
          }}
        >
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--rounded-lg)",
              backgroundColor: "var(--brand-green)",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.5px",
            }}
          >
            FB
          </div>
          <div>
            <div
              style={{
                fontSize: "var(--text-base)",
                fontWeight: 600,
                color: "var(--sidebar-text)",
                lineHeight: 1.3,
              }}
            >
              FlexiBenefits
            </div>
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--sidebar-text-muted)",
                lineHeight: 1.3,
              }}
            >
              HR Admin Portal
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: "var(--space-3) var(--space-3)" }}>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className="flex items-center gap-3 transition-all duration-200"
              style={({ isActive }) => ({
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--rounded-md)",
                fontSize: "var(--text-sm)",
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "var(--sidebar-text)" : "var(--sidebar-text-muted)",
                backgroundColor: isActive ? "var(--sidebar-active-bg)" : "transparent",
                textDecoration: "none",
                marginBottom: 2,
              })}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                if (!el.classList.contains("active")) {
                  el.style.backgroundColor = "var(--sidebar-hover-bg)";
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                if (!el.classList.contains("active")) {
                  el.style.backgroundColor = "transparent";
                }
              }}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Admin Profile Button */}
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-3 transition-all duration-200"
          style={{
            padding: "var(--space-4) var(--space-5)",
            borderTop: "1px solid var(--sidebar-divider)",
            background: "none",
            border: "none",
            borderTopWidth: 1,
            borderTopStyle: "solid",
            borderTopColor: "var(--sidebar-divider)",
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
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
              {profile.designation}
            </div>
          </div>
          <ChevronRight size={14} style={{ color: "var(--sidebar-text-muted)" }} />
        </button>
      </aside>

      {/* ─── Main Area ───────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1" style={{ marginLeft: 240 }}>
        {/* Topbar */}
        <header
          className="flex items-center justify-between shrink-0"
          style={{
            height: 60,
            padding: "0 var(--space-6)",
            backgroundColor: "var(--color-background)",
            borderBottom: "1px solid var(--color-border)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          {/* Page Title */}
          <h1
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: 600,
              color: "var(--color-foreground)",
              margin: 0,
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            {pageTitle}
          </h1>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div
              className="flex items-center gap-2"
              style={{
                padding: "var(--space-1) var(--space-3)",
                borderRadius: "var(--rounded-md)",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-background)",
                width: 220,
              }}
            >
              <Search size={15} style={{ color: "var(--color-muted-foreground)", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "none",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-foreground)",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  width: "100%",
                }}
              />
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center justify-center transition-all duration-200"
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--rounded-md)",
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "var(--color-muted-foreground)",
                position: "relative",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--brand-navy-alpha-8)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span
                  className="flex items-center justify-center"
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    minWidth: 16,
                    height: 16,
                    padding: "0 4px",
                    borderRadius: "var(--rounded-full)",
                    backgroundColor: "var(--brand-red)",
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

            {/* Profile Chip */}
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2 transition-all duration-200"
              style={{
                padding: "var(--space-1) var(--space-3) var(--space-1) var(--space-1)",
                borderRadius: "var(--rounded-full)",
                border: "1px solid var(--color-border)",
                background: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--brand-navy-alpha-8)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--rounded-full)",
                  backgroundColor: profile.avatarColor,
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {profile.initials}
              </div>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  color: "var(--color-foreground)",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}
              >
                {profile.name.split(" ")[0]}
              </span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main
          className="flex-1"
          style={{
            padding: "var(--space-6)",
            backgroundColor: "var(--color-card)",
            minHeight: "calc(100vh - 60px)",
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
      <SearchProvider>
        <LayoutInner />
      </SearchProvider>
    </UserProfileProvider>
  );
}
