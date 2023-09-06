import { createId as cuid } from "@paralleldrive/cuid2";
import * as z from "zod";

export type RegularToast = z.infer<typeof ToastSchema>;

export type OptionalToast = Omit<RegularToast, "id" | "type"> &
  Partial<Pick<RegularToast, "id" | "type">>;

export const toastTypes = ["message", "success", "error"] as const;

export const ToastIdSchema = z.union([z.string(), z.number()]);

export const ToastTypeSchema = z.enum(toastTypes);

export const ToastTitleSchema = z.string();

export const ToastDescriptionSchema = z.string();

export const ToastSchema = z.object({
  id: ToastIdSchema.default(() => cuid()),
  type: ToastTypeSchema.default("message"),
  title: ToastTitleSchema.optional(),
  description: ToastDescriptionSchema,
});
