import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
  runOnJS,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {isNumber} from './helpers';
import ReactionImage from './ReactionImage';
import type {ReactionButtonComponentProps, ReactionItem} from './types';

const PADDING_SIZE = 10;
const DEFAULT_REACTION_SIZE = 40;
const DEFAULT_REACTION_SMALL_SIZE = 20;
const DEFAULT_LONG_PRESS_DURATION = 300;
const DEFAULT_ANIMATION_DURATION = 150;
const DEFAULT_HIT_SLOP = {top: 10, left: 10, right: 10, bottom: 10};
const PICK_ANIMATION_DURATION = 400;

type ButtonLayout = {x: number; y: number; width: number; height: number};

function ReactionButton(props: ReactionButtonComponentProps) {
  const {
    reactions,
    value,
    onChange,
    defaultIndex,
    debug = false,
    reactionSize = DEFAULT_REACTION_SIZE,
    reactionSmallSize = DEFAULT_REACTION_SMALL_SIZE,
    longPressDuration = DEFAULT_LONG_PRESS_DURATION,
    animationDuration = DEFAULT_ANIMATION_DURATION,
    hitSlop = DEFAULT_HIT_SLOP,
    textProps,
    style,
    reactionContainerStyle,
    DefaultImage,
    imageProps,
  } = props;

  if (!Array.isArray(reactions) || reactions.length === 0) {
    throw new Error('No reactions passed');
  }
  if (isNumber(defaultIndex) && defaultIndex! >= reactions.length) {
    throw new Error('`defaultIndex` out of range');
  }
  if (typeof reactionSize !== 'number' || reactionSize <= 0) {
    throw new Error('Invalid value passed `reactionSize`');
  }

  const debugLog = useCallback(
    (...args: unknown[]) => {
      if (debug) {
        // eslint-disable-next-line no-console
        console.log(...args);
      }
    },
    [debug],
  );

  const selectedIndex = useMemo(() => {
    if (value >= 0) return value;
    if (isNumber(defaultIndex) && defaultIndex! >= 0) return defaultIndex!;
    return -1;
  }, [value, defaultIndex]);

  const [visible, setVisible] = useState(false);
  const [layout, setLayout] = useState<ButtonLayout | null>(null);
  const buttonRef = useRef<View>(null);
  const screen = useMemo(() => Dimensions.get('window'), []);

  // Shared values driving the pick animation on the chosen reaction.
  const selectedBurstIndex = useSharedValue(-1);
  const burstProgress = useSharedValue(0);

  const reactionsContainerLayout = useMemo(
    () => ({
      width:
        reactions.length * reactionSize +
        (reactions.length - 1) * PADDING_SIZE +
        PADDING_SIZE * 2,
      height: reactionSize + PADDING_SIZE * 2,
    }),
    [reactions.length, reactionSize],
  );

  const reactionsPosition = useMemo(() => {
    if (!layout) return {x: PADDING_SIZE, y: -screen.height};
    let x = layout.x + layout.width / 2 - reactionsContainerLayout.width / 2;
    if (x + reactionsContainerLayout.width >= screen.width) {
      x -= x + reactionsContainerLayout.width - screen.width + PADDING_SIZE;
    }
    const y = layout.y - reactionsContainerLayout.height - PADDING_SIZE;
    return {x: Math.max(PADDING_SIZE, x), y};
  }, [layout, reactionsContainerLayout, screen]);

  const openReactions = useCallback(() => {
    debugLog('openReactions');
    // Reset burst state from any prior pick BEFORE the new tray mounts.
    selectedBurstIndex.value = -1;
    burstProgress.value = 0;
    const node = buttonRef.current;
    if (!node) return;
    node.measureInWindow((x, y, width, height) => {
      setLayout({x, y, width, height});
      setVisible(true);
    });
  }, [debugLog, selectedBurstIndex, burstProgress]);

  const closeReactions = useCallback(() => {
    debugLog('closeReactions');
    selectedBurstIndex.value = -1;
    burstProgress.value = 0;
    setVisible(false);
  }, [debugLog, selectedBurstIndex, burstProgress]);

  const pickReaction = useCallback(
    (index: number) => {
      debugLog('pickReaction', index);
      // Drive a linear 0 → 1 progress for the parabolic arc.
      selectedBurstIndex.value = index;
      burstProgress.value = 0;
      burstProgress.value = withTiming(1, {
        duration: PICK_ANIMATION_DURATION,
        easing: Easing.linear,
      });
      setTimeout(() => {
        onChange(index);
        setVisible(false);
        // Keep selectedBurstIndex / burstProgress set until next open —
        // resetting now would snap the picked reaction back to its tray slot
        // for one frame and cause a visible "splash" before ZoomOut.
      }, PICK_ANIMATION_DURATION);
    },
    [debugLog, onChange, selectedBurstIndex, burstProgress],
  );

  const handleTap = useCallback(() => {
    if (isNumber(defaultIndex)) {
      onChange(selectedIndex >= 0 ? selectedIndex : defaultIndex!);
    } else {
      openReactions();
    }
  }, [defaultIndex, onChange, selectedIndex, openReactions]);

  const gesture = useMemo(() => {
    const longPress = Gesture.LongPress()
      .minDuration(longPressDuration)
      .onStart(() => {
        runOnJS(openReactions)();
      });
    const tap = Gesture.Tap().onEnd((_e, success) => {
      'worklet';
      if (success) {
        runOnJS(handleTap)();
      }
    });
    return Gesture.Exclusive(longPress, tap);
  }, [longPressDuration, openReactions, handleTap]);

  let selReaction: ReactionItem | undefined;
  let ImageComponent: ((p: {style: any}) => React.ReactElement) | undefined;
  if (selectedIndex >= 0) {
    selReaction = reactions[selectedIndex];
    if (selectedIndex === 0 && value < 0) {
      ImageComponent = DefaultImage;
    } else {
      ImageComponent = (passedProps: any) => (
        <Image source={selReaction!.source} {...passedProps} />
      );
    }
  } else {
    selReaction = reactions[0];
    ImageComponent = DefaultImage;
  }

  return (
    <>
      <GestureDetector gesture={gesture}>
        <View
          ref={buttonRef}
          style={[styles.button, style]}
          hitSlop={hitSlop}
          collapsable={false}>
          <View style={styles.wrapper}>
            {ImageComponent ? (
              <ImageComponent
                style={[
                  styles.reactionImgSmall,
                  {width: reactionSmallSize, height: reactionSmallSize},
                ]}
              />
            ) : null}
            <Text {...textProps}>{selReaction?.title}</Text>
          </View>
        </View>
      </GestureDetector>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={closeReactions}>
        {visible ? (
          <>
            <TouchableWithoutFeedback onPress={closeReactions}>
              <Animated.View
                entering={FadeIn.duration(animationDuration)}
                exiting={FadeOut.duration(animationDuration)}
                style={[styles.backdrop, StyleSheet.absoluteFill]}
              />
            </TouchableWithoutFeedback>
            <Animated.View
              entering={ZoomIn.duration(animationDuration)}
              exiting={ZoomOut.duration(animationDuration)}
              style={[
                styles.popover,
                {
                  width: reactionsContainerLayout.width,
                  left: reactionsPosition.x,
                  top: reactionsPosition.y,
                },
              ]}>
              <View
                style={[
                  styles.reactions,
                  reactionContainerStyle,
                  {flexDirection: 'row', padding: PADDING_SIZE},
                ]}>
                {reactions.map((reaction, index) => {
                  // Tray slot center in window:
                  const slotCenterX =
                    reactionsPosition.x +
                    PADDING_SIZE +
                    index * (reactionSize + PADDING_SIZE) +
                    reactionSize / 2;
                  const slotCenterY =
                    reactionsPosition.y + PADDING_SIZE + reactionSize / 2;
                  // Button small-icon center: left edge of the button content row.
                  const iconCenterX =
                    (layout?.x ?? 0) +
                    PADDING_SIZE * 2 +
                    reactionSmallSize / 2;
                  const iconCenterY =
                    (layout?.y ?? 0) + (layout?.height ?? 0) / 2;
                  const destDx = iconCenterX - slotCenterX;
                  const destDy = iconCenterY - slotCenterY;
                  const destScale = reactionSmallSize / reactionSize;
                  return (
                    <ReactionImage
                      reaction={reaction}
                      key={reaction.title}
                      onPress={pickReaction}
                      styleImage={{width: reactionSize, height: reactionSize}}
                      style={{
                        paddingRight:
                          index < reactions.length - 1 ? PADDING_SIZE : 0,
                      }}
                      index={index}
                      selectedBurstIndex={selectedBurstIndex}
                      burstProgress={burstProgress}
                      destDx={destDx}
                      destDy={destDy}
                      destScale={destScale}
                      renderImage={imageProps?.renderImage}
                    />
                  );
                })}
              </View>
            </Animated.View>
          </>
        ) : null}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: PADDING_SIZE * 2,
    paddingVertical: PADDING_SIZE,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  popover: {
    position: 'absolute',
  },
  reactions: {
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  reactionImgSmall: {
    marginRight: 6,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ReactionButton;
export type {ReactionItem, ReactionButtonComponentProps} from './types';
