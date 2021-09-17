import { StyleProp, ImageSourcePropType, ViewStyle, TextStyle, ImageStyle, TextProps } from "react-native";

export interface ReactionItem {
  title: string;
  source: ImageSourcePropType;
}

export interface ReactionButtonComponentBase {
  textProps?: TextProps;

  style?: StyleProp<ViewStyle>;
  debug?: boolean;
  reactionSize?: number; // default 40px
  reactionSmallSize?: number; // default 20px
}

export interface ReactionButtonComponentProps extends ReactionButtonComponentBase {
  reactions: ReactionItem[];
  value: number;

  onChange: (index: number) => void;

  defaultIndex?: number;
  defaultImage?: ImageSourcePropType;
}

export interface ReactionButtonComponentState {
  visible: boolean;
  selectedIndex: number;
}

export interface ReactionImageComponentProps {
  reaction: ReactionItem;
  onPress: (index: number) => void;
  style: StyleProp<ViewStyle>;
  styleImage: StyleProp<ImageStyle>;
  index: number;
}
