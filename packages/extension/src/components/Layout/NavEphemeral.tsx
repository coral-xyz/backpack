import { useCustomTheme } from "@coral-xyz/themes";
import { NavEphemeralProvider, useEphemeralNav } from "@coral-xyz/recoil";
import { WithNav, NavBackButton } from "./Nav";

export function WithEphemeralNav({
  title,
  children,
  navbarStyle,
  navContentStyle,
}: any) {
  return (
    <NavEphemeralProvider title={title} root={children}>
      <NavEphemeralWrapper
        navbarStyle={navbarStyle}
        navContentStyle={navContentStyle}
      />
    </NavEphemeralProvider>
  );
}

function NavEphemeralWrapper({
  navbarStyle,
  navContentStyle,
}: {
  navbarStyle: any;
  navContentStyle: any;
}) {
  const theme = useCustomTheme();
  const { isRoot, title, pop, navButtonRight, renderComponent } =
    useEphemeralNav();
  const navButtonLeft = isRoot ? null : <NavBackButton onClick={() => pop()} />;
  const _navbarStyle = {
    borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    ...(navbarStyle ?? {}),
  };
  return (
    <WithNav
      title={title}
      navButtonLeft={navButtonLeft}
      navButtonRight={navButtonRight}
      children={renderComponent}
      navbarStyle={_navbarStyle}
      navContentStyle={navContentStyle}
    />
  );
}
