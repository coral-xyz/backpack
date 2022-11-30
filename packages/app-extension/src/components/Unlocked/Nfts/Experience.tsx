import { ChatRoom } from "@coral-xyz/chat-sdk";
import { useState } from "react";
import { styles } from "@coral-xyz/themes";
import { NAV_BUTTON_WIDTH } from "../../common/Layout/Nav";
import { PrimaryButton } from "../../common";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../common/Layout/NavStack";
import { useNavigation } from "@coral-xyz/recoil";
import { CloseButton } from "../../common/Layout/Drawer";
import { NAV_COMPONENT_NFT_CHAT } from "@coral-xyz/common";

const useStyles = styles((theme) => ({
  container: {
    width: "100%",
    height: "100%",
    backgroundImage: "/assets/one/distressed-background.png",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  },
  centerAlign: {
    display: "flex",
    justifyContent: "center",
  },
  btnOuter: {
    padding: 15,
  },
}));

export const NftsExperience = ({ id }: any) => {
  return (
    <div
      style={{
        height: "100%",
      }}
    >
      <MainScreen id={id} />
    </div>
  );
};

export function NftChat({ id }: any) {
  return <ChatRoom type={"collection"} roomId={id} userId={"asdadsas"} />;
}

function MainScreen({ id }: { id: string }) {
  const classes = useStyles();
  const { push } = useNavigation();
  return (
    <div className={classes.container}>
      <div className={classes.centerAlign}>
        <img
          src={"/assets/one/cream-circle.png"}
          style={{ height: "50vh", marginTop: "10vh" }}
        />
      </div>
      <div className={classes.centerAlign}>
        <img
          src={"/assets/one/vito-smoke.png"}
          style={{ height: "70vh", marginTop: "-60vh" }}
        />
      </div>
      <div className={classes.centerAlign}>
        <img
          src={"/assets/one/vito.png"}
          style={{ height: "70vh", marginTop: "-70vh" }}
        />
      </div>
      <br />
      <div className={classes.btnOuter}>
        <PrimaryButton
          onClick={() =>
            push({
              title: "Chat",
              componentId: NAV_COMPONENT_NFT_CHAT,
              componentProps: {
                id: id,
              },
            })
          }
          label={
            <div style={{ display: "flex" }}>
              <div>Enter the chat</div>{" "}
              <div style={{ marginLeft: 5 }}>
                {" "}
                <ArrowRightAltIcon />{" "}
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
