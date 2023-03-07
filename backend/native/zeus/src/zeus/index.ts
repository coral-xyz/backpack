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
  ? (typeof Ops)[O]
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
  users_scalar?: ScalarResolver;
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
  /** columns and relationships of "auth.collection_messages" */
  ["auth_collection_messages"]: AliasType<{
    collection_id?: boolean | `@${string}`;
    last_read_message_id?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.collection_messages". All fields are combined with a logical 'AND'. */
  ["auth_collection_messages_bool_exp"]: {
    _and?:
      | Array<ValueTypes["auth_collection_messages_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["auth_collection_messages_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["auth_collection_messages_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    collection_id?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    last_read_message_id?:
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
  /** unique or primary key constraints on table "auth.collection_messages" */
  ["auth_collection_messages_constraint"]: auth_collection_messages_constraint;
  /** input type for inserting data into table "auth.collection_messages" */
  ["auth_collection_messages_insert_input"]: {
    collection_id?: string | undefined | null | Variable<any, string>;
    last_read_message_id?: string | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "auth.collection_messages" */
  ["auth_collection_messages_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_collection_messages"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.collection_messages" */
  ["auth_collection_messages_on_conflict"]: {
    constraint:
      | ValueTypes["auth_collection_messages_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["auth_collection_messages_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["auth_collection_messages_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "auth.collection_messages". */
  ["auth_collection_messages_order_by"]: {
    collection_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    last_read_message_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    uuid?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: auth.collection_messages */
  ["auth_collection_messages_pk_columns_input"]: {
    collection_id: string | Variable<any, string>;
    uuid: string | Variable<any, string>;
  };
  /** select columns of table "auth.collection_messages" */
  ["auth_collection_messages_select_column"]: auth_collection_messages_select_column;
  /** input type for updating data in table "auth.collection_messages" */
  ["auth_collection_messages_set_input"]: {
    collection_id?: string | undefined | null | Variable<any, string>;
    last_read_message_id?: string | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "auth_collection_messages" */
  ["auth_collection_messages_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["auth_collection_messages_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_collection_messages_stream_cursor_value_input"]: {
    collection_id?: string | undefined | null | Variable<any, string>;
    last_read_message_id?: string | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
  };
  /** update columns of table "auth.collection_messages" */
  ["auth_collection_messages_update_column"]: auth_collection_messages_update_column;
  ["auth_collection_messages_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["auth_collection_messages_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where:
      | ValueTypes["auth_collection_messages_bool_exp"]
      | Variable<any, string>;
  };
  /** columns and relationships of "auth.collections" */
  ["auth_collections"]: AliasType<{
    collection_id?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    last_message?: boolean | `@${string}`;
    last_message_timestamp?: boolean | `@${string}`;
    last_message_uuid?: boolean | `@${string}`;
    type?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.collections". All fields are combined with a logical 'AND'. */
  ["auth_collections_bool_exp"]: {
    _and?:
      | Array<ValueTypes["auth_collections_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["auth_collections_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["auth_collections_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    collection_id?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    last_message?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    last_message_timestamp?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    last_message_uuid?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    type?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "auth.collections" */
  ["auth_collections_constraint"]: auth_collections_constraint;
  /** input type for incrementing numeric columns in table "auth.collections" */
  ["auth_collections_inc_input"]: {
    id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "auth.collections" */
  ["auth_collections_insert_input"]: {
    collection_id?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    last_message?: string | undefined | null | Variable<any, string>;
    last_message_timestamp?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    last_message_uuid?: string | undefined | null | Variable<any, string>;
    type?: string | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "auth.collections" */
  ["auth_collections_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_collections"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.collections" */
  ["auth_collections_on_conflict"]: {
    constraint:
      | ValueTypes["auth_collections_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["auth_collections_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["auth_collections_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "auth.collections". */
  ["auth_collections_order_by"]: {
    collection_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    last_message?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    last_message_timestamp?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    last_message_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    type?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: auth.collections */
  ["auth_collections_pk_columns_input"]: {
    id: number | Variable<any, string>;
  };
  /** select columns of table "auth.collections" */
  ["auth_collections_select_column"]: auth_collections_select_column;
  /** input type for updating data in table "auth.collections" */
  ["auth_collections_set_input"]: {
    collection_id?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    last_message?: string | undefined | null | Variable<any, string>;
    last_message_timestamp?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    last_message_uuid?: string | undefined | null | Variable<any, string>;
    type?: string | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "auth_collections" */
  ["auth_collections_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["auth_collections_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_collections_stream_cursor_value_input"]: {
    collection_id?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    last_message?: string | undefined | null | Variable<any, string>;
    last_message_timestamp?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    last_message_uuid?: string | undefined | null | Variable<any, string>;
    type?: string | undefined | null | Variable<any, string>;
  };
  /** update columns of table "auth.collections" */
  ["auth_collections_update_column"]: auth_collections_update_column;
  ["auth_collections_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["auth_collections_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["auth_collections_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["auth_collections_bool_exp"] | Variable<any, string>;
  };
  /** columns and relationships of "auth.friend_requests" */
  ["auth_friend_requests"]: AliasType<{
    from?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.friend_requests". All fields are combined with a logical 'AND'. */
  ["auth_friend_requests_bool_exp"]: {
    _and?:
      | Array<ValueTypes["auth_friend_requests_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["auth_friend_requests_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["auth_friend_requests_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    from?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    to?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "auth.friend_requests" */
  ["auth_friend_requests_constraint"]: auth_friend_requests_constraint;
  /** input type for inserting data into table "auth.friend_requests" */
  ["auth_friend_requests_insert_input"]: {
    from?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    to?: string | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "auth.friend_requests" */
  ["auth_friend_requests_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_friend_requests"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.friend_requests" */
  ["auth_friend_requests_on_conflict"]: {
    constraint:
      | ValueTypes["auth_friend_requests_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["auth_friend_requests_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["auth_friend_requests_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "auth.friend_requests". */
  ["auth_friend_requests_order_by"]: {
    from?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    to?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** select columns of table "auth.friend_requests" */
  ["auth_friend_requests_select_column"]: auth_friend_requests_select_column;
  /** Streaming cursor of the table "auth_friend_requests" */
  ["auth_friend_requests_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["auth_friend_requests_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_friend_requests_stream_cursor_value_input"]: {
    from?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    to?: string | undefined | null | Variable<any, string>;
  };
  /** placeholder for update columns of table "auth.friend_requests" (current role has no relevant permissions) */
  ["auth_friend_requests_update_column"]: auth_friend_requests_update_column;
  /** columns and relationships of "auth.friendships" */
  ["auth_friendships"]: AliasType<{
    are_friends?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    last_message?: boolean | `@${string}`;
    last_message_client_uuid?: boolean | `@${string}`;
    last_message_sender?: boolean | `@${string}`;
    last_message_timestamp?: boolean | `@${string}`;
    user1?: boolean | `@${string}`;
    user1_blocked_user2?: boolean | `@${string}`;
    user1_interacted?: boolean | `@${string}`;
    user1_last_read_message_id?: boolean | `@${string}`;
    user1_spam_user2?: boolean | `@${string}`;
    user2?: boolean | `@${string}`;
    user2_blocked_user1?: boolean | `@${string}`;
    user2_interacted?: boolean | `@${string}`;
    user2_last_read_message_id?: boolean | `@${string}`;
    user2_spam_user1?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "auth.friendships" */
  ["auth_friendships_aggregate"]: AliasType<{
    aggregate?: ValueTypes["auth_friendships_aggregate_fields"];
    nodes?: ValueTypes["auth_friendships"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "auth.friendships" */
  ["auth_friendships_aggregate_fields"]: AliasType<{
    avg?: ValueTypes["auth_friendships_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ValueTypes["auth_friendships_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`
    ];
    max?: ValueTypes["auth_friendships_max_fields"];
    min?: ValueTypes["auth_friendships_min_fields"];
    stddev?: ValueTypes["auth_friendships_stddev_fields"];
    stddev_pop?: ValueTypes["auth_friendships_stddev_pop_fields"];
    stddev_samp?: ValueTypes["auth_friendships_stddev_samp_fields"];
    sum?: ValueTypes["auth_friendships_sum_fields"];
    var_pop?: ValueTypes["auth_friendships_var_pop_fields"];
    var_samp?: ValueTypes["auth_friendships_var_samp_fields"];
    variance?: ValueTypes["auth_friendships_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate avg on columns */
  ["auth_friendships_avg_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.friendships". All fields are combined with a logical 'AND'. */
  ["auth_friendships_bool_exp"]: {
    _and?:
      | Array<ValueTypes["auth_friendships_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["auth_friendships_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["auth_friendships_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    are_friends?:
      | ValueTypes["Boolean_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    last_message?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    last_message_client_uuid?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    last_message_sender?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    last_message_timestamp?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user1?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user1_blocked_user2?:
      | ValueTypes["Boolean_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user1_interacted?:
      | ValueTypes["Boolean_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user1_last_read_message_id?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user1_spam_user2?:
      | ValueTypes["Boolean_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user2?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user2_blocked_user1?:
      | ValueTypes["Boolean_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user2_interacted?:
      | ValueTypes["Boolean_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user2_last_read_message_id?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user2_spam_user1?:
      | ValueTypes["Boolean_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "auth.friendships" */
  ["auth_friendships_constraint"]: auth_friendships_constraint;
  /** input type for incrementing numeric columns in table "auth.friendships" */
  ["auth_friendships_inc_input"]: {
    id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "auth.friendships" */
  ["auth_friendships_insert_input"]: {
    are_friends?: boolean | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    last_message?: string | undefined | null | Variable<any, string>;
    last_message_client_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    last_message_sender?: string | undefined | null | Variable<any, string>;
    last_message_timestamp?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    user1?: string | undefined | null | Variable<any, string>;
    user1_blocked_user2?: boolean | undefined | null | Variable<any, string>;
    user1_interacted?: boolean | undefined | null | Variable<any, string>;
    user1_last_read_message_id?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    user1_spam_user2?: boolean | undefined | null | Variable<any, string>;
    user2?: string | undefined | null | Variable<any, string>;
    user2_blocked_user1?: boolean | undefined | null | Variable<any, string>;
    user2_interacted?: boolean | undefined | null | Variable<any, string>;
    user2_last_read_message_id?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    user2_spam_user1?: boolean | undefined | null | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["auth_friendships_max_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    last_message?: boolean | `@${string}`;
    last_message_client_uuid?: boolean | `@${string}`;
    last_message_sender?: boolean | `@${string}`;
    last_message_timestamp?: boolean | `@${string}`;
    user1?: boolean | `@${string}`;
    user1_last_read_message_id?: boolean | `@${string}`;
    user2?: boolean | `@${string}`;
    user2_last_read_message_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["auth_friendships_min_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    last_message?: boolean | `@${string}`;
    last_message_client_uuid?: boolean | `@${string}`;
    last_message_sender?: boolean | `@${string}`;
    last_message_timestamp?: boolean | `@${string}`;
    user1?: boolean | `@${string}`;
    user1_last_read_message_id?: boolean | `@${string}`;
    user2?: boolean | `@${string}`;
    user2_last_read_message_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "auth.friendships" */
  ["auth_friendships_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_friendships"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.friendships" */
  ["auth_friendships_on_conflict"]: {
    constraint:
      | ValueTypes["auth_friendships_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["auth_friendships_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["auth_friendships_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "auth.friendships". */
  ["auth_friendships_order_by"]: {
    are_friends?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    last_message?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    last_message_client_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    last_message_sender?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    last_message_timestamp?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user1?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    user1_blocked_user2?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user1_interacted?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user1_last_read_message_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user1_spam_user2?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user2?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    user2_blocked_user1?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user2_interacted?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user2_last_read_message_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user2_spam_user1?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: auth.friendships */
  ["auth_friendships_pk_columns_input"]: {
    user1: string | Variable<any, string>;
    user2: string | Variable<any, string>;
  };
  /** select columns of table "auth.friendships" */
  ["auth_friendships_select_column"]: auth_friendships_select_column;
  /** input type for updating data in table "auth.friendships" */
  ["auth_friendships_set_input"]: {
    are_friends?: boolean | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    last_message?: string | undefined | null | Variable<any, string>;
    last_message_client_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    last_message_sender?: string | undefined | null | Variable<any, string>;
    last_message_timestamp?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    user1?: string | undefined | null | Variable<any, string>;
    user1_blocked_user2?: boolean | undefined | null | Variable<any, string>;
    user1_interacted?: boolean | undefined | null | Variable<any, string>;
    user1_last_read_message_id?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    user1_spam_user2?: boolean | undefined | null | Variable<any, string>;
    user2?: string | undefined | null | Variable<any, string>;
    user2_blocked_user1?: boolean | undefined | null | Variable<any, string>;
    user2_interacted?: boolean | undefined | null | Variable<any, string>;
    user2_last_read_message_id?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    user2_spam_user1?: boolean | undefined | null | Variable<any, string>;
  };
  /** aggregate stddev on columns */
  ["auth_friendships_stddev_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_pop on columns */
  ["auth_friendships_stddev_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_samp on columns */
  ["auth_friendships_stddev_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Streaming cursor of the table "auth_friendships" */
  ["auth_friendships_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["auth_friendships_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_friendships_stream_cursor_value_input"]: {
    are_friends?: boolean | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    last_message?: string | undefined | null | Variable<any, string>;
    last_message_client_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    last_message_sender?: string | undefined | null | Variable<any, string>;
    last_message_timestamp?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    user1?: string | undefined | null | Variable<any, string>;
    user1_blocked_user2?: boolean | undefined | null | Variable<any, string>;
    user1_interacted?: boolean | undefined | null | Variable<any, string>;
    user1_last_read_message_id?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    user1_spam_user2?: boolean | undefined | null | Variable<any, string>;
    user2?: string | undefined | null | Variable<any, string>;
    user2_blocked_user1?: boolean | undefined | null | Variable<any, string>;
    user2_interacted?: boolean | undefined | null | Variable<any, string>;
    user2_last_read_message_id?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    user2_spam_user1?: boolean | undefined | null | Variable<any, string>;
  };
  /** aggregate sum on columns */
  ["auth_friendships_sum_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** update columns of table "auth.friendships" */
  ["auth_friendships_update_column"]: auth_friendships_update_column;
  ["auth_friendships_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["auth_friendships_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["auth_friendships_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["auth_friendships_bool_exp"] | Variable<any, string>;
  };
  /** aggregate var_pop on columns */
  ["auth_friendships_var_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate var_samp on columns */
  ["auth_friendships_var_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate variance on columns */
  ["auth_friendships_variance_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
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
    /** An object relationship */
    user?: ValueTypes["auth_users"];
    __typename?: boolean | `@${string}`;
  }>;
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
    user?:
      | ValueTypes["auth_users_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "auth.invitations" */
  ["auth_invitations_constraint"]: auth_invitations_constraint;
  /** input type for inserting data into table "auth.invitations" */
  ["auth_invitations_insert_input"]: {
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    data?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    user?:
      | ValueTypes["auth_users_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
  };
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
    user?:
      | ValueTypes["auth_users_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** select columns of table "auth.invitations" */
  ["auth_invitations_select_column"]: auth_invitations_select_column;
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
  /** placeholder for update columns of table "auth.invitations" (current role has no relevant permissions) */
  ["auth_invitations_update_column"]: auth_invitations_update_column;
  /** columns and relationships of "auth.notification_cursor" */
  ["auth_notification_cursor"]: AliasType<{
    last_read_notificaiton?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.notification_cursor". All fields are combined with a logical 'AND'. */
  ["auth_notification_cursor_bool_exp"]: {
    _and?:
      | Array<ValueTypes["auth_notification_cursor_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["auth_notification_cursor_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["auth_notification_cursor_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    last_read_notificaiton?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    uuid?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "auth.notification_cursor" */
  ["auth_notification_cursor_constraint"]: auth_notification_cursor_constraint;
  /** input type for incrementing numeric columns in table "auth.notification_cursor" */
  ["auth_notification_cursor_inc_input"]: {
    last_read_notificaiton?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "auth.notification_cursor" */
  ["auth_notification_cursor_insert_input"]: {
    last_read_notificaiton?: number | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "auth.notification_cursor" */
  ["auth_notification_cursor_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_notification_cursor"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.notification_cursor" */
  ["auth_notification_cursor_on_conflict"]: {
    constraint:
      | ValueTypes["auth_notification_cursor_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["auth_notification_cursor_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["auth_notification_cursor_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "auth.notification_cursor". */
  ["auth_notification_cursor_order_by"]: {
    last_read_notificaiton?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    uuid?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: auth.notification_cursor */
  ["auth_notification_cursor_pk_columns_input"]: {
    uuid: string | Variable<any, string>;
  };
  /** select columns of table "auth.notification_cursor" */
  ["auth_notification_cursor_select_column"]: auth_notification_cursor_select_column;
  /** input type for updating data in table "auth.notification_cursor" */
  ["auth_notification_cursor_set_input"]: {
    last_read_notificaiton?: number | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "auth_notification_cursor" */
  ["auth_notification_cursor_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["auth_notification_cursor_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_notification_cursor_stream_cursor_value_input"]: {
    last_read_notificaiton?: number | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
  };
  /** update columns of table "auth.notification_cursor" */
  ["auth_notification_cursor_update_column"]: auth_notification_cursor_update_column;
  ["auth_notification_cursor_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["auth_notification_cursor_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["auth_notification_cursor_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where:
      | ValueTypes["auth_notification_cursor_bool_exp"]
      | Variable<any, string>;
  };
  /** columns and relationships of "auth.notification_subscriptions" */
  ["auth_notification_subscriptions"]: AliasType<{
    auth?: boolean | `@${string}`;
    endpoint?: boolean | `@${string}`;
    expirationTime?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    p256dh?: boolean | `@${string}`;
    public_key?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.notification_subscriptions". All fields are combined with a logical 'AND'. */
  ["auth_notification_subscriptions_bool_exp"]: {
    _and?:
      | Array<ValueTypes["auth_notification_subscriptions_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["auth_notification_subscriptions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["auth_notification_subscriptions_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    auth?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    endpoint?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    expirationTime?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    p256dh?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    public_key?:
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
  /** unique or primary key constraints on table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_constraint"]: auth_notification_subscriptions_constraint;
  /** input type for incrementing numeric columns in table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_inc_input"]: {
    id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_insert_input"]: {
    auth?: string | undefined | null | Variable<any, string>;
    endpoint?: string | undefined | null | Variable<any, string>;
    expirationTime?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    p256dh?: string | undefined | null | Variable<any, string>;
    public_key?: string | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_notification_subscriptions"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_on_conflict"]: {
    constraint:
      | ValueTypes["auth_notification_subscriptions_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["auth_notification_subscriptions_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["auth_notification_subscriptions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "auth.notification_subscriptions". */
  ["auth_notification_subscriptions_order_by"]: {
    auth?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    endpoint?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    expirationTime?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    p256dh?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    public_key?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    username?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    uuid?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: auth.notification_subscriptions */
  ["auth_notification_subscriptions_pk_columns_input"]: {
    id: number | Variable<any, string>;
  };
  /** select columns of table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_select_column"]: auth_notification_subscriptions_select_column;
  /** input type for updating data in table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_set_input"]: {
    auth?: string | undefined | null | Variable<any, string>;
    endpoint?: string | undefined | null | Variable<any, string>;
    expirationTime?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    p256dh?: string | undefined | null | Variable<any, string>;
    public_key?: string | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "auth_notification_subscriptions" */
  ["auth_notification_subscriptions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["auth_notification_subscriptions_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_notification_subscriptions_stream_cursor_value_input"]: {
    auth?: string | undefined | null | Variable<any, string>;
    endpoint?: string | undefined | null | Variable<any, string>;
    expirationTime?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    p256dh?: string | undefined | null | Variable<any, string>;
    public_key?: string | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
  };
  /** update columns of table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_update_column"]: auth_notification_subscriptions_update_column;
  ["auth_notification_subscriptions_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["auth_notification_subscriptions_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["auth_notification_subscriptions_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where:
      | ValueTypes["auth_notification_subscriptions_bool_exp"]
      | Variable<any, string>;
  };
  /** columns and relationships of "auth.notifications" */
  ["auth_notifications"]: AliasType<{
    body?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    image?: boolean | `@${string}`;
    timestamp?: boolean | `@${string}`;
    title?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    viewed?: boolean | `@${string}`;
    xnft_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "auth.notifications" */
  ["auth_notifications_aggregate"]: AliasType<{
    aggregate?: ValueTypes["auth_notifications_aggregate_fields"];
    nodes?: ValueTypes["auth_notifications"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "auth.notifications" */
  ["auth_notifications_aggregate_fields"]: AliasType<{
    avg?: ValueTypes["auth_notifications_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ValueTypes["auth_notifications_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`
    ];
    max?: ValueTypes["auth_notifications_max_fields"];
    min?: ValueTypes["auth_notifications_min_fields"];
    stddev?: ValueTypes["auth_notifications_stddev_fields"];
    stddev_pop?: ValueTypes["auth_notifications_stddev_pop_fields"];
    stddev_samp?: ValueTypes["auth_notifications_stddev_samp_fields"];
    sum?: ValueTypes["auth_notifications_sum_fields"];
    var_pop?: ValueTypes["auth_notifications_var_pop_fields"];
    var_samp?: ValueTypes["auth_notifications_var_samp_fields"];
    variance?: ValueTypes["auth_notifications_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate avg on columns */
  ["auth_notifications_avg_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.notifications". All fields are combined with a logical 'AND'. */
  ["auth_notifications_bool_exp"]: {
    _and?:
      | Array<ValueTypes["auth_notifications_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["auth_notifications_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["auth_notifications_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    body?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    image?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    timestamp?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    title?:
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
    viewed?:
      | ValueTypes["Boolean_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    xnft_id?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "auth.notifications" */
  ["auth_notifications_constraint"]: auth_notifications_constraint;
  /** input type for incrementing numeric columns in table "auth.notifications" */
  ["auth_notifications_inc_input"]: {
    id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "auth.notifications" */
  ["auth_notifications_insert_input"]: {
    body?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    image?: string | undefined | null | Variable<any, string>;
    timestamp?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    title?: string | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
    viewed?: boolean | undefined | null | Variable<any, string>;
    xnft_id?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["auth_notifications_max_fields"]: AliasType<{
    body?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    image?: boolean | `@${string}`;
    timestamp?: boolean | `@${string}`;
    title?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    xnft_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["auth_notifications_min_fields"]: AliasType<{
    body?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    image?: boolean | `@${string}`;
    timestamp?: boolean | `@${string}`;
    title?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    xnft_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "auth.notifications" */
  ["auth_notifications_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_notifications"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.notifications" */
  ["auth_notifications_on_conflict"]: {
    constraint:
      | ValueTypes["auth_notifications_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["auth_notifications_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["auth_notifications_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "auth.notifications". */
  ["auth_notifications_order_by"]: {
    body?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    image?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    timestamp?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    title?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    username?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    uuid?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    viewed?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    xnft_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: auth.notifications */
  ["auth_notifications_pk_columns_input"]: {
    id: number | Variable<any, string>;
  };
  /** select columns of table "auth.notifications" */
  ["auth_notifications_select_column"]: auth_notifications_select_column;
  /** input type for updating data in table "auth.notifications" */
  ["auth_notifications_set_input"]: {
    body?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    image?: string | undefined | null | Variable<any, string>;
    title?: string | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
    viewed?: boolean | undefined | null | Variable<any, string>;
    xnft_id?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate stddev on columns */
  ["auth_notifications_stddev_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_pop on columns */
  ["auth_notifications_stddev_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_samp on columns */
  ["auth_notifications_stddev_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Streaming cursor of the table "auth_notifications" */
  ["auth_notifications_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["auth_notifications_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_notifications_stream_cursor_value_input"]: {
    body?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    image?: string | undefined | null | Variable<any, string>;
    timestamp?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    title?: string | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
    viewed?: boolean | undefined | null | Variable<any, string>;
    xnft_id?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate sum on columns */
  ["auth_notifications_sum_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** update columns of table "auth.notifications" */
  ["auth_notifications_update_column"]: auth_notifications_update_column;
  ["auth_notifications_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["auth_notifications_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["auth_notifications_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["auth_notifications_bool_exp"] | Variable<any, string>;
  };
  /** aggregate var_pop on columns */
  ["auth_notifications_var_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate var_samp on columns */
  ["auth_notifications_var_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate variance on columns */
  ["auth_notifications_variance_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** columns and relationships of "auth.public_keys" */
  ["auth_public_keys"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    public_key?: boolean | `@${string}`;
    /** An object relationship */
    user?: ValueTypes["auth_users"];
    user_active_publickey_mappings?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<
              ValueTypes["auth_user_active_publickey_mapping_select_column"]
            >
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
          | Array<ValueTypes["auth_user_active_publickey_mapping_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_user_active_publickey_mapping_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_user_active_publickey_mapping"]
    ];
    user_id?: boolean | `@${string}`;
    user_nfts?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_user_nfts_select_column"]>
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
          | Array<ValueTypes["auth_user_nfts_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_user_nfts_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_user_nfts"]
    ];
    user_nfts_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_user_nfts_select_column"]>
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
          | Array<ValueTypes["auth_user_nfts_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_user_nfts_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_user_nfts_aggregate"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "auth.public_keys" */
  ["auth_public_keys_aggregate"]: AliasType<{
    aggregate?: ValueTypes["auth_public_keys_aggregate_fields"];
    nodes?: ValueTypes["auth_public_keys"];
    __typename?: boolean | `@${string}`;
  }>;
  ["auth_public_keys_aggregate_bool_exp"]: {
    count?:
      | ValueTypes["auth_public_keys_aggregate_bool_exp_count"]
      | undefined
      | null
      | Variable<any, string>;
  };
  ["auth_public_keys_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ValueTypes["auth_public_keys_select_column"]>
      | undefined
      | null
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["auth_public_keys_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["Int_comparison_exp"] | Variable<any, string>;
  };
  /** aggregate fields of "auth.public_keys" */
  ["auth_public_keys_aggregate_fields"]: AliasType<{
    avg?: ValueTypes["auth_public_keys_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ValueTypes["auth_public_keys_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`
    ];
    max?: ValueTypes["auth_public_keys_max_fields"];
    min?: ValueTypes["auth_public_keys_min_fields"];
    stddev?: ValueTypes["auth_public_keys_stddev_fields"];
    stddev_pop?: ValueTypes["auth_public_keys_stddev_pop_fields"];
    stddev_samp?: ValueTypes["auth_public_keys_stddev_samp_fields"];
    sum?: ValueTypes["auth_public_keys_sum_fields"];
    var_pop?: ValueTypes["auth_public_keys_var_pop_fields"];
    var_samp?: ValueTypes["auth_public_keys_var_samp_fields"];
    variance?: ValueTypes["auth_public_keys_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "auth.public_keys" */
  ["auth_public_keys_aggregate_order_by"]: {
    avg?:
      | ValueTypes["auth_public_keys_avg_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["auth_public_keys_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["auth_public_keys_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev?:
      | ValueTypes["auth_public_keys_stddev_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_pop?:
      | ValueTypes["auth_public_keys_stddev_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_samp?:
      | ValueTypes["auth_public_keys_stddev_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    sum?:
      | ValueTypes["auth_public_keys_sum_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_pop?:
      | ValueTypes["auth_public_keys_var_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_samp?:
      | ValueTypes["auth_public_keys_var_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    variance?:
      | ValueTypes["auth_public_keys_variance_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "auth.public_keys" */
  ["auth_public_keys_arr_rel_insert_input"]: {
    data:
      | Array<ValueTypes["auth_public_keys_insert_input"]>
      | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["auth_public_keys_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate avg on columns */
  ["auth_public_keys_avg_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by avg() on columns of table "auth.public_keys" */
  ["auth_public_keys_avg_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "auth.public_keys". All fields are combined with a logical 'AND'. */
  ["auth_public_keys_bool_exp"]: {
    _and?:
      | Array<ValueTypes["auth_public_keys_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["auth_public_keys_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["auth_public_keys_bool_exp"]>
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
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    public_key?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user?:
      | ValueTypes["auth_users_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user_active_publickey_mappings?:
      | ValueTypes["auth_user_active_publickey_mapping_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user_id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user_nfts?:
      | ValueTypes["auth_user_nfts_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user_nfts_aggregate?:
      | ValueTypes["auth_user_nfts_aggregate_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "auth.public_keys" */
  ["auth_public_keys_constraint"]: auth_public_keys_constraint;
  /** input type for inserting data into table "auth.public_keys" */
  ["auth_public_keys_insert_input"]: {
    blockchain?: string | undefined | null | Variable<any, string>;
    public_key?: string | undefined | null | Variable<any, string>;
    user?:
      | ValueTypes["auth_users_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    user_active_publickey_mappings?:
      | ValueTypes["auth_user_active_publickey_mapping_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    user_id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    user_nfts?:
      | ValueTypes["auth_user_nfts_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["auth_public_keys_max_fields"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    public_key?: boolean | `@${string}`;
    user_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "auth.public_keys" */
  ["auth_public_keys_max_order_by"]: {
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
    public_key?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** aggregate min on columns */
  ["auth_public_keys_min_fields"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    public_key?: boolean | `@${string}`;
    user_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "auth.public_keys" */
  ["auth_public_keys_min_order_by"]: {
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
    public_key?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "auth.public_keys" */
  ["auth_public_keys_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_public_keys"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "auth.public_keys" */
  ["auth_public_keys_obj_rel_insert_input"]: {
    data: ValueTypes["auth_public_keys_insert_input"] | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["auth_public_keys_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** on_conflict condition type for table "auth.public_keys" */
  ["auth_public_keys_on_conflict"]: {
    constraint:
      | ValueTypes["auth_public_keys_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["auth_public_keys_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["auth_public_keys_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "auth.public_keys". */
  ["auth_public_keys_order_by"]: {
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
    public_key?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user?:
      | ValueTypes["auth_users_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user_active_publickey_mappings_aggregate?:
      | ValueTypes["auth_user_active_publickey_mapping_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    user_nfts_aggregate?:
      | ValueTypes["auth_user_nfts_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** select columns of table "auth.public_keys" */
  ["auth_public_keys_select_column"]: auth_public_keys_select_column;
  /** aggregate stddev on columns */
  ["auth_public_keys_stddev_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by stddev() on columns of table "auth.public_keys" */
  ["auth_public_keys_stddev_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** aggregate stddev_pop on columns */
  ["auth_public_keys_stddev_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by stddev_pop() on columns of table "auth.public_keys" */
  ["auth_public_keys_stddev_pop_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** aggregate stddev_samp on columns */
  ["auth_public_keys_stddev_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by stddev_samp() on columns of table "auth.public_keys" */
  ["auth_public_keys_stddev_samp_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "auth_public_keys" */
  ["auth_public_keys_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["auth_public_keys_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_public_keys_stream_cursor_value_input"]: {
    blockchain?: string | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    public_key?: string | undefined | null | Variable<any, string>;
    user_id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
  };
  /** aggregate sum on columns */
  ["auth_public_keys_sum_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by sum() on columns of table "auth.public_keys" */
  ["auth_public_keys_sum_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** placeholder for update columns of table "auth.public_keys" (current role has no relevant permissions) */
  ["auth_public_keys_update_column"]: auth_public_keys_update_column;
  /** aggregate var_pop on columns */
  ["auth_public_keys_var_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by var_pop() on columns of table "auth.public_keys" */
  ["auth_public_keys_var_pop_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** aggregate var_samp on columns */
  ["auth_public_keys_var_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by var_samp() on columns of table "auth.public_keys" */
  ["auth_public_keys_var_samp_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** aggregate variance on columns */
  ["auth_public_keys_variance_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by variance() on columns of table "auth.public_keys" */
  ["auth_public_keys_variance_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** columns and relationships of "auth.stripe_onramp" */
  ["auth_stripe_onramp"]: AliasType<{
    client_secret?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    public_key?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    webhook_dump?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.stripe_onramp". All fields are combined with a logical 'AND'. */
  ["auth_stripe_onramp_bool_exp"]: {
    _and?:
      | Array<ValueTypes["auth_stripe_onramp_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["auth_stripe_onramp_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["auth_stripe_onramp_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    client_secret?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    public_key?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    status?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    webhook_dump?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "auth.stripe_onramp" */
  ["auth_stripe_onramp_constraint"]: auth_stripe_onramp_constraint;
  /** input type for incrementing numeric columns in table "auth.stripe_onramp" */
  ["auth_stripe_onramp_inc_input"]: {
    id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "auth.stripe_onramp" */
  ["auth_stripe_onramp_insert_input"]: {
    client_secret?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    public_key?: string | undefined | null | Variable<any, string>;
    status?: string | undefined | null | Variable<any, string>;
    webhook_dump?: string | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "auth.stripe_onramp" */
  ["auth_stripe_onramp_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_stripe_onramp"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.stripe_onramp" */
  ["auth_stripe_onramp_on_conflict"]: {
    constraint:
      | ValueTypes["auth_stripe_onramp_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["auth_stripe_onramp_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["auth_stripe_onramp_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "auth.stripe_onramp". */
  ["auth_stripe_onramp_order_by"]: {
    client_secret?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    public_key?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    status?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    webhook_dump?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: auth.stripe_onramp */
  ["auth_stripe_onramp_pk_columns_input"]: {
    client_secret: string | Variable<any, string>;
  };
  /** select columns of table "auth.stripe_onramp" */
  ["auth_stripe_onramp_select_column"]: auth_stripe_onramp_select_column;
  /** input type for updating data in table "auth.stripe_onramp" */
  ["auth_stripe_onramp_set_input"]: {
    client_secret?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    public_key?: string | undefined | null | Variable<any, string>;
    status?: string | undefined | null | Variable<any, string>;
    webhook_dump?: string | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "auth_stripe_onramp" */
  ["auth_stripe_onramp_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["auth_stripe_onramp_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_stripe_onramp_stream_cursor_value_input"]: {
    client_secret?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    public_key?: string | undefined | null | Variable<any, string>;
    status?: string | undefined | null | Variable<any, string>;
    webhook_dump?: string | undefined | null | Variable<any, string>;
  };
  /** update columns of table "auth.stripe_onramp" */
  ["auth_stripe_onramp_update_column"]: auth_stripe_onramp_update_column;
  ["auth_stripe_onramp_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["auth_stripe_onramp_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["auth_stripe_onramp_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["auth_stripe_onramp_bool_exp"] | Variable<any, string>;
  };
  /** columns and relationships of "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    /** An object relationship */
    public_key?: ValueTypes["auth_public_keys"];
    public_key_id?: boolean | `@${string}`;
    user_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_aggregate_order_by"]: {
    avg?:
      | ValueTypes["auth_user_active_publickey_mapping_avg_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["auth_user_active_publickey_mapping_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["auth_user_active_publickey_mapping_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev?:
      | ValueTypes["auth_user_active_publickey_mapping_stddev_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_pop?:
      | ValueTypes["auth_user_active_publickey_mapping_stddev_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_samp?:
      | ValueTypes["auth_user_active_publickey_mapping_stddev_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    sum?:
      | ValueTypes["auth_user_active_publickey_mapping_sum_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_pop?:
      | ValueTypes["auth_user_active_publickey_mapping_var_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_samp?:
      | ValueTypes["auth_user_active_publickey_mapping_var_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    variance?:
      | ValueTypes["auth_user_active_publickey_mapping_variance_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_arr_rel_insert_input"]: {
    data:
      | Array<ValueTypes["auth_user_active_publickey_mapping_insert_input"]>
      | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["auth_user_active_publickey_mapping_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by avg() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_avg_order_by"]: {
    public_key_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "auth.user_active_publickey_mapping". All fields are combined with a logical 'AND'. */
  ["auth_user_active_publickey_mapping_bool_exp"]: {
    _and?:
      | Array<ValueTypes["auth_user_active_publickey_mapping_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["auth_user_active_publickey_mapping_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["auth_user_active_publickey_mapping_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    blockchain?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    public_key?:
      | ValueTypes["auth_public_keys_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    public_key_id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user_id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_constraint"]: auth_user_active_publickey_mapping_constraint;
  /** input type for incrementing numeric columns in table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_inc_input"]: {
    public_key_id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_insert_input"]: {
    blockchain?: string | undefined | null | Variable<any, string>;
    public_key?:
      | ValueTypes["auth_public_keys_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    public_key_id?: number | undefined | null | Variable<any, string>;
    user_id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
  };
  /** order by max() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_max_order_by"]: {
    blockchain?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    public_key_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by min() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_min_order_by"]: {
    blockchain?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    public_key_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_user_active_publickey_mapping"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_on_conflict"]: {
    constraint:
      | ValueTypes["auth_user_active_publickey_mapping_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["auth_user_active_publickey_mapping_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["auth_user_active_publickey_mapping_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "auth.user_active_publickey_mapping". */
  ["auth_user_active_publickey_mapping_order_by"]: {
    blockchain?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    public_key?:
      | ValueTypes["auth_public_keys_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    public_key_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: auth.user_active_publickey_mapping */
  ["auth_user_active_publickey_mapping_pk_columns_input"]: {
    blockchain: string | Variable<any, string>;
    user_id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_select_column"]: auth_user_active_publickey_mapping_select_column;
  /** input type for updating data in table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_set_input"]: {
    blockchain?: string | undefined | null | Variable<any, string>;
    public_key_id?: number | undefined | null | Variable<any, string>;
    user_id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
  };
  /** order by stddev() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stddev_order_by"]: {
    public_key_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by stddev_pop() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stddev_pop_order_by"]: {
    public_key_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by stddev_samp() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stddev_samp_order_by"]: {
    public_key_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Streaming cursor of the table "auth_user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["auth_user_active_publickey_mapping_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_user_active_publickey_mapping_stream_cursor_value_input"]: {
    blockchain?: string | undefined | null | Variable<any, string>;
    public_key_id?: number | undefined | null | Variable<any, string>;
    user_id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
  };
  /** order by sum() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_sum_order_by"]: {
    public_key_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** update columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_update_column"]: auth_user_active_publickey_mapping_update_column;
  ["auth_user_active_publickey_mapping_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["auth_user_active_publickey_mapping_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["auth_user_active_publickey_mapping_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where:
      | ValueTypes["auth_user_active_publickey_mapping_bool_exp"]
      | Variable<any, string>;
  };
  /** order by var_pop() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_var_pop_order_by"]: {
    public_key_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by var_samp() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_var_samp_order_by"]: {
    public_key_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by variance() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_variance_order_by"]: {
    public_key_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** columns and relationships of "auth.user_nfts" */
  ["auth_user_nfts"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    centralized_group?: boolean | `@${string}`;
    collection_id?: boolean | `@${string}`;
    nft_id?: boolean | `@${string}`;
    /** An object relationship */
    publicKeyByBlockchainPublicKey?: ValueTypes["auth_public_keys"];
    public_key?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "auth.user_nfts" */
  ["auth_user_nfts_aggregate"]: AliasType<{
    aggregate?: ValueTypes["auth_user_nfts_aggregate_fields"];
    nodes?: ValueTypes["auth_user_nfts"];
    __typename?: boolean | `@${string}`;
  }>;
  ["auth_user_nfts_aggregate_bool_exp"]: {
    count?:
      | ValueTypes["auth_user_nfts_aggregate_bool_exp_count"]
      | undefined
      | null
      | Variable<any, string>;
  };
  ["auth_user_nfts_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ValueTypes["auth_user_nfts_select_column"]>
      | undefined
      | null
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["auth_user_nfts_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["Int_comparison_exp"] | Variable<any, string>;
  };
  /** aggregate fields of "auth.user_nfts" */
  ["auth_user_nfts_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["auth_user_nfts_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`
    ];
    max?: ValueTypes["auth_user_nfts_max_fields"];
    min?: ValueTypes["auth_user_nfts_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "auth.user_nfts" */
  ["auth_user_nfts_aggregate_order_by"]: {
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["auth_user_nfts_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["auth_user_nfts_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "auth.user_nfts" */
  ["auth_user_nfts_arr_rel_insert_input"]: {
    data:
      | Array<ValueTypes["auth_user_nfts_insert_input"]>
      | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["auth_user_nfts_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "auth.user_nfts". All fields are combined with a logical 'AND'. */
  ["auth_user_nfts_bool_exp"]: {
    _and?:
      | Array<ValueTypes["auth_user_nfts_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["auth_user_nfts_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["auth_user_nfts_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    blockchain?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    centralized_group?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    collection_id?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    nft_id?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    publicKeyByBlockchainPublicKey?:
      | ValueTypes["auth_public_keys_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    public_key?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "auth.user_nfts" */
  ["auth_user_nfts_constraint"]: auth_user_nfts_constraint;
  /** input type for inserting data into table "auth.user_nfts" */
  ["auth_user_nfts_insert_input"]: {
    blockchain?: string | undefined | null | Variable<any, string>;
    centralized_group?: string | undefined | null | Variable<any, string>;
    collection_id?: string | undefined | null | Variable<any, string>;
    nft_id?: string | undefined | null | Variable<any, string>;
    publicKeyByBlockchainPublicKey?:
      | ValueTypes["auth_public_keys_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    public_key?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["auth_user_nfts_max_fields"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    centralized_group?: boolean | `@${string}`;
    collection_id?: boolean | `@${string}`;
    nft_id?: boolean | `@${string}`;
    public_key?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "auth.user_nfts" */
  ["auth_user_nfts_max_order_by"]: {
    blockchain?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    centralized_group?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    collection_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    nft_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    public_key?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate min on columns */
  ["auth_user_nfts_min_fields"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    centralized_group?: boolean | `@${string}`;
    collection_id?: boolean | `@${string}`;
    nft_id?: boolean | `@${string}`;
    public_key?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "auth.user_nfts" */
  ["auth_user_nfts_min_order_by"]: {
    blockchain?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    centralized_group?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    collection_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    nft_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    public_key?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** response of any mutation on the table "auth.user_nfts" */
  ["auth_user_nfts_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_user_nfts"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.user_nfts" */
  ["auth_user_nfts_on_conflict"]: {
    constraint: ValueTypes["auth_user_nfts_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["auth_user_nfts_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["auth_user_nfts_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "auth.user_nfts". */
  ["auth_user_nfts_order_by"]: {
    blockchain?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    centralized_group?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    collection_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    nft_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    publicKeyByBlockchainPublicKey?:
      | ValueTypes["auth_public_keys_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    public_key?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** select columns of table "auth.user_nfts" */
  ["auth_user_nfts_select_column"]: auth_user_nfts_select_column;
  /** Streaming cursor of the table "auth_user_nfts" */
  ["auth_user_nfts_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["auth_user_nfts_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_user_nfts_stream_cursor_value_input"]: {
    blockchain?: string | undefined | null | Variable<any, string>;
    centralized_group?: string | undefined | null | Variable<any, string>;
    collection_id?: string | undefined | null | Variable<any, string>;
    nft_id?: string | undefined | null | Variable<any, string>;
    public_key?: string | undefined | null | Variable<any, string>;
  };
  /** placeholder for update columns of table "auth.user_nfts" (current role has no relevant permissions) */
  ["auth_user_nfts_update_column"]: auth_user_nfts_update_column;
  /** columns and relationships of "auth.users" */
  ["auth_users"]: AliasType<{
    created_at?: boolean | `@${string}`;
    dropzone_public_key?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_public_keys_select_column"]>
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
          | Array<ValueTypes["auth_public_keys_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_public_keys_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_public_keys"]
    ];
    id?: boolean | `@${string}`;
    /** An object relationship */
    invitation?: ValueTypes["auth_invitations"];
    public_keys?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_public_keys_select_column"]>
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
          | Array<ValueTypes["auth_public_keys_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_public_keys_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_public_keys"]
    ];
    public_keys_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_public_keys_select_column"]>
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
          | Array<ValueTypes["auth_public_keys_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_public_keys_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_public_keys_aggregate"]
    ];
    referred_users?: [
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
    referred_users_aggregate?: [
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
    /** An object relationship */
    referrer?: ValueTypes["auth_users"];
    username?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "auth.users" */
  ["auth_users_aggregate"]: AliasType<{
    aggregate?: ValueTypes["auth_users_aggregate_fields"];
    nodes?: ValueTypes["auth_users"];
    __typename?: boolean | `@${string}`;
  }>;
  ["auth_users_aggregate_bool_exp"]: {
    count?:
      | ValueTypes["auth_users_aggregate_bool_exp_count"]
      | undefined
      | null
      | Variable<any, string>;
  };
  ["auth_users_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ValueTypes["auth_users_select_column"]>
      | undefined
      | null
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["auth_users_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["Int_comparison_exp"] | Variable<any, string>;
  };
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
  /** order by aggregate values of table "auth.users" */
  ["auth_users_aggregate_order_by"]: {
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["auth_users_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["auth_users_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "auth.users" */
  ["auth_users_arr_rel_insert_input"]: {
    data: Array<ValueTypes["auth_users_insert_input"]> | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["auth_users_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
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
    created_at?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    dropzone_public_key?:
      | ValueTypes["auth_public_keys_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    invitation?:
      | ValueTypes["auth_invitations_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    public_keys?:
      | ValueTypes["auth_public_keys_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    public_keys_aggregate?:
      | ValueTypes["auth_public_keys_aggregate_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    referred_users?:
      | ValueTypes["auth_users_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    referred_users_aggregate?:
      | ValueTypes["auth_users_aggregate_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    referrer?:
      | ValueTypes["auth_users_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    username?:
      | ValueTypes["citext_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "auth.users" */
  ["auth_users_constraint"]: auth_users_constraint;
  /** input type for inserting data into table "auth.users" */
  ["auth_users_insert_input"]: {
    invitation?:
      | ValueTypes["auth_invitations_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    invitation_id?:
      | ValueTypes["uuid"]
      | undefined
      | null
      | Variable<any, string>;
    public_keys?:
      | ValueTypes["auth_public_keys_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    referred_users?:
      | ValueTypes["auth_users_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    referrer?:
      | ValueTypes["auth_users_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    referrer_id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    username?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
    waitlist_id?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["auth_users_max_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "auth.users" */
  ["auth_users_max_order_by"]: {
    created_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    username?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate min on columns */
  ["auth_users_min_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "auth.users" */
  ["auth_users_min_order_by"]: {
    created_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    username?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** response of any mutation on the table "auth.users" */
  ["auth_users_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_users"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "auth.users" */
  ["auth_users_obj_rel_insert_input"]: {
    data: ValueTypes["auth_users_insert_input"] | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["auth_users_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
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
    created_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    dropzone_public_key_aggregate?:
      | ValueTypes["auth_public_keys_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    invitation?:
      | ValueTypes["auth_invitations_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    public_keys_aggregate?:
      | ValueTypes["auth_public_keys_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    referred_users_aggregate?:
      | ValueTypes["auth_users_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    referrer?:
      | ValueTypes["auth_users_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    username?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: auth.users */
  ["auth_users_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "auth.users" */
  ["auth_users_select_column"]: auth_users_select_column;
  /** input type for updating data in table "auth.users" */
  ["auth_users_set_input"]: {
    avatar_nft?:
      | ValueTypes["citext"]
      | undefined
      | null
      | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
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
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    username?: ValueTypes["citext"] | undefined | null | Variable<any, string>;
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
    /** filter the rows which have to be updated */
    where: ValueTypes["auth_users_bool_exp"] | Variable<any, string>;
  };
  /** columns and relationships of "auth.xnft_preferences" */
  ["auth_xnft_preferences"]: AliasType<{
    disabled?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    media?: boolean | `@${string}`;
    notifications?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    xnft_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.xnft_preferences". All fields are combined with a logical 'AND'. */
  ["auth_xnft_preferences_bool_exp"]: {
    _and?:
      | Array<ValueTypes["auth_xnft_preferences_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["auth_xnft_preferences_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["auth_xnft_preferences_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    disabled?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    media?:
      | ValueTypes["Boolean_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    notifications?:
      | ValueTypes["Boolean_comparison_exp"]
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
    xnft_id?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "auth.xnft_preferences" */
  ["auth_xnft_preferences_constraint"]: auth_xnft_preferences_constraint;
  /** input type for incrementing numeric columns in table "auth.xnft_preferences" */
  ["auth_xnft_preferences_inc_input"]: {
    id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "auth.xnft_preferences" */
  ["auth_xnft_preferences_insert_input"]: {
    disabled?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    media?: boolean | undefined | null | Variable<any, string>;
    notifications?: boolean | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
    xnft_id?: string | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "auth.xnft_preferences" */
  ["auth_xnft_preferences_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_xnft_preferences"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.xnft_preferences" */
  ["auth_xnft_preferences_on_conflict"]: {
    constraint:
      | ValueTypes["auth_xnft_preferences_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["auth_xnft_preferences_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["auth_xnft_preferences_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "auth.xnft_preferences". */
  ["auth_xnft_preferences_order_by"]: {
    disabled?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    media?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    notifications?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    username?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    uuid?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    xnft_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: auth.xnft_preferences */
  ["auth_xnft_preferences_pk_columns_input"]: {
    id: number | Variable<any, string>;
  };
  /** select columns of table "auth.xnft_preferences" */
  ["auth_xnft_preferences_select_column"]: auth_xnft_preferences_select_column;
  /** input type for updating data in table "auth.xnft_preferences" */
  ["auth_xnft_preferences_set_input"]: {
    disabled?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    media?: boolean | undefined | null | Variable<any, string>;
    notifications?: boolean | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
    xnft_id?: string | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "auth_xnft_preferences" */
  ["auth_xnft_preferences_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["auth_xnft_preferences_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_xnft_preferences_stream_cursor_value_input"]: {
    disabled?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    media?: boolean | undefined | null | Variable<any, string>;
    notifications?: boolean | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
    xnft_id?: string | undefined | null | Variable<any, string>;
  };
  /** update columns of table "auth.xnft_preferences" */
  ["auth_xnft_preferences_update_column"]: auth_xnft_preferences_update_column;
  ["auth_xnft_preferences_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["auth_xnft_preferences_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["auth_xnft_preferences_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["auth_xnft_preferences_bool_exp"] | Variable<any, string>;
  };
  /** columns and relationships of "auth.xnft_secrets" */
  ["auth_xnft_secrets"]: AliasType<{
    id?: boolean | `@${string}`;
    secret?: boolean | `@${string}`;
    xnft_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.xnft_secrets". All fields are combined with a logical 'AND'. */
  ["auth_xnft_secrets_bool_exp"]: {
    _and?:
      | Array<ValueTypes["auth_xnft_secrets_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["auth_xnft_secrets_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["auth_xnft_secrets_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    secret?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    xnft_id?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "auth.xnft_secrets" */
  ["auth_xnft_secrets_constraint"]: auth_xnft_secrets_constraint;
  /** input type for incrementing numeric columns in table "auth.xnft_secrets" */
  ["auth_xnft_secrets_inc_input"]: {
    id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "auth.xnft_secrets" */
  ["auth_xnft_secrets_insert_input"]: {
    id?: number | undefined | null | Variable<any, string>;
    secret?: string | undefined | null | Variable<any, string>;
    xnft_id?: string | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "auth.xnft_secrets" */
  ["auth_xnft_secrets_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["auth_xnft_secrets"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.xnft_secrets" */
  ["auth_xnft_secrets_on_conflict"]: {
    constraint:
      | ValueTypes["auth_xnft_secrets_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["auth_xnft_secrets_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["auth_xnft_secrets_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "auth.xnft_secrets". */
  ["auth_xnft_secrets_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    secret?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    xnft_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: auth.xnft_secrets */
  ["auth_xnft_secrets_pk_columns_input"]: {
    id: number | Variable<any, string>;
  };
  /** select columns of table "auth.xnft_secrets" */
  ["auth_xnft_secrets_select_column"]: auth_xnft_secrets_select_column;
  /** input type for updating data in table "auth.xnft_secrets" */
  ["auth_xnft_secrets_set_input"]: {
    id?: number | undefined | null | Variable<any, string>;
    secret?: string | undefined | null | Variable<any, string>;
    xnft_id?: string | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "auth_xnft_secrets" */
  ["auth_xnft_secrets_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["auth_xnft_secrets_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_xnft_secrets_stream_cursor_value_input"]: {
    id?: number | undefined | null | Variable<any, string>;
    secret?: string | undefined | null | Variable<any, string>;
    xnft_id?: string | undefined | null | Variable<any, string>;
  };
  /** update columns of table "auth.xnft_secrets" */
  ["auth_xnft_secrets_update_column"]: auth_xnft_secrets_update_column;
  ["auth_xnft_secrets_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["auth_xnft_secrets_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["auth_xnft_secrets_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["auth_xnft_secrets_bool_exp"] | Variable<any, string>;
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
  /** data used by merkle distributors */
  ["dropzone_distributors"]: AliasType<{
    created_at?: boolean | `@${string}`;
    data?: [
      {
        /** JSON select path */
        path?: string | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`
    ];
    id?: boolean | `@${string}`;
    mint?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "dropzone.distributors" */
  ["dropzone_distributors_aggregate"]: AliasType<{
    aggregate?: ValueTypes["dropzone_distributors_aggregate_fields"];
    nodes?: ValueTypes["dropzone_distributors"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "dropzone.distributors" */
  ["dropzone_distributors_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["dropzone_distributors_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`
    ];
    max?: ValueTypes["dropzone_distributors_max_fields"];
    min?: ValueTypes["dropzone_distributors_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "dropzone.distributors". All fields are combined with a logical 'AND'. */
  ["dropzone_distributors_bool_exp"]: {
    _and?:
      | Array<ValueTypes["dropzone_distributors_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["dropzone_distributors_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["dropzone_distributors_bool_exp"]>
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
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    mint?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "dropzone.distributors" */
  ["dropzone_distributors_constraint"]: dropzone_distributors_constraint;
  /** input type for inserting data into table "dropzone.distributors" */
  ["dropzone_distributors_insert_input"]: {
    data?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    id?: string | undefined | null | Variable<any, string>;
    mint?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["dropzone_distributors_max_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mint?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["dropzone_distributors_min_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mint?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "dropzone.distributors" */
  ["dropzone_distributors_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["dropzone_distributors"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "dropzone.distributors" */
  ["dropzone_distributors_on_conflict"]: {
    constraint:
      | ValueTypes["dropzone_distributors_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["dropzone_distributors_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["dropzone_distributors_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "dropzone.distributors". */
  ["dropzone_distributors_order_by"]: {
    created_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    data?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    mint?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** select columns of table "dropzone.distributors" */
  ["dropzone_distributors_select_column"]: dropzone_distributors_select_column;
  /** Streaming cursor of the table "dropzone_distributors" */
  ["dropzone_distributors_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["dropzone_distributors_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["dropzone_distributors_stream_cursor_value_input"]: {
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    data?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    id?: string | undefined | null | Variable<any, string>;
    mint?: string | undefined | null | Variable<any, string>;
  };
  /** placeholder for update columns of table "dropzone.distributors" (current role has no relevant permissions) */
  ["dropzone_distributors_update_column"]: dropzone_distributors_update_column;
  ["dropzone_user_dropzone_public_key_args"]: {
    user_row?:
      | ValueTypes["users_scalar"]
      | undefined
      | null
      | Variable<any, string>;
  };
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
    delete_auth_collection_messages?: [
      {
        /** filter the rows which have to be deleted */
        where:
          | ValueTypes["auth_collection_messages_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["auth_collection_messages_mutation_response"]
    ];
    delete_auth_collection_messages_by_pk?: [
      {
        collection_id: string | Variable<any, string>;
        uuid: string | Variable<any, string>;
      },
      ValueTypes["auth_collection_messages"]
    ];
    delete_auth_collections?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["auth_collections_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["auth_collections_mutation_response"]
    ];
    delete_auth_collections_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_collections"]
    ];
    delete_auth_friend_requests?: [
      {
        /** filter the rows which have to be deleted */
        where:
          | ValueTypes["auth_friend_requests_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["auth_friend_requests_mutation_response"]
    ];
    delete_auth_friend_requests_by_pk?: [
      {
        from: string | Variable<any, string>;
        to: string | Variable<any, string>;
      },
      ValueTypes["auth_friend_requests"]
    ];
    delete_auth_friendships?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["auth_friendships_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["auth_friendships_mutation_response"]
    ];
    delete_auth_friendships_by_pk?: [
      {
        user1: string | Variable<any, string>;
        user2: string | Variable<any, string>;
      },
      ValueTypes["auth_friendships"]
    ];
    delete_auth_notification_subscriptions?: [
      {
        /** filter the rows which have to be deleted */
        where:
          | ValueTypes["auth_notification_subscriptions_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_subscriptions_mutation_response"]
    ];
    delete_auth_notification_subscriptions_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_notification_subscriptions"]
    ];
    delete_auth_public_keys?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["auth_public_keys_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["auth_public_keys_mutation_response"]
    ];
    delete_auth_public_keys_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_public_keys"]
    ];
    delete_auth_user_nfts?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["auth_user_nfts_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["auth_user_nfts_mutation_response"]
    ];
    delete_auth_user_nfts_by_pk?: [
      {
        nft_id: string | Variable<any, string>;
        public_key: string | Variable<any, string>;
      },
      ValueTypes["auth_user_nfts"]
    ];
    delete_auth_xnft_preferences?: [
      {
        /** filter the rows which have to be deleted */
        where:
          | ValueTypes["auth_xnft_preferences_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_preferences_mutation_response"]
    ];
    delete_auth_xnft_preferences_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_xnft_preferences"]
    ];
    insert_auth_collection_messages?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["auth_collection_messages_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_collection_messages_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_collection_messages_mutation_response"]
    ];
    insert_auth_collection_messages_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["auth_collection_messages_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_collection_messages_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_collection_messages"]
    ];
    insert_auth_collections?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["auth_collections_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_collections_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_collections_mutation_response"]
    ];
    insert_auth_collections_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["auth_collections_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_collections_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_collections"]
    ];
    insert_auth_friend_requests?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["auth_friend_requests_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_friend_requests_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_friend_requests_mutation_response"]
    ];
    insert_auth_friend_requests_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["auth_friend_requests_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_friend_requests_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_friend_requests"]
    ];
    insert_auth_friendships?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["auth_friendships_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_friendships_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_friendships_mutation_response"]
    ];
    insert_auth_friendships_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["auth_friendships_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_friendships_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_friendships"]
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
    insert_auth_notification_cursor?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["auth_notification_cursor_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_notification_cursor_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_cursor_mutation_response"]
    ];
    insert_auth_notification_cursor_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["auth_notification_cursor_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_notification_cursor_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_cursor"]
    ];
    insert_auth_notification_subscriptions?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["auth_notification_subscriptions_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_notification_subscriptions_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_subscriptions_mutation_response"]
    ];
    insert_auth_notification_subscriptions_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["auth_notification_subscriptions_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_notification_subscriptions_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_subscriptions"]
    ];
    insert_auth_notifications?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["auth_notifications_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_notifications_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notifications_mutation_response"]
    ];
    insert_auth_notifications_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["auth_notifications_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_notifications_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notifications"]
    ];
    insert_auth_public_keys?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["auth_public_keys_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_public_keys_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_public_keys_mutation_response"]
    ];
    insert_auth_public_keys_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["auth_public_keys_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_public_keys_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_public_keys"]
    ];
    insert_auth_stripe_onramp?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["auth_stripe_onramp_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_stripe_onramp_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_stripe_onramp_mutation_response"]
    ];
    insert_auth_stripe_onramp_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["auth_stripe_onramp_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_stripe_onramp_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_stripe_onramp"]
    ];
    insert_auth_user_active_publickey_mapping?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["auth_user_active_publickey_mapping_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_user_active_publickey_mapping_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_user_active_publickey_mapping_mutation_response"]
    ];
    insert_auth_user_active_publickey_mapping_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["auth_user_active_publickey_mapping_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_user_active_publickey_mapping_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_user_active_publickey_mapping"]
    ];
    insert_auth_user_nfts?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["auth_user_nfts_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_user_nfts_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_user_nfts_mutation_response"]
    ];
    insert_auth_user_nfts_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["auth_user_nfts_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_user_nfts_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_user_nfts"]
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
    insert_auth_xnft_preferences?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["auth_xnft_preferences_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_xnft_preferences_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_preferences_mutation_response"]
    ];
    insert_auth_xnft_preferences_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["auth_xnft_preferences_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_xnft_preferences_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_preferences"]
    ];
    insert_auth_xnft_secrets?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["auth_xnft_secrets_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_xnft_secrets_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_secrets_mutation_response"]
    ];
    insert_auth_xnft_secrets_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["auth_xnft_secrets_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["auth_xnft_secrets_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_secrets"]
    ];
    insert_dropzone_distributors?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["dropzone_distributors_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["dropzone_distributors_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["dropzone_distributors_mutation_response"]
    ];
    insert_dropzone_distributors_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["dropzone_distributors_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["dropzone_distributors_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["dropzone_distributors"]
    ];
    update_auth_collection_messages?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["auth_collection_messages_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where:
          | ValueTypes["auth_collection_messages_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["auth_collection_messages_mutation_response"]
    ];
    update_auth_collection_messages_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["auth_collection_messages_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["auth_collection_messages_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["auth_collection_messages"]
    ];
    update_auth_collection_messages_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["auth_collection_messages_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["auth_collection_messages_mutation_response"]
    ];
    update_auth_collections?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_collections_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_collections_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["auth_collections_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["auth_collections_mutation_response"]
    ];
    update_auth_collections_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_collections_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_collections_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["auth_collections_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["auth_collections"]
    ];
    update_auth_collections_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["auth_collections_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["auth_collections_mutation_response"]
    ];
    update_auth_friendships?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_friendships_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_friendships_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["auth_friendships_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["auth_friendships_mutation_response"]
    ];
    update_auth_friendships_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_friendships_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_friendships_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["auth_friendships_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["auth_friendships"]
    ];
    update_auth_friendships_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["auth_friendships_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["auth_friendships_mutation_response"]
    ];
    update_auth_notification_cursor?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_notification_cursor_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_notification_cursor_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where:
          | ValueTypes["auth_notification_cursor_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_cursor_mutation_response"]
    ];
    update_auth_notification_cursor_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_notification_cursor_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_notification_cursor_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["auth_notification_cursor_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_cursor"]
    ];
    update_auth_notification_cursor_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["auth_notification_cursor_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_cursor_mutation_response"]
    ];
    update_auth_notification_subscriptions?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_notification_subscriptions_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_notification_subscriptions_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where:
          | ValueTypes["auth_notification_subscriptions_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_subscriptions_mutation_response"]
    ];
    update_auth_notification_subscriptions_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_notification_subscriptions_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_notification_subscriptions_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["auth_notification_subscriptions_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_subscriptions"]
    ];
    update_auth_notification_subscriptions_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["auth_notification_subscriptions_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_subscriptions_mutation_response"]
    ];
    update_auth_notifications?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_notifications_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_notifications_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where:
          | ValueTypes["auth_notifications_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["auth_notifications_mutation_response"]
    ];
    update_auth_notifications_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_notifications_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_notifications_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["auth_notifications_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["auth_notifications"]
    ];
    update_auth_notifications_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["auth_notifications_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["auth_notifications_mutation_response"]
    ];
    update_auth_stripe_onramp?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_stripe_onramp_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_stripe_onramp_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where:
          | ValueTypes["auth_stripe_onramp_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["auth_stripe_onramp_mutation_response"]
    ];
    update_auth_stripe_onramp_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_stripe_onramp_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_stripe_onramp_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["auth_stripe_onramp_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["auth_stripe_onramp"]
    ];
    update_auth_stripe_onramp_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["auth_stripe_onramp_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["auth_stripe_onramp_mutation_response"]
    ];
    update_auth_user_active_publickey_mapping?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_user_active_publickey_mapping_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_user_active_publickey_mapping_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where:
          | ValueTypes["auth_user_active_publickey_mapping_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["auth_user_active_publickey_mapping_mutation_response"]
    ];
    update_auth_user_active_publickey_mapping_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_user_active_publickey_mapping_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_user_active_publickey_mapping_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["auth_user_active_publickey_mapping_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["auth_user_active_publickey_mapping"]
    ];
    update_auth_user_active_publickey_mapping_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["auth_user_active_publickey_mapping_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["auth_user_active_publickey_mapping_mutation_response"]
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
    update_auth_xnft_preferences?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_xnft_preferences_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_xnft_preferences_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where:
          | ValueTypes["auth_xnft_preferences_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_preferences_mutation_response"]
    ];
    update_auth_xnft_preferences_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_xnft_preferences_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_xnft_preferences_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["auth_xnft_preferences_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_preferences"]
    ];
    update_auth_xnft_preferences_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["auth_xnft_preferences_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_preferences_mutation_response"]
    ];
    update_auth_xnft_secrets?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_xnft_secrets_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_xnft_secrets_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["auth_xnft_secrets_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["auth_xnft_secrets_mutation_response"]
    ];
    update_auth_xnft_secrets_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["auth_xnft_secrets_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["auth_xnft_secrets_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["auth_xnft_secrets_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_secrets"]
    ];
    update_auth_xnft_secrets_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["auth_xnft_secrets_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_secrets_mutation_response"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    auth_collection_messages?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_collection_messages_select_column"]>
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
          | Array<ValueTypes["auth_collection_messages_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_collection_messages_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_collection_messages"]
    ];
    auth_collection_messages_by_pk?: [
      {
        collection_id: string | Variable<any, string>;
        uuid: string | Variable<any, string>;
      },
      ValueTypes["auth_collection_messages"]
    ];
    auth_collections?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_collections_select_column"]>
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
          | Array<ValueTypes["auth_collections_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_collections_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_collections"]
    ];
    auth_collections_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_collections"]
    ];
    auth_friend_requests?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_friend_requests_select_column"]>
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
          | Array<ValueTypes["auth_friend_requests_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_friend_requests_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_friend_requests"]
    ];
    auth_friend_requests_by_pk?: [
      {
        from: string | Variable<any, string>;
        to: string | Variable<any, string>;
      },
      ValueTypes["auth_friend_requests"]
    ];
    auth_friendships?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_friendships_select_column"]>
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
          | Array<ValueTypes["auth_friendships_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_friendships_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_friendships"]
    ];
    auth_friendships_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_friendships_select_column"]>
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
          | Array<ValueTypes["auth_friendships_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_friendships_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_friendships_aggregate"]
    ];
    auth_friendships_by_pk?: [
      {
        user1: string | Variable<any, string>;
        user2: string | Variable<any, string>;
      },
      ValueTypes["auth_friendships"]
    ];
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
    auth_invitations_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["auth_invitations"]
    ];
    auth_notification_cursor?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_notification_cursor_select_column"]>
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
          | Array<ValueTypes["auth_notification_cursor_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_notification_cursor_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_cursor"]
    ];
    auth_notification_cursor_by_pk?: [
      { uuid: string | Variable<any, string> },
      ValueTypes["auth_notification_cursor"]
    ];
    auth_notification_subscriptions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_notification_subscriptions_select_column"]>
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
          | Array<ValueTypes["auth_notification_subscriptions_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_notification_subscriptions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_subscriptions"]
    ];
    auth_notification_subscriptions_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_notification_subscriptions"]
    ];
    auth_notifications?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_notifications_select_column"]>
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
          | Array<ValueTypes["auth_notifications_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_notifications_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notifications"]
    ];
    auth_notifications_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_notifications_select_column"]>
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
          | Array<ValueTypes["auth_notifications_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_notifications_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notifications_aggregate"]
    ];
    auth_notifications_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_notifications"]
    ];
    auth_public_keys?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_public_keys_select_column"]>
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
          | Array<ValueTypes["auth_public_keys_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_public_keys_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_public_keys"]
    ];
    auth_public_keys_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_public_keys_select_column"]>
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
          | Array<ValueTypes["auth_public_keys_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_public_keys_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_public_keys_aggregate"]
    ];
    auth_public_keys_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_public_keys"]
    ];
    auth_stripe_onramp?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_stripe_onramp_select_column"]>
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
          | Array<ValueTypes["auth_stripe_onramp_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_stripe_onramp_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_stripe_onramp"]
    ];
    auth_stripe_onramp_by_pk?: [
      { client_secret: string | Variable<any, string> },
      ValueTypes["auth_stripe_onramp"]
    ];
    auth_user_active_publickey_mapping?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<
              ValueTypes["auth_user_active_publickey_mapping_select_column"]
            >
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
          | Array<ValueTypes["auth_user_active_publickey_mapping_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_user_active_publickey_mapping_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_user_active_publickey_mapping"]
    ];
    auth_user_active_publickey_mapping_by_pk?: [
      {
        blockchain: string | Variable<any, string>;
        user_id: ValueTypes["uuid"] | Variable<any, string>;
      },
      ValueTypes["auth_user_active_publickey_mapping"]
    ];
    auth_user_nfts?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_user_nfts_select_column"]>
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
          | Array<ValueTypes["auth_user_nfts_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_user_nfts_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_user_nfts"]
    ];
    auth_user_nfts_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_user_nfts_select_column"]>
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
          | Array<ValueTypes["auth_user_nfts_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_user_nfts_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_user_nfts_aggregate"]
    ];
    auth_user_nfts_by_pk?: [
      {
        nft_id: string | Variable<any, string>;
        public_key: string | Variable<any, string>;
      },
      ValueTypes["auth_user_nfts"]
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
    auth_xnft_preferences?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_xnft_preferences_select_column"]>
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
          | Array<ValueTypes["auth_xnft_preferences_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_xnft_preferences_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_preferences"]
    ];
    auth_xnft_preferences_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_xnft_preferences"]
    ];
    auth_xnft_secrets?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_xnft_secrets_select_column"]>
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
          | Array<ValueTypes["auth_xnft_secrets_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_xnft_secrets_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_secrets"]
    ];
    auth_xnft_secrets_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_xnft_secrets"]
    ];
    dropzone_distributors?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["dropzone_distributors_select_column"]>
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
          | Array<ValueTypes["dropzone_distributors_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["dropzone_distributors_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["dropzone_distributors"]
    ];
    dropzone_distributors_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["dropzone_distributors_select_column"]>
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
          | Array<ValueTypes["dropzone_distributors_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["dropzone_distributors_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["dropzone_distributors_aggregate"]
    ];
    dropzone_distributors_by_pk?: [
      { id: string | Variable<any, string> },
      ValueTypes["dropzone_distributors"]
    ];
    dropzone_user_dropzone_public_key?: [
      {
        /** input parameters for function "dropzone_user_dropzone_public_key" */
        args:
          | ValueTypes["dropzone_user_dropzone_public_key_args"]
          | Variable<any, string> /** distinct select on columns */;
        distinct_on?:
          | Array<ValueTypes["auth_public_keys_select_column"]>
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
          | Array<ValueTypes["auth_public_keys_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_public_keys_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_public_keys"]
    ];
    dropzone_user_dropzone_public_key_aggregate?: [
      {
        /** input parameters for function "dropzone_user_dropzone_public_key_aggregate" */
        args:
          | ValueTypes["dropzone_user_dropzone_public_key_args"]
          | Variable<any, string> /** distinct select on columns */;
        distinct_on?:
          | Array<ValueTypes["auth_public_keys_select_column"]>
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
          | Array<ValueTypes["auth_public_keys_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_public_keys_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_public_keys_aggregate"]
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
    auth_collection_messages?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_collection_messages_select_column"]>
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
          | Array<ValueTypes["auth_collection_messages_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_collection_messages_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_collection_messages"]
    ];
    auth_collection_messages_by_pk?: [
      {
        collection_id: string | Variable<any, string>;
        uuid: string | Variable<any, string>;
      },
      ValueTypes["auth_collection_messages"]
    ];
    auth_collection_messages_stream?: [
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
              | ValueTypes["auth_collection_messages_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_collection_messages_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_collection_messages"]
    ];
    auth_collections?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_collections_select_column"]>
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
          | Array<ValueTypes["auth_collections_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_collections_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_collections"]
    ];
    auth_collections_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_collections"]
    ];
    auth_collections_stream?: [
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
              | ValueTypes["auth_collections_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_collections_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_collections"]
    ];
    auth_friend_requests?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_friend_requests_select_column"]>
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
          | Array<ValueTypes["auth_friend_requests_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_friend_requests_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_friend_requests"]
    ];
    auth_friend_requests_by_pk?: [
      {
        from: string | Variable<any, string>;
        to: string | Variable<any, string>;
      },
      ValueTypes["auth_friend_requests"]
    ];
    auth_friend_requests_stream?: [
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
              | ValueTypes["auth_friend_requests_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_friend_requests_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_friend_requests"]
    ];
    auth_friendships?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_friendships_select_column"]>
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
          | Array<ValueTypes["auth_friendships_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_friendships_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_friendships"]
    ];
    auth_friendships_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_friendships_select_column"]>
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
          | Array<ValueTypes["auth_friendships_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_friendships_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_friendships_aggregate"]
    ];
    auth_friendships_by_pk?: [
      {
        user1: string | Variable<any, string>;
        user2: string | Variable<any, string>;
      },
      ValueTypes["auth_friendships"]
    ];
    auth_friendships_stream?: [
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
              | ValueTypes["auth_friendships_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_friendships_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_friendships"]
    ];
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
    auth_notification_cursor?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_notification_cursor_select_column"]>
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
          | Array<ValueTypes["auth_notification_cursor_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_notification_cursor_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_cursor"]
    ];
    auth_notification_cursor_by_pk?: [
      { uuid: string | Variable<any, string> },
      ValueTypes["auth_notification_cursor"]
    ];
    auth_notification_cursor_stream?: [
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
              | ValueTypes["auth_notification_cursor_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_notification_cursor_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_cursor"]
    ];
    auth_notification_subscriptions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_notification_subscriptions_select_column"]>
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
          | Array<ValueTypes["auth_notification_subscriptions_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_notification_subscriptions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_subscriptions"]
    ];
    auth_notification_subscriptions_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_notification_subscriptions"]
    ];
    auth_notification_subscriptions_stream?: [
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
              | ValueTypes["auth_notification_subscriptions_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_notification_subscriptions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notification_subscriptions"]
    ];
    auth_notifications?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_notifications_select_column"]>
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
          | Array<ValueTypes["auth_notifications_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_notifications_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notifications"]
    ];
    auth_notifications_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_notifications_select_column"]>
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
          | Array<ValueTypes["auth_notifications_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_notifications_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notifications_aggregate"]
    ];
    auth_notifications_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_notifications"]
    ];
    auth_notifications_stream?: [
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
              | ValueTypes["auth_notifications_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_notifications_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_notifications"]
    ];
    auth_public_keys?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_public_keys_select_column"]>
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
          | Array<ValueTypes["auth_public_keys_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_public_keys_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_public_keys"]
    ];
    auth_public_keys_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_public_keys_select_column"]>
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
          | Array<ValueTypes["auth_public_keys_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_public_keys_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_public_keys_aggregate"]
    ];
    auth_public_keys_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_public_keys"]
    ];
    auth_public_keys_stream?: [
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
              | ValueTypes["auth_public_keys_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_public_keys_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_public_keys"]
    ];
    auth_stripe_onramp?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_stripe_onramp_select_column"]>
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
          | Array<ValueTypes["auth_stripe_onramp_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_stripe_onramp_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_stripe_onramp"]
    ];
    auth_stripe_onramp_by_pk?: [
      { client_secret: string | Variable<any, string> },
      ValueTypes["auth_stripe_onramp"]
    ];
    auth_stripe_onramp_stream?: [
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
              | ValueTypes["auth_stripe_onramp_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_stripe_onramp_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_stripe_onramp"]
    ];
    auth_user_active_publickey_mapping?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<
              ValueTypes["auth_user_active_publickey_mapping_select_column"]
            >
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
          | Array<ValueTypes["auth_user_active_publickey_mapping_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_user_active_publickey_mapping_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_user_active_publickey_mapping"]
    ];
    auth_user_active_publickey_mapping_by_pk?: [
      {
        blockchain: string | Variable<any, string>;
        user_id: ValueTypes["uuid"] | Variable<any, string>;
      },
      ValueTypes["auth_user_active_publickey_mapping"]
    ];
    auth_user_active_publickey_mapping_stream?: [
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
              | ValueTypes["auth_user_active_publickey_mapping_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_user_active_publickey_mapping_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_user_active_publickey_mapping"]
    ];
    auth_user_nfts?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_user_nfts_select_column"]>
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
          | Array<ValueTypes["auth_user_nfts_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_user_nfts_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_user_nfts"]
    ];
    auth_user_nfts_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_user_nfts_select_column"]>
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
          | Array<ValueTypes["auth_user_nfts_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_user_nfts_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_user_nfts_aggregate"]
    ];
    auth_user_nfts_by_pk?: [
      {
        nft_id: string | Variable<any, string>;
        public_key: string | Variable<any, string>;
      },
      ValueTypes["auth_user_nfts"]
    ];
    auth_user_nfts_stream?: [
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
              | ValueTypes["auth_user_nfts_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_user_nfts_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_user_nfts"]
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
    auth_xnft_preferences?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_xnft_preferences_select_column"]>
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
          | Array<ValueTypes["auth_xnft_preferences_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_xnft_preferences_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_preferences"]
    ];
    auth_xnft_preferences_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_xnft_preferences"]
    ];
    auth_xnft_preferences_stream?: [
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
              | ValueTypes["auth_xnft_preferences_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_xnft_preferences_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_preferences"]
    ];
    auth_xnft_secrets?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["auth_xnft_secrets_select_column"]>
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
          | Array<ValueTypes["auth_xnft_secrets_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_xnft_secrets_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_secrets"]
    ];
    auth_xnft_secrets_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["auth_xnft_secrets"]
    ];
    auth_xnft_secrets_stream?: [
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
              | ValueTypes["auth_xnft_secrets_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_xnft_secrets_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_xnft_secrets"]
    ];
    dropzone_distributors?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["dropzone_distributors_select_column"]>
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
          | Array<ValueTypes["dropzone_distributors_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["dropzone_distributors_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["dropzone_distributors"]
    ];
    dropzone_distributors_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["dropzone_distributors_select_column"]>
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
          | Array<ValueTypes["dropzone_distributors_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["dropzone_distributors_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["dropzone_distributors_aggregate"]
    ];
    dropzone_distributors_by_pk?: [
      { id: string | Variable<any, string> },
      ValueTypes["dropzone_distributors"]
    ];
    dropzone_distributors_stream?: [
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
              | ValueTypes["dropzone_distributors_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["dropzone_distributors_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["dropzone_distributors"]
    ];
    dropzone_user_dropzone_public_key?: [
      {
        /** input parameters for function "dropzone_user_dropzone_public_key" */
        args:
          | ValueTypes["dropzone_user_dropzone_public_key_args"]
          | Variable<any, string> /** distinct select on columns */;
        distinct_on?:
          | Array<ValueTypes["auth_public_keys_select_column"]>
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
          | Array<ValueTypes["auth_public_keys_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_public_keys_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_public_keys"]
    ];
    dropzone_user_dropzone_public_key_aggregate?: [
      {
        /** input parameters for function "dropzone_user_dropzone_public_key_aggregate" */
        args:
          | ValueTypes["dropzone_user_dropzone_public_key_args"]
          | Variable<any, string> /** distinct select on columns */;
        distinct_on?:
          | Array<ValueTypes["auth_public_keys_select_column"]>
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
          | Array<ValueTypes["auth_public_keys_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["auth_public_keys_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["auth_public_keys_aggregate"]
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
  ["users_scalar"]: unknown;
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
  /** columns and relationships of "auth.collection_messages" */
  ["auth_collection_messages"]: AliasType<{
    collection_id?: boolean | `@${string}`;
    last_read_message_id?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.collection_messages". All fields are combined with a logical 'AND'. */
  ["auth_collection_messages_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["auth_collection_messages_bool_exp"]>
      | undefined
      | null;
    _not?:
      | ResolverInputTypes["auth_collection_messages_bool_exp"]
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["auth_collection_messages_bool_exp"]>
      | undefined
      | null;
    collection_id?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    last_read_message_id?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    uuid?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "auth.collection_messages" */
  ["auth_collection_messages_constraint"]: auth_collection_messages_constraint;
  /** input type for inserting data into table "auth.collection_messages" */
  ["auth_collection_messages_insert_input"]: {
    collection_id?: string | undefined | null;
    last_read_message_id?: string | undefined | null;
    uuid?: string | undefined | null;
  };
  /** response of any mutation on the table "auth.collection_messages" */
  ["auth_collection_messages_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_collection_messages"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.collection_messages" */
  ["auth_collection_messages_on_conflict"]: {
    constraint: ResolverInputTypes["auth_collection_messages_constraint"];
    update_columns: Array<
      ResolverInputTypes["auth_collection_messages_update_column"]
    >;
    where?:
      | ResolverInputTypes["auth_collection_messages_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "auth.collection_messages". */
  ["auth_collection_messages_order_by"]: {
    collection_id?: ResolverInputTypes["order_by"] | undefined | null;
    last_read_message_id?: ResolverInputTypes["order_by"] | undefined | null;
    uuid?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: auth.collection_messages */
  ["auth_collection_messages_pk_columns_input"]: {
    collection_id: string;
    uuid: string;
  };
  /** select columns of table "auth.collection_messages" */
  ["auth_collection_messages_select_column"]: auth_collection_messages_select_column;
  /** input type for updating data in table "auth.collection_messages" */
  ["auth_collection_messages_set_input"]: {
    collection_id?: string | undefined | null;
    last_read_message_id?: string | undefined | null;
    uuid?: string | undefined | null;
  };
  /** Streaming cursor of the table "auth_collection_messages" */
  ["auth_collection_messages_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["auth_collection_messages_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_collection_messages_stream_cursor_value_input"]: {
    collection_id?: string | undefined | null;
    last_read_message_id?: string | undefined | null;
    uuid?: string | undefined | null;
  };
  /** update columns of table "auth.collection_messages" */
  ["auth_collection_messages_update_column"]: auth_collection_messages_update_column;
  ["auth_collection_messages_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ResolverInputTypes["auth_collection_messages_set_input"]
      | undefined
      | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["auth_collection_messages_bool_exp"];
  };
  /** columns and relationships of "auth.collections" */
  ["auth_collections"]: AliasType<{
    collection_id?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    last_message?: boolean | `@${string}`;
    last_message_timestamp?: boolean | `@${string}`;
    last_message_uuid?: boolean | `@${string}`;
    type?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.collections". All fields are combined with a logical 'AND'. */
  ["auth_collections_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["auth_collections_bool_exp"]>
      | undefined
      | null;
    _not?: ResolverInputTypes["auth_collections_bool_exp"] | undefined | null;
    _or?:
      | Array<ResolverInputTypes["auth_collections_bool_exp"]>
      | undefined
      | null;
    collection_id?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    last_message?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    last_message_timestamp?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    last_message_uuid?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    type?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "auth.collections" */
  ["auth_collections_constraint"]: auth_collections_constraint;
  /** input type for incrementing numeric columns in table "auth.collections" */
  ["auth_collections_inc_input"]: {
    id?: number | undefined | null;
  };
  /** input type for inserting data into table "auth.collections" */
  ["auth_collections_insert_input"]: {
    collection_id?: string | undefined | null;
    id?: number | undefined | null;
    last_message?: string | undefined | null;
    last_message_timestamp?:
      | ResolverInputTypes["timestamptz"]
      | undefined
      | null;
    last_message_uuid?: string | undefined | null;
    type?: string | undefined | null;
  };
  /** response of any mutation on the table "auth.collections" */
  ["auth_collections_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_collections"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.collections" */
  ["auth_collections_on_conflict"]: {
    constraint: ResolverInputTypes["auth_collections_constraint"];
    update_columns: Array<ResolverInputTypes["auth_collections_update_column"]>;
    where?: ResolverInputTypes["auth_collections_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "auth.collections". */
  ["auth_collections_order_by"]: {
    collection_id?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    last_message?: ResolverInputTypes["order_by"] | undefined | null;
    last_message_timestamp?: ResolverInputTypes["order_by"] | undefined | null;
    last_message_uuid?: ResolverInputTypes["order_by"] | undefined | null;
    type?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: auth.collections */
  ["auth_collections_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "auth.collections" */
  ["auth_collections_select_column"]: auth_collections_select_column;
  /** input type for updating data in table "auth.collections" */
  ["auth_collections_set_input"]: {
    collection_id?: string | undefined | null;
    id?: number | undefined | null;
    last_message?: string | undefined | null;
    last_message_timestamp?:
      | ResolverInputTypes["timestamptz"]
      | undefined
      | null;
    last_message_uuid?: string | undefined | null;
    type?: string | undefined | null;
  };
  /** Streaming cursor of the table "auth_collections" */
  ["auth_collections_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["auth_collections_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_collections_stream_cursor_value_input"]: {
    collection_id?: string | undefined | null;
    id?: number | undefined | null;
    last_message?: string | undefined | null;
    last_message_timestamp?:
      | ResolverInputTypes["timestamptz"]
      | undefined
      | null;
    last_message_uuid?: string | undefined | null;
    type?: string | undefined | null;
  };
  /** update columns of table "auth.collections" */
  ["auth_collections_update_column"]: auth_collections_update_column;
  ["auth_collections_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ResolverInputTypes["auth_collections_inc_input"] | undefined | null;
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["auth_collections_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["auth_collections_bool_exp"];
  };
  /** columns and relationships of "auth.friend_requests" */
  ["auth_friend_requests"]: AliasType<{
    from?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.friend_requests". All fields are combined with a logical 'AND'. */
  ["auth_friend_requests_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["auth_friend_requests_bool_exp"]>
      | undefined
      | null;
    _not?:
      | ResolverInputTypes["auth_friend_requests_bool_exp"]
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["auth_friend_requests_bool_exp"]>
      | undefined
      | null;
    from?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    to?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "auth.friend_requests" */
  ["auth_friend_requests_constraint"]: auth_friend_requests_constraint;
  /** input type for inserting data into table "auth.friend_requests" */
  ["auth_friend_requests_insert_input"]: {
    from?: string | undefined | null;
    id?: number | undefined | null;
    to?: string | undefined | null;
  };
  /** response of any mutation on the table "auth.friend_requests" */
  ["auth_friend_requests_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_friend_requests"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.friend_requests" */
  ["auth_friend_requests_on_conflict"]: {
    constraint: ResolverInputTypes["auth_friend_requests_constraint"];
    update_columns: Array<
      ResolverInputTypes["auth_friend_requests_update_column"]
    >;
    where?:
      | ResolverInputTypes["auth_friend_requests_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "auth.friend_requests". */
  ["auth_friend_requests_order_by"]: {
    from?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    to?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** select columns of table "auth.friend_requests" */
  ["auth_friend_requests_select_column"]: auth_friend_requests_select_column;
  /** Streaming cursor of the table "auth_friend_requests" */
  ["auth_friend_requests_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["auth_friend_requests_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_friend_requests_stream_cursor_value_input"]: {
    from?: string | undefined | null;
    id?: number | undefined | null;
    to?: string | undefined | null;
  };
  /** placeholder for update columns of table "auth.friend_requests" (current role has no relevant permissions) */
  ["auth_friend_requests_update_column"]: auth_friend_requests_update_column;
  /** columns and relationships of "auth.friendships" */
  ["auth_friendships"]: AliasType<{
    are_friends?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    last_message?: boolean | `@${string}`;
    last_message_client_uuid?: boolean | `@${string}`;
    last_message_sender?: boolean | `@${string}`;
    last_message_timestamp?: boolean | `@${string}`;
    user1?: boolean | `@${string}`;
    user1_blocked_user2?: boolean | `@${string}`;
    user1_interacted?: boolean | `@${string}`;
    user1_last_read_message_id?: boolean | `@${string}`;
    user1_spam_user2?: boolean | `@${string}`;
    user2?: boolean | `@${string}`;
    user2_blocked_user1?: boolean | `@${string}`;
    user2_interacted?: boolean | `@${string}`;
    user2_last_read_message_id?: boolean | `@${string}`;
    user2_spam_user1?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "auth.friendships" */
  ["auth_friendships_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["auth_friendships_aggregate_fields"];
    nodes?: ResolverInputTypes["auth_friendships"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "auth.friendships" */
  ["auth_friendships_aggregate_fields"]: AliasType<{
    avg?: ResolverInputTypes["auth_friendships_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["auth_friendships_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`
    ];
    max?: ResolverInputTypes["auth_friendships_max_fields"];
    min?: ResolverInputTypes["auth_friendships_min_fields"];
    stddev?: ResolverInputTypes["auth_friendships_stddev_fields"];
    stddev_pop?: ResolverInputTypes["auth_friendships_stddev_pop_fields"];
    stddev_samp?: ResolverInputTypes["auth_friendships_stddev_samp_fields"];
    sum?: ResolverInputTypes["auth_friendships_sum_fields"];
    var_pop?: ResolverInputTypes["auth_friendships_var_pop_fields"];
    var_samp?: ResolverInputTypes["auth_friendships_var_samp_fields"];
    variance?: ResolverInputTypes["auth_friendships_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate avg on columns */
  ["auth_friendships_avg_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.friendships". All fields are combined with a logical 'AND'. */
  ["auth_friendships_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["auth_friendships_bool_exp"]>
      | undefined
      | null;
    _not?: ResolverInputTypes["auth_friendships_bool_exp"] | undefined | null;
    _or?:
      | Array<ResolverInputTypes["auth_friendships_bool_exp"]>
      | undefined
      | null;
    are_friends?:
      | ResolverInputTypes["Boolean_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    last_message?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    last_message_client_uuid?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    last_message_sender?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    last_message_timestamp?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    user1?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    user1_blocked_user2?:
      | ResolverInputTypes["Boolean_comparison_exp"]
      | undefined
      | null;
    user1_interacted?:
      | ResolverInputTypes["Boolean_comparison_exp"]
      | undefined
      | null;
    user1_last_read_message_id?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    user1_spam_user2?:
      | ResolverInputTypes["Boolean_comparison_exp"]
      | undefined
      | null;
    user2?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    user2_blocked_user1?:
      | ResolverInputTypes["Boolean_comparison_exp"]
      | undefined
      | null;
    user2_interacted?:
      | ResolverInputTypes["Boolean_comparison_exp"]
      | undefined
      | null;
    user2_last_read_message_id?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    user2_spam_user1?:
      | ResolverInputTypes["Boolean_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "auth.friendships" */
  ["auth_friendships_constraint"]: auth_friendships_constraint;
  /** input type for incrementing numeric columns in table "auth.friendships" */
  ["auth_friendships_inc_input"]: {
    id?: number | undefined | null;
  };
  /** input type for inserting data into table "auth.friendships" */
  ["auth_friendships_insert_input"]: {
    are_friends?: boolean | undefined | null;
    id?: number | undefined | null;
    last_message?: string | undefined | null;
    last_message_client_uuid?: string | undefined | null;
    last_message_sender?: string | undefined | null;
    last_message_timestamp?:
      | ResolverInputTypes["timestamptz"]
      | undefined
      | null;
    user1?: string | undefined | null;
    user1_blocked_user2?: boolean | undefined | null;
    user1_interacted?: boolean | undefined | null;
    user1_last_read_message_id?: string | undefined | null;
    user1_spam_user2?: boolean | undefined | null;
    user2?: string | undefined | null;
    user2_blocked_user1?: boolean | undefined | null;
    user2_interacted?: boolean | undefined | null;
    user2_last_read_message_id?: string | undefined | null;
    user2_spam_user1?: boolean | undefined | null;
  };
  /** aggregate max on columns */
  ["auth_friendships_max_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    last_message?: boolean | `@${string}`;
    last_message_client_uuid?: boolean | `@${string}`;
    last_message_sender?: boolean | `@${string}`;
    last_message_timestamp?: boolean | `@${string}`;
    user1?: boolean | `@${string}`;
    user1_last_read_message_id?: boolean | `@${string}`;
    user2?: boolean | `@${string}`;
    user2_last_read_message_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["auth_friendships_min_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    last_message?: boolean | `@${string}`;
    last_message_client_uuid?: boolean | `@${string}`;
    last_message_sender?: boolean | `@${string}`;
    last_message_timestamp?: boolean | `@${string}`;
    user1?: boolean | `@${string}`;
    user1_last_read_message_id?: boolean | `@${string}`;
    user2?: boolean | `@${string}`;
    user2_last_read_message_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "auth.friendships" */
  ["auth_friendships_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_friendships"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.friendships" */
  ["auth_friendships_on_conflict"]: {
    constraint: ResolverInputTypes["auth_friendships_constraint"];
    update_columns: Array<ResolverInputTypes["auth_friendships_update_column"]>;
    where?: ResolverInputTypes["auth_friendships_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "auth.friendships". */
  ["auth_friendships_order_by"]: {
    are_friends?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    last_message?: ResolverInputTypes["order_by"] | undefined | null;
    last_message_client_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
    last_message_sender?: ResolverInputTypes["order_by"] | undefined | null;
    last_message_timestamp?: ResolverInputTypes["order_by"] | undefined | null;
    user1?: ResolverInputTypes["order_by"] | undefined | null;
    user1_blocked_user2?: ResolverInputTypes["order_by"] | undefined | null;
    user1_interacted?: ResolverInputTypes["order_by"] | undefined | null;
    user1_last_read_message_id?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
    user1_spam_user2?: ResolverInputTypes["order_by"] | undefined | null;
    user2?: ResolverInputTypes["order_by"] | undefined | null;
    user2_blocked_user1?: ResolverInputTypes["order_by"] | undefined | null;
    user2_interacted?: ResolverInputTypes["order_by"] | undefined | null;
    user2_last_read_message_id?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
    user2_spam_user1?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: auth.friendships */
  ["auth_friendships_pk_columns_input"]: {
    user1: string;
    user2: string;
  };
  /** select columns of table "auth.friendships" */
  ["auth_friendships_select_column"]: auth_friendships_select_column;
  /** input type for updating data in table "auth.friendships" */
  ["auth_friendships_set_input"]: {
    are_friends?: boolean | undefined | null;
    id?: number | undefined | null;
    last_message?: string | undefined | null;
    last_message_client_uuid?: string | undefined | null;
    last_message_sender?: string | undefined | null;
    last_message_timestamp?:
      | ResolverInputTypes["timestamptz"]
      | undefined
      | null;
    user1?: string | undefined | null;
    user1_blocked_user2?: boolean | undefined | null;
    user1_interacted?: boolean | undefined | null;
    user1_last_read_message_id?: string | undefined | null;
    user1_spam_user2?: boolean | undefined | null;
    user2?: string | undefined | null;
    user2_blocked_user1?: boolean | undefined | null;
    user2_interacted?: boolean | undefined | null;
    user2_last_read_message_id?: string | undefined | null;
    user2_spam_user1?: boolean | undefined | null;
  };
  /** aggregate stddev on columns */
  ["auth_friendships_stddev_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_pop on columns */
  ["auth_friendships_stddev_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_samp on columns */
  ["auth_friendships_stddev_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Streaming cursor of the table "auth_friendships" */
  ["auth_friendships_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["auth_friendships_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_friendships_stream_cursor_value_input"]: {
    are_friends?: boolean | undefined | null;
    id?: number | undefined | null;
    last_message?: string | undefined | null;
    last_message_client_uuid?: string | undefined | null;
    last_message_sender?: string | undefined | null;
    last_message_timestamp?:
      | ResolverInputTypes["timestamptz"]
      | undefined
      | null;
    user1?: string | undefined | null;
    user1_blocked_user2?: boolean | undefined | null;
    user1_interacted?: boolean | undefined | null;
    user1_last_read_message_id?: string | undefined | null;
    user1_spam_user2?: boolean | undefined | null;
    user2?: string | undefined | null;
    user2_blocked_user1?: boolean | undefined | null;
    user2_interacted?: boolean | undefined | null;
    user2_last_read_message_id?: string | undefined | null;
    user2_spam_user1?: boolean | undefined | null;
  };
  /** aggregate sum on columns */
  ["auth_friendships_sum_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** update columns of table "auth.friendships" */
  ["auth_friendships_update_column"]: auth_friendships_update_column;
  ["auth_friendships_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ResolverInputTypes["auth_friendships_inc_input"] | undefined | null;
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["auth_friendships_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["auth_friendships_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["auth_friendships_var_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate var_samp on columns */
  ["auth_friendships_var_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate variance on columns */
  ["auth_friendships_variance_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
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
    /** An object relationship */
    user?: ResolverInputTypes["auth_users"];
    __typename?: boolean | `@${string}`;
  }>;
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
    user?: ResolverInputTypes["auth_users_bool_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "auth.invitations" */
  ["auth_invitations_constraint"]: auth_invitations_constraint;
  /** input type for inserting data into table "auth.invitations" */
  ["auth_invitations_insert_input"]: {
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    data?: ResolverInputTypes["jsonb"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    user?:
      | ResolverInputTypes["auth_users_obj_rel_insert_input"]
      | undefined
      | null;
  };
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
    user?: ResolverInputTypes["auth_users_order_by"] | undefined | null;
  };
  /** select columns of table "auth.invitations" */
  ["auth_invitations_select_column"]: auth_invitations_select_column;
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
  /** placeholder for update columns of table "auth.invitations" (current role has no relevant permissions) */
  ["auth_invitations_update_column"]: auth_invitations_update_column;
  /** columns and relationships of "auth.notification_cursor" */
  ["auth_notification_cursor"]: AliasType<{
    last_read_notificaiton?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.notification_cursor". All fields are combined with a logical 'AND'. */
  ["auth_notification_cursor_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["auth_notification_cursor_bool_exp"]>
      | undefined
      | null;
    _not?:
      | ResolverInputTypes["auth_notification_cursor_bool_exp"]
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["auth_notification_cursor_bool_exp"]>
      | undefined
      | null;
    last_read_notificaiton?:
      | ResolverInputTypes["Int_comparison_exp"]
      | undefined
      | null;
    uuid?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "auth.notification_cursor" */
  ["auth_notification_cursor_constraint"]: auth_notification_cursor_constraint;
  /** input type for incrementing numeric columns in table "auth.notification_cursor" */
  ["auth_notification_cursor_inc_input"]: {
    last_read_notificaiton?: number | undefined | null;
  };
  /** input type for inserting data into table "auth.notification_cursor" */
  ["auth_notification_cursor_insert_input"]: {
    last_read_notificaiton?: number | undefined | null;
    uuid?: string | undefined | null;
  };
  /** response of any mutation on the table "auth.notification_cursor" */
  ["auth_notification_cursor_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_notification_cursor"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.notification_cursor" */
  ["auth_notification_cursor_on_conflict"]: {
    constraint: ResolverInputTypes["auth_notification_cursor_constraint"];
    update_columns: Array<
      ResolverInputTypes["auth_notification_cursor_update_column"]
    >;
    where?:
      | ResolverInputTypes["auth_notification_cursor_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "auth.notification_cursor". */
  ["auth_notification_cursor_order_by"]: {
    last_read_notificaiton?: ResolverInputTypes["order_by"] | undefined | null;
    uuid?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: auth.notification_cursor */
  ["auth_notification_cursor_pk_columns_input"]: {
    uuid: string;
  };
  /** select columns of table "auth.notification_cursor" */
  ["auth_notification_cursor_select_column"]: auth_notification_cursor_select_column;
  /** input type for updating data in table "auth.notification_cursor" */
  ["auth_notification_cursor_set_input"]: {
    last_read_notificaiton?: number | undefined | null;
    uuid?: string | undefined | null;
  };
  /** Streaming cursor of the table "auth_notification_cursor" */
  ["auth_notification_cursor_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["auth_notification_cursor_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_notification_cursor_stream_cursor_value_input"]: {
    last_read_notificaiton?: number | undefined | null;
    uuid?: string | undefined | null;
  };
  /** update columns of table "auth.notification_cursor" */
  ["auth_notification_cursor_update_column"]: auth_notification_cursor_update_column;
  ["auth_notification_cursor_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ResolverInputTypes["auth_notification_cursor_inc_input"]
      | undefined
      | null;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ResolverInputTypes["auth_notification_cursor_set_input"]
      | undefined
      | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["auth_notification_cursor_bool_exp"];
  };
  /** columns and relationships of "auth.notification_subscriptions" */
  ["auth_notification_subscriptions"]: AliasType<{
    auth?: boolean | `@${string}`;
    endpoint?: boolean | `@${string}`;
    expirationTime?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    p256dh?: boolean | `@${string}`;
    public_key?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.notification_subscriptions". All fields are combined with a logical 'AND'. */
  ["auth_notification_subscriptions_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["auth_notification_subscriptions_bool_exp"]>
      | undefined
      | null;
    _not?:
      | ResolverInputTypes["auth_notification_subscriptions_bool_exp"]
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["auth_notification_subscriptions_bool_exp"]>
      | undefined
      | null;
    auth?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    endpoint?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    expirationTime?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    p256dh?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    public_key?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    username?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    uuid?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_constraint"]: auth_notification_subscriptions_constraint;
  /** input type for incrementing numeric columns in table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_inc_input"]: {
    id?: number | undefined | null;
  };
  /** input type for inserting data into table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_insert_input"]: {
    auth?: string | undefined | null;
    endpoint?: string | undefined | null;
    expirationTime?: string | undefined | null;
    id?: number | undefined | null;
    p256dh?: string | undefined | null;
    public_key?: string | undefined | null;
    username?: string | undefined | null;
    uuid?: string | undefined | null;
  };
  /** response of any mutation on the table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_notification_subscriptions"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_on_conflict"]: {
    constraint: ResolverInputTypes["auth_notification_subscriptions_constraint"];
    update_columns: Array<
      ResolverInputTypes["auth_notification_subscriptions_update_column"]
    >;
    where?:
      | ResolverInputTypes["auth_notification_subscriptions_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "auth.notification_subscriptions". */
  ["auth_notification_subscriptions_order_by"]: {
    auth?: ResolverInputTypes["order_by"] | undefined | null;
    endpoint?: ResolverInputTypes["order_by"] | undefined | null;
    expirationTime?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    p256dh?: ResolverInputTypes["order_by"] | undefined | null;
    public_key?: ResolverInputTypes["order_by"] | undefined | null;
    username?: ResolverInputTypes["order_by"] | undefined | null;
    uuid?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: auth.notification_subscriptions */
  ["auth_notification_subscriptions_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_select_column"]: auth_notification_subscriptions_select_column;
  /** input type for updating data in table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_set_input"]: {
    auth?: string | undefined | null;
    endpoint?: string | undefined | null;
    expirationTime?: string | undefined | null;
    id?: number | undefined | null;
    p256dh?: string | undefined | null;
    public_key?: string | undefined | null;
    username?: string | undefined | null;
  };
  /** Streaming cursor of the table "auth_notification_subscriptions" */
  ["auth_notification_subscriptions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["auth_notification_subscriptions_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_notification_subscriptions_stream_cursor_value_input"]: {
    auth?: string | undefined | null;
    endpoint?: string | undefined | null;
    expirationTime?: string | undefined | null;
    id?: number | undefined | null;
    p256dh?: string | undefined | null;
    public_key?: string | undefined | null;
    username?: string | undefined | null;
    uuid?: string | undefined | null;
  };
  /** update columns of table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_update_column"]: auth_notification_subscriptions_update_column;
  ["auth_notification_subscriptions_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ResolverInputTypes["auth_notification_subscriptions_inc_input"]
      | undefined
      | null;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ResolverInputTypes["auth_notification_subscriptions_set_input"]
      | undefined
      | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["auth_notification_subscriptions_bool_exp"];
  };
  /** columns and relationships of "auth.notifications" */
  ["auth_notifications"]: AliasType<{
    body?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    image?: boolean | `@${string}`;
    timestamp?: boolean | `@${string}`;
    title?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    viewed?: boolean | `@${string}`;
    xnft_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "auth.notifications" */
  ["auth_notifications_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["auth_notifications_aggregate_fields"];
    nodes?: ResolverInputTypes["auth_notifications"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "auth.notifications" */
  ["auth_notifications_aggregate_fields"]: AliasType<{
    avg?: ResolverInputTypes["auth_notifications_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["auth_notifications_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`
    ];
    max?: ResolverInputTypes["auth_notifications_max_fields"];
    min?: ResolverInputTypes["auth_notifications_min_fields"];
    stddev?: ResolverInputTypes["auth_notifications_stddev_fields"];
    stddev_pop?: ResolverInputTypes["auth_notifications_stddev_pop_fields"];
    stddev_samp?: ResolverInputTypes["auth_notifications_stddev_samp_fields"];
    sum?: ResolverInputTypes["auth_notifications_sum_fields"];
    var_pop?: ResolverInputTypes["auth_notifications_var_pop_fields"];
    var_samp?: ResolverInputTypes["auth_notifications_var_samp_fields"];
    variance?: ResolverInputTypes["auth_notifications_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate avg on columns */
  ["auth_notifications_avg_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.notifications". All fields are combined with a logical 'AND'. */
  ["auth_notifications_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["auth_notifications_bool_exp"]>
      | undefined
      | null;
    _not?: ResolverInputTypes["auth_notifications_bool_exp"] | undefined | null;
    _or?:
      | Array<ResolverInputTypes["auth_notifications_bool_exp"]>
      | undefined
      | null;
    body?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    image?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    timestamp?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    title?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    username?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    uuid?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    viewed?: ResolverInputTypes["Boolean_comparison_exp"] | undefined | null;
    xnft_id?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "auth.notifications" */
  ["auth_notifications_constraint"]: auth_notifications_constraint;
  /** input type for incrementing numeric columns in table "auth.notifications" */
  ["auth_notifications_inc_input"]: {
    id?: number | undefined | null;
  };
  /** input type for inserting data into table "auth.notifications" */
  ["auth_notifications_insert_input"]: {
    body?: string | undefined | null;
    id?: number | undefined | null;
    image?: string | undefined | null;
    timestamp?: ResolverInputTypes["timestamptz"] | undefined | null;
    title?: string | undefined | null;
    username?: string | undefined | null;
    uuid?: string | undefined | null;
    viewed?: boolean | undefined | null;
    xnft_id?: string | undefined | null;
  };
  /** aggregate max on columns */
  ["auth_notifications_max_fields"]: AliasType<{
    body?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    image?: boolean | `@${string}`;
    timestamp?: boolean | `@${string}`;
    title?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    xnft_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["auth_notifications_min_fields"]: AliasType<{
    body?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    image?: boolean | `@${string}`;
    timestamp?: boolean | `@${string}`;
    title?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    xnft_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "auth.notifications" */
  ["auth_notifications_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_notifications"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.notifications" */
  ["auth_notifications_on_conflict"]: {
    constraint: ResolverInputTypes["auth_notifications_constraint"];
    update_columns: Array<
      ResolverInputTypes["auth_notifications_update_column"]
    >;
    where?:
      | ResolverInputTypes["auth_notifications_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "auth.notifications". */
  ["auth_notifications_order_by"]: {
    body?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    image?: ResolverInputTypes["order_by"] | undefined | null;
    timestamp?: ResolverInputTypes["order_by"] | undefined | null;
    title?: ResolverInputTypes["order_by"] | undefined | null;
    username?: ResolverInputTypes["order_by"] | undefined | null;
    uuid?: ResolverInputTypes["order_by"] | undefined | null;
    viewed?: ResolverInputTypes["order_by"] | undefined | null;
    xnft_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: auth.notifications */
  ["auth_notifications_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "auth.notifications" */
  ["auth_notifications_select_column"]: auth_notifications_select_column;
  /** input type for updating data in table "auth.notifications" */
  ["auth_notifications_set_input"]: {
    body?: string | undefined | null;
    id?: number | undefined | null;
    image?: string | undefined | null;
    title?: string | undefined | null;
    username?: string | undefined | null;
    uuid?: string | undefined | null;
    viewed?: boolean | undefined | null;
    xnft_id?: string | undefined | null;
  };
  /** aggregate stddev on columns */
  ["auth_notifications_stddev_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_pop on columns */
  ["auth_notifications_stddev_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_samp on columns */
  ["auth_notifications_stddev_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Streaming cursor of the table "auth_notifications" */
  ["auth_notifications_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["auth_notifications_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_notifications_stream_cursor_value_input"]: {
    body?: string | undefined | null;
    id?: number | undefined | null;
    image?: string | undefined | null;
    timestamp?: ResolverInputTypes["timestamptz"] | undefined | null;
    title?: string | undefined | null;
    username?: string | undefined | null;
    uuid?: string | undefined | null;
    viewed?: boolean | undefined | null;
    xnft_id?: string | undefined | null;
  };
  /** aggregate sum on columns */
  ["auth_notifications_sum_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** update columns of table "auth.notifications" */
  ["auth_notifications_update_column"]: auth_notifications_update_column;
  ["auth_notifications_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ResolverInputTypes["auth_notifications_inc_input"]
      | undefined
      | null;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ResolverInputTypes["auth_notifications_set_input"]
      | undefined
      | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["auth_notifications_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["auth_notifications_var_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate var_samp on columns */
  ["auth_notifications_var_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate variance on columns */
  ["auth_notifications_variance_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** columns and relationships of "auth.public_keys" */
  ["auth_public_keys"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    public_key?: boolean | `@${string}`;
    /** An object relationship */
    user?: ResolverInputTypes["auth_users"];
    user_active_publickey_mappings?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<
              ResolverInputTypes["auth_user_active_publickey_mapping_select_column"]
            >
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
          | Array<
              ResolverInputTypes["auth_user_active_publickey_mapping_order_by"]
            >
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_user_active_publickey_mapping_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_user_active_publickey_mapping"]
    ];
    user_id?: boolean | `@${string}`;
    user_nfts?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_user_nfts_select_column"]>
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
          | Array<ResolverInputTypes["auth_user_nfts_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_user_nfts_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_user_nfts"]
    ];
    user_nfts_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_user_nfts_select_column"]>
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
          | Array<ResolverInputTypes["auth_user_nfts_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_user_nfts_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_user_nfts_aggregate"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "auth.public_keys" */
  ["auth_public_keys_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["auth_public_keys_aggregate_fields"];
    nodes?: ResolverInputTypes["auth_public_keys"];
    __typename?: boolean | `@${string}`;
  }>;
  ["auth_public_keys_aggregate_bool_exp"]: {
    count?:
      | ResolverInputTypes["auth_public_keys_aggregate_bool_exp_count"]
      | undefined
      | null;
  };
  ["auth_public_keys_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ResolverInputTypes["auth_public_keys_select_column"]>
      | undefined
      | null;
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["auth_public_keys_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "auth.public_keys" */
  ["auth_public_keys_aggregate_fields"]: AliasType<{
    avg?: ResolverInputTypes["auth_public_keys_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["auth_public_keys_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`
    ];
    max?: ResolverInputTypes["auth_public_keys_max_fields"];
    min?: ResolverInputTypes["auth_public_keys_min_fields"];
    stddev?: ResolverInputTypes["auth_public_keys_stddev_fields"];
    stddev_pop?: ResolverInputTypes["auth_public_keys_stddev_pop_fields"];
    stddev_samp?: ResolverInputTypes["auth_public_keys_stddev_samp_fields"];
    sum?: ResolverInputTypes["auth_public_keys_sum_fields"];
    var_pop?: ResolverInputTypes["auth_public_keys_var_pop_fields"];
    var_samp?: ResolverInputTypes["auth_public_keys_var_samp_fields"];
    variance?: ResolverInputTypes["auth_public_keys_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "auth.public_keys" */
  ["auth_public_keys_aggregate_order_by"]: {
    avg?:
      | ResolverInputTypes["auth_public_keys_avg_order_by"]
      | undefined
      | null;
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?:
      | ResolverInputTypes["auth_public_keys_max_order_by"]
      | undefined
      | null;
    min?:
      | ResolverInputTypes["auth_public_keys_min_order_by"]
      | undefined
      | null;
    stddev?:
      | ResolverInputTypes["auth_public_keys_stddev_order_by"]
      | undefined
      | null;
    stddev_pop?:
      | ResolverInputTypes["auth_public_keys_stddev_pop_order_by"]
      | undefined
      | null;
    stddev_samp?:
      | ResolverInputTypes["auth_public_keys_stddev_samp_order_by"]
      | undefined
      | null;
    sum?:
      | ResolverInputTypes["auth_public_keys_sum_order_by"]
      | undefined
      | null;
    var_pop?:
      | ResolverInputTypes["auth_public_keys_var_pop_order_by"]
      | undefined
      | null;
    var_samp?:
      | ResolverInputTypes["auth_public_keys_var_samp_order_by"]
      | undefined
      | null;
    variance?:
      | ResolverInputTypes["auth_public_keys_variance_order_by"]
      | undefined
      | null;
  };
  /** input type for inserting array relation for remote table "auth.public_keys" */
  ["auth_public_keys_arr_rel_insert_input"]: {
    data: Array<ResolverInputTypes["auth_public_keys_insert_input"]>;
    /** upsert condition */
    on_conflict?:
      | ResolverInputTypes["auth_public_keys_on_conflict"]
      | undefined
      | null;
  };
  /** aggregate avg on columns */
  ["auth_public_keys_avg_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by avg() on columns of table "auth.public_keys" */
  ["auth_public_keys_avg_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Boolean expression to filter rows from the table "auth.public_keys". All fields are combined with a logical 'AND'. */
  ["auth_public_keys_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["auth_public_keys_bool_exp"]>
      | undefined
      | null;
    _not?: ResolverInputTypes["auth_public_keys_bool_exp"] | undefined | null;
    _or?:
      | Array<ResolverInputTypes["auth_public_keys_bool_exp"]>
      | undefined
      | null;
    blockchain?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    created_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    public_key?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    user?: ResolverInputTypes["auth_users_bool_exp"] | undefined | null;
    user_active_publickey_mappings?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_bool_exp"]
      | undefined
      | null;
    user_id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    user_nfts?:
      | ResolverInputTypes["auth_user_nfts_bool_exp"]
      | undefined
      | null;
    user_nfts_aggregate?:
      | ResolverInputTypes["auth_user_nfts_aggregate_bool_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "auth.public_keys" */
  ["auth_public_keys_constraint"]: auth_public_keys_constraint;
  /** input type for inserting data into table "auth.public_keys" */
  ["auth_public_keys_insert_input"]: {
    blockchain?: string | undefined | null;
    public_key?: string | undefined | null;
    user?:
      | ResolverInputTypes["auth_users_obj_rel_insert_input"]
      | undefined
      | null;
    user_active_publickey_mappings?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_arr_rel_insert_input"]
      | undefined
      | null;
    user_id?: ResolverInputTypes["uuid"] | undefined | null;
    user_nfts?:
      | ResolverInputTypes["auth_user_nfts_arr_rel_insert_input"]
      | undefined
      | null;
  };
  /** aggregate max on columns */
  ["auth_public_keys_max_fields"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    public_key?: boolean | `@${string}`;
    user_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "auth.public_keys" */
  ["auth_public_keys_max_order_by"]: {
    blockchain?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    public_key?: ResolverInputTypes["order_by"] | undefined | null;
    user_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate min on columns */
  ["auth_public_keys_min_fields"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    public_key?: boolean | `@${string}`;
    user_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "auth.public_keys" */
  ["auth_public_keys_min_order_by"]: {
    blockchain?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    public_key?: ResolverInputTypes["order_by"] | undefined | null;
    user_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** response of any mutation on the table "auth.public_keys" */
  ["auth_public_keys_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_public_keys"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "auth.public_keys" */
  ["auth_public_keys_obj_rel_insert_input"]: {
    data: ResolverInputTypes["auth_public_keys_insert_input"];
    /** upsert condition */
    on_conflict?:
      | ResolverInputTypes["auth_public_keys_on_conflict"]
      | undefined
      | null;
  };
  /** on_conflict condition type for table "auth.public_keys" */
  ["auth_public_keys_on_conflict"]: {
    constraint: ResolverInputTypes["auth_public_keys_constraint"];
    update_columns: Array<ResolverInputTypes["auth_public_keys_update_column"]>;
    where?: ResolverInputTypes["auth_public_keys_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "auth.public_keys". */
  ["auth_public_keys_order_by"]: {
    blockchain?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    public_key?: ResolverInputTypes["order_by"] | undefined | null;
    user?: ResolverInputTypes["auth_users_order_by"] | undefined | null;
    user_active_publickey_mappings_aggregate?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_aggregate_order_by"]
      | undefined
      | null;
    user_id?: ResolverInputTypes["order_by"] | undefined | null;
    user_nfts_aggregate?:
      | ResolverInputTypes["auth_user_nfts_aggregate_order_by"]
      | undefined
      | null;
  };
  /** select columns of table "auth.public_keys" */
  ["auth_public_keys_select_column"]: auth_public_keys_select_column;
  /** aggregate stddev on columns */
  ["auth_public_keys_stddev_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by stddev() on columns of table "auth.public_keys" */
  ["auth_public_keys_stddev_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate stddev_pop on columns */
  ["auth_public_keys_stddev_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by stddev_pop() on columns of table "auth.public_keys" */
  ["auth_public_keys_stddev_pop_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate stddev_samp on columns */
  ["auth_public_keys_stddev_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by stddev_samp() on columns of table "auth.public_keys" */
  ["auth_public_keys_stddev_samp_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Streaming cursor of the table "auth_public_keys" */
  ["auth_public_keys_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["auth_public_keys_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_public_keys_stream_cursor_value_input"]: {
    blockchain?: string | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: number | undefined | null;
    public_key?: string | undefined | null;
    user_id?: ResolverInputTypes["uuid"] | undefined | null;
  };
  /** aggregate sum on columns */
  ["auth_public_keys_sum_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by sum() on columns of table "auth.public_keys" */
  ["auth_public_keys_sum_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** placeholder for update columns of table "auth.public_keys" (current role has no relevant permissions) */
  ["auth_public_keys_update_column"]: auth_public_keys_update_column;
  /** aggregate var_pop on columns */
  ["auth_public_keys_var_pop_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by var_pop() on columns of table "auth.public_keys" */
  ["auth_public_keys_var_pop_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate var_samp on columns */
  ["auth_public_keys_var_samp_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by var_samp() on columns of table "auth.public_keys" */
  ["auth_public_keys_var_samp_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate variance on columns */
  ["auth_public_keys_variance_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by variance() on columns of table "auth.public_keys" */
  ["auth_public_keys_variance_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** columns and relationships of "auth.stripe_onramp" */
  ["auth_stripe_onramp"]: AliasType<{
    client_secret?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    public_key?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    webhook_dump?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.stripe_onramp". All fields are combined with a logical 'AND'. */
  ["auth_stripe_onramp_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["auth_stripe_onramp_bool_exp"]>
      | undefined
      | null;
    _not?: ResolverInputTypes["auth_stripe_onramp_bool_exp"] | undefined | null;
    _or?:
      | Array<ResolverInputTypes["auth_stripe_onramp_bool_exp"]>
      | undefined
      | null;
    client_secret?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    public_key?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    status?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    webhook_dump?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "auth.stripe_onramp" */
  ["auth_stripe_onramp_constraint"]: auth_stripe_onramp_constraint;
  /** input type for incrementing numeric columns in table "auth.stripe_onramp" */
  ["auth_stripe_onramp_inc_input"]: {
    id?: number | undefined | null;
  };
  /** input type for inserting data into table "auth.stripe_onramp" */
  ["auth_stripe_onramp_insert_input"]: {
    client_secret?: string | undefined | null;
    id?: number | undefined | null;
    public_key?: string | undefined | null;
    status?: string | undefined | null;
    webhook_dump?: string | undefined | null;
  };
  /** response of any mutation on the table "auth.stripe_onramp" */
  ["auth_stripe_onramp_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_stripe_onramp"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.stripe_onramp" */
  ["auth_stripe_onramp_on_conflict"]: {
    constraint: ResolverInputTypes["auth_stripe_onramp_constraint"];
    update_columns: Array<
      ResolverInputTypes["auth_stripe_onramp_update_column"]
    >;
    where?:
      | ResolverInputTypes["auth_stripe_onramp_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "auth.stripe_onramp". */
  ["auth_stripe_onramp_order_by"]: {
    client_secret?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    public_key?: ResolverInputTypes["order_by"] | undefined | null;
    status?: ResolverInputTypes["order_by"] | undefined | null;
    webhook_dump?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: auth.stripe_onramp */
  ["auth_stripe_onramp_pk_columns_input"]: {
    client_secret: string;
  };
  /** select columns of table "auth.stripe_onramp" */
  ["auth_stripe_onramp_select_column"]: auth_stripe_onramp_select_column;
  /** input type for updating data in table "auth.stripe_onramp" */
  ["auth_stripe_onramp_set_input"]: {
    client_secret?: string | undefined | null;
    id?: number | undefined | null;
    public_key?: string | undefined | null;
    status?: string | undefined | null;
    webhook_dump?: string | undefined | null;
  };
  /** Streaming cursor of the table "auth_stripe_onramp" */
  ["auth_stripe_onramp_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["auth_stripe_onramp_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_stripe_onramp_stream_cursor_value_input"]: {
    client_secret?: string | undefined | null;
    id?: number | undefined | null;
    public_key?: string | undefined | null;
    status?: string | undefined | null;
    webhook_dump?: string | undefined | null;
  };
  /** update columns of table "auth.stripe_onramp" */
  ["auth_stripe_onramp_update_column"]: auth_stripe_onramp_update_column;
  ["auth_stripe_onramp_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ResolverInputTypes["auth_stripe_onramp_inc_input"]
      | undefined
      | null;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ResolverInputTypes["auth_stripe_onramp_set_input"]
      | undefined
      | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["auth_stripe_onramp_bool_exp"];
  };
  /** columns and relationships of "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    /** An object relationship */
    public_key?: ResolverInputTypes["auth_public_keys"];
    public_key_id?: boolean | `@${string}`;
    user_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_aggregate_order_by"]: {
    avg?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_avg_order_by"]
      | undefined
      | null;
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_max_order_by"]
      | undefined
      | null;
    min?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_min_order_by"]
      | undefined
      | null;
    stddev?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_stddev_order_by"]
      | undefined
      | null;
    stddev_pop?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_stddev_pop_order_by"]
      | undefined
      | null;
    stddev_samp?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_stddev_samp_order_by"]
      | undefined
      | null;
    sum?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_sum_order_by"]
      | undefined
      | null;
    var_pop?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_var_pop_order_by"]
      | undefined
      | null;
    var_samp?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_var_samp_order_by"]
      | undefined
      | null;
    variance?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_variance_order_by"]
      | undefined
      | null;
  };
  /** input type for inserting array relation for remote table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_arr_rel_insert_input"]: {
    data: Array<
      ResolverInputTypes["auth_user_active_publickey_mapping_insert_input"]
    >;
    /** upsert condition */
    on_conflict?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_on_conflict"]
      | undefined
      | null;
  };
  /** order by avg() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_avg_order_by"]: {
    public_key_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Boolean expression to filter rows from the table "auth.user_active_publickey_mapping". All fields are combined with a logical 'AND'. */
  ["auth_user_active_publickey_mapping_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["auth_user_active_publickey_mapping_bool_exp"]>
      | undefined
      | null;
    _not?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_bool_exp"]
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["auth_user_active_publickey_mapping_bool_exp"]>
      | undefined
      | null;
    blockchain?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    public_key?:
      | ResolverInputTypes["auth_public_keys_bool_exp"]
      | undefined
      | null;
    public_key_id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    user_id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_constraint"]: auth_user_active_publickey_mapping_constraint;
  /** input type for incrementing numeric columns in table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_inc_input"]: {
    public_key_id?: number | undefined | null;
  };
  /** input type for inserting data into table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_insert_input"]: {
    blockchain?: string | undefined | null;
    public_key?:
      | ResolverInputTypes["auth_public_keys_obj_rel_insert_input"]
      | undefined
      | null;
    public_key_id?: number | undefined | null;
    user_id?: ResolverInputTypes["uuid"] | undefined | null;
  };
  /** order by max() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_max_order_by"]: {
    blockchain?: ResolverInputTypes["order_by"] | undefined | null;
    public_key_id?: ResolverInputTypes["order_by"] | undefined | null;
    user_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by min() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_min_order_by"]: {
    blockchain?: ResolverInputTypes["order_by"] | undefined | null;
    public_key_id?: ResolverInputTypes["order_by"] | undefined | null;
    user_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** response of any mutation on the table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_user_active_publickey_mapping"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_on_conflict"]: {
    constraint: ResolverInputTypes["auth_user_active_publickey_mapping_constraint"];
    update_columns: Array<
      ResolverInputTypes["auth_user_active_publickey_mapping_update_column"]
    >;
    where?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "auth.user_active_publickey_mapping". */
  ["auth_user_active_publickey_mapping_order_by"]: {
    blockchain?: ResolverInputTypes["order_by"] | undefined | null;
    public_key?:
      | ResolverInputTypes["auth_public_keys_order_by"]
      | undefined
      | null;
    public_key_id?: ResolverInputTypes["order_by"] | undefined | null;
    user_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: auth.user_active_publickey_mapping */
  ["auth_user_active_publickey_mapping_pk_columns_input"]: {
    blockchain: string;
    user_id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_select_column"]: auth_user_active_publickey_mapping_select_column;
  /** input type for updating data in table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_set_input"]: {
    blockchain?: string | undefined | null;
    public_key_id?: number | undefined | null;
    user_id?: ResolverInputTypes["uuid"] | undefined | null;
  };
  /** order by stddev() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stddev_order_by"]: {
    public_key_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_pop() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stddev_pop_order_by"]: {
    public_key_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_samp() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stddev_samp_order_by"]: {
    public_key_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Streaming cursor of the table "auth_user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["auth_user_active_publickey_mapping_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_user_active_publickey_mapping_stream_cursor_value_input"]: {
    blockchain?: string | undefined | null;
    public_key_id?: number | undefined | null;
    user_id?: ResolverInputTypes["uuid"] | undefined | null;
  };
  /** order by sum() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_sum_order_by"]: {
    public_key_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** update columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_update_column"]: auth_user_active_publickey_mapping_update_column;
  ["auth_user_active_publickey_mapping_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_inc_input"]
      | undefined
      | null;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ResolverInputTypes["auth_user_active_publickey_mapping_set_input"]
      | undefined
      | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["auth_user_active_publickey_mapping_bool_exp"];
  };
  /** order by var_pop() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_var_pop_order_by"]: {
    public_key_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by var_samp() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_var_samp_order_by"]: {
    public_key_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by variance() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_variance_order_by"]: {
    public_key_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** columns and relationships of "auth.user_nfts" */
  ["auth_user_nfts"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    centralized_group?: boolean | `@${string}`;
    collection_id?: boolean | `@${string}`;
    nft_id?: boolean | `@${string}`;
    /** An object relationship */
    publicKeyByBlockchainPublicKey?: ResolverInputTypes["auth_public_keys"];
    public_key?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "auth.user_nfts" */
  ["auth_user_nfts_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["auth_user_nfts_aggregate_fields"];
    nodes?: ResolverInputTypes["auth_user_nfts"];
    __typename?: boolean | `@${string}`;
  }>;
  ["auth_user_nfts_aggregate_bool_exp"]: {
    count?:
      | ResolverInputTypes["auth_user_nfts_aggregate_bool_exp_count"]
      | undefined
      | null;
  };
  ["auth_user_nfts_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ResolverInputTypes["auth_user_nfts_select_column"]>
      | undefined
      | null;
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["auth_user_nfts_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "auth.user_nfts" */
  ["auth_user_nfts_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["auth_user_nfts_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`
    ];
    max?: ResolverInputTypes["auth_user_nfts_max_fields"];
    min?: ResolverInputTypes["auth_user_nfts_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "auth.user_nfts" */
  ["auth_user_nfts_aggregate_order_by"]: {
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?: ResolverInputTypes["auth_user_nfts_max_order_by"] | undefined | null;
    min?: ResolverInputTypes["auth_user_nfts_min_order_by"] | undefined | null;
  };
  /** input type for inserting array relation for remote table "auth.user_nfts" */
  ["auth_user_nfts_arr_rel_insert_input"]: {
    data: Array<ResolverInputTypes["auth_user_nfts_insert_input"]>;
    /** upsert condition */
    on_conflict?:
      | ResolverInputTypes["auth_user_nfts_on_conflict"]
      | undefined
      | null;
  };
  /** Boolean expression to filter rows from the table "auth.user_nfts". All fields are combined with a logical 'AND'. */
  ["auth_user_nfts_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["auth_user_nfts_bool_exp"]>
      | undefined
      | null;
    _not?: ResolverInputTypes["auth_user_nfts_bool_exp"] | undefined | null;
    _or?:
      | Array<ResolverInputTypes["auth_user_nfts_bool_exp"]>
      | undefined
      | null;
    blockchain?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    centralized_group?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    collection_id?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    nft_id?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    publicKeyByBlockchainPublicKey?:
      | ResolverInputTypes["auth_public_keys_bool_exp"]
      | undefined
      | null;
    public_key?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "auth.user_nfts" */
  ["auth_user_nfts_constraint"]: auth_user_nfts_constraint;
  /** input type for inserting data into table "auth.user_nfts" */
  ["auth_user_nfts_insert_input"]: {
    blockchain?: string | undefined | null;
    centralized_group?: string | undefined | null;
    collection_id?: string | undefined | null;
    nft_id?: string | undefined | null;
    publicKeyByBlockchainPublicKey?:
      | ResolverInputTypes["auth_public_keys_obj_rel_insert_input"]
      | undefined
      | null;
    public_key?: string | undefined | null;
  };
  /** aggregate max on columns */
  ["auth_user_nfts_max_fields"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    centralized_group?: boolean | `@${string}`;
    collection_id?: boolean | `@${string}`;
    nft_id?: boolean | `@${string}`;
    public_key?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "auth.user_nfts" */
  ["auth_user_nfts_max_order_by"]: {
    blockchain?: ResolverInputTypes["order_by"] | undefined | null;
    centralized_group?: ResolverInputTypes["order_by"] | undefined | null;
    collection_id?: ResolverInputTypes["order_by"] | undefined | null;
    nft_id?: ResolverInputTypes["order_by"] | undefined | null;
    public_key?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate min on columns */
  ["auth_user_nfts_min_fields"]: AliasType<{
    blockchain?: boolean | `@${string}`;
    centralized_group?: boolean | `@${string}`;
    collection_id?: boolean | `@${string}`;
    nft_id?: boolean | `@${string}`;
    public_key?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "auth.user_nfts" */
  ["auth_user_nfts_min_order_by"]: {
    blockchain?: ResolverInputTypes["order_by"] | undefined | null;
    centralized_group?: ResolverInputTypes["order_by"] | undefined | null;
    collection_id?: ResolverInputTypes["order_by"] | undefined | null;
    nft_id?: ResolverInputTypes["order_by"] | undefined | null;
    public_key?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** response of any mutation on the table "auth.user_nfts" */
  ["auth_user_nfts_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_user_nfts"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.user_nfts" */
  ["auth_user_nfts_on_conflict"]: {
    constraint: ResolverInputTypes["auth_user_nfts_constraint"];
    update_columns: Array<ResolverInputTypes["auth_user_nfts_update_column"]>;
    where?: ResolverInputTypes["auth_user_nfts_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "auth.user_nfts". */
  ["auth_user_nfts_order_by"]: {
    blockchain?: ResolverInputTypes["order_by"] | undefined | null;
    centralized_group?: ResolverInputTypes["order_by"] | undefined | null;
    collection_id?: ResolverInputTypes["order_by"] | undefined | null;
    nft_id?: ResolverInputTypes["order_by"] | undefined | null;
    publicKeyByBlockchainPublicKey?:
      | ResolverInputTypes["auth_public_keys_order_by"]
      | undefined
      | null;
    public_key?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** select columns of table "auth.user_nfts" */
  ["auth_user_nfts_select_column"]: auth_user_nfts_select_column;
  /** Streaming cursor of the table "auth_user_nfts" */
  ["auth_user_nfts_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["auth_user_nfts_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_user_nfts_stream_cursor_value_input"]: {
    blockchain?: string | undefined | null;
    centralized_group?: string | undefined | null;
    collection_id?: string | undefined | null;
    nft_id?: string | undefined | null;
    public_key?: string | undefined | null;
  };
  /** placeholder for update columns of table "auth.user_nfts" (current role has no relevant permissions) */
  ["auth_user_nfts_update_column"]: auth_user_nfts_update_column;
  /** columns and relationships of "auth.users" */
  ["auth_users"]: AliasType<{
    created_at?: boolean | `@${string}`;
    dropzone_public_key?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_public_keys_select_column"]>
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
          | Array<ResolverInputTypes["auth_public_keys_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_public_keys_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_public_keys"]
    ];
    id?: boolean | `@${string}`;
    /** An object relationship */
    invitation?: ResolverInputTypes["auth_invitations"];
    public_keys?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_public_keys_select_column"]>
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
          | Array<ResolverInputTypes["auth_public_keys_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_public_keys_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_public_keys"]
    ];
    public_keys_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_public_keys_select_column"]>
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
          | Array<ResolverInputTypes["auth_public_keys_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_public_keys_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_public_keys_aggregate"]
    ];
    referred_users?: [
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
    referred_users_aggregate?: [
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
    /** An object relationship */
    referrer?: ResolverInputTypes["auth_users"];
    username?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "auth.users" */
  ["auth_users_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["auth_users_aggregate_fields"];
    nodes?: ResolverInputTypes["auth_users"];
    __typename?: boolean | `@${string}`;
  }>;
  ["auth_users_aggregate_bool_exp"]: {
    count?:
      | ResolverInputTypes["auth_users_aggregate_bool_exp_count"]
      | undefined
      | null;
  };
  ["auth_users_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ResolverInputTypes["auth_users_select_column"]>
      | undefined
      | null;
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["auth_users_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["Int_comparison_exp"];
  };
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
  /** order by aggregate values of table "auth.users" */
  ["auth_users_aggregate_order_by"]: {
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?: ResolverInputTypes["auth_users_max_order_by"] | undefined | null;
    min?: ResolverInputTypes["auth_users_min_order_by"] | undefined | null;
  };
  /** input type for inserting array relation for remote table "auth.users" */
  ["auth_users_arr_rel_insert_input"]: {
    data: Array<ResolverInputTypes["auth_users_insert_input"]>;
    /** upsert condition */
    on_conflict?:
      | ResolverInputTypes["auth_users_on_conflict"]
      | undefined
      | null;
  };
  /** Boolean expression to filter rows from the table "auth.users". All fields are combined with a logical 'AND'. */
  ["auth_users_bool_exp"]: {
    _and?: Array<ResolverInputTypes["auth_users_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["auth_users_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["auth_users_bool_exp"]> | undefined | null;
    created_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    dropzone_public_key?:
      | ResolverInputTypes["auth_public_keys_bool_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    invitation?:
      | ResolverInputTypes["auth_invitations_bool_exp"]
      | undefined
      | null;
    public_keys?:
      | ResolverInputTypes["auth_public_keys_bool_exp"]
      | undefined
      | null;
    public_keys_aggregate?:
      | ResolverInputTypes["auth_public_keys_aggregate_bool_exp"]
      | undefined
      | null;
    referred_users?:
      | ResolverInputTypes["auth_users_bool_exp"]
      | undefined
      | null;
    referred_users_aggregate?:
      | ResolverInputTypes["auth_users_aggregate_bool_exp"]
      | undefined
      | null;
    referrer?: ResolverInputTypes["auth_users_bool_exp"] | undefined | null;
    username?: ResolverInputTypes["citext_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "auth.users" */
  ["auth_users_constraint"]: auth_users_constraint;
  /** input type for inserting data into table "auth.users" */
  ["auth_users_insert_input"]: {
    invitation?:
      | ResolverInputTypes["auth_invitations_obj_rel_insert_input"]
      | undefined
      | null;
    invitation_id?: ResolverInputTypes["uuid"] | undefined | null;
    public_keys?:
      | ResolverInputTypes["auth_public_keys_arr_rel_insert_input"]
      | undefined
      | null;
    referred_users?:
      | ResolverInputTypes["auth_users_arr_rel_insert_input"]
      | undefined
      | null;
    referrer?:
      | ResolverInputTypes["auth_users_obj_rel_insert_input"]
      | undefined
      | null;
    referrer_id?: ResolverInputTypes["uuid"] | undefined | null;
    username?: ResolverInputTypes["citext"] | undefined | null;
    waitlist_id?: string | undefined | null;
  };
  /** aggregate max on columns */
  ["auth_users_max_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "auth.users" */
  ["auth_users_max_order_by"]: {
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    username?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate min on columns */
  ["auth_users_min_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "auth.users" */
  ["auth_users_min_order_by"]: {
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    username?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** response of any mutation on the table "auth.users" */
  ["auth_users_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_users"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "auth.users" */
  ["auth_users_obj_rel_insert_input"]: {
    data: ResolverInputTypes["auth_users_insert_input"];
    /** upsert condition */
    on_conflict?:
      | ResolverInputTypes["auth_users_on_conflict"]
      | undefined
      | null;
  };
  /** on_conflict condition type for table "auth.users" */
  ["auth_users_on_conflict"]: {
    constraint: ResolverInputTypes["auth_users_constraint"];
    update_columns: Array<ResolverInputTypes["auth_users_update_column"]>;
    where?: ResolverInputTypes["auth_users_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "auth.users". */
  ["auth_users_order_by"]: {
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    dropzone_public_key_aggregate?:
      | ResolverInputTypes["auth_public_keys_aggregate_order_by"]
      | undefined
      | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    invitation?:
      | ResolverInputTypes["auth_invitations_order_by"]
      | undefined
      | null;
    public_keys_aggregate?:
      | ResolverInputTypes["auth_public_keys_aggregate_order_by"]
      | undefined
      | null;
    referred_users_aggregate?:
      | ResolverInputTypes["auth_users_aggregate_order_by"]
      | undefined
      | null;
    referrer?: ResolverInputTypes["auth_users_order_by"] | undefined | null;
    username?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: auth.users */
  ["auth_users_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "auth.users" */
  ["auth_users_select_column"]: auth_users_select_column;
  /** input type for updating data in table "auth.users" */
  ["auth_users_set_input"]: {
    avatar_nft?: ResolverInputTypes["citext"] | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
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
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    username?: ResolverInputTypes["citext"] | undefined | null;
  };
  /** update columns of table "auth.users" */
  ["auth_users_update_column"]: auth_users_update_column;
  ["auth_users_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["auth_users_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["auth_users_bool_exp"];
  };
  /** columns and relationships of "auth.xnft_preferences" */
  ["auth_xnft_preferences"]: AliasType<{
    disabled?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    media?: boolean | `@${string}`;
    notifications?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    xnft_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.xnft_preferences". All fields are combined with a logical 'AND'. */
  ["auth_xnft_preferences_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["auth_xnft_preferences_bool_exp"]>
      | undefined
      | null;
    _not?:
      | ResolverInputTypes["auth_xnft_preferences_bool_exp"]
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["auth_xnft_preferences_bool_exp"]>
      | undefined
      | null;
    disabled?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    media?: ResolverInputTypes["Boolean_comparison_exp"] | undefined | null;
    notifications?:
      | ResolverInputTypes["Boolean_comparison_exp"]
      | undefined
      | null;
    username?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    uuid?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    xnft_id?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "auth.xnft_preferences" */
  ["auth_xnft_preferences_constraint"]: auth_xnft_preferences_constraint;
  /** input type for incrementing numeric columns in table "auth.xnft_preferences" */
  ["auth_xnft_preferences_inc_input"]: {
    id?: number | undefined | null;
  };
  /** input type for inserting data into table "auth.xnft_preferences" */
  ["auth_xnft_preferences_insert_input"]: {
    disabled?: string | undefined | null;
    id?: number | undefined | null;
    media?: boolean | undefined | null;
    notifications?: boolean | undefined | null;
    username?: string | undefined | null;
    uuid?: string | undefined | null;
    xnft_id?: string | undefined | null;
  };
  /** response of any mutation on the table "auth.xnft_preferences" */
  ["auth_xnft_preferences_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_xnft_preferences"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.xnft_preferences" */
  ["auth_xnft_preferences_on_conflict"]: {
    constraint: ResolverInputTypes["auth_xnft_preferences_constraint"];
    update_columns: Array<
      ResolverInputTypes["auth_xnft_preferences_update_column"]
    >;
    where?:
      | ResolverInputTypes["auth_xnft_preferences_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "auth.xnft_preferences". */
  ["auth_xnft_preferences_order_by"]: {
    disabled?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    media?: ResolverInputTypes["order_by"] | undefined | null;
    notifications?: ResolverInputTypes["order_by"] | undefined | null;
    username?: ResolverInputTypes["order_by"] | undefined | null;
    uuid?: ResolverInputTypes["order_by"] | undefined | null;
    xnft_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: auth.xnft_preferences */
  ["auth_xnft_preferences_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "auth.xnft_preferences" */
  ["auth_xnft_preferences_select_column"]: auth_xnft_preferences_select_column;
  /** input type for updating data in table "auth.xnft_preferences" */
  ["auth_xnft_preferences_set_input"]: {
    disabled?: string | undefined | null;
    id?: number | undefined | null;
    media?: boolean | undefined | null;
    notifications?: boolean | undefined | null;
    username?: string | undefined | null;
    uuid?: string | undefined | null;
    xnft_id?: string | undefined | null;
  };
  /** Streaming cursor of the table "auth_xnft_preferences" */
  ["auth_xnft_preferences_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["auth_xnft_preferences_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_xnft_preferences_stream_cursor_value_input"]: {
    disabled?: string | undefined | null;
    id?: number | undefined | null;
    media?: boolean | undefined | null;
    notifications?: boolean | undefined | null;
    username?: string | undefined | null;
    uuid?: string | undefined | null;
    xnft_id?: string | undefined | null;
  };
  /** update columns of table "auth.xnft_preferences" */
  ["auth_xnft_preferences_update_column"]: auth_xnft_preferences_update_column;
  ["auth_xnft_preferences_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ResolverInputTypes["auth_xnft_preferences_inc_input"]
      | undefined
      | null;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ResolverInputTypes["auth_xnft_preferences_set_input"]
      | undefined
      | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["auth_xnft_preferences_bool_exp"];
  };
  /** columns and relationships of "auth.xnft_secrets" */
  ["auth_xnft_secrets"]: AliasType<{
    id?: boolean | `@${string}`;
    secret?: boolean | `@${string}`;
    xnft_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "auth.xnft_secrets". All fields are combined with a logical 'AND'. */
  ["auth_xnft_secrets_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["auth_xnft_secrets_bool_exp"]>
      | undefined
      | null;
    _not?: ResolverInputTypes["auth_xnft_secrets_bool_exp"] | undefined | null;
    _or?:
      | Array<ResolverInputTypes["auth_xnft_secrets_bool_exp"]>
      | undefined
      | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    secret?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    xnft_id?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "auth.xnft_secrets" */
  ["auth_xnft_secrets_constraint"]: auth_xnft_secrets_constraint;
  /** input type for incrementing numeric columns in table "auth.xnft_secrets" */
  ["auth_xnft_secrets_inc_input"]: {
    id?: number | undefined | null;
  };
  /** input type for inserting data into table "auth.xnft_secrets" */
  ["auth_xnft_secrets_insert_input"]: {
    id?: number | undefined | null;
    secret?: string | undefined | null;
    xnft_id?: string | undefined | null;
  };
  /** response of any mutation on the table "auth.xnft_secrets" */
  ["auth_xnft_secrets_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["auth_xnft_secrets"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "auth.xnft_secrets" */
  ["auth_xnft_secrets_on_conflict"]: {
    constraint: ResolverInputTypes["auth_xnft_secrets_constraint"];
    update_columns: Array<
      ResolverInputTypes["auth_xnft_secrets_update_column"]
    >;
    where?: ResolverInputTypes["auth_xnft_secrets_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "auth.xnft_secrets". */
  ["auth_xnft_secrets_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
    secret?: ResolverInputTypes["order_by"] | undefined | null;
    xnft_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: auth.xnft_secrets */
  ["auth_xnft_secrets_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "auth.xnft_secrets" */
  ["auth_xnft_secrets_select_column"]: auth_xnft_secrets_select_column;
  /** input type for updating data in table "auth.xnft_secrets" */
  ["auth_xnft_secrets_set_input"]: {
    id?: number | undefined | null;
    secret?: string | undefined | null;
    xnft_id?: string | undefined | null;
  };
  /** Streaming cursor of the table "auth_xnft_secrets" */
  ["auth_xnft_secrets_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["auth_xnft_secrets_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_xnft_secrets_stream_cursor_value_input"]: {
    id?: number | undefined | null;
    secret?: string | undefined | null;
    xnft_id?: string | undefined | null;
  };
  /** update columns of table "auth.xnft_secrets" */
  ["auth_xnft_secrets_update_column"]: auth_xnft_secrets_update_column;
  ["auth_xnft_secrets_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ResolverInputTypes["auth_xnft_secrets_inc_input"] | undefined | null;
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["auth_xnft_secrets_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["auth_xnft_secrets_bool_exp"];
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
  /** data used by merkle distributors */
  ["dropzone_distributors"]: AliasType<{
    created_at?: boolean | `@${string}`;
    data?: [
      {
        /** JSON select path */ path?: string | undefined | null;
      },
      boolean | `@${string}`
    ];
    id?: boolean | `@${string}`;
    mint?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "dropzone.distributors" */
  ["dropzone_distributors_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["dropzone_distributors_aggregate_fields"];
    nodes?: ResolverInputTypes["dropzone_distributors"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "dropzone.distributors" */
  ["dropzone_distributors_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["dropzone_distributors_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`
    ];
    max?: ResolverInputTypes["dropzone_distributors_max_fields"];
    min?: ResolverInputTypes["dropzone_distributors_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "dropzone.distributors". All fields are combined with a logical 'AND'. */
  ["dropzone_distributors_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["dropzone_distributors_bool_exp"]>
      | undefined
      | null;
    _not?:
      | ResolverInputTypes["dropzone_distributors_bool_exp"]
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["dropzone_distributors_bool_exp"]>
      | undefined
      | null;
    created_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    data?: ResolverInputTypes["jsonb_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    mint?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "dropzone.distributors" */
  ["dropzone_distributors_constraint"]: dropzone_distributors_constraint;
  /** input type for inserting data into table "dropzone.distributors" */
  ["dropzone_distributors_insert_input"]: {
    data?: ResolverInputTypes["jsonb"] | undefined | null;
    id?: string | undefined | null;
    mint?: string | undefined | null;
  };
  /** aggregate max on columns */
  ["dropzone_distributors_max_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mint?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["dropzone_distributors_min_fields"]: AliasType<{
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mint?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "dropzone.distributors" */
  ["dropzone_distributors_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["dropzone_distributors"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "dropzone.distributors" */
  ["dropzone_distributors_on_conflict"]: {
    constraint: ResolverInputTypes["dropzone_distributors_constraint"];
    update_columns: Array<
      ResolverInputTypes["dropzone_distributors_update_column"]
    >;
    where?:
      | ResolverInputTypes["dropzone_distributors_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "dropzone.distributors". */
  ["dropzone_distributors_order_by"]: {
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    data?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    mint?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** select columns of table "dropzone.distributors" */
  ["dropzone_distributors_select_column"]: dropzone_distributors_select_column;
  /** Streaming cursor of the table "dropzone_distributors" */
  ["dropzone_distributors_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["dropzone_distributors_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["dropzone_distributors_stream_cursor_value_input"]: {
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    data?: ResolverInputTypes["jsonb"] | undefined | null;
    id?: string | undefined | null;
    mint?: string | undefined | null;
  };
  /** placeholder for update columns of table "dropzone.distributors" (current role has no relevant permissions) */
  ["dropzone_distributors_update_column"]: dropzone_distributors_update_column;
  ["dropzone_user_dropzone_public_key_args"]: {
    user_row?: ResolverInputTypes["users_scalar"] | undefined | null;
  };
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
    delete_auth_collection_messages?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["auth_collection_messages_bool_exp"];
      },
      ResolverInputTypes["auth_collection_messages_mutation_response"]
    ];
    delete_auth_collection_messages_by_pk?: [
      { collection_id: string; uuid: string },
      ResolverInputTypes["auth_collection_messages"]
    ];
    delete_auth_collections?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["auth_collections_bool_exp"];
      },
      ResolverInputTypes["auth_collections_mutation_response"]
    ];
    delete_auth_collections_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_collections"]
    ];
    delete_auth_friend_requests?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["auth_friend_requests_bool_exp"];
      },
      ResolverInputTypes["auth_friend_requests_mutation_response"]
    ];
    delete_auth_friend_requests_by_pk?: [
      { from: string; to: string },
      ResolverInputTypes["auth_friend_requests"]
    ];
    delete_auth_friendships?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["auth_friendships_bool_exp"];
      },
      ResolverInputTypes["auth_friendships_mutation_response"]
    ];
    delete_auth_friendships_by_pk?: [
      { user1: string; user2: string },
      ResolverInputTypes["auth_friendships"]
    ];
    delete_auth_notification_subscriptions?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["auth_notification_subscriptions_bool_exp"];
      },
      ResolverInputTypes["auth_notification_subscriptions_mutation_response"]
    ];
    delete_auth_notification_subscriptions_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_notification_subscriptions"]
    ];
    delete_auth_public_keys?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["auth_public_keys_bool_exp"];
      },
      ResolverInputTypes["auth_public_keys_mutation_response"]
    ];
    delete_auth_public_keys_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_public_keys"]
    ];
    delete_auth_user_nfts?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["auth_user_nfts_bool_exp"];
      },
      ResolverInputTypes["auth_user_nfts_mutation_response"]
    ];
    delete_auth_user_nfts_by_pk?: [
      { nft_id: string; public_key: string },
      ResolverInputTypes["auth_user_nfts"]
    ];
    delete_auth_xnft_preferences?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["auth_xnft_preferences_bool_exp"];
      },
      ResolverInputTypes["auth_xnft_preferences_mutation_response"]
    ];
    delete_auth_xnft_preferences_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_xnft_preferences"]
    ];
    insert_auth_collection_messages?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["auth_collection_messages_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_collection_messages_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_collection_messages_mutation_response"]
    ];
    insert_auth_collection_messages_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["auth_collection_messages_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_collection_messages_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_collection_messages"]
    ];
    insert_auth_collections?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["auth_collections_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_collections_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_collections_mutation_response"]
    ];
    insert_auth_collections_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["auth_collections_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_collections_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_collections"]
    ];
    insert_auth_friend_requests?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["auth_friend_requests_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_friend_requests_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_friend_requests_mutation_response"]
    ];
    insert_auth_friend_requests_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["auth_friend_requests_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_friend_requests_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_friend_requests"]
    ];
    insert_auth_friendships?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["auth_friendships_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_friendships_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_friendships_mutation_response"]
    ];
    insert_auth_friendships_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["auth_friendships_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_friendships_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_friendships"]
    ];
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
    insert_auth_notification_cursor?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["auth_notification_cursor_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_notification_cursor_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notification_cursor_mutation_response"]
    ];
    insert_auth_notification_cursor_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["auth_notification_cursor_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_notification_cursor_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notification_cursor"]
    ];
    insert_auth_notification_subscriptions?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["auth_notification_subscriptions_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_notification_subscriptions_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notification_subscriptions_mutation_response"]
    ];
    insert_auth_notification_subscriptions_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["auth_notification_subscriptions_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_notification_subscriptions_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notification_subscriptions"]
    ];
    insert_auth_notifications?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["auth_notifications_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_notifications_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notifications_mutation_response"]
    ];
    insert_auth_notifications_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["auth_notifications_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_notifications_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notifications"]
    ];
    insert_auth_public_keys?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["auth_public_keys_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_public_keys_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_public_keys_mutation_response"]
    ];
    insert_auth_public_keys_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["auth_public_keys_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_public_keys_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_public_keys"]
    ];
    insert_auth_stripe_onramp?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["auth_stripe_onramp_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_stripe_onramp_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_stripe_onramp_mutation_response"]
    ];
    insert_auth_stripe_onramp_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["auth_stripe_onramp_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_stripe_onramp_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_stripe_onramp"]
    ];
    insert_auth_user_active_publickey_mapping?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["auth_user_active_publickey_mapping_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_user_active_publickey_mapping_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_user_active_publickey_mapping_mutation_response"]
    ];
    insert_auth_user_active_publickey_mapping_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["auth_user_active_publickey_mapping_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_user_active_publickey_mapping_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_user_active_publickey_mapping"]
    ];
    insert_auth_user_nfts?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["auth_user_nfts_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_user_nfts_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_user_nfts_mutation_response"]
    ];
    insert_auth_user_nfts_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["auth_user_nfts_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_user_nfts_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_user_nfts"]
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
    insert_auth_xnft_preferences?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["auth_xnft_preferences_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_xnft_preferences_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_xnft_preferences_mutation_response"]
    ];
    insert_auth_xnft_preferences_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["auth_xnft_preferences_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_xnft_preferences_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_xnft_preferences"]
    ];
    insert_auth_xnft_secrets?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["auth_xnft_secrets_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_xnft_secrets_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_xnft_secrets_mutation_response"]
    ];
    insert_auth_xnft_secrets_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["auth_xnft_secrets_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["auth_xnft_secrets_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_xnft_secrets"]
    ];
    insert_dropzone_distributors?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["dropzone_distributors_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["dropzone_distributors_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["dropzone_distributors_mutation_response"]
    ];
    insert_dropzone_distributors_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["dropzone_distributors_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["dropzone_distributors_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["dropzone_distributors"]
    ];
    update_auth_collection_messages?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["auth_collection_messages_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["auth_collection_messages_bool_exp"];
      },
      ResolverInputTypes["auth_collection_messages_mutation_response"]
    ];
    update_auth_collection_messages_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["auth_collection_messages_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["auth_collection_messages_pk_columns_input"];
      },
      ResolverInputTypes["auth_collection_messages"]
    ];
    update_auth_collection_messages_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["auth_collection_messages_updates"]>;
      },
      ResolverInputTypes["auth_collection_messages_mutation_response"]
    ];
    update_auth_collections?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_collections_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_collections_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["auth_collections_bool_exp"];
      },
      ResolverInputTypes["auth_collections_mutation_response"]
    ];
    update_auth_collections_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_collections_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_collections_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["auth_collections_pk_columns_input"];
      },
      ResolverInputTypes["auth_collections"]
    ];
    update_auth_collections_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["auth_collections_updates"]>;
      },
      ResolverInputTypes["auth_collections_mutation_response"]
    ];
    update_auth_friendships?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_friendships_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_friendships_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["auth_friendships_bool_exp"];
      },
      ResolverInputTypes["auth_friendships_mutation_response"]
    ];
    update_auth_friendships_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_friendships_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_friendships_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["auth_friendships_pk_columns_input"];
      },
      ResolverInputTypes["auth_friendships"]
    ];
    update_auth_friendships_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["auth_friendships_updates"]>;
      },
      ResolverInputTypes["auth_friendships_mutation_response"]
    ];
    update_auth_notification_cursor?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_notification_cursor_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_notification_cursor_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["auth_notification_cursor_bool_exp"];
      },
      ResolverInputTypes["auth_notification_cursor_mutation_response"]
    ];
    update_auth_notification_cursor_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_notification_cursor_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_notification_cursor_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["auth_notification_cursor_pk_columns_input"];
      },
      ResolverInputTypes["auth_notification_cursor"]
    ];
    update_auth_notification_cursor_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["auth_notification_cursor_updates"]>;
      },
      ResolverInputTypes["auth_notification_cursor_mutation_response"]
    ];
    update_auth_notification_subscriptions?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_notification_subscriptions_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_notification_subscriptions_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["auth_notification_subscriptions_bool_exp"];
      },
      ResolverInputTypes["auth_notification_subscriptions_mutation_response"]
    ];
    update_auth_notification_subscriptions_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_notification_subscriptions_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_notification_subscriptions_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["auth_notification_subscriptions_pk_columns_input"];
      },
      ResolverInputTypes["auth_notification_subscriptions"]
    ];
    update_auth_notification_subscriptions_many?: [
      {
        /** updates to execute, in order */
        updates: Array<
          ResolverInputTypes["auth_notification_subscriptions_updates"]
        >;
      },
      ResolverInputTypes["auth_notification_subscriptions_mutation_response"]
    ];
    update_auth_notifications?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_notifications_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_notifications_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["auth_notifications_bool_exp"];
      },
      ResolverInputTypes["auth_notifications_mutation_response"]
    ];
    update_auth_notifications_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_notifications_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_notifications_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["auth_notifications_pk_columns_input"];
      },
      ResolverInputTypes["auth_notifications"]
    ];
    update_auth_notifications_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["auth_notifications_updates"]>;
      },
      ResolverInputTypes["auth_notifications_mutation_response"]
    ];
    update_auth_stripe_onramp?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_stripe_onramp_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_stripe_onramp_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["auth_stripe_onramp_bool_exp"];
      },
      ResolverInputTypes["auth_stripe_onramp_mutation_response"]
    ];
    update_auth_stripe_onramp_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_stripe_onramp_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_stripe_onramp_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["auth_stripe_onramp_pk_columns_input"];
      },
      ResolverInputTypes["auth_stripe_onramp"]
    ];
    update_auth_stripe_onramp_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["auth_stripe_onramp_updates"]>;
      },
      ResolverInputTypes["auth_stripe_onramp_mutation_response"]
    ];
    update_auth_user_active_publickey_mapping?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_user_active_publickey_mapping_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_user_active_publickey_mapping_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["auth_user_active_publickey_mapping_bool_exp"];
      },
      ResolverInputTypes["auth_user_active_publickey_mapping_mutation_response"]
    ];
    update_auth_user_active_publickey_mapping_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_user_active_publickey_mapping_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_user_active_publickey_mapping_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["auth_user_active_publickey_mapping_pk_columns_input"];
      },
      ResolverInputTypes["auth_user_active_publickey_mapping"]
    ];
    update_auth_user_active_publickey_mapping_many?: [
      {
        /** updates to execute, in order */
        updates: Array<
          ResolverInputTypes["auth_user_active_publickey_mapping_updates"]
        >;
      },
      ResolverInputTypes["auth_user_active_publickey_mapping_mutation_response"]
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
    update_auth_xnft_preferences?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_xnft_preferences_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_xnft_preferences_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["auth_xnft_preferences_bool_exp"];
      },
      ResolverInputTypes["auth_xnft_preferences_mutation_response"]
    ];
    update_auth_xnft_preferences_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_xnft_preferences_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_xnft_preferences_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["auth_xnft_preferences_pk_columns_input"];
      },
      ResolverInputTypes["auth_xnft_preferences"]
    ];
    update_auth_xnft_preferences_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["auth_xnft_preferences_updates"]>;
      },
      ResolverInputTypes["auth_xnft_preferences_mutation_response"]
    ];
    update_auth_xnft_secrets?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_xnft_secrets_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_xnft_secrets_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["auth_xnft_secrets_bool_exp"];
      },
      ResolverInputTypes["auth_xnft_secrets_mutation_response"]
    ];
    update_auth_xnft_secrets_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["auth_xnft_secrets_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["auth_xnft_secrets_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["auth_xnft_secrets_pk_columns_input"];
      },
      ResolverInputTypes["auth_xnft_secrets"]
    ];
    update_auth_xnft_secrets_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["auth_xnft_secrets_updates"]>;
      },
      ResolverInputTypes["auth_xnft_secrets_mutation_response"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    auth_collection_messages?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_collection_messages_select_column"]>
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
          | Array<ResolverInputTypes["auth_collection_messages_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_collection_messages_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_collection_messages"]
    ];
    auth_collection_messages_by_pk?: [
      { collection_id: string; uuid: string },
      ResolverInputTypes["auth_collection_messages"]
    ];
    auth_collections?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_collections_select_column"]>
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
          | Array<ResolverInputTypes["auth_collections_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_collections_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_collections"]
    ];
    auth_collections_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_collections"]
    ];
    auth_friend_requests?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_friend_requests_select_column"]>
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
          | Array<ResolverInputTypes["auth_friend_requests_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_friend_requests_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_friend_requests"]
    ];
    auth_friend_requests_by_pk?: [
      { from: string; to: string },
      ResolverInputTypes["auth_friend_requests"]
    ];
    auth_friendships?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_friendships_select_column"]>
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
          | Array<ResolverInputTypes["auth_friendships_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_friendships_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_friendships"]
    ];
    auth_friendships_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_friendships_select_column"]>
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
          | Array<ResolverInputTypes["auth_friendships_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_friendships_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_friendships_aggregate"]
    ];
    auth_friendships_by_pk?: [
      { user1: string; user2: string },
      ResolverInputTypes["auth_friendships"]
    ];
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
    auth_invitations_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["auth_invitations"]
    ];
    auth_notification_cursor?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_notification_cursor_select_column"]>
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
          | Array<ResolverInputTypes["auth_notification_cursor_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_notification_cursor_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notification_cursor"]
    ];
    auth_notification_cursor_by_pk?: [
      { uuid: string },
      ResolverInputTypes["auth_notification_cursor"]
    ];
    auth_notification_subscriptions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<
              ResolverInputTypes["auth_notification_subscriptions_select_column"]
            >
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
          | Array<
              ResolverInputTypes["auth_notification_subscriptions_order_by"]
            >
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_notification_subscriptions_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notification_subscriptions"]
    ];
    auth_notification_subscriptions_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_notification_subscriptions"]
    ];
    auth_notifications?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_notifications_select_column"]>
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
          | Array<ResolverInputTypes["auth_notifications_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_notifications_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notifications"]
    ];
    auth_notifications_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_notifications_select_column"]>
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
          | Array<ResolverInputTypes["auth_notifications_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_notifications_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notifications_aggregate"]
    ];
    auth_notifications_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_notifications"]
    ];
    auth_public_keys?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_public_keys_select_column"]>
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
          | Array<ResolverInputTypes["auth_public_keys_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_public_keys_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_public_keys"]
    ];
    auth_public_keys_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_public_keys_select_column"]>
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
          | Array<ResolverInputTypes["auth_public_keys_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_public_keys_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_public_keys_aggregate"]
    ];
    auth_public_keys_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_public_keys"]
    ];
    auth_stripe_onramp?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_stripe_onramp_select_column"]>
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
          | Array<ResolverInputTypes["auth_stripe_onramp_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_stripe_onramp_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_stripe_onramp"]
    ];
    auth_stripe_onramp_by_pk?: [
      { client_secret: string },
      ResolverInputTypes["auth_stripe_onramp"]
    ];
    auth_user_active_publickey_mapping?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<
              ResolverInputTypes["auth_user_active_publickey_mapping_select_column"]
            >
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
          | Array<
              ResolverInputTypes["auth_user_active_publickey_mapping_order_by"]
            >
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_user_active_publickey_mapping_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_user_active_publickey_mapping"]
    ];
    auth_user_active_publickey_mapping_by_pk?: [
      { blockchain: string; user_id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["auth_user_active_publickey_mapping"]
    ];
    auth_user_nfts?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_user_nfts_select_column"]>
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
          | Array<ResolverInputTypes["auth_user_nfts_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_user_nfts_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_user_nfts"]
    ];
    auth_user_nfts_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_user_nfts_select_column"]>
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
          | Array<ResolverInputTypes["auth_user_nfts_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_user_nfts_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_user_nfts_aggregate"]
    ];
    auth_user_nfts_by_pk?: [
      { nft_id: string; public_key: string },
      ResolverInputTypes["auth_user_nfts"]
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
    auth_xnft_preferences?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_xnft_preferences_select_column"]>
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
          | Array<ResolverInputTypes["auth_xnft_preferences_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_xnft_preferences_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_xnft_preferences"]
    ];
    auth_xnft_preferences_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_xnft_preferences"]
    ];
    auth_xnft_secrets?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_xnft_secrets_select_column"]>
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
          | Array<ResolverInputTypes["auth_xnft_secrets_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_xnft_secrets_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_xnft_secrets"]
    ];
    auth_xnft_secrets_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_xnft_secrets"]
    ];
    dropzone_distributors?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["dropzone_distributors_select_column"]>
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
          | Array<ResolverInputTypes["dropzone_distributors_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["dropzone_distributors_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["dropzone_distributors"]
    ];
    dropzone_distributors_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["dropzone_distributors_select_column"]>
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
          | Array<ResolverInputTypes["dropzone_distributors_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["dropzone_distributors_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["dropzone_distributors_aggregate"]
    ];
    dropzone_distributors_by_pk?: [
      { id: string },
      ResolverInputTypes["dropzone_distributors"]
    ];
    dropzone_user_dropzone_public_key?: [
      {
        /** input parameters for function "dropzone_user_dropzone_public_key" */
        args: ResolverInputTypes["dropzone_user_dropzone_public_key_args"] /** distinct select on columns */;
        distinct_on?:
          | Array<ResolverInputTypes["auth_public_keys_select_column"]>
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
          | Array<ResolverInputTypes["auth_public_keys_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_public_keys_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_public_keys"]
    ];
    dropzone_user_dropzone_public_key_aggregate?: [
      {
        /** input parameters for function "dropzone_user_dropzone_public_key_aggregate" */
        args: ResolverInputTypes["dropzone_user_dropzone_public_key_args"] /** distinct select on columns */;
        distinct_on?:
          | Array<ResolverInputTypes["auth_public_keys_select_column"]>
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
          | Array<ResolverInputTypes["auth_public_keys_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_public_keys_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_public_keys_aggregate"]
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
    __typename?: boolean | `@${string}`;
  }>;
  ["subscription_root"]: AliasType<{
    auth_collection_messages?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_collection_messages_select_column"]>
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
          | Array<ResolverInputTypes["auth_collection_messages_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_collection_messages_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_collection_messages"]
    ];
    auth_collection_messages_by_pk?: [
      { collection_id: string; uuid: string },
      ResolverInputTypes["auth_collection_messages"]
    ];
    auth_collection_messages_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["auth_collection_messages_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_collection_messages_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_collection_messages"]
    ];
    auth_collections?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_collections_select_column"]>
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
          | Array<ResolverInputTypes["auth_collections_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_collections_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_collections"]
    ];
    auth_collections_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_collections"]
    ];
    auth_collections_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["auth_collections_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_collections_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_collections"]
    ];
    auth_friend_requests?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_friend_requests_select_column"]>
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
          | Array<ResolverInputTypes["auth_friend_requests_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_friend_requests_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_friend_requests"]
    ];
    auth_friend_requests_by_pk?: [
      { from: string; to: string },
      ResolverInputTypes["auth_friend_requests"]
    ];
    auth_friend_requests_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["auth_friend_requests_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_friend_requests_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_friend_requests"]
    ];
    auth_friendships?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_friendships_select_column"]>
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
          | Array<ResolverInputTypes["auth_friendships_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_friendships_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_friendships"]
    ];
    auth_friendships_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_friendships_select_column"]>
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
          | Array<ResolverInputTypes["auth_friendships_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_friendships_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_friendships_aggregate"]
    ];
    auth_friendships_by_pk?: [
      { user1: string; user2: string },
      ResolverInputTypes["auth_friendships"]
    ];
    auth_friendships_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["auth_friendships_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_friendships_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_friendships"]
    ];
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
    auth_notification_cursor?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_notification_cursor_select_column"]>
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
          | Array<ResolverInputTypes["auth_notification_cursor_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_notification_cursor_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notification_cursor"]
    ];
    auth_notification_cursor_by_pk?: [
      { uuid: string },
      ResolverInputTypes["auth_notification_cursor"]
    ];
    auth_notification_cursor_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["auth_notification_cursor_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_notification_cursor_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notification_cursor"]
    ];
    auth_notification_subscriptions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<
              ResolverInputTypes["auth_notification_subscriptions_select_column"]
            >
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
          | Array<
              ResolverInputTypes["auth_notification_subscriptions_order_by"]
            >
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_notification_subscriptions_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notification_subscriptions"]
    ];
    auth_notification_subscriptions_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_notification_subscriptions"]
    ];
    auth_notification_subscriptions_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["auth_notification_subscriptions_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_notification_subscriptions_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notification_subscriptions"]
    ];
    auth_notifications?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_notifications_select_column"]>
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
          | Array<ResolverInputTypes["auth_notifications_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_notifications_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notifications"]
    ];
    auth_notifications_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_notifications_select_column"]>
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
          | Array<ResolverInputTypes["auth_notifications_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_notifications_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notifications_aggregate"]
    ];
    auth_notifications_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_notifications"]
    ];
    auth_notifications_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["auth_notifications_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_notifications_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_notifications"]
    ];
    auth_public_keys?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_public_keys_select_column"]>
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
          | Array<ResolverInputTypes["auth_public_keys_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_public_keys_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_public_keys"]
    ];
    auth_public_keys_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_public_keys_select_column"]>
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
          | Array<ResolverInputTypes["auth_public_keys_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_public_keys_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_public_keys_aggregate"]
    ];
    auth_public_keys_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_public_keys"]
    ];
    auth_public_keys_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["auth_public_keys_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_public_keys_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_public_keys"]
    ];
    auth_stripe_onramp?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_stripe_onramp_select_column"]>
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
          | Array<ResolverInputTypes["auth_stripe_onramp_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_stripe_onramp_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_stripe_onramp"]
    ];
    auth_stripe_onramp_by_pk?: [
      { client_secret: string },
      ResolverInputTypes["auth_stripe_onramp"]
    ];
    auth_stripe_onramp_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["auth_stripe_onramp_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_stripe_onramp_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_stripe_onramp"]
    ];
    auth_user_active_publickey_mapping?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<
              ResolverInputTypes["auth_user_active_publickey_mapping_select_column"]
            >
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
          | Array<
              ResolverInputTypes["auth_user_active_publickey_mapping_order_by"]
            >
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_user_active_publickey_mapping_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_user_active_publickey_mapping"]
    ];
    auth_user_active_publickey_mapping_by_pk?: [
      { blockchain: string; user_id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["auth_user_active_publickey_mapping"]
    ];
    auth_user_active_publickey_mapping_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["auth_user_active_publickey_mapping_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_user_active_publickey_mapping_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_user_active_publickey_mapping"]
    ];
    auth_user_nfts?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_user_nfts_select_column"]>
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
          | Array<ResolverInputTypes["auth_user_nfts_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_user_nfts_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_user_nfts"]
    ];
    auth_user_nfts_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_user_nfts_select_column"]>
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
          | Array<ResolverInputTypes["auth_user_nfts_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_user_nfts_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_user_nfts_aggregate"]
    ];
    auth_user_nfts_by_pk?: [
      { nft_id: string; public_key: string },
      ResolverInputTypes["auth_user_nfts"]
    ];
    auth_user_nfts_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["auth_user_nfts_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_user_nfts_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_user_nfts"]
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
    auth_xnft_preferences?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_xnft_preferences_select_column"]>
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
          | Array<ResolverInputTypes["auth_xnft_preferences_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_xnft_preferences_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_xnft_preferences"]
    ];
    auth_xnft_preferences_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_xnft_preferences"]
    ];
    auth_xnft_preferences_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["auth_xnft_preferences_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_xnft_preferences_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_xnft_preferences"]
    ];
    auth_xnft_secrets?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["auth_xnft_secrets_select_column"]>
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
          | Array<ResolverInputTypes["auth_xnft_secrets_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_xnft_secrets_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_xnft_secrets"]
    ];
    auth_xnft_secrets_by_pk?: [
      { id: number },
      ResolverInputTypes["auth_xnft_secrets"]
    ];
    auth_xnft_secrets_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["auth_xnft_secrets_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_xnft_secrets_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_xnft_secrets"]
    ];
    dropzone_distributors?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["dropzone_distributors_select_column"]>
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
          | Array<ResolverInputTypes["dropzone_distributors_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["dropzone_distributors_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["dropzone_distributors"]
    ];
    dropzone_distributors_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["dropzone_distributors_select_column"]>
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
          | Array<ResolverInputTypes["dropzone_distributors_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["dropzone_distributors_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["dropzone_distributors_aggregate"]
    ];
    dropzone_distributors_by_pk?: [
      { id: string },
      ResolverInputTypes["dropzone_distributors"]
    ];
    dropzone_distributors_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["dropzone_distributors_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["dropzone_distributors_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["dropzone_distributors"]
    ];
    dropzone_user_dropzone_public_key?: [
      {
        /** input parameters for function "dropzone_user_dropzone_public_key" */
        args: ResolverInputTypes["dropzone_user_dropzone_public_key_args"] /** distinct select on columns */;
        distinct_on?:
          | Array<ResolverInputTypes["auth_public_keys_select_column"]>
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
          | Array<ResolverInputTypes["auth_public_keys_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_public_keys_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_public_keys"]
    ];
    dropzone_user_dropzone_public_key_aggregate?: [
      {
        /** input parameters for function "dropzone_user_dropzone_public_key_aggregate" */
        args: ResolverInputTypes["dropzone_user_dropzone_public_key_args"] /** distinct select on columns */;
        distinct_on?:
          | Array<ResolverInputTypes["auth_public_keys_select_column"]>
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
          | Array<ResolverInputTypes["auth_public_keys_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["auth_public_keys_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["auth_public_keys_aggregate"]
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
  ["users_scalar"]: unknown;
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
  /** columns and relationships of "auth.collection_messages" */
  ["auth_collection_messages"]: {
    collection_id: string;
    last_read_message_id: string;
    uuid: string;
  };
  /** Boolean expression to filter rows from the table "auth.collection_messages". All fields are combined with a logical 'AND'. */
  ["auth_collection_messages_bool_exp"]: {
    _and?: Array<ModelTypes["auth_collection_messages_bool_exp"]> | undefined;
    _not?: ModelTypes["auth_collection_messages_bool_exp"] | undefined;
    _or?: Array<ModelTypes["auth_collection_messages_bool_exp"]> | undefined;
    collection_id?: ModelTypes["String_comparison_exp"] | undefined;
    last_read_message_id?: ModelTypes["String_comparison_exp"] | undefined;
    uuid?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["auth_collection_messages_constraint"]: auth_collection_messages_constraint;
  /** input type for inserting data into table "auth.collection_messages" */
  ["auth_collection_messages_insert_input"]: {
    collection_id?: string | undefined;
    last_read_message_id?: string | undefined;
    uuid?: string | undefined;
  };
  /** response of any mutation on the table "auth.collection_messages" */
  ["auth_collection_messages_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_collection_messages"]>;
  };
  /** on_conflict condition type for table "auth.collection_messages" */
  ["auth_collection_messages_on_conflict"]: {
    constraint: ModelTypes["auth_collection_messages_constraint"];
    update_columns: Array<ModelTypes["auth_collection_messages_update_column"]>;
    where?: ModelTypes["auth_collection_messages_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.collection_messages". */
  ["auth_collection_messages_order_by"]: {
    collection_id?: ModelTypes["order_by"] | undefined;
    last_read_message_id?: ModelTypes["order_by"] | undefined;
    uuid?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.collection_messages */
  ["auth_collection_messages_pk_columns_input"]: {
    collection_id: string;
    uuid: string;
  };
  ["auth_collection_messages_select_column"]: auth_collection_messages_select_column;
  /** input type for updating data in table "auth.collection_messages" */
  ["auth_collection_messages_set_input"]: {
    collection_id?: string | undefined;
    last_read_message_id?: string | undefined;
    uuid?: string | undefined;
  };
  /** Streaming cursor of the table "auth_collection_messages" */
  ["auth_collection_messages_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["auth_collection_messages_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_collection_messages_stream_cursor_value_input"]: {
    collection_id?: string | undefined;
    last_read_message_id?: string | undefined;
    uuid?: string | undefined;
  };
  ["auth_collection_messages_update_column"]: auth_collection_messages_update_column;
  ["auth_collection_messages_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["auth_collection_messages_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["auth_collection_messages_bool_exp"];
  };
  /** columns and relationships of "auth.collections" */
  ["auth_collections"]: {
    collection_id?: string | undefined;
    id: number;
    last_message?: string | undefined;
    last_message_timestamp?: ModelTypes["timestamptz"] | undefined;
    last_message_uuid?: string | undefined;
    type: string;
  };
  /** Boolean expression to filter rows from the table "auth.collections". All fields are combined with a logical 'AND'. */
  ["auth_collections_bool_exp"]: {
    _and?: Array<ModelTypes["auth_collections_bool_exp"]> | undefined;
    _not?: ModelTypes["auth_collections_bool_exp"] | undefined;
    _or?: Array<ModelTypes["auth_collections_bool_exp"]> | undefined;
    collection_id?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    last_message?: ModelTypes["String_comparison_exp"] | undefined;
    last_message_timestamp?:
      | ModelTypes["timestamptz_comparison_exp"]
      | undefined;
    last_message_uuid?: ModelTypes["String_comparison_exp"] | undefined;
    type?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["auth_collections_constraint"]: auth_collections_constraint;
  /** input type for incrementing numeric columns in table "auth.collections" */
  ["auth_collections_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "auth.collections" */
  ["auth_collections_insert_input"]: {
    collection_id?: string | undefined;
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_timestamp?: ModelTypes["timestamptz"] | undefined;
    last_message_uuid?: string | undefined;
    type?: string | undefined;
  };
  /** response of any mutation on the table "auth.collections" */
  ["auth_collections_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_collections"]>;
  };
  /** on_conflict condition type for table "auth.collections" */
  ["auth_collections_on_conflict"]: {
    constraint: ModelTypes["auth_collections_constraint"];
    update_columns: Array<ModelTypes["auth_collections_update_column"]>;
    where?: ModelTypes["auth_collections_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.collections". */
  ["auth_collections_order_by"]: {
    collection_id?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    last_message?: ModelTypes["order_by"] | undefined;
    last_message_timestamp?: ModelTypes["order_by"] | undefined;
    last_message_uuid?: ModelTypes["order_by"] | undefined;
    type?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.collections */
  ["auth_collections_pk_columns_input"]: {
    id: number;
  };
  ["auth_collections_select_column"]: auth_collections_select_column;
  /** input type for updating data in table "auth.collections" */
  ["auth_collections_set_input"]: {
    collection_id?: string | undefined;
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_timestamp?: ModelTypes["timestamptz"] | undefined;
    last_message_uuid?: string | undefined;
    type?: string | undefined;
  };
  /** Streaming cursor of the table "auth_collections" */
  ["auth_collections_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["auth_collections_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_collections_stream_cursor_value_input"]: {
    collection_id?: string | undefined;
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_timestamp?: ModelTypes["timestamptz"] | undefined;
    last_message_uuid?: string | undefined;
    type?: string | undefined;
  };
  ["auth_collections_update_column"]: auth_collections_update_column;
  ["auth_collections_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["auth_collections_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["auth_collections_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["auth_collections_bool_exp"];
  };
  /** columns and relationships of "auth.friend_requests" */
  ["auth_friend_requests"]: {
    from: string;
    id: number;
    to: string;
  };
  /** Boolean expression to filter rows from the table "auth.friend_requests". All fields are combined with a logical 'AND'. */
  ["auth_friend_requests_bool_exp"]: {
    _and?: Array<ModelTypes["auth_friend_requests_bool_exp"]> | undefined;
    _not?: ModelTypes["auth_friend_requests_bool_exp"] | undefined;
    _or?: Array<ModelTypes["auth_friend_requests_bool_exp"]> | undefined;
    from?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    to?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["auth_friend_requests_constraint"]: auth_friend_requests_constraint;
  /** input type for inserting data into table "auth.friend_requests" */
  ["auth_friend_requests_insert_input"]: {
    from?: string | undefined;
    id?: number | undefined;
    to?: string | undefined;
  };
  /** response of any mutation on the table "auth.friend_requests" */
  ["auth_friend_requests_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_friend_requests"]>;
  };
  /** on_conflict condition type for table "auth.friend_requests" */
  ["auth_friend_requests_on_conflict"]: {
    constraint: ModelTypes["auth_friend_requests_constraint"];
    update_columns: Array<ModelTypes["auth_friend_requests_update_column"]>;
    where?: ModelTypes["auth_friend_requests_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.friend_requests". */
  ["auth_friend_requests_order_by"]: {
    from?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    to?: ModelTypes["order_by"] | undefined;
  };
  ["auth_friend_requests_select_column"]: auth_friend_requests_select_column;
  /** Streaming cursor of the table "auth_friend_requests" */
  ["auth_friend_requests_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["auth_friend_requests_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_friend_requests_stream_cursor_value_input"]: {
    from?: string | undefined;
    id?: number | undefined;
    to?: string | undefined;
  };
  ["auth_friend_requests_update_column"]: auth_friend_requests_update_column;
  /** columns and relationships of "auth.friendships" */
  ["auth_friendships"]: {
    are_friends: boolean;
    id: number;
    last_message?: string | undefined;
    last_message_client_uuid?: string | undefined;
    last_message_sender?: string | undefined;
    last_message_timestamp?: ModelTypes["timestamptz"] | undefined;
    user1: string;
    user1_blocked_user2: boolean;
    user1_interacted: boolean;
    user1_last_read_message_id?: string | undefined;
    user1_spam_user2: boolean;
    user2: string;
    user2_blocked_user1: boolean;
    user2_interacted: boolean;
    user2_last_read_message_id?: string | undefined;
    user2_spam_user1: boolean;
  };
  /** aggregated selection of "auth.friendships" */
  ["auth_friendships_aggregate"]: {
    aggregate?: ModelTypes["auth_friendships_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["auth_friendships"]>;
  };
  /** aggregate fields of "auth.friendships" */
  ["auth_friendships_aggregate_fields"]: {
    avg?: ModelTypes["auth_friendships_avg_fields"] | undefined;
    count: number;
    max?: ModelTypes["auth_friendships_max_fields"] | undefined;
    min?: ModelTypes["auth_friendships_min_fields"] | undefined;
    stddev?: ModelTypes["auth_friendships_stddev_fields"] | undefined;
    stddev_pop?: ModelTypes["auth_friendships_stddev_pop_fields"] | undefined;
    stddev_samp?: ModelTypes["auth_friendships_stddev_samp_fields"] | undefined;
    sum?: ModelTypes["auth_friendships_sum_fields"] | undefined;
    var_pop?: ModelTypes["auth_friendships_var_pop_fields"] | undefined;
    var_samp?: ModelTypes["auth_friendships_var_samp_fields"] | undefined;
    variance?: ModelTypes["auth_friendships_variance_fields"] | undefined;
  };
  /** aggregate avg on columns */
  ["auth_friendships_avg_fields"]: {
    id?: number | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.friendships". All fields are combined with a logical 'AND'. */
  ["auth_friendships_bool_exp"]: {
    _and?: Array<ModelTypes["auth_friendships_bool_exp"]> | undefined;
    _not?: ModelTypes["auth_friendships_bool_exp"] | undefined;
    _or?: Array<ModelTypes["auth_friendships_bool_exp"]> | undefined;
    are_friends?: ModelTypes["Boolean_comparison_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    last_message?: ModelTypes["String_comparison_exp"] | undefined;
    last_message_client_uuid?: ModelTypes["String_comparison_exp"] | undefined;
    last_message_sender?: ModelTypes["String_comparison_exp"] | undefined;
    last_message_timestamp?:
      | ModelTypes["timestamptz_comparison_exp"]
      | undefined;
    user1?: ModelTypes["String_comparison_exp"] | undefined;
    user1_blocked_user2?: ModelTypes["Boolean_comparison_exp"] | undefined;
    user1_interacted?: ModelTypes["Boolean_comparison_exp"] | undefined;
    user1_last_read_message_id?:
      | ModelTypes["String_comparison_exp"]
      | undefined;
    user1_spam_user2?: ModelTypes["Boolean_comparison_exp"] | undefined;
    user2?: ModelTypes["String_comparison_exp"] | undefined;
    user2_blocked_user1?: ModelTypes["Boolean_comparison_exp"] | undefined;
    user2_interacted?: ModelTypes["Boolean_comparison_exp"] | undefined;
    user2_last_read_message_id?:
      | ModelTypes["String_comparison_exp"]
      | undefined;
    user2_spam_user1?: ModelTypes["Boolean_comparison_exp"] | undefined;
  };
  ["auth_friendships_constraint"]: auth_friendships_constraint;
  /** input type for incrementing numeric columns in table "auth.friendships" */
  ["auth_friendships_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "auth.friendships" */
  ["auth_friendships_insert_input"]: {
    are_friends?: boolean | undefined;
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_client_uuid?: string | undefined;
    last_message_sender?: string | undefined;
    last_message_timestamp?: ModelTypes["timestamptz"] | undefined;
    user1?: string | undefined;
    user1_blocked_user2?: boolean | undefined;
    user1_interacted?: boolean | undefined;
    user1_last_read_message_id?: string | undefined;
    user1_spam_user2?: boolean | undefined;
    user2?: string | undefined;
    user2_blocked_user1?: boolean | undefined;
    user2_interacted?: boolean | undefined;
    user2_last_read_message_id?: string | undefined;
    user2_spam_user1?: boolean | undefined;
  };
  /** aggregate max on columns */
  ["auth_friendships_max_fields"]: {
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_client_uuid?: string | undefined;
    last_message_sender?: string | undefined;
    last_message_timestamp?: ModelTypes["timestamptz"] | undefined;
    user1?: string | undefined;
    user1_last_read_message_id?: string | undefined;
    user2?: string | undefined;
    user2_last_read_message_id?: string | undefined;
  };
  /** aggregate min on columns */
  ["auth_friendships_min_fields"]: {
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_client_uuid?: string | undefined;
    last_message_sender?: string | undefined;
    last_message_timestamp?: ModelTypes["timestamptz"] | undefined;
    user1?: string | undefined;
    user1_last_read_message_id?: string | undefined;
    user2?: string | undefined;
    user2_last_read_message_id?: string | undefined;
  };
  /** response of any mutation on the table "auth.friendships" */
  ["auth_friendships_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_friendships"]>;
  };
  /** on_conflict condition type for table "auth.friendships" */
  ["auth_friendships_on_conflict"]: {
    constraint: ModelTypes["auth_friendships_constraint"];
    update_columns: Array<ModelTypes["auth_friendships_update_column"]>;
    where?: ModelTypes["auth_friendships_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.friendships". */
  ["auth_friendships_order_by"]: {
    are_friends?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    last_message?: ModelTypes["order_by"] | undefined;
    last_message_client_uuid?: ModelTypes["order_by"] | undefined;
    last_message_sender?: ModelTypes["order_by"] | undefined;
    last_message_timestamp?: ModelTypes["order_by"] | undefined;
    user1?: ModelTypes["order_by"] | undefined;
    user1_blocked_user2?: ModelTypes["order_by"] | undefined;
    user1_interacted?: ModelTypes["order_by"] | undefined;
    user1_last_read_message_id?: ModelTypes["order_by"] | undefined;
    user1_spam_user2?: ModelTypes["order_by"] | undefined;
    user2?: ModelTypes["order_by"] | undefined;
    user2_blocked_user1?: ModelTypes["order_by"] | undefined;
    user2_interacted?: ModelTypes["order_by"] | undefined;
    user2_last_read_message_id?: ModelTypes["order_by"] | undefined;
    user2_spam_user1?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.friendships */
  ["auth_friendships_pk_columns_input"]: {
    user1: string;
    user2: string;
  };
  ["auth_friendships_select_column"]: auth_friendships_select_column;
  /** input type for updating data in table "auth.friendships" */
  ["auth_friendships_set_input"]: {
    are_friends?: boolean | undefined;
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_client_uuid?: string | undefined;
    last_message_sender?: string | undefined;
    last_message_timestamp?: ModelTypes["timestamptz"] | undefined;
    user1?: string | undefined;
    user1_blocked_user2?: boolean | undefined;
    user1_interacted?: boolean | undefined;
    user1_last_read_message_id?: string | undefined;
    user1_spam_user2?: boolean | undefined;
    user2?: string | undefined;
    user2_blocked_user1?: boolean | undefined;
    user2_interacted?: boolean | undefined;
    user2_last_read_message_id?: string | undefined;
    user2_spam_user1?: boolean | undefined;
  };
  /** aggregate stddev on columns */
  ["auth_friendships_stddev_fields"]: {
    id?: number | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["auth_friendships_stddev_pop_fields"]: {
    id?: number | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["auth_friendships_stddev_samp_fields"]: {
    id?: number | undefined;
  };
  /** Streaming cursor of the table "auth_friendships" */
  ["auth_friendships_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["auth_friendships_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_friendships_stream_cursor_value_input"]: {
    are_friends?: boolean | undefined;
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_client_uuid?: string | undefined;
    last_message_sender?: string | undefined;
    last_message_timestamp?: ModelTypes["timestamptz"] | undefined;
    user1?: string | undefined;
    user1_blocked_user2?: boolean | undefined;
    user1_interacted?: boolean | undefined;
    user1_last_read_message_id?: string | undefined;
    user1_spam_user2?: boolean | undefined;
    user2?: string | undefined;
    user2_blocked_user1?: boolean | undefined;
    user2_interacted?: boolean | undefined;
    user2_last_read_message_id?: string | undefined;
    user2_spam_user1?: boolean | undefined;
  };
  /** aggregate sum on columns */
  ["auth_friendships_sum_fields"]: {
    id?: number | undefined;
  };
  ["auth_friendships_update_column"]: auth_friendships_update_column;
  ["auth_friendships_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["auth_friendships_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["auth_friendships_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["auth_friendships_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["auth_friendships_var_pop_fields"]: {
    id?: number | undefined;
  };
  /** aggregate var_samp on columns */
  ["auth_friendships_var_samp_fields"]: {
    id?: number | undefined;
  };
  /** aggregate variance on columns */
  ["auth_friendships_variance_fields"]: {
    id?: number | undefined;
  };
  /** ids are beta invite codes */
  ["auth_invitations"]: {
    created_at: ModelTypes["timestamptz"];
    data?: ModelTypes["jsonb"] | undefined;
    id: ModelTypes["uuid"];
    /** An object relationship */
    user?: ModelTypes["auth_users"] | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.invitations". All fields are combined with a logical 'AND'. */
  ["auth_invitations_bool_exp"]: {
    _and?: Array<ModelTypes["auth_invitations_bool_exp"]> | undefined;
    _not?: ModelTypes["auth_invitations_bool_exp"] | undefined;
    _or?: Array<ModelTypes["auth_invitations_bool_exp"]> | undefined;
    created_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    data?: ModelTypes["jsonb_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    user?: ModelTypes["auth_users_bool_exp"] | undefined;
  };
  ["auth_invitations_constraint"]: auth_invitations_constraint;
  /** input type for inserting data into table "auth.invitations" */
  ["auth_invitations_insert_input"]: {
    created_at?: ModelTypes["timestamptz"] | undefined;
    data?: ModelTypes["jsonb"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    user?: ModelTypes["auth_users_obj_rel_insert_input"] | undefined;
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
    user?: ModelTypes["auth_users_order_by"] | undefined;
  };
  ["auth_invitations_select_column"]: auth_invitations_select_column;
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
  /** columns and relationships of "auth.notification_cursor" */
  ["auth_notification_cursor"]: {
    last_read_notificaiton: number;
    uuid: string;
  };
  /** Boolean expression to filter rows from the table "auth.notification_cursor". All fields are combined with a logical 'AND'. */
  ["auth_notification_cursor_bool_exp"]: {
    _and?: Array<ModelTypes["auth_notification_cursor_bool_exp"]> | undefined;
    _not?: ModelTypes["auth_notification_cursor_bool_exp"] | undefined;
    _or?: Array<ModelTypes["auth_notification_cursor_bool_exp"]> | undefined;
    last_read_notificaiton?: ModelTypes["Int_comparison_exp"] | undefined;
    uuid?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["auth_notification_cursor_constraint"]: auth_notification_cursor_constraint;
  /** input type for incrementing numeric columns in table "auth.notification_cursor" */
  ["auth_notification_cursor_inc_input"]: {
    last_read_notificaiton?: number | undefined;
  };
  /** input type for inserting data into table "auth.notification_cursor" */
  ["auth_notification_cursor_insert_input"]: {
    last_read_notificaiton?: number | undefined;
    uuid?: string | undefined;
  };
  /** response of any mutation on the table "auth.notification_cursor" */
  ["auth_notification_cursor_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_notification_cursor"]>;
  };
  /** on_conflict condition type for table "auth.notification_cursor" */
  ["auth_notification_cursor_on_conflict"]: {
    constraint: ModelTypes["auth_notification_cursor_constraint"];
    update_columns: Array<ModelTypes["auth_notification_cursor_update_column"]>;
    where?: ModelTypes["auth_notification_cursor_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.notification_cursor". */
  ["auth_notification_cursor_order_by"]: {
    last_read_notificaiton?: ModelTypes["order_by"] | undefined;
    uuid?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.notification_cursor */
  ["auth_notification_cursor_pk_columns_input"]: {
    uuid: string;
  };
  ["auth_notification_cursor_select_column"]: auth_notification_cursor_select_column;
  /** input type for updating data in table "auth.notification_cursor" */
  ["auth_notification_cursor_set_input"]: {
    last_read_notificaiton?: number | undefined;
    uuid?: string | undefined;
  };
  /** Streaming cursor of the table "auth_notification_cursor" */
  ["auth_notification_cursor_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["auth_notification_cursor_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_notification_cursor_stream_cursor_value_input"]: {
    last_read_notificaiton?: number | undefined;
    uuid?: string | undefined;
  };
  ["auth_notification_cursor_update_column"]: auth_notification_cursor_update_column;
  ["auth_notification_cursor_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["auth_notification_cursor_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["auth_notification_cursor_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["auth_notification_cursor_bool_exp"];
  };
  /** columns and relationships of "auth.notification_subscriptions" */
  ["auth_notification_subscriptions"]: {
    auth: string;
    endpoint: string;
    expirationTime: string;
    id: number;
    p256dh: string;
    public_key: string;
    username: string;
    uuid: string;
  };
  /** Boolean expression to filter rows from the table "auth.notification_subscriptions". All fields are combined with a logical 'AND'. */
  ["auth_notification_subscriptions_bool_exp"]: {
    _and?:
      | Array<ModelTypes["auth_notification_subscriptions_bool_exp"]>
      | undefined;
    _not?: ModelTypes["auth_notification_subscriptions_bool_exp"] | undefined;
    _or?:
      | Array<ModelTypes["auth_notification_subscriptions_bool_exp"]>
      | undefined;
    auth?: ModelTypes["String_comparison_exp"] | undefined;
    endpoint?: ModelTypes["String_comparison_exp"] | undefined;
    expirationTime?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    p256dh?: ModelTypes["String_comparison_exp"] | undefined;
    public_key?: ModelTypes["String_comparison_exp"] | undefined;
    username?: ModelTypes["String_comparison_exp"] | undefined;
    uuid?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["auth_notification_subscriptions_constraint"]: auth_notification_subscriptions_constraint;
  /** input type for incrementing numeric columns in table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_insert_input"]: {
    auth?: string | undefined;
    endpoint?: string | undefined;
    expirationTime?: string | undefined;
    id?: number | undefined;
    p256dh?: string | undefined;
    public_key?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
  };
  /** response of any mutation on the table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_notification_subscriptions"]>;
  };
  /** on_conflict condition type for table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_on_conflict"]: {
    constraint: ModelTypes["auth_notification_subscriptions_constraint"];
    update_columns: Array<
      ModelTypes["auth_notification_subscriptions_update_column"]
    >;
    where?: ModelTypes["auth_notification_subscriptions_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.notification_subscriptions". */
  ["auth_notification_subscriptions_order_by"]: {
    auth?: ModelTypes["order_by"] | undefined;
    endpoint?: ModelTypes["order_by"] | undefined;
    expirationTime?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    p256dh?: ModelTypes["order_by"] | undefined;
    public_key?: ModelTypes["order_by"] | undefined;
    username?: ModelTypes["order_by"] | undefined;
    uuid?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.notification_subscriptions */
  ["auth_notification_subscriptions_pk_columns_input"]: {
    id: number;
  };
  ["auth_notification_subscriptions_select_column"]: auth_notification_subscriptions_select_column;
  /** input type for updating data in table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_set_input"]: {
    auth?: string | undefined;
    endpoint?: string | undefined;
    expirationTime?: string | undefined;
    id?: number | undefined;
    p256dh?: string | undefined;
    public_key?: string | undefined;
    username?: string | undefined;
  };
  /** Streaming cursor of the table "auth_notification_subscriptions" */
  ["auth_notification_subscriptions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["auth_notification_subscriptions_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_notification_subscriptions_stream_cursor_value_input"]: {
    auth?: string | undefined;
    endpoint?: string | undefined;
    expirationTime?: string | undefined;
    id?: number | undefined;
    p256dh?: string | undefined;
    public_key?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
  };
  ["auth_notification_subscriptions_update_column"]: auth_notification_subscriptions_update_column;
  ["auth_notification_subscriptions_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["auth_notification_subscriptions_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["auth_notification_subscriptions_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["auth_notification_subscriptions_bool_exp"];
  };
  /** columns and relationships of "auth.notifications" */
  ["auth_notifications"]: {
    body: string;
    id: number;
    image: string;
    timestamp?: ModelTypes["timestamptz"] | undefined;
    title: string;
    username: string;
    uuid: string;
    viewed?: boolean | undefined;
    xnft_id: string;
  };
  /** aggregated selection of "auth.notifications" */
  ["auth_notifications_aggregate"]: {
    aggregate?: ModelTypes["auth_notifications_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["auth_notifications"]>;
  };
  /** aggregate fields of "auth.notifications" */
  ["auth_notifications_aggregate_fields"]: {
    avg?: ModelTypes["auth_notifications_avg_fields"] | undefined;
    count: number;
    max?: ModelTypes["auth_notifications_max_fields"] | undefined;
    min?: ModelTypes["auth_notifications_min_fields"] | undefined;
    stddev?: ModelTypes["auth_notifications_stddev_fields"] | undefined;
    stddev_pop?: ModelTypes["auth_notifications_stddev_pop_fields"] | undefined;
    stddev_samp?:
      | ModelTypes["auth_notifications_stddev_samp_fields"]
      | undefined;
    sum?: ModelTypes["auth_notifications_sum_fields"] | undefined;
    var_pop?: ModelTypes["auth_notifications_var_pop_fields"] | undefined;
    var_samp?: ModelTypes["auth_notifications_var_samp_fields"] | undefined;
    variance?: ModelTypes["auth_notifications_variance_fields"] | undefined;
  };
  /** aggregate avg on columns */
  ["auth_notifications_avg_fields"]: {
    id?: number | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.notifications". All fields are combined with a logical 'AND'. */
  ["auth_notifications_bool_exp"]: {
    _and?: Array<ModelTypes["auth_notifications_bool_exp"]> | undefined;
    _not?: ModelTypes["auth_notifications_bool_exp"] | undefined;
    _or?: Array<ModelTypes["auth_notifications_bool_exp"]> | undefined;
    body?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    image?: ModelTypes["String_comparison_exp"] | undefined;
    timestamp?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    title?: ModelTypes["String_comparison_exp"] | undefined;
    username?: ModelTypes["String_comparison_exp"] | undefined;
    uuid?: ModelTypes["String_comparison_exp"] | undefined;
    viewed?: ModelTypes["Boolean_comparison_exp"] | undefined;
    xnft_id?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["auth_notifications_constraint"]: auth_notifications_constraint;
  /** input type for incrementing numeric columns in table "auth.notifications" */
  ["auth_notifications_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "auth.notifications" */
  ["auth_notifications_insert_input"]: {
    body?: string | undefined;
    id?: number | undefined;
    image?: string | undefined;
    timestamp?: ModelTypes["timestamptz"] | undefined;
    title?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    viewed?: boolean | undefined;
    xnft_id?: string | undefined;
  };
  /** aggregate max on columns */
  ["auth_notifications_max_fields"]: {
    body?: string | undefined;
    id?: number | undefined;
    image?: string | undefined;
    timestamp?: ModelTypes["timestamptz"] | undefined;
    title?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    xnft_id?: string | undefined;
  };
  /** aggregate min on columns */
  ["auth_notifications_min_fields"]: {
    body?: string | undefined;
    id?: number | undefined;
    image?: string | undefined;
    timestamp?: ModelTypes["timestamptz"] | undefined;
    title?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    xnft_id?: string | undefined;
  };
  /** response of any mutation on the table "auth.notifications" */
  ["auth_notifications_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_notifications"]>;
  };
  /** on_conflict condition type for table "auth.notifications" */
  ["auth_notifications_on_conflict"]: {
    constraint: ModelTypes["auth_notifications_constraint"];
    update_columns: Array<ModelTypes["auth_notifications_update_column"]>;
    where?: ModelTypes["auth_notifications_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.notifications". */
  ["auth_notifications_order_by"]: {
    body?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    image?: ModelTypes["order_by"] | undefined;
    timestamp?: ModelTypes["order_by"] | undefined;
    title?: ModelTypes["order_by"] | undefined;
    username?: ModelTypes["order_by"] | undefined;
    uuid?: ModelTypes["order_by"] | undefined;
    viewed?: ModelTypes["order_by"] | undefined;
    xnft_id?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.notifications */
  ["auth_notifications_pk_columns_input"]: {
    id: number;
  };
  ["auth_notifications_select_column"]: auth_notifications_select_column;
  /** input type for updating data in table "auth.notifications" */
  ["auth_notifications_set_input"]: {
    body?: string | undefined;
    id?: number | undefined;
    image?: string | undefined;
    title?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    viewed?: boolean | undefined;
    xnft_id?: string | undefined;
  };
  /** aggregate stddev on columns */
  ["auth_notifications_stddev_fields"]: {
    id?: number | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["auth_notifications_stddev_pop_fields"]: {
    id?: number | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["auth_notifications_stddev_samp_fields"]: {
    id?: number | undefined;
  };
  /** Streaming cursor of the table "auth_notifications" */
  ["auth_notifications_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["auth_notifications_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_notifications_stream_cursor_value_input"]: {
    body?: string | undefined;
    id?: number | undefined;
    image?: string | undefined;
    timestamp?: ModelTypes["timestamptz"] | undefined;
    title?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    viewed?: boolean | undefined;
    xnft_id?: string | undefined;
  };
  /** aggregate sum on columns */
  ["auth_notifications_sum_fields"]: {
    id?: number | undefined;
  };
  ["auth_notifications_update_column"]: auth_notifications_update_column;
  ["auth_notifications_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["auth_notifications_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["auth_notifications_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["auth_notifications_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["auth_notifications_var_pop_fields"]: {
    id?: number | undefined;
  };
  /** aggregate var_samp on columns */
  ["auth_notifications_var_samp_fields"]: {
    id?: number | undefined;
  };
  /** aggregate variance on columns */
  ["auth_notifications_variance_fields"]: {
    id?: number | undefined;
  };
  /** columns and relationships of "auth.public_keys" */
  ["auth_public_keys"]: {
    blockchain: string;
    created_at: ModelTypes["timestamptz"];
    id: number;
    public_key: string;
    /** An object relationship */
    user?: ModelTypes["auth_users"] | undefined;
    /** An array relationship */
    user_active_publickey_mappings: Array<
      ModelTypes["auth_user_active_publickey_mapping"]
    >;
    user_id?: ModelTypes["uuid"] | undefined;
    /** An array relationship */
    user_nfts: Array<ModelTypes["auth_user_nfts"]>;
    /** An aggregate relationship */
    user_nfts_aggregate: ModelTypes["auth_user_nfts_aggregate"];
  };
  /** aggregated selection of "auth.public_keys" */
  ["auth_public_keys_aggregate"]: {
    aggregate?: ModelTypes["auth_public_keys_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["auth_public_keys"]>;
  };
  ["auth_public_keys_aggregate_bool_exp"]: {
    count?: ModelTypes["auth_public_keys_aggregate_bool_exp_count"] | undefined;
  };
  ["auth_public_keys_aggregate_bool_exp_count"]: {
    arguments?: Array<ModelTypes["auth_public_keys_select_column"]> | undefined;
    distinct?: boolean | undefined;
    filter?: ModelTypes["auth_public_keys_bool_exp"] | undefined;
    predicate: ModelTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "auth.public_keys" */
  ["auth_public_keys_aggregate_fields"]: {
    avg?: ModelTypes["auth_public_keys_avg_fields"] | undefined;
    count: number;
    max?: ModelTypes["auth_public_keys_max_fields"] | undefined;
    min?: ModelTypes["auth_public_keys_min_fields"] | undefined;
    stddev?: ModelTypes["auth_public_keys_stddev_fields"] | undefined;
    stddev_pop?: ModelTypes["auth_public_keys_stddev_pop_fields"] | undefined;
    stddev_samp?: ModelTypes["auth_public_keys_stddev_samp_fields"] | undefined;
    sum?: ModelTypes["auth_public_keys_sum_fields"] | undefined;
    var_pop?: ModelTypes["auth_public_keys_var_pop_fields"] | undefined;
    var_samp?: ModelTypes["auth_public_keys_var_samp_fields"] | undefined;
    variance?: ModelTypes["auth_public_keys_variance_fields"] | undefined;
  };
  /** order by aggregate values of table "auth.public_keys" */
  ["auth_public_keys_aggregate_order_by"]: {
    avg?: ModelTypes["auth_public_keys_avg_order_by"] | undefined;
    count?: ModelTypes["order_by"] | undefined;
    max?: ModelTypes["auth_public_keys_max_order_by"] | undefined;
    min?: ModelTypes["auth_public_keys_min_order_by"] | undefined;
    stddev?: ModelTypes["auth_public_keys_stddev_order_by"] | undefined;
    stddev_pop?: ModelTypes["auth_public_keys_stddev_pop_order_by"] | undefined;
    stddev_samp?:
      | ModelTypes["auth_public_keys_stddev_samp_order_by"]
      | undefined;
    sum?: ModelTypes["auth_public_keys_sum_order_by"] | undefined;
    var_pop?: ModelTypes["auth_public_keys_var_pop_order_by"] | undefined;
    var_samp?: ModelTypes["auth_public_keys_var_samp_order_by"] | undefined;
    variance?: ModelTypes["auth_public_keys_variance_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "auth.public_keys" */
  ["auth_public_keys_arr_rel_insert_input"]: {
    data: Array<ModelTypes["auth_public_keys_insert_input"]>;
    /** upsert condition */
    on_conflict?: ModelTypes["auth_public_keys_on_conflict"] | undefined;
  };
  /** aggregate avg on columns */
  ["auth_public_keys_avg_fields"]: {
    id?: number | undefined;
  };
  /** order by avg() on columns of table "auth.public_keys" */
  ["auth_public_keys_avg_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.public_keys". All fields are combined with a logical 'AND'. */
  ["auth_public_keys_bool_exp"]: {
    _and?: Array<ModelTypes["auth_public_keys_bool_exp"]> | undefined;
    _not?: ModelTypes["auth_public_keys_bool_exp"] | undefined;
    _or?: Array<ModelTypes["auth_public_keys_bool_exp"]> | undefined;
    blockchain?: ModelTypes["String_comparison_exp"] | undefined;
    created_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    public_key?: ModelTypes["String_comparison_exp"] | undefined;
    user?: ModelTypes["auth_users_bool_exp"] | undefined;
    user_active_publickey_mappings?:
      | ModelTypes["auth_user_active_publickey_mapping_bool_exp"]
      | undefined;
    user_id?: ModelTypes["uuid_comparison_exp"] | undefined;
    user_nfts?: ModelTypes["auth_user_nfts_bool_exp"] | undefined;
    user_nfts_aggregate?:
      | ModelTypes["auth_user_nfts_aggregate_bool_exp"]
      | undefined;
  };
  ["auth_public_keys_constraint"]: auth_public_keys_constraint;
  /** input type for inserting data into table "auth.public_keys" */
  ["auth_public_keys_insert_input"]: {
    blockchain?: string | undefined;
    public_key?: string | undefined;
    user?: ModelTypes["auth_users_obj_rel_insert_input"] | undefined;
    user_active_publickey_mappings?:
      | ModelTypes["auth_user_active_publickey_mapping_arr_rel_insert_input"]
      | undefined;
    user_id?: ModelTypes["uuid"] | undefined;
    user_nfts?: ModelTypes["auth_user_nfts_arr_rel_insert_input"] | undefined;
  };
  /** aggregate max on columns */
  ["auth_public_keys_max_fields"]: {
    blockchain?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: number | undefined;
    public_key?: string | undefined;
    user_id?: ModelTypes["uuid"] | undefined;
  };
  /** order by max() on columns of table "auth.public_keys" */
  ["auth_public_keys_max_order_by"]: {
    blockchain?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    public_key?: ModelTypes["order_by"] | undefined;
    user_id?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["auth_public_keys_min_fields"]: {
    blockchain?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: number | undefined;
    public_key?: string | undefined;
    user_id?: ModelTypes["uuid"] | undefined;
  };
  /** order by min() on columns of table "auth.public_keys" */
  ["auth_public_keys_min_order_by"]: {
    blockchain?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    public_key?: ModelTypes["order_by"] | undefined;
    user_id?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "auth.public_keys" */
  ["auth_public_keys_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_public_keys"]>;
  };
  /** input type for inserting object relation for remote table "auth.public_keys" */
  ["auth_public_keys_obj_rel_insert_input"]: {
    data: ModelTypes["auth_public_keys_insert_input"];
    /** upsert condition */
    on_conflict?: ModelTypes["auth_public_keys_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "auth.public_keys" */
  ["auth_public_keys_on_conflict"]: {
    constraint: ModelTypes["auth_public_keys_constraint"];
    update_columns: Array<ModelTypes["auth_public_keys_update_column"]>;
    where?: ModelTypes["auth_public_keys_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.public_keys". */
  ["auth_public_keys_order_by"]: {
    blockchain?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    public_key?: ModelTypes["order_by"] | undefined;
    user?: ModelTypes["auth_users_order_by"] | undefined;
    user_active_publickey_mappings_aggregate?:
      | ModelTypes["auth_user_active_publickey_mapping_aggregate_order_by"]
      | undefined;
    user_id?: ModelTypes["order_by"] | undefined;
    user_nfts_aggregate?:
      | ModelTypes["auth_user_nfts_aggregate_order_by"]
      | undefined;
  };
  ["auth_public_keys_select_column"]: auth_public_keys_select_column;
  /** aggregate stddev on columns */
  ["auth_public_keys_stddev_fields"]: {
    id?: number | undefined;
  };
  /** order by stddev() on columns of table "auth.public_keys" */
  ["auth_public_keys_stddev_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["auth_public_keys_stddev_pop_fields"]: {
    id?: number | undefined;
  };
  /** order by stddev_pop() on columns of table "auth.public_keys" */
  ["auth_public_keys_stddev_pop_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["auth_public_keys_stddev_samp_fields"]: {
    id?: number | undefined;
  };
  /** order by stddev_samp() on columns of table "auth.public_keys" */
  ["auth_public_keys_stddev_samp_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "auth_public_keys" */
  ["auth_public_keys_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["auth_public_keys_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_public_keys_stream_cursor_value_input"]: {
    blockchain?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: number | undefined;
    public_key?: string | undefined;
    user_id?: ModelTypes["uuid"] | undefined;
  };
  /** aggregate sum on columns */
  ["auth_public_keys_sum_fields"]: {
    id?: number | undefined;
  };
  /** order by sum() on columns of table "auth.public_keys" */
  ["auth_public_keys_sum_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  ["auth_public_keys_update_column"]: auth_public_keys_update_column;
  /** aggregate var_pop on columns */
  ["auth_public_keys_var_pop_fields"]: {
    id?: number | undefined;
  };
  /** order by var_pop() on columns of table "auth.public_keys" */
  ["auth_public_keys_var_pop_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate var_samp on columns */
  ["auth_public_keys_var_samp_fields"]: {
    id?: number | undefined;
  };
  /** order by var_samp() on columns of table "auth.public_keys" */
  ["auth_public_keys_var_samp_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate variance on columns */
  ["auth_public_keys_variance_fields"]: {
    id?: number | undefined;
  };
  /** order by variance() on columns of table "auth.public_keys" */
  ["auth_public_keys_variance_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** columns and relationships of "auth.stripe_onramp" */
  ["auth_stripe_onramp"]: {
    client_secret: string;
    id: number;
    public_key: string;
    status: string;
    webhook_dump: string;
  };
  /** Boolean expression to filter rows from the table "auth.stripe_onramp". All fields are combined with a logical 'AND'. */
  ["auth_stripe_onramp_bool_exp"]: {
    _and?: Array<ModelTypes["auth_stripe_onramp_bool_exp"]> | undefined;
    _not?: ModelTypes["auth_stripe_onramp_bool_exp"] | undefined;
    _or?: Array<ModelTypes["auth_stripe_onramp_bool_exp"]> | undefined;
    client_secret?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    public_key?: ModelTypes["String_comparison_exp"] | undefined;
    status?: ModelTypes["String_comparison_exp"] | undefined;
    webhook_dump?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["auth_stripe_onramp_constraint"]: auth_stripe_onramp_constraint;
  /** input type for incrementing numeric columns in table "auth.stripe_onramp" */
  ["auth_stripe_onramp_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "auth.stripe_onramp" */
  ["auth_stripe_onramp_insert_input"]: {
    client_secret?: string | undefined;
    id?: number | undefined;
    public_key?: string | undefined;
    status?: string | undefined;
    webhook_dump?: string | undefined;
  };
  /** response of any mutation on the table "auth.stripe_onramp" */
  ["auth_stripe_onramp_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_stripe_onramp"]>;
  };
  /** on_conflict condition type for table "auth.stripe_onramp" */
  ["auth_stripe_onramp_on_conflict"]: {
    constraint: ModelTypes["auth_stripe_onramp_constraint"];
    update_columns: Array<ModelTypes["auth_stripe_onramp_update_column"]>;
    where?: ModelTypes["auth_stripe_onramp_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.stripe_onramp". */
  ["auth_stripe_onramp_order_by"]: {
    client_secret?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    public_key?: ModelTypes["order_by"] | undefined;
    status?: ModelTypes["order_by"] | undefined;
    webhook_dump?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.stripe_onramp */
  ["auth_stripe_onramp_pk_columns_input"]: {
    client_secret: string;
  };
  ["auth_stripe_onramp_select_column"]: auth_stripe_onramp_select_column;
  /** input type for updating data in table "auth.stripe_onramp" */
  ["auth_stripe_onramp_set_input"]: {
    client_secret?: string | undefined;
    id?: number | undefined;
    public_key?: string | undefined;
    status?: string | undefined;
    webhook_dump?: string | undefined;
  };
  /** Streaming cursor of the table "auth_stripe_onramp" */
  ["auth_stripe_onramp_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["auth_stripe_onramp_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_stripe_onramp_stream_cursor_value_input"]: {
    client_secret?: string | undefined;
    id?: number | undefined;
    public_key?: string | undefined;
    status?: string | undefined;
    webhook_dump?: string | undefined;
  };
  ["auth_stripe_onramp_update_column"]: auth_stripe_onramp_update_column;
  ["auth_stripe_onramp_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["auth_stripe_onramp_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["auth_stripe_onramp_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["auth_stripe_onramp_bool_exp"];
  };
  /** columns and relationships of "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping"]: {
    blockchain: string;
    /** An object relationship */
    public_key: ModelTypes["auth_public_keys"];
    public_key_id: number;
    user_id: ModelTypes["uuid"];
  };
  /** order by aggregate values of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_aggregate_order_by"]: {
    avg?:
      | ModelTypes["auth_user_active_publickey_mapping_avg_order_by"]
      | undefined;
    count?: ModelTypes["order_by"] | undefined;
    max?:
      | ModelTypes["auth_user_active_publickey_mapping_max_order_by"]
      | undefined;
    min?:
      | ModelTypes["auth_user_active_publickey_mapping_min_order_by"]
      | undefined;
    stddev?:
      | ModelTypes["auth_user_active_publickey_mapping_stddev_order_by"]
      | undefined;
    stddev_pop?:
      | ModelTypes["auth_user_active_publickey_mapping_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | ModelTypes["auth_user_active_publickey_mapping_stddev_samp_order_by"]
      | undefined;
    sum?:
      | ModelTypes["auth_user_active_publickey_mapping_sum_order_by"]
      | undefined;
    var_pop?:
      | ModelTypes["auth_user_active_publickey_mapping_var_pop_order_by"]
      | undefined;
    var_samp?:
      | ModelTypes["auth_user_active_publickey_mapping_var_samp_order_by"]
      | undefined;
    variance?:
      | ModelTypes["auth_user_active_publickey_mapping_variance_order_by"]
      | undefined;
  };
  /** input type for inserting array relation for remote table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_arr_rel_insert_input"]: {
    data: Array<ModelTypes["auth_user_active_publickey_mapping_insert_input"]>;
    /** upsert condition */
    on_conflict?:
      | ModelTypes["auth_user_active_publickey_mapping_on_conflict"]
      | undefined;
  };
  /** order by avg() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_avg_order_by"]: {
    public_key_id?: ModelTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.user_active_publickey_mapping". All fields are combined with a logical 'AND'. */
  ["auth_user_active_publickey_mapping_bool_exp"]: {
    _and?:
      | Array<ModelTypes["auth_user_active_publickey_mapping_bool_exp"]>
      | undefined;
    _not?:
      | ModelTypes["auth_user_active_publickey_mapping_bool_exp"]
      | undefined;
    _or?:
      | Array<ModelTypes["auth_user_active_publickey_mapping_bool_exp"]>
      | undefined;
    blockchain?: ModelTypes["String_comparison_exp"] | undefined;
    public_key?: ModelTypes["auth_public_keys_bool_exp"] | undefined;
    public_key_id?: ModelTypes["Int_comparison_exp"] | undefined;
    user_id?: ModelTypes["uuid_comparison_exp"] | undefined;
  };
  ["auth_user_active_publickey_mapping_constraint"]: auth_user_active_publickey_mapping_constraint;
  /** input type for incrementing numeric columns in table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_inc_input"]: {
    public_key_id?: number | undefined;
  };
  /** input type for inserting data into table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_insert_input"]: {
    blockchain?: string | undefined;
    public_key?:
      | ModelTypes["auth_public_keys_obj_rel_insert_input"]
      | undefined;
    public_key_id?: number | undefined;
    user_id?: ModelTypes["uuid"] | undefined;
  };
  /** order by max() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_max_order_by"]: {
    blockchain?: ModelTypes["order_by"] | undefined;
    public_key_id?: ModelTypes["order_by"] | undefined;
    user_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_min_order_by"]: {
    blockchain?: ModelTypes["order_by"] | undefined;
    public_key_id?: ModelTypes["order_by"] | undefined;
    user_id?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_user_active_publickey_mapping"]>;
  };
  /** on_conflict condition type for table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_on_conflict"]: {
    constraint: ModelTypes["auth_user_active_publickey_mapping_constraint"];
    update_columns: Array<
      ModelTypes["auth_user_active_publickey_mapping_update_column"]
    >;
    where?:
      | ModelTypes["auth_user_active_publickey_mapping_bool_exp"]
      | undefined;
  };
  /** Ordering options when selecting data from "auth.user_active_publickey_mapping". */
  ["auth_user_active_publickey_mapping_order_by"]: {
    blockchain?: ModelTypes["order_by"] | undefined;
    public_key?: ModelTypes["auth_public_keys_order_by"] | undefined;
    public_key_id?: ModelTypes["order_by"] | undefined;
    user_id?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.user_active_publickey_mapping */
  ["auth_user_active_publickey_mapping_pk_columns_input"]: {
    blockchain: string;
    user_id: ModelTypes["uuid"];
  };
  ["auth_user_active_publickey_mapping_select_column"]: auth_user_active_publickey_mapping_select_column;
  /** input type for updating data in table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_set_input"]: {
    blockchain?: string | undefined;
    public_key_id?: number | undefined;
    user_id?: ModelTypes["uuid"] | undefined;
  };
  /** order by stddev() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stddev_order_by"]: {
    public_key_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stddev_pop_order_by"]: {
    public_key_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stddev_samp_order_by"]: {
    public_key_id?: ModelTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "auth_user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["auth_user_active_publickey_mapping_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_user_active_publickey_mapping_stream_cursor_value_input"]: {
    blockchain?: string | undefined;
    public_key_id?: number | undefined;
    user_id?: ModelTypes["uuid"] | undefined;
  };
  /** order by sum() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_sum_order_by"]: {
    public_key_id?: ModelTypes["order_by"] | undefined;
  };
  ["auth_user_active_publickey_mapping_update_column"]: auth_user_active_publickey_mapping_update_column;
  ["auth_user_active_publickey_mapping_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ModelTypes["auth_user_active_publickey_mapping_inc_input"]
      | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ModelTypes["auth_user_active_publickey_mapping_set_input"]
      | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["auth_user_active_publickey_mapping_bool_exp"];
  };
  /** order by var_pop() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_var_pop_order_by"]: {
    public_key_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_var_samp_order_by"]: {
    public_key_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_variance_order_by"]: {
    public_key_id?: ModelTypes["order_by"] | undefined;
  };
  /** columns and relationships of "auth.user_nfts" */
  ["auth_user_nfts"]: {
    blockchain: string;
    centralized_group?: string | undefined;
    collection_id?: string | undefined;
    nft_id: string;
    /** An object relationship */
    publicKeyByBlockchainPublicKey?: ModelTypes["auth_public_keys"] | undefined;
    public_key: string;
  };
  /** aggregated selection of "auth.user_nfts" */
  ["auth_user_nfts_aggregate"]: {
    aggregate?: ModelTypes["auth_user_nfts_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["auth_user_nfts"]>;
  };
  ["auth_user_nfts_aggregate_bool_exp"]: {
    count?: ModelTypes["auth_user_nfts_aggregate_bool_exp_count"] | undefined;
  };
  ["auth_user_nfts_aggregate_bool_exp_count"]: {
    arguments?: Array<ModelTypes["auth_user_nfts_select_column"]> | undefined;
    distinct?: boolean | undefined;
    filter?: ModelTypes["auth_user_nfts_bool_exp"] | undefined;
    predicate: ModelTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "auth.user_nfts" */
  ["auth_user_nfts_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["auth_user_nfts_max_fields"] | undefined;
    min?: ModelTypes["auth_user_nfts_min_fields"] | undefined;
  };
  /** order by aggregate values of table "auth.user_nfts" */
  ["auth_user_nfts_aggregate_order_by"]: {
    count?: ModelTypes["order_by"] | undefined;
    max?: ModelTypes["auth_user_nfts_max_order_by"] | undefined;
    min?: ModelTypes["auth_user_nfts_min_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "auth.user_nfts" */
  ["auth_user_nfts_arr_rel_insert_input"]: {
    data: Array<ModelTypes["auth_user_nfts_insert_input"]>;
    /** upsert condition */
    on_conflict?: ModelTypes["auth_user_nfts_on_conflict"] | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.user_nfts". All fields are combined with a logical 'AND'. */
  ["auth_user_nfts_bool_exp"]: {
    _and?: Array<ModelTypes["auth_user_nfts_bool_exp"]> | undefined;
    _not?: ModelTypes["auth_user_nfts_bool_exp"] | undefined;
    _or?: Array<ModelTypes["auth_user_nfts_bool_exp"]> | undefined;
    blockchain?: ModelTypes["String_comparison_exp"] | undefined;
    centralized_group?: ModelTypes["String_comparison_exp"] | undefined;
    collection_id?: ModelTypes["String_comparison_exp"] | undefined;
    nft_id?: ModelTypes["String_comparison_exp"] | undefined;
    publicKeyByBlockchainPublicKey?:
      | ModelTypes["auth_public_keys_bool_exp"]
      | undefined;
    public_key?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["auth_user_nfts_constraint"]: auth_user_nfts_constraint;
  /** input type for inserting data into table "auth.user_nfts" */
  ["auth_user_nfts_insert_input"]: {
    blockchain?: string | undefined;
    centralized_group?: string | undefined;
    collection_id?: string | undefined;
    nft_id?: string | undefined;
    publicKeyByBlockchainPublicKey?:
      | ModelTypes["auth_public_keys_obj_rel_insert_input"]
      | undefined;
    public_key?: string | undefined;
  };
  /** aggregate max on columns */
  ["auth_user_nfts_max_fields"]: {
    blockchain?: string | undefined;
    centralized_group?: string | undefined;
    collection_id?: string | undefined;
    nft_id?: string | undefined;
    public_key?: string | undefined;
  };
  /** order by max() on columns of table "auth.user_nfts" */
  ["auth_user_nfts_max_order_by"]: {
    blockchain?: ModelTypes["order_by"] | undefined;
    centralized_group?: ModelTypes["order_by"] | undefined;
    collection_id?: ModelTypes["order_by"] | undefined;
    nft_id?: ModelTypes["order_by"] | undefined;
    public_key?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["auth_user_nfts_min_fields"]: {
    blockchain?: string | undefined;
    centralized_group?: string | undefined;
    collection_id?: string | undefined;
    nft_id?: string | undefined;
    public_key?: string | undefined;
  };
  /** order by min() on columns of table "auth.user_nfts" */
  ["auth_user_nfts_min_order_by"]: {
    blockchain?: ModelTypes["order_by"] | undefined;
    centralized_group?: ModelTypes["order_by"] | undefined;
    collection_id?: ModelTypes["order_by"] | undefined;
    nft_id?: ModelTypes["order_by"] | undefined;
    public_key?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "auth.user_nfts" */
  ["auth_user_nfts_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_user_nfts"]>;
  };
  /** on_conflict condition type for table "auth.user_nfts" */
  ["auth_user_nfts_on_conflict"]: {
    constraint: ModelTypes["auth_user_nfts_constraint"];
    update_columns: Array<ModelTypes["auth_user_nfts_update_column"]>;
    where?: ModelTypes["auth_user_nfts_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.user_nfts". */
  ["auth_user_nfts_order_by"]: {
    blockchain?: ModelTypes["order_by"] | undefined;
    centralized_group?: ModelTypes["order_by"] | undefined;
    collection_id?: ModelTypes["order_by"] | undefined;
    nft_id?: ModelTypes["order_by"] | undefined;
    publicKeyByBlockchainPublicKey?:
      | ModelTypes["auth_public_keys_order_by"]
      | undefined;
    public_key?: ModelTypes["order_by"] | undefined;
  };
  ["auth_user_nfts_select_column"]: auth_user_nfts_select_column;
  /** Streaming cursor of the table "auth_user_nfts" */
  ["auth_user_nfts_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["auth_user_nfts_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_user_nfts_stream_cursor_value_input"]: {
    blockchain?: string | undefined;
    centralized_group?: string | undefined;
    collection_id?: string | undefined;
    nft_id?: string | undefined;
    public_key?: string | undefined;
  };
  ["auth_user_nfts_update_column"]: auth_user_nfts_update_column;
  /** columns and relationships of "auth.users" */
  ["auth_users"]: {
    created_at: ModelTypes["timestamptz"];
    /** the user's first solana public key inside an array due to hasura limitation */
    dropzone_public_key?: Array<ModelTypes["auth_public_keys"]> | undefined;
    id: ModelTypes["uuid"];
    /** An object relationship */
    invitation: ModelTypes["auth_invitations"];
    /** An array relationship */
    public_keys: Array<ModelTypes["auth_public_keys"]>;
    /** An aggregate relationship */
    public_keys_aggregate: ModelTypes["auth_public_keys_aggregate"];
    /** An array relationship */
    referred_users: Array<ModelTypes["auth_users"]>;
    /** An aggregate relationship */
    referred_users_aggregate: ModelTypes["auth_users_aggregate"];
    /** An object relationship */
    referrer?: ModelTypes["auth_users"] | undefined;
    username: ModelTypes["citext"];
  };
  /** aggregated selection of "auth.users" */
  ["auth_users_aggregate"]: {
    aggregate?: ModelTypes["auth_users_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["auth_users"]>;
  };
  ["auth_users_aggregate_bool_exp"]: {
    count?: ModelTypes["auth_users_aggregate_bool_exp_count"] | undefined;
  };
  ["auth_users_aggregate_bool_exp_count"]: {
    arguments?: Array<ModelTypes["auth_users_select_column"]> | undefined;
    distinct?: boolean | undefined;
    filter?: ModelTypes["auth_users_bool_exp"] | undefined;
    predicate: ModelTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "auth.users" */
  ["auth_users_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["auth_users_max_fields"] | undefined;
    min?: ModelTypes["auth_users_min_fields"] | undefined;
  };
  /** order by aggregate values of table "auth.users" */
  ["auth_users_aggregate_order_by"]: {
    count?: ModelTypes["order_by"] | undefined;
    max?: ModelTypes["auth_users_max_order_by"] | undefined;
    min?: ModelTypes["auth_users_min_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "auth.users" */
  ["auth_users_arr_rel_insert_input"]: {
    data: Array<ModelTypes["auth_users_insert_input"]>;
    /** upsert condition */
    on_conflict?: ModelTypes["auth_users_on_conflict"] | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.users". All fields are combined with a logical 'AND'. */
  ["auth_users_bool_exp"]: {
    _and?: Array<ModelTypes["auth_users_bool_exp"]> | undefined;
    _not?: ModelTypes["auth_users_bool_exp"] | undefined;
    _or?: Array<ModelTypes["auth_users_bool_exp"]> | undefined;
    created_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    dropzone_public_key?: ModelTypes["auth_public_keys_bool_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    invitation?: ModelTypes["auth_invitations_bool_exp"] | undefined;
    public_keys?: ModelTypes["auth_public_keys_bool_exp"] | undefined;
    public_keys_aggregate?:
      | ModelTypes["auth_public_keys_aggregate_bool_exp"]
      | undefined;
    referred_users?: ModelTypes["auth_users_bool_exp"] | undefined;
    referred_users_aggregate?:
      | ModelTypes["auth_users_aggregate_bool_exp"]
      | undefined;
    referrer?: ModelTypes["auth_users_bool_exp"] | undefined;
    username?: ModelTypes["citext_comparison_exp"] | undefined;
  };
  ["auth_users_constraint"]: auth_users_constraint;
  /** input type for inserting data into table "auth.users" */
  ["auth_users_insert_input"]: {
    invitation?:
      | ModelTypes["auth_invitations_obj_rel_insert_input"]
      | undefined;
    invitation_id?: ModelTypes["uuid"] | undefined;
    public_keys?:
      | ModelTypes["auth_public_keys_arr_rel_insert_input"]
      | undefined;
    referred_users?: ModelTypes["auth_users_arr_rel_insert_input"] | undefined;
    referrer?: ModelTypes["auth_users_obj_rel_insert_input"] | undefined;
    referrer_id?: ModelTypes["uuid"] | undefined;
    username?: ModelTypes["citext"] | undefined;
    waitlist_id?: string | undefined;
  };
  /** aggregate max on columns */
  ["auth_users_max_fields"]: {
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    username?: ModelTypes["citext"] | undefined;
  };
  /** order by max() on columns of table "auth.users" */
  ["auth_users_max_order_by"]: {
    created_at?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    username?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["auth_users_min_fields"]: {
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    username?: ModelTypes["citext"] | undefined;
  };
  /** order by min() on columns of table "auth.users" */
  ["auth_users_min_order_by"]: {
    created_at?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    username?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "auth.users" */
  ["auth_users_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_users"]>;
  };
  /** input type for inserting object relation for remote table "auth.users" */
  ["auth_users_obj_rel_insert_input"]: {
    data: ModelTypes["auth_users_insert_input"];
    /** upsert condition */
    on_conflict?: ModelTypes["auth_users_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "auth.users" */
  ["auth_users_on_conflict"]: {
    constraint: ModelTypes["auth_users_constraint"];
    update_columns: Array<ModelTypes["auth_users_update_column"]>;
    where?: ModelTypes["auth_users_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.users". */
  ["auth_users_order_by"]: {
    created_at?: ModelTypes["order_by"] | undefined;
    dropzone_public_key_aggregate?:
      | ModelTypes["auth_public_keys_aggregate_order_by"]
      | undefined;
    id?: ModelTypes["order_by"] | undefined;
    invitation?: ModelTypes["auth_invitations_order_by"] | undefined;
    public_keys_aggregate?:
      | ModelTypes["auth_public_keys_aggregate_order_by"]
      | undefined;
    referred_users_aggregate?:
      | ModelTypes["auth_users_aggregate_order_by"]
      | undefined;
    referrer?: ModelTypes["auth_users_order_by"] | undefined;
    username?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.users */
  ["auth_users_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  ["auth_users_select_column"]: auth_users_select_column;
  /** input type for updating data in table "auth.users" */
  ["auth_users_set_input"]: {
    avatar_nft?: ModelTypes["citext"] | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
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
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    username?: ModelTypes["citext"] | undefined;
  };
  ["auth_users_update_column"]: auth_users_update_column;
  ["auth_users_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["auth_users_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["auth_users_bool_exp"];
  };
  /** columns and relationships of "auth.xnft_preferences" */
  ["auth_xnft_preferences"]: {
    disabled?: string | undefined;
    id: number;
    media: boolean;
    notifications: boolean;
    username: string;
    uuid?: string | undefined;
    xnft_id: string;
  };
  /** Boolean expression to filter rows from the table "auth.xnft_preferences". All fields are combined with a logical 'AND'. */
  ["auth_xnft_preferences_bool_exp"]: {
    _and?: Array<ModelTypes["auth_xnft_preferences_bool_exp"]> | undefined;
    _not?: ModelTypes["auth_xnft_preferences_bool_exp"] | undefined;
    _or?: Array<ModelTypes["auth_xnft_preferences_bool_exp"]> | undefined;
    disabled?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    media?: ModelTypes["Boolean_comparison_exp"] | undefined;
    notifications?: ModelTypes["Boolean_comparison_exp"] | undefined;
    username?: ModelTypes["String_comparison_exp"] | undefined;
    uuid?: ModelTypes["String_comparison_exp"] | undefined;
    xnft_id?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["auth_xnft_preferences_constraint"]: auth_xnft_preferences_constraint;
  /** input type for incrementing numeric columns in table "auth.xnft_preferences" */
  ["auth_xnft_preferences_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "auth.xnft_preferences" */
  ["auth_xnft_preferences_insert_input"]: {
    disabled?: string | undefined;
    id?: number | undefined;
    media?: boolean | undefined;
    notifications?: boolean | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    xnft_id?: string | undefined;
  };
  /** response of any mutation on the table "auth.xnft_preferences" */
  ["auth_xnft_preferences_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_xnft_preferences"]>;
  };
  /** on_conflict condition type for table "auth.xnft_preferences" */
  ["auth_xnft_preferences_on_conflict"]: {
    constraint: ModelTypes["auth_xnft_preferences_constraint"];
    update_columns: Array<ModelTypes["auth_xnft_preferences_update_column"]>;
    where?: ModelTypes["auth_xnft_preferences_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.xnft_preferences". */
  ["auth_xnft_preferences_order_by"]: {
    disabled?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    media?: ModelTypes["order_by"] | undefined;
    notifications?: ModelTypes["order_by"] | undefined;
    username?: ModelTypes["order_by"] | undefined;
    uuid?: ModelTypes["order_by"] | undefined;
    xnft_id?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.xnft_preferences */
  ["auth_xnft_preferences_pk_columns_input"]: {
    id: number;
  };
  ["auth_xnft_preferences_select_column"]: auth_xnft_preferences_select_column;
  /** input type for updating data in table "auth.xnft_preferences" */
  ["auth_xnft_preferences_set_input"]: {
    disabled?: string | undefined;
    id?: number | undefined;
    media?: boolean | undefined;
    notifications?: boolean | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    xnft_id?: string | undefined;
  };
  /** Streaming cursor of the table "auth_xnft_preferences" */
  ["auth_xnft_preferences_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["auth_xnft_preferences_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_xnft_preferences_stream_cursor_value_input"]: {
    disabled?: string | undefined;
    id?: number | undefined;
    media?: boolean | undefined;
    notifications?: boolean | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    xnft_id?: string | undefined;
  };
  ["auth_xnft_preferences_update_column"]: auth_xnft_preferences_update_column;
  ["auth_xnft_preferences_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["auth_xnft_preferences_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["auth_xnft_preferences_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["auth_xnft_preferences_bool_exp"];
  };
  /** columns and relationships of "auth.xnft_secrets" */
  ["auth_xnft_secrets"]: {
    id: number;
    secret: string;
    xnft_id: string;
  };
  /** Boolean expression to filter rows from the table "auth.xnft_secrets". All fields are combined with a logical 'AND'. */
  ["auth_xnft_secrets_bool_exp"]: {
    _and?: Array<ModelTypes["auth_xnft_secrets_bool_exp"]> | undefined;
    _not?: ModelTypes["auth_xnft_secrets_bool_exp"] | undefined;
    _or?: Array<ModelTypes["auth_xnft_secrets_bool_exp"]> | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    secret?: ModelTypes["String_comparison_exp"] | undefined;
    xnft_id?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["auth_xnft_secrets_constraint"]: auth_xnft_secrets_constraint;
  /** input type for incrementing numeric columns in table "auth.xnft_secrets" */
  ["auth_xnft_secrets_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "auth.xnft_secrets" */
  ["auth_xnft_secrets_insert_input"]: {
    id?: number | undefined;
    secret?: string | undefined;
    xnft_id?: string | undefined;
  };
  /** response of any mutation on the table "auth.xnft_secrets" */
  ["auth_xnft_secrets_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["auth_xnft_secrets"]>;
  };
  /** on_conflict condition type for table "auth.xnft_secrets" */
  ["auth_xnft_secrets_on_conflict"]: {
    constraint: ModelTypes["auth_xnft_secrets_constraint"];
    update_columns: Array<ModelTypes["auth_xnft_secrets_update_column"]>;
    where?: ModelTypes["auth_xnft_secrets_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.xnft_secrets". */
  ["auth_xnft_secrets_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
    secret?: ModelTypes["order_by"] | undefined;
    xnft_id?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.xnft_secrets */
  ["auth_xnft_secrets_pk_columns_input"]: {
    id: number;
  };
  ["auth_xnft_secrets_select_column"]: auth_xnft_secrets_select_column;
  /** input type for updating data in table "auth.xnft_secrets" */
  ["auth_xnft_secrets_set_input"]: {
    id?: number | undefined;
    secret?: string | undefined;
    xnft_id?: string | undefined;
  };
  /** Streaming cursor of the table "auth_xnft_secrets" */
  ["auth_xnft_secrets_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["auth_xnft_secrets_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_xnft_secrets_stream_cursor_value_input"]: {
    id?: number | undefined;
    secret?: string | undefined;
    xnft_id?: string | undefined;
  };
  ["auth_xnft_secrets_update_column"]: auth_xnft_secrets_update_column;
  ["auth_xnft_secrets_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["auth_xnft_secrets_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["auth_xnft_secrets_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["auth_xnft_secrets_bool_exp"];
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
  /** data used by merkle distributors */
  ["dropzone_distributors"]: {
    created_at: ModelTypes["timestamptz"];
    data: ModelTypes["jsonb"];
    id: string;
    mint: string;
  };
  /** aggregated selection of "dropzone.distributors" */
  ["dropzone_distributors_aggregate"]: {
    aggregate?:
      | ModelTypes["dropzone_distributors_aggregate_fields"]
      | undefined;
    nodes: Array<ModelTypes["dropzone_distributors"]>;
  };
  /** aggregate fields of "dropzone.distributors" */
  ["dropzone_distributors_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["dropzone_distributors_max_fields"] | undefined;
    min?: ModelTypes["dropzone_distributors_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "dropzone.distributors". All fields are combined with a logical 'AND'. */
  ["dropzone_distributors_bool_exp"]: {
    _and?: Array<ModelTypes["dropzone_distributors_bool_exp"]> | undefined;
    _not?: ModelTypes["dropzone_distributors_bool_exp"] | undefined;
    _or?: Array<ModelTypes["dropzone_distributors_bool_exp"]> | undefined;
    created_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    data?: ModelTypes["jsonb_comparison_exp"] | undefined;
    id?: ModelTypes["String_comparison_exp"] | undefined;
    mint?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["dropzone_distributors_constraint"]: dropzone_distributors_constraint;
  /** input type for inserting data into table "dropzone.distributors" */
  ["dropzone_distributors_insert_input"]: {
    data?: ModelTypes["jsonb"] | undefined;
    id?: string | undefined;
    mint?: string | undefined;
  };
  /** aggregate max on columns */
  ["dropzone_distributors_max_fields"]: {
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: string | undefined;
    mint?: string | undefined;
  };
  /** aggregate min on columns */
  ["dropzone_distributors_min_fields"]: {
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: string | undefined;
    mint?: string | undefined;
  };
  /** response of any mutation on the table "dropzone.distributors" */
  ["dropzone_distributors_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["dropzone_distributors"]>;
  };
  /** on_conflict condition type for table "dropzone.distributors" */
  ["dropzone_distributors_on_conflict"]: {
    constraint: ModelTypes["dropzone_distributors_constraint"];
    update_columns: Array<ModelTypes["dropzone_distributors_update_column"]>;
    where?: ModelTypes["dropzone_distributors_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "dropzone.distributors". */
  ["dropzone_distributors_order_by"]: {
    created_at?: ModelTypes["order_by"] | undefined;
    data?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    mint?: ModelTypes["order_by"] | undefined;
  };
  ["dropzone_distributors_select_column"]: dropzone_distributors_select_column;
  /** Streaming cursor of the table "dropzone_distributors" */
  ["dropzone_distributors_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["dropzone_distributors_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["dropzone_distributors_stream_cursor_value_input"]: {
    created_at?: ModelTypes["timestamptz"] | undefined;
    data?: ModelTypes["jsonb"] | undefined;
    id?: string | undefined;
    mint?: string | undefined;
  };
  ["dropzone_distributors_update_column"]: dropzone_distributors_update_column;
  ["dropzone_user_dropzone_public_key_args"]: {
    user_row?: ModelTypes["users_scalar"] | undefined;
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
    /** delete data from the table: "auth.collection_messages" */
    delete_auth_collection_messages?:
      | ModelTypes["auth_collection_messages_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.collection_messages" */
    delete_auth_collection_messages_by_pk?:
      | ModelTypes["auth_collection_messages"]
      | undefined;
    /** delete data from the table: "auth.collections" */
    delete_auth_collections?:
      | ModelTypes["auth_collections_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.collections" */
    delete_auth_collections_by_pk?: ModelTypes["auth_collections"] | undefined;
    /** delete data from the table: "auth.friend_requests" */
    delete_auth_friend_requests?:
      | ModelTypes["auth_friend_requests_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.friend_requests" */
    delete_auth_friend_requests_by_pk?:
      | ModelTypes["auth_friend_requests"]
      | undefined;
    /** delete data from the table: "auth.friendships" */
    delete_auth_friendships?:
      | ModelTypes["auth_friendships_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.friendships" */
    delete_auth_friendships_by_pk?: ModelTypes["auth_friendships"] | undefined;
    /** delete data from the table: "auth.notification_subscriptions" */
    delete_auth_notification_subscriptions?:
      | ModelTypes["auth_notification_subscriptions_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.notification_subscriptions" */
    delete_auth_notification_subscriptions_by_pk?:
      | ModelTypes["auth_notification_subscriptions"]
      | undefined;
    /** delete data from the table: "auth.public_keys" */
    delete_auth_public_keys?:
      | ModelTypes["auth_public_keys_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.public_keys" */
    delete_auth_public_keys_by_pk?: ModelTypes["auth_public_keys"] | undefined;
    /** delete data from the table: "auth.user_nfts" */
    delete_auth_user_nfts?:
      | ModelTypes["auth_user_nfts_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.user_nfts" */
    delete_auth_user_nfts_by_pk?: ModelTypes["auth_user_nfts"] | undefined;
    /** delete data from the table: "auth.xnft_preferences" */
    delete_auth_xnft_preferences?:
      | ModelTypes["auth_xnft_preferences_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.xnft_preferences" */
    delete_auth_xnft_preferences_by_pk?:
      | ModelTypes["auth_xnft_preferences"]
      | undefined;
    /** insert data into the table: "auth.collection_messages" */
    insert_auth_collection_messages?:
      | ModelTypes["auth_collection_messages_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.collection_messages" */
    insert_auth_collection_messages_one?:
      | ModelTypes["auth_collection_messages"]
      | undefined;
    /** insert data into the table: "auth.collections" */
    insert_auth_collections?:
      | ModelTypes["auth_collections_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.collections" */
    insert_auth_collections_one?: ModelTypes["auth_collections"] | undefined;
    /** insert data into the table: "auth.friend_requests" */
    insert_auth_friend_requests?:
      | ModelTypes["auth_friend_requests_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.friend_requests" */
    insert_auth_friend_requests_one?:
      | ModelTypes["auth_friend_requests"]
      | undefined;
    /** insert data into the table: "auth.friendships" */
    insert_auth_friendships?:
      | ModelTypes["auth_friendships_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.friendships" */
    insert_auth_friendships_one?: ModelTypes["auth_friendships"] | undefined;
    /** insert data into the table: "auth.invitations" */
    insert_auth_invitations?:
      | ModelTypes["auth_invitations_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.invitations" */
    insert_auth_invitations_one?: ModelTypes["auth_invitations"] | undefined;
    /** insert data into the table: "auth.notification_cursor" */
    insert_auth_notification_cursor?:
      | ModelTypes["auth_notification_cursor_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.notification_cursor" */
    insert_auth_notification_cursor_one?:
      | ModelTypes["auth_notification_cursor"]
      | undefined;
    /** insert data into the table: "auth.notification_subscriptions" */
    insert_auth_notification_subscriptions?:
      | ModelTypes["auth_notification_subscriptions_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.notification_subscriptions" */
    insert_auth_notification_subscriptions_one?:
      | ModelTypes["auth_notification_subscriptions"]
      | undefined;
    /** insert data into the table: "auth.notifications" */
    insert_auth_notifications?:
      | ModelTypes["auth_notifications_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.notifications" */
    insert_auth_notifications_one?:
      | ModelTypes["auth_notifications"]
      | undefined;
    /** insert data into the table: "auth.public_keys" */
    insert_auth_public_keys?:
      | ModelTypes["auth_public_keys_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.public_keys" */
    insert_auth_public_keys_one?: ModelTypes["auth_public_keys"] | undefined;
    /** insert data into the table: "auth.stripe_onramp" */
    insert_auth_stripe_onramp?:
      | ModelTypes["auth_stripe_onramp_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.stripe_onramp" */
    insert_auth_stripe_onramp_one?:
      | ModelTypes["auth_stripe_onramp"]
      | undefined;
    /** insert data into the table: "auth.user_active_publickey_mapping" */
    insert_auth_user_active_publickey_mapping?:
      | ModelTypes["auth_user_active_publickey_mapping_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.user_active_publickey_mapping" */
    insert_auth_user_active_publickey_mapping_one?:
      | ModelTypes["auth_user_active_publickey_mapping"]
      | undefined;
    /** insert data into the table: "auth.user_nfts" */
    insert_auth_user_nfts?:
      | ModelTypes["auth_user_nfts_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.user_nfts" */
    insert_auth_user_nfts_one?: ModelTypes["auth_user_nfts"] | undefined;
    /** insert data into the table: "auth.users" */
    insert_auth_users?: ModelTypes["auth_users_mutation_response"] | undefined;
    /** insert a single row into the table: "auth.users" */
    insert_auth_users_one?: ModelTypes["auth_users"] | undefined;
    /** insert data into the table: "auth.xnft_preferences" */
    insert_auth_xnft_preferences?:
      | ModelTypes["auth_xnft_preferences_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.xnft_preferences" */
    insert_auth_xnft_preferences_one?:
      | ModelTypes["auth_xnft_preferences"]
      | undefined;
    /** insert data into the table: "auth.xnft_secrets" */
    insert_auth_xnft_secrets?:
      | ModelTypes["auth_xnft_secrets_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.xnft_secrets" */
    insert_auth_xnft_secrets_one?: ModelTypes["auth_xnft_secrets"] | undefined;
    /** insert data into the table: "dropzone.distributors" */
    insert_dropzone_distributors?:
      | ModelTypes["dropzone_distributors_mutation_response"]
      | undefined;
    /** insert a single row into the table: "dropzone.distributors" */
    insert_dropzone_distributors_one?:
      | ModelTypes["dropzone_distributors"]
      | undefined;
    /** update data of the table: "auth.collection_messages" */
    update_auth_collection_messages?:
      | ModelTypes["auth_collection_messages_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.collection_messages" */
    update_auth_collection_messages_by_pk?:
      | ModelTypes["auth_collection_messages"]
      | undefined;
    /** update multiples rows of table: "auth.collection_messages" */
    update_auth_collection_messages_many?:
      | Array<
          ModelTypes["auth_collection_messages_mutation_response"] | undefined
        >
      | undefined;
    /** update data of the table: "auth.collections" */
    update_auth_collections?:
      | ModelTypes["auth_collections_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.collections" */
    update_auth_collections_by_pk?: ModelTypes["auth_collections"] | undefined;
    /** update multiples rows of table: "auth.collections" */
    update_auth_collections_many?:
      | Array<ModelTypes["auth_collections_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "auth.friendships" */
    update_auth_friendships?:
      | ModelTypes["auth_friendships_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.friendships" */
    update_auth_friendships_by_pk?: ModelTypes["auth_friendships"] | undefined;
    /** update multiples rows of table: "auth.friendships" */
    update_auth_friendships_many?:
      | Array<ModelTypes["auth_friendships_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "auth.notification_cursor" */
    update_auth_notification_cursor?:
      | ModelTypes["auth_notification_cursor_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.notification_cursor" */
    update_auth_notification_cursor_by_pk?:
      | ModelTypes["auth_notification_cursor"]
      | undefined;
    /** update multiples rows of table: "auth.notification_cursor" */
    update_auth_notification_cursor_many?:
      | Array<
          ModelTypes["auth_notification_cursor_mutation_response"] | undefined
        >
      | undefined;
    /** update data of the table: "auth.notification_subscriptions" */
    update_auth_notification_subscriptions?:
      | ModelTypes["auth_notification_subscriptions_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.notification_subscriptions" */
    update_auth_notification_subscriptions_by_pk?:
      | ModelTypes["auth_notification_subscriptions"]
      | undefined;
    /** update multiples rows of table: "auth.notification_subscriptions" */
    update_auth_notification_subscriptions_many?:
      | Array<
          | ModelTypes["auth_notification_subscriptions_mutation_response"]
          | undefined
        >
      | undefined;
    /** update data of the table: "auth.notifications" */
    update_auth_notifications?:
      | ModelTypes["auth_notifications_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.notifications" */
    update_auth_notifications_by_pk?:
      | ModelTypes["auth_notifications"]
      | undefined;
    /** update multiples rows of table: "auth.notifications" */
    update_auth_notifications_many?:
      | Array<ModelTypes["auth_notifications_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "auth.stripe_onramp" */
    update_auth_stripe_onramp?:
      | ModelTypes["auth_stripe_onramp_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.stripe_onramp" */
    update_auth_stripe_onramp_by_pk?:
      | ModelTypes["auth_stripe_onramp"]
      | undefined;
    /** update multiples rows of table: "auth.stripe_onramp" */
    update_auth_stripe_onramp_many?:
      | Array<ModelTypes["auth_stripe_onramp_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "auth.user_active_publickey_mapping" */
    update_auth_user_active_publickey_mapping?:
      | ModelTypes["auth_user_active_publickey_mapping_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.user_active_publickey_mapping" */
    update_auth_user_active_publickey_mapping_by_pk?:
      | ModelTypes["auth_user_active_publickey_mapping"]
      | undefined;
    /** update multiples rows of table: "auth.user_active_publickey_mapping" */
    update_auth_user_active_publickey_mapping_many?:
      | Array<
          | ModelTypes["auth_user_active_publickey_mapping_mutation_response"]
          | undefined
        >
      | undefined;
    /** update data of the table: "auth.users" */
    update_auth_users?: ModelTypes["auth_users_mutation_response"] | undefined;
    /** update single row of the table: "auth.users" */
    update_auth_users_by_pk?: ModelTypes["auth_users"] | undefined;
    /** update multiples rows of table: "auth.users" */
    update_auth_users_many?:
      | Array<ModelTypes["auth_users_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "auth.xnft_preferences" */
    update_auth_xnft_preferences?:
      | ModelTypes["auth_xnft_preferences_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.xnft_preferences" */
    update_auth_xnft_preferences_by_pk?:
      | ModelTypes["auth_xnft_preferences"]
      | undefined;
    /** update multiples rows of table: "auth.xnft_preferences" */
    update_auth_xnft_preferences_many?:
      | Array<ModelTypes["auth_xnft_preferences_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "auth.xnft_secrets" */
    update_auth_xnft_secrets?:
      | ModelTypes["auth_xnft_secrets_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.xnft_secrets" */
    update_auth_xnft_secrets_by_pk?:
      | ModelTypes["auth_xnft_secrets"]
      | undefined;
    /** update multiples rows of table: "auth.xnft_secrets" */
    update_auth_xnft_secrets_many?:
      | Array<ModelTypes["auth_xnft_secrets_mutation_response"] | undefined>
      | undefined;
  };
  ["order_by"]: order_by;
  ["query_root"]: {
    /** fetch data from the table: "auth.collection_messages" */
    auth_collection_messages: Array<ModelTypes["auth_collection_messages"]>;
    /** fetch data from the table: "auth.collection_messages" using primary key columns */
    auth_collection_messages_by_pk?:
      | ModelTypes["auth_collection_messages"]
      | undefined;
    /** fetch data from the table: "auth.collections" */
    auth_collections: Array<ModelTypes["auth_collections"]>;
    /** fetch data from the table: "auth.collections" using primary key columns */
    auth_collections_by_pk?: ModelTypes["auth_collections"] | undefined;
    /** fetch data from the table: "auth.friend_requests" */
    auth_friend_requests: Array<ModelTypes["auth_friend_requests"]>;
    /** fetch data from the table: "auth.friend_requests" using primary key columns */
    auth_friend_requests_by_pk?: ModelTypes["auth_friend_requests"] | undefined;
    /** fetch data from the table: "auth.friendships" */
    auth_friendships: Array<ModelTypes["auth_friendships"]>;
    /** fetch aggregated fields from the table: "auth.friendships" */
    auth_friendships_aggregate: ModelTypes["auth_friendships_aggregate"];
    /** fetch data from the table: "auth.friendships" using primary key columns */
    auth_friendships_by_pk?: ModelTypes["auth_friendships"] | undefined;
    /** fetch data from the table: "auth.invitations" */
    auth_invitations: Array<ModelTypes["auth_invitations"]>;
    /** fetch data from the table: "auth.invitations" using primary key columns */
    auth_invitations_by_pk?: ModelTypes["auth_invitations"] | undefined;
    /** fetch data from the table: "auth.notification_cursor" */
    auth_notification_cursor: Array<ModelTypes["auth_notification_cursor"]>;
    /** fetch data from the table: "auth.notification_cursor" using primary key columns */
    auth_notification_cursor_by_pk?:
      | ModelTypes["auth_notification_cursor"]
      | undefined;
    /** fetch data from the table: "auth.notification_subscriptions" */
    auth_notification_subscriptions: Array<
      ModelTypes["auth_notification_subscriptions"]
    >;
    /** fetch data from the table: "auth.notification_subscriptions" using primary key columns */
    auth_notification_subscriptions_by_pk?:
      | ModelTypes["auth_notification_subscriptions"]
      | undefined;
    /** fetch data from the table: "auth.notifications" */
    auth_notifications: Array<ModelTypes["auth_notifications"]>;
    /** fetch aggregated fields from the table: "auth.notifications" */
    auth_notifications_aggregate: ModelTypes["auth_notifications_aggregate"];
    /** fetch data from the table: "auth.notifications" using primary key columns */
    auth_notifications_by_pk?: ModelTypes["auth_notifications"] | undefined;
    /** fetch data from the table: "auth.public_keys" */
    auth_public_keys: Array<ModelTypes["auth_public_keys"]>;
    /** fetch aggregated fields from the table: "auth.public_keys" */
    auth_public_keys_aggregate: ModelTypes["auth_public_keys_aggregate"];
    /** fetch data from the table: "auth.public_keys" using primary key columns */
    auth_public_keys_by_pk?: ModelTypes["auth_public_keys"] | undefined;
    /** fetch data from the table: "auth.stripe_onramp" */
    auth_stripe_onramp: Array<ModelTypes["auth_stripe_onramp"]>;
    /** fetch data from the table: "auth.stripe_onramp" using primary key columns */
    auth_stripe_onramp_by_pk?: ModelTypes["auth_stripe_onramp"] | undefined;
    /** fetch data from the table: "auth.user_active_publickey_mapping" */
    auth_user_active_publickey_mapping: Array<
      ModelTypes["auth_user_active_publickey_mapping"]
    >;
    /** fetch data from the table: "auth.user_active_publickey_mapping" using primary key columns */
    auth_user_active_publickey_mapping_by_pk?:
      | ModelTypes["auth_user_active_publickey_mapping"]
      | undefined;
    /** fetch data from the table: "auth.user_nfts" */
    auth_user_nfts: Array<ModelTypes["auth_user_nfts"]>;
    /** fetch aggregated fields from the table: "auth.user_nfts" */
    auth_user_nfts_aggregate: ModelTypes["auth_user_nfts_aggregate"];
    /** fetch data from the table: "auth.user_nfts" using primary key columns */
    auth_user_nfts_by_pk?: ModelTypes["auth_user_nfts"] | undefined;
    /** fetch data from the table: "auth.users" */
    auth_users: Array<ModelTypes["auth_users"]>;
    /** fetch aggregated fields from the table: "auth.users" */
    auth_users_aggregate: ModelTypes["auth_users_aggregate"];
    /** fetch data from the table: "auth.users" using primary key columns */
    auth_users_by_pk?: ModelTypes["auth_users"] | undefined;
    /** fetch data from the table: "auth.xnft_preferences" */
    auth_xnft_preferences: Array<ModelTypes["auth_xnft_preferences"]>;
    /** fetch data from the table: "auth.xnft_preferences" using primary key columns */
    auth_xnft_preferences_by_pk?:
      | ModelTypes["auth_xnft_preferences"]
      | undefined;
    /** fetch data from the table: "auth.xnft_secrets" */
    auth_xnft_secrets: Array<ModelTypes["auth_xnft_secrets"]>;
    /** fetch data from the table: "auth.xnft_secrets" using primary key columns */
    auth_xnft_secrets_by_pk?: ModelTypes["auth_xnft_secrets"] | undefined;
    /** fetch data from the table: "dropzone.distributors" */
    dropzone_distributors: Array<ModelTypes["dropzone_distributors"]>;
    /** fetch aggregated fields from the table: "dropzone.distributors" */
    dropzone_distributors_aggregate: ModelTypes["dropzone_distributors_aggregate"];
    /** fetch data from the table: "dropzone.distributors" using primary key columns */
    dropzone_distributors_by_pk?:
      | ModelTypes["dropzone_distributors"]
      | undefined;
    /** execute function "dropzone.user_dropzone_public_key" which returns "auth.public_keys" */
    dropzone_user_dropzone_public_key?:
      | ModelTypes["auth_public_keys"]
      | undefined;
    /** execute function "dropzone.user_dropzone_public_key" and query aggregates on result of table type "auth.public_keys" */
    dropzone_user_dropzone_public_key_aggregate: ModelTypes["auth_public_keys_aggregate"];
    /** fetch data from the table: "invitations" */
    invitations: Array<ModelTypes["invitations"]>;
    /** fetch aggregated fields from the table: "invitations" */
    invitations_aggregate: ModelTypes["invitations_aggregate"];
  };
  ["subscription_root"]: {
    /** fetch data from the table: "auth.collection_messages" */
    auth_collection_messages: Array<ModelTypes["auth_collection_messages"]>;
    /** fetch data from the table: "auth.collection_messages" using primary key columns */
    auth_collection_messages_by_pk?:
      | ModelTypes["auth_collection_messages"]
      | undefined;
    /** fetch data from the table in a streaming manner: "auth.collection_messages" */
    auth_collection_messages_stream: Array<
      ModelTypes["auth_collection_messages"]
    >;
    /** fetch data from the table: "auth.collections" */
    auth_collections: Array<ModelTypes["auth_collections"]>;
    /** fetch data from the table: "auth.collections" using primary key columns */
    auth_collections_by_pk?: ModelTypes["auth_collections"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.collections" */
    auth_collections_stream: Array<ModelTypes["auth_collections"]>;
    /** fetch data from the table: "auth.friend_requests" */
    auth_friend_requests: Array<ModelTypes["auth_friend_requests"]>;
    /** fetch data from the table: "auth.friend_requests" using primary key columns */
    auth_friend_requests_by_pk?: ModelTypes["auth_friend_requests"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.friend_requests" */
    auth_friend_requests_stream: Array<ModelTypes["auth_friend_requests"]>;
    /** fetch data from the table: "auth.friendships" */
    auth_friendships: Array<ModelTypes["auth_friendships"]>;
    /** fetch aggregated fields from the table: "auth.friendships" */
    auth_friendships_aggregate: ModelTypes["auth_friendships_aggregate"];
    /** fetch data from the table: "auth.friendships" using primary key columns */
    auth_friendships_by_pk?: ModelTypes["auth_friendships"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.friendships" */
    auth_friendships_stream: Array<ModelTypes["auth_friendships"]>;
    /** fetch data from the table: "auth.invitations" */
    auth_invitations: Array<ModelTypes["auth_invitations"]>;
    /** fetch data from the table: "auth.invitations" using primary key columns */
    auth_invitations_by_pk?: ModelTypes["auth_invitations"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.invitations" */
    auth_invitations_stream: Array<ModelTypes["auth_invitations"]>;
    /** fetch data from the table: "auth.notification_cursor" */
    auth_notification_cursor: Array<ModelTypes["auth_notification_cursor"]>;
    /** fetch data from the table: "auth.notification_cursor" using primary key columns */
    auth_notification_cursor_by_pk?:
      | ModelTypes["auth_notification_cursor"]
      | undefined;
    /** fetch data from the table in a streaming manner: "auth.notification_cursor" */
    auth_notification_cursor_stream: Array<
      ModelTypes["auth_notification_cursor"]
    >;
    /** fetch data from the table: "auth.notification_subscriptions" */
    auth_notification_subscriptions: Array<
      ModelTypes["auth_notification_subscriptions"]
    >;
    /** fetch data from the table: "auth.notification_subscriptions" using primary key columns */
    auth_notification_subscriptions_by_pk?:
      | ModelTypes["auth_notification_subscriptions"]
      | undefined;
    /** fetch data from the table in a streaming manner: "auth.notification_subscriptions" */
    auth_notification_subscriptions_stream: Array<
      ModelTypes["auth_notification_subscriptions"]
    >;
    /** fetch data from the table: "auth.notifications" */
    auth_notifications: Array<ModelTypes["auth_notifications"]>;
    /** fetch aggregated fields from the table: "auth.notifications" */
    auth_notifications_aggregate: ModelTypes["auth_notifications_aggregate"];
    /** fetch data from the table: "auth.notifications" using primary key columns */
    auth_notifications_by_pk?: ModelTypes["auth_notifications"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.notifications" */
    auth_notifications_stream: Array<ModelTypes["auth_notifications"]>;
    /** fetch data from the table: "auth.public_keys" */
    auth_public_keys: Array<ModelTypes["auth_public_keys"]>;
    /** fetch aggregated fields from the table: "auth.public_keys" */
    auth_public_keys_aggregate: ModelTypes["auth_public_keys_aggregate"];
    /** fetch data from the table: "auth.public_keys" using primary key columns */
    auth_public_keys_by_pk?: ModelTypes["auth_public_keys"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.public_keys" */
    auth_public_keys_stream: Array<ModelTypes["auth_public_keys"]>;
    /** fetch data from the table: "auth.stripe_onramp" */
    auth_stripe_onramp: Array<ModelTypes["auth_stripe_onramp"]>;
    /** fetch data from the table: "auth.stripe_onramp" using primary key columns */
    auth_stripe_onramp_by_pk?: ModelTypes["auth_stripe_onramp"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.stripe_onramp" */
    auth_stripe_onramp_stream: Array<ModelTypes["auth_stripe_onramp"]>;
    /** fetch data from the table: "auth.user_active_publickey_mapping" */
    auth_user_active_publickey_mapping: Array<
      ModelTypes["auth_user_active_publickey_mapping"]
    >;
    /** fetch data from the table: "auth.user_active_publickey_mapping" using primary key columns */
    auth_user_active_publickey_mapping_by_pk?:
      | ModelTypes["auth_user_active_publickey_mapping"]
      | undefined;
    /** fetch data from the table in a streaming manner: "auth.user_active_publickey_mapping" */
    auth_user_active_publickey_mapping_stream: Array<
      ModelTypes["auth_user_active_publickey_mapping"]
    >;
    /** fetch data from the table: "auth.user_nfts" */
    auth_user_nfts: Array<ModelTypes["auth_user_nfts"]>;
    /** fetch aggregated fields from the table: "auth.user_nfts" */
    auth_user_nfts_aggregate: ModelTypes["auth_user_nfts_aggregate"];
    /** fetch data from the table: "auth.user_nfts" using primary key columns */
    auth_user_nfts_by_pk?: ModelTypes["auth_user_nfts"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.user_nfts" */
    auth_user_nfts_stream: Array<ModelTypes["auth_user_nfts"]>;
    /** fetch data from the table: "auth.users" */
    auth_users: Array<ModelTypes["auth_users"]>;
    /** fetch aggregated fields from the table: "auth.users" */
    auth_users_aggregate: ModelTypes["auth_users_aggregate"];
    /** fetch data from the table: "auth.users" using primary key columns */
    auth_users_by_pk?: ModelTypes["auth_users"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.users" */
    auth_users_stream: Array<ModelTypes["auth_users"]>;
    /** fetch data from the table: "auth.xnft_preferences" */
    auth_xnft_preferences: Array<ModelTypes["auth_xnft_preferences"]>;
    /** fetch data from the table: "auth.xnft_preferences" using primary key columns */
    auth_xnft_preferences_by_pk?:
      | ModelTypes["auth_xnft_preferences"]
      | undefined;
    /** fetch data from the table in a streaming manner: "auth.xnft_preferences" */
    auth_xnft_preferences_stream: Array<ModelTypes["auth_xnft_preferences"]>;
    /** fetch data from the table: "auth.xnft_secrets" */
    auth_xnft_secrets: Array<ModelTypes["auth_xnft_secrets"]>;
    /** fetch data from the table: "auth.xnft_secrets" using primary key columns */
    auth_xnft_secrets_by_pk?: ModelTypes["auth_xnft_secrets"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.xnft_secrets" */
    auth_xnft_secrets_stream: Array<ModelTypes["auth_xnft_secrets"]>;
    /** fetch data from the table: "dropzone.distributors" */
    dropzone_distributors: Array<ModelTypes["dropzone_distributors"]>;
    /** fetch aggregated fields from the table: "dropzone.distributors" */
    dropzone_distributors_aggregate: ModelTypes["dropzone_distributors_aggregate"];
    /** fetch data from the table: "dropzone.distributors" using primary key columns */
    dropzone_distributors_by_pk?:
      | ModelTypes["dropzone_distributors"]
      | undefined;
    /** fetch data from the table in a streaming manner: "dropzone.distributors" */
    dropzone_distributors_stream: Array<ModelTypes["dropzone_distributors"]>;
    /** execute function "dropzone.user_dropzone_public_key" which returns "auth.public_keys" */
    dropzone_user_dropzone_public_key?:
      | ModelTypes["auth_public_keys"]
      | undefined;
    /** execute function "dropzone.user_dropzone_public_key" and query aggregates on result of table type "auth.public_keys" */
    dropzone_user_dropzone_public_key_aggregate: ModelTypes["auth_public_keys_aggregate"];
    /** fetch data from the table: "invitations" */
    invitations: Array<ModelTypes["invitations"]>;
    /** fetch aggregated fields from the table: "invitations" */
    invitations_aggregate: ModelTypes["invitations_aggregate"];
    /** fetch data from the table in a streaming manner: "invitations" */
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
  ["users_scalar"]: any;
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
  /** columns and relationships of "auth.collection_messages" */
  ["auth_collection_messages"]: {
    __typename: "auth_collection_messages";
    collection_id: string;
    last_read_message_id: string;
    uuid: string;
  };
  /** Boolean expression to filter rows from the table "auth.collection_messages". All fields are combined with a logical 'AND'. */
  ["auth_collection_messages_bool_exp"]: {
    _and?: Array<GraphQLTypes["auth_collection_messages_bool_exp"]> | undefined;
    _not?: GraphQLTypes["auth_collection_messages_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["auth_collection_messages_bool_exp"]> | undefined;
    collection_id?: GraphQLTypes["String_comparison_exp"] | undefined;
    last_read_message_id?: GraphQLTypes["String_comparison_exp"] | undefined;
    uuid?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.collection_messages" */
  ["auth_collection_messages_constraint"]: auth_collection_messages_constraint;
  /** input type for inserting data into table "auth.collection_messages" */
  ["auth_collection_messages_insert_input"]: {
    collection_id?: string | undefined;
    last_read_message_id?: string | undefined;
    uuid?: string | undefined;
  };
  /** response of any mutation on the table "auth.collection_messages" */
  ["auth_collection_messages_mutation_response"]: {
    __typename: "auth_collection_messages_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_collection_messages"]>;
  };
  /** on_conflict condition type for table "auth.collection_messages" */
  ["auth_collection_messages_on_conflict"]: {
    constraint: GraphQLTypes["auth_collection_messages_constraint"];
    update_columns: Array<
      GraphQLTypes["auth_collection_messages_update_column"]
    >;
    where?: GraphQLTypes["auth_collection_messages_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.collection_messages". */
  ["auth_collection_messages_order_by"]: {
    collection_id?: GraphQLTypes["order_by"] | undefined;
    last_read_message_id?: GraphQLTypes["order_by"] | undefined;
    uuid?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.collection_messages */
  ["auth_collection_messages_pk_columns_input"]: {
    collection_id: string;
    uuid: string;
  };
  /** select columns of table "auth.collection_messages" */
  ["auth_collection_messages_select_column"]: auth_collection_messages_select_column;
  /** input type for updating data in table "auth.collection_messages" */
  ["auth_collection_messages_set_input"]: {
    collection_id?: string | undefined;
    last_read_message_id?: string | undefined;
    uuid?: string | undefined;
  };
  /** Streaming cursor of the table "auth_collection_messages" */
  ["auth_collection_messages_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["auth_collection_messages_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_collection_messages_stream_cursor_value_input"]: {
    collection_id?: string | undefined;
    last_read_message_id?: string | undefined;
    uuid?: string | undefined;
  };
  /** update columns of table "auth.collection_messages" */
  ["auth_collection_messages_update_column"]: auth_collection_messages_update_column;
  ["auth_collection_messages_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["auth_collection_messages_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["auth_collection_messages_bool_exp"];
  };
  /** columns and relationships of "auth.collections" */
  ["auth_collections"]: {
    __typename: "auth_collections";
    collection_id?: string | undefined;
    id: number;
    last_message?: string | undefined;
    last_message_timestamp?: GraphQLTypes["timestamptz"] | undefined;
    last_message_uuid?: string | undefined;
    type: string;
  };
  /** Boolean expression to filter rows from the table "auth.collections". All fields are combined with a logical 'AND'. */
  ["auth_collections_bool_exp"]: {
    _and?: Array<GraphQLTypes["auth_collections_bool_exp"]> | undefined;
    _not?: GraphQLTypes["auth_collections_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["auth_collections_bool_exp"]> | undefined;
    collection_id?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    last_message?: GraphQLTypes["String_comparison_exp"] | undefined;
    last_message_timestamp?:
      | GraphQLTypes["timestamptz_comparison_exp"]
      | undefined;
    last_message_uuid?: GraphQLTypes["String_comparison_exp"] | undefined;
    type?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.collections" */
  ["auth_collections_constraint"]: auth_collections_constraint;
  /** input type for incrementing numeric columns in table "auth.collections" */
  ["auth_collections_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "auth.collections" */
  ["auth_collections_insert_input"]: {
    collection_id?: string | undefined;
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_timestamp?: GraphQLTypes["timestamptz"] | undefined;
    last_message_uuid?: string | undefined;
    type?: string | undefined;
  };
  /** response of any mutation on the table "auth.collections" */
  ["auth_collections_mutation_response"]: {
    __typename: "auth_collections_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_collections"]>;
  };
  /** on_conflict condition type for table "auth.collections" */
  ["auth_collections_on_conflict"]: {
    constraint: GraphQLTypes["auth_collections_constraint"];
    update_columns: Array<GraphQLTypes["auth_collections_update_column"]>;
    where?: GraphQLTypes["auth_collections_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.collections". */
  ["auth_collections_order_by"]: {
    collection_id?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    last_message?: GraphQLTypes["order_by"] | undefined;
    last_message_timestamp?: GraphQLTypes["order_by"] | undefined;
    last_message_uuid?: GraphQLTypes["order_by"] | undefined;
    type?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.collections */
  ["auth_collections_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "auth.collections" */
  ["auth_collections_select_column"]: auth_collections_select_column;
  /** input type for updating data in table "auth.collections" */
  ["auth_collections_set_input"]: {
    collection_id?: string | undefined;
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_timestamp?: GraphQLTypes["timestamptz"] | undefined;
    last_message_uuid?: string | undefined;
    type?: string | undefined;
  };
  /** Streaming cursor of the table "auth_collections" */
  ["auth_collections_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["auth_collections_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_collections_stream_cursor_value_input"]: {
    collection_id?: string | undefined;
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_timestamp?: GraphQLTypes["timestamptz"] | undefined;
    last_message_uuid?: string | undefined;
    type?: string | undefined;
  };
  /** update columns of table "auth.collections" */
  ["auth_collections_update_column"]: auth_collections_update_column;
  ["auth_collections_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["auth_collections_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["auth_collections_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["auth_collections_bool_exp"];
  };
  /** columns and relationships of "auth.friend_requests" */
  ["auth_friend_requests"]: {
    __typename: "auth_friend_requests";
    from: string;
    id: number;
    to: string;
  };
  /** Boolean expression to filter rows from the table "auth.friend_requests". All fields are combined with a logical 'AND'. */
  ["auth_friend_requests_bool_exp"]: {
    _and?: Array<GraphQLTypes["auth_friend_requests_bool_exp"]> | undefined;
    _not?: GraphQLTypes["auth_friend_requests_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["auth_friend_requests_bool_exp"]> | undefined;
    from?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    to?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.friend_requests" */
  ["auth_friend_requests_constraint"]: auth_friend_requests_constraint;
  /** input type for inserting data into table "auth.friend_requests" */
  ["auth_friend_requests_insert_input"]: {
    from?: string | undefined;
    id?: number | undefined;
    to?: string | undefined;
  };
  /** response of any mutation on the table "auth.friend_requests" */
  ["auth_friend_requests_mutation_response"]: {
    __typename: "auth_friend_requests_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_friend_requests"]>;
  };
  /** on_conflict condition type for table "auth.friend_requests" */
  ["auth_friend_requests_on_conflict"]: {
    constraint: GraphQLTypes["auth_friend_requests_constraint"];
    update_columns: Array<GraphQLTypes["auth_friend_requests_update_column"]>;
    where?: GraphQLTypes["auth_friend_requests_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.friend_requests". */
  ["auth_friend_requests_order_by"]: {
    from?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    to?: GraphQLTypes["order_by"] | undefined;
  };
  /** select columns of table "auth.friend_requests" */
  ["auth_friend_requests_select_column"]: auth_friend_requests_select_column;
  /** Streaming cursor of the table "auth_friend_requests" */
  ["auth_friend_requests_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["auth_friend_requests_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_friend_requests_stream_cursor_value_input"]: {
    from?: string | undefined;
    id?: number | undefined;
    to?: string | undefined;
  };
  /** placeholder for update columns of table "auth.friend_requests" (current role has no relevant permissions) */
  ["auth_friend_requests_update_column"]: auth_friend_requests_update_column;
  /** columns and relationships of "auth.friendships" */
  ["auth_friendships"]: {
    __typename: "auth_friendships";
    are_friends: boolean;
    id: number;
    last_message?: string | undefined;
    last_message_client_uuid?: string | undefined;
    last_message_sender?: string | undefined;
    last_message_timestamp?: GraphQLTypes["timestamptz"] | undefined;
    user1: string;
    user1_blocked_user2: boolean;
    user1_interacted: boolean;
    user1_last_read_message_id?: string | undefined;
    user1_spam_user2: boolean;
    user2: string;
    user2_blocked_user1: boolean;
    user2_interacted: boolean;
    user2_last_read_message_id?: string | undefined;
    user2_spam_user1: boolean;
  };
  /** aggregated selection of "auth.friendships" */
  ["auth_friendships_aggregate"]: {
    __typename: "auth_friendships_aggregate";
    aggregate?: GraphQLTypes["auth_friendships_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["auth_friendships"]>;
  };
  /** aggregate fields of "auth.friendships" */
  ["auth_friendships_aggregate_fields"]: {
    __typename: "auth_friendships_aggregate_fields";
    avg?: GraphQLTypes["auth_friendships_avg_fields"] | undefined;
    count: number;
    max?: GraphQLTypes["auth_friendships_max_fields"] | undefined;
    min?: GraphQLTypes["auth_friendships_min_fields"] | undefined;
    stddev?: GraphQLTypes["auth_friendships_stddev_fields"] | undefined;
    stddev_pop?: GraphQLTypes["auth_friendships_stddev_pop_fields"] | undefined;
    stddev_samp?:
      | GraphQLTypes["auth_friendships_stddev_samp_fields"]
      | undefined;
    sum?: GraphQLTypes["auth_friendships_sum_fields"] | undefined;
    var_pop?: GraphQLTypes["auth_friendships_var_pop_fields"] | undefined;
    var_samp?: GraphQLTypes["auth_friendships_var_samp_fields"] | undefined;
    variance?: GraphQLTypes["auth_friendships_variance_fields"] | undefined;
  };
  /** aggregate avg on columns */
  ["auth_friendships_avg_fields"]: {
    __typename: "auth_friendships_avg_fields";
    id?: number | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.friendships". All fields are combined with a logical 'AND'. */
  ["auth_friendships_bool_exp"]: {
    _and?: Array<GraphQLTypes["auth_friendships_bool_exp"]> | undefined;
    _not?: GraphQLTypes["auth_friendships_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["auth_friendships_bool_exp"]> | undefined;
    are_friends?: GraphQLTypes["Boolean_comparison_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    last_message?: GraphQLTypes["String_comparison_exp"] | undefined;
    last_message_client_uuid?:
      | GraphQLTypes["String_comparison_exp"]
      | undefined;
    last_message_sender?: GraphQLTypes["String_comparison_exp"] | undefined;
    last_message_timestamp?:
      | GraphQLTypes["timestamptz_comparison_exp"]
      | undefined;
    user1?: GraphQLTypes["String_comparison_exp"] | undefined;
    user1_blocked_user2?: GraphQLTypes["Boolean_comparison_exp"] | undefined;
    user1_interacted?: GraphQLTypes["Boolean_comparison_exp"] | undefined;
    user1_last_read_message_id?:
      | GraphQLTypes["String_comparison_exp"]
      | undefined;
    user1_spam_user2?: GraphQLTypes["Boolean_comparison_exp"] | undefined;
    user2?: GraphQLTypes["String_comparison_exp"] | undefined;
    user2_blocked_user1?: GraphQLTypes["Boolean_comparison_exp"] | undefined;
    user2_interacted?: GraphQLTypes["Boolean_comparison_exp"] | undefined;
    user2_last_read_message_id?:
      | GraphQLTypes["String_comparison_exp"]
      | undefined;
    user2_spam_user1?: GraphQLTypes["Boolean_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.friendships" */
  ["auth_friendships_constraint"]: auth_friendships_constraint;
  /** input type for incrementing numeric columns in table "auth.friendships" */
  ["auth_friendships_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "auth.friendships" */
  ["auth_friendships_insert_input"]: {
    are_friends?: boolean | undefined;
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_client_uuid?: string | undefined;
    last_message_sender?: string | undefined;
    last_message_timestamp?: GraphQLTypes["timestamptz"] | undefined;
    user1?: string | undefined;
    user1_blocked_user2?: boolean | undefined;
    user1_interacted?: boolean | undefined;
    user1_last_read_message_id?: string | undefined;
    user1_spam_user2?: boolean | undefined;
    user2?: string | undefined;
    user2_blocked_user1?: boolean | undefined;
    user2_interacted?: boolean | undefined;
    user2_last_read_message_id?: string | undefined;
    user2_spam_user1?: boolean | undefined;
  };
  /** aggregate max on columns */
  ["auth_friendships_max_fields"]: {
    __typename: "auth_friendships_max_fields";
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_client_uuid?: string | undefined;
    last_message_sender?: string | undefined;
    last_message_timestamp?: GraphQLTypes["timestamptz"] | undefined;
    user1?: string | undefined;
    user1_last_read_message_id?: string | undefined;
    user2?: string | undefined;
    user2_last_read_message_id?: string | undefined;
  };
  /** aggregate min on columns */
  ["auth_friendships_min_fields"]: {
    __typename: "auth_friendships_min_fields";
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_client_uuid?: string | undefined;
    last_message_sender?: string | undefined;
    last_message_timestamp?: GraphQLTypes["timestamptz"] | undefined;
    user1?: string | undefined;
    user1_last_read_message_id?: string | undefined;
    user2?: string | undefined;
    user2_last_read_message_id?: string | undefined;
  };
  /** response of any mutation on the table "auth.friendships" */
  ["auth_friendships_mutation_response"]: {
    __typename: "auth_friendships_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_friendships"]>;
  };
  /** on_conflict condition type for table "auth.friendships" */
  ["auth_friendships_on_conflict"]: {
    constraint: GraphQLTypes["auth_friendships_constraint"];
    update_columns: Array<GraphQLTypes["auth_friendships_update_column"]>;
    where?: GraphQLTypes["auth_friendships_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.friendships". */
  ["auth_friendships_order_by"]: {
    are_friends?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    last_message?: GraphQLTypes["order_by"] | undefined;
    last_message_client_uuid?: GraphQLTypes["order_by"] | undefined;
    last_message_sender?: GraphQLTypes["order_by"] | undefined;
    last_message_timestamp?: GraphQLTypes["order_by"] | undefined;
    user1?: GraphQLTypes["order_by"] | undefined;
    user1_blocked_user2?: GraphQLTypes["order_by"] | undefined;
    user1_interacted?: GraphQLTypes["order_by"] | undefined;
    user1_last_read_message_id?: GraphQLTypes["order_by"] | undefined;
    user1_spam_user2?: GraphQLTypes["order_by"] | undefined;
    user2?: GraphQLTypes["order_by"] | undefined;
    user2_blocked_user1?: GraphQLTypes["order_by"] | undefined;
    user2_interacted?: GraphQLTypes["order_by"] | undefined;
    user2_last_read_message_id?: GraphQLTypes["order_by"] | undefined;
    user2_spam_user1?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.friendships */
  ["auth_friendships_pk_columns_input"]: {
    user1: string;
    user2: string;
  };
  /** select columns of table "auth.friendships" */
  ["auth_friendships_select_column"]: auth_friendships_select_column;
  /** input type for updating data in table "auth.friendships" */
  ["auth_friendships_set_input"]: {
    are_friends?: boolean | undefined;
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_client_uuid?: string | undefined;
    last_message_sender?: string | undefined;
    last_message_timestamp?: GraphQLTypes["timestamptz"] | undefined;
    user1?: string | undefined;
    user1_blocked_user2?: boolean | undefined;
    user1_interacted?: boolean | undefined;
    user1_last_read_message_id?: string | undefined;
    user1_spam_user2?: boolean | undefined;
    user2?: string | undefined;
    user2_blocked_user1?: boolean | undefined;
    user2_interacted?: boolean | undefined;
    user2_last_read_message_id?: string | undefined;
    user2_spam_user1?: boolean | undefined;
  };
  /** aggregate stddev on columns */
  ["auth_friendships_stddev_fields"]: {
    __typename: "auth_friendships_stddev_fields";
    id?: number | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["auth_friendships_stddev_pop_fields"]: {
    __typename: "auth_friendships_stddev_pop_fields";
    id?: number | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["auth_friendships_stddev_samp_fields"]: {
    __typename: "auth_friendships_stddev_samp_fields";
    id?: number | undefined;
  };
  /** Streaming cursor of the table "auth_friendships" */
  ["auth_friendships_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["auth_friendships_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_friendships_stream_cursor_value_input"]: {
    are_friends?: boolean | undefined;
    id?: number | undefined;
    last_message?: string | undefined;
    last_message_client_uuid?: string | undefined;
    last_message_sender?: string | undefined;
    last_message_timestamp?: GraphQLTypes["timestamptz"] | undefined;
    user1?: string | undefined;
    user1_blocked_user2?: boolean | undefined;
    user1_interacted?: boolean | undefined;
    user1_last_read_message_id?: string | undefined;
    user1_spam_user2?: boolean | undefined;
    user2?: string | undefined;
    user2_blocked_user1?: boolean | undefined;
    user2_interacted?: boolean | undefined;
    user2_last_read_message_id?: string | undefined;
    user2_spam_user1?: boolean | undefined;
  };
  /** aggregate sum on columns */
  ["auth_friendships_sum_fields"]: {
    __typename: "auth_friendships_sum_fields";
    id?: number | undefined;
  };
  /** update columns of table "auth.friendships" */
  ["auth_friendships_update_column"]: auth_friendships_update_column;
  ["auth_friendships_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["auth_friendships_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["auth_friendships_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["auth_friendships_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["auth_friendships_var_pop_fields"]: {
    __typename: "auth_friendships_var_pop_fields";
    id?: number | undefined;
  };
  /** aggregate var_samp on columns */
  ["auth_friendships_var_samp_fields"]: {
    __typename: "auth_friendships_var_samp_fields";
    id?: number | undefined;
  };
  /** aggregate variance on columns */
  ["auth_friendships_variance_fields"]: {
    __typename: "auth_friendships_variance_fields";
    id?: number | undefined;
  };
  /** ids are beta invite codes */
  ["auth_invitations"]: {
    __typename: "auth_invitations";
    created_at: GraphQLTypes["timestamptz"];
    data?: GraphQLTypes["jsonb"] | undefined;
    id: GraphQLTypes["uuid"];
    /** An object relationship */
    user?: GraphQLTypes["auth_users"] | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.invitations". All fields are combined with a logical 'AND'. */
  ["auth_invitations_bool_exp"]: {
    _and?: Array<GraphQLTypes["auth_invitations_bool_exp"]> | undefined;
    _not?: GraphQLTypes["auth_invitations_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["auth_invitations_bool_exp"]> | undefined;
    created_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    data?: GraphQLTypes["jsonb_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    user?: GraphQLTypes["auth_users_bool_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.invitations" */
  ["auth_invitations_constraint"]: auth_invitations_constraint;
  /** input type for inserting data into table "auth.invitations" */
  ["auth_invitations_insert_input"]: {
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    data?: GraphQLTypes["jsonb"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    user?: GraphQLTypes["auth_users_obj_rel_insert_input"] | undefined;
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
    user?: GraphQLTypes["auth_users_order_by"] | undefined;
  };
  /** select columns of table "auth.invitations" */
  ["auth_invitations_select_column"]: auth_invitations_select_column;
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
  /** placeholder for update columns of table "auth.invitations" (current role has no relevant permissions) */
  ["auth_invitations_update_column"]: auth_invitations_update_column;
  /** columns and relationships of "auth.notification_cursor" */
  ["auth_notification_cursor"]: {
    __typename: "auth_notification_cursor";
    last_read_notificaiton: number;
    uuid: string;
  };
  /** Boolean expression to filter rows from the table "auth.notification_cursor". All fields are combined with a logical 'AND'. */
  ["auth_notification_cursor_bool_exp"]: {
    _and?: Array<GraphQLTypes["auth_notification_cursor_bool_exp"]> | undefined;
    _not?: GraphQLTypes["auth_notification_cursor_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["auth_notification_cursor_bool_exp"]> | undefined;
    last_read_notificaiton?: GraphQLTypes["Int_comparison_exp"] | undefined;
    uuid?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.notification_cursor" */
  ["auth_notification_cursor_constraint"]: auth_notification_cursor_constraint;
  /** input type for incrementing numeric columns in table "auth.notification_cursor" */
  ["auth_notification_cursor_inc_input"]: {
    last_read_notificaiton?: number | undefined;
  };
  /** input type for inserting data into table "auth.notification_cursor" */
  ["auth_notification_cursor_insert_input"]: {
    last_read_notificaiton?: number | undefined;
    uuid?: string | undefined;
  };
  /** response of any mutation on the table "auth.notification_cursor" */
  ["auth_notification_cursor_mutation_response"]: {
    __typename: "auth_notification_cursor_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_notification_cursor"]>;
  };
  /** on_conflict condition type for table "auth.notification_cursor" */
  ["auth_notification_cursor_on_conflict"]: {
    constraint: GraphQLTypes["auth_notification_cursor_constraint"];
    update_columns: Array<
      GraphQLTypes["auth_notification_cursor_update_column"]
    >;
    where?: GraphQLTypes["auth_notification_cursor_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.notification_cursor". */
  ["auth_notification_cursor_order_by"]: {
    last_read_notificaiton?: GraphQLTypes["order_by"] | undefined;
    uuid?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.notification_cursor */
  ["auth_notification_cursor_pk_columns_input"]: {
    uuid: string;
  };
  /** select columns of table "auth.notification_cursor" */
  ["auth_notification_cursor_select_column"]: auth_notification_cursor_select_column;
  /** input type for updating data in table "auth.notification_cursor" */
  ["auth_notification_cursor_set_input"]: {
    last_read_notificaiton?: number | undefined;
    uuid?: string | undefined;
  };
  /** Streaming cursor of the table "auth_notification_cursor" */
  ["auth_notification_cursor_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["auth_notification_cursor_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_notification_cursor_stream_cursor_value_input"]: {
    last_read_notificaiton?: number | undefined;
    uuid?: string | undefined;
  };
  /** update columns of table "auth.notification_cursor" */
  ["auth_notification_cursor_update_column"]: auth_notification_cursor_update_column;
  ["auth_notification_cursor_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["auth_notification_cursor_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["auth_notification_cursor_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["auth_notification_cursor_bool_exp"];
  };
  /** columns and relationships of "auth.notification_subscriptions" */
  ["auth_notification_subscriptions"]: {
    __typename: "auth_notification_subscriptions";
    auth: string;
    endpoint: string;
    expirationTime: string;
    id: number;
    p256dh: string;
    public_key: string;
    username: string;
    uuid: string;
  };
  /** Boolean expression to filter rows from the table "auth.notification_subscriptions". All fields are combined with a logical 'AND'. */
  ["auth_notification_subscriptions_bool_exp"]: {
    _and?:
      | Array<GraphQLTypes["auth_notification_subscriptions_bool_exp"]>
      | undefined;
    _not?: GraphQLTypes["auth_notification_subscriptions_bool_exp"] | undefined;
    _or?:
      | Array<GraphQLTypes["auth_notification_subscriptions_bool_exp"]>
      | undefined;
    auth?: GraphQLTypes["String_comparison_exp"] | undefined;
    endpoint?: GraphQLTypes["String_comparison_exp"] | undefined;
    expirationTime?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    p256dh?: GraphQLTypes["String_comparison_exp"] | undefined;
    public_key?: GraphQLTypes["String_comparison_exp"] | undefined;
    username?: GraphQLTypes["String_comparison_exp"] | undefined;
    uuid?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_constraint"]: auth_notification_subscriptions_constraint;
  /** input type for incrementing numeric columns in table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_insert_input"]: {
    auth?: string | undefined;
    endpoint?: string | undefined;
    expirationTime?: string | undefined;
    id?: number | undefined;
    p256dh?: string | undefined;
    public_key?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
  };
  /** response of any mutation on the table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_mutation_response"]: {
    __typename: "auth_notification_subscriptions_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_notification_subscriptions"]>;
  };
  /** on_conflict condition type for table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_on_conflict"]: {
    constraint: GraphQLTypes["auth_notification_subscriptions_constraint"];
    update_columns: Array<
      GraphQLTypes["auth_notification_subscriptions_update_column"]
    >;
    where?:
      | GraphQLTypes["auth_notification_subscriptions_bool_exp"]
      | undefined;
  };
  /** Ordering options when selecting data from "auth.notification_subscriptions". */
  ["auth_notification_subscriptions_order_by"]: {
    auth?: GraphQLTypes["order_by"] | undefined;
    endpoint?: GraphQLTypes["order_by"] | undefined;
    expirationTime?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    p256dh?: GraphQLTypes["order_by"] | undefined;
    public_key?: GraphQLTypes["order_by"] | undefined;
    username?: GraphQLTypes["order_by"] | undefined;
    uuid?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.notification_subscriptions */
  ["auth_notification_subscriptions_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_select_column"]: auth_notification_subscriptions_select_column;
  /** input type for updating data in table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_set_input"]: {
    auth?: string | undefined;
    endpoint?: string | undefined;
    expirationTime?: string | undefined;
    id?: number | undefined;
    p256dh?: string | undefined;
    public_key?: string | undefined;
    username?: string | undefined;
  };
  /** Streaming cursor of the table "auth_notification_subscriptions" */
  ["auth_notification_subscriptions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["auth_notification_subscriptions_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_notification_subscriptions_stream_cursor_value_input"]: {
    auth?: string | undefined;
    endpoint?: string | undefined;
    expirationTime?: string | undefined;
    id?: number | undefined;
    p256dh?: string | undefined;
    public_key?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
  };
  /** update columns of table "auth.notification_subscriptions" */
  ["auth_notification_subscriptions_update_column"]: auth_notification_subscriptions_update_column;
  ["auth_notification_subscriptions_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | GraphQLTypes["auth_notification_subscriptions_inc_input"]
      | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | GraphQLTypes["auth_notification_subscriptions_set_input"]
      | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["auth_notification_subscriptions_bool_exp"];
  };
  /** columns and relationships of "auth.notifications" */
  ["auth_notifications"]: {
    __typename: "auth_notifications";
    body: string;
    id: number;
    image: string;
    timestamp?: GraphQLTypes["timestamptz"] | undefined;
    title: string;
    username: string;
    uuid: string;
    viewed?: boolean | undefined;
    xnft_id: string;
  };
  /** aggregated selection of "auth.notifications" */
  ["auth_notifications_aggregate"]: {
    __typename: "auth_notifications_aggregate";
    aggregate?: GraphQLTypes["auth_notifications_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["auth_notifications"]>;
  };
  /** aggregate fields of "auth.notifications" */
  ["auth_notifications_aggregate_fields"]: {
    __typename: "auth_notifications_aggregate_fields";
    avg?: GraphQLTypes["auth_notifications_avg_fields"] | undefined;
    count: number;
    max?: GraphQLTypes["auth_notifications_max_fields"] | undefined;
    min?: GraphQLTypes["auth_notifications_min_fields"] | undefined;
    stddev?: GraphQLTypes["auth_notifications_stddev_fields"] | undefined;
    stddev_pop?:
      | GraphQLTypes["auth_notifications_stddev_pop_fields"]
      | undefined;
    stddev_samp?:
      | GraphQLTypes["auth_notifications_stddev_samp_fields"]
      | undefined;
    sum?: GraphQLTypes["auth_notifications_sum_fields"] | undefined;
    var_pop?: GraphQLTypes["auth_notifications_var_pop_fields"] | undefined;
    var_samp?: GraphQLTypes["auth_notifications_var_samp_fields"] | undefined;
    variance?: GraphQLTypes["auth_notifications_variance_fields"] | undefined;
  };
  /** aggregate avg on columns */
  ["auth_notifications_avg_fields"]: {
    __typename: "auth_notifications_avg_fields";
    id?: number | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.notifications". All fields are combined with a logical 'AND'. */
  ["auth_notifications_bool_exp"]: {
    _and?: Array<GraphQLTypes["auth_notifications_bool_exp"]> | undefined;
    _not?: GraphQLTypes["auth_notifications_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["auth_notifications_bool_exp"]> | undefined;
    body?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    image?: GraphQLTypes["String_comparison_exp"] | undefined;
    timestamp?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    title?: GraphQLTypes["String_comparison_exp"] | undefined;
    username?: GraphQLTypes["String_comparison_exp"] | undefined;
    uuid?: GraphQLTypes["String_comparison_exp"] | undefined;
    viewed?: GraphQLTypes["Boolean_comparison_exp"] | undefined;
    xnft_id?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.notifications" */
  ["auth_notifications_constraint"]: auth_notifications_constraint;
  /** input type for incrementing numeric columns in table "auth.notifications" */
  ["auth_notifications_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "auth.notifications" */
  ["auth_notifications_insert_input"]: {
    body?: string | undefined;
    id?: number | undefined;
    image?: string | undefined;
    timestamp?: GraphQLTypes["timestamptz"] | undefined;
    title?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    viewed?: boolean | undefined;
    xnft_id?: string | undefined;
  };
  /** aggregate max on columns */
  ["auth_notifications_max_fields"]: {
    __typename: "auth_notifications_max_fields";
    body?: string | undefined;
    id?: number | undefined;
    image?: string | undefined;
    timestamp?: GraphQLTypes["timestamptz"] | undefined;
    title?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    xnft_id?: string | undefined;
  };
  /** aggregate min on columns */
  ["auth_notifications_min_fields"]: {
    __typename: "auth_notifications_min_fields";
    body?: string | undefined;
    id?: number | undefined;
    image?: string | undefined;
    timestamp?: GraphQLTypes["timestamptz"] | undefined;
    title?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    xnft_id?: string | undefined;
  };
  /** response of any mutation on the table "auth.notifications" */
  ["auth_notifications_mutation_response"]: {
    __typename: "auth_notifications_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_notifications"]>;
  };
  /** on_conflict condition type for table "auth.notifications" */
  ["auth_notifications_on_conflict"]: {
    constraint: GraphQLTypes["auth_notifications_constraint"];
    update_columns: Array<GraphQLTypes["auth_notifications_update_column"]>;
    where?: GraphQLTypes["auth_notifications_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.notifications". */
  ["auth_notifications_order_by"]: {
    body?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    image?: GraphQLTypes["order_by"] | undefined;
    timestamp?: GraphQLTypes["order_by"] | undefined;
    title?: GraphQLTypes["order_by"] | undefined;
    username?: GraphQLTypes["order_by"] | undefined;
    uuid?: GraphQLTypes["order_by"] | undefined;
    viewed?: GraphQLTypes["order_by"] | undefined;
    xnft_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.notifications */
  ["auth_notifications_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "auth.notifications" */
  ["auth_notifications_select_column"]: auth_notifications_select_column;
  /** input type for updating data in table "auth.notifications" */
  ["auth_notifications_set_input"]: {
    body?: string | undefined;
    id?: number | undefined;
    image?: string | undefined;
    title?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    viewed?: boolean | undefined;
    xnft_id?: string | undefined;
  };
  /** aggregate stddev on columns */
  ["auth_notifications_stddev_fields"]: {
    __typename: "auth_notifications_stddev_fields";
    id?: number | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["auth_notifications_stddev_pop_fields"]: {
    __typename: "auth_notifications_stddev_pop_fields";
    id?: number | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["auth_notifications_stddev_samp_fields"]: {
    __typename: "auth_notifications_stddev_samp_fields";
    id?: number | undefined;
  };
  /** Streaming cursor of the table "auth_notifications" */
  ["auth_notifications_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["auth_notifications_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_notifications_stream_cursor_value_input"]: {
    body?: string | undefined;
    id?: number | undefined;
    image?: string | undefined;
    timestamp?: GraphQLTypes["timestamptz"] | undefined;
    title?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    viewed?: boolean | undefined;
    xnft_id?: string | undefined;
  };
  /** aggregate sum on columns */
  ["auth_notifications_sum_fields"]: {
    __typename: "auth_notifications_sum_fields";
    id?: number | undefined;
  };
  /** update columns of table "auth.notifications" */
  ["auth_notifications_update_column"]: auth_notifications_update_column;
  ["auth_notifications_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["auth_notifications_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["auth_notifications_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["auth_notifications_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["auth_notifications_var_pop_fields"]: {
    __typename: "auth_notifications_var_pop_fields";
    id?: number | undefined;
  };
  /** aggregate var_samp on columns */
  ["auth_notifications_var_samp_fields"]: {
    __typename: "auth_notifications_var_samp_fields";
    id?: number | undefined;
  };
  /** aggregate variance on columns */
  ["auth_notifications_variance_fields"]: {
    __typename: "auth_notifications_variance_fields";
    id?: number | undefined;
  };
  /** columns and relationships of "auth.public_keys" */
  ["auth_public_keys"]: {
    __typename: "auth_public_keys";
    blockchain: string;
    created_at: GraphQLTypes["timestamptz"];
    id: number;
    public_key: string;
    /** An object relationship */
    user?: GraphQLTypes["auth_users"] | undefined;
    /** An array relationship */
    user_active_publickey_mappings: Array<
      GraphQLTypes["auth_user_active_publickey_mapping"]
    >;
    user_id?: GraphQLTypes["uuid"] | undefined;
    /** An array relationship */
    user_nfts: Array<GraphQLTypes["auth_user_nfts"]>;
    /** An aggregate relationship */
    user_nfts_aggregate: GraphQLTypes["auth_user_nfts_aggregate"];
  };
  /** aggregated selection of "auth.public_keys" */
  ["auth_public_keys_aggregate"]: {
    __typename: "auth_public_keys_aggregate";
    aggregate?: GraphQLTypes["auth_public_keys_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["auth_public_keys"]>;
  };
  ["auth_public_keys_aggregate_bool_exp"]: {
    count?:
      | GraphQLTypes["auth_public_keys_aggregate_bool_exp_count"]
      | undefined;
  };
  ["auth_public_keys_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<GraphQLTypes["auth_public_keys_select_column"]>
      | undefined;
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["auth_public_keys_bool_exp"] | undefined;
    predicate: GraphQLTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "auth.public_keys" */
  ["auth_public_keys_aggregate_fields"]: {
    __typename: "auth_public_keys_aggregate_fields";
    avg?: GraphQLTypes["auth_public_keys_avg_fields"] | undefined;
    count: number;
    max?: GraphQLTypes["auth_public_keys_max_fields"] | undefined;
    min?: GraphQLTypes["auth_public_keys_min_fields"] | undefined;
    stddev?: GraphQLTypes["auth_public_keys_stddev_fields"] | undefined;
    stddev_pop?: GraphQLTypes["auth_public_keys_stddev_pop_fields"] | undefined;
    stddev_samp?:
      | GraphQLTypes["auth_public_keys_stddev_samp_fields"]
      | undefined;
    sum?: GraphQLTypes["auth_public_keys_sum_fields"] | undefined;
    var_pop?: GraphQLTypes["auth_public_keys_var_pop_fields"] | undefined;
    var_samp?: GraphQLTypes["auth_public_keys_var_samp_fields"] | undefined;
    variance?: GraphQLTypes["auth_public_keys_variance_fields"] | undefined;
  };
  /** order by aggregate values of table "auth.public_keys" */
  ["auth_public_keys_aggregate_order_by"]: {
    avg?: GraphQLTypes["auth_public_keys_avg_order_by"] | undefined;
    count?: GraphQLTypes["order_by"] | undefined;
    max?: GraphQLTypes["auth_public_keys_max_order_by"] | undefined;
    min?: GraphQLTypes["auth_public_keys_min_order_by"] | undefined;
    stddev?: GraphQLTypes["auth_public_keys_stddev_order_by"] | undefined;
    stddev_pop?:
      | GraphQLTypes["auth_public_keys_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | GraphQLTypes["auth_public_keys_stddev_samp_order_by"]
      | undefined;
    sum?: GraphQLTypes["auth_public_keys_sum_order_by"] | undefined;
    var_pop?: GraphQLTypes["auth_public_keys_var_pop_order_by"] | undefined;
    var_samp?: GraphQLTypes["auth_public_keys_var_samp_order_by"] | undefined;
    variance?: GraphQLTypes["auth_public_keys_variance_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "auth.public_keys" */
  ["auth_public_keys_arr_rel_insert_input"]: {
    data: Array<GraphQLTypes["auth_public_keys_insert_input"]>;
    /** upsert condition */
    on_conflict?: GraphQLTypes["auth_public_keys_on_conflict"] | undefined;
  };
  /** aggregate avg on columns */
  ["auth_public_keys_avg_fields"]: {
    __typename: "auth_public_keys_avg_fields";
    id?: number | undefined;
  };
  /** order by avg() on columns of table "auth.public_keys" */
  ["auth_public_keys_avg_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.public_keys". All fields are combined with a logical 'AND'. */
  ["auth_public_keys_bool_exp"]: {
    _and?: Array<GraphQLTypes["auth_public_keys_bool_exp"]> | undefined;
    _not?: GraphQLTypes["auth_public_keys_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["auth_public_keys_bool_exp"]> | undefined;
    blockchain?: GraphQLTypes["String_comparison_exp"] | undefined;
    created_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    public_key?: GraphQLTypes["String_comparison_exp"] | undefined;
    user?: GraphQLTypes["auth_users_bool_exp"] | undefined;
    user_active_publickey_mappings?:
      | GraphQLTypes["auth_user_active_publickey_mapping_bool_exp"]
      | undefined;
    user_id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    user_nfts?: GraphQLTypes["auth_user_nfts_bool_exp"] | undefined;
    user_nfts_aggregate?:
      | GraphQLTypes["auth_user_nfts_aggregate_bool_exp"]
      | undefined;
  };
  /** unique or primary key constraints on table "auth.public_keys" */
  ["auth_public_keys_constraint"]: auth_public_keys_constraint;
  /** input type for inserting data into table "auth.public_keys" */
  ["auth_public_keys_insert_input"]: {
    blockchain?: string | undefined;
    public_key?: string | undefined;
    user?: GraphQLTypes["auth_users_obj_rel_insert_input"] | undefined;
    user_active_publickey_mappings?:
      | GraphQLTypes["auth_user_active_publickey_mapping_arr_rel_insert_input"]
      | undefined;
    user_id?: GraphQLTypes["uuid"] | undefined;
    user_nfts?: GraphQLTypes["auth_user_nfts_arr_rel_insert_input"] | undefined;
  };
  /** aggregate max on columns */
  ["auth_public_keys_max_fields"]: {
    __typename: "auth_public_keys_max_fields";
    blockchain?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: number | undefined;
    public_key?: string | undefined;
    user_id?: GraphQLTypes["uuid"] | undefined;
  };
  /** order by max() on columns of table "auth.public_keys" */
  ["auth_public_keys_max_order_by"]: {
    blockchain?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    public_key?: GraphQLTypes["order_by"] | undefined;
    user_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["auth_public_keys_min_fields"]: {
    __typename: "auth_public_keys_min_fields";
    blockchain?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: number | undefined;
    public_key?: string | undefined;
    user_id?: GraphQLTypes["uuid"] | undefined;
  };
  /** order by min() on columns of table "auth.public_keys" */
  ["auth_public_keys_min_order_by"]: {
    blockchain?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    public_key?: GraphQLTypes["order_by"] | undefined;
    user_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "auth.public_keys" */
  ["auth_public_keys_mutation_response"]: {
    __typename: "auth_public_keys_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_public_keys"]>;
  };
  /** input type for inserting object relation for remote table "auth.public_keys" */
  ["auth_public_keys_obj_rel_insert_input"]: {
    data: GraphQLTypes["auth_public_keys_insert_input"];
    /** upsert condition */
    on_conflict?: GraphQLTypes["auth_public_keys_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "auth.public_keys" */
  ["auth_public_keys_on_conflict"]: {
    constraint: GraphQLTypes["auth_public_keys_constraint"];
    update_columns: Array<GraphQLTypes["auth_public_keys_update_column"]>;
    where?: GraphQLTypes["auth_public_keys_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.public_keys". */
  ["auth_public_keys_order_by"]: {
    blockchain?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    public_key?: GraphQLTypes["order_by"] | undefined;
    user?: GraphQLTypes["auth_users_order_by"] | undefined;
    user_active_publickey_mappings_aggregate?:
      | GraphQLTypes["auth_user_active_publickey_mapping_aggregate_order_by"]
      | undefined;
    user_id?: GraphQLTypes["order_by"] | undefined;
    user_nfts_aggregate?:
      | GraphQLTypes["auth_user_nfts_aggregate_order_by"]
      | undefined;
  };
  /** select columns of table "auth.public_keys" */
  ["auth_public_keys_select_column"]: auth_public_keys_select_column;
  /** aggregate stddev on columns */
  ["auth_public_keys_stddev_fields"]: {
    __typename: "auth_public_keys_stddev_fields";
    id?: number | undefined;
  };
  /** order by stddev() on columns of table "auth.public_keys" */
  ["auth_public_keys_stddev_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["auth_public_keys_stddev_pop_fields"]: {
    __typename: "auth_public_keys_stddev_pop_fields";
    id?: number | undefined;
  };
  /** order by stddev_pop() on columns of table "auth.public_keys" */
  ["auth_public_keys_stddev_pop_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["auth_public_keys_stddev_samp_fields"]: {
    __typename: "auth_public_keys_stddev_samp_fields";
    id?: number | undefined;
  };
  /** order by stddev_samp() on columns of table "auth.public_keys" */
  ["auth_public_keys_stddev_samp_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "auth_public_keys" */
  ["auth_public_keys_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["auth_public_keys_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_public_keys_stream_cursor_value_input"]: {
    blockchain?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: number | undefined;
    public_key?: string | undefined;
    user_id?: GraphQLTypes["uuid"] | undefined;
  };
  /** aggregate sum on columns */
  ["auth_public_keys_sum_fields"]: {
    __typename: "auth_public_keys_sum_fields";
    id?: number | undefined;
  };
  /** order by sum() on columns of table "auth.public_keys" */
  ["auth_public_keys_sum_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** placeholder for update columns of table "auth.public_keys" (current role has no relevant permissions) */
  ["auth_public_keys_update_column"]: auth_public_keys_update_column;
  /** aggregate var_pop on columns */
  ["auth_public_keys_var_pop_fields"]: {
    __typename: "auth_public_keys_var_pop_fields";
    id?: number | undefined;
  };
  /** order by var_pop() on columns of table "auth.public_keys" */
  ["auth_public_keys_var_pop_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate var_samp on columns */
  ["auth_public_keys_var_samp_fields"]: {
    __typename: "auth_public_keys_var_samp_fields";
    id?: number | undefined;
  };
  /** order by var_samp() on columns of table "auth.public_keys" */
  ["auth_public_keys_var_samp_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate variance on columns */
  ["auth_public_keys_variance_fields"]: {
    __typename: "auth_public_keys_variance_fields";
    id?: number | undefined;
  };
  /** order by variance() on columns of table "auth.public_keys" */
  ["auth_public_keys_variance_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** columns and relationships of "auth.stripe_onramp" */
  ["auth_stripe_onramp"]: {
    __typename: "auth_stripe_onramp";
    client_secret: string;
    id: number;
    public_key: string;
    status: string;
    webhook_dump: string;
  };
  /** Boolean expression to filter rows from the table "auth.stripe_onramp". All fields are combined with a logical 'AND'. */
  ["auth_stripe_onramp_bool_exp"]: {
    _and?: Array<GraphQLTypes["auth_stripe_onramp_bool_exp"]> | undefined;
    _not?: GraphQLTypes["auth_stripe_onramp_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["auth_stripe_onramp_bool_exp"]> | undefined;
    client_secret?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    public_key?: GraphQLTypes["String_comparison_exp"] | undefined;
    status?: GraphQLTypes["String_comparison_exp"] | undefined;
    webhook_dump?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.stripe_onramp" */
  ["auth_stripe_onramp_constraint"]: auth_stripe_onramp_constraint;
  /** input type for incrementing numeric columns in table "auth.stripe_onramp" */
  ["auth_stripe_onramp_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "auth.stripe_onramp" */
  ["auth_stripe_onramp_insert_input"]: {
    client_secret?: string | undefined;
    id?: number | undefined;
    public_key?: string | undefined;
    status?: string | undefined;
    webhook_dump?: string | undefined;
  };
  /** response of any mutation on the table "auth.stripe_onramp" */
  ["auth_stripe_onramp_mutation_response"]: {
    __typename: "auth_stripe_onramp_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_stripe_onramp"]>;
  };
  /** on_conflict condition type for table "auth.stripe_onramp" */
  ["auth_stripe_onramp_on_conflict"]: {
    constraint: GraphQLTypes["auth_stripe_onramp_constraint"];
    update_columns: Array<GraphQLTypes["auth_stripe_onramp_update_column"]>;
    where?: GraphQLTypes["auth_stripe_onramp_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.stripe_onramp". */
  ["auth_stripe_onramp_order_by"]: {
    client_secret?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    public_key?: GraphQLTypes["order_by"] | undefined;
    status?: GraphQLTypes["order_by"] | undefined;
    webhook_dump?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.stripe_onramp */
  ["auth_stripe_onramp_pk_columns_input"]: {
    client_secret: string;
  };
  /** select columns of table "auth.stripe_onramp" */
  ["auth_stripe_onramp_select_column"]: auth_stripe_onramp_select_column;
  /** input type for updating data in table "auth.stripe_onramp" */
  ["auth_stripe_onramp_set_input"]: {
    client_secret?: string | undefined;
    id?: number | undefined;
    public_key?: string | undefined;
    status?: string | undefined;
    webhook_dump?: string | undefined;
  };
  /** Streaming cursor of the table "auth_stripe_onramp" */
  ["auth_stripe_onramp_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["auth_stripe_onramp_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_stripe_onramp_stream_cursor_value_input"]: {
    client_secret?: string | undefined;
    id?: number | undefined;
    public_key?: string | undefined;
    status?: string | undefined;
    webhook_dump?: string | undefined;
  };
  /** update columns of table "auth.stripe_onramp" */
  ["auth_stripe_onramp_update_column"]: auth_stripe_onramp_update_column;
  ["auth_stripe_onramp_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["auth_stripe_onramp_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["auth_stripe_onramp_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["auth_stripe_onramp_bool_exp"];
  };
  /** columns and relationships of "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping"]: {
    __typename: "auth_user_active_publickey_mapping";
    blockchain: string;
    /** An object relationship */
    public_key: GraphQLTypes["auth_public_keys"];
    public_key_id: number;
    user_id: GraphQLTypes["uuid"];
  };
  /** order by aggregate values of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_aggregate_order_by"]: {
    avg?:
      | GraphQLTypes["auth_user_active_publickey_mapping_avg_order_by"]
      | undefined;
    count?: GraphQLTypes["order_by"] | undefined;
    max?:
      | GraphQLTypes["auth_user_active_publickey_mapping_max_order_by"]
      | undefined;
    min?:
      | GraphQLTypes["auth_user_active_publickey_mapping_min_order_by"]
      | undefined;
    stddev?:
      | GraphQLTypes["auth_user_active_publickey_mapping_stddev_order_by"]
      | undefined;
    stddev_pop?:
      | GraphQLTypes["auth_user_active_publickey_mapping_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | GraphQLTypes["auth_user_active_publickey_mapping_stddev_samp_order_by"]
      | undefined;
    sum?:
      | GraphQLTypes["auth_user_active_publickey_mapping_sum_order_by"]
      | undefined;
    var_pop?:
      | GraphQLTypes["auth_user_active_publickey_mapping_var_pop_order_by"]
      | undefined;
    var_samp?:
      | GraphQLTypes["auth_user_active_publickey_mapping_var_samp_order_by"]
      | undefined;
    variance?:
      | GraphQLTypes["auth_user_active_publickey_mapping_variance_order_by"]
      | undefined;
  };
  /** input type for inserting array relation for remote table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_arr_rel_insert_input"]: {
    data: Array<
      GraphQLTypes["auth_user_active_publickey_mapping_insert_input"]
    >;
    /** upsert condition */
    on_conflict?:
      | GraphQLTypes["auth_user_active_publickey_mapping_on_conflict"]
      | undefined;
  };
  /** order by avg() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_avg_order_by"]: {
    public_key_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.user_active_publickey_mapping". All fields are combined with a logical 'AND'. */
  ["auth_user_active_publickey_mapping_bool_exp"]: {
    _and?:
      | Array<GraphQLTypes["auth_user_active_publickey_mapping_bool_exp"]>
      | undefined;
    _not?:
      | GraphQLTypes["auth_user_active_publickey_mapping_bool_exp"]
      | undefined;
    _or?:
      | Array<GraphQLTypes["auth_user_active_publickey_mapping_bool_exp"]>
      | undefined;
    blockchain?: GraphQLTypes["String_comparison_exp"] | undefined;
    public_key?: GraphQLTypes["auth_public_keys_bool_exp"] | undefined;
    public_key_id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    user_id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_constraint"]: auth_user_active_publickey_mapping_constraint;
  /** input type for incrementing numeric columns in table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_inc_input"]: {
    public_key_id?: number | undefined;
  };
  /** input type for inserting data into table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_insert_input"]: {
    blockchain?: string | undefined;
    public_key?:
      | GraphQLTypes["auth_public_keys_obj_rel_insert_input"]
      | undefined;
    public_key_id?: number | undefined;
    user_id?: GraphQLTypes["uuid"] | undefined;
  };
  /** order by max() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_max_order_by"]: {
    blockchain?: GraphQLTypes["order_by"] | undefined;
    public_key_id?: GraphQLTypes["order_by"] | undefined;
    user_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_min_order_by"]: {
    blockchain?: GraphQLTypes["order_by"] | undefined;
    public_key_id?: GraphQLTypes["order_by"] | undefined;
    user_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_mutation_response"]: {
    __typename: "auth_user_active_publickey_mapping_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_user_active_publickey_mapping"]>;
  };
  /** on_conflict condition type for table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_on_conflict"]: {
    constraint: GraphQLTypes["auth_user_active_publickey_mapping_constraint"];
    update_columns: Array<
      GraphQLTypes["auth_user_active_publickey_mapping_update_column"]
    >;
    where?:
      | GraphQLTypes["auth_user_active_publickey_mapping_bool_exp"]
      | undefined;
  };
  /** Ordering options when selecting data from "auth.user_active_publickey_mapping". */
  ["auth_user_active_publickey_mapping_order_by"]: {
    blockchain?: GraphQLTypes["order_by"] | undefined;
    public_key?: GraphQLTypes["auth_public_keys_order_by"] | undefined;
    public_key_id?: GraphQLTypes["order_by"] | undefined;
    user_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.user_active_publickey_mapping */
  ["auth_user_active_publickey_mapping_pk_columns_input"]: {
    blockchain: string;
    user_id: GraphQLTypes["uuid"];
  };
  /** select columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_select_column"]: auth_user_active_publickey_mapping_select_column;
  /** input type for updating data in table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_set_input"]: {
    blockchain?: string | undefined;
    public_key_id?: number | undefined;
    user_id?: GraphQLTypes["uuid"] | undefined;
  };
  /** order by stddev() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stddev_order_by"]: {
    public_key_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stddev_pop_order_by"]: {
    public_key_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stddev_samp_order_by"]: {
    public_key_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "auth_user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["auth_user_active_publickey_mapping_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_user_active_publickey_mapping_stream_cursor_value_input"]: {
    blockchain?: string | undefined;
    public_key_id?: number | undefined;
    user_id?: GraphQLTypes["uuid"] | undefined;
  };
  /** order by sum() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_sum_order_by"]: {
    public_key_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** update columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_update_column"]: auth_user_active_publickey_mapping_update_column;
  ["auth_user_active_publickey_mapping_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | GraphQLTypes["auth_user_active_publickey_mapping_inc_input"]
      | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | GraphQLTypes["auth_user_active_publickey_mapping_set_input"]
      | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["auth_user_active_publickey_mapping_bool_exp"];
  };
  /** order by var_pop() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_var_pop_order_by"]: {
    public_key_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_var_samp_order_by"]: {
    public_key_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "auth.user_active_publickey_mapping" */
  ["auth_user_active_publickey_mapping_variance_order_by"]: {
    public_key_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** columns and relationships of "auth.user_nfts" */
  ["auth_user_nfts"]: {
    __typename: "auth_user_nfts";
    blockchain: string;
    centralized_group?: string | undefined;
    collection_id?: string | undefined;
    nft_id: string;
    /** An object relationship */
    publicKeyByBlockchainPublicKey?:
      | GraphQLTypes["auth_public_keys"]
      | undefined;
    public_key: string;
  };
  /** aggregated selection of "auth.user_nfts" */
  ["auth_user_nfts_aggregate"]: {
    __typename: "auth_user_nfts_aggregate";
    aggregate?: GraphQLTypes["auth_user_nfts_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["auth_user_nfts"]>;
  };
  ["auth_user_nfts_aggregate_bool_exp"]: {
    count?: GraphQLTypes["auth_user_nfts_aggregate_bool_exp_count"] | undefined;
  };
  ["auth_user_nfts_aggregate_bool_exp_count"]: {
    arguments?: Array<GraphQLTypes["auth_user_nfts_select_column"]> | undefined;
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["auth_user_nfts_bool_exp"] | undefined;
    predicate: GraphQLTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "auth.user_nfts" */
  ["auth_user_nfts_aggregate_fields"]: {
    __typename: "auth_user_nfts_aggregate_fields";
    count: number;
    max?: GraphQLTypes["auth_user_nfts_max_fields"] | undefined;
    min?: GraphQLTypes["auth_user_nfts_min_fields"] | undefined;
  };
  /** order by aggregate values of table "auth.user_nfts" */
  ["auth_user_nfts_aggregate_order_by"]: {
    count?: GraphQLTypes["order_by"] | undefined;
    max?: GraphQLTypes["auth_user_nfts_max_order_by"] | undefined;
    min?: GraphQLTypes["auth_user_nfts_min_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "auth.user_nfts" */
  ["auth_user_nfts_arr_rel_insert_input"]: {
    data: Array<GraphQLTypes["auth_user_nfts_insert_input"]>;
    /** upsert condition */
    on_conflict?: GraphQLTypes["auth_user_nfts_on_conflict"] | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.user_nfts". All fields are combined with a logical 'AND'. */
  ["auth_user_nfts_bool_exp"]: {
    _and?: Array<GraphQLTypes["auth_user_nfts_bool_exp"]> | undefined;
    _not?: GraphQLTypes["auth_user_nfts_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["auth_user_nfts_bool_exp"]> | undefined;
    blockchain?: GraphQLTypes["String_comparison_exp"] | undefined;
    centralized_group?: GraphQLTypes["String_comparison_exp"] | undefined;
    collection_id?: GraphQLTypes["String_comparison_exp"] | undefined;
    nft_id?: GraphQLTypes["String_comparison_exp"] | undefined;
    publicKeyByBlockchainPublicKey?:
      | GraphQLTypes["auth_public_keys_bool_exp"]
      | undefined;
    public_key?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.user_nfts" */
  ["auth_user_nfts_constraint"]: auth_user_nfts_constraint;
  /** input type for inserting data into table "auth.user_nfts" */
  ["auth_user_nfts_insert_input"]: {
    blockchain?: string | undefined;
    centralized_group?: string | undefined;
    collection_id?: string | undefined;
    nft_id?: string | undefined;
    publicKeyByBlockchainPublicKey?:
      | GraphQLTypes["auth_public_keys_obj_rel_insert_input"]
      | undefined;
    public_key?: string | undefined;
  };
  /** aggregate max on columns */
  ["auth_user_nfts_max_fields"]: {
    __typename: "auth_user_nfts_max_fields";
    blockchain?: string | undefined;
    centralized_group?: string | undefined;
    collection_id?: string | undefined;
    nft_id?: string | undefined;
    public_key?: string | undefined;
  };
  /** order by max() on columns of table "auth.user_nfts" */
  ["auth_user_nfts_max_order_by"]: {
    blockchain?: GraphQLTypes["order_by"] | undefined;
    centralized_group?: GraphQLTypes["order_by"] | undefined;
    collection_id?: GraphQLTypes["order_by"] | undefined;
    nft_id?: GraphQLTypes["order_by"] | undefined;
    public_key?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["auth_user_nfts_min_fields"]: {
    __typename: "auth_user_nfts_min_fields";
    blockchain?: string | undefined;
    centralized_group?: string | undefined;
    collection_id?: string | undefined;
    nft_id?: string | undefined;
    public_key?: string | undefined;
  };
  /** order by min() on columns of table "auth.user_nfts" */
  ["auth_user_nfts_min_order_by"]: {
    blockchain?: GraphQLTypes["order_by"] | undefined;
    centralized_group?: GraphQLTypes["order_by"] | undefined;
    collection_id?: GraphQLTypes["order_by"] | undefined;
    nft_id?: GraphQLTypes["order_by"] | undefined;
    public_key?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "auth.user_nfts" */
  ["auth_user_nfts_mutation_response"]: {
    __typename: "auth_user_nfts_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_user_nfts"]>;
  };
  /** on_conflict condition type for table "auth.user_nfts" */
  ["auth_user_nfts_on_conflict"]: {
    constraint: GraphQLTypes["auth_user_nfts_constraint"];
    update_columns: Array<GraphQLTypes["auth_user_nfts_update_column"]>;
    where?: GraphQLTypes["auth_user_nfts_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.user_nfts". */
  ["auth_user_nfts_order_by"]: {
    blockchain?: GraphQLTypes["order_by"] | undefined;
    centralized_group?: GraphQLTypes["order_by"] | undefined;
    collection_id?: GraphQLTypes["order_by"] | undefined;
    nft_id?: GraphQLTypes["order_by"] | undefined;
    publicKeyByBlockchainPublicKey?:
      | GraphQLTypes["auth_public_keys_order_by"]
      | undefined;
    public_key?: GraphQLTypes["order_by"] | undefined;
  };
  /** select columns of table "auth.user_nfts" */
  ["auth_user_nfts_select_column"]: auth_user_nfts_select_column;
  /** Streaming cursor of the table "auth_user_nfts" */
  ["auth_user_nfts_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["auth_user_nfts_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_user_nfts_stream_cursor_value_input"]: {
    blockchain?: string | undefined;
    centralized_group?: string | undefined;
    collection_id?: string | undefined;
    nft_id?: string | undefined;
    public_key?: string | undefined;
  };
  /** placeholder for update columns of table "auth.user_nfts" (current role has no relevant permissions) */
  ["auth_user_nfts_update_column"]: auth_user_nfts_update_column;
  /** columns and relationships of "auth.users" */
  ["auth_users"]: {
    __typename: "auth_users";
    created_at: GraphQLTypes["timestamptz"];
    /** the user's first solana public key inside an array due to hasura limitation */
    dropzone_public_key?: Array<GraphQLTypes["auth_public_keys"]> | undefined;
    id: GraphQLTypes["uuid"];
    /** An object relationship */
    invitation: GraphQLTypes["auth_invitations"];
    /** An array relationship */
    public_keys: Array<GraphQLTypes["auth_public_keys"]>;
    /** An aggregate relationship */
    public_keys_aggregate: GraphQLTypes["auth_public_keys_aggregate"];
    /** An array relationship */
    referred_users: Array<GraphQLTypes["auth_users"]>;
    /** An aggregate relationship */
    referred_users_aggregate: GraphQLTypes["auth_users_aggregate"];
    /** An object relationship */
    referrer?: GraphQLTypes["auth_users"] | undefined;
    username: GraphQLTypes["citext"];
  };
  /** aggregated selection of "auth.users" */
  ["auth_users_aggregate"]: {
    __typename: "auth_users_aggregate";
    aggregate?: GraphQLTypes["auth_users_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["auth_users"]>;
  };
  ["auth_users_aggregate_bool_exp"]: {
    count?: GraphQLTypes["auth_users_aggregate_bool_exp_count"] | undefined;
  };
  ["auth_users_aggregate_bool_exp_count"]: {
    arguments?: Array<GraphQLTypes["auth_users_select_column"]> | undefined;
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["auth_users_bool_exp"] | undefined;
    predicate: GraphQLTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "auth.users" */
  ["auth_users_aggregate_fields"]: {
    __typename: "auth_users_aggregate_fields";
    count: number;
    max?: GraphQLTypes["auth_users_max_fields"] | undefined;
    min?: GraphQLTypes["auth_users_min_fields"] | undefined;
  };
  /** order by aggregate values of table "auth.users" */
  ["auth_users_aggregate_order_by"]: {
    count?: GraphQLTypes["order_by"] | undefined;
    max?: GraphQLTypes["auth_users_max_order_by"] | undefined;
    min?: GraphQLTypes["auth_users_min_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "auth.users" */
  ["auth_users_arr_rel_insert_input"]: {
    data: Array<GraphQLTypes["auth_users_insert_input"]>;
    /** upsert condition */
    on_conflict?: GraphQLTypes["auth_users_on_conflict"] | undefined;
  };
  /** Boolean expression to filter rows from the table "auth.users". All fields are combined with a logical 'AND'. */
  ["auth_users_bool_exp"]: {
    _and?: Array<GraphQLTypes["auth_users_bool_exp"]> | undefined;
    _not?: GraphQLTypes["auth_users_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["auth_users_bool_exp"]> | undefined;
    created_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    dropzone_public_key?: GraphQLTypes["auth_public_keys_bool_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    invitation?: GraphQLTypes["auth_invitations_bool_exp"] | undefined;
    public_keys?: GraphQLTypes["auth_public_keys_bool_exp"] | undefined;
    public_keys_aggregate?:
      | GraphQLTypes["auth_public_keys_aggregate_bool_exp"]
      | undefined;
    referred_users?: GraphQLTypes["auth_users_bool_exp"] | undefined;
    referred_users_aggregate?:
      | GraphQLTypes["auth_users_aggregate_bool_exp"]
      | undefined;
    referrer?: GraphQLTypes["auth_users_bool_exp"] | undefined;
    username?: GraphQLTypes["citext_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.users" */
  ["auth_users_constraint"]: auth_users_constraint;
  /** input type for inserting data into table "auth.users" */
  ["auth_users_insert_input"]: {
    invitation?:
      | GraphQLTypes["auth_invitations_obj_rel_insert_input"]
      | undefined;
    invitation_id?: GraphQLTypes["uuid"] | undefined;
    public_keys?:
      | GraphQLTypes["auth_public_keys_arr_rel_insert_input"]
      | undefined;
    referred_users?:
      | GraphQLTypes["auth_users_arr_rel_insert_input"]
      | undefined;
    referrer?: GraphQLTypes["auth_users_obj_rel_insert_input"] | undefined;
    referrer_id?: GraphQLTypes["uuid"] | undefined;
    username?: GraphQLTypes["citext"] | undefined;
    waitlist_id?: string | undefined;
  };
  /** aggregate max on columns */
  ["auth_users_max_fields"]: {
    __typename: "auth_users_max_fields";
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    username?: GraphQLTypes["citext"] | undefined;
  };
  /** order by max() on columns of table "auth.users" */
  ["auth_users_max_order_by"]: {
    created_at?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    username?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["auth_users_min_fields"]: {
    __typename: "auth_users_min_fields";
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    username?: GraphQLTypes["citext"] | undefined;
  };
  /** order by min() on columns of table "auth.users" */
  ["auth_users_min_order_by"]: {
    created_at?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    username?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "auth.users" */
  ["auth_users_mutation_response"]: {
    __typename: "auth_users_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_users"]>;
  };
  /** input type for inserting object relation for remote table "auth.users" */
  ["auth_users_obj_rel_insert_input"]: {
    data: GraphQLTypes["auth_users_insert_input"];
    /** upsert condition */
    on_conflict?: GraphQLTypes["auth_users_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "auth.users" */
  ["auth_users_on_conflict"]: {
    constraint: GraphQLTypes["auth_users_constraint"];
    update_columns: Array<GraphQLTypes["auth_users_update_column"]>;
    where?: GraphQLTypes["auth_users_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.users". */
  ["auth_users_order_by"]: {
    created_at?: GraphQLTypes["order_by"] | undefined;
    dropzone_public_key_aggregate?:
      | GraphQLTypes["auth_public_keys_aggregate_order_by"]
      | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    invitation?: GraphQLTypes["auth_invitations_order_by"] | undefined;
    public_keys_aggregate?:
      | GraphQLTypes["auth_public_keys_aggregate_order_by"]
      | undefined;
    referred_users_aggregate?:
      | GraphQLTypes["auth_users_aggregate_order_by"]
      | undefined;
    referrer?: GraphQLTypes["auth_users_order_by"] | undefined;
    username?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.users */
  ["auth_users_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "auth.users" */
  ["auth_users_select_column"]: auth_users_select_column;
  /** input type for updating data in table "auth.users" */
  ["auth_users_set_input"]: {
    avatar_nft?: GraphQLTypes["citext"] | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
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
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    username?: GraphQLTypes["citext"] | undefined;
  };
  /** update columns of table "auth.users" */
  ["auth_users_update_column"]: auth_users_update_column;
  ["auth_users_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["auth_users_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["auth_users_bool_exp"];
  };
  /** columns and relationships of "auth.xnft_preferences" */
  ["auth_xnft_preferences"]: {
    __typename: "auth_xnft_preferences";
    disabled?: string | undefined;
    id: number;
    media: boolean;
    notifications: boolean;
    username: string;
    uuid?: string | undefined;
    xnft_id: string;
  };
  /** Boolean expression to filter rows from the table "auth.xnft_preferences". All fields are combined with a logical 'AND'. */
  ["auth_xnft_preferences_bool_exp"]: {
    _and?: Array<GraphQLTypes["auth_xnft_preferences_bool_exp"]> | undefined;
    _not?: GraphQLTypes["auth_xnft_preferences_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["auth_xnft_preferences_bool_exp"]> | undefined;
    disabled?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    media?: GraphQLTypes["Boolean_comparison_exp"] | undefined;
    notifications?: GraphQLTypes["Boolean_comparison_exp"] | undefined;
    username?: GraphQLTypes["String_comparison_exp"] | undefined;
    uuid?: GraphQLTypes["String_comparison_exp"] | undefined;
    xnft_id?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.xnft_preferences" */
  ["auth_xnft_preferences_constraint"]: auth_xnft_preferences_constraint;
  /** input type for incrementing numeric columns in table "auth.xnft_preferences" */
  ["auth_xnft_preferences_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "auth.xnft_preferences" */
  ["auth_xnft_preferences_insert_input"]: {
    disabled?: string | undefined;
    id?: number | undefined;
    media?: boolean | undefined;
    notifications?: boolean | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    xnft_id?: string | undefined;
  };
  /** response of any mutation on the table "auth.xnft_preferences" */
  ["auth_xnft_preferences_mutation_response"]: {
    __typename: "auth_xnft_preferences_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_xnft_preferences"]>;
  };
  /** on_conflict condition type for table "auth.xnft_preferences" */
  ["auth_xnft_preferences_on_conflict"]: {
    constraint: GraphQLTypes["auth_xnft_preferences_constraint"];
    update_columns: Array<GraphQLTypes["auth_xnft_preferences_update_column"]>;
    where?: GraphQLTypes["auth_xnft_preferences_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.xnft_preferences". */
  ["auth_xnft_preferences_order_by"]: {
    disabled?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    media?: GraphQLTypes["order_by"] | undefined;
    notifications?: GraphQLTypes["order_by"] | undefined;
    username?: GraphQLTypes["order_by"] | undefined;
    uuid?: GraphQLTypes["order_by"] | undefined;
    xnft_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.xnft_preferences */
  ["auth_xnft_preferences_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "auth.xnft_preferences" */
  ["auth_xnft_preferences_select_column"]: auth_xnft_preferences_select_column;
  /** input type for updating data in table "auth.xnft_preferences" */
  ["auth_xnft_preferences_set_input"]: {
    disabled?: string | undefined;
    id?: number | undefined;
    media?: boolean | undefined;
    notifications?: boolean | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    xnft_id?: string | undefined;
  };
  /** Streaming cursor of the table "auth_xnft_preferences" */
  ["auth_xnft_preferences_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["auth_xnft_preferences_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_xnft_preferences_stream_cursor_value_input"]: {
    disabled?: string | undefined;
    id?: number | undefined;
    media?: boolean | undefined;
    notifications?: boolean | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
    xnft_id?: string | undefined;
  };
  /** update columns of table "auth.xnft_preferences" */
  ["auth_xnft_preferences_update_column"]: auth_xnft_preferences_update_column;
  ["auth_xnft_preferences_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["auth_xnft_preferences_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["auth_xnft_preferences_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["auth_xnft_preferences_bool_exp"];
  };
  /** columns and relationships of "auth.xnft_secrets" */
  ["auth_xnft_secrets"]: {
    __typename: "auth_xnft_secrets";
    id: number;
    secret: string;
    xnft_id: string;
  };
  /** Boolean expression to filter rows from the table "auth.xnft_secrets". All fields are combined with a logical 'AND'. */
  ["auth_xnft_secrets_bool_exp"]: {
    _and?: Array<GraphQLTypes["auth_xnft_secrets_bool_exp"]> | undefined;
    _not?: GraphQLTypes["auth_xnft_secrets_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["auth_xnft_secrets_bool_exp"]> | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    secret?: GraphQLTypes["String_comparison_exp"] | undefined;
    xnft_id?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "auth.xnft_secrets" */
  ["auth_xnft_secrets_constraint"]: auth_xnft_secrets_constraint;
  /** input type for incrementing numeric columns in table "auth.xnft_secrets" */
  ["auth_xnft_secrets_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "auth.xnft_secrets" */
  ["auth_xnft_secrets_insert_input"]: {
    id?: number | undefined;
    secret?: string | undefined;
    xnft_id?: string | undefined;
  };
  /** response of any mutation on the table "auth.xnft_secrets" */
  ["auth_xnft_secrets_mutation_response"]: {
    __typename: "auth_xnft_secrets_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["auth_xnft_secrets"]>;
  };
  /** on_conflict condition type for table "auth.xnft_secrets" */
  ["auth_xnft_secrets_on_conflict"]: {
    constraint: GraphQLTypes["auth_xnft_secrets_constraint"];
    update_columns: Array<GraphQLTypes["auth_xnft_secrets_update_column"]>;
    where?: GraphQLTypes["auth_xnft_secrets_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "auth.xnft_secrets". */
  ["auth_xnft_secrets_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
    secret?: GraphQLTypes["order_by"] | undefined;
    xnft_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: auth.xnft_secrets */
  ["auth_xnft_secrets_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "auth.xnft_secrets" */
  ["auth_xnft_secrets_select_column"]: auth_xnft_secrets_select_column;
  /** input type for updating data in table "auth.xnft_secrets" */
  ["auth_xnft_secrets_set_input"]: {
    id?: number | undefined;
    secret?: string | undefined;
    xnft_id?: string | undefined;
  };
  /** Streaming cursor of the table "auth_xnft_secrets" */
  ["auth_xnft_secrets_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["auth_xnft_secrets_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["auth_xnft_secrets_stream_cursor_value_input"]: {
    id?: number | undefined;
    secret?: string | undefined;
    xnft_id?: string | undefined;
  };
  /** update columns of table "auth.xnft_secrets" */
  ["auth_xnft_secrets_update_column"]: auth_xnft_secrets_update_column;
  ["auth_xnft_secrets_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["auth_xnft_secrets_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["auth_xnft_secrets_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["auth_xnft_secrets_bool_exp"];
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
  /** data used by merkle distributors */
  ["dropzone_distributors"]: {
    __typename: "dropzone_distributors";
    created_at: GraphQLTypes["timestamptz"];
    data: GraphQLTypes["jsonb"];
    id: string;
    mint: string;
  };
  /** aggregated selection of "dropzone.distributors" */
  ["dropzone_distributors_aggregate"]: {
    __typename: "dropzone_distributors_aggregate";
    aggregate?:
      | GraphQLTypes["dropzone_distributors_aggregate_fields"]
      | undefined;
    nodes: Array<GraphQLTypes["dropzone_distributors"]>;
  };
  /** aggregate fields of "dropzone.distributors" */
  ["dropzone_distributors_aggregate_fields"]: {
    __typename: "dropzone_distributors_aggregate_fields";
    count: number;
    max?: GraphQLTypes["dropzone_distributors_max_fields"] | undefined;
    min?: GraphQLTypes["dropzone_distributors_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "dropzone.distributors". All fields are combined with a logical 'AND'. */
  ["dropzone_distributors_bool_exp"]: {
    _and?: Array<GraphQLTypes["dropzone_distributors_bool_exp"]> | undefined;
    _not?: GraphQLTypes["dropzone_distributors_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["dropzone_distributors_bool_exp"]> | undefined;
    created_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    data?: GraphQLTypes["jsonb_comparison_exp"] | undefined;
    id?: GraphQLTypes["String_comparison_exp"] | undefined;
    mint?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "dropzone.distributors" */
  ["dropzone_distributors_constraint"]: dropzone_distributors_constraint;
  /** input type for inserting data into table "dropzone.distributors" */
  ["dropzone_distributors_insert_input"]: {
    data?: GraphQLTypes["jsonb"] | undefined;
    id?: string | undefined;
    mint?: string | undefined;
  };
  /** aggregate max on columns */
  ["dropzone_distributors_max_fields"]: {
    __typename: "dropzone_distributors_max_fields";
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: string | undefined;
    mint?: string | undefined;
  };
  /** aggregate min on columns */
  ["dropzone_distributors_min_fields"]: {
    __typename: "dropzone_distributors_min_fields";
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: string | undefined;
    mint?: string | undefined;
  };
  /** response of any mutation on the table "dropzone.distributors" */
  ["dropzone_distributors_mutation_response"]: {
    __typename: "dropzone_distributors_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["dropzone_distributors"]>;
  };
  /** on_conflict condition type for table "dropzone.distributors" */
  ["dropzone_distributors_on_conflict"]: {
    constraint: GraphQLTypes["dropzone_distributors_constraint"];
    update_columns: Array<GraphQLTypes["dropzone_distributors_update_column"]>;
    where?: GraphQLTypes["dropzone_distributors_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "dropzone.distributors". */
  ["dropzone_distributors_order_by"]: {
    created_at?: GraphQLTypes["order_by"] | undefined;
    data?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    mint?: GraphQLTypes["order_by"] | undefined;
  };
  /** select columns of table "dropzone.distributors" */
  ["dropzone_distributors_select_column"]: dropzone_distributors_select_column;
  /** Streaming cursor of the table "dropzone_distributors" */
  ["dropzone_distributors_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["dropzone_distributors_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["dropzone_distributors_stream_cursor_value_input"]: {
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    data?: GraphQLTypes["jsonb"] | undefined;
    id?: string | undefined;
    mint?: string | undefined;
  };
  /** placeholder for update columns of table "dropzone.distributors" (current role has no relevant permissions) */
  ["dropzone_distributors_update_column"]: dropzone_distributors_update_column;
  ["dropzone_user_dropzone_public_key_args"]: {
    user_row?: GraphQLTypes["users_scalar"] | undefined;
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
    /** delete data from the table: "auth.collection_messages" */
    delete_auth_collection_messages?:
      | GraphQLTypes["auth_collection_messages_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.collection_messages" */
    delete_auth_collection_messages_by_pk?:
      | GraphQLTypes["auth_collection_messages"]
      | undefined;
    /** delete data from the table: "auth.collections" */
    delete_auth_collections?:
      | GraphQLTypes["auth_collections_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.collections" */
    delete_auth_collections_by_pk?:
      | GraphQLTypes["auth_collections"]
      | undefined;
    /** delete data from the table: "auth.friend_requests" */
    delete_auth_friend_requests?:
      | GraphQLTypes["auth_friend_requests_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.friend_requests" */
    delete_auth_friend_requests_by_pk?:
      | GraphQLTypes["auth_friend_requests"]
      | undefined;
    /** delete data from the table: "auth.friendships" */
    delete_auth_friendships?:
      | GraphQLTypes["auth_friendships_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.friendships" */
    delete_auth_friendships_by_pk?:
      | GraphQLTypes["auth_friendships"]
      | undefined;
    /** delete data from the table: "auth.notification_subscriptions" */
    delete_auth_notification_subscriptions?:
      | GraphQLTypes["auth_notification_subscriptions_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.notification_subscriptions" */
    delete_auth_notification_subscriptions_by_pk?:
      | GraphQLTypes["auth_notification_subscriptions"]
      | undefined;
    /** delete data from the table: "auth.public_keys" */
    delete_auth_public_keys?:
      | GraphQLTypes["auth_public_keys_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.public_keys" */
    delete_auth_public_keys_by_pk?:
      | GraphQLTypes["auth_public_keys"]
      | undefined;
    /** delete data from the table: "auth.user_nfts" */
    delete_auth_user_nfts?:
      | GraphQLTypes["auth_user_nfts_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.user_nfts" */
    delete_auth_user_nfts_by_pk?: GraphQLTypes["auth_user_nfts"] | undefined;
    /** delete data from the table: "auth.xnft_preferences" */
    delete_auth_xnft_preferences?:
      | GraphQLTypes["auth_xnft_preferences_mutation_response"]
      | undefined;
    /** delete single row from the table: "auth.xnft_preferences" */
    delete_auth_xnft_preferences_by_pk?:
      | GraphQLTypes["auth_xnft_preferences"]
      | undefined;
    /** insert data into the table: "auth.collection_messages" */
    insert_auth_collection_messages?:
      | GraphQLTypes["auth_collection_messages_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.collection_messages" */
    insert_auth_collection_messages_one?:
      | GraphQLTypes["auth_collection_messages"]
      | undefined;
    /** insert data into the table: "auth.collections" */
    insert_auth_collections?:
      | GraphQLTypes["auth_collections_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.collections" */
    insert_auth_collections_one?: GraphQLTypes["auth_collections"] | undefined;
    /** insert data into the table: "auth.friend_requests" */
    insert_auth_friend_requests?:
      | GraphQLTypes["auth_friend_requests_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.friend_requests" */
    insert_auth_friend_requests_one?:
      | GraphQLTypes["auth_friend_requests"]
      | undefined;
    /** insert data into the table: "auth.friendships" */
    insert_auth_friendships?:
      | GraphQLTypes["auth_friendships_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.friendships" */
    insert_auth_friendships_one?: GraphQLTypes["auth_friendships"] | undefined;
    /** insert data into the table: "auth.invitations" */
    insert_auth_invitations?:
      | GraphQLTypes["auth_invitations_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.invitations" */
    insert_auth_invitations_one?: GraphQLTypes["auth_invitations"] | undefined;
    /** insert data into the table: "auth.notification_cursor" */
    insert_auth_notification_cursor?:
      | GraphQLTypes["auth_notification_cursor_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.notification_cursor" */
    insert_auth_notification_cursor_one?:
      | GraphQLTypes["auth_notification_cursor"]
      | undefined;
    /** insert data into the table: "auth.notification_subscriptions" */
    insert_auth_notification_subscriptions?:
      | GraphQLTypes["auth_notification_subscriptions_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.notification_subscriptions" */
    insert_auth_notification_subscriptions_one?:
      | GraphQLTypes["auth_notification_subscriptions"]
      | undefined;
    /** insert data into the table: "auth.notifications" */
    insert_auth_notifications?:
      | GraphQLTypes["auth_notifications_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.notifications" */
    insert_auth_notifications_one?:
      | GraphQLTypes["auth_notifications"]
      | undefined;
    /** insert data into the table: "auth.public_keys" */
    insert_auth_public_keys?:
      | GraphQLTypes["auth_public_keys_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.public_keys" */
    insert_auth_public_keys_one?: GraphQLTypes["auth_public_keys"] | undefined;
    /** insert data into the table: "auth.stripe_onramp" */
    insert_auth_stripe_onramp?:
      | GraphQLTypes["auth_stripe_onramp_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.stripe_onramp" */
    insert_auth_stripe_onramp_one?:
      | GraphQLTypes["auth_stripe_onramp"]
      | undefined;
    /** insert data into the table: "auth.user_active_publickey_mapping" */
    insert_auth_user_active_publickey_mapping?:
      | GraphQLTypes["auth_user_active_publickey_mapping_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.user_active_publickey_mapping" */
    insert_auth_user_active_publickey_mapping_one?:
      | GraphQLTypes["auth_user_active_publickey_mapping"]
      | undefined;
    /** insert data into the table: "auth.user_nfts" */
    insert_auth_user_nfts?:
      | GraphQLTypes["auth_user_nfts_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.user_nfts" */
    insert_auth_user_nfts_one?: GraphQLTypes["auth_user_nfts"] | undefined;
    /** insert data into the table: "auth.users" */
    insert_auth_users?:
      | GraphQLTypes["auth_users_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.users" */
    insert_auth_users_one?: GraphQLTypes["auth_users"] | undefined;
    /** insert data into the table: "auth.xnft_preferences" */
    insert_auth_xnft_preferences?:
      | GraphQLTypes["auth_xnft_preferences_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.xnft_preferences" */
    insert_auth_xnft_preferences_one?:
      | GraphQLTypes["auth_xnft_preferences"]
      | undefined;
    /** insert data into the table: "auth.xnft_secrets" */
    insert_auth_xnft_secrets?:
      | GraphQLTypes["auth_xnft_secrets_mutation_response"]
      | undefined;
    /** insert a single row into the table: "auth.xnft_secrets" */
    insert_auth_xnft_secrets_one?:
      | GraphQLTypes["auth_xnft_secrets"]
      | undefined;
    /** insert data into the table: "dropzone.distributors" */
    insert_dropzone_distributors?:
      | GraphQLTypes["dropzone_distributors_mutation_response"]
      | undefined;
    /** insert a single row into the table: "dropzone.distributors" */
    insert_dropzone_distributors_one?:
      | GraphQLTypes["dropzone_distributors"]
      | undefined;
    /** update data of the table: "auth.collection_messages" */
    update_auth_collection_messages?:
      | GraphQLTypes["auth_collection_messages_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.collection_messages" */
    update_auth_collection_messages_by_pk?:
      | GraphQLTypes["auth_collection_messages"]
      | undefined;
    /** update multiples rows of table: "auth.collection_messages" */
    update_auth_collection_messages_many?:
      | Array<
          GraphQLTypes["auth_collection_messages_mutation_response"] | undefined
        >
      | undefined;
    /** update data of the table: "auth.collections" */
    update_auth_collections?:
      | GraphQLTypes["auth_collections_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.collections" */
    update_auth_collections_by_pk?:
      | GraphQLTypes["auth_collections"]
      | undefined;
    /** update multiples rows of table: "auth.collections" */
    update_auth_collections_many?:
      | Array<GraphQLTypes["auth_collections_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "auth.friendships" */
    update_auth_friendships?:
      | GraphQLTypes["auth_friendships_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.friendships" */
    update_auth_friendships_by_pk?:
      | GraphQLTypes["auth_friendships"]
      | undefined;
    /** update multiples rows of table: "auth.friendships" */
    update_auth_friendships_many?:
      | Array<GraphQLTypes["auth_friendships_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "auth.notification_cursor" */
    update_auth_notification_cursor?:
      | GraphQLTypes["auth_notification_cursor_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.notification_cursor" */
    update_auth_notification_cursor_by_pk?:
      | GraphQLTypes["auth_notification_cursor"]
      | undefined;
    /** update multiples rows of table: "auth.notification_cursor" */
    update_auth_notification_cursor_many?:
      | Array<
          GraphQLTypes["auth_notification_cursor_mutation_response"] | undefined
        >
      | undefined;
    /** update data of the table: "auth.notification_subscriptions" */
    update_auth_notification_subscriptions?:
      | GraphQLTypes["auth_notification_subscriptions_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.notification_subscriptions" */
    update_auth_notification_subscriptions_by_pk?:
      | GraphQLTypes["auth_notification_subscriptions"]
      | undefined;
    /** update multiples rows of table: "auth.notification_subscriptions" */
    update_auth_notification_subscriptions_many?:
      | Array<
          | GraphQLTypes["auth_notification_subscriptions_mutation_response"]
          | undefined
        >
      | undefined;
    /** update data of the table: "auth.notifications" */
    update_auth_notifications?:
      | GraphQLTypes["auth_notifications_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.notifications" */
    update_auth_notifications_by_pk?:
      | GraphQLTypes["auth_notifications"]
      | undefined;
    /** update multiples rows of table: "auth.notifications" */
    update_auth_notifications_many?:
      | Array<GraphQLTypes["auth_notifications_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "auth.stripe_onramp" */
    update_auth_stripe_onramp?:
      | GraphQLTypes["auth_stripe_onramp_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.stripe_onramp" */
    update_auth_stripe_onramp_by_pk?:
      | GraphQLTypes["auth_stripe_onramp"]
      | undefined;
    /** update multiples rows of table: "auth.stripe_onramp" */
    update_auth_stripe_onramp_many?:
      | Array<GraphQLTypes["auth_stripe_onramp_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "auth.user_active_publickey_mapping" */
    update_auth_user_active_publickey_mapping?:
      | GraphQLTypes["auth_user_active_publickey_mapping_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.user_active_publickey_mapping" */
    update_auth_user_active_publickey_mapping_by_pk?:
      | GraphQLTypes["auth_user_active_publickey_mapping"]
      | undefined;
    /** update multiples rows of table: "auth.user_active_publickey_mapping" */
    update_auth_user_active_publickey_mapping_many?:
      | Array<
          | GraphQLTypes["auth_user_active_publickey_mapping_mutation_response"]
          | undefined
        >
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
    /** update data of the table: "auth.xnft_preferences" */
    update_auth_xnft_preferences?:
      | GraphQLTypes["auth_xnft_preferences_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.xnft_preferences" */
    update_auth_xnft_preferences_by_pk?:
      | GraphQLTypes["auth_xnft_preferences"]
      | undefined;
    /** update multiples rows of table: "auth.xnft_preferences" */
    update_auth_xnft_preferences_many?:
      | Array<
          GraphQLTypes["auth_xnft_preferences_mutation_response"] | undefined
        >
      | undefined;
    /** update data of the table: "auth.xnft_secrets" */
    update_auth_xnft_secrets?:
      | GraphQLTypes["auth_xnft_secrets_mutation_response"]
      | undefined;
    /** update single row of the table: "auth.xnft_secrets" */
    update_auth_xnft_secrets_by_pk?:
      | GraphQLTypes["auth_xnft_secrets"]
      | undefined;
    /** update multiples rows of table: "auth.xnft_secrets" */
    update_auth_xnft_secrets_many?:
      | Array<GraphQLTypes["auth_xnft_secrets_mutation_response"] | undefined>
      | undefined;
  };
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: {
    __typename: "query_root";
    /** fetch data from the table: "auth.collection_messages" */
    auth_collection_messages: Array<GraphQLTypes["auth_collection_messages"]>;
    /** fetch data from the table: "auth.collection_messages" using primary key columns */
    auth_collection_messages_by_pk?:
      | GraphQLTypes["auth_collection_messages"]
      | undefined;
    /** fetch data from the table: "auth.collections" */
    auth_collections: Array<GraphQLTypes["auth_collections"]>;
    /** fetch data from the table: "auth.collections" using primary key columns */
    auth_collections_by_pk?: GraphQLTypes["auth_collections"] | undefined;
    /** fetch data from the table: "auth.friend_requests" */
    auth_friend_requests: Array<GraphQLTypes["auth_friend_requests"]>;
    /** fetch data from the table: "auth.friend_requests" using primary key columns */
    auth_friend_requests_by_pk?:
      | GraphQLTypes["auth_friend_requests"]
      | undefined;
    /** fetch data from the table: "auth.friendships" */
    auth_friendships: Array<GraphQLTypes["auth_friendships"]>;
    /** fetch aggregated fields from the table: "auth.friendships" */
    auth_friendships_aggregate: GraphQLTypes["auth_friendships_aggregate"];
    /** fetch data from the table: "auth.friendships" using primary key columns */
    auth_friendships_by_pk?: GraphQLTypes["auth_friendships"] | undefined;
    /** fetch data from the table: "auth.invitations" */
    auth_invitations: Array<GraphQLTypes["auth_invitations"]>;
    /** fetch data from the table: "auth.invitations" using primary key columns */
    auth_invitations_by_pk?: GraphQLTypes["auth_invitations"] | undefined;
    /** fetch data from the table: "auth.notification_cursor" */
    auth_notification_cursor: Array<GraphQLTypes["auth_notification_cursor"]>;
    /** fetch data from the table: "auth.notification_cursor" using primary key columns */
    auth_notification_cursor_by_pk?:
      | GraphQLTypes["auth_notification_cursor"]
      | undefined;
    /** fetch data from the table: "auth.notification_subscriptions" */
    auth_notification_subscriptions: Array<
      GraphQLTypes["auth_notification_subscriptions"]
    >;
    /** fetch data from the table: "auth.notification_subscriptions" using primary key columns */
    auth_notification_subscriptions_by_pk?:
      | GraphQLTypes["auth_notification_subscriptions"]
      | undefined;
    /** fetch data from the table: "auth.notifications" */
    auth_notifications: Array<GraphQLTypes["auth_notifications"]>;
    /** fetch aggregated fields from the table: "auth.notifications" */
    auth_notifications_aggregate: GraphQLTypes["auth_notifications_aggregate"];
    /** fetch data from the table: "auth.notifications" using primary key columns */
    auth_notifications_by_pk?: GraphQLTypes["auth_notifications"] | undefined;
    /** fetch data from the table: "auth.public_keys" */
    auth_public_keys: Array<GraphQLTypes["auth_public_keys"]>;
    /** fetch aggregated fields from the table: "auth.public_keys" */
    auth_public_keys_aggregate: GraphQLTypes["auth_public_keys_aggregate"];
    /** fetch data from the table: "auth.public_keys" using primary key columns */
    auth_public_keys_by_pk?: GraphQLTypes["auth_public_keys"] | undefined;
    /** fetch data from the table: "auth.stripe_onramp" */
    auth_stripe_onramp: Array<GraphQLTypes["auth_stripe_onramp"]>;
    /** fetch data from the table: "auth.stripe_onramp" using primary key columns */
    auth_stripe_onramp_by_pk?: GraphQLTypes["auth_stripe_onramp"] | undefined;
    /** fetch data from the table: "auth.user_active_publickey_mapping" */
    auth_user_active_publickey_mapping: Array<
      GraphQLTypes["auth_user_active_publickey_mapping"]
    >;
    /** fetch data from the table: "auth.user_active_publickey_mapping" using primary key columns */
    auth_user_active_publickey_mapping_by_pk?:
      | GraphQLTypes["auth_user_active_publickey_mapping"]
      | undefined;
    /** fetch data from the table: "auth.user_nfts" */
    auth_user_nfts: Array<GraphQLTypes["auth_user_nfts"]>;
    /** fetch aggregated fields from the table: "auth.user_nfts" */
    auth_user_nfts_aggregate: GraphQLTypes["auth_user_nfts_aggregate"];
    /** fetch data from the table: "auth.user_nfts" using primary key columns */
    auth_user_nfts_by_pk?: GraphQLTypes["auth_user_nfts"] | undefined;
    /** fetch data from the table: "auth.users" */
    auth_users: Array<GraphQLTypes["auth_users"]>;
    /** fetch aggregated fields from the table: "auth.users" */
    auth_users_aggregate: GraphQLTypes["auth_users_aggregate"];
    /** fetch data from the table: "auth.users" using primary key columns */
    auth_users_by_pk?: GraphQLTypes["auth_users"] | undefined;
    /** fetch data from the table: "auth.xnft_preferences" */
    auth_xnft_preferences: Array<GraphQLTypes["auth_xnft_preferences"]>;
    /** fetch data from the table: "auth.xnft_preferences" using primary key columns */
    auth_xnft_preferences_by_pk?:
      | GraphQLTypes["auth_xnft_preferences"]
      | undefined;
    /** fetch data from the table: "auth.xnft_secrets" */
    auth_xnft_secrets: Array<GraphQLTypes["auth_xnft_secrets"]>;
    /** fetch data from the table: "auth.xnft_secrets" using primary key columns */
    auth_xnft_secrets_by_pk?: GraphQLTypes["auth_xnft_secrets"] | undefined;
    /** fetch data from the table: "dropzone.distributors" */
    dropzone_distributors: Array<GraphQLTypes["dropzone_distributors"]>;
    /** fetch aggregated fields from the table: "dropzone.distributors" */
    dropzone_distributors_aggregate: GraphQLTypes["dropzone_distributors_aggregate"];
    /** fetch data from the table: "dropzone.distributors" using primary key columns */
    dropzone_distributors_by_pk?:
      | GraphQLTypes["dropzone_distributors"]
      | undefined;
    /** execute function "dropzone.user_dropzone_public_key" which returns "auth.public_keys" */
    dropzone_user_dropzone_public_key?:
      | GraphQLTypes["auth_public_keys"]
      | undefined;
    /** execute function "dropzone.user_dropzone_public_key" and query aggregates on result of table type "auth.public_keys" */
    dropzone_user_dropzone_public_key_aggregate: GraphQLTypes["auth_public_keys_aggregate"];
    /** fetch data from the table: "invitations" */
    invitations: Array<GraphQLTypes["invitations"]>;
    /** fetch aggregated fields from the table: "invitations" */
    invitations_aggregate: GraphQLTypes["invitations_aggregate"];
  };
  ["subscription_root"]: {
    __typename: "subscription_root";
    /** fetch data from the table: "auth.collection_messages" */
    auth_collection_messages: Array<GraphQLTypes["auth_collection_messages"]>;
    /** fetch data from the table: "auth.collection_messages" using primary key columns */
    auth_collection_messages_by_pk?:
      | GraphQLTypes["auth_collection_messages"]
      | undefined;
    /** fetch data from the table in a streaming manner: "auth.collection_messages" */
    auth_collection_messages_stream: Array<
      GraphQLTypes["auth_collection_messages"]
    >;
    /** fetch data from the table: "auth.collections" */
    auth_collections: Array<GraphQLTypes["auth_collections"]>;
    /** fetch data from the table: "auth.collections" using primary key columns */
    auth_collections_by_pk?: GraphQLTypes["auth_collections"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.collections" */
    auth_collections_stream: Array<GraphQLTypes["auth_collections"]>;
    /** fetch data from the table: "auth.friend_requests" */
    auth_friend_requests: Array<GraphQLTypes["auth_friend_requests"]>;
    /** fetch data from the table: "auth.friend_requests" using primary key columns */
    auth_friend_requests_by_pk?:
      | GraphQLTypes["auth_friend_requests"]
      | undefined;
    /** fetch data from the table in a streaming manner: "auth.friend_requests" */
    auth_friend_requests_stream: Array<GraphQLTypes["auth_friend_requests"]>;
    /** fetch data from the table: "auth.friendships" */
    auth_friendships: Array<GraphQLTypes["auth_friendships"]>;
    /** fetch aggregated fields from the table: "auth.friendships" */
    auth_friendships_aggregate: GraphQLTypes["auth_friendships_aggregate"];
    /** fetch data from the table: "auth.friendships" using primary key columns */
    auth_friendships_by_pk?: GraphQLTypes["auth_friendships"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.friendships" */
    auth_friendships_stream: Array<GraphQLTypes["auth_friendships"]>;
    /** fetch data from the table: "auth.invitations" */
    auth_invitations: Array<GraphQLTypes["auth_invitations"]>;
    /** fetch data from the table: "auth.invitations" using primary key columns */
    auth_invitations_by_pk?: GraphQLTypes["auth_invitations"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.invitations" */
    auth_invitations_stream: Array<GraphQLTypes["auth_invitations"]>;
    /** fetch data from the table: "auth.notification_cursor" */
    auth_notification_cursor: Array<GraphQLTypes["auth_notification_cursor"]>;
    /** fetch data from the table: "auth.notification_cursor" using primary key columns */
    auth_notification_cursor_by_pk?:
      | GraphQLTypes["auth_notification_cursor"]
      | undefined;
    /** fetch data from the table in a streaming manner: "auth.notification_cursor" */
    auth_notification_cursor_stream: Array<
      GraphQLTypes["auth_notification_cursor"]
    >;
    /** fetch data from the table: "auth.notification_subscriptions" */
    auth_notification_subscriptions: Array<
      GraphQLTypes["auth_notification_subscriptions"]
    >;
    /** fetch data from the table: "auth.notification_subscriptions" using primary key columns */
    auth_notification_subscriptions_by_pk?:
      | GraphQLTypes["auth_notification_subscriptions"]
      | undefined;
    /** fetch data from the table in a streaming manner: "auth.notification_subscriptions" */
    auth_notification_subscriptions_stream: Array<
      GraphQLTypes["auth_notification_subscriptions"]
    >;
    /** fetch data from the table: "auth.notifications" */
    auth_notifications: Array<GraphQLTypes["auth_notifications"]>;
    /** fetch aggregated fields from the table: "auth.notifications" */
    auth_notifications_aggregate: GraphQLTypes["auth_notifications_aggregate"];
    /** fetch data from the table: "auth.notifications" using primary key columns */
    auth_notifications_by_pk?: GraphQLTypes["auth_notifications"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.notifications" */
    auth_notifications_stream: Array<GraphQLTypes["auth_notifications"]>;
    /** fetch data from the table: "auth.public_keys" */
    auth_public_keys: Array<GraphQLTypes["auth_public_keys"]>;
    /** fetch aggregated fields from the table: "auth.public_keys" */
    auth_public_keys_aggregate: GraphQLTypes["auth_public_keys_aggregate"];
    /** fetch data from the table: "auth.public_keys" using primary key columns */
    auth_public_keys_by_pk?: GraphQLTypes["auth_public_keys"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.public_keys" */
    auth_public_keys_stream: Array<GraphQLTypes["auth_public_keys"]>;
    /** fetch data from the table: "auth.stripe_onramp" */
    auth_stripe_onramp: Array<GraphQLTypes["auth_stripe_onramp"]>;
    /** fetch data from the table: "auth.stripe_onramp" using primary key columns */
    auth_stripe_onramp_by_pk?: GraphQLTypes["auth_stripe_onramp"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.stripe_onramp" */
    auth_stripe_onramp_stream: Array<GraphQLTypes["auth_stripe_onramp"]>;
    /** fetch data from the table: "auth.user_active_publickey_mapping" */
    auth_user_active_publickey_mapping: Array<
      GraphQLTypes["auth_user_active_publickey_mapping"]
    >;
    /** fetch data from the table: "auth.user_active_publickey_mapping" using primary key columns */
    auth_user_active_publickey_mapping_by_pk?:
      | GraphQLTypes["auth_user_active_publickey_mapping"]
      | undefined;
    /** fetch data from the table in a streaming manner: "auth.user_active_publickey_mapping" */
    auth_user_active_publickey_mapping_stream: Array<
      GraphQLTypes["auth_user_active_publickey_mapping"]
    >;
    /** fetch data from the table: "auth.user_nfts" */
    auth_user_nfts: Array<GraphQLTypes["auth_user_nfts"]>;
    /** fetch aggregated fields from the table: "auth.user_nfts" */
    auth_user_nfts_aggregate: GraphQLTypes["auth_user_nfts_aggregate"];
    /** fetch data from the table: "auth.user_nfts" using primary key columns */
    auth_user_nfts_by_pk?: GraphQLTypes["auth_user_nfts"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.user_nfts" */
    auth_user_nfts_stream: Array<GraphQLTypes["auth_user_nfts"]>;
    /** fetch data from the table: "auth.users" */
    auth_users: Array<GraphQLTypes["auth_users"]>;
    /** fetch aggregated fields from the table: "auth.users" */
    auth_users_aggregate: GraphQLTypes["auth_users_aggregate"];
    /** fetch data from the table: "auth.users" using primary key columns */
    auth_users_by_pk?: GraphQLTypes["auth_users"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.users" */
    auth_users_stream: Array<GraphQLTypes["auth_users"]>;
    /** fetch data from the table: "auth.xnft_preferences" */
    auth_xnft_preferences: Array<GraphQLTypes["auth_xnft_preferences"]>;
    /** fetch data from the table: "auth.xnft_preferences" using primary key columns */
    auth_xnft_preferences_by_pk?:
      | GraphQLTypes["auth_xnft_preferences"]
      | undefined;
    /** fetch data from the table in a streaming manner: "auth.xnft_preferences" */
    auth_xnft_preferences_stream: Array<GraphQLTypes["auth_xnft_preferences"]>;
    /** fetch data from the table: "auth.xnft_secrets" */
    auth_xnft_secrets: Array<GraphQLTypes["auth_xnft_secrets"]>;
    /** fetch data from the table: "auth.xnft_secrets" using primary key columns */
    auth_xnft_secrets_by_pk?: GraphQLTypes["auth_xnft_secrets"] | undefined;
    /** fetch data from the table in a streaming manner: "auth.xnft_secrets" */
    auth_xnft_secrets_stream: Array<GraphQLTypes["auth_xnft_secrets"]>;
    /** fetch data from the table: "dropzone.distributors" */
    dropzone_distributors: Array<GraphQLTypes["dropzone_distributors"]>;
    /** fetch aggregated fields from the table: "dropzone.distributors" */
    dropzone_distributors_aggregate: GraphQLTypes["dropzone_distributors_aggregate"];
    /** fetch data from the table: "dropzone.distributors" using primary key columns */
    dropzone_distributors_by_pk?:
      | GraphQLTypes["dropzone_distributors"]
      | undefined;
    /** fetch data from the table in a streaming manner: "dropzone.distributors" */
    dropzone_distributors_stream: Array<GraphQLTypes["dropzone_distributors"]>;
    /** execute function "dropzone.user_dropzone_public_key" which returns "auth.public_keys" */
    dropzone_user_dropzone_public_key?:
      | GraphQLTypes["auth_public_keys"]
      | undefined;
    /** execute function "dropzone.user_dropzone_public_key" and query aggregates on result of table type "auth.public_keys" */
    dropzone_user_dropzone_public_key_aggregate: GraphQLTypes["auth_public_keys_aggregate"];
    /** fetch data from the table: "invitations" */
    invitations: Array<GraphQLTypes["invitations"]>;
    /** fetch aggregated fields from the table: "invitations" */
    invitations_aggregate: GraphQLTypes["invitations_aggregate"];
    /** fetch data from the table in a streaming manner: "invitations" */
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
  ["users_scalar"]: "scalar" & { name: "users_scalar" };
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
/** unique or primary key constraints on table "auth.collection_messages" */
export const enum auth_collection_messages_constraint {
  collection_messages_pkey = "collection_messages_pkey",
}
/** select columns of table "auth.collection_messages" */
export const enum auth_collection_messages_select_column {
  collection_id = "collection_id",
  last_read_message_id = "last_read_message_id",
  uuid = "uuid",
}
/** update columns of table "auth.collection_messages" */
export const enum auth_collection_messages_update_column {
  collection_id = "collection_id",
  last_read_message_id = "last_read_message_id",
  uuid = "uuid",
}
/** unique or primary key constraints on table "auth.collections" */
export const enum auth_collections_constraint {
  collections_collection_id_type_key = "collections_collection_id_type_key",
  collections_pkey = "collections_pkey",
  collections_type = "collections_type",
}
/** select columns of table "auth.collections" */
export const enum auth_collections_select_column {
  collection_id = "collection_id",
  id = "id",
  last_message = "last_message",
  last_message_timestamp = "last_message_timestamp",
  last_message_uuid = "last_message_uuid",
  type = "type",
}
/** update columns of table "auth.collections" */
export const enum auth_collections_update_column {
  collection_id = "collection_id",
  id = "id",
  last_message = "last_message",
  last_message_timestamp = "last_message_timestamp",
  last_message_uuid = "last_message_uuid",
  type = "type",
}
/** unique or primary key constraints on table "auth.friend_requests" */
export const enum auth_friend_requests_constraint {
  friend_requests_pkey = "friend_requests_pkey",
}
/** select columns of table "auth.friend_requests" */
export const enum auth_friend_requests_select_column {
  from = "from",
  id = "id",
  to = "to",
}
/** placeholder for update columns of table "auth.friend_requests" (current role has no relevant permissions) */
export const enum auth_friend_requests_update_column {
  _PLACEHOLDER = "_PLACEHOLDER",
}
/** unique or primary key constraints on table "auth.friendships" */
export const enum auth_friendships_constraint {
  friendships_pkey = "friendships_pkey",
}
/** select columns of table "auth.friendships" */
export const enum auth_friendships_select_column {
  are_friends = "are_friends",
  id = "id",
  last_message = "last_message",
  last_message_client_uuid = "last_message_client_uuid",
  last_message_sender = "last_message_sender",
  last_message_timestamp = "last_message_timestamp",
  user1 = "user1",
  user1_blocked_user2 = "user1_blocked_user2",
  user1_interacted = "user1_interacted",
  user1_last_read_message_id = "user1_last_read_message_id",
  user1_spam_user2 = "user1_spam_user2",
  user2 = "user2",
  user2_blocked_user1 = "user2_blocked_user1",
  user2_interacted = "user2_interacted",
  user2_last_read_message_id = "user2_last_read_message_id",
  user2_spam_user1 = "user2_spam_user1",
}
/** update columns of table "auth.friendships" */
export const enum auth_friendships_update_column {
  are_friends = "are_friends",
  id = "id",
  last_message = "last_message",
  last_message_client_uuid = "last_message_client_uuid",
  last_message_sender = "last_message_sender",
  last_message_timestamp = "last_message_timestamp",
  user1 = "user1",
  user1_blocked_user2 = "user1_blocked_user2",
  user1_interacted = "user1_interacted",
  user1_last_read_message_id = "user1_last_read_message_id",
  user1_spam_user2 = "user1_spam_user2",
  user2 = "user2",
  user2_blocked_user1 = "user2_blocked_user1",
  user2_interacted = "user2_interacted",
  user2_last_read_message_id = "user2_last_read_message_id",
  user2_spam_user1 = "user2_spam_user1",
}
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
/** placeholder for update columns of table "auth.invitations" (current role has no relevant permissions) */
export const enum auth_invitations_update_column {
  _PLACEHOLDER = "_PLACEHOLDER",
}
/** unique or primary key constraints on table "auth.notification_cursor" */
export const enum auth_notification_cursor_constraint {
  notification_cursor_pkey = "notification_cursor_pkey",
}
/** select columns of table "auth.notification_cursor" */
export const enum auth_notification_cursor_select_column {
  last_read_notificaiton = "last_read_notificaiton",
  uuid = "uuid",
}
/** update columns of table "auth.notification_cursor" */
export const enum auth_notification_cursor_update_column {
  last_read_notificaiton = "last_read_notificaiton",
  uuid = "uuid",
}
/** unique or primary key constraints on table "auth.notification_subscriptions" */
export const enum auth_notification_subscriptions_constraint {
  notification_subscriptions_pkey = "notification_subscriptions_pkey",
}
/** select columns of table "auth.notification_subscriptions" */
export const enum auth_notification_subscriptions_select_column {
  auth = "auth",
  endpoint = "endpoint",
  expirationTime = "expirationTime",
  id = "id",
  p256dh = "p256dh",
  public_key = "public_key",
  username = "username",
  uuid = "uuid",
}
/** update columns of table "auth.notification_subscriptions" */
export const enum auth_notification_subscriptions_update_column {
  auth = "auth",
  endpoint = "endpoint",
  expirationTime = "expirationTime",
  id = "id",
  p256dh = "p256dh",
  public_key = "public_key",
  username = "username",
}
/** unique or primary key constraints on table "auth.notifications" */
export const enum auth_notifications_constraint {
  notifications_pkey = "notifications_pkey",
}
/** select columns of table "auth.notifications" */
export const enum auth_notifications_select_column {
  body = "body",
  id = "id",
  image = "image",
  timestamp = "timestamp",
  title = "title",
  username = "username",
  uuid = "uuid",
  viewed = "viewed",
  xnft_id = "xnft_id",
}
/** update columns of table "auth.notifications" */
export const enum auth_notifications_update_column {
  body = "body",
  id = "id",
  image = "image",
  title = "title",
  username = "username",
  uuid = "uuid",
  viewed = "viewed",
  xnft_id = "xnft_id",
}
/** unique or primary key constraints on table "auth.public_keys" */
export const enum auth_public_keys_constraint {
  public_keys_blockchain_public_key_key = "public_keys_blockchain_public_key_key",
  public_keys_pkey = "public_keys_pkey",
}
/** select columns of table "auth.public_keys" */
export const enum auth_public_keys_select_column {
  blockchain = "blockchain",
  created_at = "created_at",
  id = "id",
  public_key = "public_key",
  user_id = "user_id",
}
/** placeholder for update columns of table "auth.public_keys" (current role has no relevant permissions) */
export const enum auth_public_keys_update_column {
  _PLACEHOLDER = "_PLACEHOLDER",
}
/** unique or primary key constraints on table "auth.stripe_onramp" */
export const enum auth_stripe_onramp_constraint {
  stripe_onramp_pkey = "stripe_onramp_pkey",
}
/** select columns of table "auth.stripe_onramp" */
export const enum auth_stripe_onramp_select_column {
  client_secret = "client_secret",
  id = "id",
  public_key = "public_key",
  status = "status",
  webhook_dump = "webhook_dump",
}
/** update columns of table "auth.stripe_onramp" */
export const enum auth_stripe_onramp_update_column {
  client_secret = "client_secret",
  id = "id",
  public_key = "public_key",
  status = "status",
  webhook_dump = "webhook_dump",
}
/** unique or primary key constraints on table "auth.user_active_publickey_mapping" */
export const enum auth_user_active_publickey_mapping_constraint {
  user_active_publickey_mapping_pkey = "user_active_publickey_mapping_pkey",
}
/** select columns of table "auth.user_active_publickey_mapping" */
export const enum auth_user_active_publickey_mapping_select_column {
  blockchain = "blockchain",
  public_key_id = "public_key_id",
  user_id = "user_id",
}
/** update columns of table "auth.user_active_publickey_mapping" */
export const enum auth_user_active_publickey_mapping_update_column {
  blockchain = "blockchain",
  public_key_id = "public_key_id",
  user_id = "user_id",
}
/** unique or primary key constraints on table "auth.user_nfts" */
export const enum auth_user_nfts_constraint {
  user_nfts_pkey = "user_nfts_pkey",
}
/** select columns of table "auth.user_nfts" */
export const enum auth_user_nfts_select_column {
  blockchain = "blockchain",
  centralized_group = "centralized_group",
  collection_id = "collection_id",
  nft_id = "nft_id",
  public_key = "public_key",
}
/** placeholder for update columns of table "auth.user_nfts" (current role has no relevant permissions) */
export const enum auth_user_nfts_update_column {
  _PLACEHOLDER = "_PLACEHOLDER",
}
/** unique or primary key constraints on table "auth.users" */
export const enum auth_users_constraint {
  users_invitation_id_key = "users_invitation_id_key",
  users_pkey = "users_pkey",
  users_username_key = "users_username_key",
}
/** select columns of table "auth.users" */
export const enum auth_users_select_column {
  created_at = "created_at",
  id = "id",
  username = "username",
}
/** update columns of table "auth.users" */
export const enum auth_users_update_column {
  avatar_nft = "avatar_nft",
  updated_at = "updated_at",
}
/** unique or primary key constraints on table "auth.xnft_preferences" */
export const enum auth_xnft_preferences_constraint {
  xnft_preferences_pkey = "xnft_preferences_pkey",
}
/** select columns of table "auth.xnft_preferences" */
export const enum auth_xnft_preferences_select_column {
  disabled = "disabled",
  id = "id",
  media = "media",
  notifications = "notifications",
  username = "username",
  uuid = "uuid",
  xnft_id = "xnft_id",
}
/** update columns of table "auth.xnft_preferences" */
export const enum auth_xnft_preferences_update_column {
  disabled = "disabled",
  id = "id",
  media = "media",
  notifications = "notifications",
  username = "username",
  uuid = "uuid",
  xnft_id = "xnft_id",
}
/** unique or primary key constraints on table "auth.xnft_secrets" */
export const enum auth_xnft_secrets_constraint {
  xnft_secrets_pkey = "xnft_secrets_pkey",
}
/** select columns of table "auth.xnft_secrets" */
export const enum auth_xnft_secrets_select_column {
  id = "id",
  secret = "secret",
  xnft_id = "xnft_id",
}
/** update columns of table "auth.xnft_secrets" */
export const enum auth_xnft_secrets_update_column {
  id = "id",
  secret = "secret",
  xnft_id = "xnft_id",
}
/** ordering argument of a cursor */
export const enum cursor_ordering {
  ASC = "ASC",
  DESC = "DESC",
}
/** unique or primary key constraints on table "dropzone.distributors" */
export const enum dropzone_distributors_constraint {
  distributors_pkey = "distributors_pkey",
}
/** select columns of table "dropzone.distributors" */
export const enum dropzone_distributors_select_column {
  created_at = "created_at",
  data = "data",
  id = "id",
  mint = "mint",
}
/** placeholder for update columns of table "dropzone.distributors" (current role has no relevant permissions) */
export const enum dropzone_distributors_update_column {
  _PLACEHOLDER = "_PLACEHOLDER",
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
  ["auth_collection_messages_bool_exp"]: ValueTypes["auth_collection_messages_bool_exp"];
  ["auth_collection_messages_constraint"]: ValueTypes["auth_collection_messages_constraint"];
  ["auth_collection_messages_insert_input"]: ValueTypes["auth_collection_messages_insert_input"];
  ["auth_collection_messages_on_conflict"]: ValueTypes["auth_collection_messages_on_conflict"];
  ["auth_collection_messages_order_by"]: ValueTypes["auth_collection_messages_order_by"];
  ["auth_collection_messages_pk_columns_input"]: ValueTypes["auth_collection_messages_pk_columns_input"];
  ["auth_collection_messages_select_column"]: ValueTypes["auth_collection_messages_select_column"];
  ["auth_collection_messages_set_input"]: ValueTypes["auth_collection_messages_set_input"];
  ["auth_collection_messages_stream_cursor_input"]: ValueTypes["auth_collection_messages_stream_cursor_input"];
  ["auth_collection_messages_stream_cursor_value_input"]: ValueTypes["auth_collection_messages_stream_cursor_value_input"];
  ["auth_collection_messages_update_column"]: ValueTypes["auth_collection_messages_update_column"];
  ["auth_collection_messages_updates"]: ValueTypes["auth_collection_messages_updates"];
  ["auth_collections_bool_exp"]: ValueTypes["auth_collections_bool_exp"];
  ["auth_collections_constraint"]: ValueTypes["auth_collections_constraint"];
  ["auth_collections_inc_input"]: ValueTypes["auth_collections_inc_input"];
  ["auth_collections_insert_input"]: ValueTypes["auth_collections_insert_input"];
  ["auth_collections_on_conflict"]: ValueTypes["auth_collections_on_conflict"];
  ["auth_collections_order_by"]: ValueTypes["auth_collections_order_by"];
  ["auth_collections_pk_columns_input"]: ValueTypes["auth_collections_pk_columns_input"];
  ["auth_collections_select_column"]: ValueTypes["auth_collections_select_column"];
  ["auth_collections_set_input"]: ValueTypes["auth_collections_set_input"];
  ["auth_collections_stream_cursor_input"]: ValueTypes["auth_collections_stream_cursor_input"];
  ["auth_collections_stream_cursor_value_input"]: ValueTypes["auth_collections_stream_cursor_value_input"];
  ["auth_collections_update_column"]: ValueTypes["auth_collections_update_column"];
  ["auth_collections_updates"]: ValueTypes["auth_collections_updates"];
  ["auth_friend_requests_bool_exp"]: ValueTypes["auth_friend_requests_bool_exp"];
  ["auth_friend_requests_constraint"]: ValueTypes["auth_friend_requests_constraint"];
  ["auth_friend_requests_insert_input"]: ValueTypes["auth_friend_requests_insert_input"];
  ["auth_friend_requests_on_conflict"]: ValueTypes["auth_friend_requests_on_conflict"];
  ["auth_friend_requests_order_by"]: ValueTypes["auth_friend_requests_order_by"];
  ["auth_friend_requests_select_column"]: ValueTypes["auth_friend_requests_select_column"];
  ["auth_friend_requests_stream_cursor_input"]: ValueTypes["auth_friend_requests_stream_cursor_input"];
  ["auth_friend_requests_stream_cursor_value_input"]: ValueTypes["auth_friend_requests_stream_cursor_value_input"];
  ["auth_friend_requests_update_column"]: ValueTypes["auth_friend_requests_update_column"];
  ["auth_friendships_bool_exp"]: ValueTypes["auth_friendships_bool_exp"];
  ["auth_friendships_constraint"]: ValueTypes["auth_friendships_constraint"];
  ["auth_friendships_inc_input"]: ValueTypes["auth_friendships_inc_input"];
  ["auth_friendships_insert_input"]: ValueTypes["auth_friendships_insert_input"];
  ["auth_friendships_on_conflict"]: ValueTypes["auth_friendships_on_conflict"];
  ["auth_friendships_order_by"]: ValueTypes["auth_friendships_order_by"];
  ["auth_friendships_pk_columns_input"]: ValueTypes["auth_friendships_pk_columns_input"];
  ["auth_friendships_select_column"]: ValueTypes["auth_friendships_select_column"];
  ["auth_friendships_set_input"]: ValueTypes["auth_friendships_set_input"];
  ["auth_friendships_stream_cursor_input"]: ValueTypes["auth_friendships_stream_cursor_input"];
  ["auth_friendships_stream_cursor_value_input"]: ValueTypes["auth_friendships_stream_cursor_value_input"];
  ["auth_friendships_update_column"]: ValueTypes["auth_friendships_update_column"];
  ["auth_friendships_updates"]: ValueTypes["auth_friendships_updates"];
  ["auth_invitations_bool_exp"]: ValueTypes["auth_invitations_bool_exp"];
  ["auth_invitations_constraint"]: ValueTypes["auth_invitations_constraint"];
  ["auth_invitations_insert_input"]: ValueTypes["auth_invitations_insert_input"];
  ["auth_invitations_obj_rel_insert_input"]: ValueTypes["auth_invitations_obj_rel_insert_input"];
  ["auth_invitations_on_conflict"]: ValueTypes["auth_invitations_on_conflict"];
  ["auth_invitations_order_by"]: ValueTypes["auth_invitations_order_by"];
  ["auth_invitations_select_column"]: ValueTypes["auth_invitations_select_column"];
  ["auth_invitations_stream_cursor_input"]: ValueTypes["auth_invitations_stream_cursor_input"];
  ["auth_invitations_stream_cursor_value_input"]: ValueTypes["auth_invitations_stream_cursor_value_input"];
  ["auth_invitations_update_column"]: ValueTypes["auth_invitations_update_column"];
  ["auth_notification_cursor_bool_exp"]: ValueTypes["auth_notification_cursor_bool_exp"];
  ["auth_notification_cursor_constraint"]: ValueTypes["auth_notification_cursor_constraint"];
  ["auth_notification_cursor_inc_input"]: ValueTypes["auth_notification_cursor_inc_input"];
  ["auth_notification_cursor_insert_input"]: ValueTypes["auth_notification_cursor_insert_input"];
  ["auth_notification_cursor_on_conflict"]: ValueTypes["auth_notification_cursor_on_conflict"];
  ["auth_notification_cursor_order_by"]: ValueTypes["auth_notification_cursor_order_by"];
  ["auth_notification_cursor_pk_columns_input"]: ValueTypes["auth_notification_cursor_pk_columns_input"];
  ["auth_notification_cursor_select_column"]: ValueTypes["auth_notification_cursor_select_column"];
  ["auth_notification_cursor_set_input"]: ValueTypes["auth_notification_cursor_set_input"];
  ["auth_notification_cursor_stream_cursor_input"]: ValueTypes["auth_notification_cursor_stream_cursor_input"];
  ["auth_notification_cursor_stream_cursor_value_input"]: ValueTypes["auth_notification_cursor_stream_cursor_value_input"];
  ["auth_notification_cursor_update_column"]: ValueTypes["auth_notification_cursor_update_column"];
  ["auth_notification_cursor_updates"]: ValueTypes["auth_notification_cursor_updates"];
  ["auth_notification_subscriptions_bool_exp"]: ValueTypes["auth_notification_subscriptions_bool_exp"];
  ["auth_notification_subscriptions_constraint"]: ValueTypes["auth_notification_subscriptions_constraint"];
  ["auth_notification_subscriptions_inc_input"]: ValueTypes["auth_notification_subscriptions_inc_input"];
  ["auth_notification_subscriptions_insert_input"]: ValueTypes["auth_notification_subscriptions_insert_input"];
  ["auth_notification_subscriptions_on_conflict"]: ValueTypes["auth_notification_subscriptions_on_conflict"];
  ["auth_notification_subscriptions_order_by"]: ValueTypes["auth_notification_subscriptions_order_by"];
  ["auth_notification_subscriptions_pk_columns_input"]: ValueTypes["auth_notification_subscriptions_pk_columns_input"];
  ["auth_notification_subscriptions_select_column"]: ValueTypes["auth_notification_subscriptions_select_column"];
  ["auth_notification_subscriptions_set_input"]: ValueTypes["auth_notification_subscriptions_set_input"];
  ["auth_notification_subscriptions_stream_cursor_input"]: ValueTypes["auth_notification_subscriptions_stream_cursor_input"];
  ["auth_notification_subscriptions_stream_cursor_value_input"]: ValueTypes["auth_notification_subscriptions_stream_cursor_value_input"];
  ["auth_notification_subscriptions_update_column"]: ValueTypes["auth_notification_subscriptions_update_column"];
  ["auth_notification_subscriptions_updates"]: ValueTypes["auth_notification_subscriptions_updates"];
  ["auth_notifications_bool_exp"]: ValueTypes["auth_notifications_bool_exp"];
  ["auth_notifications_constraint"]: ValueTypes["auth_notifications_constraint"];
  ["auth_notifications_inc_input"]: ValueTypes["auth_notifications_inc_input"];
  ["auth_notifications_insert_input"]: ValueTypes["auth_notifications_insert_input"];
  ["auth_notifications_on_conflict"]: ValueTypes["auth_notifications_on_conflict"];
  ["auth_notifications_order_by"]: ValueTypes["auth_notifications_order_by"];
  ["auth_notifications_pk_columns_input"]: ValueTypes["auth_notifications_pk_columns_input"];
  ["auth_notifications_select_column"]: ValueTypes["auth_notifications_select_column"];
  ["auth_notifications_set_input"]: ValueTypes["auth_notifications_set_input"];
  ["auth_notifications_stream_cursor_input"]: ValueTypes["auth_notifications_stream_cursor_input"];
  ["auth_notifications_stream_cursor_value_input"]: ValueTypes["auth_notifications_stream_cursor_value_input"];
  ["auth_notifications_update_column"]: ValueTypes["auth_notifications_update_column"];
  ["auth_notifications_updates"]: ValueTypes["auth_notifications_updates"];
  ["auth_public_keys_aggregate_bool_exp"]: ValueTypes["auth_public_keys_aggregate_bool_exp"];
  ["auth_public_keys_aggregate_bool_exp_count"]: ValueTypes["auth_public_keys_aggregate_bool_exp_count"];
  ["auth_public_keys_aggregate_order_by"]: ValueTypes["auth_public_keys_aggregate_order_by"];
  ["auth_public_keys_arr_rel_insert_input"]: ValueTypes["auth_public_keys_arr_rel_insert_input"];
  ["auth_public_keys_avg_order_by"]: ValueTypes["auth_public_keys_avg_order_by"];
  ["auth_public_keys_bool_exp"]: ValueTypes["auth_public_keys_bool_exp"];
  ["auth_public_keys_constraint"]: ValueTypes["auth_public_keys_constraint"];
  ["auth_public_keys_insert_input"]: ValueTypes["auth_public_keys_insert_input"];
  ["auth_public_keys_max_order_by"]: ValueTypes["auth_public_keys_max_order_by"];
  ["auth_public_keys_min_order_by"]: ValueTypes["auth_public_keys_min_order_by"];
  ["auth_public_keys_obj_rel_insert_input"]: ValueTypes["auth_public_keys_obj_rel_insert_input"];
  ["auth_public_keys_on_conflict"]: ValueTypes["auth_public_keys_on_conflict"];
  ["auth_public_keys_order_by"]: ValueTypes["auth_public_keys_order_by"];
  ["auth_public_keys_select_column"]: ValueTypes["auth_public_keys_select_column"];
  ["auth_public_keys_stddev_order_by"]: ValueTypes["auth_public_keys_stddev_order_by"];
  ["auth_public_keys_stddev_pop_order_by"]: ValueTypes["auth_public_keys_stddev_pop_order_by"];
  ["auth_public_keys_stddev_samp_order_by"]: ValueTypes["auth_public_keys_stddev_samp_order_by"];
  ["auth_public_keys_stream_cursor_input"]: ValueTypes["auth_public_keys_stream_cursor_input"];
  ["auth_public_keys_stream_cursor_value_input"]: ValueTypes["auth_public_keys_stream_cursor_value_input"];
  ["auth_public_keys_sum_order_by"]: ValueTypes["auth_public_keys_sum_order_by"];
  ["auth_public_keys_update_column"]: ValueTypes["auth_public_keys_update_column"];
  ["auth_public_keys_var_pop_order_by"]: ValueTypes["auth_public_keys_var_pop_order_by"];
  ["auth_public_keys_var_samp_order_by"]: ValueTypes["auth_public_keys_var_samp_order_by"];
  ["auth_public_keys_variance_order_by"]: ValueTypes["auth_public_keys_variance_order_by"];
  ["auth_stripe_onramp_bool_exp"]: ValueTypes["auth_stripe_onramp_bool_exp"];
  ["auth_stripe_onramp_constraint"]: ValueTypes["auth_stripe_onramp_constraint"];
  ["auth_stripe_onramp_inc_input"]: ValueTypes["auth_stripe_onramp_inc_input"];
  ["auth_stripe_onramp_insert_input"]: ValueTypes["auth_stripe_onramp_insert_input"];
  ["auth_stripe_onramp_on_conflict"]: ValueTypes["auth_stripe_onramp_on_conflict"];
  ["auth_stripe_onramp_order_by"]: ValueTypes["auth_stripe_onramp_order_by"];
  ["auth_stripe_onramp_pk_columns_input"]: ValueTypes["auth_stripe_onramp_pk_columns_input"];
  ["auth_stripe_onramp_select_column"]: ValueTypes["auth_stripe_onramp_select_column"];
  ["auth_stripe_onramp_set_input"]: ValueTypes["auth_stripe_onramp_set_input"];
  ["auth_stripe_onramp_stream_cursor_input"]: ValueTypes["auth_stripe_onramp_stream_cursor_input"];
  ["auth_stripe_onramp_stream_cursor_value_input"]: ValueTypes["auth_stripe_onramp_stream_cursor_value_input"];
  ["auth_stripe_onramp_update_column"]: ValueTypes["auth_stripe_onramp_update_column"];
  ["auth_stripe_onramp_updates"]: ValueTypes["auth_stripe_onramp_updates"];
  ["auth_user_active_publickey_mapping_aggregate_order_by"]: ValueTypes["auth_user_active_publickey_mapping_aggregate_order_by"];
  ["auth_user_active_publickey_mapping_arr_rel_insert_input"]: ValueTypes["auth_user_active_publickey_mapping_arr_rel_insert_input"];
  ["auth_user_active_publickey_mapping_avg_order_by"]: ValueTypes["auth_user_active_publickey_mapping_avg_order_by"];
  ["auth_user_active_publickey_mapping_bool_exp"]: ValueTypes["auth_user_active_publickey_mapping_bool_exp"];
  ["auth_user_active_publickey_mapping_constraint"]: ValueTypes["auth_user_active_publickey_mapping_constraint"];
  ["auth_user_active_publickey_mapping_inc_input"]: ValueTypes["auth_user_active_publickey_mapping_inc_input"];
  ["auth_user_active_publickey_mapping_insert_input"]: ValueTypes["auth_user_active_publickey_mapping_insert_input"];
  ["auth_user_active_publickey_mapping_max_order_by"]: ValueTypes["auth_user_active_publickey_mapping_max_order_by"];
  ["auth_user_active_publickey_mapping_min_order_by"]: ValueTypes["auth_user_active_publickey_mapping_min_order_by"];
  ["auth_user_active_publickey_mapping_on_conflict"]: ValueTypes["auth_user_active_publickey_mapping_on_conflict"];
  ["auth_user_active_publickey_mapping_order_by"]: ValueTypes["auth_user_active_publickey_mapping_order_by"];
  ["auth_user_active_publickey_mapping_pk_columns_input"]: ValueTypes["auth_user_active_publickey_mapping_pk_columns_input"];
  ["auth_user_active_publickey_mapping_select_column"]: ValueTypes["auth_user_active_publickey_mapping_select_column"];
  ["auth_user_active_publickey_mapping_set_input"]: ValueTypes["auth_user_active_publickey_mapping_set_input"];
  ["auth_user_active_publickey_mapping_stddev_order_by"]: ValueTypes["auth_user_active_publickey_mapping_stddev_order_by"];
  ["auth_user_active_publickey_mapping_stddev_pop_order_by"]: ValueTypes["auth_user_active_publickey_mapping_stddev_pop_order_by"];
  ["auth_user_active_publickey_mapping_stddev_samp_order_by"]: ValueTypes["auth_user_active_publickey_mapping_stddev_samp_order_by"];
  ["auth_user_active_publickey_mapping_stream_cursor_input"]: ValueTypes["auth_user_active_publickey_mapping_stream_cursor_input"];
  ["auth_user_active_publickey_mapping_stream_cursor_value_input"]: ValueTypes["auth_user_active_publickey_mapping_stream_cursor_value_input"];
  ["auth_user_active_publickey_mapping_sum_order_by"]: ValueTypes["auth_user_active_publickey_mapping_sum_order_by"];
  ["auth_user_active_publickey_mapping_update_column"]: ValueTypes["auth_user_active_publickey_mapping_update_column"];
  ["auth_user_active_publickey_mapping_updates"]: ValueTypes["auth_user_active_publickey_mapping_updates"];
  ["auth_user_active_publickey_mapping_var_pop_order_by"]: ValueTypes["auth_user_active_publickey_mapping_var_pop_order_by"];
  ["auth_user_active_publickey_mapping_var_samp_order_by"]: ValueTypes["auth_user_active_publickey_mapping_var_samp_order_by"];
  ["auth_user_active_publickey_mapping_variance_order_by"]: ValueTypes["auth_user_active_publickey_mapping_variance_order_by"];
  ["auth_user_nfts_aggregate_bool_exp"]: ValueTypes["auth_user_nfts_aggregate_bool_exp"];
  ["auth_user_nfts_aggregate_bool_exp_count"]: ValueTypes["auth_user_nfts_aggregate_bool_exp_count"];
  ["auth_user_nfts_aggregate_order_by"]: ValueTypes["auth_user_nfts_aggregate_order_by"];
  ["auth_user_nfts_arr_rel_insert_input"]: ValueTypes["auth_user_nfts_arr_rel_insert_input"];
  ["auth_user_nfts_bool_exp"]: ValueTypes["auth_user_nfts_bool_exp"];
  ["auth_user_nfts_constraint"]: ValueTypes["auth_user_nfts_constraint"];
  ["auth_user_nfts_insert_input"]: ValueTypes["auth_user_nfts_insert_input"];
  ["auth_user_nfts_max_order_by"]: ValueTypes["auth_user_nfts_max_order_by"];
  ["auth_user_nfts_min_order_by"]: ValueTypes["auth_user_nfts_min_order_by"];
  ["auth_user_nfts_on_conflict"]: ValueTypes["auth_user_nfts_on_conflict"];
  ["auth_user_nfts_order_by"]: ValueTypes["auth_user_nfts_order_by"];
  ["auth_user_nfts_select_column"]: ValueTypes["auth_user_nfts_select_column"];
  ["auth_user_nfts_stream_cursor_input"]: ValueTypes["auth_user_nfts_stream_cursor_input"];
  ["auth_user_nfts_stream_cursor_value_input"]: ValueTypes["auth_user_nfts_stream_cursor_value_input"];
  ["auth_user_nfts_update_column"]: ValueTypes["auth_user_nfts_update_column"];
  ["auth_users_aggregate_bool_exp"]: ValueTypes["auth_users_aggregate_bool_exp"];
  ["auth_users_aggregate_bool_exp_count"]: ValueTypes["auth_users_aggregate_bool_exp_count"];
  ["auth_users_aggregate_order_by"]: ValueTypes["auth_users_aggregate_order_by"];
  ["auth_users_arr_rel_insert_input"]: ValueTypes["auth_users_arr_rel_insert_input"];
  ["auth_users_bool_exp"]: ValueTypes["auth_users_bool_exp"];
  ["auth_users_constraint"]: ValueTypes["auth_users_constraint"];
  ["auth_users_insert_input"]: ValueTypes["auth_users_insert_input"];
  ["auth_users_max_order_by"]: ValueTypes["auth_users_max_order_by"];
  ["auth_users_min_order_by"]: ValueTypes["auth_users_min_order_by"];
  ["auth_users_obj_rel_insert_input"]: ValueTypes["auth_users_obj_rel_insert_input"];
  ["auth_users_on_conflict"]: ValueTypes["auth_users_on_conflict"];
  ["auth_users_order_by"]: ValueTypes["auth_users_order_by"];
  ["auth_users_pk_columns_input"]: ValueTypes["auth_users_pk_columns_input"];
  ["auth_users_select_column"]: ValueTypes["auth_users_select_column"];
  ["auth_users_set_input"]: ValueTypes["auth_users_set_input"];
  ["auth_users_stream_cursor_input"]: ValueTypes["auth_users_stream_cursor_input"];
  ["auth_users_stream_cursor_value_input"]: ValueTypes["auth_users_stream_cursor_value_input"];
  ["auth_users_update_column"]: ValueTypes["auth_users_update_column"];
  ["auth_users_updates"]: ValueTypes["auth_users_updates"];
  ["auth_xnft_preferences_bool_exp"]: ValueTypes["auth_xnft_preferences_bool_exp"];
  ["auth_xnft_preferences_constraint"]: ValueTypes["auth_xnft_preferences_constraint"];
  ["auth_xnft_preferences_inc_input"]: ValueTypes["auth_xnft_preferences_inc_input"];
  ["auth_xnft_preferences_insert_input"]: ValueTypes["auth_xnft_preferences_insert_input"];
  ["auth_xnft_preferences_on_conflict"]: ValueTypes["auth_xnft_preferences_on_conflict"];
  ["auth_xnft_preferences_order_by"]: ValueTypes["auth_xnft_preferences_order_by"];
  ["auth_xnft_preferences_pk_columns_input"]: ValueTypes["auth_xnft_preferences_pk_columns_input"];
  ["auth_xnft_preferences_select_column"]: ValueTypes["auth_xnft_preferences_select_column"];
  ["auth_xnft_preferences_set_input"]: ValueTypes["auth_xnft_preferences_set_input"];
  ["auth_xnft_preferences_stream_cursor_input"]: ValueTypes["auth_xnft_preferences_stream_cursor_input"];
  ["auth_xnft_preferences_stream_cursor_value_input"]: ValueTypes["auth_xnft_preferences_stream_cursor_value_input"];
  ["auth_xnft_preferences_update_column"]: ValueTypes["auth_xnft_preferences_update_column"];
  ["auth_xnft_preferences_updates"]: ValueTypes["auth_xnft_preferences_updates"];
  ["auth_xnft_secrets_bool_exp"]: ValueTypes["auth_xnft_secrets_bool_exp"];
  ["auth_xnft_secrets_constraint"]: ValueTypes["auth_xnft_secrets_constraint"];
  ["auth_xnft_secrets_inc_input"]: ValueTypes["auth_xnft_secrets_inc_input"];
  ["auth_xnft_secrets_insert_input"]: ValueTypes["auth_xnft_secrets_insert_input"];
  ["auth_xnft_secrets_on_conflict"]: ValueTypes["auth_xnft_secrets_on_conflict"];
  ["auth_xnft_secrets_order_by"]: ValueTypes["auth_xnft_secrets_order_by"];
  ["auth_xnft_secrets_pk_columns_input"]: ValueTypes["auth_xnft_secrets_pk_columns_input"];
  ["auth_xnft_secrets_select_column"]: ValueTypes["auth_xnft_secrets_select_column"];
  ["auth_xnft_secrets_set_input"]: ValueTypes["auth_xnft_secrets_set_input"];
  ["auth_xnft_secrets_stream_cursor_input"]: ValueTypes["auth_xnft_secrets_stream_cursor_input"];
  ["auth_xnft_secrets_stream_cursor_value_input"]: ValueTypes["auth_xnft_secrets_stream_cursor_value_input"];
  ["auth_xnft_secrets_update_column"]: ValueTypes["auth_xnft_secrets_update_column"];
  ["auth_xnft_secrets_updates"]: ValueTypes["auth_xnft_secrets_updates"];
  ["citext"]: ValueTypes["citext"];
  ["citext_comparison_exp"]: ValueTypes["citext_comparison_exp"];
  ["cursor_ordering"]: ValueTypes["cursor_ordering"];
  ["dropzone_distributors_bool_exp"]: ValueTypes["dropzone_distributors_bool_exp"];
  ["dropzone_distributors_constraint"]: ValueTypes["dropzone_distributors_constraint"];
  ["dropzone_distributors_insert_input"]: ValueTypes["dropzone_distributors_insert_input"];
  ["dropzone_distributors_on_conflict"]: ValueTypes["dropzone_distributors_on_conflict"];
  ["dropzone_distributors_order_by"]: ValueTypes["dropzone_distributors_order_by"];
  ["dropzone_distributors_select_column"]: ValueTypes["dropzone_distributors_select_column"];
  ["dropzone_distributors_stream_cursor_input"]: ValueTypes["dropzone_distributors_stream_cursor_input"];
  ["dropzone_distributors_stream_cursor_value_input"]: ValueTypes["dropzone_distributors_stream_cursor_value_input"];
  ["dropzone_distributors_update_column"]: ValueTypes["dropzone_distributors_update_column"];
  ["dropzone_user_dropzone_public_key_args"]: ValueTypes["dropzone_user_dropzone_public_key_args"];
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
  ["users_scalar"]: ValueTypes["users_scalar"];
  ["uuid"]: ValueTypes["uuid"];
  ["uuid_comparison_exp"]: ValueTypes["uuid_comparison_exp"];
};
