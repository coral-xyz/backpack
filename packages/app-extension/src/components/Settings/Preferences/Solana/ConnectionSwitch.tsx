import { Check } from "@mui/icons-material";
import { useCustomTheme } from "@coral-xyz/themes";
import { UI_RPC_METHOD_CONNECTION_URL_UPDATE } from "@coral-xyz/common";
import { useBackgroundClient, useSolanaConnectionUrl } from "@coral-xyz/recoil";
import { useDrawerContext } from "../../../Layout/Drawer";
import { SettingsList } from "../../../common/Settings/List";

const MAINNET = "https://solana-api.projectserum.com";
const DEVNET = "https://api.devnet.solana.com";
const LOCALNET = "http://localhost:8899";

export function PreferencesSolanaConnection() {
  const { close } = useDrawerContext();
  const background = useBackgroundClient();
  const currentUrl = useSolanaConnectionUrl();
  const menuItems = {
    "Mainnet (Beta)": {
      onClick: () => changeNetwork(MAINNET),
      detail: currentUrl === MAINNET ? <Checkmark /> : <></>,
    },
    Devnet: {
      onClick: () => changeNetwork(DEVNET),
      detail: currentUrl === DEVNET ? <Checkmark /> : <></>,
    },
    Localnet: {
      onClick: () => changeNetwork(LOCALNET),
      detail: currentUrl === LOCALNET ? <Checkmark /> : <></>,
    },
    Custom: {
      onClick: () =>
        changeNetwork(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          new URL(prompt("Enter your custom endpoint")!.trim()).toString()
        ),
      detail:
        currentUrl !== MAINNET &&
        currentUrl !== DEVNET &&
        currentUrl !== LOCALNET ? (
          <Checkmark />
        ) : (
          <></>
        ),
    },
  };

  const changeNetwork = (url: string) => {
    try {
      background
        .request({
          method: UI_RPC_METHOD_CONNECTION_URL_UPDATE,
          params: [url],
        })
        .then(close)
        .catch(console.error);
    } catch (err) {
      console.error(err);
    }
  };

  return <SettingsList menuItems={menuItems} />;
}

export function Checkmark() {
  const theme = useCustomTheme();
  return (
    <Check
      style={{
        color: theme.custom.colors.activeNavButton,
      }}
    />
  );
}
