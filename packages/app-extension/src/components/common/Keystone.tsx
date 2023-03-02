import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { useEffect, useState } from "react";
import type { UR } from "@coral-xyz/common";
import {
  PrimaryButton,
  SecondaryButton,
  WarningIcon,
} from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import { AnimatedQRCode, useAnimatedQRScanner } from "@keystonehq/animated-qr";
import { Box, Drawer, Link, SvgIcon } from "@mui/material";

export enum DisplayType {
  qrcode = "qrcode",
  scanner = "scanner",
}

interface BaseProps {
  header: React.ReactNode;
  hasFooter?: boolean;
  size?: number;
  help?: React.ReactNode;
  setDisplay?: (type: DisplayType) => void;
}

type PlayProps = BaseProps & {
  ur?: UR;
};

type ScanProps = BaseProps & {
  containerRef: MutableRefObject<any>;
  urTypes: string[];
  onScan: (ur: UR) => void;
};

function KeystoneBase({
  header,
  card,
  cardSize = 200,
  help,
  footer,
  hasFooter,
}: BaseProps & {
  card: React.ReactNode;
  cardSize?: number;
  help?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const theme = useCustomTheme();
  return (
    <Box
      px={2}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "stretch",
        height: "100%",
      }}
    >
      <Box>
        {header}
        <Box>
          <Box
            sx={{
              background: theme.custom.colors.bg3,
              border: `2px solid ${theme.custom.colors.borderColor}`,
              borderRadius: "12px",
              width: cardSize,
              height: cardSize,
              boxSizing: "content-box",
              overflow: "hidden",
              position: "relative",
              margin: `${cardSize < 200 ? 12 : 20}px auto`,
            }}
          >
            {card}
          </Box>
          {help}
        </Box>
      </Box>
      {hasFooter ? <Box py={2}>{footer}</Box> : null}
    </Box>
  );
}

export function KeystoneScanner({
  containerRef,
  header,
  help,
  hasFooter = true,
  onScan,
  setDisplay,
  size = 200,
  urTypes,
}: ScanProps) {
  const [isPermissionError, setIsPermissionError] = useState<boolean>(false);
  const [isScanError, setIsScanError] = useState(false);
  const theme = useCustomTheme();

  const { AnimatedQRScanner, setIsDone, hasPermission } = useAnimatedQRScanner(
    {}
  );

  const handleError = () => {
    setIsScanError(true);
  };
  const handleScan = async (ur: { type: string; cbor: string }) => {
    onScan(ur);
  };
  const continueScan = () => {
    setIsDone(false);
    setIsScanError(false);
  };

  useEffect(() => {
    if (!hasPermission) {
      setIsPermissionError(true);
    }
  }, [hasPermission]);

  return (
    <KeystoneBase
      header={header}
      card={
        <>
          <SvgIcon
            sx={{
              fill: theme.custom.colors.fontColor,
              width: "32px",
              height: "32px",
              position: "absolute",
              top: "50%",
              left: "50%",
              margin: "-16px auto auto -16px",
            }}
            viewBox="0 0 33 32"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M22.3876 5.18828C21.952 3.88159 20.7292 3.00021 19.3518 3.00021H13.6487C12.2713 3.00021 11.0485 3.88159 10.6129 5.18828L10.0509 6.87433C9.94201 7.20101 9.6363 7.42135 9.29195 7.42135H6.5C4.29086 7.42135 2.5 9.21221 2.5 11.4214V24.0533C2.5 26.2625 4.29086 28.0533 6.5 28.0533H26.5005C28.7097 28.0533 30.5005 26.2625 30.5005 24.0533V11.4213C30.5005 9.21221 28.7097 7.42135 26.5005 7.42135H23.7086C23.3642 7.42135 23.0585 7.20101 22.9496 6.87433L22.3876 5.18828ZM16.5003 22.8954C19.3489 22.8954 21.6582 20.586 21.6582 17.7374C21.6582 14.8887 19.3489 12.5794 16.5003 12.5794C13.6516 12.5794 11.3423 14.8887 11.3423 17.7374C11.3423 20.586 13.6516 22.8954 16.5003 22.8954ZM16.5003 24.3691C20.1628 24.3691 23.132 21.3999 23.132 17.7374C23.132 14.0748 20.1628 11.1057 16.5003 11.1057C12.8377 11.1057 9.86855 14.0748 9.86855 17.7374C9.86855 21.3999 12.8377 24.3691 16.5003 24.3691ZM23.8688 9.63165C23.4619 9.63165 23.132 9.96155 23.132 10.3685C23.132 10.7755 23.4619 11.1054 23.8688 11.1054H26.0794C26.4863 11.1054 26.8162 10.7755 26.8162 10.3685C26.8162 9.96155 26.4863 9.63165 26.0794 9.63165H23.8688Z"
            />
          </SvgIcon>
          <AnimatedQRScanner
            urTypes={urTypes}
            handleError={handleError}
            handleScan={handleScan}
            options={{
              width: size,
              height: size,
              blur: false,
            }}
          />
        </>
      }
      cardSize={size}
      help={
        <>
          <Box
            fontSize={14}
            color={
              theme.custom.colors[
                isPermissionError === true ? "negative" : "fontColor3"
              ]
            }
            textAlign="center"
            mt={3}
          >
            {isPermissionError === true
              ? "Please enable your camera permission via [Settings]."
              : null}
          </Box>
          {help}
          <KeystoneScanError
            containerRef={containerRef}
            isError={isScanError}
            setIsError={setIsScanError}
            onOK={continueScan}
          />
        </>
      }
      footer={
        <SecondaryButton
          label="Back"
          onClick={() => setDisplay && setDisplay(DisplayType.qrcode)}
        />
      }
      hasFooter={hasFooter}
    />
  );
}

