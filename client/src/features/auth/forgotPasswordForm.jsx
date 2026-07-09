import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { forgotPasswordAPI, resetPasswordAPI } from "./authAPI";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const ForgotPasswordForm = () => {
  const Navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = request PIN, 2 = verify and reset
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const handleSendPin = async (data) => {
    setLoading(true);
    try {
      const res = await forgotPasswordAPI(data.email);
      setEmail(data.email);
      setStep(2);
      alert(res.message || "PIN sent to your email!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data) => {
    setLoading(true);
    try {
      const res = await resetPasswordAPI(email, data.pin, data.newPassword);
      alert(res.message || "Password reset successfully!");
      Navigate("/login");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-900 relative overflow-hidden font-sans px-4 sm:px-6">
      {/* Mesh Ambient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-6 text-white relative z-10 border">
        <CardHeader className="relative">
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-gray-400 mt-2 text-sm">
            {step === 1 
              ? "Enter your email to receive a password reset PIN" 
              : "Enter the PIN sent to your email and choose a new password"
            }
          </CardDescription>
          <CardAction className="absolute top-6 right-6">
            <Button 
              variant="link" 
              onClick={() => Navigate("/login")}
              className="text-blue-400 hover:text-blue-300 text-sm font-semibold p-0 cursor-pointer"
            >
              Sign In
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="mt-4">
          {step === 1 ? (
            <form onSubmit={handleSubmit(handleSendPin)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-300 text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg h-11 px-4 transition-all duration-300"
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg h-11 transition-all duration-300 shadow-lg shadow-blue-600/20 active:scale-[0.98] cursor-pointer"
                >
                  {loading ? "Sending PIN..." : "Send Verification PIN"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit(handleResetPassword)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="pin" className="text-gray-300 text-sm font-medium">Verification PIN</Label>
                  <Input
                    id="pin"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg h-11 px-4 transition-all duration-300 tracking-[0.2em] font-mono text-center"
                    {...register("pin", { 
                      required: "PIN is required",
                      pattern: { value: /^[0-9]{6}$/, message: "PIN must be a 6-digit number" }
                    })}
                  />
                  {errors.pin && (
                    <p className="text-red-400 text-xs mt-1">{errors.pin.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="newPassword" className="text-gray-300 text-sm font-medium">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg h-11 px-4 transition-all duration-300"
                    {...register("newPassword", { 
                      required: "New password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" }
                    })}
                  />
                  {errors.newPassword && (
                    <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300 text-sm font-medium">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg h-11 px-4 transition-all duration-300"
                    {...register("confirmPassword", { 
                      required: "Confirm password is required",
                      validate: (val) => {
                        if (watch("newPassword") !== val) {
                          return "Passwords do not match";
                        }
                      }
                    })}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg h-11 transition-all duration-300 shadow-lg shadow-blue-600/20 active:scale-[0.98] cursor-pointer"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="link"
                  onClick={() => setStep(1)}
                  className="text-gray-400 hover:text-gray-300 text-xs mt-2"
                >
                  Back to request PIN
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;
