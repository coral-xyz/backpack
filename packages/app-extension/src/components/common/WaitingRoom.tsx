import { useEffect } from "react";
import { useDarkMode, useUser } from "@coral-xyz/recoil";

import { WithNav } from "../common/Layout/Nav";

import { useNavigation } from "./Layout/NavStack";
import SocialNavbarButtons from "./SocialNavbarButtons";

const WAITLIST_RES_ID_KEY = "waitlist-form-res-id";

export const setWaitlistId = (responseId: string) =>
  window.localStorage.setItem(WAITLIST_RES_ID_KEY, responseId);

export const getWaitlistId = () =>
  window.localStorage.getItem(WAITLIST_RES_ID_KEY) ?? undefined;

const WaitingRoom = ({ onboarded }: { onboarded?: boolean }) => {
  const isDarkMode = useDarkMode();

  let nav: ReturnType<typeof useNavigation>;

  if (onboarded) {
    nav = useNavigation();
  }

  useEffect(() => {
    let previousTitle: string;
    if (onboarded && nav) {
      previousTitle = nav.title;
      nav.setOptions({
        headerTitle: "",
        headerRight: <SocialNavbarButtons />,
      });
    }

    return () => {
      if (onboarded && nav) {
        nav.setOptions({ headerTitle: previousTitle, headerRight: null });
      }
    };
  }, []);

  const iframe = (
    <iframe
      style={{
        border: "none",
        height: "98%",
        width: "100%",
        overflow: "hidden",
      }}
      allow="clipboard-read; clipboard-write"
      src={`https://beta-waiting-room.vercel.app/?id=${
        onboarded ? useUser().username : getWaitlistId()
      }&onboarded=${onboarded ?? false}&theme=${
        isDarkMode ? "dark" : "light"
      }&v=2`}
    />
  );

  if (onboarded) return iframe;

  return (
    <WithNav
      navButtonRight={<SocialNavbarButtons />}
      navbarStyle={{
        borderRadius: "12px",
      }}
      navContentStyle={{
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
      }}
    >
      {iframe}
    </WithNav>
  );
};

export default WaitingRoom;
