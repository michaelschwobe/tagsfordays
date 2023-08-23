import { forwardRef } from "react";
import { H2 } from "~/components/ui/h2";
import { cn, formatItemsFoundByCount, toTitleCase } from "~/utils/misc";

type FormatItemsFoundByCountProps = Parameters<
  typeof formatItemsFoundByCount
>[0];

export interface SearchHelpProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children">,
    FormatItemsFoundByCountProps {
  /** Sets the `class` attribute. */
  className?: string;
}

export const SearchHelp = forwardRef<React.ElementRef<"div">, SearchHelpProps>(
  ({ className, count, plural, single, ...props }, forwardedRef) => {
    const hasItems = typeof count === "number" && count > 0;

    return (
      <div {...props} className={cn(className)} ref={forwardedRef}>
        <H2 className={hasItems ? "sr-only" : "mb-2"}>
          {toTitleCase(formatItemsFoundByCount({ count, single, plural }))}
        </H2>

        {!hasItems ? (
          <>
            <p className="mb-2">Suggestions:</p>
            <ul className="list-disc pl-4">
              <li>Make sure all words are spelled correctly.</li>
              <li>Try different keywords.</li>
              <li>Try more general keywords.</li>
              <li>Try fewer keywords.</li>
            </ul>
          </>
        ) : null}
      </div>
    );
  },
);

SearchHelp.displayName = "SearchHelp";
