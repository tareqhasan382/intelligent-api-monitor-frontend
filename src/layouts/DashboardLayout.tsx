import { Link, useNavigate, Outlet } from "react-router-dom";
import {
  LogOut,
  User as UserIcon,
  Monitor as MonitorIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout, selectCurrentUser } from "../redux/features/auth/authSlice";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <MonitorIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl text-slate-900 tracking-tight">API Intel</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none">{user?.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user?.role}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 shadow-inner">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          <button
            onClick={handleLogout}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
