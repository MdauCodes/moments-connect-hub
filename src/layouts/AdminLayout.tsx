import type { CSSProperties, ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutList,
  Package,
  BarChart2,
  Users,
  Settings,
  Bell,
  Search,
  FileText,
  LogOut,
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { can, type Permission } from "@/lib/permissions";

interface AdminLayoutProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutList;
  badge?: number;
  /** If set, the item is only rendered when the current role has this permission. */
  requires?: Permission;
}

const mainNav: NavItem[] = [
  { label: "Enquiries", to: "/admin/enquiries", icon: LayoutList, badge: 7 },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Blogs", to: "/admin/blogs", icon: FileText },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart2 },
];

const manageNav: NavItem[] = [
  { label: "Staff", to: "/admin/staff", icon: Users, requires: "staff:manage" },
  { label: "Settings", to: "/admin/settings", icon: Settings, requires: "settings:manage" },
];

const styles: Record<string, CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "row",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    background: "color-mix(in oklch, var(--forest) 14%, var(--background))",
    color: "var(--foreground)",
    fontFamily: "var(--font-sans)",
  },
  sidebar: {
    width: 220,
    height: "100vh",
    background: "color-mix(in oklch, var(--card) 88%, var(--forest))",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  sidebarTop: {
    padding: "18px 16px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "var(--primary)",
    color: "var(--kraft)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Georgia, serif",
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1,
  },
  brandName: { fontSize: 12, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.2 },
  brandSub: { fontSize: 10, color: "var(--muted-foreground)", lineHeight: 1.2 },
  nav: { flex: 1, overflowY: "auto", padding: "10px 8px" },
  sectionLabel: {
    fontSize: 9.5,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "var(--muted-foreground)",
    padding: "10px 16px 4px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "7px 10px",
    borderRadius: 7,
    color: "var(--muted-foreground)",
    fontSize: 12.5,
    textDecoration: "none",
    cursor: "pointer",
    transition: "background 120ms, color 120ms",
  },
  navItemActive: {
    background: "color-mix(in oklch, var(--primary) 18%, transparent)",
    color: "var(--primary)",
  },
  badge: {
    marginLeft: "auto",
    background: "var(--destructive)",
    color: "var(--destructive-foreground)",
    fontSize: 9,
    fontWeight: 600,
    padding: "2px 6px",
    borderRadius: 999,
    lineHeight: 1.2,
  },
  sidebarBottom: {
    marginTop: "auto",
    borderTop: "1px solid var(--border)",
    padding: "12px 8px",
  },
  userPill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "background 120ms",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "var(--primary)",
    color: "var(--kraft)",
    fontSize: 11,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userName: { fontSize: 12, color: "var(--foreground)", lineHeight: 1.2 },
  userRole: { fontSize: 10, color: "var(--muted-foreground)", lineHeight: 1.2 },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },
  topbar: {
    height: 52,
    background: "color-mix(in oklch, var(--card) 88%, var(--forest))",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    flexShrink: 0,
  },
  topbarTitle: { fontSize: 14, fontWeight: 600, color: "var(--foreground)", fontFamily: "var(--font-display)" },
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  searchWrap: { position: "relative", display: "flex", alignItems: "center" },
  searchIcon: {
    position: "absolute",
    left: 10,
    color: "var(--muted-foreground)",
    pointerEvents: "none",
  },
  searchInput: {
    background: "var(--background)",
    border: "1px solid var(--input)",
    borderRadius: 8,
    padding: "6px 12px 6px 32px",
    fontSize: 12,
    color: "var(--foreground)",
    width: 200,
    outline: "none",
    fontFamily: "inherit",
  },
  bellBtn: {
    position: "relative",
    width: 32,
    height: 32,
    background: "var(--secondary)",
    borderRadius: 8,
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "var(--secondary-foreground)",
  },
  bellDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    background: "var(--destructive)",
    borderRadius: "50%",
    border: "1.5px solid var(--card)",
  },
  actionBtn: {
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "none",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: 20,
    background: "color-mix(in oklch, var(--forest) 14%, var(--background))",
  },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "var(--secondary)";
          e.currentTarget.style.color = "var(--foreground)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--muted-foreground)";
        }
      }}
    >
      <Icon size={16} />
      <span>{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span style={styles.badge}>{item.badge}</span>
      )}
    </Link>
  );
}

export function AdminLayout({ title, actionLabel, onAction, children }: AdminLayoutProps) {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (to: string): boolean => {
    if (to === "/admin/enquiries") {
      return pathname === to || pathname.startsWith("/admin/enquiries/");
    }
    return pathname === to;
  };

  const displayName = user?.name ?? "Admin User";
  const displayRole = user?.role === "ADMIN" ? "Administrator" : user?.role === "STAFF" ? "Staff" : "Signed in";

  return (
    <div style={styles.root}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.logoMark}>m</div>
          <div>
            <div style={styles.brandName}>Moments</div>
            <div style={styles.brandSub}>Admin Panel</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <div style={styles.sectionLabel}>Main</div>
          {mainNav
            .filter((item) => !item.requires || can(user?.role, item.requires))
            .map((item) => (
              <NavLink key={item.to} item={item} active={isActive(item.to)} />
            ))}

          {manageNav.some((item) => !item.requires || can(user?.role, item.requires)) && (
            <>
              <div style={styles.sectionLabel}>Manage</div>
              {manageNav
                .filter((item) => !item.requires || can(user?.role, item.requires))
                .map((item) => (
                  <NavLink key={item.to} item={item} active={isActive(item.to)} />
                ))}
            </>
          )}
        </nav>

        <div style={styles.sidebarBottom}>
          <div
            style={styles.userPill}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--secondary)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={styles.avatar}>{getInitials(displayName)}</div>
            <div style={{ minWidth: 0 }}>
              <div style={styles.userName}>{displayName}</div>
              <div style={styles.userRole}>{displayRole}</div>
            </div>
            <button
              type="button"
              aria-label="Sign out"
              onClick={logout}
              style={{ marginLeft: "auto", border: 0, background: "transparent", color: "var(--muted-foreground)", cursor: "pointer" }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>{title}</div>
          <div style={styles.topbarRight}>
            <div style={styles.searchWrap}>
              <Search size={14} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search enquiries..."
                style={styles.searchInput}
              />
            </div>
            <button type="button" style={styles.bellBtn} aria-label="Notifications">
              <Bell size={15} />
              <span style={styles.bellDot} />
            </button>
            {actionLabel && (
              <button type="button" style={styles.actionBtn} onClick={onAction}>
                {actionLabel}
              </button>
            )}
          </div>
        </div>

        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
