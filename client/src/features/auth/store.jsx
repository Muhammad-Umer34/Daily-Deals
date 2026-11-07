import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { storeregisterForm } from "./authAPI";
import { AuthLayout, AuthHeading, Field, FormError, inputClass, primaryButtonClass } from "./authLayout";

const StoreSignupCard = () => {
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const { register, handleSubmit, getValues, watch, formState: { errors, isSubmitting } } = useForm();
  const logoFile = watch("brand_logo")?.[0];

  const onSubmit = async (data) => {
    setFormError("");
    try {
      await storeregisterForm(data);
      navigate("/login");
    } catch (error) {
      setFormError(error.userMessage || "Couldn't upload your logo. Please try again.");
    }
  };

  return (
    <AuthLayout
      image="/images/4706264.jpg"
      imageAlt="Illustration of an online storefront"
      headline="Partner with Daily Deals"
      blurb="List your products on Pakistan's growing fashion marketplace and reach new customers every day."
    >
      <AuthHeading title="Register your brand" subtitle="Set up your store to start listing products." />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormError message={formError} />
        <Field id="name" label="Store name" error={errors.name?.message}>
          <input id="name" placeholder="e.g. Nike Pakistan" className={inputClass}
            {...register("name", { required: "Store name is required" })} />
        </Field>
        <Field id="email" label="Store email" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" placeholder="info@yourbrand.com" className={inputClass}
            {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" } })} />
        </Field>
        <Field id="brand_logo" label="Brand logo" error={errors.brand_logo?.message}>
          <label htmlFor="brand_logo" className="flex items-center gap-3 h-11 px-4 rounded-lg border border-dashed border-slate-300 hover:border-blue-600 cursor-pointer text-sm">
            <span className="px-3 py-1 rounded-md bg-slate-100 font-medium text-slate-700">Choose image</span>
            <span className="text-slate-500 truncate">{logoFile?.name || "PNG or JPG"}</span>
          </label>
          <input id="brand_logo" type="file" accept="image/*" className="sr-only"
            {...register("brand_logo", { required: "Brand logo is required" })} />
        </Field>
        <Field id="ownerName" label="Owner / authorised representative" error={errors.ownerName?.message}>
          <input id="ownerName" autoComplete="name" placeholder="Full name" className={inputClass}
            {...register("ownerName", { required: "Owner name is required", minLength: { value: 3, message: "Name must be at least 3 characters" } })} />
        </Field>
        <Field id="password" label="Password" error={errors.password?.message}>
          <input id="password" type="password" autoComplete="new-password" placeholder="At least 6 characters" className={inputClass}
            {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })} />
        </Field>
        <Field id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
          <input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat the password" className={inputClass}
            {...register("confirmPassword", { validate: (v) => v === getValues("password") || "Passwords do not match" })} />
        </Field>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? "Registering…" : "Register brand"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-600">
        Already registered? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
};

export default StoreSignupCard;
