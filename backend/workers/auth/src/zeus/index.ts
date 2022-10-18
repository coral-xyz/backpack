/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from "./const";
export const HOST = "http://localhost:8112/v1/graphql";

export const HEADERS = {};
export const apiSubscription = (options: chainOptions) => (query: string) => {
  try {
    const queryString = options[0] + "?query=" + encodeURIComponent(query);
    const wsString = queryString.replace("http", "ws");
    const host = (options.length > 1 && options[1]?.websocket?.[0]) || wsString;
    const webSocketOptions = options[1]?.websocket || [host];
    const ws = new WebSocket(...webSocketOptions);
    return {
      ws,
      on: (e: (args: any) => void) => {
        ws.onmessage = (event: any) => {
          if (event.data) {
            const parsed = JSON.parse(event.data);
            const data = parsed.data;
            return e(data);
          }
        };
      },
      off: (e: (args: any) => void) => {
        ws.onclose = e;
      },
      error: (e: (args: any) => void) => {
        ws.onerror = e;
      },
      open: (e: () => void) => {
        ws.onopen = e;
      },
    };
  } catch {
    throw new Error("No websockets implemented");
  }
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
  citext?: ScalarResolver;
  jsonb?: ScalarResolver;
  timestamptz?: ScalarResolver;
  uuid?: ScalarResolver;
};
type ZEUS_UNIONS = never;

