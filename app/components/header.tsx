import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { Form, NavLink, useFetcher, useLocation } from "@remix-run/react";
import { cva } from "class-variance-authority";
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
  "inline-flex h-14 w-14 items-center justify-center gap-2 whitespace-nowrap border border-transparent font-medium transition-colors focus-visible:border-pink-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-400 dark:focus-visible:border-pink-500 dark:focus-visible:ring-pink-500 md:rounded-md",
  {
    variants: {
      variant: {
        link: "hover:bg-cyan-600/50 active:bg-cyan-600 aria-[current=page]:bg-cyan-600 dark:hover:bg-cyan-800/50 dark:active:bg-cyan-800 dark:aria-[current=page]:bg-cyan-800 md:h-10 md:w-auto md:px-4",
        button:
          "hover:bg-cyan-600/50 focus-visible:bg-transparent active:bg-cyan-600 dark:hover:bg-cyan-800/50 dark:active:bg-cyan-800 md:h-10 md:w-10 lg:w-auto lg:px-4",
      },
    },
    defaultVariants: {
      variant: "link",
    },
  },
);

const HeaderNavLink = forwardRef<
  React.ElementRef<typeof NavLink>,
  Omit<
    React.ComponentPropsWithoutRef<typeof NavLink>,
    "children" | "className"
  > & {
    children: React.ReactNode;
    className?: string | undefined;
    iconType: IconType;
  }
>(({ children, className, iconType, to, ...props }, ref) => {
  return (
    <NavLink
      {...props}
      to={to}
      className={cn(headerNavLinkVariants({ className, variant: "link" }))}
      ref={ref}
    >
      <Icon type={iconType} className="max-md:text-lg" />
      <span className="max-md:sr-only">{children}</span>
    </NavLink>
  );
});
HeaderNavLink.displayName = "HeaderNavLink";

const HeaderNavButton = forwardRef<
  React.ElementRef<"button">,
  React.ComponentPropsWithoutRef<"button"> & {
    iconType: IconType;
    type: "button" | "submit";
  }
>(({ children, className, iconType, type, ...props }, ref) => {
  return (
    <button
      {...props}
      type={type}
      className={cn(headerNavLinkVariants({ className, variant: "button" }))}
      ref={ref}
    >
      <Icon type={iconType} className="max-md:text-lg" />
      <span className="max-lg:sr-only">{children}</span>
    </button>
  );
});
HeaderNavButton.displayName = "HeaderNavButton";

const HeaderNavButtonTheme = ({
  className,
  userTheme,
}: {
  className?: string | undefined;
  userTheme?: Theme | null | undefined;
}) => {
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
        {text} <span className="sr-only">theme</span>
      </HeaderNavButton>
    </fetcher.Form>
  );
};

export const Header = forwardRef<
  React.ElementRef<"header">,
  Omit<React.ComponentPropsWithoutRef<"header">, "children"> & {
    userTheme?: Theme | null | undefined;
  }
>(({ className, userTheme, ...props }, ref) => {
  const location = useLocation();
  const optionalUser = useOptionalUser();

  return (
    <header
      {...props}
      className={cn(
        "sticky top-0 z-40 bg-cyan-500 text-white shadow dark:bg-cyan-700 md:px-8 md:py-3",
        className,
      )}
      ref={ref}
    >
      <nav className="flex items-center justify-evenly gap-2 md:-mx-4 md:justify-start">
        <HeaderNavLink to="/" iconType="home">
          Home
        </HeaderNavLink>

        <HeaderNavLink to="/books" iconType="books">
          Books
        </HeaderNavLink>

        <HeaderNavLink to="/bookmarks" iconType="bookmarks">
          Bookmarks
        </HeaderNavLink>

        <HeaderNavLink to="/tags" iconType="tags" className="md:mr-auto">
          Tags
        </HeaderNavLink>

        {optionalUser ? (
          <div className="flex items-center gap-2 pr-3 max-md:sr-only">
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
});
Header.displayName = "Header";
