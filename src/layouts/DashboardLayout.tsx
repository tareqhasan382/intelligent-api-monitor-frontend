import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Bell,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  ChevronRight,
  Monitor as MonitorIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout, selectCurrentUser } from "../redux/features/auth/authSlice";
import { cn } from "../lib/utils";

const SidebarItem = ({
  to,
  icon: Icon,
  label,
  isActive,
  isCollapsed,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
}) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
      isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900")} />
    {!isCollapsed && <span className="font-semibold text-sm">{label}</span>}
    {isCollapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
        {label}
      </div>
    )}
  </Link>
);

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems = [
    { to: "/", icon: LayoutDashboard, label: "Overview" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 sticky top-0 h-screen",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MonitorIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">API Intel</span>
            </Link>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <MonitorIcon className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.to}
              {...item}
              isActive={location.pathname === item.to}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-all duration-200"
          >
            <ChevronRight className={cn("w-5 h-5 transition-transform duration-300", isCollapsed ? "" : "rotate-180")} />
            {!isCollapsed && <span className="font-semibold text-sm">Collapse Sidebar</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 mt-2"
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="font-semibold text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between sticky top-0 z-40">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MonitorIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">API Intel</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Top Navbar for Desktop */}
        <header className="hidden md:flex bg-white border-b border-slate-200 px-8 py-4 items-center justify-between sticky top-0 z-30">
          <h2 className="font-bold text-slate-800 text-lg uppercase tracking-widest text-xs">
            Command Center
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-xs font-medium text-slate-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-white z-50 md:hidden p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-xl text-slate-900 tracking-tight">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                  <SidebarItem
                    key={item.to}
                    {...item}
                    isActive={location.pathname === item.to}
                    isCollapsed={false}
                  />
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                    <p className="text-xs font-medium text-slate-500 capitalize">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-semibold text-sm">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
