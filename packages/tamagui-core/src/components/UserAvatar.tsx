import { ProxyImage } from "./ProxyImage";
// NOT A GREAT IMPLEMENTATION FOR THE WEB

export function UserAvatar({
  uri,
  size = 32,
}: {
  uri: string;
  size: number;
}): JSX.Element {
  return (
    <ProxyImage
      src={uri}
      size={size}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
