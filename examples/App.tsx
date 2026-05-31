import React from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import ReactionButton from '@luu-truong/react-native-reaction-button';

const reactions = [
  {title: 'Like', source: require('./assets/reactions/like.png')},
  {title: 'Love', source: require('./assets/reactions/love.png')},
  {title: 'Haha', source: require('./assets/reactions/haha.png')},
  {title: 'Sad', source: require('./assets/reactions/sad.png')},
  {title: 'Angry', source: require('./assets/reactions/angry.png')},
  {title: 'Wow', source: require('./assets/reactions/wow.png')},
];

const placeholderImage = {uri: 'https://picsum.photos/seed/reaction/600/300'};

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [value, setValue] = React.useState(-1);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#111' : '#f5f5f5',
  };

  const setSelected = (index: number) => {
    console.log('setSelected', index);
    setValue(value === index ? -1 : index);
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={[styles.root, backgroundStyle]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ScrollView style={backgroundStyle}>
          {Array.from({length: 5}).map((_, i) => (
            <Image key={i} source={placeholderImage} style={styles.image} />
          ))}
          <View style={styles.buttonRow}>
            <ReactionButton
              reactions={reactions}
              onChange={setSelected}
              value={value}
              defaultIndex={0}
              debug
              style={styles.button}
              DefaultImage={passedProps => (
                <Image
                  source={require('./assets/reactions/love.png')}
                  {...passedProps}
                />
              )}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  image: {
    width: Dimensions.get('window').width,
    height: 300,
    marginBottom: 10,
  },
  buttonRow: {padding: 16},
  button: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    paddingHorizontal: 45,
    paddingVertical: 15,
    alignSelf: 'flex-start',
  },
});
