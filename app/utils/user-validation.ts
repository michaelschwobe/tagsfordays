import * as z from "zod";
import { CheckboxSchema } from "~/utils/misc-validation";

const UserUsernameSchema = z
  .string({ required_error: "Username is required" })
  .min(2, { message: "Username is too short" })
  .max(20, { message: "Username is too long" })
  .regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only include letters, numbers, and underscores",
  })
  .transform((value) => value.toLowerCase());

const UserPasswordSchema = z
  .string({ required_error: "Password is required" })
  .min(6, { message: "Password is too short" })
  .max(45, { message: "Password is too long" });

const UserRememberSchema = CheckboxSchema;

const UserRedirectToSchema = z.string();

export const LoginUserFormSchema = z.object({
  username: UserUsernameSchema,
  password: UserPasswordSchema,
  remember: UserRememberSchema.optional(),
  redirectTo: UserRedirectToSchema.optional(),
});
