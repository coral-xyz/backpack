import { Image, Button, View, Text } from "react-xnft";
import { ArcadeGame } from "../../mock-data/arcade";

export function ArcadeGameDetail(props: { game: ArcadeGame }) {
  return (
    <View
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        rowGap: "32px",
      }}
    >
      <View
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        <Image
          style={{
            height: "200px",
            width: "200px",
            borderRadius: "16px",
            backgroundColor: "transparent",
          }}
          src={props.game.image}
        />
        <Text>{props.game.description}</Text>
      </View>
      <Button
        margin="60px"
        onClick={() => {
          console.log("Play game");
        }}
      >
        <Text>Play game</Text>
      </Button>
    </View>
  );
}
