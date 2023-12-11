import * as z from "zod";

const HandleSchema = z
  .object({
    abortDelay: z.number().int().min(250).max(180_000), // 3 minutes
    isDehydrated: z.boolean(),
  })
  .partial();

export type Handle = z.infer<typeof HandleSchema>;

export const MatchesSchema = z.array(
  z.object({
    handle: HandleSchema.optional(),
  }),
);

export type Matches = z.infer<typeof MatchesSchema>;
