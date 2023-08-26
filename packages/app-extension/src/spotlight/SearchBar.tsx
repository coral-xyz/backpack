import { TextInput } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
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
  const theme = useCustomTheme();

  return (
    <TextInput
      autoFocus
      className={classes.searchField}
      placeholder="Search"
      startAdornment={
        <SearchIcon sx={{ color: theme.custom.colors.icon, mr: "10px" }} />
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
