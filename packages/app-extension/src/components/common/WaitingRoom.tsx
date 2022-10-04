import { useDarkMode, useUsername } from "@coral-xyz/recoil";
import { useEffect } from "react";
import { useNavStack } from "./Layout/NavStack";
import SocialNavbarButtons from "./SocialNavbarButtons";

const WAITLIST_RES_ID_KEY = "waitlist-form-res-id";

export const setWaitlistId = (responseId: string) =>
  window.localStorage.setItem(WAITLIST_RES_ID_KEY, responseId);

export const getWaitlistId = () =>
  window.localStorage.getItem(WAITLIST_RES_ID_KEY) ?? undefined;

const WaitingRoom = ({ onboarded }: { onboarded?: boolean }) => {
  const isDarkMode = useDarkMode();

  let nav: ReturnType<typeof useNavStack>;

  if (onboarded) {
    nav = useNavStack();
  }

  useEffect(() => {
    let previousTitle: string;
    if (onboarded && nav) {
      previousTitle = nav.title;
      nav.setTitle("");
      nav.setNavButtonRight(<SocialNavbarButtons />);
    }

    return () => {
      if (onboarded && nav) {
        nav.setTitle(previousTitle);
        nav.setNavButtonRight();
      }
    };
  }, []);

  return (
    <iframe
      style={{
        border: "none",
        height: "98%",
        width: "100%",
        overflow: "hidden",
      }}
      allow="clipboard-read; clipboard-write"
      src={`https://beta-waiting-room.vercel.app/?id=${
        onboarded ? useUsername() : getWaitlistId()
      }&onboarded=${onboarded ?? false}&theme=${
        isDarkMode ? "dark" : "light"
      }&v=2`}
    />
  );
};

export default WaitingRoom;
