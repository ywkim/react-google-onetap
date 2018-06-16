/* global google */
import _ from 'lodash';
import warning from 'warning';
import invariant from 'invariant';
import { getDisplayName } from 'recompose';
import PropTypes from 'prop-types';
import React from 'react';

import { CredentialContext } from './credential-context';

export function withCredential(BaseComponent) {
  const factory = React.createFactory(BaseComponent);

  class Container extends React.PureComponent {
    static displayName = `withCredential(${getDisplayName(BaseComponent)})`;

    render() {
      return (
        <CredentialContext.Consumer>
          {credential => factory({ ...this.props, credential })}
        </CredentialContext.Consumer>
      );
    }
  }

  return Container;
}

export default withCredential;
