import { useCustomTheme } from "@coral-xyz/themes";
import { NodeKind } from "react-xnft";

export const useDefaultClasses = () => {
  const theme = useCustomTheme();
  return {
    [NodeKind.Button]: `rounded-xl w-px-100 text-[${theme.custom.colors.text}] bg-[${theme.custom.colors.nav}] py-2 px-4`,
    [NodeKind.Text]: `font-medium text-[${theme.custom.colors.text}]`,
    [NodeKind.TextField]: `font-medium rounded-xl text-base leading-6 px-4 py-3.5 w-full
            text-[${theme.custom.colors.fontColor2}]
            bg-[${theme.custom.colors.textBackground}] 
            focus:ring-none focus:outline-none
            border-2 border-[${theme.custom.colors.textBackground}] hover:border-[${theme.custom.colors.primaryButton}] focus:border-[${theme.custom.colors.primaryButton}]`,
  };
};
