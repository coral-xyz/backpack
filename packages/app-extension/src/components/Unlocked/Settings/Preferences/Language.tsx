import { useEffect, useState } from "react";
import { SUPPORTED_LANGUAGES, updateLanguage } from "@coral-xyz/i18n";
import { isFirstLastListItemStyle } from "@coral-xyz/react-common";
import { useTheme } from "@coral-xyz/tamagui";
import { ListItem } from "@mui/material";

import { useNavigation } from "../../../common/Layout/NavStack";

import { Checkmark } from "./Blockchains/ConnectionSwitch";

export function PreferencesLanguage() {
  const [language, setLanguage] = useState<string>(
    localStorage.getItem("language") || ""
  );
  const nav = useNavigation();

  const theme = useTheme();

  useEffect(() => {
    nav.setOptions({ headerTitle: "Select language" });
  }, []);

  return (
    <div
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingBottom: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        textAlign: "center",
        alignContent: "center",
        color: theme.baseTextMedEmphasis.val,
      }}
    >
      <div>
        <div>
          {SUPPORTED_LANGUAGES.map((l, index) => (
            <LanguageListItem
              languageKey={l.key}
              value={l.value}
              isFirst={index === 0}
              isLast={index === SUPPORTED_LANGUAGES.length - 1}
              language={language}
              setLanguage={setLanguage}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LanguageListItem({
  languageKey,
  value,
  isFirst,
  isLast,
  language,
  setLanguage,
}: {
  languageKey: Parameters<typeof updateLanguage>[0];
  value: string;
  isFirst: boolean;
  isLast: boolean;
  language: string;
  setLanguage: any;
}) {
  const nav = useNavigation();
  const theme = useTheme();
  return (
    <ListItem
      button
      disableRipple
      onClick={async () => {
        await updateLanguage(languageKey);
        setLanguage(languageKey);
        nav.pop();
      }}
      style={{
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "8px",
        paddingBottom: "8px",
        display: "flex",
        height: "48px",
        backgroundColor: theme.baseBackgroundL1.val,
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.baseBorderLight.val}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 12),
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {value}
      </div>
      <div>{languageKey === language ? <Checkmark /> : undefined}</div>
    </ListItem>
  );
}
