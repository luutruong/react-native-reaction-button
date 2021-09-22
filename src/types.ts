import {StyleProp, ImageSourcePropType, ViewStyle, TextStyle, ImageStyle, TextProps, View, ImageProps} from 'react-native';

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
  reactionContainerStyle?: StyleProp<ViewStyle>;
}

export interface ReactionButtonComponentProps extends ReactionButtonComponentBase {
  reactions: ReactionItem[];
  value: number;

  onChange: (index: number) => void;

  defaultIndex?: number;
  DefaultImage?: (passedProps: {style: any}) => JSX.Element;
  imageProps?: ReactionImageComponentProps;
}

export interface ReactionButtonComponentState {
  visible: boolean;
  selectedIndex: number;
  lastPressIn: number;
}

export interface ReactionImageComponentBaseProps {
  reaction: ReactionItem;
  onPress: (index: number) => void;
  style: StyleProp<ViewStyle>;
  styleImage: StyleProp<ImageStyle>;
  index: number;
}

export interface ReactionImageComponentProps {
  renderImage?: (props: ImageProps) => JSX.Element;
}
