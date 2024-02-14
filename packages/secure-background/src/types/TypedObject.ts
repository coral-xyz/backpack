export type TypedObject<
  T extends { type: any },
  Z extends string & T["type"]
> = T & { type: Z };

export const TypedObject = <
  T extends { type: any },
  Z extends string & T["type"]
>(
  options: T,
  type: Z
): TypedObject<T, Z> => {
  if (options.type !== type) {
    throw new Error(`Object.type missmatch: ${options.type} != ${type}`);
  }
  return options;
};
