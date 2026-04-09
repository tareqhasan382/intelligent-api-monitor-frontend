import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "@/redux/features/auth/authApi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User as UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterValues } from "@/schemas/auth.schema";

const Register = () => {
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterValues) => {
    const toastId = toast.loading("Creating account...");
    try {
      const registerData = {
        name: data.name,
        email: data.email,
        password: data.password,
      };
      await register(registerData).unwrap();
      toast.success("Account created! Please sign in.", { id: toastId });
      navigate("/login");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Registration failed", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-slate-100"
      >
        <div className="text-center space-y-2">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4"
          >
            <UserPlus className="w-8 h-8 text-blue-600" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Account
          </h2>
          <p className="text-slate-500 font-medium">
            Start monitoring your APIs with intelligence
          </p>
        </div>
        
        <form className="mt-10 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="relative group">
              <UserIcon className="absolute left-3 top-[38px] w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                className="pl-10"
                error={errors.name?.message}
                {...registerForm("name")}
              />
            </div>
            <div className="relative group">
              <Mail className="absolute left-3 top-[38px] w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                className="pl-10"
                error={errors.email?.message}
                {...registerForm("email")}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-[38px] w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                error={errors.password?.message}
                {...registerForm("password")}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-[38px] w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                error={errors.confirmPassword?.message}
                {...registerForm("confirmPassword")}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-4 mt-4 text-base font-bold bg-blue-600 hover:bg-blue-700 transition-all transform active:scale-[0.98]"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm font-medium text-slate-600 mt-8">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-bold underline-offset-4 hover:underline transition-all"
          >
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
