import * as z from "zod";
import { CheckboxSchema } from "~/utils/misc-validation";

export const UserUsernameSchema = z
  .string({ required_error: "Username is required" })
  .min(2, { message: "Username is too short" })
  .max(20, { message: "Username is too long" })
  .regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only include letters, numbers, and underscores",
  })
  .transform((value) => value.toLowerCase());

export const UserPasswordSchema = z
  .string({ required_error: "Password is required" })
  .min(6, { message: "Password is too short" })
  .max(45, { message: "Password is too long" });

export const UserRememberSchema = CheckboxSchema;

export const UserRedirectToSchema = z.string();

export const UserNameSchema = z
  .string()
  .min(2, { message: "Name is too short" })
  .max(45, { message: "Name is too long" });

export const UserEmailSchema = z
  .string()
  .email({ message: "Email is invalid" })
  .min(6, { message: "Email is too short" })
  .max(90, { message: "Email is too long" })
  .transform((value) => value.toLowerCase());

export const UserBiographySchema = z
  .string()
  .min(3, { message: "Biography is too short" })
  .max(255, { message: "Biography is too long" });

export const LoginUserFormSchema = z.object({
  username: UserUsernameSchema,
  password: UserPasswordSchema,
  remember: UserRememberSchema.optional(),
  redirectTo: UserRedirectToSchema.optional(),
});
