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
    background: "var(--admin-bg)",
    color: "var(--admin-text)",
    fontFamily: "var(--font-sans)",
  },
  sidebar: {
    width: 220,
    height: "100vh",
    background: "var(--admin-surface)",
    borderRight: "1px solid var(--admin-border)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  sidebarTop: {
    padding: "18px 16px",
    borderBottom: "1px solid var(--admin-border)",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "var(--admin-accent)",
    color: "var(--cream)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-display)",
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1,
  },
  brandName: { fontSize: 15, fontWeight: 700, color: "var(--admin-accent-hover)", lineHeight: 1.1, fontFamily: "var(--font-display)" },
  brandSub: { fontSize: 10, color: "var(--admin-muted)", lineHeight: 1.2 },
  nav: { flex: 1, overflowY: "auto", padding: "10px 8px" },
  sectionLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "var(--admin-kraft)",
    padding: "10px 16px 4px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "8px 10px",
    borderRadius: 6,
    borderLeft: "3px solid transparent",
    color: "var(--admin-muted)",
    fontSize: 12.5,
    textDecoration: "none",
    cursor: "pointer",
    transition: "background 120ms, color 120ms",
  },
  navItemActive: {
    background: "var(--admin-surface-2)",
    borderLeft: "3px solid var(--admin-accent)",
    color: "var(--admin-text)",
  },
  badge: {
    marginLeft: "auto",
    background: "var(--admin-clay)",
    color: "var(--cream)",
    fontSize: 9,
    fontWeight: 600,
    padding: "2px 6px",
    borderRadius: 999,
    lineHeight: 1.2,
  },
  sidebarBottom: {
    marginTop: "auto",
    borderTop: "1px solid var(--admin-border)",
    padding: "12px 8px",
  },
  userPill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid var(--admin-border)",
    background: "color-mix(in oklab, var(--admin-surface) 78%, var(--admin-kraft) 22%)",
    cursor: "pointer",
    transition: "background 120ms",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "var(--admin-accent)",
    color: "var(--cream)",
    fontSize: 11,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userName: { fontSize: 12, color: "var(--admin-text)", lineHeight: 1.2 },
  userRole: { fontSize: 10, color: "var(--admin-muted)", lineHeight: 1.2 },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },
  topbar: {
    height: 52,
    background: "var(--admin-surface)",
    borderBottom: "1px solid var(--admin-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    flexShrink: 0,
  },
  topbarTitle: { fontSize: 18, fontWeight: 600, color: "var(--admin-text)", fontFamily: "var(--font-display)" },
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  searchWrap: { position: "relative", display: "flex", alignItems: "center" },
  searchIcon: {
    position: "absolute",
    left: 10,
    color: "var(--admin-muted)",
    pointerEvents: "none",
  },
  searchInput: {
    background: "var(--admin-bg)",
    border: "1px solid var(--admin-border)",
    borderRadius: 8,
    padding: "6px 12px 6px 32px",
    fontSize: 12,
    color: "var(--admin-text)",
    width: 200,
    outline: "none",
    fontFamily: "inherit",
  },
  bellBtn: {
    position: "relative",
    width: 32,
    height: 32,
    background: "var(--admin-surface-2)",
    borderRadius: 8,
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "var(--admin-muted)",
  },
  bellDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    background: "var(--admin-clay)",
    borderRadius: "50%",
    border: "1.5px solid var(--admin-surface)",
  },
  actionBtn: {
    background: "var(--admin-accent)",
    color: "var(--cream)",
    border: "none",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "var(--font-display)",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: 20,
    background: "var(--admin-bg)",
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
          e.currentTarget.style.background = "var(--admin-surface-2)";
          e.currentTarget.style.color = "var(--admin-text)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--admin-muted)";
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
  const displayEmail = user?.email ?? displayRole;

  return (
    <div className="admin-shell" style={styles.root}>
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
          >
            <div style={styles.avatar}>{getInitials(displayName)}</div>
            <div style={{ minWidth: 0 }}>
              <div style={styles.userName}>{displayName}</div>
              <div style={styles.userRole}>{displayEmail}</div>
            </div>
            <button
              type="button"
              onClick={logout}
              aria-label="Logout"
              style={{ marginLeft: "auto", background: "transparent", border: "none", color: "var(--admin-muted)", cursor: "pointer", padding: 4 }}
            >
              <LogOut size={14} />
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
