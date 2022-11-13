import {
  useNavigation,
  View,
  TextField,
  Image,
  Text,
  ScrollBar,
  Button,
} from "react-xnft";
import React, { useState } from "react";
import { useRecoilState, useRecoilValueLoadable } from "recoil";
import getGatewayUri from "./_utils/getGatewayUri";
import { XnftWithMetadata } from "./_types/XnftWithMetadata";
import StarIcon from "examples/xnft/prices/src/App/StarIcon";

function Rating({
  app,
  starSize,
}: {
  app: XnftWithMetadata;
  starSize: number;
}) {
  return (
    <View tw="flex items-center gap-1">
      {[...new Array(5)].map((_, idx) =>
        Math.round(app.account.totalRating.toNumber()) >= idx + 1 ? (
          <StarIcon key={idx} size={starSize} color="#FC9870" isFilled={true} />
        ) : (
          <StarIcon
            key={idx}
            size={starSize}
            color="#FC9870"
            isFilled={false}
            strokeWidth={2}
          />
        )
      )}
      {app.account.numRatings !== undefined && (
        <Text tw="pl-2 text-xs font-medium text-white">
          {app.account.numRatings} Reviews
        </Text>
      )}
    </View>
  );
}

export default Rating;
