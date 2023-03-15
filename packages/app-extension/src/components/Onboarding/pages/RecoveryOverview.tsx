import { type ServerPublicKey, walletAddressDisplay } from "@coral-xyz/common";
import { ProxyImage } from "@coral-xyz/react-common";
import { useAvatarUrl } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export const RecoveryOverview = ({
  onNext,
  publicKeys,
  username,
}: {
  onNext: () => void;
  publicKeys: ServerPublicKey[];
  username: string | null;
}) => {
  const theme = useCustomTheme();
  const avatar = useAvatarUrl(72, username ?? undefined);

  return (
    <Box
      sx={{
        mt: "8px",
        mx: "32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: theme.custom.colors.fontColor,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          mb: "32px",
        }}
      >
        <ProxyImage
          src={avatar}
          style={{ borderRadius: "50%", height: 72, width: 72 }}
        />
        <Typography sx={{ mt: "16px", mb: "8px", fontSize: 24 }}>
          Some wallets need to be manually recovered
        </Typography>
        <Typography sx={{ color: theme.custom.colors.secondary, fontSize: 16 }}>
          Continue to recover wallets.
        </Typography>
      </Box>
      <Box>
        {publicKeys.map((pk) => (
          <div>
            {pk.blockchain} - {walletAddressDisplay(pk.publicKey)}
          </div>
        ))}
      </Box>
      <Typography
        sx={{ cursor: "pointer", mt: "20px", fontSize: 16 }}
        onClick={onNext}
      >
        Maybe later
      </Typography>
    </Box>
  );
};
