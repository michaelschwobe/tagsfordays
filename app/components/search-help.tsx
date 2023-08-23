import { forwardRef } from "react";
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
        <h2
          className={cn(
            "mb-2 text-lg font-semibold",
            hasItems ? "sr-only" : "",
          )}
        >
          {toTitleCase(formatItemsFoundByCount({ count, single, plural }))}
        </h2>

        {!hasItems ? (
          <>
            <p className="mb-2 font-semibold">Suggestions:</p>
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
