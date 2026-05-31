import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  type LayoutRectangle,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
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
  const buttonRef = useRef<View>(null);
  const buttonLayoutRef = useRef<LayoutRectangle>({width: 0, height: 0, x: 0, y: 0});

  const progress = useSharedValue(0);
  const screen = useMemo(() => Dimensions.get('window'), []);

  const measureButton = useCallback(() => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      buttonLayoutRef.current = {x, y, width, height};
      debugLog('measureButton', buttonLayoutRef.current);
    });
  }, [debugLog]);

  useEffect(() => {
    measureButton();
  });

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
    if (!visible) return {x: 0, y: screen.height};
    const layout = buttonLayoutRef.current;
    let x = layout.x + layout.width / 2 - reactionsContainerLayout.width / 2;
    if (x + reactionsContainerLayout.width >= screen.width) {
      x -= x + reactionsContainerLayout.width - screen.width + PADDING_SIZE;
    }
    return {
      x: Math.max(PADDING_SIZE, x),
      y: layout.y - layout.height - PADDING_SIZE * 2,
    };
  }, [visible, reactionsContainerLayout, screen]);

  const openReactions = useCallback(() => {
    debugLog('openReactions');
    setVisible(true);
    progress.value = withTiming(1, {duration: animationDuration});
  }, [debugLog, progress, animationDuration]);

  const finishClose = useCallback(() => {
    setVisible(false);
  }, []);

  const closeReactions = useCallback(() => {
    debugLog('closeReactions');
    progress.value = withTiming(0, {duration: animationDuration}, (finished) => {
      if (finished) {
        runOnJS(finishClose)();
      }
    });
  }, [debugLog, progress, animationDuration, finishClose]);

  const handleTap = useCallback(() => {
    if (isNumber(defaultIndex)) {
      onChange(selectedIndex >= 0 ? selectedIndex : defaultIndex!);
    } else {
      openReactions();
    }
  }, [defaultIndex, onChange, selectedIndex, openReactions]);

  const handleReactionItemPress = useCallback(
    (index: number) => {
      debugLog('handleReactionItemPress', index);
      onChange(index);
      closeReactions();
    },
    [debugLog, onChange, closeReactions],
  );

  const gesture = useMemo(() => {
    const longPress = Gesture.LongPress()
      .minDuration(longPressDuration)
      .onStart(() => {
        runOnJS(openReactions)();
      });
    const tap = Gesture.Tap().onEnd((_e, success) => {
      if (success) {
        runOnJS(handleTap)();
      }
    });
    return Gesture.Exclusive(longPress, tap);
  }, [longPressDuration, openReactions, handleTap]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.2,
  }));

  const popoverStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{scale: 0.3 + progress.value * 0.7}],
  }));

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
        <View ref={buttonRef} style={[styles.button, style]} hitSlop={hitSlop} collapsable={false}>
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
      <Modal visible={visible} transparent animationType="none" onRequestClose={finishClose}>
        <TouchableWithoutFeedback onPress={closeReactions}>
          <Animated.View style={[styles.backdrop, StyleSheet.absoluteFill, backdropStyle]} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            {
              width: reactionsContainerLayout.width,
              position: 'absolute',
              left: reactionsPosition.x,
              top: reactionsPosition.y,
            },
            popoverStyle,
          ]}>
          <View
            style={[
              styles.reactions,
              reactionContainerStyle,
              {flexDirection: 'row', padding: PADDING_SIZE},
            ]}>
            {reactions.map((reaction, index) => (
              <ReactionImage
                reaction={reaction}
                key={reaction.title}
                onPress={handleReactionItemPress}
                styleImage={{width: reactionSize, height: reactionSize}}
                style={{paddingRight: index < reactions.length - 1 ? PADDING_SIZE : 0}}
                index={index}
                renderImage={imageProps?.renderImage}
              />
            ))}
          </View>
        </Animated.View>
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
    backgroundColor: '#000',
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
