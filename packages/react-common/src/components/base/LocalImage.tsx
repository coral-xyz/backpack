import { useRef, useState } from "react";

export const LocalImage = (props) => {
  const [imageUrl, setImageUrl] = useState(
    localStorage.getItem(`img-${props.src}`) || props.src
  );
  const imageRef = useRef<HTMLImageElement>(null);

  return (
    <img
      src={imageUrl}
      ref={imageRef}
      onError={(...e) => {
        if (imageRef.current) imageRef.current.src = props.src;
      }}
      onClick={props.onClick}
      alt={props.alt}
      className={props.className}
    />
  );
};
