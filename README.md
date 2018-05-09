# react-google-onetap

A Google one-tap sign-up Component for React


## Install
```
yarn add react-google-onetap

```
## How to use

There're some steps to take to create your custom map components.
1. In order to initialize the `MyComponent` with DOM instances, you'll need to wrap it with [`withCredential`] HOC.
1. In order to correctly load [`googleyolo` JavaScript client library][gyjscl], you'll need to wrap it with [`withScriptjs`] HOC.
1. Notice there're some required props for withCredential and withScriptjs HOC.

```js static
import { withScriptjs, withCredential } from "react-google-onetap"

const MyComponent = withScriptjs(withCredential((props) =>
  <span>
    {props.displayName}
  </span>
))

<MyComponent
  supportedAuthMethods={[
    'https://accounts.google.com',
    'googleyolo://id-and-password',
  ]}
  supportedIdTokenProviders={[
    {
      uri: 'https://accounts.google.com',
      clientId: 'YOUR_GOOGLE_CLIENT_ID',
    },
  ]}
/>
```

[gyjscl]: https://developers.google.com/identity/one-tap/web/
