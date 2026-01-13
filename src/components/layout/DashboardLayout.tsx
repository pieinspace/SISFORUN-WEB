import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useSidebar } from "@/context/SidebarContext";

interface DashboardLayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

const DashboardLayout = ({ children, onLogout }: DashboardLayoutProps) => {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={onLogout} />
      <div className={cn("transition-all duration-300", collapsed ? "ml-[72px]" : "ml-64")}>
        <Header adminName="Admin SISFORUN" onLogout={onLogout} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
