import { conform } from "@conform-to/react";
import { useFetcher, useLocation, useNavigation } from "@remix-run/react";
import type { ButtonVariants } from "~/components/ui/button";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { cn } from "~/utils/misc";
import { USER_LOGIN_ROUTE, useOptionalUser } from "~/utils/user";

export interface FavoriteContentProps {
  /** Sets the content and icon `class` attribute. */
  isActive?: boolean | null | undefined;
}

export function FavoriteContent({ isActive = false }: FavoriteContentProps) {
  return (
    <>
      <Icon
        className={isActive ? "text-pink-600 dark:text-pink-500" : ""}
        type="heart"
      />
      <span className="sr-only">{isActive ? "Unfavorite" : "Favorite"}</span>
    </>
  );
}

export interface FavoriteProps extends ButtonVariants {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the content and input[name=favorite] `value` attribute. **Required** */
  defaultValue: FavoriteContentProps["isActive"];
  /** Sets the `action` attribute. **Required** */
  formAction: string;
}

export function Favorite({
  className,
  defaultValue,
  formAction,
  size = "md-icon",
  variant = "outlined",
}: FavoriteProps) {
  const fetcher = useFetcher();
  const location = useLocation();
  const navigation = useNavigation();
  const optionalUser = useOptionalUser();

  const isPending = navigation.state !== "idle";
  const isFavorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : defaultValue === true;
  const nextValue = String(!isFavorite);

  if (optionalUser) {
    return (
      <fetcher.Form className={cn(className)} method="POST" action={formAction}>
        <input type="hidden" name={conform.INTENT} value="favorite" />
        <input type="hidden" name="favorite" value={nextValue} />
        <Button
          type={isPending ? "button" : "submit"}
          size={size}
          variant={variant}
        >
          <FavoriteContent isActive={isFavorite} />
        </Button>
      </fetcher.Form>
    );
  }

  return (
    <LinkButton
      to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}
      className={cn(className)}
      size={size}
      variant={variant}
    >
      <FavoriteContent isActive={isFavorite} />
    </LinkButton>
  );
}
