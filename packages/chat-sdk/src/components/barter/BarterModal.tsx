import React, { useEffect , useState } from "react";
import type { BarterResponse } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

import { SwapPage } from "./SwapPage";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
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
      <div onClick={() => setModal(true)}> More details.</div>
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
  modal: bolean;
  setModal: any;
}) {
  const [barterState, setBarterState] = useState<BarterResponse | null>(null);

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
      <Box sx={style}>
        <Typography id="transition-modal-title" variant="h6" component="h2">
          Barter
        </Typography>

        {!barterState && "loading"}
        {barterState && (
          <div>
            <SwapPage
              localSelection={barterState?.localOffers || []}
              remoteSelection={barterState?.remoteOffers || []}
              finalized={true}
            />
          </div>
        )}
      </Box>
    </Modal>
  );
}
