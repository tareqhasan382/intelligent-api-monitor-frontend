import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/features/auth/authSlice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/schemas/auth.schema";

const Login = () => {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    const toastId = toast.loading("Logging in...");
    try {
      const result = await login(data).unwrap();
      dispatch(
        setCredentials({
          user: result.data.user,
          token: result.data.accessToken,
        })
      );
      toast.success("Welcome back!", { id: toastId });
      navigate("/");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Invalid credentials", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-slate-100"
      >
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4"
          >
            <LogIn className="w-8 h-8 text-blue-600" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-500 font-medium">
            Please enter your details to sign in
          </p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-3 top-[38px] w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                className="pl-10"
                error={errors.email?.message}
                {...register("email")}
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
                {...register("password")}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full py-4 text-base font-bold bg-blue-600 hover:bg-blue-700 transition-all transform active:scale-[0.98]"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500 font-medium">
              Or continue with
            </span>
          </div>
        </div>

        <p className="text-center text-sm font-medium text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 font-bold underline-offset-4 hover:underline transition-all"
          >
            Create one for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
