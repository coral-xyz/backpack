import { Image, Button, View, Text } from "react-xnft";
import { Player } from "../../mock-data/players";
import NftImage from "../../components/NftImage";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { findLargestTokenAccountForOwner } from "@blockworks-foundation/mango-client";
import { State } from "@raindrops-protocol/raindrops";
import ItemComponent from "../../components/Item";

export function PlayerDetail(props: { player: Player; metadata: Metadata }) {
  return (
    <View
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        rowGap: "10px",
      }}
    >
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
          <NftImage metadata={props.metadata} />
          <View
            style={{
              marginLeft: "16px",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Text
              style={{
                fontWeight: 900,
                fontSize: "x-large",
              }}
            >
              Name
            </Text>
            <Text>{props.player.name}</Text>
            <View
              style={{
                height: "10px",
              }}
            ></View>
            <Text
              style={{
                fontWeight: 900,
                fontSize: "x-large",
              }}
            >
              HP
            </Text>
            <Text>{props.player.hp}</Text>
            <View
              style={{
                height: "10px",
              }}
            ></View>
            <Text
              style={{
                fontWeight: 900,
                fontSize: "x-large",
              }}
            >
              Level
            </Text>
            <Text>{props.player.level}</Text>
          </View>
        </View>
      </View>
      <View
        style={{
          padding: "24px",
          width: "100%",
          height: "230px",
        }}
      >
        <Text
          style={{
            fontWeight: 900,
            fontSize: "x-large",
          }}
        >
          Equipped Items
        </Text>
        <View
          style={{
            marginTop: "16px",
            display: "flex",
            flexDirection: "row",
            rowGap: "4px",
          }}
        >
          {props.player.equippedItems.map((item: State.Item.Item) => (
            <ItemComponent
              item={item}
              style={{
                view: {
                  height: "100px",
                  width: "100px",
                },
                image: {
                  height: "56px",
                  width: "56px",
                },
              }}
            />
          ))}
        </View>
      </View>
      <View
        style={{
          padding: "24px",
          width: "100%",
          height: "230px",
        }}
      >
        <Text
          style={{
            fontWeight: 900,
            fontSize: "x-large",
          }}
        >
          Inventory
        </Text>
        <View
          style={{
            marginTop: "16px",
            display: "flex",
            flexDirection: "row",
            rowGap: "4px",
          }}
        >
          {props.player.backpack.map((item: State.Item.Item) => (
            <ItemComponent
              item={item}
              style={{
                view: {
                  height: "100px",
                  width: "100px",
                },
                image: {
                  height: "56px",
                  width: "56px",
                },
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
