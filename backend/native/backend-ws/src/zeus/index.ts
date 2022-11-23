/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from "./const";
export const HOST = "http://localhost:8113/v1/graphql";

export const HEADERS = {};
import { createClient, type Sink } from "graphql-ws"; // keep

export const apiSubscription = (options: chainOptions) => {
  const client = createClient({
    url: String(options[0]),
    connectionParams: Object.fromEntries(
      new Headers(options[1]?.headers).entries()
    ),
  });

  const ws = new Proxy(
    {
      close: () => client.dispose(),
    } as WebSocket,
    {
      get(target, key) {
        if (key === "close") return target.close;
        throw new Error(
          `Unimplemented property '${String(
            key
          )}', only 'close()' is available.`
        );
      },
    }
  );

  return (query: string) => {
    let onMessage: ((event: any) => void) | undefined;
    let onError: Sink["error"] | undefined;
    let onClose: Sink["complete"] | undefined;

    client.subscribe(
      { query },
      {
        next({ data }) {
          onMessage && onMessage(data);
        },
        error(error) {
          onError && onError(error);
        },
        complete() {
          onClose && onClose();
        },
      }
    );

    return {
      ws,
      on(listener: typeof onMessage) {
        onMessage = listener;
      },
      error(listener: typeof onError) {
        onError = listener;
      },
      open(listener: (socket: unknown) => void) {
        client.on("opened", listener);
      },
      off(listener: typeof onClose) {
        onClose = listener;
      },
    };
  };
};
const handleFetchResponse = (response: Response): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text));
          } catch (err) {
            reject(text);
          }
        })
        .catch(reject);
    });
  }
  return response.json();
};

export const apiFetch =
  (options: fetchOptions) =>
  (query: string, variables: Record<string, unknown> = {}) => {
    const fetchOptions = options[1] || {};
    if (fetchOptions.method && fetchOptions.method === "GET") {
      return fetch(
        `${options[0]}?query=${encodeURIComponent(query)}`,
        fetchOptions
      )
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response);
          }
          return response.data;
        });
    }
    return fetch(`${options[0]}`, {
      body: JSON.stringify({ query, variables }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      ...fetchOptions,
    })
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response);
        }
        return response.data;
      });
  };

export const InternalsBuildQuery = ({
  ops,
  props,
  returns,
  options,
  scalars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  options?: OperationOptions;
  scalars?: ScalarDefinition;
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p = "",
    root = true,
    vars: Array<{ name: string; graphQLType: string }> = []
  ): string => {
    const keyForPath = purifyGraphQLKey(k);
    const newPath = [p, keyForPath].join(SEPARATOR);
    if (!o) {
      return "";
    }
    if (typeof o === "boolean" || typeof o === "number") {
      return k;
    }
    if (typeof o === "string") {
      return `${k} ${o}`;
    }
    if (Array.isArray(o)) {
      const args = InternalArgsBuilt({
        props,
        returns,
        ops,
        scalars,
        vars,
      })(o[0], newPath);
      return `${ibb(args ? `${k}(${args})` : k, o[1], p, false, vars)}`;
    }
    if (k === "__alias") {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (
            typeof objectUnderAlias !== "object" ||
            Array.isArray(objectUnderAlias)
          ) {
            throw new Error(
              "Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}"
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(`${alias}:${operationName}`, operation, p, false, vars);
        })
        .join("\n");
    }
    const hasOperationName =
      root && options?.operationName ? " " + options.operationName : "";
    const keyForDirectives = o.__directives ?? "";
    const query = `{${Object.entries(o)
      .filter(([k]) => k !== "__directives")
      .map((e) =>
        ibb(...e, [p, `field<>${keyForPath}`].join(SEPARATOR), false, vars)
      )
      .join("\n")}}`;
    if (!root) {
      return `${k} ${keyForDirectives}${hasOperationName} ${query}`;
    }
    const varsString = vars
      .map((v) => `${v.name}: ${v.graphQLType}`)
      .join(", ");
    return `${k} ${keyForDirectives}${hasOperationName}${
      varsString ? `(${varsString})` : ""
    } ${query}`;
  };
  return ibb;
};

export const Thunder =
  (fn: FetchFunction) =>
  <
    O extends keyof typeof Ops,
    SCLR extends ScalarDefinition,
    R extends keyof ValueTypes = GenericOperation<O>
  >(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>
  ) =>
  <Z extends ValueTypes[R]>(
    o: Z | ValueTypes[R],
    ops?: OperationOptions & { variables?: Record<string, unknown> }
  ) =>
    fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
      ops?.variables
    ).then((data) => {
      if (graphqlOptions?.scalars) {
        return decodeScalarsInResponse({
          response: data,
          initialOp: operation,
          initialZeusQuery: o as VType,
          returns: ReturnTypes,
          scalars: graphqlOptions.scalars,
          ops: Ops,
        });
      }
      return data;
    }) as Promise<InputType<GraphQLTypes[R], Z, SCLR>>;

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options));

export const SubscriptionThunder =
  (fn: SubscriptionFunction) =>
  <
    O extends keyof typeof Ops,
    SCLR extends ScalarDefinition,
    R extends keyof ValueTypes = GenericOperation<O>
  >(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>
  ) =>
  <Z extends ValueTypes[R]>(
    o: Z | ValueTypes[R],
    ops?: OperationOptions & { variables?: ExtractVariables<Z> }
  ) => {
    const returnedFunction = fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      })
    ) as SubscriptionToGraphQL<Z, GraphQLTypes[R], SCLR>;
    if (returnedFunction?.on && graphqlOptions?.scalars) {
      const wrapped = returnedFunction.on;
      returnedFunction.on = (
        fnToCall: (args: InputType<GraphQLTypes[R], Z, SCLR>) => void
      ) =>
        wrapped((data: InputType<GraphQLTypes[R], Z, SCLR>) => {
          if (graphqlOptions?.scalars) {
            return fnToCall(
              decodeScalarsInResponse({
                response: data,
                initialOp: operation,
                initialZeusQuery: o as VType,
                returns: ReturnTypes,
                scalars: graphqlOptions.scalars,
                ops: Ops,
              })
            );
          }
          return fnToCall(data);
        });
    }
    return returnedFunction;
  };

