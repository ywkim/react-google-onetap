import _ from 'lodash';
import invariant from 'invariant';
import { getDisplayName } from 'recompose';
import PropTypes from 'prop-types';
import React from 'react';

import { CREDENTIAL } from './constants';

const LOADING_STATE_NONE = `NONE`;
const LOADING_STATE_BEGIN = `BEGIN`;
const LOADING_STATE_LOADED = `LOADED`;

export function withScriptjs(BaseComponent) {
  const factory = React.createFactory(BaseComponent);

  class Container extends React.PureComponent {
    static displayName = `withScriptjs(${getDisplayName(BaseComponent)})`;

    static propTypes = {
      loadingElement: PropTypes.node.isRequired,
      supportedAuthMethods: PropTypes.object,
      supportedIdTokenProviders: PropTypes.object,
    };

    static childContextTypes = {
      [CREDENTIAL]: PropTypes.object,
    };

    state = {
      loadingState: LOADING_STATE_NONE,
      credential: {},
    };

    isUnmounted = false;

    handleGoogleYoloLoad = googleyolo => {
      const retrievePromise = googleyolo.retrieve({
        supportedAuthMethods: this.props.supportedAuthMethods,
        supportedIdTokenProviders: this.props.supportedIdTokenProviders,
      });

      retrievePromise.then(
        credential => {
          if (credential.password) {
            // An ID (usually email address) and password credential was retrieved.
            // Sign in to your backend using the password.
            signInWithEmailAndPassword(credential.id, credential.password);
          } else {
            // A Google Account is retrieved. Since Google supports ID token responses,
            // you can use the token to sign in instead of initiating the Google sign-in
            // flow.
            useGoogleIdTokenForAuth(credential.idToken);
            this.setState({ credential });
          }
        },
        error => {
          // Credentials could not be retrieved. In general, if the user does not
          // need to be signed in to use the page, you can just fail silently; or,
          // you can also examine the error object to handle specific error cases.

          // If retrieval failed because there were no credentials available, and
          // signing in might be useful or is required to proceed from this page,
          // you can call `hint()` to prompt the user to select an account to sign
          // in or sign up with.
          if (error.type === 'noCredentialsAvailable') {
            const hintPromise = googleyolo.hint({
              supportedAuthMethods: this.props.supportedAuthMethods,
              supportedIdTokenProviders: this.props.supportedIdTokenProviders,
            });
            hintPromise.then(
              credential => {
                if (credential.idToken) {
                  // Send the token to your auth backend.
                  useGoogleIdTokenForAuth(credential.idToken);
                  this.setState({ credential });
                }
              },
              error => {
                switch (error.type) {
                  case 'userCanceled':
                    // The user closed the hint selector. Depending on the desired UX,
                    // request manual sign up or do nothing.
                    break;
                  case 'noCredentialsAvailable':
                    // No hint available for the session. Depending on the desired UX,
                    // request manual sign up or do nothing.
                    break;
                  case 'requestFailed':
                    // The request failed, most likely because of a timeout.
                    // You can retry another time if necessary.
                    break;
                  case 'operationCanceled':
                    // The operation was programmatically canceled, do nothing.
                    break;
                  case 'illegalConcurrentRequest':
                    // Another operation is pending, this one was aborted.
                    break;
                  case 'initializationError':
                    // Failed to initialize. Refer to error.message for debugging.
                    break;
                  case 'configurationError':
                    // Configuration error. Refer to error.message for debugging.
                    break;
                  default:
                  // Unknown error, do nothing.
                }
              }
            );
          }
        }
      );
    };

    handleLoaded = _.bind(this.handleLoaded, this);

    handleLoaded() {
      if (this.isUnmounted) {
        return;
      }
      this.setState({
        loadingState: LOADING_STATE_LOADED,
      });
    }

    getChildContext() {
      return {
        [CREDENTIAL]: this.state.credential,
      };
    }

    componentWillMount() {
      const { loadingElement } = this.props;
      invariant(
        !!loadingElement,
        `Required props loadingElement is missing. You need to provide both of them.`
      );
    }

    componentDidMount() {
      const { loadingState } = this.state;
      if (loadingState !== LOADING_STATE_NONE) {
        return;
      }
      this.setState({
        loadingState: LOADING_STATE_BEGIN,
      });
      window.onGoogleYoloLoad = this.handleGoogleYoloLoad;
      // Don't load scriptjs as a dependency since we do not want this module be used on server side.
      // eslint-disable-next-line global-require
      const scriptjs = require(`scriptjs`);
      const googleYoloURL = 'https://smartlock.google.com/client';
      scriptjs(googleYoloURL, this.handleLoaded);
    }

    componentWillUnmount() {
      this.isUnmounted = true;
    }

    render() {
      const { loadingElement, ...restProps } = this.props;

      const { loadingState } = this.state;

      if (loadingState === LOADING_STATE_LOADED) {
        return factory(restProps);
      } else {
        return loadingElement;
      }
    }
  }

  return Container;
}

export default withScriptjs;
