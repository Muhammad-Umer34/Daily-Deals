import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import InputFileUpload from "../../components/ui/upload-button";
import { storeregisterForm } from "./authAPI";

const StoreSignupCard = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const onSubmit = async (data) => {
    await storeregisterForm(data);
    console.log("Store registered successfully!");
    console.log("Selected File:", data);
    navigate("/login");
  };

  return (
    <div className="w-full h-auto flex flex-col lg:flex-row bg-black">
      <div className="w-full lg:w-1/2 flex-shrink-0">
        <img
          src="/images/4706264.jpg"
          alt="Signup visual"
          className="object-cover w-full h-full"
        />
      </div>
      <div className="ww-full lg:w-1/2 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          method="POST"
          className="w-full max-w-sm p-6"
        >
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-white">
                Store Name
              </Label>
              <Input
                id="name"
                placeholder="Your Store Name"
                {...register("name", { required: "Store name is required" })}
              />
              {errors.name && (
                <span className="text-red-500">{errors.name.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="evil_corp@email.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <span className="text-red-500">{errors.email.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="brand_logo" className="text-white">
                Upload Brand Logo
              </Label>
              <InputFileUpload
                id="brand_logo"
                accept="image/*"
                {...register("brand_logo", {
                  required: "Brand logo is required",
                })}
              />

              {errors.brand_logo && (
                <span className="text-red-500">
                  {errors.brand_logo.message}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ownerName" className="text-white">
                Owner Name
              </Label>
              <Input
                id="ownerName"
                type="text"
                placeholder="Owner Name"
                {...register("ownerName", {
                  required: "Owner name is required",
                })}
              />
              {errors.ownerName && (
                <span className="text-red-500">{errors.ownerName.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <span className="text-red-500">{errors.password.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (value) =>
                    value === getValues("password") || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <span className="text-red-500">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreSignupCard;
