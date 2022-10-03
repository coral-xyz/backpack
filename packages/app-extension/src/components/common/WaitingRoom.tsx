import { useUsername } from "@coral-xyz/recoil";
import { useEffect } from "react";
import { useNavStack } from "./Layout/NavStack";

const WAITLIST_RES_ID_KEY = "waitlist-form-res-id";

export const setWaitlistId = (responseId: string) =>
  window.localStorage.setItem(WAITLIST_RES_ID_KEY, responseId);

export const getWaitlistId = () =>
  window.localStorage.getItem(WAITLIST_RES_ID_KEY) ?? undefined;

const WaitingRoom = ({ onboarded }: { onboarded?: boolean }) => {
  const nav = useNavStack();

  useEffect(() => {
    nav.setTitle("");
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
      }&onboarded=${onboarded ?? false}&v=2`}
    />
  );
};

export default WaitingRoom;
