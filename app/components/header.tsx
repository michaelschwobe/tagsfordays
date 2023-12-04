import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type { NavLinkProps } from "@remix-run/react";
import { Form, NavLink, useFetcher, useLocation } from "@remix-run/react";
import { cva, type VariantProps } from "class-variance-authority";
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

const headerNavLinkVariants = cva(
  "inline-flex h-14 w-14 items-center justify-center gap-2 whitespace-nowrap border border-transparent font-medium transition-colors focus-visible:border-pink-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-400 dark:focus-visible:border-pink-500 dark:focus-visible:ring-pink-500 sm:rounded-md",
  {
    variants: {
      variant: {
        link: "hover:bg-cyan-600/50 active:bg-cyan-600 aria-[current=page]:bg-cyan-600 dark:hover:bg-cyan-800/50 dark:active:bg-cyan-800 dark:aria-[current=page]:bg-cyan-800 sm:h-10 sm:w-auto sm:px-4",
        button:
          "hover:bg-cyan-600/50 focus-visible:bg-transparent active:bg-cyan-600 dark:hover:bg-cyan-800/50 dark:active:bg-cyan-800 sm:h-10 sm:w-10",
      },
    },
    defaultVariants: {
      variant: "link",
    },
  },
);

type HeaderNavLinkVariants = VariantProps<typeof headerNavLinkVariants>;

interface HeaderNavLinkProps extends Omit<NavLinkProps, "className"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the icon type. **Required** */
  iconType: IconType;
}

const HeaderNavLink = forwardRef<
  React.ElementRef<typeof NavLink>,
  HeaderNavLinkProps
>(({ children, className, iconType, to, ...props }, forwardedRef) => {
  return (
    <NavLink
      {...props}
      className={cn(headerNavLinkVariants({ className, variant: "link" }))}
      to={to}
      ref={forwardedRef}
    >
      <Icon className="max-sm:text-lg" type={iconType} />
      <span className="max-sm:sr-only">{children}</span>
    </NavLink>
  );
});

HeaderNavLink.displayName = "HeaderNavLink";

interface HeaderButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    HeaderNavLinkVariants {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the button svg content. **Required** */
  iconType: IconType;
  /** Sets the button `type` attribute. **Required** */
  type: "button" | "submit";
}

const HeaderNavButton = forwardRef<
  React.ElementRef<"button">,
  HeaderButtonProps
>(({ children, className, iconType, type, ...props }, forwardedRef) => {
  return (
    <button
      {...props}
      className={cn(headerNavLinkVariants({ className, variant: "button" }))}
      type={type}
      ref={forwardedRef}
    >
      <Icon className="max-sm:text-lg" type={iconType} />
      <span className="sr-only">{children}</span>
    </button>
  );
});

HeaderNavButton.displayName = "HeaderNavButton";

interface HeaderNavButtonThemeProps {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the default theme. */
  userTheme?: Theme | null | undefined;
}

const HeaderNavButtonTheme = ({
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
      {...form.props}
      method="POST"
      action="/"
      className={cn(className)}
    >
      <input type="hidden" name={conform.INTENT} value="update-theme" hidden />
      <input type="hidden" name="theme" value={nextTheme} hidden />
      <HeaderNavButton type="submit" iconType={icon}>
        {text} theme
      </HeaderNavButton>
    </fetcher.Form>
  );
};

interface HeaderProps
  extends Omit<React.ComponentPropsWithoutRef<"header">, "children">,
    Pick<HeaderNavButtonThemeProps, "userTheme"> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const Header = forwardRef<React.ElementRef<"header">, HeaderProps>(
  ({ className, userTheme, ...props }, forwardedRef) => {
    const location = useLocation();
    const optionalUser = useOptionalUser();

    return (
      <header
        {...props}
        className={cn(
          "sticky top-0 z-40 bg-cyan-500 text-white shadow dark:bg-cyan-700 sm:px-8 sm:py-3",
          className,
        )}
        ref={forwardedRef}
      >
        <nav className="flex items-center justify-evenly gap-2 sm:-mx-4 sm:justify-start">
          <HeaderNavLink to="/" iconType="home">
            Home
          </HeaderNavLink>

          <HeaderNavLink to="/bookmarks" iconType="bookmarks">
            Bookmarks
          </HeaderNavLink>

          <HeaderNavLink className="sm:mr-auto" to="/tags" iconType="tags">
            Tags
          </HeaderNavLink>

          {optionalUser ? (
            <div className="flex items-center gap-2 pr-3 max-sm:sr-only">
              <Icon type="user" />
              <span className="sr-only">Logged in as </span>
              <span className="font-medium text-white" data-testid="username">
                {optionalUser.username}
              </span>
            </div>
          ) : null}

          {optionalUser ? (
            <Form
              method="POST"
              action={`${USER_LOGOUT_ROUTE}?redirectTo=${location.pathname}`}
            >
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

          <HeaderNavButtonTheme userTheme={userTheme} />
        </nav>
      </header>
    );
  },
);

Header.displayName = "Header";
