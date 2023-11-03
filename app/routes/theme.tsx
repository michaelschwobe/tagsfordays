import type { MetaFunction } from "@remix-run/node";
import { Main } from "~/components/main";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupButton,
  ButtonGroupInput,
} from "~/components/ui/button-group";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Code } from "~/components/ui/code";
import { Favicon } from "~/components/ui/favicon";
import { H1 } from "~/components/ui/h1";
import { H2 } from "~/components/ui/h2";
import { ICON_TYPES, Icon } from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { SelectItem, SimpleSelect } from "~/components/ui/select";
import {
  Caption,
  Table,
  TableWrapper,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import { Toast } from "~/components/ui/toast";
import { formatMetaTitle } from "~/utils/misc";

export const meta: MetaFunction = () => {
  return [{ title: formatMetaTitle("Theme") }];
};

export default function ThemePage() {
  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon type="palette" />
          Theme
        </H1>
      </div>

      <div className="overflow-x-auto">
        <div className="grid gap-4 sm:grid-cols-2">
          <Content />
          <Card>
            <Content />
          </Card>
        </div>
      </div>
    </Main>
  );
}

function Content() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <H2>Icons</H2>
        <div className="flex flex-wrap items-center gap-2">
          {ICON_TYPES.map((iconType) => (
            <Icon key={iconType} type={iconType} />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <H2>Favicon, Badge, Code, Checkbox</H2>
        <div className="flex flex-wrap items-center gap-2">
          <Favicon src="" />
          <Favicon src="/favicons/favicon.svg" />
          <Badge>Badge</Badge>
          <Code>Code</Code>
          <Checkbox onCheckedChange={() => {}} />
          <Checkbox onCheckedChange={() => {}} indeterminate />
          <Checkbox onCheckedChange={() => {}} checked />
          <Checkbox onCheckedChange={() => {}} disabled />
          <Checkbox onCheckedChange={() => {}} indeterminate disabled />
          <Checkbox onCheckedChange={() => {}} checked disabled />
        </div>
      </div>
      <div className="space-y-4">
        <H2>Button</H2>
        <div className="grid grid-cols-4 gap-2">
          <Button type="button" variant="link">
            <Icon type="loader" /> Button
          </Button>
          <Button type="button" variant="ghost">
            <Icon type="loader" /> Button
          </Button>
          <Button type="button" variant="outlined">
            <Icon type="loader" /> Button
          </Button>
          <Button type="button" variant="filled">
            <Icon type="loader" /> Button
          </Button>
          <Button type="button" variant="link-danger">
            <Icon type="loader" /> Button
          </Button>
          <Button type="button" variant="ghost-danger">
            <Icon type="loader" /> Button
          </Button>
          <Button type="button" variant="outlined-danger">
            <Icon type="loader" /> Button
          </Button>
          <Button type="button" variant="filled-danger">
            <Icon type="loader" /> Button
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Button type="button" variant="link" disabled>
            <Icon type="loader" /> Button
          </Button>
          <Button type="button" variant="ghost" disabled>
            <Icon type="loader" /> Button
          </Button>
          <Button type="button" variant="outlined" disabled>
            <Icon type="loader" /> Button
          </Button>
          <Button type="button" variant="filled" disabled>
            <Icon type="loader" /> Button
          </Button>
          <Button type="button" variant="link-danger" disabled>
            <Icon type="loader" /> Button
          </Button>
          <Button type="button" variant="ghost-danger" disabled>
            <Icon type="loader" /> Button
          </Button>
          <Button type="button" variant="outlined-danger" disabled>
            <Icon type="loader" /> Button
          </Button>
          <Button type="button" variant="filled-danger" disabled>
            <Icon type="loader" /> Button
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <H2>ButtonGroup</H2>
        <div className="grid grid-cols-2 gap-2">
          <ButtonGroup>
            <ButtonGroupButton aria-pressed={false}>Button</ButtonGroupButton>
            <ButtonGroupButton aria-pressed={true}>Button</ButtonGroupButton>
            <ButtonGroupButton aria-pressed={false}>Button</ButtonGroupButton>
            <ButtonGroupButton aria-pressed={false}>Button</ButtonGroupButton>
          </ButtonGroup>
          <ButtonGroup>
            <ButtonGroupInput type="checkbox" name="bg0">
              Input
            </ButtonGroupInput>
            <ButtonGroupInput type="checkbox" name="bg0" defaultChecked>
              Input
            </ButtonGroupInput>
            <ButtonGroupInput type="checkbox" name="bg0">
              Input
            </ButtonGroupInput>
            <ButtonGroupInput type="checkbox" name="bg0">
              Input
            </ButtonGroupInput>
          </ButtonGroup>
        </div>
      </div>
      <div className="space-y-4">
        <H2>Toast</H2>
        <div className="grid grid-cols-3 gap-2">
          <Toast
            onClickClose={() => {}}
            description="description lorem ipsum dolor sit"
            variant="message"
          />
          <Toast
            onClickClose={() => {}}
            description="description lorem ipsum dolor sit"
            variant="success"
          />
          <Toast
            onClickClose={() => {}}
            description="description lorem ipsum dolor sit"
            variant="error"
          />
          <Toast
            onClickClose={() => {}}
            title="title lorem ipsum dolor sit"
            description="description lorem ipsum dolor sit"
            variant="message"
          />
          <Toast
            onClickClose={() => {}}
            title="title lorem ipsum dolor sit"
            description="description lorem ipsum dolor sit"
            variant="success"
          />
          <Toast
            onClickClose={() => {}}
            title="title lorem ipsum dolor sit"
            description="description lorem ipsum dolor sit"
            variant="error"
          />
        </div>
      </div>
      <div className="space-y-4">
        <H2>Input, Select, Textarea</H2>
        <div className="grid grid-cols-3 gap-2">
          <Input name="Input-default" />
          <Input name="Input-placeholder" placeholder="placeholder" />
          <Input name="Input-defaultValue" defaultValue="defaultValue" />
          <SimpleSelect name="SimpleSelect-default" placeholder="">
            {[...Array(5).keys()].map((rowInt) => (
              <SelectItem key={rowInt} value={String(rowInt)}>
                Option {rowInt}
              </SelectItem>
            ))}
          </SimpleSelect>
          <SimpleSelect
            name="SimpleSelect-placeholder"
            placeholder="placeholder"
          >
            {[...Array(5).keys()].map((rowInt) => (
              <SelectItem key={rowInt} value={String(rowInt)}>
                Option {rowInt}
              </SelectItem>
            ))}
          </SimpleSelect>
          <SimpleSelect name="SimpleSelect-defaultValue" defaultValue="2">
            {[...Array(5).keys()].map((rowInt) => (
              <SelectItem key={rowInt} value={String(rowInt)}>
                defaultValue
              </SelectItem>
            ))}
          </SimpleSelect>
          <Textarea name="Textarea-default" />
          <Textarea name="Textarea-placeholder" placeholder="placeholder" />
          <Textarea name="Textarea-defaultValue" defaultValue="defaultValue" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Input name="Input-default-disabled" disabled />
          <Input
            name="Input-placeholder-disabled"
            placeholder="placeholder"
            disabled
          />
          <Input
            name="Input-defaultValue-disabled"
            defaultValue="defaultValue"
            disabled
          />
          <SimpleSelect
            name="SimpleSelect-default-disabled"
            placeholder=""
            disabled
          >
            {[...Array(5).keys()].map((rowInt) => (
              <SelectItem key={rowInt} value={String(rowInt)}>
                Option {rowInt}
              </SelectItem>
            ))}
          </SimpleSelect>
          <SimpleSelect
            name="SimpleSelect-placeholder-disabled"
            placeholder="placeholder"
            disabled
          >
            {[...Array(5).keys()].map((rowInt) => (
              <SelectItem key={rowInt} value={String(rowInt)}>
                Option {rowInt}
              </SelectItem>
            ))}
          </SimpleSelect>
          <SimpleSelect
            name="SimpleSelect-defaultValue-disabled"
            defaultValue="2"
            disabled
          >
            {[...Array(5).keys()].map((rowInt) => (
              <SelectItem key={rowInt} value={String(rowInt)}>
                defaultValue
              </SelectItem>
            ))}
          </SimpleSelect>
          <Textarea name="Textarea-default-disabled" disabled />
          <Textarea
            name="Textarea-placeholder-disabled"
            placeholder="placeholder"
            disabled
          />
          <Textarea
            name="Textarea-defaultValue-disabled"
            defaultValue="defaultValue"
            disabled
          />
        </div>
      </div>
      <div className="space-y-4">
        <H2>Table</H2>
        <TableWrapper>
          <Table>
            <Caption>Caption</Caption>
            <Thead>
              <Tr>
                <Th className="w-4">
                  <Checkbox onCheckedChange={() => {}} />
                </Th>
                <Th>Thead.Tr.0.Th.0</Th>
                <Th>Thead.Tr.0.Th.1</Th>
                <Th>Thead.Tr.0.Th.2</Th>
                <Th>Thead.Tr.0.Th.3</Th>
                <Th>Thead.Tr.0.Th.5</Th>
              </Tr>
            </Thead>
            <Tbody>
              {[...Array(5).keys()].map((rowInt) => (
                <Tr
                  key={rowInt}
                  data-state={rowInt === 2 ? "selected" : undefined}
                >
                  <Td>
                    <Checkbox
                      checked={rowInt === 2}
                      onCheckedChange={() => {}}
                    />
                  </Td>
                  <Td>Tbody.Tr.{rowInt}.Td.0</Td>
                  <Td>Tbody.Tr.{rowInt}.Td.1</Td>
                  <Td>Tbody.Tr.{rowInt}.Td.2</Td>
                  <Td>Tbody.Tr.{rowInt}.Td.3</Td>
                  <Td>Tbody.Tr.{rowInt}.Td.5</Td>
                </Tr>
              ))}
            </Tbody>
            <Tfoot>
              <Tr>
                <Th>
                  <Checkbox onCheckedChange={() => {}} />
                </Th>
                <Th>Tfoot.Tr.0.Th.0</Th>
                <Th>Tfoot.Tr.0.Th.1</Th>
                <Th>Tfoot.Tr.0.Th.2</Th>
                <Th>Tfoot.Tr.0.Th.3</Th>
                <Th>Tfoot.Tr.0.Th.5</Th>
              </Tr>
            </Tfoot>
          </Table>
        </TableWrapper>
      </div>
    </div>
  );
}