export const Subscription = (...options: chainOptions) =>
  SubscriptionThunder(apiSubscription(options));
export const Zeus = <
  Z extends ValueTypes[R],
  O extends keyof typeof Ops,
  R extends keyof ValueTypes = GenericOperation<O>
>(
  operation: O,
  o: Z | ValueTypes[R],
  ops?: {
    operationOptions?: OperationOptions;
    scalars?: ScalarDefinition;
  }
) =>
  InternalsBuildQuery({
    props: AllTypesProps,
    returns: ReturnTypes,
    ops: Ops,
    options: ops?.operationOptions,
    scalars: ops?.scalars,
  })(operation, o as VType);

export const ZeusSelect = <T>() => ((t: unknown) => t) as SelectionFunction<T>;

export const Selector = <T extends keyof ValueTypes>(key: T) =>
  key && ZeusSelect<ValueTypes[T]>();

export const TypeFromSelector = <T extends keyof ValueTypes>(key: T) =>
  key && ZeusSelect<ValueTypes[T]>();
export const Gql = Chain(HOST, {
  headers: {
    "Content-Type": "application/json",
    ...HEADERS,
  },
});

export const ZeusScalars = ZeusSelect<ScalarCoders>();

export const decodeScalarsInResponse = <O extends Operations>({
  response,
  scalars,
  returns,
  ops,
  initialZeusQuery,
  initialOp,
}: {
  ops: O;
  response: any;
  returns: ReturnTypesType;
  scalars?: Record<string, ScalarResolver | undefined>;
  initialOp: keyof O;
  initialZeusQuery: InputValueType | VType;
}) => {
  if (!scalars) {
    return response;
  }
  const builder = PrepareScalarPaths({
    ops,
    returns,
  });

  const scalarPaths = builder(
    initialOp as string,
    ops[initialOp],
    initialZeusQuery
  );
  if (scalarPaths) {
    const r = traverseResponse({ scalarPaths, resolvers: scalars })(
      initialOp as string,
      response,
      [ops[initialOp]]
    );
    return r;
  }
  return response;
};

export const traverseResponse = ({
  resolvers,
  scalarPaths,
}: {
  scalarPaths: { [x: string]: `scalar.${string}` };
  resolvers: {
    [x: string]: ScalarResolver | undefined;
  };
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p: string[] = []
  ): unknown => {
    if (Array.isArray(o)) {
      return o.map((eachO) => ibb(k, eachO, p));
    }
    if (o == null) {
      return o;
    }
    const scalarPathString = p.join(SEPARATOR);
    const currentScalarString = scalarPaths[scalarPathString];
    if (currentScalarString) {
      const currentDecoder =
        resolvers[currentScalarString.split(".")[1]]?.decode;
      if (currentDecoder) {
        return currentDecoder(o);
      }
    }
    if (
      typeof o === "boolean" ||
      typeof o === "number" ||
      typeof o === "string" ||
      !o
    ) {
      return o;
    }
    return Object.fromEntries(
      Object.entries(o).map(([k, v]) => [
        k,
        ibb(k, v, [...p, purifyGraphQLKey(k)]),
      ])
    );
  };
  return ibb;
};

export type AllTypesPropsType = {
  [x: string]:
    | undefined
    | `scalar.${string}`
    | "enum"
    | {
        [x: string]:
          | undefined
          | string
          | {
              [x: string]: string | undefined;
            };
      };
};

export type ReturnTypesType = {
  [x: string]:
    | {
        [x: string]: string | undefined;
      }
    | `scalar.${string}`
    | undefined;
};
export type InputValueType = {
  [x: string]:
    | undefined
    | boolean
    | string
    | number
    | [any, undefined | boolean | InputValueType]
    | InputValueType;
};
export type VType =
  | undefined
  | boolean
  | string
  | number
  | [any, undefined | boolean | InputValueType]
  | InputValueType;

export type PlainType = boolean | number | string | null | undefined;
export type ZeusArgsType =
  | PlainType
  | {
      [x: string]: ZeusArgsType;
    }
  | Array<ZeusArgsType>;

export type Operations = Record<string, string>;

export type VariableDefinition = {
  [x: string]: unknown;
};

export const SEPARATOR = "|";

export type fetchOptions = Parameters<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (
  ...args: infer R
) => WebSocket
  ? R
  : never;
export type chainOptions =
  | [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }]
  | [fetchOptions[0]];
export type FetchFunction = (
  query: string,
  variables?: Record<string, unknown>
) => Promise<any>;
export type SubscriptionFunction = (query: string) => any;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<
  F extends [infer ARGS, any] ? ARGS : undefined
>;

export type OperationOptions = {
  operationName?: string;
};

export type ScalarCoder = Record<string, (s: unknown) => string>;

export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}
export class GraphQLError extends Error {
  constructor(public response: GraphQLResponse) {
    super("");
    console.error(response);
  }
  toString() {
    return "GraphQL Response Error";
  }
}
export type GenericOperation<O> = O extends keyof typeof Ops
  ? typeof Ops[O]
  : never;
export type ThunderGraphQLOptions<SCLR extends ScalarDefinition> = {
  scalars?: SCLR | ScalarCoders;
};

const ExtractScalar = (
  mappedParts: string[],
  returns: ReturnTypesType
): `scalar.${string}` | undefined => {
  if (mappedParts.length === 0) {
    return;
  }
  const oKey = mappedParts[0];
  const returnP1 = returns[oKey];
  if (typeof returnP1 === "object") {
    const returnP2 = returnP1[mappedParts[1]];
    if (returnP2) {
      return ExtractScalar([returnP2, ...mappedParts.slice(2)], returns);
    }
    return undefined;
  }
  return returnP1 as `scalar.${string}` | undefined;
};