export function KeystoneScanError({
  containerRef,
  isError,
  setIsError,
  onOK,
}: {
  containerRef: MutableRefObject<any>;
  isError: boolean;
  setIsError: Dispatch<SetStateAction<boolean>>;
  onOK: () => void;
}) {
  const theme = useCustomTheme();

  return (
    <Drawer
      anchor="bottom"
      open={isError}
      onClose={() => setIsError(false)}
      PaperProps={{
        style: {
          position: "absolute",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        },
      }}
      BackdropProps={{
        style: {
          position: "absolute",
        },
      }}
      ModalProps={{
        container: containerRef.current,
        style: {
          position: "absolute",
          zIndex: 1500,
        },
        disableAutoFocus: true,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "12px",
          background: theme.custom.colors.backgroundBackdrop,
          padding: "24px 16px 16px",
        }}
      >
        <WarningIcon fill={theme.custom.colors.negative} />
        <Box
          m="20px 0 12px"
          textAlign="center"
          fontSize="14px"
          color={theme.custom.colors.fontColor}
        >
          Invalid QR code. Please ensure you have selected a valid QR code from
          your Keystone device.
        </Box>
        <Link
          href="https://keyst.one/t/backpack"
          target="_blank"
          sx={{
            color: theme.custom.colors.fontColor3,
            textDecorationColor: theme.custom.colors.fontColor3,
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          Tutorial
        </Link>
        <PrimaryButton label="OK" onClick={onOK} />
      </Box>
    </Drawer>
  );
}

export function KeystonePlayer({
  header,
  hasFooter = true,
  setDisplay,
  ur,
  size = 200,
  help,
}: PlayProps) {
  const theme = useCustomTheme();

  return (
    <KeystoneBase
      header={header}
      card={
        ur ? (
          <Box p="5px" bgcolor="#fff">
            <AnimatedQRCode
              type={ur.type}
              cbor={ur.cbor}
              options={{
                size: size - 10,
              }}
            />
          </Box>
        ) : null
      }
      cardSize={size}
      help={
        <Box color="#90929D" fontSize={12} textAlign="center" lineHeight="16px">
          {help || (
            <>
              Click on the '
              <span style={{ color: theme.custom.colors.fontColor }}>
                Get Signature
              </span>
              ' button after signing the message. This request will NOT trigger
              any blockchain transaction or cost any SOL.
            </>
          )}
        </Box>
      }
      hasFooter={hasFooter}
      footer={
        <PrimaryButton
          label="Get Signature"
          onClick={() => setDisplay && setDisplay(DisplayType.scanner)}
        />
      }
    />
  );
}
