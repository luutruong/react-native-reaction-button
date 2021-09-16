import React from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import { ReactionImageComponentProps } from './types';

export default function ReactionImage(props: ReactionImageComponentProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      style={props.style}
      onPress={() => props.onPress(props.index)}>
      <View>
        <Image source={props.reaction.source} style={props.styleImage} />
      </View>
    </TouchableOpacity>
  );
}
