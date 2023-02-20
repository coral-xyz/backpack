import React, { useEffect, useState } from "react";
import type { BarterResponse } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { SecondaryButton, SuccessButton } from "@coral-xyz/react-common";
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
  const theme = useCustomTheme();
  return (
    <>
      <div
        style={{
          display: "flex",
          background: "#0057EB",
          borderRadius: 16,
          color: "white",
          fontWeight: 500,
          fontSize: 14,
          padding: 15,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginRight: 5,
          }}
        >
          <div>You negotiated a barter. </div>
        </div>
        <div
          style={{ color: theme.custom.colors.icon, cursor: "pointer" }}
          onClick={() => setModal(true)}
        >
          {" "}
          <b> VIEW </b>{" "}
        </div>
      </div>
      {modal && (
        <InternalModal modal={modal} setModal={setModal} barterId={barterId} />
      )}
    </>
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
        {!barterState && "loading"}
        {barterState && (
          <div style={{ display: "flex" }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                borderRight: `1px solid ${theme.custom.colors.icon}`,
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  padding: 10,
                  color: theme.custom.colors.background,
                }}
              >
                Your offer
              </div>
              <br />
              <div style={{ height: "100%", flex: 1 }}>
                <RemoteSelection selection={barterState?.localOffers || []} />
              </div>
              <div style={{ padding: 10 }}>
                <SecondaryButton
                  label={"Execute"}
                  onClick={() => {
                    // send request to contract
                  }}
                />
              </div>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                borderLeft: `1px solid ${theme.custom.colors.icon}`,
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  padding: 10,
                  color: theme.custom.colors.background,
                }}
              >
                Their offer
              </div>
              <br />
              <div style={{ height: "100%", flex: 1 }}>
                <RemoteSelection selection={barterState?.remoteOffers || []} />
              </div>
              <div style={{ padding: 10 }}>
                <SecondaryButton
                  label={"Execute"}
                  onClick={() => {
                    // send request to contract
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </Box>
    </Modal>
  );
}
