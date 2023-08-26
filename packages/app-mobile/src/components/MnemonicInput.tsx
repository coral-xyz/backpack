import { useCallback, useEffect, useState } from "react";
import { Alert, Keyboard, Pressable } from "react-native";

import {
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { StyledText, YStack } from "@coral-xyz/tamagui";

import { maybeRender } from "~lib/index";

import { MnemonicInputFields } from "~src/components/MnemonicInputFields";
import { CopyButton, PasteButton } from "~src/components/index";

type MnemonicInputProps = {
  readOnly: boolean;
  onComplete: ({
    mnemonic,
    isValid,
  }: {
    mnemonic: string;
    isValid: boolean;
  }) => void;
};
export function MnemonicInput({ readOnly, onComplete }: MnemonicInputProps) {
  const background = useBackgroundClient();
  const [keyboardStatus, setKeyboardStatus] = useState("");

  const [mnemonicWords, setMnemonicWords] = useState<string[]>([
    ...Array(12).fill(""),
  ]);

  const mnemonic = mnemonicWords.map((f) => f.trim()).join(" ");

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardStatus("shown");
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardStatus("hidden");
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const generateRandom = useCallback(() => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
        params: [mnemonicWords.length === 12 ? 128 : 256],
      })
      .then((m: string) => {
        const words = m.split(" ");
        setMnemonicWords(words);
      });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (readOnly) {
      generateRandom();
    }
  }, [readOnly, generateRandom]);

  const isValidAsync = (mnemonic: string) => {
    return background.request({
      method: UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
      params: [mnemonic],
    });
  };

  const onChange = async (words: string[]) => {
    setMnemonicWords(words);
    if (readOnly) {
      const mnemonic = mnemonicWords.map((f) => f.trim()).join(" ");
      onComplete({ isValid: true, mnemonic });
      return;
    }

    if (words.length > 11) {
      const mnemonic = mnemonicWords.map((f) => f.trim()).join(" ");
      const isValid = words.length > 11 ? await isValidAsync(mnemonic) : false;
      onComplete({ isValid, mnemonic });
    }
  };

  return (
    <YStack space={8}>
      <MnemonicInputFields
        mnemonicWords={mnemonicWords}
        onChange={readOnly ? undefined : onChange}
        onComplete={async () => {
          const isValid = await isValidAsync(mnemonic);
          onComplete({ isValid, mnemonic });
        }}
      />
      {readOnly ? (
        <CopyButton text={mnemonicWords.join(" ")} />
      ) : keyboardStatus === "shown" ? null : (
        <PasteButton
          onPaste={(words) => {
            const split = words.split(" ");
            if ([12, 24].includes(split.length)) {
              setMnemonicWords(words.split(" "));
            } else {
              Alert.alert("Mnemonic should be either 12 or 24 words");
            }
          }}
        />
      )}
      {maybeRender(!readOnly, () => (
        <Pressable
          hitSlop={12}
          onPress={() => {
            setMnemonicWords([
              ...Array(mnemonicWords.length === 12 ? 24 : 12).fill(""),
            ]);
          }}
        >
          <StyledText fontSize="$sm" textAlign="center">
            Use a {mnemonicWords.length === 12 ? "24" : "12"}-word recovery
            mnemonic
          </StyledText>
        </Pressable>
      ))}
    </YStack>
  );
}
