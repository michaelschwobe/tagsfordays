import * as z from "zod";

export const UpdateThemeFormSchema = z.object({
  theme: z.enum(["system", "light", "dark"], {
    required_error: "Theme is required",
    invalid_type_error: "Theme is invalid",
  }),
});
