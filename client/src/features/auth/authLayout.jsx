import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { supabase } from "../../supabase";
import { socialLoginAPI } from "./authAPI";
import { authActions } from "./authSlices";

// Reads ?next= and returns it only when it is a path inside this app.
// Anything else ("//evil.com", "/\evil.com", "https://evil.com") would send a freshly
// logged-in user to another origin, so it is dropped and we fall back to the default page.
export function safeNextPath(search) {
  const raw = new URLSearchParams(search || "").get("next");
  if (!raw) return "";
  const next = raw.trim();
  if (!next || next.length > 512) return "";
  if (!next.startsWith("/")) return "";
  if (next.startsWith("//") || next.startsWith("/\\")) return "";
  if (next.includes("://")) return "";
  return next;
}

const Wordmark = ({ className = "" }) => (
  <span className={`font-display font-semibold tracking-[-0.02em] text-2xl ${className}`}>
    MONOFIT
  </span>
);

// Shared shell for login / sign-up / reset: lookbook photo on large screens, form on paper.
export function AuthLayout({ image, imageAlt = "", headline, blurb, children }) {
  return (
    <div className="min-h-dvh w-full flex bg-paper text-ink">
      <div className="hidden lg:block lg:w-1/2 relative bg-ink">
        <img src={image} alt={imageAlt} className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <Link to="/home" className="absolute top-8 left-10 text-paper" aria-label="MonoFit home">
          <Wordmark />
        </Link>
        <div className="absolute bottom-16 left-10 right-10">
          <h2 className="font-display font-semibold tracking-[-0.02em] text-5xl leading-[1.05] text-paper text-balance">{headline}</h2>
          <p className="text-paper/80 mt-4 text-lg max-w-md text-pretty">{blurb}</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex items-center justify-between px-6 sm:px-10 py-6">
          <Link to="/home" className="lg:invisible text-ink" aria-label="MonoFit home">
            <Wordmark />
          </Link>
          <Link to="/home" className="link-draw font-meta text-xs text-bark hover:text-ink transition-colors">
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
      <h1 className="font-display font-semibold tracking-[-0.02em] text-4xl leading-tight text-ink">{title}</h1>
      {subtitle && <p className="mt-2 text-bark">{subtitle}</p>}
    </div>
  );
}

export function Field({ id, label, error, aside, children }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="font-meta text-xs text-bark">{label}</label>
        {aside}
      </div>
      {children}
      {error && <p className="text-oxblood text-sm">{error}</p>}
    </div>
  );
}

export const inputClass =
  "w-full h-11 px-4 border border-hairline bg-paper text-ink placeholder:text-bark/60 focus:outline-none focus:border-ink focus-visible:ring-1 focus-visible:ring-oxblood transition-colors";

export const primaryButtonClass =
  "w-full min-h-[52px] bg-ink text-white text-[0.9375rem] font-semibold hover:opacity-80 active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export function FormError({ message }) {
  return message ? (
    <p role="alert" className="border-l-2 border-oxblood bg-parchment px-4 py-2.5 text-sm text-ink">{message}</p>
  ) : null;
}

export function GoogleButton({ label, redirectPath }) {
  const [error, setError] = useState("");
  const { search } = useLocation();
  const onClick = async () => {
    const next = safeNextPath(search);
    const returnPath = next ? `${redirectPath}?next=${encodeURIComponent(next)}` : redirectPath;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + returnPath },
    });
    if (error) setError("Google sign-in isn't available right now.");
  };
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="w-full h-11 border border-hairline bg-paper text-ink font-medium hover:border-ink hover:bg-parchment active:translate-y-px transition-colors flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.357-2.828-6.357-6.314 0-3.486 2.847-6.314 6.357-6.314 1.543 0 2.957.543 4.07 1.457l3.058-3.057C18.914 2.128 15.829 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.457 0 10.743-4.528 10.743-10.928 0-.743-.072-1.457-.214-2.143H12.24z" />
        </svg>
        {label}
      </button>
      {error && <p className="text-sm text-oxblood mt-2">{error}</p>}
    </>
  );
}

export function Divider() {
  return (
    <div className="flex items-center gap-3 my-6 font-meta text-xs text-bark/70">
      <span className="flex-1 h-px bg-hairline" /> or <span className="flex-1 h-px bg-hairline" />
    </div>
  );
}

// When Google redirects back here with a Supabase session, exchange it for our own login.
export function useOAuthReturn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { search } = useLocation();
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!session) return;
        const response = await socialLoginAPI(session.access_token);
        dispatch(authActions.login({ user: response.user, accessToken: response.accessToken }));
        await supabase.auth.signOut();
        if (response.user.userType === "storeOwner") return navigate("/store/dashboard");
        navigate(safeNextPath(search) || "/home");
      })
      .catch((error) => console.error("OAuth session handling failed:", error.message || error));
  }, [dispatch, navigate, search]);
}
