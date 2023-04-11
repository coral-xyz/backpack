// @ts-nocheck
import type { FunctionComponent } from "react";
import React, { forwardRef } from "react";
import type {
  FontSizeTokens,
  GetProps,
  TamaguiElement,
  ThemeableProps,
} from "@tamagui/core";
import {
  getTokens,
  getVariableValue,
  Spacer,
  styled,
  themeable,
  useMediaPropsActive,
  withStaticProperties,
} from "@tamagui/core";
import { getFontSize } from "@tamagui/font-size";
import { getSpace, useGetThemedIcon } from "@tamagui/helpers-tamagui";
import { ThemeableStack, XStack, YStack } from "@tamagui/stacks";
import type { TextParentStyles } from "@tamagui/text";
import { SizableText, wrapChildrenInText } from "@tamagui/text";

type ListItem2IconProps = { color?: string; size?: number };
type IconProp = JSX.Element | FunctionComponent<ListItem2IconProps> | null;

export type ListItem2Props = Omit<
  TextParentStyles,
  "TextComponent" | "noTextWrap"
> &
  GetProps<typeof ListItem2Frame> &
  ThemeableProps & {
    /**
     * add icon before, passes color and size automatically if Component
     */
    icon?: IconProp;
    /**
     * add icon after, passes color and size automatically if Component
     */
    iconAfter?: IconProp;
    /**
     * adjust icon relative to size
     */
    /**
     * default: -1
     */
    scaleIcon?: number;
    /**
     * make the spacing elements flex
     */
    spaceFlex?: number | boolean;
    /**
     * adjust internal space relative to icon size
     */
    scaleSpace?: number;
    /**
     * title
     */
    title?: React.ReactNode;
    /**
     * subtitle
     */
    subTitle?: React.ReactNode;
    /**
     * will not wrap text around `children` only, "all" will not wrap title or subTitle
     */
    noTextWrap?: boolean | "all";
  };

const NAME = "ListItem2";

export const ListItem2Frame = styled(ThemeableStack, {
  name: NAME,
  tag: "li",

  variants: {
    singleLine: {
      true: {
        minHeight: 44,
        paddingHorizontal: 16,
        paddingVertical: 8,
      },
    },
    list: {
      true: {
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "transparent",
      },
    },
    multiLine: {
      true: {
        minHeight: 52,
      },
    },
    unstyled: {
      false: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: "center",
        flexWrap: "nowrap",
        width: "100%",
        borderColor: "$borderFull",
        borderRadius: "$container",
        borderWidth: 2,
        maxWidth: "100%",
        overflow: "hidden",
        flexDirection: "row",
        backgroundColor: "$nav",
      },
    },

    active: {
      true: {
        hoverStyle: {
          backgroundColor: "$background",
        },
      },
    },

    disabled: {
      true: {
        opacity: 0.5,
        // TODO breaking types
        pointerEvents: "none" as any,
      },
    },
  } as const,

  defaultVariants: {
    unstyled: false,
  },
});

export const ListItem2Text = styled(SizableText, {
  name: "ListItem2Text",

  variants: {
    unstyled: {
      false: {
        color: "$fontColor",
        fontSize: "$base",
        userSelect: "none",
        flexGrow: 1,
        flexShrink: 1,
        ellipse: true,
        cursor: "default",
      },
    },
  },

  defaultVariants: {
    unstyled: false,
  },
});

export const ListItem2Subtitle = styled(ListItem2Text, {
  name: "ListItem2Subtitle",

  variants: {
    unstyled: {
      false: {
        opacity: 0.6,
        maxWidth: "100%",
        color: "$color",
      },
    },
  },

  defaultVariants: {
    unstyled: false,
  },
});

export const ListItem2Title = styled(ListItem2Text, {
  name: "ListItem2Title",
});

export const useListItem2 = (
  props: ListItem2Props,
  {
    Text = ListItem2Text,
    Subtitle = ListItem2Subtitle,
    Title = ListItem2Title,
  }: {
    Title?: any;
    Subtitle?: any;
    Text?: any;
  } = {
    Text: ListItem2Text,
    Subtitle: ListItem2Subtitle,
    Title: ListItem2Title,
  }
) => {
  // careful not to desctructure and re-order props, order is important
  const {
    children,
    icon,
    iconAfter,
    noTextWrap,
    theme: themeName,
    space,
    spaceFlex,
    scaleIcon = 1,
    scaleSpace = 1,
    subTitle,

    // text props
    color,
    fontWeight,
    letterSpacing,
    fontSize,
    fontFamily,
    textAlign,
    textProps,
    title,
    ...rest
  } = props;

  const mediaActiveProps = useMediaPropsActive(props);
  const size = mediaActiveProps.size || "$true";
  const subtitleSize = `$${
    +String(size).replace("$", "") - 1
  }` as FontSizeTokens;
  const iconSize = getFontSize(size) * scaleIcon;
  const getThemedIcon = useGetThemedIcon({ size: iconSize, color });
  const [themedIcon, themedIconAfter] = [icon, iconAfter].map(getThemedIcon);
  // @ts-ignore noTextWrap = all is ok
  const contents = wrapChildrenInText(Text, mediaActiveProps);

  return {
    props: {
      fontFamily,
      ...rest,
      children: (
        <>
          {themedIcon ? (
            <>
              {themedIcon}
              <Spacer size={8} />
            </>
          ) : null}
          {/* helper for common title/subtitle pttern */}
          {title || subTitle ? (
            <YStack flex={1} alignItems="flex-start" justifyContent="center">
              {noTextWrap === "all" ? (
                title
              ) : (
                <Title size={size}>{title}</Title>
              )}
              {subTitle ? (
                <>
                  {typeof subTitle === "string" && noTextWrap !== "all" ? (
                    // TODO can use theme but we need to standardize to alt themes
                    // or standardize on subtle colors in themes
                    <Subtitle size={subtitleSize}>{subTitle}</Subtitle>
                  ) : (
                    subTitle
                  )}
                </>
              ) : null}
              {contents}
            </YStack>
          ) : (
            contents
          )}
          {themedIconAfter ? (
            <>
              <Spacer size={8} />
              {themedIconAfter}
            </>
          ) : null}
        </>
      ),
    },
  };
};

const ListItem2Component = forwardRef<TamaguiElement, ListItem2Props>(
  (props, ref) => {
    const { props: listItemProps } = useListItem2(props);
    return (
      <ListItem2Frame
        ref={ref}
        justifyContent="space-between"
        {...listItemProps}
      />
    );
  }
);

export const listItem2StaticConfig = {
  inlineProps: new Set([
    // text props go here (can't really optimize them, but we never fully extract listItem anyway)
    "color",
    "fontWeight",
    "fontSize",
    "fontFamily",
    "letterSpacing",
    "textAlign",
  ]),
};

export const ListItem2 = withStaticProperties(
  ListItem2Frame.extractable(
    themeable(ListItem2Component, { componentName: NAME }),
    listItem2StaticConfig
  ),
  {
    Text: ListItem2Text,
    Subtitle: ListItem2Subtitle,
  }
);
