import { StyleProp, ImageProps, ImageSourcePropType, ViewStyle, TextStyle, ImageStyle } from "react-native";

export interface ReactionItem {
  title: string;
  source: ImageSourcePropType;
}

export interface ReactionButtonComponentBase {
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  debug?: boolean;
  reactionSize?: number; // default 40px
}

export interface ReactionButtonComponentProps extends ReactionButtonComponentBase {
  reactions: ReactionItem[];
  value: number;

  onChange: (index: number) => void;

  defaultIndex?: number;
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
