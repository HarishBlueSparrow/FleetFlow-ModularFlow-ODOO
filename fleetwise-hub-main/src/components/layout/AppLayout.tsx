import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Route, Wrench, Fuel, Users, BarChart3, LogOut, Menu, X, ChevronLeft
} from 'lucide-react';
import { useFleetStore } from '@/store/fleetStore';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Vehicles', url: '/vehicles', icon: Truck },
  { title: 'Trips', url: '/trips', icon: Route },
  { title: 'Maintenance', url: '/maintenance', icon: Wrench },
  { title: 'Expenses', url: '/expenses', icon: Fuel },
  { title: 'Drivers', url: '/drivers', icon: Users },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = useFleetStore((s) => s.logout);
  const userName = useFleetStore((s) => s.userName);
  const userRole = useFleetStore((s) => s.userRole);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLabel: Record<string, string> = {
    manager: 'Fleet Manager',
    dispatcher: 'Dispatcher',
    safety_officer: 'Safety Officer',
    analyst: 'Analyst',
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border">
        <div className="rounded-lg bg-accent p-1.5 shrink-0">
          <Truck className="h-5 w-5 text-accent-foreground" />
        </div>
        {!collapsed && <span className="text-lg font-bold text-sidebar-accent-foreground tracking-tight">FleetOps</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border px-3 py-3">
        {!collapsed && (
          <div className="mb-2 px-1">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{userName || 'Admin'}</p>
            <p className="text-xs text-sidebar-foreground/60">{roleLabel[userRole]}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center py-2 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors border-t border-sidebar-border"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-foreground/30 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-56 flex flex-col bg-sidebar md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{userName || 'Admin'}</p>
            <p className="text-xs text-muted-foreground">{roleLabel[userRole]}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
            {(userName || 'A')[0].toUpperCase()}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
