// src/pages/PasswordReset.jsx
import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/common/Header";
import { useAuthStore } from "../stores/authStore";
import { useUiStore } from "../stores/uiStore";

const resetSchema = z.object({
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .nonempty("Password is required"),
});

const PasswordReset = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { resetPassword } = useAuthStore();
  const { isLoading, setLoading } = useUiStore();
  const navigate = useNavigate();
  const { token } = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await resetPassword({ token, newPassword: data.newPassword });
      navigate("/login");
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
            RESET YOUR PASSWORD
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="w-full">
              <label
                htmlFor="newPassword"
                className="block text-sm sm:text-base font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="relative flex items-center mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  {...register("newPassword")}
                  placeholder="********"
                  className={`w-full px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 bg-[#F3F2F7] border-none rounded-lg focus:outline-none focus:ring focus:ring-green-300 ${
                    errors.newPassword ? "ring ring-error" : ""
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
              {errors.newPassword && (
                <p className="mt-1 text-sm text-error">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="w-full">
              <button
                type="submit"
                className="w-full py-2 sm:py-3 text-white font-semibold text-sm sm:text-lg bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-green-300 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        </div>
        <div className="mt-6 text-center">
          <p className="text-lg font-medium text-blue-500">
            Back to{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
