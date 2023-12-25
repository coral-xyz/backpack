import {
  createContext,
  type CSSProperties,
  Suspense,
  useContext,
  useState,
} from "react";
import {
  openAddUserAccount,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { useBreakpoints } from "@coral-xyz/react-common";
import {
  unlockedUntilAtom,
  useAllUsers,
  useBackgroundClient,
  userClientAtom,
  userUUIDAtom,
  useUser,
} from "@coral-xyz/recoil";
import {
  getAvatarColorFromIndex,
  HOVER_OPACITY,
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
} from "@coral-xyz/tamagui";
import { Add, Check } from "@mui/icons-material";
import { Button, IconButton, Popover, Typography } from "@mui/material";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { SettingsNavStackDrawer } from "./SettingsNavStackDrawer";

const useStyles = temporarilyMakeStylesForBrowserExtension(() => ({
  menuButton: {
    padding: 0,
    "&:hover": {
      opacity: HOVER_OPACITY,
    },
  },
  popoverRoot: {
    zIndex: 2,
  },
}));

export function AvatarPopoverButton({
  buttonStyle,
}: {
  buttonStyle?: CSSProperties;
  imgStyle?: CSSProperties;
}) {
  const classes = useStyles();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<any | undefined>(undefined);
  const user = useUser();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isXs } = useBreakpoints();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <IconButton
        disableRipple
        className={classes.menuButton}
        style={{
          ...buttonStyle,
        }}
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
        }}
      >
        <IncognitoAvatar uuid={user.uuid} variant="md" />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(undefined)}
        anchorOrigin={{
          vertical: isXs ? "bottom" : "top",
          horizontal: "left",
        }}
        PaperProps={{
          style: {
            minWidth: "218px",
            borderRadius: "6px",
            background: theme.baseBackgroundL0.val,
          },
        }}
        transformOrigin={{
          vertical: isXs ? "top" : "bottom",
          horizontal: "left",
        }}
        classes={{ root: classes.popoverRoot }}
        // Required duration of 0 because the rerender on a user change causes
        // the transition component in mui to not complete and so the popover
        // never disappears
        transitionDuration={0}
      >
        <PopoverProvider
          close={() => setAnchorEl(undefined)}
          openSettings={() => setSettingsOpen(true)}
        >
          <AvatarMenu />
        </PopoverProvider>
      </Popover>
      <SettingsNavStackDrawer
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
      />
    </div>
  );
}

function AvatarMenu() {
  const theme = useTheme();
  return (
    <div
      style={{
        width: "218px",
        border: `solid 2px ${theme.baseBorderLight.val}`,
        borderRadius: "6px",
      }}
    >
      <UsersMenuList />
      <div
        style={{
          borderTop: `solid 2px ${theme.baseBorderLight.val}`,
        }}
      />
      <AuxMenuList />
      <div
        style={{
          borderTop: `solid 2px ${theme.baseBorderLight.val}`,
        }}
      />
      <LockMenuList />
    </div>
  );
}

function MenuList({ children }: { children: any }) {
  return (
    <div
      style={{
        paddingTop: "4px",
        paddingBottom: "4px",
      }}
    >
      {children}
    </div>
  );
}

function MenuListItem({
  onClick,
  children,
}: {
  onClick: () => void;
  children: any;
}) {
  const theme = useTheme();
  return (
    <Button
      onClick={onClick}
      disableRipple
      sx={{
        textTransform: "none",
        padding: 0,
        paddingTop: "8px",
        paddingBottom: "8px",
        paddingLeft: "16px",
        paddingRight: "16px",
        width: "100%",
        display: "inline",
        "&:hover": {
          background: theme.baseBackgroundL2.val,
          opacity: 1, // Override the MUI opacity.
        },
      }}
    >
      <div
        style={{
          display: "flex",
        }}
      >
        {children}
      </div>
    </Button>
  );
}

