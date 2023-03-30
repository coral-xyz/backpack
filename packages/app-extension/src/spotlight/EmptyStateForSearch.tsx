import React from "react";
import { useCustomTheme } from "@coral-xyz/themes";
import { Explore } from "@mui/icons-material";
import { Divider } from "@mui/material";

import { useStyles } from "./styles";

interface IEmptyStateForSearchProps {
  searchString: string;
}

const EmptyStateForSearch: React.FC<IEmptyStateForSearchProps> = ({
  searchString,
}) => {
  const styleClasses = useStyles();
  const theme = useCustomTheme();

  const onSearchWebForSearchString = () => {
    window.open(`https://www.google.com/search?q=${searchString}`, "_blank");
  };

  return (
    <div className={styleClasses.searchBarWrapper}>
      <div className={styleClasses.emptyStateTitleWrapper}>Nothing found!</div>

      <Divider className={styleClasses.divider} />
      <div
        className={styleClasses.searchWebWrapper}
        onClick={onSearchWebForSearchString}
      >
        <Explore sx={{ color: theme.custom.colors.icon }} fontSize="large" />
        <div className={styleClasses.searchWebText}>Search the web</div>
      </div>
    </div>
  );
};

export default EmptyStateForSearch;
