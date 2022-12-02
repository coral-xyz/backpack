import { useState } from "react";
import {
  BACKEND_API_URL,
  BACKPACK_FEATURE_JWT,
  BACKPACK_FEATURE_USERNAMES,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
} from "@coral-xyz/common";
import { useBackgroundClient, useUsername } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, IconButton, InputAdornment, Typography } from "@mui/material";

import { PrimaryButton } from "../common";
import { Backpack, RedBackpack } from "../common/Icon";
import { TextInput } from "../common/Inputs";

import { LockedMenu } from "./LockedMenu";

export const NAV_BAR_HEIGHT = 56;

export function Locked({ onUnlock }: { onUnlock?: () => Promise<void> }) {
  const theme = useCustomTheme();
  const background = useBackgroundClient();
  const username = useUsername();

  const [menuOpen, setMenuOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<boolean>(false);

  const _onUnlock = async (e: any) => {
    e.preventDefault();
    try {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
        params: [password],
      });

      if (BACKPACK_FEATURE_USERNAMES && BACKPACK_FEATURE_JWT && username) {
        // Make sure the user is authenticated
        ensureAuthentication();
      } else if (onUnlock) {
        //  Usernames or JWT disabled, just unlock
        onUnlock();
      }
    } catch (err) {
      console.error("unlock error", err);
      setError(true);
    }
  };

  /**
   * Query the server and see if the user has a valid JWT.
   */
  const ensureAuthentication = async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200)
        throw new Error(`could not fetch authentication status`);
      const { id, publicKeys, isAuthenticated } = await response.json();
      if (!isAuthenticated) {
        login(id, publicKeys);
      }
    } catch (err) {
      // Relock if authentication failed
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      });
    }
  };

  /**
   * Determine the signatures that are required for authentication and for
   * ensuring all client side public keys are stored on the Backpack account.
   */
  const requiredSignatures = async (
    userId: string,
    isAuthenticated: boolean,
    serverPublicKeys: Array<string>
  ) => {
    const clientPublicKeys = await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
      params: [],
    });

    // Public keys that exist on the client that don't exist on the server
    const publicKeysToAdd = Object.values(clientPublicKeys)
      .flat()
      .filter((k) => !serverPublicKeys.includes(k as string));

    // JWT is set and there is no public keys to sync to the server
    if (isAuthenticated && publicKeysToAdd.length === 0) return [];

    // Transparent signers are those signers that Backpack can sign with on its
    // own, without needing to prompt the user (like for a Ledger signature)
    const transparentSigners = [
      ...clientPublicKeys.hdKeyring,
      ...clientPublicKeys.importedKeyring,
    ];

    let jwtAuthSigner;
    if (!isAuthenticated) {
      // Not authenticated, attempt to auth using a public key that we can sign
      // with transparently

      // First, check if theres a transparent signer that we need a signature
      // for anyway to potentially reduce the number of signing RPC requests
      const signers = transparentSigners.filter((k) =>
        publicKeysToAdd.includes(k)
      );
      if (signers) {
        jwtAuthSigner = signers[0];
      } else if (transparentSigners.length > 0) {
        // Next best choice is any of the transparent signers
        jwtAuthSigner = transparentSigners[0];
      } else {
        // Ledger is the only option, and the least preferred since it
        // requires user intervention
        jwtAuthSigner = clientPublicKeys.ledgerKeyring[0];
      }
    }

    // List of public keys that require signatures
    const publicKeysForSigning = [new Set([...publicKeysToAdd, jwtAuthSigner])];
    for (const publicKey in publicKeysForSigning) {
      const signature = await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
        params: [],
      });
    }
  };

  /**
   * Login the user.
   */
  const login = async (id: string, serverPublicKeys: Array<string>) => {
    const clientPublicKeys = await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
      params: [],
    });
    console.log(clientPublicKeys);
    /**
    const response = await fetch(`http://localhost:8787/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    **/
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.custom.colors.backdropColor,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <Box>
          <LockedMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          <div style={{ marginTop: "40px" }}>
            <BackpackHeader />
          </div>
        </Box>

        <Box style={{ marginBottom: 84 }}>
          {username && (
            <Box
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
              <Typography style={{ color: theme.custom.colors.fontColor }}>
                gm @{username}
              </Typography>
            </Box>
          )}

          <form onSubmit={_onUnlock} noValidate>
            <Box sx={{ margin: "0 12px 12px 12px" }}>
              <TextInput
                autoFocus={true}
                error={error}
                placeholder={"Password"}
                type={showPassword ? "text" : "password"}
                value={password}
                setValue={(e) => setPassword(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      disableRipple
                      sx={{ color: theme.custom.colors.icon }}
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </Box>
            <Box sx={{ mx: "12px" }}>
              <PrimaryButton label="Unlock" type="submit" />
            </Box>
          </form>
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              display: error ? "block" : "none",
              marginTop: "24px",
            }}
          >
            <Typography
              sx={{
                color: theme.custom.colors.secondary,
                fontSize: "16px",
                textAlign: "center",
                cursor: "pointer",
                lineHeight: "24px",
                fontWeight: 500,
              }}
              onClick={() => setMenuOpen(true)}
            >
              Forgot Password?
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function BackpackHeader({
  alphaStyle,
}: {
  alphaStyle?: React.CSSProperties;
}) {
  const theme = useCustomTheme();
  return (
    <Box
      sx={{
        marginTop: "16px",
        marginLeft: "auto",
        marginRight: "auto",
        display: "block",
        position: "relative",
      }}
    >
      <div style={{ display: "flex" }}>
        <RedBackpack style={{ marginLeft: "auto", marginRight: "auto" }} />
      </div>
      <Box
        sx={{
          marginTop: "16px",
          display: "flex",
          flexDirection: "row-reverse",
          justifyContent: "center",
          marginLeft: "200px",
          marginBottom: "4px",
          ...alphaStyle,
        }}
      >
        <AlphaLabel />
      </Box>
      <Backpack fill={theme.custom.colors.fontColor} />
      <Typography
        sx={{
          textAlign: "center",
          lineHeight: "24px",
          fontSize: "16px",
          fontWeight: "500",
          color: theme.custom.colors.secondary,
          marginTop: "8px",
        }}
      >
        A home for your xNFTs
      </Typography>
    </Box>
  );
}

function AlphaLabel() {
  const theme = useCustomTheme();
  return (
    <Box
      sx={{
        borderRadius: "10px",
        border: `solid 1pt ${theme.custom.colors.alpha}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "20px",
        width: "53px",
      }}
    >
      <Typography
        sx={{
          color: theme.custom.colors.alpha,
          fontSize: "12px",
          lineHeight: "16px",
          textAlign: "center",
          fontWeight: 500,
        }}
      >
        Alpha
      </Typography>
    </Box>
  );
}
