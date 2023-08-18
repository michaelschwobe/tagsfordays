import type { NavLinkProps } from "@remix-run/react";
import { Form, NavLink, useLocation } from "@remix-run/react";
import { forwardRef } from "react";
import type { IconType } from "~/components/icon";
import { Icon } from "~/components/icon";
import { USER_LOGIN_ROUTE, USER_LOGOUT_ROUTE, cn } from "~/utils/misc";
import { useOptionalUser } from "~/utils/user";

export interface HeaderNavLinkProps extends NavLinkProps {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string;
  /** Sets the icon type. **Required** */
  iconType: IconType;
}

export const HeaderNavLink = forwardRef<HTMLAnchorElement, HeaderNavLinkProps>(
  ({ children, className, iconType, to, ...props }, forwardedRef) => {
    return (
      <NavLink
        {...props}
        className={cn(
          "flex items-center gap-2 p-3 aria-[current=page]:underline",
          className,
        )}
        to={to}
        ref={forwardedRef}
      >
        <Icon className="max-sm:text-xl" type={iconType} />
        <span className="max-sm:sr-only">{children}</span>
      </NavLink>
    );
  },
);

HeaderNavLink.displayName = "HeaderNavLink";

export interface HeaderProps
  extends Omit<React.ComponentPropsWithoutRef<"header">, "children"> {
  /** Sets the `class` attribute. */
  className?: string;
}

export const Header = forwardRef<HTMLDivElement, HeaderProps>(
  ({ className, ...props }, forwardedRef) => {
    const location = useLocation();
    const optionalUser = useOptionalUser();

    return (
      <header
        {...props}
        className={cn("sticky top-0 bg-white text-black shadow", className)}
        ref={forwardedRef}
      >
        <nav className="flex items-center justify-evenly gap-2 sm:justify-start">
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
              className="sm:ml-auto"
              method="POST"
              action={`${USER_LOGOUT_ROUTE}?redirectTo=${location.pathname}`}
            >
              <button className="flex items-center gap-2 p-3" type="submit">
                <span className="max-sm:sr-only">Logged in as</span>{" "}
                <span className="font-semibold max-sm:sr-only">
                  {optionalUser.username}
                </span>{" "}
                <span className="max-sm:sr-only">Log out</span>
                <Icon type="log-out" />
              </button>
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
