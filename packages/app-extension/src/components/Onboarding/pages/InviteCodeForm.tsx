import { useCustomTheme } from "@coral-xyz/themes";
import { ArrowForward } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { createPopup } from "@typeform/embed";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton, SubtextParagraph } from "../../common";
import { BackpackHeader } from "../../Locked";
import { getWaitlistId, setWaitlistId } from "../../common/WaitingRoom";
import { TextInput } from "../../common/Inputs";

export const InviteCodeForm = () => {
  const [error, setError] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [waitlistResponseId, setWaitlistResponseId] = useState(
    getWaitlistId() || ""
  );
  const navigate = useNavigate();
  const theme = useCustomTheme();

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
          throw new Error("Invite Code is not valid");
        }
        const res = await fetch(
          `https://invites.xnfts.dev/check/${inviteCode}`,
          {
            headers: {
              "x-backpack-invite-code": inviteCode,
              "x-backpack-waitlist-id": getWaitlistId() || "",
            },
          }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        navigate(inviteCode);
      } catch (err: any) {
        setError(err.message);
      }
    },
    [inviteCode]
  );

  return (
    <>
      <Box style={{ flex: 1, textAlign: "center", padding: "32px 16px 0" }}>
        <BackpackHeader
          alphaStyle={{
            marginRight: "42px",
          }}
        />
      </Box>

      <form
        onSubmit={handleSubmit}
        style={{ padding: "0 16px 16px" }}
        noValidate
      >
        <Box style={{ marginBottom: 8 }}>
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
            placeholder={"Invite Code"}
            type="text"
            value={inviteCode}
            setValue={(e) => {
              setInviteCode(e.target.value.replace(/[^a-zA-Z0-9\\-]/g, ""));
            }}
            error={error ? true : false}
            errorMessage={error}
          />
        </Box>

        <PrimaryButton label="Go" type="submit" />

        <Box style={{ textAlign: "center", cursor: "pointer" }}>
          <Box style={{ marginTop: 16 }}>
            {waitlistResponseId ? (
              <SubtextParagraph
                onClick={() => navigate("/waitingRoom")}
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
                Apply for an Invite Code
              </SubtextParagraph>
            )}
          </Box>

          <Box
            style={{
              marginTop: 16,
            }}
          >
            <SubtextParagraph onClick={() => navigate("/recover")}>
              I already have an account
            </SubtextParagraph>
          </Box>
        </Box>
      </form>
    </>
  );
};
