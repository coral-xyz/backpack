import { Button, View, Image, Text, useNavigation } from "react-xnft";
import { ArcadeGame } from "../../mock-data/arcade";

export default (props: { game: ArcadeGame }) => {
  const nav = useNavigation();

  const clickItem = (game: ArcadeGame) => {
    nav.push("detail", { game });
  };

  return (
    <Button
      style={{
        border: "1px solid #fff",
        height: "240px",
        width: "200px",
        margin: "4px",
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        backgroundColor: "transparent",
      }}
      onClick={() => {
        clickItem(props.game);
      }}
    >
      <View
        style={{
          padding: "10px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          style={{
            height: "200px",
            width: "200px",
            borderRadius: "16px",
          }}
          src={props.game.image}
        />
        <Text>{props.game.name}</Text>
      </View>
    </Button>
  );
};
