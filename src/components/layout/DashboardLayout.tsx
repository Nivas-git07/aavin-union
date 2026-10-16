import { navItems, titles } from "@/app/navigation";
import { HelpDialog } from "@/components/feedback/HelpDialog";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { Logo } from "@/components/ui/Logo";
import type { Summary } from "@/types/models";
import type { LinkBuilder } from "@/types/navigation";
import {
  ArrowUpRight,
  ChevronRight,
  CircleHelp,
  Factory,
  Heart,
  MapPin,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function DashboardLayout({
  page,
  summary,
  linkTo,
  children,
  printContent,
}: {
  page: string;
  summary: Summary | null;
  linkTo: LinkBuilder;
  children: ReactNode;
  printContent?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [help, setHelp] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setMobileNav(false);
  }, [location.pathname]);

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {mobileNav && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <Link
          className="brand"
          to={linkTo("/overview")}
          aria-label="Aavin Madurai Union overview"
        >
          <Logo />
          <div className="brand-divider" />
          <span>
            <strong>MADURAI</strong>
            <small>UNION</small>
          </span>
        </Link>
        <div className="workspace-label">UNION WORKSPACE</div>
        <nav aria-label="Main navigation">
          {navItems.map((n) => (
            <Link
              aria-label={n.title}
              title={collapsed ? n.title : undefined}
              className={`nav-item ${page === n.path ? "active" : ""}`}
              to={linkTo("/" + n.path)}
              key={n.path}
              aria-current={page === n.path ? "page" : undefined}
            >
              <n.icon size={19} />
              <span>{n.title}</span>
              {n.path === "no-supply" &&
                summary &&
                summary.stats.some((s) => s.zero + s.missing > 0) && (
                  <i className="nav-alert" />
                )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="union-card">
            <div className="union-symbol">
              <Factory size={23} />
            </div>
            <strong>Madurai Union</strong>
            <span>Connected by every drop.</span>
            <div>
              <MapPin size={12} />
              Tamil Nadu, India
            </div>
          </div>
          <button
            aria-label="Workspace guide"
            className="sidebar-help"
            onClick={() => setHelp(true)}
          >
            <CircleHelp size={18} />
            <span>Workspace guide</span>
            <ArrowUpRight size={14} />
          </button>
          <button
            className="sidebar-collapse"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
            <span>Collapse sidebar</span>
          </button>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="topbar-location">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-expanded={mobileNav}
              onClick={() => setMobileNav(true)}
            >
              <Menu size={21} />
            </button>
            <span className="union-home">
              <Factory size={17} />
            </span>
            <span>Madurai Union</span>
            <ChevronRight size={13} />
            <strong>{titles[page]?.[0] || "Not found"}</strong>
          </div>
          <GlobalSearch linkTo={linkTo} />
          <div className="topbar-right">
            <span className="demo-pill">
              <span />
              Demo data
            </span>
            <button
              className="icon-button help-button"
              aria-label="Open workspace guide"
              onClick={() => setHelp(true)}
            >
              <CircleHelp size={19} />
            </button>
            <div className="topbar-divider" />
            <div className="user-avatar">UA</div>
            <div className="user-info">
              <strong>Union Admin</strong>
              <small>Management workspace</small>
            </div>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {children}
          <footer className="page-footer">
            <span>
              <Heart size={12} />
              Serving farmers. Strengthening our union.
            </span>
            <span>
              Aavin Madurai Union <i /> Fictional demonstration data
            </span>
          </footer>
        </main>
      </div>
      {help && <HelpDialog onClose={() => setHelp(false)} />}

      {printContent}
    </div>
  );
}
