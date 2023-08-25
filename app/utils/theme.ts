import { parse } from "@conform-to/zod";
import { useFetchers } from "@remix-run/react";
import type { IconType } from "~/components/ui/icon";
import { useClientHints } from "~/utils/client-hints";
import { useRequestInfo } from "~/utils/request-info";
import { UpdateThemeFormSchema } from "~/utils/theme-validation";
import type { Theme } from "~/utils/theme.server";

export const THEME_ICON_AND_TEXT_MAP: Readonly<
  Record<Theme | "system", Record<"icon", IconType> & Record<"text", string>>
> = {
  system: { icon: "laptop", text: "System" },
  light: { icon: "sun", text: "Light" },
  dark: { icon: "moon", text: "Dark" },
};

/**
 * If the user's changing their theme mode preference,
 * this will return the value it's being changed to.
 */
export function useOptimisticTheme(): Theme | "system" | undefined {
  const fetchers = useFetchers();

  const themeFetcher = fetchers.find(
    (fetcher) => fetcher.formData?.get("intent") === "update-theme",
  );

  if (themeFetcher?.formData) {
    const submission = parse(themeFetcher.formData, {
      schema: UpdateThemeFormSchema,
    });

    return submission.value?.theme;
  }

  return undefined;
}

/**
 * @returns The user's theme preference,
 * or the client hint theme if the user has not set a preference.
 */
export function useTheme(): Theme {
  const clientHints = useClientHints();
  const optimisticTheme = useOptimisticTheme();
  const requestInfo = useRequestInfo();

  if (optimisticTheme) {
    return optimisticTheme === "system" ? clientHints.theme : optimisticTheme;
  }

  return requestInfo.userPrefs.theme ?? clientHints.theme;
}
