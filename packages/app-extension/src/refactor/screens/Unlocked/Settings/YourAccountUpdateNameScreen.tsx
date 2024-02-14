import { useState } from "react";
import { useTranslation } from "@coral-xyz/i18n";
import {
  InputListItem,
  Inputs,
  PrimaryButton,
  SecondaryButton,
} from "@coral-xyz/react-common";
import { secureUserAtom, userClientAtom } from "@coral-xyz/recoil";
import { useRecoilValue } from "recoil";

import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function YourAccountUpdateNameScreen(
  props: SettingsScreenProps<Routes.YourAccountUpdateNameScreen>
) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  // TODO.
  return null;
}

function Container({
  navigation,
}: SettingsScreenProps<Routes.YourAccountUpdateNameScreen>) {
  const user = useRecoilValue(secureUserAtom);
  const userClient = useRecoilValue(userClientAtom);
  const [username, setUsername] = useState(user.user.username);
  const { t } = useTranslation();

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
            await userClient.updateUser({
              uuid: user.user.uuid,
              username: username.trim(),
            });
            setTimeout(() => {
              navigation.popToTop();
              navigation.popToTop();
            }, 10);
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
                navigation.popToTop();
                navigation.popToTop();
              }}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
