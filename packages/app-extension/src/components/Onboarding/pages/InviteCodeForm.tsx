import { type FormEvent, useCallback } from "react";
import { PrimaryButton } from "@coral-xyz/react-common";
import { Box } from "@mui/material";

import { SubtextParagraph } from "../../common";
import { BackpackHeader } from "../../Locked";

const WAITLIST_RES_ID_KEY = "waitlist-form-res-id";

// export const setWaitlistId = (responseId: string) =>
//   window.localStorage.setItem(WAITLIST_RES_ID_KEY, responseId);

// export const getWaitlistId = () =>
//   window.localStorage.getItem(WAITLIST_RES_ID_KEY) ?? undefined;

export const InviteCodeForm = ({
  onClickRecover,
  onSubmit,
}: {
  onClickRecover: () => void;
  onSubmit: (inviteCode: string) => void;
}) => {
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const inviteCode = "c841a546-4898-4c63-8075-01273be0fad4";
    onSubmit(inviteCode);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        style={{
          flex: 1,
          textAlign: "center",
          padding: "32px 16px 0",
        }}
      >
        <BackpackHeader disableUsername />
      </Box>

      <Box
        style={{
          padding: "0 16px 36px",
          paddingBottom: 0,
          marginTop: 0,
        }}
      >
        <Box style={{ textAlign: "center", cursor: "pointer" }}>
          <Box style={{ marginTop: 24 }}>
            <PrimaryButton
              label="Create account"
              type="submit"
              onClick={handleSubmit}
            />
          </Box>
          <Box
            style={{
              marginTop: 24,
              marginBottom: 36,
            }}
          >
            <SubtextParagraph onClick={onClickRecover}>
              I already have an account
            </SubtextParagraph>
          </Box>
        </Box>
      </Box>
    </div>
  );
};
