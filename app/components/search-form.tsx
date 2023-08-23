import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { Form, useNavigation } from "@remix-run/react";
import { useId } from "react";
import { Button } from "~/components/ui/button";
import { FormLabel } from "~/components/ui/form-label";
import { FormMessage } from "~/components/ui/form-message";
import { Icon } from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { LinkButton } from "~/components/ui/link-button";
import { cn } from "~/utils/misc";
import { toSearchFormSchema } from "~/utils/misc-validation";

export interface SearchFormProps {
  /** Sets the `class` attribute. */
  className?: string;
  /** Sets the default checked radio. **Required** */
  searchKey: string;
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
  const [form, fieldset] = useForm({
    id,
    defaultValue: {
      searchValue: searchValue ?? undefined,
      searchKey: searchKey,
    },
    onValidate({ formData }) {
      return parse(formData, { schema: toSearchFormSchema(searchKeys) });
    },
  });

  return (
    <Form className={cn("", className)} method="GET" {...form.props}>
      <fieldset
        className="flex flex-col gap-2 sm:flex-row sm:items-start"
        disabled={["submitting", "loading"].includes(navigation.state)}
      >
        <legend className="sr-only">Search database</legend>

        <div className="grow">
          <FormLabel className="sr-only" htmlFor={fieldset.searchValue.id}>
            Search Term
          </FormLabel>
          <div>
            <Input
              className="w-full"
              {...conform.input(fieldset.searchValue, { type: "text" })}
              placeholder="Search for…"
              autoComplete="false"
            />
          </div>
          <FormMessage id={fieldset.searchValue.errorId}>
            {fieldset.searchValue.error}
          </FormMessage>
        </div>

        <div className="flex flex-col gap-1">
          <div
            className="sr-only text-sm font-medium"
            id={fieldset.searchKey.descriptionId}
          >
            Search key
          </div>
          <div className="flex h-10 items-center gap-1 rounded-lg bg-black p-1 text-white">
            {conform
              .collection(fieldset.searchKey, {
                type: "radio",
                options: searchKeys,
                description: true,
              })
              .map((props, index) => (
                <label
                  key={index}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-1 font-medium transition-all focus-within:border-blue-600 focus-within:outline focus-within:outline-1 focus-within:outline-blue-600 hover:bg-white/30 [&:has(:checked)]:bg-white [&:has(:checked)]:text-black"
                  htmlFor={props.id}
                >
                  <input className="sr-only" {...props} />
                  <span>{searchKeysLabelMap[props.value] ?? props.value}</span>
                </label>
              ))}
          </div>
          <FormMessage id={fieldset.searchKey.errorId}>
            {fieldset.searchKey.error}
          </FormMessage>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button type="submit">
            <Icon type="search" />
            <span className="sr-only">Submit</span>
          </Button>

          <LinkButton to="." reloadDocument>
            <Icon type="x" />
            <span className="sr-only">Reset Filters</span>
          </LinkButton>
        </div>
      </fieldset>
    </Form>
  );
}
