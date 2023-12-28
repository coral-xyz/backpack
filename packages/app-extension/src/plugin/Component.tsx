// TODO: We should remove this dependency somehow
import { Scrollbars } from "react-custom-scrollbars";
import {
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
} from "@coral-xyz/tamagui";
import { Button as MuiButton, TextField as MuiTextField } from "@mui/material";
import { motion } from "framer-motion";

import { MOTION_VARIANTS } from "../app/Router";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  textFieldRoot: {
    "& .MuiOutlinedInput-root": {
      background: theme.baseBackgroundL1.val,
      borderRadius: "12px",
      "& fieldset": {
        border: `${theme.baseBorderMed.val}`,
      },
      "&:hover fieldset": {
        border: `solid 2pt ${theme.baseBorderMed.val}`,
      },
      "&.Mui-focused fieldset": {
        border: `solid 2pt ${theme.baseBorderFocus.val} !important`,
        borderColor: `${theme.baseBorderFocus.val} !important`,
      },
    },
  },
  textRootError: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: `solid 2pt ${theme.redBorder.val} !important`,
      },
      "&.Mui-focused fieldset": {
        border: `solid 2pt ${theme.redBorder.val} !important`,
        borderColor: `${theme.redBorder.val} !important`,
      },
    },
  },
}));

export function TextField({
  placeholder,
  type,
  value,
  setValue,
  rootClass,
  startAdornment,
  endAdornment,
  isError,
  inputProps,
  disabled,
  autoFocus,
  rows,
  select,
  children,
  style,
}: any) {
  const theme = useTheme();
  const classes = useStyles();
  const textColor = value
    ? theme.baseTextMedEmphasis.val
    : theme.baseTextMedEmphasis.val;

  return (
    <MuiTextField
      sx={{
        fontWeight: 500,
        borderRadius: "12px",
        fontSize: "16px",
        lineHeight: "24px",
      }}
      autoFocus={autoFocus}
      multiline={!!rows}
      rows={rows}
      disabled={disabled}
      placeholder={placeholder}
      variant="outlined"
      margin="dense"
      required
      fullWidth
      type={type}
      inputProps={{
        ...inputProps,
        style: {
          ...(inputProps?.style || {}),
          color: textColor,
        },
      }}
      classes={{
        root: `${isError ? classes.textRootError : ""} ${
          classes.textFieldRoot
        } ${rootClass ?? ""}`,
      }}
      InputLabelProps={{
        shrink: false,
        style: {
          borderRadius: "12px",
        },
      }}
      InputProps={{
        startAdornment,
        endAdornment,
      }}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      select={select}
      children={children}
      style={style}
    />
  );
}

export function Button({ id, props, style, onClick, children }: any) {
  return (
    <__Button
      id={id}
      props={props}
      style={style}
      children={children}
      onClick={onClick}
    />
  );
}

function __Button({ onClick, style, children }: any) {
  const theme = useTheme();
  return (
    <MuiButton
      disableElevation
      variant="contained"
      disableRipple
      style={{
        borderRadius: "12px",
        width: "100px",
        textTransform: "none",
        backgroundColor: theme.baseBackgroundL1.val,
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </MuiButton>
  );
}

export function ScrollBarImpl(props: any) {
  const theme = useTheme();

  return (
    <>
      <Scrollbars
        style={{ width: "100%", height: "100%" }}
        renderTrackHorizontal={(props: any) => (
          <div {...props} className="track-horizontal" />
        )}
        renderTrackVertical={(props: any) => (
          <div
            style={{ backgroundColor: theme.baseBackgroundL2.val }}
            {...props}
            className="track-vertical"
          />
        )}
        renderThumbHorizontal={(props: any) => (
          <div {...props} className="thumb-horizontal" />
        )}
        renderThumbVertical={(props: any) => (
          <div
            style={{ backgroundColor: theme.baseBackgroundL1.val }}
            {...props}
            className="thumb-vertical"
          />
        )}
        renderView={(props: any) => <div {...props} className="view" />}
        autoHide
        thumbMinSize={30}
        {...props}
      />
      <style>
        {`
          .view > div {
            min-height:100% !important;
            height:auto !important;
          }
          .track-vertical {
            background: ${theme.baseBackgroundL2.val};
          }
          .track-vertical .thumb-vertical {
            background-color: ${theme.baseBackgroundL1.val};
          }
				`}
      </style>
    </>
  );
}

export function WithMotion({ children, id, navAction }: any) {
  return (
    <motion.div
      key={id}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
      variants={MOTION_VARIANTS}
      initial={!navAction || navAction === "tab" ? {} : "initial"}
      animate={!navAction || navAction === "tab" ? {} : "animate"}
      exit={!navAction || navAction === "tab" ? {} : "exit"}
    >
      {children}
    </motion.div>
  );
}
