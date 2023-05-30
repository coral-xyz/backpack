// TODO: We should remove this dependency somehow
import { Scrollbars } from "react-custom-scrollbars";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { TextareaAutosize as MuiTextArea } from "@mui/base";
import { Button as MuiButton, TextField as MuiTextField } from "@mui/material";
import { motion } from "framer-motion";

import { MOTION_VARIANTS } from "../app/Router";

const useStyles = styles((theme) => ({
  textAreaInput: {
    fontWeight: 500,
    borderRadius: "12px",
    fontSize: "16px",
    lineHeight: "24px",
    padding: "16.5px 14px",
    font: "inherit",
    background: theme.custom.colors.textBackground,
    border: `2pt solid ${theme.custom.colors.textBackground}`,
    "&:hover": {
      border: `2pt solid ${theme.custom.colors.primaryButton}`,
    },
    "&:focus": {
      border: `2pt solid ${theme.custom.colors.primaryButton}`,
      outline: "none",
    },
  },
  textFieldInputColorEmpty: {
    color: theme.custom.colors.textPlaceholder,
  },
  textFieldInputColor: {
    color: theme.custom.colors.fontColor2,
  },
  textFieldRoot: {
    "& .MuiOutlinedInput-root": {
      background: theme.custom.colors.textBackground,
      borderRadius: "12px",
      "& fieldset": {
        border: `${theme.custom.colors.borderFull}`,
      },
      "&:hover fieldset": {
        border: `solid 2pt ${theme.custom.colors.primaryButton}`,
      },
      "&.Mui-focused fieldset": {
        border: `solid 2pt ${theme.custom.colors.primaryButton} !important`,
        borderColor: `${theme.custom.colors.primaryButton} !important`,
      },
    },
  },
  textRootError: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: `solid 2pt ${theme.custom.colors.negative} !important`,
      },
      "&.Mui-focused fieldset": {
        border: `solid 2pt ${theme.custom.colors.negative} !important`,
        borderColor: `${theme.custom.colors.negative} !important`,
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
  const classes = useStyles();
  const theme = useCustomTheme();
  const textColor = value
    ? theme.custom.colors.textPlaceholder
    : theme.custom.colors.fontColor2;

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
  const theme = useCustomTheme();
  return (
    <MuiButton
      disableElevation
      variant="contained"
      disableRipple
      style={{
        borderRadius: "12px",
        width: "100px",
        textTransform: "none",
        backgroundColor: theme.custom.colors.nav,
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </MuiButton>
  );
}

export function ScrollBarImpl(props: any) {
  const theme = useCustomTheme();

  return (
    <>
      <Scrollbars
        style={{ width: "100%", height: "100%" }}
        renderTrackHorizontal={(props: any) => (
          <div {...props} className="track-horizontal" />
        )}
        renderTrackVertical={(props: any) => (
          <div
            style={{ backgroundColor: theme.custom.colors.scrollbarTrack }}
            {...props}
            className="track-vertical"
          />
        )}
        renderThumbHorizontal={(props: any) => (
          <div {...props} className="thumb-horizontal" />
        )}
        renderThumbVertical={(props: any) => (
          <div
            style={{ backgroundColor: theme.custom.colors.scrollbarThumb }}
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
          .track-vertical {
            background: ${theme.custom.colors.scrollbarTrack};
          }
          .track-vertical .thumb-vertical {
            background-color: ${theme.custom.colors.scrollbarThumb};
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
