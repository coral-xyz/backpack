import "@typeform/embed/build/css/popup.css";

import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Typography } from "@mui/material";
import { createPopup } from "@typeform/embed";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { PrimaryButton, SubtextParagraph, TextField } from "../common";
import WaitingRoom, { setWaitlistId, getWaitlistId } from "./WaitingRoom";

type Page = "inviteCode" | "createUsername" | "recoverAccount";

const CheckInviteCodeForm = ({ setInviteCode }: any) => {
  const theme = useCustomTheme();
  const [value, setValue] = useState({} as any);
  const [page, setPage] = useState<Page>("inviteCode");
  const [error, setError] = useState<string>();
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [waitlistResponseId, setWaitlistResponseId] = useState<string>();

  const typeform = createPopup("PCnBjycW", {
    autoClose: true,
    onSubmit({ responseId }) {
      setWaitlistId(responseId);
      setWaitlistResponseId(responseId);
    },
  });

  // attempt to get previous typeform response ID from localstorage
  useEffect(() => {
    const id = getWaitlistId();
    if (id) setWaitlistResponseId(id);
  }, []);

  // reset error when textfield value or the form changes
  useEffect(() => {
    setError(undefined);
  }, [value, page]);

  const ob =
    page === "inviteCode"
      ? {
          disabled: true,
          linkText: "I already have an account",
          inputName: "inviteCode",
          placeholder: "Invite Code",
          buttonText: "Go",
          url: `https://invites.xnfts.dev/check/${value.inviteCode}`,
          setVal: (v: string) =>
            setValue({
              inviteCode: v.replace(/[^a-zA-Z0-9\\-]/g, ""),
            }),
          handleValue: () => {
            setPage("createUsername");
          },
          page: "recoverAccount",
        }
      : page === "createUsername"
      ? {
          description:
            "Others can see and find you by this username, so choose wisely if you'd like to remain anonymous. You will not be able to change this later.",
          linkText: "",
          inputName: "username",
          placeholder: "Username",
          buttonText: "Claim",
          url: `https://auth.xnfts.dev/users/${value.username}`,
          setVal: (v: any) =>
            setValue({
              inviteCode: value.inviteCode,
              username: v.replace(/[^a-z0-9_]/g, "").substring(0, 15),
            }),
          handleValue: () => setInviteCode(value),
          page: "inviteCode",
        }
      : {
          linkText: "I have an Invite Code",
          inputName: "username",
          placeholder: "Username",
          buttonText: "Continue",
          url: `https://auth.xnfts.dev/users/${value.username}`,
          setVal: (v: string) =>
            setValue({
              username: v.replace(/[^a-z0-9_]/g, ""),
            }),
          handleValue: () => alert(JSON.stringify(value)),
          page: "inviteCode",
        };

  const handleWaitingClick = useCallback(() => {
    if (!waitlistResponseId) {
      typeform.open();
    } else {
      setShowWaitingRoom(true);
    }
  }, [waitlistResponseId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(ob.url, {
        headers: {
          "x-backpack-invite-code": value.inviteCode,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      ob.handleValue();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {ob.description}
        <Box style={{ marginBottom: 8 }}>
          <TextField
            inputProps={{
              name: ob.inputName,
              autoComplete: "off",
              spellCheck: "false",
              style: { fontSize: "0.94em" },
            }}
            placeholder={ob.placeholder}
            type="text"
            value={value[ob.inputName] ?? ""}
            setValue={ob.setVal}
            isError={error}
            auto
          />
          {error && (
            <Typography sx={{ color: theme.custom.colors.negative }}>
              {error}
            </Typography>
          )}
        </Box>
        <PrimaryButton disabled={!value} label={ob.buttonText} type="submit" />

        {ob.linkText && (
          <>
            <Box
              style={{ marginTop: 16, cursor: "pointer" }}
              onClick={handleWaitingClick}
            >
              <SubtextParagraph>
                {waitlistResponseId
                  ? "Waiting Room"
                  : "Apply for an Invite Code"}
              </SubtextParagraph>
            </Box>

            <Box
              onClick={ob.disabled ? undefined : () => setPage(ob.page as Page)}
              style={{
                marginTop: 16,
                cursor: ob.disabled ? "default" : "pointer",
                opacity: ob.disabled ? 0.3 : 1,
              }}
              title={
                ob.disabled
                  ? "Coming soon, ask in discord if you need assistance"
                  : undefined
              }
            >
              <SubtextParagraph>{ob.linkText}</SubtextParagraph>
            </Box>
          </>
        )}
      </form>
      <WaitingRoom
        uri={`https://beta-waiting-room.vercel.app/?id=${waitlistResponseId}`}
        onClose={() => setShowWaitingRoom(false)}
        visible={showWaitingRoom}
      />
    </>
  );
};

export default CheckInviteCodeForm;