export const PrepareScalarPaths = ({
  ops,
  returns,
}: {
  returns: ReturnTypesType;
  ops: Operations;
}) => {
  const ibb = (
    k: string,
    originalKey: string,
    o: InputValueType | VType,
    p: string[] = [],
    pOriginals: string[] = [],
    root = true
  ): { [x: string]: `scalar.${string}` } | undefined => {
    if (!o) {
      return;
    }
    if (
      typeof o === "boolean" ||
      typeof o === "number" ||
      typeof o === "string"
    ) {
      const extractionArray = [...pOriginals, originalKey];
      const isScalar = ExtractScalar(extractionArray, returns);
      if (isScalar?.startsWith("scalar")) {
        const partOfTree = {
          [[...p, k].join(SEPARATOR)]: isScalar,
        };
        return partOfTree;
      }
      return {};
    }
    if (Array.isArray(o)) {
      return ibb(k, k, o[1], p, pOriginals, false);
    }
    if (k === "__alias") {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (
            typeof objectUnderAlias !== "object" ||
            Array.isArray(objectUnderAlias)
          ) {
            throw new Error(
              "Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}"
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(alias, operationName, operation, p, pOriginals, false);
        })
        .reduce((a, b) => ({
          ...a,
          ...b,
        }));
    }
    const keyName = root ? ops[k] : k;
    return Object.entries(o)
      .filter(([k]) => k !== "__directives")
      .map(([k, v]) => {
        // Inline fragments shouldn't be added to the path as they aren't a field
        const isInlineFragment = originalKey.match(/^...\s*on/) != null;
        return ibb(
          k,
          k,
          v,
          isInlineFragment ? p : [...p, purifyGraphQLKey(keyName || k)],
          isInlineFragment
            ? pOriginals
            : [...pOriginals, purifyGraphQLKey(originalKey)],
          false
        );
      })
      .reduce((a, b) => ({
        ...a,
        ...b,
      }));
  };
  return ibb;
};

export const purifyGraphQLKey = (k: string) =>
  k.replace(/\([^)]*\)/g, "").replace(/^[^:]*\:/g, "");

const mapPart = (p: string) => {
  const [isArg, isField] = p.split("<>");
  if (isField) {
    return {
      v: isField,
      __type: "field",
    } as const;
  }
  return {
    v: isArg,
    __type: "arg",
  } as const;
};

type Part = ReturnType<typeof mapPart>;

export const ResolveFromPath = (
  props: AllTypesPropsType,
  returns: ReturnTypesType,
  ops: Operations
) => {
  const ResolvePropsType = (mappedParts: Part[]) => {
    const oKey = ops[mappedParts[0].v];
    const propsP1 = oKey ? props[oKey] : props[mappedParts[0].v];
    if (propsP1 === "enum" && mappedParts.length === 1) {
      return "enum";
    }
    if (
      typeof propsP1 === "string" &&
      propsP1.startsWith("scalar.") &&
      mappedParts.length === 1
    ) {
      return propsP1;
    }
    if (typeof propsP1 === "object") {
      if (mappedParts.length < 2) {
        return "not";
      }
      const propsP2 = propsP1[mappedParts[1].v];
      if (typeof propsP2 === "string") {
        return rpp(
          `${propsP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`
        );
      }
      if (typeof propsP2 === "object") {
        if (mappedParts.length < 3) {
          return "not";
        }
        const propsP3 = propsP2[mappedParts[2].v];
        if (propsP3 && mappedParts[2].__type === "arg") {
          return rpp(
            `${propsP3}${SEPARATOR}${mappedParts
              .slice(3)
              .map((mp) => mp.v)
              .join(SEPARATOR)}`
          );
        }
      }
    }
  };
  const ResolveReturnType = (mappedParts: Part[]) => {
    if (mappedParts.length === 0) {
      return "not";
    }
    const oKey = ops[mappedParts[0].v];
    const returnP1 = oKey ? returns[oKey] : returns[mappedParts[0].v];
    if (typeof returnP1 === "object") {
      if (mappedParts.length < 2) return "not";
      const returnP2 = returnP1[mappedParts[1].v];
      if (returnP2) {
        return rpp(
          `${returnP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`
        );
      }
    }
  };
  const rpp = (path: string): "enum" | "not" | `scalar.${string}` => {
    const parts = path.split(SEPARATOR).filter((l) => l.length > 0);
    const mappedParts = parts.map(mapPart);
    const propsP1 = ResolvePropsType(mappedParts);
    if (propsP1) {
      return propsP1;
    }
    const returnP1 = ResolveReturnType(mappedParts);
    if (returnP1) {
      return returnP1;
    }
    return "not";
  };
  return rpp;
};

export const InternalArgsBuilt = ({
  props,
  ops,
  returns,
  scalars,
  vars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  scalars?: ScalarDefinition;
  vars: Array<{ name: string; graphQLType: string }>;
}) => {
  const arb = (a: ZeusArgsType, p = "", root = true): string => {
    if (typeof a === "string") {
      if (a.startsWith(START_VAR_NAME)) {
        const [varName, graphQLType] = a
          .replace(START_VAR_NAME, "$")
          .split(GRAPHQL_TYPE_SEPARATOR);
        const v = vars.find((v) => v.name === varName);
        if (!v) {
          vars.push({
            name: varName,
            graphQLType,
          });
        } else {
          if (v.graphQLType !== graphQLType) {
            throw new Error(
              `Invalid variable exists with two different GraphQL Types, "${v.graphQLType}" and ${graphQLType}`
            );
          }
        }
        return varName;
      }
    }
    const checkType = ResolveFromPath(props, returns, ops)(p);
    if (checkType.startsWith("scalar.")) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...splittedScalar] = checkType.split(".");
      const scalarKey = splittedScalar.join(".");
      return (scalars?.[scalarKey]?.encode?.(a) as string) || JSON.stringify(a);
    }
    if (Array.isArray(a)) {
      return `[${a.map((arr) => arb(arr, p, false)).join(", ")}]`;
    }
    if (typeof a === "string") {
      if (checkType === "enum") {
        return a;
      }
      return `${JSON.stringify(a)}`;
    }
    if (typeof a === "object") {
      if (a === null) {
        return `null`;
      }
      const returnedObjectString = Object.entries(a)
        .filter(([, v]) => typeof v !== "undefined")
        .map(([k, v]) => `${k}: ${arb(v, [p, k].join(SEPARATOR), false)}`)
        .join(",\n");
      if (!root) {
        return `{${returnedObjectString}}`;
      }
      return returnedObjectString;
    }
    return `${a}`;
  };
  return arb;
};

