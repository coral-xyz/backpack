import { PrimaryButton } from "@coral-xyz/react-common";
import { useDarkMode } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Link, Stack, SvgIcon } from "@mui/material";

import { Header } from "../../../../common";

export function ConnectHardwareKeystoneTutorial({
  onNext,
}: {
  onNext: () => void;
}) {
  const theme = useCustomTheme();
  const isDarkMode = useDarkMode();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box px={3}>
        <Header
          text={
            <>
              <SvgIcon
                viewBox="0 0 32 32"
                sx={{
                  verticalAlign: "middle",
                  width: "32px",
                  height: "32px",
                  marginRight: "8px",
                }}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.7904 1.14688C15.2999 1.3869 15.6775 0.773279 10.2478 10.1551C9.38207 11.651 7.95387 14.1172 7.07396 15.6356C6.19414 17.154 5.38198 18.6413 5.26919 18.9406C4.97426 19.7236 4.91645 20.8211 5.12167 21.7381C5.46653 23.2787 6.17434 24.9719 6.59604 25.2653C6.89407 25.4727 7.27843 25.4474 7.55121 25.2023C7.67968 25.0869 9.01779 22.8743 10.5247 20.2853C12.0318 17.6963 14.5096 13.4439 16.0311 10.8356C17.5526 8.22729 18.8816 5.90413 18.9844 5.67324C19.1276 5.35165 19.1628 5.10874 19.1348 4.63642C19.0944 3.95643 18.9814 3.69124 18.1379 2.29695C17.7296 1.6219 17.5147 1.3636 17.228 1.20318C16.7829 0.954207 16.2284 0.932395 15.7904 1.14688ZM19.6208 8.84138C19.1129 9.10825 18.9199 9.38426 17.3683 12.0633C16.1451 14.1753 16.0179 14.5285 16.2398 15.1965C16.3956 15.6656 16.7739 16.0852 17.2241 16.2883C17.565 16.4422 17.8876 16.4595 20.4184 16.4595C22.9418 16.4595 23.2725 16.4418 23.6089 16.2896C24.0916 16.0713 24.6479 15.457 24.7751 15.0021C25.0187 14.1306 24.9308 13.9026 23.254 11.0572C21.9664 8.87196 21.7871 8.70194 20.7175 8.65141C20.1492 8.62448 19.9767 8.6544 19.6208 8.84138ZM13.0783 20.1501C12.4851 20.4437 12.3945 20.5642 11.1234 22.7524C9.87612 24.8994 9.77985 25.1196 9.77318 25.8399C9.76661 26.5477 10.163 27.4066 10.6751 27.7946C10.8613 27.9357 12.3908 28.7001 14.0739 29.4933C16.9658 30.8561 17.1716 30.938 17.8154 30.9825C18.4396 31.0256 18.5469 31.005 19.0949 30.7371C19.8042 30.3901 20.7804 29.4162 21.1206 28.716C21.4299 28.0796 21.437 27.0542 21.1365 26.3908C20.8356 25.7265 15.5719 20.4625 14.8821 20.1363C14.2589 19.8414 13.693 19.8458 13.0783 20.1501Z"
                  fill={isDarkMode ? "#fff" : "#040A18"}
                />
                <path
                  d="M17.687 20.032C17.4193 19.4173 17.6336 18.7874 18.2358 18.4184C18.5312 18.2373 18.6755 18.2318 22.4828 18.2562C26.3988 18.2811 26.4271 18.2826 26.9145 18.5015C27.7851 18.8925 28.5294 19.906 28.5327 20.7048C28.5362 21.5463 28.4144 21.7331 26.8177 23.3378C25.1151 25.0487 24.7078 25.3202 23.8485 25.3168C22.9285 25.3132 22.6908 25.1407 20.1502 22.6337C18.8673 21.3677 17.7589 20.197 17.687 20.032Z"
                  fill="#2161FF"
                />
              </SvgIcon>
              <span style={{ verticalAlign: "middle" }}>Tutorial</span>
            </>
          }
        />
        <Stack spacing={2} mt={3}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "10px 16px",
              borderWidth: "2px",
              borderColor: theme.custom.colors.borderColor,
              borderStyle: "solid",
              borderRadius: "12px",
            }}
          >
            <Box mr={2} color={theme.custom.colors.fontColor}>
              1
            </Box>
            <Box fontSize={14} color={theme.custom.colors.fontColor3}>
              Tap{" "}
              <span style={{ color: theme.custom.colors.fontColor }}>
                Connect Software Wallet
              </span>{" "}
              on the Keystone device
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "10px 16px",
              borderWidth: "2px",
              borderColor: theme.custom.colors.borderColor,
              borderStyle: "solid",
              borderRadius: "12px",
            }}
          >
            <Box mr={2} color={theme.custom.colors.fontColor}>
              2
            </Box>
            <Box fontSize={14} color={theme.custom.colors.fontColor3}>
              Select Backpack Wallet
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "10px 16px",
              borderWidth: "2px",
              borderColor: theme.custom.colors.borderColor,
              borderStyle: "solid",
              borderRadius: "12px",
            }}
          >
            <Box mr={2} color={theme.custom.colors.fontColor}>
              3
            </Box>
            <Box fontSize={14} color={theme.custom.colors.fontColor3}>
              Scan the QR code on the Keystone device and click the button below
            </Box>
          </Box>
        </Stack>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
        }}
      >
        <PrimaryButton label="Next" onClick={onNext} />
        <Box textAlign="center" py={2}>
          <Link
            href="https://keyst.one/t/backpack"
            target="_blank"
            sx={{
              color: theme.custom.colors.fontColor3,
              textDecorationColor: theme.custom.colors.fontColor3,
            }}
          >
            Click here to view detailed tutorial
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
