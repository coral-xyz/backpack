import React from "react";
import {
  ImageProps,
  ViewProps,
  TextProps,
  TextFieldProps,
  FileInputProps,
  BalancesTableHeadProps,
  TableProps,
  TableRowProps,
  BalancesTableFooterProps,
  ButtonProps,
  LoadingProps,
  ScrollBarProps,
  SvgProps,
  PathProps,
  CircleProps,
  NavAnimationProps,
  IframeProps,
  BalancesTableProps,
  BalancesTableCellProps,
  BalancesTableRowProps,
  BalancesTableContentProps,
  CustomProps,
} from "./reconciler";

const c =
  <T,>(name: string) =>
  (props: T) =>
    React.createElement(name, props);

export const Text = c<TextProps>("Text");
export const TextField = c<TextFieldProps>("TextField");
export const FileInput = c<FileInputProps>("FileInput");
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
