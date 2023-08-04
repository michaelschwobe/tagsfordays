import * as z from "zod";

export const UsernameSchema = z
  .string({ required_error: "Username is required" })
  .min(2, { message: "Username is too short" })
  .max(20, { message: "Username is too long" })
  .regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only include letters, numbers, and underscores",
  })
  .transform((value) => value.toLowerCase());

export const PasswordSchema = z
  .string({ required_error: "Password is required" })
  .min(6, { message: "Password is too short" })
  .max(45, { message: "Password is too long" });

export const NameSchema = z
  .string()
  .min(2, { message: "Name is too short" })
  .max(45, { message: "Name is too long" })
  .optional();

export const EmailSchema = z
  .string()
  .email({ message: "Email is invalid" })
  .min(6, { message: "Email is too short" })
  .max(90, { message: "Email is too long" })
  .transform((value) => value.toLowerCase())
  .optional();

export const BiographySchema = z
  .string()
  .min(3, { message: "Biography is too short" })
  .max(255, { message: "Biography is too long" })
  .optional();
