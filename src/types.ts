import type {
  StyleProp,
  ImageSourcePropType,
  ViewStyle,
  ImageStyle,
  TextProps,
  ImageProps,
} from 'react-native';
import type {ReactElement} from 'react';

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
  hitSlop?: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  /** Long-press activation delay in ms. Default: 300 */
  longPressDuration?: number;
  /** Open/close animation duration in ms. Default: 150 */
  animationDuration?: number;
}

export interface ReactionButtonComponentProps extends ReactionButtonComponentBase {
  reactions: ReactionItem[];
  value: number;

  onChange: (index: number) => void;

  defaultIndex?: number;
  DefaultImage?: (passedProps: {style: StyleProp<ImageStyle>}) => ReactElement;
  imageProps?: ReactionImageComponentProps;
}

export interface ReactionImageComponentBaseProps {
  reaction: ReactionItem;
  onPress: (index: number) => void;
  style: StyleProp<ViewStyle>;
  styleImage: StyleProp<ImageStyle>;
  index: number;
}

export interface ReactionImageComponentProps {
  renderImage?: (props: ImageProps) => ReactElement;
}
