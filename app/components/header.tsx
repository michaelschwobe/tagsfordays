import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type { NavLinkProps } from "@remix-run/react";
import { Form, NavLink, useFetcher, useLocation } from "@remix-run/react";
import { forwardRef, useId } from "react";
import type { IconType } from "~/components/ui/icon";
import { Icon } from "~/components/ui/icon";
import { type action as rootAction } from "~/root";
import { cn } from "~/utils/misc";
import { THEME_ICON_AND_TEXT_MAP, useOptimisticTheme } from "~/utils/theme";
import { UpdateThemeFormSchema } from "~/utils/theme-validation";
import type { Theme } from "~/utils/theme.server";
import {
  USER_LOGIN_ROUTE,
  USER_LOGOUT_ROUTE,
  useOptionalUser,
} from "~/utils/user";

export interface HeaderNavLinkProps extends NavLinkProps {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string;
  /** Sets the icon type. **Required** */
  iconType: IconType;
}

export const HeaderNavLink = forwardRef<
  React.ElementRef<typeof NavLink>,
  HeaderNavLinkProps
>(({ children, className, iconType, to, ...props }, forwardedRef) => {
  return (
    <NavLink
      {...props}
      className={cn(
        "flex h-full items-center gap-2 px-3 font-medium aria-[current=page]:text-black aria-[current=page]:underline",
        className,
      )}
      to={to}
      ref={forwardedRef}
    >
      <Icon className="max-sm:text-lg" type={iconType} />
      <span className="max-sm:sr-only">{children}</span>
    </NavLink>
  );
});

HeaderNavLink.displayName = "HeaderNavLink";

export interface HeaderButtonProps
  extends React.ComponentPropsWithoutRef<"button"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string;
  /** Sets the button svg content. **Required** */
  iconType: IconType;
  /** Sets the button `type` attribute. **Required** */
  type: "button" | "submit";
}

export const HeaderNavButton = forwardRef<
  React.ElementRef<"button">,
  HeaderButtonProps
>(({ children, className, iconType, type, ...props }, forwardedRef) => {
  return (
    <button
      {...props}
      className={cn(
        "flex h-full items-center gap-2 px-3 font-medium",
        className,
      )}
      type={type}
      ref={forwardedRef}
    >
      <Icon className="max-sm:text-lg" type={iconType} />
      <span className="sr-only">{children}</span>
    </button>
  );
});

HeaderNavButton.displayName = "HeaderNavButton";

export interface HeaderNavButtonThemeProps {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the default theme. */
  userTheme?: Theme | null | undefined;
}

export const HeaderNavButtonTheme = ({
  className,
  userTheme,
}: HeaderNavButtonThemeProps) => {
  const fetcher = useFetcher<typeof rootAction>();

  const id = useId();
  const [form] = useForm({
    id,
    lastSubmission: fetcher.data!, // Lie! exactOptionalPropertyTypes mismatch,
    onValidate({ formData }) {
      return parse(formData, { schema: UpdateThemeFormSchema });
    },
  });

  const optimisticTheme = useOptimisticTheme();
  const currTheme = optimisticTheme ?? userTheme ?? "system";
  const nextTheme =
    currTheme === "system"
      ? "light"
      : currTheme === "light"
      ? "dark"
      : "system";
  const { icon, text } = THEME_ICON_AND_TEXT_MAP[currTheme];

  return (
    <fetcher.Form
      className={cn(className)}
      method="POST"
      action="/"
      {...form.props}
    >
      <input type="hidden" name={conform.INTENT} value="update-theme" />
      <input type="hidden" name="theme" value={nextTheme} />
      <HeaderNavButton type="submit" iconType={icon}>
        {text} theme
      </HeaderNavButton>
    </fetcher.Form>
  );
};

export interface HeaderProps
  extends Omit<React.ComponentPropsWithoutRef<"header">, "children">,
    Pick<HeaderNavButtonThemeProps, "userTheme"> {
  /** Sets the `class` attribute. */
  className?: string;
}

export const Header = forwardRef<React.ElementRef<"header">, HeaderProps>(
  ({ className, userTheme, ...props }, forwardedRef) => {
    const location = useLocation();
    const optionalUser = useOptionalUser();

    return (
      <header
        {...props}
        className={cn(
          "sticky top-0 border-b border-gray-200 bg-gray-100/90 backdrop-blur-sm sm:px-8",
          className,
        )}
        ref={forwardedRef}
      >
        <nav className="flex h-12 items-center justify-evenly gap-2 text-sm sm:-mx-3 sm:h-14 sm:justify-start">
          <HeaderNavLink to="/" iconType="home">
            Home
          </HeaderNavLink>

          <HeaderNavLink to="/bookmarks" iconType="bookmarks">
            Bookmarks
          </HeaderNavLink>

          <HeaderNavLink className="sm:mr-auto" to="/tags" iconType="tags">
            Tags
          </HeaderNavLink>

          <HeaderNavButtonTheme userTheme={userTheme} />

          {optionalUser ? (
            <Form
              className="sm:flex sm:items-center"
              method="POST"
              action={`${USER_LOGOUT_ROUTE}?redirectTo=${location.pathname}`}
            >
              <span className="max-sm:sr-only">
                Logged in as{" "}
                <span className="font-medium text-black">
                  {optionalUser.username}
                </span>
              </span>{" "}
              <HeaderNavButton type="submit" iconType="log-out">
                Log out
              </HeaderNavButton>
            </Form>
          ) : (
            <HeaderNavLink
              to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}
              iconType="log-in"
            >
              Log in
            </HeaderNavLink>
          )}
        </nav>
      </header>
    );
  },
);

Header.displayName = "Header";
