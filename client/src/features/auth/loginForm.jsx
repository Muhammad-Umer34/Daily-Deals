import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginForm } from "./authAPI";
import { authActions } from "./authSlices";
import {
  AuthLayout, AuthHeading, Field, FormError, GoogleButton, Divider, useOAuthReturn, safeNextPath,
  inputClass, primaryButtonClass,
} from "./authLayout";

const SigninCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [formError, setFormError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const next = safeNextPath(search);
  useOAuthReturn();

  const onSubmit = async (data) => {
    setFormError("");
    try {
      const response = await loginForm(data);
      dispatch(authActions.login({ user: response.user, accessToken: response.accessToken }));
      if (response.user.userType === "storeOwner") return navigate("/store/dashboard");
      navigate(next || "/home");
    } catch (error) {
      setFormError(error.userMessage);
    }
  };

  return (
    <AuthLayout
      image="/images/casual.jpg"
      imageAlt="Rack of colourful shirts"
      headline="Welcome back to MonoFit"
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
          aside={<Link to="/forgot-password" className="text-xs font-medium text-ink underline underline-offset-4 hover:opacity-70">Forgot password?</Link>}
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
      <p className="mt-8 text-center text-sm text-bark">
        New to MonoFit? <Link to={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-semibold text-ink underline underline-offset-4 hover:opacity-70">Create an account</Link>
      </p>
      <p className="mt-2 text-center text-sm text-bark">
        Selling on MonoFit? <Link to="/brand-signup" className="font-semibold text-ink underline underline-offset-4 hover:opacity-70">Register your brand</Link>
      </p>
    </AuthLayout>
  );
};

export default SigninCard;
