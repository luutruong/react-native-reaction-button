import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  GestureResponderEvent,
  StyleSheet,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  LayoutChangeEvent,
  LayoutRectangle,
  Dimensions
} from 'react-native';
import ReactionImage from './ReactionImage';
import { ReactionButtonComponentBase, ReactionButtonComponentProps, ReactionButtonComponentState, ReactionItem } from './types';

const PADDING_SIZE = 10;

class ReactionButton extends React.Component<ReactionButtonComponentProps, ReactionButtonComponentState> {
  state: ReactionButtonComponentState = {
    visible: false,
  }

  static defaultProps: ReactionButtonComponentBase = {
    reactionSize: 40,
    debug: false,
  };

  private _opacityAnim: Animated.Value = new Animated.Value(0);

  private _buttonLayout: LayoutRectangle = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  };

  private _lastOffset: {x: number; y: number} = {x: 0, y: 0};

  private _onPress = () => {
    // const reaction = this.props.reactions[this.props.defaultReactionIndex];
    // this.props.onReactionPress(reaction);
    this._showReactions();
  };

  private _onPressIn = (evt: GestureResponderEvent) => {
    this._lastOffset = {x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY};
    this._debug('_onPressIn', this._lastOffset);
    this.setState({visible: true})
  }

  private _onLongPress = () => {
    this._debug('_onLongPress');
    this._showReactions();
  }

  private _showReactions = () => {
    Animated.timing(this._opacityAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start()
  };

  private _debug = (...args: any[]) => this.props.debug && console.log(...args);

  private _closeModalInternal = () => this.setState({visible: false});
  private _closeModal = () => {
    Animated.timing(this._opacityAnim, {
      toValue: 0,
      useNativeDriver: true,
      duration: 250
    }).start(this._closeModalInternal)
  };

  private _onButtonLayout = (evt: LayoutChangeEvent) => {
    this._debug('_onButtonLayout', evt.nativeEvent);
    this._buttonLayout = evt.nativeEvent.layout;
  };

  private _renderReactionImage = (reaction: ReactionItem, index: number) => {
    const lastIndex = this.props.reactions.length - 1;
    return (
      <ReactionImage
        reaction={reaction}
        key={reaction.title}
        onPress={this._onReactionItemPress}
        styleImage={{
          width: this.props.reactionSize,
          height: this.props.reactionSize
        }}
        style={{
          paddingRight: index <= lastIndex ? PADDING_SIZE : 0,
        }}
      />
    );
  }
  private _onReactionItemPress = (reaction: ReactionItem) => {
    Animated.timing(this._opacityAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      this.props.onReactionPress(reaction);
      this._closeModalInternal();
    });
  };

  private _getReactionsContainerLayout = (): {width: number; height: number} => {
    if (!this.props.reactionSize) {
      return {width: 0, height: 0};
    }

    const total = this.props.reactions.length;

    return {
      width: total * this.props.reactionSize + (total - 1) * PADDING_SIZE + PADDING_SIZE * 2,
      height: this.props.reactionSize + PADDING_SIZE * 2.
    };
  };

  private _getReactionsPosition = (): {x: number; y: number} => {
    let x = 0;
    const rcLayout = this._getReactionsContainerLayout();
    this._debug(rcLayout);
    this._debug(this._buttonLayout);

    const SCREEN_WIDTH = Dimensions.get('window').width;
    x = this._buttonLayout.x + this._buttonLayout.width/2 - rcLayout.width / 2;
    if ((x + rcLayout.width) >= SCREEN_WIDTH) {
      x -= (x + rcLayout.width) - SCREEN_WIDTH + PADDING_SIZE;
    }

    return {
      x: Math.max(PADDING_SIZE, x),
      y: this._buttonLayout.y - PADDING_SIZE * 2,
    };
  }

  componentDidMount() {
    if (!this.props.reactions.length) {
      throw new Error('No reactions passed');
    }

    if (this.props.defaultReactionIndex >= this.props.reactions.length) {
      throw new Error('`defaultReactionIndex` out of range');
    }

    if (typeof this.props.reactionSize !== 'number'
      || this.props.reactionSize <= 0
    ) {
      throw new Error('Invalid value passed `reactionSize`');
    }

    this._opacityAnim.addListener(value => this._debug(value));
  }

  render() {
    const reactionLayout = this._getReactionsContainerLayout();

    const backdropStyle: any = [
      styles.backdrop,
      StyleSheet.absoluteFill,
      {
        opacity: this._opacityAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.2],
        }),
      }
    ];

    const translatePos = this._getReactionsPosition();
    const translatePosStyle: any = [
      {
        opacity: this._opacityAnim,
        width: reactionLayout.width,
        position: 'absolute',
        left: translatePos.x,
        top: translatePos.y
      }
    ];

    return (
      <>
        <TouchableOpacity
          onPress={this._onPress}
          onPressIn={this._onPressIn}
          onLayout={this._onButtonLayout}
          onLongPress={this._onLongPress}
          activeOpacity={0.6}
          style={[styles.button, this.props.style]}>
          <View>
            <Text style={this.props.textStyle}>Like</Text>
          </View>
        </TouchableOpacity>
        <Modal visible={this.state.visible} transparent animationType="none" onRequestClose={this._closeModalInternal}>
          <TouchableWithoutFeedback onPress={this._closeModal}>
            <Animated.View style={backdropStyle} />
          </TouchableWithoutFeedback>
          <Animated.View style={translatePosStyle}>
            <View style={styles.reactions}>
              {this.props.reactions.map(this._renderReactionImage)}
            </View>
          </Animated.View>
        </Modal>
      </>
    );
  }
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
    flexDirection: 'row',
    padding: PADDING_SIZE,
    borderRadius: 10,
  },
});

export default ReactionButton;
