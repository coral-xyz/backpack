/* eslint-disable */

export const AllTypesProps: Record<string, any> = {
  Int_comparison_exp: {},
  String_comparison_exp: {},
  chats_bool_exp: {
    _and: "chats_bool_exp",
    _not: "chats_bool_exp",
    _or: "chats_bool_exp",
    client_generated_uuid: "String_comparison_exp",
    created_at: "timestamptz_comparison_exp",
    id: "Int_comparison_exp",
    message: "String_comparison_exp",
    message_kind: "String_comparison_exp",
    room: "String_comparison_exp",
    type: "String_comparison_exp",
    username: "String_comparison_exp",
    uuid: "String_comparison_exp",
  },
  chats_constraint: "enum" as const,
  chats_insert_input: {
    created_at: "timestamptz",
  },
  chats_on_conflict: {
    constraint: "chats_constraint",
    update_columns: "chats_update_column",
    where: "chats_bool_exp",
  },
  chats_order_by: {
    client_generated_uuid: "order_by",
    created_at: "order_by",
    id: "order_by",
    message: "order_by",
    message_kind: "order_by",
    room: "order_by",
    type: "order_by",
    username: "order_by",
    uuid: "order_by",
  },
  chats_select_column: "enum" as const,
  chats_stream_cursor_input: {
    initial_value: "chats_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  chats_stream_cursor_value_input: {
    created_at: "timestamptz",
  },
  chats_update_column: "enum" as const,
  cursor_ordering: "enum" as const,
  mutation_root: {
    insert_chats: {
      objects: "chats_insert_input",
      on_conflict: "chats_on_conflict",
    },
    insert_chats_one: {
      object: "chats_insert_input",
      on_conflict: "chats_on_conflict",
    },
  },
  order_by: "enum" as const,
  query_root: {
    chats: {
      distinct_on: "chats_select_column",
      order_by: "chats_order_by",
      where: "chats_bool_exp",
    },
    chats_by_pk: {},
  },
  subscription_root: {
    chats: {
      distinct_on: "chats_select_column",
      order_by: "chats_order_by",
      where: "chats_bool_exp",
    },
    chats_by_pk: {},
    chats_stream: {
      cursor: "chats_stream_cursor_input",
      where: "chats_bool_exp",
    },
  },
  timestamptz: `scalar.timestamptz` as const,
  timestamptz_comparison_exp: {
    _eq: "timestamptz",
    _gt: "timestamptz",
    _gte: "timestamptz",
    _in: "timestamptz",
    _lt: "timestamptz",
    _lte: "timestamptz",
    _neq: "timestamptz",
    _nin: "timestamptz",
  },
};

export const ReturnTypes: Record<string, any> = {
  cached: {
    ttl: "Int",
    refresh: "Boolean",
  },
  chats: {
    client_generated_uuid: "String",
    created_at: "timestamptz",
    id: "Int",
    message: "String",
    message_kind: "String",
    room: "String",
    type: "String",
    username: "String",
    uuid: "String",
  },
  chats_mutation_response: {
    affected_rows: "Int",
    returning: "chats",
  },
  mutation_root: {
    insert_chats: "chats_mutation_response",
    insert_chats_one: "chats",
  },
  query_root: {
    chats: "chats",
    chats_by_pk: "chats",
  },
  subscription_root: {
    chats: "chats",
    chats_by_pk: "chats",
    chats_stream: "chats",
  },
  timestamptz: `scalar.timestamptz` as const,
};

export const Ops = {
  mutation: "mutation_root" as const,
  query: "query_root" as const,
  subscription: "subscription_root" as const,
};
