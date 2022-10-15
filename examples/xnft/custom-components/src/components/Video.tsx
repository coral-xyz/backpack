import { Custom } from "react-xnft";
import { Centralize } from "./Centralize";

interface VideoProps {
  autoplay: boolean;
  controls: boolean;
  src: string;
}

export const Video = ({ autoplay, controls, src }: VideoProps) => {
  return (
    <Centralize>
      <Custom
        component={"video"}
        autoplay={autoplay}
        controls={controls}
        src={src}
      />
    </Centralize>
  );
};
