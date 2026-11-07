import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordAPI, resetPasswordAPI } from "./authAPI";
import { AuthLayout, AuthHeading, Field, FormError, inputClass, primaryButtonClass } from "./authLayout";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = request PIN, 2 = verify and reset
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const handleSendPin = async (data) => {
    setFormError("");
    try {
      const res = await forgotPasswordAPI(data.email);
      setEmail(data.email);
      setNotice(res.message);
      setStep(2);
    } catch (error) {
      setFormError(error.userMessage);
    }
  };

  const handleResetPassword = async (data) => {
    setFormError("");
    try {
      await resetPasswordAPI(email, data.pin, data.newPassword);
      navigate("/login");
    } catch (error) {
      setFormError(error.userMessage);
    }
  };

  return (
    <AuthLayout
      image="/images/casual.jpg"
      imageAlt="Rack of colourful shirts"
      headline="Locked out? It happens."
      blurb="We'll email you a 6-digit PIN so you can choose a new password."
    >
      <AuthHeading
        title={step === 1 ? "Reset your password" : "Enter your PIN"}
        subtitle={step === 1 ? "Enter the email you signed up with." : `Check ${email} for a 6-digit PIN. It expires in 15 minutes.`}
      />
      {step === 1 ? (
        <form onSubmit={handleSubmit(handleSendPin)} className="space-y-5" noValidate>
          <FormError message={formError} />
          <Field id="email" label="Email" error={errors.email?.message}>
            <input id="email" type="email" autoComplete="email" placeholder="you@example.com" className={inputClass}
              {...register("email", { required: "Email is required" })} />
          </Field>
          <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
            {isSubmitting ? "Sending…" : "Send PIN"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-5" noValidate>
          {notice && <p role="status" className="rounded-md bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-800">{notice}</p>}
          <FormError message={formError} />
          <Field id="pin" label="Verification PIN" error={errors.pin?.message}>
            <input id="pin" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit PIN" className={`${inputClass} tracking-widest`}
              {...register("pin", { required: "PIN is required", pattern: { value: /^\d{6}$/, message: "PIN is 6 digits" } })} />
          </Field>
          <Field id="newPassword" label="New password" error={errors.newPassword?.message}>
            <input id="newPassword" type="password" autoComplete="new-password" placeholder="At least 6 characters" className={inputClass}
              {...register("newPassword", { required: "New password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })} />
          </Field>
          <Field id="confirmPassword" label="Confirm new password" error={errors.confirmPassword?.message}>
            <input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat the new password" className={inputClass}
              {...register("confirmPassword", { validate: (v) => v === watch("newPassword") || "Passwords do not match" })} />
          </Field>
          <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
            {isSubmitting ? "Saving…" : "Reset password"}
          </button>
          <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-slate-600 hover:text-black cursor-pointer">
            Use a different email
          </button>
        </form>
      )}
      <p className="mt-8 text-center text-sm text-slate-600">
        Remembered it? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordForm;
