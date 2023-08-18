import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { Form, Link, useNavigation } from "@remix-run/react";
import { useId } from "react";
import { Icon } from "~/components/icon";
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
        disabled={navigation.state === "submitting"}
      >
        <div>
          <span className="sr-only">Search within</span>{" "}
          <div className="flex justify-center gap-1 border border-gray-500 px-2 focus-within:border-blue-600 focus-within:outline focus-within:outline-1 focus-within:outline-blue-600">
            {conform
              .collection(fieldset.searchKey, {
                type: "radio",
                options: searchKeys,
              })
              .map((props, index) => (
                <label
                  className="cursor-pointer px-3 py-2 hover:underline [&:has(:checked)]:underline"
                  htmlFor={props.id}
                  key={index}
                >
                  <input className="sr-only" {...props} />
                  <span>{searchKeysLabelMap[props.value] ?? props.value}</span>
                </label>
              ))}
          </div>
          {fieldset.searchKey.error ? (
            <div id={fieldset.searchKey.errorId}>
              {fieldset.searchKey.error}
            </div>
          ) : null}
        </div>

        <div className="grow">
          <label className="sr-only" htmlFor={fieldset.searchValue.id}>
            Search for
          </label>{" "}
          <input
            className="w-full border-gray-500"
            {...conform.input(fieldset.searchValue, { type: "text" })}
            autoComplete="false"
          />{" "}
          {fieldset.searchValue.error ? (
            <div id={fieldset.searchValue.errorId}>
              {fieldset.searchValue.error}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            className="flex justify-center border border-black p-3"
            type="submit"
          >
            <Icon type="search" />
            <span className="sr-only">Submit</span>
          </button>

          <Link
            className="flex justify-center border border-black p-3 sm:max-w-max"
            to="."
            reloadDocument
          >
            <Icon type="x" />
            <span className="sr-only">Reset Filters</span>
          </Link>
        </div>
      </fieldset>
    </Form>
  );
}
