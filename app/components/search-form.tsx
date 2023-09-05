import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { Form, useNavigation } from "@remix-run/react";
import { useId } from "react";
import { Button } from "~/components/ui/button";
import { ButtonGroup, ButtonGroupRadio } from "~/components/ui/button-group";
import { FormControl } from "~/components/ui/form-control";
import { FormItem } from "~/components/ui/form-item";
import { FormLabel } from "~/components/ui/form-label";
import { FormMessage } from "~/components/ui/form-message";
import { Icon } from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { LinkButton } from "~/components/ui/link-button";
import { cn, getFieldError } from "~/utils/misc";
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
  const [form, fields] = useForm({
    id,
    defaultValue: {
      searchValue: searchValue ?? undefined,
      searchKey: searchKey,
    },
    onValidate({ formData }) {
      return parse(formData, { schema: toSearchFormSchema(searchKeys) });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <Form className={cn(className)} method="GET" {...form.props}>
      <fieldset
        className="flex flex-wrap gap-2"
        disabled={["submitting", "loading"].includes(navigation.state)}
      >
        <legend className="sr-only">Search database</legend>

        <FormItem className="max-sm:w-full max-sm:grow">
          <div
            className="sr-only text-sm font-medium"
            id={fields.searchKey.descriptionId}
          >
            Search Key
          </div>
          <ButtonGroup>
            {conform
              .collection(fields.searchKey, {
                type: "radio",
                options: searchKeys,
                description: true,
              })
              .map((fieldProps, index) => (
                <ButtonGroupRadio key={index} {...fieldProps}>
                  {searchKeysLabelMap[fieldProps.value]}
                </ButtonGroupRadio>
              ))}
          </ButtonGroup>
          <FormMessage id={fields.searchKey.errorId}>
            {getFieldError(fields.searchKey)}
          </FormMessage>
        </FormItem>

        <FormItem className="grow">
          <FormLabel className="sr-only" htmlFor={fields.searchValue.id}>
            Search Term
          </FormLabel>
          <FormControl>
            <Input
              className="max-w-none"
              {...conform.input(fields.searchValue, { type: "text" })}
              placeholder="Search for…"
              autoComplete="false"
            />
          </FormControl>
          <FormMessage id={fields.searchValue.errorId}>
            {getFieldError(fields.searchValue)}
          </FormMessage>
        </FormItem>

        <FormItem className="flex-row-reverse">
          <Button type="submit" size="md-icon" variant="filled">
            <Icon type="search" />
            <span className="sr-only">Submit</span>
          </Button>
          <LinkButton to="." relative="path" reloadDocument size="md-icon">
            <Icon type="x" />
            <span className="sr-only">Reset filters</span>
          </LinkButton>
        </FormItem>
      </fieldset>
    </Form>
  );
}
