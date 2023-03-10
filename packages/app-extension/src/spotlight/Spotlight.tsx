import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useBreakpoints } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import { SpotlightSearchBar } from "./SearchBar";
import { SearchBody } from "./SearchBody";

const style = {
  position: "absolute",
  top: "15%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: 24,
};

export const Spotlight = () => {
  const [open, setOpen] = useState(false);
  const theme = useCustomTheme();
  const { isXs } = useBreakpoints();

  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    function keyDownTextField(e: any) {
      if (e.key === "k" && e.metaKey) {
        setOpen(true);
        e.preventDefault();
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", keyDownTextField);

    return () => {
      document.removeEventListener("keydown", keyDownTextField);
    };
  }, []);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
    >
      <Box
        sx={{ ...style }}
        style={{
          background: theme.custom.colors.background,
          width: isXs ? 350 : 400,
        }}
      >
        <SpotlightSearchBar
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
        />
        <SearchBody searchFilter={searchFilter} />
      </Box>
    </Modal>
  );
};
