// src/pages/Login.jsx
import React, { useState } from "react";
import { Mail, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import { useAuthStore } from "../stores/authStore";
import { useUiStore } from "../stores/uiStore";

const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .nonempty("Password is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const { isLoading, setLoading } = useUiStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      const { user } = useAuthStore.getState();
      navigate(
        user.role === "admin" ? "/admin/dashboard" : "/doctor/dashboard"
      );
    } catch (error) {
      // Error handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F3F2F7] px-4">
      <div className="flex flex-col items-center w-full">
        <Header />
        <div className="w-full max-w-xs sm:max-w-md py-6 px-6 sm:px-10 bg-white rounded-lg">
          <h2 className="mb-6 text-lg sm:text-xl font-semibold text-center text-gray-800">
            LOGIN TO YOUR ACCOUNT
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="w-full">
              <label
                htmlFor="email"
                className="block text-sm sm:text-base font-medium text-gray-700"
              >
                Email
              </label>
              <div className="relative flex items-center mt-1">
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  placeholder="mail@abc.com"
                  className={`w-full px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 bg-[#F3F2F7] border-none rounded-lg focus:outline-none focus:ring focus:ring-green-300 ${
                    errors.email ? "ring ring-error" : ""
                  }`}
                  disabled={isLoading}
                />
                <Mail
                  className="absolute right-4 text-gray-400"
                  size={20}
                  style={{ top: "50%", transform: "translateY(-50%)" }}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-error">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="w-full">
              <label
                htmlFor="password"
                className="block text-sm sm:text-base font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative flex items-center mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  {...register("password")}
                  placeholder="********"
                  className={`w-full px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 bg-[#F3F2F7] border-none rounded-lg focus:outline-none focus:ring focus:ring-green-300 ${
                    errors.password ? "ring ring-error" : ""
                  }`}
                  disabled={isLoading}
                />
                {showPassword ? (
                  <EyeOff
                    className="absolute right-4 text-gray-400 cursor-pointer"
                    size={20}
                    style={{ top: "50%", transform: "translateY(-50%)" }}
                    onClick={() => setShowPassword(false)}
                    aria-label="Hide password"
                  />
                ) : (
                  <Eye
                    className="absolute right-4 text-gray-400 cursor-pointer"
                    size={20}
                    style={{ top: "50%", transform: "translateY(-50%)" }}
                    onClick={() => setShowPassword(true)}
                    aria-label="Show password"
                  />
                )}
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="w-full">
              <button
                type="submit"
                className="w-full py-2 sm:py-3 text-white font-semibold text-sm sm:text-lg bg-[#2563eb] rounded-lg hover:bg-black focus:outline-none focus:ring focus:ring-green-300 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
        <div className="mt-6 text-center">
          <p className="text-lg font-medium text-[#2563eb]-500">
            Forgot Your Password?{" "}
            <Link
              to="/password-reset/request"
              className="text-blue-500 hover:underline"
            >
              Reset Here!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
