import React from "react";
import { View, Text } from "react-xnft";
import StarIcon from "./Icons/StarIcon";

function Rating({
  rating,
  totalReviews,
  onClick,
  starSize,
}: {
  rating: number;
  starSize: number;
  totalReviews?: number;
  onClick?: (rating: number) => void;
}) {
  const click = (i: number) => {
    onClick && onClick(i + 1);
  };
  return (
    <View tw="flex items-center gap-1">
      {[...new Array(5)].map((_, idx) => (
        <View
          key={idx}
          onClick={() => click(idx)}
          tw={onClick ? "cursor-pointer" : ""}
        >
          {rating >= idx + 1 ? (
            <StarIcon size={starSize} color="#FC9870" isFilled={true} />
          ) : (
            <StarIcon
              size={starSize}
              color="#FC9870"
              isFilled={false}
              strokeWidth={2}
            />
          )}
        </View>
      ))}
      {totalReviews !== undefined && (
        <Text tw="pl-2 text-xs font-medium text-white">
          {totalReviews} Reviews
        </Text>
      )}
    </View>
  );
}

export default Rating;
