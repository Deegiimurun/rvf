import { useFetcher } from "@remix-run/react";
import { withYup } from "@rvf/yup";
import { RvfProvider, ValidatedForm, useRvf } from "@rvf/remix";
import * as yup from "yup";
import { Input } from "~/components/Input";

const schema = yup.object({
  name: yup.string().required(),
});
const validator = withYup(schema);

export default function FrontendValidation() {
  const fetcher =
    useFetcher<
      (typeof import("./submission.helper-with-action.action"))["action"]
    >();
  const rvf = useRvf({
    validator,
    method: "post",
    fetcher,
    formId: "test-form",
  });

  return (
    <RvfProvider scope={rvf.scope()}>
      {fetcher.data && "message" in fetcher.data && fetcher.data?.message && (
        <p>From fetcher: {fetcher.data.message}</p>
      )}
      <form {...rvf.getFormProps()}>
        <Input name="name" label="Name" />
      </form>
      <button
        type="button"
        onClick={() => {
          rvf.submit();
        }}
      >
        Submit with helper
      </button>
    </RvfProvider>
  );
}
