import "@typeform/embed/build/css/popup.css";

import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Typography } from "@mui/material";
import { createPopup } from "@typeform/embed";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Header, PrimaryButton, SubtextParagraph, TextField } from "../common";
import WaitingRoom, { setWaitlistId, getWaitlistId } from "./WaitingRoom";
import { BackpackHeader } from "../Locked";

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
          validate: () => {
            const v = value.inviteCode;
            if (
              !v.match(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/
              )
            ) {
              setError("Invite Code is not valid");
              return false;
            } else {
              setError(undefined);
              return true;
            }
          },
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
          description: (
            <Box style={{ textAlign: "left", padding: "5px" }}>
              <Header text="Claim your username" />
              <SubtextParagraph style={{ marginTop: "16px", marginBottom: 0 }}>
                You’ll need this to unlock Backpack. Others can see and find you
                by this username.
                <br />
                <br />
                It will also be associated with your primary wallet address, so
                choose wisely if you’d like to remain anonymous.
                <br />
                <br />
                It should be 3-15 characters and it can contain letters, numbers
                and underscores.
                <br />
                <br />
                You will not be able to change it yet.
              </SubtextParagraph>
            </Box>
          ),
          linkText: "",
          inputName: "username",
          placeholder: "Username",
          buttonText: "Continue",
          url: `https://auth.xnfts.dev/users/${value.username}`,
          validate: () => {
            const v = value.username;
            if (v.length < 3) {
              setError("must be at least 3 characters");
              return false;
            } else if (v.length > 15) {
              setError("must be less than 15 characters long");
              return false;
            } else {
              setError(undefined);
              return true;
            }
          },
          setVal: (v: any) =>
            setValue({
              inviteCode: value.inviteCode,
              username: v
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, "")
                .substring(0, 15),
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
          validate: () => true,
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

    if (!ob.validate()) return;

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
      {page === "inviteCode" && (
        <BackpackHeader
          alphaStyle={{
            marginRight: "42px",
          }}
        />
      )}

      <form onSubmit={handleSubmit}>
        {ob.description && (
          <Typography style={{ marginBottom: "2em" }}>
            {ob.description}
          </Typography>
        )}
        <Box style={{ marginBottom: 8 }}>
          <TextField
            inputProps={{
              name: ob.inputName,
              autoComplete: "off",
              spellCheck: "false",
              style: { fontSize: "0.91em" },
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
