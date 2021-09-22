import React from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {ReactionImageComponentBaseProps, ReactionImageComponentProps} from './types';

export default function ReactionImage(props: ReactionImageComponentProps & ReactionImageComponentBaseProps) {
  let ImageComponent;
  if (typeof props.renderImage === 'function') {
    ImageComponent = props.renderImage;
  } else {
    ImageComponent = Image;
  }

  return (
    <TouchableOpacity activeOpacity={0.6} style={props.style} onPress={() => props.onPress(props.index)}>
      <View>
        <ImageComponent source={props.reaction.source} style={props.styleImage} />
      </View>
    </TouchableOpacity>
  );
}
