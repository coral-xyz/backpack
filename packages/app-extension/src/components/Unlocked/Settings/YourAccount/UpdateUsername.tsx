import { useEffect, useState } from "react";
import { useTranslation } from "@coral-xyz/i18n";
import {
  InputListItem,
  Inputs,
  PrimaryButton,
  SecondaryButton,
} from "@coral-xyz/react-common";
import { secureUserAtom, userClientAtom } from "@coral-xyz/recoil";
import { useRecoilValue } from "recoil";

import { useDrawerContext } from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";

export function UpdateUsername() {
  const { close } = useDrawerContext();
  const nav = useNavigation();
  const user = useRecoilValue(secureUserAtom);
  const userClient = useRecoilValue(userClientAtom);
  const [username, setUsername] = useState(user.user.username);
  const { t } = useTranslation();

  useEffect(() => {
    const title = nav.title;
    nav.setOptions({ headerTitle: t("update_account_name") });
    return () => {
      nav.setOptions({ headerTitle: title });
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        paddingTop: "16px",
        height: "100%",
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          (async () => {
            const trimmedUsername = username.trim();
            if (trimmedUsername.length === 0) return;
            // ph101pp todo
            await userClient.updateUser({
              uuid: user.user.uuid,
              username: username.trim(),
            });
            setTimeout(() => close(), 10);
          })();
        }}
        style={{
          display: "flex",
          flex: 1,
          height: "100%",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            flexGrow: 1,
          }}
        >
          <Inputs error={username === ""}>
            <InputListItem
              autoFocus
              isFirst
              isLast
              titleWidth="100px"
              value={username}
              onBlur={() => setUsername((username) => username.trim())}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={user.user.username}
              type="text"
              button={false}
              title={t("name")}
            />
          </Inputs>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: 8,
              justifyContent: "flex-end",
              padding: 16,
            }}
          >
            <PrimaryButton
              label={t("save")}
              type="submit"
              disabled={username === ""}
            />
            <SecondaryButton
              label={t("cancel")}
              type="button"
              onClick={() => {
                close();
              }}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
