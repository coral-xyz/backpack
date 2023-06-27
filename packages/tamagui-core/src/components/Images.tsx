import { Image } from "tamagui";

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
  const url = `${baseUrl}/${resource}`;
  return (
    // @ts-ignore
    <Image src={url} width={style.width} height={style.height} {...props} />
  );
}

type BlockchainLogoProps = {
  width: number;
  height: number;
};

export const EthereumIcon = ({
  width,
  height,
}: BlockchainLogoProps): JSX.Element => (
  <S3Image
    resource="images/logo-ethereum.png"
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
  <S3Image
    resource="images/logo-solana.png"
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
  <S3Image
    resource="images/logo-avalanche.png"
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
  <S3Image
    resource="images/logo-polygon.png"
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
  <S3Image
    resource="images/logo-bsc.png"
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
  <S3Image
    resource="images/logo-cosmos.png"
    style={{
      width,
      height,
    }}
  />
);
