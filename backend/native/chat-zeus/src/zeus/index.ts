/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from "./const";
export const HOST = "http://localhost:8113/v1/graphql";

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
  //@ts-ignore
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
  // @ts-ignore
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
  /** columns and relationships of "barter_poke_metadata" */
  ["barter_poke_metadata"]: AliasType<{
    barter_id?: boolean | `@${string}`;
    /** An object relationship */
    chat?: ValueTypes["chats"];
    id?: boolean | `@${string}`;
    message_client_generated_uuid?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "barter_poke_metadata" */
  ["barter_poke_metadata_aggregate_order_by"]: {
    avg?:
      | ValueTypes["barter_poke_metadata_avg_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["barter_poke_metadata_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["barter_poke_metadata_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev?:
      | ValueTypes["barter_poke_metadata_stddev_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_pop?:
      | ValueTypes["barter_poke_metadata_stddev_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_samp?:
      | ValueTypes["barter_poke_metadata_stddev_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    sum?:
      | ValueTypes["barter_poke_metadata_sum_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_pop?:
      | ValueTypes["barter_poke_metadata_var_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_samp?:
      | ValueTypes["barter_poke_metadata_var_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    variance?:
      | ValueTypes["barter_poke_metadata_variance_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "barter_poke_metadata" */
  ["barter_poke_metadata_arr_rel_insert_input"]: {
    data:
      | Array<ValueTypes["barter_poke_metadata_insert_input"]>
      | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["barter_poke_metadata_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by avg() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_avg_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "barter_poke_metadata". All fields are combined with a logical 'AND'. */
  ["barter_poke_metadata_bool_exp"]: {
    _and?:
      | Array<ValueTypes["barter_poke_metadata_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["barter_poke_metadata_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["barter_poke_metadata_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    barter_id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    chat?:
      | ValueTypes["chats_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    message_client_generated_uuid?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "barter_poke_metadata" */
  ["barter_poke_metadata_constraint"]: barter_poke_metadata_constraint;
  /** input type for incrementing numeric columns in table "barter_poke_metadata" */
  ["barter_poke_metadata_inc_input"]: {
    barter_id?: number | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "barter_poke_metadata" */
  ["barter_poke_metadata_insert_input"]: {
    barter_id?: number | undefined | null | Variable<any, string>;
    chat?:
      | ValueTypes["chats_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    message_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by max() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_max_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by min() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_min_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** response of any mutation on the table "barter_poke_metadata" */
  ["barter_poke_metadata_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["barter_poke_metadata"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "barter_poke_metadata" */
  ["barter_poke_metadata_on_conflict"]: {
    constraint:
      | ValueTypes["barter_poke_metadata_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["barter_poke_metadata_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["barter_poke_metadata_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "barter_poke_metadata". */
  ["barter_poke_metadata_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chat?:
      | ValueTypes["chats_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: barter_poke_metadata */
  ["barter_poke_metadata_pk_columns_input"]: {
    id: number | Variable<any, string>;
  };
  /** select columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_select_column"]: barter_poke_metadata_select_column;
  /** input type for updating data in table "barter_poke_metadata" */
  ["barter_poke_metadata_set_input"]: {
    barter_id?: number | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    message_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by stddev() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_stddev_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by stddev_pop() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_stddev_pop_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by stddev_samp() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_stddev_samp_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "barter_poke_metadata" */
  ["barter_poke_metadata_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["barter_poke_metadata_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["barter_poke_metadata_stream_cursor_value_input"]: {
    barter_id?: number | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    message_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by sum() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_sum_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** update columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_update_column"]: barter_poke_metadata_update_column;
  ["barter_poke_metadata_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["barter_poke_metadata_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["barter_poke_metadata_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    where: ValueTypes["barter_poke_metadata_bool_exp"] | Variable<any, string>;
  };
  /** order by var_pop() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_var_pop_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by var_samp() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_var_samp_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by variance() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_variance_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** columns and relationships of "barters" */
  ["barters"]: AliasType<{
    chat_barter_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chat_barter_metadata_select_column"]>
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
          | Array<ValueTypes["chat_barter_metadata_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_barter_metadata_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_barter_metadata"]
    ];
    id?: boolean | `@${string}`;
    on_chain_state?: boolean | `@${string}`;
    room_active_chat_mappings?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["room_active_chat_mapping_select_column"]>
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
          | Array<ValueTypes["room_active_chat_mapping_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["room_active_chat_mapping_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["room_active_chat_mapping"]
    ];
    room_id?: boolean | `@${string}`;
    state?: boolean | `@${string}`;
    user1_offers?: boolean | `@${string}`;
    user2_offers?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "barters". All fields are combined with a logical 'AND'. */
  ["barters_bool_exp"]: {
    _and?:
      | Array<ValueTypes["barters_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["barters_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["barters_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    chat_barter_metadata?:
      | ValueTypes["chat_barter_metadata_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    on_chain_state?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    room_active_chat_mappings?:
      | ValueTypes["room_active_chat_mapping_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    room_id?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    state?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user1_offers?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    user2_offers?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "barters" */
  ["barters_constraint"]: barters_constraint;
  /** input type for incrementing numeric columns in table "barters" */
  ["barters_inc_input"]: {
    id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "barters" */
  ["barters_insert_input"]: {
    chat_barter_metadata?:
      | ValueTypes["chat_barter_metadata_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    on_chain_state?: string | undefined | null | Variable<any, string>;
    room_active_chat_mappings?:
      | ValueTypes["room_active_chat_mapping_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    room_id?: string | undefined | null | Variable<any, string>;
    state?: string | undefined | null | Variable<any, string>;
    user1_offers?: string | undefined | null | Variable<any, string>;
    user2_offers?: string | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "barters" */
  ["barters_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["barters"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "barters" */
  ["barters_obj_rel_insert_input"]: {
    data: ValueTypes["barters_insert_input"] | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["barters_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** on_conflict condition type for table "barters" */
  ["barters_on_conflict"]: {
    constraint: ValueTypes["barters_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["barters_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["barters_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "barters". */
  ["barters_order_by"]: {
    chat_barter_metadata_aggregate?:
      | ValueTypes["chat_barter_metadata_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    on_chain_state?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    room_active_chat_mappings_aggregate?:
      | ValueTypes["room_active_chat_mapping_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    room_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    state?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    user1_offers?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    user2_offers?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: barters */
  ["barters_pk_columns_input"]: {
    id: number | Variable<any, string>;
  };
  /** select columns of table "barters" */
  ["barters_select_column"]: barters_select_column;
  /** input type for updating data in table "barters" */
  ["barters_set_input"]: {
    id?: number | undefined | null | Variable<any, string>;
    on_chain_state?: string | undefined | null | Variable<any, string>;
    room_id?: string | undefined | null | Variable<any, string>;
    state?: string | undefined | null | Variable<any, string>;
    user1_offers?: string | undefined | null | Variable<any, string>;
    user2_offers?: string | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "barters" */
  ["barters_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["barters_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["barters_stream_cursor_value_input"]: {
    id?: number | undefined | null | Variable<any, string>;
    on_chain_state?: string | undefined | null | Variable<any, string>;
    room_id?: string | undefined | null | Variable<any, string>;
    state?: string | undefined | null | Variable<any, string>;
    user1_offers?: string | undefined | null | Variable<any, string>;
    user2_offers?: string | undefined | null | Variable<any, string>;
  };
  /** update columns of table "barters" */
  ["barters_update_column"]: barters_update_column;
  ["barters_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["barters_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["barters_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    where: ValueTypes["barters_bool_exp"] | Variable<any, string>;
  };
  /** columns and relationships of "chat_barter_metadata" */
  ["chat_barter_metadata"]: AliasType<{
    /** An object relationship */
    barter?: ValueTypes["barters"];
    barter_id?: boolean | `@${string}`;
    /** An object relationship */
    chat?: ValueTypes["chats"];
    chat_client_generated_uuid?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "chat_barter_metadata" */
  ["chat_barter_metadata_aggregate_order_by"]: {
    avg?:
      | ValueTypes["chat_barter_metadata_avg_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["chat_barter_metadata_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["chat_barter_metadata_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev?:
      | ValueTypes["chat_barter_metadata_stddev_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_pop?:
      | ValueTypes["chat_barter_metadata_stddev_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_samp?:
      | ValueTypes["chat_barter_metadata_stddev_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    sum?:
      | ValueTypes["chat_barter_metadata_sum_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_pop?:
      | ValueTypes["chat_barter_metadata_var_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_samp?:
      | ValueTypes["chat_barter_metadata_var_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    variance?:
      | ValueTypes["chat_barter_metadata_variance_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "chat_barter_metadata" */
  ["chat_barter_metadata_arr_rel_insert_input"]: {
    data:
      | Array<ValueTypes["chat_barter_metadata_insert_input"]>
      | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["chat_barter_metadata_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by avg() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_avg_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "chat_barter_metadata". All fields are combined with a logical 'AND'. */
  ["chat_barter_metadata_bool_exp"]: {
    _and?:
      | Array<ValueTypes["chat_barter_metadata_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["chat_barter_metadata_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["chat_barter_metadata_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    barter?:
      | ValueTypes["barters_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    barter_id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    chat?:
      | ValueTypes["chats_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    chat_client_generated_uuid?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "chat_barter_metadata" */
  ["chat_barter_metadata_constraint"]: chat_barter_metadata_constraint;
  /** input type for inserting data into table "chat_barter_metadata" */
  ["chat_barter_metadata_insert_input"]: {
    barter?:
      | ValueTypes["barters_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    barter_id?: number | undefined | null | Variable<any, string>;
    chat?:
      | ValueTypes["chats_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    chat_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by max() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_max_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chat_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by min() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_min_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chat_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** response of any mutation on the table "chat_barter_metadata" */
  ["chat_barter_metadata_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["chat_barter_metadata"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "chat_barter_metadata" */
  ["chat_barter_metadata_on_conflict"]: {
    constraint:
      | ValueTypes["chat_barter_metadata_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["chat_barter_metadata_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["chat_barter_metadata_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "chat_barter_metadata". */
  ["chat_barter_metadata_order_by"]: {
    barter?:
      | ValueTypes["barters_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chat?:
      | ValueTypes["chats_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chat_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** select columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_select_column"]: chat_barter_metadata_select_column;
  /** order by stddev() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_stddev_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by stddev_pop() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_stddev_pop_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by stddev_samp() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_stddev_samp_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Streaming cursor of the table "chat_barter_metadata" */
  ["chat_barter_metadata_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["chat_barter_metadata_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_barter_metadata_stream_cursor_value_input"]: {
    barter_id?: number | undefined | null | Variable<any, string>;
    chat_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by sum() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_sum_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** placeholder for update columns of table "chat_barter_metadata" (current role has no relevant permissions) */
  ["chat_barter_metadata_update_column"]: chat_barter_metadata_update_column;
  ["chat_barter_metadata_updates"]: {
    where: ValueTypes["chat_barter_metadata_bool_exp"] | Variable<any, string>;
  };
  /** order by var_pop() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_var_pop_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by var_samp() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_var_samp_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by variance() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_variance_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** columns and relationships of "chat_media_messages" */
  ["chat_media_messages"]: AliasType<{
    /** An object relationship */
    chat?: ValueTypes["chats"];
    id?: boolean | `@${string}`;
    media_kind?: boolean | `@${string}`;
    media_link?: boolean | `@${string}`;
    message_client_generated_uuid?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "chat_media_messages" */
  ["chat_media_messages_aggregate_order_by"]: {
    avg?:
      | ValueTypes["chat_media_messages_avg_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["chat_media_messages_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["chat_media_messages_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev?:
      | ValueTypes["chat_media_messages_stddev_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_pop?:
      | ValueTypes["chat_media_messages_stddev_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_samp?:
      | ValueTypes["chat_media_messages_stddev_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    sum?:
      | ValueTypes["chat_media_messages_sum_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_pop?:
      | ValueTypes["chat_media_messages_var_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_samp?:
      | ValueTypes["chat_media_messages_var_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    variance?:
      | ValueTypes["chat_media_messages_variance_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "chat_media_messages" */
  ["chat_media_messages_arr_rel_insert_input"]: {
    data:
      | Array<ValueTypes["chat_media_messages_insert_input"]>
      | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["chat_media_messages_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by avg() on columns of table "chat_media_messages" */
  ["chat_media_messages_avg_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "chat_media_messages". All fields are combined with a logical 'AND'. */
  ["chat_media_messages_bool_exp"]: {
    _and?:
      | Array<ValueTypes["chat_media_messages_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["chat_media_messages_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["chat_media_messages_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    chat?:
      | ValueTypes["chats_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    media_kind?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    media_link?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    message_client_generated_uuid?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "chat_media_messages" */
  ["chat_media_messages_constraint"]: chat_media_messages_constraint;
  /** input type for incrementing numeric columns in table "chat_media_messages" */
  ["chat_media_messages_inc_input"]: {
    id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "chat_media_messages" */
  ["chat_media_messages_insert_input"]: {
    chat?:
      | ValueTypes["chats_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    media_kind?: string | undefined | null | Variable<any, string>;
    media_link?: string | undefined | null | Variable<any, string>;
    message_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by max() on columns of table "chat_media_messages" */
  ["chat_media_messages_max_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    media_kind?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    media_link?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    message_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by min() on columns of table "chat_media_messages" */
  ["chat_media_messages_min_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    media_kind?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    media_link?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    message_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** response of any mutation on the table "chat_media_messages" */
  ["chat_media_messages_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["chat_media_messages"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "chat_media_messages" */
  ["chat_media_messages_on_conflict"]: {
    constraint:
      | ValueTypes["chat_media_messages_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["chat_media_messages_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["chat_media_messages_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "chat_media_messages". */
  ["chat_media_messages_order_by"]: {
    chat?:
      | ValueTypes["chats_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    media_kind?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    media_link?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    message_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: chat_media_messages */
  ["chat_media_messages_pk_columns_input"]: {
    id: number | Variable<any, string>;
  };
  /** select columns of table "chat_media_messages" */
  ["chat_media_messages_select_column"]: chat_media_messages_select_column;
  /** input type for updating data in table "chat_media_messages" */
  ["chat_media_messages_set_input"]: {
    id?: number | undefined | null | Variable<any, string>;
    media_kind?: string | undefined | null | Variable<any, string>;
    media_link?: string | undefined | null | Variable<any, string>;
    message_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by stddev() on columns of table "chat_media_messages" */
  ["chat_media_messages_stddev_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by stddev_pop() on columns of table "chat_media_messages" */
  ["chat_media_messages_stddev_pop_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by stddev_samp() on columns of table "chat_media_messages" */
  ["chat_media_messages_stddev_samp_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "chat_media_messages" */
  ["chat_media_messages_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["chat_media_messages_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_media_messages_stream_cursor_value_input"]: {
    id?: number | undefined | null | Variable<any, string>;
    media_kind?: string | undefined | null | Variable<any, string>;
    media_link?: string | undefined | null | Variable<any, string>;
    message_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by sum() on columns of table "chat_media_messages" */
  ["chat_media_messages_sum_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** update columns of table "chat_media_messages" */
  ["chat_media_messages_update_column"]: chat_media_messages_update_column;
  ["chat_media_messages_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["chat_media_messages_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["chat_media_messages_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    where: ValueTypes["chat_media_messages_bool_exp"] | Variable<any, string>;
  };
  /** order by var_pop() on columns of table "chat_media_messages" */
  ["chat_media_messages_var_pop_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by var_samp() on columns of table "chat_media_messages" */
  ["chat_media_messages_var_samp_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by variance() on columns of table "chat_media_messages" */
  ["chat_media_messages_variance_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** columns and relationships of "chat_update_history" */
  ["chat_update_history"]: AliasType<{
    client_generated_uuid?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    room?: boolean | `@${string}`;
    type?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "chat_update_history". All fields are combined with a logical 'AND'. */
  ["chat_update_history_bool_exp"]: {
    _and?:
      | Array<ValueTypes["chat_update_history_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["chat_update_history_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["chat_update_history_bool_exp"]>
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
    room?:
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
  /** unique or primary key constraints on table "chat_update_history" */
  ["chat_update_history_constraint"]: chat_update_history_constraint;
  /** input type for inserting data into table "chat_update_history" */
  ["chat_update_history_insert_input"]: {
    client_generated_uuid?: string | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    room?: string | undefined | null | Variable<any, string>;
    type?: string | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "chat_update_history" */
  ["chat_update_history_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["chat_update_history"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "chat_update_history" */
  ["chat_update_history_on_conflict"]: {
    constraint:
      | ValueTypes["chat_update_history_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["chat_update_history_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["chat_update_history_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "chat_update_history". */
  ["chat_update_history_order_by"]: {
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
    room?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    type?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** select columns of table "chat_update_history" */
  ["chat_update_history_select_column"]: chat_update_history_select_column;
  /** Streaming cursor of the table "chat_update_history" */
  ["chat_update_history_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["chat_update_history_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_update_history_stream_cursor_value_input"]: {
    client_generated_uuid?: string | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    room?: string | undefined | null | Variable<any, string>;
    type?: string | undefined | null | Variable<any, string>;
  };
  /** placeholder for update columns of table "chat_update_history" (current role has no relevant permissions) */
  ["chat_update_history_update_column"]: chat_update_history_update_column;
  /** columns and relationships of "chats" */
  ["chats"]: AliasType<{
    barter_poke_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["barter_poke_metadata_select_column"]>
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
          | Array<ValueTypes["barter_poke_metadata_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["barter_poke_metadata_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["barter_poke_metadata"]
    ];
    chat_barter_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chat_barter_metadata_select_column"]>
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
          | Array<ValueTypes["chat_barter_metadata_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_barter_metadata_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_barter_metadata"]
    ];
    chat_media_messages?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chat_media_messages_select_column"]>
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
          | Array<ValueTypes["chat_media_messages_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_media_messages_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_media_messages"]
    ];
    client_generated_uuid?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    deleted?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    message?: boolean | `@${string}`;
    message_kind?: boolean | `@${string}`;
    nft_sticker_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["nft_sticker_metadata_select_column"]>
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
          | Array<ValueTypes["nft_sticker_metadata_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["nft_sticker_metadata_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["nft_sticker_metadata"]
    ];
    parent_client_generated_uuid?: boolean | `@${string}`;
    room?: boolean | `@${string}`;
    secure_transfer_transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["secure_transfer_transactions_select_column"]>
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
          | Array<ValueTypes["secure_transfer_transactions_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["secure_transfer_transactions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["secure_transfer_transactions"]
    ];
    simple_transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["simple_transactions_select_column"]>
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
          | Array<ValueTypes["simple_transactions_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["simple_transactions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["simple_transactions"]
    ];
    type?: boolean | `@${string}`;
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
    barter_poke_metadata?:
      | ValueTypes["barter_poke_metadata_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    chat_barter_metadata?:
      | ValueTypes["chat_barter_metadata_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    chat_media_messages?:
      | ValueTypes["chat_media_messages_bool_exp"]
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
    deleted?:
      | ValueTypes["Boolean_comparison_exp"]
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
    message_kind?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    nft_sticker_metadata?:
      | ValueTypes["nft_sticker_metadata_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    parent_client_generated_uuid?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    room?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    secure_transfer_transactions?:
      | ValueTypes["secure_transfer_transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    simple_transactions?:
      | ValueTypes["simple_transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    type?:
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
    barter_poke_metadata?:
      | ValueTypes["barter_poke_metadata_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    chat_barter_metadata?:
      | ValueTypes["chat_barter_metadata_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    chat_media_messages?:
      | ValueTypes["chat_media_messages_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    client_generated_uuid?: string | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    deleted?: boolean | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    message?: string | undefined | null | Variable<any, string>;
    message_kind?: string | undefined | null | Variable<any, string>;
    nft_sticker_metadata?:
      | ValueTypes["nft_sticker_metadata_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    parent_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    room?: string | undefined | null | Variable<any, string>;
    secure_transfer_transactions?:
      | ValueTypes["secure_transfer_transactions_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    simple_transactions?:
      | ValueTypes["simple_transactions_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    type?: string | undefined | null | Variable<any, string>;
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
  /** input type for inserting object relation for remote table "chats" */
  ["chats_obj_rel_insert_input"]: {
    data: ValueTypes["chats_insert_input"] | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["chats_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
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
    barter_poke_metadata_aggregate?:
      | ValueTypes["barter_poke_metadata_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chat_barter_metadata_aggregate?:
      | ValueTypes["chat_barter_metadata_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chat_media_messages_aggregate?:
      | ValueTypes["chat_media_messages_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
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
    deleted?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message_kind?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    nft_sticker_metadata_aggregate?:
      | ValueTypes["nft_sticker_metadata_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    parent_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    room?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    secure_transfer_transactions_aggregate?:
      | ValueTypes["secure_transfer_transactions_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    simple_transactions_aggregate?:
      | ValueTypes["simple_transactions_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    type?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    username?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    uuid?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: chats */
  ["chats_pk_columns_input"]: {
    id: number | Variable<any, string>;
  };
  /** select columns of table "chats" */
  ["chats_select_column"]: chats_select_column;
  /** input type for updating data in table "chats" */
  ["chats_set_input"]: {
    deleted?: boolean | undefined | null | Variable<any, string>;
  };
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
    deleted?: boolean | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    message?: string | undefined | null | Variable<any, string>;
    message_kind?: string | undefined | null | Variable<any, string>;
    parent_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    room?: string | undefined | null | Variable<any, string>;
    type?: string | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
    uuid?: string | undefined | null | Variable<any, string>;
  };
  /** update columns of table "chats" */
  ["chats_update_column"]: chats_update_column;
  ["chats_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["chats_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    where: ValueTypes["chats_bool_exp"] | Variable<any, string>;
  };
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** mutation root */
  ["mutation_root"]: AliasType<{
    delete_room_active_chat_mapping?: [
      {
        /** filter the rows which have to be deleted */
        where:
          | ValueTypes["room_active_chat_mapping_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["room_active_chat_mapping_mutation_response"]
    ];
    delete_room_active_chat_mapping_by_pk?: [
      { room_id: string | Variable<any, string> },
      ValueTypes["room_active_chat_mapping"]
    ];
    insert_barter_poke_metadata?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["barter_poke_metadata_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["barter_poke_metadata_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["barter_poke_metadata_mutation_response"]
    ];
    insert_barter_poke_metadata_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["barter_poke_metadata_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["barter_poke_metadata_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["barter_poke_metadata"]
    ];
    insert_barters?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["barters_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["barters_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["barters_mutation_response"]
    ];
    insert_barters_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["barters_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["barters_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["barters"]
    ];
    insert_chat_barter_metadata?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["chat_barter_metadata_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["chat_barter_metadata_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_barter_metadata_mutation_response"]
    ];
    insert_chat_barter_metadata_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["chat_barter_metadata_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["chat_barter_metadata_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_barter_metadata"]
    ];
    insert_chat_media_messages?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["chat_media_messages_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["chat_media_messages_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_media_messages_mutation_response"]
    ];
    insert_chat_media_messages_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["chat_media_messages_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["chat_media_messages_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_media_messages"]
    ];
    insert_chat_update_history?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["chat_update_history_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["chat_update_history_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_update_history_mutation_response"]
    ];
    insert_chat_update_history_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["chat_update_history_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["chat_update_history_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_update_history"]
    ];
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
    insert_nft_sticker_metadata?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["nft_sticker_metadata_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["nft_sticker_metadata_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["nft_sticker_metadata_mutation_response"]
    ];
    insert_nft_sticker_metadata_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["nft_sticker_metadata_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["nft_sticker_metadata_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["nft_sticker_metadata"]
    ];
    insert_room_active_chat_mapping?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["room_active_chat_mapping_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["room_active_chat_mapping_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["room_active_chat_mapping_mutation_response"]
    ];
    insert_room_active_chat_mapping_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["room_active_chat_mapping_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["room_active_chat_mapping_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["room_active_chat_mapping"]
    ];
    insert_secure_transfer_transactions?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["secure_transfer_transactions_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["secure_transfer_transactions_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["secure_transfer_transactions_mutation_response"]
    ];
    insert_secure_transfer_transactions_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["secure_transfer_transactions_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["secure_transfer_transactions_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["secure_transfer_transactions"]
    ];
    insert_simple_transactions?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["simple_transactions_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["simple_transactions_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["simple_transactions_mutation_response"]
    ];
    insert_simple_transactions_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["simple_transactions_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["simple_transactions_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["simple_transactions"]
    ];
    update_barter_poke_metadata?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["barter_poke_metadata_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["barter_poke_metadata_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where:
          | ValueTypes["barter_poke_metadata_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["barter_poke_metadata_mutation_response"]
    ];
    update_barter_poke_metadata_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["barter_poke_metadata_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["barter_poke_metadata_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["barter_poke_metadata_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["barter_poke_metadata"]
    ];
    update_barter_poke_metadata_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["barter_poke_metadata_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["barter_poke_metadata_mutation_response"]
    ];
    update_barters?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["barters_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["barters_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["barters_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["barters_mutation_response"]
    ];
    update_barters_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["barters_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["barters_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["barters_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["barters"]
    ];
    update_barters_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["barters_updates"]> | Variable<any, string>;
      },
      ValueTypes["barters_mutation_response"]
    ];
    update_chat_barter_metadata?: [
      {
        /** filter the rows which have to be updated */
        where:
          | ValueTypes["chat_barter_metadata_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["chat_barter_metadata_mutation_response"]
    ];
    update_chat_barter_metadata_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["chat_barter_metadata_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["chat_barter_metadata_mutation_response"]
    ];
    update_chat_media_messages?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["chat_media_messages_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["chat_media_messages_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where:
          | ValueTypes["chat_media_messages_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["chat_media_messages_mutation_response"]
    ];
    update_chat_media_messages_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["chat_media_messages_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["chat_media_messages_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["chat_media_messages_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["chat_media_messages"]
    ];
    update_chat_media_messages_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["chat_media_messages_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["chat_media_messages_mutation_response"]
    ];
    update_chats?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["chats_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["chats_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["chats_mutation_response"]
    ];
    update_chats_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["chats_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["chats_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["chats"]
    ];
    update_chats_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["chats_updates"]> | Variable<any, string>;
      },
      ValueTypes["chats_mutation_response"]
    ];
    update_nft_sticker_metadata?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["nft_sticker_metadata_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["nft_sticker_metadata_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where:
          | ValueTypes["nft_sticker_metadata_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["nft_sticker_metadata_mutation_response"]
    ];
    update_nft_sticker_metadata_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["nft_sticker_metadata_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["nft_sticker_metadata_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["nft_sticker_metadata_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["nft_sticker_metadata"]
    ];
    update_nft_sticker_metadata_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["nft_sticker_metadata_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["nft_sticker_metadata_mutation_response"]
    ];
    update_room_active_chat_mapping?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["room_active_chat_mapping_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["room_active_chat_mapping_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where:
          | ValueTypes["room_active_chat_mapping_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["room_active_chat_mapping_mutation_response"]
    ];
    update_room_active_chat_mapping_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["room_active_chat_mapping_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["room_active_chat_mapping_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["room_active_chat_mapping_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["room_active_chat_mapping"]
    ];
    update_room_active_chat_mapping_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["room_active_chat_mapping_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["room_active_chat_mapping_mutation_response"]
    ];
    update_secure_transfer_transactions?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["secure_transfer_transactions_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["secure_transfer_transactions_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where:
          | ValueTypes["secure_transfer_transactions_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["secure_transfer_transactions_mutation_response"]
    ];
    update_secure_transfer_transactions_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["secure_transfer_transactions_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["secure_transfer_transactions_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["secure_transfer_transactions_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["secure_transfer_transactions"]
    ];
    update_secure_transfer_transactions_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["secure_transfer_transactions_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["secure_transfer_transactions_mutation_response"]
    ];
    update_simple_transactions?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["simple_transactions_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["simple_transactions_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where:
          | ValueTypes["simple_transactions_bool_exp"]
          | Variable<any, string>;
      },
      ValueTypes["simple_transactions_mutation_response"]
    ];
    update_simple_transactions_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["simple_transactions_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["simple_transactions_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["simple_transactions_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["simple_transactions"]
    ];
    update_simple_transactions_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["simple_transactions_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["simple_transactions_mutation_response"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** columns and relationships of "nft_sticker_metadata" */
  ["nft_sticker_metadata"]: AliasType<{
    /** An object relationship */
    chat?: ValueTypes["chats"];
    chat_client_generated_uuid?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mint?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_aggregate_order_by"]: {
    avg?:
      | ValueTypes["nft_sticker_metadata_avg_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["nft_sticker_metadata_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["nft_sticker_metadata_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev?:
      | ValueTypes["nft_sticker_metadata_stddev_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_pop?:
      | ValueTypes["nft_sticker_metadata_stddev_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_samp?:
      | ValueTypes["nft_sticker_metadata_stddev_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    sum?:
      | ValueTypes["nft_sticker_metadata_sum_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_pop?:
      | ValueTypes["nft_sticker_metadata_var_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_samp?:
      | ValueTypes["nft_sticker_metadata_var_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    variance?:
      | ValueTypes["nft_sticker_metadata_variance_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "nft_sticker_metadata" */
  ["nft_sticker_metadata_arr_rel_insert_input"]: {
    data:
      | Array<ValueTypes["nft_sticker_metadata_insert_input"]>
      | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["nft_sticker_metadata_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by avg() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_avg_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "nft_sticker_metadata". All fields are combined with a logical 'AND'. */
  ["nft_sticker_metadata_bool_exp"]: {
    _and?:
      | Array<ValueTypes["nft_sticker_metadata_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["nft_sticker_metadata_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["nft_sticker_metadata_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    chat?:
      | ValueTypes["chats_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    chat_client_generated_uuid?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    mint?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "nft_sticker_metadata" */
  ["nft_sticker_metadata_constraint"]: nft_sticker_metadata_constraint;
  /** input type for incrementing numeric columns in table "nft_sticker_metadata" */
  ["nft_sticker_metadata_inc_input"]: {
    id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "nft_sticker_metadata" */
  ["nft_sticker_metadata_insert_input"]: {
    chat?:
      | ValueTypes["chats_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    chat_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    mint?: string | undefined | null | Variable<any, string>;
  };
  /** order by max() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_max_order_by"]: {
    chat_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    mint?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by min() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_min_order_by"]: {
    chat_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    mint?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "nft_sticker_metadata" */
  ["nft_sticker_metadata_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["nft_sticker_metadata"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "nft_sticker_metadata" */
  ["nft_sticker_metadata_on_conflict"]: {
    constraint:
      | ValueTypes["nft_sticker_metadata_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["nft_sticker_metadata_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["nft_sticker_metadata_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "nft_sticker_metadata". */
  ["nft_sticker_metadata_order_by"]: {
    chat?:
      | ValueTypes["chats_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chat_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    mint?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: nft_sticker_metadata */
  ["nft_sticker_metadata_pk_columns_input"]: {
    id: number | Variable<any, string>;
  };
  /** select columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_select_column"]: nft_sticker_metadata_select_column;
  /** input type for updating data in table "nft_sticker_metadata" */
  ["nft_sticker_metadata_set_input"]: {
    chat_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    mint?: string | undefined | null | Variable<any, string>;
  };
  /** order by stddev() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stddev_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by stddev_pop() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stddev_pop_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by stddev_samp() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stddev_samp_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["nft_sticker_metadata_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["nft_sticker_metadata_stream_cursor_value_input"]: {
    chat_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    mint?: string | undefined | null | Variable<any, string>;
  };
  /** order by sum() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_sum_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** update columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_update_column"]: nft_sticker_metadata_update_column;
  ["nft_sticker_metadata_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["nft_sticker_metadata_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["nft_sticker_metadata_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    where: ValueTypes["nft_sticker_metadata_bool_exp"] | Variable<any, string>;
  };
  /** order by var_pop() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_var_pop_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by var_samp() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_var_samp_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by variance() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_variance_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    barter_poke_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["barter_poke_metadata_select_column"]>
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
          | Array<ValueTypes["barter_poke_metadata_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["barter_poke_metadata_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["barter_poke_metadata"]
    ];
    barter_poke_metadata_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["barter_poke_metadata"]
    ];
    barters?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["barters_select_column"]>
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
          | Array<ValueTypes["barters_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["barters_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["barters"]
    ];
    barters_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["barters"]
    ];
    chat_barter_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chat_barter_metadata_select_column"]>
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
          | Array<ValueTypes["chat_barter_metadata_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_barter_metadata_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_barter_metadata"]
    ];
    chat_media_messages?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chat_media_messages_select_column"]>
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
          | Array<ValueTypes["chat_media_messages_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_media_messages_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_media_messages"]
    ];
    chat_media_messages_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["chat_media_messages"]
    ];
    chat_update_history?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chat_update_history_select_column"]>
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
          | Array<ValueTypes["chat_update_history_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_update_history_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_update_history"]
    ];
    chat_update_history_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["chat_update_history"]
    ];
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
    nft_sticker_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["nft_sticker_metadata_select_column"]>
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
          | Array<ValueTypes["nft_sticker_metadata_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["nft_sticker_metadata_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["nft_sticker_metadata"]
    ];
    nft_sticker_metadata_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["nft_sticker_metadata"]
    ];
    room_active_chat_mapping?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["room_active_chat_mapping_select_column"]>
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
          | Array<ValueTypes["room_active_chat_mapping_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["room_active_chat_mapping_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["room_active_chat_mapping"]
    ];
    room_active_chat_mapping_by_pk?: [
      { room_id: string | Variable<any, string> },
      ValueTypes["room_active_chat_mapping"]
    ];
    secure_transfer_transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["secure_transfer_transactions_select_column"]>
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
          | Array<ValueTypes["secure_transfer_transactions_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["secure_transfer_transactions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["secure_transfer_transactions"]
    ];
    secure_transfer_transactions_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["secure_transfer_transactions"]
    ];
    simple_transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["simple_transactions_select_column"]>
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
          | Array<ValueTypes["simple_transactions_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["simple_transactions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["simple_transactions"]
    ];
    simple_transactions_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["simple_transactions"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** columns and relationships of "room_active_chat_mapping" */
  ["room_active_chat_mapping"]: AliasType<{
    /** An object relationship */
    barter?: ValueTypes["barters"];
    barter_id?: boolean | `@${string}`;
    room_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_aggregate_order_by"]: {
    avg?:
      | ValueTypes["room_active_chat_mapping_avg_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["room_active_chat_mapping_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["room_active_chat_mapping_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev?:
      | ValueTypes["room_active_chat_mapping_stddev_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_pop?:
      | ValueTypes["room_active_chat_mapping_stddev_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_samp?:
      | ValueTypes["room_active_chat_mapping_stddev_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    sum?:
      | ValueTypes["room_active_chat_mapping_sum_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_pop?:
      | ValueTypes["room_active_chat_mapping_var_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_samp?:
      | ValueTypes["room_active_chat_mapping_var_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    variance?:
      | ValueTypes["room_active_chat_mapping_variance_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "room_active_chat_mapping" */
  ["room_active_chat_mapping_arr_rel_insert_input"]: {
    data:
      | Array<ValueTypes["room_active_chat_mapping_insert_input"]>
      | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["room_active_chat_mapping_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by avg() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_avg_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "room_active_chat_mapping". All fields are combined with a logical 'AND'. */
  ["room_active_chat_mapping_bool_exp"]: {
    _and?:
      | Array<ValueTypes["room_active_chat_mapping_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["room_active_chat_mapping_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["room_active_chat_mapping_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    barter?:
      | ValueTypes["barters_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    barter_id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    room_id?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "room_active_chat_mapping" */
  ["room_active_chat_mapping_constraint"]: room_active_chat_mapping_constraint;
  /** input type for incrementing numeric columns in table "room_active_chat_mapping" */
  ["room_active_chat_mapping_inc_input"]: {
    barter_id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "room_active_chat_mapping" */
  ["room_active_chat_mapping_insert_input"]: {
    barter?:
      | ValueTypes["barters_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    barter_id?: number | undefined | null | Variable<any, string>;
    room_id?: string | undefined | null | Variable<any, string>;
  };
  /** order by max() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_max_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    room_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by min() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_min_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    room_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "room_active_chat_mapping" */
  ["room_active_chat_mapping_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["room_active_chat_mapping"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "room_active_chat_mapping" */
  ["room_active_chat_mapping_on_conflict"]: {
    constraint:
      | ValueTypes["room_active_chat_mapping_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["room_active_chat_mapping_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["room_active_chat_mapping_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "room_active_chat_mapping". */
  ["room_active_chat_mapping_order_by"]: {
    barter?:
      | ValueTypes["barters_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    room_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: room_active_chat_mapping */
  ["room_active_chat_mapping_pk_columns_input"]: {
    room_id: string | Variable<any, string>;
  };
  /** select columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_select_column"]: room_active_chat_mapping_select_column;
  /** input type for updating data in table "room_active_chat_mapping" */
  ["room_active_chat_mapping_set_input"]: {
    barter_id?: number | undefined | null | Variable<any, string>;
    room_id?: string | undefined | null | Variable<any, string>;
  };
  /** order by stddev() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stddev_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by stddev_pop() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stddev_pop_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by stddev_samp() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stddev_samp_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Streaming cursor of the table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["room_active_chat_mapping_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["room_active_chat_mapping_stream_cursor_value_input"]: {
    barter_id?: number | undefined | null | Variable<any, string>;
    room_id?: string | undefined | null | Variable<any, string>;
  };
  /** order by sum() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_sum_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** update columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_update_column"]: room_active_chat_mapping_update_column;
  ["room_active_chat_mapping_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["room_active_chat_mapping_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["room_active_chat_mapping_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    where:
      | ValueTypes["room_active_chat_mapping_bool_exp"]
      | Variable<any, string>;
  };
  /** order by var_pop() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_var_pop_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by var_samp() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_var_samp_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by variance() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_variance_order_by"]: {
    barter_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** columns and relationships of "secure_transfer_transactions" */
  ["secure_transfer_transactions"]: AliasType<{
    /** An object relationship */
    chat?: ValueTypes["chats"];
    counter?: boolean | `@${string}`;
    current_state?: boolean | `@${string}`;
    escrow?: boolean | `@${string}`;
    final_txn_signature?: boolean | `@${string}`;
    from?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    message_client_generated_uuid?: boolean | `@${string}`;
    message_id?: boolean | `@${string}`;
    signature?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_aggregate_order_by"]: {
    avg?:
      | ValueTypes["secure_transfer_transactions_avg_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["secure_transfer_transactions_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["secure_transfer_transactions_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev?:
      | ValueTypes["secure_transfer_transactions_stddev_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_pop?:
      | ValueTypes["secure_transfer_transactions_stddev_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_samp?:
      | ValueTypes["secure_transfer_transactions_stddev_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    sum?:
      | ValueTypes["secure_transfer_transactions_sum_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_pop?:
      | ValueTypes["secure_transfer_transactions_var_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_samp?:
      | ValueTypes["secure_transfer_transactions_var_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    variance?:
      | ValueTypes["secure_transfer_transactions_variance_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "secure_transfer_transactions" */
  ["secure_transfer_transactions_arr_rel_insert_input"]: {
    data:
      | Array<ValueTypes["secure_transfer_transactions_insert_input"]>
      | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["secure_transfer_transactions_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by avg() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_avg_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "secure_transfer_transactions". All fields are combined with a logical 'AND'. */
  ["secure_transfer_transactions_bool_exp"]: {
    _and?:
      | Array<ValueTypes["secure_transfer_transactions_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["secure_transfer_transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["secure_transfer_transactions_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    chat?:
      | ValueTypes["chats_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    counter?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    current_state?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    escrow?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    final_txn_signature?:
      | ValueTypes["String_comparison_exp"]
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
    message_client_generated_uuid?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    message_id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    signature?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    to?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "secure_transfer_transactions" */
  ["secure_transfer_transactions_constraint"]: secure_transfer_transactions_constraint;
  /** input type for incrementing numeric columns in table "secure_transfer_transactions" */
  ["secure_transfer_transactions_inc_input"]: {
    id?: number | undefined | null | Variable<any, string>;
    message_id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "secure_transfer_transactions" */
  ["secure_transfer_transactions_insert_input"]: {
    chat?:
      | ValueTypes["chats_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    counter?: string | undefined | null | Variable<any, string>;
    current_state?: string | undefined | null | Variable<any, string>;
    escrow?: string | undefined | null | Variable<any, string>;
    final_txn_signature?: string | undefined | null | Variable<any, string>;
    from?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    message_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    message_id?: number | undefined | null | Variable<any, string>;
    signature?: string | undefined | null | Variable<any, string>;
    to?: string | undefined | null | Variable<any, string>;
  };
  /** order by max() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_max_order_by"]: {
    counter?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    current_state?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    escrow?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    final_txn_signature?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    from?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    message_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    signature?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    to?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by min() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_min_order_by"]: {
    counter?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    current_state?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    escrow?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    final_txn_signature?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    from?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    message_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    signature?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    to?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "secure_transfer_transactions" */
  ["secure_transfer_transactions_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["secure_transfer_transactions"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "secure_transfer_transactions" */
  ["secure_transfer_transactions_on_conflict"]: {
    constraint:
      | ValueTypes["secure_transfer_transactions_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["secure_transfer_transactions_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["secure_transfer_transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "secure_transfer_transactions". */
  ["secure_transfer_transactions_order_by"]: {
    chat?:
      | ValueTypes["chats_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    counter?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    current_state?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    escrow?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    final_txn_signature?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    from?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message_client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    message_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    signature?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    to?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: secure_transfer_transactions */
  ["secure_transfer_transactions_pk_columns_input"]: {
    id: number | Variable<any, string>;
  };
  /** select columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_select_column"]: secure_transfer_transactions_select_column;
  /** input type for updating data in table "secure_transfer_transactions" */
  ["secure_transfer_transactions_set_input"]: {
    counter?: string | undefined | null | Variable<any, string>;
    current_state?: string | undefined | null | Variable<any, string>;
    escrow?: string | undefined | null | Variable<any, string>;
    final_txn_signature?: string | undefined | null | Variable<any, string>;
    from?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    message_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    message_id?: number | undefined | null | Variable<any, string>;
    signature?: string | undefined | null | Variable<any, string>;
    to?: string | undefined | null | Variable<any, string>;
  };
  /** order by stddev() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stddev_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by stddev_pop() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stddev_pop_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by stddev_samp() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stddev_samp_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Streaming cursor of the table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["secure_transfer_transactions_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["secure_transfer_transactions_stream_cursor_value_input"]: {
    counter?: string | undefined | null | Variable<any, string>;
    current_state?: string | undefined | null | Variable<any, string>;
    escrow?: string | undefined | null | Variable<any, string>;
    final_txn_signature?: string | undefined | null | Variable<any, string>;
    from?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    message_client_generated_uuid?:
      | string
      | undefined
      | null
      | Variable<any, string>;
    message_id?: number | undefined | null | Variable<any, string>;
    signature?: string | undefined | null | Variable<any, string>;
    to?: string | undefined | null | Variable<any, string>;
  };
  /** order by sum() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_sum_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** update columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_update_column"]: secure_transfer_transactions_update_column;
  ["secure_transfer_transactions_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["secure_transfer_transactions_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["secure_transfer_transactions_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    where:
      | ValueTypes["secure_transfer_transactions_bool_exp"]
      | Variable<any, string>;
  };
  /** order by var_pop() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_var_pop_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by var_samp() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_var_samp_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by variance() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_variance_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** columns and relationships of "simple_transactions" */
  ["simple_transactions"]: AliasType<{
    client_generated_uuid?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    txn_signature?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "simple_transactions" */
  ["simple_transactions_aggregate_order_by"]: {
    avg?:
      | ValueTypes["simple_transactions_avg_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["simple_transactions_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["simple_transactions_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev?:
      | ValueTypes["simple_transactions_stddev_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_pop?:
      | ValueTypes["simple_transactions_stddev_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_samp?:
      | ValueTypes["simple_transactions_stddev_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    sum?:
      | ValueTypes["simple_transactions_sum_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_pop?:
      | ValueTypes["simple_transactions_var_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_samp?:
      | ValueTypes["simple_transactions_var_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    variance?:
      | ValueTypes["simple_transactions_variance_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "simple_transactions" */
  ["simple_transactions_arr_rel_insert_input"]: {
    data:
      | Array<ValueTypes["simple_transactions_insert_input"]>
      | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["simple_transactions_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by avg() on columns of table "simple_transactions" */
  ["simple_transactions_avg_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "simple_transactions". All fields are combined with a logical 'AND'. */
  ["simple_transactions_bool_exp"]: {
    _and?:
      | Array<ValueTypes["simple_transactions_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["simple_transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["simple_transactions_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    client_generated_uuid?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    txn_signature?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "simple_transactions" */
  ["simple_transactions_constraint"]: simple_transactions_constraint;
  /** input type for incrementing numeric columns in table "simple_transactions" */
  ["simple_transactions_inc_input"]: {
    id?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "simple_transactions" */
  ["simple_transactions_insert_input"]: {
    client_generated_uuid?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    txn_signature?: string | undefined | null | Variable<any, string>;
  };
  /** order by max() on columns of table "simple_transactions" */
  ["simple_transactions_max_order_by"]: {
    client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    txn_signature?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** order by min() on columns of table "simple_transactions" */
  ["simple_transactions_min_order_by"]: {
    client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    txn_signature?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** response of any mutation on the table "simple_transactions" */
  ["simple_transactions_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["simple_transactions"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "simple_transactions" */
  ["simple_transactions_on_conflict"]: {
    constraint:
      | ValueTypes["simple_transactions_constraint"]
      | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["simple_transactions_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["simple_transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "simple_transactions". */
  ["simple_transactions_order_by"]: {
    client_generated_uuid?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    txn_signature?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: simple_transactions */
  ["simple_transactions_pk_columns_input"]: {
    id: number | Variable<any, string>;
  };
  /** select columns of table "simple_transactions" */
  ["simple_transactions_select_column"]: simple_transactions_select_column;
  /** input type for updating data in table "simple_transactions" */
  ["simple_transactions_set_input"]: {
    client_generated_uuid?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    txn_signature?: string | undefined | null | Variable<any, string>;
  };
  /** order by stddev() on columns of table "simple_transactions" */
  ["simple_transactions_stddev_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by stddev_pop() on columns of table "simple_transactions" */
  ["simple_transactions_stddev_pop_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by stddev_samp() on columns of table "simple_transactions" */
  ["simple_transactions_stddev_samp_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "simple_transactions" */
  ["simple_transactions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["simple_transactions_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["simple_transactions_stream_cursor_value_input"]: {
    client_generated_uuid?: string | undefined | null | Variable<any, string>;
    id?: number | undefined | null | Variable<any, string>;
    txn_signature?: string | undefined | null | Variable<any, string>;
  };
  /** order by sum() on columns of table "simple_transactions" */
  ["simple_transactions_sum_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** update columns of table "simple_transactions" */
  ["simple_transactions_update_column"]: simple_transactions_update_column;
  ["simple_transactions_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["simple_transactions_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["simple_transactions_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    where: ValueTypes["simple_transactions_bool_exp"] | Variable<any, string>;
  };
  /** order by var_pop() on columns of table "simple_transactions" */
  ["simple_transactions_var_pop_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by var_samp() on columns of table "simple_transactions" */
  ["simple_transactions_var_samp_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** order by variance() on columns of table "simple_transactions" */
  ["simple_transactions_variance_order_by"]: {
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  ["subscription_root"]: AliasType<{
    barter_poke_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["barter_poke_metadata_select_column"]>
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
          | Array<ValueTypes["barter_poke_metadata_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["barter_poke_metadata_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["barter_poke_metadata"]
    ];
    barter_poke_metadata_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["barter_poke_metadata"]
    ];
    barter_poke_metadata_stream?: [
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
              | ValueTypes["barter_poke_metadata_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["barter_poke_metadata_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["barter_poke_metadata"]
    ];
    barters?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["barters_select_column"]>
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
          | Array<ValueTypes["barters_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["barters_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["barters"]
    ];
    barters_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["barters"]
    ];
    barters_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["barters_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["barters_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["barters"]
    ];
    chat_barter_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chat_barter_metadata_select_column"]>
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
          | Array<ValueTypes["chat_barter_metadata_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_barter_metadata_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_barter_metadata"]
    ];
    chat_barter_metadata_stream?: [
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
              | ValueTypes["chat_barter_metadata_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_barter_metadata_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_barter_metadata"]
    ];
    chat_media_messages?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chat_media_messages_select_column"]>
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
          | Array<ValueTypes["chat_media_messages_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_media_messages_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_media_messages"]
    ];
    chat_media_messages_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["chat_media_messages"]
    ];
    chat_media_messages_stream?: [
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
              | ValueTypes["chat_media_messages_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_media_messages_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_media_messages"]
    ];
    chat_update_history?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chat_update_history_select_column"]>
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
          | Array<ValueTypes["chat_update_history_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_update_history_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_update_history"]
    ];
    chat_update_history_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["chat_update_history"]
    ];
    chat_update_history_stream?: [
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
              | ValueTypes["chat_update_history_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_update_history_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_update_history"]
    ];
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
    nft_sticker_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["nft_sticker_metadata_select_column"]>
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
          | Array<ValueTypes["nft_sticker_metadata_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["nft_sticker_metadata_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["nft_sticker_metadata"]
    ];
    nft_sticker_metadata_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["nft_sticker_metadata"]
    ];
    nft_sticker_metadata_stream?: [
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
              | ValueTypes["nft_sticker_metadata_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["nft_sticker_metadata_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["nft_sticker_metadata"]
    ];
    room_active_chat_mapping?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["room_active_chat_mapping_select_column"]>
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
          | Array<ValueTypes["room_active_chat_mapping_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["room_active_chat_mapping_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["room_active_chat_mapping"]
    ];
    room_active_chat_mapping_by_pk?: [
      { room_id: string | Variable<any, string> },
      ValueTypes["room_active_chat_mapping"]
    ];
    room_active_chat_mapping_stream?: [
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
              | ValueTypes["room_active_chat_mapping_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["room_active_chat_mapping_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["room_active_chat_mapping"]
    ];
    secure_transfer_transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["secure_transfer_transactions_select_column"]>
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
          | Array<ValueTypes["secure_transfer_transactions_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["secure_transfer_transactions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["secure_transfer_transactions"]
    ];
    secure_transfer_transactions_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["secure_transfer_transactions"]
    ];
    secure_transfer_transactions_stream?: [
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
              | ValueTypes["secure_transfer_transactions_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["secure_transfer_transactions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["secure_transfer_transactions"]
    ];
    simple_transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["simple_transactions_select_column"]>
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
          | Array<ValueTypes["simple_transactions_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["simple_transactions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["simple_transactions"]
    ];
    simple_transactions_by_pk?: [
      { id: number | Variable<any, string> },
      ValueTypes["simple_transactions"]
    ];
    simple_transactions_stream?: [
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
              | ValueTypes["simple_transactions_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["simple_transactions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["simple_transactions"]
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
  /** columns and relationships of "barter_poke_metadata" */
  ["barter_poke_metadata"]: AliasType<{
    barter_id?: boolean | `@${string}`;
    /** An object relationship */
    chat?: ResolverInputTypes["chats"];
    id?: boolean | `@${string}`;
    message_client_generated_uuid?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "barter_poke_metadata" */
  ["barter_poke_metadata_aggregate_order_by"]: {
    avg?:
      | ResolverInputTypes["barter_poke_metadata_avg_order_by"]
      | undefined
      | null;
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?:
      | ResolverInputTypes["barter_poke_metadata_max_order_by"]
      | undefined
      | null;
    min?:
      | ResolverInputTypes["barter_poke_metadata_min_order_by"]
      | undefined
      | null;
    stddev?:
      | ResolverInputTypes["barter_poke_metadata_stddev_order_by"]
      | undefined
      | null;
    stddev_pop?:
      | ResolverInputTypes["barter_poke_metadata_stddev_pop_order_by"]
      | undefined
      | null;
    stddev_samp?:
      | ResolverInputTypes["barter_poke_metadata_stddev_samp_order_by"]
      | undefined
      | null;
    sum?:
      | ResolverInputTypes["barter_poke_metadata_sum_order_by"]
      | undefined
      | null;
    var_pop?:
      | ResolverInputTypes["barter_poke_metadata_var_pop_order_by"]
      | undefined
      | null;
    var_samp?:
      | ResolverInputTypes["barter_poke_metadata_var_samp_order_by"]
      | undefined
      | null;
    variance?:
      | ResolverInputTypes["barter_poke_metadata_variance_order_by"]
      | undefined
      | null;
  };
  /** input type for inserting array relation for remote table "barter_poke_metadata" */
  ["barter_poke_metadata_arr_rel_insert_input"]: {
    data: Array<ResolverInputTypes["barter_poke_metadata_insert_input"]>;
    /** upsert condition */
    on_conflict?:
      | ResolverInputTypes["barter_poke_metadata_on_conflict"]
      | undefined
      | null;
  };
  /** order by avg() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_avg_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Boolean expression to filter rows from the table "barter_poke_metadata". All fields are combined with a logical 'AND'. */
  ["barter_poke_metadata_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["barter_poke_metadata_bool_exp"]>
      | undefined
      | null;
    _not?:
      | ResolverInputTypes["barter_poke_metadata_bool_exp"]
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["barter_poke_metadata_bool_exp"]>
      | undefined
      | null;
    barter_id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    chat?: ResolverInputTypes["chats_bool_exp"] | undefined | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    message_client_generated_uuid?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "barter_poke_metadata" */
  ["barter_poke_metadata_constraint"]: barter_poke_metadata_constraint;
  /** input type for incrementing numeric columns in table "barter_poke_metadata" */
  ["barter_poke_metadata_inc_input"]: {
    barter_id?: number | undefined | null;
    id?: number | undefined | null;
  };
  /** input type for inserting data into table "barter_poke_metadata" */
  ["barter_poke_metadata_insert_input"]: {
    barter_id?: number | undefined | null;
    chat?: ResolverInputTypes["chats_obj_rel_insert_input"] | undefined | null;
    id?: number | undefined | null;
    message_client_generated_uuid?: string | undefined | null;
  };
  /** order by max() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_max_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
  };
  /** order by min() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_min_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
  };
  /** response of any mutation on the table "barter_poke_metadata" */
  ["barter_poke_metadata_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["barter_poke_metadata"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "barter_poke_metadata" */
  ["barter_poke_metadata_on_conflict"]: {
    constraint: ResolverInputTypes["barter_poke_metadata_constraint"];
    update_columns: Array<
      ResolverInputTypes["barter_poke_metadata_update_column"]
    >;
    where?:
      | ResolverInputTypes["barter_poke_metadata_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "barter_poke_metadata". */
  ["barter_poke_metadata_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    chat?: ResolverInputTypes["chats_order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
  };
  /** primary key columns input for table: barter_poke_metadata */
  ["barter_poke_metadata_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_select_column"]: barter_poke_metadata_select_column;
  /** input type for updating data in table "barter_poke_metadata" */
  ["barter_poke_metadata_set_input"]: {
    barter_id?: number | undefined | null;
    id?: number | undefined | null;
    message_client_generated_uuid?: string | undefined | null;
  };
  /** order by stddev() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_stddev_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_pop() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_stddev_pop_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_samp() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_stddev_samp_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Streaming cursor of the table "barter_poke_metadata" */
  ["barter_poke_metadata_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["barter_poke_metadata_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["barter_poke_metadata_stream_cursor_value_input"]: {
    barter_id?: number | undefined | null;
    id?: number | undefined | null;
    message_client_generated_uuid?: string | undefined | null;
  };
  /** order by sum() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_sum_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** update columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_update_column"]: barter_poke_metadata_update_column;
  ["barter_poke_metadata_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ResolverInputTypes["barter_poke_metadata_inc_input"]
      | undefined
      | null;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ResolverInputTypes["barter_poke_metadata_set_input"]
      | undefined
      | null;
    where: ResolverInputTypes["barter_poke_metadata_bool_exp"];
  };
  /** order by var_pop() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_var_pop_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by var_samp() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_var_samp_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by variance() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_variance_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** columns and relationships of "barters" */
  ["barters"]: AliasType<{
    chat_barter_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chat_barter_metadata_select_column"]>
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
          | Array<ResolverInputTypes["chat_barter_metadata_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["chat_barter_metadata_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_barter_metadata"]
    ];
    id?: boolean | `@${string}`;
    on_chain_state?: boolean | `@${string}`;
    room_active_chat_mappings?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["room_active_chat_mapping_select_column"]>
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
          | Array<ResolverInputTypes["room_active_chat_mapping_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["room_active_chat_mapping_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["room_active_chat_mapping"]
    ];
    room_id?: boolean | `@${string}`;
    state?: boolean | `@${string}`;
    user1_offers?: boolean | `@${string}`;
    user2_offers?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "barters". All fields are combined with a logical 'AND'. */
  ["barters_bool_exp"]: {
    _and?: Array<ResolverInputTypes["barters_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["barters_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["barters_bool_exp"]> | undefined | null;
    chat_barter_metadata?:
      | ResolverInputTypes["chat_barter_metadata_bool_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    on_chain_state?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    room_active_chat_mappings?:
      | ResolverInputTypes["room_active_chat_mapping_bool_exp"]
      | undefined
      | null;
    room_id?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    state?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    user1_offers?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    user2_offers?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "barters" */
  ["barters_constraint"]: barters_constraint;
  /** input type for incrementing numeric columns in table "barters" */
  ["barters_inc_input"]: {
    id?: number | undefined | null;
  };
  /** input type for inserting data into table "barters" */
  ["barters_insert_input"]: {
    chat_barter_metadata?:
      | ResolverInputTypes["chat_barter_metadata_arr_rel_insert_input"]
      | undefined
      | null;
    id?: number | undefined | null;
    on_chain_state?: string | undefined | null;
    room_active_chat_mappings?:
      | ResolverInputTypes["room_active_chat_mapping_arr_rel_insert_input"]
      | undefined
      | null;
    room_id?: string | undefined | null;
    state?: string | undefined | null;
    user1_offers?: string | undefined | null;
    user2_offers?: string | undefined | null;
  };
  /** response of any mutation on the table "barters" */
  ["barters_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["barters"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "barters" */
  ["barters_obj_rel_insert_input"]: {
    data: ResolverInputTypes["barters_insert_input"];
    /** upsert condition */
    on_conflict?: ResolverInputTypes["barters_on_conflict"] | undefined | null;
  };
  /** on_conflict condition type for table "barters" */
  ["barters_on_conflict"]: {
    constraint: ResolverInputTypes["barters_constraint"];
    update_columns: Array<ResolverInputTypes["barters_update_column"]>;
    where?: ResolverInputTypes["barters_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "barters". */
  ["barters_order_by"]: {
    chat_barter_metadata_aggregate?:
      | ResolverInputTypes["chat_barter_metadata_aggregate_order_by"]
      | undefined
      | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    on_chain_state?: ResolverInputTypes["order_by"] | undefined | null;
    room_active_chat_mappings_aggregate?:
      | ResolverInputTypes["room_active_chat_mapping_aggregate_order_by"]
      | undefined
      | null;
    room_id?: ResolverInputTypes["order_by"] | undefined | null;
    state?: ResolverInputTypes["order_by"] | undefined | null;
    user1_offers?: ResolverInputTypes["order_by"] | undefined | null;
    user2_offers?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: barters */
  ["barters_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "barters" */
  ["barters_select_column"]: barters_select_column;
  /** input type for updating data in table "barters" */
  ["barters_set_input"]: {
    id?: number | undefined | null;
    on_chain_state?: string | undefined | null;
    room_id?: string | undefined | null;
    state?: string | undefined | null;
    user1_offers?: string | undefined | null;
    user2_offers?: string | undefined | null;
  };
  /** Streaming cursor of the table "barters" */
  ["barters_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["barters_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["barters_stream_cursor_value_input"]: {
    id?: number | undefined | null;
    on_chain_state?: string | undefined | null;
    room_id?: string | undefined | null;
    state?: string | undefined | null;
    user1_offers?: string | undefined | null;
    user2_offers?: string | undefined | null;
  };
  /** update columns of table "barters" */
  ["barters_update_column"]: barters_update_column;
  ["barters_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ResolverInputTypes["barters_inc_input"] | undefined | null;
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["barters_set_input"] | undefined | null;
    where: ResolverInputTypes["barters_bool_exp"];
  };
  /** columns and relationships of "chat_barter_metadata" */
  ["chat_barter_metadata"]: AliasType<{
    /** An object relationship */
    barter?: ResolverInputTypes["barters"];
    barter_id?: boolean | `@${string}`;
    /** An object relationship */
    chat?: ResolverInputTypes["chats"];
    chat_client_generated_uuid?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "chat_barter_metadata" */
  ["chat_barter_metadata_aggregate_order_by"]: {
    avg?:
      | ResolverInputTypes["chat_barter_metadata_avg_order_by"]
      | undefined
      | null;
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?:
      | ResolverInputTypes["chat_barter_metadata_max_order_by"]
      | undefined
      | null;
    min?:
      | ResolverInputTypes["chat_barter_metadata_min_order_by"]
      | undefined
      | null;
    stddev?:
      | ResolverInputTypes["chat_barter_metadata_stddev_order_by"]
      | undefined
      | null;
    stddev_pop?:
      | ResolverInputTypes["chat_barter_metadata_stddev_pop_order_by"]
      | undefined
      | null;
    stddev_samp?:
      | ResolverInputTypes["chat_barter_metadata_stddev_samp_order_by"]
      | undefined
      | null;
    sum?:
      | ResolverInputTypes["chat_barter_metadata_sum_order_by"]
      | undefined
      | null;
    var_pop?:
      | ResolverInputTypes["chat_barter_metadata_var_pop_order_by"]
      | undefined
      | null;
    var_samp?:
      | ResolverInputTypes["chat_barter_metadata_var_samp_order_by"]
      | undefined
      | null;
    variance?:
      | ResolverInputTypes["chat_barter_metadata_variance_order_by"]
      | undefined
      | null;
  };
  /** input type for inserting array relation for remote table "chat_barter_metadata" */
  ["chat_barter_metadata_arr_rel_insert_input"]: {
    data: Array<ResolverInputTypes["chat_barter_metadata_insert_input"]>;
    /** upsert condition */
    on_conflict?:
      | ResolverInputTypes["chat_barter_metadata_on_conflict"]
      | undefined
      | null;
  };
  /** order by avg() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_avg_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Boolean expression to filter rows from the table "chat_barter_metadata". All fields are combined with a logical 'AND'. */
  ["chat_barter_metadata_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["chat_barter_metadata_bool_exp"]>
      | undefined
      | null;
    _not?:
      | ResolverInputTypes["chat_barter_metadata_bool_exp"]
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["chat_barter_metadata_bool_exp"]>
      | undefined
      | null;
    barter?: ResolverInputTypes["barters_bool_exp"] | undefined | null;
    barter_id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    chat?: ResolverInputTypes["chats_bool_exp"] | undefined | null;
    chat_client_generated_uuid?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "chat_barter_metadata" */
  ["chat_barter_metadata_constraint"]: chat_barter_metadata_constraint;
  /** input type for inserting data into table "chat_barter_metadata" */
  ["chat_barter_metadata_insert_input"]: {
    barter?:
      | ResolverInputTypes["barters_obj_rel_insert_input"]
      | undefined
      | null;
    barter_id?: number | undefined | null;
    chat?: ResolverInputTypes["chats_obj_rel_insert_input"] | undefined | null;
    chat_client_generated_uuid?: string | undefined | null;
  };
  /** order by max() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_max_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    chat_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
  };
  /** order by min() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_min_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    chat_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
  };
  /** response of any mutation on the table "chat_barter_metadata" */
  ["chat_barter_metadata_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["chat_barter_metadata"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "chat_barter_metadata" */
  ["chat_barter_metadata_on_conflict"]: {
    constraint: ResolverInputTypes["chat_barter_metadata_constraint"];
    update_columns: Array<
      ResolverInputTypes["chat_barter_metadata_update_column"]
    >;
    where?:
      | ResolverInputTypes["chat_barter_metadata_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "chat_barter_metadata". */
  ["chat_barter_metadata_order_by"]: {
    barter?: ResolverInputTypes["barters_order_by"] | undefined | null;
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    chat?: ResolverInputTypes["chats_order_by"] | undefined | null;
    chat_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
  };
  /** select columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_select_column"]: chat_barter_metadata_select_column;
  /** order by stddev() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_stddev_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_pop() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_stddev_pop_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_samp() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_stddev_samp_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Streaming cursor of the table "chat_barter_metadata" */
  ["chat_barter_metadata_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["chat_barter_metadata_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_barter_metadata_stream_cursor_value_input"]: {
    barter_id?: number | undefined | null;
    chat_client_generated_uuid?: string | undefined | null;
  };
  /** order by sum() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_sum_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** placeholder for update columns of table "chat_barter_metadata" (current role has no relevant permissions) */
  ["chat_barter_metadata_update_column"]: chat_barter_metadata_update_column;
  ["chat_barter_metadata_updates"]: {
    where: ResolverInputTypes["chat_barter_metadata_bool_exp"];
  };
  /** order by var_pop() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_var_pop_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by var_samp() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_var_samp_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by variance() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_variance_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** columns and relationships of "chat_media_messages" */
  ["chat_media_messages"]: AliasType<{
    /** An object relationship */
    chat?: ResolverInputTypes["chats"];
    id?: boolean | `@${string}`;
    media_kind?: boolean | `@${string}`;
    media_link?: boolean | `@${string}`;
    message_client_generated_uuid?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "chat_media_messages" */
  ["chat_media_messages_aggregate_order_by"]: {
    avg?:
      | ResolverInputTypes["chat_media_messages_avg_order_by"]
      | undefined
      | null;
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?:
      | ResolverInputTypes["chat_media_messages_max_order_by"]
      | undefined
      | null;
    min?:
      | ResolverInputTypes["chat_media_messages_min_order_by"]
      | undefined
      | null;
    stddev?:
      | ResolverInputTypes["chat_media_messages_stddev_order_by"]
      | undefined
      | null;
    stddev_pop?:
      | ResolverInputTypes["chat_media_messages_stddev_pop_order_by"]
      | undefined
      | null;
    stddev_samp?:
      | ResolverInputTypes["chat_media_messages_stddev_samp_order_by"]
      | undefined
      | null;
    sum?:
      | ResolverInputTypes["chat_media_messages_sum_order_by"]
      | undefined
      | null;
    var_pop?:
      | ResolverInputTypes["chat_media_messages_var_pop_order_by"]
      | undefined
      | null;
    var_samp?:
      | ResolverInputTypes["chat_media_messages_var_samp_order_by"]
      | undefined
      | null;
    variance?:
      | ResolverInputTypes["chat_media_messages_variance_order_by"]
      | undefined
      | null;
  };
  /** input type for inserting array relation for remote table "chat_media_messages" */
  ["chat_media_messages_arr_rel_insert_input"]: {
    data: Array<ResolverInputTypes["chat_media_messages_insert_input"]>;
    /** upsert condition */
    on_conflict?:
      | ResolverInputTypes["chat_media_messages_on_conflict"]
      | undefined
      | null;
  };
  /** order by avg() on columns of table "chat_media_messages" */
  ["chat_media_messages_avg_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Boolean expression to filter rows from the table "chat_media_messages". All fields are combined with a logical 'AND'. */
  ["chat_media_messages_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["chat_media_messages_bool_exp"]>
      | undefined
      | null;
    _not?:
      | ResolverInputTypes["chat_media_messages_bool_exp"]
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["chat_media_messages_bool_exp"]>
      | undefined
      | null;
    chat?: ResolverInputTypes["chats_bool_exp"] | undefined | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    media_kind?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    media_link?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    message_client_generated_uuid?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "chat_media_messages" */
  ["chat_media_messages_constraint"]: chat_media_messages_constraint;
  /** input type for incrementing numeric columns in table "chat_media_messages" */
  ["chat_media_messages_inc_input"]: {
    id?: number | undefined | null;
  };
  /** input type for inserting data into table "chat_media_messages" */
  ["chat_media_messages_insert_input"]: {
    chat?: ResolverInputTypes["chats_obj_rel_insert_input"] | undefined | null;
    id?: number | undefined | null;
    media_kind?: string | undefined | null;
    media_link?: string | undefined | null;
    message_client_generated_uuid?: string | undefined | null;
  };
  /** order by max() on columns of table "chat_media_messages" */
  ["chat_media_messages_max_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
    media_kind?: ResolverInputTypes["order_by"] | undefined | null;
    media_link?: ResolverInputTypes["order_by"] | undefined | null;
    message_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
  };
  /** order by min() on columns of table "chat_media_messages" */
  ["chat_media_messages_min_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
    media_kind?: ResolverInputTypes["order_by"] | undefined | null;
    media_link?: ResolverInputTypes["order_by"] | undefined | null;
    message_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
  };
  /** response of any mutation on the table "chat_media_messages" */
  ["chat_media_messages_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["chat_media_messages"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "chat_media_messages" */
  ["chat_media_messages_on_conflict"]: {
    constraint: ResolverInputTypes["chat_media_messages_constraint"];
    update_columns: Array<
      ResolverInputTypes["chat_media_messages_update_column"]
    >;
    where?:
      | ResolverInputTypes["chat_media_messages_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "chat_media_messages". */
  ["chat_media_messages_order_by"]: {
    chat?: ResolverInputTypes["chats_order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    media_kind?: ResolverInputTypes["order_by"] | undefined | null;
    media_link?: ResolverInputTypes["order_by"] | undefined | null;
    message_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
  };
  /** primary key columns input for table: chat_media_messages */
  ["chat_media_messages_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "chat_media_messages" */
  ["chat_media_messages_select_column"]: chat_media_messages_select_column;
  /** input type for updating data in table "chat_media_messages" */
  ["chat_media_messages_set_input"]: {
    id?: number | undefined | null;
    media_kind?: string | undefined | null;
    media_link?: string | undefined | null;
    message_client_generated_uuid?: string | undefined | null;
  };
  /** order by stddev() on columns of table "chat_media_messages" */
  ["chat_media_messages_stddev_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_pop() on columns of table "chat_media_messages" */
  ["chat_media_messages_stddev_pop_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_samp() on columns of table "chat_media_messages" */
  ["chat_media_messages_stddev_samp_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Streaming cursor of the table "chat_media_messages" */
  ["chat_media_messages_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["chat_media_messages_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_media_messages_stream_cursor_value_input"]: {
    id?: number | undefined | null;
    media_kind?: string | undefined | null;
    media_link?: string | undefined | null;
    message_client_generated_uuid?: string | undefined | null;
  };
  /** order by sum() on columns of table "chat_media_messages" */
  ["chat_media_messages_sum_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** update columns of table "chat_media_messages" */
  ["chat_media_messages_update_column"]: chat_media_messages_update_column;
  ["chat_media_messages_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ResolverInputTypes["chat_media_messages_inc_input"]
      | undefined
      | null;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ResolverInputTypes["chat_media_messages_set_input"]
      | undefined
      | null;
    where: ResolverInputTypes["chat_media_messages_bool_exp"];
  };
  /** order by var_pop() on columns of table "chat_media_messages" */
  ["chat_media_messages_var_pop_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by var_samp() on columns of table "chat_media_messages" */
  ["chat_media_messages_var_samp_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by variance() on columns of table "chat_media_messages" */
  ["chat_media_messages_variance_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** columns and relationships of "chat_update_history" */
  ["chat_update_history"]: AliasType<{
    client_generated_uuid?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    room?: boolean | `@${string}`;
    type?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "chat_update_history". All fields are combined with a logical 'AND'. */
  ["chat_update_history_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["chat_update_history_bool_exp"]>
      | undefined
      | null;
    _not?:
      | ResolverInputTypes["chat_update_history_bool_exp"]
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["chat_update_history_bool_exp"]>
      | undefined
      | null;
    client_generated_uuid?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    created_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    room?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    type?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "chat_update_history" */
  ["chat_update_history_constraint"]: chat_update_history_constraint;
  /** input type for inserting data into table "chat_update_history" */
  ["chat_update_history_insert_input"]: {
    client_generated_uuid?: string | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: number | undefined | null;
    room?: string | undefined | null;
    type?: string | undefined | null;
  };
  /** response of any mutation on the table "chat_update_history" */
  ["chat_update_history_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["chat_update_history"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "chat_update_history" */
  ["chat_update_history_on_conflict"]: {
    constraint: ResolverInputTypes["chat_update_history_constraint"];
    update_columns: Array<
      ResolverInputTypes["chat_update_history_update_column"]
    >;
    where?:
      | ResolverInputTypes["chat_update_history_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "chat_update_history". */
  ["chat_update_history_order_by"]: {
    client_generated_uuid?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    room?: ResolverInputTypes["order_by"] | undefined | null;
    type?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** select columns of table "chat_update_history" */
  ["chat_update_history_select_column"]: chat_update_history_select_column;
  /** Streaming cursor of the table "chat_update_history" */
  ["chat_update_history_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["chat_update_history_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_update_history_stream_cursor_value_input"]: {
    client_generated_uuid?: string | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: number | undefined | null;
    room?: string | undefined | null;
    type?: string | undefined | null;
  };
  /** placeholder for update columns of table "chat_update_history" (current role has no relevant permissions) */
  ["chat_update_history_update_column"]: chat_update_history_update_column;
  /** columns and relationships of "chats" */
  ["chats"]: AliasType<{
    barter_poke_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["barter_poke_metadata_select_column"]>
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
          | Array<ResolverInputTypes["barter_poke_metadata_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["barter_poke_metadata_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["barter_poke_metadata"]
    ];
    chat_barter_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chat_barter_metadata_select_column"]>
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
          | Array<ResolverInputTypes["chat_barter_metadata_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["chat_barter_metadata_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_barter_metadata"]
    ];
    chat_media_messages?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chat_media_messages_select_column"]>
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
          | Array<ResolverInputTypes["chat_media_messages_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["chat_media_messages_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_media_messages"]
    ];
    client_generated_uuid?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    deleted?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    message?: boolean | `@${string}`;
    message_kind?: boolean | `@${string}`;
    nft_sticker_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["nft_sticker_metadata_select_column"]>
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
          | Array<ResolverInputTypes["nft_sticker_metadata_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["nft_sticker_metadata_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["nft_sticker_metadata"]
    ];
    parent_client_generated_uuid?: boolean | `@${string}`;
    room?: boolean | `@${string}`;
    secure_transfer_transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<
              ResolverInputTypes["secure_transfer_transactions_select_column"]
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
          | Array<ResolverInputTypes["secure_transfer_transactions_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["secure_transfer_transactions_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["secure_transfer_transactions"]
    ];
    simple_transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["simple_transactions_select_column"]>
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
          | Array<ResolverInputTypes["simple_transactions_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["simple_transactions_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["simple_transactions"]
    ];
    type?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    uuid?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "chats". All fields are combined with a logical 'AND'. */
  ["chats_bool_exp"]: {
    _and?: Array<ResolverInputTypes["chats_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["chats_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["chats_bool_exp"]> | undefined | null;
    barter_poke_metadata?:
      | ResolverInputTypes["barter_poke_metadata_bool_exp"]
      | undefined
      | null;
    chat_barter_metadata?:
      | ResolverInputTypes["chat_barter_metadata_bool_exp"]
      | undefined
      | null;
    chat_media_messages?:
      | ResolverInputTypes["chat_media_messages_bool_exp"]
      | undefined
      | null;
    client_generated_uuid?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    created_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    deleted?: ResolverInputTypes["Boolean_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    message?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    message_kind?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    nft_sticker_metadata?:
      | ResolverInputTypes["nft_sticker_metadata_bool_exp"]
      | undefined
      | null;
    parent_client_generated_uuid?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    room?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    secure_transfer_transactions?:
      | ResolverInputTypes["secure_transfer_transactions_bool_exp"]
      | undefined
      | null;
    simple_transactions?:
      | ResolverInputTypes["simple_transactions_bool_exp"]
      | undefined
      | null;
    type?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    username?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    uuid?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "chats" */
  ["chats_constraint"]: chats_constraint;
  /** input type for inserting data into table "chats" */
  ["chats_insert_input"]: {
    barter_poke_metadata?:
      | ResolverInputTypes["barter_poke_metadata_arr_rel_insert_input"]
      | undefined
      | null;
    chat_barter_metadata?:
      | ResolverInputTypes["chat_barter_metadata_arr_rel_insert_input"]
      | undefined
      | null;
    chat_media_messages?:
      | ResolverInputTypes["chat_media_messages_arr_rel_insert_input"]
      | undefined
      | null;
    client_generated_uuid?: string | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    deleted?: boolean | undefined | null;
    id?: number | undefined | null;
    message?: string | undefined | null;
    message_kind?: string | undefined | null;
    nft_sticker_metadata?:
      | ResolverInputTypes["nft_sticker_metadata_arr_rel_insert_input"]
      | undefined
      | null;
    parent_client_generated_uuid?: string | undefined | null;
    room?: string | undefined | null;
    secure_transfer_transactions?:
      | ResolverInputTypes["secure_transfer_transactions_arr_rel_insert_input"]
      | undefined
      | null;
    simple_transactions?:
      | ResolverInputTypes["simple_transactions_arr_rel_insert_input"]
      | undefined
      | null;
    type?: string | undefined | null;
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
  /** input type for inserting object relation for remote table "chats" */
  ["chats_obj_rel_insert_input"]: {
    data: ResolverInputTypes["chats_insert_input"];
    /** upsert condition */
    on_conflict?: ResolverInputTypes["chats_on_conflict"] | undefined | null;
  };
  /** on_conflict condition type for table "chats" */
  ["chats_on_conflict"]: {
    constraint: ResolverInputTypes["chats_constraint"];
    update_columns: Array<ResolverInputTypes["chats_update_column"]>;
    where?: ResolverInputTypes["chats_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "chats". */
  ["chats_order_by"]: {
    barter_poke_metadata_aggregate?:
      | ResolverInputTypes["barter_poke_metadata_aggregate_order_by"]
      | undefined
      | null;
    chat_barter_metadata_aggregate?:
      | ResolverInputTypes["chat_barter_metadata_aggregate_order_by"]
      | undefined
      | null;
    chat_media_messages_aggregate?:
      | ResolverInputTypes["chat_media_messages_aggregate_order_by"]
      | undefined
      | null;
    client_generated_uuid?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    deleted?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message?: ResolverInputTypes["order_by"] | undefined | null;
    message_kind?: ResolverInputTypes["order_by"] | undefined | null;
    nft_sticker_metadata_aggregate?:
      | ResolverInputTypes["nft_sticker_metadata_aggregate_order_by"]
      | undefined
      | null;
    parent_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
    room?: ResolverInputTypes["order_by"] | undefined | null;
    secure_transfer_transactions_aggregate?:
      | ResolverInputTypes["secure_transfer_transactions_aggregate_order_by"]
      | undefined
      | null;
    simple_transactions_aggregate?:
      | ResolverInputTypes["simple_transactions_aggregate_order_by"]
      | undefined
      | null;
    type?: ResolverInputTypes["order_by"] | undefined | null;
    username?: ResolverInputTypes["order_by"] | undefined | null;
    uuid?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: chats */
  ["chats_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "chats" */
  ["chats_select_column"]: chats_select_column;
  /** input type for updating data in table "chats" */
  ["chats_set_input"]: {
    deleted?: boolean | undefined | null;
  };
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
    deleted?: boolean | undefined | null;
    id?: number | undefined | null;
    message?: string | undefined | null;
    message_kind?: string | undefined | null;
    parent_client_generated_uuid?: string | undefined | null;
    room?: string | undefined | null;
    type?: string | undefined | null;
    username?: string | undefined | null;
    uuid?: string | undefined | null;
  };
  /** update columns of table "chats" */
  ["chats_update_column"]: chats_update_column;
  ["chats_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["chats_set_input"] | undefined | null;
    where: ResolverInputTypes["chats_bool_exp"];
  };
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** mutation root */
  ["mutation_root"]: AliasType<{
    delete_room_active_chat_mapping?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["room_active_chat_mapping_bool_exp"];
      },
      ResolverInputTypes["room_active_chat_mapping_mutation_response"]
    ];
    delete_room_active_chat_mapping_by_pk?: [
      { room_id: string },
      ResolverInputTypes["room_active_chat_mapping"]
    ];
    insert_barter_poke_metadata?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["barter_poke_metadata_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["barter_poke_metadata_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["barter_poke_metadata_mutation_response"]
    ];
    insert_barter_poke_metadata_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["barter_poke_metadata_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["barter_poke_metadata_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["barter_poke_metadata"]
    ];
    insert_barters?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["barters_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["barters_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["barters_mutation_response"]
    ];
    insert_barters_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["barters_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["barters_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["barters"]
    ];
    insert_chat_barter_metadata?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["chat_barter_metadata_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["chat_barter_metadata_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_barter_metadata_mutation_response"]
    ];
    insert_chat_barter_metadata_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["chat_barter_metadata_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["chat_barter_metadata_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_barter_metadata"]
    ];
    insert_chat_media_messages?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["chat_media_messages_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["chat_media_messages_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_media_messages_mutation_response"]
    ];
    insert_chat_media_messages_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["chat_media_messages_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["chat_media_messages_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_media_messages"]
    ];
    insert_chat_update_history?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["chat_update_history_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["chat_update_history_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_update_history_mutation_response"]
    ];
    insert_chat_update_history_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["chat_update_history_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["chat_update_history_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_update_history"]
    ];
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
    insert_nft_sticker_metadata?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["nft_sticker_metadata_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["nft_sticker_metadata_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["nft_sticker_metadata_mutation_response"]
    ];
    insert_nft_sticker_metadata_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["nft_sticker_metadata_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["nft_sticker_metadata_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["nft_sticker_metadata"]
    ];
    insert_room_active_chat_mapping?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["room_active_chat_mapping_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["room_active_chat_mapping_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["room_active_chat_mapping_mutation_response"]
    ];
    insert_room_active_chat_mapping_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["room_active_chat_mapping_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["room_active_chat_mapping_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["room_active_chat_mapping"]
    ];
    insert_secure_transfer_transactions?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["secure_transfer_transactions_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["secure_transfer_transactions_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["secure_transfer_transactions_mutation_response"]
    ];
    insert_secure_transfer_transactions_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["secure_transfer_transactions_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["secure_transfer_transactions_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["secure_transfer_transactions"]
    ];
    insert_simple_transactions?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["simple_transactions_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["simple_transactions_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["simple_transactions_mutation_response"]
    ];
    insert_simple_transactions_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["simple_transactions_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["simple_transactions_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["simple_transactions"]
    ];
    update_barter_poke_metadata?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["barter_poke_metadata_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["barter_poke_metadata_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["barter_poke_metadata_bool_exp"];
      },
      ResolverInputTypes["barter_poke_metadata_mutation_response"]
    ];
    update_barter_poke_metadata_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["barter_poke_metadata_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["barter_poke_metadata_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["barter_poke_metadata_pk_columns_input"];
      },
      ResolverInputTypes["barter_poke_metadata"]
    ];
    update_barter_poke_metadata_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["barter_poke_metadata_updates"]>;
      },
      ResolverInputTypes["barter_poke_metadata_mutation_response"]
    ];
    update_barters?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["barters_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["barters_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["barters_bool_exp"];
      },
      ResolverInputTypes["barters_mutation_response"]
    ];
    update_barters_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["barters_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?: ResolverInputTypes["barters_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["barters_pk_columns_input"];
      },
      ResolverInputTypes["barters"]
    ];
    update_barters_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["barters_updates"]>;
      },
      ResolverInputTypes["barters_mutation_response"]
    ];
    update_chat_barter_metadata?: [
      {
        /** filter the rows which have to be updated */
        where: ResolverInputTypes["chat_barter_metadata_bool_exp"];
      },
      ResolverInputTypes["chat_barter_metadata_mutation_response"]
    ];
    update_chat_barter_metadata_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["chat_barter_metadata_updates"]>;
      },
      ResolverInputTypes["chat_barter_metadata_mutation_response"]
    ];
    update_chat_media_messages?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["chat_media_messages_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["chat_media_messages_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["chat_media_messages_bool_exp"];
      },
      ResolverInputTypes["chat_media_messages_mutation_response"]
    ];
    update_chat_media_messages_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["chat_media_messages_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["chat_media_messages_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["chat_media_messages_pk_columns_input"];
      },
      ResolverInputTypes["chat_media_messages"]
    ];
    update_chat_media_messages_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["chat_media_messages_updates"]>;
      },
      ResolverInputTypes["chat_media_messages_mutation_response"]
    ];
    update_chats?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["chats_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["chats_bool_exp"];
      },
      ResolverInputTypes["chats_mutation_response"]
    ];
    update_chats_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?: ResolverInputTypes["chats_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["chats_pk_columns_input"];
      },
      ResolverInputTypes["chats"]
    ];
    update_chats_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["chats_updates"]>;
      },
      ResolverInputTypes["chats_mutation_response"]
    ];
    update_nft_sticker_metadata?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["nft_sticker_metadata_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["nft_sticker_metadata_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["nft_sticker_metadata_bool_exp"];
      },
      ResolverInputTypes["nft_sticker_metadata_mutation_response"]
    ];
    update_nft_sticker_metadata_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["nft_sticker_metadata_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["nft_sticker_metadata_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["nft_sticker_metadata_pk_columns_input"];
      },
      ResolverInputTypes["nft_sticker_metadata"]
    ];
    update_nft_sticker_metadata_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["nft_sticker_metadata_updates"]>;
      },
      ResolverInputTypes["nft_sticker_metadata_mutation_response"]
    ];
    update_room_active_chat_mapping?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["room_active_chat_mapping_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["room_active_chat_mapping_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["room_active_chat_mapping_bool_exp"];
      },
      ResolverInputTypes["room_active_chat_mapping_mutation_response"]
    ];
    update_room_active_chat_mapping_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["room_active_chat_mapping_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["room_active_chat_mapping_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["room_active_chat_mapping_pk_columns_input"];
      },
      ResolverInputTypes["room_active_chat_mapping"]
    ];
    update_room_active_chat_mapping_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["room_active_chat_mapping_updates"]>;
      },
      ResolverInputTypes["room_active_chat_mapping_mutation_response"]
    ];
    update_secure_transfer_transactions?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["secure_transfer_transactions_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["secure_transfer_transactions_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["secure_transfer_transactions_bool_exp"];
      },
      ResolverInputTypes["secure_transfer_transactions_mutation_response"]
    ];
    update_secure_transfer_transactions_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["secure_transfer_transactions_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["secure_transfer_transactions_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["secure_transfer_transactions_pk_columns_input"];
      },
      ResolverInputTypes["secure_transfer_transactions"]
    ];
    update_secure_transfer_transactions_many?: [
      {
        /** updates to execute, in order */
        updates: Array<
          ResolverInputTypes["secure_transfer_transactions_updates"]
        >;
      },
      ResolverInputTypes["secure_transfer_transactions_mutation_response"]
    ];
    update_simple_transactions?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["simple_transactions_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["simple_transactions_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["simple_transactions_bool_exp"];
      },
      ResolverInputTypes["simple_transactions_mutation_response"]
    ];
    update_simple_transactions_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["simple_transactions_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["simple_transactions_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["simple_transactions_pk_columns_input"];
      },
      ResolverInputTypes["simple_transactions"]
    ];
    update_simple_transactions_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["simple_transactions_updates"]>;
      },
      ResolverInputTypes["simple_transactions_mutation_response"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** columns and relationships of "nft_sticker_metadata" */
  ["nft_sticker_metadata"]: AliasType<{
    /** An object relationship */
    chat?: ResolverInputTypes["chats"];
    chat_client_generated_uuid?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mint?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_aggregate_order_by"]: {
    avg?:
      | ResolverInputTypes["nft_sticker_metadata_avg_order_by"]
      | undefined
      | null;
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?:
      | ResolverInputTypes["nft_sticker_metadata_max_order_by"]
      | undefined
      | null;
    min?:
      | ResolverInputTypes["nft_sticker_metadata_min_order_by"]
      | undefined
      | null;
    stddev?:
      | ResolverInputTypes["nft_sticker_metadata_stddev_order_by"]
      | undefined
      | null;
    stddev_pop?:
      | ResolverInputTypes["nft_sticker_metadata_stddev_pop_order_by"]
      | undefined
      | null;
    stddev_samp?:
      | ResolverInputTypes["nft_sticker_metadata_stddev_samp_order_by"]
      | undefined
      | null;
    sum?:
      | ResolverInputTypes["nft_sticker_metadata_sum_order_by"]
      | undefined
      | null;
    var_pop?:
      | ResolverInputTypes["nft_sticker_metadata_var_pop_order_by"]
      | undefined
      | null;
    var_samp?:
      | ResolverInputTypes["nft_sticker_metadata_var_samp_order_by"]
      | undefined
      | null;
    variance?:
      | ResolverInputTypes["nft_sticker_metadata_variance_order_by"]
      | undefined
      | null;
  };
  /** input type for inserting array relation for remote table "nft_sticker_metadata" */
  ["nft_sticker_metadata_arr_rel_insert_input"]: {
    data: Array<ResolverInputTypes["nft_sticker_metadata_insert_input"]>;
    /** upsert condition */
    on_conflict?:
      | ResolverInputTypes["nft_sticker_metadata_on_conflict"]
      | undefined
      | null;
  };
  /** order by avg() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_avg_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Boolean expression to filter rows from the table "nft_sticker_metadata". All fields are combined with a logical 'AND'. */
  ["nft_sticker_metadata_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["nft_sticker_metadata_bool_exp"]>
      | undefined
      | null;
    _not?:
      | ResolverInputTypes["nft_sticker_metadata_bool_exp"]
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["nft_sticker_metadata_bool_exp"]>
      | undefined
      | null;
    chat?: ResolverInputTypes["chats_bool_exp"] | undefined | null;
    chat_client_generated_uuid?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    mint?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "nft_sticker_metadata" */
  ["nft_sticker_metadata_constraint"]: nft_sticker_metadata_constraint;
  /** input type for incrementing numeric columns in table "nft_sticker_metadata" */
  ["nft_sticker_metadata_inc_input"]: {
    id?: number | undefined | null;
  };
  /** input type for inserting data into table "nft_sticker_metadata" */
  ["nft_sticker_metadata_insert_input"]: {
    chat?: ResolverInputTypes["chats_obj_rel_insert_input"] | undefined | null;
    chat_client_generated_uuid?: string | undefined | null;
    id?: number | undefined | null;
    mint?: string | undefined | null;
  };
  /** order by max() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_max_order_by"]: {
    chat_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    mint?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by min() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_min_order_by"]: {
    chat_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    mint?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** response of any mutation on the table "nft_sticker_metadata" */
  ["nft_sticker_metadata_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["nft_sticker_metadata"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "nft_sticker_metadata" */
  ["nft_sticker_metadata_on_conflict"]: {
    constraint: ResolverInputTypes["nft_sticker_metadata_constraint"];
    update_columns: Array<
      ResolverInputTypes["nft_sticker_metadata_update_column"]
    >;
    where?:
      | ResolverInputTypes["nft_sticker_metadata_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "nft_sticker_metadata". */
  ["nft_sticker_metadata_order_by"]: {
    chat?: ResolverInputTypes["chats_order_by"] | undefined | null;
    chat_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    mint?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: nft_sticker_metadata */
  ["nft_sticker_metadata_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_select_column"]: nft_sticker_metadata_select_column;
  /** input type for updating data in table "nft_sticker_metadata" */
  ["nft_sticker_metadata_set_input"]: {
    chat_client_generated_uuid?: string | undefined | null;
    id?: number | undefined | null;
    mint?: string | undefined | null;
  };
  /** order by stddev() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stddev_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_pop() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stddev_pop_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_samp() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stddev_samp_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Streaming cursor of the table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["nft_sticker_metadata_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["nft_sticker_metadata_stream_cursor_value_input"]: {
    chat_client_generated_uuid?: string | undefined | null;
    id?: number | undefined | null;
    mint?: string | undefined | null;
  };
  /** order by sum() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_sum_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** update columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_update_column"]: nft_sticker_metadata_update_column;
  ["nft_sticker_metadata_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ResolverInputTypes["nft_sticker_metadata_inc_input"]
      | undefined
      | null;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ResolverInputTypes["nft_sticker_metadata_set_input"]
      | undefined
      | null;
    where: ResolverInputTypes["nft_sticker_metadata_bool_exp"];
  };
  /** order by var_pop() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_var_pop_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by var_samp() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_var_samp_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by variance() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_variance_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    barter_poke_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["barter_poke_metadata_select_column"]>
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
          | Array<ResolverInputTypes["barter_poke_metadata_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["barter_poke_metadata_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["barter_poke_metadata"]
    ];
    barter_poke_metadata_by_pk?: [
      { id: number },
      ResolverInputTypes["barter_poke_metadata"]
    ];
    barters?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["barters_select_column"]>
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
          | Array<ResolverInputTypes["barters_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["barters_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["barters"]
    ];
    barters_by_pk?: [{ id: number }, ResolverInputTypes["barters"]];
    chat_barter_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chat_barter_metadata_select_column"]>
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
          | Array<ResolverInputTypes["chat_barter_metadata_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["chat_barter_metadata_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_barter_metadata"]
    ];
    chat_media_messages?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chat_media_messages_select_column"]>
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
          | Array<ResolverInputTypes["chat_media_messages_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["chat_media_messages_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_media_messages"]
    ];
    chat_media_messages_by_pk?: [
      { id: number },
      ResolverInputTypes["chat_media_messages"]
    ];
    chat_update_history?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chat_update_history_select_column"]>
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
          | Array<ResolverInputTypes["chat_update_history_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["chat_update_history_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_update_history"]
    ];
    chat_update_history_by_pk?: [
      { id: number },
      ResolverInputTypes["chat_update_history"]
    ];
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
    nft_sticker_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["nft_sticker_metadata_select_column"]>
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
          | Array<ResolverInputTypes["nft_sticker_metadata_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["nft_sticker_metadata_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["nft_sticker_metadata"]
    ];
    nft_sticker_metadata_by_pk?: [
      { id: number },
      ResolverInputTypes["nft_sticker_metadata"]
    ];
    room_active_chat_mapping?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["room_active_chat_mapping_select_column"]>
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
          | Array<ResolverInputTypes["room_active_chat_mapping_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["room_active_chat_mapping_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["room_active_chat_mapping"]
    ];
    room_active_chat_mapping_by_pk?: [
      { room_id: string },
      ResolverInputTypes["room_active_chat_mapping"]
    ];
    secure_transfer_transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<
              ResolverInputTypes["secure_transfer_transactions_select_column"]
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
          | Array<ResolverInputTypes["secure_transfer_transactions_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["secure_transfer_transactions_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["secure_transfer_transactions"]
    ];
    secure_transfer_transactions_by_pk?: [
      { id: number },
      ResolverInputTypes["secure_transfer_transactions"]
    ];
    simple_transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["simple_transactions_select_column"]>
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
          | Array<ResolverInputTypes["simple_transactions_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["simple_transactions_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["simple_transactions"]
    ];
    simple_transactions_by_pk?: [
      { id: number },
      ResolverInputTypes["simple_transactions"]
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** columns and relationships of "room_active_chat_mapping" */
  ["room_active_chat_mapping"]: AliasType<{
    /** An object relationship */
    barter?: ResolverInputTypes["barters"];
    barter_id?: boolean | `@${string}`;
    room_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_aggregate_order_by"]: {
    avg?:
      | ResolverInputTypes["room_active_chat_mapping_avg_order_by"]
      | undefined
      | null;
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?:
      | ResolverInputTypes["room_active_chat_mapping_max_order_by"]
      | undefined
      | null;
    min?:
      | ResolverInputTypes["room_active_chat_mapping_min_order_by"]
      | undefined
      | null;
    stddev?:
      | ResolverInputTypes["room_active_chat_mapping_stddev_order_by"]
      | undefined
      | null;
    stddev_pop?:
      | ResolverInputTypes["room_active_chat_mapping_stddev_pop_order_by"]
      | undefined
      | null;
    stddev_samp?:
      | ResolverInputTypes["room_active_chat_mapping_stddev_samp_order_by"]
      | undefined
      | null;
    sum?:
      | ResolverInputTypes["room_active_chat_mapping_sum_order_by"]
      | undefined
      | null;
    var_pop?:
      | ResolverInputTypes["room_active_chat_mapping_var_pop_order_by"]
      | undefined
      | null;
    var_samp?:
      | ResolverInputTypes["room_active_chat_mapping_var_samp_order_by"]
      | undefined
      | null;
    variance?:
      | ResolverInputTypes["room_active_chat_mapping_variance_order_by"]
      | undefined
      | null;
  };
  /** input type for inserting array relation for remote table "room_active_chat_mapping" */
  ["room_active_chat_mapping_arr_rel_insert_input"]: {
    data: Array<ResolverInputTypes["room_active_chat_mapping_insert_input"]>;
    /** upsert condition */
    on_conflict?:
      | ResolverInputTypes["room_active_chat_mapping_on_conflict"]
      | undefined
      | null;
  };
  /** order by avg() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_avg_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Boolean expression to filter rows from the table "room_active_chat_mapping". All fields are combined with a logical 'AND'. */
  ["room_active_chat_mapping_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["room_active_chat_mapping_bool_exp"]>
      | undefined
      | null;
    _not?:
      | ResolverInputTypes["room_active_chat_mapping_bool_exp"]
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["room_active_chat_mapping_bool_exp"]>
      | undefined
      | null;
    barter?: ResolverInputTypes["barters_bool_exp"] | undefined | null;
    barter_id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    room_id?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "room_active_chat_mapping" */
  ["room_active_chat_mapping_constraint"]: room_active_chat_mapping_constraint;
  /** input type for incrementing numeric columns in table "room_active_chat_mapping" */
  ["room_active_chat_mapping_inc_input"]: {
    barter_id?: number | undefined | null;
  };
  /** input type for inserting data into table "room_active_chat_mapping" */
  ["room_active_chat_mapping_insert_input"]: {
    barter?:
      | ResolverInputTypes["barters_obj_rel_insert_input"]
      | undefined
      | null;
    barter_id?: number | undefined | null;
    room_id?: string | undefined | null;
  };
  /** order by max() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_max_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    room_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by min() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_min_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    room_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** response of any mutation on the table "room_active_chat_mapping" */
  ["room_active_chat_mapping_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["room_active_chat_mapping"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "room_active_chat_mapping" */
  ["room_active_chat_mapping_on_conflict"]: {
    constraint: ResolverInputTypes["room_active_chat_mapping_constraint"];
    update_columns: Array<
      ResolverInputTypes["room_active_chat_mapping_update_column"]
    >;
    where?:
      | ResolverInputTypes["room_active_chat_mapping_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "room_active_chat_mapping". */
  ["room_active_chat_mapping_order_by"]: {
    barter?: ResolverInputTypes["barters_order_by"] | undefined | null;
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
    room_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: room_active_chat_mapping */
  ["room_active_chat_mapping_pk_columns_input"]: {
    room_id: string;
  };
  /** select columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_select_column"]: room_active_chat_mapping_select_column;
  /** input type for updating data in table "room_active_chat_mapping" */
  ["room_active_chat_mapping_set_input"]: {
    barter_id?: number | undefined | null;
    room_id?: string | undefined | null;
  };
  /** order by stddev() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stddev_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_pop() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stddev_pop_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_samp() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stddev_samp_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Streaming cursor of the table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["room_active_chat_mapping_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["room_active_chat_mapping_stream_cursor_value_input"]: {
    barter_id?: number | undefined | null;
    room_id?: string | undefined | null;
  };
  /** order by sum() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_sum_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** update columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_update_column"]: room_active_chat_mapping_update_column;
  ["room_active_chat_mapping_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ResolverInputTypes["room_active_chat_mapping_inc_input"]
      | undefined
      | null;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ResolverInputTypes["room_active_chat_mapping_set_input"]
      | undefined
      | null;
    where: ResolverInputTypes["room_active_chat_mapping_bool_exp"];
  };
  /** order by var_pop() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_var_pop_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by var_samp() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_var_samp_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by variance() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_variance_order_by"]: {
    barter_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** columns and relationships of "secure_transfer_transactions" */
  ["secure_transfer_transactions"]: AliasType<{
    /** An object relationship */
    chat?: ResolverInputTypes["chats"];
    counter?: boolean | `@${string}`;
    current_state?: boolean | `@${string}`;
    escrow?: boolean | `@${string}`;
    final_txn_signature?: boolean | `@${string}`;
    from?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    message_client_generated_uuid?: boolean | `@${string}`;
    message_id?: boolean | `@${string}`;
    signature?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_aggregate_order_by"]: {
    avg?:
      | ResolverInputTypes["secure_transfer_transactions_avg_order_by"]
      | undefined
      | null;
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?:
      | ResolverInputTypes["secure_transfer_transactions_max_order_by"]
      | undefined
      | null;
    min?:
      | ResolverInputTypes["secure_transfer_transactions_min_order_by"]
      | undefined
      | null;
    stddev?:
      | ResolverInputTypes["secure_transfer_transactions_stddev_order_by"]
      | undefined
      | null;
    stddev_pop?:
      | ResolverInputTypes["secure_transfer_transactions_stddev_pop_order_by"]
      | undefined
      | null;
    stddev_samp?:
      | ResolverInputTypes["secure_transfer_transactions_stddev_samp_order_by"]
      | undefined
      | null;
    sum?:
      | ResolverInputTypes["secure_transfer_transactions_sum_order_by"]
      | undefined
      | null;
    var_pop?:
      | ResolverInputTypes["secure_transfer_transactions_var_pop_order_by"]
      | undefined
      | null;
    var_samp?:
      | ResolverInputTypes["secure_transfer_transactions_var_samp_order_by"]
      | undefined
      | null;
    variance?:
      | ResolverInputTypes["secure_transfer_transactions_variance_order_by"]
      | undefined
      | null;
  };
  /** input type for inserting array relation for remote table "secure_transfer_transactions" */
  ["secure_transfer_transactions_arr_rel_insert_input"]: {
    data: Array<
      ResolverInputTypes["secure_transfer_transactions_insert_input"]
    >;
    /** upsert condition */
    on_conflict?:
      | ResolverInputTypes["secure_transfer_transactions_on_conflict"]
      | undefined
      | null;
  };
  /** order by avg() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_avg_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Boolean expression to filter rows from the table "secure_transfer_transactions". All fields are combined with a logical 'AND'. */
  ["secure_transfer_transactions_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["secure_transfer_transactions_bool_exp"]>
      | undefined
      | null;
    _not?:
      | ResolverInputTypes["secure_transfer_transactions_bool_exp"]
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["secure_transfer_transactions_bool_exp"]>
      | undefined
      | null;
    chat?: ResolverInputTypes["chats_bool_exp"] | undefined | null;
    counter?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    current_state?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    escrow?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    final_txn_signature?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    from?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    message_client_generated_uuid?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    message_id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    signature?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    to?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "secure_transfer_transactions" */
  ["secure_transfer_transactions_constraint"]: secure_transfer_transactions_constraint;
  /** input type for incrementing numeric columns in table "secure_transfer_transactions" */
  ["secure_transfer_transactions_inc_input"]: {
    id?: number | undefined | null;
    message_id?: number | undefined | null;
  };
  /** input type for inserting data into table "secure_transfer_transactions" */
  ["secure_transfer_transactions_insert_input"]: {
    chat?: ResolverInputTypes["chats_obj_rel_insert_input"] | undefined | null;
    counter?: string | undefined | null;
    current_state?: string | undefined | null;
    escrow?: string | undefined | null;
    final_txn_signature?: string | undefined | null;
    from?: string | undefined | null;
    id?: number | undefined | null;
    message_client_generated_uuid?: string | undefined | null;
    message_id?: number | undefined | null;
    signature?: string | undefined | null;
    to?: string | undefined | null;
  };
  /** order by max() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_max_order_by"]: {
    counter?: ResolverInputTypes["order_by"] | undefined | null;
    current_state?: ResolverInputTypes["order_by"] | undefined | null;
    escrow?: ResolverInputTypes["order_by"] | undefined | null;
    final_txn_signature?: ResolverInputTypes["order_by"] | undefined | null;
    from?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
    message_id?: ResolverInputTypes["order_by"] | undefined | null;
    signature?: ResolverInputTypes["order_by"] | undefined | null;
    to?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by min() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_min_order_by"]: {
    counter?: ResolverInputTypes["order_by"] | undefined | null;
    current_state?: ResolverInputTypes["order_by"] | undefined | null;
    escrow?: ResolverInputTypes["order_by"] | undefined | null;
    final_txn_signature?: ResolverInputTypes["order_by"] | undefined | null;
    from?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
    message_id?: ResolverInputTypes["order_by"] | undefined | null;
    signature?: ResolverInputTypes["order_by"] | undefined | null;
    to?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** response of any mutation on the table "secure_transfer_transactions" */
  ["secure_transfer_transactions_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["secure_transfer_transactions"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "secure_transfer_transactions" */
  ["secure_transfer_transactions_on_conflict"]: {
    constraint: ResolverInputTypes["secure_transfer_transactions_constraint"];
    update_columns: Array<
      ResolverInputTypes["secure_transfer_transactions_update_column"]
    >;
    where?:
      | ResolverInputTypes["secure_transfer_transactions_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "secure_transfer_transactions". */
  ["secure_transfer_transactions_order_by"]: {
    chat?: ResolverInputTypes["chats_order_by"] | undefined | null;
    counter?: ResolverInputTypes["order_by"] | undefined | null;
    current_state?: ResolverInputTypes["order_by"] | undefined | null;
    escrow?: ResolverInputTypes["order_by"] | undefined | null;
    final_txn_signature?: ResolverInputTypes["order_by"] | undefined | null;
    from?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message_client_generated_uuid?:
      | ResolverInputTypes["order_by"]
      | undefined
      | null;
    message_id?: ResolverInputTypes["order_by"] | undefined | null;
    signature?: ResolverInputTypes["order_by"] | undefined | null;
    to?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: secure_transfer_transactions */
  ["secure_transfer_transactions_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_select_column"]: secure_transfer_transactions_select_column;
  /** input type for updating data in table "secure_transfer_transactions" */
  ["secure_transfer_transactions_set_input"]: {
    counter?: string | undefined | null;
    current_state?: string | undefined | null;
    escrow?: string | undefined | null;
    final_txn_signature?: string | undefined | null;
    from?: string | undefined | null;
    id?: number | undefined | null;
    message_client_generated_uuid?: string | undefined | null;
    message_id?: number | undefined | null;
    signature?: string | undefined | null;
    to?: string | undefined | null;
  };
  /** order by stddev() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stddev_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_pop() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stddev_pop_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_samp() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stddev_samp_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Streaming cursor of the table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["secure_transfer_transactions_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["secure_transfer_transactions_stream_cursor_value_input"]: {
    counter?: string | undefined | null;
    current_state?: string | undefined | null;
    escrow?: string | undefined | null;
    final_txn_signature?: string | undefined | null;
    from?: string | undefined | null;
    id?: number | undefined | null;
    message_client_generated_uuid?: string | undefined | null;
    message_id?: number | undefined | null;
    signature?: string | undefined | null;
    to?: string | undefined | null;
  };
  /** order by sum() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_sum_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** update columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_update_column"]: secure_transfer_transactions_update_column;
  ["secure_transfer_transactions_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ResolverInputTypes["secure_transfer_transactions_inc_input"]
      | undefined
      | null;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ResolverInputTypes["secure_transfer_transactions_set_input"]
      | undefined
      | null;
    where: ResolverInputTypes["secure_transfer_transactions_bool_exp"];
  };
  /** order by var_pop() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_var_pop_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by var_samp() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_var_samp_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by variance() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_variance_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** columns and relationships of "simple_transactions" */
  ["simple_transactions"]: AliasType<{
    client_generated_uuid?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    txn_signature?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "simple_transactions" */
  ["simple_transactions_aggregate_order_by"]: {
    avg?:
      | ResolverInputTypes["simple_transactions_avg_order_by"]
      | undefined
      | null;
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?:
      | ResolverInputTypes["simple_transactions_max_order_by"]
      | undefined
      | null;
    min?:
      | ResolverInputTypes["simple_transactions_min_order_by"]
      | undefined
      | null;
    stddev?:
      | ResolverInputTypes["simple_transactions_stddev_order_by"]
      | undefined
      | null;
    stddev_pop?:
      | ResolverInputTypes["simple_transactions_stddev_pop_order_by"]
      | undefined
      | null;
    stddev_samp?:
      | ResolverInputTypes["simple_transactions_stddev_samp_order_by"]
      | undefined
      | null;
    sum?:
      | ResolverInputTypes["simple_transactions_sum_order_by"]
      | undefined
      | null;
    var_pop?:
      | ResolverInputTypes["simple_transactions_var_pop_order_by"]
      | undefined
      | null;
    var_samp?:
      | ResolverInputTypes["simple_transactions_var_samp_order_by"]
      | undefined
      | null;
    variance?:
      | ResolverInputTypes["simple_transactions_variance_order_by"]
      | undefined
      | null;
  };
  /** input type for inserting array relation for remote table "simple_transactions" */
  ["simple_transactions_arr_rel_insert_input"]: {
    data: Array<ResolverInputTypes["simple_transactions_insert_input"]>;
    /** upsert condition */
    on_conflict?:
      | ResolverInputTypes["simple_transactions_on_conflict"]
      | undefined
      | null;
  };
  /** order by avg() on columns of table "simple_transactions" */
  ["simple_transactions_avg_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Boolean expression to filter rows from the table "simple_transactions". All fields are combined with a logical 'AND'. */
  ["simple_transactions_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["simple_transactions_bool_exp"]>
      | undefined
      | null;
    _not?:
      | ResolverInputTypes["simple_transactions_bool_exp"]
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["simple_transactions_bool_exp"]>
      | undefined
      | null;
    client_generated_uuid?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    txn_signature?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "simple_transactions" */
  ["simple_transactions_constraint"]: simple_transactions_constraint;
  /** input type for incrementing numeric columns in table "simple_transactions" */
  ["simple_transactions_inc_input"]: {
    id?: number | undefined | null;
  };
  /** input type for inserting data into table "simple_transactions" */
  ["simple_transactions_insert_input"]: {
    client_generated_uuid?: string | undefined | null;
    id?: number | undefined | null;
    txn_signature?: string | undefined | null;
  };
  /** order by max() on columns of table "simple_transactions" */
  ["simple_transactions_max_order_by"]: {
    client_generated_uuid?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    txn_signature?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by min() on columns of table "simple_transactions" */
  ["simple_transactions_min_order_by"]: {
    client_generated_uuid?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    txn_signature?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** response of any mutation on the table "simple_transactions" */
  ["simple_transactions_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["simple_transactions"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "simple_transactions" */
  ["simple_transactions_on_conflict"]: {
    constraint: ResolverInputTypes["simple_transactions_constraint"];
    update_columns: Array<
      ResolverInputTypes["simple_transactions_update_column"]
    >;
    where?:
      | ResolverInputTypes["simple_transactions_bool_exp"]
      | undefined
      | null;
  };
  /** Ordering options when selecting data from "simple_transactions". */
  ["simple_transactions_order_by"]: {
    client_generated_uuid?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    txn_signature?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: simple_transactions */
  ["simple_transactions_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "simple_transactions" */
  ["simple_transactions_select_column"]: simple_transactions_select_column;
  /** input type for updating data in table "simple_transactions" */
  ["simple_transactions_set_input"]: {
    client_generated_uuid?: string | undefined | null;
    id?: number | undefined | null;
    txn_signature?: string | undefined | null;
  };
  /** order by stddev() on columns of table "simple_transactions" */
  ["simple_transactions_stddev_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_pop() on columns of table "simple_transactions" */
  ["simple_transactions_stddev_pop_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by stddev_samp() on columns of table "simple_transactions" */
  ["simple_transactions_stddev_samp_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Streaming cursor of the table "simple_transactions" */
  ["simple_transactions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["simple_transactions_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["simple_transactions_stream_cursor_value_input"]: {
    client_generated_uuid?: string | undefined | null;
    id?: number | undefined | null;
    txn_signature?: string | undefined | null;
  };
  /** order by sum() on columns of table "simple_transactions" */
  ["simple_transactions_sum_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** update columns of table "simple_transactions" */
  ["simple_transactions_update_column"]: simple_transactions_update_column;
  ["simple_transactions_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ResolverInputTypes["simple_transactions_inc_input"]
      | undefined
      | null;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ResolverInputTypes["simple_transactions_set_input"]
      | undefined
      | null;
    where: ResolverInputTypes["simple_transactions_bool_exp"];
  };
  /** order by var_pop() on columns of table "simple_transactions" */
  ["simple_transactions_var_pop_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by var_samp() on columns of table "simple_transactions" */
  ["simple_transactions_var_samp_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** order by variance() on columns of table "simple_transactions" */
  ["simple_transactions_variance_order_by"]: {
    id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  ["subscription_root"]: AliasType<{
    barter_poke_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["barter_poke_metadata_select_column"]>
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
          | Array<ResolverInputTypes["barter_poke_metadata_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["barter_poke_metadata_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["barter_poke_metadata"]
    ];
    barter_poke_metadata_by_pk?: [
      { id: number },
      ResolverInputTypes["barter_poke_metadata"]
    ];
    barter_poke_metadata_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["barter_poke_metadata_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["barter_poke_metadata_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["barter_poke_metadata"]
    ];
    barters?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["barters_select_column"]>
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
          | Array<ResolverInputTypes["barters_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["barters_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["barters"]
    ];
    barters_by_pk?: [{ id: number }, ResolverInputTypes["barters"]];
    barters_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["barters_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["barters_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["barters"]
    ];
    chat_barter_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chat_barter_metadata_select_column"]>
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
          | Array<ResolverInputTypes["chat_barter_metadata_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["chat_barter_metadata_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_barter_metadata"]
    ];
    chat_barter_metadata_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["chat_barter_metadata_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["chat_barter_metadata_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_barter_metadata"]
    ];
    chat_media_messages?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chat_media_messages_select_column"]>
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
          | Array<ResolverInputTypes["chat_media_messages_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["chat_media_messages_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_media_messages"]
    ];
    chat_media_messages_by_pk?: [
      { id: number },
      ResolverInputTypes["chat_media_messages"]
    ];
    chat_media_messages_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["chat_media_messages_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["chat_media_messages_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_media_messages"]
    ];
    chat_update_history?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chat_update_history_select_column"]>
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
          | Array<ResolverInputTypes["chat_update_history_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["chat_update_history_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_update_history"]
    ];
    chat_update_history_by_pk?: [
      { id: number },
      ResolverInputTypes["chat_update_history"]
    ];
    chat_update_history_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["chat_update_history_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["chat_update_history_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["chat_update_history"]
    ];
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
    nft_sticker_metadata?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["nft_sticker_metadata_select_column"]>
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
          | Array<ResolverInputTypes["nft_sticker_metadata_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["nft_sticker_metadata_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["nft_sticker_metadata"]
    ];
    nft_sticker_metadata_by_pk?: [
      { id: number },
      ResolverInputTypes["nft_sticker_metadata"]
    ];
    nft_sticker_metadata_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["nft_sticker_metadata_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["nft_sticker_metadata_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["nft_sticker_metadata"]
    ];
    room_active_chat_mapping?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["room_active_chat_mapping_select_column"]>
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
          | Array<ResolverInputTypes["room_active_chat_mapping_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["room_active_chat_mapping_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["room_active_chat_mapping"]
    ];
    room_active_chat_mapping_by_pk?: [
      { room_id: string },
      ResolverInputTypes["room_active_chat_mapping"]
    ];
    room_active_chat_mapping_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["room_active_chat_mapping_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["room_active_chat_mapping_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["room_active_chat_mapping"]
    ];
    secure_transfer_transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<
              ResolverInputTypes["secure_transfer_transactions_select_column"]
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
          | Array<ResolverInputTypes["secure_transfer_transactions_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["secure_transfer_transactions_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["secure_transfer_transactions"]
    ];
    secure_transfer_transactions_by_pk?: [
      { id: number },
      ResolverInputTypes["secure_transfer_transactions"]
    ];
    secure_transfer_transactions_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["secure_transfer_transactions_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["secure_transfer_transactions_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["secure_transfer_transactions"]
    ];
    simple_transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["simple_transactions_select_column"]>
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
          | Array<ResolverInputTypes["simple_transactions_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["simple_transactions_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["simple_transactions"]
    ];
    simple_transactions_by_pk?: [
      { id: number },
      ResolverInputTypes["simple_transactions"]
    ];
    simple_transactions_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["simple_transactions_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["simple_transactions_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["simple_transactions"]
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
  /** columns and relationships of "barter_poke_metadata" */
  ["barter_poke_metadata"]: {
    barter_id: number;
    /** An object relationship */
    chat: ModelTypes["chats"];
    id: number;
    message_client_generated_uuid: string;
  };
  /** order by aggregate values of table "barter_poke_metadata" */
  ["barter_poke_metadata_aggregate_order_by"]: {
    avg?: ModelTypes["barter_poke_metadata_avg_order_by"] | undefined;
    count?: ModelTypes["order_by"] | undefined;
    max?: ModelTypes["barter_poke_metadata_max_order_by"] | undefined;
    min?: ModelTypes["barter_poke_metadata_min_order_by"] | undefined;
    stddev?: ModelTypes["barter_poke_metadata_stddev_order_by"] | undefined;
    stddev_pop?:
      | ModelTypes["barter_poke_metadata_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | ModelTypes["barter_poke_metadata_stddev_samp_order_by"]
      | undefined;
    sum?: ModelTypes["barter_poke_metadata_sum_order_by"] | undefined;
    var_pop?: ModelTypes["barter_poke_metadata_var_pop_order_by"] | undefined;
    var_samp?: ModelTypes["barter_poke_metadata_var_samp_order_by"] | undefined;
    variance?: ModelTypes["barter_poke_metadata_variance_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "barter_poke_metadata" */
  ["barter_poke_metadata_arr_rel_insert_input"]: {
    data: Array<ModelTypes["barter_poke_metadata_insert_input"]>;
    /** upsert condition */
    on_conflict?: ModelTypes["barter_poke_metadata_on_conflict"] | undefined;
  };
  /** order by avg() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_avg_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "barter_poke_metadata". All fields are combined with a logical 'AND'. */
  ["barter_poke_metadata_bool_exp"]: {
    _and?: Array<ModelTypes["barter_poke_metadata_bool_exp"]> | undefined;
    _not?: ModelTypes["barter_poke_metadata_bool_exp"] | undefined;
    _or?: Array<ModelTypes["barter_poke_metadata_bool_exp"]> | undefined;
    barter_id?: ModelTypes["Int_comparison_exp"] | undefined;
    chat?: ModelTypes["chats_bool_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    message_client_generated_uuid?:
      | ModelTypes["String_comparison_exp"]
      | undefined;
  };
  ["barter_poke_metadata_constraint"]: barter_poke_metadata_constraint;
  /** input type for incrementing numeric columns in table "barter_poke_metadata" */
  ["barter_poke_metadata_inc_input"]: {
    barter_id?: number | undefined;
    id?: number | undefined;
  };
  /** input type for inserting data into table "barter_poke_metadata" */
  ["barter_poke_metadata_insert_input"]: {
    barter_id?: number | undefined;
    chat?: ModelTypes["chats_obj_rel_insert_input"] | undefined;
    id?: number | undefined;
    message_client_generated_uuid?: string | undefined;
  };
  /** order by max() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_max_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    message_client_generated_uuid?: ModelTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_min_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    message_client_generated_uuid?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "barter_poke_metadata" */
  ["barter_poke_metadata_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["barter_poke_metadata"]>;
  };
  /** on_conflict condition type for table "barter_poke_metadata" */
  ["barter_poke_metadata_on_conflict"]: {
    constraint: ModelTypes["barter_poke_metadata_constraint"];
    update_columns: Array<ModelTypes["barter_poke_metadata_update_column"]>;
    where?: ModelTypes["barter_poke_metadata_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "barter_poke_metadata". */
  ["barter_poke_metadata_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
    chat?: ModelTypes["chats_order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    message_client_generated_uuid?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: barter_poke_metadata */
  ["barter_poke_metadata_pk_columns_input"]: {
    id: number;
  };
  ["barter_poke_metadata_select_column"]: barter_poke_metadata_select_column;
  /** input type for updating data in table "barter_poke_metadata" */
  ["barter_poke_metadata_set_input"]: {
    barter_id?: number | undefined;
    id?: number | undefined;
    message_client_generated_uuid?: string | undefined;
  };
  /** order by stddev() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_stddev_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_stddev_pop_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_stddev_samp_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "barter_poke_metadata" */
  ["barter_poke_metadata_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["barter_poke_metadata_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["barter_poke_metadata_stream_cursor_value_input"]: {
    barter_id?: number | undefined;
    id?: number | undefined;
    message_client_generated_uuid?: string | undefined;
  };
  /** order by sum() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_sum_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
  };
  ["barter_poke_metadata_update_column"]: barter_poke_metadata_update_column;
  ["barter_poke_metadata_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["barter_poke_metadata_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["barter_poke_metadata_set_input"] | undefined;
    where: ModelTypes["barter_poke_metadata_bool_exp"];
  };
  /** order by var_pop() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_var_pop_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_var_samp_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_variance_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
  };
  /** columns and relationships of "barters" */
  ["barters"]: {
    /** An array relationship */
    chat_barter_metadata: Array<ModelTypes["chat_barter_metadata"]>;
    id: number;
    on_chain_state?: string | undefined;
    /** An array relationship */
    room_active_chat_mappings: Array<ModelTypes["room_active_chat_mapping"]>;
    room_id?: string | undefined;
    state: string;
    user1_offers: string;
    user2_offers: string;
  };
  /** Boolean expression to filter rows from the table "barters". All fields are combined with a logical 'AND'. */
  ["barters_bool_exp"]: {
    _and?: Array<ModelTypes["barters_bool_exp"]> | undefined;
    _not?: ModelTypes["barters_bool_exp"] | undefined;
    _or?: Array<ModelTypes["barters_bool_exp"]> | undefined;
    chat_barter_metadata?:
      | ModelTypes["chat_barter_metadata_bool_exp"]
      | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    on_chain_state?: ModelTypes["String_comparison_exp"] | undefined;
    room_active_chat_mappings?:
      | ModelTypes["room_active_chat_mapping_bool_exp"]
      | undefined;
    room_id?: ModelTypes["String_comparison_exp"] | undefined;
    state?: ModelTypes["String_comparison_exp"] | undefined;
    user1_offers?: ModelTypes["String_comparison_exp"] | undefined;
    user2_offers?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["barters_constraint"]: barters_constraint;
  /** input type for incrementing numeric columns in table "barters" */
  ["barters_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "barters" */
  ["barters_insert_input"]: {
    chat_barter_metadata?:
      | ModelTypes["chat_barter_metadata_arr_rel_insert_input"]
      | undefined;
    id?: number | undefined;
    on_chain_state?: string | undefined;
    room_active_chat_mappings?:
      | ModelTypes["room_active_chat_mapping_arr_rel_insert_input"]
      | undefined;
    room_id?: string | undefined;
    state?: string | undefined;
    user1_offers?: string | undefined;
    user2_offers?: string | undefined;
  };
  /** response of any mutation on the table "barters" */
  ["barters_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["barters"]>;
  };
  /** input type for inserting object relation for remote table "barters" */
  ["barters_obj_rel_insert_input"]: {
    data: ModelTypes["barters_insert_input"];
    /** upsert condition */
    on_conflict?: ModelTypes["barters_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "barters" */
  ["barters_on_conflict"]: {
    constraint: ModelTypes["barters_constraint"];
    update_columns: Array<ModelTypes["barters_update_column"]>;
    where?: ModelTypes["barters_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "barters". */
  ["barters_order_by"]: {
    chat_barter_metadata_aggregate?:
      | ModelTypes["chat_barter_metadata_aggregate_order_by"]
      | undefined;
    id?: ModelTypes["order_by"] | undefined;
    on_chain_state?: ModelTypes["order_by"] | undefined;
    room_active_chat_mappings_aggregate?:
      | ModelTypes["room_active_chat_mapping_aggregate_order_by"]
      | undefined;
    room_id?: ModelTypes["order_by"] | undefined;
    state?: ModelTypes["order_by"] | undefined;
    user1_offers?: ModelTypes["order_by"] | undefined;
    user2_offers?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: barters */
  ["barters_pk_columns_input"]: {
    id: number;
  };
  ["barters_select_column"]: barters_select_column;
  /** input type for updating data in table "barters" */
  ["barters_set_input"]: {
    id?: number | undefined;
    on_chain_state?: string | undefined;
    room_id?: string | undefined;
    state?: string | undefined;
    user1_offers?: string | undefined;
    user2_offers?: string | undefined;
  };
  /** Streaming cursor of the table "barters" */
  ["barters_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["barters_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["barters_stream_cursor_value_input"]: {
    id?: number | undefined;
    on_chain_state?: string | undefined;
    room_id?: string | undefined;
    state?: string | undefined;
    user1_offers?: string | undefined;
    user2_offers?: string | undefined;
  };
  ["barters_update_column"]: barters_update_column;
  ["barters_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["barters_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["barters_set_input"] | undefined;
    where: ModelTypes["barters_bool_exp"];
  };
  /** columns and relationships of "chat_barter_metadata" */
  ["chat_barter_metadata"]: {
    /** An object relationship */
    barter: ModelTypes["barters"];
    barter_id: number;
    /** An object relationship */
    chat: ModelTypes["chats"];
    chat_client_generated_uuid: string;
  };
  /** order by aggregate values of table "chat_barter_metadata" */
  ["chat_barter_metadata_aggregate_order_by"]: {
    avg?: ModelTypes["chat_barter_metadata_avg_order_by"] | undefined;
    count?: ModelTypes["order_by"] | undefined;
    max?: ModelTypes["chat_barter_metadata_max_order_by"] | undefined;
    min?: ModelTypes["chat_barter_metadata_min_order_by"] | undefined;
    stddev?: ModelTypes["chat_barter_metadata_stddev_order_by"] | undefined;
    stddev_pop?:
      | ModelTypes["chat_barter_metadata_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | ModelTypes["chat_barter_metadata_stddev_samp_order_by"]
      | undefined;
    sum?: ModelTypes["chat_barter_metadata_sum_order_by"] | undefined;
    var_pop?: ModelTypes["chat_barter_metadata_var_pop_order_by"] | undefined;
    var_samp?: ModelTypes["chat_barter_metadata_var_samp_order_by"] | undefined;
    variance?: ModelTypes["chat_barter_metadata_variance_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "chat_barter_metadata" */
  ["chat_barter_metadata_arr_rel_insert_input"]: {
    data: Array<ModelTypes["chat_barter_metadata_insert_input"]>;
    /** upsert condition */
    on_conflict?: ModelTypes["chat_barter_metadata_on_conflict"] | undefined;
  };
  /** order by avg() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_avg_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "chat_barter_metadata". All fields are combined with a logical 'AND'. */
  ["chat_barter_metadata_bool_exp"]: {
    _and?: Array<ModelTypes["chat_barter_metadata_bool_exp"]> | undefined;
    _not?: ModelTypes["chat_barter_metadata_bool_exp"] | undefined;
    _or?: Array<ModelTypes["chat_barter_metadata_bool_exp"]> | undefined;
    barter?: ModelTypes["barters_bool_exp"] | undefined;
    barter_id?: ModelTypes["Int_comparison_exp"] | undefined;
    chat?: ModelTypes["chats_bool_exp"] | undefined;
    chat_client_generated_uuid?:
      | ModelTypes["String_comparison_exp"]
      | undefined;
  };
  ["chat_barter_metadata_constraint"]: chat_barter_metadata_constraint;
  /** input type for inserting data into table "chat_barter_metadata" */
  ["chat_barter_metadata_insert_input"]: {
    barter?: ModelTypes["barters_obj_rel_insert_input"] | undefined;
    barter_id?: number | undefined;
    chat?: ModelTypes["chats_obj_rel_insert_input"] | undefined;
    chat_client_generated_uuid?: string | undefined;
  };
  /** order by max() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_max_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
    chat_client_generated_uuid?: ModelTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_min_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
    chat_client_generated_uuid?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "chat_barter_metadata" */
  ["chat_barter_metadata_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["chat_barter_metadata"]>;
  };
  /** on_conflict condition type for table "chat_barter_metadata" */
  ["chat_barter_metadata_on_conflict"]: {
    constraint: ModelTypes["chat_barter_metadata_constraint"];
    update_columns: Array<ModelTypes["chat_barter_metadata_update_column"]>;
    where?: ModelTypes["chat_barter_metadata_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "chat_barter_metadata". */
  ["chat_barter_metadata_order_by"]: {
    barter?: ModelTypes["barters_order_by"] | undefined;
    barter_id?: ModelTypes["order_by"] | undefined;
    chat?: ModelTypes["chats_order_by"] | undefined;
    chat_client_generated_uuid?: ModelTypes["order_by"] | undefined;
  };
  ["chat_barter_metadata_select_column"]: chat_barter_metadata_select_column;
  /** order by stddev() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_stddev_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_stddev_pop_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_stddev_samp_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "chat_barter_metadata" */
  ["chat_barter_metadata_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["chat_barter_metadata_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_barter_metadata_stream_cursor_value_input"]: {
    barter_id?: number | undefined;
    chat_client_generated_uuid?: string | undefined;
  };
  /** order by sum() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_sum_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  ["chat_barter_metadata_update_column"]: chat_barter_metadata_update_column;
  ["chat_barter_metadata_updates"]: {
    where: ModelTypes["chat_barter_metadata_bool_exp"];
  };
  /** order by var_pop() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_var_pop_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_var_samp_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_variance_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  /** columns and relationships of "chat_media_messages" */
  ["chat_media_messages"]: {
    /** An object relationship */
    chat: ModelTypes["chats"];
    id: number;
    media_kind: string;
    media_link: string;
    message_client_generated_uuid: string;
  };
  /** order by aggregate values of table "chat_media_messages" */
  ["chat_media_messages_aggregate_order_by"]: {
    avg?: ModelTypes["chat_media_messages_avg_order_by"] | undefined;
    count?: ModelTypes["order_by"] | undefined;
    max?: ModelTypes["chat_media_messages_max_order_by"] | undefined;
    min?: ModelTypes["chat_media_messages_min_order_by"] | undefined;
    stddev?: ModelTypes["chat_media_messages_stddev_order_by"] | undefined;
    stddev_pop?:
      | ModelTypes["chat_media_messages_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | ModelTypes["chat_media_messages_stddev_samp_order_by"]
      | undefined;
    sum?: ModelTypes["chat_media_messages_sum_order_by"] | undefined;
    var_pop?: ModelTypes["chat_media_messages_var_pop_order_by"] | undefined;
    var_samp?: ModelTypes["chat_media_messages_var_samp_order_by"] | undefined;
    variance?: ModelTypes["chat_media_messages_variance_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "chat_media_messages" */
  ["chat_media_messages_arr_rel_insert_input"]: {
    data: Array<ModelTypes["chat_media_messages_insert_input"]>;
    /** upsert condition */
    on_conflict?: ModelTypes["chat_media_messages_on_conflict"] | undefined;
  };
  /** order by avg() on columns of table "chat_media_messages" */
  ["chat_media_messages_avg_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "chat_media_messages". All fields are combined with a logical 'AND'. */
  ["chat_media_messages_bool_exp"]: {
    _and?: Array<ModelTypes["chat_media_messages_bool_exp"]> | undefined;
    _not?: ModelTypes["chat_media_messages_bool_exp"] | undefined;
    _or?: Array<ModelTypes["chat_media_messages_bool_exp"]> | undefined;
    chat?: ModelTypes["chats_bool_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    media_kind?: ModelTypes["String_comparison_exp"] | undefined;
    media_link?: ModelTypes["String_comparison_exp"] | undefined;
    message_client_generated_uuid?:
      | ModelTypes["String_comparison_exp"]
      | undefined;
  };
  ["chat_media_messages_constraint"]: chat_media_messages_constraint;
  /** input type for incrementing numeric columns in table "chat_media_messages" */
  ["chat_media_messages_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "chat_media_messages" */
  ["chat_media_messages_insert_input"]: {
    chat?: ModelTypes["chats_obj_rel_insert_input"] | undefined;
    id?: number | undefined;
    media_kind?: string | undefined;
    media_link?: string | undefined;
    message_client_generated_uuid?: string | undefined;
  };
  /** order by max() on columns of table "chat_media_messages" */
  ["chat_media_messages_max_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
    media_kind?: ModelTypes["order_by"] | undefined;
    media_link?: ModelTypes["order_by"] | undefined;
    message_client_generated_uuid?: ModelTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "chat_media_messages" */
  ["chat_media_messages_min_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
    media_kind?: ModelTypes["order_by"] | undefined;
    media_link?: ModelTypes["order_by"] | undefined;
    message_client_generated_uuid?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "chat_media_messages" */
  ["chat_media_messages_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["chat_media_messages"]>;
  };
  /** on_conflict condition type for table "chat_media_messages" */
  ["chat_media_messages_on_conflict"]: {
    constraint: ModelTypes["chat_media_messages_constraint"];
    update_columns: Array<ModelTypes["chat_media_messages_update_column"]>;
    where?: ModelTypes["chat_media_messages_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "chat_media_messages". */
  ["chat_media_messages_order_by"]: {
    chat?: ModelTypes["chats_order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    media_kind?: ModelTypes["order_by"] | undefined;
    media_link?: ModelTypes["order_by"] | undefined;
    message_client_generated_uuid?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: chat_media_messages */
  ["chat_media_messages_pk_columns_input"]: {
    id: number;
  };
  ["chat_media_messages_select_column"]: chat_media_messages_select_column;
  /** input type for updating data in table "chat_media_messages" */
  ["chat_media_messages_set_input"]: {
    id?: number | undefined;
    media_kind?: string | undefined;
    media_link?: string | undefined;
    message_client_generated_uuid?: string | undefined;
  };
  /** order by stddev() on columns of table "chat_media_messages" */
  ["chat_media_messages_stddev_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "chat_media_messages" */
  ["chat_media_messages_stddev_pop_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "chat_media_messages" */
  ["chat_media_messages_stddev_samp_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "chat_media_messages" */
  ["chat_media_messages_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["chat_media_messages_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_media_messages_stream_cursor_value_input"]: {
    id?: number | undefined;
    media_kind?: string | undefined;
    media_link?: string | undefined;
    message_client_generated_uuid?: string | undefined;
  };
  /** order by sum() on columns of table "chat_media_messages" */
  ["chat_media_messages_sum_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  ["chat_media_messages_update_column"]: chat_media_messages_update_column;
  ["chat_media_messages_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["chat_media_messages_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["chat_media_messages_set_input"] | undefined;
    where: ModelTypes["chat_media_messages_bool_exp"];
  };
  /** order by var_pop() on columns of table "chat_media_messages" */
  ["chat_media_messages_var_pop_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "chat_media_messages" */
  ["chat_media_messages_var_samp_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "chat_media_messages" */
  ["chat_media_messages_variance_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** columns and relationships of "chat_update_history" */
  ["chat_update_history"]: {
    client_generated_uuid: string;
    created_at: ModelTypes["timestamptz"];
    id: number;
    room: string;
    type: string;
  };
  /** Boolean expression to filter rows from the table "chat_update_history". All fields are combined with a logical 'AND'. */
  ["chat_update_history_bool_exp"]: {
    _and?: Array<ModelTypes["chat_update_history_bool_exp"]> | undefined;
    _not?: ModelTypes["chat_update_history_bool_exp"] | undefined;
    _or?: Array<ModelTypes["chat_update_history_bool_exp"]> | undefined;
    client_generated_uuid?: ModelTypes["String_comparison_exp"] | undefined;
    created_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    room?: ModelTypes["String_comparison_exp"] | undefined;
    type?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["chat_update_history_constraint"]: chat_update_history_constraint;
  /** input type for inserting data into table "chat_update_history" */
  ["chat_update_history_insert_input"]: {
    client_generated_uuid?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: number | undefined;
    room?: string | undefined;
    type?: string | undefined;
  };
  /** response of any mutation on the table "chat_update_history" */
  ["chat_update_history_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["chat_update_history"]>;
  };
  /** on_conflict condition type for table "chat_update_history" */
  ["chat_update_history_on_conflict"]: {
    constraint: ModelTypes["chat_update_history_constraint"];
    update_columns: Array<ModelTypes["chat_update_history_update_column"]>;
    where?: ModelTypes["chat_update_history_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "chat_update_history". */
  ["chat_update_history_order_by"]: {
    client_generated_uuid?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    room?: ModelTypes["order_by"] | undefined;
    type?: ModelTypes["order_by"] | undefined;
  };
  ["chat_update_history_select_column"]: chat_update_history_select_column;
  /** Streaming cursor of the table "chat_update_history" */
  ["chat_update_history_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["chat_update_history_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_update_history_stream_cursor_value_input"]: {
    client_generated_uuid?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: number | undefined;
    room?: string | undefined;
    type?: string | undefined;
  };
  ["chat_update_history_update_column"]: chat_update_history_update_column;
  /** columns and relationships of "chats" */
  ["chats"]: {
    /** An array relationship */
    barter_poke_metadata: Array<ModelTypes["barter_poke_metadata"]>;
    /** An array relationship */
    chat_barter_metadata: Array<ModelTypes["chat_barter_metadata"]>;
    /** An array relationship */
    chat_media_messages: Array<ModelTypes["chat_media_messages"]>;
    client_generated_uuid: string;
    created_at?: ModelTypes["timestamptz"] | undefined;
    deleted?: boolean | undefined;
    id: number;
    message: string;
    message_kind?: string | undefined;
    /** An array relationship */
    nft_sticker_metadata: Array<ModelTypes["nft_sticker_metadata"]>;
    parent_client_generated_uuid?: string | undefined;
    room?: string | undefined;
    /** An array relationship */
    secure_transfer_transactions: Array<
      ModelTypes["secure_transfer_transactions"]
    >;
    /** An array relationship */
    simple_transactions: Array<ModelTypes["simple_transactions"]>;
    type: string;
    username?: string | undefined;
    uuid?: string | undefined;
  };
  /** Boolean expression to filter rows from the table "chats". All fields are combined with a logical 'AND'. */
  ["chats_bool_exp"]: {
    _and?: Array<ModelTypes["chats_bool_exp"]> | undefined;
    _not?: ModelTypes["chats_bool_exp"] | undefined;
    _or?: Array<ModelTypes["chats_bool_exp"]> | undefined;
    barter_poke_metadata?:
      | ModelTypes["barter_poke_metadata_bool_exp"]
      | undefined;
    chat_barter_metadata?:
      | ModelTypes["chat_barter_metadata_bool_exp"]
      | undefined;
    chat_media_messages?:
      | ModelTypes["chat_media_messages_bool_exp"]
      | undefined;
    client_generated_uuid?: ModelTypes["String_comparison_exp"] | undefined;
    created_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    deleted?: ModelTypes["Boolean_comparison_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    message?: ModelTypes["String_comparison_exp"] | undefined;
    message_kind?: ModelTypes["String_comparison_exp"] | undefined;
    nft_sticker_metadata?:
      | ModelTypes["nft_sticker_metadata_bool_exp"]
      | undefined;
    parent_client_generated_uuid?:
      | ModelTypes["String_comparison_exp"]
      | undefined;
    room?: ModelTypes["String_comparison_exp"] | undefined;
    secure_transfer_transactions?:
      | ModelTypes["secure_transfer_transactions_bool_exp"]
      | undefined;
    simple_transactions?:
      | ModelTypes["simple_transactions_bool_exp"]
      | undefined;
    type?: ModelTypes["String_comparison_exp"] | undefined;
    username?: ModelTypes["String_comparison_exp"] | undefined;
    uuid?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["chats_constraint"]: chats_constraint;
  /** input type for inserting data into table "chats" */
  ["chats_insert_input"]: {
    barter_poke_metadata?:
      | ModelTypes["barter_poke_metadata_arr_rel_insert_input"]
      | undefined;
    chat_barter_metadata?:
      | ModelTypes["chat_barter_metadata_arr_rel_insert_input"]
      | undefined;
    chat_media_messages?:
      | ModelTypes["chat_media_messages_arr_rel_insert_input"]
      | undefined;
    client_generated_uuid?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    deleted?: boolean | undefined;
    id?: number | undefined;
    message?: string | undefined;
    message_kind?: string | undefined;
    nft_sticker_metadata?:
      | ModelTypes["nft_sticker_metadata_arr_rel_insert_input"]
      | undefined;
    parent_client_generated_uuid?: string | undefined;
    room?: string | undefined;
    secure_transfer_transactions?:
      | ModelTypes["secure_transfer_transactions_arr_rel_insert_input"]
      | undefined;
    simple_transactions?:
      | ModelTypes["simple_transactions_arr_rel_insert_input"]
      | undefined;
    type?: string | undefined;
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
  /** input type for inserting object relation for remote table "chats" */
  ["chats_obj_rel_insert_input"]: {
    data: ModelTypes["chats_insert_input"];
    /** upsert condition */
    on_conflict?: ModelTypes["chats_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "chats" */
  ["chats_on_conflict"]: {
    constraint: ModelTypes["chats_constraint"];
    update_columns: Array<ModelTypes["chats_update_column"]>;
    where?: ModelTypes["chats_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "chats". */
  ["chats_order_by"]: {
    barter_poke_metadata_aggregate?:
      | ModelTypes["barter_poke_metadata_aggregate_order_by"]
      | undefined;
    chat_barter_metadata_aggregate?:
      | ModelTypes["chat_barter_metadata_aggregate_order_by"]
      | undefined;
    chat_media_messages_aggregate?:
      | ModelTypes["chat_media_messages_aggregate_order_by"]
      | undefined;
    client_generated_uuid?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    deleted?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    message?: ModelTypes["order_by"] | undefined;
    message_kind?: ModelTypes["order_by"] | undefined;
    nft_sticker_metadata_aggregate?:
      | ModelTypes["nft_sticker_metadata_aggregate_order_by"]
      | undefined;
    parent_client_generated_uuid?: ModelTypes["order_by"] | undefined;
    room?: ModelTypes["order_by"] | undefined;
    secure_transfer_transactions_aggregate?:
      | ModelTypes["secure_transfer_transactions_aggregate_order_by"]
      | undefined;
    simple_transactions_aggregate?:
      | ModelTypes["simple_transactions_aggregate_order_by"]
      | undefined;
    type?: ModelTypes["order_by"] | undefined;
    username?: ModelTypes["order_by"] | undefined;
    uuid?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: chats */
  ["chats_pk_columns_input"]: {
    id: number;
  };
  ["chats_select_column"]: chats_select_column;
  /** input type for updating data in table "chats" */
  ["chats_set_input"]: {
    deleted?: boolean | undefined;
  };
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
    deleted?: boolean | undefined;
    id?: number | undefined;
    message?: string | undefined;
    message_kind?: string | undefined;
    parent_client_generated_uuid?: string | undefined;
    room?: string | undefined;
    type?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
  };
  ["chats_update_column"]: chats_update_column;
  ["chats_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["chats_set_input"] | undefined;
    where: ModelTypes["chats_bool_exp"];
  };
  ["cursor_ordering"]: cursor_ordering;
  /** mutation root */
  ["mutation_root"]: {
    /** delete data from the table: "room_active_chat_mapping" */
    delete_room_active_chat_mapping?:
      | ModelTypes["room_active_chat_mapping_mutation_response"]
      | undefined;
    /** delete single row from the table: "room_active_chat_mapping" */
    delete_room_active_chat_mapping_by_pk?:
      | ModelTypes["room_active_chat_mapping"]
      | undefined;
    /** insert data into the table: "barter_poke_metadata" */
    insert_barter_poke_metadata?:
      | ModelTypes["barter_poke_metadata_mutation_response"]
      | undefined;
    /** insert a single row into the table: "barter_poke_metadata" */
    insert_barter_poke_metadata_one?:
      | ModelTypes["barter_poke_metadata"]
      | undefined;
    /** insert data into the table: "barters" */
    insert_barters?: ModelTypes["barters_mutation_response"] | undefined;
    /** insert a single row into the table: "barters" */
    insert_barters_one?: ModelTypes["barters"] | undefined;
    /** insert data into the table: "chat_barter_metadata" */
    insert_chat_barter_metadata?:
      | ModelTypes["chat_barter_metadata_mutation_response"]
      | undefined;
    /** insert a single row into the table: "chat_barter_metadata" */
    insert_chat_barter_metadata_one?:
      | ModelTypes["chat_barter_metadata"]
      | undefined;
    /** insert data into the table: "chat_media_messages" */
    insert_chat_media_messages?:
      | ModelTypes["chat_media_messages_mutation_response"]
      | undefined;
    /** insert a single row into the table: "chat_media_messages" */
    insert_chat_media_messages_one?:
      | ModelTypes["chat_media_messages"]
      | undefined;
    /** insert data into the table: "chat_update_history" */
    insert_chat_update_history?:
      | ModelTypes["chat_update_history_mutation_response"]
      | undefined;
    /** insert a single row into the table: "chat_update_history" */
    insert_chat_update_history_one?:
      | ModelTypes["chat_update_history"]
      | undefined;
    /** insert data into the table: "chats" */
    insert_chats?: ModelTypes["chats_mutation_response"] | undefined;
    /** insert a single row into the table: "chats" */
    insert_chats_one?: ModelTypes["chats"] | undefined;
    /** insert data into the table: "nft_sticker_metadata" */
    insert_nft_sticker_metadata?:
      | ModelTypes["nft_sticker_metadata_mutation_response"]
      | undefined;
    /** insert a single row into the table: "nft_sticker_metadata" */
    insert_nft_sticker_metadata_one?:
      | ModelTypes["nft_sticker_metadata"]
      | undefined;
    /** insert data into the table: "room_active_chat_mapping" */
    insert_room_active_chat_mapping?:
      | ModelTypes["room_active_chat_mapping_mutation_response"]
      | undefined;
    /** insert a single row into the table: "room_active_chat_mapping" */
    insert_room_active_chat_mapping_one?:
      | ModelTypes["room_active_chat_mapping"]
      | undefined;
    /** insert data into the table: "secure_transfer_transactions" */
    insert_secure_transfer_transactions?:
      | ModelTypes["secure_transfer_transactions_mutation_response"]
      | undefined;
    /** insert a single row into the table: "secure_transfer_transactions" */
    insert_secure_transfer_transactions_one?:
      | ModelTypes["secure_transfer_transactions"]
      | undefined;
    /** insert data into the table: "simple_transactions" */
    insert_simple_transactions?:
      | ModelTypes["simple_transactions_mutation_response"]
      | undefined;
    /** insert a single row into the table: "simple_transactions" */
    insert_simple_transactions_one?:
      | ModelTypes["simple_transactions"]
      | undefined;
    /** update data of the table: "barter_poke_metadata" */
    update_barter_poke_metadata?:
      | ModelTypes["barter_poke_metadata_mutation_response"]
      | undefined;
    /** update single row of the table: "barter_poke_metadata" */
    update_barter_poke_metadata_by_pk?:
      | ModelTypes["barter_poke_metadata"]
      | undefined;
    /** update multiples rows of table: "barter_poke_metadata" */
    update_barter_poke_metadata_many?:
      | Array<ModelTypes["barter_poke_metadata_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "barters" */
    update_barters?: ModelTypes["barters_mutation_response"] | undefined;
    /** update single row of the table: "barters" */
    update_barters_by_pk?: ModelTypes["barters"] | undefined;
    /** update multiples rows of table: "barters" */
    update_barters_many?:
      | Array<ModelTypes["barters_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "chat_barter_metadata" */
    update_chat_barter_metadata?:
      | ModelTypes["chat_barter_metadata_mutation_response"]
      | undefined;
    /** update multiples rows of table: "chat_barter_metadata" */
    update_chat_barter_metadata_many?:
      | Array<ModelTypes["chat_barter_metadata_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "chat_media_messages" */
    update_chat_media_messages?:
      | ModelTypes["chat_media_messages_mutation_response"]
      | undefined;
    /** update single row of the table: "chat_media_messages" */
    update_chat_media_messages_by_pk?:
      | ModelTypes["chat_media_messages"]
      | undefined;
    /** update multiples rows of table: "chat_media_messages" */
    update_chat_media_messages_many?:
      | Array<ModelTypes["chat_media_messages_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "chats" */
    update_chats?: ModelTypes["chats_mutation_response"] | undefined;
    /** update single row of the table: "chats" */
    update_chats_by_pk?: ModelTypes["chats"] | undefined;
    /** update multiples rows of table: "chats" */
    update_chats_many?:
      | Array<ModelTypes["chats_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "nft_sticker_metadata" */
    update_nft_sticker_metadata?:
      | ModelTypes["nft_sticker_metadata_mutation_response"]
      | undefined;
    /** update single row of the table: "nft_sticker_metadata" */
    update_nft_sticker_metadata_by_pk?:
      | ModelTypes["nft_sticker_metadata"]
      | undefined;
    /** update multiples rows of table: "nft_sticker_metadata" */
    update_nft_sticker_metadata_many?:
      | Array<ModelTypes["nft_sticker_metadata_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "room_active_chat_mapping" */
    update_room_active_chat_mapping?:
      | ModelTypes["room_active_chat_mapping_mutation_response"]
      | undefined;
    /** update single row of the table: "room_active_chat_mapping" */
    update_room_active_chat_mapping_by_pk?:
      | ModelTypes["room_active_chat_mapping"]
      | undefined;
    /** update multiples rows of table: "room_active_chat_mapping" */
    update_room_active_chat_mapping_many?:
      | Array<
          ModelTypes["room_active_chat_mapping_mutation_response"] | undefined
        >
      | undefined;
    /** update data of the table: "secure_transfer_transactions" */
    update_secure_transfer_transactions?:
      | ModelTypes["secure_transfer_transactions_mutation_response"]
      | undefined;
    /** update single row of the table: "secure_transfer_transactions" */
    update_secure_transfer_transactions_by_pk?:
      | ModelTypes["secure_transfer_transactions"]
      | undefined;
    /** update multiples rows of table: "secure_transfer_transactions" */
    update_secure_transfer_transactions_many?:
      | Array<
          | ModelTypes["secure_transfer_transactions_mutation_response"]
          | undefined
        >
      | undefined;
    /** update data of the table: "simple_transactions" */
    update_simple_transactions?:
      | ModelTypes["simple_transactions_mutation_response"]
      | undefined;
    /** update single row of the table: "simple_transactions" */
    update_simple_transactions_by_pk?:
      | ModelTypes["simple_transactions"]
      | undefined;
    /** update multiples rows of table: "simple_transactions" */
    update_simple_transactions_many?:
      | Array<ModelTypes["simple_transactions_mutation_response"] | undefined>
      | undefined;
  };
  /** columns and relationships of "nft_sticker_metadata" */
  ["nft_sticker_metadata"]: {
    /** An object relationship */
    chat: ModelTypes["chats"];
    chat_client_generated_uuid: string;
    id: number;
    mint: string;
  };
  /** order by aggregate values of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_aggregate_order_by"]: {
    avg?: ModelTypes["nft_sticker_metadata_avg_order_by"] | undefined;
    count?: ModelTypes["order_by"] | undefined;
    max?: ModelTypes["nft_sticker_metadata_max_order_by"] | undefined;
    min?: ModelTypes["nft_sticker_metadata_min_order_by"] | undefined;
    stddev?: ModelTypes["nft_sticker_metadata_stddev_order_by"] | undefined;
    stddev_pop?:
      | ModelTypes["nft_sticker_metadata_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | ModelTypes["nft_sticker_metadata_stddev_samp_order_by"]
      | undefined;
    sum?: ModelTypes["nft_sticker_metadata_sum_order_by"] | undefined;
    var_pop?: ModelTypes["nft_sticker_metadata_var_pop_order_by"] | undefined;
    var_samp?: ModelTypes["nft_sticker_metadata_var_samp_order_by"] | undefined;
    variance?: ModelTypes["nft_sticker_metadata_variance_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "nft_sticker_metadata" */
  ["nft_sticker_metadata_arr_rel_insert_input"]: {
    data: Array<ModelTypes["nft_sticker_metadata_insert_input"]>;
    /** upsert condition */
    on_conflict?: ModelTypes["nft_sticker_metadata_on_conflict"] | undefined;
  };
  /** order by avg() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_avg_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "nft_sticker_metadata". All fields are combined with a logical 'AND'. */
  ["nft_sticker_metadata_bool_exp"]: {
    _and?: Array<ModelTypes["nft_sticker_metadata_bool_exp"]> | undefined;
    _not?: ModelTypes["nft_sticker_metadata_bool_exp"] | undefined;
    _or?: Array<ModelTypes["nft_sticker_metadata_bool_exp"]> | undefined;
    chat?: ModelTypes["chats_bool_exp"] | undefined;
    chat_client_generated_uuid?:
      | ModelTypes["String_comparison_exp"]
      | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    mint?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["nft_sticker_metadata_constraint"]: nft_sticker_metadata_constraint;
  /** input type for incrementing numeric columns in table "nft_sticker_metadata" */
  ["nft_sticker_metadata_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "nft_sticker_metadata" */
  ["nft_sticker_metadata_insert_input"]: {
    chat?: ModelTypes["chats_obj_rel_insert_input"] | undefined;
    chat_client_generated_uuid?: string | undefined;
    id?: number | undefined;
    mint?: string | undefined;
  };
  /** order by max() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_max_order_by"]: {
    chat_client_generated_uuid?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    mint?: ModelTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_min_order_by"]: {
    chat_client_generated_uuid?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    mint?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "nft_sticker_metadata" */
  ["nft_sticker_metadata_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["nft_sticker_metadata"]>;
  };
  /** on_conflict condition type for table "nft_sticker_metadata" */
  ["nft_sticker_metadata_on_conflict"]: {
    constraint: ModelTypes["nft_sticker_metadata_constraint"];
    update_columns: Array<ModelTypes["nft_sticker_metadata_update_column"]>;
    where?: ModelTypes["nft_sticker_metadata_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "nft_sticker_metadata". */
  ["nft_sticker_metadata_order_by"]: {
    chat?: ModelTypes["chats_order_by"] | undefined;
    chat_client_generated_uuid?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    mint?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: nft_sticker_metadata */
  ["nft_sticker_metadata_pk_columns_input"]: {
    id: number;
  };
  ["nft_sticker_metadata_select_column"]: nft_sticker_metadata_select_column;
  /** input type for updating data in table "nft_sticker_metadata" */
  ["nft_sticker_metadata_set_input"]: {
    chat_client_generated_uuid?: string | undefined;
    id?: number | undefined;
    mint?: string | undefined;
  };
  /** order by stddev() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stddev_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stddev_pop_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stddev_samp_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["nft_sticker_metadata_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["nft_sticker_metadata_stream_cursor_value_input"]: {
    chat_client_generated_uuid?: string | undefined;
    id?: number | undefined;
    mint?: string | undefined;
  };
  /** order by sum() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_sum_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  ["nft_sticker_metadata_update_column"]: nft_sticker_metadata_update_column;
  ["nft_sticker_metadata_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["nft_sticker_metadata_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["nft_sticker_metadata_set_input"] | undefined;
    where: ModelTypes["nft_sticker_metadata_bool_exp"];
  };
  /** order by var_pop() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_var_pop_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_var_samp_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_variance_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  ["order_by"]: order_by;
  ["query_root"]: {
    /** An array relationship */
    barter_poke_metadata: Array<ModelTypes["barter_poke_metadata"]>;
    /** fetch data from the table: "barter_poke_metadata" using primary key columns */
    barter_poke_metadata_by_pk?: ModelTypes["barter_poke_metadata"] | undefined;
    /** fetch data from the table: "barters" */
    barters: Array<ModelTypes["barters"]>;
    /** fetch data from the table: "barters" using primary key columns */
    barters_by_pk?: ModelTypes["barters"] | undefined;
    /** An array relationship */
    chat_barter_metadata: Array<ModelTypes["chat_barter_metadata"]>;
    /** An array relationship */
    chat_media_messages: Array<ModelTypes["chat_media_messages"]>;
    /** fetch data from the table: "chat_media_messages" using primary key columns */
    chat_media_messages_by_pk?: ModelTypes["chat_media_messages"] | undefined;
    /** fetch data from the table: "chat_update_history" */
    chat_update_history: Array<ModelTypes["chat_update_history"]>;
    /** fetch data from the table: "chat_update_history" using primary key columns */
    chat_update_history_by_pk?: ModelTypes["chat_update_history"] | undefined;
    /** fetch data from the table: "chats" */
    chats: Array<ModelTypes["chats"]>;
    /** fetch data from the table: "chats" using primary key columns */
    chats_by_pk?: ModelTypes["chats"] | undefined;
    /** An array relationship */
    nft_sticker_metadata: Array<ModelTypes["nft_sticker_metadata"]>;
    /** fetch data from the table: "nft_sticker_metadata" using primary key columns */
    nft_sticker_metadata_by_pk?: ModelTypes["nft_sticker_metadata"] | undefined;
    /** fetch data from the table: "room_active_chat_mapping" */
    room_active_chat_mapping: Array<ModelTypes["room_active_chat_mapping"]>;
    /** fetch data from the table: "room_active_chat_mapping" using primary key columns */
    room_active_chat_mapping_by_pk?:
      | ModelTypes["room_active_chat_mapping"]
      | undefined;
    /** An array relationship */
    secure_transfer_transactions: Array<
      ModelTypes["secure_transfer_transactions"]
    >;
    /** fetch data from the table: "secure_transfer_transactions" using primary key columns */
    secure_transfer_transactions_by_pk?:
      | ModelTypes["secure_transfer_transactions"]
      | undefined;
    /** An array relationship */
    simple_transactions: Array<ModelTypes["simple_transactions"]>;
    /** fetch data from the table: "simple_transactions" using primary key columns */
    simple_transactions_by_pk?: ModelTypes["simple_transactions"] | undefined;
  };
  /** columns and relationships of "room_active_chat_mapping" */
  ["room_active_chat_mapping"]: {
    /** An object relationship */
    barter: ModelTypes["barters"];
    barter_id: number;
    room_id: string;
  };
  /** order by aggregate values of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_aggregate_order_by"]: {
    avg?: ModelTypes["room_active_chat_mapping_avg_order_by"] | undefined;
    count?: ModelTypes["order_by"] | undefined;
    max?: ModelTypes["room_active_chat_mapping_max_order_by"] | undefined;
    min?: ModelTypes["room_active_chat_mapping_min_order_by"] | undefined;
    stddev?: ModelTypes["room_active_chat_mapping_stddev_order_by"] | undefined;
    stddev_pop?:
      | ModelTypes["room_active_chat_mapping_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | ModelTypes["room_active_chat_mapping_stddev_samp_order_by"]
      | undefined;
    sum?: ModelTypes["room_active_chat_mapping_sum_order_by"] | undefined;
    var_pop?:
      | ModelTypes["room_active_chat_mapping_var_pop_order_by"]
      | undefined;
    var_samp?:
      | ModelTypes["room_active_chat_mapping_var_samp_order_by"]
      | undefined;
    variance?:
      | ModelTypes["room_active_chat_mapping_variance_order_by"]
      | undefined;
  };
  /** input type for inserting array relation for remote table "room_active_chat_mapping" */
  ["room_active_chat_mapping_arr_rel_insert_input"]: {
    data: Array<ModelTypes["room_active_chat_mapping_insert_input"]>;
    /** upsert condition */
    on_conflict?:
      | ModelTypes["room_active_chat_mapping_on_conflict"]
      | undefined;
  };
  /** order by avg() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_avg_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "room_active_chat_mapping". All fields are combined with a logical 'AND'. */
  ["room_active_chat_mapping_bool_exp"]: {
    _and?: Array<ModelTypes["room_active_chat_mapping_bool_exp"]> | undefined;
    _not?: ModelTypes["room_active_chat_mapping_bool_exp"] | undefined;
    _or?: Array<ModelTypes["room_active_chat_mapping_bool_exp"]> | undefined;
    barter?: ModelTypes["barters_bool_exp"] | undefined;
    barter_id?: ModelTypes["Int_comparison_exp"] | undefined;
    room_id?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["room_active_chat_mapping_constraint"]: room_active_chat_mapping_constraint;
  /** input type for incrementing numeric columns in table "room_active_chat_mapping" */
  ["room_active_chat_mapping_inc_input"]: {
    barter_id?: number | undefined;
  };
  /** input type for inserting data into table "room_active_chat_mapping" */
  ["room_active_chat_mapping_insert_input"]: {
    barter?: ModelTypes["barters_obj_rel_insert_input"] | undefined;
    barter_id?: number | undefined;
    room_id?: string | undefined;
  };
  /** order by max() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_max_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
    room_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_min_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
    room_id?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "room_active_chat_mapping" */
  ["room_active_chat_mapping_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["room_active_chat_mapping"]>;
  };
  /** on_conflict condition type for table "room_active_chat_mapping" */
  ["room_active_chat_mapping_on_conflict"]: {
    constraint: ModelTypes["room_active_chat_mapping_constraint"];
    update_columns: Array<ModelTypes["room_active_chat_mapping_update_column"]>;
    where?: ModelTypes["room_active_chat_mapping_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "room_active_chat_mapping". */
  ["room_active_chat_mapping_order_by"]: {
    barter?: ModelTypes["barters_order_by"] | undefined;
    barter_id?: ModelTypes["order_by"] | undefined;
    room_id?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: room_active_chat_mapping */
  ["room_active_chat_mapping_pk_columns_input"]: {
    room_id: string;
  };
  ["room_active_chat_mapping_select_column"]: room_active_chat_mapping_select_column;
  /** input type for updating data in table "room_active_chat_mapping" */
  ["room_active_chat_mapping_set_input"]: {
    barter_id?: number | undefined;
    room_id?: string | undefined;
  };
  /** order by stddev() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stddev_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stddev_pop_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stddev_samp_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["room_active_chat_mapping_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["room_active_chat_mapping_stream_cursor_value_input"]: {
    barter_id?: number | undefined;
    room_id?: string | undefined;
  };
  /** order by sum() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_sum_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  ["room_active_chat_mapping_update_column"]: room_active_chat_mapping_update_column;
  ["room_active_chat_mapping_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["room_active_chat_mapping_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["room_active_chat_mapping_set_input"] | undefined;
    where: ModelTypes["room_active_chat_mapping_bool_exp"];
  };
  /** order by var_pop() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_var_pop_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_var_samp_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_variance_order_by"]: {
    barter_id?: ModelTypes["order_by"] | undefined;
  };
  /** columns and relationships of "secure_transfer_transactions" */
  ["secure_transfer_transactions"]: {
    /** An object relationship */
    chat?: ModelTypes["chats"] | undefined;
    counter: string;
    current_state?: string | undefined;
    escrow: string;
    final_txn_signature?: string | undefined;
    from: string;
    id: number;
    message_client_generated_uuid?: string | undefined;
    message_id: number;
    signature?: string | undefined;
    to: string;
  };
  /** order by aggregate values of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_aggregate_order_by"]: {
    avg?: ModelTypes["secure_transfer_transactions_avg_order_by"] | undefined;
    count?: ModelTypes["order_by"] | undefined;
    max?: ModelTypes["secure_transfer_transactions_max_order_by"] | undefined;
    min?: ModelTypes["secure_transfer_transactions_min_order_by"] | undefined;
    stddev?:
      | ModelTypes["secure_transfer_transactions_stddev_order_by"]
      | undefined;
    stddev_pop?:
      | ModelTypes["secure_transfer_transactions_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | ModelTypes["secure_transfer_transactions_stddev_samp_order_by"]
      | undefined;
    sum?: ModelTypes["secure_transfer_transactions_sum_order_by"] | undefined;
    var_pop?:
      | ModelTypes["secure_transfer_transactions_var_pop_order_by"]
      | undefined;
    var_samp?:
      | ModelTypes["secure_transfer_transactions_var_samp_order_by"]
      | undefined;
    variance?:
      | ModelTypes["secure_transfer_transactions_variance_order_by"]
      | undefined;
  };
  /** input type for inserting array relation for remote table "secure_transfer_transactions" */
  ["secure_transfer_transactions_arr_rel_insert_input"]: {
    data: Array<ModelTypes["secure_transfer_transactions_insert_input"]>;
    /** upsert condition */
    on_conflict?:
      | ModelTypes["secure_transfer_transactions_on_conflict"]
      | undefined;
  };
  /** order by avg() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_avg_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
    message_id?: ModelTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "secure_transfer_transactions". All fields are combined with a logical 'AND'. */
  ["secure_transfer_transactions_bool_exp"]: {
    _and?:
      | Array<ModelTypes["secure_transfer_transactions_bool_exp"]>
      | undefined;
    _not?: ModelTypes["secure_transfer_transactions_bool_exp"] | undefined;
    _or?:
      | Array<ModelTypes["secure_transfer_transactions_bool_exp"]>
      | undefined;
    chat?: ModelTypes["chats_bool_exp"] | undefined;
    counter?: ModelTypes["String_comparison_exp"] | undefined;
    current_state?: ModelTypes["String_comparison_exp"] | undefined;
    escrow?: ModelTypes["String_comparison_exp"] | undefined;
    final_txn_signature?: ModelTypes["String_comparison_exp"] | undefined;
    from?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    message_client_generated_uuid?:
      | ModelTypes["String_comparison_exp"]
      | undefined;
    message_id?: ModelTypes["Int_comparison_exp"] | undefined;
    signature?: ModelTypes["String_comparison_exp"] | undefined;
    to?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["secure_transfer_transactions_constraint"]: secure_transfer_transactions_constraint;
  /** input type for incrementing numeric columns in table "secure_transfer_transactions" */
  ["secure_transfer_transactions_inc_input"]: {
    id?: number | undefined;
    message_id?: number | undefined;
  };
  /** input type for inserting data into table "secure_transfer_transactions" */
  ["secure_transfer_transactions_insert_input"]: {
    chat?: ModelTypes["chats_obj_rel_insert_input"] | undefined;
    counter?: string | undefined;
    current_state?: string | undefined;
    escrow?: string | undefined;
    final_txn_signature?: string | undefined;
    from?: string | undefined;
    id?: number | undefined;
    message_client_generated_uuid?: string | undefined;
    message_id?: number | undefined;
    signature?: string | undefined;
    to?: string | undefined;
  };
  /** order by max() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_max_order_by"]: {
    counter?: ModelTypes["order_by"] | undefined;
    current_state?: ModelTypes["order_by"] | undefined;
    escrow?: ModelTypes["order_by"] | undefined;
    final_txn_signature?: ModelTypes["order_by"] | undefined;
    from?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    message_client_generated_uuid?: ModelTypes["order_by"] | undefined;
    message_id?: ModelTypes["order_by"] | undefined;
    signature?: ModelTypes["order_by"] | undefined;
    to?: ModelTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_min_order_by"]: {
    counter?: ModelTypes["order_by"] | undefined;
    current_state?: ModelTypes["order_by"] | undefined;
    escrow?: ModelTypes["order_by"] | undefined;
    final_txn_signature?: ModelTypes["order_by"] | undefined;
    from?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    message_client_generated_uuid?: ModelTypes["order_by"] | undefined;
    message_id?: ModelTypes["order_by"] | undefined;
    signature?: ModelTypes["order_by"] | undefined;
    to?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "secure_transfer_transactions" */
  ["secure_transfer_transactions_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["secure_transfer_transactions"]>;
  };
  /** on_conflict condition type for table "secure_transfer_transactions" */
  ["secure_transfer_transactions_on_conflict"]: {
    constraint: ModelTypes["secure_transfer_transactions_constraint"];
    update_columns: Array<
      ModelTypes["secure_transfer_transactions_update_column"]
    >;
    where?: ModelTypes["secure_transfer_transactions_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "secure_transfer_transactions". */
  ["secure_transfer_transactions_order_by"]: {
    chat?: ModelTypes["chats_order_by"] | undefined;
    counter?: ModelTypes["order_by"] | undefined;
    current_state?: ModelTypes["order_by"] | undefined;
    escrow?: ModelTypes["order_by"] | undefined;
    final_txn_signature?: ModelTypes["order_by"] | undefined;
    from?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    message_client_generated_uuid?: ModelTypes["order_by"] | undefined;
    message_id?: ModelTypes["order_by"] | undefined;
    signature?: ModelTypes["order_by"] | undefined;
    to?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: secure_transfer_transactions */
  ["secure_transfer_transactions_pk_columns_input"]: {
    id: number;
  };
  ["secure_transfer_transactions_select_column"]: secure_transfer_transactions_select_column;
  /** input type for updating data in table "secure_transfer_transactions" */
  ["secure_transfer_transactions_set_input"]: {
    counter?: string | undefined;
    current_state?: string | undefined;
    escrow?: string | undefined;
    final_txn_signature?: string | undefined;
    from?: string | undefined;
    id?: number | undefined;
    message_client_generated_uuid?: string | undefined;
    message_id?: number | undefined;
    signature?: string | undefined;
    to?: string | undefined;
  };
  /** order by stddev() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stddev_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
    message_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stddev_pop_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
    message_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stddev_samp_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
    message_id?: ModelTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["secure_transfer_transactions_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["secure_transfer_transactions_stream_cursor_value_input"]: {
    counter?: string | undefined;
    current_state?: string | undefined;
    escrow?: string | undefined;
    final_txn_signature?: string | undefined;
    from?: string | undefined;
    id?: number | undefined;
    message_client_generated_uuid?: string | undefined;
    message_id?: number | undefined;
    signature?: string | undefined;
    to?: string | undefined;
  };
  /** order by sum() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_sum_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
    message_id?: ModelTypes["order_by"] | undefined;
  };
  ["secure_transfer_transactions_update_column"]: secure_transfer_transactions_update_column;
  ["secure_transfer_transactions_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["secure_transfer_transactions_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["secure_transfer_transactions_set_input"] | undefined;
    where: ModelTypes["secure_transfer_transactions_bool_exp"];
  };
  /** order by var_pop() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_var_pop_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
    message_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_var_samp_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
    message_id?: ModelTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_variance_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
    message_id?: ModelTypes["order_by"] | undefined;
  };
  /** columns and relationships of "simple_transactions" */
  ["simple_transactions"]: {
    client_generated_uuid: string;
    id: number;
    txn_signature: string;
  };
  /** order by aggregate values of table "simple_transactions" */
  ["simple_transactions_aggregate_order_by"]: {
    avg?: ModelTypes["simple_transactions_avg_order_by"] | undefined;
    count?: ModelTypes["order_by"] | undefined;
    max?: ModelTypes["simple_transactions_max_order_by"] | undefined;
    min?: ModelTypes["simple_transactions_min_order_by"] | undefined;
    stddev?: ModelTypes["simple_transactions_stddev_order_by"] | undefined;
    stddev_pop?:
      | ModelTypes["simple_transactions_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | ModelTypes["simple_transactions_stddev_samp_order_by"]
      | undefined;
    sum?: ModelTypes["simple_transactions_sum_order_by"] | undefined;
    var_pop?: ModelTypes["simple_transactions_var_pop_order_by"] | undefined;
    var_samp?: ModelTypes["simple_transactions_var_samp_order_by"] | undefined;
    variance?: ModelTypes["simple_transactions_variance_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "simple_transactions" */
  ["simple_transactions_arr_rel_insert_input"]: {
    data: Array<ModelTypes["simple_transactions_insert_input"]>;
    /** upsert condition */
    on_conflict?: ModelTypes["simple_transactions_on_conflict"] | undefined;
  };
  /** order by avg() on columns of table "simple_transactions" */
  ["simple_transactions_avg_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "simple_transactions". All fields are combined with a logical 'AND'. */
  ["simple_transactions_bool_exp"]: {
    _and?: Array<ModelTypes["simple_transactions_bool_exp"]> | undefined;
    _not?: ModelTypes["simple_transactions_bool_exp"] | undefined;
    _or?: Array<ModelTypes["simple_transactions_bool_exp"]> | undefined;
    client_generated_uuid?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["Int_comparison_exp"] | undefined;
    txn_signature?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["simple_transactions_constraint"]: simple_transactions_constraint;
  /** input type for incrementing numeric columns in table "simple_transactions" */
  ["simple_transactions_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "simple_transactions" */
  ["simple_transactions_insert_input"]: {
    client_generated_uuid?: string | undefined;
    id?: number | undefined;
    txn_signature?: string | undefined;
  };
  /** order by max() on columns of table "simple_transactions" */
  ["simple_transactions_max_order_by"]: {
    client_generated_uuid?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    txn_signature?: ModelTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "simple_transactions" */
  ["simple_transactions_min_order_by"]: {
    client_generated_uuid?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    txn_signature?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "simple_transactions" */
  ["simple_transactions_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["simple_transactions"]>;
  };
  /** on_conflict condition type for table "simple_transactions" */
  ["simple_transactions_on_conflict"]: {
    constraint: ModelTypes["simple_transactions_constraint"];
    update_columns: Array<ModelTypes["simple_transactions_update_column"]>;
    where?: ModelTypes["simple_transactions_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "simple_transactions". */
  ["simple_transactions_order_by"]: {
    client_generated_uuid?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    txn_signature?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: simple_transactions */
  ["simple_transactions_pk_columns_input"]: {
    id: number;
  };
  ["simple_transactions_select_column"]: simple_transactions_select_column;
  /** input type for updating data in table "simple_transactions" */
  ["simple_transactions_set_input"]: {
    client_generated_uuid?: string | undefined;
    id?: number | undefined;
    txn_signature?: string | undefined;
  };
  /** order by stddev() on columns of table "simple_transactions" */
  ["simple_transactions_stddev_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "simple_transactions" */
  ["simple_transactions_stddev_pop_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "simple_transactions" */
  ["simple_transactions_stddev_samp_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "simple_transactions" */
  ["simple_transactions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["simple_transactions_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["simple_transactions_stream_cursor_value_input"]: {
    client_generated_uuid?: string | undefined;
    id?: number | undefined;
    txn_signature?: string | undefined;
  };
  /** order by sum() on columns of table "simple_transactions" */
  ["simple_transactions_sum_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  ["simple_transactions_update_column"]: simple_transactions_update_column;
  ["simple_transactions_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["simple_transactions_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["simple_transactions_set_input"] | undefined;
    where: ModelTypes["simple_transactions_bool_exp"];
  };
  /** order by var_pop() on columns of table "simple_transactions" */
  ["simple_transactions_var_pop_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "simple_transactions" */
  ["simple_transactions_var_samp_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "simple_transactions" */
  ["simple_transactions_variance_order_by"]: {
    id?: ModelTypes["order_by"] | undefined;
  };
  ["subscription_root"]: {
    /** An array relationship */
    barter_poke_metadata: Array<ModelTypes["barter_poke_metadata"]>;
    /** fetch data from the table: "barter_poke_metadata" using primary key columns */
    barter_poke_metadata_by_pk?: ModelTypes["barter_poke_metadata"] | undefined;
    /** fetch data from the table in a streaming manner: "barter_poke_metadata" */
    barter_poke_metadata_stream: Array<ModelTypes["barter_poke_metadata"]>;
    /** fetch data from the table: "barters" */
    barters: Array<ModelTypes["barters"]>;
    /** fetch data from the table: "barters" using primary key columns */
    barters_by_pk?: ModelTypes["barters"] | undefined;
    /** fetch data from the table in a streaming manner: "barters" */
    barters_stream: Array<ModelTypes["barters"]>;
    /** An array relationship */
    chat_barter_metadata: Array<ModelTypes["chat_barter_metadata"]>;
    /** fetch data from the table in a streaming manner: "chat_barter_metadata" */
    chat_barter_metadata_stream: Array<ModelTypes["chat_barter_metadata"]>;
    /** An array relationship */
    chat_media_messages: Array<ModelTypes["chat_media_messages"]>;
    /** fetch data from the table: "chat_media_messages" using primary key columns */
    chat_media_messages_by_pk?: ModelTypes["chat_media_messages"] | undefined;
    /** fetch data from the table in a streaming manner: "chat_media_messages" */
    chat_media_messages_stream: Array<ModelTypes["chat_media_messages"]>;
    /** fetch data from the table: "chat_update_history" */
    chat_update_history: Array<ModelTypes["chat_update_history"]>;
    /** fetch data from the table: "chat_update_history" using primary key columns */
    chat_update_history_by_pk?: ModelTypes["chat_update_history"] | undefined;
    /** fetch data from the table in a streaming manner: "chat_update_history" */
    chat_update_history_stream: Array<ModelTypes["chat_update_history"]>;
    /** fetch data from the table: "chats" */
    chats: Array<ModelTypes["chats"]>;
    /** fetch data from the table: "chats" using primary key columns */
    chats_by_pk?: ModelTypes["chats"] | undefined;
    /** fetch data from the table in a streaming manner: "chats" */
    chats_stream: Array<ModelTypes["chats"]>;
    /** An array relationship */
    nft_sticker_metadata: Array<ModelTypes["nft_sticker_metadata"]>;
    /** fetch data from the table: "nft_sticker_metadata" using primary key columns */
    nft_sticker_metadata_by_pk?: ModelTypes["nft_sticker_metadata"] | undefined;
    /** fetch data from the table in a streaming manner: "nft_sticker_metadata" */
    nft_sticker_metadata_stream: Array<ModelTypes["nft_sticker_metadata"]>;
    /** fetch data from the table: "room_active_chat_mapping" */
    room_active_chat_mapping: Array<ModelTypes["room_active_chat_mapping"]>;
    /** fetch data from the table: "room_active_chat_mapping" using primary key columns */
    room_active_chat_mapping_by_pk?:
      | ModelTypes["room_active_chat_mapping"]
      | undefined;
    /** fetch data from the table in a streaming manner: "room_active_chat_mapping" */
    room_active_chat_mapping_stream: Array<
      ModelTypes["room_active_chat_mapping"]
    >;
    /** An array relationship */
    secure_transfer_transactions: Array<
      ModelTypes["secure_transfer_transactions"]
    >;
    /** fetch data from the table: "secure_transfer_transactions" using primary key columns */
    secure_transfer_transactions_by_pk?:
      | ModelTypes["secure_transfer_transactions"]
      | undefined;
    /** fetch data from the table in a streaming manner: "secure_transfer_transactions" */
    secure_transfer_transactions_stream: Array<
      ModelTypes["secure_transfer_transactions"]
    >;
    /** An array relationship */
    simple_transactions: Array<ModelTypes["simple_transactions"]>;
    /** fetch data from the table: "simple_transactions" using primary key columns */
    simple_transactions_by_pk?: ModelTypes["simple_transactions"] | undefined;
    /** fetch data from the table in a streaming manner: "simple_transactions" */
    simple_transactions_stream: Array<ModelTypes["simple_transactions"]>;
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
  /** columns and relationships of "barter_poke_metadata" */
  ["barter_poke_metadata"]: {
    __typename: "barter_poke_metadata";
    barter_id: number;
    /** An object relationship */
    chat: GraphQLTypes["chats"];
    id: number;
    message_client_generated_uuid: string;
  };
  /** order by aggregate values of table "barter_poke_metadata" */
  ["barter_poke_metadata_aggregate_order_by"]: {
    avg?: GraphQLTypes["barter_poke_metadata_avg_order_by"] | undefined;
    count?: GraphQLTypes["order_by"] | undefined;
    max?: GraphQLTypes["barter_poke_metadata_max_order_by"] | undefined;
    min?: GraphQLTypes["barter_poke_metadata_min_order_by"] | undefined;
    stddev?: GraphQLTypes["barter_poke_metadata_stddev_order_by"] | undefined;
    stddev_pop?:
      | GraphQLTypes["barter_poke_metadata_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | GraphQLTypes["barter_poke_metadata_stddev_samp_order_by"]
      | undefined;
    sum?: GraphQLTypes["barter_poke_metadata_sum_order_by"] | undefined;
    var_pop?: GraphQLTypes["barter_poke_metadata_var_pop_order_by"] | undefined;
    var_samp?:
      | GraphQLTypes["barter_poke_metadata_var_samp_order_by"]
      | undefined;
    variance?:
      | GraphQLTypes["barter_poke_metadata_variance_order_by"]
      | undefined;
  };
  /** input type for inserting array relation for remote table "barter_poke_metadata" */
  ["barter_poke_metadata_arr_rel_insert_input"]: {
    data: Array<GraphQLTypes["barter_poke_metadata_insert_input"]>;
    /** upsert condition */
    on_conflict?: GraphQLTypes["barter_poke_metadata_on_conflict"] | undefined;
  };
  /** order by avg() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_avg_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "barter_poke_metadata". All fields are combined with a logical 'AND'. */
  ["barter_poke_metadata_bool_exp"]: {
    _and?: Array<GraphQLTypes["barter_poke_metadata_bool_exp"]> | undefined;
    _not?: GraphQLTypes["barter_poke_metadata_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["barter_poke_metadata_bool_exp"]> | undefined;
    barter_id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    chat?: GraphQLTypes["chats_bool_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    message_client_generated_uuid?:
      | GraphQLTypes["String_comparison_exp"]
      | undefined;
  };
  /** unique or primary key constraints on table "barter_poke_metadata" */
  ["barter_poke_metadata_constraint"]: barter_poke_metadata_constraint;
  /** input type for incrementing numeric columns in table "barter_poke_metadata" */
  ["barter_poke_metadata_inc_input"]: {
    barter_id?: number | undefined;
    id?: number | undefined;
  };
  /** input type for inserting data into table "barter_poke_metadata" */
  ["barter_poke_metadata_insert_input"]: {
    barter_id?: number | undefined;
    chat?: GraphQLTypes["chats_obj_rel_insert_input"] | undefined;
    id?: number | undefined;
    message_client_generated_uuid?: string | undefined;
  };
  /** order by max() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_max_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    message_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_min_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    message_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "barter_poke_metadata" */
  ["barter_poke_metadata_mutation_response"]: {
    __typename: "barter_poke_metadata_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["barter_poke_metadata"]>;
  };
  /** on_conflict condition type for table "barter_poke_metadata" */
  ["barter_poke_metadata_on_conflict"]: {
    constraint: GraphQLTypes["barter_poke_metadata_constraint"];
    update_columns: Array<GraphQLTypes["barter_poke_metadata_update_column"]>;
    where?: GraphQLTypes["barter_poke_metadata_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "barter_poke_metadata". */
  ["barter_poke_metadata_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
    chat?: GraphQLTypes["chats_order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    message_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: barter_poke_metadata */
  ["barter_poke_metadata_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_select_column"]: barter_poke_metadata_select_column;
  /** input type for updating data in table "barter_poke_metadata" */
  ["barter_poke_metadata_set_input"]: {
    barter_id?: number | undefined;
    id?: number | undefined;
    message_client_generated_uuid?: string | undefined;
  };
  /** order by stddev() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_stddev_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_stddev_pop_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_stddev_samp_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "barter_poke_metadata" */
  ["barter_poke_metadata_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["barter_poke_metadata_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["barter_poke_metadata_stream_cursor_value_input"]: {
    barter_id?: number | undefined;
    id?: number | undefined;
    message_client_generated_uuid?: string | undefined;
  };
  /** order by sum() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_sum_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** update columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_update_column"]: barter_poke_metadata_update_column;
  ["barter_poke_metadata_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["barter_poke_metadata_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["barter_poke_metadata_set_input"] | undefined;
    where: GraphQLTypes["barter_poke_metadata_bool_exp"];
  };
  /** order by var_pop() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_var_pop_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_var_samp_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "barter_poke_metadata" */
  ["barter_poke_metadata_variance_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** columns and relationships of "barters" */
  ["barters"]: {
    __typename: "barters";
    /** An array relationship */
    chat_barter_metadata: Array<GraphQLTypes["chat_barter_metadata"]>;
    id: number;
    on_chain_state?: string | undefined;
    /** An array relationship */
    room_active_chat_mappings: Array<GraphQLTypes["room_active_chat_mapping"]>;
    room_id?: string | undefined;
    state: string;
    user1_offers: string;
    user2_offers: string;
  };
  /** Boolean expression to filter rows from the table "barters". All fields are combined with a logical 'AND'. */
  ["barters_bool_exp"]: {
    _and?: Array<GraphQLTypes["barters_bool_exp"]> | undefined;
    _not?: GraphQLTypes["barters_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["barters_bool_exp"]> | undefined;
    chat_barter_metadata?:
      | GraphQLTypes["chat_barter_metadata_bool_exp"]
      | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    on_chain_state?: GraphQLTypes["String_comparison_exp"] | undefined;
    room_active_chat_mappings?:
      | GraphQLTypes["room_active_chat_mapping_bool_exp"]
      | undefined;
    room_id?: GraphQLTypes["String_comparison_exp"] | undefined;
    state?: GraphQLTypes["String_comparison_exp"] | undefined;
    user1_offers?: GraphQLTypes["String_comparison_exp"] | undefined;
    user2_offers?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "barters" */
  ["barters_constraint"]: barters_constraint;
  /** input type for incrementing numeric columns in table "barters" */
  ["barters_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "barters" */
  ["barters_insert_input"]: {
    chat_barter_metadata?:
      | GraphQLTypes["chat_barter_metadata_arr_rel_insert_input"]
      | undefined;
    id?: number | undefined;
    on_chain_state?: string | undefined;
    room_active_chat_mappings?:
      | GraphQLTypes["room_active_chat_mapping_arr_rel_insert_input"]
      | undefined;
    room_id?: string | undefined;
    state?: string | undefined;
    user1_offers?: string | undefined;
    user2_offers?: string | undefined;
  };
  /** response of any mutation on the table "barters" */
  ["barters_mutation_response"]: {
    __typename: "barters_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["barters"]>;
  };
  /** input type for inserting object relation for remote table "barters" */
  ["barters_obj_rel_insert_input"]: {
    data: GraphQLTypes["barters_insert_input"];
    /** upsert condition */
    on_conflict?: GraphQLTypes["barters_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "barters" */
  ["barters_on_conflict"]: {
    constraint: GraphQLTypes["barters_constraint"];
    update_columns: Array<GraphQLTypes["barters_update_column"]>;
    where?: GraphQLTypes["barters_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "barters". */
  ["barters_order_by"]: {
    chat_barter_metadata_aggregate?:
      | GraphQLTypes["chat_barter_metadata_aggregate_order_by"]
      | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    on_chain_state?: GraphQLTypes["order_by"] | undefined;
    room_active_chat_mappings_aggregate?:
      | GraphQLTypes["room_active_chat_mapping_aggregate_order_by"]
      | undefined;
    room_id?: GraphQLTypes["order_by"] | undefined;
    state?: GraphQLTypes["order_by"] | undefined;
    user1_offers?: GraphQLTypes["order_by"] | undefined;
    user2_offers?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: barters */
  ["barters_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "barters" */
  ["barters_select_column"]: barters_select_column;
  /** input type for updating data in table "barters" */
  ["barters_set_input"]: {
    id?: number | undefined;
    on_chain_state?: string | undefined;
    room_id?: string | undefined;
    state?: string | undefined;
    user1_offers?: string | undefined;
    user2_offers?: string | undefined;
  };
  /** Streaming cursor of the table "barters" */
  ["barters_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["barters_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["barters_stream_cursor_value_input"]: {
    id?: number | undefined;
    on_chain_state?: string | undefined;
    room_id?: string | undefined;
    state?: string | undefined;
    user1_offers?: string | undefined;
    user2_offers?: string | undefined;
  };
  /** update columns of table "barters" */
  ["barters_update_column"]: barters_update_column;
  ["barters_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["barters_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["barters_set_input"] | undefined;
    where: GraphQLTypes["barters_bool_exp"];
  };
  /** columns and relationships of "chat_barter_metadata" */
  ["chat_barter_metadata"]: {
    __typename: "chat_barter_metadata";
    /** An object relationship */
    barter: GraphQLTypes["barters"];
    barter_id: number;
    /** An object relationship */
    chat: GraphQLTypes["chats"];
    chat_client_generated_uuid: string;
  };
  /** order by aggregate values of table "chat_barter_metadata" */
  ["chat_barter_metadata_aggregate_order_by"]: {
    avg?: GraphQLTypes["chat_barter_metadata_avg_order_by"] | undefined;
    count?: GraphQLTypes["order_by"] | undefined;
    max?: GraphQLTypes["chat_barter_metadata_max_order_by"] | undefined;
    min?: GraphQLTypes["chat_barter_metadata_min_order_by"] | undefined;
    stddev?: GraphQLTypes["chat_barter_metadata_stddev_order_by"] | undefined;
    stddev_pop?:
      | GraphQLTypes["chat_barter_metadata_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | GraphQLTypes["chat_barter_metadata_stddev_samp_order_by"]
      | undefined;
    sum?: GraphQLTypes["chat_barter_metadata_sum_order_by"] | undefined;
    var_pop?: GraphQLTypes["chat_barter_metadata_var_pop_order_by"] | undefined;
    var_samp?:
      | GraphQLTypes["chat_barter_metadata_var_samp_order_by"]
      | undefined;
    variance?:
      | GraphQLTypes["chat_barter_metadata_variance_order_by"]
      | undefined;
  };
  /** input type for inserting array relation for remote table "chat_barter_metadata" */
  ["chat_barter_metadata_arr_rel_insert_input"]: {
    data: Array<GraphQLTypes["chat_barter_metadata_insert_input"]>;
    /** upsert condition */
    on_conflict?: GraphQLTypes["chat_barter_metadata_on_conflict"] | undefined;
  };
  /** order by avg() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_avg_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "chat_barter_metadata". All fields are combined with a logical 'AND'. */
  ["chat_barter_metadata_bool_exp"]: {
    _and?: Array<GraphQLTypes["chat_barter_metadata_bool_exp"]> | undefined;
    _not?: GraphQLTypes["chat_barter_metadata_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["chat_barter_metadata_bool_exp"]> | undefined;
    barter?: GraphQLTypes["barters_bool_exp"] | undefined;
    barter_id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    chat?: GraphQLTypes["chats_bool_exp"] | undefined;
    chat_client_generated_uuid?:
      | GraphQLTypes["String_comparison_exp"]
      | undefined;
  };
  /** unique or primary key constraints on table "chat_barter_metadata" */
  ["chat_barter_metadata_constraint"]: chat_barter_metadata_constraint;
  /** input type for inserting data into table "chat_barter_metadata" */
  ["chat_barter_metadata_insert_input"]: {
    barter?: GraphQLTypes["barters_obj_rel_insert_input"] | undefined;
    barter_id?: number | undefined;
    chat?: GraphQLTypes["chats_obj_rel_insert_input"] | undefined;
    chat_client_generated_uuid?: string | undefined;
  };
  /** order by max() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_max_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
    chat_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_min_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
    chat_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "chat_barter_metadata" */
  ["chat_barter_metadata_mutation_response"]: {
    __typename: "chat_barter_metadata_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["chat_barter_metadata"]>;
  };
  /** on_conflict condition type for table "chat_barter_metadata" */
  ["chat_barter_metadata_on_conflict"]: {
    constraint: GraphQLTypes["chat_barter_metadata_constraint"];
    update_columns: Array<GraphQLTypes["chat_barter_metadata_update_column"]>;
    where?: GraphQLTypes["chat_barter_metadata_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "chat_barter_metadata". */
  ["chat_barter_metadata_order_by"]: {
    barter?: GraphQLTypes["barters_order_by"] | undefined;
    barter_id?: GraphQLTypes["order_by"] | undefined;
    chat?: GraphQLTypes["chats_order_by"] | undefined;
    chat_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
  };
  /** select columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_select_column"]: chat_barter_metadata_select_column;
  /** order by stddev() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_stddev_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_stddev_pop_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_stddev_samp_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "chat_barter_metadata" */
  ["chat_barter_metadata_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["chat_barter_metadata_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_barter_metadata_stream_cursor_value_input"]: {
    barter_id?: number | undefined;
    chat_client_generated_uuid?: string | undefined;
  };
  /** order by sum() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_sum_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** placeholder for update columns of table "chat_barter_metadata" (current role has no relevant permissions) */
  ["chat_barter_metadata_update_column"]: chat_barter_metadata_update_column;
  ["chat_barter_metadata_updates"]: {
    where: GraphQLTypes["chat_barter_metadata_bool_exp"];
  };
  /** order by var_pop() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_var_pop_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_var_samp_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "chat_barter_metadata" */
  ["chat_barter_metadata_variance_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** columns and relationships of "chat_media_messages" */
  ["chat_media_messages"]: {
    __typename: "chat_media_messages";
    /** An object relationship */
    chat: GraphQLTypes["chats"];
    id: number;
    media_kind: string;
    media_link: string;
    message_client_generated_uuid: string;
  };
  /** order by aggregate values of table "chat_media_messages" */
  ["chat_media_messages_aggregate_order_by"]: {
    avg?: GraphQLTypes["chat_media_messages_avg_order_by"] | undefined;
    count?: GraphQLTypes["order_by"] | undefined;
    max?: GraphQLTypes["chat_media_messages_max_order_by"] | undefined;
    min?: GraphQLTypes["chat_media_messages_min_order_by"] | undefined;
    stddev?: GraphQLTypes["chat_media_messages_stddev_order_by"] | undefined;
    stddev_pop?:
      | GraphQLTypes["chat_media_messages_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | GraphQLTypes["chat_media_messages_stddev_samp_order_by"]
      | undefined;
    sum?: GraphQLTypes["chat_media_messages_sum_order_by"] | undefined;
    var_pop?: GraphQLTypes["chat_media_messages_var_pop_order_by"] | undefined;
    var_samp?:
      | GraphQLTypes["chat_media_messages_var_samp_order_by"]
      | undefined;
    variance?:
      | GraphQLTypes["chat_media_messages_variance_order_by"]
      | undefined;
  };
  /** input type for inserting array relation for remote table "chat_media_messages" */
  ["chat_media_messages_arr_rel_insert_input"]: {
    data: Array<GraphQLTypes["chat_media_messages_insert_input"]>;
    /** upsert condition */
    on_conflict?: GraphQLTypes["chat_media_messages_on_conflict"] | undefined;
  };
  /** order by avg() on columns of table "chat_media_messages" */
  ["chat_media_messages_avg_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "chat_media_messages". All fields are combined with a logical 'AND'. */
  ["chat_media_messages_bool_exp"]: {
    _and?: Array<GraphQLTypes["chat_media_messages_bool_exp"]> | undefined;
    _not?: GraphQLTypes["chat_media_messages_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["chat_media_messages_bool_exp"]> | undefined;
    chat?: GraphQLTypes["chats_bool_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    media_kind?: GraphQLTypes["String_comparison_exp"] | undefined;
    media_link?: GraphQLTypes["String_comparison_exp"] | undefined;
    message_client_generated_uuid?:
      | GraphQLTypes["String_comparison_exp"]
      | undefined;
  };
  /** unique or primary key constraints on table "chat_media_messages" */
  ["chat_media_messages_constraint"]: chat_media_messages_constraint;
  /** input type for incrementing numeric columns in table "chat_media_messages" */
  ["chat_media_messages_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "chat_media_messages" */
  ["chat_media_messages_insert_input"]: {
    chat?: GraphQLTypes["chats_obj_rel_insert_input"] | undefined;
    id?: number | undefined;
    media_kind?: string | undefined;
    media_link?: string | undefined;
    message_client_generated_uuid?: string | undefined;
  };
  /** order by max() on columns of table "chat_media_messages" */
  ["chat_media_messages_max_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
    media_kind?: GraphQLTypes["order_by"] | undefined;
    media_link?: GraphQLTypes["order_by"] | undefined;
    message_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "chat_media_messages" */
  ["chat_media_messages_min_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
    media_kind?: GraphQLTypes["order_by"] | undefined;
    media_link?: GraphQLTypes["order_by"] | undefined;
    message_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "chat_media_messages" */
  ["chat_media_messages_mutation_response"]: {
    __typename: "chat_media_messages_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["chat_media_messages"]>;
  };
  /** on_conflict condition type for table "chat_media_messages" */
  ["chat_media_messages_on_conflict"]: {
    constraint: GraphQLTypes["chat_media_messages_constraint"];
    update_columns: Array<GraphQLTypes["chat_media_messages_update_column"]>;
    where?: GraphQLTypes["chat_media_messages_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "chat_media_messages". */
  ["chat_media_messages_order_by"]: {
    chat?: GraphQLTypes["chats_order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    media_kind?: GraphQLTypes["order_by"] | undefined;
    media_link?: GraphQLTypes["order_by"] | undefined;
    message_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: chat_media_messages */
  ["chat_media_messages_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "chat_media_messages" */
  ["chat_media_messages_select_column"]: chat_media_messages_select_column;
  /** input type for updating data in table "chat_media_messages" */
  ["chat_media_messages_set_input"]: {
    id?: number | undefined;
    media_kind?: string | undefined;
    media_link?: string | undefined;
    message_client_generated_uuid?: string | undefined;
  };
  /** order by stddev() on columns of table "chat_media_messages" */
  ["chat_media_messages_stddev_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "chat_media_messages" */
  ["chat_media_messages_stddev_pop_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "chat_media_messages" */
  ["chat_media_messages_stddev_samp_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "chat_media_messages" */
  ["chat_media_messages_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["chat_media_messages_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_media_messages_stream_cursor_value_input"]: {
    id?: number | undefined;
    media_kind?: string | undefined;
    media_link?: string | undefined;
    message_client_generated_uuid?: string | undefined;
  };
  /** order by sum() on columns of table "chat_media_messages" */
  ["chat_media_messages_sum_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** update columns of table "chat_media_messages" */
  ["chat_media_messages_update_column"]: chat_media_messages_update_column;
  ["chat_media_messages_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["chat_media_messages_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["chat_media_messages_set_input"] | undefined;
    where: GraphQLTypes["chat_media_messages_bool_exp"];
  };
  /** order by var_pop() on columns of table "chat_media_messages" */
  ["chat_media_messages_var_pop_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "chat_media_messages" */
  ["chat_media_messages_var_samp_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "chat_media_messages" */
  ["chat_media_messages_variance_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** columns and relationships of "chat_update_history" */
  ["chat_update_history"]: {
    __typename: "chat_update_history";
    client_generated_uuid: string;
    created_at: GraphQLTypes["timestamptz"];
    id: number;
    room: string;
    type: string;
  };
  /** Boolean expression to filter rows from the table "chat_update_history". All fields are combined with a logical 'AND'. */
  ["chat_update_history_bool_exp"]: {
    _and?: Array<GraphQLTypes["chat_update_history_bool_exp"]> | undefined;
    _not?: GraphQLTypes["chat_update_history_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["chat_update_history_bool_exp"]> | undefined;
    client_generated_uuid?: GraphQLTypes["String_comparison_exp"] | undefined;
    created_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    room?: GraphQLTypes["String_comparison_exp"] | undefined;
    type?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "chat_update_history" */
  ["chat_update_history_constraint"]: chat_update_history_constraint;
  /** input type for inserting data into table "chat_update_history" */
  ["chat_update_history_insert_input"]: {
    client_generated_uuid?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: number | undefined;
    room?: string | undefined;
    type?: string | undefined;
  };
  /** response of any mutation on the table "chat_update_history" */
  ["chat_update_history_mutation_response"]: {
    __typename: "chat_update_history_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["chat_update_history"]>;
  };
  /** on_conflict condition type for table "chat_update_history" */
  ["chat_update_history_on_conflict"]: {
    constraint: GraphQLTypes["chat_update_history_constraint"];
    update_columns: Array<GraphQLTypes["chat_update_history_update_column"]>;
    where?: GraphQLTypes["chat_update_history_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "chat_update_history". */
  ["chat_update_history_order_by"]: {
    client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    room?: GraphQLTypes["order_by"] | undefined;
    type?: GraphQLTypes["order_by"] | undefined;
  };
  /** select columns of table "chat_update_history" */
  ["chat_update_history_select_column"]: chat_update_history_select_column;
  /** Streaming cursor of the table "chat_update_history" */
  ["chat_update_history_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["chat_update_history_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_update_history_stream_cursor_value_input"]: {
    client_generated_uuid?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: number | undefined;
    room?: string | undefined;
    type?: string | undefined;
  };
  /** placeholder for update columns of table "chat_update_history" (current role has no relevant permissions) */
  ["chat_update_history_update_column"]: chat_update_history_update_column;
  /** columns and relationships of "chats" */
  ["chats"]: {
    __typename: "chats";
    /** An array relationship */
    barter_poke_metadata: Array<GraphQLTypes["barter_poke_metadata"]>;
    /** An array relationship */
    chat_barter_metadata: Array<GraphQLTypes["chat_barter_metadata"]>;
    /** An array relationship */
    chat_media_messages: Array<GraphQLTypes["chat_media_messages"]>;
    client_generated_uuid: string;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    deleted?: boolean | undefined;
    id: number;
    message: string;
    message_kind?: string | undefined;
    /** An array relationship */
    nft_sticker_metadata: Array<GraphQLTypes["nft_sticker_metadata"]>;
    parent_client_generated_uuid?: string | undefined;
    room?: string | undefined;
    /** An array relationship */
    secure_transfer_transactions: Array<
      GraphQLTypes["secure_transfer_transactions"]
    >;
    /** An array relationship */
    simple_transactions: Array<GraphQLTypes["simple_transactions"]>;
    type: string;
    username?: string | undefined;
    uuid?: string | undefined;
  };
  /** Boolean expression to filter rows from the table "chats". All fields are combined with a logical 'AND'. */
  ["chats_bool_exp"]: {
    _and?: Array<GraphQLTypes["chats_bool_exp"]> | undefined;
    _not?: GraphQLTypes["chats_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["chats_bool_exp"]> | undefined;
    barter_poke_metadata?:
      | GraphQLTypes["barter_poke_metadata_bool_exp"]
      | undefined;
    chat_barter_metadata?:
      | GraphQLTypes["chat_barter_metadata_bool_exp"]
      | undefined;
    chat_media_messages?:
      | GraphQLTypes["chat_media_messages_bool_exp"]
      | undefined;
    client_generated_uuid?: GraphQLTypes["String_comparison_exp"] | undefined;
    created_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    deleted?: GraphQLTypes["Boolean_comparison_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    message?: GraphQLTypes["String_comparison_exp"] | undefined;
    message_kind?: GraphQLTypes["String_comparison_exp"] | undefined;
    nft_sticker_metadata?:
      | GraphQLTypes["nft_sticker_metadata_bool_exp"]
      | undefined;
    parent_client_generated_uuid?:
      | GraphQLTypes["String_comparison_exp"]
      | undefined;
    room?: GraphQLTypes["String_comparison_exp"] | undefined;
    secure_transfer_transactions?:
      | GraphQLTypes["secure_transfer_transactions_bool_exp"]
      | undefined;
    simple_transactions?:
      | GraphQLTypes["simple_transactions_bool_exp"]
      | undefined;
    type?: GraphQLTypes["String_comparison_exp"] | undefined;
    username?: GraphQLTypes["String_comparison_exp"] | undefined;
    uuid?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "chats" */
  ["chats_constraint"]: chats_constraint;
  /** input type for inserting data into table "chats" */
  ["chats_insert_input"]: {
    barter_poke_metadata?:
      | GraphQLTypes["barter_poke_metadata_arr_rel_insert_input"]
      | undefined;
    chat_barter_metadata?:
      | GraphQLTypes["chat_barter_metadata_arr_rel_insert_input"]
      | undefined;
    chat_media_messages?:
      | GraphQLTypes["chat_media_messages_arr_rel_insert_input"]
      | undefined;
    client_generated_uuid?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    deleted?: boolean | undefined;
    id?: number | undefined;
    message?: string | undefined;
    message_kind?: string | undefined;
    nft_sticker_metadata?:
      | GraphQLTypes["nft_sticker_metadata_arr_rel_insert_input"]
      | undefined;
    parent_client_generated_uuid?: string | undefined;
    room?: string | undefined;
    secure_transfer_transactions?:
      | GraphQLTypes["secure_transfer_transactions_arr_rel_insert_input"]
      | undefined;
    simple_transactions?:
      | GraphQLTypes["simple_transactions_arr_rel_insert_input"]
      | undefined;
    type?: string | undefined;
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
  /** input type for inserting object relation for remote table "chats" */
  ["chats_obj_rel_insert_input"]: {
    data: GraphQLTypes["chats_insert_input"];
    /** upsert condition */
    on_conflict?: GraphQLTypes["chats_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "chats" */
  ["chats_on_conflict"]: {
    constraint: GraphQLTypes["chats_constraint"];
    update_columns: Array<GraphQLTypes["chats_update_column"]>;
    where?: GraphQLTypes["chats_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "chats". */
  ["chats_order_by"]: {
    barter_poke_metadata_aggregate?:
      | GraphQLTypes["barter_poke_metadata_aggregate_order_by"]
      | undefined;
    chat_barter_metadata_aggregate?:
      | GraphQLTypes["chat_barter_metadata_aggregate_order_by"]
      | undefined;
    chat_media_messages_aggregate?:
      | GraphQLTypes["chat_media_messages_aggregate_order_by"]
      | undefined;
    client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    deleted?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    message?: GraphQLTypes["order_by"] | undefined;
    message_kind?: GraphQLTypes["order_by"] | undefined;
    nft_sticker_metadata_aggregate?:
      | GraphQLTypes["nft_sticker_metadata_aggregate_order_by"]
      | undefined;
    parent_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
    room?: GraphQLTypes["order_by"] | undefined;
    secure_transfer_transactions_aggregate?:
      | GraphQLTypes["secure_transfer_transactions_aggregate_order_by"]
      | undefined;
    simple_transactions_aggregate?:
      | GraphQLTypes["simple_transactions_aggregate_order_by"]
      | undefined;
    type?: GraphQLTypes["order_by"] | undefined;
    username?: GraphQLTypes["order_by"] | undefined;
    uuid?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: chats */
  ["chats_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "chats" */
  ["chats_select_column"]: chats_select_column;
  /** input type for updating data in table "chats" */
  ["chats_set_input"]: {
    deleted?: boolean | undefined;
  };
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
    deleted?: boolean | undefined;
    id?: number | undefined;
    message?: string | undefined;
    message_kind?: string | undefined;
    parent_client_generated_uuid?: string | undefined;
    room?: string | undefined;
    type?: string | undefined;
    username?: string | undefined;
    uuid?: string | undefined;
  };
  /** update columns of table "chats" */
  ["chats_update_column"]: chats_update_column;
  ["chats_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["chats_set_input"] | undefined;
    where: GraphQLTypes["chats_bool_exp"];
  };
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** mutation root */
  ["mutation_root"]: {
    __typename: "mutation_root";
    /** delete data from the table: "room_active_chat_mapping" */
    delete_room_active_chat_mapping?:
      | GraphQLTypes["room_active_chat_mapping_mutation_response"]
      | undefined;
    /** delete single row from the table: "room_active_chat_mapping" */
    delete_room_active_chat_mapping_by_pk?:
      | GraphQLTypes["room_active_chat_mapping"]
      | undefined;
    /** insert data into the table: "barter_poke_metadata" */
    insert_barter_poke_metadata?:
      | GraphQLTypes["barter_poke_metadata_mutation_response"]
      | undefined;
    /** insert a single row into the table: "barter_poke_metadata" */
    insert_barter_poke_metadata_one?:
      | GraphQLTypes["barter_poke_metadata"]
      | undefined;
    /** insert data into the table: "barters" */
    insert_barters?: GraphQLTypes["barters_mutation_response"] | undefined;
    /** insert a single row into the table: "barters" */
    insert_barters_one?: GraphQLTypes["barters"] | undefined;
    /** insert data into the table: "chat_barter_metadata" */
    insert_chat_barter_metadata?:
      | GraphQLTypes["chat_barter_metadata_mutation_response"]
      | undefined;
    /** insert a single row into the table: "chat_barter_metadata" */
    insert_chat_barter_metadata_one?:
      | GraphQLTypes["chat_barter_metadata"]
      | undefined;
    /** insert data into the table: "chat_media_messages" */
    insert_chat_media_messages?:
      | GraphQLTypes["chat_media_messages_mutation_response"]
      | undefined;
    /** insert a single row into the table: "chat_media_messages" */
    insert_chat_media_messages_one?:
      | GraphQLTypes["chat_media_messages"]
      | undefined;
    /** insert data into the table: "chat_update_history" */
    insert_chat_update_history?:
      | GraphQLTypes["chat_update_history_mutation_response"]
      | undefined;
    /** insert a single row into the table: "chat_update_history" */
    insert_chat_update_history_one?:
      | GraphQLTypes["chat_update_history"]
      | undefined;
    /** insert data into the table: "chats" */
    insert_chats?: GraphQLTypes["chats_mutation_response"] | undefined;
    /** insert a single row into the table: "chats" */
    insert_chats_one?: GraphQLTypes["chats"] | undefined;
    /** insert data into the table: "nft_sticker_metadata" */
    insert_nft_sticker_metadata?:
      | GraphQLTypes["nft_sticker_metadata_mutation_response"]
      | undefined;
    /** insert a single row into the table: "nft_sticker_metadata" */
    insert_nft_sticker_metadata_one?:
      | GraphQLTypes["nft_sticker_metadata"]
      | undefined;
    /** insert data into the table: "room_active_chat_mapping" */
    insert_room_active_chat_mapping?:
      | GraphQLTypes["room_active_chat_mapping_mutation_response"]
      | undefined;
    /** insert a single row into the table: "room_active_chat_mapping" */
    insert_room_active_chat_mapping_one?:
      | GraphQLTypes["room_active_chat_mapping"]
      | undefined;
    /** insert data into the table: "secure_transfer_transactions" */
    insert_secure_transfer_transactions?:
      | GraphQLTypes["secure_transfer_transactions_mutation_response"]
      | undefined;
    /** insert a single row into the table: "secure_transfer_transactions" */
    insert_secure_transfer_transactions_one?:
      | GraphQLTypes["secure_transfer_transactions"]
      | undefined;
    /** insert data into the table: "simple_transactions" */
    insert_simple_transactions?:
      | GraphQLTypes["simple_transactions_mutation_response"]
      | undefined;
    /** insert a single row into the table: "simple_transactions" */
    insert_simple_transactions_one?:
      | GraphQLTypes["simple_transactions"]
      | undefined;
    /** update data of the table: "barter_poke_metadata" */
    update_barter_poke_metadata?:
      | GraphQLTypes["barter_poke_metadata_mutation_response"]
      | undefined;
    /** update single row of the table: "barter_poke_metadata" */
    update_barter_poke_metadata_by_pk?:
      | GraphQLTypes["barter_poke_metadata"]
      | undefined;
    /** update multiples rows of table: "barter_poke_metadata" */
    update_barter_poke_metadata_many?:
      | Array<
          GraphQLTypes["barter_poke_metadata_mutation_response"] | undefined
        >
      | undefined;
    /** update data of the table: "barters" */
    update_barters?: GraphQLTypes["barters_mutation_response"] | undefined;
    /** update single row of the table: "barters" */
    update_barters_by_pk?: GraphQLTypes["barters"] | undefined;
    /** update multiples rows of table: "barters" */
    update_barters_many?:
      | Array<GraphQLTypes["barters_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "chat_barter_metadata" */
    update_chat_barter_metadata?:
      | GraphQLTypes["chat_barter_metadata_mutation_response"]
      | undefined;
    /** update multiples rows of table: "chat_barter_metadata" */
    update_chat_barter_metadata_many?:
      | Array<
          GraphQLTypes["chat_barter_metadata_mutation_response"] | undefined
        >
      | undefined;
    /** update data of the table: "chat_media_messages" */
    update_chat_media_messages?:
      | GraphQLTypes["chat_media_messages_mutation_response"]
      | undefined;
    /** update single row of the table: "chat_media_messages" */
    update_chat_media_messages_by_pk?:
      | GraphQLTypes["chat_media_messages"]
      | undefined;
    /** update multiples rows of table: "chat_media_messages" */
    update_chat_media_messages_many?:
      | Array<GraphQLTypes["chat_media_messages_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "chats" */
    update_chats?: GraphQLTypes["chats_mutation_response"] | undefined;
    /** update single row of the table: "chats" */
    update_chats_by_pk?: GraphQLTypes["chats"] | undefined;
    /** update multiples rows of table: "chats" */
    update_chats_many?:
      | Array<GraphQLTypes["chats_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "nft_sticker_metadata" */
    update_nft_sticker_metadata?:
      | GraphQLTypes["nft_sticker_metadata_mutation_response"]
      | undefined;
    /** update single row of the table: "nft_sticker_metadata" */
    update_nft_sticker_metadata_by_pk?:
      | GraphQLTypes["nft_sticker_metadata"]
      | undefined;
    /** update multiples rows of table: "nft_sticker_metadata" */
    update_nft_sticker_metadata_many?:
      | Array<
          GraphQLTypes["nft_sticker_metadata_mutation_response"] | undefined
        >
      | undefined;
    /** update data of the table: "room_active_chat_mapping" */
    update_room_active_chat_mapping?:
      | GraphQLTypes["room_active_chat_mapping_mutation_response"]
      | undefined;
    /** update single row of the table: "room_active_chat_mapping" */
    update_room_active_chat_mapping_by_pk?:
      | GraphQLTypes["room_active_chat_mapping"]
      | undefined;
    /** update multiples rows of table: "room_active_chat_mapping" */
    update_room_active_chat_mapping_many?:
      | Array<
          GraphQLTypes["room_active_chat_mapping_mutation_response"] | undefined
        >
      | undefined;
    /** update data of the table: "secure_transfer_transactions" */
    update_secure_transfer_transactions?:
      | GraphQLTypes["secure_transfer_transactions_mutation_response"]
      | undefined;
    /** update single row of the table: "secure_transfer_transactions" */
    update_secure_transfer_transactions_by_pk?:
      | GraphQLTypes["secure_transfer_transactions"]
      | undefined;
    /** update multiples rows of table: "secure_transfer_transactions" */
    update_secure_transfer_transactions_many?:
      | Array<
          | GraphQLTypes["secure_transfer_transactions_mutation_response"]
          | undefined
        >
      | undefined;
    /** update data of the table: "simple_transactions" */
    update_simple_transactions?:
      | GraphQLTypes["simple_transactions_mutation_response"]
      | undefined;
    /** update single row of the table: "simple_transactions" */
    update_simple_transactions_by_pk?:
      | GraphQLTypes["simple_transactions"]
      | undefined;
    /** update multiples rows of table: "simple_transactions" */
    update_simple_transactions_many?:
      | Array<GraphQLTypes["simple_transactions_mutation_response"] | undefined>
      | undefined;
  };
  /** columns and relationships of "nft_sticker_metadata" */
  ["nft_sticker_metadata"]: {
    __typename: "nft_sticker_metadata";
    /** An object relationship */
    chat: GraphQLTypes["chats"];
    chat_client_generated_uuid: string;
    id: number;
    mint: string;
  };
  /** order by aggregate values of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_aggregate_order_by"]: {
    avg?: GraphQLTypes["nft_sticker_metadata_avg_order_by"] | undefined;
    count?: GraphQLTypes["order_by"] | undefined;
    max?: GraphQLTypes["nft_sticker_metadata_max_order_by"] | undefined;
    min?: GraphQLTypes["nft_sticker_metadata_min_order_by"] | undefined;
    stddev?: GraphQLTypes["nft_sticker_metadata_stddev_order_by"] | undefined;
    stddev_pop?:
      | GraphQLTypes["nft_sticker_metadata_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | GraphQLTypes["nft_sticker_metadata_stddev_samp_order_by"]
      | undefined;
    sum?: GraphQLTypes["nft_sticker_metadata_sum_order_by"] | undefined;
    var_pop?: GraphQLTypes["nft_sticker_metadata_var_pop_order_by"] | undefined;
    var_samp?:
      | GraphQLTypes["nft_sticker_metadata_var_samp_order_by"]
      | undefined;
    variance?:
      | GraphQLTypes["nft_sticker_metadata_variance_order_by"]
      | undefined;
  };
  /** input type for inserting array relation for remote table "nft_sticker_metadata" */
  ["nft_sticker_metadata_arr_rel_insert_input"]: {
    data: Array<GraphQLTypes["nft_sticker_metadata_insert_input"]>;
    /** upsert condition */
    on_conflict?: GraphQLTypes["nft_sticker_metadata_on_conflict"] | undefined;
  };
  /** order by avg() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_avg_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "nft_sticker_metadata". All fields are combined with a logical 'AND'. */
  ["nft_sticker_metadata_bool_exp"]: {
    _and?: Array<GraphQLTypes["nft_sticker_metadata_bool_exp"]> | undefined;
    _not?: GraphQLTypes["nft_sticker_metadata_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["nft_sticker_metadata_bool_exp"]> | undefined;
    chat?: GraphQLTypes["chats_bool_exp"] | undefined;
    chat_client_generated_uuid?:
      | GraphQLTypes["String_comparison_exp"]
      | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    mint?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "nft_sticker_metadata" */
  ["nft_sticker_metadata_constraint"]: nft_sticker_metadata_constraint;
  /** input type for incrementing numeric columns in table "nft_sticker_metadata" */
  ["nft_sticker_metadata_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "nft_sticker_metadata" */
  ["nft_sticker_metadata_insert_input"]: {
    chat?: GraphQLTypes["chats_obj_rel_insert_input"] | undefined;
    chat_client_generated_uuid?: string | undefined;
    id?: number | undefined;
    mint?: string | undefined;
  };
  /** order by max() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_max_order_by"]: {
    chat_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    mint?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_min_order_by"]: {
    chat_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    mint?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "nft_sticker_metadata" */
  ["nft_sticker_metadata_mutation_response"]: {
    __typename: "nft_sticker_metadata_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["nft_sticker_metadata"]>;
  };
  /** on_conflict condition type for table "nft_sticker_metadata" */
  ["nft_sticker_metadata_on_conflict"]: {
    constraint: GraphQLTypes["nft_sticker_metadata_constraint"];
    update_columns: Array<GraphQLTypes["nft_sticker_metadata_update_column"]>;
    where?: GraphQLTypes["nft_sticker_metadata_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "nft_sticker_metadata". */
  ["nft_sticker_metadata_order_by"]: {
    chat?: GraphQLTypes["chats_order_by"] | undefined;
    chat_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    mint?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: nft_sticker_metadata */
  ["nft_sticker_metadata_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_select_column"]: nft_sticker_metadata_select_column;
  /** input type for updating data in table "nft_sticker_metadata" */
  ["nft_sticker_metadata_set_input"]: {
    chat_client_generated_uuid?: string | undefined;
    id?: number | undefined;
    mint?: string | undefined;
  };
  /** order by stddev() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stddev_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stddev_pop_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stddev_samp_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "nft_sticker_metadata" */
  ["nft_sticker_metadata_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["nft_sticker_metadata_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["nft_sticker_metadata_stream_cursor_value_input"]: {
    chat_client_generated_uuid?: string | undefined;
    id?: number | undefined;
    mint?: string | undefined;
  };
  /** order by sum() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_sum_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** update columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_update_column"]: nft_sticker_metadata_update_column;
  ["nft_sticker_metadata_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["nft_sticker_metadata_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["nft_sticker_metadata_set_input"] | undefined;
    where: GraphQLTypes["nft_sticker_metadata_bool_exp"];
  };
  /** order by var_pop() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_var_pop_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_var_samp_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "nft_sticker_metadata" */
  ["nft_sticker_metadata_variance_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: {
    __typename: "query_root";
    /** An array relationship */
    barter_poke_metadata: Array<GraphQLTypes["barter_poke_metadata"]>;
    /** fetch data from the table: "barter_poke_metadata" using primary key columns */
    barter_poke_metadata_by_pk?:
      | GraphQLTypes["barter_poke_metadata"]
      | undefined;
    /** fetch data from the table: "barters" */
    barters: Array<GraphQLTypes["barters"]>;
    /** fetch data from the table: "barters" using primary key columns */
    barters_by_pk?: GraphQLTypes["barters"] | undefined;
    /** An array relationship */
    chat_barter_metadata: Array<GraphQLTypes["chat_barter_metadata"]>;
    /** An array relationship */
    chat_media_messages: Array<GraphQLTypes["chat_media_messages"]>;
    /** fetch data from the table: "chat_media_messages" using primary key columns */
    chat_media_messages_by_pk?: GraphQLTypes["chat_media_messages"] | undefined;
    /** fetch data from the table: "chat_update_history" */
    chat_update_history: Array<GraphQLTypes["chat_update_history"]>;
    /** fetch data from the table: "chat_update_history" using primary key columns */
    chat_update_history_by_pk?: GraphQLTypes["chat_update_history"] | undefined;
    /** fetch data from the table: "chats" */
    chats: Array<GraphQLTypes["chats"]>;
    /** fetch data from the table: "chats" using primary key columns */
    chats_by_pk?: GraphQLTypes["chats"] | undefined;
    /** An array relationship */
    nft_sticker_metadata: Array<GraphQLTypes["nft_sticker_metadata"]>;
    /** fetch data from the table: "nft_sticker_metadata" using primary key columns */
    nft_sticker_metadata_by_pk?:
      | GraphQLTypes["nft_sticker_metadata"]
      | undefined;
    /** fetch data from the table: "room_active_chat_mapping" */
    room_active_chat_mapping: Array<GraphQLTypes["room_active_chat_mapping"]>;
    /** fetch data from the table: "room_active_chat_mapping" using primary key columns */
    room_active_chat_mapping_by_pk?:
      | GraphQLTypes["room_active_chat_mapping"]
      | undefined;
    /** An array relationship */
    secure_transfer_transactions: Array<
      GraphQLTypes["secure_transfer_transactions"]
    >;
    /** fetch data from the table: "secure_transfer_transactions" using primary key columns */
    secure_transfer_transactions_by_pk?:
      | GraphQLTypes["secure_transfer_transactions"]
      | undefined;
    /** An array relationship */
    simple_transactions: Array<GraphQLTypes["simple_transactions"]>;
    /** fetch data from the table: "simple_transactions" using primary key columns */
    simple_transactions_by_pk?: GraphQLTypes["simple_transactions"] | undefined;
  };
  /** columns and relationships of "room_active_chat_mapping" */
  ["room_active_chat_mapping"]: {
    __typename: "room_active_chat_mapping";
    /** An object relationship */
    barter: GraphQLTypes["barters"];
    barter_id: number;
    room_id: string;
  };
  /** order by aggregate values of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_aggregate_order_by"]: {
    avg?: GraphQLTypes["room_active_chat_mapping_avg_order_by"] | undefined;
    count?: GraphQLTypes["order_by"] | undefined;
    max?: GraphQLTypes["room_active_chat_mapping_max_order_by"] | undefined;
    min?: GraphQLTypes["room_active_chat_mapping_min_order_by"] | undefined;
    stddev?:
      | GraphQLTypes["room_active_chat_mapping_stddev_order_by"]
      | undefined;
    stddev_pop?:
      | GraphQLTypes["room_active_chat_mapping_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | GraphQLTypes["room_active_chat_mapping_stddev_samp_order_by"]
      | undefined;
    sum?: GraphQLTypes["room_active_chat_mapping_sum_order_by"] | undefined;
    var_pop?:
      | GraphQLTypes["room_active_chat_mapping_var_pop_order_by"]
      | undefined;
    var_samp?:
      | GraphQLTypes["room_active_chat_mapping_var_samp_order_by"]
      | undefined;
    variance?:
      | GraphQLTypes["room_active_chat_mapping_variance_order_by"]
      | undefined;
  };
  /** input type for inserting array relation for remote table "room_active_chat_mapping" */
  ["room_active_chat_mapping_arr_rel_insert_input"]: {
    data: Array<GraphQLTypes["room_active_chat_mapping_insert_input"]>;
    /** upsert condition */
    on_conflict?:
      | GraphQLTypes["room_active_chat_mapping_on_conflict"]
      | undefined;
  };
  /** order by avg() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_avg_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "room_active_chat_mapping". All fields are combined with a logical 'AND'. */
  ["room_active_chat_mapping_bool_exp"]: {
    _and?: Array<GraphQLTypes["room_active_chat_mapping_bool_exp"]> | undefined;
    _not?: GraphQLTypes["room_active_chat_mapping_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["room_active_chat_mapping_bool_exp"]> | undefined;
    barter?: GraphQLTypes["barters_bool_exp"] | undefined;
    barter_id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    room_id?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "room_active_chat_mapping" */
  ["room_active_chat_mapping_constraint"]: room_active_chat_mapping_constraint;
  /** input type for incrementing numeric columns in table "room_active_chat_mapping" */
  ["room_active_chat_mapping_inc_input"]: {
    barter_id?: number | undefined;
  };
  /** input type for inserting data into table "room_active_chat_mapping" */
  ["room_active_chat_mapping_insert_input"]: {
    barter?: GraphQLTypes["barters_obj_rel_insert_input"] | undefined;
    barter_id?: number | undefined;
    room_id?: string | undefined;
  };
  /** order by max() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_max_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
    room_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_min_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
    room_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "room_active_chat_mapping" */
  ["room_active_chat_mapping_mutation_response"]: {
    __typename: "room_active_chat_mapping_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["room_active_chat_mapping"]>;
  };
  /** on_conflict condition type for table "room_active_chat_mapping" */
  ["room_active_chat_mapping_on_conflict"]: {
    constraint: GraphQLTypes["room_active_chat_mapping_constraint"];
    update_columns: Array<
      GraphQLTypes["room_active_chat_mapping_update_column"]
    >;
    where?: GraphQLTypes["room_active_chat_mapping_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "room_active_chat_mapping". */
  ["room_active_chat_mapping_order_by"]: {
    barter?: GraphQLTypes["barters_order_by"] | undefined;
    barter_id?: GraphQLTypes["order_by"] | undefined;
    room_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: room_active_chat_mapping */
  ["room_active_chat_mapping_pk_columns_input"]: {
    room_id: string;
  };
  /** select columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_select_column"]: room_active_chat_mapping_select_column;
  /** input type for updating data in table "room_active_chat_mapping" */
  ["room_active_chat_mapping_set_input"]: {
    barter_id?: number | undefined;
    room_id?: string | undefined;
  };
  /** order by stddev() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stddev_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stddev_pop_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stddev_samp_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "room_active_chat_mapping" */
  ["room_active_chat_mapping_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["room_active_chat_mapping_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["room_active_chat_mapping_stream_cursor_value_input"]: {
    barter_id?: number | undefined;
    room_id?: string | undefined;
  };
  /** order by sum() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_sum_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** update columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_update_column"]: room_active_chat_mapping_update_column;
  ["room_active_chat_mapping_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["room_active_chat_mapping_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["room_active_chat_mapping_set_input"] | undefined;
    where: GraphQLTypes["room_active_chat_mapping_bool_exp"];
  };
  /** order by var_pop() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_var_pop_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_var_samp_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "room_active_chat_mapping" */
  ["room_active_chat_mapping_variance_order_by"]: {
    barter_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** columns and relationships of "secure_transfer_transactions" */
  ["secure_transfer_transactions"]: {
    __typename: "secure_transfer_transactions";
    /** An object relationship */
    chat?: GraphQLTypes["chats"] | undefined;
    counter: string;
    current_state?: string | undefined;
    escrow: string;
    final_txn_signature?: string | undefined;
    from: string;
    id: number;
    message_client_generated_uuid?: string | undefined;
    message_id: number;
    signature?: string | undefined;
    to: string;
  };
  /** order by aggregate values of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_aggregate_order_by"]: {
    avg?: GraphQLTypes["secure_transfer_transactions_avg_order_by"] | undefined;
    count?: GraphQLTypes["order_by"] | undefined;
    max?: GraphQLTypes["secure_transfer_transactions_max_order_by"] | undefined;
    min?: GraphQLTypes["secure_transfer_transactions_min_order_by"] | undefined;
    stddev?:
      | GraphQLTypes["secure_transfer_transactions_stddev_order_by"]
      | undefined;
    stddev_pop?:
      | GraphQLTypes["secure_transfer_transactions_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | GraphQLTypes["secure_transfer_transactions_stddev_samp_order_by"]
      | undefined;
    sum?: GraphQLTypes["secure_transfer_transactions_sum_order_by"] | undefined;
    var_pop?:
      | GraphQLTypes["secure_transfer_transactions_var_pop_order_by"]
      | undefined;
    var_samp?:
      | GraphQLTypes["secure_transfer_transactions_var_samp_order_by"]
      | undefined;
    variance?:
      | GraphQLTypes["secure_transfer_transactions_variance_order_by"]
      | undefined;
  };
  /** input type for inserting array relation for remote table "secure_transfer_transactions" */
  ["secure_transfer_transactions_arr_rel_insert_input"]: {
    data: Array<GraphQLTypes["secure_transfer_transactions_insert_input"]>;
    /** upsert condition */
    on_conflict?:
      | GraphQLTypes["secure_transfer_transactions_on_conflict"]
      | undefined;
  };
  /** order by avg() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_avg_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
    message_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "secure_transfer_transactions". All fields are combined with a logical 'AND'. */
  ["secure_transfer_transactions_bool_exp"]: {
    _and?:
      | Array<GraphQLTypes["secure_transfer_transactions_bool_exp"]>
      | undefined;
    _not?: GraphQLTypes["secure_transfer_transactions_bool_exp"] | undefined;
    _or?:
      | Array<GraphQLTypes["secure_transfer_transactions_bool_exp"]>
      | undefined;
    chat?: GraphQLTypes["chats_bool_exp"] | undefined;
    counter?: GraphQLTypes["String_comparison_exp"] | undefined;
    current_state?: GraphQLTypes["String_comparison_exp"] | undefined;
    escrow?: GraphQLTypes["String_comparison_exp"] | undefined;
    final_txn_signature?: GraphQLTypes["String_comparison_exp"] | undefined;
    from?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    message_client_generated_uuid?:
      | GraphQLTypes["String_comparison_exp"]
      | undefined;
    message_id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    signature?: GraphQLTypes["String_comparison_exp"] | undefined;
    to?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "secure_transfer_transactions" */
  ["secure_transfer_transactions_constraint"]: secure_transfer_transactions_constraint;
  /** input type for incrementing numeric columns in table "secure_transfer_transactions" */
  ["secure_transfer_transactions_inc_input"]: {
    id?: number | undefined;
    message_id?: number | undefined;
  };
  /** input type for inserting data into table "secure_transfer_transactions" */
  ["secure_transfer_transactions_insert_input"]: {
    chat?: GraphQLTypes["chats_obj_rel_insert_input"] | undefined;
    counter?: string | undefined;
    current_state?: string | undefined;
    escrow?: string | undefined;
    final_txn_signature?: string | undefined;
    from?: string | undefined;
    id?: number | undefined;
    message_client_generated_uuid?: string | undefined;
    message_id?: number | undefined;
    signature?: string | undefined;
    to?: string | undefined;
  };
  /** order by max() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_max_order_by"]: {
    counter?: GraphQLTypes["order_by"] | undefined;
    current_state?: GraphQLTypes["order_by"] | undefined;
    escrow?: GraphQLTypes["order_by"] | undefined;
    final_txn_signature?: GraphQLTypes["order_by"] | undefined;
    from?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    message_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
    message_id?: GraphQLTypes["order_by"] | undefined;
    signature?: GraphQLTypes["order_by"] | undefined;
    to?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_min_order_by"]: {
    counter?: GraphQLTypes["order_by"] | undefined;
    current_state?: GraphQLTypes["order_by"] | undefined;
    escrow?: GraphQLTypes["order_by"] | undefined;
    final_txn_signature?: GraphQLTypes["order_by"] | undefined;
    from?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    message_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
    message_id?: GraphQLTypes["order_by"] | undefined;
    signature?: GraphQLTypes["order_by"] | undefined;
    to?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "secure_transfer_transactions" */
  ["secure_transfer_transactions_mutation_response"]: {
    __typename: "secure_transfer_transactions_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["secure_transfer_transactions"]>;
  };
  /** on_conflict condition type for table "secure_transfer_transactions" */
  ["secure_transfer_transactions_on_conflict"]: {
    constraint: GraphQLTypes["secure_transfer_transactions_constraint"];
    update_columns: Array<
      GraphQLTypes["secure_transfer_transactions_update_column"]
    >;
    where?: GraphQLTypes["secure_transfer_transactions_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "secure_transfer_transactions". */
  ["secure_transfer_transactions_order_by"]: {
    chat?: GraphQLTypes["chats_order_by"] | undefined;
    counter?: GraphQLTypes["order_by"] | undefined;
    current_state?: GraphQLTypes["order_by"] | undefined;
    escrow?: GraphQLTypes["order_by"] | undefined;
    final_txn_signature?: GraphQLTypes["order_by"] | undefined;
    from?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    message_client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
    message_id?: GraphQLTypes["order_by"] | undefined;
    signature?: GraphQLTypes["order_by"] | undefined;
    to?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: secure_transfer_transactions */
  ["secure_transfer_transactions_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_select_column"]: secure_transfer_transactions_select_column;
  /** input type for updating data in table "secure_transfer_transactions" */
  ["secure_transfer_transactions_set_input"]: {
    counter?: string | undefined;
    current_state?: string | undefined;
    escrow?: string | undefined;
    final_txn_signature?: string | undefined;
    from?: string | undefined;
    id?: number | undefined;
    message_client_generated_uuid?: string | undefined;
    message_id?: number | undefined;
    signature?: string | undefined;
    to?: string | undefined;
  };
  /** order by stddev() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stddev_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
    message_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stddev_pop_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
    message_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stddev_samp_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
    message_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "secure_transfer_transactions" */
  ["secure_transfer_transactions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["secure_transfer_transactions_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["secure_transfer_transactions_stream_cursor_value_input"]: {
    counter?: string | undefined;
    current_state?: string | undefined;
    escrow?: string | undefined;
    final_txn_signature?: string | undefined;
    from?: string | undefined;
    id?: number | undefined;
    message_client_generated_uuid?: string | undefined;
    message_id?: number | undefined;
    signature?: string | undefined;
    to?: string | undefined;
  };
  /** order by sum() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_sum_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
    message_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** update columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_update_column"]: secure_transfer_transactions_update_column;
  ["secure_transfer_transactions_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["secure_transfer_transactions_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["secure_transfer_transactions_set_input"] | undefined;
    where: GraphQLTypes["secure_transfer_transactions_bool_exp"];
  };
  /** order by var_pop() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_var_pop_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
    message_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_var_samp_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
    message_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "secure_transfer_transactions" */
  ["secure_transfer_transactions_variance_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
    message_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** columns and relationships of "simple_transactions" */
  ["simple_transactions"]: {
    __typename: "simple_transactions";
    client_generated_uuid: string;
    id: number;
    txn_signature: string;
  };
  /** order by aggregate values of table "simple_transactions" */
  ["simple_transactions_aggregate_order_by"]: {
    avg?: GraphQLTypes["simple_transactions_avg_order_by"] | undefined;
    count?: GraphQLTypes["order_by"] | undefined;
    max?: GraphQLTypes["simple_transactions_max_order_by"] | undefined;
    min?: GraphQLTypes["simple_transactions_min_order_by"] | undefined;
    stddev?: GraphQLTypes["simple_transactions_stddev_order_by"] | undefined;
    stddev_pop?:
      | GraphQLTypes["simple_transactions_stddev_pop_order_by"]
      | undefined;
    stddev_samp?:
      | GraphQLTypes["simple_transactions_stddev_samp_order_by"]
      | undefined;
    sum?: GraphQLTypes["simple_transactions_sum_order_by"] | undefined;
    var_pop?: GraphQLTypes["simple_transactions_var_pop_order_by"] | undefined;
    var_samp?:
      | GraphQLTypes["simple_transactions_var_samp_order_by"]
      | undefined;
    variance?:
      | GraphQLTypes["simple_transactions_variance_order_by"]
      | undefined;
  };
  /** input type for inserting array relation for remote table "simple_transactions" */
  ["simple_transactions_arr_rel_insert_input"]: {
    data: Array<GraphQLTypes["simple_transactions_insert_input"]>;
    /** upsert condition */
    on_conflict?: GraphQLTypes["simple_transactions_on_conflict"] | undefined;
  };
  /** order by avg() on columns of table "simple_transactions" */
  ["simple_transactions_avg_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "simple_transactions". All fields are combined with a logical 'AND'. */
  ["simple_transactions_bool_exp"]: {
    _and?: Array<GraphQLTypes["simple_transactions_bool_exp"]> | undefined;
    _not?: GraphQLTypes["simple_transactions_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["simple_transactions_bool_exp"]> | undefined;
    client_generated_uuid?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["Int_comparison_exp"] | undefined;
    txn_signature?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "simple_transactions" */
  ["simple_transactions_constraint"]: simple_transactions_constraint;
  /** input type for incrementing numeric columns in table "simple_transactions" */
  ["simple_transactions_inc_input"]: {
    id?: number | undefined;
  };
  /** input type for inserting data into table "simple_transactions" */
  ["simple_transactions_insert_input"]: {
    client_generated_uuid?: string | undefined;
    id?: number | undefined;
    txn_signature?: string | undefined;
  };
  /** order by max() on columns of table "simple_transactions" */
  ["simple_transactions_max_order_by"]: {
    client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    txn_signature?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by min() on columns of table "simple_transactions" */
  ["simple_transactions_min_order_by"]: {
    client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    txn_signature?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "simple_transactions" */
  ["simple_transactions_mutation_response"]: {
    __typename: "simple_transactions_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["simple_transactions"]>;
  };
  /** on_conflict condition type for table "simple_transactions" */
  ["simple_transactions_on_conflict"]: {
    constraint: GraphQLTypes["simple_transactions_constraint"];
    update_columns: Array<GraphQLTypes["simple_transactions_update_column"]>;
    where?: GraphQLTypes["simple_transactions_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "simple_transactions". */
  ["simple_transactions_order_by"]: {
    client_generated_uuid?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    txn_signature?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: simple_transactions */
  ["simple_transactions_pk_columns_input"]: {
    id: number;
  };
  /** select columns of table "simple_transactions" */
  ["simple_transactions_select_column"]: simple_transactions_select_column;
  /** input type for updating data in table "simple_transactions" */
  ["simple_transactions_set_input"]: {
    client_generated_uuid?: string | undefined;
    id?: number | undefined;
    txn_signature?: string | undefined;
  };
  /** order by stddev() on columns of table "simple_transactions" */
  ["simple_transactions_stddev_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_pop() on columns of table "simple_transactions" */
  ["simple_transactions_stddev_pop_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by stddev_samp() on columns of table "simple_transactions" */
  ["simple_transactions_stddev_samp_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "simple_transactions" */
  ["simple_transactions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["simple_transactions_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["simple_transactions_stream_cursor_value_input"]: {
    client_generated_uuid?: string | undefined;
    id?: number | undefined;
    txn_signature?: string | undefined;
  };
  /** order by sum() on columns of table "simple_transactions" */
  ["simple_transactions_sum_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** update columns of table "simple_transactions" */
  ["simple_transactions_update_column"]: simple_transactions_update_column;
  ["simple_transactions_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["simple_transactions_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["simple_transactions_set_input"] | undefined;
    where: GraphQLTypes["simple_transactions_bool_exp"];
  };
  /** order by var_pop() on columns of table "simple_transactions" */
  ["simple_transactions_var_pop_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by var_samp() on columns of table "simple_transactions" */
  ["simple_transactions_var_samp_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  /** order by variance() on columns of table "simple_transactions" */
  ["simple_transactions_variance_order_by"]: {
    id?: GraphQLTypes["order_by"] | undefined;
  };
  ["subscription_root"]: {
    __typename: "subscription_root";
    /** An array relationship */
    barter_poke_metadata: Array<GraphQLTypes["barter_poke_metadata"]>;
    /** fetch data from the table: "barter_poke_metadata" using primary key columns */
    barter_poke_metadata_by_pk?:
      | GraphQLTypes["barter_poke_metadata"]
      | undefined;
    /** fetch data from the table in a streaming manner: "barter_poke_metadata" */
    barter_poke_metadata_stream: Array<GraphQLTypes["barter_poke_metadata"]>;
    /** fetch data from the table: "barters" */
    barters: Array<GraphQLTypes["barters"]>;
    /** fetch data from the table: "barters" using primary key columns */
    barters_by_pk?: GraphQLTypes["barters"] | undefined;
    /** fetch data from the table in a streaming manner: "barters" */
    barters_stream: Array<GraphQLTypes["barters"]>;
    /** An array relationship */
    chat_barter_metadata: Array<GraphQLTypes["chat_barter_metadata"]>;
    /** fetch data from the table in a streaming manner: "chat_barter_metadata" */
    chat_barter_metadata_stream: Array<GraphQLTypes["chat_barter_metadata"]>;
    /** An array relationship */
    chat_media_messages: Array<GraphQLTypes["chat_media_messages"]>;
    /** fetch data from the table: "chat_media_messages" using primary key columns */
    chat_media_messages_by_pk?: GraphQLTypes["chat_media_messages"] | undefined;
    /** fetch data from the table in a streaming manner: "chat_media_messages" */
    chat_media_messages_stream: Array<GraphQLTypes["chat_media_messages"]>;
    /** fetch data from the table: "chat_update_history" */
    chat_update_history: Array<GraphQLTypes["chat_update_history"]>;
    /** fetch data from the table: "chat_update_history" using primary key columns */
    chat_update_history_by_pk?: GraphQLTypes["chat_update_history"] | undefined;
    /** fetch data from the table in a streaming manner: "chat_update_history" */
    chat_update_history_stream: Array<GraphQLTypes["chat_update_history"]>;
    /** fetch data from the table: "chats" */
    chats: Array<GraphQLTypes["chats"]>;
    /** fetch data from the table: "chats" using primary key columns */
    chats_by_pk?: GraphQLTypes["chats"] | undefined;
    /** fetch data from the table in a streaming manner: "chats" */
    chats_stream: Array<GraphQLTypes["chats"]>;
    /** An array relationship */
    nft_sticker_metadata: Array<GraphQLTypes["nft_sticker_metadata"]>;
    /** fetch data from the table: "nft_sticker_metadata" using primary key columns */
    nft_sticker_metadata_by_pk?:
      | GraphQLTypes["nft_sticker_metadata"]
      | undefined;
    /** fetch data from the table in a streaming manner: "nft_sticker_metadata" */
    nft_sticker_metadata_stream: Array<GraphQLTypes["nft_sticker_metadata"]>;
    /** fetch data from the table: "room_active_chat_mapping" */
    room_active_chat_mapping: Array<GraphQLTypes["room_active_chat_mapping"]>;
    /** fetch data from the table: "room_active_chat_mapping" using primary key columns */
    room_active_chat_mapping_by_pk?:
      | GraphQLTypes["room_active_chat_mapping"]
      | undefined;
    /** fetch data from the table in a streaming manner: "room_active_chat_mapping" */
    room_active_chat_mapping_stream: Array<
      GraphQLTypes["room_active_chat_mapping"]
    >;
    /** An array relationship */
    secure_transfer_transactions: Array<
      GraphQLTypes["secure_transfer_transactions"]
    >;
    /** fetch data from the table: "secure_transfer_transactions" using primary key columns */
    secure_transfer_transactions_by_pk?:
      | GraphQLTypes["secure_transfer_transactions"]
      | undefined;
    /** fetch data from the table in a streaming manner: "secure_transfer_transactions" */
    secure_transfer_transactions_stream: Array<
      GraphQLTypes["secure_transfer_transactions"]
    >;
    /** An array relationship */
    simple_transactions: Array<GraphQLTypes["simple_transactions"]>;
    /** fetch data from the table: "simple_transactions" using primary key columns */
    simple_transactions_by_pk?: GraphQLTypes["simple_transactions"] | undefined;
    /** fetch data from the table in a streaming manner: "simple_transactions" */
    simple_transactions_stream: Array<GraphQLTypes["simple_transactions"]>;
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
/** unique or primary key constraints on table "barter_poke_metadata" */
export const enum barter_poke_metadata_constraint {
  barter_poke_metadata_pkey = "barter_poke_metadata_pkey",
}
/** select columns of table "barter_poke_metadata" */
export const enum barter_poke_metadata_select_column {
  barter_id = "barter_id",
  id = "id",
  message_client_generated_uuid = "message_client_generated_uuid",
}
/** update columns of table "barter_poke_metadata" */
export const enum barter_poke_metadata_update_column {
  barter_id = "barter_id",
  id = "id",
  message_client_generated_uuid = "message_client_generated_uuid",
}
/** unique or primary key constraints on table "barters" */
export const enum barters_constraint {
  barters_pkey = "barters_pkey",
}
/** select columns of table "barters" */
export const enum barters_select_column {
  id = "id",
  on_chain_state = "on_chain_state",
  room_id = "room_id",
  state = "state",
  user1_offers = "user1_offers",
  user2_offers = "user2_offers",
}
/** update columns of table "barters" */
export const enum barters_update_column {
  id = "id",
  on_chain_state = "on_chain_state",
  room_id = "room_id",
  state = "state",
  user1_offers = "user1_offers",
  user2_offers = "user2_offers",
}
/** unique or primary key constraints on table "chat_barter_metadata" */
export const enum chat_barter_metadata_constraint {
  chat_barter_metadata_pkey = "chat_barter_metadata_pkey",
}
/** select columns of table "chat_barter_metadata" */
export const enum chat_barter_metadata_select_column {
  barter_id = "barter_id",
  chat_client_generated_uuid = "chat_client_generated_uuid",
}
/** placeholder for update columns of table "chat_barter_metadata" (current role has no relevant permissions) */
export const enum chat_barter_metadata_update_column {
  _PLACEHOLDER = "_PLACEHOLDER",
}
/** unique or primary key constraints on table "chat_media_messages" */
export const enum chat_media_messages_constraint {
  chat_media_messages_pkey = "chat_media_messages_pkey",
}
/** select columns of table "chat_media_messages" */
export const enum chat_media_messages_select_column {
  id = "id",
  media_kind = "media_kind",
  media_link = "media_link",
  message_client_generated_uuid = "message_client_generated_uuid",
}
/** update columns of table "chat_media_messages" */
export const enum chat_media_messages_update_column {
  id = "id",
  media_kind = "media_kind",
  media_link = "media_link",
  message_client_generated_uuid = "message_client_generated_uuid",
}
/** unique or primary key constraints on table "chat_update_history" */
export const enum chat_update_history_constraint {
  chat_update_history_pkey = "chat_update_history_pkey",
}
/** select columns of table "chat_update_history" */
export const enum chat_update_history_select_column {
  client_generated_uuid = "client_generated_uuid",
  created_at = "created_at",
  id = "id",
  room = "room",
  type = "type",
}
/** placeholder for update columns of table "chat_update_history" (current role has no relevant permissions) */
export const enum chat_update_history_update_column {
  _PLACEHOLDER = "_PLACEHOLDER",
}
/** unique or primary key constraints on table "chats" */
export const enum chats_constraint {
  chats_client_generated_uuid_key = "chats_client_generated_uuid_key",
  chats_pkey = "chats_pkey",
}
/** select columns of table "chats" */
export const enum chats_select_column {
  client_generated_uuid = "client_generated_uuid",
  created_at = "created_at",
  deleted = "deleted",
  id = "id",
  message = "message",
  message_kind = "message_kind",
  parent_client_generated_uuid = "parent_client_generated_uuid",
  room = "room",
  type = "type",
  username = "username",
  uuid = "uuid",
}
/** update columns of table "chats" */
export const enum chats_update_column {
  deleted = "deleted",
}
/** ordering argument of a cursor */
export const enum cursor_ordering {
  ASC = "ASC",
  DESC = "DESC",
}
/** unique or primary key constraints on table "nft_sticker_metadata" */
export const enum nft_sticker_metadata_constraint {
  nft_sticker_metadata_pkey = "nft_sticker_metadata_pkey",
}
/** select columns of table "nft_sticker_metadata" */
export const enum nft_sticker_metadata_select_column {
  chat_client_generated_uuid = "chat_client_generated_uuid",
  id = "id",
  mint = "mint",
}
/** update columns of table "nft_sticker_metadata" */
export const enum nft_sticker_metadata_update_column {
  chat_client_generated_uuid = "chat_client_generated_uuid",
  id = "id",
  mint = "mint",
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
/** unique or primary key constraints on table "room_active_chat_mapping" */
export const enum room_active_chat_mapping_constraint {
  room_active_chat_mapping_pkey = "room_active_chat_mapping_pkey",
}
/** select columns of table "room_active_chat_mapping" */
export const enum room_active_chat_mapping_select_column {
  barter_id = "barter_id",
  room_id = "room_id",
}
/** update columns of table "room_active_chat_mapping" */
export const enum room_active_chat_mapping_update_column {
  barter_id = "barter_id",
  room_id = "room_id",
}
/** unique or primary key constraints on table "secure_transfer_transactions" */
export const enum secure_transfer_transactions_constraint {
  secure_transfer_transactions_pkey = "secure_transfer_transactions_pkey",
}
/** select columns of table "secure_transfer_transactions" */
export const enum secure_transfer_transactions_select_column {
  counter = "counter",
  current_state = "current_state",
  escrow = "escrow",
  final_txn_signature = "final_txn_signature",
  from = "from",
  id = "id",
  message_client_generated_uuid = "message_client_generated_uuid",
  message_id = "message_id",
  signature = "signature",
  to = "to",
}
/** update columns of table "secure_transfer_transactions" */
export const enum secure_transfer_transactions_update_column {
  counter = "counter",
  current_state = "current_state",
  escrow = "escrow",
  final_txn_signature = "final_txn_signature",
  from = "from",
  id = "id",
  message_client_generated_uuid = "message_client_generated_uuid",
  message_id = "message_id",
  signature = "signature",
  to = "to",
}
/** unique or primary key constraints on table "simple_transactions" */
export const enum simple_transactions_constraint {
  simple_transactions_pkey = "simple_transactions_pkey",
}
/** select columns of table "simple_transactions" */
export const enum simple_transactions_select_column {
  client_generated_uuid = "client_generated_uuid",
  id = "id",
  txn_signature = "txn_signature",
}
/** update columns of table "simple_transactions" */
export const enum simple_transactions_update_column {
  client_generated_uuid = "client_generated_uuid",
  id = "id",
  txn_signature = "txn_signature",
}

type ZEUS_VARIABLES = {
  ["Boolean_comparison_exp"]: ValueTypes["Boolean_comparison_exp"];
  ["Int_comparison_exp"]: ValueTypes["Int_comparison_exp"];
  ["String_comparison_exp"]: ValueTypes["String_comparison_exp"];
  ["barter_poke_metadata_aggregate_order_by"]: ValueTypes["barter_poke_metadata_aggregate_order_by"];
  ["barter_poke_metadata_arr_rel_insert_input"]: ValueTypes["barter_poke_metadata_arr_rel_insert_input"];
  ["barter_poke_metadata_avg_order_by"]: ValueTypes["barter_poke_metadata_avg_order_by"];
  ["barter_poke_metadata_bool_exp"]: ValueTypes["barter_poke_metadata_bool_exp"];
  ["barter_poke_metadata_constraint"]: ValueTypes["barter_poke_metadata_constraint"];
  ["barter_poke_metadata_inc_input"]: ValueTypes["barter_poke_metadata_inc_input"];
  ["barter_poke_metadata_insert_input"]: ValueTypes["barter_poke_metadata_insert_input"];
  ["barter_poke_metadata_max_order_by"]: ValueTypes["barter_poke_metadata_max_order_by"];
  ["barter_poke_metadata_min_order_by"]: ValueTypes["barter_poke_metadata_min_order_by"];
  ["barter_poke_metadata_on_conflict"]: ValueTypes["barter_poke_metadata_on_conflict"];
  ["barter_poke_metadata_order_by"]: ValueTypes["barter_poke_metadata_order_by"];
  ["barter_poke_metadata_pk_columns_input"]: ValueTypes["barter_poke_metadata_pk_columns_input"];
  ["barter_poke_metadata_select_column"]: ValueTypes["barter_poke_metadata_select_column"];
  ["barter_poke_metadata_set_input"]: ValueTypes["barter_poke_metadata_set_input"];
  ["barter_poke_metadata_stddev_order_by"]: ValueTypes["barter_poke_metadata_stddev_order_by"];
  ["barter_poke_metadata_stddev_pop_order_by"]: ValueTypes["barter_poke_metadata_stddev_pop_order_by"];
  ["barter_poke_metadata_stddev_samp_order_by"]: ValueTypes["barter_poke_metadata_stddev_samp_order_by"];
  ["barter_poke_metadata_stream_cursor_input"]: ValueTypes["barter_poke_metadata_stream_cursor_input"];
  ["barter_poke_metadata_stream_cursor_value_input"]: ValueTypes["barter_poke_metadata_stream_cursor_value_input"];
  ["barter_poke_metadata_sum_order_by"]: ValueTypes["barter_poke_metadata_sum_order_by"];
  ["barter_poke_metadata_update_column"]: ValueTypes["barter_poke_metadata_update_column"];
  ["barter_poke_metadata_updates"]: ValueTypes["barter_poke_metadata_updates"];
  ["barter_poke_metadata_var_pop_order_by"]: ValueTypes["barter_poke_metadata_var_pop_order_by"];
  ["barter_poke_metadata_var_samp_order_by"]: ValueTypes["barter_poke_metadata_var_samp_order_by"];
  ["barter_poke_metadata_variance_order_by"]: ValueTypes["barter_poke_metadata_variance_order_by"];
  ["barters_bool_exp"]: ValueTypes["barters_bool_exp"];
  ["barters_constraint"]: ValueTypes["barters_constraint"];
  ["barters_inc_input"]: ValueTypes["barters_inc_input"];
  ["barters_insert_input"]: ValueTypes["barters_insert_input"];
  ["barters_obj_rel_insert_input"]: ValueTypes["barters_obj_rel_insert_input"];
  ["barters_on_conflict"]: ValueTypes["barters_on_conflict"];
  ["barters_order_by"]: ValueTypes["barters_order_by"];
  ["barters_pk_columns_input"]: ValueTypes["barters_pk_columns_input"];
  ["barters_select_column"]: ValueTypes["barters_select_column"];
  ["barters_set_input"]: ValueTypes["barters_set_input"];
  ["barters_stream_cursor_input"]: ValueTypes["barters_stream_cursor_input"];
  ["barters_stream_cursor_value_input"]: ValueTypes["barters_stream_cursor_value_input"];
  ["barters_update_column"]: ValueTypes["barters_update_column"];
  ["barters_updates"]: ValueTypes["barters_updates"];
  ["chat_barter_metadata_aggregate_order_by"]: ValueTypes["chat_barter_metadata_aggregate_order_by"];
  ["chat_barter_metadata_arr_rel_insert_input"]: ValueTypes["chat_barter_metadata_arr_rel_insert_input"];
  ["chat_barter_metadata_avg_order_by"]: ValueTypes["chat_barter_metadata_avg_order_by"];
  ["chat_barter_metadata_bool_exp"]: ValueTypes["chat_barter_metadata_bool_exp"];
  ["chat_barter_metadata_constraint"]: ValueTypes["chat_barter_metadata_constraint"];
  ["chat_barter_metadata_insert_input"]: ValueTypes["chat_barter_metadata_insert_input"];
  ["chat_barter_metadata_max_order_by"]: ValueTypes["chat_barter_metadata_max_order_by"];
  ["chat_barter_metadata_min_order_by"]: ValueTypes["chat_barter_metadata_min_order_by"];
  ["chat_barter_metadata_on_conflict"]: ValueTypes["chat_barter_metadata_on_conflict"];
  ["chat_barter_metadata_order_by"]: ValueTypes["chat_barter_metadata_order_by"];
  ["chat_barter_metadata_select_column"]: ValueTypes["chat_barter_metadata_select_column"];
  ["chat_barter_metadata_stddev_order_by"]: ValueTypes["chat_barter_metadata_stddev_order_by"];
  ["chat_barter_metadata_stddev_pop_order_by"]: ValueTypes["chat_barter_metadata_stddev_pop_order_by"];
  ["chat_barter_metadata_stddev_samp_order_by"]: ValueTypes["chat_barter_metadata_stddev_samp_order_by"];
  ["chat_barter_metadata_stream_cursor_input"]: ValueTypes["chat_barter_metadata_stream_cursor_input"];
  ["chat_barter_metadata_stream_cursor_value_input"]: ValueTypes["chat_barter_metadata_stream_cursor_value_input"];
  ["chat_barter_metadata_sum_order_by"]: ValueTypes["chat_barter_metadata_sum_order_by"];
  ["chat_barter_metadata_update_column"]: ValueTypes["chat_barter_metadata_update_column"];
  ["chat_barter_metadata_updates"]: ValueTypes["chat_barter_metadata_updates"];
  ["chat_barter_metadata_var_pop_order_by"]: ValueTypes["chat_barter_metadata_var_pop_order_by"];
  ["chat_barter_metadata_var_samp_order_by"]: ValueTypes["chat_barter_metadata_var_samp_order_by"];
  ["chat_barter_metadata_variance_order_by"]: ValueTypes["chat_barter_metadata_variance_order_by"];
  ["chat_media_messages_aggregate_order_by"]: ValueTypes["chat_media_messages_aggregate_order_by"];
  ["chat_media_messages_arr_rel_insert_input"]: ValueTypes["chat_media_messages_arr_rel_insert_input"];
  ["chat_media_messages_avg_order_by"]: ValueTypes["chat_media_messages_avg_order_by"];
  ["chat_media_messages_bool_exp"]: ValueTypes["chat_media_messages_bool_exp"];
  ["chat_media_messages_constraint"]: ValueTypes["chat_media_messages_constraint"];
  ["chat_media_messages_inc_input"]: ValueTypes["chat_media_messages_inc_input"];
  ["chat_media_messages_insert_input"]: ValueTypes["chat_media_messages_insert_input"];
  ["chat_media_messages_max_order_by"]: ValueTypes["chat_media_messages_max_order_by"];
  ["chat_media_messages_min_order_by"]: ValueTypes["chat_media_messages_min_order_by"];
  ["chat_media_messages_on_conflict"]: ValueTypes["chat_media_messages_on_conflict"];
  ["chat_media_messages_order_by"]: ValueTypes["chat_media_messages_order_by"];
  ["chat_media_messages_pk_columns_input"]: ValueTypes["chat_media_messages_pk_columns_input"];
  ["chat_media_messages_select_column"]: ValueTypes["chat_media_messages_select_column"];
  ["chat_media_messages_set_input"]: ValueTypes["chat_media_messages_set_input"];
  ["chat_media_messages_stddev_order_by"]: ValueTypes["chat_media_messages_stddev_order_by"];
  ["chat_media_messages_stddev_pop_order_by"]: ValueTypes["chat_media_messages_stddev_pop_order_by"];
  ["chat_media_messages_stddev_samp_order_by"]: ValueTypes["chat_media_messages_stddev_samp_order_by"];
  ["chat_media_messages_stream_cursor_input"]: ValueTypes["chat_media_messages_stream_cursor_input"];
  ["chat_media_messages_stream_cursor_value_input"]: ValueTypes["chat_media_messages_stream_cursor_value_input"];
  ["chat_media_messages_sum_order_by"]: ValueTypes["chat_media_messages_sum_order_by"];
  ["chat_media_messages_update_column"]: ValueTypes["chat_media_messages_update_column"];
  ["chat_media_messages_updates"]: ValueTypes["chat_media_messages_updates"];
  ["chat_media_messages_var_pop_order_by"]: ValueTypes["chat_media_messages_var_pop_order_by"];
  ["chat_media_messages_var_samp_order_by"]: ValueTypes["chat_media_messages_var_samp_order_by"];
  ["chat_media_messages_variance_order_by"]: ValueTypes["chat_media_messages_variance_order_by"];
  ["chat_update_history_bool_exp"]: ValueTypes["chat_update_history_bool_exp"];
  ["chat_update_history_constraint"]: ValueTypes["chat_update_history_constraint"];
  ["chat_update_history_insert_input"]: ValueTypes["chat_update_history_insert_input"];
  ["chat_update_history_on_conflict"]: ValueTypes["chat_update_history_on_conflict"];
  ["chat_update_history_order_by"]: ValueTypes["chat_update_history_order_by"];
  ["chat_update_history_select_column"]: ValueTypes["chat_update_history_select_column"];
  ["chat_update_history_stream_cursor_input"]: ValueTypes["chat_update_history_stream_cursor_input"];
  ["chat_update_history_stream_cursor_value_input"]: ValueTypes["chat_update_history_stream_cursor_value_input"];
  ["chat_update_history_update_column"]: ValueTypes["chat_update_history_update_column"];
  ["chats_bool_exp"]: ValueTypes["chats_bool_exp"];
  ["chats_constraint"]: ValueTypes["chats_constraint"];
  ["chats_insert_input"]: ValueTypes["chats_insert_input"];
  ["chats_obj_rel_insert_input"]: ValueTypes["chats_obj_rel_insert_input"];
  ["chats_on_conflict"]: ValueTypes["chats_on_conflict"];
  ["chats_order_by"]: ValueTypes["chats_order_by"];
  ["chats_pk_columns_input"]: ValueTypes["chats_pk_columns_input"];
  ["chats_select_column"]: ValueTypes["chats_select_column"];
  ["chats_set_input"]: ValueTypes["chats_set_input"];
  ["chats_stream_cursor_input"]: ValueTypes["chats_stream_cursor_input"];
  ["chats_stream_cursor_value_input"]: ValueTypes["chats_stream_cursor_value_input"];
  ["chats_update_column"]: ValueTypes["chats_update_column"];
  ["chats_updates"]: ValueTypes["chats_updates"];
  ["cursor_ordering"]: ValueTypes["cursor_ordering"];
  ["nft_sticker_metadata_aggregate_order_by"]: ValueTypes["nft_sticker_metadata_aggregate_order_by"];
  ["nft_sticker_metadata_arr_rel_insert_input"]: ValueTypes["nft_sticker_metadata_arr_rel_insert_input"];
  ["nft_sticker_metadata_avg_order_by"]: ValueTypes["nft_sticker_metadata_avg_order_by"];
  ["nft_sticker_metadata_bool_exp"]: ValueTypes["nft_sticker_metadata_bool_exp"];
  ["nft_sticker_metadata_constraint"]: ValueTypes["nft_sticker_metadata_constraint"];
  ["nft_sticker_metadata_inc_input"]: ValueTypes["nft_sticker_metadata_inc_input"];
  ["nft_sticker_metadata_insert_input"]: ValueTypes["nft_sticker_metadata_insert_input"];
  ["nft_sticker_metadata_max_order_by"]: ValueTypes["nft_sticker_metadata_max_order_by"];
  ["nft_sticker_metadata_min_order_by"]: ValueTypes["nft_sticker_metadata_min_order_by"];
  ["nft_sticker_metadata_on_conflict"]: ValueTypes["nft_sticker_metadata_on_conflict"];
  ["nft_sticker_metadata_order_by"]: ValueTypes["nft_sticker_metadata_order_by"];
  ["nft_sticker_metadata_pk_columns_input"]: ValueTypes["nft_sticker_metadata_pk_columns_input"];
  ["nft_sticker_metadata_select_column"]: ValueTypes["nft_sticker_metadata_select_column"];
  ["nft_sticker_metadata_set_input"]: ValueTypes["nft_sticker_metadata_set_input"];
  ["nft_sticker_metadata_stddev_order_by"]: ValueTypes["nft_sticker_metadata_stddev_order_by"];
  ["nft_sticker_metadata_stddev_pop_order_by"]: ValueTypes["nft_sticker_metadata_stddev_pop_order_by"];
  ["nft_sticker_metadata_stddev_samp_order_by"]: ValueTypes["nft_sticker_metadata_stddev_samp_order_by"];
  ["nft_sticker_metadata_stream_cursor_input"]: ValueTypes["nft_sticker_metadata_stream_cursor_input"];
  ["nft_sticker_metadata_stream_cursor_value_input"]: ValueTypes["nft_sticker_metadata_stream_cursor_value_input"];
  ["nft_sticker_metadata_sum_order_by"]: ValueTypes["nft_sticker_metadata_sum_order_by"];
  ["nft_sticker_metadata_update_column"]: ValueTypes["nft_sticker_metadata_update_column"];
  ["nft_sticker_metadata_updates"]: ValueTypes["nft_sticker_metadata_updates"];
  ["nft_sticker_metadata_var_pop_order_by"]: ValueTypes["nft_sticker_metadata_var_pop_order_by"];
  ["nft_sticker_metadata_var_samp_order_by"]: ValueTypes["nft_sticker_metadata_var_samp_order_by"];
  ["nft_sticker_metadata_variance_order_by"]: ValueTypes["nft_sticker_metadata_variance_order_by"];
  ["order_by"]: ValueTypes["order_by"];
  ["room_active_chat_mapping_aggregate_order_by"]: ValueTypes["room_active_chat_mapping_aggregate_order_by"];
  ["room_active_chat_mapping_arr_rel_insert_input"]: ValueTypes["room_active_chat_mapping_arr_rel_insert_input"];
  ["room_active_chat_mapping_avg_order_by"]: ValueTypes["room_active_chat_mapping_avg_order_by"];
  ["room_active_chat_mapping_bool_exp"]: ValueTypes["room_active_chat_mapping_bool_exp"];
  ["room_active_chat_mapping_constraint"]: ValueTypes["room_active_chat_mapping_constraint"];
  ["room_active_chat_mapping_inc_input"]: ValueTypes["room_active_chat_mapping_inc_input"];
  ["room_active_chat_mapping_insert_input"]: ValueTypes["room_active_chat_mapping_insert_input"];
  ["room_active_chat_mapping_max_order_by"]: ValueTypes["room_active_chat_mapping_max_order_by"];
  ["room_active_chat_mapping_min_order_by"]: ValueTypes["room_active_chat_mapping_min_order_by"];
  ["room_active_chat_mapping_on_conflict"]: ValueTypes["room_active_chat_mapping_on_conflict"];
  ["room_active_chat_mapping_order_by"]: ValueTypes["room_active_chat_mapping_order_by"];
  ["room_active_chat_mapping_pk_columns_input"]: ValueTypes["room_active_chat_mapping_pk_columns_input"];
  ["room_active_chat_mapping_select_column"]: ValueTypes["room_active_chat_mapping_select_column"];
  ["room_active_chat_mapping_set_input"]: ValueTypes["room_active_chat_mapping_set_input"];
  ["room_active_chat_mapping_stddev_order_by"]: ValueTypes["room_active_chat_mapping_stddev_order_by"];
  ["room_active_chat_mapping_stddev_pop_order_by"]: ValueTypes["room_active_chat_mapping_stddev_pop_order_by"];
  ["room_active_chat_mapping_stddev_samp_order_by"]: ValueTypes["room_active_chat_mapping_stddev_samp_order_by"];
  ["room_active_chat_mapping_stream_cursor_input"]: ValueTypes["room_active_chat_mapping_stream_cursor_input"];
  ["room_active_chat_mapping_stream_cursor_value_input"]: ValueTypes["room_active_chat_mapping_stream_cursor_value_input"];
  ["room_active_chat_mapping_sum_order_by"]: ValueTypes["room_active_chat_mapping_sum_order_by"];
  ["room_active_chat_mapping_update_column"]: ValueTypes["room_active_chat_mapping_update_column"];
  ["room_active_chat_mapping_updates"]: ValueTypes["room_active_chat_mapping_updates"];
  ["room_active_chat_mapping_var_pop_order_by"]: ValueTypes["room_active_chat_mapping_var_pop_order_by"];
  ["room_active_chat_mapping_var_samp_order_by"]: ValueTypes["room_active_chat_mapping_var_samp_order_by"];
  ["room_active_chat_mapping_variance_order_by"]: ValueTypes["room_active_chat_mapping_variance_order_by"];
  ["secure_transfer_transactions_aggregate_order_by"]: ValueTypes["secure_transfer_transactions_aggregate_order_by"];
  ["secure_transfer_transactions_arr_rel_insert_input"]: ValueTypes["secure_transfer_transactions_arr_rel_insert_input"];
  ["secure_transfer_transactions_avg_order_by"]: ValueTypes["secure_transfer_transactions_avg_order_by"];
  ["secure_transfer_transactions_bool_exp"]: ValueTypes["secure_transfer_transactions_bool_exp"];
  ["secure_transfer_transactions_constraint"]: ValueTypes["secure_transfer_transactions_constraint"];
  ["secure_transfer_transactions_inc_input"]: ValueTypes["secure_transfer_transactions_inc_input"];
  ["secure_transfer_transactions_insert_input"]: ValueTypes["secure_transfer_transactions_insert_input"];
  ["secure_transfer_transactions_max_order_by"]: ValueTypes["secure_transfer_transactions_max_order_by"];
  ["secure_transfer_transactions_min_order_by"]: ValueTypes["secure_transfer_transactions_min_order_by"];
  ["secure_transfer_transactions_on_conflict"]: ValueTypes["secure_transfer_transactions_on_conflict"];
  ["secure_transfer_transactions_order_by"]: ValueTypes["secure_transfer_transactions_order_by"];
  ["secure_transfer_transactions_pk_columns_input"]: ValueTypes["secure_transfer_transactions_pk_columns_input"];
  ["secure_transfer_transactions_select_column"]: ValueTypes["secure_transfer_transactions_select_column"];
  ["secure_transfer_transactions_set_input"]: ValueTypes["secure_transfer_transactions_set_input"];
  ["secure_transfer_transactions_stddev_order_by"]: ValueTypes["secure_transfer_transactions_stddev_order_by"];
  ["secure_transfer_transactions_stddev_pop_order_by"]: ValueTypes["secure_transfer_transactions_stddev_pop_order_by"];
  ["secure_transfer_transactions_stddev_samp_order_by"]: ValueTypes["secure_transfer_transactions_stddev_samp_order_by"];
  ["secure_transfer_transactions_stream_cursor_input"]: ValueTypes["secure_transfer_transactions_stream_cursor_input"];
  ["secure_transfer_transactions_stream_cursor_value_input"]: ValueTypes["secure_transfer_transactions_stream_cursor_value_input"];
  ["secure_transfer_transactions_sum_order_by"]: ValueTypes["secure_transfer_transactions_sum_order_by"];
  ["secure_transfer_transactions_update_column"]: ValueTypes["secure_transfer_transactions_update_column"];
  ["secure_transfer_transactions_updates"]: ValueTypes["secure_transfer_transactions_updates"];
  ["secure_transfer_transactions_var_pop_order_by"]: ValueTypes["secure_transfer_transactions_var_pop_order_by"];
  ["secure_transfer_transactions_var_samp_order_by"]: ValueTypes["secure_transfer_transactions_var_samp_order_by"];
  ["secure_transfer_transactions_variance_order_by"]: ValueTypes["secure_transfer_transactions_variance_order_by"];
  ["simple_transactions_aggregate_order_by"]: ValueTypes["simple_transactions_aggregate_order_by"];
  ["simple_transactions_arr_rel_insert_input"]: ValueTypes["simple_transactions_arr_rel_insert_input"];
  ["simple_transactions_avg_order_by"]: ValueTypes["simple_transactions_avg_order_by"];
  ["simple_transactions_bool_exp"]: ValueTypes["simple_transactions_bool_exp"];
  ["simple_transactions_constraint"]: ValueTypes["simple_transactions_constraint"];
  ["simple_transactions_inc_input"]: ValueTypes["simple_transactions_inc_input"];
  ["simple_transactions_insert_input"]: ValueTypes["simple_transactions_insert_input"];
  ["simple_transactions_max_order_by"]: ValueTypes["simple_transactions_max_order_by"];
  ["simple_transactions_min_order_by"]: ValueTypes["simple_transactions_min_order_by"];
  ["simple_transactions_on_conflict"]: ValueTypes["simple_transactions_on_conflict"];
  ["simple_transactions_order_by"]: ValueTypes["simple_transactions_order_by"];
  ["simple_transactions_pk_columns_input"]: ValueTypes["simple_transactions_pk_columns_input"];
  ["simple_transactions_select_column"]: ValueTypes["simple_transactions_select_column"];
  ["simple_transactions_set_input"]: ValueTypes["simple_transactions_set_input"];
  ["simple_transactions_stddev_order_by"]: ValueTypes["simple_transactions_stddev_order_by"];
  ["simple_transactions_stddev_pop_order_by"]: ValueTypes["simple_transactions_stddev_pop_order_by"];
  ["simple_transactions_stddev_samp_order_by"]: ValueTypes["simple_transactions_stddev_samp_order_by"];
  ["simple_transactions_stream_cursor_input"]: ValueTypes["simple_transactions_stream_cursor_input"];
  ["simple_transactions_stream_cursor_value_input"]: ValueTypes["simple_transactions_stream_cursor_value_input"];
  ["simple_transactions_sum_order_by"]: ValueTypes["simple_transactions_sum_order_by"];
  ["simple_transactions_update_column"]: ValueTypes["simple_transactions_update_column"];
  ["simple_transactions_updates"]: ValueTypes["simple_transactions_updates"];
  ["simple_transactions_var_pop_order_by"]: ValueTypes["simple_transactions_var_pop_order_by"];
  ["simple_transactions_var_samp_order_by"]: ValueTypes["simple_transactions_var_samp_order_by"];
  ["simple_transactions_variance_order_by"]: ValueTypes["simple_transactions_variance_order_by"];
  ["timestamptz"]: ValueTypes["timestamptz"];
  ["timestamptz_comparison_exp"]: ValueTypes["timestamptz_comparison_exp"];
};
