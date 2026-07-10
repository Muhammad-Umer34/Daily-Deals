import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { loginForm, socialLoginAPI } from "./authAPI";
import { authActions } from "./authSlices";
import { supabase } from "../../supabase";
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

  useEffect(() => {
    const checkOAuthSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const email = session.user.email;
          const name = session.user.user_metadata.full_name || session.user.email.split('@')[0];
          
          const response = await socialLoginAPI(email, name);
          
          await dispatch(
            authActions.login({
              user: response.user,
              accessToken: response.accessToken,
            })
          );

          await supabase.auth.signOut();

          if (response.user.userType === "storeOwner") {
            Navigate("/store/dashboard");
          } else {
            Navigate("/home");
          }
        }
      } catch (error) {
        console.error("OAuth session handling failed:", error.message || error);
      }
    };

    checkOAuthSession();
  }, [dispatch, Navigate]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/login",
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google Auth error:", error.message || error);
    }
  };

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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-zinc-100 to-blue-50 relative overflow-hidden font-sans px-4 sm:px-6">
      {/* Mesh Ambient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-400/20 blur-[100px] pointer-events-none"></div>

      <Card className="w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 text-slate-800 relative z-10">
        <CardHeader className="relative">
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-slate-500 mt-2 text-sm">
            Enter your credentials to access your account
          </CardDescription>
          <CardAction className="absolute top-6 right-6">
            <Button 
              variant="link" 
              onClick={() => Navigate("/signup")}
              className="text-blue-600 hover:text-blue-500 text-sm font-semibold p-0 cursor-pointer"
            >
              Sign Up
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="mt-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-700 text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg h-11 px-4 transition-all duration-300"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 text-sm font-medium">Password</Label>
                  <button
                    type="button"
                    onClick={() => Navigate("/forgot-password")}
                    className="text-xs text-blue-600 hover:text-blue-500 hover:underline bg-transparent border-none p-0 cursor-pointer transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg h-11 px-4 transition-all duration-300"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
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

        <CardFooter className="flex-col gap-4 mt-6 border-t border-slate-100 pt-6">
          <Button 
            type="button"
            onClick={handleGoogleLogin}
            variant="outline" 
            className="w-full h-11 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.357-2.828-6.357-6.314 0-3.486 2.847-6.314 6.357-6.314 1.543 0 2.957.543 4.07 1.457l3.058-3.057C18.914 2.128 15.829 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.457 0 10.743-4.528 10.743-10.928 0-.743-.072-1.457-.214-2.143H12.24z"/>
            </svg>
            Login with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SigninCard;
