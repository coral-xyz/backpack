export declare function RoundedContainer({
  children,
}: {
  children: any;
}): JSX.Element;
export declare function IconPushDetail(): JSX.Element;
export declare function IconExpand({
  collapsed,
}: {
  collapsed: boolean;
}): JSX.Element;
export declare function IconLaunchDetail(): JSX.Element;
export declare function IconLeft({ name }: { name: any }): JSX.Element;
export declare function SettingsRow({
  label,
  onPress,
  icon,
  detailIcon,
}: {
  label: string;
  onPress: () => void;
  icon: JSX.Element;
  detailIcon: null | JSX.Element;
}): JSX.Element;
export declare function SettingsWalletRow({
  icon,
  name,
  publicKey,
  onPress,
}: {
  icon: any;
  name: string;
  publicKey: string;
  onPress: () => void;
}): JSX.Element;
//# sourceMappingURL=SettingsRow.d.ts.map
