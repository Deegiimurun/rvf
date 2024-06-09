import {
  FieldErrors,
  FieldValues,
  ValidationBehaviorConfig,
  Validator,
} from "./types";
import {
  DomSubmitHandler,
  FieldSerializer,
  FormStoreValue,
  MutableImplStore,
  RefStore,
  ResolverQueue,
  StateSubmitHandler,
  StoreFlags,
  StoreFormProps,
  createFormStateStore,
  createRefStore,
  createResolverQueue,
} from "./store";
import { createTrackedSelector } from "react-tracked";
import {
  StringToPathTuple,
  ValidStringPaths,
  ValueAtPath,
  pathArrayToString,
} from "set-get";

type SubmitTypes<FormOutputData> =
  | {
      submitSource: "state";
      onSubmit?: (data: FormOutputData) => Promise<void>;
    }
  | {
      submitSource: "dom";
      onSubmit?: (data: FormOutputData, formData: FormData) => Promise<void>;
    };

type FormInit<FormInputData extends FieldValues, FormOutputData> = {
  defaultValues: FormInputData;
  serverValidationErrors: FieldErrors;
  validator: Validator<FormOutputData>;
  validationBehaviorConfig?: ValidationBehaviorConfig;
  onSubmit: StateSubmitHandler | DomSubmitHandler;
  onSubmitSuccess: (responseData: unknown) => void;
  onSubmitFailure: (error: unknown) => void;
  formProps: StoreFormProps;
  flags: StoreFlags;
} & SubmitTypes<FormOutputData>;

export interface Rvf<FormInputData> {
  __brand__: "rvf";
  __type__FormInputData: FormInputData;
  __field_prefix__: string;
  __store__: RvfStore;
  scope<Path extends ValidStringPaths<FormInputData>>(
    field: Path,
  ): Rvf<ValueAtPath<FormInputData, StringToPathTuple<Path>>>;
}

export interface RvfStore {
  transientFieldRefs: RefStore;
  controlledFieldRefs: RefStore;
  fieldSerializerRefs: RefStore<FieldSerializer>;
  resolvers: ResolverQueue;
  formRef: { current: HTMLFormElement | null };
  mutableImplStore: MutableImplStore;
  store: ReturnType<typeof createFormStateStore>;
  useStoreState: () => FormStoreValue;
  subformCache: Map<string, any>;
}

export const createRvf = <FormInputData extends FieldValues, FormOutputData>({
  defaultValues,
  serverValidationErrors,
  validator,
  onSubmit,
  onSubmitSuccess,
  onSubmitFailure,
  validationBehaviorConfig,
  submitSource,
  formProps,
  flags,
}: FormInit<FormInputData, FormOutputData>): Rvf<FormInputData> => {
  const transientFieldRefs = createRefStore<HTMLElement>();
  const controlledFieldRefs = createRefStore<HTMLElement>();
  const fieldSerializerRefs = createRefStore<FieldSerializer>();
  const resolvers = createResolverQueue();
  const formRef = { current: null as HTMLFormElement | null };
  const mutableImplStore = {
    validator,
    onSubmit,
    onSubmitSuccess,
    onSubmitFailure,
  } satisfies MutableImplStore;
  const store = createFormStateStore({
    defaultValues,
    serverValidationErrors,
    transientFieldRefs,
    controlledFieldRefs,
    fieldSerializerRefs,
    resolvers,
    formRef,
    submitSource,
    mutableImplStore,
    validationBehaviorConfig,
    formProps: formProps,
    flags,
  });
  const subformCache = new Map<string, any>();

  const rvfStore: RvfStore = {
    transientFieldRefs,
    controlledFieldRefs,
    fieldSerializerRefs,
    resolvers,
    formRef,
    mutableImplStore,
    store,
    subformCache,
    useStoreState: createTrackedSelector(store),
  };

  return instantiateRvf<FormInputData>(rvfStore, "");
};

const instantiateRvf = <FormInputData extends FieldValues>(
  store: RvfStore,
  prefix: string,
): Rvf<FormInputData> => ({
  __brand__: "rvf",
  __type__FormInputData: {} as any,
  __field_prefix__: prefix,
  __store__: store,
  scope(field) {
    const newPrefix = pathArrayToString([prefix, field].filter(Boolean));
    if (store.subformCache.has(newPrefix))
      return store.subformCache.get(newPrefix);

    const scoped = instantiateRvf(store, newPrefix);
    store.subformCache.set(newPrefix, scoped);
    return scoped;
  },
});

export const scopeRvf = (
  parentForm: Rvf<unknown>,
  prefix: string,
): Rvf<unknown> => {
  return parentForm.scope(prefix as never);
};