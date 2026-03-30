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
  HelpCircle,
  Home,
  ChevronsUpDown,
  Filter,
  Calendar,
} from "lucide-react";
import { UserProfileProvider, useUserProfile } from "../contexts/UserProfileContext";
import { SearchProvider, useSearch } from "../contexts/SearchContext";
import { NotificationDrawer } from "./NotificationDrawer";

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
    path: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    iconBg: "var(--icon-analytics-bg)",
    iconFg: "var(--icon-analytics-fg)",
  },
  {
    path: "/employees",
    label: "Employee Directory",
    icon: Users,
    iconBg: "var(--icon-employees-bg)",
    iconFg: "var(--icon-employees-fg)",
  },
] as const;

const BOTTOM_NAV_ITEMS = [
  {
    path: "/settings",
    label: "Settings",
    icon: Settings,
    iconBg: "var(--icon-settings-bg)",
    iconFg: "var(--icon-settings-fg)",
  },
] as const;

// Combined for route matching
const NAV_ITEMS = [...MAIN_NAV_ITEMS, ...BOTTOM_NAV_ITEMS];

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
        }}
      >
        {/* ── Company / Brand Header ──────────────────────────────────── */}
        <div
          className="flex items-center gap-3"
          style={{
            padding: "16px 16px 12px",
          }}
        >
          {/* Brand icon */}
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: "var(--brand-accent)",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.3px",
            }}
          >
            FB
          </div>
          <div className="flex-1 min-w-0">
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
          </div>
          {/* Expand chevron */}
          <ChevronsUpDown
            size={16}
            style={{ color: "var(--sidebar-text-muted)", flexShrink: 0 }}
          />
        </div>

        {/* ── Sidebar Search ──────────────────────────────────────────── */}
        <div style={{ padding: "0 12px 8px" }}>
          <div
            className="flex items-center gap-2"
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--sidebar-hover-bg)",
            }}
          >
            <Search
              size={14}
              style={{ color: "var(--sidebar-text-muted)", flexShrink: 0 }}
            />
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
                color: "var(--sidebar-text)",
                fontFamily: "'IBM Plex Sans', sans-serif",
                width: "100%",
              }}
            />
            <kbd
              style={{
                fontSize: 10,
                fontFamily: "'IBM Plex Sans', sans-serif",
                color: "var(--sidebar-text-muted)",
                backgroundColor: "var(--color-background)",
                border: "1px solid var(--color-border)",
                borderRadius: 4,
                padding: "1px 5px",
                lineHeight: 1.4,
                whiteSpace: "nowrap",
              }}
            >
              {"\u2318"}K
            </kbd>
          </div>
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

          {/* Settings section */}
          <div
            style={{
              height: 1,
              backgroundColor: "var(--sidebar-divider)",
              margin: "12px 4px 8px",
            }}
          />
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--sidebar-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "4px 12px 6px",
            }}
          >
            Settings
          </div>

          {BOTTOM_NAV_ITEMS.map((item) => (
            <SidebarNavItem key={item.path} {...item} />
          ))}

          {/* Help center — static link style, not a route */}
          <button
            className="flex items-center gap-3 transition-colors duration-150"
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: "var(--text-sm)",
              fontWeight: 400,
              color: "var(--sidebar-text-muted)",
              backgroundColor: "transparent",
              textDecoration: "none",
              marginBottom: 2,
              cursor: "pointer",
              border: "none",
              width: "100%",
              textAlign: "left",
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
                width: 24,
                height: 24,
                borderRadius: 6,
                backgroundColor: "var(--icon-help-bg)",
              }}
            >
              <HelpCircle size={14} style={{ color: "var(--icon-help-fg)" }} />
            </div>
            <span>Help center</span>
          </button>
        </nav>

        {/* ── Profile Footer ──────────────────────────────────────────── */}
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-3 transition-colors duration-150"
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--sidebar-divider)",
            background: "none",
            border: "none",
            borderTopWidth: 1,
            borderTopStyle: "solid",
            borderTopColor: "var(--sidebar-divider)",
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
              {profile.designation}
            </div>
          </div>
          <Settings size={15} style={{ color: "var(--sidebar-text-muted)", flexShrink: 0 }} />
        </button>
      </aside>

      {/* ─── Main Area ───────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1" style={{ marginLeft: 260 }}>
        {/* ── Top Bar ─────────────────────────────────────────────────── */}
        <header
          className="flex items-center justify-between shrink-0"
          style={{
            height: 56,
            padding: "0 24px",
            backgroundColor: "var(--color-background)",
            borderBottom: "1px solid var(--color-border)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <Home
              size={14}
              style={{ color: "var(--sidebar-text-muted)" }}
            />
            <span
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--sidebar-text-muted)",
              }}
            >
              FlexiBenefits
            </span>
            <ChevronRight
              size={12}
              style={{ color: "var(--color-border)" }}
            />
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
            {/* Date range badge */}
            <button
              className="flex items-center gap-1.5 transition-colors duration-150"
              style={{
                padding: "5px 10px",
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                background: "none",
                cursor: "pointer",
                fontSize: "var(--text-sm)",
                color: "var(--sidebar-text-muted)",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Calendar size={13} />
              <span>Last 30 days</span>
            </button>

            {/* Filter button */}
            <button
              className="flex items-center gap-1.5 transition-colors duration-150"
              style={{
                padding: "5px 10px",
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                background: "none",
                cursor: "pointer",
                fontSize: "var(--text-sm)",
                color: "var(--sidebar-text-muted)",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Filter size={13} />
              <span>Filter</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setDrawerOpen(true)}
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
      <SearchProvider>
        <LayoutInner />
      </SearchProvider>
    </UserProfileProvider>
  );
}
