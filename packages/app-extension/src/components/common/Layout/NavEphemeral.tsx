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
  const {
    isRoot,
    title,
    pop,
    navButtonLeft,
    navButtonRight,
    renderComponent,
    style,
  } = useEphemeralNav();
  const _navButtonLeft = navButtonLeft ? (
    navButtonLeft
  ) : isRoot ? null : (
    <NavBackButton onClick={() => pop()} />
  );
  const _navbarStyle = {
    fontSize: "18px",
    borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    ...(navbarStyle ?? {}),
    ...(style ?? {}),
  };
  return (
    <WithNav
      title={title}
      navButtonLeft={_navButtonLeft}
      navButtonRight={navButtonRight}
      children={renderComponent}
      navbarStyle={_navbarStyle}
      navContentStyle={navContentStyle}
    />
  );
}
