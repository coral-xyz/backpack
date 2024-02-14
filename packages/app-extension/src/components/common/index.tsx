import type { CSSProperties } from "react";
import { formatWalletAddress } from "@coral-xyz/common";
import { useDarkMode } from "@coral-xyz/recoil";
import type { StackProps } from "@coral-xyz/tamagui";
import {
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";
import { Button, Checkbox as _Checkbox, Typography } from "@mui/material";

import { TextField } from "../../plugin/Component";

export { formatWalletAddress } from "@coral-xyz/common";
export { TextField };

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  header: {
    color: theme.baseTextHighEmphasis.val,
    fontSize: "24px",
    fontWeight: 500,
    lineHeight: "32px",
  },
  checkBox: {
    color: theme.buttonPrimaryBackground.val,
    width: "18px",
    height: "18px",
    "&.Mui-disabled": {
      opacity: 0.5,
    },
  },
  checkBoxRoot: {
    padding: 0,
  },
  checkBoxChecked: {
    color: `${theme.accentBlue.val} !important`,
    background: `${theme.baseBackgroundL0.val} !important`,
  },
  subtext: {
    color: theme.baseTextMedEmphasis.val,
  },
  checkFormButton: {
    display: "flex",
    marginTop: "8px",
    "&:hover": {
      backgroundColor: "transparent !important",
      background: "transparent !important",
      opacity: 0.8,
    },
  },
}));

export function WalletAddress({ publicKey, name, style, nameStyle }: any) {
  const theme = useTheme();
  return (
    <div
      style={{
        display: "flex",
        ...style,
      }}
    >
      <Typography style={{ ...nameStyle, marginRight: "8px" }}>
        {name}
      </Typography>
      {publicKey ? (
        <Typography style={{ color: theme.baseTextMedEmphasis.val }}>
          ({formatWalletAddress(publicKey)})
        </Typography>
      ) : null}
    </div>
  );
}

export function SubtextParagraph({
  children,
  style,
  onClick,
}: {
  children: any;
  onClick?: any;
  style?: React.CSSProperties;
}) {
  const classes = useStyles();
  return (
    <p
      className={classes.subtext}
      style={{ fontWeight: 500, marginTop: "8px", ...style }}
      onClick={onClick}
    >
      {children}
    </p>
  );
}

export function Header({
  text,
  style = {},
}: {
  text: string;
  style?: React.CSSProperties;
}) {
  const classes = useStyles();
  return (
    <Typography className={classes.header} style={style}>
      {text}
    </Typography>
  );
}

export function HeaderIcon({
  icon,
  ...stackProps
}: StackProps & {
  icon: any;
}) {
  return (
    <YStack justifyContent="center" alignItems="center" {...stackProps}>
      {icon}
    </YStack>
  );
}

export function Checkbox({
  checked,
  setChecked = () => {},
  ...checkboxProps
}: {
  checked: boolean;
  setChecked?: (value: boolean) => void;
} & React.ComponentProps<typeof _Checkbox>) {
  const classes = useStyles();
  const isDark = useDarkMode();
  return (
    <_Checkbox
      disableRipple
      className={classes.checkBox}
      checked={checked}
      onChange={() => setChecked(!checked)}
      classes={{
        checked: classes.checkBoxChecked,
        root: classes.checkBoxRoot,
      }}
      {...checkboxProps}
    />
  );
}

export function CheckboxForm({
  checked,
  setChecked,
  label,
  labelStyle,
  style,
}: {
  checked: boolean;
  setChecked: (value: boolean) => void;
  label: string | React.ReactNode;
  labelStyle?: CSSProperties;
  style?: CSSProperties;
}) {
  const classes = useStyles();
  return (
    <Button
      className={classes.checkFormButton}
      style={{
        padding: 0,
        textTransform: "none",
        ...style,
      }}
      onClick={() => setChecked(!checked)}
      disableRipple
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Checkbox
          checked={checked}
          setChecked={setChecked}
          sx={{ padding: 0 }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          marginLeft: "10px",
        }}
      >
        <Typography className={classes.subtext} style={labelStyle}>
          {label}
        </Typography>
      </div>
    </Button>
  );
}

export function routeOptions(
  routes: Array<{ title: string; name: string }>,
  { route }: { route: { name: string; props?: any } }
) {
  const found = routes.find((r) => r.name === route.name);
  if (!found) {
    throw new Error("route not found");
  }
  return {
    title: found.title,
  };
}
