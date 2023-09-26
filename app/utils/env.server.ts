import { z } from "zod";
import packageJSON from "../../package.json";

const schema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"] as const),
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

export function init() {
  const parsed = schema.safeParse(process.env);

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );

    throw new Error("Invalid environment variables");
  }
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
  return {
    MODE: process.env.NODE_ENV,

    APP_VERSION: packageJSON.version,

    /**
     * If changing this, also change the same value in:
     * - `/README.md`
     */
    APP_NAME: "TagsForDays",

    /**
     * If changing this, also change the same value in:
     * - `/README.md`
     */
    APP_DESCRIPTION_LONG: packageJSON.description,

    /**
     * Do not include a period.
     */
    APP_DESCRIPTION_SHORT: "Enhance and organize your bookmarks",

    /**
     * Do not include a trailing slash.
     *
     * If changing this, also change the same value in:
     * - `/README.md`
     */
    APP_URL: packageJSON.homepage,

    APP_AUTHOR_FULLNAME: packageJSON.author.name,

    /**
     * Do not include the `@` symbol.
     */
    APP_AUTHOR_HANDLE: "michael_schwobe",

    /**
     * If changing this, also change the same value in:
     * - `/public/browserconfig.xml`
     * - `/public/favicons/favicon.svg`
     * - `/public/site.webmanifest`
     *
     * See also:
     * - `/public/favicons/mask-icon.svg`
     * - `APP_THEME_COLOR_DARK`
     */
    APP_THEME_COLOR_LIGHT: "#06b6d4",

    /**
     * See also:
     * - `APP_THEME_COLOR_LIGHT`.
     */
    APP_THEME_COLOR_DARK: "#0891b2",
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
