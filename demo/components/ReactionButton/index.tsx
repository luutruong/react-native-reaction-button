import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  LayoutRectangle,
  Dimensions
} from 'react-native';
import { isValidObject } from './helpers';
import ReactionImage from './ReactionImage';
import { ReactionButtonComponentBase, ReactionButtonComponentProps, ReactionButtonComponentState, ReactionItem } from './types';

const PADDING_SIZE = 10;

class ReactionButton extends React.Component<ReactionButtonComponentProps, ReactionButtonComponentState> {
  state: ReactionButtonComponentState = {
    visible: false,
    selectedIndex: -1,
  }

  static defaultProps: ReactionButtonComponentBase = {
    reactionSize: 40,
    reactionSmallSize: 20,
    debug: false,
    textProps: {},
  };

  private _opacityAnim: Animated.Value = new Animated.Value(0);

  private _buttonLayout: LayoutRectangle = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  };
  private _reactionButtonRef: any = React.createRef();

  private _screenWidth: number = Dimensions.get('window').width;
  private _screenHeight: number = Dimensions.get('window').height;

  private _onPress = () => {
    if (typeof this.props.defaultIndex === 'number') {
      this.props.onChange(this.state.selectedIndex >= 0 ? this.state.selectedIndex : this.props.defaultIndex);
    } else {
      this._showReactions();
    }
  };

  private _onLongPress = () => {
    this._showReactions();
  }

  private _showReactions = () => {
    if (this.state.visible) {
      this._debug('_showReactions', 'reactions already visible in screen')
      return;
    }

    this.setState({visible: true}, () => {
      Animated.timing(this._opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start()
    })
  };

  private _debug = (...args: any[]) => this.props.debug && console.log(...args);

  private _closeModalInternal = () => {
    this._debug('_closeModalInternal', this.state);
    this.setState({visible: false});
  };
  private _closeModal = () => {
    this._debug('_closeModal');
    Animated.timing(this._opacityAnim, {
      toValue: 0,
      useNativeDriver: true,
      duration: 150
    }).start(() => this._closeModalInternal())
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
        index={index}
      />
    );
  }
  private _onReactionItemPress = (index: number) => {
    this._debug('_onReactionItemPress', index);
    this.props.onChange(index);
    this._closeModal();
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
    if (!this.state.visible) {
      return {x: 0, y: this._screenHeight};
    }

    let x = 0;
    const rcLayout = this._getReactionsContainerLayout();

    x = this._buttonLayout.x + this._buttonLayout.width/2 - rcLayout.width / 2;
    if ((x + rcLayout.width) >= this._screenWidth) {
      x -= (x + rcLayout.width) - this._screenWidth + PADDING_SIZE;
    }

    return {
      x: Math.max(PADDING_SIZE, x),
      y: this._buttonLayout.y - this._buttonLayout.height - PADDING_SIZE * 2,
    };
  }

  private _measureButtonCallback = () => {
    this._reactionButtonRef.current.measure((_x: number, _y: number, width: number, height: number, px: number, py: number) => {
      this._buttonLayout = {
        width,
        height,
        x: px,
        y: py,
      }
      this._debug('_measureButtonCallback', this._buttonLayout);
    })
  };

  private _onRequestClose = () => {
    this._closeModalInternal();
  }

  static getDerivedStateFromProps(
    nextProps: Readonly<ReactionButtonComponentProps>,
    prevState: Readonly<ReactionButtonComponentState>
  ): any {
    if (nextProps.value >= 0) {
      return {selectedIndex: nextProps.value};
    } else if (typeof nextProps.defaultIndex === 'number' && nextProps.defaultIndex >= 0) {
      return {selectedIndex: nextProps.defaultIndex};
    }

    return null;
  }

  componentDidMount() {
    if (!Array.isArray(this.props.reactions) || !this.props.reactions.length) {
      throw new Error('No reactions passed');
    }

    if (typeof this.props.defaultIndex === 'number'
      && this.props.defaultIndex >= this.props.reactions.length
    ) {
      throw new Error('`defaultIndex` out of range');
    }

    if (typeof this.props.reactionSize !== 'number'
      || this.props.reactionSize <= 0
    ) {
      throw new Error('Invalid value passed `reactionSize`');
    }

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => this._measureButtonCallback());
    } else {
      setTimeout(() => this._measureButtonCallback(), 0);
    }
  }

  componentDidUpdate() {
    this._measureButtonCallback();
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
      },
      {
        transform: [
          {
            scale: this._opacityAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1]
            })
          }
        ]
      }
    ];

    let selReaction;
    let imageSource;
    if (this.state.selectedIndex >= 0) {
      selReaction = this.props.reactions[this.state.selectedIndex];
      imageSource = selReaction.source;
    } else {
      selReaction = [...this.props.reactions].shift();
      imageSource = this.props.defaultImage;
    }

    return (
      <>
        <TouchableOpacity
          onPress={this._onPress}
          onLongPress={this._onLongPress}
          activeOpacity={0.6}
          ref={this._reactionButtonRef}
          style={[styles.button, this.props.style]}>
          <View style={styles.wrapper}>
            {isValidObject(imageSource) && (
              <Image source={imageSource!} style={[styles.reactionImgSmall, {
                width: this.props.reactionSmallSize,
                height: this.props.reactionSmallSize,
              }]} />
            )}
            <Text {...this.props.textProps}>{selReaction?.title}</Text>
          </View>
        </TouchableOpacity>
        <Modal visible={this.state.visible} transparent animationType="none" onRequestClose={this._onRequestClose}>
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
  reactionImgSmall: {
    marginRight: 6,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ReactionButton;
