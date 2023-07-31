import * as z from "zod";

export const UsernameSchema = z
  .string()
  .min(3, { message: "Username is too short" })
  .max(20, { message: "Username is too long" })
  .regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only include letters, numbers, and underscores",
  })
  .transform((value) => value.toLowerCase());

export const PasswordSchema = z
  .string()
  .min(6, { message: "Password is too short" })
  .max(100, { message: "Password is too long" });

export const NameSchema = z
  .string()
  .min(3, { message: "Name is too short" })
  .max(40, { message: "Name is too long" });

export const EmailSchema = z
  .string()
  .email({ message: "Email is invalid" })
  .min(3, { message: "Email is too short" })
  .max(100, { message: "Email is too long" })
  .transform((value) => value.toLowerCase());

export const BiographySchema = z
  .string()
  .min(3, { message: "Biography is too short" })
  .max(255, { message: "Biography is too long" });
