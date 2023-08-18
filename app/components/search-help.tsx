import { forwardRef } from "react";

export interface SearchHelpProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** Sets the list content. */
  items?: React.ReactNode[];
}

export const SearchHelp = forwardRef<React.ElementRef<"div">, SearchHelpProps>(
  ({ items, ...props }, forwardedRef) => {
    return (
      <div {...props} ref={forwardedRef}>
        <p>Suggestions:</p>
        <ul>
          <li>Make sure all words are spelled correctly.</li>
          <li>Try different keywords.</li>
          <li>Try more general keywords.</li>
          <li>Try fewer keywords.</li>
          {items?.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </div>
    );
  },
);

SearchHelp.displayName = "SearchHelp";
