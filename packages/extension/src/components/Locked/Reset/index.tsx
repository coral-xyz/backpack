import { ResetWelcome } from "./ResetWelcome";

export function Reset({ closeDrawer }: { closeDrawer: () => void }) {
  return <ResetWelcome onClose={closeDrawer} />;
}
