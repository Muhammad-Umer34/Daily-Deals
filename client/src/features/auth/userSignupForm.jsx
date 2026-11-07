import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { customerregisterForm } from "./authAPI";
import {
  AuthLayout, AuthHeading, Field, FormError, GoogleButton, Divider, useOAuthReturn,
  inputClass, primaryButtonClass,
} from "./authLayout";

const UserSignupCard = () => {
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  useOAuthReturn();

  const onSubmit = async (data) => {
    setFormError("");
    try {
      await customerregisterForm(data);
      navigate("/login");
    } catch (error) {
      setFormError(error.userMessage);
    }
  };

  return (
    <AuthLayout
      image="/images/formal.jpg"
      imageAlt="Man in a tailored suit"
      headline="Style for less, every day"
      blurb="Create an account to save favourites, check out faster and track your orders."
    >
      <AuthHeading title="Create your account" subtitle="It takes less than a minute." />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormError message={formError} />
        <Field id="name" label="Full name" error={errors.name?.message}>
          <input id="name" autoComplete="name" placeholder="Your name" className={inputClass}
            {...register("name", { required: "Name is required", minLength: { value: 3, message: "Name must be at least 3 characters" } })} />
        </Field>
        <Field id="email" label="Email" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com" className={inputClass}
            {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" } })} />
        </Field>
        <Field id="password" label="Password" error={errors.password?.message}>
          <input id="password" type="password" autoComplete="new-password" placeholder="At least 6 characters" className={inputClass}
            {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })} />
        </Field>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <Divider />
      <GoogleButton label="Sign up with Google" redirectPath="/signup" />
      <p className="mt-8 text-center text-sm text-slate-600">
        Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Log in</Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-600">
        Own a brand? <Link to="/brand-signup" className="font-semibold text-blue-600 hover:underline">Register as a seller</Link>
      </p>
    </AuthLayout>
  );
};

export default UserSignupCard;
