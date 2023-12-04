import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { Form, useNavigation } from "@remix-run/react";
import { useId } from "react";
import { ButtonGroup, ButtonGroupButton } from "~/components/ui/button-group";
import { FormControl } from "~/components/ui/form-control";
import { FormItem } from "~/components/ui/form-item";
import { FormLabel } from "~/components/ui/form-label";
import { FormMessage } from "~/components/ui/form-message";
import { Icon } from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { LinkButton } from "~/components/ui/link-button";
import { cn, getFieldError } from "~/utils/misc";
import { toSearchFormSchema } from "~/utils/misc-validation";

interface SearchFormProps {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the default checked radio. */
  searchKey?: string | null | undefined;
  /** Sets the radio option values. **Required** */
  searchKeys: [string, ...string[]];
  /** Sets the radio option labels. **Required** */
  searchKeysLabelMap: Readonly<Record<string, React.ReactNode>>;
  /** Sets the default value of the search input. */
  searchValue?: string | null | undefined;
}

export function SearchForm({
  className,
  searchKey,
  searchKeys,
  searchKeysLabelMap,
  searchValue,
}: SearchFormProps) {
  const navigation = useNavigation();

  const id = useId();
  const [form, fields] = useForm({
    id,
    defaultValue: { searchKey, searchValue },
    onValidate({ formData }) {
      return parse(formData, { schema: toSearchFormSchema(searchKeys) });
    },
    shouldRevalidate: "onBlur",
  });

  const hasSearchValue = Boolean(fields.searchValue.defaultValue);
  const isPending = navigation.state !== "idle";

  return (
    <Form
      {...form.props}
      method="GET"
      replace
      className={cn("flex flex-col gap-2 sm:flex-row", className)}
      data-testid="search-form"
    >
      <FormItem className="relative grow">
        <FormLabel
          className="absolute left-4 top-3 text-base"
          htmlFor={fields.searchValue.id}
        >
          <Icon type="search" />
          <span className="sr-only">Search Term</span>
        </FormLabel>
        <FormControl>
          <Input
            className={cn("max-w-none pl-11", hasSearchValue ? "pr-12" : null)}
            {...conform.input(fields.searchValue, { type: "text" })}
            placeholder="Search for…"
            autoComplete="false"
            disabled={isPending}
          />
        </FormControl>
        <FormMessage id={fields.searchValue.errorId}>
          {getFieldError(fields.searchValue)}
        </FormMessage>
        {hasSearchValue ? (
          <LinkButton
            to="."
            relative="path"
            reloadDocument
            size="md-icon"
            className="absolute right-0 rounded-s-none"
          >
            <Icon type="x" />
            <span className="sr-only">Reset</span>
          </LinkButton>
        ) : null}
      </FormItem>

      <ButtonGroup>
        <div className="sr-only">Search Key</div>
        {searchKeys.map((searchKey) => (
          <ButtonGroupButton
            key={searchKey}
            name="searchKey"
            value={searchKey}
            aria-pressed={searchKey === fields.searchKey.defaultValue}
          >
            {searchKeysLabelMap[searchKey]}
          </ButtonGroupButton>
        ))}
      </ButtonGroup>
    </Form>
  );
}
