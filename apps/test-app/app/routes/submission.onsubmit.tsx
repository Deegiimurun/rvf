import { DataFunctionArgs, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { withZod } from "@rvf/zod";
import { ValidatedForm } from "@rvf/remix";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  z.object({
    shouldPreventDefault: zfd.checkbox(),
  }),
);

export const action = async (args: DataFunctionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return json({ message: "Submitted!" });
};

export default function FrontendValidation() {
  const actionData = useActionData<typeof action>();
  return (
    <>
      {actionData?.message && <h1>{actionData.message}</h1>}
      <ValidatedForm
        validator={validator}
        method="post"
        id="test-form"
        onSubmit={async (data, event) => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (event.defaultPrevented)
            throw new Error("defaultPrevented should start false");

          if (data.shouldPreventDefault) {
            event.preventDefault();
            if (!event.defaultPrevented)
              throw new Error(
                "defaultPrevented should be true after calling preventDefault",
              );
          }
        }}
      >
        <Input
          name="shouldPreventDefault"
          type="checkbox"
          label="shouldPreventDefault"
        />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
