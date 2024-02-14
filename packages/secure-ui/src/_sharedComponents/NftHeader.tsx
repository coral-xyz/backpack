import { Suspense } from "react";

import { externalResourceUri } from "@coral-xyz/common";
import { ProxyImage, Stack, StyledText } from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

import { assetByIdAtom } from "../_atoms/nftByIdAtom";

export function NftHeader(props: {
  assetId: string;
  image: string;
  name: string;
}) {
  return (
    <Suspense fallback={null}>
      <_NftHeader {...props} />
    </Suspense>
  );
}
export function _NftHeader({
  image,
  name,
  assetId,
}: {
  assetId: string;
  image: string;
  name: string;
}) {
  const asset = useRecoilValue(assetByIdAtom(assetId));
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      space="$2"
      paddingHorizontal="$2"
    >
      <ProxyImage
        size={400}
        src={externalResourceUri(asset.image ?? image)}
        style={{
          height: 128,
          width: 128,
          borderRadius: 8,
        }}
      />
      <StyledText color="$baseTextHighEmphasis" fontSize="$base">
        {asset.name ?? name}
      </StyledText>
    </Stack>
  );
}
