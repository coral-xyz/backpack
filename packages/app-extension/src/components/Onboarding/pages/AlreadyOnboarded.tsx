import { EmptyState } from "@coral-xyz/react-common";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export const AlreadyOnboarded = () => {
  return (
    <EmptyState
      icon={(props: any) => <ErrorOutlineIcon {...props} />}
      title="Already setup"
      subtitle="Your Backpack has already been setup. If you want to set it up again, reset it first."
      buttonText="Close"
      onClick={window.close}
    />
  );
};
