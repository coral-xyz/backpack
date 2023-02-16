import type { MutableRefObject} from 'react';
import { useState } from 'react';
import type { UR } from '@coral-xyz/common';
import { PrimaryButton, SecondaryButton, WarningIcon } from '@coral-xyz/react-common';
import { useCustomTheme } from '@coral-xyz/themes';
import { AnimatedQRCode, URType, useAnimatedQRScanner } from '@keystonehq/animated-qr';
import { Box, Link, SvgIcon } from '@mui/material';

import { WithContaineredDrawer } from './Layout/Drawer';

export enum DisplayType {
  qrcode = 'qrcode',
  scanner = 'scanner',
}

interface BaseProps {
  header: React.ReactNode;
  hasFooter?: boolean;
  setDisplay?: (type: DisplayType) => void;
}

type PlayProps = BaseProps & {
  ur?: UR;
}

type ScanProps = BaseProps & {
  containerRef: MutableRefObject<any>;
  onScan: (ur: UR) => void;
}

function KeystoneBase({ header, body, footer, hasFooter }: BaseProps & {
  body: React.ReactNode;
  footer: React.ReactNode;
}) {
  const theme = useCustomTheme();
  return (
    <Box px={2} sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      height: "100%",
    }}>
      <Box>
        {header}
        <Box>
          <Box
            sx={{
              background: theme.custom.colors.bg3,
              border: `2px solid ${theme.custom.colors.borderColor}`,
              borderRadius: "12px",
              width: "220px",
              height: "220px",
              boxSizing: "content-box",
              overflow: "hidden",
              position: "relative",
              margin: "16px auto 8px",
            }}
          >
            {body}
          </Box>
        </Box>
      </Box>
      {hasFooter && <Box>
        {footer}
      </Box>}
    </Box>
  );
}

export function KeystoneScanner({ containerRef, header, hasFooter, onScan, setDisplay }: ScanProps) {
  const [isPermissionError, setIsPermissionError] = useState(true);
  const [isScanError, setIsScanError] = useState(false);
  const theme = useCustomTheme();

  const { AnimatedQRScanner, setIsDone } = useAnimatedQRScanner({
    scannerProps: {
      videoLoaded: (canPlay: boolean) => {
        setIsPermissionError(!canPlay);
      }
    }
  });

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

  return (
    <KeystoneBase
      header={header}
      body={
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
              <path fillRule="evenodd" clipRule="evenodd" d="M22.3876 5.18828C21.952 3.88159 20.7292 3.00021 19.3518 3.00021H13.6487C12.2713 3.00021 11.0485 3.88159 10.6129 5.18828L10.0509 6.87433C9.94201 7.20101 9.6363 7.42135 9.29195 7.42135H6.5C4.29086 7.42135 2.5 9.21221 2.5 11.4214V24.0533C2.5 26.2625 4.29086 28.0533 6.5 28.0533H26.5005C28.7097 28.0533 30.5005 26.2625 30.5005 24.0533V11.4213C30.5005 9.21221 28.7097 7.42135 26.5005 7.42135H23.7086C23.3642 7.42135 23.0585 7.20101 22.9496 6.87433L22.3876 5.18828ZM16.5003 22.8954C19.3489 22.8954 21.6582 20.586 21.6582 17.7374C21.6582 14.8887 19.3489 12.5794 16.5003 12.5794C13.6516 12.5794 11.3423 14.8887 11.3423 17.7374C11.3423 20.586 13.6516 22.8954 16.5003 22.8954ZM16.5003 24.3691C20.1628 24.3691 23.132 21.3999 23.132 17.7374C23.132 14.0748 20.1628 11.1057 16.5003 11.1057C12.8377 11.1057 9.86855 14.0748 9.86855 17.7374C9.86855 21.3999 12.8377 24.3691 16.5003 24.3691ZM23.8688 9.63165C23.4619 9.63165 23.132 9.96155 23.132 10.3685C23.132 10.7755 23.4619 11.1054 23.8688 11.1054H26.0794C26.4863 11.1054 26.8162 10.7755 26.8162 10.3685C26.8162 9.96155 26.4863 9.63165 26.0794 9.63165H23.8688Z"/>
            </SvgIcon>
            <AnimatedQRScanner
              urTypes={[URType.SOL_SIGNATURE]}
              handleError={handleError}
              handleScan={handleScan}
              options={{
                width: 220,
                height: 220,
                blur: false,
              }}
            />
            <Box
              fontSize={14}
              color={theme.custom.colors[isPermissionError ? 'negative' : 'fontColor3']}
              textAlign="center"
            >
              {isPermissionError ? 'Please enable your camera permission via [Settings]' : 'Position the QR code in front of your camera.'}
            </Box>
            <WithContaineredDrawer
              containerRef={containerRef}
              openDrawer={isScanError}
              setOpenDrawer={setIsScanError}
              paperStyles={{
                background: "transparent",
              }}
            >
              <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderRadius: "12px",
                background: theme.custom.colors.backgroundBackdrop,
                padding: "24px 16px 16px",
              }}>
                <WarningIcon fill={theme.custom.colors.negative} />
                <Box
                  m="20px 0 12px"
                  textAlign="center"
                  fontSize="14px"
                  color={theme.custom.colors.fontColor}
                >Invalid QR code. Please ensure you have selected a valid QR code from your Keystone device.</Box>
                <Link
                  href="https://keyst.one/t/backpack"
                  target="_blank"
                  sx={{
                    color: theme.custom.colors.fontColor3,
                    textDecorationColor: theme.custom.colors.fontColor3,
                    marginBottom: "16px",
                    fontSize: "14px",
                  }}
                >Tutorial</Link>
                <PrimaryButton
                  label='OK'
                  onClick={continueScan}
                />
              </Box>
            </WithContaineredDrawer>
        </>
      }
      footer={
        <SecondaryButton onClick={() => setDisplay && setDisplay(DisplayType.qrcode)}>Back</SecondaryButton>
      }
      hasFooter={hasFooter}
    />
  );
}

export function KeystonePlayer({ header, hasFooter, setDisplay, ur }: PlayProps) {
  return (
    <KeystoneBase
      header={header}
      body={
        ur && <AnimatedQRCode
          type={ur.type}
          cbor={ur.cbor}
          options={{
            size: 220,
          }}
        />
      }
      hasFooter={hasFooter}
      footer={
        <PrimaryButton onClick={() => setDisplay && setDisplay(DisplayType.scanner)}>Get Signature</PrimaryButton>
      }
    />
  );
}
