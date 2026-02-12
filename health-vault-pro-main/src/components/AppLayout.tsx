import { ReactNode } from "react";
import { NavLink as RouterNavLink, useNavigate, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, Upload, QrCode, ShieldAlert, LogOut } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import PanicModal from "@/components/PanicModal";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/upload", icon: Upload, label: "Upload Record" },
  { to: "/qr-share", icon: QrCode, label: "QR Share" },
  { to: "/security", icon: ShieldAlert, label: "Security History" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { walletAddress, logout, panicMode } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col shrink-0 hidden md:flex">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Health Wallet</p>
              <p className="text-xs text-muted-foreground font-mono">{walletAddress}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <RouterNavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </RouterNavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          >
            <LogOut className="w-4.5 h-4.5" />
            Disconnect
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold">Health Wallet</span>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
        <nav className="flex px-2 pb-2 gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <RouterNavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                location.pathname === item.to
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </RouterNavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:p-8 p-4 pt-28 md:pt-8 overflow-auto">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>

      {panicMode && <PanicModal />}
    </div>
  );
}
