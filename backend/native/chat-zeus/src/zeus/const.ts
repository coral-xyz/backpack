/* eslint-disable */

export const AllTypesProps: Record<string, any> = {
  Int_comparison_exp: {},
  String_comparison_exp: {},
  chats: {
    secure_transfer_transactions: {
      distinct_on: "secure_transfer_transactions_select_column",
      order_by: "secure_transfer_transactions_order_by",
      where: "secure_transfer_transactions_bool_exp",
    },
  },
  chats_bool_exp: {
    _and: "chats_bool_exp",
    _not: "chats_bool_exp",
    _or: "chats_bool_exp",
    client_generated_uuid: "String_comparison_exp",
    created_at: "timestamptz_comparison_exp",
    id: "Int_comparison_exp",
    message: "String_comparison_exp",
    message_kind: "String_comparison_exp",
    parent_client_generated_uuid: "String_comparison_exp",
    room: "String_comparison_exp",
    secure_transfer_transactions: "secure_transfer_transactions_bool_exp",
    type: "String_comparison_exp",
    username: "String_comparison_exp",
    uuid: "String_comparison_exp",
  },
  chats_constraint: "enum" as const,
  chats_insert_input: {
    created_at: "timestamptz",
    secure_transfer_transactions:
      "secure_transfer_transactions_arr_rel_insert_input",
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
    parent_client_generated_uuid: "order_by",
    room: "order_by",
    secure_transfer_transactions_aggregate:
      "secure_transfer_transactions_aggregate_order_by",
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
    insert_secure_transfer_transactions: {
      objects: "secure_transfer_transactions_insert_input",
      on_conflict: "secure_transfer_transactions_on_conflict",
    },
    insert_secure_transfer_transactions_one: {
      object: "secure_transfer_transactions_insert_input",
      on_conflict: "secure_transfer_transactions_on_conflict",
    },
    update_secure_transfer_transactions: {
      where: "secure_transfer_transactions_bool_exp",
    },
    update_secure_transfer_transactions_by_pk: {
      pk_columns: "secure_transfer_transactions_pk_columns_input",
    },
    update_secure_transfer_transactions_many: {
      updates: "secure_transfer_transactions_updates",
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
    secure_transfer_transactions: {
      distinct_on: "secure_transfer_transactions_select_column",
      order_by: "secure_transfer_transactions_order_by",
      where: "secure_transfer_transactions_bool_exp",
    },
    secure_transfer_transactions_by_pk: {},
  },
  secure_transfer_transactions_aggregate_order_by: {
    avg: "secure_transfer_transactions_avg_order_by",
    count: "order_by",
    max: "secure_transfer_transactions_max_order_by",
    min: "secure_transfer_transactions_min_order_by",
    stddev: "secure_transfer_transactions_stddev_order_by",
    stddev_pop: "secure_transfer_transactions_stddev_pop_order_by",
    stddev_samp: "secure_transfer_transactions_stddev_samp_order_by",
    sum: "secure_transfer_transactions_sum_order_by",
    var_pop: "secure_transfer_transactions_var_pop_order_by",
    var_samp: "secure_transfer_transactions_var_samp_order_by",
    variance: "secure_transfer_transactions_variance_order_by",
  },
  secure_transfer_transactions_arr_rel_insert_input: {
    data: "secure_transfer_transactions_insert_input",
    on_conflict: "secure_transfer_transactions_on_conflict",
  },
  secure_transfer_transactions_avg_order_by: {
    id: "order_by",
    message_id: "order_by",
  },
  secure_transfer_transactions_bool_exp: {
    _and: "secure_transfer_transactions_bool_exp",
    _not: "secure_transfer_transactions_bool_exp",
    _or: "secure_transfer_transactions_bool_exp",
    counter: "String_comparison_exp",
    from: "String_comparison_exp",
    id: "Int_comparison_exp",
    message_id: "Int_comparison_exp",
    signature: "String_comparison_exp",
    to: "String_comparison_exp",
  },
  secure_transfer_transactions_constraint: "enum" as const,
  secure_transfer_transactions_insert_input: {},
  secure_transfer_transactions_max_order_by: {
    counter: "order_by",
    from: "order_by",
    id: "order_by",
    message_id: "order_by",
    signature: "order_by",
    to: "order_by",
  },
  secure_transfer_transactions_min_order_by: {
    counter: "order_by",
    from: "order_by",
    id: "order_by",
    message_id: "order_by",
    signature: "order_by",
    to: "order_by",
  },
  secure_transfer_transactions_on_conflict: {
    constraint: "secure_transfer_transactions_constraint",
    update_columns: "secure_transfer_transactions_update_column",
    where: "secure_transfer_transactions_bool_exp",
  },
  secure_transfer_transactions_order_by: {
    counter: "order_by",
    from: "order_by",
    id: "order_by",
    message_id: "order_by",
    signature: "order_by",
    to: "order_by",
  },
  secure_transfer_transactions_pk_columns_input: {},
  secure_transfer_transactions_select_column: "enum" as const,
  secure_transfer_transactions_stddev_order_by: {
    id: "order_by",
    message_id: "order_by",
  },
  secure_transfer_transactions_stddev_pop_order_by: {
    id: "order_by",
    message_id: "order_by",
  },
  secure_transfer_transactions_stddev_samp_order_by: {
    id: "order_by",
    message_id: "order_by",
  },
  secure_transfer_transactions_stream_cursor_input: {
    initial_value: "secure_transfer_transactions_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  secure_transfer_transactions_stream_cursor_value_input: {},
  secure_transfer_transactions_sum_order_by: {
    id: "order_by",
    message_id: "order_by",
  },
  secure_transfer_transactions_update_column: "enum" as const,
  secure_transfer_transactions_updates: {
    where: "secure_transfer_transactions_bool_exp",
  },
  secure_transfer_transactions_var_pop_order_by: {
    id: "order_by",
    message_id: "order_by",
  },
  secure_transfer_transactions_var_samp_order_by: {
    id: "order_by",
    message_id: "order_by",
  },
  secure_transfer_transactions_variance_order_by: {
    id: "order_by",
    message_id: "order_by",
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
    secure_transfer_transactions: {
      distinct_on: "secure_transfer_transactions_select_column",
      order_by: "secure_transfer_transactions_order_by",
      where: "secure_transfer_transactions_bool_exp",
    },
    secure_transfer_transactions_by_pk: {},
    secure_transfer_transactions_stream: {
      cursor: "secure_transfer_transactions_stream_cursor_input",
      where: "secure_transfer_transactions_bool_exp",
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
    parent_client_generated_uuid: "String",
    room: "String",
    secure_transfer_transactions: "secure_transfer_transactions",
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
    insert_secure_transfer_transactions:
      "secure_transfer_transactions_mutation_response",
    insert_secure_transfer_transactions_one: "secure_transfer_transactions",
    update_secure_transfer_transactions:
      "secure_transfer_transactions_mutation_response",
    update_secure_transfer_transactions_by_pk: "secure_transfer_transactions",
    update_secure_transfer_transactions_many:
      "secure_transfer_transactions_mutation_response",
  },
  query_root: {
    chats: "chats",
    chats_by_pk: "chats",
    secure_transfer_transactions: "secure_transfer_transactions",
    secure_transfer_transactions_by_pk: "secure_transfer_transactions",
  },
  secure_transfer_transactions: {
    counter: "String",
    from: "String",
    id: "Int",
    message_id: "Int",
    signature: "String",
    to: "String",
  },
  secure_transfer_transactions_mutation_response: {
    affected_rows: "Int",
    returning: "secure_transfer_transactions",
  },
  subscription_root: {
    chats: "chats",
    chats_by_pk: "chats",
    chats_stream: "chats",
    secure_transfer_transactions: "secure_transfer_transactions",
    secure_transfer_transactions_by_pk: "secure_transfer_transactions",
    secure_transfer_transactions_stream: "secure_transfer_transactions",
  },
  timestamptz: `scalar.timestamptz` as const,
};

export const Ops = {
  mutation: "mutation_root" as const,
  query: "query_root" as const,
  subscription: "subscription_root" as const,
};
