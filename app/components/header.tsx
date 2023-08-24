import type { NavLinkProps } from "@remix-run/react";
import { Form, NavLink, useLocation } from "@remix-run/react";
import { forwardRef } from "react";
import type { IconType } from "~/components/ui/icon";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/misc";
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
  /** Sets the icon type. **Required** */
  iconType: IconType;
}

export const HeaderNavButton = forwardRef<
  React.ElementRef<"button">,
  HeaderButtonProps
>(({ children, className, iconType, ...props }, forwardedRef) => {
  return (
    <button
      {...props}
      className={cn(
        "flex h-full items-center gap-2 px-3 font-medium",
        className,
      )}
      ref={forwardedRef}
    >
      <Icon className="max-sm:text-lg" type={iconType} />
      <span className="sr-only">{children}</span>
    </button>
  );
});

HeaderNavButton.displayName = "HeaderNavButton";

export interface HeaderProps
  extends Omit<React.ComponentPropsWithoutRef<"header">, "children"> {
  /** Sets the `class` attribute. */
  className?: string;
}

export const Header = forwardRef<React.ElementRef<"header">, HeaderProps>(
  ({ className, ...props }, forwardedRef) => {
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
