import React from "react";

import type {
  BalancesTableCellProps,
  BalancesTableContentProps,
  BalancesTableFooterProps,
  BalancesTableHeadProps,
  BalancesTableProps,
  BalancesTableRowProps,
  ButtonProps,
  CircleProps,
  CustomProps,
  IframeProps,
  ImageProps,
  LoadingProps,
  NavAnimationProps,
  PathProps,
  ScrollBarProps,
  SvgProps,
  TableProps,
  TableRowProps,
  TextFieldProps,
  TextProps,
  ViewProps,
} from "./reconciler";

const c =
  <T,>(name: string) =>
  (props: T) =>
    // @ts-expect-error Argument of type 'T' is not assignable to parameter of type 'Attributes | null | undefined'.
    React.createElement(name, props);

export const Text = c<TextProps>("Text");
export const TextField = c<TextFieldProps>("TextField");
export const Image = c<ImageProps>("Image");
export const Table = c<TableProps>("Table");
export const TableHead = c<BalancesTableHeadProps>("TableHead"); // There was no TableHead Props type
export const TableRow = c<TableRowProps>("TableRow");
export const TableFooter = c<BalancesTableFooterProps>("TableFooter"); // There was no TableFooter Props type
export const View = c<ViewProps>("View");
export const Button = c<ButtonProps>("Button");
export const Loading = c<LoadingProps>("Loading");
export const ScrollBar = c<ScrollBarProps>("ScrollBar");
export const Svg = c<SvgProps>("Svg");
export const Path = c<PathProps>("Path");
export const Circle = c<CircleProps>("Circle");
export const NavAnimation = c<NavAnimationProps>("NavAnimation");
export const Iframe = c<IframeProps>("Iframe");

export const BalancesTable = c<BalancesTableProps>("BalancesTable");
export const BalancesTableContent = c<BalancesTableContentProps>(
  "BalancesTableContent"
);
export const BalancesTableHead = c<BalancesTableHeadProps>("BalancesTableHead");
export const BalancesTableRow = c<BalancesTableRowProps>("BalancesTableRow");
export const BalancesTableCell = c<BalancesTableCellProps>("BalancesTableCell");
export const BalancesTableFooter = c<BalancesTableFooterProps>(
  "BalancesTableFooter"
);

export const Custom = c<CustomProps>("Custom");
