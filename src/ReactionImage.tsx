import React from 'react';
import {Image, TouchableOpacity} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import type {
  ReactionImageComponentBaseProps,
  ReactionImageComponentProps,
} from './types';

const ARC_HEIGHT = 80; // peak height (px) above the straight-line midpoint
const PEAK_SCALE = 1.5; // scale at apex of arc
const FADE_START = 0.9; // begin fading opacity at this point in the flight

export default function ReactionImage(
  props: ReactionImageComponentProps & ReactionImageComponentBaseProps,
) {
  const {
    reaction,
    onPress,
    style,
    styleImage,
    index,
    selectedBurstIndex,
    burstProgress,
    destDx = 0,
    destDy = 0,
    destScale = 1,
    renderImage,
  } = props;

  const ImageComponent =
    typeof renderImage === 'function' ? renderImage : Image;

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const burst = selectedBurstIndex.value === index;
    if (!burst) {
      return {
        opacity: 1,
        transform: [{translateX: 0}, {translateY: 0}, {scale: 1}],
      };
    }
    const t = burstProgress.value;
    // Horizontal: linear toward destination.
    const tx = t * destDx;
    // Vertical: linear MINUS parabolic arc (peaks upward at t=0.5).
    const ty = t * destDy - 4 * ARC_HEIGHT * t * (1 - t);
    // Scale: up to PEAK at t=0.5, then down to destScale.
    let scaleVal: number;
    if (t < 0.5) {
      scaleVal = 1 + (PEAK_SCALE - 1) * (t * 2);
    } else {
      scaleVal = PEAK_SCALE + (destScale - PEAK_SCALE) * ((t - 0.5) * 2);
    }
    // Opacity: 1 until FADE_START, then linearly to 0 by t=1.
    const opacity =
      t < FADE_START ? 1 : Math.max(0, 1 - (t - FADE_START) / (1 - FADE_START));
    return {
      opacity,
      transform: [{translateX: tx}, {translateY: ty}, {scale: scaleVal}],
    };
  });

  return (
    <Animated.View style={[style, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(index)}>
        <ImageComponent source={reaction.source} style={styleImage} />
      </TouchableOpacity>
    </Animated.View>
  );
}
