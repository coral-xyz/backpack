import { useTranslation } from "@coral-xyz/i18n";
import { TextInput } from "@coral-xyz/react-common";
import { useTheme } from "@coral-xyz/tamagui";
import SearchIcon from "@mui/icons-material/Search";

import { useStyles } from "./styles";

export const SpotlightSearchBar = ({
  searchFilter,
  setSearchFilter,
}: {
  searchFilter: string;
  setSearchFilter: any;
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <TextInput
      autoFocus
      className={classes.searchField}
      placeholder={t("search")}
      startAdornment={
        <SearchIcon sx={{ color: theme.baseIcon.val, mr: "10px" }} />
      }
      value={searchFilter}
      setValue={async (e) => {
        const prefix = e.target.value;
        setSearchFilter(prefix);
      }}
      inputProps={{
        style: {
          height: "48px",
        },
      }}
    />
  );
};
