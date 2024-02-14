import { useTranslation } from "@coral-xyz/i18n";
import {
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
} from "@coral-xyz/tamagui";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

import { TextInput } from "./Inputs";

export const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  searchField: {
    marginTop: "0px !important",
    marginBottom: "16px",
    width: "inherit",
    display: "flex",
    "& .MuiOutlinedInput-root": {
      "& input": {
        paddingTop: 0,
        paddingBottom: 0,
      },
      "& fieldset": {
        border: `${theme.baseBorderLight.val} !important`,
      },
    },
  },
}));

export const SearchBox = ({
  onChange,
  placeholder,
  searchFilter,
  setSearchFilter,
}: {
  onChange: any;
  placeholder?: string;
  searchFilter: string;
  setSearchFilter: any;
}) => {
  const theme = useTheme();
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <TextInput
      className={classes.searchField}
      placeholder={placeholder ?? t("enter_username_or_address")}
      value={searchFilter}
      startAdornment={
        <InputAdornment position="start">
          <SearchIcon style={{ color: theme.baseIcon.val }} />
        </InputAdornment>
      }
      setValue={async (e) => {
        const prefix = e.target.value;
        setSearchFilter(prefix);
        onChange(prefix);
      }}
      inputProps={{
        style: {
          height: "48px",
        },
      }}
    />
  );
};
