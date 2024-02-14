import {
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
} from "@coral-xyz/tamagui";
import { TextField, Typography } from "@mui/material";

import { List, ListItem } from "./List";

function overrideErrBorder(originalBorder: string, err: boolean, theme: any) {
  if (err) {
    return `solid 2pt ${theme.redText.val}`;
  }
  return `solid 2pt ${originalBorder}`;
}

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  textFieldRoot: {
    color: theme.baseTextMedEmphasis.val,
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: "none",
        color: theme.baseTextMedEmphasis.val,
      },
    },
  },
  smallInput: {
    "& .Mui-disabled": {
      "-webkit-text-fill-color": theme.baseTextMedEmphasis.val,
    },
  },
  listParent: {
    borderRadius: "10px",
    // border: {
    //   overrideErrBorder(
    //     theme.baseBorderMed.val,
    //     //@ts-ignore
    //     props.error,
    //     props.theme
    //   ),
    // }
    // "&:hover": {
    //   border: (props) =>
    //     overrideErrBorder(
    //       props.theme.baseBorderFocus.val,
    //       //@ts-ignore
    //       props.error,
    //       props.theme
    //     ),
    // },
    // "&:focus-within": {
    //   border: (props) =>
    //     overrideErrBorder(
    //       props.theme.baseBorderFocus.val,
    //       //@ts-ignore
    //       props.error,
    //       props.theme
    //     ),
    // },
  },
}));

interface InputListProps {
  children: any;
  error: boolean;
}

export const Inputs = ({ children }: InputListProps) => {
  // const theme = useTheme();
  // const classes = useStyles({ theme, error });
  const classes = useStyles();
  return <List className={classes.listParent}>{children}</List>;
};

interface InputListItemProps {
  autoFocus?: boolean;
  isLast?: boolean;
  isFirst?: boolean;
  title: string;
  value: string;
  placeholder: string;
  onChange: (e: any) => void;
  onBlur?: (e: any) => void;
  button: boolean;
  type?: string;
  titleWidth?: string;
}

export const InputListItem = ({
  autoFocus = false,
  isLast = false,
  isFirst = false,
  title,
  value,
  onBlur,
  onChange,
  button = false,
  placeholder,
  type = "text",
  titleWidth = "80px",
}: InputListItemProps) => {
  const theme = useTheme();
  const textColor = value
    ? theme.baseTextHighEmphasis.val
    : theme.baseTextMedEmphasis.val;

  return (
    <ListItem
      isLast={isLast}
      isFirst={isFirst}
      style={{
        height: "46px",
        padding: "10px",
      }}
      radius="8px"
      button={button}
    >
      <Typography
        style={{ color: theme.baseTextMedEmphasis.val, width: titleWidth }}
      >
        {title}
      </Typography>
      <TextField
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        type={type}
        sx={{
          // textFieldRoot
          color: theme.baseTextHighEmphasis.val,
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              border: "none",
              color: theme.baseTextHighEmphasis.val,
            },
          },
        }}
        inputProps={{
          style: {
            padding: 0,
            color: textColor,
          },
        }}
      />
    </ListItem>
  );
};

interface InputProps {
  value: string;
  setValue: (e: any) => void;
  onKeyDown?: (e: any) => void;
  error?: boolean;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  inputProps?: any;
  autoFocus?: boolean;
  endAdornment?: any;
  startAdornment?: any;
  errorMessage?: string;
  rows?: number;
  className?: any;
  children?: any;
  select?: boolean;
  margin?: "none" | "dense";
  required?: boolean;
}

export const TextInput = ({
  rows,
  value,
  setValue,
  onKeyDown,
  error = false,
  type = "text",
  placeholder = "",
  disabled = false,
  inputProps = {},
  autoFocus = false,
  endAdornment,
  startAdornment,
  errorMessage,
  className = "",
  children,
  select,
  margin,
  required = true,
}: InputProps) => {
  const theme = useTheme();
  const textColor = value
    ? theme.baseTextMedEmphasis.val
    : theme.baseTextMedEmphasis.val;

  const background = theme.baseBackgroundL0.val;

  const borderFocus = theme.accentBlue.val;
  const borderHover = theme.baseBorderMed.val;

  return (
    <>
      <TextField
        multiline={!!rows}
        rows={4}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={setValue}
        onKeyDown={onKeyDown}
        inputProps={{
          ...inputProps,
          style: {
            color: textColor,
            ...inputProps.style,
          },
        }}
        className={className}
        sx={() => ({
          fontWeight: 500,
          borderRadius: "24px",
          fontSize: "16px",
          lineHeight: "24px",
          "& .MuiOutlinedInput-root": {
            background: background,
            borderRadius: "12px",
            outline: "none",
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: overrideErrBorder(borderFocus, error, theme),
              outline: "none",
            },
            "& fieldset": {
              border: overrideErrBorder(borderHover, error, theme),
            },
            "&:hover fieldset": {
              border: overrideErrBorder(borderHover, error, theme),
            },
            "&.Mui-focused fieldset": {
              border: overrideErrBorder(borderFocus, error, theme),
            },
            "&:active": {
              outline: "none",
            },
          },
        })}
        variant="outlined"
        fullWidth
        required={required}
        margin={margin ?? "dense"}
        disabled={disabled}
        autoFocus={autoFocus}
        InputProps={{
          startAdornment,
          endAdornment,
        }}
        SelectProps={{
          MenuProps: {
            style: { zIndex: 1501 },
          },
        }}
        select={select}
      >
        {children}
      </TextField>
      {errorMessage ? (
        <Typography sx={{ color: theme.redText.val }} style={{ marginLeft: 5 }}>
          {errorMessage}
        </Typography>
      ) : null}
    </>
  );
};

export const SmallInput = ({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (e: any) => void;
  placeholder: string;
  disabled?: boolean;
}) => {
  const theme = useTheme();
  const classes = useStyles();
  return (
    <TextField
      disabled={disabled}
      inputProps={{
        style: {
          textAlign: "right",
          padding: 2,
          background: theme.baseBackgroundL1.val,
          borderRadius: 5,
          outline: "none",
          color: theme.baseTextMedEmphasis.val,
          fontSize: "14px",
        },
      }}
      sx={{
        // textFieldRoot
        color: theme.baseTextMedEmphasis.val,
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            border: "none",
            color: theme.baseTextMedEmphasis.val,
          },
        },
      }}
      classes={{
        root: classes.textFieldRoot,
      }}
      style={{
        width: 100,
        padding: 0,
        borderRadius: 5,
        border: "none",
        outline: "none",
      }}
      className={classes.smallInput}
      placeholder={placeholder}
      type="text"
      value={value}
      onChange={onChange}
    />
  );
};
