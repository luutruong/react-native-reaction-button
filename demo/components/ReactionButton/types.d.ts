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
  defaultReactionIndex: number;

  onReactionPress: (reaction: ReactionItem) => void;
}

export interface ReactionButtonComponentState {
  visible: boolean;
}

export interface ReactionImageComponentProps {
  reaction: ReactionItem;
  onPress: (reaction: ReactionItem) => void;
  style: StyleProp<ViewStyle>;
  styleImage: StyleProp<ImageStyle>;
}
