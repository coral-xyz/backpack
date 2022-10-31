/* eslint-disable */

export const AllTypesProps: Record<string, any> = {
  Int_comparison_exp: {},
  String_comparison_exp: {},
  auth_publickeys_bool_exp: {
    _and: "auth_publickeys_bool_exp",
    _not: "auth_publickeys_bool_exp",
    _or: "auth_publickeys_bool_exp",
    blockchain: "String_comparison_exp",
    publickey: "String_comparison_exp",
  },
  auth_publickeys_history_aggregate_order_by: {
    count: "order_by",
    max: "auth_publickeys_history_max_order_by",
    min: "auth_publickeys_history_min_order_by",
  },
  auth_publickeys_history_arr_rel_insert_input: {
    data: "auth_publickeys_history_insert_input",
    on_conflict: "auth_publickeys_history_on_conflict",
  },
  auth_publickeys_history_bool_exp: {
    _and: "auth_publickeys_history_bool_exp",
    _not: "auth_publickeys_history_bool_exp",
    _or: "auth_publickeys_history_bool_exp",
    blockchain: "String_comparison_exp",
    publickey: "String_comparison_exp",
    user_id: "uuid_comparison_exp",
  },
  auth_publickeys_history_constraint: "enum" as const,
  auth_publickeys_history_insert_input: {
    user_id: "uuid",
  },
  auth_publickeys_history_max_order_by: {
    blockchain: "order_by",
    publickey: "order_by",
    user_id: "order_by",
  },
  auth_publickeys_history_min_order_by: {
    blockchain: "order_by",
    publickey: "order_by",
    user_id: "order_by",
  },
  auth_publickeys_history_on_conflict: {
    constraint: "auth_publickeys_history_constraint",
    update_columns: "auth_publickeys_history_update_column",
    where: "auth_publickeys_history_bool_exp",
  },
  auth_publickeys_history_order_by: {
    blockchain: "order_by",
    publickey: "order_by",
    user_id: "order_by",
  },
  auth_publickeys_history_select_column: "enum" as const,
  auth_publickeys_history_stream_cursor_input: {
    initial_value: "auth_publickeys_history_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  auth_publickeys_history_stream_cursor_value_input: {
    user_id: "uuid",
  },
  auth_publickeys_history_update_column: "enum" as const,
  auth_publickeys_order_by: {
    blockchain: "order_by",
    publickey: "order_by",
  },
  auth_publickeys_select_column: "enum" as const,
  auth_publickeys_stream_cursor_input: {
    initial_value: "auth_publickeys_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  auth_publickeys_stream_cursor_value_input: {},
  auth_stripe_onramp_bool_exp: {
    _and: "auth_stripe_onramp_bool_exp",
    _not: "auth_stripe_onramp_bool_exp",
    _or: "auth_stripe_onramp_bool_exp",
    client_secret: "String_comparison_exp",
    id: "Int_comparison_exp",
    public_key: "String_comparison_exp",
    status: "String_comparison_exp",
    webhook_dump: "String_comparison_exp",
  },
  auth_stripe_onramp_constraint: "enum" as const,
  auth_stripe_onramp_inc_input: {},
  auth_stripe_onramp_insert_input: {},
  auth_stripe_onramp_on_conflict: {
    constraint: "auth_stripe_onramp_constraint",
    update_columns: "auth_stripe_onramp_update_column",
    where: "auth_stripe_onramp_bool_exp",
  },
  auth_stripe_onramp_order_by: {
    client_secret: "order_by",
    id: "order_by",
    public_key: "order_by",
    status: "order_by",
    webhook_dump: "order_by",
  },
  auth_stripe_onramp_pk_columns_input: {},
  auth_stripe_onramp_select_column: "enum" as const,
  auth_stripe_onramp_set_input: {},
  auth_stripe_onramp_stream_cursor_input: {
    initial_value: "auth_stripe_onramp_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  auth_stripe_onramp_stream_cursor_value_input: {},
  auth_stripe_onramp_update_column: "enum" as const,
  auth_stripe_onramp_updates: {
    _inc: "auth_stripe_onramp_inc_input",
    _set: "auth_stripe_onramp_set_input",
    where: "auth_stripe_onramp_bool_exp",
  },
  auth_users: {
    publickeys: {
      distinct_on: "auth_publickeys_history_select_column",
      order_by: "auth_publickeys_history_order_by",
      where: "auth_publickeys_history_bool_exp",
    },
  },
  auth_users_aggregate_fields: {
    count: {
      columns: "auth_users_select_column",
    },
  },
  auth_users_bool_exp: {
    _and: "auth_users_bool_exp",
    _not: "auth_users_bool_exp",
    _or: "auth_users_bool_exp",
    id: "uuid_comparison_exp",
    publickeys: "auth_publickeys_history_bool_exp",
    username: "citext_comparison_exp",
  },
  auth_users_constraint: "enum" as const,
  auth_users_insert_input: {
    invitation_id: "uuid",
    publickeys: "auth_publickeys_history_arr_rel_insert_input",
    username: "citext",
  },
  auth_users_on_conflict: {
    constraint: "auth_users_constraint",
    update_columns: "auth_users_update_column",
    where: "auth_users_bool_exp",
  },
  auth_users_order_by: {
    id: "order_by",
    publickeys_aggregate: "auth_publickeys_history_aggregate_order_by",
    username: "order_by",
  },
  auth_users_pk_columns_input: {
    id: "uuid",
  },
  auth_users_select_column: "enum" as const,
  auth_users_set_input: {
    updated_at: "timestamptz",
  },
  auth_users_stream_cursor_input: {
    initial_value: "auth_users_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  auth_users_stream_cursor_value_input: {
    id: "uuid",
    username: "citext",
  },
  auth_users_update_column: "enum" as const,
  auth_users_updates: {
    _set: "auth_users_set_input",
    where: "auth_users_bool_exp",
  },
  citext: `scalar.citext` as const,
  citext_comparison_exp: {
    _eq: "citext",
    _gt: "citext",
    _gte: "citext",
    _ilike: "citext",
    _in: "citext",
    _iregex: "citext",
    _like: "citext",
    _lt: "citext",
    _lte: "citext",
    _neq: "citext",
    _nilike: "citext",
    _nin: "citext",
    _niregex: "citext",
    _nlike: "citext",
    _nregex: "citext",
    _nsimilar: "citext",
    _regex: "citext",
    _similar: "citext",
  },
  cursor_ordering: "enum" as const,
  invitations_aggregate_fields: {
    count: {
      columns: "invitations_select_column",
    },
  },
  invitations_bool_exp: {
    _and: "invitations_bool_exp",
    _not: "invitations_bool_exp",
    _or: "invitations_bool_exp",
    claimed_at: "timestamptz_comparison_exp",
    id: "uuid_comparison_exp",
  },
  invitations_order_by: {
    claimed_at: "order_by",
    id: "order_by",
  },
  invitations_select_column: "enum" as const,
  invitations_stream_cursor_input: {
    initial_value: "invitations_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  invitations_stream_cursor_value_input: {
    claimed_at: "timestamptz",
    id: "uuid",
  },
  mutation_root: {
    insert_auth_publickeys_history: {
      objects: "auth_publickeys_history_insert_input",
      on_conflict: "auth_publickeys_history_on_conflict",
    },
    insert_auth_publickeys_history_one: {
      object: "auth_publickeys_history_insert_input",
      on_conflict: "auth_publickeys_history_on_conflict",
    },
    insert_auth_stripe_onramp: {
      objects: "auth_stripe_onramp_insert_input",
      on_conflict: "auth_stripe_onramp_on_conflict",
    },
    insert_auth_stripe_onramp_one: {
      object: "auth_stripe_onramp_insert_input",
      on_conflict: "auth_stripe_onramp_on_conflict",
    },
    insert_auth_users: {
      objects: "auth_users_insert_input",
      on_conflict: "auth_users_on_conflict",
    },
    insert_auth_users_one: {
      object: "auth_users_insert_input",
      on_conflict: "auth_users_on_conflict",
    },
    update_auth_stripe_onramp: {
      _inc: "auth_stripe_onramp_inc_input",
      _set: "auth_stripe_onramp_set_input",
      where: "auth_stripe_onramp_bool_exp",
    },
    update_auth_stripe_onramp_by_pk: {
      _inc: "auth_stripe_onramp_inc_input",
      _set: "auth_stripe_onramp_set_input",
      pk_columns: "auth_stripe_onramp_pk_columns_input",
    },
    update_auth_stripe_onramp_many: {
      updates: "auth_stripe_onramp_updates",
    },
    update_auth_users: {
      _set: "auth_users_set_input",
      where: "auth_users_bool_exp",
    },
    update_auth_users_by_pk: {
      _set: "auth_users_set_input",
      pk_columns: "auth_users_pk_columns_input",
    },
    update_auth_users_many: {
      updates: "auth_users_updates",
    },
  },
  order_by: "enum" as const,
  query_root: {
    auth_publickeys: {
      distinct_on: "auth_publickeys_select_column",
      order_by: "auth_publickeys_order_by",
      where: "auth_publickeys_bool_exp",
    },
    auth_publickeys_history: {
      distinct_on: "auth_publickeys_history_select_column",
      order_by: "auth_publickeys_history_order_by",
      where: "auth_publickeys_history_bool_exp",
    },
    auth_stripe_onramp: {
      distinct_on: "auth_stripe_onramp_select_column",
      order_by: "auth_stripe_onramp_order_by",
      where: "auth_stripe_onramp_bool_exp",
    },
    auth_stripe_onramp_by_pk: {},
    auth_users: {
      distinct_on: "auth_users_select_column",
      order_by: "auth_users_order_by",
      where: "auth_users_bool_exp",
    },
    auth_users_aggregate: {
      distinct_on: "auth_users_select_column",
      order_by: "auth_users_order_by",
      where: "auth_users_bool_exp",
    },
    auth_users_by_pk: {
      id: "uuid",
    },
    invitations: {
      distinct_on: "invitations_select_column",
      order_by: "invitations_order_by",
      where: "invitations_bool_exp",
    },
    invitations_aggregate: {
      distinct_on: "invitations_select_column",
      order_by: "invitations_order_by",
      where: "invitations_bool_exp",
    },
  },
  subscription_root: {
    auth_publickeys: {
      distinct_on: "auth_publickeys_select_column",
      order_by: "auth_publickeys_order_by",
      where: "auth_publickeys_bool_exp",
    },
    auth_publickeys_history: {
      distinct_on: "auth_publickeys_history_select_column",
      order_by: "auth_publickeys_history_order_by",
      where: "auth_publickeys_history_bool_exp",
    },
    auth_publickeys_history_stream: {
      cursor: "auth_publickeys_history_stream_cursor_input",
      where: "auth_publickeys_history_bool_exp",
    },
    auth_publickeys_stream: {
      cursor: "auth_publickeys_stream_cursor_input",
      where: "auth_publickeys_bool_exp",
    },
    auth_stripe_onramp: {
      distinct_on: "auth_stripe_onramp_select_column",
      order_by: "auth_stripe_onramp_order_by",
      where: "auth_stripe_onramp_bool_exp",
    },
    auth_stripe_onramp_by_pk: {},
    auth_stripe_onramp_stream: {
      cursor: "auth_stripe_onramp_stream_cursor_input",
      where: "auth_stripe_onramp_bool_exp",
    },
    auth_users: {
      distinct_on: "auth_users_select_column",
      order_by: "auth_users_order_by",
      where: "auth_users_bool_exp",
    },
    auth_users_aggregate: {
      distinct_on: "auth_users_select_column",
      order_by: "auth_users_order_by",
      where: "auth_users_bool_exp",
    },
    auth_users_by_pk: {
      id: "uuid",
    },
    auth_users_stream: {
      cursor: "auth_users_stream_cursor_input",
      where: "auth_users_bool_exp",
    },
    invitations: {
      distinct_on: "invitations_select_column",
      order_by: "invitations_order_by",
      where: "invitations_bool_exp",
    },
    invitations_aggregate: {
      distinct_on: "invitations_select_column",
      order_by: "invitations_order_by",
      where: "invitations_bool_exp",
    },
    invitations_stream: {
      cursor: "invitations_stream_cursor_input",
      where: "invitations_bool_exp",
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
  uuid: `scalar.uuid` as const,
  uuid_comparison_exp: {
    _eq: "uuid",
    _gt: "uuid",
    _gte: "uuid",
    _in: "uuid",
    _lt: "uuid",
    _lte: "uuid",
    _neq: "uuid",
    _nin: "uuid",
  },
};

export const ReturnTypes: Record<string, any> = {
  cached: {
    ttl: "Int",
    refresh: "Boolean",
  },
  auth_publickeys: {
    blockchain: "String",
    publickey: "String",
  },
  auth_publickeys_history: {
    blockchain: "String",
    publickey: "String",
    user_id: "uuid",
  },
  auth_publickeys_history_mutation_response: {
    affected_rows: "Int",
    returning: "auth_publickeys_history",
  },
  auth_stripe_onramp: {
    client_secret: "String",
    id: "Int",
    public_key: "String",
    status: "String",
    webhook_dump: "String",
  },
  auth_stripe_onramp_mutation_response: {
    affected_rows: "Int",
    returning: "auth_stripe_onramp",
  },
  auth_users: {
    id: "uuid",
    publickeys: "auth_publickeys_history",
    username: "citext",
  },
  auth_users_aggregate: {
    aggregate: "auth_users_aggregate_fields",
    nodes: "auth_users",
  },
  auth_users_aggregate_fields: {
    count: "Int",
    max: "auth_users_max_fields",
    min: "auth_users_min_fields",
  },
  auth_users_max_fields: {
    id: "uuid",
    username: "citext",
  },
  auth_users_min_fields: {
    id: "uuid",
    username: "citext",
  },
  auth_users_mutation_response: {
    affected_rows: "Int",
    returning: "auth_users",
  },
  citext: `scalar.citext` as const,
  invitations: {
    claimed_at: "timestamptz",
    id: "uuid",
  },
  invitations_aggregate: {
    aggregate: "invitations_aggregate_fields",
    nodes: "invitations",
  },
  invitations_aggregate_fields: {
    count: "Int",
    max: "invitations_max_fields",
    min: "invitations_min_fields",
  },
  invitations_max_fields: {
    claimed_at: "timestamptz",
    id: "uuid",
  },
  invitations_min_fields: {
    claimed_at: "timestamptz",
    id: "uuid",
  },
  mutation_root: {
    insert_auth_publickeys_history: "auth_publickeys_history_mutation_response",
    insert_auth_publickeys_history_one: "auth_publickeys_history",
    insert_auth_stripe_onramp: "auth_stripe_onramp_mutation_response",
    insert_auth_stripe_onramp_one: "auth_stripe_onramp",
    insert_auth_users: "auth_users_mutation_response",
    insert_auth_users_one: "auth_users",
    update_auth_stripe_onramp: "auth_stripe_onramp_mutation_response",
    update_auth_stripe_onramp_by_pk: "auth_stripe_onramp",
    update_auth_stripe_onramp_many: "auth_stripe_onramp_mutation_response",
    update_auth_users: "auth_users_mutation_response",
    update_auth_users_by_pk: "auth_users",
    update_auth_users_many: "auth_users_mutation_response",
  },
  query_root: {
    auth_publickeys: "auth_publickeys",
    auth_publickeys_history: "auth_publickeys_history",
    auth_stripe_onramp: "auth_stripe_onramp",
    auth_stripe_onramp_by_pk: "auth_stripe_onramp",
    auth_users: "auth_users",
    auth_users_aggregate: "auth_users_aggregate",
    auth_users_by_pk: "auth_users",
    invitations: "invitations",
    invitations_aggregate: "invitations_aggregate",
  },
  subscription_root: {
    auth_publickeys: "auth_publickeys",
    auth_publickeys_history: "auth_publickeys_history",
    auth_publickeys_history_stream: "auth_publickeys_history",
    auth_publickeys_stream: "auth_publickeys",
    auth_stripe_onramp: "auth_stripe_onramp",
    auth_stripe_onramp_by_pk: "auth_stripe_onramp",
    auth_stripe_onramp_stream: "auth_stripe_onramp",
    auth_users: "auth_users",
    auth_users_aggregate: "auth_users_aggregate",
    auth_users_by_pk: "auth_users",
    auth_users_stream: "auth_users",
    invitations: "invitations",
    invitations_aggregate: "invitations_aggregate",
    invitations_stream: "invitations",
  },
  timestamptz: `scalar.timestamptz` as const,
  uuid: `scalar.uuid` as const,
};

export const Ops = {
  mutation: "mutation_root" as const,
  query: "query_root" as const,
  subscription: "subscription_root" as const,
};