export const resolverFor = <
  X,
  T extends keyof ResolverInputTypes,
  Z extends keyof ResolverInputTypes[T]
>(
  type: T,
  field: Z,
  fn: (
    args: Required<ResolverInputTypes[T]>[Z] extends [infer Input, any]
      ? Input
      : any,
    source: any
  ) => Z extends keyof ModelTypes[T]
    ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X
    : any
) => fn as (args?: any, source?: any) => any;

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<
  UnwrapPromise<ReturnType<T>>
>;
export type ZeusHook<
  T extends (
    ...args: any[]
  ) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>
> = ZeusState<ReturnType<T>[N]>;

export type WithTypeNameValue<T> = T & {
  __typename?: boolean;
  __directives?: string;
};
export type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};
type DeepAnify<T> = {
  [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
export type ScalarDefinition = Record<string, ScalarResolver>;

type IsScalar<S, SCLR extends ScalarDefinition> = S extends "scalar" & {
  name: infer T;
}
  ? T extends keyof SCLR
    ? SCLR[T]["decode"] extends (s: unknown) => unknown
      ? ReturnType<SCLR[T]["decode"]>
      : unknown
    : unknown
  : S;
type IsArray<T, U, SCLR extends ScalarDefinition> = T extends Array<infer R>
  ? InputType<R, U, SCLR>[]
  : InputType<T, U, SCLR>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;
type BaseZeusResolver = boolean | 1 | string | Variable<any, string>;

type IsInterfaced<
  SRC extends DeepAnify<DST>,
  DST,
  SCLR extends ScalarDefinition
> = FlattenArray<SRC> extends ZEUS_INTERFACES | ZEUS_UNIONS
  ? {
      [P in keyof SRC]: SRC[P] extends "__union" & infer R
        ? P extends keyof DST
          ? IsArray<
              R,
              "__typename" extends keyof DST
                ? DST[P] & { __typename: true }
                : DST[P],
              SCLR
            >
          : Record<string, unknown>
        : never;
    }[keyof DST] & {
      [P in keyof Omit<
        Pick<
          SRC,
          {
            [P in keyof DST]: SRC[P] extends "__union" & infer R ? never : P;
          }[keyof DST]
        >,
        "__typename"
      >]: IsPayLoad<DST[P]> extends BaseZeusResolver
        ? IsScalar<SRC[P], SCLR>
        : IsArray<SRC[P], DST[P], SCLR>;
    }
  : {
      [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<
        DST[P]
      > extends BaseZeusResolver
        ? IsScalar<SRC[P], SCLR>
        : IsArray<SRC[P], DST[P], SCLR>;
    };

export type MapType<
  SRC,
  DST,
  SCLR extends ScalarDefinition
> = SRC extends DeepAnify<DST> ? IsInterfaced<SRC, DST, SCLR> : never;
// eslint-disable-next-line @typescript-eslint/ban-types
export type InputType<
  SRC,
  DST,
  SCLR extends ScalarDefinition = {}
> = IsPayLoad<DST> extends { __alias: infer R }
  ? {
      [P in keyof R]: MapType<SRC, R[P], SCLR>[keyof MapType<SRC, R[P], SCLR>];
    } & MapType<SRC, Omit<IsPayLoad<DST>, "__alias">, SCLR>
  : MapType<SRC, IsPayLoad<DST>, SCLR>;
export type SubscriptionToGraphQL<Z, T, SCLR extends ScalarDefinition> = {
  ws: WebSocket;
  on: (fn: (args: InputType<T, Z, SCLR>) => void) => void;
  off: (
    fn: (e: {
      data?: InputType<T, Z, SCLR>;
      code?: number;
      reason?: string;
      message?: string;
    }) => void
  ) => void;
  error: (
    fn: (e: { data?: InputType<T, Z, SCLR>; errors?: string[] }) => void
  ) => void;
  open: () => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type FromSelector<
  SELECTOR,
  NAME extends keyof GraphQLTypes,
  SCLR extends ScalarDefinition = {}
> = InputType<GraphQLTypes[NAME], SELECTOR, SCLR>;

export type ScalarResolver = {
  encode?: (s: unknown) => string;
  decode?: (s: unknown) => unknown;
};

export type SelectionFunction<V> = <T>(t: T | V) => T;

type BuiltInVariableTypes = {
  ["String"]: string;
  ["Int"]: number;
  ["Float"]: number;
  ["ID"]: unknown;
  ["Boolean"]: boolean;
};
type AllVariableTypes = keyof BuiltInVariableTypes | keyof ZEUS_VARIABLES;
type VariableRequired<T extends string> =
  | `${T}!`
  | T
  | `[${T}]`
  | `[${T}]!`
  | `[${T}!]`
  | `[${T}!]!`;
type VR<T extends string> = VariableRequired<VariableRequired<T>>;

export type GraphQLVariableType = VR<AllVariableTypes>;

type ExtractVariableTypeString<T extends string> = T extends VR<infer R1>
  ? R1 extends VR<infer R2>
    ? R2 extends VR<infer R3>
      ? R3 extends VR<infer R4>
        ? R4 extends VR<infer R5>
          ? R5
          : R4
        : R3
      : R2
    : R1
  : T;

type DecomposeType<T, Type> = T extends `[${infer R}]`
  ? Array<DecomposeType<R, Type>> | undefined
  : T extends `${infer R}!`
  ? NonNullable<DecomposeType<R, Type>>
  : Type | undefined;

type ExtractTypeFromGraphQLType<T extends string> =
  T extends keyof ZEUS_VARIABLES
    ? ZEUS_VARIABLES[T]
    : T extends keyof BuiltInVariableTypes
    ? BuiltInVariableTypes[T]
    : any;

export type GetVariableType<T extends string> = DecomposeType<
  T,
  ExtractTypeFromGraphQLType<ExtractVariableTypeString<T>>
>;

type UndefinedKeys<T> = {
  [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? never : K;
}[keyof T];

type WithNullableKeys<T> = Pick<T, UndefinedKeys<T>>;
type WithNonNullableKeys<T> = Omit<T, UndefinedKeys<T>>;

type OptionalKeys<T> = {
  [P in keyof T]?: T[P];
};

export type WithOptionalNullables<T> = OptionalKeys<WithNullableKeys<T>> &
  WithNonNullableKeys<T>;

export type Variable<T extends GraphQLVariableType, Name extends string> = {
  " __zeus_name": Name;
  " __zeus_type": T;
};

export type ExtractVariables<Query> = Query extends Variable<
  infer VType,
  infer VName
>
  ? { [key in VName]: GetVariableType<VType> }
  : Query extends [infer Inputs, infer Outputs]
  ? ExtractVariables<Inputs> & ExtractVariables<Outputs>
  : Query extends string | number | boolean
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : UnionToIntersection<
      {
        [K in keyof Query]: WithOptionalNullables<ExtractVariables<Query[K]>>;
      }[keyof Query]
    >;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

export const START_VAR_NAME = `$ZEUS_VAR`;
export const GRAPHQL_TYPE_SEPARATOR = `__$GRAPHQL__`;

export const $ = <Type extends GraphQLVariableType, Name extends string>(
  name: Name,
  graphqlType: Type
) => {
  return (START_VAR_NAME +
    name +
    GRAPHQL_TYPE_SEPARATOR +
    graphqlType) as unknown as Variable<Type, Name>;
};
type ZEUS_INTERFACES = never;
export type ScalarCoders = {
  timestamptz?: ScalarResolver;
};
type ZEUS_UNIONS = never;

export type ValueTypes = {
  /** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
  ["Int_comparison_exp"]: {
    _eq?: number | undefined | null | Variable<any, string>;
    _gt?: number | undefined | null | Variable<any, string>;
    _gte?: number | undefined | null | Variable<any, string>;
    _in?: Array<number> | undefined | null | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: number | undefined | null | Variable<any, string>;
    _lte?: number | undefined | null | Variable<any, string>;
    _neq?: number | undefined | null | Variable<any, string>;
    _nin?: Array<number> | undefined | null | Variable<any, string>;
  };
  /** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
  ["String_comparison_exp"]: {
    _eq?: string | undefined | null | Variable<any, string>;
    _gt?: string | undefined | null | Variable<any, string>;
    _gte?: string | undefined | null | Variable<any, string>;
    /** does the column match the given case-insensitive pattern */
    _ilike?: string | undefined | null | Variable<any, string>;
    _in?: Array<string> | undefined | null | Variable<any, string>;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: string | undefined | null | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    /** does the column match the given pattern */
    _like?: string | undefined | null | Variable<any, string>;
    _lt?: string | undefined | null | Variable<any, string>;
    _lte?: string | undefined | null | Variable<any, string>;
    _neq?: string | undefined | null | Variable<any, string>;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: string | undefined | null | Variable<any, string>;
    _nin?: Array<string> | undefined | null | Variable<any, string>;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: string | undefined | null | Variable<any, string>;
    /** does the column NOT match the given pattern */
    _nlike?: string | undefined | null | Variable<any, string>;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: string | undefined | null | Variable<any, string>;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: string | undefined | null | Variable<any, string>;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: string | undefined | null | Variable<any, string>;
    /** does the column match the given SQL regular expression */
    _similar?: string | undefined | null | Variable<any, string>;
  };
  /** columns and relationships of "chats" */
  ["chats"]: AliasType<{
    client_generated_uuid?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    message?: boolean | `@${string}`;
    room?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "chats". All fields are combined with a logical 'AND'. */
  ["chats_bool_exp"]: {
    _and?:
      | Array<ValueTypes["chats_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["chats_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["chats_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    client_generated_uuid?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    message?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    room?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    username?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    uuid?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "chats" */
  ["chats_constraint"]: chats_constraint;
  /** input type for inserting data into table "chats" */
  ["chats_insert_input"]: {
    client_generated_uuid?: string | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    message?: string | undefined | null | Variable<any, string>;
    room?: string | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "chats" */
  ["chats_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["chats"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "chats" */
  ["chats_on_conflict"]: {
    constraint: ValueTypes["chats_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["chats_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["chats_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "chats". */
  ["chats_order_by"]: {
    client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    room?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    username?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    uuid?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** select columns of table "chats" */
  ["chats_select_column"]: chats_select_column;
  /** Streaming cursor of the table "chats" */
  ["chats_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["chats_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["chats_stream_cursor_value_input"]: {
    client_generated_uuid?: string | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    message?: string | undefined | null | Variable<any, string>;
    room?: string | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
  };
  /** placeholder for update columns of table "chats" (current role has no relevant permissions) */
  ["chats_update_column"]: chats_update_column;
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** mutation root */
  ["mutation_root"]: AliasType<{
    insert_chats?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["chats_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["chats_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chats_mutation_response"]
    ];
    insert_chats_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["chats_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["chats_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chats"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    chats?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chats_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["chats_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chats_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chats"]
    ];
    chats_by_pk?: [{ id: number | Variable<any, string> }, ValueTypes["chats"]];
    __typename?: boolean | `@${string}`;
  }>;
  ["subscription_root"]: AliasType<{
    chats?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chats_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["chats_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chats_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chats"]
    ];
    chats_by_pk?: [{ id: number | Variable<any, string> }, ValueTypes["chats"]];
    chats_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["chats_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chats_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chats"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["timestamptz"]: unknown;
  /** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
  ["timestamptz_comparison_exp"]: {
    _eq?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _gt?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _gte?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _in?:
      | Array<ValueTypes["timestamptz"]>
      | undefined
      | null
      | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _lte?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _neq?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _nin?:
      | Array<ValueTypes["timestamptz"]>
      | undefined
      | null
      | Variable<any, string>;
  };
};

export type ResolverInputTypes = {
  /** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
  ["Int_comparison_exp"]: {
    _eq?: number | undefined | null;
    _gt?: number | undefined | null;
    _gte?: number | undefined | null;
    _in?: Array<number> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: number | undefined | null;
    _lte?: number | undefined | null;
    _neq?: number | undefined | null;
    _nin?: Array<number> | undefined | null;
  };
  /** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
  ["String_comparison_exp"]: {
    _eq?: string | undefined | null;
    _gt?: string | undefined | null;
    _gte?: string | undefined | null;
    /** does the column match the given case-insensitive pattern */
    _ilike?: string | undefined | null;
    _in?: Array<string> | undefined | null;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: string | undefined | null;
    _is_null?: boolean | undefined | null;
    /** does the column match the given pattern */
    _like?: string | undefined | null;
    _lt?: string | undefined | null;
    _lte?: string | undefined | null;
    _neq?: string | undefined | null;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: string | undefined | null;
    _nin?: Array<string> | undefined | null;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: string | undefined | null;
    /** does the column NOT match the given pattern */
    _nlike?: string | undefined | null;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: string | undefined | null;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: string | undefined | null;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: string | undefined | null;
    /** does the column match the given SQL regular expression */
    _similar?: string | undefined | null;
  };
  /** columns and relationships of "chats" */
  ["chats"]: AliasType<{
    client_generated_uuid?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    message?: boolean | `@${string}`;
    room?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "chats". All fields are combined with a logical 'AND'. */
  ["chats_bool_exp"]: {
    _and?: Array<ResolverInputTypes["chats_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["chats_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["chats_bool_exp"]> | undefined | null;
    client_generated_uuid?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    created_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    message?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    room?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    username?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    uuid?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "chats" */
  ["chats_constraint"]: chats_constraint;
  /** input type for inserting data into table "chats" */
  ["chats_insert_input"]: {
    client_generated_uuid?: string | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: number | undefined | null;
    message?: string | undefined | null;
    room?: string | undefined | null;
    username?: string | undefined | null;
    uuid?: string | undefined | null;
  };
  /** response of any mutation on the table "chats" */
  ["chats_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["chats"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "chats" */
  ["chats_on_conflict"]: {
    constraint: ResolverInputTypes["chats_constraint"];
    update_columns: Array<ResolverInputTypes["chats_update_column"]>;
    where?: ResolverInputTypes["chats_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "chats". */
  ["chats_order_by"]: {
    client_generated_uuid?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message?: ResolverInputTypes["order_by"] | undefined | null;
    room?: ResolverInputTypes["order_by"] | undefined | null;
    username?: ResolverInputTypes["order_by"] | undefined | null;
    uuid?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** select columns of table "chats" */
  ["chats_select_column"]: chats_select_column;
  /** Streaming cursor of the table "chats" */
  ["chats_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["chats_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["chats_stream_cursor_value_input"]: {
    client_generated_uuid?: string | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: number | undefined | null;
    message?: string | undefined | null;
    room?: string | undefined | null;
    username?: string | undefined | null;
    uuid?: string | undefined | null;
  };
  /** placeholder for update columns of table "chats" (current role has no relevant permissions) */
  ["chats_update_column"]: chats_update_column;
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** mutation root */
  ["mutation_root"]: AliasType<{
    insert_chats?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["chats_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["chats_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["chats_mutation_response"]
    ];
    insert_chats_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["chats_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["chats_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["chats"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    chats?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chats_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["chats_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["chats_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["chats"]
    ];
    chats_by_pk?: [{ id: number }, ResolverInputTypes["chats"]];
    __typename?: boolean | `@${string}`;
  }>;
  ["subscription_root"]: AliasType<{
    chats?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chats_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["chats_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["chats_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["chats"]
    ];
    chats_by_pk?: [{ id: number }, ResolverInputTypes["chats"]];
    chats_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["chats_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["chats_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["chats"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["timestamptz"]: unknown;
  /** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
  ["timestamptz_comparison_exp"]: {
    _eq?: ResolverInputTypes["timestamptz"] | undefined | null;
    _gt?: ResolverInputTypes["timestamptz"] | undefined | null;
    _gte?: ResolverInputTypes["timestamptz"] | undefined | null;
    _in?: Array<ResolverInputTypes["timestamptz"]> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: ResolverInputTypes["timestamptz"] | undefined | null;
    _lte?: ResolverInputTypes["timestamptz"] | undefined | null;
    _neq?: ResolverInputTypes["timestamptz"] | undefined | null;
    _nin?: Array<ResolverInputTypes["timestamptz"]> | undefined | null;
  };
};

export type ModelTypes = {
  /** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
  ["Int_comparison_exp"]: {
    _eq?: number | undefined;
    _gt?: number | undefined;
    _gte?: number | undefined;
    _in?: Array<number> | undefined;
    _is_null?: boolean | undefined;
    _lt?: number | undefined;
    _lte?: number | undefined;
    _neq?: number | undefined;
    _nin?: Array<number> | undefined;
  };
  /** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
  ["String_comparison_exp"]: {
    _eq?: string | undefined;
    _gt?: string | undefined;
    _gte?: string | undefined;
    /** does the column match the given case-insensitive pattern */
    _ilike?: string | undefined;
    _in?: Array<string> | undefined;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: string | undefined;
    _is_null?: boolean | undefined;
    /** does the column match the given pattern */
    _like?: string | undefined;
    _lt?: string | undefined;
    _lte?: string | undefined;
    _neq?: string | undefined;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: string | undefined;
    _nin?: Array<string> | undefined;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: string | undefined;
    /** does the column NOT match the given pattern */
    _nlike?: string | undefined;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: string | undefined;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: string | undefined;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: string | undefined;
    /** does the column match the given SQL regular expression */
    _similar?: string | undefined;
  };
  /** columns and relationships of "chats" */
  ["chats"]: {
    client_generated_uuid: string;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id: number;
    message: string;
    room?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
  };
  /** Boolean expression to filter rows from the table "chats". All fields are combined with a logical 'AND'. */
  ["chats_bool_exp"]: {
    _and?: Array<ModelTypes["chats_bool_exp"]> | undefined;
    _not?: ModelTypes["chats_bool_exp"] | undefined;
    _or?: Array<ModelTypes["chats_bool_exp"]> | undefined;
    client_generated_uuid?: ModelTypes["String_comparison_exp"] | undefined;
    created_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    message?: ModelTypes["String_comparison_exp"] | undefined;
    room?: ModelTypes["String_comparison_exp"] | undefined;
    username?: ModelTypes["String_comparison_exp"] | undefined;
    uuid?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["chats_constraint"]: chats_constraint;
  /** input type for inserting data into table "chats" */
  ["chats_insert_input"]: {
    client_generated_uuid?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: number | undefined;
    message?: string | undefined;
    room?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
  };
  /** response of any mutation on the table "chats" */
  ["chats_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["chats"]>;
  };
  /** on_conflict condition type for table "chats" */
  ["chats_on_conflict"]: {
    constraint: ModelTypes["chats_constraint"];
    update_columns: Array<ModelTypes["chats_update_column"]>;
    where?: ModelTypes["chats_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "chats". */
  ["chats_order_by"]: {
    client_generated_uuid?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    message?: ModelTypes["order_by"] | undefined;
    room?: ModelTypes["order_by"] | undefined;
    username?: ModelTypes["order_by"] | undefined;
    uuid?: ModelTypes["order_by"] | undefined;
  };
  ["chats_select_column"]: chats_select_column;
  /** Streaming cursor of the table "chats" */
  ["chats_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["chats_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["chats_stream_cursor_value_input"]: {
    client_generated_uuid?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: number | undefined;
    message?: string | undefined;
    room?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
  };
  ["chats_update_column"]: chats_update_column;
  ["cursor_ordering"]: cursor_ordering;
  /** mutation root */
  ["mutation_root"]: {
    /** insert data into the table: "chats" */
    insert_chats?: ModelTypes["chats_mutation_response"] | undefined;
    /** insert a single row into the table: "chats" */
    insert_chats_one?: ModelTypes["chats"] | undefined;
  };
  ["order_by"]: order_by;
  ["query_root"]: {
    /** fetch data from the table: "chats" */
    chats: Array<ModelTypes["chats"]>;
    /** fetch data from the table: "chats" using primary key columns */
    chats_by_pk?: ModelTypes["chats"] | undefined;
  };
  ["subscription_root"]: {
    /** fetch data from the table: "chats" */
    chats: Array<ModelTypes["chats"]>;
    /** fetch data from the table: "chats" using primary key columns */
    chats_by_pk?: ModelTypes["chats"] | undefined;
    /** fetch data from the table in a streaming manner : "chats" */
    chats_stream: Array<ModelTypes["chats"]>;
  };
  ["timestamptz"]: any;
  /** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
  ["timestamptz_comparison_exp"]: {
    _eq?: ModelTypes["timestamptz"] | undefined;
    _gt?: ModelTypes["timestamptz"] | undefined;
    _gte?: ModelTypes["timestamptz"] | undefined;
    _in?: Array<ModelTypes["timestamptz"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: ModelTypes["timestamptz"] | undefined;
    _lte?: ModelTypes["timestamptz"] | undefined;
    _neq?: ModelTypes["timestamptz"] | undefined;
    _nin?: Array<ModelTypes["timestamptz"]> | undefined;
  };
};

export type GraphQLTypes = {
  /** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
  ["Int_comparison_exp"]: {
    _eq?: number | undefined;
    _gt?: number | undefined;
    _gte?: number | undefined;
    _in?: Array<number> | undefined;
    _is_null?: boolean | undefined;
    _lt?: number | undefined;
    _lte?: number | undefined;
    _neq?: number | undefined;
    _nin?: Array<number> | undefined;
  };
  /** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
  ["String_comparison_exp"]: {
    _eq?: string | undefined;
    _gt?: string | undefined;
    _gte?: string | undefined;
    /** does the column match the given case-insensitive pattern */
    _ilike?: string | undefined;
    _in?: Array<string> | undefined;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: string | undefined;
    _is_null?: boolean | undefined;
    /** does the column match the given pattern */
    _like?: string | undefined;
    _lt?: string | undefined;
    _lte?: string | undefined;
    _neq?: string | undefined;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: string | undefined;
    _nin?: Array<string> | undefined;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: string | undefined;
    /** does the column NOT match the given pattern */
    _nlike?: string | undefined;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: string | undefined;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: string | undefined;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: string | undefined;
    /** does the column match the given SQL regular expression */
    _similar?: string | undefined;
  };
  /** columns and relationships of "chats" */
  ["chats"]: {
    __typename: "chats";
    client_generated_uuid: string;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id: number;
    message: string;
    room?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
  };
  /** Boolean expression to filter rows from the table "chats". All fields are combined with a logical 'AND'. */
  ["chats_bool_exp"]: {
    _and?: Array<GraphQLTypes["chats_bool_exp"]> | undefined;
    _not?: GraphQLTypes["chats_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["chats_bool_exp"]> | undefined;
    client_generated_uuid?: GraphQLTypes["String_comparison_exp"] | undefined;
    created_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    message?: GraphQLTypes["String_comparison_exp"] | undefined;
    room?: GraphQLTypes["String_comparison_exp"] | undefined;
    username?: GraphQLTypes["String_comparison_exp"] | undefined;
    uuid?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "chats" */
  ["chats_constraint"]: chats_constraint;
  /** input type for inserting data into table "chats" */
  ["chats_insert_input"]: {
    client_generated_uuid?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: number | undefined;
    message?: string | undefined;
    room?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
  };
  /** response of any mutation on the table "chats" */
  ["chats_mutation_response"]: {
    __typename: "chats_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["chats"]>;
  };
  /** on_conflict condition type for table "chats" */
  ["chats_on_conflict"]: {
    constraint: GraphQLTypes["chats_constraint"];
    update_columns: Array<GraphQLTypes["chats_update_column"]>;
    where?: GraphQLTypes["chats_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "chats". */
  ["chats_order_by"]: {
    client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    message?: GraphQLTypes["order_by"] | undefined;
    room?: GraphQLTypes["order_by"] | undefined;
    username?: GraphQLTypes["order_by"] | undefined;
    uuid?: GraphQLTypes["order_by"] | undefined;
  };
  /** select columns of table "chats" */
  ["chats_select_column"]: chats_select_column;
  /** Streaming cursor of the table "chats" */
  ["chats_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["chats_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["chats_stream_cursor_value_input"]: {
    client_generated_uuid?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: number | undefined;
    message?: string | undefined;
    room?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
  };
  /** placeholder for update columns of table "chats" (current role has no relevant permissions) */
  ["chats_update_column"]: chats_update_column;
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** mutation root */
  ["mutation_root"]: {
    __typename: "mutation_root";
    /** insert data into the table: "chats" */
    insert_chats?: GraphQLTypes["chats_mutation_response"] | undefined;
    /** insert a single row into the table: "chats" */
    insert_chats_one?: GraphQLTypes["chats"] | undefined;
  };
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: {
    __typename: "query_root";
    /** fetch data from the table: "chats" */
    chats: Array<GraphQLTypes["chats"]>;
    /** fetch data from the table: "chats" using primary key columns */
    chats_by_pk?: GraphQLTypes["chats"] | undefined;
  };
  ["subscription_root"]: {
    __typename: "subscription_root";
    /** fetch data from the table: "chats" */
    chats: Array<GraphQLTypes["chats"]>;
    /** fetch data from the table: "chats" using primary key columns */
    chats_by_pk?: GraphQLTypes["chats"] | undefined;
    /** fetch data from the table in a streaming manner : "chats" */
    chats_stream: Array<GraphQLTypes["chats"]>;
  };
  ["timestamptz"]: "scalar" & { name: "timestamptz" };
  /** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
  ["timestamptz_comparison_exp"]: {
    _eq?: GraphQLTypes["timestamptz"] | undefined;
    _gt?: GraphQLTypes["timestamptz"] | undefined;
    _gte?: GraphQLTypes["timestamptz"] | undefined;
    _in?: Array<GraphQLTypes["timestamptz"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: GraphQLTypes["timestamptz"] | undefined;
    _lte?: GraphQLTypes["timestamptz"] | undefined;
    _neq?: GraphQLTypes["timestamptz"] | undefined;
    _nin?: Array<GraphQLTypes["timestamptz"]> | undefined;
  };
};
/** unique or primary key constraints on table "chats" */
export const enum chats_constraint {
  chats_pkey = "chats_pkey",
}
/** select columns of table "chats" */
export const enum chats_select_column {
  client_generated_uuid = "client_generated_uuid",
  created_at = "created_at",
  id = "id",
  message = "message",
  room = "room",
  username = "username",
  uuid = "uuid",
}
/** placeholder for update columns of table "chats" (current role has no relevant permissions) */
export const enum chats_update_column {
  _PLACEHOLDER = "_PLACEHOLDER",
}
/** ordering argument of a cursor */
export const enum cursor_ordering {
  ASC = "ASC",
  DESC = "DESC",
}
/** column ordering options */
export const enum order_by {
  asc = "asc",
  asc_nulls_first = "asc_nulls_first",
  asc_nulls_last = "asc_nulls_last",
  desc = "desc",
  desc_nulls_first = "desc_nulls_first",
  desc_nulls_last = "desc_nulls_last",
}

type ZEUS_VARIABLES = {
  ["Int_comparison_exp"]: ValueTypes["Int_comparison_exp"];
  ["String_comparison_exp"]: ValueTypes["String_comparison_exp"];
  ["chats_bool_exp"]: ValueTypes["chats_bool_exp"];
  ["chats_constraint"]: ValueTypes["chats_constraint"];
  ["chats_insert_input"]: ValueTypes["chats_insert_input"];
  ["chats_on_conflict"]: ValueTypes["chats_on_conflict"];
  ["chats_order_by"]: ValueTypes["chats_order_by"];
  ["chats_select_column"]: ValueTypes["chats_select_column"];
  ["chats_stream_cursor_input"]: ValueTypes["chats_stream_cursor_input"];
  ["chats_stream_cursor_value_input"]: ValueTypes["chats_stream_cursor_value_input"];
  ["chats_update_column"]: ValueTypes["chats_update_column"];
  ["cursor_ordering"]: ValueTypes["cursor_ordering"];
  ["order_by"]: ValueTypes["order_by"];
  ["timestamptz"]: ValueTypes["timestamptz"];
  ["timestamptz_comparison_exp"]: ValueTypes["timestamptz_comparison_exp"];
};
