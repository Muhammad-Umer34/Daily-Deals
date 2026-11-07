import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { supabase } from "../../supabase";
import { socialLoginAPI } from "./authAPI";
import { authActions } from "./authSlices";

// Shared shell for login / sign-up / reset: brand photo panel on large screens, form on the right.
export function AuthLayout({ image, imageAlt = "", headline, blurb, children }) {
  return (
    <div className="min-h-screen w-full flex bg-white">
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-900">
        <img src={image} alt={imageAlt} className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
        <Link to="/home" className="absolute top-8 left-10 text-2xl font-extrabold text-white">
          Daily <span className="text-blue-400">Deals</span>
        </Link>
        <div className="absolute bottom-16 left-10 right-10">
          <h2 className="text-4xl font-extrabold text-white leading-tight">{headline}</h2>
          <p className="text-gray-200 mt-4 text-lg max-w-md">{blurb}</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex items-center justify-between px-6 sm:px-10 py-6">
          <Link to="/home" className="lg:invisible text-2xl font-extrabold text-slate-900">
            Daily <span className="text-blue-600">Deals</span>
          </Link>
          <Link to="/home" className="text-sm font-medium text-gray-600 hover:text-black">
            ← Back to shop
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 pb-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthHeading({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
      {subtitle && <p className="mt-2 text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function Field({ id, label, error, aside, children }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
        {aside}
      </div>
      {children}
      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
}

export const inputClass =
  "w-full h-11 px-4 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600";

export const primaryButtonClass =
  "w-full h-11 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition cursor-pointer";

export function FormError({ message }) {
  return message ? (
    <p role="alert" className="rounded-md bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">{message}</p>
  ) : null;
}

export function GoogleButton({ label, redirectPath }) {
  const [error, setError] = useState("");
  const onClick = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + redirectPath },
    });
    if (error) setError("Google sign-in isn't available right now.");
  };
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="w-full h-11 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.357-2.828-6.357-6.314 0-3.486 2.847-6.314 6.357-6.314 1.543 0 2.957.543 4.07 1.457l3.058-3.057C18.914 2.128 15.829 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.457 0 10.743-4.528 10.743-10.928 0-.743-.072-1.457-.214-2.143H12.24z" />
        </svg>
        {label}
      </button>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </>
  );
}

export function Divider() {
  return (
    <div className="flex items-center gap-3 my-6 text-xs uppercase tracking-wide text-slate-400">
      <span className="flex-1 h-px bg-slate-200" /> or <span className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

// When Google redirects back here with a Supabase session, exchange it for our own login.
export function useOAuthReturn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!session) return;
        const response = await socialLoginAPI(session.access_token);
        dispatch(authActions.login({ user: response.user, accessToken: response.accessToken }));
        await supabase.auth.signOut();
        navigate(response.user.userType === "storeOwner" ? "/store/dashboard" : "/home");
      })
      .catch((error) => console.error("OAuth session handling failed:", error.message || error));
  }, [dispatch, navigate]);
}
