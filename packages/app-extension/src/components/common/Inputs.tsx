import { styles, useCustomTheme } from "@coral-xyz/themes";
import { List, ListItem } from "./List";
import { TextField, Typography } from "@mui/material";

function overrideErrBorder(originalBorder: string, err: boolean, theme: any) {
  if (err) {
    return `solid 2pt ${theme.custom.colors.negative}`;
  }
  return originalBorder;
}

const useStyles = styles((theme) => ({
  textFieldRoot: {
    color: theme.custom.colors.secondary,
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: "none",
        color: theme.custom.colors.secondary,
      },
    },
  },
  textFieldInputColorEmpty: {
    color: theme.custom.colors.textPlaceholder,
  },
  textFieldInputColor: {
    color: theme.custom.colors.fontColor2,
  },
  listParent: {
    border: (props) =>
      overrideErrBorder(
        theme.custom.colors.textInputBorderFull,
        //@ts-ignore
        props.error,
        theme
      ),
    "&:hover": {
      border: (props) =>
        overrideErrBorder(
          theme.custom.colors.textInputBorderHovered,
          //@ts-ignore
          props.error,
          theme
        ),
    },
    "&:focus-within": {
      border: (props) =>
        overrideErrBorder(
          theme.custom.colors.textInputBorderFocussed,
          //@ts-ignore
          props.error,
          theme
        ),
    },
    borderRadius: "10px",
  },
  textInputRoot: {
    fontWeight: 500,
    borderRadius: "12px",
    fontSize: "16px",
    lineHeight: "24px",
    "& .MuiOutlinedInput-root": {
      background: theme.custom.colors.textBackground,
      borderRadius: "12px",
      "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
        border: (props) =>
          overrideErrBorder(
            theme.custom.colors.textInputBorderFocussed,
            //@ts-ignore
            props.error,
            theme
          ),
        outline: "none",
      },
      "& fieldset": {
        border: (props) =>
          overrideErrBorder(
            theme.custom.colors.textInputBorderFull,
            //@ts-ignore
            props.error,
            theme
          ),
      },
      "&:hover fieldset": {
        border: (props) =>
          overrideErrBorder(
            theme.custom.colors.textInputBorderHovered,
            //@ts-ignore
            props.error,
            theme
          ),
      },
      "&.Mui-focused fieldset": {
        border: (props) =>
          overrideErrBorder(
            theme.custom.colors.textInputBorderFocussed,
            //@ts-ignore
            props.error,
            theme
          ),
      },
      "&:active": {
        outline: "none",
      },
      outline: "none",
    },
  },
}));

interface InputListProps {
  children: any;
  error: boolean;
}

export const Inputs = ({ children, error }: InputListProps) => {
  const classes = useStyles({ error });
  return <List className={classes.listParent}>{children}</List>;
};

interface InputListItemProps {
  isLast?: boolean;
  isFirst?: boolean;
  title: string;
  value: string;
  placeholder: string;
  onChange: (e: any) => void;
  button: boolean;
  type?: string;
}

export const InputListItem = ({
  isLast = false,
  isFirst = false,
  title,
  value,
  onChange,
  button = false,
  placeholder,
  type = "text",
}: InputListItemProps) => {
  const theme = useCustomTheme();
  const classes = useStyles();
  return (
    <ListItem
      isLast={isLast}
      isFirst={isFirst}
      style={{
        height: "46px",
        padding: "10px",
      }}
      radius={"8px"}
      button={button}
    >
      <Typography style={{ width: "80px" }}>{title}</Typography>
      <TextField
        placeholder={placeholder}
        classes={{
          root: classes.textFieldRoot,
        }}
        className={classes.textField}
        type={type}
        inputProps={{
          style: {
            padding: 0,
          },
          className: `${classes.textFieldInput} ${
            value
              ? classes.textFieldInputColor
              : classes.textFieldInputColorEmpty
          }`,
        }}
        value={value}
        onChange={onChange}
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
}: InputProps) => {
  const classes = useStyles({ error });
  const theme = useCustomTheme();
  inputProps = Object.assign(
    {
      className: `${classes.textFieldInput} ${
        value ? classes.textFieldInputColor : classes.textFieldInputColorEmpty
      }`,
    },
    inputProps
  );
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
        inputProps={inputProps}
        className={`${classes.textInputRoot} ${classes.textField} ${className}`}
        variant="outlined"
        fullWidth
        required
        margin={margin ?? "dense"}
        disabled={disabled}
        autoFocus={autoFocus}
        InputProps={{
          startAdornment,
          endAdornment,
        }}
        select={select}
      >
        {children}
      </TextField>
      {errorMessage && (
        <Typography
          sx={{ color: theme.custom.colors.negative }}
          style={{ marginLeft: 5 }}
        >
          {errorMessage}
        </Typography>
      )}
    </>
  );
};
