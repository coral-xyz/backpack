import {
  View,
  TextField,
  Image,
  Text,
  ScrollBar,
  Button,
  useNavigation,
} from "react-xnft";
import React, { useState } from "react";
import { useRecoilState, useRecoilValueLoadable } from "recoil";
import getGatewayUri from "./_utils/getGatewayUri";
import { XnftWithMetadata } from "./_types/XnftWithMetadata";
import Rating from "./Rating";
import getReviewTransaction from "./_utils/getReviewTransaction";
import getProgram from "./_utils/getProgram";
function NewAppReview({ app }: { app: XnftWithMetadata }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const nav = useNavigation();
  return (
    <>
      <View tw="m-4">
        <Rating
          rating={rating}
          onClick={(newRating) => setRating(newRating)}
          starSize={24}
        />
      </View>
      <View tw="m-4">
        <TextField
          multiline={true}
          numberOfLines={6}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></TextField>
      </View>
      <View tw="flex-row items-start m-4">
        {comment === "" || rating <= 0 ? (
          <Button tw="rounded bg-[#27272A] px-3 rounded text-xs font-medium tracking-wide">
            {"Submit Review"}
          </Button>
        ) : (
          <Button
            onClick={async () => {
              const program = getProgram(
                window.xnft.solana.connection,
                window.xnft.solana
              );
              const tx = await getReviewTransaction(
                program,
                window.xnft.solana.publicKey,
                app,
                comment,
                rating
              );
              await window.xnft.solana.sendAndConfirm(tx);
              nav.pop();
            }}
            tw="flex items-center gap-2.5 bg-white py-2 text-[#374151] px-3 rounded text-xs font-medium tracking-wide"
          >
            {"Submit Review"}
          </Button>
        )}
      </View>
    </>
  );
}

export default NewAppReview;
