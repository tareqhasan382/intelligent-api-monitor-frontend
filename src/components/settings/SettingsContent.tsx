import { Shield, Bell, User as UserIcon, Palette, Zap } from "lucide-react";
import { useAppSelector } from "../../redux/hooks";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { cn } from "@/lib/utils";

const SettingCard = ({
  icon: Icon,
  title,
  description,
  badge,
  isActive,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  isActive?: boolean;
}) => (
  <div className={cn(
    "p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer",
    isActive && "border-blue-200 ring-2 ring-blue-500/5 bg-blue-50/10"
  )}>
    <div className="flex items-start justify-between">
      <div className={cn(
        "p-3 rounded-2xl border transition-colors",
        isActive ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      {badge && (
        <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-green-100">
          {badge}
        </span>
      )}
    </div>
    <div className="mt-4 space-y-1">
      <h3 className="text-base font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-[11px] font-bold text-slate-400 leading-relaxed">{description}</p>
    </div>
  </div>
);

const SettingsContent = () => {
  const user = useAppSelector(selectCurrentUser);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Summary */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-xl ring-1 ring-slate-100">
              <UserIcon className="w-10 h-10 text-blue-600" />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm"></div>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.role} Account</p>
          </div>
          <div className="w-full pt-6 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] p-3 bg-white rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-400 uppercase tracking-widest">Email</span>
              <span className="font-black text-slate-900">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] p-3 bg-white rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-400 uppercase tracking-widest">Status</span>
              <span className="font-black text-green-600 uppercase">Active</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2rem] text-white space-y-4 shadow-xl shadow-slate-200">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-black uppercase tracking-widest">Upgrade to Pro</h4>
          </div>
          <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">
            "Get advanced AI anomaly detection models and unlimited API monitoring."
          </p>
          <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]">
            Coming Soon
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingCard
          icon={Shield}
          title="Security"
          description="Manage your password and 2FA settings."
          badge="Secure"
          isActive={true}
        />
        <SettingCard
          icon={Bell}
          title="Notifications"
          description="Configure email and push alerts."
        />
        <SettingCard
          icon={Palette}
          title="Appearance"
          description="Customize dashboard theme and layout."
        />
        <SettingCard
          icon={Zap}
          title="Integrations"
          description="Connect external services and APIs."
        />
        <SettingCard
          icon={UserIcon}
          title="Team"
          description="Invite and manage team members."
        />
      </div>
    </div>
  );
};

export default SettingsContent;
