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
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

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
}

const mainNav: NavItem[] = [
  { label: "Enquiries", to: "/admin/enquiries", icon: LayoutList, badge: 7 },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart2 },
];

const manageNav: NavItem[] = [
  { label: "Staff", to: "/admin/staff", icon: Users },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

const styles: Record<string, CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "row",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    background: "#0F1117",
    color: "#E2E8F0",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  sidebar: {
    width: 220,
    height: "100vh",
    background: "#161B27",
    borderRight: "1px solid #1E2535",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  sidebarTop: {
    padding: "18px 16px",
    borderBottom: "1px solid #1E2535",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "#2D5A3D",
    color: "#C49A6C",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Georgia, serif",
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1,
  },
  brandName: { fontSize: 12, fontWeight: 600, color: "#E2E8F0", lineHeight: 1.2 },
  brandSub: { fontSize: 10, color: "#4A5568", lineHeight: 1.2 },
  nav: { flex: 1, overflowY: "auto", padding: "10px 8px" },
  sectionLabel: {
    fontSize: 9.5,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#4A5568",
    padding: "10px 16px 4px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "7px 10px",
    borderRadius: 7,
    color: "#8896A8",
    fontSize: 12.5,
    textDecoration: "none",
    cursor: "pointer",
    transition: "background 120ms, color 120ms",
  },
  navItemActive: {
    background: "#1E3A2A",
    color: "#4CAF72",
  },
  badge: {
    marginLeft: "auto",
    background: "#C53030",
    color: "white",
    fontSize: 9,
    fontWeight: 600,
    padding: "2px 6px",
    borderRadius: 999,
    lineHeight: 1.2,
  },
  sidebarBottom: {
    marginTop: "auto",
    borderTop: "1px solid #1E2535",
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
    background: "#2D5A3D",
    color: "#C49A6C",
    fontSize: 11,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userName: { fontSize: 12, color: "#CBD5E0", lineHeight: 1.2 },
  userRole: { fontSize: 10, color: "#4A5568", lineHeight: 1.2 },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },
  topbar: {
    height: 52,
    background: "#161B27",
    borderBottom: "1px solid #1E2535",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    flexShrink: 0,
  },
  topbarTitle: { fontSize: 14, fontWeight: 600, color: "#E2E8F0" },
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  searchWrap: { position: "relative", display: "flex", alignItems: "center" },
  searchIcon: {
    position: "absolute",
    left: 10,
    color: "#4A5568",
    pointerEvents: "none",
  },
  searchInput: {
    background: "#0F1117",
    border: "1px solid #1E2535",
    borderRadius: 8,
    padding: "6px 12px 6px 32px",
    fontSize: 12,
    color: "#E2E8F0",
    width: 200,
    outline: "none",
    fontFamily: "inherit",
  },
  bellBtn: {
    position: "relative",
    width: 32,
    height: 32,
    background: "#1E2535",
    borderRadius: 8,
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#8896A8",
  },
  bellDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    background: "#C53030",
    borderRadius: "50%",
    border: "1.5px solid #161B27",
  },
  actionBtn: {
    background: "#2D5A3D",
    color: "#9AE6B4",
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
    background: "#0F1117",
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
          e.currentTarget.style.background = "#1E2535";
          e.currentTarget.style.color = "#E2E8F0";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#8896A8";
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
  const { user } = useAdminAuth();
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
          {mainNav.map((item) => (
            <NavLink key={item.to} item={item} active={isActive(item.to)} />
          ))}

          <div style={styles.sectionLabel}>Manage</div>
          {manageNav.map((item) => (
            <NavLink key={item.to} item={item} active={isActive(item.to)} />
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <div
            style={styles.userPill}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1E2535")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={styles.avatar}>{getInitials(displayName)}</div>
            <div style={{ minWidth: 0 }}>
              <div style={styles.userName}>{displayName}</div>
              <div style={styles.userRole}>{displayRole}</div>
            </div>
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
