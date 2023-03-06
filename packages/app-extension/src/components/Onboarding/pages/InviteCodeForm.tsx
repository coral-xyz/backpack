import { type FormEvent, useCallback, useEffect, useState } from "react";
import { TextInput } from "@coral-xyz/react-common";
// @ts-ignore
import { PrimaryButton } from "@coral-xyz/react-native-core";
import { styles } from "@coral-xyz/themes";
import { ArrowForward } from "@mui/icons-material";
import { Box } from "@mui/material";
import { createPopup } from "@typeform/embed";

import { SubtextParagraph } from "../../common";
import { getWaitlistId, setWaitlistId } from "../../common/WaitingRoom";
import { BackpackHeader } from "../../Locked";

const useStyles = styles(() => ({
  inviteCodeBox: {
    "& .MuiFormControl-root": {
      marginTop: 0,
    },
  },
}));

export const InviteCodeForm = ({
  onClickRecover,
  onClickWaiting,
  onSubmit,
}: {
  onClickRecover: () => void;
  onClickWaiting: () => void;
  onSubmit: (inviteCode: string) => void;
}) => {
  const [error, setError] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [waitlistResponseId, setWaitlistResponseId] = useState(
    getWaitlistId() || ""
  );
  const classes = useStyles();

  useEffect(() => {
    setError("");
  }, [inviteCode]);

  const typeform = createPopup("PCnBjycW", {
    autoClose: true,
    onSubmit({ responseId }) {
      setWaitlistId(responseId);
      setWaitlistResponseId(responseId);
    },
  });

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      try {
        if (
          !inviteCode.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/
          )
        ) {
          throw new Error("Invite code is not valid");
        }
        const res = await fetch(
          `https://invites.xnfts.dev/check/${inviteCode}`
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        onSubmit(inviteCode);
      } catch (err: any) {
        setError(err.message);
      }
    },
    [inviteCode]
  );

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

      <form
        onSubmit={handleSubmit}
        style={{
          padding: "0 16px 36px",
          paddingBottom: 0,
          marginTop: 0,
        }}
        noValidate
      >
        <Box style={{ marginBottom: 8 }} className={classes.inviteCodeBox}>
          <TextInput
            inputProps={{
              name: "inviteCode",
              autoComplete: "off",
              spellCheck: "false",
              style: {
                // slightly smaller text so it fits
                fontSize: "0.9em",
              },
              autoFocus: true,
            }}
            placeholder="Invite code"
            type="text"
            value={inviteCode}
            setValue={(e: any) => {
              setInviteCode(e.target.value.replace(/[^a-zA-Z0-9\\-]/g, ""));
            }}
            error={error ? true : false}
            errorMessage={error}
          />
        </Box>

        <PrimaryButton label="Go" type="submit" />

        <Box style={{ textAlign: "center", cursor: "pointer" }}>
          <Box style={{ marginTop: 24 }}>
            {waitlistResponseId ? (
              <SubtextParagraph
                onClick={onClickWaiting}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/blue_ball.png"
                  height="20px"
                  width="20px"
                  style={{ marginRight: "4px" }}
                />
                Waiting Room
                <ArrowForward sx={{ marginLeft: "4px", fontSize: "18px" }} />
              </SubtextParagraph>
            ) : (
              <SubtextParagraph onClick={typeform.open}>
                Apply for an invite code
              </SubtextParagraph>
            )}
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
      </form>
    </div>
  );
};
