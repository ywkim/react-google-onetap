import _ from 'lodash';
import invariant from 'invariant';
import { getDisplayName } from 'recompose';
import PropTypes from 'prop-types';
import React from 'react';

import { CREDENTIAL } from './constants';

const GOOGLEYOLO_SRC = 'https://smartlock.google.com/client';

const LOADING_STATE_NONE = `NONE`;
const LOADING_STATE_BEGIN = `BEGIN`;
const LOADING_STATE_LOADED = `LOADED`;

export function withScriptjs(BaseComponent) {
  const factory = React.createFactory(BaseComponent);

  class Container extends React.PureComponent {
    static displayName = `withScriptjs(${getDisplayName(BaseComponent)})`;

    static propTypes = {
      loadingElement: PropTypes.node.isRequired,
      supportedAuthMethods: PropTypes.arrayOf(PropTypes.string),
      supportedIdTokenProviders: PropTypes.arrayOf(PropTypes.object),
      signIn: PropTypes.bool,
      onRetrieveSuccess: PropTypes.func,
      onHintSuccess: PropTypes.func,
      onHintError: PropTypes.func,
    };

    static childContextTypes = {
      [CREDENTIAL]: PropTypes.object,
    };

    static defaultProps = {
      supportedAuthMethods: [
        'https://accounts.google.com',
        'googleyolo://id-and-password',
      ],
    };

    state = {
      loadingState: LOADING_STATE_NONE,
      credential: {},
    };

    isUnmounted = false;

    handleLoaded = () => {
      if (this.isUnmounted) {
        return;
      }
      this.setState({
        loadingState: LOADING_STATE_LOADED,
      });
    };

    onGoogleYoloLoad = googleyolo => {
      const {
        supportedAuthMethods,
        supportedIdTokenProviders,
        signIn,
        onRetrieveSuccess,
        onHintSuccess,
        onHintError,
      } = this.props;
      return googleyolo
        .retrieve({
          supportedAuthMethods,
          supportedIdTokenProviders,
        })
        .then(
          credential => {
            onRetrieveSuccess && onRetrieveSuccess(credential);
            this.setState({ credential });
          },
          error => {
            // Credentials could not be retrieved. In general, if the user does not
            // need to be signed in to use the page, you can just fail silently; or,
            // you can also examine the error object to handle specific error cases.

            // If retrieval failed because there were no credentials available, and
            // signing in might be useful or is required to proceed from this page,
            // you can call `hint()` to prompt the user to select an account to sign
            // in or sign up with.
            if (error.type === 'noCredentialsAvailable' && signIn) {
              const hintPromise = googleyolo.hint({
                supportedAuthMethods,
                supportedIdTokenProviders,
              });
              hintPromise.then(
                credential => {
                  onHintSuccess && onHintSuccess(credential);
                  this.setState({ credential });
                },
                error => {
                  onHintError && onHintError(error);
                }
              );
            }
          }
        );
    };

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
      window.onGoogleYoloLoad = this.onGoogleYoloLoad;
      // Don't load scriptjs as a dependency since we do not want this module be used on server side.
      // eslint-disable-next-line global-require
      const scriptjs = require(`scriptjs`);
      const googleYoloURL = GOOGLEYOLO_SRC;
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
