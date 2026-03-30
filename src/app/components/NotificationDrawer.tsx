import { useEffect, useState, useCallback } from "react";
import {
  X,
  Bell,
  CheckCircle2,
  XCircle,
  FileText,
  Shield,
  Info,
} from "lucide-react";
import * as api from "../utils/api";

interface Notification {
  id: string;
  type:
    | "claim_submitted"
    | "claim_approved"
    | "claim_rejected"
    | "policy_update"
    | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}

const TYPE_ICON: Record<string, typeof Bell> = {
  claim_submitted: FileText,
  claim_approved: CheckCircle2,
  claim_rejected: XCircle,
  policy_update: Shield,
  system: Info,
};

const TYPE_COLOR: Record<string, string> = {
  claim_submitted: "var(--brand-blue)",
  claim_approved: "var(--brand-green)",
  claim_rejected: "var(--brand-red)",
  policy_update: "var(--brand-purple)",
  system: "var(--brand-amber)",
};

const TYPE_BG: Record<string, string> = {
  claim_submitted: "var(--brand-blue-light)",
  claim_approved: "var(--brand-green-light)",
  claim_rejected: "var(--brand-red-light)",
  policy_update: "var(--brand-purple-light)",
  system: "var(--brand-amber-light)",
};

function groupByDate(notifications: Notification[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: Notification[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Earlier", items: [] },
  ];

  for (const n of notifications) {
    const d = new Date(n.timestamp);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() >= today.getTime()) {
      groups[0].items.push(n);
    } else if (d.getTime() >= yesterday.getTime()) {
      groups[1].items.push(n);
    } else {
      groups[2].items.push(n);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  onUnreadCountChange,
}: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      const data = (res.data ?? []) as Notification[];
      setNotifications(data);
      onUnreadCountChange(data.filter((n) => !n.read).length);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      onUnreadCountChange(0);
    } catch {
      // silent
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await api.dismissNotification(id);
      setNotifications((prev) => {
        const next = prev.filter((n) => n.id !== id);
        onUnreadCountChange(next.filter((n) => !n.read).length);
        return next;
      });
    } catch {
      // silent
    }
  };

  const handleClick = async (n: Notification) => {
    if (!n.read) {
      try {
        await api.markNotificationRead(n.id);
        setNotifications((prev) => {
          const next = prev.map((item) =>
            item.id === n.id ? { ...item, read: true } : item
          );
          onUnreadCountChange(next.filter((item) => !item.read).length);
          return next;
        });
      } catch {
        // silent
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const groups = groupByDate(notifications);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 z-50 flex flex-col"
        style={{
          width: 320,
          height: "100vh",
          backgroundColor: "var(--color-background)",
          boxShadow: "var(--elevation-xl)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            padding: "var(--space-4) var(--space-5)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: 600,
                color: "var(--color-foreground)",
              }}
            >
              Notifications
            </span>
            {unreadCount > 0 && (
              <span
                className="flex items-center justify-center"
                style={{
                  minWidth: 20,
                  height: 20,
                  padding: "0 6px",
                  borderRadius: "var(--rounded-full)",
                  backgroundColor: "var(--brand-red)",
                  color: "#fff",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="transition-all duration-200"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "var(--text-xs)",
                  color: "var(--brand-blue)",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  padding: "var(--space-1) var(--space-2)",
                  borderRadius: "var(--rounded-sm)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--brand-blue-light)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center justify-center transition-all duration-200"
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--rounded-md)",
                border: "none",
                background: "none",
                color: "var(--color-muted-foreground)",
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
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--space-3) 0" }}>
          {loading ? (
            <div className="flex items-center justify-center" style={{ padding: "var(--space-8)" }}>
              <div
                className="animate-spin"
                style={{
                  width: 24,
                  height: 24,
                  border: "2px solid var(--color-border)",
                  borderTopColor: "var(--brand-navy)",
                  borderRadius: "var(--rounded-full)",
                }}
              />
            </div>
          ) : notifications.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center"
              style={{
                padding: "var(--space-8)",
                color: "var(--color-muted-foreground)",
              }}
            >
              <Bell size={32} style={{ marginBottom: "var(--space-3)", opacity: 0.4 }} />
              <span style={{ fontSize: "var(--text-sm)" }}>
                No notifications yet
              </span>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <div
                  style={{
                    padding: "var(--space-2) var(--space-5)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    color: "var(--color-muted-foreground)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {group.label}
                </div>
                {group.items.map((n) => {
                  const IconComp = TYPE_ICON[n.type] || Bell;
                  return (
                    <div
                      key={n.id}
                      className="flex gap-3 transition-all duration-200"
                      style={{
                        padding: "var(--space-3) var(--space-5)",
                        cursor: "pointer",
                        backgroundColor: n.read
                          ? "transparent"
                          : "var(--brand-navy-alpha-8)",
                      }}
                      onClick={() => handleClick(n)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--brand-navy-alpha-8)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = n.read
                          ? "transparent"
                          : "var(--brand-navy-alpha-8)")
                      }
                    >
                      {/* Icon */}
                      <div
                        className="flex items-center justify-center shrink-0"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "var(--rounded-md)",
                          backgroundColor: TYPE_BG[n.type] || "var(--brand-navy-alpha-8)",
                        }}
                      >
                        <IconComp
                          size={16}
                          style={{
                            color: TYPE_COLOR[n.type] || "var(--brand-navy)",
                          }}
                        />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            style={{
                              fontSize: "var(--text-sm)",
                              fontWeight: n.read ? 400 : 600,
                              color: "var(--color-foreground)",
                              lineHeight: 1.4,
                            }}
                          >
                            {n.title}
                          </span>
                          {!n.read && (
                            <div
                              className="shrink-0"
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "var(--rounded-full)",
                                backgroundColor: "var(--brand-blue)",
                                marginTop: 5,
                              }}
                            />
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--color-muted-foreground)",
                            margin: "2px 0 0",
                            lineHeight: 1.4,
                          }}
                        >
                          {n.message}
                        </p>
                        <span
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--color-muted-foreground)",
                            opacity: 0.7,
                          }}
                        >
                          {formatRelativeTime(n.timestamp)}
                        </span>
                      </div>

                      {/* Dismiss */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(n.id);
                        }}
                        className="shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                        style={{
                          width: 24,
                          height: 24,
                          border: "none",
                          background: "none",
                          color: "var(--color-muted-foreground)",
                          cursor: "pointer",
                          borderRadius: "var(--rounded-sm)",
                          padding: 0,
                          marginTop: 2,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "1";
                          e.currentTarget.style.backgroundColor =
                            "var(--brand-navy-alpha-8)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "";
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
