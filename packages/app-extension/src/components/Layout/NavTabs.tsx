import { useCustomTheme } from "@coral-xyz/themes";
import { useNavigation } from "@coral-xyz/recoil";
import { WithTabs } from "./Tab";
import { WithNav, NavBackButton } from "./Nav";
import { ApproveTransactionRequest } from "../Unlocked/ApproveTransactionRequest";

//
// The main nav persistent stack.
//
export function NavTabs() {
  const theme = useCustomTheme();
  const { title, isRoot, pop, navButtonLeft, navButtonRight, style } =
    useNavigation();
  const navbarStyle = {
    fontSize: "18px",
    borderBottom: !isRoot
      ? `solid 1pt ${theme.custom.colors.border}`
      : undefined,
    ...style,
  };
  const _navButtonLeft = navButtonLeft ? (
    navButtonLeft
  ) : isRoot ? null : (
    <NavBackButton onClick={pop} />
  );
  return (
    <WithTabs>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <WithNav
          title={title}
          navButtonLeft={_navButtonLeft}
          navButtonRight={navButtonRight}
          navbarStyle={navbarStyle}
        />
        <ApproveTransactionRequest />
      </div>
    </WithTabs>
  );
}
