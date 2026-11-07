import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginForm } from "./authAPI";
import { authActions } from "./authSlices";
import {
  AuthLayout, AuthHeading, Field, FormError, GoogleButton, Divider, useOAuthReturn,
  inputClass, primaryButtonClass,
} from "./authLayout";

const SigninCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  useOAuthReturn();

  const onSubmit = async (data) => {
    setFormError("");
    try {
      const response = await loginForm(data);
      dispatch(authActions.login({ user: response.user, accessToken: response.accessToken }));
      navigate(response.user.userType === "storeOwner" ? "/store/dashboard" : "/home");
    } catch (error) {
      setFormError(error.userMessage);
    }
  };

  return (
    <AuthLayout
      image="/images/casual.jpg"
      imageAlt="Rack of colourful shirts"
      headline="Welcome back to Daily Deals"
      blurb="Pick up where you left off: your cart, wishlist and orders are waiting."
    >
      <AuthHeading title="Log in" subtitle="Enter your email and password to continue." />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormError message={formError} />
        <Field id="email" label="Email" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com" className={inputClass}
            {...register("email", { required: "Email is required" })} />
        </Field>
        <Field
          id="password"
          label="Password"
          error={errors.password?.message}
          aside={<Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">Forgot password?</Link>}
        >
          <input id="password" type="password" autoComplete="current-password" placeholder="Your password" className={inputClass}
            {...register("password", { required: "Password is required" })} />
        </Field>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>
      <Divider />
      <GoogleButton label="Continue with Google" redirectPath="/login" />
      <p className="mt-8 text-center text-sm text-slate-600">
        New to Daily Deals? <Link to="/signup" className="font-semibold text-blue-600 hover:underline">Create an account</Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-600">
        Selling on Daily Deals? <Link to="/brand-signup" className="font-semibold text-blue-600 hover:underline">Register your brand</Link>
      </p>
    </AuthLayout>
  );
};

export default SigninCard;