function UsersMenuList() {
  const users = useAllUsers();
  const theme = useTheme();
  const userClient = useRecoilValue(userClientAtom);
  const { close } = usePopoverContext();
  const { t } = useTranslation();

  return (
    <MenuList>
      {users.map((user: any) => {
        return (
          <UserMenuItem
            key={user.uuid}
            user={user}
            onClick={async () => {
              close();
              await userClient.setActiveUser({ uuid: user.uuid });
            }}
          />
        );
      })}
      <MenuListItem
        onClick={() => {
          close();
          openAddUserAccount();
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            marginRight: "4px",
          }}
        >
          <Add
            style={{
              fontSize: "14px",
              color: theme.baseTextMedEmphasis.val,
            }}
          />
        </div>
        <Typography
          style={{
            fontSize: 14,
            color: theme.baseTextMedEmphasis.val,
          }}
        >
          {t("add_account")}
        </Typography>
      </MenuListItem>
    </MenuList>
  );
}

function AuxMenuList() {
  const theme = useTheme();
  const { openSettings } = usePopoverContext();
  const { t } = useTranslation();

  return (
    <MenuList>
      <MenuListItem
        onClick={() => {
          openSettings();
        }}
      >
        <Typography
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            color: theme.baseTextHighEmphasis.val,
            fontSize: "14px",
          }}
        >
          {t("settings")}
        </Typography>
      </MenuListItem>
    </MenuList>
  );
}

function LockMenuList() {
  const theme = useTheme();
  const background = useBackgroundClient();
  const setUnlockedUntil = useSetRecoilState(unlockedUntilAtom);
  return (
    <MenuList>
      <MenuListItem
        onClick={() => {
          setUnlockedUntil(0);

          // ph101pp todo
          background
            .request({
              method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
              params: [],
            })
            .catch(console.error);
        }}
      >
        <Typography
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            color: theme.baseTextHighEmphasis.val,
            fontSize: "14px",
          }}
        >
          Lock
        </Typography>
      </MenuListItem>
    </MenuList>
  );
}

function UserMenuItem({ user, onClick }: { user: any; onClick: () => void }) {
  const theme = useTheme();
  const currentUser = useUser();
  const isCurrentUser = user.uuid === currentUser.uuid;

  return (
    <MenuListItem onClick={onClick}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <IncognitoAvatar uuid={user.uuid} variant="sm" />
          </div>
          <Typography
            style={{
              marginLeft: "8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              color: theme.baseTextHighEmphasis.val,
              fontSize: "14px",
            }}
          >
            {user.username}
          </Typography>
        </div>
        {isCurrentUser ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Check
              style={{
                width: "20px",
                height: "20px",
                color: theme.accentBlue.val,
              }}
            />
          </div>
        ) : null}
      </div>
    </MenuListItem>
  );
}

type PopoverContext = {
  close: () => void;
  openSettings: () => void;
};
const _PopoverContext = createContext<PopoverContext | null>(null);

function PopoverProvider({ children, close, openSettings }: any) {
  return (
    <_PopoverContext.Provider
      value={{
        close,
        openSettings,
      }}
    >
      {children}
    </_PopoverContext.Provider>
  );
}

function usePopoverContext(): PopoverContext {
  const ctx = useContext(_PopoverContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}

export function IncognitoAvatar(props: {
  uuid: string;
  variant: "sm" | "md" | "lg";
}) {
  return (
    <Suspense fallback={null}>
      <_IncognitoAvatar {...props} />
    </Suspense>
  );
}
function _IncognitoAvatar({
  uuid,
  variant,
}: {
  uuid: string;
  variant: "sm" | "md" | "lg";
}) {
  const users = useAllUsers();

  const user = users.find((u) => u.uuid === uuid)!;
  const index = users.findIndex((u) => u.uuid === uuid);
  const initials = getInitials(user.username);
  const color = getAvatarColorFromIndex(index);
  const size = variant === "sm" ? 20 : variant === "md" ? 32 : 74;
  const fontSize =
    variant === "sm" ? "10px" : variant === "md" ? "14px" : "24px";

  return (
    <div
      style={{
        position: "relative",
        justifyContent: "center",
        display: "flex",
        flexDirection: "column",
        width: size,
        height: size,
      }}
    >
      <div
        style={{
          backgroundColor: color,
          opacity: 0.15,
          width: size,
          height: size,
          borderRadius: size / 2,
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          right: 0,
        }}
      />
      <Typography
        style={{
          color: color,
          textAlign: "center",
          fontSize,
        }}
      >
        {initials}
      </Typography>
    </div>
  );
}

function getInitials(username: string): string {
  const components = username.split(" ").filter(Boolean);
  let initials = [...components[0]][0];
  if (components.length > 1) {
    initials += [...components[1]][0];
  }
  return initials.toUpperCase();
}
