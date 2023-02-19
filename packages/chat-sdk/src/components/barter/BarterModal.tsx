import React, { useEffect, useState } from "react";
import type { BarterResponse } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { SuccessButton } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

import { RemoteSelection } from "./SwapPage";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export const BarterModal = ({ barterId }: { barterId: string }) => {
  const [modal, setModal] = useState(false);
  return (
    <div style={{ textAlign: "center" }}>
      You negotiated a barter.{" "}
      <div onClick={() => setModal(true)}>
        {" "}
        <b> More details. </b>{" "}
      </div>
      {modal && (
        <InternalModal modal={modal} setModal={setModal} barterId={barterId} />
      )}
    </div>
  );
};

function InternalModal({
  barterId,
  modal,
  setModal,
}: {
  barterId: string;
  modal: boolean;
  setModal: any;
}) {
  const [barterState, setBarterState] = useState<BarterResponse | null>(null);
  const theme = useCustomTheme();

  const getBarter = async ({ barterId }: { barterId: string }) => {
    const res = await fetch(`${BACKEND_API_URL}/barter/?barterId=${barterId}`, {
      method: "GET",
    });
    const json = await res.json();
    setBarterState(json.barter);
  };

  useEffect(() => {
    getBarter({ barterId });
  }, [barterId]);

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={modal}
      onClose={() => setModal(false)}
      closeAfterTransition
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Box
        sx={{
          ...style,
          background: theme.custom.colors.invertedTertiary,
        }}
      >
        <Typography
          id="transition-modal-title"
          variant="h6"
          component="h2"
          style={{ color: theme.custom.colors.background }}
        >
          Barter
        </Typography>

        {!barterState && "loading"}
        {barterState && (
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1, marginRight: 20 }}>
              <div
                style={{
                  fontSize: 25,
                  padding: 10,
                  color: theme.custom.colors.background,
                }}
              >
                Your offer
              </div>
              <br />
              <RemoteSelection selection={barterState?.localOffers || []} />
              <SuccessButton
                label={"Execute"}
                onClick={() => {
                  // send request to contract
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 25,
                  padding: 10,
                  color: theme.custom.colors.background,
                }}
              >
                Their offer
              </div>
              <br />
              <RemoteSelection selection={barterState?.remoteOffers || []} />
              <SuccessButton
                label={"Execute"}
                onClick={() => {
                  // send request to contract
                }}
              />
            </div>
          </div>
        )}
      </Box>
    </Modal>
  );
}
