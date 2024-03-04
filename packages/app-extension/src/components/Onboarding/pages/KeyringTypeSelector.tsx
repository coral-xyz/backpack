import type { KeyringType } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { BpSecondaryButton, StyledText, YStack } from "@coral-xyz/tamagui";

import { Header, SubtextParagraph } from "../../common";

export const KeyringTypeSelector = ({
  onNext,
}: {
  onNext: (keyringType: KeyringType) => void;
}) => {
  const { t } = useTranslation();

  return (
    <YStack f={1}>
      <YStack alignItems="center" justifyContent="center" mb={40}>
        <Header text={t("import_existing_wallet")} />
        <SubtextParagraph>
          {t("import_existing_wallet_description")}
        </SubtextParagraph>
      </YStack>
      <YStack alignItems="center" gap={12}>
        <BpSecondaryButton
          iconBefore={<_ListIcon />}
          label={t("with_secret_key.import")}
          justifyContent="flex-start"
          mb={12}
          onPress={() => onNext("mnemonic")}
          textAlign="left"
        />
        <StyledText alignSelf="flex-start" color="$baseTextMedEmphasis">
          {t("advanced")}
        </StyledText>
        <BpSecondaryButton
          iconBefore={<_HardwareIcon />}
          label={t("have_hardware_wallet")}
          justifyContent="flex-start"
          onPress={() => onNext("ledger")}
          textAlign="left"
        />
        <BpSecondaryButton
          iconBefore={<_HardwareIcon />}
          label={t("have_hardware_wallet_trezor")}
          justifyContent="flex-start"
          onPress={() => onNext("trezor")}
          textAlign="left"
        />

        <BpSecondaryButton
          iconBefore={<_KeyIcon />}
          label={t("with_private_key.import")}
          justifyContent="flex-start"
          onPress={() => onNext("private-key")}
          textAlign="left"
        />
      </YStack>
    </YStack>
  );
};

function _ListIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="33"
      height="32"
      viewBox="0 0 33 32"
      fill="none"
    >
      <path
        d="M11.8333 9.33337H27.8333C28.5666 9.33337 29.1666 8.73337 29.1666 8.00004C29.1666 7.26671 28.5666 6.66671 27.8333 6.66671H11.8333C11.0999 6.66671 10.4999 7.26671 10.4999 8.00004C10.4999 8.73337 11.0999 9.33337 11.8333 9.33337ZM27.8333 22.6667H11.8333C11.0999 22.6667 10.4999 23.2667 10.4999 24C10.4999 24.7334 11.0999 25.3334 11.8333 25.3334H27.8333C28.5666 25.3334 29.1666 24.7334 29.1666 24C29.1666 23.2667 28.5666 22.6667 27.8333 22.6667ZM27.8333 14.6667H11.8333C11.0999 14.6667 10.4999 15.2667 10.4999 16C10.4999 16.7334 11.0999 17.3334 11.8333 17.3334H27.8333C28.5666 17.3334 29.1666 16.7334 29.1666 16C29.1666 15.2667 28.5666 14.6667 27.8333 14.6667ZM7.16658 21.3334H4.49992C4.12659 21.3334 3.83325 21.6267 3.83325 22C3.83325 22.3734 4.12659 22.6667 4.49992 22.6667H6.49992V23.3334H5.83325C5.45992 23.3334 5.16659 23.6267 5.16659 24C5.16659 24.3734 5.45992 24.6667 5.83325 24.6667H6.49992V25.3334H4.49992C4.12659 25.3334 3.83325 25.6267 3.83325 26C3.83325 26.3734 4.12659 26.6667 4.49992 26.6667H7.16658C7.53992 26.6667 7.83325 26.3734 7.83325 26V22C7.83325 21.6267 7.53992 21.3334 7.16658 21.3334ZM4.49992 6.66671H5.16659V10C5.16659 10.3734 5.45992 10.6667 5.83325 10.6667C6.20659 10.6667 6.49992 10.3734 6.49992 10V6.00004C6.49992 5.62671 6.20659 5.33337 5.83325 5.33337H4.49992C4.12659 5.33337 3.83325 5.62671 3.83325 6.00004C3.83325 6.37337 4.12659 6.66671 4.49992 6.66671ZM7.16658 13.3334H4.49992C4.12659 13.3334 3.83325 13.6267 3.83325 14C3.83325 14.3734 4.12659 14.6667 4.49992 14.6667H6.23325L3.99325 17.28C3.88659 17.4 3.83325 17.56 3.83325 17.7067V18C3.83325 18.3734 4.12659 18.6667 4.49992 18.6667H7.16658C7.53992 18.6667 7.83325 18.3734 7.83325 18C7.83325 17.6267 7.53992 17.3334 7.16658 17.3334H5.43325L7.67325 14.72C7.77992 14.6 7.83325 14.44 7.83325 14.2934V14C7.83325 13.6267 7.53992 13.3334 7.16658 13.3334Z"
        fill="#75798A"
      />
    </svg>
  );
}

function _HardwareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="33"
      height="32"
      viewBox="0 0 33 32"
      fill="none"
    >
      <path
        d="M10.3759 14.2435C9.88333 14.2435 9.46698 14.4116 9.12685 14.7478C8.78673 15.0841 8.61667 15.4957 8.61667 15.9826C8.61667 16.4696 8.78673 16.8812 9.12685 17.2174C9.46698 17.5536 9.88333 17.7217 10.3759 17.7217C10.8685 17.7217 11.2849 17.5536 11.625 17.2174C11.9651 16.8812 12.1352 16.4696 12.1352 15.9826C12.1352 15.4957 11.9651 15.0841 11.625 14.7478C11.2849 14.4116 10.8685 14.2435 10.3759 14.2435ZM5.6963 10H28.6019C28.9772 10 29.2762 10.1101 29.4991 10.3304C29.7219 10.5507 29.8333 10.8464 29.8333 11.2174V20.5739C29.8333 20.9681 29.7219 21.3043 29.4991 21.5826C29.2762 21.8609 28.9772 22 28.6019 22H5.6963C5.34444 22 5.0571 21.8609 4.83426 21.5826C4.61142 21.3043 4.5 20.9681 4.5 20.5739V11.2174C4.5 10.8464 4.61142 10.5507 4.83426 10.3304C5.0571 10.1101 5.34444 10 5.6963 10ZM6.61111 12.087V19.913H27.7222V12.087H6.61111Z"
        fill="#75798A"
      />
    </svg>
  );
}

function _KeyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="33"
      height="32"
      viewBox="0 0 33 32"
      fill="none"
    >
      <path
        d="M28.4999 13.3333H17.3666C16.2733 10.2267 13.3133 8 9.83325 8C5.41992 8 1.83325 11.5867 1.83325 16C1.83325 20.4133 5.41992 24 9.83325 24C13.3133 24 16.2733 21.7733 17.3666 18.6667H17.8333L20.4999 21.3333L23.1666 18.6667L25.8333 21.3333L31.1666 15.9467L28.4999 13.3333ZM9.83325 20C7.63325 20 5.83325 18.2 5.83325 16C5.83325 13.8 7.63325 12 9.83325 12C12.0333 12 13.8333 13.8 13.8333 16C13.8333 18.2 12.0333 20 9.83325 20Z"
        fill="#75798A"
      />
    </svg>
  );
}
