import type { GetTokenBalancesQuery } from "../../apollo/graphql";

export type ResponseBalanceSummary = NonNullable<
  NonNullable<GetTokenBalancesQuery["wallet"]>["balances"]
>["aggregate"];

export type ResponseTokenBalance = NonNullable<
  NonNullable<
    NonNullable<GetTokenBalancesQuery["wallet"]>["balances"]
  >["tokens"]
>["edges"][number]["node"];
