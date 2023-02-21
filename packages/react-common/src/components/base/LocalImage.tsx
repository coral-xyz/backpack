import { ProxyImage } from "./ProxyImage";

export const LocalImage = (props) => {
  const localSrc = localStorage.getItem(props.localKey ?? `img-${props.src}`);

  return (
    <ProxyImage
      src={localSrc || props.src}
      onClick={props.onClick}
      alt={props.alt}
      className={props.className}
      style={props.style}
      loadingStyles={props.loadingStyles}
    />
  );
};
