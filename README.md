# Reaction Button
Reactions button like Facebook does.

![Demo](https://media2.giphy.com/media/10mBuMfaPdsPr2DPnk/giphy.gif)

## Installation

Yarn:
```bash
yarn add @luu-truong/react-native-reaction-button
```

NPM:
```bash
npm install @luu-truong/react-native-reaction-button
```

## Usage

```jsx

import ReactionButton from '@luu-truong/react-native-reaction-button'

function Demo() {
  const [value, setValue] = React.useState(-1);

  function onChange(index: number) {
    setValue(value === index ? -1 : index);
  }

  const reactions = [
    {
      source: {
        url: '...'
      },
      title: 'Like'
    },
    {
      source: require('....'),
      title: 'Haha'
    }
  ];

  return <ReactionButton reactions={reactions} defaultIndex={0} value={value} onChange={onChange} />
}
```

## Properties

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| debug | boolean | no | Debug message. Default: false |
| reactionSize | number | no | Render reaction image at size. Default: 40px |
| reactions | ReactionItem[] | yes | List reactions |
| value | number | yes | Selected reaction index. |
| defaultIndex | number | no | Default reaction |
| onChange | (index: number) => void | yes | Callback when a reaction pressed |
| textProps | object | no | Props passed to button reaction text |
| reactionSmallSize | number | no | Size to render reaction in button |
| DefaultImage | (passedProps: any) => JSX.Element | no | Default image component to render reaction when value is unspecified |
| reactionContainerStyle | object | no | Style apply to reactions popover container |

ReactionItem properties:
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| source | object | yes | Image object source |
| title | string | yes | Reaction title |

## React native support

| Version | react-native version |
| --- | --- |
| 1.x.x | 0.64.0+ |
