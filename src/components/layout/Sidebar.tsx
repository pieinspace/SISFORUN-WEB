import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Target,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Data Pelari", path: "/pelari" },
  { icon: Target, label: "Target 14 KM", path: "/target" },
  { icon: FileText, label: "Laporan", path: "/laporan" },
  { icon: User, label: "Profil", path: "/profil" },
  { icon: Settings, label: "Pengaturan", path: "/pengaturan" },
];

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar = ({ onLogout }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="relative flex h-16 items-center px-3 border-b border-sidebar-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden shrink-0">
            <img src="/logo.jpg" alt="SISFORUN" className="h-10 w-10 object-cover" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in min-w-0">
              <h1 className="text-sm font-bold text-sidebar-foreground truncate">SISFORUN</h1>
              <p className="text-[10px] text-sidebar-foreground/60 truncate">Admin Panel</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "sidebar-link w-full text-left",
                isActive && "sidebar-link-active"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <span className="animate-fade-in">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={onLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="animate-fade-in">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
