import { Image } from "tamagui";

import Images from "~src/Images";

export function S3Image({
  resource,
  style,
  ...props
}: {
  resource: string;
  style: {
    width: number;
    height: number;
  };
}): JSX.Element {
  // TODO update this to CNAME properly for your bucket
  const baseUrl = "https://dphpu5y2e06qu.cloudfront.net";
  const url = `${baseUrl}/images/${resource}`;
  return (
    // @ts-ignore
    <Image src={url} width={style.width} height={style.height} {...props} />
  );
}

function LocalImage({ resource, style }): JSX.Element {
  return <Image source={resource} width={style.width} height={style.height} />;
}

type BlockchainLogoProps = {
  width: number;
  height: number;
};

export const EthereumIcon = ({
  width,
  height,
}: BlockchainLogoProps): JSX.Element => (
  <LocalImage
    resource={Images.logoEthereum}
    // resource="logo-ethereum.png"
    style={{
      width,
      height,
    }}
  />
);

export const SolanaIcon = ({
  width,
  height,
}: BlockchainLogoProps): JSX.Element => (
  <LocalImage
    resource={Images.logoSolana}
    // resource="logo-solana.png"
    style={{
      width,
      height,
    }}
  />
);

export const AvalancheIcon = ({
  width,
  height,
}: BlockchainLogoProps): JSX.Element => (
  <LocalImage
    resource={Images.logoAvalanche}
    // resource="logo-avalanche.png"
    style={{
      width,
      height,
    }}
  />
);

export const PolygonIcon = ({
  width,
  height,
}: BlockchainLogoProps): JSX.Element => (
  <LocalImage
    resource={Images.logoPolygon}
    // resource="logo-polygon.png"
    style={{
      width,
      height,
    }}
  />
);

export const BscIcon = ({
  width,
  height,
}: BlockchainLogoProps): JSX.Element => (
  <LocalImage
    resource={Images.logoBsc}
    // resource="logo-bsc.png"
    style={{
      width,
      height,
    }}
  />
);

export const CosmosIcon = ({
  width,
  height,
}: BlockchainLogoProps): JSX.Element => (
  <LocalImage
    resource={Images.logoCosmos}
    // resource="logo-cosmos.png"
    style={{
      width,
      height,
    }}
  />
);
