import { forwardRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { H2 } from "~/components/ui/h2";
import { cn, formatItemsFoundByCount, toTitleCase } from "~/utils/misc";

type FormatItemsFoundByCountProps = Parameters<
  typeof formatItemsFoundByCount
>[0];

interface SearchHelpProps
  extends React.ComponentPropsWithoutRef<"div">,
    FormatItemsFoundByCountProps {
  /** Sets the content. */
  children?: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const SearchHelp = forwardRef<React.ElementRef<"div">, SearchHelpProps>(
  (
    { children, className, count, plural, singular, ...props },
    forwardedRef,
  ) => {
    const hasItems = typeof count === "number" && count > 0;
    return (
      <Card
        {...props}
        className={cn(className, hasItems ? "sr-only" : undefined)}
        ref={forwardedRef}
      >
        <CardHeader>
          <H2>
            {toTitleCase(formatItemsFoundByCount({ count, singular, plural }))}
          </H2>
        </CardHeader>

        {!hasItems ? (
          <>
            <CardContent>
              <p>Suggestions:</p>
              <ul className="list-disc pl-8">
                <li>Make sure all words are spelled correctly.</li>
                <li>Try different keywords.</li>
                <li>Try more general keywords.</li>
                <li>Try fewer keywords.</li>
              </ul>
            </CardContent>
            {children ? <CardFooter>{children}</CardFooter> : null}
          </>
        ) : null}
      </Card>
    );
  },
);

SearchHelp.displayName = "SearchHelp";
