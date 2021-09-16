/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import ReactionButton from './components/ReactionButton';

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedReaction, setSelectedReaction] = React.useState(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const reactions = [
    {
      title: 'Like',
      source: require('./assets/reactions/like.png'),
    },
    {
      title: 'Love',
      source: require('./assets/reactions/love.png'),
    },
    {
      title: 'Haha',
      source: require('./assets/reactions/haha.png'),
    },
    {
      title: 'Sad',
      source: require('./assets/reactions/sad.png'),
    },
    {
      title: 'Angry',
      source: require('./assets/reactions/angry.png'),
    },
    {
      title: 'Wow',
      source: require('./assets/reactions/wow.png'),
    },
  ];

  function onReactionPress(reaction: any) {
    setSelectedReaction(reaction);
  }

  return (
    <SafeAreaView style={[styles.safeAreaContainer, backgroundStyle]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={[styles.container, backgroundStyle]}>
        <ReactionButton
          reactions={reactions}
          defaultReactionIndex={0}
          onReactionPress={onReactionPress}
          debug
          style={styles.button}
        />
        <ReactionButton
          reactions={reactions}
          defaultReactionIndex={0}
          onReactionPress={onReactionPress}
          debug
          style={[styles.button, styles.buttonCenter]}
        />
        <ReactionButton
          reactions={reactions}
          defaultReactionIndex={0}
          onReactionPress={onReactionPress}
          debug
          style={[styles.button, styles.buttonEnd]}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  safeAreaContainer: {
    flex: 1,
  },
  button: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    paddingHorizontal: 45,
    paddingVertical: 15,
    alignSelf: 'flex-start',
  },
  buttonEnd: {
    alignSelf: 'flex-end',
  },
  buttonCenter: {
    alignSelf: 'center',
  },
});

export default App;
