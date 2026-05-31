import type {
  StyleProp,
  ImageSourcePropType,
  ViewStyle,
  ImageStyle,
  TextProps,
  ImageProps,
} from 'react-native';
import type {ReactElement} from 'react';
import type {SharedValue} from 'react-native-reanimated';

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
  /** Shared value carrying the index playing the "fly into button" burst (-1 if none). */
  selectedBurstIndex: SharedValue<number>;
  /** Linear 0 → 1 progress driving the parabolic arc + scale curve. */
  burstProgress: SharedValue<number>;
  /** Horizontal delta from this reaction's slot center to the button icon center. */
  destDx?: number;
  /** Vertical delta from this reaction's slot center to the button icon center. */
  destDy?: number;
  /** Final scale at landing — typically reactionSmallSize / reactionSize. */
  destScale?: number;
}

export interface ReactionImageComponentProps {
  renderImage?: (props: ImageProps) => ReactElement;
}
