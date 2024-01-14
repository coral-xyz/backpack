import { _XnftAppStack } from "../../../../components/common/Layout/XnftAppStack";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type { XnftScreenProps } from "../../../navigation/WalletsNavigator";

export function XnftScreen(props: XnftScreenProps) {
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
  route: {
    params: { xnftAddress, fullXnftPath },
  },
}: XnftScreenProps) {
  const deepXnftPath = fullXnftPath.split(xnftAddress ?? "")[1] ?? "";
  return (
    <_XnftAppStack xnftAddress={xnftAddress} deepXnftPath={deepXnftPath} />
  );
}
