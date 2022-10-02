const WAITLIST_RES_ID_KEY = "waitlist-form-res-id";

export const setWaitlistId = (responseId: string) =>
  window.localStorage.setItem(WAITLIST_RES_ID_KEY, responseId);

export const getWaitlistId = () =>
  window.localStorage.getItem(WAITLIST_RES_ID_KEY) ?? undefined;

const WaitingRoom = () => (
  <iframe
    style={{
      border: "none",
      height: "100%",
      width: "100%",
      overflow: "hidden",
    }}
    allow="clipboard-read; clipboard-write"
    src={`https://beta-waiting-room.vercel.app/?id=${getWaitlistId()}&v=2`}
  />
);

export default WaitingRoom;
