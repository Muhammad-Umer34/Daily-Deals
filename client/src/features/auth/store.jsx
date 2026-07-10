import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storeregisterForm } from "./authAPI";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const StoreSignupCard = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await storeregisterForm(data);
      console.log("Store registered successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Store signup failed:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-zinc-950 font-sans text-white overflow-y-auto">
      {/* Left Column: Premium Brand Visual */}
      <div className="hidden lg:block lg:w-1/2 relative bg-zinc-950 min-h-screen">
        <img
          src="/images/4706264.jpg"
          alt="Signup visual"
          className="object-cover w-full h-full opacity-40 absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-950/70 to-transparent"></div>
        <div className="absolute bottom-20 left-20 right-20 z-20">
          <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            Partner with Daily Deals
          </h2>
          <p className="text-gray-300 mt-4 text-lg max-w-md">
            Join hundreds of top fashion brands and list your products on Pakistan's leading fashion platform, Daily Deals.
          </p>
        </div>
      </div>

      {/* Right Column: Centered Glassmorphic Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 min-h-screen bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-900 relative overflow-hidden py-12">
        {/* Mesh Ambient Glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none"></div>

        <Card className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-6 text-white relative z-10">
          <CardHeader>
            <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Brand Registration
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2 text-sm">
              Register your store and logo to start listing deals. Or{" "}
              <button 
                onClick={() => navigate("/login")} 
                className="text-blue-400 hover:text-blue-300 font-semibold underline bg-transparent border-0 cursor-pointer p-0 transition-colors"
              >
                Sign In
              </button>
            </CardDescription>
          </CardHeader>

          <CardContent className="mt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-1.5">
                <Label htmlFor="name" className="text-gray-300 text-sm font-medium">
                  Store Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Nike Pakistan"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg h-11 px-4 transition-all duration-300"
                  {...register("name", { required: "Store name is required" })}
                />
                {errors.name && (
                  <span className="text-red-400 text-xs mt-1">{errors.name.message}</span>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-gray-300 text-sm font-medium">
                  Store Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@yourbrand.com"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg h-11 px-4 transition-all duration-300"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email format",
                    }
                  })}
                />
                {errors.email && (
                  <span className="text-red-400 text-xs mt-1">{errors.email.message}</span>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="brand_logo" className="text-gray-300 text-sm font-medium">
                  Upload Brand Logo
                </Label>
                <div className="relative">
                  <input
                    id="brand_logo"
                    type="file"
                    accept="image/*"
                    className="bg-white/5 border border-white/10 text-white file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 rounded-lg w-full cursor-pointer pr-4 focus:border-blue-500 transition-all duration-300 px-4 h-11 flex items-center"
                    {...register("brand_logo", {
                      required: "Brand logo is required",
                    })}
                  />
                </div>
                {errors.brand_logo && (
                  <span className="text-red-400 text-xs mt-1">
                    {errors.brand_logo.message}
                  </span>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="ownerName" className="text-gray-300 text-sm font-medium">
                  Owner / Authorized Rep Name
                </Label>
                <Input
                  id="ownerName"
                  type="text"
                  placeholder="e.g., Muhammad Umer"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg h-11 px-4 transition-all duration-300"
                  {...register("ownerName", {
                    required: "Owner name is required",
                  })}
                />
                {errors.ownerName && (
                  <span className="text-red-400 text-xs mt-1">{errors.ownerName.message}</span>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg h-11 px-4 transition-all duration-300"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && (
                  <span className="text-red-400 text-xs mt-1">{errors.password.message}</span>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="confirmPassword" className="text-gray-300 text-sm font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg h-11 px-4 transition-all duration-300"
                  {...register("confirmPassword", {
                    required: "Confirm password is required",
                    validate: (value) =>
                      value === getValues("password") || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <span className="text-red-400 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Sign Up Brand
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreSignupCard;
