import { motion } from "framer-motion";
import { Settings as SettingsIcon, Shield, Bell, User as UserIcon, Palette, Zap } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
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
    "p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer",
    isActive && "border-blue-200 ring-2 ring-blue-500/10"
  )}>
    <div className="flex items-start justify-between">
      <div className={cn(
        "p-3 rounded-2xl border transition-colors",
        isActive ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-500 border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      {badge && (
        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
          {badge}
        </span>
      )}
    </div>
    <div className="mt-4 space-y-1">
      <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-sm font-medium text-slate-500 leading-relaxed">{description}</p>
    </div>
  </div>
);

const Settings = () => {
  const user = useAppSelector(selectCurrentUser);

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
              <SettingsIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          </div>
          <p className="text-sm font-bold text-slate-500 max-w-lg">
            Manage your account preferences, security, and notification settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg ring-1 ring-blue-100">
                <UserIcon className="w-16 h-16 text-blue-600" />
              </div>
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 border-4 border-white rounded-full shadow-sm"></div>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{user?.role} Account</p>
            </div>
            <div className="w-full pt-6 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-2xl">
                <span className="font-bold text-slate-400 uppercase tracking-tighter">Email</span>
                <span className="font-black text-slate-900">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-2xl">
                <span className="font-bold text-slate-400 uppercase tracking-tighter">Status</span>
                <span className="font-black text-green-600">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-slate-200">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-blue-400" />
              <h4 className="text-lg font-black tracking-tight">Upgrade to Pro</h4>
            </div>
            <p className="text-sm font-bold text-slate-300 leading-relaxed italic">
              "Get advanced AI anomaly detection models, unlimited API monitoring, and custom notification webhooks."
            </p>
            <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]">
              Coming Soon
            </button>
          </div>
        </motion.div>

        {/* Settings Grid */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <SettingCard
            icon={Shield}
            title="Security & Privacy"
            description="Manage your password, two-factor authentication, and active sessions."
            badge="Secure"
            isActive={true}
          />
          <SettingCard
            icon={Bell}
            title="Notifications"
            description="Configure email, push, and webhook alerts for system anomalies."
          />
          <SettingCard
            icon={Palette}
            title="Appearance"
            description="Customize your dashboard theme, layout, and visual preferences."
          />
          <SettingCard
            icon={Zap}
            title="API Integrations"
            description="Connect external services and manage your API access tokens."
          />
          <SettingCard
            icon={UserIcon}
            title="Team Members"
            description="Invite colleagues to monitor your infrastructure collaboratively."
          />
          <SettingCard
            icon={SettingsIcon}
            title="General Preferences"
            description="Update your language, timezone, and data retention policies."
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
