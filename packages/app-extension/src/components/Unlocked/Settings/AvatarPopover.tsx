import { createContext, type CSSProperties, useContext, useState } from "react";
import {
  openAddUserAccount,
  openPopupWindow,
  UI_RPC_METHOD_ACTIVE_USER_UPDATE,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
} from "@coral-xyz/common";
import { ProxyImage, useBreakpoints } from "@coral-xyz/react-common";
import {
  useAllUsers,
  useAvatarUrl,
  useBackgroundClient,
  useUser,
} from "@coral-xyz/recoil";
import { HOVER_OPACITY, styles, useCustomTheme } from "@coral-xyz/themes";
import { Add, Check } from "@mui/icons-material";
import { Button, IconButton, Popover, Typography } from "@mui/material";

import { SettingsNavStackDrawer } from "./SettingsNavStackDrawer";

const useStyles = styles((theme) => ({
  menuButton: {
    padding: "2px",
    background: `${theme.custom.colors.avatarIconBackground} !important`,
    "&:hover": {
      background: `${theme.custom.colors.avatarIconBackground} !important`,
      backgroundColor: `${theme.custom.colors.avatarIconBackground} !important`,
      opacity: HOVER_OPACITY,
    },
  },
  popoverRoot: {
    zIndex: 2,
  },
}));

export function AvatarPopoverButton({
  buttonStyle,
  imgStyle,
}: {
  buttonStyle?: CSSProperties;
  imgStyle?: CSSProperties;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState<any | undefined>(undefined);
  const avatarUrl = useAvatarUrl(32);
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
        <ProxyImage
          src={avatarUrl}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "16px",
            ...imgStyle,
          }}
        />
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
            background: theme.custom.colors.avatarPopoverMenuBackground,
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
  const theme = useCustomTheme();
  return (
    <div
      style={{
        width: "218px",
        border: theme.custom.colors.borderFull,
        borderRadius: "6px",
      }}
    >
      <UsersMenuList />
      <div
        style={{
          borderTop: theme.custom.colors.borderFull,
        }}
      />
      <AuxMenuList />
      <div
        style={{
          borderTop: theme.custom.colors.borderFull,
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
  return (
    <Button
      onClick={onClick}
      disableRipple
      style={{
        textTransform: "none",
        padding: 0,
        paddingTop: "8px",
        paddingBottom: "8px",
        paddingLeft: "16px",
        paddingRight: "16px",
        width: "100%",
        display: "inline",
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
  const theme = useCustomTheme();
  const background = useBackgroundClient();
  const { close } = usePopoverContext();
  return (
    <MenuList>
      {users.map((user: any) => {
        return (
          <UserMenuItem
            key={user.uuid}
            user={user}
            onClick={async () => {
              close();
              await background.request({
                method: UI_RPC_METHOD_ACTIVE_USER_UPDATE,
                params: [user.uuid],
              });
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
              color: theme.custom.colors.secondary,
            }}
          />
        </div>
        <Typography
          style={{
            fontSize: 14,
            color: theme.custom.colors.secondary,
          }}
        >
          Add Account
        </Typography>
      </MenuListItem>
    </MenuList>
  );
}

function AuxMenuList() {
  const theme = useCustomTheme();
  const { openSettings } = usePopoverContext();
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
            color: theme.custom.colors.fontColor,
            fontSize: "14px",
          }}
        >
          Settings
        </Typography>
      </MenuListItem>
      <MenuListItem
        onClick={async () => {
          await openPopupWindow("popup.html");
          window.close();
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              color: theme.custom.colors.fontColor,
              fontSize: "14px",
            }}
          >
            Pop Window
          </Typography>
          <Typography
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              color: theme.custom.colors.secondary,
              fontSize: "14px",
            }}
          >
            Ctrl + G
          </Typography>
        </div>
      </MenuListItem>
    </MenuList>
  );
}

function LockMenuList() {
  const theme = useCustomTheme();
  const background = useBackgroundClient();
  return (
    <MenuList>
      <MenuListItem
        onClick={() => {
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
            color: theme.custom.colors.fontColor,
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
  const theme = useCustomTheme();
  const currentUser = useUser();
  const avatarUrl = useAvatarUrl(undefined, user.username);
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
            <ProxyImage
              src={avatarUrl}
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
              }}
            />
          </div>
          <Typography
            style={{
              marginLeft: "8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              color: theme.custom.colors.fontColor,
              fontSize: "14px",
            }}
          >
            @{user.username}
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
                opacity: 0.8,
                color: theme.custom.colors.fontColor,
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
