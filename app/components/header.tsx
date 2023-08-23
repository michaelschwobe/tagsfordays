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
        "flex h-10 items-center gap-2 px-3 aria-[current=page]:underline sm:h-14",
        className,
      )}
      to={to}
      ref={forwardedRef}
    >
      <Icon className="max-sm:text-xl" type={iconType} />
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
}

export const HeaderButton = forwardRef<
  React.ElementRef<"button">,
  HeaderButtonProps
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <button
      {...props}
      className={cn("flex h-10 items-center gap-2 px-3 sm:h-14", className)}
      ref={forwardedRef}
    >
      {children}
    </button>
  );
});

HeaderButton.displayName = "HeaderButton";

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
        className={cn("sticky top-0 bg-black text-white shadow", className)}
        ref={forwardedRef}
      >
        <nav className="flex items-center justify-evenly gap-2 sm:justify-start sm:px-3">
          <HeaderNavLink iconType="home" to="/">
            Home
          </HeaderNavLink>

          <HeaderNavLink iconType="bookmarks" to="/bookmarks">
            Bookmarks
          </HeaderNavLink>

          <HeaderNavLink iconType="tags" to="/tags">
            Tags
          </HeaderNavLink>

          {optionalUser ? (
            <Form
              className="sm:ml-auto sm:inline-flex sm:items-baseline sm:gap-2"
              method="POST"
              action={`${USER_LOGOUT_ROUTE}?redirectTo=${location.pathname}`}
            >
              <span className="max-sm:sr-only">Logged in as</span>{" "}
              <span className="font-semibold max-sm:sr-only">
                {optionalUser.username}
              </span>{" "}
              <HeaderButton type="submit">
                <span className="max-sm:sr-only">Log out</span>
                <Icon type="log-out" />
              </HeaderButton>
            </Form>
          ) : (
            <HeaderNavLink
              className="sm:ml-auto"
              iconType="log-in"
              to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}
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
