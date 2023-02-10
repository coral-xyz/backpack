import { useActiveWallet, useBlockchainLogo } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";

import { WalletDrawerButton } from "../WalletList";

import { useBreakpoints, useWindowSize } from "./hooks";

// This component wraps a set of component children, cutting out a "notch" at
// the top of the view.
//
// Note to self: can play with svg paths here https://yqnn.github.io/svg-path-editor/.
export function WithNotchCutout({ children }: { children: any }) {
  const theme = useCustomTheme();
  const { isXs } = useBreakpoints();
  const { width, height } = useWindowSize();

  const rightStart = width * (278 / 375.0);
  const rightXs = [
    rightStart,
    rightStart - (278 - 266.022),
    rightStart - (278 - 264.525),
    rightStart - (278 - 262.936),
    rightStart - (278 - 261.143),
    rightStart - (278 - 259.234),
    rightStart - (278 - 242),
  ];
  const leftStart = width * (97 / 375.0);
  const leftXs = [
    leftStart,
    leftStart + (108.978 - 97),
    leftStart + (110.475 - 97),
    leftStart + (112.064 - 97),
    leftStart + (113.857 - 97),
    leftStart + (115.766 - 97),
    leftStart + (133 - 97),
  ];

  return isXs ? (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 100vw 100vh"
        fill="none"
      >
        <defs>
          <clipPath id="notch">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d={`
M97 0
H0
V${height}
H${width}
V0
H${rightXs[0]}
C${rightXs[1]} 0 ${rightXs[2]} 7.94287 ${rightXs[3]} 16.3667
C${rightXs[4]} 25.8769 ${rightXs[5]} 36 ${rightXs[6]} 36
H${leftXs[6]}
C${leftXs[5]} 36 ${leftXs[4]} 25.877 ${leftXs[3]} 16.3668
C${leftXs[2]} 7.943 ${leftXs[1]} 0 ${leftXs[0]} 0
Z`}
              fill="#18181B"
            />
          </clipPath>
        </defs>
      </svg>
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          top: 0,
          clipPath: `url(#notch)`,
        }}
      >
        <div
          style={{
            position: "relative",
            height: "100%",
            paddingTop: 4,
            clipPath: `url(#notch)`,
          }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            style={{
              height: "100%",
              clipPath: `url(#notch)`,
              background: theme.custom.colors.backgroundBackdrop,
              backgroundColor: theme.custom.colors.backgroundBackdrop,
            }}
          >
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    children
  );
}

// The background view that the notch cutout allows one to see.
export function NotchBackground() {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        background: theme.custom.colorsInverted.background,
        backgroundColor: theme.custom.colorsInverted.background,
        position: "absolute",
        inset: 0,
      }}
    >
      <Notch />
    </div>
  );
}

function Notch() {
  const theme = useCustomTheme();
  const wallet = useActiveWallet();
  const blockchainLogo = useBlockchainLogo(wallet.blockchain);
  return (
    <div
      style={{
        width: "109px",
        marginLeft: "auto",
        marginRight: "auto",
        height: 40,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: theme.custom.colorsInverted.background,
          borderBottomRightRadius: "18px",
          borderBottomLeftRadius: "18px",
          borderRadius: "40px",
          height: "36px",
          display: "flex",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginRight: 13,
          }}
        >
          <img
            src={blockchainLogo}
            style={{
              height: 12.6,
            }}
          />
        </div>
        <WalletDrawerButton
          wallet={wallet}
          style={{
            background: theme.custom.colorsInverted.background,
            borderBottomRightRadius: "14px",
            borderBottomLeftRadius: "14px",
            flex: 1,
          }}
          useNotch={true}
        />
      </div>
    </div>
  );
}
