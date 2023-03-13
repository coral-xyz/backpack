import { type FormEvent, useCallback, useEffect, useState } from "react";
import { PrimaryButton, TextInput } from "@coral-xyz/react-common";
import { styles } from "@coral-xyz/themes";
import { ArrowForward } from "@mui/icons-material";
import { Box } from "@mui/material";
import { createPopup } from "@typeform/embed";

import { SubtextParagraph } from "../../common";
import { BackpackHeader } from "../../Locked";

const WAITLIST_RES_ID_KEY = "waitlist-form-res-id";

export const setWaitlistId = (responseId: string) =>
  window.localStorage.setItem(WAITLIST_RES_ID_KEY, responseId);

export const getWaitlistId = () =>
  window.localStorage.getItem(WAITLIST_RES_ID_KEY) ?? undefined;

const useStyles = styles(() => ({
  inviteCodeBox: {
    "& .MuiFormControl-root": {
      marginTop: 0,
    },
  },
}));

export const InviteCodeForm = ({
  onClickRecover,
  onSubmit,
}: {
  onClickRecover: () => void;
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
                style={{
                  cursor: "default",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                You're already on the waitlist
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
