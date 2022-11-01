import { proxyImageUrl } from "@coral-xyz/common";

export function ProxyImage(props: any) {
  return (
    <img
      {...props}
      onError={({ currentTarget }) => {
        currentTarget.onerror = props.onError || null;
        currentTarget.src = props.src;
      }}
      src={proxyImageUrl(props.src)}
      loading="lazy"
    />
  );
}
