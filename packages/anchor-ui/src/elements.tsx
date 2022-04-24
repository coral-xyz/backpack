import React from "react";

const c = (name: string) => (props: any) => React.createElement(name, props);

export const Text = c("Text");
export const Image = c("Image");
export const Table = c("Table");
export const TableHead = c("TableHead");
export const TableRow = c("TableRow");
export const TableFooter = c("TableFooter");
export const View = c("View");

export const BalancesTable = c("BalancesTable");
export const BalancesTableContent = c("BalancesTableContent");
export const BalancesTableHead = c("BalancesTableHead");
export const BalancesTableRow = c("BalancesTableRow");
export const BalancesTableFooter = c("BalancesTableFooter");
