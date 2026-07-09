import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { loginForm } from "./authAPI";
import { authActions } from "./authSlices";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch } from "react-redux";
import { useNavigate} from "react-router-dom";

const SigninCard = () => {
  const dispatch = useDispatch(); 
  const Navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await loginForm(data);
      console.log(response);
      await dispatch(
        authActions.login({
          user: response.user,
          accessToken: response.accessToken,
        })
      );
      if(response.user.userType == "storeOwner") {
        Navigate("/store/dashboard");
      } else if(response.user.userType == "customer") {
        Navigate("/home");
      }
    } catch (error) {
      console.error("Login failed:", error.message || error);
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
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-400 mt-2 text-sm">
            Enter your credentials to access your account
          </CardDescription>
          <CardAction className="absolute top-6 right-6">
            <Button 
              variant="link" 
              onClick={() => Navigate("/signup")}
              className="text-blue-400 hover:text-blue-300 text-sm font-semibold p-0 cursor-pointer"
            >
              Sign Up
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="mt-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-300 text-sm font-medium">Email</Label>
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

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-300 text-sm font-medium">Password</Label>
                  <button
                    type="button"
                    onClick={() => Navigate("/forgot-password")}
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline bg-transparent border-none p-0 cursor-pointer transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg h-11 px-4 transition-all duration-300"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Login
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-4 mt-6 border-t border-white/10 pt-6">
          <Button 
            variant="outline" 
            className="w-full h-11 border-white/10 text-gray-200 hover:bg-white/5 hover:text-white rounded-lg font-medium transition-all duration-200 cursor-pointer"
          >
            Login with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SigninCard;
