import { Custom } from "react-xnft";
import { Centralize } from "./Centralize";

interface AudioProps {
  autoplay: boolean;
  controls: boolean;
  src: string;
}

export const Audio = ({ autoplay, controls, src }: AudioProps) => {
  return (
    <Centralize>
      <Custom
        component={"audio"}
        autoplay={autoplay}
        controls={controls}
        src={src}
      />
    </Centralize>
  );
};