export type ValueTypes = {
  /** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
  ["Boolean_comparison_exp"]: {
    _eq?: boolean | undefined | null | Variable<any, string>;
    _gt?: boolean | undefined | null | Variable<any, string>;
    _gte?: boolean | undefined | null | Variable<any, string>;
    _in?: Array<boolean> | undefined | null | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: boolean | undefined | null | Variable<any, string>;
    _lte?: boolean | undefined | null | Variable<any, string>;
    _neq?: boolean | undefined | null | Variable<any, string>;
    _nin?: Array<boolean> | undefined | null | Variable<any, string>;
  };
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
  /** ids are beta invite codes */
  ["auth_invitations"]: AliasType<{
    created_at?: boolean | `@${string}`;
    data?: [
      {
        /** JSON select path */
        path?: string | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`
    ];
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "auth.invitations" */
  ["auth_invitations_aggregate"]: AliasType<{
    aggregate?: ValueTypes["auth_invitations_aggregate_fields"];
    nodes?: ValueTypes["auth_invitations"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "auth.invitations" */
  ["auth_invitations_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["auth_invitations_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`
    ];
    max?: ValueTypes["auth_invitations_max_fields"];
    min?: ValueTypes["auth_invitations_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** append existing jsonb value of filtered columns with new jsonb value */
  ["auth_invitations_append_input"]: {
    data?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "auth.invitations". All fields are combined with a logical 'AND'. */
  ["auth_invitations_bool_exp"]: {
    _and?:
      | Array<ValueTypes["auth_invitations_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["auth_invitations_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["auth_invitations_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    data?:
      | ValueTypes["jsonb_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "auth.invitations" */
  ["auth_invitations_constraint"]: auth_invitations_constraint;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  ["auth_invitations_delete_at_path_input"]: {
    data?: Array<string> | undefined | null | Variable<any, string>;
  };
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  ["auth_invitations_delete_elem_input"]: {
    data?: number | undefined | null | Variable<any, string>;
  };
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  ["auth_invitations_delete_key_input"]: {
    data?: string | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "auth.invitations" */
  ["auth_invitations_insert_input"]: {
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    data?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["auth_invitations_max_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["auth_invitations_min_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "auth.invitations" */
  ["auth_invitations_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_invitations"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "auth.invitations" */
  ["auth_invitations_obj_rel_insert_input"]: {
    data: ValueTypes["auth_invitations_insert_input"] | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["auth_invitations_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** on_conflict condition type for table "auth.invitations" */
  ["auth_invitations_on_conflict"]: {
    constraint:
      | ValueTypes["auth_invitations_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["auth_invitations_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["auth_invitations_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "auth.invitations". */
  ["auth_invitations_order_by"]: {
    created_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    data?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: auth_invitations */
  ["auth_invitations_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  ["auth_invitations_prepend_input"]: {
    data?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
  };
  /** select columns of table "auth.invitations" */
  ["auth_invitations_select_column"]: auth_invitations_select_column;
  /** input type for updating data in table "auth.invitations" */
  ["auth_invitations_set_input"]: {
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    data?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "auth_invitations" */
  ["auth_invitations_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["auth_invitations_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_invitations_stream_cursor_value_input"]: {
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    data?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
  };
  /** update columns of table "auth.invitations" */
  ["auth_invitations_update_column"]: auth_invitations_update_column;
  ["auth_invitations_updates"]: {
    /** append existing jsonb value of filtered columns with new jsonb value */
    _append?:
      | ValueTypes["auth_invitations_append_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
    _delete_at_path?:
      | ValueTypes["auth_invitations_delete_at_path_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
    _delete_elem?:
      | ValueTypes["auth_invitations_delete_elem_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** delete key/value pair or string element. key/value pairs are matched based on their key value */
    _delete_key?:
      | ValueTypes["auth_invitations_delete_key_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** prepend existing jsonb value of filtered columns with new jsonb value */
    _prepend?:
      | ValueTypes["auth_invitations_prepend_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["auth_invitations_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    where: ValueTypes["auth_invitations_bool_exp"] | Variable<any, string>;
  };
  /** columns and relationships of "auth.users" */
  ["auth_users"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    invitation_id?: boolean | `@${string}`;
    last_active_at?: boolean | `@${string}`;
    pubkey?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    waitlist_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "auth.users" */
  ["auth_users_aggregate"]: AliasType<{
    aggregate?: ValueTypes["auth_users_aggregate_fields"];
    nodes?: ValueTypes["auth_users"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "auth.users" */
  ["auth_users_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["auth_users_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`
    ];
    max?: ValueTypes["auth_users_max_fields"];
    min?: ValueTypes["auth_users_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.users". All fields are combined with a logical 'AND'. */
  ["auth_users_bool_exp"]: {
    _and?:
      | Array<ValueTypes["auth_users_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["auth_users_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["auth_users_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    blockchain?:
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
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    invitation_id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    last_active_at?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    pubkey?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    username?:
      | ValueTypes["citext_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    waitlist_id?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "auth.users" */
  ["auth_users_constraint"]: auth_users_constraint;
  /** input type for inserting data into table "auth.users" */
  ["auth_users_insert_input"]: {
    blockchain?: string | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    invitation_id?:
      | ValueTypes["uuid"]
      | undefined
      | null
      | Variable<any, string>;
    last_active_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    pubkey?: string | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    username?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    waitlist_id?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["auth_users_max_fields"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    invitation_id?: boolean | `@${string}`;
    last_active_at?: boolean | `@${string}`;
    pubkey?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    waitlist_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["auth_users_min_fields"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    invitation_id?: boolean | `@${string}`;
    last_active_at?: boolean | `@${string}`;
    pubkey?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    waitlist_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "auth.users" */
  ["auth_users_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_users"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.users" */
  ["auth_users_on_conflict"]: {
    constraint: ValueTypes["auth_users_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["auth_users_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["auth_users_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "auth.users". */
  ["auth_users_order_by"]: {
    blockchain?:
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
    invitation_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    last_active_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    pubkey?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    username?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    waitlist_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: auth_users */
  ["auth_users_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "auth.users" */
  ["auth_users_select_column"]: auth_users_select_column;
  /** input type for updating data in table "auth.users" */
  ["auth_users_set_input"]: {
    blockchain?: string | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    invitation_id?:
      | ValueTypes["uuid"]
      | undefined
      | null
      | Variable<any, string>;
    last_active_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    pubkey?: string | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    username?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    waitlist_id?: string | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "auth_users" */
  ["auth_users_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["auth_users_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_users_stream_cursor_value_input"]: {
    blockchain?: string | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    invitation_id?:
      | ValueTypes["uuid"]
      | undefined
      | null
      | Variable<any, string>;
    last_active_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    pubkey?: string | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    username?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    waitlist_id?: string | undefined | null | Variable<any, string>;
  };
  /** update columns of table "auth.users" */
  ["auth_users_update_column"]: auth_users_update_column;
  ["auth_users_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["auth_users_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    where: ValueTypes["auth_users_bool_exp"] | Variable<any, string>;
  };
  ["citext"]: unknown;
  /** Boolean expression to compare columns of type "citext". All fields are combined with logical 'AND'. */
  ["citext_comparison_exp"]: {
    _eq?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    _gt?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    _gte?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    /** does the column match the given case-insensitive pattern */
    _ilike?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    _in?:
      | Array<ValueTypes["citext"]>
      | undefined
      | null
      | Variable<any, string>;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    /** does the column match the given pattern */
    _like?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    _lt?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    _lte?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    _neq?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    _nin?:
      | Array<ValueTypes["citext"]>
      | undefined
      | null
      | Variable<any, string>;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    /** does the column NOT match the given pattern */
    _nlike?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    /** does the column match the given SQL regular expression */
    _similar?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
  };
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** columns and relationships of "images" */
  ["images"]: AliasType<{
    completed?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    /** An object relationship */
    invitation?: ValueTypes["auth_invitations"];
    invite_code?: boolean | `@${string}`;
    prompt?: boolean | `@${string}`;
    uri?: boolean | `@${string}`;
    winner?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "images" */
  ["images_aggregate"]: AliasType<{
    aggregate?: ValueTypes["images_aggregate_fields"];
    nodes?: ValueTypes["images"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "images" */
  ["images_aggregate_fields"]: AliasType<{
    avg?: ValueTypes["images_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ValueTypes["images_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`
    ];
    max?: ValueTypes["images_max_fields"];
    min?: ValueTypes["images_min_fields"];
    stddev?: ValueTypes["images_stddev_fields"];
    stddev_pop?: ValueTypes["images_stddev_pop_fields"];
    stddev_samp?: ValueTypes["images_stddev_samp_fields"];
    sum?: ValueTypes["images_sum_fields"];
    var_pop?: ValueTypes["images_var_pop_fields"];
    var_samp?: ValueTypes["images_var_samp_fields"];
    variance?: ValueTypes["images_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate avg on columns */
  ["images_avg_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "images". All fields are combined with a logical 'AND'. */
  ["images_bool_exp"]: {
    _and?:
      | Array<ValueTypes["images_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["images_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["images_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    completed?:
      | ValueTypes["Boolean_comparison_exp"]
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
    invitation?:
      | ValueTypes["auth_invitations_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    invite_code?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    prompt?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    uri?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    winner?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "images" */
  ["images_constraint"]: images_constraint;
  /** input type for incrementing numeric columns in table "images" */
  ["images_inc_input"]: {
    id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "images" */
  ["images_insert_input"]: {
    completed?: boolean | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    invitation?:
      | ValueTypes["auth_invitations_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    invite_code?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    prompt?: string | undefined | null | Variable<any, string>;
    uri?: string | undefined | null | Variable<any, string>;
    winner?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["images_max_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    invite_code?: boolean | `@${string}`;
    prompt?: boolean | `@${string}`;
    uri?: boolean | `@${string}`;
    winner?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["images_min_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    invite_code?: boolean | `@${string}`;
    prompt?: boolean | `@${string}`;
    uri?: boolean | `@${string}`;
    winner?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "images" */
  ["images_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["images"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "images" */
  ["images_on_conflict"]: {
    constraint: ValueTypes["images_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["images_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["images_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "images". */
  ["images_order_by"]: {
    completed?:
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
    invitation?:
      | ValueTypes["auth_invitations_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    invite_code?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    prompt?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    uri?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    winner?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: images */
  ["images_pk_columns_input"]: {
    id: number | Variable<any, string>;
  };
  /** select columns of table "images" */
  ["images_select_column"]: images_select_column;
  /** input type for updating data in table "images" */
  ["images_set_input"]: {
    completed?: boolean | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    invite_code?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    prompt?: string | undefined | null | Variable<any, string>;
    uri?: string | undefined | null | Variable<any, string>;
    winner?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate stddev on columns */
  ["images_stddev_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_pop on columns */
  ["images_stddev_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_samp on columns */
  ["images_stddev_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Streaming cursor of the table "images" */
  ["images_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["images_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["images_stream_cursor_value_input"]: {
    completed?: boolean | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    invite_code?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    prompt?: string | undefined | null | Variable<any, string>;
    uri?: string | undefined | null | Variable<any, string>;
    winner?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate sum on columns */
  ["images_sum_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** update columns of table "images" */
  ["images_update_column"]: images_update_column;
  ["images_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["images_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["images_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    where: ValueTypes["images_bool_exp"] | Variable<any, string>;
  };
  /** aggregate var_pop on columns */
  ["images_var_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate var_samp on columns */
  ["images_var_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate variance on columns */
  ["images_variance_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** columns and relationships of "invitations" */
  ["invitations"]: AliasType<{
    claimed_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "invitations" */
  ["invitations_aggregate"]: AliasType<{
    aggregate?: ValueTypes["invitations_aggregate_fields"];
    nodes?: ValueTypes["invitations"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "invitations" */
  ["invitations_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["invitations_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`
    ];
    max?: ValueTypes["invitations_max_fields"];
    min?: ValueTypes["invitations_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "invitations". All fields are combined with a logical 'AND'. */
  ["invitations_bool_exp"]: {
    _and?:
      | Array<ValueTypes["invitations_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["invitations_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["invitations_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    claimed_at?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["invitations_max_fields"]: AliasType<{
    claimed_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["invitations_min_fields"]: AliasType<{
    claimed_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Ordering options when selecting data from "invitations". */
  ["invitations_order_by"]: {
    claimed_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** select columns of table "invitations" */
  ["invitations_select_column"]: invitations_select_column;
  /** Streaming cursor of the table "invitations" */
  ["invitations_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["invitations_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["invitations_stream_cursor_value_input"]: {
    claimed_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
  };
  ["jsonb"]: unknown;
  ["jsonb_cast_exp"]: {
    String?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
  ["jsonb_comparison_exp"]: {
    _cast?:
      | ValueTypes["jsonb_cast_exp"]
      | undefined
      | null
      | Variable<any, string>;
    /** is the column contained in the given json value */
    _contained_in?:
      | ValueTypes["jsonb"]
      | undefined
      | null
      | Variable<any, string>;
    /** does the column contain the given json value at the top level */
    _contains?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    _eq?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    _gt?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    _gte?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    /** does the string exist as a top-level key in the column */
    _has_key?: string | undefined | null | Variable<any, string>;
    /** do all of these strings exist as top-level keys in the column */
    _has_keys_all?: Array<string> | undefined | null | Variable<any, string>;
    /** do any of these strings exist as top-level keys in the column */
    _has_keys_any?: Array<string> | undefined | null | Variable<any, string>;
    _in?: Array<ValueTypes["jsonb"]> | undefined | null | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    _lte?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    _neq?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    _nin?:
      | Array<ValueTypes["jsonb"]>
      | undefined
      | null
      | Variable<any, string>;
  };
  /** mutation root */
  ["mutation_root"]: AliasType<{
    delete_auth_invitations?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["auth_invitations_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["auth_invitations_mutation_response"]
    ];
    delete_auth_invitations_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["auth_invitations"]
    ];
    delete_auth_users?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["auth_users_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["auth_users_mutation_response"]
    ];
    delete_auth_users_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["auth_users"]
    ];
    delete_images?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["images_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["images_mutation_response"]
    ];
    delete_images_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["images"]
    ];
    insert_auth_invitations?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["auth_invitations_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_invitations_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_invitations_mutation_response"]
    ];
    insert_auth_invitations_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["auth_invitations_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_invitations_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_invitations"]
    ];
    insert_auth_users?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["auth_users_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_users_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_users_mutation_response"]
    ];
    insert_auth_users_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["auth_users_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_users_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_users"]
    ];
    insert_images?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["images_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["images_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["images_mutation_response"]
    ];
    insert_images_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["images_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["images_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["images"]
    ];
    update_auth_invitations?: [
      {
        /** append existing jsonb value of filtered columns with new jsonb value */
        _append?:
          | ValueTypes["auth_invitations_append_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */;
        _delete_at_path?:
          | ValueTypes["auth_invitations_delete_at_path_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */;
        _delete_elem?:
          | ValueTypes["auth_invitations_delete_elem_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** delete key/value pair or string element. key/value pairs are matched based on their key value */;
        _delete_key?:
          | ValueTypes["auth_invitations_delete_key_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** prepend existing jsonb value of filtered columns with new jsonb value */;
        _prepend?:
          | ValueTypes["auth_invitations_prepend_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_invitations_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["auth_invitations_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["auth_invitations_mutation_response"]
    ];
    update_auth_invitations_by_pk?: [
      {
        /** append existing jsonb value of filtered columns with new jsonb value */
        _append?:
          | ValueTypes["auth_invitations_append_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */;
        _delete_at_path?:
          | ValueTypes["auth_invitations_delete_at_path_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */;
        _delete_elem?:
          | ValueTypes["auth_invitations_delete_elem_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** delete key/value pair or string element. key/value pairs are matched based on their key value */;
        _delete_key?:
          | ValueTypes["auth_invitations_delete_key_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** prepend existing jsonb value of filtered columns with new jsonb value */;
        _prepend?:
          | ValueTypes["auth_invitations_prepend_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_invitations_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["auth_invitations_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["auth_invitations"]
    ];
    update_auth_invitations_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["auth_invitations_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["auth_invitations_mutation_response"]
    ];
    update_auth_users?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["auth_users_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["auth_users_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["auth_users_mutation_response"]
    ];
    update_auth_users_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["auth_users_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["auth_users_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["auth_users"]
    ];
    update_auth_users_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["auth_users_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["auth_users_mutation_response"]
    ];
    update_images?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["images_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["images_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["images_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["images_mutation_response"]
    ];
    update_images_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["images_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["images_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["images_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["images"]
    ];
    update_images_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["images_updates"]> | Variable<any, string>;
      },
      ValueTypes["images_mutation_response"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    auth_invitations?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_invitations_select_column"]>
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
          | Array<ValueTypes["auth_invitations_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_invitations_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_invitations"]
    ];
    auth_invitations_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_invitations_select_column"]>
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
          | Array<ValueTypes["auth_invitations_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_invitations_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_invitations_aggregate"]
    ];
    auth_invitations_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["auth_invitations"]
    ];
    auth_users?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_users_select_column"]>
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
          | Array<ValueTypes["auth_users_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_users_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_users"]
    ];
    auth_users_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_users_select_column"]>
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
          | Array<ValueTypes["auth_users_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_users_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_users_aggregate"]
    ];
    auth_users_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["auth_users"]
    ];
    images?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["images_select_column"]>
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
          | Array<ValueTypes["images_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["images_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["images"]
    ];
    images_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["images_select_column"]>
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
          | Array<ValueTypes["images_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["images_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["images_aggregate"]
    ];
    images_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["images"]
    ];
    invitations?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["invitations_select_column"]>
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
          | Array<ValueTypes["invitations_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["invitations_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["invitations"]
    ];
    invitations_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["invitations_select_column"]>
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
          | Array<ValueTypes["invitations_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["invitations_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["invitations_aggregate"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["subscription_root"]: AliasType<{
    auth_invitations?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_invitations_select_column"]>
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
          | Array<ValueTypes["auth_invitations_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_invitations_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_invitations"]
    ];
    auth_invitations_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_invitations_select_column"]>
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
          | Array<ValueTypes["auth_invitations_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_invitations_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_invitations_aggregate"]
    ];
    auth_invitations_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["auth_invitations"]
    ];
    auth_invitations_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<
              | ValueTypes["auth_invitations_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_invitations_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_invitations"]
    ];
    auth_users?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_users_select_column"]>
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
          | Array<ValueTypes["auth_users_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_users_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_users"]
    ];
    auth_users_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_users_select_column"]>
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
          | Array<ValueTypes["auth_users_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_users_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_users_aggregate"]
    ];
    auth_users_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["auth_users"]
    ];
    auth_users_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<
              ValueTypes["auth_users_stream_cursor_input"] | undefined | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_users_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_users"]
    ];
    images?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["images_select_column"]>
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
          | Array<ValueTypes["images_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["images_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["images"]
    ];
    images_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["images_select_column"]>
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
          | Array<ValueTypes["images_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["images_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["images_aggregate"]
    ];
    images_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["images"]
    ];
    images_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["images_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["images_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["images"]
    ];
    invitations?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["invitations_select_column"]>
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
          | Array<ValueTypes["invitations_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["invitations_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["invitations"]
    ];
    invitations_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["invitations_select_column"]>
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
          | Array<ValueTypes["invitations_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["invitations_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["invitations_aggregate"]
    ];
    invitations_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<
              ValueTypes["invitations_stream_cursor_input"] | undefined | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["invitations_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["invitations"]
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
  ["uuid"]: unknown;
  /** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
  ["uuid_comparison_exp"]: {
    _eq?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _gt?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _gte?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _in?: Array<ValueTypes["uuid"]> | undefined | null | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _lte?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _neq?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _nin?: Array<ValueTypes["uuid"]> | undefined | null | Variable<any, string>;
  };
};

export type ResolverInputTypes = {
  /** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
  ["Boolean_comparison_exp"]: {
    _eq?: boolean | undefined | null;
    _gt?: boolean | undefined | null;
    _gte?: boolean | undefined | null;
    _in?: Array<boolean> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: boolean | undefined | null;
    _lte?: boolean | undefined | null;
    _neq?: boolean | undefined | null;
    _nin?: Array<boolean> | undefined | null;
  };
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
  /** ids are beta invite codes */
  ["auth_invitations"]: AliasType<{
    created_at?: boolean | `@${string}`;
    data?: [
      {
        /** JSON select path */ path?: string | undefined | null;
      },
      boolean | `@${string}`
    ];
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "auth.invitations" */
  ["auth_invitations_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["auth_invitations_aggregate_fields"];
    nodes?: ResolverInputTypes["auth_invitations"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "auth.invitations" */
  ["auth_invitations_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["auth_invitations_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`
    ];
    max?: ResolverInputTypes["auth_invitations_max_fields"];
    min?: ResolverInputTypes["auth_invitations_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** append existing jsonb value of filtered columns with new jsonb value */
  ["auth_invitations_append_input"]: {
    data?: ResolverInputTypes["jsonb"] | undefined | null;
  };
  /** Boolean expression to filter rows from the table "auth.invitations". All fields are combined with a logical 'AND'. */
  ["auth_invitations_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["auth_invitations_bool_exp"]>
      | undefined
      | null;
    _not?: ResolverInputTypes["auth_invitations_bool_exp"] | undefined | null;
    _or?:
      | Array<ResolverInputTypes["auth_invitations_bool_exp"]>
      | undefined
      | null;
    created_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    data?: ResolverInputTypes["jsonb_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "auth.invitations" */
  ["auth_invitations_constraint"]: auth_invitations_constraint;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  ["auth_invitations_delete_at_path_input"]: {
    data?: Array<string> | undefined | null;
  };
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  ["auth_invitations_delete_elem_input"]: {
    data?: number | undefined | null;
  };
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  ["auth_invitations_delete_key_input"]: {
    data?: string | undefined | null;
  };
  /** input type for inserting data into table "auth.invitations" */
  ["auth_invitations_insert_input"]: {
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    data?: ResolverInputTypes["jsonb"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
  };
  /** aggregate max on columns */
  ["auth_invitations_max_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["auth_invitations_min_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "auth.invitations" */
  ["auth_invitations_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_invitations"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "auth.invitations" */
  ["auth_invitations_obj_rel_insert_input"]: {
    data: ResolverInputTypes["auth_invitations_insert_input"];
    /** upsert condition */
    on_conflict?:
      | ResolverInputTypes["auth_invitations_on_conflict"]
      | undefined
      | null;
  };
  /** on_conflict condition type for table "auth.invitations" */
  ["auth_invitations_on_conflict"]: {
    constraint: ResolverInputTypes["auth_invitations_constraint"];
    update_columns: Array<ResolverInputTypes["auth_invitations_update_column"]>;
    where?: ResolverInputTypes["auth_invitations_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "auth.invitations". */
  ["auth_invitations_order_by"]: {
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    data?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: auth_invitations */
  ["auth_invitations_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  ["auth_invitations_prepend_input"]: {
    data?: ResolverInputTypes["jsonb"] | undefined | null;
  };
  /** select columns of table "auth.invitations" */
  ["auth_invitations_select_column"]: auth_invitations_select_column;
  /** input type for updating data in table "auth.invitations" */
  ["auth_invitations_set_input"]: {
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    data?: ResolverInputTypes["jsonb"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
  };
  /** Streaming cursor of the table "auth_invitations" */
  ["auth_invitations_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["auth_invitations_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_invitations_stream_cursor_value_input"]: {
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    data?: ResolverInputTypes["jsonb"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
  };
  /** update columns of table "auth.invitations" */
  ["auth_invitations_update_column"]: auth_invitations_update_column;
  ["auth_invitations_updates"]: {
    /** append existing jsonb value of filtered columns with new jsonb value */
    _append?:
      | ResolverInputTypes["auth_invitations_append_input"]
      | undefined
      | null;
    /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
    _delete_at_path?:
      | ResolverInputTypes["auth_invitations_delete_at_path_input"]
      | undefined
      | null;
    /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
    _delete_elem?:
      | ResolverInputTypes["auth_invitations_delete_elem_input"]
      | undefined
      | null;
    /** delete key/value pair or string element. key/value pairs are matched based on their key value */
    _delete_key?:
      | ResolverInputTypes["auth_invitations_delete_key_input"]
      | undefined
      | null;
    /** prepend existing jsonb value of filtered columns with new jsonb value */
    _prepend?:
      | ResolverInputTypes["auth_invitations_prepend_input"]
      | undefined
      | null;
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["auth_invitations_set_input"] | undefined | null;
    where: ResolverInputTypes["auth_invitations_bool_exp"];
  };
  /** columns and relationships of "auth.users" */
  ["auth_users"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    invitation_id?: boolean | `@${string}`;
    last_active_at?: boolean | `@${string}`;
    pubkey?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    waitlist_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "auth.users" */
  ["auth_users_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["auth_users_aggregate_fields"];
    nodes?: ResolverInputTypes["auth_users"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "auth.users" */
  ["auth_users_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["auth_users_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`
    ];
    max?: ResolverInputTypes["auth_users_max_fields"];
    min?: ResolverInputTypes["auth_users_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.users". All fields are combined with a logical 'AND'. */
  ["auth_users_bool_exp"]: {
    _and?: Array<ResolverInputTypes["auth_users_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["auth_users_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["auth_users_bool_exp"]> | undefined | null;
    blockchain?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    created_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    invitation_id?:
      | ResolverInputTypes["uuid_comparison_exp"]
      | undefined
      | null;
    last_active_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    pubkey?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    updated_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    username?: ResolverInputTypes["citext_comparison_exp"] | undefined | null;
    waitlist_id?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "auth.users" */
  ["auth_users_constraint"]: auth_users_constraint;
  /** input type for inserting data into table "auth.users" */
  ["auth_users_insert_input"]: {
    blockchain?: string | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    invitation_id?: ResolverInputTypes["uuid"] | undefined | null;
    last_active_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    pubkey?: string | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    username?: ResolverInputTypes["citext"] | undefined | null;
    waitlist_id?: string | undefined | null;
  };
  /** aggregate max on columns */
  ["auth_users_max_fields"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    invitation_id?: boolean | `@${string}`;
    last_active_at?: boolean | `@${string}`;
    pubkey?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    waitlist_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["auth_users_min_fields"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    invitation_id?: boolean | `@${string}`;
    last_active_at?: boolean | `@${string}`;
    pubkey?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    waitlist_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "auth.users" */
  ["auth_users_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_users"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.users" */
  ["auth_users_on_conflict"]: {
    constraint: ResolverInputTypes["auth_users_constraint"];
    update_columns: Array<ResolverInputTypes["auth_users_update_column"]>;
    where?: ResolverInputTypes["auth_users_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "auth.users". */
  ["auth_users_order_by"]: {
    blockchain?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    invitation_id?: ResolverInputTypes["order_by"] | undefined | null;
    last_active_at?: ResolverInputTypes["order_by"] | undefined | null;
    pubkey?: ResolverInputTypes["order_by"] | undefined | null;
    updated_at?: ResolverInputTypes["order_by"] | undefined | null;
    username?: ResolverInputTypes["order_by"] | undefined | null;
    waitlist_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: auth_users */
  ["auth_users_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "auth.users" */
  ["auth_users_select_column"]: auth_users_select_column;
  /** input type for updating data in table "auth.users" */
  ["auth_users_set_input"]: {
    blockchain?: string | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    invitation_id?: ResolverInputTypes["uuid"] | undefined | null;
    last_active_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    pubkey?: string | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    username?: ResolverInputTypes["citext"] | undefined | null;
    waitlist_id?: string | undefined | null;
  };
  /** Streaming cursor of the table "auth_users" */
  ["auth_users_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["auth_users_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_users_stream_cursor_value_input"]: {
    blockchain?: string | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    invitation_id?: ResolverInputTypes["uuid"] | undefined | null;
    last_active_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    pubkey?: string | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    username?: ResolverInputTypes["citext"] | undefined | null;
    waitlist_id?: string | undefined | null;
  };
  /** update columns of table "auth.users" */
  ["auth_users_update_column"]: auth_users_update_column;
  ["auth_users_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["auth_users_set_input"] | undefined | null;
    where: ResolverInputTypes["auth_users_bool_exp"];
  };
  ["citext"]: unknown;
  /** Boolean expression to compare columns of type "citext". All fields are combined with logical 'AND'. */
  ["citext_comparison_exp"]: {
    _eq?: ResolverInputTypes["citext"] | undefined | null;
    _gt?: ResolverInputTypes["citext"] | undefined | null;
    _gte?: ResolverInputTypes["citext"] | undefined | null;
    /** does the column match the given case-insensitive pattern */
    _ilike?: ResolverInputTypes["citext"] | undefined | null;
    _in?: Array<ResolverInputTypes["citext"]> | undefined | null;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: ResolverInputTypes["citext"] | undefined | null;
    _is_null?: boolean | undefined | null;
    /** does the column match the given pattern */
    _like?: ResolverInputTypes["citext"] | undefined | null;
    _lt?: ResolverInputTypes["citext"] | undefined | null;
    _lte?: ResolverInputTypes["citext"] | undefined | null;
    _neq?: ResolverInputTypes["citext"] | undefined | null;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: ResolverInputTypes["citext"] | undefined | null;
    _nin?: Array<ResolverInputTypes["citext"]> | undefined | null;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: ResolverInputTypes["citext"] | undefined | null;
    /** does the column NOT match the given pattern */
    _nlike?: ResolverInputTypes["citext"] | undefined | null;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: ResolverInputTypes["citext"] | undefined | null;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: ResolverInputTypes["citext"] | undefined | null;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: ResolverInputTypes["citext"] | undefined | null;
    /** does the column match the given SQL regular expression */
    _similar?: ResolverInputTypes["citext"] | undefined | null;
  };
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** columns and relationships of "images" */
  ["images"]: AliasType<{
    completed?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    /** An object relationship */
    invitation?: ResolverInputTypes["auth_invitations"];
    invite_code?: boolean | `@${string}`;
    prompt?: boolean | `@${string}`;
    uri?: boolean | `@${string}`;
    winner?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "images" */
  ["images_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["images_aggregate_fields"];
    nodes?: ResolverInputTypes["images"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "images" */
  ["images_aggregate_fields"]: AliasType<{
    avg?: ResolverInputTypes["images_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["images_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`
    ];
    max?: ResolverInputTypes["images_max_fields"];
    min?: ResolverInputTypes["images_min_fields"];
    stddev?: ResolverInputTypes["images_stddev_fields"];
    stddev_pop?: ResolverInputTypes["images_stddev_pop_fields"];
    stddev_samp?: ResolverInputTypes["images_stddev_samp_fields"];
    sum?: ResolverInputTypes["images_sum_fields"];
    var_pop?: ResolverInputTypes["images_var_pop_fields"];
    var_samp?: ResolverInputTypes["images_var_samp_fields"];
    variance?: ResolverInputTypes["images_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate avg on columns */
  ["images_avg_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "images". All fields are combined with a logical 'AND'. */
  ["images_bool_exp"]: {
    _and?: Array<ResolverInputTypes["images_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["images_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["images_bool_exp"]> | undefined | null;
    completed?: ResolverInputTypes["Boolean_comparison_exp"] | undefined | null;
    created_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    invitation?:
      | ResolverInputTypes["auth_invitations_bool_exp"]
      | undefined
      | null;
    invite_code?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    prompt?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    uri?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    winner?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "images" */
  ["images_constraint"]: images_constraint;
  /** input type for incrementing numeric columns in table "images" */
  ["images_inc_input"]: {
    id?: number | undefined | null;
  };
  /** input type for inserting data into table "images" */
  ["images_insert_input"]: {
    completed?: boolean | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: number | undefined | null;
    invitation?:
      | ResolverInputTypes["auth_invitations_obj_rel_insert_input"]
      | undefined
      | null;
    invite_code?: ResolverInputTypes["uuid"] | undefined | null;
    prompt?: string | undefined | null;
    uri?: string | undefined | null;
    winner?: string | undefined | null;
  };
  /** aggregate max on columns */
  ["images_max_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    invite_code?: boolean | `@${string}`;
    prompt?: boolean | `@${string}`;
    uri?: boolean | `@${string}`;
    winner?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["images_min_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    invite_code?: boolean | `@${string}`;
    prompt?: boolean | `@${string}`;
    uri?: boolean | `@${string}`;
    winner?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "images" */
  ["images_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["images"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "images" */
  ["images_on_conflict"]: {
    constraint: ResolverInputTypes["images_constraint"];
    update_columns: Array<ResolverInputTypes["images_update_column"]>;
    where?: ResolverInputTypes["images_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "images". */
  ["images_order_by"]: {
    completed?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    invitation?:
      | ResolverInputTypes["auth_invitations_order_by"]
      | undefined
      | null;
    invite_code?: ResolverInputTypes["order_by"] | undefined | null;
    prompt?: ResolverInputTypes["order_by"] | undefined | null;
    uri?: ResolverInputTypes["order_by"] | undefined | null;
    winner?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: images */
  ["images_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "images" */
  ["images_select_column"]: images_select_column;
  /** input type for updating data in table "images" */
  ["images_set_input"]: {
    completed?: boolean | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: number | undefined | null;
    invite_code?: ResolverInputTypes["uuid"] | undefined | null;
    prompt?: string | undefined | null;
    uri?: string | undefined | null;
    winner?: string | undefined | null;
  };
  /** aggregate stddev on columns */
  ["images_stddev_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_pop on columns */
  ["images_stddev_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_samp on columns */
  ["images_stddev_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Streaming cursor of the table "images" */
  ["images_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["images_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["images_stream_cursor_value_input"]: {
    completed?: boolean | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: number | undefined | null;
    invite_code?: ResolverInputTypes["uuid"] | undefined | null;
    prompt?: string | undefined | null;
    uri?: string | undefined | null;
    winner?: string | undefined | null;
  };
  /** aggregate sum on columns */
  ["images_sum_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** update columns of table "images" */
  ["images_update_column"]: images_update_column;
  ["images_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ResolverInputTypes["images_inc_input"] | undefined | null;
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["images_set_input"] | undefined | null;
    where: ResolverInputTypes["images_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["images_var_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate var_samp on columns */
  ["images_var_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate variance on columns */
  ["images_variance_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** columns and relationships of "invitations" */
  ["invitations"]: AliasType<{
    claimed_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "invitations" */
  ["invitations_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["invitations_aggregate_fields"];
    nodes?: ResolverInputTypes["invitations"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "invitations" */
  ["invitations_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["invitations_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`
    ];
    max?: ResolverInputTypes["invitations_max_fields"];
    min?: ResolverInputTypes["invitations_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "invitations". All fields are combined with a logical 'AND'. */
  ["invitations_bool_exp"]: {
    _and?: Array<ResolverInputTypes["invitations_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["invitations_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["invitations_bool_exp"]> | undefined | null;
    claimed_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
  };
  /** aggregate max on columns */
  ["invitations_max_fields"]: AliasType<{
    claimed_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["invitations_min_fields"]: AliasType<{
    claimed_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Ordering options when selecting data from "invitations". */
  ["invitations_order_by"]: {
    claimed_at?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** select columns of table "invitations" */
  ["invitations_select_column"]: invitations_select_column;
  /** Streaming cursor of the table "invitations" */
  ["invitations_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["invitations_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["invitations_stream_cursor_value_input"]: {
    claimed_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
  };
  ["jsonb"]: unknown;
  ["jsonb_cast_exp"]: {
    String?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
  ["jsonb_comparison_exp"]: {
    _cast?: ResolverInputTypes["jsonb_cast_exp"] | undefined | null;
    /** is the column contained in the given json value */
    _contained_in?: ResolverInputTypes["jsonb"] | undefined | null;
    /** does the column contain the given json value at the top level */
    _contains?: ResolverInputTypes["jsonb"] | undefined | null;
    _eq?: ResolverInputTypes["jsonb"] | undefined | null;
    _gt?: ResolverInputTypes["jsonb"] | undefined | null;
    _gte?: ResolverInputTypes["jsonb"] | undefined | null;
    /** does the string exist as a top-level key in the column */
    _has_key?: string | undefined | null;
    /** do all of these strings exist as top-level keys in the column */
    _has_keys_all?: Array<string> | undefined | null;
    /** do any of these strings exist as top-level keys in the column */
    _has_keys_any?: Array<string> | undefined | null;
    _in?: Array<ResolverInputTypes["jsonb"]> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: ResolverInputTypes["jsonb"] | undefined | null;
    _lte?: ResolverInputTypes["jsonb"] | undefined | null;
    _neq?: ResolverInputTypes["jsonb"] | undefined | null;
    _nin?: Array<ResolverInputTypes["jsonb"]> | undefined | null;
  };
  /** mutation root */
  ["mutation_root"]: AliasType<{
    delete_auth_invitations?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["auth_invitations_bool_exp"];
      },
      ResolverInputTypes["auth_invitations_mutation_response"]
    ];
    delete_auth_invitations_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["auth_invitations"]
    ];
    delete_auth_users?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["auth_users_bool_exp"];
      },
      ResolverInputTypes["auth_users_mutation_response"]
    ];
    delete_auth_users_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["auth_users"]
    ];
    delete_images?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["images_bool_exp"];
      },
      ResolverInputTypes["images_mutation_response"]
    ];
    delete_images_by_pk?: [{ id: number }, ResolverInputTypes["images"]];
    insert_auth_invitations?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["auth_invitations_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_invitations_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_invitations_mutation_response"]
    ];
    insert_auth_invitations_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["auth_invitations_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_invitations_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_invitations"]
    ];
    insert_auth_users?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["auth_users_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_users_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_users_mutation_response"]
    ];
    insert_auth_users_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["auth_users_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_users_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_users"]
    ];
    insert_images?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["images_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["images_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["images_mutation_response"]
    ];
    insert_images_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["images_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["images_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["images"]
    ];
    update_auth_invitations?: [
      {
        /** append existing jsonb value of filtered columns with new jsonb value */
        _append?:
          | ResolverInputTypes["auth_invitations_append_input"]
          | undefined
          | null /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */;
        _delete_at_path?:
          | ResolverInputTypes["auth_invitations_delete_at_path_input"]
          | undefined
          | null /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */;
        _delete_elem?:
          | ResolverInputTypes["auth_invitations_delete_elem_input"]
          | undefined
          | null /** delete key/value pair or string element. key/value pairs are matched based on their key value */;
        _delete_key?:
          | ResolverInputTypes["auth_invitations_delete_key_input"]
          | undefined
          | null /** prepend existing jsonb value of filtered columns with new jsonb value */;
        _prepend?:
          | ResolverInputTypes["auth_invitations_prepend_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_invitations_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["auth_invitations_bool_exp"];
      },
      ResolverInputTypes["auth_invitations_mutation_response"]
    ];
    update_auth_invitations_by_pk?: [
      {
        /** append existing jsonb value of filtered columns with new jsonb value */
        _append?:
          | ResolverInputTypes["auth_invitations_append_input"]
          | undefined
          | null /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */;
        _delete_at_path?:
          | ResolverInputTypes["auth_invitations_delete_at_path_input"]
          | undefined
          | null /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */;
        _delete_elem?:
          | ResolverInputTypes["auth_invitations_delete_elem_input"]
          | undefined
          | null /** delete key/value pair or string element. key/value pairs are matched based on their key value */;
        _delete_key?:
          | ResolverInputTypes["auth_invitations_delete_key_input"]
          | undefined
          | null /** prepend existing jsonb value of filtered columns with new jsonb value */;
        _prepend?:
          | ResolverInputTypes["auth_invitations_prepend_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_invitations_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["auth_invitations_pk_columns_input"];
      },
      ResolverInputTypes["auth_invitations"]
    ];
    update_auth_invitations_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["auth_invitations_updates"]>;
      },
      ResolverInputTypes["auth_invitations_mutation_response"]
    ];
    update_auth_users?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["auth_users_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["auth_users_bool_exp"];
      },
      ResolverInputTypes["auth_users_mutation_response"]
    ];
    update_auth_users_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?: ResolverInputTypes["auth_users_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["auth_users_pk_columns_input"];
      },
      ResolverInputTypes["auth_users"]
    ];
    update_auth_users_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["auth_users_updates"]>;
      },
      ResolverInputTypes["auth_users_mutation_response"]
    ];
    update_images?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["images_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["images_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["images_bool_exp"];
      },
      ResolverInputTypes["images_mutation_response"]
    ];
    update_images_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["images_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?: ResolverInputTypes["images_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["images_pk_columns_input"];
      },
      ResolverInputTypes["images"]
    ];
    update_images_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["images_updates"]>;
      },
      ResolverInputTypes["images_mutation_response"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    auth_invitations?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_invitations_select_column"]>
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
          | Array<ResolverInputTypes["auth_invitations_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_invitations_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_invitations"]
    ];
    auth_invitations_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_invitations_select_column"]>
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
          | Array<ResolverInputTypes["auth_invitations_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_invitations_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_invitations_aggregate"]
    ];
    auth_invitations_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["auth_invitations"]
    ];
    auth_users?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_users_select_column"]>
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
          | Array<ResolverInputTypes["auth_users_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["auth_users_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["auth_users"]
    ];
    auth_users_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_users_select_column"]>
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
          | Array<ResolverInputTypes["auth_users_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["auth_users_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["auth_users_aggregate"]
    ];
    auth_users_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["auth_users"]
    ];
    images?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["images_select_column"]>
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
          | Array<ResolverInputTypes["images_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["images_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["images"]
    ];
    images_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["images_select_column"]>
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
          | Array<ResolverInputTypes["images_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["images_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["images_aggregate"]
    ];
    images_by_pk?: [{ id: number }, ResolverInputTypes["images"]];
    invitations?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["invitations_select_column"]>
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
          | Array<ResolverInputTypes["invitations_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["invitations_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["invitations"]
    ];
    invitations_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["invitations_select_column"]>
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
          | Array<ResolverInputTypes["invitations_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["invitations_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["invitations_aggregate"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["subscription_root"]: AliasType<{
    auth_invitations?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_invitations_select_column"]>
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
          | Array<ResolverInputTypes["auth_invitations_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_invitations_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_invitations"]
    ];
    auth_invitations_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_invitations_select_column"]>
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
          | Array<ResolverInputTypes["auth_invitations_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_invitations_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_invitations_aggregate"]
    ];
    auth_invitations_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["auth_invitations"]
    ];
    auth_invitations_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["auth_invitations_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_invitations_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_invitations"]
    ];
    auth_users?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_users_select_column"]>
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
          | Array<ResolverInputTypes["auth_users_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["auth_users_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["auth_users"]
    ];
    auth_users_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_users_select_column"]>
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
          | Array<ResolverInputTypes["auth_users_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["auth_users_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["auth_users_aggregate"]
    ];
    auth_users_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["auth_users"]
    ];
    auth_users_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["auth_users_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["auth_users_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["auth_users"]
    ];
    images?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["images_select_column"]>
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
          | Array<ResolverInputTypes["images_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["images_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["images"]
    ];
    images_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["images_select_column"]>
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
          | Array<ResolverInputTypes["images_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["images_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["images_aggregate"]
    ];
    images_by_pk?: [{ id: number }, ResolverInputTypes["images"]];
    images_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["images_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["images_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["images"]
    ];
    invitations?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["invitations_select_column"]>
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
          | Array<ResolverInputTypes["invitations_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["invitations_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["invitations"]
    ];
    invitations_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["invitations_select_column"]>
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
          | Array<ResolverInputTypes["invitations_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["invitations_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["invitations_aggregate"]
    ];
    invitations_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["invitations_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["invitations_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["invitations"]
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
  ["uuid"]: unknown;
  /** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
  ["uuid_comparison_exp"]: {
    _eq?: ResolverInputTypes["uuid"] | undefined | null;
    _gt?: ResolverInputTypes["uuid"] | undefined | null;
    _gte?: ResolverInputTypes["uuid"] | undefined | null;
    _in?: Array<ResolverInputTypes["uuid"]> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: ResolverInputTypes["uuid"] | undefined | null;
    _lte?: ResolverInputTypes["uuid"] | undefined | null;
    _neq?: ResolverInputTypes["uuid"] | undefined | null;
    _nin?: Array<ResolverInputTypes["uuid"]> | undefined | null;
  };
};

export type ModelTypes = {
  /** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
  ["Boolean_comparison_exp"]: {
    _eq?: boolean | undefined;
    _gt?: boolean | undefined;
    _gte?: boolean | undefined;
    _in?: Array<boolean> | undefined;
    _is_null?: boolean | undefined;
    _lt?: boolean | undefined;
    _lte?: boolean | undefined;
    _neq?: boolean | undefined;
    _nin?: Array<boolean> | undefined;
  };
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
  /** ids are beta invite codes */
  ["auth_invitations"]: {
    created_at: ModelTypes["timestamptz"];
    data?: ModelTypes["jsonb"] | undefined;
    id: ModelTypes["uuid"];
  };
  /** aggregated selection of "auth.invitations" */
  ["auth_invitations_aggregate"]: {
    aggregate?: ModelTypes["auth_invitations_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["auth_invitations"]>;
  };
  /** aggregate fields of "auth.invitations" */
  ["auth_invitations_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["auth_invitations_max_fields"] | undefined;
    min?: ModelTypes["auth_invitations_min_fields"] | undefined;
  };
  /** append existing jsonb value of filtered columns with new jsonb value */
  ["auth_invitations_append_input"]: {
    data?: ModelTypes["jsonb"] | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.invitations". All fields are combined with a logical 'AND'. */
  ["auth_invitations_bool_exp"]: {
    _and?: Array<ModelTypes["auth_invitations_bool_exp"]> | undefined;
    _not?: ModelTypes["auth_invitations_bool_exp"] | undefined;
    _or?: Array<ModelTypes["auth_invitations_bool_exp"]> | undefined;
    created_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    data?: ModelTypes["jsonb_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
  };
  ["auth_invitations_constraint"]: auth_invitations_constraint;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  ["auth_invitations_delete_at_path_input"]: {
    data?: Array<string> | undefined;
  };
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  ["auth_invitations_delete_elem_input"]: {
    data?: number | undefined;
  };
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  ["auth_invitations_delete_key_input"]: {
    data?: string | undefined;
  };
  /** input type for inserting data into table "auth.invitations" */
  ["auth_invitations_insert_input"]: {
    created_at?: ModelTypes["timestamptz"] | undefined;
    data?: ModelTypes["jsonb"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
  };
  /** aggregate max on columns */
  ["auth_invitations_max_fields"]: {
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
  };
  /** aggregate min on columns */
  ["auth_invitations_min_fields"]: {
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
  };
  /** response of any mutation on the table "auth.invitations" */
  ["auth_invitations_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_invitations"]>;
  };
  /** input type for inserting object relation for remote table "auth.invitations" */
  ["auth_invitations_obj_rel_insert_input"]: {
    data: ModelTypes["auth_invitations_insert_input"];
    /** upsert condition */
    on_conflict?: ModelTypes["auth_invitations_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "auth.invitations" */
  ["auth_invitations_on_conflict"]: {
    constraint: ModelTypes["auth_invitations_constraint"];
    update_columns: Array<ModelTypes["auth_invitations_update_column"]>;
    where?: ModelTypes["auth_invitations_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.invitations". */
  ["auth_invitations_order_by"]: {
    created_at?: ModelTypes["order_by"] | undefined;
    data?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth_invitations */
  ["auth_invitations_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  ["auth_invitations_prepend_input"]: {
    data?: ModelTypes["jsonb"] | undefined;
  };
  ["auth_invitations_select_column"]: auth_invitations_select_column;
  /** input type for updating data in table "auth.invitations" */
  ["auth_invitations_set_input"]: {
    created_at?: ModelTypes["timestamptz"] | undefined;
    data?: ModelTypes["jsonb"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
  };
  /** Streaming cursor of the table "auth_invitations" */
  ["auth_invitations_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["auth_invitations_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_invitations_stream_cursor_value_input"]: {
    created_at?: ModelTypes["timestamptz"] | undefined;
    data?: ModelTypes["jsonb"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
  };
  ["auth_invitations_update_column"]: auth_invitations_update_column;
  ["auth_invitations_updates"]: {
    /** append existing jsonb value of filtered columns with new jsonb value */
    _append?: ModelTypes["auth_invitations_append_input"] | undefined;
    /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
    _delete_at_path?:
      | ModelTypes["auth_invitations_delete_at_path_input"]
      | undefined;
    /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
    _delete_elem?: ModelTypes["auth_invitations_delete_elem_input"] | undefined;
    /** delete key/value pair or string element. key/value pairs are matched based on their key value */
    _delete_key?: ModelTypes["auth_invitations_delete_key_input"] | undefined;
    /** prepend existing jsonb value of filtered columns with new jsonb value */
    _prepend?: ModelTypes["auth_invitations_prepend_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["auth_invitations_set_input"] | undefined;
    where: ModelTypes["auth_invitations_bool_exp"];
  };
  /** columns and relationships of "auth.users" */
  ["auth_users"]: {
    blockchain: string;
    created_at: ModelTypes["timestamptz"];
    id: ModelTypes["uuid"];
    invitation_id: ModelTypes["uuid"];
    last_active_at: ModelTypes["timestamptz"];
    pubkey: string;
    updated_at: ModelTypes["timestamptz"];
    username: ModelTypes["citext"];
    waitlist_id?: string | undefined;
  };
  /** aggregated selection of "auth.users" */
  ["auth_users_aggregate"]: {
    aggregate?: ModelTypes["auth_users_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["auth_users"]>;
  };
  /** aggregate fields of "auth.users" */
  ["auth_users_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["auth_users_max_fields"] | undefined;
    min?: ModelTypes["auth_users_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.users". All fields are combined with a logical 'AND'. */
  ["auth_users_bool_exp"]: {
    _and?: Array<ModelTypes["auth_users_bool_exp"]> | undefined;
    _not?: ModelTypes["auth_users_bool_exp"] | undefined;
    _or?: Array<ModelTypes["auth_users_bool_exp"]> | undefined;
    blockchain?: ModelTypes["String_comparison_exp"] | undefined;
    created_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    invitation_id?: ModelTypes["uuid_comparison_exp"] | undefined;
    last_active_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    pubkey?: ModelTypes["String_comparison_exp"] | undefined;
    updated_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    username?: ModelTypes["citext_comparison_exp"] | undefined;
    waitlist_id?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["auth_users_constraint"]: auth_users_constraint;
  /** input type for inserting data into table "auth.users" */
  ["auth_users_insert_input"]: {
    blockchain?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    invitation_id?: ModelTypes["uuid"] | undefined;
    last_active_at?: ModelTypes["timestamptz"] | undefined;
    pubkey?: string | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
    username?: ModelTypes["citext"] | undefined;
    waitlist_id?: string | undefined;
  };
  /** aggregate max on columns */
  ["auth_users_max_fields"]: {
    blockchain?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    invitation_id?: ModelTypes["uuid"] | undefined;
    last_active_at?: ModelTypes["timestamptz"] | undefined;
    pubkey?: string | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
    username?: ModelTypes["citext"] | undefined;
    waitlist_id?: string | undefined;
  };
  /** aggregate min on columns */
  ["auth_users_min_fields"]: {
    blockchain?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    invitation_id?: ModelTypes["uuid"] | undefined;
    last_active_at?: ModelTypes["timestamptz"] | undefined;
    pubkey?: string | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
    username?: ModelTypes["citext"] | undefined;
    waitlist_id?: string | undefined;
  };
  /** response of any mutation on the table "auth.users" */
  ["auth_users_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_users"]>;
  };
  /** on_conflict condition type for table "auth.users" */
  ["auth_users_on_conflict"]: {
    constraint: ModelTypes["auth_users_constraint"];
    update_columns: Array<ModelTypes["auth_users_update_column"]>;
    where?: ModelTypes["auth_users_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.users". */
  ["auth_users_order_by"]: {
    blockchain?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    invitation_id?: ModelTypes["order_by"] | undefined;
    last_active_at?: ModelTypes["order_by"] | undefined;
    pubkey?: ModelTypes["order_by"] | undefined;
    updated_at?: ModelTypes["order_by"] | undefined;
    username?: ModelTypes["order_by"] | undefined;
    waitlist_id?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth_users */
  ["auth_users_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  ["auth_users_select_column"]: auth_users_select_column;
  /** input type for updating data in table "auth.users" */
  ["auth_users_set_input"]: {
    blockchain?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    invitation_id?: ModelTypes["uuid"] | undefined;
    last_active_at?: ModelTypes["timestamptz"] | undefined;
    pubkey?: string | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
    username?: ModelTypes["citext"] | undefined;
    waitlist_id?: string | undefined;
  };
  /** Streaming cursor of the table "auth_users" */
  ["auth_users_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["auth_users_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_users_stream_cursor_value_input"]: {
    blockchain?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    invitation_id?: ModelTypes["uuid"] | undefined;
    last_active_at?: ModelTypes["timestamptz"] | undefined;
    pubkey?: string | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
    username?: ModelTypes["citext"] | undefined;
    waitlist_id?: string | undefined;
  };
  ["auth_users_update_column"]: auth_users_update_column;
  ["auth_users_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["auth_users_set_input"] | undefined;
    where: ModelTypes["auth_users_bool_exp"];
  };
  ["citext"]: any;
  /** Boolean expression to compare columns of type "citext". All fields are combined with logical 'AND'. */
  ["citext_comparison_exp"]: {
    _eq?: ModelTypes["citext"] | undefined;
    _gt?: ModelTypes["citext"] | undefined;
    _gte?: ModelTypes["citext"] | undefined;
    /** does the column match the given case-insensitive pattern */
    _ilike?: ModelTypes["citext"] | undefined;
    _in?: Array<ModelTypes["citext"]> | undefined;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: ModelTypes["citext"] | undefined;
    _is_null?: boolean | undefined;
    /** does the column match the given pattern */
    _like?: ModelTypes["citext"] | undefined;
    _lt?: ModelTypes["citext"] | undefined;
    _lte?: ModelTypes["citext"] | undefined;
    _neq?: ModelTypes["citext"] | undefined;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: ModelTypes["citext"] | undefined;
    _nin?: Array<ModelTypes["citext"]> | undefined;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: ModelTypes["citext"] | undefined;
    /** does the column NOT match the given pattern */
    _nlike?: ModelTypes["citext"] | undefined;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: ModelTypes["citext"] | undefined;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: ModelTypes["citext"] | undefined;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: ModelTypes["citext"] | undefined;
    /** does the column match the given SQL regular expression */
    _similar?: ModelTypes["citext"] | undefined;
  };
  ["cursor_ordering"]: cursor_ordering;
  /** columns and relationships of "images" */
  ["images"]: {
    completed: boolean;
    created_at: ModelTypes["timestamptz"];
    id: number;
    /** An object relationship */
    invitation: ModelTypes["auth_invitations"];
    invite_code: ModelTypes["uuid"];
    prompt: string;
    uri: string;
    winner?: string | undefined;
  };
  /** aggregated selection of "images" */
  ["images_aggregate"]: {
    aggregate?: ModelTypes["images_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["images"]>;
  };
  /** aggregate fields of "images" */
  ["images_aggregate_fields"]: {
    avg?: ModelTypes["images_avg_fields"] | undefined;
    count: number;
    max?: ModelTypes["images_max_fields"] | undefined;
    min?: ModelTypes["images_min_fields"] | undefined;
    stddev?: ModelTypes["images_stddev_fields"] | undefined;
    stddev_pop?: ModelTypes["images_stddev_pop_fields"] | undefined;
    stddev_samp?: ModelTypes["images_stddev_samp_fields"] | undefined;
    sum?: ModelTypes["images_sum_fields"] | undefined;
    var_pop?: ModelTypes["images_var_pop_fields"] | undefined;
    var_samp?: ModelTypes["images_var_samp_fields"] | undefined;
    variance?: ModelTypes["images_variance_fields"] | undefined;
  };
  /** aggregate avg on columns */
  ["images_avg_fields"]: {
    id?: number | undefined;
  };
  /** Boolean expression to filter rows from the table "images". All fields are combined with a logical 'AND'. */
  ["images_bool_exp"]: {
    _and?: Array<ModelTypes["images_bool_exp"]> | undefined;
    _not?: ModelTypes["images_bool_exp"] | undefined;
    _or?: Array<ModelTypes["images_bool_exp"]> | undefined;
    completed?: ModelTypes["Boolean_comparison_exp"] | undefined;
    created_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    invitation?: ModelTypes["auth_invitations_bool_exp"] | undefined;
    invite_code?: ModelTypes["uuid_comparison_exp"] | undefined;
    prompt?: ModelTypes["String_comparison_exp"] | undefined;
    uri?: ModelTypes["String_comparison_exp"] | undefined;
    winner?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["images_constraint"]: images_constraint;
  /** input type for incrementing numeric columns in table "images" */
  ["images_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "images" */
  ["images_insert_input"]: {
    completed?: boolean | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: number | undefined;
    invitation?:
      | ModelTypes["auth_invitations_obj_rel_insert_input"]
      | undefined;
    invite_code?: ModelTypes["uuid"] | undefined;
    prompt?: string | undefined;
    uri?: string | undefined;
    winner?: string | undefined;
  };
  /** aggregate max on columns */
  ["images_max_fields"]: {
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: number | undefined;
    invite_code?: ModelTypes["uuid"] | undefined;
    prompt?: string | undefined;
    uri?: string | undefined;
    winner?: string | undefined;
  };
  /** aggregate min on columns */
  ["images_min_fields"]: {
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: number | undefined;
    invite_code?: ModelTypes["uuid"] | undefined;
    prompt?: string | undefined;
    uri?: string | undefined;
    winner?: string | undefined;
  };
  /** response of any mutation on the table "images" */
  ["images_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["images"]>;
  };
  /** on_conflict condition type for table "images" */
  ["images_on_conflict"]: {
    constraint: ModelTypes["images_constraint"];
    update_columns: Array<ModelTypes["images_update_column"]>;
    where?: ModelTypes["images_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "images". */
  ["images_order_by"]: {
    completed?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    invitation?: ModelTypes["auth_invitations_order_by"] | undefined;
    invite_code?: ModelTypes["order_by"] | undefined;
    prompt?: ModelTypes["order_by"] | undefined;
    uri?: ModelTypes["order_by"] | undefined;
    winner?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: images */
  ["images_pk_columns_input"]: {
    id: number;
  };
  ["images_select_column"]: images_select_column;
  /** input type for updating data in table "images" */
  ["images_set_input"]: {
    completed?: boolean | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: number | undefined;
    invite_code?: ModelTypes["uuid"] | undefined;
    prompt?: string | undefined;
    uri?: string | undefined;
    winner?: string | undefined;
  };
  /** aggregate stddev on columns */
  ["images_stddev_fields"]: {
    id?: number | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["images_stddev_pop_fields"]: {
    id?: number | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["images_stddev_samp_fields"]: {
    id?: number | undefined;
  };
  /** Streaming cursor of the table "images" */
  ["images_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["images_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["images_stream_cursor_value_input"]: {
    completed?: boolean | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: number | undefined;
    invite_code?: ModelTypes["uuid"] | undefined;
    prompt?: string | undefined;
    uri?: string | undefined;
    winner?: string | undefined;
  };
  /** aggregate sum on columns */
  ["images_sum_fields"]: {
    id?: number | undefined;
  };
  ["images_update_column"]: images_update_column;
  ["images_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["images_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["images_set_input"] | undefined;
    where: ModelTypes["images_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["images_var_pop_fields"]: {
    id?: number | undefined;
  };
  /** aggregate var_samp on columns */
  ["images_var_samp_fields"]: {
    id?: number | undefined;
  };
  /** aggregate variance on columns */
  ["images_variance_fields"]: {
    id?: number | undefined;
  };
  /** columns and relationships of "invitations" */
  ["invitations"]: {
    claimed_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
  };
  /** aggregated selection of "invitations" */
  ["invitations_aggregate"]: {
    aggregate?: ModelTypes["invitations_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["invitations"]>;
  };
  /** aggregate fields of "invitations" */
  ["invitations_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["invitations_max_fields"] | undefined;
    min?: ModelTypes["invitations_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "invitations". All fields are combined with a logical 'AND'. */
  ["invitations_bool_exp"]: {
    _and?: Array<ModelTypes["invitations_bool_exp"]> | undefined;
    _not?: ModelTypes["invitations_bool_exp"] | undefined;
    _or?: Array<ModelTypes["invitations_bool_exp"]> | undefined;
    claimed_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
  };
  /** aggregate max on columns */
  ["invitations_max_fields"]: {
    claimed_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
  };
  /** aggregate min on columns */
  ["invitations_min_fields"]: {
    claimed_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
  };
  /** Ordering options when selecting data from "invitations". */
  ["invitations_order_by"]: {
    claimed_at?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
  };
  ["invitations_select_column"]: invitations_select_column;
  /** Streaming cursor of the table "invitations" */
  ["invitations_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["invitations_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["invitations_stream_cursor_value_input"]: {
    claimed_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
  };
  ["jsonb"]: any;
  ["jsonb_cast_exp"]: {
    String?: ModelTypes["String_comparison_exp"] | undefined;
  };
  /** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
  ["jsonb_comparison_exp"]: {
    _cast?: ModelTypes["jsonb_cast_exp"] | undefined;
    /** is the column contained in the given json value */
    _contained_in?: ModelTypes["jsonb"] | undefined;
    /** does the column contain the given json value at the top level */
    _contains?: ModelTypes["jsonb"] | undefined;
    _eq?: ModelTypes["jsonb"] | undefined;
    _gt?: ModelTypes["jsonb"] | undefined;
    _gte?: ModelTypes["jsonb"] | undefined;
    /** does the string exist as a top-level key in the column */
    _has_key?: string | undefined;
    /** do all of these strings exist as top-level keys in the column */
    _has_keys_all?: Array<string> | undefined;
    /** do any of these strings exist as top-level keys in the column */
    _has_keys_any?: Array<string> | undefined;
    _in?: Array<ModelTypes["jsonb"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: ModelTypes["jsonb"] | undefined;
    _lte?: ModelTypes["jsonb"] | undefined;
    _neq?: ModelTypes["jsonb"] | undefined;
    _nin?: Array<ModelTypes["jsonb"]> | undefined;
  };
  /** mutation root */
  ["mutation_root"]: {
    /** delete data from the table: "auth.invitations" */
    delete_auth_invitations?:
      | ModelTypes["auth_invitations_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.invitations" */
    delete_auth_invitations_by_pk?: ModelTypes["auth_invitations"] | undefined;
    /** delete data from the table: "auth.users" */
    delete_auth_users?: ModelTypes["auth_users_mutation_response"] | undefined;
    /** delete single row from the table: "auth.users" */
    delete_auth_users_by_pk?: ModelTypes["auth_users"] | undefined;
    /** delete data from the table: "images" */
    delete_images?: ModelTypes["images_mutation_response"] | undefined;
    /** delete single row from the table: "images" */
    delete_images_by_pk?: ModelTypes["images"] | undefined;
    /** insert data into the table: "auth.invitations" */
    insert_auth_invitations?:
      | ModelTypes["auth_invitations_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.invitations" */
    insert_auth_invitations_one?: ModelTypes["auth_invitations"] | undefined;
    /** insert data into the table: "auth.users" */
    insert_auth_users?: ModelTypes["auth_users_mutation_response"] | undefined;
    /** insert a single row into the table: "auth.users" */
    insert_auth_users_one?: ModelTypes["auth_users"] | undefined;
    /** insert data into the table: "images" */
    insert_images?: ModelTypes["images_mutation_response"] | undefined;
    /** insert a single row into the table: "images" */
    insert_images_one?: ModelTypes["images"] | undefined;
    /** update data of the table: "auth.invitations" */
    update_auth_invitations?:
      | ModelTypes["auth_invitations_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.invitations" */
    update_auth_invitations_by_pk?: ModelTypes["auth_invitations"] | undefined;
    /** update multiples rows of table: "auth.invitations" */
    update_auth_invitations_many?:
      | Array<ModelTypes["auth_invitations_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "auth.users" */
    update_auth_users?: ModelTypes["auth_users_mutation_response"] | undefined;
    /** update single row of the table: "auth.users" */
    update_auth_users_by_pk?: ModelTypes["auth_users"] | undefined;
    /** update multiples rows of table: "auth.users" */
    update_auth_users_many?:
      | Array<ModelTypes["auth_users_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "images" */
    update_images?: ModelTypes["images_mutation_response"] | undefined;
    /** update single row of the table: "images" */
    update_images_by_pk?: ModelTypes["images"] | undefined;
    /** update multiples rows of table: "images" */
    update_images_many?:
      | Array<ModelTypes["images_mutation_response"] | undefined>
      | undefined;
  };
  ["order_by"]: order_by;
  ["query_root"]: {
    /** fetch data from the table: "auth.invitations" */
    auth_invitations: Array<ModelTypes["auth_invitations"]>;
    /** fetch aggregated fields from the table: "auth.invitations" */
    auth_invitations_aggregate: ModelTypes["auth_invitations_aggregate"];
    /** fetch data from the table: "auth.invitations" using primary key columns */
    auth_invitations_by_pk?: ModelTypes["auth_invitations"] | undefined;
    /** fetch data from the table: "auth.users" */
    auth_users: Array<ModelTypes["auth_users"]>;
    /** fetch aggregated fields from the table: "auth.users" */
    auth_users_aggregate: ModelTypes["auth_users_aggregate"];
    /** fetch data from the table: "auth.users" using primary key columns */
    auth_users_by_pk?: ModelTypes["auth_users"] | undefined;
    /** fetch data from the table: "images" */
    images: Array<ModelTypes["images"]>;
    /** fetch aggregated fields from the table: "images" */
    images_aggregate: ModelTypes["images_aggregate"];
    /** fetch data from the table: "images" using primary key columns */
    images_by_pk?: ModelTypes["images"] | undefined;
    /** fetch data from the table: "invitations" */
    invitations: Array<ModelTypes["invitations"]>;
    /** fetch aggregated fields from the table: "invitations" */
    invitations_aggregate: ModelTypes["invitations_aggregate"];
  };
  ["subscription_root"]: {
    /** fetch data from the table: "auth.invitations" */
    auth_invitations: Array<ModelTypes["auth_invitations"]>;
    /** fetch aggregated fields from the table: "auth.invitations" */
    auth_invitations_aggregate: ModelTypes["auth_invitations_aggregate"];
    /** fetch data from the table: "auth.invitations" using primary key columns */
    auth_invitations_by_pk?: ModelTypes["auth_invitations"] | undefined;
    /** fetch data from the table in a streaming manner : "auth.invitations" */
    auth_invitations_stream: Array<ModelTypes["auth_invitations"]>;
    /** fetch data from the table: "auth.users" */
    auth_users: Array<ModelTypes["auth_users"]>;
    /** fetch aggregated fields from the table: "auth.users" */
    auth_users_aggregate: ModelTypes["auth_users_aggregate"];
    /** fetch data from the table: "auth.users" using primary key columns */
    auth_users_by_pk?: ModelTypes["auth_users"] | undefined;
    /** fetch data from the table in a streaming manner : "auth.users" */
    auth_users_stream: Array<ModelTypes["auth_users"]>;
    /** fetch data from the table: "images" */
    images: Array<ModelTypes["images"]>;
    /** fetch aggregated fields from the table: "images" */
    images_aggregate: ModelTypes["images_aggregate"];
    /** fetch data from the table: "images" using primary key columns */
    images_by_pk?: ModelTypes["images"] | undefined;
    /** fetch data from the table in a streaming manner : "images" */
    images_stream: Array<ModelTypes["images"]>;
    /** fetch data from the table: "invitations" */
    invitations: Array<ModelTypes["invitations"]>;
    /** fetch aggregated fields from the table: "invitations" */
    invitations_aggregate: ModelTypes["invitations_aggregate"];
    /** fetch data from the table in a streaming manner : "invitations" */
    invitations_stream: Array<ModelTypes["invitations"]>;
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
  ["uuid"]: any;
  /** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
  ["uuid_comparison_exp"]: {
    _eq?: ModelTypes["uuid"] | undefined;
    _gt?: ModelTypes["uuid"] | undefined;
    _gte?: ModelTypes["uuid"] | undefined;
    _in?: Array<ModelTypes["uuid"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: ModelTypes["uuid"] | undefined;
    _lte?: ModelTypes["uuid"] | undefined;
    _neq?: ModelTypes["uuid"] | undefined;
    _nin?: Array<ModelTypes["uuid"]> | undefined;
  };
};

export type GraphQLTypes = {
  /** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
  ["Boolean_comparison_exp"]: {
    _eq?: boolean | undefined;
    _gt?: boolean | undefined;
    _gte?: boolean | undefined;
    _in?: Array<boolean> | undefined;
    _is_null?: boolean | undefined;
    _lt?: boolean | undefined;
    _lte?: boolean | undefined;
    _neq?: boolean | undefined;
    _nin?: Array<boolean> | undefined;
  };
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
  /** ids are beta invite codes */
  ["auth_invitations"]: {
    __typename: "auth_invitations";
    created_at: GraphQLTypes["timestamptz"];
    data?: GraphQLTypes["jsonb"] | undefined;
    id: GraphQLTypes["uuid"];
  };
  /** aggregated selection of "auth.invitations" */
  ["auth_invitations_aggregate"]: {
    __typename: "auth_invitations_aggregate";
    aggregate?: GraphQLTypes["auth_invitations_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["auth_invitations"]>;
  };
  /** aggregate fields of "auth.invitations" */
  ["auth_invitations_aggregate_fields"]: {
    __typename: "auth_invitations_aggregate_fields";
    count: number;
    max?: GraphQLTypes["auth_invitations_max_fields"] | undefined;
    min?: GraphQLTypes["auth_invitations_min_fields"] | undefined;
  };
  /** append existing jsonb value of filtered columns with new jsonb value */
  ["auth_invitations_append_input"]: {
    data?: GraphQLTypes["jsonb"] | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.invitations". All fields are combined with a logical 'AND'. */
  ["auth_invitations_bool_exp"]: {
    _and?: Array<GraphQLTypes["auth_invitations_bool_exp"]> | undefined;
    _not?: GraphQLTypes["auth_invitations_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["auth_invitations_bool_exp"]> | undefined;
    created_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    data?: GraphQLTypes["jsonb_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.invitations" */
  ["auth_invitations_constraint"]: auth_invitations_constraint;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  ["auth_invitations_delete_at_path_input"]: {
    data?: Array<string> | undefined;
  };
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  ["auth_invitations_delete_elem_input"]: {
    data?: number | undefined;
  };
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  ["auth_invitations_delete_key_input"]: {
    data?: string | undefined;
  };
  /** input type for inserting data into table "auth.invitations" */
  ["auth_invitations_insert_input"]: {
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    data?: GraphQLTypes["jsonb"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
  };
  /** aggregate max on columns */
  ["auth_invitations_max_fields"]: {
    __typename: "auth_invitations_max_fields";
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
  };
  /** aggregate min on columns */
  ["auth_invitations_min_fields"]: {
    __typename: "auth_invitations_min_fields";
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
  };
  /** response of any mutation on the table "auth.invitations" */
  ["auth_invitations_mutation_response"]: {
    __typename: "auth_invitations_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_invitations"]>;
  };
  /** input type for inserting object relation for remote table "auth.invitations" */
  ["auth_invitations_obj_rel_insert_input"]: {
    data: GraphQLTypes["auth_invitations_insert_input"];
    /** upsert condition */
    on_conflict?: GraphQLTypes["auth_invitations_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "auth.invitations" */
  ["auth_invitations_on_conflict"]: {
    constraint: GraphQLTypes["auth_invitations_constraint"];
    update_columns: Array<GraphQLTypes["auth_invitations_update_column"]>;
    where?: GraphQLTypes["auth_invitations_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.invitations". */
  ["auth_invitations_order_by"]: {
    created_at?: GraphQLTypes["order_by"] | undefined;
    data?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth_invitations */
  ["auth_invitations_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  ["auth_invitations_prepend_input"]: {
    data?: GraphQLTypes["jsonb"] | undefined;
  };
  /** select columns of table "auth.invitations" */
  ["auth_invitations_select_column"]: auth_invitations_select_column;
  /** input type for updating data in table "auth.invitations" */
  ["auth_invitations_set_input"]: {
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    data?: GraphQLTypes["jsonb"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
  };
  /** Streaming cursor of the table "auth_invitations" */
  ["auth_invitations_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["auth_invitations_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_invitations_stream_cursor_value_input"]: {
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    data?: GraphQLTypes["jsonb"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
  };
  /** update columns of table "auth.invitations" */
  ["auth_invitations_update_column"]: auth_invitations_update_column;
  ["auth_invitations_updates"]: {
    /** append existing jsonb value of filtered columns with new jsonb value */
    _append?: GraphQLTypes["auth_invitations_append_input"] | undefined;
    /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
    _delete_at_path?:
      | GraphQLTypes["auth_invitations_delete_at_path_input"]
      | undefined;
    /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
    _delete_elem?:
      | GraphQLTypes["auth_invitations_delete_elem_input"]
      | undefined;
    /** delete key/value pair or string element. key/value pairs are matched based on their key value */
    _delete_key?: GraphQLTypes["auth_invitations_delete_key_input"] | undefined;
    /** prepend existing jsonb value of filtered columns with new jsonb value */
    _prepend?: GraphQLTypes["auth_invitations_prepend_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["auth_invitations_set_input"] | undefined;
    where: GraphQLTypes["auth_invitations_bool_exp"];
  };
  /** columns and relationships of "auth.users" */
  ["auth_users"]: {
    __typename: "auth_users";
    blockchain: string;
    created_at: GraphQLTypes["timestamptz"];
    id: GraphQLTypes["uuid"];
    invitation_id: GraphQLTypes["uuid"];
    last_active_at: GraphQLTypes["timestamptz"];
    pubkey: string;
    updated_at: GraphQLTypes["timestamptz"];
    username: GraphQLTypes["citext"];
    waitlist_id?: string | undefined;
  };
  /** aggregated selection of "auth.users" */
  ["auth_users_aggregate"]: {
    __typename: "auth_users_aggregate";
    aggregate?: GraphQLTypes["auth_users_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["auth_users"]>;
  };
  /** aggregate fields of "auth.users" */
  ["auth_users_aggregate_fields"]: {
    __typename: "auth_users_aggregate_fields";
    count: number;
    max?: GraphQLTypes["auth_users_max_fields"] | undefined;
    min?: GraphQLTypes["auth_users_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.users". All fields are combined with a logical 'AND'. */
  ["auth_users_bool_exp"]: {
    _and?: Array<GraphQLTypes["auth_users_bool_exp"]> | undefined;
    _not?: GraphQLTypes["auth_users_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["auth_users_bool_exp"]> | undefined;
    blockchain?: GraphQLTypes["String_comparison_exp"] | undefined;
    created_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    invitation_id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    last_active_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    pubkey?: GraphQLTypes["String_comparison_exp"] | undefined;
    updated_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    username?: GraphQLTypes["citext_comparison_exp"] | undefined;
    waitlist_id?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.users" */
  ["auth_users_constraint"]: auth_users_constraint;
  /** input type for inserting data into table "auth.users" */
  ["auth_users_insert_input"]: {
    blockchain?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    invitation_id?: GraphQLTypes["uuid"] | undefined;
    last_active_at?: GraphQLTypes["timestamptz"] | undefined;
    pubkey?: string | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
    username?: GraphQLTypes["citext"] | undefined;
    waitlist_id?: string | undefined;
  };
  /** aggregate max on columns */
  ["auth_users_max_fields"]: {
    __typename: "auth_users_max_fields";
    blockchain?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    invitation_id?: GraphQLTypes["uuid"] | undefined;
    last_active_at?: GraphQLTypes["timestamptz"] | undefined;
    pubkey?: string | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
    username?: GraphQLTypes["citext"] | undefined;
    waitlist_id?: string | undefined;
  };
  /** aggregate min on columns */
  ["auth_users_min_fields"]: {
    __typename: "auth_users_min_fields";
    blockchain?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    invitation_id?: GraphQLTypes["uuid"] | undefined;
    last_active_at?: GraphQLTypes["timestamptz"] | undefined;
    pubkey?: string | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
    username?: GraphQLTypes["citext"] | undefined;
    waitlist_id?: string | undefined;
  };
  /** response of any mutation on the table "auth.users" */
  ["auth_users_mutation_response"]: {
    __typename: "auth_users_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_users"]>;
  };
  /** on_conflict condition type for table "auth.users" */
  ["auth_users_on_conflict"]: {
    constraint: GraphQLTypes["auth_users_constraint"];
    update_columns: Array<GraphQLTypes["auth_users_update_column"]>;
    where?: GraphQLTypes["auth_users_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.users". */
  ["auth_users_order_by"]: {
    blockchain?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    invitation_id?: GraphQLTypes["order_by"] | undefined;
    last_active_at?: GraphQLTypes["order_by"] | undefined;
    pubkey?: GraphQLTypes["order_by"] | undefined;
    updated_at?: GraphQLTypes["order_by"] | undefined;
    username?: GraphQLTypes["order_by"] | undefined;
    waitlist_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth_users */
  ["auth_users_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "auth.users" */
  ["auth_users_select_column"]: auth_users_select_column;
  /** input type for updating data in table "auth.users" */
  ["auth_users_set_input"]: {
    blockchain?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    invitation_id?: GraphQLTypes["uuid"] | undefined;
    last_active_at?: GraphQLTypes["timestamptz"] | undefined;
    pubkey?: string | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
    username?: GraphQLTypes["citext"] | undefined;
    waitlist_id?: string | undefined;
  };
  /** Streaming cursor of the table "auth_users" */
  ["auth_users_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["auth_users_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_users_stream_cursor_value_input"]: {
    blockchain?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    invitation_id?: GraphQLTypes["uuid"] | undefined;
    last_active_at?: GraphQLTypes["timestamptz"] | undefined;
    pubkey?: string | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
    username?: GraphQLTypes["citext"] | undefined;
    waitlist_id?: string | undefined;
  };
  /** update columns of table "auth.users" */
  ["auth_users_update_column"]: auth_users_update_column;
  ["auth_users_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["auth_users_set_input"] | undefined;
    where: GraphQLTypes["auth_users_bool_exp"];
  };
  ["citext"]: "scalar" & { name: "citext" };
  /** Boolean expression to compare columns of type "citext". All fields are combined with logical 'AND'. */
  ["citext_comparison_exp"]: {
    _eq?: GraphQLTypes["citext"] | undefined;
    _gt?: GraphQLTypes["citext"] | undefined;
    _gte?: GraphQLTypes["citext"] | undefined;
    /** does the column match the given case-insensitive pattern */
    _ilike?: GraphQLTypes["citext"] | undefined;
    _in?: Array<GraphQLTypes["citext"]> | undefined;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: GraphQLTypes["citext"] | undefined;
    _is_null?: boolean | undefined;
    /** does the column match the given pattern */
    _like?: GraphQLTypes["citext"] | undefined;
    _lt?: GraphQLTypes["citext"] | undefined;
    _lte?: GraphQLTypes["citext"] | undefined;
    _neq?: GraphQLTypes["citext"] | undefined;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: GraphQLTypes["citext"] | undefined;
    _nin?: Array<GraphQLTypes["citext"]> | undefined;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: GraphQLTypes["citext"] | undefined;
    /** does the column NOT match the given pattern */
    _nlike?: GraphQLTypes["citext"] | undefined;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: GraphQLTypes["citext"] | undefined;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: GraphQLTypes["citext"] | undefined;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: GraphQLTypes["citext"] | undefined;
    /** does the column match the given SQL regular expression */
    _similar?: GraphQLTypes["citext"] | undefined;
  };
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** columns and relationships of "images" */
  ["images"]: {
    __typename: "images";
    completed: boolean;
    created_at: GraphQLTypes["timestamptz"];
    id: number;
    /** An object relationship */
    invitation: GraphQLTypes["auth_invitations"];
    invite_code: GraphQLTypes["uuid"];
    prompt: string;
    uri: string;
    winner?: string | undefined;
  };
  /** aggregated selection of "images" */
  ["images_aggregate"]: {
    __typename: "images_aggregate";
    aggregate?: GraphQLTypes["images_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["images"]>;
  };
  /** aggregate fields of "images" */
  ["images_aggregate_fields"]: {
    __typename: "images_aggregate_fields";
    avg?: GraphQLTypes["images_avg_fields"] | undefined;
    count: number;
    max?: GraphQLTypes["images_max_fields"] | undefined;
    min?: GraphQLTypes["images_min_fields"] | undefined;
    stddev?: GraphQLTypes["images_stddev_fields"] | undefined;
    stddev_pop?: GraphQLTypes["images_stddev_pop_fields"] | undefined;
    stddev_samp?: GraphQLTypes["images_stddev_samp_fields"] | undefined;
    sum?: GraphQLTypes["images_sum_fields"] | undefined;
    var_pop?: GraphQLTypes["images_var_pop_fields"] | undefined;
    var_samp?: GraphQLTypes["images_var_samp_fields"] | undefined;
    variance?: GraphQLTypes["images_variance_fields"] | undefined;
  };
  /** aggregate avg on columns */
  ["images_avg_fields"]: {
    __typename: "images_avg_fields";
    id?: number | undefined;
  };
  /** Boolean expression to filter rows from the table "images". All fields are combined with a logical 'AND'. */
  ["images_bool_exp"]: {
    _and?: Array<GraphQLTypes["images_bool_exp"]> | undefined;
    _not?: GraphQLTypes["images_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["images_bool_exp"]> | undefined;
    completed?: GraphQLTypes["Boolean_comparison_exp"] | undefined;
    created_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    invitation?: GraphQLTypes["auth_invitations_bool_exp"] | undefined;
    invite_code?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    prompt?: GraphQLTypes["String_comparison_exp"] | undefined;
    uri?: GraphQLTypes["String_comparison_exp"] | undefined;
    winner?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "images" */
  ["images_constraint"]: images_constraint;
  /** input type for incrementing numeric columns in table "images" */
  ["images_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "images" */
  ["images_insert_input"]: {
    completed?: boolean | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: number | undefined;
    invitation?:
      | GraphQLTypes["auth_invitations_obj_rel_insert_input"]
      | undefined;
    invite_code?: GraphQLTypes["uuid"] | undefined;
    prompt?: string | undefined;
    uri?: string | undefined;
    winner?: string | undefined;
  };
  /** aggregate max on columns */
  ["images_max_fields"]: {
    __typename: "images_max_fields";
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: number | undefined;
    invite_code?: GraphQLTypes["uuid"] | undefined;
    prompt?: string | undefined;
    uri?: string | undefined;
    winner?: string | undefined;
  };
  /** aggregate min on columns */
  ["images_min_fields"]: {
    __typename: "images_min_fields";
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: number | undefined;
    invite_code?: GraphQLTypes["uuid"] | undefined;
    prompt?: string | undefined;
    uri?: string | undefined;
    winner?: string | undefined;
  };
  /** response of any mutation on the table "images" */
  ["images_mutation_response"]: {
    __typename: "images_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["images"]>;
  };
  /** on_conflict condition type for table "images" */
  ["images_on_conflict"]: {
    constraint: GraphQLTypes["images_constraint"];
    update_columns: Array<GraphQLTypes["images_update_column"]>;
    where?: GraphQLTypes["images_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "images". */
  ["images_order_by"]: {
    completed?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    invitation?: GraphQLTypes["auth_invitations_order_by"] | undefined;
    invite_code?: GraphQLTypes["order_by"] | undefined;
    prompt?: GraphQLTypes["order_by"] | undefined;
    uri?: GraphQLTypes["order_by"] | undefined;
    winner?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: images */
  ["images_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "images" */
  ["images_select_column"]: images_select_column;
  /** input type for updating data in table "images" */
  ["images_set_input"]: {
    completed?: boolean | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: number | undefined;
    invite_code?: GraphQLTypes["uuid"] | undefined;
    prompt?: string | undefined;
    uri?: string | undefined;
    winner?: string | undefined;
  };
  /** aggregate stddev on columns */
  ["images_stddev_fields"]: {
    __typename: "images_stddev_fields";
    id?: number | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["images_stddev_pop_fields"]: {
    __typename: "images_stddev_pop_fields";
    id?: number | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["images_stddev_samp_fields"]: {
    __typename: "images_stddev_samp_fields";
    id?: number | undefined;
  };
  /** Streaming cursor of the table "images" */
  ["images_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["images_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["images_stream_cursor_value_input"]: {
    completed?: boolean | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: number | undefined;
    invite_code?: GraphQLTypes["uuid"] | undefined;
    prompt?: string | undefined;
    uri?: string | undefined;
    winner?: string | undefined;
  };
  /** aggregate sum on columns */
  ["images_sum_fields"]: {
    __typename: "images_sum_fields";
    id?: number | undefined;
  };
  /** update columns of table "images" */
  ["images_update_column"]: images_update_column;
  ["images_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["images_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["images_set_input"] | undefined;
    where: GraphQLTypes["images_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["images_var_pop_fields"]: {
    __typename: "images_var_pop_fields";
    id?: number | undefined;
  };
  /** aggregate var_samp on columns */
  ["images_var_samp_fields"]: {
    __typename: "images_var_samp_fields";
    id?: number | undefined;
  };
  /** aggregate variance on columns */
  ["images_variance_fields"]: {
    __typename: "images_variance_fields";
    id?: number | undefined;
  };
  /** columns and relationships of "invitations" */
  ["invitations"]: {
    __typename: "invitations";
    claimed_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
  };
  /** aggregated selection of "invitations" */
  ["invitations_aggregate"]: {
    __typename: "invitations_aggregate";
    aggregate?: GraphQLTypes["invitations_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["invitations"]>;
  };
  /** aggregate fields of "invitations" */
  ["invitations_aggregate_fields"]: {
    __typename: "invitations_aggregate_fields";
    count: number;
    max?: GraphQLTypes["invitations_max_fields"] | undefined;
    min?: GraphQLTypes["invitations_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "invitations". All fields are combined with a logical 'AND'. */
  ["invitations_bool_exp"]: {
    _and?: Array<GraphQLTypes["invitations_bool_exp"]> | undefined;
    _not?: GraphQLTypes["invitations_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["invitations_bool_exp"]> | undefined;
    claimed_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
  };
  /** aggregate max on columns */
  ["invitations_max_fields"]: {
    __typename: "invitations_max_fields";
    claimed_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
  };
  /** aggregate min on columns */
  ["invitations_min_fields"]: {
    __typename: "invitations_min_fields";
    claimed_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
  };
  /** Ordering options when selecting data from "invitations". */
  ["invitations_order_by"]: {
    claimed_at?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** select columns of table "invitations" */
  ["invitations_select_column"]: invitations_select_column;
  /** Streaming cursor of the table "invitations" */
  ["invitations_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["invitations_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["invitations_stream_cursor_value_input"]: {
    claimed_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
  };
  ["jsonb"]: "scalar" & { name: "jsonb" };
  ["jsonb_cast_exp"]: {
    String?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
  ["jsonb_comparison_exp"]: {
    _cast?: GraphQLTypes["jsonb_cast_exp"] | undefined;
    /** is the column contained in the given json value */
    _contained_in?: GraphQLTypes["jsonb"] | undefined;
    /** does the column contain the given json value at the top level */
    _contains?: GraphQLTypes["jsonb"] | undefined;
    _eq?: GraphQLTypes["jsonb"] | undefined;
    _gt?: GraphQLTypes["jsonb"] | undefined;
    _gte?: GraphQLTypes["jsonb"] | undefined;
    /** does the string exist as a top-level key in the column */
    _has_key?: string | undefined;
    /** do all of these strings exist as top-level keys in the column */
    _has_keys_all?: Array<string> | undefined;
    /** do any of these strings exist as top-level keys in the column */
    _has_keys_any?: Array<string> | undefined;
    _in?: Array<GraphQLTypes["jsonb"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: GraphQLTypes["jsonb"] | undefined;
    _lte?: GraphQLTypes["jsonb"] | undefined;
    _neq?: GraphQLTypes["jsonb"] | undefined;
    _nin?: Array<GraphQLTypes["jsonb"]> | undefined;
  };
  /** mutation root */
  ["mutation_root"]: {
    __typename: "mutation_root";
    /** delete data from the table: "auth.invitations" */
    delete_auth_invitations?:
      | GraphQLTypes["auth_invitations_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.invitations" */
    delete_auth_invitations_by_pk?:
      | GraphQLTypes["auth_invitations"]
      | undefined;
    /** delete data from the table: "auth.users" */
    delete_auth_users?:
      | GraphQLTypes["auth_users_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.users" */
    delete_auth_users_by_pk?: GraphQLTypes["auth_users"] | undefined;
    /** delete data from the table: "images" */
    delete_images?: GraphQLTypes["images_mutation_response"] | undefined;
    /** delete single row from the table: "images" */
    delete_images_by_pk?: GraphQLTypes["images"] | undefined;
    /** insert data into the table: "auth.invitations" */
    insert_auth_invitations?:
      | GraphQLTypes["auth_invitations_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.invitations" */
    insert_auth_invitations_one?: GraphQLTypes["auth_invitations"] | undefined;
    /** insert data into the table: "auth.users" */
    insert_auth_users?:
      | GraphQLTypes["auth_users_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.users" */
    insert_auth_users_one?: GraphQLTypes["auth_users"] | undefined;
    /** insert data into the table: "images" */
    insert_images?: GraphQLTypes["images_mutation_response"] | undefined;
    /** insert a single row into the table: "images" */
    insert_images_one?: GraphQLTypes["images"] | undefined;
    /** update data of the table: "auth.invitations" */
    update_auth_invitations?:
      | GraphQLTypes["auth_invitations_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.invitations" */
    update_auth_invitations_by_pk?:
      | GraphQLTypes["auth_invitations"]
      | undefined;
    /** update multiples rows of table: "auth.invitations" */
    update_auth_invitations_many?:
      | Array<GraphQLTypes["auth_invitations_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "auth.users" */
    update_auth_users?:
      | GraphQLTypes["auth_users_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.users" */
    update_auth_users_by_pk?: GraphQLTypes["auth_users"] | undefined;
    /** update multiples rows of table: "auth.users" */
    update_auth_users_many?:
      | Array<GraphQLTypes["auth_users_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "images" */
    update_images?: GraphQLTypes["images_mutation_response"] | undefined;
    /** update single row of the table: "images" */
    update_images_by_pk?: GraphQLTypes["images"] | undefined;
    /** update multiples rows of table: "images" */
    update_images_many?:
      | Array<GraphQLTypes["images_mutation_response"] | undefined>
      | undefined;
  };
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: {
    __typename: "query_root";
    /** fetch data from the table: "auth.invitations" */
    auth_invitations: Array<GraphQLTypes["auth_invitations"]>;
    /** fetch aggregated fields from the table: "auth.invitations" */
    auth_invitations_aggregate: GraphQLTypes["auth_invitations_aggregate"];
    /** fetch data from the table: "auth.invitations" using primary key columns */
    auth_invitations_by_pk?: GraphQLTypes["auth_invitations"] | undefined;
    /** fetch data from the table: "auth.users" */
    auth_users: Array<GraphQLTypes["auth_users"]>;
    /** fetch aggregated fields from the table: "auth.users" */
    auth_users_aggregate: GraphQLTypes["auth_users_aggregate"];
    /** fetch data from the table: "auth.users" using primary key columns */
    auth_users_by_pk?: GraphQLTypes["auth_users"] | undefined;
    /** fetch data from the table: "images" */
    images: Array<GraphQLTypes["images"]>;
    /** fetch aggregated fields from the table: "images" */
    images_aggregate: GraphQLTypes["images_aggregate"];
    /** fetch data from the table: "images" using primary key columns */
    images_by_pk?: GraphQLTypes["images"] | undefined;
    /** fetch data from the table: "invitations" */
    invitations: Array<GraphQLTypes["invitations"]>;
    /** fetch aggregated fields from the table: "invitations" */
    invitations_aggregate: GraphQLTypes["invitations_aggregate"];
  };
  ["subscription_root"]: {
    __typename: "subscription_root";
    /** fetch data from the table: "auth.invitations" */
    auth_invitations: Array<GraphQLTypes["auth_invitations"]>;
    /** fetch aggregated fields from the table: "auth.invitations" */
    auth_invitations_aggregate: GraphQLTypes["auth_invitations_aggregate"];
    /** fetch data from the table: "auth.invitations" using primary key columns */
    auth_invitations_by_pk?: GraphQLTypes["auth_invitations"] | undefined;
    /** fetch data from the table in a streaming manner : "auth.invitations" */
    auth_invitations_stream: Array<GraphQLTypes["auth_invitations"]>;
    /** fetch data from the table: "auth.users" */
    auth_users: Array<GraphQLTypes["auth_users"]>;
    /** fetch aggregated fields from the table: "auth.users" */
    auth_users_aggregate: GraphQLTypes["auth_users_aggregate"];
    /** fetch data from the table: "auth.users" using primary key columns */
    auth_users_by_pk?: GraphQLTypes["auth_users"] | undefined;
    /** fetch data from the table in a streaming manner : "auth.users" */
    auth_users_stream: Array<GraphQLTypes["auth_users"]>;
    /** fetch data from the table: "images" */
    images: Array<GraphQLTypes["images"]>;
    /** fetch aggregated fields from the table: "images" */
    images_aggregate: GraphQLTypes["images_aggregate"];
    /** fetch data from the table: "images" using primary key columns */
    images_by_pk?: GraphQLTypes["images"] | undefined;
    /** fetch data from the table in a streaming manner : "images" */
    images_stream: Array<GraphQLTypes["images"]>;
    /** fetch data from the table: "invitations" */
    invitations: Array<GraphQLTypes["invitations"]>;
    /** fetch aggregated fields from the table: "invitations" */
    invitations_aggregate: GraphQLTypes["invitations_aggregate"];
    /** fetch data from the table in a streaming manner : "invitations" */
    invitations_stream: Array<GraphQLTypes["invitations"]>;
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
  ["uuid"]: "scalar" & { name: "uuid" };
  /** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
  ["uuid_comparison_exp"]: {
    _eq?: GraphQLTypes["uuid"] | undefined;
    _gt?: GraphQLTypes["uuid"] | undefined;
    _gte?: GraphQLTypes["uuid"] | undefined;
    _in?: Array<GraphQLTypes["uuid"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: GraphQLTypes["uuid"] | undefined;
    _lte?: GraphQLTypes["uuid"] | undefined;
    _neq?: GraphQLTypes["uuid"] | undefined;
    _nin?: Array<GraphQLTypes["uuid"]> | undefined;
  };
};
/** unique or primary key constraints on table "auth.invitations" */
export const enum auth_invitations_constraint {
  invitations_pkey = "invitations_pkey",
}
/** select columns of table "auth.invitations" */
export const enum auth_invitations_select_column {
  created_at = "created_at",
  data = "data",
  id = "id",
}
/** update columns of table "auth.invitations" */
export const enum auth_invitations_update_column {
  created_at = "created_at",
  data = "data",
  id = "id",
}
/** unique or primary key constraints on table "auth.users" */
export const enum auth_users_constraint {
  users_invitation_id_key = "users_invitation_id_key",
  users_pkey = "users_pkey",
  users_pubkey_key = "users_pubkey_key",
  users_username_key = "users_username_key",
}
/** select columns of table "auth.users" */
export const enum auth_users_select_column {
  blockchain = "blockchain",
  created_at = "created_at",
  id = "id",
  invitation_id = "invitation_id",
  last_active_at = "last_active_at",
  pubkey = "pubkey",
  updated_at = "updated_at",
  username = "username",
  waitlist_id = "waitlist_id",
}
/** update columns of table "auth.users" */
export const enum auth_users_update_column {
  blockchain = "blockchain",
  created_at = "created_at",
  id = "id",
  invitation_id = "invitation_id",
  last_active_at = "last_active_at",
  pubkey = "pubkey",
  updated_at = "updated_at",
  username = "username",
  waitlist_id = "waitlist_id",
}
/** ordering argument of a cursor */
export const enum cursor_ordering {
  ASC = "ASC",
  DESC = "DESC",
}
/** unique or primary key constraints on table "images" */
export const enum images_constraint {
  images_invite_code_key = "images_invite_code_key",
  images_pkey = "images_pkey",
  images_prompt_key = "images_prompt_key",
  images_uri_key = "images_uri_key",
}
/** select columns of table "images" */
export const enum images_select_column {
  completed = "completed",
  created_at = "created_at",
  id = "id",
  invite_code = "invite_code",
  prompt = "prompt",
  uri = "uri",
  winner = "winner",
}
/** update columns of table "images" */
export const enum images_update_column {
  completed = "completed",
  created_at = "created_at",
  id = "id",
  invite_code = "invite_code",
  prompt = "prompt",
  uri = "uri",
  winner = "winner",
}
/** select columns of table "invitations" */
export const enum invitations_select_column {
  claimed_at = "claimed_at",
  id = "id",
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
  ["Boolean_comparison_exp"]: ValueTypes["Boolean_comparison_exp"];
  ["Int_comparison_exp"]: ValueTypes["Int_comparison_exp"];
  ["String_comparison_exp"]: ValueTypes["String_comparison_exp"];
  ["auth_invitations_append_input"]: ValueTypes["auth_invitations_append_input"];
  ["auth_invitations_bool_exp"]: ValueTypes["auth_invitations_bool_exp"];
  ["auth_invitations_constraint"]: ValueTypes["auth_invitations_constraint"];
  ["auth_invitations_delete_at_path_input"]: ValueTypes["auth_invitations_delete_at_path_input"];
  ["auth_invitations_delete_elem_input"]: ValueTypes["auth_invitations_delete_elem_input"];
  ["auth_invitations_delete_key_input"]: ValueTypes["auth_invitations_delete_key_input"];
  ["auth_invitations_insert_input"]: ValueTypes["auth_invitations_insert_input"];
  ["auth_invitations_obj_rel_insert_input"]: ValueTypes["auth_invitations_obj_rel_insert_input"];
  ["auth_invitations_on_conflict"]: ValueTypes["auth_invitations_on_conflict"];
  ["auth_invitations_order_by"]: ValueTypes["auth_invitations_order_by"];
  ["auth_invitations_pk_columns_input"]: ValueTypes["auth_invitations_pk_columns_input"];
  ["auth_invitations_prepend_input"]: ValueTypes["auth_invitations_prepend_input"];
  ["auth_invitations_select_column"]: ValueTypes["auth_invitations_select_column"];
  ["auth_invitations_set_input"]: ValueTypes["auth_invitations_set_input"];
  ["auth_invitations_stream_cursor_input"]: ValueTypes["auth_invitations_stream_cursor_input"];
  ["auth_invitations_stream_cursor_value_input"]: ValueTypes["auth_invitations_stream_cursor_value_input"];
  ["auth_invitations_update_column"]: ValueTypes["auth_invitations_update_column"];
  ["auth_invitations_updates"]: ValueTypes["auth_invitations_updates"];
  ["auth_users_bool_exp"]: ValueTypes["auth_users_bool_exp"];
  ["auth_users_constraint"]: ValueTypes["auth_users_constraint"];
  ["auth_users_insert_input"]: ValueTypes["auth_users_insert_input"];
  ["auth_users_on_conflict"]: ValueTypes["auth_users_on_conflict"];
  ["auth_users_order_by"]: ValueTypes["auth_users_order_by"];
  ["auth_users_pk_columns_input"]: ValueTypes["auth_users_pk_columns_input"];
  ["auth_users_select_column"]: ValueTypes["auth_users_select_column"];
  ["auth_users_set_input"]: ValueTypes["auth_users_set_input"];
  ["auth_users_stream_cursor_input"]: ValueTypes["auth_users_stream_cursor_input"];
  ["auth_users_stream_cursor_value_input"]: ValueTypes["auth_users_stream_cursor_value_input"];
  ["auth_users_update_column"]: ValueTypes["auth_users_update_column"];
  ["auth_users_updates"]: ValueTypes["auth_users_updates"];
  ["citext"]: ValueTypes["citext"];
  ["citext_comparison_exp"]: ValueTypes["citext_comparison_exp"];
  ["cursor_ordering"]: ValueTypes["cursor_ordering"];
  ["images_bool_exp"]: ValueTypes["images_bool_exp"];
  ["images_constraint"]: ValueTypes["images_constraint"];
  ["images_inc_input"]: ValueTypes["images_inc_input"];
  ["images_insert_input"]: ValueTypes["images_insert_input"];
  ["images_on_conflict"]: ValueTypes["images_on_conflict"];
  ["images_order_by"]: ValueTypes["images_order_by"];
  ["images_pk_columns_input"]: ValueTypes["images_pk_columns_input"];
  ["images_select_column"]: ValueTypes["images_select_column"];
  ["images_set_input"]: ValueTypes["images_set_input"];
  ["images_stream_cursor_input"]: ValueTypes["images_stream_cursor_input"];
  ["images_stream_cursor_value_input"]: ValueTypes["images_stream_cursor_value_input"];
  ["images_update_column"]: ValueTypes["images_update_column"];
  ["images_updates"]: ValueTypes["images_updates"];
  ["invitations_bool_exp"]: ValueTypes["invitations_bool_exp"];
  ["invitations_order_by"]: ValueTypes["invitations_order_by"];
  ["invitations_select_column"]: ValueTypes["invitations_select_column"];
  ["invitations_stream_cursor_input"]: ValueTypes["invitations_stream_cursor_input"];
  ["invitations_stream_cursor_value_input"]: ValueTypes["invitations_stream_cursor_value_input"];
  ["jsonb"]: ValueTypes["jsonb"];
  ["jsonb_cast_exp"]: ValueTypes["jsonb_cast_exp"];
  ["jsonb_comparison_exp"]: ValueTypes["jsonb_comparison_exp"];
  ["order_by"]: ValueTypes["order_by"];
  ["timestamptz"]: ValueTypes["timestamptz"];
  ["timestamptz_comparison_exp"]: ValueTypes["timestamptz_comparison_exp"];
  ["uuid"]: ValueTypes["uuid"];
  ["uuid_comparison_exp"]: ValueTypes["uuid_comparison_exp"];
};
